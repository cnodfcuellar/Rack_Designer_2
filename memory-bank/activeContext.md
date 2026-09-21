# Active Context

## Current Work Focus
El proyecto ha completado con éxito el **Sprint 3** (Gestión Jerárquica Outliner & Inspector: M-36, M-23, M-38, M-24), precedido por el **Sprint 1** (Blindaje de Almacenamiento y Quick Wins Físicos) y el **Sprint 2** (Modal reactivo de salas, catálogo en 7 familias comerciales y buscador global en tiempo real).
Se alcanzó el **100% de la Fase 1 (Quick Wins y Ergonomía)** y el **50% de la Fase 3 (Navegación y Productividad)**, con un total de **18 mejoras implementadas y 20 pendientes** en el roadmap. La suite de pruebas de integridad cuenta con **65 pruebas automatizadas al 100% de éxito** en CLI y navegador.

## Recent Changes (Septiembre 2026)
- **[2026-09-19] Sprint 3 de Mejoras (M-36, M-23, M-38, M-24):**
  - **M-36:** CRUD integral de Salas, Racks y Equipos desde el panel Inspector con Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`), vistas contextuales con cálculo de U y funciones de eliminación seguras con RBAC (`deleteRoomFromInspector`, `deleteRackFromInspector`, `deleteDeviceFromInspector`).
  - **M-23:** Botones de creación rápida en cabecera del Outliner (`+ Sala`, `+ Rack`, `+ Equipo`) y botones inline contextuales `✏️` y `🗑️` por nodo en el árbol jerárquico con confirmación `customConfirm`.
  - **M-38:** Selector de ordenamiento en Outliner (`#outliner-sort-select`) con 4 modos reactivos: `slot` (posición U), `name-asc` (A→Z), `name-desc` (Z→A) y `type` (familia funcional).
  - **M-24:** Inspector colapsable interactivo con rotación de chevron `▼` y expansión fluida del Outliner en panel derecho (`flex: 1 1 180px`).
  - **PWA & Cache:** Actualización a `rack-designer-next-cache-v9`.
  - **Testing:** 13 nuevas pruebas en el Grupo 8 de `tests/integrity_check.cjs` (65/65 tests pasando al 100%).
- **[2026-09-19] Sprint 2 de Mejoras (M-09, M-11, M-12):**
  - **M-09:** Modal reactivo unificado `#modal-room` con título dinámico ("Nueva Sala" / "Editar Sala"), botones contextuales y verificación RBAC. Botones de edición táctil `✏️` (`.room-edit-btn`) en cada pestaña de sala del catálogo. Erradicación total del `prompt()` nativo.
  - **M-11:** Reorganización del catálogo vertical de 50px en 7 familias comerciales estándar (`CATALOG_GROUPS`), consolidando conmutadores, cortafuegos, routers, APs y patch panels en el grupo "Redes" (#38bdf8). Altura del sidebar reducida a < 350px.
  - **M-12:** Categoría superior "Todos" (`id: 'all'`) en la cima del catálogo e integración del motor de búsqueda reactivo en tiempo real `#catalog-search` sin restricciones de categoría. Iconos vectoriales offline para `grid`, `search` y `network`.
  - **PWA & Cache:** Actualización a `rack-designer-next-cache-v8`.
  - **Testing:** 10 nuevas pruebas en el Grupo 7 de `tests/integrity_check.cjs` (52/52 tests pasando al 100%).
- **[2026-09-19] Sprint 1 de Mejoras (M-02, M-05, M-10, M-13, M-14, M-15, M-16):**
  - Manejo defensivo de `QuotaExceededError` (`M-02`).
  - Doble slot de respaldo anti-corrupción (`M-05`).
  - Borde de 1.5px y sombra tridimensional de gabinete (`M-10`).
  - Ancho de slots a 240px exactos en relación 10:1 (`M-14`).
  - Grilla técnica CAD milimétrica con paso de 24px (`M-15`).
  - Alineación de equipos de piso con `min-width: 584px` (`M-13`).
  - Selector de alturas comerciales normalizadas (42U default) (`M-16`).
- **[2026-09-19] Reorganización de Recursos Estáticos:**
  - Migración de carpeta `default/` a `assets/default/`, dejando la raíz limpia.
- **[2026-09-19] Corrección Integral de Errores y Auto-Saneamiento:**
  - Persistencia de sesión de admin ante F5 vía `sessionStorage`.
  - Cascada de borrado de conexiones y nodos topológicos en `deleteRack()` y `deleteDevice()`.
  - Función `_sanitize()` para purgar referencias corruptas en carga de datos.

## Next Steps
Continuar con el roadmap técnico ([`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) / [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md)):
1. **Fidelidad Visual y Exportación:**
   - **M-37:** Fidelidad 1:1 en exportación de imágenes PNG vía `html2canvas`.
   - **M-19:** Exportar propiedades completas del Inspector en la tabla de inventario.
2. **Seguridad y Cifrado:**
   - **M-01:** Cifrado WebCrypto AES-GCM para almacenamiento seguro de credenciales y datos sensibles.
3. **Ergonomía de Cableado:**
   - **M-34:** Conexiones interactivas en vista física arrastrando puertos (*Drag-to-Connect*).

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Arquitectura reactiva con Proxy nativo ES6. Sin build step ni frameworks.
- **Cero Diálogos Bloqueantes:** Todos los formularios de salas, racks, equipos y conexiones utilizan modales HTML5 accesibles y reactivos.
- **Suite de Integridad:** `tests/integrity_check.cjs` valida automáticamente antes de cada entrega el 100% de la lógica de negocio, seguridad, integridad de datos y renderizado.
- **Respaldo en Git:** Solo bajo petición explícita del usuario.
- **Mantenimiento del Changelog:** Registro obligatorio en `doc/log/CHANGELOG.md` tras cada modificación.
