# Active Context

## Current Work Focus
El proyecto ha completado con éxito la **Modernización Integral del Catálogo Arquitectónico Profesional**, la incorporación de la familia **Seguridad y CCTV** (NVR, DVR, Decoder), la inclusión formal de **Patch Panel y ODF** en Accesorios, y la **Persistencia de Equipos Personalizados por Proyecto** (`customCatalog`) con ciclo de vida completo y reset en nuevo proyecto. La suite de pruebas de integridad se ha expandido a **82/83 pruebas automatizadas al 100% de éxito** en CLI (`pnpm test`) y navegador (`tests/index.html`).

## Recent Changes (Septiembre 2026)
- **[2026-09-22] Exportación de Sala Completa en Vista Dual (Frente + Dorso Modular por Gabinete):**
  - **Disposición Modular por Gabinete (`mode === 'dual'`):** Cada rack en la sala completa se exporta dentro de un recuadro cerrado e independiente con borde y franja superior de su color asignado (`rack.color`), cabecera con `GABINETE: [NOMBRE]`, ocupación `[X]U · [Y]U USADAS · [Z]W`, badge `VISTA DUAL (F+T)` y columnas interiores `VISTA FRONTAL` y `VISTA TRASERA` lado a lado.
  - **Lienzo Panorámico General de Datacenter:** Módulos ensamblados horizontalmente con espaciado técnico de 40px (80px Retina 2x), cabecera general con métricas globales consolidadas y badge `VISTA DUAL PANORÁMICA`.
  - **Integración con Equipos de Piso:** Inclusión de periféricos al pie con borde `#f59e0b` e iconografía vectorial nítida trazada con `drawFloorIconCanvas`.
  - **Doble Modalidad en Modal (`openPNGModal`):** Botón principal `#btn-export-entire-room-dual` (Vista Dual Frente + Dorso) y botón secundario `#btn-export-entire-room` (Vista Actual 1:1).
  - **Fallback Procedural 2D:** Soporte completo en Canvas 2D (`_fallbackExportRoomToPNG`) para entornos donde `html2canvas` falle o no esté presente.
  - **Service Worker & Testing:** Caché actualizada a `rack-designer-next-cache-v30` y 119/119 pruebas de integridad pasando al 100%.
- **[2026-09-22] Iconografía Vectorial en Exportación de Equipos de Piso (1:1 y Fallback 2D):**
  - **Trazado Vectorial en Fallback (`drawFloorIconCanvas`):** Implementación de trazado vectorial en Canvas 2D para todos los periféricos de piso (`camera`, `printer`, `phone`, `ap`, `pc`, `door`), integrando cajita con esquinas redondeadas y fondo tintado idéntica a la UI.
  - **Resolución de Compatibilidad con `html2canvas`:** Reemplazo de `color-mix()` por `rgba()`, inyección de atributos explícitos `width="22" height="22"` en SVGs y ocultamiento de botones de acción durante la captura.
  - **Service Worker & Testing:** Caché actualizada a `rack-designer-next-cache-v29` y 117/117 pruebas de integridad pasando al 100%.
- **[2026-09-22] Exportación de Gabinetes en Ambos Lados (Frontal + Trasera 1:1):**
  - **Captura y Composición Dual (`exportRackToPNG` con `side === 'both'`):**
    - Se implementó la captura secuencial de la cara Frontal y la cara Trasera en alta resolución Retina (`scale: 2`), combinándolas horizontalmente en un único lienzo de imagen con espaciado técnico de 36px y fondo adaptativo del tema.
    - Se agregaron botones independientes en cada tarjeta de gabinete del modal: `Frontal`, `Trasera` y `Ambos Lados` (resaltado).
    - Descarga automática con el sufijo `${rack.name}_Ambos_Lados.png`.
  - **Service Worker & Testing:** Caché actualizada a `rack-designer-next-cache-v28` y 117/117 pruebas de integridad pasando al 100%.
