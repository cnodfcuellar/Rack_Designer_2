# Progress & Status

## What Works (Funcionalidades Completas)
- **Gestión de Salas:** Creación, eliminación en cascada (racks → equipos → conexiones → posiciones topológicas), navegación por pestañas, renombrado.
- **Gestión de Racks:** Alturas configurables (4U–48U), colores dinámicos, animación CSS 3D flip (frontal/trasero), guías de unidades U, prevención de desbordamientos y colisiones de slots.
- **Gestión de Equipos:** 21 plantillas en 7 categorías. Credenciales, consumo energético, IP/MAC, skins personalizadas, puertos Ethernet/Fibra.
- **Vista Física (Motor SVG-First):** Renderizado vectorial de alta fidelidad mediante 16 archivos SVG independientes con animaciones CSS `@keyframes` integradas por hardware (GPU). Inyección inline con caché en memoria (`SVG_INLINE_CACHE`) para soporte de congelamiento con `.status-dot`.
- **Enrutamiento Físico de Cables:** Trazado ortogonal reactivo vía SVG sobre `#view-physical-content` con anclajes `data-port` y canaletas laterales.
- **Vista Topológica (Canvas 2D):** Motor MVC con 5 archivos, nodos arrastrables, animaciones de paquetes y partículas en enlaces Bézier, layout automático, auto-order, slider de espaciado, pan y zoom infinito, estilos card/circle.
- **Control Maestro de Animaciones:** Interruptor en `.status-dot` que alterna `.no-animations`, pausando simultáneamente los LEDs de los equipos en la vista física, las partículas de red en topología y los efectos CSS globales.
- **Drag & Drop:** Inserción de catálogo a rack, movimiento entre gabinetes, reordenamiento, soporte para equipos de piso.
- **Undo/Redo:** Historial reactivo con hasta 30 snapshots (`deepClone`). Soporte completo para Ctrl+Z/Y en física y topología.
- **Exportación:** PNG (racks y topología), Excel/CSV (inventario y conexiones vía SheetJS), JSON/`.rack` (backup completo con File System Access API).
- **Persistencia:** localStorage automático + autoguardado en disco con debounce de 3 segundos.
- **Auth/RBAC:** 3 roles (Admin/Editor/Viewer), PIN con SHA-256 (con fallback puro JS para file:// y LAN), sesión en sessionStorage.
- **PWA:** Service Worker con precaché offline y actualización automática (`rack-designer-next-cache-v5` con `reg.update()`).
- **Temas:** Modo oscuro (default) y modo claro con toggle.
- **Panel inferior:** Tablas de inventario y conexiones con pestañas, búsqueda y estadísticas globales.
- **Panel derecho:** Outliner con `<details>`/`<summary>` colapsables, Inspector de propiedades, Estadísticas de sala.
- **Catálogo lateral:** Iconos de categorías con flyout, filtrado por tipo, búsqueda.
- **Búsqueda global:** Búsqueda por IP/MAC/Nombre en la cabecera con atenuación visual.
- **Documentación completa:** README, ARCHITECTURE_GUIDE, CODEBASE_ORIENTATION_MAP, USER_MANUAL, ROADMAP_MEJORAS, INFORME_MEJORAS, CHANGELOG detallado.

## Current Issues & Technical Debt
- **Pérdida silenciosa de datos:** `store._save()` falla silenciosamente si `localStorage` está lleno (`QuotaExceededError`).
- **Puertos sin validación:** El modal de cables permite seleccionar puertos ya ocupados. Falta tracking de VLAN y estado de ocupación de puertos.
- **Rendimiento en topologías muy grandes:** `deepClone` (JSON.parse/stringify) es síncrono.
- **Sin pruebas automatizadas activas:** `tests/Rack.test.js` deshabilitado.

## What's Left to Build (Roadmap de Mejoras Pendientes)
Basado en `mejoras.md` (37 propuestas) y `roadmap_mejoras.md`:

### Fase 1 — Core y Datos
1. Handler de `QuotaExceededError` con notificación visual al usuario.
2. Gestión avanzada de puertos (validación, VLAN, submenú, filtrado de ocupados).
3. Refactorizar `demoData.js` para nueva estructura de puertos.

### Fase 2 — UX y Usabilidad
4. Buscador en catálogo del modal de equipos (`M-30`).
5. Controles de edición/eliminación inline en el Outliner (`M-38`).
6. Creación, edición y eliminación de Salas y Racks desde el Inspector (`M-36`).
7. Conexiones interactivas en la vista física arrastrando puertos (Drag-to-Connect, `M-34`).
8. Separación de cableado frontal vs. trasero (`M-33`).
9. Ubicación flexible de equipos sin restricciones fijas (`M-35`).

### Fase 3 — Topología Avanzada
10. Separación visual de etiquetas e IPs en nodos de topología (`M-31`).
11. Layout de árbol genealógico en topología (`M-32`).
12. Persistencia de posiciones manuales de nodos.

### Fase 4 — Exportación y Colaboración
13. Fidelidad visual 1:1 en exportación de imágenes con `html2canvas` (`M-37`).
14. Importación masiva CSV/Excel con validación y resolución de conflictos.
15. Ocultar/mostrar columnas en tablas con persistencia.

---

## Evolution of Project Decisions
- **Jul 2026:** Vanilla JS puro sin frameworks ni build tools.
- **Ago 2026:** Priorización de documentación técnica y mapas de orientación exhaustivos.
- **Sep 2026:** Migración al motor visual SVG-First independiente con animaciones GPU nativas.
- **Sep 2026:** Adopción de `html2canvas` para fidelidad 1:1 en exportación y Drag-to-Connect en física.
