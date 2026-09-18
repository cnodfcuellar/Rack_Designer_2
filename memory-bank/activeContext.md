# Active Context

## Current Work Focus
El proyecto ha completado exitosamente la transición al **Motor Visual SVG-First con Animaciones GPU**, sustituyendo el anterior renderizado procedimental CSS por 16 gráficos vectoriales SVG independientes con animaciones `@keyframes` nativas. Además, se sincronizó de manera exhaustiva toda la documentación técnica, manuales, mapa de orientación y roadmap de mejoras (`mejoras.md`, `roadmap_mejoras.md`, `informe_mejoras_e_implementacion.md`).

## Recent Changes (Septiembre 2026)
- **[2026-09-18] Renderizado SVG-First:**
  - Creación y exportación de 16 archivos SVG animados (`server_1u.svg`, `server_2u.svg`, `switch_24p.svg`, etc.) en `assets/svg/default/` y `default/`.
  - Refactorización de `js/ui/faceplates.js` implementando inyección dinámica SVG inline (`SVG_INLINE_CACHE`) para optimizar el rendimiento y permitir control total de estilos.
  - Limpieza de `css/components/faceplates.css` eliminando más de 700 líneas de código procedural obsoleto.
- **[2026-09-18] Control de Animaciones (Bugfix Status Dot):**
  - Solución al problema donde el botón de estado `.status-dot` (`body.no-animations`) no congelaba las animaciones de los equipos. Al inyectar los SVGs inline, las reglas CSS globales (`body.no-animations svg.faceplate-img *`) ahora pausan los LEDs en tiempo real.
  - Feedback visual con notificación toast al alternar el estado del sistema.
- **[2026-09-18] PWA y Service Worker:**
  - Actualización a `rack-designer-next-cache-v5` en `service-worker.js`.
  - Integración de `reg.update()` en `index.html` para forzar invalidación de caché y auto-actualización inmediata.
- **[2026-09-18] Roadmap e Informes:**
  - Sincronización completa de `doc/doc_md/roadmap_mejoras.md` (37 propuestas, tareas M-30 a M-38, matriz de complejidad y grafos Mermaid).
  - Creación de `informe_mejoras_e_implementacion.md` con análisis arquitectónico y diagramas de flujo.
  - Actualización de `ARCHITECTURE_GUIDE.md`, `CODEBASE_ORIENTATION_MAP.md`, `USER_MANUAL.md` y `CHANGELOG.md`.

## Next Steps
1. **Continuar con las propuestas de mejoras descritas en [mejoras.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md):**
   - **M-37:** Fidelidad visual 1:1 en exportación de imágenes con `html2canvas` (Quick Win).
   - **M-34:** Drag-to-Connect en vista física (conexiones interactivas arrastrando puertos).
   - **M-36:** CRUD integral de Salas y Racks directamente desde el Inspector.
   - **M-30:** Buscador en catálogo de equipos del modal.
2. **Prioridades de Robustez:**
   - Manejo de `QuotaExceededError` en `store.js`.
   - Validación de ocupación de puertos y soporte VLAN.

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Cero frameworks, sin compiladores ni bundlers.
- **Motor SVG-First:** Todos los equipos se renderizan como vectores SVG independientes y modulares, garantizando escala 1:1 y nitidez en cualquier resolución y zoom.
- **Respaldo en Git:** Únicamente bajo comando explícito del usuario.
- **Mantenimiento del Changelog:** Registro obligatorio en `doc/log/CHANGELOG.md` tras cada modificación.
