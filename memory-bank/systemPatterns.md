# System Patterns

## Architecture: Reactive Proxy Pattern
The application emulates a modern React/Redux reactive architecture using native ES6 `Proxy`:
1. **User Action:** UI event handler is triggered.
2. **Store Mutator:** Handler calls a method on `store` (e.g., `store.addDeviceToRack()`).
3. **Snapshot:** The store calls `snapshot()` to deepClone state for Undo/Redo tracking.
4. **Proxy Interception:** Mutation on `this._raw` is intercepted by the Proxy `set` trap.
5. **Persistence & Emission:** The Proxy automatically saves to `localStorage` and emits a `'change'` event.
6. **Re-render:** `main.js` catches the `'change'` event and selectively triggers `renderAll({ source })`.

## Component Relationships
- `js/store.js`: The absolute source of truth. Handles state, persistence, and events.
- `js/main.js`: Orchestrator. Binds global events and triggers layout re-renders.
- `js/ui/`: View layer modules. Must never mutate data directly. Only read from `store.state` and render to DOM.
- `js/ui/topology/`: Specialized Canvas 2D engine operating as an MVC subset:
  - `TopologySkins.js`: Gestión desacoplada de los 3 modos canónicos (`circle`, `card`, `image`), dimensiones adaptativas (`getNodeDimensions`), presets de hardware fotorrealistas (`HARDWARE_PRESETS`) y hit-testing matemático unificado (`isPointInNode`).
  - `TopologyState.js`: Estado reactivo en memoria (zoom, pan, layoutMode, nodeLabelPos, ipLabelPos, spacing, spacingX).
  - `TopologyLayout.js`: Algoritmos de ordenamiento geométrico. Soporta layout por racks (distribución de nodos en columnas internas con separación horizontal `colGap` y vertical `unitH`, gap fijo de racks `RACK_GAP = 32px`) y layout de árbol jerárquico (`DAG` padre-hijo ortogonal con posicionamiento de nodos desconectados al pie del rack/sala y cabecera de sala desvinculada de racks). Incorpora el algoritmo de afinidad y proximidad por gabinete anfitrión (`_findAffinityRackForFloorDevice`, `M-39`), posicionando equipos de piso en el cuadrante inferior de su rack conectado con línea de base uniforme (`floorBaseY`) y contención de sala reactiva. Recálculo reactivo a 60 FPS mediante `recalcTopoSpacing()` y `recalcTopoSpacingX()`.
  - `TopologyRenderer.js`: Renderizado por Canvas 2D con badges, glow de selección, conectores Bézier y ortogonales redondeados, partículas de tráfico animadas y posicionamiento granular e independiente de etiquetas (Nombre e IP: arriba, abajo, izquierda, derecha, juntos, separados, ocultos).
  - `TopologyEvents.js`: Captura de gestos táctiles, arrastre de nodos, racks y salas, redimensionamiento interactivo, clics, selección múltiple y persistencia de coordenadas en `store.state`. Restricción de límites perimetrales por radio geométrico horizontal (`rx`) y vertical (`ry`).
  - `TopologyOrchestrator.js`: Coordinación de ciclo de vida del canvas, redibujado y resize.

## Design Patterns
- **No ES Modules in Browser:** Scripts are loaded sequentially in the global scope via `<script>` tags in `index.html`.
- **Modular CSS:** Cascading architecture where later files override earlier ones (`variables.css` -> `layout.css` -> `components.css`).
- **RBAC (Role Based Access Control):** Managed globally via `window.RackAuth`.
- **Criptografía y Persistencia Blindada (`RackCrypto`):** Cifrado simétrico transparente con formato `enc:v1:<iv>:<ciphertext>` en `_save()`, descifrado automático en `_load()` y protección RBAC para Modo Dios (`SHOW_PASSWORDS`) y revelación táctil individual en Inspector.
- **Dual Spacing Sliders (H / V):** Control independiente de granularidad horizontal y vertical sin alterar las relaciones estructurales de los contenedores de salas y racks.
- **Rack Affinity & Proximity (M-39):** Agrupación geométrica de periféricos de piso por gabinete según grafo de conexiones activas, manteniendo aislamiento lateral sin invasión de racks adyacentes y nivelación uniforme a la grilla ortogonal.
- **Topology Slots Memory Engine (M-40):** 5 ranuras independientes en `store.js` (`topologySlots`) con clonado profundo que capturan y restauran coordenadas de nodos, gabinetes, salas, nivel de zoom y encuadre pan sin perturbar la pila de deshacer/rehacer (`_redoStack`).
- **Dual-Channel Cable Routing (M-41):** Segregación física de cableado en `rack.js` según `orientation: 'top' | 'bottom'`, canalizando cables superiores por la bandeja aérea y cables inferiores por el zócalo/piso técnico (`maxRackBottom + 14 + offset`). Conmutación atómica bidireccional (`swapConnectionDirection` y `toggleConnectionOrientation`).
- **Clonado Profundo Optimizado e Historial Acotado (M-03):** Pipeline de clonación multi-tier con `fastClone(obj)` en `utils.js` (4x más veloz que JSON), límite de historial estricto (`store.maxHistory = 15`), snapshots livianos excluyendo `topologySlots` y deduplicación consecutiva O(1) con `_mutatedSinceLastSnapshot`.
- **Redibujado Selectivo y Monitoreo de Rendimiento (M-04):** Despacho reactivo de interfaz en `main.js` mediante coalescencia rAF a 60 FPS, actualización granular de gabinetes individuales con `renderSingleRack(rackId)` sin reconstruir salas completas, seguimiento de estado sucio en vistas inactivas (`window._renderState`) y telemetría en tiempo real (`window.RenderPerformance`).
- **Plantillas Demo Multiesquema:** Carga flexible y desacoplada de arquitecturas de referencia (`loadDemoData('tia942')` y `loadUniversityDemoData()`) mediante selector visual interactivo `#modal-demo-selection` con copia de seguridad previa.
