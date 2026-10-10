# Active Context

## Current Work Focus
Se implementó con éxito **`M-25A: Responsive Laptop & Modo Móvil Integral (Drawers, Bottom Sheet, Filtro Lupa, Scroll Horizontal y Modales Opacos)`**, elevando la suite de integridad a **396 pruebas con 100% de éxito (25 grupos, 0 fallos)** en paridad total CLI y Web.

El sistema cuenta ahora con:
- Off-Canvas Drawers para Catálogo (`#sidebar`) e Inspector (`#right-panel`) con backdrop oscuro (`#mobile-overlay`) y jerarquía de capas optimizada (`z-index: 10000`).
- Bottom Sheet reactivo en el panel inferior (`#bottom`), iniciando compacto a 38px y expandiéndose fluidamente a 72vh (`.sheet-expanded`).
- Filtro de tabla inferior móvil modo solo lupa (`#btn-toggle-table-search`) con popover flotante, autofoco y limpieza rápida `✕`.
- Scroll horizontal táctil fluido en la cabecera inferior (`.bottom-header`) con scrollbar delgada de 4px y menús desacoplados (`position: fixed`).
- Todas las ventanas modales adaptadas al 100% para móviles (≤ 768px y ≤ 480px), eliminando transparencias con fondo sólido `var(--bg-card)` y colapsando formularios a 1 columna.

El foco activo continúa en el avance de las propuestas de mejora documentadas en [`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) y [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md).

## Recent Changes (Octubre 2026)
- **[2026-10-10] Implementación de Modo Móvil Integral y Optimización Responsiva (M-25A / M-25B):**
  - **Cajones Laterales Móviles:** Off-Canvas Drawers para Catálogo (`#sidebar`) e Inspector (`#right-panel`) con backdrop interactivo `#mobile-overlay`.
  - **Hoja Inferior Táctil (Bottom Sheet):** `#bottom` compacto a 38px por defecto con expansión suave a 72vh al pulsar pestañas, tirador o botón `▲`.
  - **Filtro de Lupa en Barra Inferior:** `#btn-toggle-table-search` con popover flotante anclado, filtrado reactivo y botón de limpieza `✕`.
  - **Scroll Horizontal Táctil en Cabecera Inferior:** `overflow-x: auto` con scrollbar delgada y desacoplamiento de menús flotantes (`position: fixed`).
  - **Modales 100% Opacos y Responsivos:** Sustitución de `var(--bg-panel)` por `var(--bg-card)` (eliminando transparencias), `min-width: 0 !important`, y colapso de grids a 1 columna.
  - **Testing Automatizado:** Grupo 25 incorporado con 15 nuevas pruebas en `tests/integrity_check.cjs` (396 pruebas al 100% de éxito, 0 fallos).
- **[2026-10-09] Implementación de M-33: Cableado Frontal vs. Trasero:**
  - **Extensión del Modelo (`js/store.js`):** Soporte de `sourceSide` y `targetSide` en conexiones, método `isPortOccupied` con discriminación de cara `portSide`, validación de colisiones con etiquetas de cara (`[Frontal]` / `[Trasero]`), método `swapConnectionDirection` con transposición simétrica de caras y `getDevicePorts` con atributo `side`.
  - **Formulario Interactivo (`index.html` y `CableModal.js`):** Selectores `#cable-src-side` y `#cable-dst-side`, sincronización automática según `mountSide`, soporte en botón Swap `#btn-cable-swap` y badges de estado en el selector de puertos.
  - **Tabla de Conexiones (`tables.js`):** Badges visuales de cara en las columnas de puerto para equipos de doble cara.
  - **Trazado Físico (`rack.js`):** Conexión SVG adaptativa a la cara activa (frontal vs. `.rear-port-jack`).
  - **Testing Automatizado:** Grupo 23 incorporado con 10 nuevas pruebas en `tests/integrity_check.cjs` y `tests/index.html` (370 pruebas al 100% de éxito).

## Next Steps
Continuar con el roadmap técnico ([`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) / [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md)):
1. **Fase 3 — Ergonomía y Layout:**
   - **M-25A:** Optimización adaptativa y responsive para pantallas de Desktop y Laptops medianas (1024px – 1366px).
2. **Fase 6 — Colaboración y Resiliencia:**
   - **M-35:** Flexibilidad de ubicación sin restricciones arbitrarias (Rack vs Piso/Frente).
   - **M-07:** Resolución de conflictos multiusuario y versionado de proyectos.
   - **M-25B:** Modo móvil y tablet (Standby / Baja prioridad).

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Arquitectura reactiva con Proxy nativo ES6 sin dependencias de compilación.
- **Cero Diálogos Bloqueantes:** Modales HTML5 interactivos accesibles para todas las operaciones.
- **Suite de Integridad 100% OK:** 381 pruebas automáticas en `tests/integrity_check.cjs` y `tests/index.html` pasando sin errores.
- **Actualización Obligatoria de Documentación:** Mantener sincronizados `memory-bank/` y `doc/log/CHANGELOG.md` en cada hito de desarrollo.
