# Progress & Status

## What Works (Funcionalidades Completas)
- **Gestión de Salas:** Creación y edición unificadas mediante modal interactivo (`#modal-room`) con validación RBAC. Eliminación en cascada (racks → equipos → conexiones → posiciones topológicas), navegación fluida por pestañas y botón táctil `✏️` para renombrar sin bloqueos de `prompt()`.
- **Gestión de Racks:** Alturas configurables normalizadas (8U, 12U, 18U, 24U, 42U default, 48U), colores dinámicos, animación CSS 3D flip (frontal/trasero), guías de unidades U, prevención de desbordamientos y colisiones de slots. Borde reforzado de 1.5px y sombra realista de datacenter.
- **Vista Física y Grilla CAD:** Fondo cuadriculado milimétrico de 24px × 24px (1 celda = 1U) en temas claro y oscuro. Ancho proporcional de slots fijado a 240px exactos (relación 10:1) concordante con faceplates SVG. Sección de equipos de piso con `min-width: 584px`.
- **Catálogo de Equipos y Familias:** Reorganizado en 7 familias comerciales estándar (`CATALOG_GROUPS`), reduciendo la altura a < 350px. Grupo consolidado "Redes" (switches, routers, firewalls, APs, patch panels). Categoría superior "Todos" e input reactivo de búsqueda en tiempo real `#catalog-search`.
- **Motor Visual SVG-First:** Renderizado vectorial de alta fidelidad mediante 16 archivos SVG independientes con animaciones CSS `@keyframes` integradas por hardware (GPU). Inyección inline con caché en memoria (`SVG_INLINE_CACHE`) para soporte de congelamiento con `.status-dot`.
- **Enrutamiento Físico de Cables:** Trazado ortogonal reactivo vía SVG sobre `#view-physical-content` con anclajes `data-port` y canaletas laterales.
- **Vista Topológica (Canvas 2D):** Motor MVC con 5 archivos, nodos arrastrables, animaciones de paquetes y partículas en enlaces Bézier, layouts automático por racks y en árbol jerárquico (`DAG` padre-hijo ortogonal con desconectados en la base de rack/sala), control dual de espaciado interactivo a 60 FPS (slider H para espaciado horizontal de columnas internas de racks y slider V para separación vertical), personalización visual y posicional de etiquetas de nodos (nombre e IP independientes: arriba, abajo, izquierda, derecha, juntos, separados, ocultos), motor de temas y transparencias (patrones procedimentales `dots`, `grid`, `hexagon`, adaptación dark/light, canal alfa `TOPO_ALPHA` y modo heredado vs custom `TOPO_INHERIT_COLORS`), afinidad y proximidad de equipos de piso por gabinete (`M-39`) alineados bajo su rack anfitrión preservando la grilla ortogonal y línea de base uniforme, pan y zoom infinito, estilos card/circle.
- **Inspector y Outliner Jerárquico:** CRUD integral de Salas, Racks y Equipos desde el Inspector con Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`), cálculo de U y borrado seguro con RBAC (`M-36`). Botones de cabecera (`+ Sala`, `+ Rack`, `+ Equipo`) y acciones inline (`✏️` y `🗑️`) en cada nodo del Outliner (`M-23`). Selector de ordenamiento en 4 modos (`slot`, `name-asc`, `name-desc`, `type`) (`M-38`). Inspector colapsable interactivo con expansión flex del Outliner (`M-24`).
- **Control Maestro de Animaciones:** Interruptor en `.status-dot` que alterna `.no-animations`, pausando simultáneamente los LEDs de los equipos en la vista física, las partículas de red en topología y los efectos CSS globales.
- **Drag & Drop:** Inserción de catálogo a rack, movimiento entre gabinetes, reordenamiento, soporte para equipos de piso.
- **Undo/Redo:** Historial reactivo con hasta 30 snapshots (`deepClone`). Soporte completo para Ctrl+Z/Y en física y topología.
- **Exportación de Alta Fidelidad:** PNG fiel 1:1 renderizando el DOM con `html2canvas.min.js` a escala Retina (`scale: 2`), fondo de datacenter `#090d17`, ocultamiento de botones de UI flotantes (`.exporting-capture`) y fallback procedimental a Canvas 2D (`M-37`). Exportación Excel/CSV con metadatos completos (`Tamaño`, `Skin`, `Notas`) vía SheetJS (`M-19`), JSON/`.rack` (backup completo con File System Access API).
- **Persistencia Robusta:** localStorage automático con doble slot de respaldo redundante (`RACK_DESIGNER_NEXT_STATE_BACKUP`), recuperación automática ante fallos de parseo JSON y captura defensiva de cuota de almacenamiento (`QuotaExceededError`).
- **Auth/RBAC:** 3 roles (Admin/Editor/Viewer), PIN con SHA-256 (con fallback puro JS para file:// y LAN), sesión persistente a recargas F5 mediante `sessionStorage`.
- **PWA:** Service Worker con precaché offline (`rack-designer-next-cache-v10`), inclusión de `html2canvas.min.js` y actualización automática mediante `reg.update()`.
- **Blindaje Criptográfico en Reposo y Modo Dios (M-01):** Cifrado simétrico de credenciales y campos sensibles (`pass`) con prefijo `enc:v1:<iv>:<ciphertext>` en `localStorage` y backups `.rack` mediante `RackCrypto`. Descifrado transparente en memoria, enmascaramiento por defecto con `••••••••`, toggle individual interactivo en Inspector (`toggleDevicePasswordInspector`) y Modo Dios global para administradores (`SHOW_PASSWORDS`), con botón interactivo de ojo `#dev-pass-toggle` en modales.
- **Guardado y Conmutación de Estados de Topología (M-40):** 5 slots de memoria independientes (`topologySlots`) con clonado profundo en `store.js` que capturan posiciones de nodos, racks, salas, encuadre pan y nivel de zoom. Barra de acceso rápido `#topo-slots-bar` y menú desplegable `#topo-slots-dropdown`. Preservación estricta del historial de rehacer (`_redoStack`) y normalización del icono de vistas a `.icon-eye` conforme a `DESIGN.md`.
- **Soporte para Tema Sepia y Selector Global de Temas (M-18):** Tema cálido pergamino (`[data-theme="sepia"]`, `--bg-main: #f4ecd8`, `--text-primary: #332517`, `--accent: #b45309`) en `variables.css`. Selector cíclico en cabecera `#btn-theme-toggle` (Oscuro ⇄ Claro ⇄ Sepia) con iconografía dinámica (`.icon-moon`, `.icon-sun`, `.icon-coffee`). Adaptación en grilla CAD y fondo cálido (`#f5eee1`) en topología Canvas 2D.
- **Inversión y Orientación Bicanal de Conexiones (M-41):** Botón Swap `#btn-cable-swap` en el modal de cables con icono SVG monocromático `.icon-swap` y microanimación de giro a 180° que intercambia instantáneamente equipos y puertos origen/destino con recálculo dinámico de colisiones. Selector de canaleta Superior (Techo) e Inferior (Piso) en el modal y trazado segregado en `rack.js` (`drawPhysicalCables`). Columna de canaleta con toggle de 1 clic y botón de inversión por fila en la tabla de conexiones (`tables.js`).
- **Plantilla Estructurada de Exportación (M-21):** Generación de plantillas completas en Excel `.xlsx` y `.csv` desde `ImportModal.js` (`downloadDeviceTemplate`), incluyendo los 21 campos del modelo de equipos y hoja de ayuda interactiva `"Guia_Valores"` con tipos estándar de datacenter, lados de montaje y recomendaciones operativas de formato.
- **Importación Masiva de Equipos (M-22):** Modal interactivo `#modal-import-devices` con drop-zone drag & drop, normalización heurística de encabezados (`normalizeHeaderKey`), análisis reactivo en tiempo real (`analyzeImportBatch`) con detección de colisiones de slots físicos y desbordes de altura, políticas de duplicados (omitir/renombrar/sobrescribir), auto-creación de gabinetes y rollback atómico completo mediante Undo/Redo (`store.undo()`).
- **Sistema Avanzado de Skins Visuales en Topología (M-28):** Módulo modular `TopologySkins.js` con 3 modos visuales (Nodos circulares con radio 22, Tarjetas de 150×50 y Hardware Skins fotorrealistas de 140×50 con orejas metálicas de montaje en rack, bisel metálico, carátula vectorial y LED de estado). 18 presets offline enlazados a `EMBEDDED_SVG_CACHE` y soporte de carga de imágenes en base64 DataURL vía `FileReader` con previsualización en `#modal-device`. Hit-testing geométrico adaptativo unificado (`isPointInNode`) y persistencia del estilo visual en los 5 slots de memoria (M-40).
- **Testing Automatizado:** Suite de integridad `tests/integrity_check.cjs` y runner web interactivo `tests/index.html` con **316 pruebas automáticas en 20 grupos (100% éxito, 0 fallas)** en perfecta paridad 1:1.

## Current Issues & Technical Debt
- **Cableado frontal vs trasero:** Actualmente las conexiones no diferencian si un puerto está en la cara frontal o trasera de un equipo dual/profundo (`M-33`).

## What's Left to Build (Roadmap de Mejoras Pendientes)
Total de 9 tareas pendientes en [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md) (33 completadas de 42 totales, 78.6% global, **¡Fase 0, Fase 1 y Fase 4 al 100%, Fase 2 al 87.5%!**):

### Fase 2 — Core de Datos y Puertos
- Separación de cableado frontal vs. trasero (`M-33`).
- Conexiones interactivas *Drag-to-Connect* arrastrando puertos (`M-34`).

### Fase 3 — Ergonomía y Layout
- Diseño adaptativo y responsive para modo Desktop / Laptops (`M-25A`).

### Fase 5 — Rendimiento y Calidad
- Optimización de deepClone / limitación de historial (`M-03`).
- Redibujado selectivo renderAll (`M-04`).

### Fase 6 — Experiencia Premium
- Modo móvil y tablet — *Standby / Baja prioridad* (`M-25B`).
- Flexibilidad de ubicación sin restricciones arbitrarias (`M-35`).
- Resolución de conflictos multiusuario (`M-07`).

---

## Evolution of Project Decisions
- **Jul 2026:** Vanilla JS puro sin frameworks ni build tools.
- **Ago 2026:** Priorización de documentación técnica y mapas de orientación exhaustivos.
- **Sep 2026:** Migración al motor visual SVG-First independiente con animaciones GPU nativas.
- **Sep 2026 (Sprint 1):** Blindaje de almacenamiento (`M-02`, `M-05`) y normalización visual física (`M-10`, `M-13`, `M-14`, `M-15`, `M-16`).
- **Sep 2026 (Sprint 2):** Erradicación de `prompt()` nativo (`M-09`), consolidación en 7 familias comerciales (`M-11`) y buscador global en tiempo real (`M-12`).
- **Sep 2026 (Sprint 3):** Gestión jerárquica Outliner & Inspector: CRUD integral en Inspector (`M-36`), acciones rápidas e inline en Outliner (`M-23`), ordenamiento dinámico de 4 modos (`M-38`), Inspector colapsable (`M-24`) y suite de 65 tests de integridad al 100%.
- **Sep 2026 (Sprint 4):** Fidelidad de exportación PNG 1:1 con `html2canvas` (`M-37`), metadatos de inventario y edición en celda (`M-19`), buscador reactivo en modal de catálogo (`M-30`) y suite ampliada a 78 tests al 100%.
- **Sep 2026 (Sprint 5):** Topología avanzada: Layout en árbol jerárquico ortogonal con desconectados al pie (`M-32`), separación de cabeceras de sala/rack, control dual de espaciado interactivo a 60 FPS (H y V) y posicionamiento granular de etiquetas de nodos IP/Nombre (`M-31`).
- **Sep 2026 (Sprint 6):** Blindaje de Producción al 100% (Fase 0): Módulo de cifrado simétrico en reposo (`RackCrypto`, `M-01`), enmascaramiento y revelación granular de contraseñas por rol Admin con **Modo Dios** (`SHOW_PASSWORDS`) y toggles táctiles en Inspector y modal de equipos. 182 pruebas automáticas en 14 grupos al 100%.
- **Sep 2026 (Sprint 7):** Topología Inteligente y Afinidad de Gabinete (M-39): Algoritmo de proximidad por rack anfitrión en `TopologyLayout.js` (`_findAffinityRackForFloorDevice`), cuadrante inferior alineado, línea de base uniforme y 196 pruebas automáticas en 15 grupos al 100%. Fase 4 avanzada a 5 de 6 mejoras completadas (83%).
- **Oct 2026 (Sprint 8):** Conmutación de 5 estados de topología (M-40) y optimización híbrida de la barra superior (~495px) con anclaje inteligente y aislamiento de Undo/Redo. 233 pruebas al 100%.
- **Oct 2026 (Sprint 9):** Implementación de Tema Sepia y Selector Visible en Cabecera (M-18), paleta cálida completa, icono SVG café, soporte en Canvas 2D y exportaciones. Corrección de iconografía técnica según DESIGN.md (icono SVG monocromático icon-eye). Suite ampliada a 254 pruebas en 17 grupos al 100%.
- **Oct 2026 (Sprint 10):** Implementación completa de M-41: Botón Swap `#btn-cable-swap` (Origen ⇄ Destino) en modal y tabla, selector de canaleta Superior (Techo) e Inferior (Piso) en conexiones y trazado físico en `rack.js`. 265 pruebas en 18 grupos al 100%. 31 mejoras completadas (73.8%).