- **[2026-09-22] Estabilización Definitiva de Exportación de Toda la Sala Completa a PNG (Alta Fidelidad 1:1):**
  - **Aislamiento Seguro en Captura de Sala (`exportRoomToPNG`):**
    - Se eliminó el uso de `ignoreElements` en `html2canvas` (causante de caídas silenciosas al fallback procedural 2D) y se reemplazó por la aplicación directa de `style.display = 'none'` sobre controles interactivos (`#canvas-btn-add-rack`, `#floor-btn-add-device`, `.device-actions`, `.btn-flip-rack`, etc.), restaurando sus estados en el bloque `finally`.
    - **Protección de SVG de Cables Vacío:** Al exportar salas sin cables dibujados, se oculta completamente el elemento `<svg id="physical-cables-svg">` (`display: 'none'`), evitando fallas de serialización SVG de Chromium en protocolo local `file:///`.
    - **Amplitud y Proporción Natural (`max-content`):** Se aplica `width: max-content`, `minWidth: max-content` y `boxSizing: border-box` en `#view-physical-content` durante la captura para garantizar que todos los gabinetes se alineen horizontalmente con holgura e impecable resolución, sin saltos de línea ni recortes.
    - **Diagnóstico y Reporte Claro:** Captura y notificación explícita de errores en la interfaz si la captura 1:1 llegase a fallar antes de recurrir al renderizador alternativo.
  - **Service Worker & Testing:** Caché actualizada a `rack-designer-next-cache-v27` y 117/117 pruebas de integridad pasando limpiamente al 100%.
- **[2026-09-22] Reparación y Fidelidad 1:1 en Exportación PNG de Gabinetes Individuales:**
  - **Resolución de Canvas Tainted (`SecurityError`):** Inyección de `EMBEDDED_SVG_CACHE` con los 18 SVGs nativos directamente en memoria dentro de `faceplates.js`. Esto elimina la dependencia de `fetch()` (bloqueado por CORS en protocolo `file:///`) y erradica las etiquetas `<img>` que contaminaban el canvas. Ahora `html2canvas` genera el PNG de hardware real 1:1 sin caer en el fallback.
  - **Aplanado 3D Temporal para html2canvas:** Neutralización transitoria de `perspective: none`, `transform: none`, `transform-style: flat` y `transition: none` en `.rack-wrapper` y `.rack-flipper` con restauración exacta en bloque `finally`.
  - **Aislamiento de Caras (Frontal vs. Trasera):** Eliminación del solapamiento parásito ocultando la cara inactiva (`display: none`) y colocando la activa en flujo relativo sin rotaciones 3D.
  - **Orientación Real en Fallback:** Corrección en `_fallbackExportRackToPNG` para que U1 esté en la base y U12/U42 en el tope.
  - **Adaptación al Tema Dinámico:** Uso de `getActiveThemeBg()` para leer el color de fondo `--bg-main` según el tema activo (`data-theme="light"` o modo oscuro), tanto en `html2canvas` como en los renderizadores procedimentales Canvas 2D.
  - **Soporte Frontal / Trasera en Modal:** Detección de equipos en cara trasera en `openPNGModal()` para ofrecer exportación directa e independiente de ambas vistas.
  - **Compensación de Zoom / Pan:** Reset temporal de `phys.style.zoom` y `transform` durante la captura para evitar recortes y desplazamientos.
- **[2026-09-21] Catálogo Arquitectónico Profesional, Seguridad/CCTV y Equipos Personalizados por Proyecto:**
  - **Enfoque Genérico / Arquitectónico:** Estandarización a 30 plantillas limpias de centro de datos sin marcas arbitrarias (Servidores 1U/2U/4U/Blade, Switches 24P/48P/Core/Agregación, Routers de borde, Firewalls UTM, Cabinas SAN, NAS 2U, JBOD, UPS Online 1500/3000, PDUs, Organizadores, Bandejas, etc.) con potencias (W) y puertos reales.
  - **Nueva Categoría Seguridad y CCTV (`security`):** Creación de la familia comercial con NVR 1U/2U, DVR 1U y Decodificador de Video Wall 1U, acompañados de iconos vectoriales dedicados (`SVG_ICONS`).
  - **Reorganización en 8 Familias (`CATALOG_GROUPS`):** `network` exclusiva para activos, `accesorios` integrando Patch Panels y Bandeja de Fibra Óptica (ODF), más cómputo, storage, security, power, kvm y floor.
  - **Equipos Personalizados por Proyecto (`customCatalog`):** Persistencia en el store de plantillas creadas por el usuario, badge visual `PROYECTO`, inclusión en archivos exportados `.rack` / `.json`, y retorno automático al catálogo por defecto al crear un nuevo proyecto.
  - **PWA & Cache:** Actualización a `rack-designer-next-cache-v11`.
  - **Testing:** 83 pruebas en `tests/integrity_check.cjs` y 82 pruebas en `tests/index.html` pasando limpiamente al 100%.
