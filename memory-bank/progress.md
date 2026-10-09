# Progress & Status

## What Works (Funcionalidades Completas y Verificadas)
- **Biblioteca Vectorial de 19 Skins Isométricas (`assets/img/`):** 19 archivos SVG creados y optimizados siguiendo estrictamente proyección isométrica a 30°, iluminación en 3 planos y sombras de piso (`desktop_workstation_iso.svg`, `router_modem_iso.svg`, `cctv_camera_iso.svg`, `server_rack_open_iso.svg`, `telecom_tower_iso.svg`, `laptop_client_iso.svg`, `database_storage_iso.svg`, `switch_24p_iso.svg`, `ups_power_iso.svg`, `pdu_power_strip_iso.svg`, `firewall_shield_iso.svg`, `access_point_iso.svg`, `nvr_recorder_iso.svg`, `nas_storage_iso.svg`, `decoder_box_iso.svg`, `voip_phone_iso.svg`, `network_printer_iso.svg`, `datacenter_door_iso.svg`, `vehicle_barrier_iso.svg`).
- **Documentación Vectorial de Arquitectura (`doc/doc_img/doc_svg/architecture/`):** 4 diagramas SVG técnicos de alta definición y gran escala: `codemap_grafo_completo.svg` (2400x1600 px), `diagrama_uml_completo_sistema.svg` (2200x1500 px), `grafo_relaciones_archivos_sistema.svg` (2000x1350 px) y `diagrama_dependencias_completo.svg` (1600x1100 px).
- **Gestión de Salas:** Creación y edición unificadas mediante modal interactivo (`#modal-room`) con validación RBAC. Eliminación en cascada (racks → equipos → conexiones → posiciones topológicas), navegación fluida por pestañas y botón táctil `✏️` para renombrar sin bloqueos de `prompt()`.
- **Gestión de Racks:** Alturas configurables normalizadas (8U, 12U, 18U, 24U, 42U default, 48U), colores dinámicos, animación CSS 3D flip (frontal/trasero), guías de unidades U, prevención de desbordamientos y colisiones de slots. Borde reforzado de 1.5px y sombra realista de datacenter.
- **Vista Física y Grilla CAD:** Fondo cuadriculado milimétrico de 24px × 24px (1 celda = 1U) en temas claro, oscuro y sepia. Ancho proporcional de slots fijado a 240px exactos (relación 10:1) concordante con faceplates SVG. Sección de equipos de piso con `min-width: 584px`.
- **Catálogo de Equipos y Familias:** Reorganizado en 7 familias comerciales estándar (`CATALOG_GROUPS`), reduciendo la altura a < 350px. Grupo consolidado "Redes" (switches, routers, firewalls, APs, patch panels). Categoría superior "Todos" e input reactivo de búsqueda en tiempo real `#catalog-search`.
- **Motor Visual SVG-First:** Renderizado vectorial de alta fidelidad mediante 16 archivos SVG independientes con animaciones CSS `@keyframes` integradas por hardware (GPU). Inyección inline con caché en memoria (`SVG_INLINE_CACHE`) para soporte de congelamiento con `.status-dot`.
- **Enrutamiento Físico de Cables y Canalización Bicanal (M-41):** Trazado ortogonal reactivo vía SVG sobre `#view-physical-content` con anclajes `data-port`. Selector de canaleta Superior (Techo) e Inferior (Piso técnico) y botón Swap Origen ⇄ Destino `#btn-cable-swap`.
- **Vista Topológica (Canvas 2D):** Motor MVC con 5 módulos, nodos arrastrables, animaciones de paquetes y partículas en enlaces Bézier, layouts automático por racks y en árbol jerárquico (`DAG` padre-hijo ortogonal con desconectados en la base), control dual de espaciado interactivo a 60 FPS (slider H y slider V), personalización visual y posicional de etiquetas de nodos (nombre e IP independientes), motor de temas y transparencias, afinidad y proximidad de equipos de piso por gabinete (`M-39`), pan y zoom infinito, estilos card/circle/hardware.
- **Guardado y Conmutación de Estados de Topología (M-40):** 5 ranuras independientes en `store.js` (`topologySlots`) con clonado profundo que capturan y restauran coordenadas de nodos, gabinetes, salas, nivel de zoom y encuadre pan sin perturbar la pila de deshacer/rehacer (`_redoStack`).
- **Sistema Avanzado de Skins Visuales en Topología (M-28):** Módulo modular `TopologySkins.js` con 3 modos visuales (Círculos, Tarjetas y Hardware Skins fotorrealistas con orejas de montaje, bisel y LEDs). 18 presets offline enlazados a `EMBEDDED_SVG_CACHE`, soporte de carga de imágenes en base64 DataURL vía `FileReader` y detección de impacto adaptativa (`isPointInNode`).
- **Inspector y Outliner Jerárquico:** CRUD integral de Salas, Racks y Equipos desde el Inspector con Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`), cálculo de U y borrado seguro con RBAC (`M-36`). Botones de cabecera (`+ Sala`, `+ Rack`, `+ Equipo`) y acciones inline (`✏️` y `🗑️`) en cada nodo del Outliner (`M-23`). Selector de ordenamiento en 4 modos (`slot`, `name-asc`, `name-desc`, `type`) (`M-38`). Inspector colapsable interactivo (`M-24`).
- **Undo/Redo de Alto Rendimiento (M-03):** Función `fastClone` en `utils.js` (4x más veloz que JSON), límite acotado de 15 instantáneas (`store.maxHistory = 15`), snapshots livianos sin `topologySlots`, deduplicación reactiva consecutiva $O(1)$ con `_mutatedSinceLastSnapshot` y auditoría de memoria con `store.estimateHistoryMemory()`.
- **Redibujado Selectivo y Despacho Optimizado (M-04):** Despacho reactivo de interfaz en `main.js` mediante coalescencia rAF a 60 FPS, actualización granular de gabinetes individuales con `renderSingleRack(rackId)` sin reconstruir salas completas, seguimiento de estado sucio en vistas inactivas (`window._renderState`) y monitor de rendimiento `window.RenderPerformance`.
- **Blindaje Criptográfico en Reposo y Modo Dios (M-01):** Cifrado simétrico de credenciales y campos sensibles (`pass`) con prefijo `enc:v1:<iv>:<ciphertext>` en `localStorage` y backups `.rack` mediante `RackCrypto`. Descifrado transparente en memoria, enmascaramiento por defecto con `••••••••`, toggle individual interactivo en Inspector y Modo Dios global para administradores (`SHOW_PASSWORDS`).
- **Exportación de Alta Fidelidad e Importación Masiva (M-21, M-22, M-37):** Exportación PNG 1:1 con `html2canvas` a escala Retina (2x) con fallback procedimental a Canvas 2D. Generación de plantillas Excel/CSV con metadatos completos y modal de importación masiva (`ImportModal.js`) con análisis de colisiones y rollback atómico completo vía Undo.
- **Plantillas Demo Profesionales:** Centro de Datos Empresarial (ANSI/TIA-942) y Campus Universitario UTN con red jerárquica de 3 capas (10 edificios, 13 gabinetes, 24 VLANs y direccionamiento 10.0.0.0/8) accesibles mediante el modal `#modal-demo-selection`.
- **Cableado Frontal vs. Trasero (M-33):** Soporte integral en modelo de datos (`sourceSide`, `targetSide`: `'front' | 'rear'`), aislamiento de colisiones de puertos por cara física en equipos duales (`mountSide: 'both'`), transposición simétrica en inversión de enlaces (`swapConnectionDirection`), enriquecimiento visual en tabla de conexiones con insignias esmeralda/azul, selectores dedicados en modal `#modal-cable` e indexación física en trazado de cables según cara activa.
- **Testing Automatizado Exhaustivo:** Suite de integridad `tests/integrity_check.cjs` y runner web `tests/index.html` con **370 pruebas automáticas en 23 grupos pasando al 100% de éxito (0 fallas)**.

