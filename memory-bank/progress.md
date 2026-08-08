# Progress & Status

## What Works (Funcionalidades Completas)
- **Gestión de Salas:** Creación, eliminación en cascada (racks → equipos → conexiones → posiciones topológicas), navegación por pestañas, renombrado.
- **Gestión de Racks:** Alturas configurables (4U–48U), colores dinámicos, animación CSS 3D flip (frontal/trasero), guías de unidades U, prevención de desbordamientos y colisiones de slots.
- **Gestión de Equipos:** 21 plantillas en 7 categorías (servidor, switch, router, firewall, storage, energía, accesorios, gestión, piso). Soporte para credenciales, consumo energético, IP/MAC, skins personalizadas, puertos Ethernet/Fibra.
- **Vista Física (DOM + SVG):** Renderizado de chasis y faceplates en CSS puro. Enrutamiento inteligente de cables ortogonales vía SVG dinámico con sistema de canaletas. Toggle de visibilidad de cables.
- **Vista Topológica (Canvas 2D):** Motor MVC con 5 archivos, nodos arrastrables, animaciones de partículas, layout automático, auto-order, slider de espaciado, pan y zoom infinito, estilos card/circle.
- **Drag & Drop:** Inserción de catálogo a rack, movimiento entre gabinetes, equipos de piso.
- **Undo/Redo:** Máquina del tiempo reactiva con hasta 30 snapshots (deepClone). Soporte completo para Ctrl+Z/Y incluyendo topología.
- **Exportación:** PNG (racks y topología), Excel/CSV (inventario y conexiones vía SheetJS), JSON/`.rack` (backup completo con File System Access API).
- **Persistencia:** localStorage automático + autoguardado en disco con debounce de 3 segundos.
- **Auth/RBAC:** 3 roles (Admin/Editor/Viewer), PIN con SHA-256 (con fallback puro JS para file://), sesión en sessionStorage.
- **PWA:** Service Worker con cache offline (`rack-designer-next-cache-v3`).
- **Temas:** Modo oscuro (default) y modo claro con toggle.
- **Panel inferior:** Tablas de inventario y conexiones con pestañas, búsqueda y estadísticas globales.
- **Panel derecho:** Outliner con `<details>`/`<summary>` colapsables, Inspector de propiedades, Estadísticas de sala.
- **Catálogo lateral:** Iconos de categorías con flyout, filtrado por tipo, búsqueda.
- **Búsqueda global:** Búsqueda por IP/MAC/Nombre en la cabecera con atenuación visual.
- **Documentación completa:** README, ARCHITECTURE_GUIDE, CODEBASE_ORIENTATION_MAP (reescrito ago 2026), USER_MANUAL con SVGs didácticos, CHANGELOG detallado.

## Current Issues & Technical Debt
- **Pérdida silenciosa de datos:** `store._save()` falla silenciosamente si `localStorage` está lleno (`QuotaExceededError`). El `catch(e) {}` vacío no notifica al usuario.
- **Corrupción potencial del estado:** Si el navegador crashea durante un `_save()`, el JSON en localStorage puede quedar truncado. `_load()` fallará y reseteará todo a `_defaultState()` sin aviso.
- **Puertos sin validación:** El modal de cables permite seleccionar puertos ya ocupados. No hay tracking de VLAN ni estado de ocupación de puertos.
- **Rendimiento en topologías grandes:** `deepClone` (JSON.parse/stringify) es síncrono y puede congelar la UI con proyectos de cientos de equipos.
- **Redibujado excesivo:** `renderAll()` redibuja múltiples vistas para cambios menores. Falta granularidad en el source dispatch.
- **Sin pruebas:** `tests/Rack.test.js` completamente comentado. No hay framework de testing configurado.
- **Service Worker agresivo:** Sin mecanismo de notificación de nuevas versiones ni skip-waiting.
- **Inconsistencia en modales:** Renombrar sala usa `prompt()` nativo en lugar de modal personalizado.

## What's Left to Build (Mejoras Pendientes)
Basado en `mejoras.md` (29+ propuestas) y `roadmap_mejoras.md` (análisis de complejidad):

### Fase 1 — Core y Datos (Prioridad Alta)
1. Handler de `QuotaExceededError` con notificación visual al usuario.
2. Gestión avanzada de puertos (validación, VLAN, submenú, filtrado de ocupados).
3. Refactorizar `demoData.js` para nueva estructura de puertos.

### Fase 2 — UX y Usabilidad
4. Buscador en catálogo del modal de equipos.
5. Controles de edición/eliminación inline en el Outliner.
6. Estandarización de alturas de rack (select con valores fijos, default 8U).
7. Ancho fijo proporcional para slots (10× la unidad U = 240px).
8. Grilla de fondo tenue en vista física.
9. Categoría "Todos" y agrupación "Network" en sidebar.
10. Inspector colapsable, opciones de ordenamiento en Outliner.

### Fase 3 — Topología Avanzada
11. Persistencia de posiciones de nodos en la topología.
12. Skins visuales en topología (nodos, cards, imágenes personalizadas).
13. Motor de temas y personalización visual en topología (transparencias, patrones de fondo).

### Fase 4 — Exportación y Colaboración
14. Plantilla completa de exportación con todos los campos.
15. Importación masiva CSV/Excel con validación y resolución de conflictos.
16. Ocultar/mostrar columnas en tablas con persistencia.

### Fase 5 — Responsive y Avanzado
17. Rediseño completo para móvil/tablet (media queries, gestos, bottom nav).
18. Tema Sepia y visibility del theme toggler.

## Evolution of Project Decisions
- **Jul 2026:** Se decidió mantener Vanilla JS sin frameworks ni build tools para siempre.
- **Jul 2026:** Se implementó el sistema de memoria persistente (`memory-bank/`) para agentes IA.
- **Jul 2026:** Se adoptó `pnpm` como único gestor de paquetes (prohibido npm/yarn).
- **Ago 2026:** Se priorizó la documentación técnica exhaustiva para facilitar onboarding de desarrolladores novatos.