- **[2026-09-21] Sprint 4 de Mejoras (M-37, M-19, M-30):**
  - **M-37:** Fidelidad visual 1:1 en la exportación de imágenes PNG utilizando `html2canvas.min.js` a escala Retina (`scale: 2`) sobre fondo `#090d17` con fallback procedimental a Canvas 2D. Regla CSS `.exporting-capture` para ocultar controles de UI flotantes durante la captura.
  - **M-19:** Nuevas columnas en la tabla de inventario (`Tamaño`, `Skin`, `Notas`) con edición interactiva en celda (`dblclick`), validación numérica de tamaño, persistencia directa en el store (`finishCellEdit`) y sincronización completa con la exportación CSV.
  - **M-30:** Buscador reactivo en tiempo real (`#qp-dev-search`) en el modal de catálogo asistido (`#modal-quick-placement`) con función `filterQPCatalog()`, selección inteligente y recálculo de slots disponibles.
  - **PWA & Cache:** Actualización a `rack-designer-next-cache-v10` con precaché de `js/html2canvas.min.js`.
  - **Testing:** 13 nuevas pruebas en el Grupo 9 de `tests/integrity_check.cjs` y en `tests/index.html` (78/78 tests pasando al 100%).
- **[2026-09-19] Sprint 3 de Mejoras (M-36, M-23, M-38, M-24):**
  - **M-36:** CRUD integral de Salas, Racks y Equipos desde el panel Inspector con Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`), vistas contextuales con cálculo de U y funciones de eliminación seguras con RBAC (`deleteRoomFromInspector`, `deleteRackFromInspector`, `deleteDeviceFromInspector`).
  - **M-23:** Botones de creación rápida en cabecera del Outliner (`+ Sala`, `+ Rack`, `+ Equipo`) y botones inline contextuales `✏️` y `🗑️` por nodo en el árbol jerárquico con confirmación `customConfirm`.
  - **M-38:** Selector de ordenamiento en Outliner (`#outliner-sort-select`) con 4 modos reactivos: `slot` (posición U), `name-asc` (A→Z), `name-desc` (Z→A) y `type` (familia funcional).
  - **M-24:** Inspector colapsable interactivo con rotación de chevron `▼` y expansión fluida del Outliner en panel derecho (`flex: 1 1 180px`).
  - **PWA & Cache:** Actualización a `rack-designer-next-cache-v9`.
  - **Testing:** 13 nuevas pruebas en el Grupo 8 de `tests/integrity_check.cjs` (65/65 tests pasando al 100%).
- **[2026-09-19] Sprint 2 de Mejoras (M-09, M-11, M-12):**
  - **M-09:** Modal reactivo unificado `#modal-room` con título dinámico, botones contextuales y verificación RBAC. Botones de edición táctil `✏️` en cada pestaña de sala del catálogo.
  - **M-11:** Reorganización del catálogo vertical de 50px en 7 familias comerciales estándar (`CATALOG_GROUPS`), consolidando "Redes" (#38bdf8).
  - **M-12:** Categoría superior "Todos" (`id: 'all'`) en la cima del catálogo e integración del motor de búsqueda reactivo en tiempo real `#catalog-search`.
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

## Next Steps
Continuar con el roadmap técnico ([`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) / [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md)):
1. **Seguridad y Cifrado (Fase 0):**
   - **M-01:** Cifrado WebCrypto AES-GCM para almacenamiento seguro de credenciales y datos sensibles en localStorage.
2. **Gestión de Puertos y Cableado (Fase 2):**
   - **M-26:** Gestión avanzada de puertos, validación de ocupación y soporte VLAN.
   - **M-33:** Cableado frontal vs. trasero.
3. **Ergonomía de Cableado (Fase 2):**
   - **M-34:** Conexiones interactivas en vista física arrastrando puertos (*Drag-to-Connect*).

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Arquitectura reactiva con Proxy nativo ES6. Sin build step ni frameworks.
- **Cero Diálogos Bloqueantes:** Todos los formularios de salas, racks, equipos y conexiones utilizan modales HTML5 accesibles y reactivos.
- **Suite de Integridad:** `tests/integrity_check.cjs` valida automáticamente antes de cada entrega el 100% de la lógica de negocio, seguridad, integridad de datos y renderizado.
- **Respaldo en Git:** Solo bajo petición explícita del usuario.
- **Mantenimiento del Changelog:** Registro obligatorio en `doc/log/CHANGELOG.md` tras cada modificación.
