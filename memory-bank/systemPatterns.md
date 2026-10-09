# System Patterns

## Architecture: Reactive Proxy Pattern
La aplicación emula un flujo unidireccional y reactivo estilo Redux/React utilizando primitivas nativas de ES6 (`Proxy`):

```
ACCION DEL USUARIO (UI Event)
    ↓
METODO DEL STORE (e.g. store.addDeviceToRack())
    ↓
SNAPSHOT RAPIDO (fastClone multi-tier, maxHistory=15, deduplicación)
    ↓
MUTACION DE this._raw (push, Object.assign, splice)
    ↓
PROXY TRAP SET (intercepta cambio y persiste en localStorage)
    ↓
EMISION REACTIVA (store._emit('change', { source, entityInfo }))
    ↓
ORQUESTADOR (main.js rAF coalescing a 60 FPS)
    ↓
REDIBUJADO SELECTIVO (renderSingleRack o renderAll según dirty flags)
```

## Component Relationships & Responsibilities
- **`js/store.js` (Singleton & State Hub):** Única fuente de la verdad. Almacena `this._raw`, expone `this.state` envuelto en un Proxy reactivo, administra las pilas de Undo/Redo acotadas, persiste en `localStorage` con cifrado simétrico y emite eventos con metadatos enriquecidos de entidad.
- **`js/auth/crypto.js` (`RackCrypto`):** Capa de seguridad criptográfica con cifrado simétrico AES-GCM 256-bit bajo prefijo `enc:v1:<iv>:<ciphertext>`. Cifra contraseñas en reposo y descifra de forma transparente en memoria.
- **`js/auth/roles.js` (`RackAuth`):** Matriz de control de acceso basada en roles (Admin, Editor, Viewer) y verificación criptográfica de PIN con digest SHA-256. Controla el acceso a Modo Dios (`SHOW_PASSWORDS`) y acciones destructivas de infraestructura.
- **`js/main.js` (Orchestrator):** Punto de entrada. Enlaza los atajos de teclado globales (Ctrl+Z / Ctrl+Y), sincroniza la cabecera, gestiona los temas globales (Oscuro, Claro, Sepia) y administra la matriz de despacho de renderizado `renderAll({ source })` con agrupación por `requestAnimationFrame`.
- **`js/ui/rack.js` (Alzado Físico de Racks):** Renderizado de gabinetes con animación CSS 3D flip (frontal y trasero), grilla CAD milimétrica (24px = 1U), slots físicos fijos de 240px, redibujado granular de gabinetes individuales con `renderSingleRack(rackId)` y trazado vectorial de cables con enrutamiento bicanal (techo vs. piso técnico).
- **`js/ui/faceplates.js` (Carátulas de Hardware):** Renderizado de biseles de equipos, etiquetas de modelo, matriz interactiva de puertos y LEDs animados por hardware con inyección desde `EMBEDDED_SVG_CACHE`.
- **`js/ui/catalog.js` (Catálogo de Equipos):** Clasificación en 7 familias comerciales estándar, buscador reactivo en tiempo real `#catalog-search` y fuentes de drag & drop.
- **`js/ui/tables.js` (Inventario y Cableado):** Tablas de datos en panel inferior, edición en celda con doble clic, selector interactivo de columnas visibles y botón de inversión instantánea de cableado (*Swap* Origen ⇄ Destino).
- **`js/ui/outliner.js` e `inspector.js`:** Árbol jerárquico multinivel con ordenamiento cuádruple (`slot`, `name-asc`, `name-desc`, `type`), acciones inline (`✏️` y `🗑️`), auto-navegación con centrado suave e Inspector colapsable con cálculo de U y botón de revelación táctil de contraseñas.
- **`js/ui/topology/` (Motor Canvas 2D de Red):**
  - **`TopologySkins.js`:** Gestión de los 3 modos canónicos (`circle`, `card`, `image`), 18 presets offline de hardware fotorrealista (`HARDWARE_PRESETS`), soporte de carga en base64 DataURL, cálculo adaptativo de dimensiones (`getNodeDimensions`) y detección de impacto geométrica unificada (`isPointInNode`).
  - **`TopologyState.js`:** Estado reactivo en memoria (zoom, pan, layoutMode, nodeLabelPos, ipLabelPos, spacing, spacingX).
  - **`TopologyLayout.js`:** Algoritmo por gabinetes y árbol jerárquico DAG (padre-hijo ortogonal con desconectados en la base). Incorpora afinidad y proximidad por rack anfitrión (`_findAffinityRackForFloorDevice`, M-39) posicionando periféricos de piso en el cuadrante inferior con línea de base uniforme (`floorBaseY`) y recálculo a 60 FPS con sliders duales H y V.
  - **`TopologyRenderer.js`:** Renderizado acelerado por Canvas 2D con cables Bézier y ortogonales redondeados, partículas de tráfico animadas con `performance.now()`, HUD tooltip ergonómico ampliado a 240px con elipsis elegante y posicionamiento independiente de etiquetas (Nombre e IP).
  - **`TopologyEvents.js`:** Captura de interacciones táctiles, arrastre fluido de nodos, gabinetes y salas con validación geométrica de límites perimetrales (`rx`/`ry`), selección múltiple y persistencia reactiva.
  - **`TopologyOrchestrator.js`:** Fachada de ciclo de vida del canvas, redibujado continuo y 5 slots de memoria rápida (`topologySlots`, M-40) para guardar y conmutar encuadres y estados topológicos sin alterar el historial de Undo/Redo.

## Design Patterns & Core Conventions
1. **No ES Modules in Browser:** Todos los scripts de desarrollo se cargan ordenadamente en el ámbito global mediante etiquetas `<script>` en `index.html`.
2. **Modular Cascading CSS:** Jerarquía estricta de hojas de estilo donde las capas posteriores refinan o sobreescriben a las anteriores sin colisiones de selectores.
3. **Optimización Multi-Tier de Historial (M-03):** Función `fastClone` que acelera la clonación estructural 4x respecto a JSON nativo, con límite estricto de 15 niveles de historial, snapshots livianos sin ranuras topológicas y deduplicación consecutiva $O(1)$.
4. **Coalescencia y Despacho Granular a 60 FPS (M-04):** Despacho reactivo de interfaz agrupado en `requestAnimationFrame`, actualización atómica de gabinetes individuales con `renderSingleRack(rackId)` y banderas de estado sucio para vistas inactivas.
5. **Cifrado Simétrico Transparente en Reposo (M-01):** Protección de datos confidenciales con derivación PBKDF2 y cifrado AES-GCM 256-bit, manteniendo el flujo en memoria fluido sin bloqueos de rendimiento.
6. **Biblioteca Isométrica Offline (`assets/img/`):** 19 activos vectoriales de alta definición en proyección isométrica a 30° con iluminación facetada en 3 planos y sombras de piso para personalización de skins de hardware.
7. **Documentación de Arquitectura de Clase Mundial:** 4 diagramas vectoriales exhaustivos en `doc/doc_img/doc_svg/architecture/` (`diagrama_dependencias_completo.svg`, `grafo_relaciones_archivos_sistema.svg`, `diagrama_uml_completo_sistema.svg` y `codemap_grafo_completo.svg`).
