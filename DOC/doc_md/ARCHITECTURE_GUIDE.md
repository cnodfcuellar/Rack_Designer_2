# RACK Designer Next — Guia Tecnica Completa

> Explicacion tecnica para recrear el proyecto desde cero, con diagramas y conceptos explicados paso a paso.

---

## Tabla de Contenidos

1. [Que es este proyecto?](#1-que-es-este-proyecto)
2. [Stack Tecnologico (que usamos y por que)](#2-stack-tecnologico)
3. [Arquitectura General](#3-arquitectura-general)
4. [El Patron Reactivo (Proxy ES6)](#4-el-patron-reactivo)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [El Layout de la Interfaz (CSS Grid)](#6-el-layout-de-la-interfaz)
7. [Cada Area de la UI explicada](#7-cada-area-de-la-ui)
8. [El Topology View (Canvas 2D)](#8-el-topology-view)
9. [Flujo de Datos Completo](#9-flujo-de-datos-completo)
10. [Como recrear desde cero](#10-como-recrear-desde-cero)
11. [Diagramas SVG del Proyecto](#11-diagramas-svg)

---

## 1. Que es este proyecto?

**RACK Designer Next** es una aplicacion web que sirve para disenar y administrar centros de datos. Permite:

- Crear **salas** (rooms) que representan habitaciones de un data center
- Crear **gabinetes** (racks) dentro de esas salas
- Colocar **equipos** (servidores, switches, routers, firewalls, UPS, etc.) dentro de los gabinetes
- Conectar los equipos entre si con **cables** (cobre, fibra optica)
- Ver todo en dos vistas: **Vista Fisica** (como se ve el rack) y **Vista Topologia** (diagrama de red)
- Exportar a **PNG, CSV, Excel** y guardar/cargar proyectos

**Lo mas importante:** Es una PWA (Progressive Web App) que funciona sin servidor backend. Todos los datos se guardan en el navegador del usuario (localStorage).

### Ejecutar el proyecto

```
# Opcion 1: Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"

# Opcion 2: Cualquier servidor estatico
npx serve .
python -m http.server 8000
```

**No necesitas** `npm start`, `webpack`, `vite` ni nada para compilar. Solo abre el `index.html`.

---

## 2. Stack Tecnologico

### Que usamos

| Tecnologia | Para que sirve | Por que la elegimos |
|---|---|---|
| **JavaScript ES6+** | Toda la logica | Sin frameworks, vanilla puro |
| **HTML5** | Estructura de la app | Semanticos, modals, canvas |
| **CSS3** | Estilos y layout | Grid, Flexbox, variables CSS |
| **Canvas 2D** | Vista de topologia | Animaciones y dibujo de red |
| **Proxy ES6** | Estado reactivo | Reemplaza a Redux/useState |
| **localStorage** | Guardar datos | Persistencia sin servidor |
| **sessionStorage** | Sesiones de auth | Se borra al cerrar pestana |
| **SHA-256** | Hasheo de PIN | Seguridad basica de admin |
| **File System API** | Abrir/guardar archivos | Sin necesidad de upload |
| **SheetJS** | Exportar a Excel | Unica dependencia npm |

### Que NO usamos (y por que)

| No usamos | Por que |
|---|---|
| React/Vue/Angular | El proyecto es vanilla, sin build step |
| Webpack/Vite | No hay paso de compilacion |
| TypeScript | Vanilla JS puro |
| Backend/API | Todo es local en el navegador |
| Base de datos | localStorage es suficiente |
| npm (solo pnpm) | Para instalar `marked` (script de build) |

### Diagrama de tecnologias

Ver: `doc/doc_img/doc_svg/architecture_overview.svg` (seccion Tech Stack)

---

## 3. Arquitectura General

El proyecto sigue un patron que se llama **"Reactive Proxy Pattern"**. Esto significa que:

1. **Toda la informacion vive en un solo lugar** (el `store`)
2. **Cuando algo cambia**, el Proxy lo detecta automaticamente
3. **Se guarda** en el navegador (localStorage)
4. **Se notifica** a la interfaz que hay datos nuevos
5. **La interfaz se redibuja** con los datos actualizados

```
USUARIO hace algo
    ↓
EVENT HANDLER ejecuta una funcion
    ↓
STORE METHOD modifica los datos
    ↓
PROXY TRAP detecta el cambio
    ↓
_save() guarda en localStorage
    ↓
_emit('change') notifica a todos
    ↓
renderAll() redibuja la interfaz
```

**Ver diagrama completo:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 2)

### Por que es importante esto?

Porque si intentas modificar el HTML directamente (por ejemplo, `document.getElementById('algo').innerHTML = '...'`), el proyecto se rompe. **Siempre** debes modificar el `store` y dejar que la interfaz se actualice sola.

---

## 4. El Patron Reactivo

### Como funciona el Proxy ES6

```javascript
// El store crea un Proxy sobre el estado
this._raw = { rooms: [], racks: [], devices: [], ... };
this.state = this._makeProxy(this._raw);

// Cuando haces algo como:
store.state.rooms.push({ id: '1', name: 'Sala A' });

// El Proxy detecta:
// 1. Que rooms cambio
// 2. Llama a _save() → guarda en localStorage
// 3. Llama a _emit('change') → notifica a main.js
// 4. main.js llama a renderAll() → redibuja la UI
```

### El flujo en codigo

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
Proxy detecta el push → _save() + _emit('change')
    ↓
renderAll({ source: 'addDeviceToRack' })
    ↓
renderPhysical() → dibuja el nuevo equipo en el rack
renderStats() → actualiza las estadisticas
renderOutliner() → actualiza el arbol
renderBottomPanel() → actualiza la tabla
```

**Ver diagrama:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 3a)

### Undo/Redo

Cada vez que mutas el store, `snapshot()` guarda una copia del estado anterior (maximo 30). Cuando el usuario presiona Ctrl+Z:

1. Se toma el estado actual y se guarda en `_redoStack`
2. Se saca el estado anterior de `_undoStack`
3. Se sobreescribe `_raw` con ese estado
4. Se redibuja todo

**Ver diagrama:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 4)

---

## 5. Estructura de Archivos

### Arbol del proyecto

```
Rack_Designer_next/
├── index.html                    ← Archivo principal (HTML + modals)
├── service-worker.js             ← PWA offline
├── json/manifest.json            ← PWA manifest
│
├── css/
│   ├── style.css                 ← Importa todos los CSS
│   ├── variables.css             ← Variables CSS (colores, fuentes, tamanos)
│   ├── layout.css                ← Grid layout, header, sidebar, panels
│   └── components/
│       ├── panels.css            ← Bottom panel, tablas, badges
│       ├── rack.css              ← Tarjetas de rack, flip 3D
│       ├── faceplates.css        ← Faceplates de dispositivos, LEDs
│       ├── modals.css            ← Modales, formularios, acordeon
│       └── misc.css              ← Iconos SVG, tooltips, drag ghost
│
├── js/
│   ├── store.js                  ← ESTADO CENTRAL (Proxy ES6)
│   ├── main.js                   ← Orquestador (init, eventos, renderAll)
│   ├── utils.js                  ← Funciones auxiliares
│   ├── icons.js                  ← SVG inline de todos los dispositivos
│   ├── demoData.js               ← Carga datos de ejemplo
│   │
│   ├── auth/
│   │   └── roles.js              ← RBAC (Admin/Editor/Viewer)
│   │
│   ├── ui/
│   │   ├── catalog.js            ← Catalogo de dispositivos + filtros
│   │   ├── rack.js               ← Renderizado fisico de racks
│   │   ├── faceplates.js         ← HTML de faceplates por tipo
│   │   ├── tables.js             ← Tabla de inventario/conexiones
│   │   ├── outliner.js           ← Arbol jerarquico (sala→rack→equipo)
│   │   ├── inspector.js          ← Panel de propiedades
│   │   ├── fileManager.js        ← Abrir/guardar archivos (.rack)
│   │   ├── modals.js             ← Orquestador de modales
│   │   │
│   │   ├── modals/
│   │   │   ├── Globals.js        ← Variables globales de modales
│   │   │   ├── RackModal.js      ← Modal de crear/editar rack
│   │   │   ├── DeviceModal.js    ← Modal de crear/editar equipo
│   │   │   ├── CableModal.js     ← Modal de crear/editar cable
│   │   │   ├── RoomModal.js      ← Modal de crear sala
│   │   │   ├── ExportModal.js    ← Modal de exportar PNG/CSV/Excel
│   │   │   └── PlacementModal.js ← Modal de colocacion asistida
│   │   │
│   │   └── topology/
│   │       ├── TopologyState.js      ← Estado del canvas
│   │       ├── TopologyLayout.js     ← Algoritmo de layout automatico
│   │       ├── TopologyRenderer.js   ← Dibujado Canvas 2D
│   │       ├── TopologyEvents.js     ← Interacciones del canvas
│   │       └── TopologyOrchestrator.js ← Lifecycle del canvas
│   │
│   ├── xlsx.full.min.js          ← SheetJS (exportar Excel)
│   ├── mobile-drag-drop.min.js   ← Polyfill touch drag
│   └── mobile-drag-drop-scroll.min.js
│
├── assets/icons/                 ← Iconos SVG por tipo de equipo
├── doc/                          ← Documentacion
├── .agents/                      ← Perfiles de agentes IA
└── .py/                          ← Scripts Python utilitarios
```

**Ver diagrama:** `doc/doc_img/doc_svg/architecture_overview.svg` (File Structure)

### Orden de carga de CSS

```
variables.css → layout.css → panels.css → rack.css → faceplates.css → modals.css → misc.css
```

Este orden es **importante** porque CSS se resuelve en cascada. Si `misc.css` define algo que `layout.css` tambien define, gana `misc.css` (se carga despues).

### Scripts en index.html

Todos los `<script>` van al final del `<body>`, en orden:
1. Vendor: `xlsx.full.min.js`, `mobile-drag-drop.min.js`
2. Core: `store.js`, `utils.js`, `icons.js`, `demoData.js`
3. Auth: `auth/roles.js`
4. UI: `ui/catalog.js`, `ui/tables.js`, `ui/outliner.js`, `ui/inspector.js`
5. Modals: todos los archivos en `ui/modals/`
6. Topology: todos los archivos en `ui/topology/`
7. Orchestration: `ui/modals.js`, `ui/fileManager.js`
8. Init: `main.js` (ultimo, porque depende de todo lo demas)

---

## 6. El Layout de la Interfaz (CSS Grid)

La app usa **CSS Grid** para dividir la pantalla en 5 areas fijas:

```
┌─────────────────────────────────────────────────────┐
│                    HEADER (56px)                     │
├──────────┬──────────────────────┬────────────────────┤
│          │                      │                    │
│ SIDEBAR  │       MAIN CANVAS    │    RIGHT PANEL     │
│ (280px)  │        (1fr)         │     (260px)        │
│          │                      │                    │
├──────────┴──────────────────────┴────────────────────┤
│                  BOTTOM PANEL (220px)                 │
└─────────────────────────────────────────────────────┘
```

### CSS que define esto

```css
#app {
  display: grid;
  grid-template-rows: 56px 1fr 220px;
  grid-template-columns: 280px 1fr 260px;
  grid-template-areas:
    "header  header        header"
    "sidebar main          right-panel"
    "bottom  bottom        bottom";
  height: 100vh;
  overflow: hidden;
}
```

### Variables CSS importantes

```css
:root {
  /* Dimensiones */
  --sidebar-w: 280px;
  --right-panel-w: 260px;
  --header-h: 56px;
  --bottom-h: 220px;
  --rack-unit-h: 24px;    /* 1U = 24px */

  /* Colores oscuros */
  --bg-main: #0b0f19;     /* Fondo principal */
  --bg-card: #151c2e;     /* Tarjetas */
  --border: #25304b;      /* Bordes */
  --accent: #0ea5e9;      /* Color de acento (cian) */

  /* Fuentes */
  --font-ui: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

**Ver diagrama:** `doc/doc_img/doc_svg/layout_header.svg`, `layout_sidebar.svg`, etc.

---

## 7. Cada Area de la UI explicada

### Header (56px)

**Archivo:** `index.html` (seccion `#header`), estilos en `css/layout.css`

Contiene:
- Logo + nombre del proyecto
- Menu del proyecto (abrir, guardar, tema, demo)
- Dropdown de salas (selector de habitacion)
- Dropdown de racks
- Tabs de vista (Fisica / Topologia)
- Buscador global
- Botones Undo/Redo
- Badge de usuario (rol)

**Ver:** `doc/doc_img/doc_svg/layout_header.svg`

### Sidebar (280px)

**Archivo:** `index.html` (seccion `#sidebar`), renderizado por `js/ui/catalog.js`

Contiene:
- Botones "+ Rack" y "+ Equipo"
- Buscador del catalogo
- Filtros por categoria (Todos, Servidor, Red, Storage, Cableado, Energia, Accesorios, Piso)
- Lista de dispositivos del catalogo (21 plantillas predefinidas)
- Cada item es arrastrable al rack (drag & drop)

**Ver:** `doc/doc_img/doc_svg/layout_sidebar.svg`

### Main Canvas (1fr)

**Archivo:** `index.html` (seccion `#main`), renderizado por `js/ui/rack.js`

Contiene dos vistas:
- **Vista Fisica:** Tarjetas de rack con faceplates de dispositivos, vista frontal/trasera (flip 3D), dispositivos de piso
- **Vista Topologia:** Canvas 2D con diagrama de red animado

**Ver:** `doc/doc_img/doc_svg/layout_main_canvas.svg`

### Right Panel (260px)

**Archivo:** `index.html` (seccion `#right-panel`)

Tres secciones:
1. **Outliner:** Arbol jerarquico (Sala → Rack → Equipo)
2. **Propiedades (Inspector):** Detalles del elemento seleccionado
3. **Estadisticas:** Metricas globales (salas, racks, equipos, conexiones)

**Ver:** `doc/doc_img/doc_svg/layout_right_panel.svg`

### Bottom Panel (220px)

**Archivo:** `index.html` (seccion `#bottom`), renderizado por `js/ui/tables.js`

Contiene:
- Tabs: Inventario / Conexiones
- Tabla con todas las propiedades de los dispositivos
- Edicion inline de celdas (IP, MAC, nombre, etc.)
- Exportar a CSV/Excel
- Boton expandir/contraer

**Ver:** `doc/doc_img/doc_svg/layout_bottom_panel.svg`

---

## 8. El Topology View (Canvas 2D)

La vista de topologia es un **lienzon HTML5 Canvas** que dibuja:

### Colores oficiales del canvas

| Elemento | Color | Codigo |
|---|---|---|
| Fondo | Azul | `#2255aa` |
| Grid puntos | Blanco 13% opacity | `#ffffff22` |
| Salas | Naranja | `#f97316` |
| Bordes sala activa | Blanco 4px | `#ffffff` |
| Bordes sala inactiva | Naranja oscuro 3px | `#c2410c` |
| Racks | Verde | `#65a30d` |
| Nodos (card) | Navaja oscuro | `#0f172a` |
| Borde nodo | Color del tipo | `TYPE_COLORS[dev.type]` |
| Conexiones | Color del cable | `conn.color` |
| Particulas | Blanco + glow | `#ffffff` + shadow |

### Como se dibuja

```
drawTopo() se ejecuta 60 veces por segundo
    ↓
1. Limpia el canvas (fillRect azul)
    ↓
2. Dibuja grid de puntos (40px spacing)
    ↓
3. Dibuja salas (roundRect naranja)
    ↓
4. Dibuja racks dentro de salas (roundRect verde)
    ↓
5. Dibuja conexiones (curvas Bezier cubicas)
    ↓
6. Dibuja particulas animadas (4 por cable)
    ↓
7. Dibuja nodos de dispositivos (card o circle)
    ↓
8. Dibuja HUD de hover (tooltip)
```

### Layout automatico

El algoritmo en `TopologyLayout.js` organiza:

1. **Salas** horizontalmente con 60px de espacio entre ellas
2. **Racks** horizontalmente dentro de cada sala
3. **Equipos** verticalmente apilados dentro de cada rack
4. **Equipos de piso** en grilla debajo de los racks (max 4 columnas)

### Interacciones

- **Arrastrar nodo:** Mueve el equipo en el diagrama
- **Arrastrar rack:** Mueve todo el rack con sus equipos
- **Arrastrar sala:** Mueve la sala completa
- **Resize handle:** Cambia el tamanio de sala/rack
- **Rueda del mouse:** Zoom in/out
- **Click medio + arrastrar:** Pan (mover vista)
- **Doble click nodo:** Abre modal de crear cable
- **Doble click cable:** Abre modal de editar cable

**Ver:** `doc/doc_img/doc_svg/layout_topology.svg`

---

## 9. Flujo de Datos Completo

### Crear un dispositivo (Drag & Drop)

```
1. Usuario arrastra item del catalogo
2. onCatalogDragStart() guarda el template
3. Usuario suelta en un slot del rack
4. onSlotDrop() obtiene el template
5. store.addDeviceToRack() es llamado
6. snapshot() guarda estado para undo
7. Se crea el objeto device con uid()
8. Se hace push a this._raw.devices
9. Proxy detecta el push
10. _save() guarda en localStorage
11. _emit('change', { source: 'addDeviceToRack' })
12. renderAll() redibuja:
    - renderPhysical() → nuevo faceplate aparece
    - renderStats() → estadisticas se actualizan
    - renderOutliner() → arbol se actualiza
    - renderBottomPanel() → tabla se actualiza
```

**Ver:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 3a)

### Crear una conexion (cable)

```
1. Click derecho en equipo → "Agregar Cable"
2. Se abre CableModal
3. Usuario selecciona: origen, destino, puertos, tipo, color
4. Click en "Conectar"
5. store.addConnection() es llamado
6. Se crea el objeto connection
7. Proxy → _save() → _emit('change')
8. renderPhysical() → puertos iluminados en faceplate
9. Si esta en Topologia: drawTopo() dibuja curva Bezier
```

**Ver:** `doc/doc_img/doc_svg/project_flow.svg` (Flow 3b)

### Guardar proyecto

```
1. usuario click "Guardar"
2. fileManager.saveProject()
3. Verifica si File System API esta disponible
4. Si SI: showSaveFilePicker() → writeToFile()
5. Si NO: downloadJSON() → crea blob → descarga
6. Formato: { version: 1, project: store._raw, catalog: CATALOG }
7. Extension: .rack (es JSON)
```

### Cargar proyecto

```
1. usuario click "Abrir"
2. fileManager.openProject()
3. Verifica File System API
4. Si SI: showOpenFilePicker() → getFile()
5. Si NO: click en input file → FileReader
6. JSON.parse(text) → extrae project y catalog
7. store.loadData(data.project) → sobreescribe estado
8. C undo/redo se limpian
9. renderAll() → redibuja todo
```

---

## 10. Como recrear desde cero

Si quieres construir algo similar paso a paso, aqui tienes el orden:

### Paso 1: Crear la estructura basica

```bash
mkdir rack-designer
cd rack-designer
touch index.html css/style.css js/store.js js/main.js
```

### Paso 2: Definir el layout CSS

Crea `css/variables.css` con las variables CSS basics:

```css
:root {
  --sidebar-w: 280px;
  --right-panel-w: 260px;
  --header-h: 56px;
  --bottom-h: 220px;
  --bg-main: #0b0f19;
  --bg-card: #151c2e;
  --border: #25304b;
  --accent: #0ea5e9;
  --font-ui: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Crea `css/layout.css` con el Grid:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font-ui); background: var(--bg-main); color: #e2e8f0; }

#app {
  display: grid;
  grid-template-rows: var(--header-h) 1fr var(--bottom-h);
  grid-template-columns: var(--sidebar-w) 1fr var(--right-panel-w);
  grid-template-areas:
    "header  header        header"
    "sidebar main          right-panel"
    "bottom  bottom        bottom";
  height: 100vh;
}
```

### Paso 3: Crear el store reactivo

El corazon del proyecto. Crea `js/store.js`:

```javascript
class Store {
  constructor() {
    this._listeners = {};
    this._undoStack = [];
    this._redoStack = [];
    this._raw = this._load();
    this.state = this._makeProxy(this._raw);
  }

  _makeProxy(obj) {
    const store = this;
    return new Proxy(obj, {
      set(target, key, value) {
        target[key] = value;
        store._save();
        store._emit('change', { key, value });
        return true;
      }
    });
  }

  _load() {
    const saved = localStorage.getItem('RACK_DESIGNER_NEXT_STATE');
    if (saved) return JSON.parse(saved);
    return {
      rooms: [{ id: '1', name: 'Data Center' }],
      racks: [],
      devices: [],
      connections: [],
      currentRoomId: '1'
    };
  }

  _save() {
    localStorage.setItem('RACK_DESIGNER_NEXT_STATE', JSON.stringify(this._raw));
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  }

  snapshot() {
    this._undoStack.push(JSON.parse(JSON.stringify(this._raw)));
    if (this._undoStack.length > 30) this._undoStack.shift();
    this._redoStack = [];
  }

  // ... mas metodos (addRoom, addRack, addDevice, etc.)
}

window.store = new Store();
```

### Paso 4: Crear el orquestador

Crea `js/main.js`:

```javascript
function renderAll() {
  renderRoomTabs();
  renderRackSelector();
  renderStats();
  renderPhysical();
  renderOutliner();
  renderBottomPanel();
}

// Cuando el store cambia, redibujar todo
store.on('change', renderAll);

// Render inicial
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
});
```

### Paso 5: Crear los componentes UI

Crea archivos en `js/ui/`:
- `catalog.js` → Lista de dispositivos arrastrables
- `rack.js` → Renderizado de racks con drag & drop
- `faceplates.js` → HTML de cada tipo de dispositivo
- `tables.js` → Tabla de inventario
- `outliner.js` → Arbol jerarquico
- `inspector.js` → Panel de propiedades

### Paso 6: Crear los modales

Crea archivos en `js/ui/modals/`:
- `RackModal.js` → Crear/editar rack
- `DeviceModal.js` → Crear/editar equipo
- `CableModal.js` → Crear/editar cable
- `RoomModal.js` → Crear sala

### Paso 7: Agregar Canvas 2D (Topologia)

Crea `js/ui/topology/`:
- `TopologyState.js` → Estado del canvas
- `TopologyRenderer.js` → Dibujado con Canvas 2D
- `TopologyEvents.js` → Mouse events (drag, zoom, pan)
- `TopologyLayout.js` → Layout automatico
- `TopologyOrchestrator.js` → Lifecycle

### Paso 8: Agregar autenticacion

Crea `js/auth/roles.js` con SHA-256 y sessionStorage.

### Paso 9: Agregar PWA

Crea `service-worker.js` para cache offline y `json/manifest.json`.

---

## 11. Diagramas SVG del Proyecto

Todos los diagramas estan en `doc/doc_img/doc_svg/`:

| Archivo | Descripcion |
|---|---|
| `layout_header.svg` | Layout detallado del header (1100x140) |
| `layout_sidebar.svg` | Layout detallado del sidebar con catalogo (360x780) |
| `layout_main_canvas.svg` | Layout del area principal con racks (720x580) |
| `layout_right_panel.svg` | Layout del panel derecho (340x680) |
| `layout_bottom_panel.svg` | Layout del panel inferior con tabla (1100x360) |
| `layout_topology.svg` | Vista de topologia con salas, racks, conexiones (1400x700) |
| `architecture_overview.svg` | Arquitectura completa del proyecto (2400x2800) |
| `architecture_current.svg` | Diagrama de la arquitectura actual (1200x1650) con flujos reactivos, seguridad RBAC y fallbacks offline |
| `file_communication_flow.svg` | Diagrama de comunicación y llamadas inter-módulo (1400x1250) |
| `project_flow.svg` | Flujo de datos completo (2000x2600) |

---

## Resumen Final

El proyecto RACK Designer Next es una app web vanilla que:

1. **No necesita build step** → Solo abre index.html
2. **Usa Proxy ES6** para estado reactivo (como Redux pero nativo)
3. **Guarda todo en localStorage** (sin backend)
4. **Tiene 5 areas fijas** en CSS Grid (header, sidebar, main, right, bottom)
5. **Canvas 2D** para la vista de topologia
6. **Drag & drop** nativo para colocar equipos
7. **3 roles** (Admin, Editor, Viewer) con SHA-256
8. **Exporta** a PNG, CSV, Excel y JSON

**La regla mas importante:** Nunca mutar el DOM directamente. Siempre actualizar el `store` y dejar que `renderAll()` se encargue de redibujar.

---
## 9. Renderizado de Cableado Físico
A diferencia de la topología (Canvas), el cableado físico 2D se resuelve inyectando dinámicamente un lienzo <svg> (#physical-cables-svg) sobre #view-physical-content.
*   Los componentes de aceplates.js inyectan anclajes data-device-id y data-port al DOM.
*   drawPhysicalCables() (en 
ack.js) procesa las conexiones y traza trayectorias ortogonales bordeando las tarjetas de rack de manera reactiva.
