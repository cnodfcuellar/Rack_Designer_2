# Progress & Status

## What Works (Funcionalidades Completas)
- **Gestión de Salas:** Creación y edición unificadas mediante modal interactivo (`#modal-room`) con validación RBAC. Eliminación en cascada (racks → equipos → conexiones → posiciones topológicas), navegación fluida por pestañas y botón táctil `✏️` para renombrar sin bloqueos de `prompt()`.
- **Gestión de Racks:** Alturas configurables normalizadas (8U, 12U, 18U, 24U, 42U default, 48U), colores dinámicos, animación CSS 3D flip (frontal/trasero), guías de unidades U, prevención de desbordamientos y colisiones de slots. Borde reforzado de 1.5px y sombra realista de datacenter.
- **Vista Física y Grilla CAD:** Fondo cuadriculado milimétrico de 24px × 24px (1 celda = 1U) en temas claro y oscuro. Ancho proporcional de slots fijado a 240px exactos (relación 10:1) concordante con faceplates SVG. Sección de equipos de piso con `min-width: 584px`.
- **Catálogo de Equipos y Familias:** Reorganizado en 7 familias comerciales estándar (`CATALOG_GROUPS`), reduciendo la altura a < 350px. Grupo consolidado "Redes" (switches, routers, firewalls, APs, patch panels). Categoría superior "Todos" e input reactivo de búsqueda en tiempo real `#catalog-search`.
- **Motor Visual SVG-First:** Renderizado vectorial de alta fidelidad mediante 16 archivos SVG independientes con animaciones CSS `@keyframes` integradas por hardware (GPU). Inyección inline con caché en memoria (`SVG_INLINE_CACHE`) para soporte de congelamiento con `.status-dot`.
- **Enrutamiento Físico de Cables:** Trazado ortogonal reactivo vía SVG sobre `#view-physical-content` con anclajes `data-port` y canaletas laterales.
- **Vista Topológica (Canvas 2D):** Motor MVC con 5 archivos, nodos arrastrables, animaciones de paquetes y partículas en enlaces Bézier, layout automático, auto-order, slider de espaciado, pan y zoom infinito, estilos card/circle.
- **Inspector y Outliner Jerárquico:** CRUD integral de Salas, Racks y Equipos desde el Inspector con Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`), cálculo de U y borrado seguro con RBAC (`M-36`). Botones de cabecera (`+ Sala`, `+ Rack`, `+ Equipo`) y acciones inline (`✏️` y `🗑️`) en cada nodo del Outliner (`M-23`). Selector de ordenamiento en 4 modos (`slot`, `name-asc`, `name-desc`, `type`) (`M-38`). Inspector colapsable interactivo con expansión flex del Outliner (`M-24`).
- **Control Maestro de Animaciones:** Interruptor en `.status-dot` que alterna `.no-animations`, pausando simultáneamente los LEDs de los equipos en la vista física, las partículas de red en topología y los efectos CSS globales.
- **Drag & Drop:** Inserción de catálogo a rack, movimiento entre gabinetes, reordenamiento, soporte para equipos de piso.
- **Undo/Redo:** Historial reactivo con hasta 30 snapshots (`deepClone`). Soporte completo para Ctrl+Z/Y en física y topología.
- **Exportación:** PNG (racks y topología), Excel/CSV (inventario y conexiones vía SheetJS), JSON/`.rack` (backup completo con File System Access API).
- **Persistencia Robusta:** localStorage automático con doble slot de respaldo redundante (`RACK_DESIGNER_NEXT_STATE_BACKUP`), recuperación automática ante fallos de parseo JSON y captura defensiva de cuota de almacenamiento (`QuotaExceededError`).
- **Auth/RBAC:** 3 roles (Admin/Editor/Viewer), PIN con SHA-256 (con fallback puro JS para file:// y LAN), sesión persistente a recargas F5 mediante `sessionStorage`.
- **PWA:** Service Worker con precaché offline (`rack-designer-next-cache-v9`) y actualización automática mediante `reg.update()`.
- **Testing Automatizado:** Suite de integridad `tests/integrity_check.cjs` y runner web `tests/index.html` con 65 pruebas automáticas en 8 grupos (100% éxito).
- **Documentación Completa:** README, ARCHITECTURE_GUIDE, CODEBASE_ORIENTATION_MAP, USER_MANUAL, ROADMAP_MEJORAS, INFORME_MEJORAS, CHANGELOG detallado.

## Current Issues & Technical Debt
- **Puertos sin validación:** El modal de cables permite seleccionar puertos ya ocupados. Falta tracking de VLAN y estado de ocupación de puertos (`M-26`).
- **Cifrado de datos sensibles:** Credenciales de equipos almacenadas en texto plano en localStorage (`M-01`).
- **Fidelidad en exportación de imágenes:** La exportación actual no captura el 100% de los estilos CSS complejos o sombras (`M-37` con `html2canvas`).

## What's Left to Build (Roadmap de Mejoras Pendientes)
Total de 20 tareas pendientes en [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md) (18 completadas):

### Fase 0 & 2 — Seguridad y Puertos
- Cifrado WebCrypto AES-GCM (`M-01`).
- Validación de ocupación de puertos y soporte VLAN (`M-26`).
- Separación de cableado frontal vs. trasero (`M-33`).

### Fase 2 & 5 — Exportación, Tablas e Interacción
- Fidelidad visual 1:1 en exportación de imágenes con `html2canvas` (`M-37`).
- Exportar propiedades completas en tabla de inventario (`M-19`).
- Ocultar/mostrar columnas en tablas (`M-20`).
- Plantilla completa de exportación CSV/Excel (`M-21`).
- Importación masiva desde CSV/Excel (`M-22`).
- Buscador en catálogo de equipos del modal (`M-30`).

### Fase 4 — Vista Física Interactiva y Topología
- Conexiones interactivas *Drag-to-Connect* arrastrando puertos (`M-34`).
- Separación de etiquetas en topología (IP arriba / nombre abajo) (`M-31`).
- Layout de árbol genealógico en topología (`M-32`).
- Skins visuales y motor de temas en topología (`M-28`, `M-29`).

---

## Evolution of Project Decisions
- **Jul 2026:** Vanilla JS puro sin frameworks ni build tools.
- **Ago 2026:** Priorización de documentación técnica y mapas de orientación exhaustivos.
- **Sep 2026:** Migración al motor visual SVG-First independiente con animaciones GPU nativas.
- **Sep 2026 (Sprint 1):** Blindaje de almacenamiento (`M-02`, `M-05`) y normalización visual física (`M-10`, `M-13`, `M-14`, `M-15`, `M-16`).
- **Sep 2026 (Sprint 2):** Erradicación de `prompt()` nativo (`M-09`), consolidación en 7 familias comerciales (`M-11`) y buscador global en tiempo real (`M-12`).
- **Sep 2026 (Sprint 3):** Gestión jerárquica Outliner & Inspector: CRUD integral en Inspector (`M-36`), acciones rápidas e inline en Outliner (`M-23`), ordenamiento dinámico de 4 modos (`M-38`), Inspector colapsable (`M-24`) y suite de 65 tests de integridad al 100%.
