# Active Context

## Current Work Focus
Se implementó con éxito **`M-25A: Responsive Laptop & Modo Móvil Integral (Drawers, Bottom Sheet, Filtro Lupa, Scroll Horizontal y Modales Opacos)`**, elevando la suite de integridad a **396 pruebas con 100% de éxito (25 grupos, 0 fallos)** en paridad total CLI y Web.

El sistema cuenta ahora con:
- Off-Canvas Drawers para Catálogo (`#sidebar`) e Inspector (`#right-panel`) con backdrop oscuro (`#mobile-overlay`) y jerarquía de capas optimizada (`z-index: 10000`).
- Bottom Sheet reactivo en el panel inferior (`#bottom`), iniciando compacto a 38px y expandiéndose fluidamente a 72vh (`.sheet-expanded`).
- Filtro de tabla inferior móvil modo solo lupa (`#btn-toggle-table-search`) con popover flotante, autofoco y limpieza rápida `✕`.
- Scroll horizontal táctil fluido en la cabecera inferior (`.bottom-header`) con scrollbar delgada de 4px y menús desacoplados (`position: fixed`).
- Todas las ventanas modales adaptadas al 100% para móviles (≤ 768px y ≤ 480px), eliminando transparencias con fondo sólido `var(--bg-card)` y colapsando formularios a 1 columna.

El ciclo activo de propuestas de mejora (`mejoras.md`) ha sido formalmente concluido y archivado en [`doc/doc_md/historico/mejoras_archivadas.md`](../doc/doc_md/historico/mejoras_archivadas.md). El archivo activo de la raíz ha sido eliminado y se retiraron las reglas de recordatorio automático en `.agents/AGENTS.md`.

## Recent Changes (Octubre 2026)
- **[2026-10-11] Infraestructura & Git — Optimización de .gitignore y Auditoría de Repositorio:**
  - Configuración exhaustiva de `.gitignore` para producción y repositorios públicos (filtrado de cachés Python, `.tempmediaStorage/`, artefactos OS y logs).
  - Creación de `.py/read_all_files.py` con verificación exitosa de 276 archivos al 100%.
  - Suite de integridad 100% OK con 398 pruebas en 25 grupos sin fallos.
- **[2026-10-10] Cierre y Archivo Histórico de Mejoras (mejoras.md):**
  - Archivo histórico resguardado en `doc/doc_md/historico/mejoras_archivadas.md`.
  - Eliminación de `mejoras.md` en la raíz.
  - Eliminación del recordatorio de inicio en `.agents/AGENTS.md`.
- **[2026-10-10] Implementación de Modo Móvil Integral y Optimización Responsiva (M-25A / M-25B):**
  - **Cajones Laterales Móviles:** Off-Canvas Drawers para Catálogo (`#sidebar`) e Inspector (`#right-panel`) con backdrop interactivo `#mobile-overlay`.
  - **Hoja Inferior Táctil (Bottom Sheet):** `#bottom` compacto a 38px por defecto con expansión suave a 72vh al pulsar pestañas, tirador o botón `▲`.
  - **Filtro de Lupa en Barra Inferior:** `#btn-toggle-table-search` con popover flotante anclado, filtrado reactivo y botón de limpieza `✕`.
  - **Scroll Horizontal Táctil en Cabecera Inferior:** `overflow-x: auto` con scrollbar delgada y desacoplamiento de menús flotantes (`position: fixed`).
  - **Modales 100% Opacos y Responsivos:** Sustitución de `var(--bg-panel)` por `var(--bg-card)` (eliminando transparencias), `min-width: 0 !important`, y colapso de grids a 1 columna.
  - **Testing Automatizado:** Grupo 25 incorporado con 15 nuevas pruebas en `tests/integrity_check.cjs` (398 pruebas al 100% de éxito, 0 fallos).
- **[2026-10-09] Implementación de M-33: Cableado Frontal vs. Trasero:**
  - **Extensión del Modelo (`js/store.js`):** Soporte de `sourceSide` y `targetSide` en conexiones, método `isPortOccupied` con discriminación de cara `portSide`, validación de colisiones con etiquetas de cara (`[Frontal]` / `[Trasero]`), método `swapConnectionDirection` con transposición simétrica de caras y `getDevicePorts` con atributo `side`.
  - **Formulario Interactivo (`index.html` y `CableModal.js`):** Selectores `#cable-src-side` y `#cable-dst-side`, sincronización automática según `mountSide`, soporte en botón Swap `#btn-cable-swap` y badges de estado en el selector de puertos.
  - **Tabla de Conexiones (`tables.js`):** Badges visuales de cara en las columnas de puerto para equipos de doble cara.
  - **Trazado Físico (`rack.js`):** Conexión SVG adaptativa a la cara activa (frontal vs. `.rear-port-jack`).
  - **Testing Automatizado:** Grupo 23 incorporado con 10 nuevas pruebas en `tests/integrity_check.cjs` y `tests/index.html` (370 pruebas al 100% de éxito).

## Next Steps
1. Mantenimiento del sistema y atención a nuevos requerimientos funcionales del usuario.
2. Preservar la integridad del 100% en la suite de 398 pruebas automatizadas.

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Arquitectura reactiva con Proxy nativo ES6 sin dependencias de compilación.
- **Cero Diálogos Bloqueantes:** Modales HTML5 interactivos accesibles para todas las operaciones.
- **Suite de Integridad 100% OK:** 381 pruebas automáticas en `tests/integrity_check.cjs` y `tests/index.html` pasando sin errores.
- **Actualización Obligatoria de Documentación:** Mantener sincronizados `memory-bank/` y `doc/log/CHANGELOG.md` en cada hito de desarrollo.
