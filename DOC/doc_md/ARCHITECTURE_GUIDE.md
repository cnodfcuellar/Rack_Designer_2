# RACK Designer Next — Guía Técnica Completa

> Explicación técnica para recrear el proyecto desde cero, con diagramas y conceptos explicados paso a paso.
> **Última actualización sincronizada con el código fuente.**

---

## Tabla de Contenidos

1. [Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [Stack Tecnológico (qué usamos y por qué)](#2-stack-tecnológico)
3. [Arquitectura General](#3-arquitectura-general)
4. [El Patrón Reactivo (Proxy ES6)](#4-el-patrón-reactivo)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [El Layout de la Interfaz (CSS Grid)](#6-el-layout-de-la-interfaz)
7. [Cada Área de la UI explicada](#7-cada-área-de-la-ui)
8. [El Topology View (Canvas 2D)](#8-el-topology-view)
9. [Renderizado de Cableado Físico (SVG)](#9-renderizado-de-cableado-físico)
10. [Sistema de Autenticación (RBAC)](#10-sistema-de-autenticación)
11. [Gestión de Archivos (File System Access API)](#11-gestión-de-archivos)
12. [Flujo de Datos Completo](#12-flujo-de-datos-completo)
13. [Cómo recrear desde cero](#13-cómo-recrear-desde-cero)
14. [Diagramas SVG del Proyecto](#14-diagramas-svg)
15. [Roadmap de Mejoras](#15-roadmap-de-mejoras)

---

## 1. Qué es este proyecto?

**RACK Designer Next** es una aplicación web (PWA) que sirve para diseñar y administrar centros de datos. Permite:

- Crear **salas** (rooms) que representan habitaciones de un datacenter
- Crear **gabinetes** (racks) dentro de esas salas con alturas configurables (4U–48U)
- Colocar **equipos** (servidores, switches, routers, firewalls, UPS, etc.) dentro de los gabinetes o como equipos de piso
- Conectar los equipos entre sí con **cables** (cobre, fibra óptica, DAC)
- Ver todo en dos vistas: **Vista Física** (cómo se ve el rack, con cables SVG) y **Vista Topología** (diagrama de red en Canvas 2D)
- **Exportar** a PNG, CSV, Excel y guardar/cargar proyectos como archivos `.rack`
- Sistema de **roles** (Admin, Editor, Viewer) con PIN y SHA-256

**Lo más importante:** Es una PWA (Progressive Web App) que funciona sin servidor backend. Todos los datos se guardan en el navegador del usuario (`localStorage`) o en archivos locales (File System Access API). **No hay backend ni base de datos remota.**

### Ejecutar el proyecto

```
# Opción 1: Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"

# Opción 2: Cualquier servidor estático
npx serve .
python -m http.server 8000
```

**No necesitas** `npm start`, `webpack`, `vite` ni nada para compilar. Solo abre el `index.html`.

---

## 2. Stack Tecnológico

### Qué usamos

| Tecnología | Para qué sirve | Por qué la elegimos |
|---|---|---|
| **JavaScript ES6+** | Toda la lógica | Sin frameworks, vanilla puro |
| **HTML5** | Estructura de la app | Semánticos, modals, canvas |
| **CSS3** | Estilos y layout | Grid, Flexbox, variables CSS, temas |
| **Canvas 2D** | Vista de topología | Animaciones y dibujo de red |
| **SVG inline** | Cables en vista física | Trazado reactivo de rutas ortogonales |
| **Proxy ES6** | Estado reactivo | Reemplaza a Redux/useState |
| **localStorage** | Guardar datos | Persistencia sin servidor |
| **sessionStorage** | Sesiones de auth | Se borra al cerrar pestaña |
| **SHA-256** | Hasheo de PIN | Seguridad básica de admin (Web Crypto API + fallback) |
| **File System Access API** | Abrir/guardar archivos | Sin necesidad de upload, con autoguardado |
| **SheetJS** | Exportar a Excel | Dependencia vendor (`xlsx.full.min.js`) |
| **html2canvas** | Captura DOM Retina 1:1 a PNG | Dependencia vendor (`html2canvas.min.js`) con fallback Canvas 2D |
| **mobile-drag-drop** | Polyfill touch drag | Soporte táctil para drag & drop |

### Qué NO usamos (y por qué)

| No usamos | Por qué |
|---|---|
| React/Vue/Angular | El proyecto es vanilla, sin build step |
| Webpack/Vite | No hay paso de compilación |
| TypeScript | Vanilla JS puro |
| Backend/API | Todo es local en el navegador |
| Base de datos | localStorage es suficiente |
| npm/yarn | Solo **pnpm** para gestionar `marked` (build scripts) |

### Diagrama de tecnologías

Ver: `doc/doc_img/doc_svg/architecture_overview.svg` (sección Tech Stack)

---

## 3. Arquitectura General

El proyecto sigue un patrón llamado **"Reactive Proxy Pattern"**. Esto significa que:

1. **Toda la información vive en un solo lugar** (el `store`)
2. **Cuando algo cambia**, el Proxy lo detecta automáticamente
3. **Se guarda** en el navegador (localStorage)
4. **Se notifica** a la interfaz que hay datos nuevos
5. **La interfaz se redibuja** con los datos actualizados

```
USUARIO hace algo
    ↓
EVENT HANDLER ejecuta una función
    ↓
STORE METHOD modifica los datos
    ↓
snapshot() → crea copia profunda para Undo/Redo
    ↓
MUTACIÓN en this._raw (push, assign, splice)
    ↓
PROXY SET TRAP detecta el cambio
    ↓
_save() → localStorage.setItem('RACK_DESIGNER_NEXT_STATE', ...)
    ↓
_emit('change', { source: 'addDeviceToRack' })
    ↓
main.js escucha el evento → renderAll({ source })
    ↓
Se redibujan SOLO las vistas afectadas según el "source"
```

**Ver diagrama completo:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 2)

### Por qué es importante esto?

Porque si intentas modificar el HTML directamente (por ejemplo, `document.getElementById('algo').innerHTML = '...'`), el proyecto se rompe. **Siempre** debes modificar el `store` y dejar que la interfaz se actualice sola.

---

## 4. El Patrón Reactivo

### Cómo funciona el Proxy ES6

```javascript
// El store crea un Proxy sobre el estado
this._raw = { rooms: [], racks: [], devices: [], ... };
this.state = this._makeProxy(this._raw);

// El Proxy intercepta CADA escritura en el estado:
_makeProxy(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (this._proxyCache.has(obj)) return this._proxyCache.get(obj); // Cache con WeakMap

  const proxy = new Proxy(obj, {
    set: (target, key, value) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) return true; // Seguridad
      target[key] = value;       // 1. Aplica el cambio
      this._save();              // 2. Guarda en localStorage
      this._emit('change', {     // 3. Notifica a todos los listeners
        path: `${path}.${key}`, key, value
      });
      return true;
    },
    get: (target, key) => {
      const val = target[key];
      if (typeof val === 'function') return val.bind(target);
      // Si el valor es un objeto, lo envuelve en otro Proxy (recursivo)
      if (typeof val === 'object' && val !== null && !Array.isArray(val))
        return this._makeProxy(val, `${path}.${key}`);
      return val;
    }
  });
  this._proxyCache.set(obj, proxy);
  return proxy;
}
```

> **Nota importante:** El `get` trap solo envuelve sub-objetos (no arrays). Esto significa que mutaciones en arrays (como `push`, `splice`) **no disparan el Proxy automáticamente**. Por eso cada método del store llama manualmente a `this._save()` y `this._emit()` después de mutar arrays.

### El flujo en código

```
Usuario arrastra un equipo al rack
    ↓
onSlotDrop() detecta el drop
    ↓
store.addDeviceToRack(template, rackId, slotU, side)
    ↓
store.snapshot() → guarda estado actual para undo
    ↓
this._raw.devices.push(nuevoEquipo) → muta los datos
    ↓
this._save() + this._emit('change', { source: 'addDeviceToRack' })
    ↓
renderAll({ source: 'addDeviceToRack' })
    ↓
renderPhysical() → nuevo faceplate aparece
renderStats() → estadísticas se actualizan
renderOutliner() → árbol se actualiza
renderBottomPanel() → tabla se actualiza
```

**Ver diagrama:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 3a)

### Undo/Redo

Cada vez que mutas el store, `snapshot()` guarda una copia del estado anterior (máximo 30). Cuando el usuario presiona Ctrl+Z:

1. Se toma el estado actual y se guarda en `_redoStack`
2. Se saca el estado anterior de `_undoStack`
3. Se sobreescribe `_raw` con ese estado
4. Se redibuja todo

**Ver diagrama:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 4)

### Optimización: Debounce para Zoom/Pan

Los métodos `setZoom()` y `setPan()` usan `_saveDebounced()` en lugar de `_save()`:

```javascript
_saveDebounced() {
  if (this._saveTimer) cancelAnimationFrame(this._saveTimer);
  this._saveTimer = requestAnimationFrame(() => {
    this._saveTimer = null;
    this._save();
  });
}
```

Esto agrupa ~60 escrituras/seg (durante zoom/pan con la rueda del ratón) en 1 escritura por frame, evitando saturar localStorage.

### Integridad Relacional en Cascada y Auto-Saneamiento (`_sanitize()`)

Para garantizar que el modelo de datos nunca acumule referencias rotas ni elementos huérfanos:

1. **Cascada en `deleteRack(id)`:** Al eliminar un gabinete, se buscan todos los dispositivos contenidos en él y se filtran automáticamente de `this._raw.connections` todas las conexiones que partían o llegaban a ellos.
2. **Limpieza en `deleteDevice(id)`:** Al eliminar un equipo individual, se purgan sus conexiones y se eliminan sus coordenadas en `topology.nodePositions`.
3. **Motor `_sanitize()`:** Al iniciar la aplicación (`_load()`) o importar un proyecto (`loadData()`), el Store ejecuta un saneamiento exhaustivo que elimina cables zombis y nodos huérfanos de proyectos antiguos o manipulados.
4. **Exposición Global:** `window.store = store;` expuesto para interoperabilidad y depuración.

---

## 5. Estructura de Archivos

### Árbol del proyecto

```
Rack_Designer_2/
├── index.html                    ← Archivo principal (HTML + modals)
├── service-worker.js             ← PWA offline (el que se registra)
├── package.json                  ← Solo pnpm. Dependencia: "marked"
├── mejoras.md                    ← Roadmap de mejoras (Source of Truth)
│
├── css/
│   ├── style.css                 ← Importa todos los CSS (@imports)
│   ├── variables.css             ← Variables CSS (colores, fuentes, tamaños, temas)
│   ├── layout.css                ← Grid layout, header, sidebar, panels
│   ├── mobile-drag-drop.css      ← Estilos del polyfill drag-and-drop
│   └── components/
│       ├── panels.css            ← Bottom panel, tablas, badges
│       ├── rack.css              ← Tarjetas de rack, flip 3D
│       ├── faceplates.css        ← Faceplates de dispositivos, LEDs
│       ├── modals.css            ← Modales, formularios, acordeón
│       └── misc.css              ← Iconos SVG, tooltips, drag ghost, scrollbar
│
├── js/
│   ├── store.js                  ← ESTADO CENTRAL (Proxy ES6 + WeakMap cache)
│   ├── main.js                   ← Orquestador (init, eventos, renderAll)
│   ├── utils.js                  ← Funciones auxiliares (uid, deepClone, notify, etc.)
│   ├── icons.js                  ← SVG inline de todos los dispositivos
│   ├── demoData.js               ← Carga datos de ejemplo (lazy load)
│   │
│   ├── auth/
│   │   └── roles.js              ← RBAC (Admin/Editor/Viewer) con SHA-256
│   │
│   ├── ui/
│   │   ├── catalog.js            ← Sidebar flyout: catálogo + categorías + filtros
│   │   ├── rack.js               ← Renderizado físico de racks + cables SVG
│   │   ├── faceplates.js         ← HTML de faceplates por tipo
│   │   ├── tables.js             ← Tabla de inventario/conexiones
│   │   ├── outliner.js           ← Árbol jerárquico (sala→rack→equipo)
│   │   ├── inspector.js          ← Panel de propiedades
│   │   ├── fileManager.js        ← File System Access API + autoguardado
│   │   ├── modals.js             ← Orquestador de modales
│   │   │
│   │   ├── modals/
│   │   │   ├── Globals.js        ← Variables globales de modales
│   │   │   ├── RackModal.js      ← Modal de crear/editar rack
│   │   │   ├── DeviceModal.js    ← Modal de crear/editar equipo (acordeones)
│   │   │   ├── CableModal.js     ← Modal de crear/editar cable
│   │   │   ├── RoomModal.js      ← Modal de crear sala
│   │   │   ├── ExportModal.js    ← Modal de exportar PNG/CSV/Excel/Topología
│   │   │   └── PlacementModal.js ← Modal de colocación rápida
│   │   │
│   │   └── topology/
│   │       ├── TopologyState.js      ← Estado del canvas (hover, dragging, etc.)
│   │       ├── TopologyLayout.js     ← Algoritmo de layout automático
│   │       ├── TopologyRenderer.js   ← Dibujado Canvas 2D (card/circle)
│   │       ├── TopologyEvents.js     ← Interacciones (drag, zoom, click, resize)
│   │       └── TopologyOrchestrator.js ← Lifecycle + exportación PNG
│   │
│   ├── xlsx.full.min.js          ← SheetJS (exportar Excel)
│   ├── mobile-drag-drop.min.js   ← Polyfill touch drag
│   └── mobile-drag-drop-scroll.min.js
│
├── assets/
│   ├── default/                  ← 16 SVGs vectoriales de alta fidelidad con animaciones CSS integradas
│   ├── icons/                    ← Iconos SVG monocromáticos por categoría
│   ├── img/                      ← Imágenes estáticas (logos, fondos, skins personalizadas)
│   └── svg/
│       └── default/              ← Repositorio vectorial organizado por familias
│
├── doc/
│   ├── doc_md/                   ← Documentación técnica en Markdown
│   ├── doc_img/doc_svg/          ← 33 diagramas SVG del proyecto
│   ├── log/                      ← CHANGELOG.md (diario de cambios)
│   └── temp/                     ← Archivos temporales
│
├── scripts/                      ← Scripts Node.js para compilación
│   ├── build_standalone_manual.cjs
│   └── generate_svgs.cjs
│
├── .agents/                      ← Instrucciones para agentes IA
├── .py/                          ← Scripts Python utilitarios
├── memory-bank/                  ← Contexto persistente para agentes IA
├── json/                         ← Archivos JSON auxiliares (manifest.json)
└── tests/
    └── integrity_check.cjs       ← Suite de pruebas automatizadas de integridad (26 tests en Node.js)
```

**Ver diagrama:** `doc/doc_img/doc_svg/architecture_overview.svg` (File Structure)

### Orden de carga de CSS

```
variables.css → layout.css → panels.css → rack.css → faceplates.css → modals.css → misc.css
```

Este orden es **importante** porque CSS se resuelve en cascada. Si `misc.css` define algo que `layout.css` también define, gana `misc.css` (se carga después).

### Scripts en index.html

Todos los `<script>` van al final del `<body>`, en orden:

1. **Vendor:** `xlsx.full.min.js`, `mobile-drag-drop.min.js`, `mobile-drag-drop-scroll.min.js`
2. **Core:** `store.js`, `utils.js`, `icons.js`, `demoData.js`
3. **Auth:** `auth/roles.js`
4. **UI:** `ui/catalog.js`, `ui/tables.js`, `ui/outliner.js`, `ui/inspector.js`
5. **Modals:** `Globals.js`, `RackModal.js`, `DeviceModal.js`, `CableModal.js`, `RoomModal.js`, `ExportModal.js`, `PlacementModal.js`
6. **Topology:** `TopologyState.js`, `TopologyLayout.js`, `TopologyRenderer.js`, `TopologyEvents.js`, `TopologyOrchestrator.js`
7. **Orchestration:** `ui/modals.js`, `ui/fileManager.js`
8. **Init:** `main.js` (último, porque depende de todo lo demás)

> ⚠️ **NO** son módulos ES. Todos cargan en scope global. Si añades un archivo JS nuevo, debes agregar una etiqueta `<script>` en `index.html`.

---

## 6. El Layout de la Interfaz (CSS Grid)

La app usa **CSS Grid** para dividir la pantalla en 5 áreas fijas:

```
┌─────────────────────────────────────────────────────┐
│                    HEADER (56px)                     │
├──────────┬──────────────────────┬────────────────────┤
│          │                      │                    │
│ SIDEBAR  │       MAIN CANVAS    │    RIGHT PANEL     │
│ (50px/   │        (1fr)         │     (300px)        │
│  260px)  │                      │                    │
├──────────┴──────────────────────┴────────────────────┤
│                  BOTTOM PANEL (220px)                 │
└─────────────────────────────────────────────────────┘
```

### CSS que define esto

```css
#app {
  display: grid;
  grid-template-rows: var(--header-h) 1fr var(--bottom-h);
  grid-template-columns: var(--sidebar-w) 1fr var(--right-panel-w);
  grid-template-areas:
    "header  header        header"
    "sidebar main          right-panel"
    "bottom  bottom        bottom";
  height: 100vh;
  overflow: hidden;
}
```

### Sidebar dinámico (flyout)

El sidebar tiene dos estados controlados por CSS:
- **Colapsado** (`--sidebar-w: 50px`): Solo muestra iconos de categorías
- **Expandido** (`--sidebar-w: 260px`): Muestra el flyout con la lista de equipos del catálogo

La función `openFlyout(category)` en `catalog.js` actualiza la variable CSS dinámicamente:
```javascript
document.documentElement.style.setProperty('--sidebar-w', '260px');
```

### Variables CSS importantes

```css
:root {
  /* Dimensiones */
  --sidebar-w: 50px;          /* Colapsado por defecto */
  --right-panel-w: 300px;
  --header-h: 56px;
  --bottom-h: 220px;
  --rack-unit-h: 24px;        /* 1U = 24px */

  /* Colores oscuros (tema por defecto) */
  --bg-main: #0b0f19;
  --bg-card: #151c2e;
  --border: #25304b;
  --accent: #0ea5e9;

  /* Fuentes */
  --font-ui: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Tema claro */
[data-theme="light"] {
  --bg-main: #f0f4f8;
  --bg-card: #ffffff;
  --accent: #0284c7;
  /* ... */
}
```

**Ver diagramas:** `doc/doc_img/doc_svg/layout_header.svg`, `layout_sidebar.svg`, etc.

---

## 7. Cada Área de la UI explicada

### Header (56px)

**Archivo:** `index.html` (sección `#header`), estilos en `css/layout.css`

Contiene:
- Logo + nombre del proyecto (`#project-filename`)
- Menú del proyecto (dropdown con Abrir, Guardar, Guardar como, Demo, Tema, Modo Dios, Cambiar PIN, Limpiar proyecto)
- Dropdown de salas (selector de sala activa + botón "+" para nueva sala)
- Dropdown de racks (navegación rápida + scroll al rack)
- Tabs de vista (`Vista Física` / `Topología`)
- Controles de topología (estilo card/circle, slider espaciado, auto-ordenar)
- Toggle de cables SVG (solo en vista física)
- Buscador global
- Botones Undo/Redo
- Badge de usuario (rol actual: Admin/Editor/Espectador)

**Ver:** `doc/doc_img/doc_svg/layout_header.svg`

### Sidebar (50px colapsado / 260px expandido)

**Archivo:** `index.html` (sección `#sidebar`), renderizado por `js/ui/catalog.js`

Contiene:
- **Barra de iconos de categorías** (`#sidebar-category-icons`): Iconos por familia de hardware (redes, cómputo, almacenamiento, seguridad/CCTV, energía, KVM, accesorios/cableado, periféricos de piso, más pestaña global "Todos" con buscador)
- **Flyout** (`#catalog-flyout`): Se despliega al hacer clic en una categoría
  - Título de la categoría activa
  - Buscador del catálogo (`#catalog-search`)
  - Botones de acción rápida: `+ Rack` y `+ Equipo`
  - Botón cerrar flyout
  - Lista de dispositivos del catálogo filtrados por categoría
- **30 plantillas arquitectónicas estandarizadas** en el array `CATALOG` organizadas en 8 familias comerciales (`CATALOG_GROUPS`): servidores 1U/2U/4U/blade, switches 24P/48P/Core, routers de borde, firewalls UTM, APs, storage NAS/SAN/JBOD, seguridad CCTV (NVR 1U/2U, DVR 1U, decodificador 1U), UPS online 1500/3000VA, PDUs, patch panels Cat6A, bandeja ODF fibra óptica 24P, organizadores, bandejas, KVMs y equipos de piso.
- **Equipos personalizados por proyecto (`store.state.customCatalog`):** Creación de plantillas custom con badge distintivo `PROYECTO`, persistencia en el archivo `.rack` y reset limpio en nuevo proyecto.
- Cada item es arrastrable al rack (drag & drop)
- Menú contextual por item (⋮): Ubicación rápida, Editar plantilla, Eliminar plantilla

**Ver:** `doc/doc_img/doc_svg/layout_sidebar.svg`

### Main Canvas (1fr)

**Archivo:** `index.html` (sección `#main`), renderizado por `js/ui/rack.js` y `js/ui/topology/`

Contiene dos vistas (se alternan con tabs en el header):

- **Vista Física** (`#view-physical`):
  - Tarjetas de rack con slots numerados (1U = 24px) y ancho fijo proporcional de 240px (10:1)
  - Espaciado técnico entre gabinetes ampliado a **`gap: 72px`** (3U) para legibilidad y pasillos
  - Grilla técnica milimétrica de fondo (CAD) con paso de 24px
  - **Motor Visual SVG-First (`faceplates.js`):** Cada dispositivo carga un SVG vectorial de alta fidelidad desde `assets/svg/default/` con animaciones CSS `@keyframes` integradas en el propio SVG (LEDs intermitentes de red, actividad de discos, barras de carga y puertos).
  - Overlay de información con nombre de equipo e IP nítida sobre la carátula.
  - Vista frontal/trasera (flip 3D por rack)
  - Drag & drop para colocar/mover equipos
  - Equipos de piso alineados en sección inferior con `min-width: 584px`
  - **Cables Físicos Segregados** (`#physical-cables-svg`): Enrutamiento ortogonal en 3 zonas libres (Canastillo Aéreo Superior, Canaleta Media libre y Organizador Lateral de gabinete), erradicando colisiones sobre racks o periféricos
  - Zoom/Pan con controles del header

- **Vista Topología** (`#topology-canvas`):
  - Canvas 2D animado a 60fps
  - Nodos en estilo Card (150×50) o Circle (radio 22)
  - Salas como rectángulos naranjas, racks como rectángulos verdes
  - Conexiones con curvas Bézier cúbicas y partículas animadas
  - Drag & drop de nodos, racks y salas
  - Resize handles en salas y racks
  - HUD tooltip al hover sobre nodos
  - Búsqueda global para destacar nodos

**Ver:** `doc/doc_img/doc_svg/layout_main_canvas.svg`

### Right Panel (300px)

**Archivo:** `index.html` (sección `#right-panel`), orquestado por `js/ui/outliner.js` e `js/ui/inspector.js`

Tres secciones:
1. **Outliner** (`#outliner-tree`): Árbol jerárquico (Sala → Rack → Equipo) con toolbar superior (`+ Sala`, `+ Rack`, `+ Equipo`), selector de 4 modos de ordenación (`#outliner-sort-select`: slot, name-asc, name-desc, type) y botones de acción rápida inline (`✏️` y `🗑️`).
   - Click: Selecciona y muestra en Inspector
   - Doble clic: Abre modal de edición
   - Hover: Resaltado visual
2. **Inspector** (`#inspector-section`): Tarjeta de propiedades del elemento seleccionado con soporte **colapsable** interactivo para expandir el Outliner. Incluye **CRUD activo** con Empty State (`+ Nueva Sala`, `+ Nuevo Gabinete`), y botones contextuales de eliminación segura (`deleteRoomFromInspector`, `deleteRackFromInspector`, `deleteDeviceFromInspector`).
3. **Estadísticas** (`#stat-*`): Métricas globales (salas, racks, equipos en rack, equipos de piso, conexiones, potencia en Watts).

**Ver:** `doc/doc_img/doc_svg/layout_right_panel.svg`

### Bottom Panel (220px)

**Archivo:** `index.html` (sección `#bottom`), renderizado por `js/ui/tables.js`

Contiene:
- Tabs: Inventario / Conexiones
- Tabla de Inventario de 17 columnas con metadatos completos: Rack, U, Lado, Nombre, Marca, Modelo, Tipo, **Tamaño**, IP, MAC, Serie, Usuario, Contraseña, Consumo (W), Tomas, **Skin**, **Notas**, Acciones.
- Edición inline interactiva por doble clic (`finishCellEdit()`) que persiste cambios numéricos de tamaño, skin y notas directamente al store.
- Botones: Agregar equipo, Colocación rápida (con buscador reactivo `#qp-dev-search`), Nueva conexión.
- Menú de exportación con soporte a PNG 1:1 Retina (`html2canvas.min.js`), CSV estructurado y Excel (`xlsx.full.min.js`).
- Botón expandir/contraer.

**Ver:** `doc/doc_img/doc_svg/layout_bottom_panel.svg`

---

## 8. El Topology View (Canvas 2D)

La vista de topología es un **lienzo HTML5 Canvas** dividido en 5 módulos:

| Archivo | Responsabilidad |
|---|---|
| `TopologyState.js` | Variables de estado del canvas (hover, dragging, posiciones) |
| `TopologyLayout.js` | Algoritmo de distribución automática |
| `TopologyRenderer.js` | Dibujado Canvas 2D (nodos, enlaces, partículas) |
| `TopologyEvents.js` | Interacciones (drag, zoom, pan, dblclick, resize) |
| `TopologyOrchestrator.js` | Lifecycle (init, start, stop) + export PNG |

### Colores oficiales del canvas

| Elemento | Color | Código |
|---|---|---|
| Fondo | Azul | `#2255aa` |
| Grid puntos | Blanco 13% opacity | `#ffffff22` |
| Salas | Naranja | `#f97316` |
| Bordes sala activa | Blanco 4px | `#ffffff` |
| Bordes sala inactiva | Naranja oscuro 3px | `#c2410c` |
| Racks | Verde | `#65a30d` |
| Nodos (card/circle) | Navaja oscuro | `#0f172a` |
| Borde nodo | Color del tipo | `TYPE_COLORS[dev.type]` |
| Conexiones | Color del cable | `conn.color` |
| Partículas | Blanco + glow | `#ffffff` + shadow |

### Estilos de nodos

La variable `window.TOPOLOGY_STYLE` controla el estilo de renderizado:

- **`'card'`** (por defecto): Rectángulos de 150×50 px con icono, nombre e IP
- **`'circle'`**: Círculos de radio 22 px con icono centrado, nombre arriba, IP con badge

El botón `#btn-topo-style` alterna entre ambos estilos.

### Cómo se dibuja

```
drawTopo() se ejecuta 60 veces por segundo (requestAnimationFrame)
    ↓
1. Limpia el canvas (fillRect azul #2255aa)
    ↓
2. Dibuja grid de puntos (40px spacing)
    ↓
3. Aplica transformación zoom + pan (ctx.translate + ctx.scale)
    ↓
4. Dibuja salas (roundRect naranja con resize handle)
    ↓
5. Dibuja racks dentro de salas (roundRect verde con resize handle)
    ↓
6. Dibuja conexiones (curvas Bézier cúbicas con 4 partículas animadas)
    ↓
7. Dibuja nodos de dispositivos (card o circle según TOPOLOGY_STYLE)
    ↓
8. Dibuja HUD tooltip al hover (nombre, tipo, IP, usuario, contraseña)
    ↓
9. Solicita siguiente frame → loop continuo
```

### Layout automático

El algoritmo en `TopologyLayout.js` organiza:

1. **Salas** horizontalmente con 60px de espacio entre ellas
2. **Racks** horizontalmente dentro de cada sala, con 32px de gap
3. **Equipos** verticalmente apilados dentro de cada rack (espaciado configurable con slider)
4. **Equipos de piso** en grilla debajo de los racks (máx 4 columnas)

El slider `#topo-spacing` controla el espaciado vertical entre nodos (`window.TOPO_SPACING`).

### Persistencia de posiciones

Las posiciones de nodos, racks y salas en la topología se guardan en `store._raw.topology` mediante `saveTopo()`. Al reabrir, `loadTopoState()` restaura las posiciones manuales.

### Interacciones

- **Arrastrar nodo:** Mueve el equipo en el diagrama (confinado dentro de su rack/sala)
- **Arrastrar rack (barra superior):** Mueve todo el rack con sus equipos (confinado en su sala)
- **Arrastrar sala (barra superior):** Mueve la sala completa con todo su contenido
- **Resize handle (esquina inferior-derecha):** Cambia el tamaño de sala/rack (respeta contenido mínimo)
- **Rueda del mouse:** Zoom in/out (0.1x – 3x)
- **Click + arrastrar fondo:** Pan (mover vista)
- **Doble click nodo:** Abre modal de crear cable (`openCableModal`)
- **Doble click cable:** Abre modal de editar cable (`openEditCableModal`)

### Exportación PNG

`exportTopologyToPNG()` en `TopologyOrchestrator.js` crea un canvas offscreen a 2x resolución, renderiza un frame estático sin hover, y descarga como PNG.

**Ver:** `doc/doc_img/doc_svg/layout_topology.svg`

---

## 9. Renderizado de Cableado Físico (SVG)

A diferencia de la topología (Canvas 2D), el cableado físico se resuelve inyectando dinámicamente un lienzo vectorial `<svg id="physical-cables-svg">` posicionado de forma absoluta dentro de `#view-physical-content`.

### Arquitectura de Enrutamiento Segregado en 3 Zonas Libres:

Para erradicar colisiones de cables sobre servidores o periféricos de piso, el motor `drawPhysicalCables()` en `js/ui/rack.js` segrega las trayectorias en 3 zonas exclusivas:

1. **Canastillo Aéreo Superior (Conexiones Inter-Rack):**
   - Los cables que viajan entre gabinetes distintos se elevan hacia la zona aérea por encima de la cabecera del rack más alto (`overheadY = minRackTop - 14px - (index % 7) * 5`).
   - Salida y entrada inteligente por el lateral más cercano al rack de destino, evitando cruzar frontalmente los servidores intermedios.
2. **Canaleta Media Segregada (Equipos de Piso ↔ Racks / Piso ↔ Piso):**
   - Los periféricos de piso viajan por la canaleta horizontal intermedia situada entre los racks y la sección de piso (`middleGutterY = maxRackBottom + 18px + (index % 6) * 4`).
   - Ascienden verticalmente por el pasillo lateral de 72px del gabinete de destino. Se eliminó al 100% el cruce sobre las tarjetas de piso.
3. **Organizador Lateral de Gabinete (Conexiones Intra-Rack):**
   - Los enlaces entre switches y servidores alojados en el mismo gabinete se confinan estrictamente al organizador vertical derecho (`gutterX = p1.rightEdgeX + 8px + (index % 5) * 4`), sin salir del perímetro del rack.
4. **Propiedades Geométricas:**
   - Curvaturas ortogonales con radio suave `r = 6px` y arcos cuadráticos Bézier (`Q`).
   - Switch interactivo `#checkbox-toggle-cables` en la barra de herramientas para ocultar/mostrar cables al instante.

**Ver Diagramas:**
- `doc/doc_img/doc_svg/enrutamiento_equipos_piso_y_racks.svg` (Doble canaleta y zonas segregadas)
- `doc/doc_img/doc_svg/propuesta_1_canastillo_aereo.svg` (Canastillo aéreo superior)

---

## 10. Sistema de Autenticación

**Archivo:** `js/auth/roles.js` (expuesto como `window.RackAuth`)

### Roles y permisos

| Rol | Descripción | Permisos |
|---|---|---|
| **Admin** | Acceso completo | Todo + Modo Dios + Cambiar PIN |
| **Editor** | Edición sin PIN | Todo excepto cambiar PIN y Modo Dios |
| **Viewer** | Solo lectura | Solo ver datos, sin editar |

### Permisos detallados

| Permiso | Admin | Editor | Viewer |
|---|---|---|---|
| `toggleGodMode` | ✅ | ❌ | ❌ |
| `editDevices` | ✅ | ✅ | ❌ |
| `addRacks` | ✅ | ✅ | ❌ |
| `deleteRacks` | ✅ | ✅ | ❌ |
| `addConnections` | ✅ | ✅ | ❌ |
| `clearProject` | ✅ | ✅ | ❌ |
| `changeAdminPin` | ✅ | ❌ | ❌ |
| `viewData` | ✅ | ✅ | ✅ |

### Implementación

- **PIN por defecto:** `rack2024` (hash SHA-256: `392bd907...`)
- **Hasheo:** Web Crypto API (`crypto.subtle.digest`) con fallback JS puro (`sha256_fallback`)
- **Sesión:** `sessionStorage` bajo la clave `RACK_SESSION_USER` (se pierde al cerrar pestaña)
- **Integridad y Persistencia F5:** Los administradores tienen un token criptográfico persistido en `sessionStorage` bajo `RACK_SESSION_TOKEN` (`TOKEN_KEY`). Esto garantiza que la sesión sobreviva a recargas de página (F5) en la misma pestaña pero se destruya de inmediato al cerrar la pestaña o el navegador (`SESSION_EXPIRATION = VOLATILE`). Si alguien manipula `RACK_SESSION_USER` manualmente sin coincidir con el token, se fuerza logout de inmediato.
- **Verificar permisos:** `RackAuth.can('editDevices')` retorna boolean

---

## 11. Gestión de Archivos

**Archivo:** `js/ui/fileManager.js`

### File System Access API

- **Abrir:** `showOpenFilePicker()` con filtro `.rack` / `.json`
- **Guardar:** `showSaveFilePicker()` con extensión `.rack`
- **Autoguardado:** Debounce de 3 segundos después del último cambio, solo si hay un `fileHandle` abierto y permisos concedidos

### Fallback

En navegadores que no soportan File System Access API (Firefox, Safari), se usa:
- **Abrir:** `<input type="file">` tradicional
- **Guardar:** `downloadJSON()` que crea un Blob y genera un link de descarga

### Formato de archivo

```json
{
  "version": 1,
  "project": { /* todo el estado de store._raw */ },
  "catalog": [ /* array CATALOG con las 21+ plantillas */ ]
}
```

---

## 12. Flujo de Datos Completo

### Crear un dispositivo (Drag & Drop)

```
1. Usuario arrastra item del catálogo
2. onCatalogDragStart() guarda el template
3. Usuario suelta en un slot del rack
4. onSlotDrop() obtiene el template
5. store.addDeviceToRack() es llamado
6. snapshot() guarda estado para undo
7. Se crea el objeto device con uid()
8. Se valida colisiones en el slot/lado
9. Se hace push a this._raw.devices
10. this._save() guarda en localStorage
11. this._emit('change', { source: 'addDeviceToRack' })
12. renderAll() redibuja:
    - renderStats() → estadísticas se actualizan
    - renderOutliner() → árbol se actualiza
    - renderPhysical() → nuevo faceplate aparece
    - renderBottomPanel() → tabla se actualiza
13. fileManager.autoSave() → si hay archivo abierto (3s debounce)
```

### renderAll Source Dispatch

La función `renderAll()` en `main.js` usa el string `source` del evento para decidir qué vistas redibujar:

| Valor de `source` | Vistas que se redibujan |
|---|---|
| `""` (vacío), `loadData`, `undo`, `redo` | **TODAS** las vistas (redibujado completo) |
| Contiene `Room`, o es `room-rename` / `changeRoom` | Room tabs, rack selector, stats, vista física, topología |
| Contiene `Rack` | Rack selector, stats, outliner, vista física |
| Contiene `Device`, `addFloorDevice`, `moveDevice`, `deleteDevice`, `updateDevice`, `addDeviceToRack` | Stats, outliner, vista física, panel inferior |
| Contiene `Connection` | Stats, outliner, panel inferior |
| Contiene `Zoom` o `Pan` | Solo actualiza la etiqueta de zoom |

### Guardar / Cargar proyecto

```
Guardar:
1. fileManager.saveProject() / saveProjectAs()
2. Verifica File System API disponible
3. Si SÍ: writeToFile(handle) → JSON.stringify → writable.write()
4. Si NO: downloadFallback() → crea blob → descarga

Cargar:
1. fileManager.openProject()
2. Si SÍ API: showOpenFilePicker() → getFile() → text()
3. Si NO: <input type="file"> → FileReader
4. loadDataFromString(text) → JSON.parse
5. store.loadData(data.project) → sobreescribe estado
6. Undo/redo se limpian
7. renderAll() → redibuja todo
```

---

## 13. Cómo recrear desde cero

Si quieres construir algo similar paso a paso:

### Paso 1: Crear la estructura básica

```bash
mkdir rack-designer && cd rack-designer
touch index.html css/style.css js/store.js js/main.js
```

### Paso 2: Definir el layout CSS (variables + grid)

### Paso 3: Crear el store reactivo (Proxy ES6 + localStorage + Undo/Redo)

### Paso 4: Crear el orquestador (main.js con renderAll + source dispatch)

### Paso 5: Crear los componentes UI
- `catalog.js` → Lista de dispositivos arrastrables con flyout
- `rack.js` → Renderizado de racks con drag & drop + cables SVG
- `faceplates.js` → HTML de cada tipo de dispositivo
- `tables.js` → Tabla de inventario con edición inline
- `outliner.js` → Árbol jerárquico
- `inspector.js` → Panel de propiedades

### Paso 6: Crear los modales (Device, Rack, Cable, Room, Placement, Export)

### Paso 7: Agregar Canvas 2D (Topología con MVC)

### Paso 8: Agregar autenticación (RBAC con SHA-256 + sessionStorage)

### Paso 9: Agregar gestión de archivos (File System Access API + fallback)

### Paso 10: Agregar PWA (`service-worker.js` + `manifest.json`)

---

## 14. Diagramas SVG del Proyecto

Todos los diagramas están en `doc/doc_img/doc_svg/` (33 archivos):

### Diagramas de Layout

| Archivo | Dimensiones | Contenido |
|---|---|---|
| `layout_header.svg` | 1100×140 | Layout detallado del header |
| `layout_sidebar.svg` | 360×780 | Sidebar con catálogo de equipos |
| `layout_main_canvas.svg` | 720×580 | Área principal con racks |
| `layout_right_panel.svg` | 340×680 | Panel derecho (outliner/inspector/stats) |
| `layout_bottom_panel.svg` | 1100×360 | Panel inferior con tabla |
| `layout_topology.svg` | 1400×700 | Vista de topología (Canvas 2D) |
| `ui_layout_map.svg` | — | Mapa completo del layout UI |

### Diagramas de Arquitectura

| Archivo | Contenido |
|---|---|
| `architecture_overview.svg` | Arquitectura completa del proyecto (2400×2800) |
| `architecture_current.svg` | Arquitectura actual con flujos reactivos, RBAC y fallbacks |
| `project_flow.svg` | Flujo de datos completo (2000×2600) |
| `file_communication_flow.svg` | Comunicación y llamadas inter-módulo |
| `store_reactivity.svg` | Detalle del patrón reactivo del Store |
| `module_dependencies.svg` | Dependencias entre módulos JS |
| `dependencies_map.svg` | Mapa de dependencias completo |

### Diagramas de Funcionalidades

| Archivo | Contenido |
|---|---|
| `drag_drop_flow.svg` | Flujo de drag & drop |
| `topology_engine.svg` | Motor de topología Canvas 2D |
| `modals_accordions.svg` | Sistema de modales con acordeones |
| `roles_permissions.svg` | Matriz de roles y permisos |
| `security_rbac_crypto.svg` | Seguridad: RBAC + SHA-256 |
| `file_manager_api.svg` | File System Access API |
| `autosave_history.svg` | Autoguardado e historial |
| `export_system.svg` | Sistema de exportación |
| `pwa_service_worker.svg` | Service Worker y PWA |
| `theme_switcher.svg` | Sistema de temas claro/oscuro |
| `hybrid_network_ports.svg` | Puertos de red híbridos |

### Diagramas del Manual de Usuario

| Archivo | Contenido |
|---|---|
| `manual_rack_anatomy.svg` | Anatomía de un rack |
| `manual_ui_overview.svg` | Mapa de la interfaz para usuarios |
| `manual_action_flow.svg` | Flujo de acciones comunes |

### Diagramas de Mejoras

| Archivo | Contenido |
|---|---|
| `mejoras_architecture_final.svg` | Arquitectura final propuesta |
| `mejoras_device_skins_fallback.svg` | Sistema de skins con fallback |

### Cableado Físico y Vistas

| Archivo | Contenido |
|---|---|
| `enrutamiento_equipos_piso_y_racks.svg` | Arquitectura de doble canaleta (Aérea vs Piso) |
| `propuesta_1_canastillo_aereo.svg` | Canastillo superior aéreo inter-rack |
| `propuesta_2_fila_continua_nowrap.svg` | Disposición en fila continua de racks |
| `propuesta_3_cables_interactivos_hover.svg` | Modo interactivo Smart Focus |

### Otros

| Archivo | Contenido |
|---|---|
| `directory_structure.svg` | Estructura de directorios |
| `project_areas.svg` | Áreas del proyecto |
| `user_personas.svg` | Perfiles de usuario |

---

## 15. Roadmap de Mejoras

El documento `mejoras.md` en la raíz del proyecto es el **Source of Truth** para todas las mejoras planificadas. Contiene un análisis detallado de:

- Problemas críticos de seguridad e integridad
- Límites de rendimiento y escalabilidad
- Robustez y ciclo de vida PWA
- Deuda técnica y calidad
- Problemas de UX y consistencia
- Fases del roadmap de implementación (1–5)
- Mejoras específicas planificadas para la topología (separación de etiquetas, layout de árbol genealógico)

---

## Resumen Final

El proyecto RACK Designer Next es una app web vanilla que:

1. **No necesita build step** → Solo abre index.html
2. **Usa Proxy ES6** para estado reactivo (como Redux pero nativo, con cache WeakMap)
3. **Guarda todo en localStorage** (sin backend) + autoguardado en disco con File System Access API
4. **Tiene 5 áreas fijas** en CSS Grid (header, sidebar flyout, main, right, bottom)
5. **Canvas 2D** para la vista de topología (2 estilos: card/circle)
6. **SVG inline** para cables en la vista física
7. **Drag & drop** nativo para colocar equipos
8. **3 roles** (Admin, Editor, Viewer) con SHA-256 + token de integridad
9. **Exporta** a PNG 1:1 Retina (`html2canvas.min.js`), CSV estructurado, Excel y JSON (.rack)
10. **PWA** con Service Worker (`v12`) para uso offline
11. **Suite de Integridad Automatizada** con 83 pruebas pasando al 100% (`tests/integrity_check.cjs`)

**La regla más importante:** Nunca mutar el DOM directamente. Siempre actualizar el `store` y dejar que `renderAll()` se encargue de redibujar.
