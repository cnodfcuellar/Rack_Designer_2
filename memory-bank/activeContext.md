# Active Context

## Current Work Focus
Se implementó con éxito **`M-34: Creación gráfica e interactiva de conexiones en vista física (Drag-to-Connect)`**, culminando al **100% la Fase 2 (Core de Datos y Puertos)**. La vista física cuenta con botón de modo cableado `#btn-cable-mode`, cursor crosshair, previsualización elástica con curva Bézier cúbica SVG en tiempo real (`#rubberband-interactive-cable`), botones rápidos de cableado `.dev-btn.connect` en carátulas de rack y periféricos de piso, y preselección inteligente de dispositivos de origen/destino al abrir `CableModal.js`. La suite de pruebas automatizadas se ha elevado a **381 pruebas con 100% de éxito (24 grupos, 0 fallos)** en paridad total CLI y Web.

El foco activo continúa en el avance de las propuestas de mejora documentadas en [`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) y [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md).

## Recent Changes (Octubre 2026)
- **[2026-10-09] Implementación de M-34: Drag-to-Connect en Vista Física:**
  - **Modo Cableado Interactivo (`rack.js`, `rack.css`):** Botón `#btn-cable-mode` en toolbar, cursor crosshair, trazado interactivo elástico con curva Bézier SVG (`rubberBandDash`), resaltado pulsante del equipo origen (`.cable-mode-source`).
  - **Botones Directos en Carátulas:** `.dev-btn.connect` integrado en las acciones de equipos montados en rack y periféricos de piso (`faceplates.js`).
  - **Integración con Modal:** Preselección automática e inteligente de origen y destino en `CableModal.js` para configuración inmediata sin errores de tipeo ni fricción.
  - **Testing Automatizado:** Grupo 24 incorporado con 11 nuevas pruebas en `tests/integrity_check.cjs` y `tests/index.html` (381 pruebas al 100% de éxito, 0 fallos).
  - **Hito de Fase:** Fase 2 completada al 100% (8 de 8 tareas). Progreso global del roadmap: 37 de 42 tareas (88.1%).
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