## Current Issues & Technical Debt
- **Interactividad Drag-to-Connect:** La creación de conexiones requiere abrir el modal en lugar de permitir trazar cables visualmente arrastrando desde los puertos del faceplate (`M-34`).

## What's Left to Build (Roadmap de Mejoras Pendientes)
Total de 6 tareas pendientes en [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md) y [`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) (36 de 42 completadas, 85.7% global; **Fases 0, 1, 4 y 5 al 100%**; **Fase 2 al 87.5%** con 7 de 8 completadas):

### Fase 2 — Core de Datos y Puertos
- Conexiones interactivas *Drag-to-Connect* arrastrando puertos (`M-34`).

### Fase 3 — Ergonomía y Layout
- Diseño adaptativo y responsive para modo Desktop / Laptops medianas (`M-25A`).

### Fase 6 — Experiencia Premium
- Modo móvil y tablet — *Baja prioridad* (`M-25B`).
- Flexibilidad de ubicación sin restricciones arbitrarias (`M-35`).
- Resolución de conflictos multiusuario (`M-07`).

---

## Evolution of Project Decisions
- **Jul 2026:** Vanilla JS puro sin frameworks ni build tools.
- **Ago 2026:** Priorización de documentación técnica y mapas de orientación exhaustivos.
- **Sep 2026:** Migración al motor visual SVG-First independiente con animaciones GPU nativas.
- **Sep 2026 (Sprint 1):** Blindaje de almacenamiento (`M-02`, `M-05`) y normalización visual física (`M-10`, `M-13`, `M-14`, `M-15`, `M-16`).
- **Sep 2026 (Sprint 2):** Erradicación de `prompt()` nativo (`M-09`), consolidación en 7 familias comerciales (`M-11`) y buscador global en tiempo real (`M-12`).
- **Sep 2026 (Sprint 3):** Gestión jerárquica Outliner & Inspector: CRUD integral en Inspector (`M-36`), acciones rápidas e inline en Outliner (`M-23`), ordenamiento dinámico de 4 modos (`M-38`), Inspector colapsable (`M-24`) y suite de 65 tests al 100%.
- **Sep 2026 (Sprint 4):** Fidelidad de exportación PNG 1:1 con `html2canvas` (`M-37`), metadatos de inventario y edición en celda (`M-19`), buscador reactivo en modal de catálogo (`M-30`) y suite ampliada a 78 tests al 100%.
- **Sep 2026 (Sprint 5):** Topología avanzada: Layout en árbol jerárquico ortogonal (`M-32`), separación de cabeceras de sala/rack, control dual de espaciado interactivo a 60 FPS (H y V) y posicionamiento granular de etiquetas de nodos (`M-31`).
- **Sep 2026 (Sprint 6):** Blindaje de Producción al 100% (Fase 0): Módulo de cifrado simétrico en reposo (`RackCrypto`, `M-01`), Modo Dios (`SHOW_PASSWORDS`) y 182 pruebas automáticas en 14 grupos al 100%.
- **Sep 2026 (Sprint 7):** Topología Inteligente y Afinidad de Gabinete (`M-39`): Proximidad por rack anfitrión en `TopologyLayout.js` y 196 pruebas automáticas en 15 grupos al 100%.
- **Oct 2026 (Sprint 8):** Conmutación de 5 estados de topología (`M-40`) y optimización de barra superior. 233 pruebas al 100%.
- **Oct 2026 (Sprint 9):** Soporte para Tema Sepia y Selector Global en Cabecera (`M-18`), icono SVG café y paleta pergamino. 254 pruebas al 100%.
- **Oct 2026 (Sprint 10):** Implementación de M-41: Botón Swap `#btn-cable-swap` y selector de canaleta Superior (Techo) e Inferior (Piso). 265 pruebas en 18 grupos al 100%.
- **Oct 2026 (Sprint 12):** Implementación de M-04: Redibujado selectivo y despacho optimizado (`renderSingleRack`, coalescencia rAF a 60 FPS, estado sucio y monitor `RenderPerformance`). 355 pruebas en 22 grupos al 100%.
- **Oct 2026 (Sprint 13):** Plantilla Demo Campus Universitario UTN (10 edificios, 13 racks, 24 VLANs), modal `#modal-demo-selection`, compatibilidad total con runner en protocolo `file:///` y corrección de límites perimetrales de topología (`rx`/`ry`). 360 pruebas en 22 grupos al 100%.
- **Oct 2026 (Sprint 14):** Creación de la biblioteca de 19 skins vectoriales isométricas en `assets/img/` (30°, 3 planos de iluminación, sombras de piso) y generación de los 4 diagramas SVG arquitectónicos completos en `doc/doc_img/doc_svg/architecture/` (Codemap exhaustivo, Diagrama UML, Grafo de Relaciones y Dependencias).
- **Oct 2026 (Sprint 15):** Implementación de M-33: Cableado Frontal vs. Trasero (`sourceSide`, `targetSide`, aislamiento de colisiones de puertos por cara en equipos duales, transposición de caras en swap, selectores en modal `#modal-cable` y trazado SVG reactivo). Suite ampliada a 370 pruebas en 23 grupos al 100% de éxito.
