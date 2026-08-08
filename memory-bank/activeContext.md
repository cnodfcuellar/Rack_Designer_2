# Active Context

## Current Work Focus
El proyecto se encuentra en una fase de **estabilización, documentación y planificación de mejoras**. Se han completado rondas significativas de refinamiento de UI, corrección de bugs de seguridad y mejoras de arquitectura. El foco actual es documentar a fondo la base de código para facilitar el onboarding de nuevos desarrolladores y priorizar las mejoras pendientes listadas en `mejoras.md`.

## Recent Changes (Julio–Agosto 2026)
- **[2026-08-02] Documentación:** Reescritura completa de `CODEBASE_ORIENTATION_MAP.md` (de ~126 a ~500+ líneas) con recetas para novatos, API del Store, errores frecuentes y glosario técnico.
- **[2026-08-02] Documentación:** Creación de `doc/doc_md/roadmap_mejoras.md` con análisis de complejidad y dependencias de las 29 mejoras propuestas.
- **[2026-07-14] UI:** Undo/Redo en Topología, enrutamiento de cables por canaleta, catálogo agrupado, refactorización visual del Outliner, correcciones de CSS Grid y panel derecho.
- **[2026-07-13] Core:** Enrutamiento físico 2D de cables vía SVG dinámico, toggle UI para cables, atributos de anclaje en faceplates.
- **[2026-07-13] Documentación:** Reescritura del manual de usuario con SVGs didácticos, guías paso a paso y tutoriales de escenarios reales.
- **[2026-07-12] Seguridad:** SHA-256 fallback puro en JS para contextos inseguros (file:// y LAN), refactorización del modal de PIN, limpieza de variables CSS obsoletas.
- **Memory Bank:** Se implementó el sistema `memory-bank/` para persistencia de contexto entre sesiones de agentes IA.

## Next Steps
1. **Continuar con las mejoras de `mejoras.md`** — el archivo contiene 29+ propuestas priorizadas con análisis detallado.
2. **Prioridades inmediatas (Fase 1 — Core):**
   - Manejar `QuotaExceededError` en `store.js` para evitar pérdida silenciosa de datos.
   - Implementar gestión avanzada de puertos (validación de puertos ocupados, VLAN, submenú).
   - Refactorizar `demoData.js` para nueva estructura de puertos.
3. **Prioridades de UX (Fase 2):**
   - Buscador en catálogo de equipos.
   - Controles de edición en el Outliner.
   - Estandarización de alturas de racks (select con valores fijos).
   - Ancho fijo proporcional para slots de rack.

## Active Decisions & Considerations
- Mantener el entorno 100% Vanilla JS + `pnpm`. No se introducirán herramientas de build.
- Separación estricta de estado (Store) y renderizado DOM. Todas las actualizaciones de UI deben dispararse desde el Proxy ES6 en `store.js`.
- La documentación técnica (`CODEBASE_ORIENTATION_MAP.md`, `ARCHITECTURE_GUIDE.md`) se mantiene como fuente de verdad para onboarding.
- El archivo `mejoras.md` es la fuente de verdad para propuestas de mejora; `roadmap_mejoras.md` analiza su complejidad y dependencias.
