# Análisis Técnico Completo — RACK Designer 2

> **Metodología:** Revisión estática de 9 módulos JavaScript (~3 500 LOC total). Cada hallazgo incluye severidad, ubicación exacta, impacto y corrección propuesta. Al final, diagramas SVG explicativos.

---

## Mapa de Módulos Analizados

```
js/
├── utils.js          ← helpers globales
├── store.js          ← estado central (Proxy ES6)
├── main.js           ← orquestador / eventos globales
├── demoData.js       ← datos de demostración
└── ui/
    ├── catalog.js    ← catálogo + habitaciones
    ├── rack.js       ← vista física, drag & drop
    ├── faceplates.js ← renderizado de faceplates
    ├── tables.js     ← panel inferior, tablas
    ├── topology.js   ← canvas 2D, topología
    └── modals.js     ← todos los modales
```

---

## Sección 1 — Fallas y Errores de Programación

### CRÍTICO — BUG-01: Credenciales en plaintext en tooltip y Canvas HUD

**Archivo:** [`rack.js L376-L378`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/rack.js#L376-L378) | [`topology.js L706-L707`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology.js#L706-L707)

**Descripción:** Las contraseñas de los equipos se muestran en texto claro en el tooltip HTML al hacer hover y en el HUD del canvas de topología. Cualquier persona que pase el mouse sobre un equipo ve el campo `pass` directamente.

```javascript
// rack.js L377-378 — PROBLEMA
ctx.fillText(`User:  ${dev.user || 'N/A'}`, hudX + 12, hudY + 74);
ctx.fillText(`Pass:  ${dev.pass || 'N/A'}`, hudX + 12, hudY + 89); // ← pass visible

// topology.js L706-707 — PROBLEMA
ctx.fillText(`User:  ${dev.user || 'N/A'}`, ...);
ctx.fillText(`Pass:  ${dev.pass || 'N/A'}`, ...); // ← pass visible
```

**Impacto:** 🔴 Alto — Exposición directa de credenciales en la UI sin ninguna protección.

**Corrección:**
```javascript
// Reemplazar la línea de pass por:
ctx.fillText(`Pass:  ${'•'.repeat(Math.min((dev.pass||'').length, 8)) || 'N/A'}`, ...);
// O agregar un toggle "mostrar/ocultar" en el HUD
```

---

### CRÍTICO — BUG-02: Credenciales exportadas a JSON/CSV sin cifrado

**Archivo:** [`modals.js L254-L262`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals.js#L254-L262) | [`tables.js L190`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/tables.js#L190)

**Descripción:** Las funciones `exportCSV()` y `getInventoryData()` incluyen las columnas `user` y `pass` directamente en la exportación. El archivo `.rack` (JSON) también serializa todas las contraseñas en claro.

```javascript
// tables.js L190
d.name, d.brand||'', d.model||'', d.type, d.ip, d.mac, d.serial,
d.user, d.pass, d.power  // ← usuario y contraseña van al archivo
```

**Impacto:** 🔴 Alto — Fuga de credenciales al compartir archivos de proyecto.

**Corrección:**
```javascript
// Opción A — Omitir pass del export CSV (solo incluir user):
data.push([ ..., d.user, '••••••', d.power ]);

// Opción B — Cifrar el campo antes de guardar en localStorage:
function encryptPass(pass) {
  return btoa(pass); // mínimo: ofuscación base64
}
```

---

### ALTO — BUG-03: `uid()` genera colisiones con probabilidad no despreciable

**Archivo:** [`utils.js L1`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/utils.js#L1)

**Descripción:** La función `uid()` usa `Math.random().toString(36).slice(2, 10)`, que produce solo 8 caracteres base-36 = ~2.8 billones de combinaciones. Con ~1 000 dispositivos es estadísticamente seguro, pero en sesiones largas o tras múltiples `loadDemoData()` puede colisionar.

```javascript
const uid = () => Math.random().toString(36).slice(2, 10); // PROBLEMA: solo 8 chars
```

**Corrección:**
```javascript
// Usar crypto.randomUUID() si está disponible (soportado en todos los navegadores modernos)
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g,'').slice(0,12)
    : Date.now().toString(36) + Math.random().toString(36).slice(2,8);
```

---

### ALTO — BUG-04: `_makeProxy` crea nuevos Proxy en cada acceso `get` para objetos anidados → Memory Leak progresivo

**Archivo:** [`store.js L66-L72`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js#L66-L72)

**Descripción:** El `get` del Proxy envuelve todos los objetos anidados en un `new Proxy` **cada vez** que se accede a ellos, sin caché. En el loop de `drawTopo()` que corre a 60fps accediendo a `store._raw.devices`, `store._raw.connections`, etc., se crean miles de Proxies por segundo que el GC no puede limpiar a tiempo.

```javascript
get: (target, key) => {
  const val = target[key];
  if (typeof val === 'object' && val !== null && !Array.isArray(val))
    return this._makeProxy(val, `${path}.${key}`); // ← nuevo Proxy cada vez!
  return val;
}
```

**Impacto:** 🔴 Crítico en uso prolongado — degradación de performance y aumento de RAM.

**Corrección:**
```javascript
// Acceder a store._raw directamente en el loop de animación (ya lo hace topology.js)
// y desactivar el proxy para rutas de solo lectura conocidas.
// El patrón correcto es usar store._raw.* en lugar de store.state.* en hot paths.
```

---

### ALTO — BUG-05: `loadData()` no limpia `topology`, causando posiciones fantasma

**Archivo:** [`store.js L278-L286`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js#L278-L286)

**Descripción:** Al cargar un proyecto nuevo via `loadData()`, se hace `Object.assign(this._raw, data)`. Si el nuevo archivo no contiene la clave `topology`, las posiciones del canvas (nodePositions, rackPositions) del proyecto anterior permanecen en memoria a través de las variables locales de `topology.js`.

```javascript
loadData(data) {
  Object.keys(this._raw).forEach(k => delete this._raw[k]);
  Object.assign(this._raw, data); // ← si data no tiene topology, no se resetea
  ...
}
```

**Corrección:**
```javascript
loadData(data) {
  this._undoStack = [];
  this._redoStack = [];
  Object.keys(this._raw).forEach(k => delete this._raw[k]);
  // Garantizar que topology siempre exista
  const defaultTopo = { nodePositions:{}, rackPositions:{}, rackSizes:{}, roomPositions:{}, roomSizes:{} };
  Object.assign(this._raw, { topology: defaultTopo }, data);
  // Forzar reset de variables locales de topology.js
  this._save();
  this._emit('change', { source: 'loadData' });
}
```

---

### ALTO — BUG-06: `deleteRoom()` no limpia las conexiones entre dispositivos de la sala borrada

**Archivo:** [`modals.js L237-L251`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals.js#L237-L251)

**Descripción:** Al eliminar una sala, se eliminan sus racks y dispositivos, pero `store._raw.connections` conserva entradas que referencian los `deviceId` ya borrados. Esto produce conexiones "huérfanas" con `sourceDeviceId` o `targetDeviceId` inválidos.

```javascript
function deleteRoom(id) {
  // ✓ Elimina racks y dispositivos
  store._raw.racks = store._raw.racks.filter(r => r.roomId !== id);
  store._raw.rooms = store._raw.rooms.filter(r => r.id !== id);
  // ✗ FALTA: eliminar conexiones de los dispositivos borrados
}
```

**Corrección:**
```javascript
function deleteRoom(id) {
  const racksToDelete = store._raw.racks.filter(r => r.roomId === id);
  const deviceIdsToDelete = new Set(
    store._raw.devices
      .filter(d => racksToDelete.some(r => r.id === d.rackId) || d.roomId === id)
      .map(d => d.id)
  );
  // Limpiar conexiones huérfanas
  store._raw.connections = store._raw.connections.filter(c =>
    !deviceIdsToDelete.has(c.sourceDeviceId) && !deviceIdsToDelete.has(c.targetDeviceId)
  );
  // ... resto de la lógica
}
```

---

### MEDIO — BUG-07: `changeRoom` NO llama a `renderAll` correctamente — loop de reinicio de topología

**Archivo:** [`catalog.js L118-L119`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/catalog.js#L118-L119) | [`main.js L17-L20`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/main.js#L17-L20)

**Descripción:** Al cambiar de sala, se emite `{ source: 'changeRoom' }`. En `renderAll()`, la condición es `source.includes('Room')`, que sí captura 'changeRoom'. Sin embargo, **no se llama** a `initTopoPositions()`, así que al cambiar de sala mientras la topología está activa, los nodos de la nueva sala no se inicializan hasta que el usuario pulse "Topología" manualmente.

**Corrección:**
```javascript
// En main.js renderAll():
if (source.includes('Room') || source === 'room-rename' || source === 'changeRoom') {
  renderRoomTabs();
  renderPhysical();
  if (currentView === 'topology') {
    initTopoPositions(); // ← agregar esta línea
  }
}
```

---

### MEDIO — BUG-08: Validación de IP acepta valores fuera del rango 0-255

**Archivo:** [`modals.js L484`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals.js#L484) | [`tables.js L111`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/tables.js#L111)

**Descripción:** La regex usada para validar IP es `/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/`. Esta expresión permite valores como `999.999.999.999` porque solo valida el formato, no el rango numérico.

```javascript
if (ip && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) // ← acepta 999.999.999.999
```

**Corrección:**
```javascript
const IP_REGEX = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
if (ip && !IP_REGEX.test(ip)) { notify('IP inválida', 'error'); return; }
```

---

### MEDIO — BUG-09: `startCellEdit()` inyecta el valor original sin escapar en el atributo `value`

**Archivo:** [`tables.js L94`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/tables.js#L94)

**Descripción:** El valor previo de la celda se inyecta directamente como atributo HTML sin escapar. Si un campo contiene `"` o `>`, se rompe el HTML o permite inyección de atributos.

```javascript
// PROBLEMA: orig no está escapado en el atributo value
td.innerHTML = `<input class="cell-edit" value="${orig}" data-field="${field}"`>;
```

**Corrección:**
```javascript
const input = document.createElement('input');
input.className = 'cell-edit';
input.value = orig; // ← asignación directa, segura
input.dataset.field = field;
input.dataset.dev = devId;
td.innerHTML = '';
td.appendChild(input);
```

---

### MEDIO — BUG-10: `canPlace()` en `rack.js` no filtra por `mountSide`, permitiendo colisiones entre frente y trasero

**Archivo:** [`rack.js L303-L314`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/rack.js#L303-L314)

**Descripción:** La función auxiliar `canPlace()` usada por `repopulateQPSlots()` no tiene en cuenta el lado de montaje (`mountSide`). Esto hace que el modal de Quick Placement muestre como "Libre" un slot que en realidad está ocupado en el mismo lado trasero.

```javascript
function canPlace(rackId, slotStart, size, excludeDeviceId = null) {
  const existing = store.allDevicesInRack(rackId).filter(d => d.id !== excludeDeviceId);
  // ← No filtra por mountSide, mezcla front y rear
```

**Corrección:**
```javascript
function canPlace(rackId, slotStart, size, mountSide = 'front', excludeDeviceId = null) {
  const existing = store.allDevicesInRack(rackId)
    .filter(d => d.id !== excludeDeviceId && (d.mountSide || 'front') === mountSide);
  // ... resto igual
}
```

---

### MEDIO — BUG-11: `exportTopologyToPNG()` muta estado global sin guard ante errores → puede dejar la app rota

**Archivo:** [`topology.js L784-L818`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology.js#L784-L818)

**Descripción:** La función reemplaza temporalmente las variables globales `ctx`, `canvas`, `store._raw.topoZoom`, etc. Si `drawTopo()` lanza una excepción, el bloque de restauración (líneas 810-815) nunca se ejecuta y la app queda en estado corrupto.

**Corrección:**
```javascript
async function exportTopologyToPNG() {
  const oldCtx = ctx, oldCanvas = canvas;
  const snap = { zoom: store._raw.topoZoom, px: store._raw.topoPanX, py: store._raw.topoPanY };
  try {
    ctx = oc; canvas = offCanvas;
    store._raw.topoZoom = 1;
    drawTopo();
    cancelAnimationFrame(topoAnim);
    // ... link.click()
  } finally {
    // Bloque finally garantiza la restauración siempre
    ctx = oldCtx; canvas = oldCanvas;
    store._raw.topoZoom = snap.zoom;
    store._raw.topoPanX = snap.px;
    store._raw.topoPanY = snap.py;
    hoveredNode = null;
    startTopo();
  }
}
```

---

### BAJO — BUG-12: `notify()` no limita el número de notificaciones simultáneas

**Archivo:** [`utils.js L16-L29`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/utils.js#L16-L29)

**Descripción:** Si el usuario realiza múltiples acciones rápidas (e.g. drag & drop masivo), se apilan decenas de notificaciones que desbordan la pantalla.

**Corrección:**
```javascript
function notify(msg, type = 'info', duration = 3000) {
  const area = document.getElementById('notif-area');
  // Limitar a 4 notificaciones visibles
  while (area.children.length >= 4) area.removeChild(area.firstChild);
  // ... resto igual
}
```

---

### BAJO — BUG-13: `DOMContentLoaded` dentro de `main.js` siempre se dispara tarde — el tema no se aplica antes del primer render

**Archivo:** [`main.js L328-L334`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/main.js#L328-L334)

**Descripción:** El `document.addEventListener('DOMContentLoaded', ...)` dentro de `initGlobalEvents()` se registra **después** de que `init()` ya llamó a `renderAll()`. El tema guardado se aplica visiblemente después del primer frame → flash of unstyled content (FOUC).

**Corrección:** Mover la inicialización del tema al `<head>` del HTML o al comienzo del script antes de cualquier render:
```html
<script>
  const t = localStorage.getItem('theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
</script>
```

---

### BAJO — BUG-14: `buildDeviceOptionsGrouped()` muestra **todos** los dispositivos huérfanos, incluidos los de piso

**Archivo:** [`modals.js L153-L160`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals.js#L153-L160)

**Descripción:** El selector de cables incluye en el grupo "Sin Gabinete" a los dispositivos de piso (`category === 'floor'`). Esto es correcto si tienen red, pero confunde al usuario mezclar terminología.

**Corrección:**
```javascript
// Separar orphaned en dos grupos:
const floorOrphaned = devices.filter(d => d.category === 'floor');
const rackOrphaned  = devices.filter(d => !d.rackId && d.category !== 'floor');
// Renderizar con labels distintos
```

---

### BAJO — BUG-15: `room-rename` muta `_raw` directamente sin llamar a `snapshot()` → no es deshacible

**Archivo:** [`catalog.js L128-L133`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/catalog.js#L128-L133)

**Descripción:** La acción de renombrar sala vía doble-clic modifica `room.name` directamente en `_raw` sin pasar por `store.snapshot()`. El usuario no puede deshacer esta operación con Ctrl+Z.

**Corrección:**
```javascript
const newName = prompt('Editar nombre de la sala:', room.name);
if (newName !== null && newName.trim() !== '') {
  store.snapshot(); // ← agregar
  room.name = newName.trim();
  store._save();
  store._emit('change', { source: 'room-rename' });
}
```

---

### BAJO — BUG-16: El CSV exportado no escapa comas — campos con comas rompen el formato

**Archivo:** [`modals.js L254-L262`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals.js#L254-L262)

**Descripción:** El CSV se construye con `.join(',')`. Si un nombre de equipo contiene una coma (`Server Dell, R740`), el CSV queda malformado.

**Corrección:**
```javascript
const escapeCSV = v => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
};
const rows = data.map(row => row.map(escapeCSV).join(','));
```

---

### BAJO — BUG-17: `getFloorFaceplate()` en `faceplates.js` genera botones de acción con `data-edit-dev` y `data-del-dev`, pero `bindRackEvents()` los escucha en otro contexto

**Archivo:** [`faceplates.js L128-L131`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/faceplates.js#L128-L131)

**Descripción:** Los botones de acción dentro de `.floor-device-card` tienen `data-edit-dev` y `data-del-dev`. `bindRackEvents()` sí los registra en `rack.js L160-L174`, pero el evento `click` solo funciona si no hay interacción simultánea con el `drag-over` del grid, que consume el evento.

---

### INFO — BUG-18: `flowT` se incrementa indefinidamente en `topology.js` → overflow flotante a largo plazo

**Archivo:** [`topology.js L567`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology.js#L567)

**Descripción:** `flowT += 0.015` corre en cada frame a 60fps. Tras ~18.5 horas de uso, `flowT` excede `Number.MAX_SAFE_INTEGER / 10^15`, aunque en práctica JS tolera flotantes grandes. Es una "deuda técnica" sin impacto inmediato.

**Corrección:**
```javascript
flowT = (flowT + 0.015) % 1; // Reset al ciclo completo
```

---

## Sección 2 — Diagramas SVG

### Diagrama 1: Flujo del Store y Propagación de Eventos

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8"/>
    </marker>
    <marker id="arr-red" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
    </marker>
    <linearGradient id="gStore" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Animación pulso -->
    <style>
      .pulse { animation: pulse 2s infinite; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      .flow { animation: flow 1.5s infinite linear; }
      @keyframes flow { from{stroke-dashoffset:20} to{stroke-dashoffset:0} }
    </style>
  </defs>

  <!-- Fondo -->
  <rect width="800" height="420" fill="#090d17" rx="16"/>
  <text x="400" y="30" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="monospace">
    RACK Designer 2 — Flujo de Estado (Store Pattern)
  </text>

  <!-- USER ACTION -->
  <rect x="20" y="60" width="130" height="44" rx="8" fill="#1e3a5f" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="85" y="80" text-anchor="middle" fill="#38bdf8" font-size="11" font-family="monospace" font-weight="bold">👤 ACCIÓN</text>
  <text x="85" y="96" text-anchor="middle" fill="#8b9ab8" font-size="10" font-family="monospace">UI Evento</text>

  <!-- Arrow USER → STORE -->
  <line x1="150" y1="82" x2="240" y2="82" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr)" stroke-dasharray="6,3" class="flow"/>

  <!-- STORE -->
  <rect x="240" y="44" width="160" height="76" rx="10" fill="url(#gStore)" stroke="#60a5fa" stroke-width="2" filter="url(#glow)"/>
  <text x="320" y="68" text-anchor="middle" fill="#93c5fd" font-size="13" font-family="monospace" font-weight="bold">STORE</text>
  <text x="320" y="84" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">Proxy ES6</text>
  <text x="320" y="100" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">snapshot() → _save() → _emit()</text>
  <text x="320" y="114" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">localStorage ↕</text>

  <!-- Arrow STORE → LISTENERS -->
  <line x1="400" y1="82" x2="490" y2="82" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr)" stroke-dasharray="6,3" class="flow"/>

  <!-- RENDERALL -->
  <rect x="490" y="60" width="120" height="44" rx="8" fill="#0f3027" stroke="#10b981" stroke-width="1.5"/>
  <text x="550" y="80" text-anchor="middle" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">renderAll()</text>
  <text x="550" y="96" text-anchor="middle" fill="#8b9ab8" font-size="9" font-family="monospace">Orquestador</text>

  <!-- Sub-renders -->
  <rect x="630" y="40" width="140" height="30" rx="6" fill="#1a1a2e" stroke="#6366f1" stroke-width="1"/>
  <text x="700" y="60" text-anchor="middle" fill="#818cf8" font-size="10" font-family="monospace">renderPhysical()</text>
  <rect x="630" y="80" width="140" height="30" rx="6" fill="#1a1a2e" stroke="#f59e0b" stroke-width="1"/>
  <text x="700" y="99" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace">renderRoomTabs()</text>
  <rect x="630" y="120" width="140" height="30" rx="6" fill="#1a1a2e" stroke="#06b6d4" stroke-width="1"/>
  <text x="700" y="139" text-anchor="middle" fill="#22d3ee" font-size="10" font-family="monospace">renderStats()</text>
  <rect x="630" y="160" width="140" height="30" rx="6" fill="#1a1a2e" stroke="#ef4444" stroke-width="1"/>
  <text x="700" y="179" text-anchor="middle" fill="#f87171" font-size="10" font-family="monospace">renderBottomPanel()</text>

  <line x1="610" y1="82" x2="630" y2="55" stroke="#6366f1" stroke-width="1" marker-end="url(#arr)"/>
  <line x1="610" y1="82" x2="630" y2="95" stroke="#f59e0b" stroke-width="1" marker-end="url(#arr)"/>
  <line x1="610" y1="82" x2="630" y2="135" stroke="#06b6d4" stroke-width="1" marker-end="url(#arr)"/>
  <line x1="610" y1="82" x2="630" y2="175" stroke="#ef4444" stroke-width="1" marker-end="url(#arr)"/>

  <!-- UNDO/REDO STACK -->
  <rect x="240" y="160" width="160" height="60" rx="8" fill="#2d1b4e" stroke="#8b5cf6" stroke-width="1.5"/>
  <text x="320" y="180" text-anchor="middle" fill="#a78bfa" font-size="11" font-family="monospace" font-weight="bold">Undo / Redo</text>
  <text x="320" y="196" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">undoStack[] ← deepClone</text>
  <text x="320" y="210" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">max 30 snapshots</text>
  <line x1="320" y1="120" x2="320" y2="160" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- LOCALSTORAGE -->
  <rect x="20" y="160" width="130" height="60" rx="8" fill="#1a1a2e" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="85" y="183" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="monospace" font-weight="bold">💾 localStorage</text>
  <text x="85" y="200" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">RACK_DESIGNER_STATE</text>
  <text x="85" y="214" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">JSON.stringify(_raw)</text>
  <line x1="240" y1="82" x2="85" y2="160" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,2" marker-end="url(#arr)"/>

  <!-- BUG LABELS -->
  <rect x="20" y="280" width="760" height="120" rx="10" fill="#1a0a0a" stroke="#ef4444" stroke-width="1"/>
  <text x="400" y="300" text-anchor="middle" fill="#f87171" font-size="11" font-family="monospace" font-weight="bold">🐛 Bugs críticos en este flujo</text>

  <circle cx="50" cy="324" r="6" fill="#ef4444" class="pulse"/>
  <text x="62" y="329" fill="#fca5a5" font-size="10" font-family="monospace">BUG-04: _makeProxy crea Proxy por cada get → memory leak en drawTopo() 60fps</text>

  <circle cx="50" cy="350" r="6" fill="#f59e0b" class="pulse"/>
  <text x="62" y="355" fill="#fde68a" font-size="10" font-family="monospace">BUG-05: loadData() no resetea topology → posiciones fantasma al cargar nuevo proyecto</text>

  <circle cx="50" cy="376" r="6" fill="#8b5cf6" class="pulse"/>
  <text x="62" y="381" fill="#c4b5fd" font-size="10" font-family="monospace">BUG-15: room-rename no llama snapshot() → rename no es deshacible con Ctrl+Z</text>

  <circle cx="50" cy="393" r="6" fill="#06b6d4"/>
  <text x="62" y="398" fill="#a5f3fc" font-size="10" font-family="monospace">BUG-13: tema se inicializa tarde → FOUC visible al recargar página</text>
</svg>
```

---

### Diagrama 2: Mapa de Seguridad (Exposición de Credenciales)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 500" width="780" height="500">
  <defs>
    <style>
      .blink { animation: blink 1s step-start infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      .scan { animation: scan 3s infinite linear; }
      @keyframes scan { from { transform: translateY(0); } to { transform: translateY(380px); } }
    </style>
    <marker id="a2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#ef4444"/>
    </marker>
    <marker id="a3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="780" height="500" fill="#090d17" rx="16"/>
  <text x="390" y="28" text-anchor="middle" fill="#f87171" font-size="14" font-family="monospace" font-weight="bold">
    ⚠ Mapa de Exposición de Credenciales — RACK Designer 2
  </text>

  <!-- Device store central -->
  <ellipse cx="390" cy="160" rx="70" ry="40" fill="#1e3a8a" stroke="#38bdf8" stroke-width="2"/>
  <text x="390" y="155" text-anchor="middle" fill="#93c5fd" font-size="11" font-family="monospace" font-weight="bold">Device</text>
  <text x="390" y="170" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">user / pass</text>

  <!-- Flecha a Tooltip HTML -->
  <line x1="330" y1="135" x2="175" y2="90" stroke="#ef4444" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="20" y="50" width="155" height="50" rx="8" fill="#3b0a0a" stroke="#ef4444" stroke-width="1.5"/>
  <text x="97" y="70" text-anchor="middle" fill="#fca5a5" font-size="10" font-family="monospace" font-weight="bold">🔴 Tooltip Hover</text>
  <text x="97" y="84" text-anchor="middle" fill="#f87171" font-size="9" font-family="monospace">rack.js:377 — EXPOSED</text>
  <text x="97" y="95" text-anchor="middle" fill="#f87171" font-size="9" font-family="monospace" class="blink">Pass: fort123</text>

  <!-- Flecha a Canvas HUD -->
  <line x1="360" y1="122" x2="175" y2="175" stroke="#ef4444" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="20" y="148" width="155" height="50" rx="8" fill="#3b0a0a" stroke="#ef4444" stroke-width="1.5"/>
  <text x="97" y="167" text-anchor="middle" fill="#fca5a5" font-size="10" font-family="monospace" font-weight="bold">🔴 Canvas HUD</text>
  <text x="97" y="181" text-anchor="middle" fill="#f87171" font-size="9" font-family="monospace">topology.js:707 — EXPOSED</text>
  <text x="97" y="192" text-anchor="middle" fill="#f87171" font-size="9" font-family="monospace" class="blink">Pass: dell456</text>

  <!-- Flecha a CSV Export -->
  <line x1="390" y1="200" x2="230" y2="280" stroke="#f59e0b" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="20" y="254" width="210" height="50" rx="8" fill="#3b1a00" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="125" y="273" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace" font-weight="bold">🟡 Exportación CSV/Excel</text>
  <text x="125" y="287" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">tables.js:190 — LEAKED</text>
  <text x="125" y="298" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">Pass columna incluida</text>

  <!-- Flecha a JSON Export -->
  <line x1="390" y1="200" x2="390" y2="270" stroke="#f59e0b" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="290" y="270" width="200" height="50" rx="8" fill="#3b1a00" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="390" y="290" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace" font-weight="bold">🟡 .rack JSON Export</text>
  <text x="390" y="304" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">modals.js:265 — LEAKED</text>
  <text x="390" y="315" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">"pass":"san789" en claro</text>

  <!-- Flecha a localStorage -->
  <line x1="450" y1="140" x2="600" y2="90" stroke="#f59e0b" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="600" y="55" width="162" height="50" rx="8" fill="#3b1a00" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="681" y="74" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace" font-weight="bold">🟡 localStorage</text>
  <text x="681" y="88" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">store.js:53 — PERSISTED</text>
  <text x="681" y="99" text-anchor="middle" fill="#fde68a" font-size="9" font-family="monospace">JSON claro + sin TTL</text>

  <!-- Leyenda soluciones -->
  <rect x="20" y="340" width="740" height="140" rx="10" fill="#061a10" stroke="#10b981" stroke-width="1.5"/>
  <text x="390" y="362" text-anchor="middle" fill="#34d399" font-size="12" font-family="monospace" font-weight="bold">✅ Correcciones de Seguridad Propuestas</text>

  <circle cx="42" cy="388" r="5" fill="#10b981"/>
  <text x="52" y="392" fill="#a7f3d0" font-size="10" font-family="monospace">Tooltip/HUD: mostrar "••••••••" en lugar de la contraseña real. Agregar botón toggle 👁.</text>

  <circle cx="42" cy="410" r="5" fill="#10b981"/>
  <text x="52" y="414" fill="#a7f3d0" font-size="10" font-family="monospace">Exports: omitir campo pass del CSV y Excel. Preguntar al usuario si desea incluirla al exportar JSON.</text>

  <circle cx="42" cy="432" r="5" fill="#10b981"/>
  <text x="52" y="436" fill="#a7f3d0" font-size="10" font-family="monospace">localStorage: cifrar pass con btoa() + salt del dominio. Añadir versionado de esquema.</text>

  <circle cx="42" cy="454" r="5" fill="#10b981"/>
  <text x="52" y="458" fill="#a7f3d0" font-size="10" font-family="monospace">Web Crypto API: usar AES-GCM con clave derivada de una passphrase del usuario para proyectos sensibles.</text>
</svg>
```

---

### Diagrama 3: Ciclo de Vida del Drag & Drop y Colisiones

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 460" width="780" height="460">
  <defs>
    <marker id="da" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#38bdf8"/>
    </marker>
    <style>
      .dd-flow { animation: dd 2s infinite linear; stroke-dasharray: 8,4; }
      @keyframes dd { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
    </style>
  </defs>

  <rect width="780" height="460" fill="#090d17" rx="16"/>
  <text x="390" y="28" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="monospace">
    Ciclo Drag &amp; Drop — Detección de Colisiones por Lado de Montaje
  </text>

  <!-- CATÁLOGO / DISPOSITIVO fuente -->
  <rect x="20" y="55" width="120" height="40" rx="8" fill="#1e3a5f" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="80" y="79" text-anchor="middle" fill="#93c5fd" font-size="11" font-family="monospace">CATÁLOGO</text>
  <rect x="20" y="110" width="120" height="40" rx="8" fill="#1e2d4e" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="80" y="134" text-anchor="middle" fill="#93c5fd" font-size="11" font-family="monospace">DISPOSITIVO</text>

  <!-- onDragStart -->
  <line x1="140" y1="75" x2="240" y2="120" stroke="#38bdf8" stroke-width="1.5" class="dd-flow" marker-end="url(#da)"/>
  <line x1="140" y1="130" x2="240" y2="130" stroke="#38bdf8" stroke-width="1.5" class="dd-flow" marker-end="url(#da)"/>

  <!-- dragState -->
  <rect x="240" y="98" width="140" height="60" rx="8" fill="#1a1f35" stroke="#818cf8" stroke-width="1.5"/>
  <text x="310" y="118" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="monospace" font-weight="bold">dragState</text>
  <text x="310" y="132" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">type: catalog|device</text>
  <text x="310" y="146" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">item | deviceId</text>

  <!-- onSlotDragOver -->
  <line x1="380" y1="128" x2="450" y2="128" stroke="#38bdf8" stroke-width="1.5" class="dd-flow" marker-end="url(#da)"/>
  <rect x="450" y="100" width="150" height="56" rx="8" fill="#1a1f35" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="525" y="118" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace" font-weight="bold">onSlotDragOver</text>
  <text x="525" y="132" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">Verifica colisión</text>
  <text x="525" y="146" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">por mountSide ✓</text>

  <!-- Colisión visual -->
  <rect x="620" y="80" width="140" height="36" rx="6" fill="#0f3027" stroke="#10b981" stroke-width="1"/>
  <text x="690" y="103" text-anchor="middle" fill="#34d399" font-size="10" font-family="monospace">🟢 drop-highlight</text>
  <rect x="620" y="126" width="140" height="36" rx="6" fill="#3b0a0a" stroke="#ef4444" stroke-width="1"/>
  <text x="690" y="149" text-anchor="middle" fill="#f87171" font-size="10" font-family="monospace">🔴 drop-invalid</text>
  <line x1="600" y1="120" x2="620" y2="98" stroke="#10b981" stroke-width="1"/>
  <line x1="600" y1="132" x2="620" y2="144" stroke="#ef4444" stroke-width="1"/>

  <!-- onSlotDrop → store -->
  <line x1="525" y1="156" x2="525" y2="220" stroke="#38bdf8" stroke-width="1.5" class="dd-flow" marker-end="url(#da)"/>
  <rect x="420" y="220" width="210" height="60" rx="8" fill="#1a1f35" stroke="#10b981" stroke-width="1.5"/>
  <text x="525" y="240" text-anchor="middle" fill="#34d399" font-size="11" font-family="monospace" font-weight="bold">onSlotDrop</text>
  <text x="525" y="256" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">store.addDeviceToRack()</text>
  <text x="525" y="270" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">store.moveDevice()</text>

  <!-- BUG repopulateQPSlots canPlace -->
  <rect x="20" y="230" width="380" height="110" rx="10" fill="#1a0a0a" stroke="#ef4444" stroke-width="1.5"/>
  <text x="210" y="252" text-anchor="middle" fill="#f87171" font-size="11" font-family="monospace" font-weight="bold">🐛 BUG-10: canPlace() sin mountSide</text>
  <text x="210" y="271" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace">repopulateQPSlots() llama canPlace(rackId, u, size)</text>
  <text x="210" y="288" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace">Sin filtrar por mountSide → slots REAR aparecen</text>
  <text x="210" y="305" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace">como "libres" aunque estén ocupados</text>
  <text x="210" y="322" text-anchor="middle" fill="#34d399" font-size="10" font-family="monospace">Fix: canPlace(rackId, u, size, mountSide)</text>

  <!-- RACKS con slots frontales y traseros -->
  <rect x="110" y="370" width="200" height="60" rx="8" fill="#1a1f35" stroke="#0ea5e9" stroke-width="1.5"/>
  <text x="210" y="393" text-anchor="middle" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold">RACK — Vista Frontal</text>
  <rect x="150" y="400" width="30" height="20" rx="2" fill="#10b981" opacity="0.7"/>
  <text x="165" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U1</text>
  <rect x="182" y="400" width="30" height="20" rx="2" fill="#ef4444" opacity="0.7"/>
  <text x="197" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U2</text>
  <rect x="214" y="400" width="30" height="20" rx="2" fill="#64748b" opacity="0.3"/>
  <text x="229" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U3</text>

  <rect x="460" y="370" width="200" height="60" rx="8" fill="#1a1f35" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="560" y="393" text-anchor="middle" fill="#60a5fa" font-size="10" font-family="monospace" font-weight="bold">RACK — Vista Trasera</text>
  <rect x="500" y="400" width="30" height="20" rx="2" fill="#64748b" opacity="0.3"/>
  <text x="515" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U1</text>
  <rect x="532" y="400" width="30" height="20" rx="2" fill="#8b5cf6" opacity="0.7"/>
  <text x="547" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U2</text>
  <rect x="564" y="400" width="30" height="20" rx="2" fill="#64748b" opacity="0.3"/>
  <text x="579" y="415" text-anchor="middle" fill="#fff" font-size="7" font-family="monospace">U3</text>

  <text x="390" y="407" text-anchor="middle" fill="#4ade80" font-size="18" font-family="monospace">⇔</text>
  <text x="390" y="425" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">mountSide independiente</text>
</svg>
```

---

## Sección 3 — Mecánicas de Seguridad Propuestas

| # | Mecánica | Implementación | Prioridad |
|---|----------|----------------|-----------|
| S-1 | **Enmascarar contraseñas en UI** | Mostrar `••••••••` con botón toggle 👁 | 🔴 Alta |
| S-2 | **No exportar pass en CSV/Excel** | Omitir columna o reemplazar por `[PROTEGIDO]` | 🔴 Alta |
| S-3 | **Ofuscación en localStorage** | `btoa()` sobre el campo `pass` antes de guardar | 🟡 Media |
| S-4 | **CSP Header recomendado** | `Content-Security-Policy: default-src 'self'` en el servidor | 🟡 Media |
| S-5 | **Validación de importación JSON** | Verificar esquema con JSON Schema o Zod antes de `loadData()` | 🟡 Media |
| S-6 | **Confirmación antes de sobreescribir estado** | Modal de confirmación al importar un archivo `.rack` | 🟢 Baja |
| S-7 | **Rate-limit de notificaciones** | Máximo 4 simultáneas (BUG-12) para evitar DoS visual | 🟢 Baja |
| S-8 | **Sanitización innerHTML** | Reemplazar todos los `innerHTML` con `textContent` + DOM API donde sea posible | 🟡 Media |

---

## Sección 4 — Mejoras de Interfaz y Controles (UX)

| # | Mejora | Beneficio |
|---|--------|-----------|
| U-1 | **Undo/Redo visual en toolbar** con contador (e.g. `↩ 3`) | El usuario sabe cuántos pasos puede deshacer |
| U-2 | **Indicador de sala activa** más prominente (breadcrumb `Sala > Rack`) | Reduce desorientación al cambiar de sala |
| U-3 | **Confirmación de eliminación con nombre del objeto** (`¿Eliminar "Switch Cisco 48P"?`) | Previene errores por clics accidentales |
| U-4 | **Badge de ocupación por rack** (barra de progreso inline) en la vista física | Visión rápida de capacidad sin ir a estadísticas |
| U-5 | **Teclado accesible en tabla** (Tab entre celdas editables, Enter para guardar) | Edición masiva más rápida |
| U-6 | **Filtro de búsqueda persistente** al cambiar de sala (actualmente se limpia) | Flujo de inspección más fluido |
| U-7 | **Modo "solo lectura"** en la topología para presentaciones | Evita movimientos accidentales al mostrar el diseño |
| U-8 | **Zoom con pellizco (pinch) en móvil** en vista física (actualmente solo rueda) | Mejor experiencia táctil |
| U-9 | **Exportar topología también como SVG** (no solo PNG) | Gráfico vectorial para documentación técnica |
| U-10 | **Autoguardado con timestamp** visible (`Guardado hace 2 min`) | Confianza en que los datos están seguros |

---

## Resumen de Severidad

```
🔴 CRÍTICO  (BUG-01, BUG-02, BUG-04)          → 3 bugs
🟠 ALTO     (BUG-03, BUG-05, BUG-06)          → 3 bugs
🟡 MEDIO    (BUG-07 a BUG-11)                 → 5 bugs
🟢 BAJO     (BUG-12 a BUG-17)                 → 6 bugs
ℹ  INFO     (BUG-18)                          → 1 nota
─────────────────────────────────────────────
TOTAL:  18 hallazgos
```

> **Prioridad de acción sugerida:** BUG-01/02 primero (seguridad), BUG-04/05 segundo (estabilidad), BUG-06/10 tercero (integridad de datos), resto de bajo a medio para el siguiente sprint.
