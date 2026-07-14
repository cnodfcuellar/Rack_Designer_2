## [2026-07-14] Refinamiento de Interfaz de Usuario y Saneamiento

### Añadido y Modificado
- **Deshacer/Rehacer en Topología:** Se implementó soporte completo para `Ctrl+Z` y `Ctrl+Y` en la vista de Topología. Ahora se captura un *snapshot* inteligente al iniciar el arrastre o redimensionado, permitiendo restaurar posiciones en el canvas correctamente.
- **Catálogo Agrupado:** Se agruparon los elementos del catálogo: el organizador y la bandeja fija ahora están en el grupo "accesorios", y los UPS y PDU en "energia". Consola KVM y patchpanel también fueron agrupados correctamente.
- **Mejoras del Outliner:** Se refactorizó visualmente el Outliner para que utilice detalles nativos `<details>` y `<summary>` permitiendo contraer los nodos, además se aplicaron mejoras visuales (padding, hover states y flexbox).
- **CSS Grid (Layout):** Se corrigió la pista central del grid (`1fr` a `minmax(0, 1fr)`) que estaba empujando el panel inferior (`#bottom`) fuera de la pantalla.
- **Dimensiones del Panel Derecho:** Se estandarizó el ancho del panel derecho (`#right-panel`) a `300px` (variable `--right-panel-w`). Se estableció una altura fija estricta de `180px` para la subsección de Estadísticas (`#stats-section`), permitiendo al Inspector de propiedades absorber el espacio sobrante fluidamente.
- **Limpieza de Scripts:** Los scripts temporales de Python (`patch*.py`) utilizados para inicializar datos de prueba fueron movidos de la raíz del proyecto al subdirectorio correcto `.py/` conforme a la arquitectura definida en `AGENTS.md`.

---

## [1.2.0] - 2026-07-13
### Añadido
- **Enrutamiento Físico 2D:** Implementación de trazado ortogonal de cables mediante un `<svg>` dinámico superpuesto a la vista física en `rack.js`.
- **Interruptor UI:** Toggle deslizable `.ui-switch` en la barra superior para mostrar/ocultar cables con estado apagado por defecto.
- **Atributos de Anclaje:** Inyección de `data-device-id` y `data-port` en plantillas de `faceplates.js` para ruteo del DOM.

### Modificado
- **Diseño UI:** Se ajustó la cabecera eliminando el separador entre Data Center y Racks, y se unificaron las pestañas "Vista Física" y "Topología" como un control segmentado para coincidir con el diseño propuesto.
- **Diseño UI:** Se redujo el ancho de la barra lateral (sidebar) y de la zona del logo a 240px ajustando la variable `--sidebar-w` en `css/variables.css`.

### Solucionado
- Error de sintaxis en el evento de rotación de ventana que rompía la aplicación.

---

## [2026-07-13] Saneamiento de Deuda TÃ©cnica y Manual de Usuario Definitivo

### Saneamiento de Estructura y CÃ³digo Muerto
- **EliminaciÃ³n de Directorios Residuales:** Eliminada la carpeta vacÃ­a `js/core/` y la carpeta `js/service/` (junto con su archivo duplicado inactivo `service-worker.js`).
- **Limpieza de DocumentaciÃ³n:** Actualizado el archivo [README.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/README.md) y las reglas en [AGENTS.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/AGENTS.md) para remover referencias obsoletas a `js/models/`, `js/api/` y `js/core/`, sincronizando los manuales tÃ©cnicos con el estado real del repositorio.

### DocumentaciÃ³n de Usuario y Ayudas Visuales
- **Reescritura del Manual de Usuario:** Redactado un manual de usuario completo y amigable para principiantes en [USER_MANUAL.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/USER_MANUAL.md).
- **Esquemas de Ayuda Visual (SVGs):** Creados 3 diagramas didÃ¡cticos embebidos en el manual:
  - [manual_ui_overview.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_ui_overview.svg) (corregido segÃºn el CSS Grid de la interfaz real del proyecto).
  - [manual_rack_anatomy.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_rack_anatomy.svg) (explicaciÃ³n de racks y unidades U).
  - [manual_action_flow.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_action_flow.svg) (flujo interactivo bÃ¡sico).
- **Tutoriales Paso a Paso:** AÃ±adidas guÃ­as para 3 escenarios de diseÃ±o reales (HÃ­brido, Solo Racks, y Solo Piso).

---

## [2026-07-12] AuditorÃ­a de CÃ³digo y ResoluciÃ³n de Errores de DiseÃ±o y Seguridad

### CorrecciÃ³n de Errores de Seguridad y Integridad offline
- **Integridad de SesiÃ³n y Hashing SHA-256 en contextos inseguros:** En `js/auth/roles.js`, se implementÃ³ una funciÃ³n pura de JS `sha256_fallback` y un generador UUID aleatorio alternativo. Esto previene fallos fatales e interrupciones en el login al ejecutar la aplicaciÃ³n en entornos no seguros (como a travÃ©s de una IP de red local `http://192.168.x.x` o mediante el protocolo local `file://`), garantizando el funcionamiento offline al 100%.

### AlineaciÃ³n del Sistema de DiseÃ±o (Compliance con DESIGN.md)
- **Diagrama de Arquitectura Actual:** Creado un nuevo diagrama SVG en [architecture_current.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/architecture_current.svg) que documenta las capas del sistema, flujos de datos reactivos del Store, y los nuevos mecanismos de integridad/seguridad local. Vinculado en [ARCHITECTURE_GUIDE.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/ARCHITECTURE_GUIDE.md).
- **Diagrama de Flujo de ComunicaciÃ³n:** Creado un nuevo diagrama de flujo en [file_communication_flow.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/file_communication_flow.svg) detallando la comunicaciÃ³n inter-mÃ³dulo, llamadas a mutadores del Store, eventos de reactividad y disparo del render pipeline. Vinculado en [ARCHITECTURE_GUIDE.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/ARCHITECTURE_GUIDE.md).
- **RefactorizaciÃ³n del Modal de Cambio de PIN:** Se eliminaron los estilos inline en el elemento `#modal-change-pin` dentro de `index.html` y se asignaron clases estÃ¡ndar `.modal`, `.form-row`, `.btn-confirm` y `.btn-cancel`. Esto asegura consistencia visual de botones de 24px de altura y proporciona compatibilidad automÃ¡tica y nativa con el **Tema Claro**.
- **Variables CSS Indefinidas:** Reemplazadas las llamadas a `var(--text)` por `var(--text-primary)` en `layout.css`, `outliner.js` e `inspector.js`. Reemplazadas las referencias a `var(--blue)` por la variable estÃ¡ndar de acento cian `var(--accent)` en `layout.css` e `inspector.js`.
- **Limpieza de variables obsoletas:** Eliminada la variable redundante `--purple` en `variables.css`. Se actualizaron los estilos de badges de usuario en `js/main.js` para usar `var(--accent)` y `var(--accent-glow)`.
- **Limpieza de DiÃ¡logos:** Se simplificÃ³ la estructura y estilo del overlay en `customConfirm` de `js/utils.js` usando clases de CSS estandarizadas, asignando la clase de peligro nativa `.btn-confirm.danger` para la confirmaciÃ³n.

### Robustez y Blindaje contra Excepciones en Tooltips
- **Seguridad en Tooltips de TopologÃ­a:** Modificado `TopologyRenderer.js` para asegurar de forma robusta la lectura y conversiÃ³n a mayÃºsculas del tipo de dispositivo mediante `String(dev.type || 'unknown').toUpperCase()`, evitando que propiedades nulas causen excepciones que interrumpan el bucle de renderizado del canvas.
- **Seguridad en Modales:** Aplicado el mismo blindaje de tipo seguro en `PlacementModal.js` y `ExportModal.js`.

---

## [2026-07-11] Reemplazo Masivo de Emojis por SVG Icons â€” Design System Compliance

### Cambio Principal: EliminaciÃ³n de Emojis del Codebase
- **~140 emojis reemplazados** por `<i class="svg-icon icon-X"></i>` SVG icons en todo el proyecto
- **32 nuevas clases de iconos SVG** agregadas a `css/components/misc.css` (mask-image pattern)
- Iconos nuevos: `icon-menu`, `icon-folder`, `icon-save`, `icon-sun`, `icon-moon`, `icon-eye`, `icon-eye-off`, `icon-upload`, `icon-download`, `icon-x`, `icon-sliders`, `icon-maximize`, `icon-chart`, `icon-flame`, `icon-database`, `icon-battery`, `icon-plug`, `icon-check`, `icon-warning`, `icon-crown`, `icon-prohibited`, `icon-rotate`, `icon-sparkle`, `icon-layout`, `icon-kebab`, `icon-paperclip`
- Iconos existentes reutilizados: `icon-bolt`, `icon-lock`, `icon-edit`, `icon-trash`, `icon-image`, `icon-file`, `icon-desktop`, `icon-building`, `icon-server`

### Archivos Modificados
- **index.html** â€” Todos los emojis en botones, divs, spans, modales reemplazados. Emojis en `<option>` y `<title>` eliminados/conservados (imposible usar HTML en estos elementos)
- **js/main.js** â€” Badge de usuario (textContentâ†’innerHTML), toggle theme, toggle passwords, expand/contrar, notificaciones
- **js/ui/rack.js** â€” Empty state icon, device action buttons, flip button, dropdown menus, context menu, floor section button
- **js/ui/catalog.js** â€” Context menu items, notificaciones de viewer
- **js/ui/tables.js** â€” Edit/delete action buttons
- **js/ui/modals/ExportModal.js** â€” PNG export button text
- **js/ui/modals/DeviceModal.js** â€” **Bug fix**: Iconos de catÃ¡logo corruptos (emojis como `ðŸ’»` en vez de paths como `assets/icons/floor/pc.svg`)
- **js/ui/modals/RackModal.js** â€” Notificaciones de viewer
- **js/ui/modals/PlacementModal.js** â€” Titles, room/rack option text
- **js/ui/topology/TopologyLayout.js** â€” NotificaciÃ³n de auto-orden
- **js/utils.js** â€” Notify function (Unicode symbols â†’ SVG icons), customConfirm dialog

### Bug Fix Adicional
- **DeviceModal.js icon paths**: Los iconos de catÃ¡logo se asignaban como emojis (`ðŸ’»`, `ðŸ–¥`, etc.) que nunca se renderizaban en el grid. Corregido a rutas SVG reales (`assets/icons/floor/pc.svg`, `assets/icons/server/server.svg`, etc.)
- **rack.js purple leftover**: BotÃ³n "Agregar Equipo" del floor section todavÃ­a usaba `rgba(139,92,246,0.15)` y `var(--purple)`. Corregido a `rgba(56,189,248,0.15)` y `var(--accent)`

### Nota sobre Emojis Restantes
- `<title>âš¡ RACK Designer Next</title>` â€” Conservado (imposible usar HTML en title)
- `âœ•` Unicode (U+2715) en close buttons â€” Conservado (carÃ¡cter estÃ¡ndar de UI, no emoji)

---

## [2026-07-11] CorrecciÃ³n Masiva de Bugs, Limpieza de CÃ³digo Muerto y OptimizaciÃ³n de Performance

### Correcciones CrÃ­ticas (8 bugs)
- **Bug #1 â€” CatÃ¡logo eliminaba TODAS las plantillas:** `CATALOG = CATALOG.filter(...)` reasignaba el array completo. Corregido a `CATALOG.length = 0; CATALOG.push(...)` para preservar la referencia.
- **Bug #2 â€” Service Worker con paths incorrectos:** `service-worker.js` referenciaba archivos inexistentes (`js/core/store.js`, `js/core/RackAuth.js`, `js/ui/canvas.js`). Reescrito con las rutas reales del proyecto. Cache name cambiado de `rack-designer-next-cache-v1` a `rack-designer-next-cache-v2`.
- **Bug #3 â€” Doble render al cambiar sala:** `catalog.js` llamaba `store.setCurrentRoom()` + `store._emit('change')` duplicando el evento. Eliminada la emisiÃ³n manual.
- **Bug #4 â€” Inspector mostraba `Uundefined`:** `inspector.js:48` usaba `dev.position` (inexistente). Corregido a `dev.slotStart`.
- **Bug #5 â€” deleteRoom dejaba huÃ©rfanos en topologÃ­a:** Las posiciones de `roomPositions`, `rackPositions`, `nodePositions` no se limpiaban al eliminar una sala. Agregado mÃ©todo `_cleanTopologyPositions()` en `store.js`.
- **Bug #6 â€” deleteRack dejaba huÃ©rfanos en topologÃ­a:** Mismo problema que Bug #5 pero al eliminar un rack. `deleteRack()` ahora llama `_cleanTopologyPositions()`.
- **Bug #7 â€” deleteRoom no actualizaba estadÃ­sticas:** `renderAll()` no incluÃ­a `renderStats()` en el branch de `Room`. Agregada la llamada.
- **Bug #8 â€” Pan/Zoom causaba ~60 writes/sec a localStorage:** `setPan()` y `setZoom()` llamaban `_save()` en cada mousemove. Agregado mÃ©todo `_saveDebounced()` con `requestAnimationFrame` para agrupar escrituras.

### Correcciones Adicionales
- **Bug #9 â€” Doble registro Service Worker:** `main.js` y `index.html` ambos registraban el SW. Eliminada la lÃ­nea redundante de `main.js`.

### OptimizaciÃ³n
- **Eliminados `renderStats()` duplicados:** `main.js` tenÃ­a llamadas duplicadas en los branches de loadData/undo/redo y Rack.

### EliminaciÃ³n de CÃ³digo Muerto (6 archivos)
- `js/models/Rack.js`, `Device.js`, `Cable.js` â€” Clases nunca instanciadas
- `js/api/apiClient.js` â€” MÃ³dulo nunca importado (stubs)
- `js/core/export.js` â€” MÃ³dulo nunca importado (stubs)
- `js/ui/topology.js` â€” Archivo vacÃ­o (solo comentario)
- Eliminados directorios vacÃ­os `js/models/` y `js/api/`
- Eliminado `<script>` tag de `topology.js` en `index.html`
- Eliminada entrada de cache en `service-worker.js`

### MÃ©todos Nuevos en store.js
- `updateRoom(id, props)` â€” Actualiza propiedades de una sala
- `setCurrentRoom(id)` â€” Cambia la sala activa
- `setZoom(view, value)` â€” Establece zoom con debounce
- `setPan(view, x, y)` â€” Establece pan con debounce
- `deleteRoom(id)` â€” Elimina sala con limpieza de topologÃ­a
- `_cleanTopologyPositions({ roomIds, rackIds, deviceIds })` â€” Limpia posiciones obsoletas
- `_saveDebounced()` â€” Escritura diferida con `requestAnimationFrame`

### Archivos Modificados
- `js/store.js` â€” Nuevos mÃ©todos, debounce, limpieza de topologÃ­a
- `js/main.js` â€” Eliminado SW duplicado, eliminados renderStats duplicados, agregado renderStats para deleteRoom
- `js/ui/catalog.js` â€” Fix delete-all-templates, fix doble render
- `js/ui/inspector.js` â€” Fix `dev.position` â†’ `dev.slotStart`
- `js/ui/topology/TopologyEvents.js` â€” Fix doble modal
- `js/ui/modals/RoomModal.js` â€” Usa `store.deleteRoom()`
- `service-worker.js` â€” Reescrito con paths correctos, cache v2
- `index.html` â€” Eliminado script tag de topology.js
- `AGENTS.md` â€” Nuevo archivo de onboarding para agentes de IA

### DocumentaciÃ³n
- Actualizado CHANGELOG.md (este archivo)
- Actualizado PROJECT_ANALYSIS.md
- Actualizado CODEBASE_ORIENTATION_MAP.md
- Regenerado directory_structure.svg
- Regenerado module_dependencies.svg

---

## [2026-07-10] Motor de TopologÃ­a Mejorado â€” Layout, Espaciado y Auto-Orden

### Nuevas CaracterÃ­sticas
- **BotÃ³n Auto-Orden (âš¡):** Nuevo botÃ³n en la barra de la vista de TopologÃ­a que resetea y recalcula todas las posiciones (salas, racks, nodos) desde cero usando el algoritmo de layout Ã³ptimo basado en el tamaÃ±o real de las tarjetas.
- **Slider de Espaciado de Nodos:** Control deslizable (rango 40â€“150 px) para ajustar la separaciÃ³n vertical entre equipos dentro de los racks en tiempo real. El valor persiste entre recargas.
- **BotÃ³n de Estilo de TopologÃ­a (ðŸŽ›):** Alterna la representaciÃ³n grÃ¡fica de los nodos entre modo Tarjeta (card) y modo CÃ­rculo (circle).

### Correcciones CrÃ­ticas (Motor de Layout)
- **Reescritura completa de `TopologyLayout.js`:** El motor de posicionamiento fue rediseÃ±ado desde cero para basarse en el **tamaÃ±o real de las tarjetas** (`CARD_W=160, CARD_H=60`) en lugar de valores fijos arbitrarios. Esto elimina de raÃ­z las colisiones visuales entre nodos.
- **Grid de dispositivos de piso:** Los equipos instalados directamente en la sala (fuera de un rack) ahora se distribuyen en una **cuadrÃ­cula inteligente** (hasta 4 columnas, mÃºltiples filas) en vez de una sola fila horizontal aplastada.
- **Ancho de rack dinÃ¡mico:** El ancho de cada rack se calcula segÃºn el nombre del rack y el nombre del equipo mÃ¡s largo, evitando texto desbordado o recortado.
- **FunciÃ³n privada `_computeLayout()`:** Las tres funciones (`initTopoPositions`, `autoOrderTopo`, `recalcTopoSpacing`) ahora comparten un nÃºcleo matemÃ¡tico comÃºn para garantizar consistencia en todos los escenarios.

### Correcciones de UI
- **BotÃ³n "Estilo" y Slider invisibles en Vista FÃ­sica:** Se reemplazÃ³ la manipulaciÃ³n de `style.display` con una clase CSS `.force-hide { display: none !important; }` para garantizar que los controles de topologÃ­a nunca sean visibles fuera de su contexto.
- **Bucle de animaciÃ³n duplicado:** El clic en el botÃ³n de Estilo ya no llamaba a `drawTopo()` manualmente, lo que duplicaba el motor de animaciÃ³n y aceleraba los cables.
- **Velocidad de animaciÃ³n:** Se redujo a la mitad la velocidad de las partÃ­culas en las conexiones (`flowT` de `0.015` â†’ `0.0075`).

### Archivos Modificados
- `js/ui/topology/TopologyLayout.js` â€” Reescritura completa (motor de layout)
- `js/ui/topology/TopologyState.js` â€” Persistencia de `TOPO_SPACING` en el estado guardado
- `js/ui/topology/TopologyRenderer.js` â€” Ajuste de velocidad de animaciÃ³n
- `js/main.js` â€” Registro de eventos de slider/botones; toggle de visibilidad por vista
- `index.html` â€” Botones Auto-Orden y Slider en la barra de herramientas
- `css/layout.css` â€” Clase `.force-hide` y `.topo-slider`

## [2026-07-10] Panel de Propiedades y RefactorizaciÃ³n del Outliner

### Nuevas CaracterÃ­sticas y UI
- **Inspector de Propiedades:** Se introdujo un panel central dinÃ¡mico (`js/ui/inspector.js`) que renderiza de manera instantÃ¡nea y en modo de solo lectura los detalles del objeto seleccionado en el Outliner. Soporta mostrar propiedades completas de Salas, Gabinetes y Equipos (con Ã­conos dinÃ¡micos FontAwesome).
- **Outliner Mejorado:** El Ã¡rbol jerÃ¡rquico (`js/ui/outliner.js`) ahora soporta un estado de selecciÃ³n interactivo global. Al hacer clic simple sobre una Sala, Gabinete o Equipo, el Inspector se actualiza. El doble clic continÃºa abriendo el modal de ediciÃ³n correspondiente (DeviceModal, RoomModal, RackModal). Se removiÃ³ un artefacto visual de "U" no definida de la vista.
- **EstadÃ­sticas Colapsables:** El panel de estadÃ­sticas inferior ahora puede contraerse haciendo clic en su cabecera para otorgar mÃ¡s espacio visual al nuevo Inspector.
- **Soporte SVG:** Se actualizÃ³ el layout a `modals_accordions.svg` con la nueva configuraciÃ³n.

### ActualizaciÃ³n de DocumentaciÃ³n
- **Manual de Usuario:** Se actualizÃ³ `USER_MANUAL.md` para reflejar el comportamiento del nuevo Panel Derecho (Outliner interactivo, Inspector y EstadÃ­sticas colapsables).
- **Arquitectura:** Se integrÃ³ `inspector.js` a `CODEBASE_ORIENTATION_MAP.md` y `PROJECT_ANALYSIS.md` junto con los flujos de lectura en README.

## [2026-07-10] Mapa de OrientaciÃ³n del CÃ³digo (Onboarding Engineer)

### ActualizaciÃ³n de DocumentaciÃ³n
- **Mapa de OrientaciÃ³n**: CreaciÃ³n de `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` que detalla de forma exhaustiva y tÃ©cnica la arquitectura modular, flujos de datos reactivos (Proxy ES6), y lÃ­mites de las capas del proyecto para agilizar el onboarding de desarrolladores.

### RediseÃ±o de la Cabecera Principal y NavegaciÃ³n
- **Dropdowns de Salas y Racks:** Se rediseÃ±Ã³ la cabecera principal (`header-main-area`) trasladando la navegaciÃ³n de salas desde la barra inferior hacia la parte superior.
- **Selector Inteligente de Racks:** Se aÃ±adiÃ³ un menÃº desplegable que lista dinÃ¡micamente todos los racks de la sala activa, permitiendo salto rÃ¡pido y resaltado visual (scroll).
- **Estilos CSS Modernizados:** Se utilizaron menÃºs flotantes (`position: absolute`) para evitar la deformaciÃ³n del layout principal al desplegar, ademÃ¡s de sustituir emojis por puntos indicadores CSS de estado activo/inactivo (`.status-dot-nav`).

### CorrecciÃ³n de Errores (Bugfixes)
- **Error CrÃ­tico de Racks en Sala:** Se corrigiÃ³ un error grave al intentar usar `store.allRacksInRoom()` que no existÃ­a, cambiÃ¡ndolo por el filtrado nativo `store._raw.racks.filter(...)`, lo cual rompÃ­a la inicializaciÃ³n visual completa del entorno.
- **Fallo al Cerrar SesiÃ³n:** El handler de logout estaba enterrado dentro de `initChangePinModal()`, haciÃ©ndolo dependiente de la inicializaciÃ³n del menÃº de proyecto. Se reubicÃ³ directamente en `init()` para garantizar su registro independiente. Se usa `window.location.reload()` para un reseteo limpio.
- **Demos no cargaban en `file:///`:** La carga dinÃ¡mica de `demoData.js` via `document.createElement('script')` fallaba por restricciones CORS del navegador en protocolo `file:///`. Se aÃ±adiÃ³ `demoData.js` como `<script>` estÃ¡tico en `index.html`.
- **ProtecciÃ³n de renderizado:** Se envolviÃ³ `renderRackSelector()` en `try-catch` para evitar que un error en el selector de racks rompa toda la cadena de `renderAll()`.
- **Error de Referencia de TopologÃ­a**: Se corrigiÃ³ un `ReferenceError: renderTopology is not defined` en `js/main.js` al hacer clic en el botÃ³n de **Estilo** en la vista de topologÃ­a. Se reemplazÃ³ la llamada por un control condicional seguro a `drawTopo()`.

### Mejoras Visuales y UX
- **RediseÃ±o del Header:** Se reorganizÃ³ la cabecera principal (`.header-main-area`). Los selectores de Salas y Racks se movieron a la izquierda con Ã­conos de despliegue (`â–¶`), y los tabs de vista (FÃ­sica/TopologÃ­a) se alinearon a la derecha.
- **Barra de Herramientas Transparente:** La barra de controles del canvas ahora tiene fondo 100% transparente y flota sobre el canvas en la parte superior.
- **Equipos de Piso Inteligentes:** El panel inferior de equipos de piso ahora tiene ancho autoescalable: ocupa exactamente el ancho de un rack (`260px`) si estÃ¡ vacÃ­o, o se expande al `100%` debajo de los racks si estÃ¡ ocupado.
- **MenÃº Unificado en Piso:** Se reemplazaron los botones directos de editar/eliminar en las tarjetas de piso por un Ãºnico botÃ³n de opciones (`â‹®`) que despliega el menÃº contextual, unificando la experiencia con el resto de la interfaz. TambiÃ©n se corrigiÃ³ un problema de CSS (`faceplates.css`) que impedÃ­a ver estos botones al hacer hover.
- **Nuevo Panel Derecho (Outliner):** Se dividiÃ³ la pantalla en 3 columnas principales, aÃ±adiendo un panel derecho (260px). Se implementÃ³ un Outliner (Ã¡rbol jerÃ¡rquico estilo Blender) para visualizar y acceder rÃ¡pidamente a todos los equipos, agrupados por Sala, Rack y Equipos de Piso.
- **ReubicaciÃ³n de EstadÃ­sticas:** Se eliminÃ³ la caja redundante del tÃ­tulo de estadÃ­sticas en el panel izquierdo y se trasladaron los "pills" de indicadores (Gabinetes, Equipos, U ocupadas, Potencia) al nuevo panel derecho para compartir espacio debajo del Outliner, aprovechando mejor la verticalidad.


## [2026-06-24] RediseÃ±o y ReubicaciÃ³n de Diagramas SVG (AI Agents)

### ActualizaciÃ³n de DocumentaciÃ³n
- **Manual de Usuario:** Se actualizÃ³ la secciÃ³n 4 de `doc/doc_md/USER_MANUAL.md` ("Flujo de Trabajo End-to-End"), sustituyendo el tutorial paso a paso por una descripciÃ³n arquitectÃ³nica detallada en 4 fases (PreparaciÃ³n, DiseÃ±o FÃ­sico, DiseÃ±o LÃ³gico, y AuditorÃ­a/Respaldo).

### CorrecciÃ³n de Directorio y RediseÃ±o Visual Completo
- **ReubicaciÃ³n:** Los diagramas SVG se movieron al directorio correcto `doc/doc_img/doc_svg/`.
- **RediseÃ±o Profesional Premium:** Los 18 diagramas fueron completamente rediseÃ±ados con estÃ©tica de nivel tÃ©cnico-industrial: gradientes multicapa, tipografÃ­a Segoe UI, simulaciones visuales de interfaz (rack slots, canvas 2D, selects/inputs), filtros SVG de glow/shadow, colores acento semÃ¡nticos por dominio, y layouts con proporciones de cuadrÃ­cula estrictas. Se eliminÃ³ el diseÃ±o plano y bÃ¡sico anterior.
- **Diagramas generados en `doc/doc_img/doc_svg/`:**
  - `architecture_overview.svg` â€” Capas Data / Logic / Presentation con cards por mÃ³dulo.
  - `store_reactivity.svg` â€” Flujo ES6 Proxy â†’ localStorage/historial/UI con ramas visuales.
  - `roles_permissions.svg` â€” 3 columnas de roles con Ã­cono de persona, permisos y token de sesiÃ³n.
  - `theme_switcher.svg` â€” Tokens CSS Dark/Light con swatches de color reales.
  - `device_skins_fallback.svg` â€” Comparativa SVG faceplate vs CSS fallback con preview de rack.
  - `autosave_history.svg` â€” Stack de historial, timer debounce, localStorage y fileHandle.
  - `security_rbac_crypto.svg` â€” Flujo SHA-256, cÃ³digo Web Crypto API, y escenario anti-tamper.
  - `topology_engine.svg` â€” Arquitectura MVC + simulaciÃ³n de canvas 2D con nodos y cables.
  - `drag_drop_flow.svg` â€” 3 fases: CatÃ¡logo â†’ Rack slot â†’ Floor drop con eventos.
  - `export_system.svg` â€” 4 formatos de exportaciÃ³n con simulaciones de JSON/CSV/canvas.
  - `pwa_service_worker.svg` â€” IntercepciÃ³n de fetch, rama cache HIT/MISS, manifest install.
  - `hybrid_network_ports.svg` â€” Selector dinÃ¡mico SELECT vs INPUT con simulaciÃ³n de UI.
  - `module_dependencies.svg` â€” Grafo radial con main.js como nodo central.
  - `directory_structure.svg` â€” Ã�rbol de carpetas coloreado por dominio con descripciones.
  - `file_manager_api.svg` â€” Open/Save/AutoSave flows con comparativa nativa vs blob fallback.
  - `modals_accordions.svg` â€” Lista de modales + simulaciÃ³n de acordeÃ³n de DeviceModal.
  - `ui_layout_map.svg` â€” SimulaciÃ³n visual completa de la aplicaciÃ³n con paneles anotados.
  - `user_personas.svg` â€” 3 tipos de usuario con avatares y matrices de capacidades.

## [2026-06-23] Sistema DinÃ¡mico de Interfaces de Red Opcionales (Workflow Architect)

### ConfiguraciÃ³n HÃ­brida de Puertos
- **Arquitectura de Datos (`store.js`):** El esquema de los equipos (`devices`) se ha expandido para soportar un objeto `ports` (`{ ethernet, fiber }`) totalmente opcional, manteniendo retrocompatibilidad absoluta con inventarios anteriores.
- **Formulario Inteligente (`DeviceModal.js`):** Se inyectÃ³ un nuevo mÃ³dulo colapsable ("Interfaces de Red") en el modal principal de ediciÃ³n que permite al usuario definir numÃ©ricamente la cantidad de puertos SFP (Fibra) y Ethernet de cada equipo.
- **Conexionado DinÃ¡mico (`CableModal.js` y `index.html`):** Los campos de "Puerto Origen" y "Puerto Destino" en la interfaz de parcheo evolucionaron de ser Ãºnicamente texto libre a ser mutables. Si el sistema detecta que el usuario estÃ¡ cableando un equipo con puertos definidos, la UI inyecta instantÃ¡neamente un desplegable restrictivo `<select>` (ej: `Eth-1`, `Eth-2`, `SFP-1`); si el equipo no los define, revierte limpiamente a un campo de texto `<input>`.

## [2026-06-23] Parches de Seguridad (Client-Side) y NormalizaciÃ³n UI (Security Architect & UI Designer)

### Seguridad CriptogrÃ¡fica y Control de SesiÃ³n
- **Hashing SHA-256 (Web Crypto API):** Se eliminÃ³ el almacenamiento en texto plano del PIN de administrador (`rack2024`). El mÃ³dulo `js/auth/roles.js` ahora computa y almacena asÃ­ncronamente Ãºnicamente huellas criptogrÃ¡ficas SHA-256 (`localStorage`), bloqueando filtraciones de credenciales. Las funciones de validaciÃ³n en `js/main.js` fueron refactorizadas a un modelo `async/await`.
- **Integridad de SesiÃ³n Anti-Tampering:** Se implementÃ³ un sello de integridad de memoria (*closure token*) mediante `crypto.randomUUID()`. Si un usuario altera manualmente su `sessionStorage` desde DevTools para elevar sus privilegios (ej. de `viewer` a `admin`), el sistema forzarÃ¡ un cierre de sesiÃ³n automÃ¡tico al detectar la ausencia del token en RAM.

### Arquitectura Visual ("IDE-Grade")
- **Purga de "AI Slop" en UI:** Se eliminaron los estilos CSS "comerciales" (alturas excesivas, paddings gigantes y botones con degradados pÃºrpuras) incrustados en `index.html` para el `#modal-login`. Se reestructurÃ³ para forzar el uso de las clases base del sistema (`.modal`, `.btn-confirm`, `.btn-cancel`), aplicando el **Acento TÃ©cnico (Cian puro)** y respetando la regla matemÃ¡tica de alturas de **24px** para controles.
- **Scroll Interno y LÃ­mites de VisualizaciÃ³n:** Se aplicÃ³ `max-height: 90vh` y `overflow-y: auto` de forma global a la clase `.modal` en `css/components/modals.css`, garantizando que los modales extensos (como la ediciÃ³n de un equipo con todos los paneles expandidos) se mantengan accesibles en pantallas de baja resoluciÃ³n (laptops) y no oculten los botones de acciÃ³n ("Guardar" / "Cancelar"). Se implementÃ³ ademÃ¡s una barra de desplazamiento nativa estilizada que encaja con el entorno profundo de RACK Designer Next.

## [2026-06-23] OptimizaciÃ³n PWA y Accesibilidad ARIA (Frontend Developer)

### Progressive Web App (PWA) y Core Web Vitals
- **InstalaciÃ³n Offline:** Se creÃ³ el archivo `service-worker.js` para cachear la capa de presentaciÃ³n completa (HTML, CSS, JS, SVGs y fuentes). Esto asegura que RACK Designer Next cargue instantÃ¡neamente y sea instalable como aplicaciÃ³n de escritorio/mÃ³vil independiente sin requerir conexiÃ³n a la red.
- **Registro del Service Worker:** Se integrÃ³ la lÃ³gica de registro en `js/main.js` interceptando el evento `load` de la ventana para no bloquear el hilo de renderizado principal (protegiendo el LCP).

### Accesibilidad (WCAG 2.1 AA)
- **NavegaciÃ³n SemÃ¡ntica (Screen Readers):** Se inyectaron etiquetas `aria-label` en todos los controles interactivos y botones iconogrÃ¡ficos (menÃº, controles de zoom, expansiÃ³n de paneles, etc.) en `index.html`. Ahora los lectores de pantalla vocalizan la intenciÃ³n real de la acciÃ³n en lugar de leer los caracteres ASCII.

## [2026-06-23] AuditorÃ­a y NormalizaciÃ³n de UI (UI Designer)

### Sistema de DiseÃ±o y Accesibilidad
- **Contraste Perfeccionado:** Se aclarÃ³ el token `--text-muted` de `#8496b0` a `#94a3b8` en `css/variables.css` y `.agents/DESIGN.md` para garantizar el cumplimiento estricto del ratio de contraste WCAG AA sobre fondos oscuros.
- **EliminaciÃ³n de "AI Slop":** Se reemplazÃ³ la sombra difuminada global (`--shadow`) por una sombra dura de estilo IDE (`0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)`) para una estÃ©tica mÃ¡s profesional y densa.
- **Micro-AlineaciÃ³n Estricta a 24px:** 
  - Se corrigiÃ³ `css/components/modals.css` para forzar que todos los inputs, selects y botones de los modales respeten la directriz obligatoria de 24px de altura (`height: 24px !important`).
  - Se ajustÃ³ el padding asimÃ©trico de la caja de bÃºsqueda (`.h-search input`) en `css/layout.css` (`padding: 0 8px 0 30px`) para evitar el solapamiento del Ã­cono de la lupa respetando las reglas de la cuadrÃ­cula.

## [2026-06-23] Sistema de Control de Acceso Basado en Roles (RBAC) y ActualizaciÃ³n de DocumentaciÃ³n

### Seguridad y Roles de Usuario
- **Sistema de Roles (RBAC):** Se implementÃ³ `js/auth/roles.js` (`RackAuth`) definiendo tres niveles de acceso: Administrador, Editor y Espectador.
- **ProtecciÃ³n de SesiÃ³n y AutenticaciÃ³n:** Se implementÃ³ un modal de inicio de sesiÃ³n (`#modal-login`) gestionado mediante `sessionStorage`. El PIN de Administrador ("rack2024" por defecto) puede configurarse en un nuevo modal dedicado y se persiste cifrado en `localStorage`.
- **Blindaje de Interfaz y LÃ³gica:** 
  - Se bloquearon las interacciones Drag & Drop (`dragstart`) y el doble clic para inserciÃ³n rÃ¡pida a los espectadores.
  - Se aÃ±adieron verificaciones (`RackAuth.can()`) en todos los botones destructivos, menÃºs contextuales y la rutina de autoguardado.
  - **Modo Dios Exclusivo:** La revelaciÃ³n global de contraseÃ±as (`window.SHOW_PASSWORDS`) fue restringida exclusivamente a usuarios con rol Administrador.

### DocumentaciÃ³n e Infraestructura
- **ActualizaciÃ³n de Documentos:** Se actualizÃ³ `USER_MANUAL.md` incorporando la secciÃ³n sobre los roles de usuario. Se actualizÃ³ `TECHNICAL_DOCS.md` detallando la implementaciÃ³n y mecanismos de seguridad del RBAC.
- **GeneraciÃ³n de Manual HÃ­brido:** Se optimizÃ³ `build_standalone_manual.cjs` con la dependencia `marked` (instalada vÃ­a `pnpm`) para combinar los archivos `.md` y generar automÃ¡ticamente la versiÃ³n estÃ¡tica `DOC/html/FULL_MANUAL_STANDALONE.html` con imÃ¡genes SVG empotradas en Base64.
- **Limpieza de RaÃ­z y Scripts:** Se reorganizÃ³ el directorio base, moviendo los scripts Node.js a la carpeta `scripts/`. Se restableciÃ³ la ubicaciÃ³n estricta del directorio `.py/` y los documentos internos `.agents/` (`DESIGN.md`, `INSTRUCTIONS.md`) conforme a las instrucciones directivas.

## [2026-06-22 10:30:00] Renderizado HÃ­brido de Faceplates y Mejoras de Interfaz

### Funcionalidades Core
- **Renderizado HÃ­brido AutomÃ¡tico:** Se implementÃ³ una lÃ³gica hÃ­brida inteligente en `faceplates.js` que intenta cargar primero las imÃ¡genes fotorrealistas (SVG/PNG) desde `assets/img/`. Si la imagen no se encuentra, el motor hace un *fallback* automÃ¡tico e instantÃ¡neo (vÃ­a evento `onerror` en el DOM) hacia el renderizado procedimental en cÃ³digo CSS.
- **Control de Renderizado mediante Sistema de Archivos:** Los usuarios ahora pueden forzar al sistema a usar el renderizado CSS para una categorÃ­a de equipo especÃ­fico simplemente renombrando su archivo de imagen para que comience con un punto (ej. `.switch.svg`). Esto oculta el archivo al motor de red, desencadenando la protecciÃ³n de fallback de forma transparente y sin necesidad de tocar la base de datos o el cÃ³digo fuente.

### Interfaz de Usuario (UI)
- **Panel Inferior Optimizado:** Se ajustÃ³ el estado inicial del panel inferior (Tabla de Inventario/Conexiones). Ahora el proyecto carga con este panel totalmente contraÃ­do por defecto (`bottomCollapsed = true`), maximizando el Ã¡rea visual de trabajo disponible para la topologÃ­a y los gabinetes desde el primer segundo.

## [2026-06-22 08:00:00] Arquitectura de Activos GrÃ¡ficos: ImÃ¡genes Fotorrealistas para Faceplates

### Estructura y OrganizaciÃ³n de Assets
- **Nueva Estructura de Directorios (`assets/img/`):** Se introdujo una jerarquÃ­a paralela a los iconos (`network`, `server`, `storage`, `power`, `wiring`, `accessories`, `floor`) destinada exclusivamente a alojar imÃ¡genes detalladas (SVGs fotorrealistas o PNGs) para la vista fÃ­sica de los equipos.
- **DiferenciaciÃ³n de Renderizado:** La arquitectura ahora separa semÃ¡nticamente los iconos abstractos (`assets/icons/`), usados como mÃ¡scaras CSS en la topologÃ­a e inventario, de los diseÃ±os fÃ­sicos detallados (`assets/img/`), preparando el ecosistema para permitir a los usuarios subir personalizaciones grÃ¡ficas (custom faceplates).
- **Generador AutomÃ¡tico de SVGs (`generate_svgs.cjs`):** Se creÃ³ e implementÃ³ un script Node.js para poblar dinÃ¡micamente el nuevo Ã¡rbol de directorios con diseÃ±os vectoriales base y organizarlos automÃ¡ticamente segÃºn la taxonomÃ­a del catÃ¡logo.

## [2026-06-22 06:45:00] ExpansiÃ³n del CatÃ¡logo SVG y ActualizaciÃ³n de DemostraciÃ³n

### Arquitectura y Renderizado Visual
- **MigraciÃ³n a SVG DinÃ¡micos:** Se reemplazÃ³ el uso de Emojis del sistema por iconos SVG monocromÃ¡ticos en todo el ecosistema grÃ¡fico. Los SVGs se colorean dinÃ¡micamente usando `mask-image` en el DOM y una cachÃ© offline (Canvas) para el motor topolÃ³gico de alto rendimiento.
- **JerarquÃ­a de Iconos:** Nueva estructura organizada en `assets/icons/` dividida por dominio (`/network`, `/server`, `/power`, `/storage`, `/wiring`, `/accessories`, `/floor`).

### ExpansiÃ³n TeÃ³rica del Datacenter
- **AmpliaciÃ³n del CatÃ¡logo:** El catÃ¡logo base (`catalog.js`) fue sustancialmente enriquecido con infraestructura tÃ©cnica realista. Se aÃ±adieron categorÃ­as: Cableado (Patch Panels, Organizadores), EnergÃ­a (PDU), Almacenamiento (NAS, SAN), Accesorios (KVM, Bandejas) y perifÃ©ricos de Piso (Controladoras, Accesos).

### DemostraciÃ³n TÃ©cnica (`demoData.js`)
- **Redimensionamiento de Racks:** Los gabinetes en la demostraciÃ³n ahora presentan tamaÃ±os realistas variados: el Core (`Rack 101`) de 42U, nodos secundarios (`201`, `301`) de 24U, y remotos de 12U.
- **Sala "Bodega":** Se aÃ±adiÃ³ una cuarta sala para equipos de piso (cÃ¡maras, AP, controladora), interconectada lÃ³gicamente por Ethernet hacia el switch de acceso del Rack 301 para ejemplificar el alcance distribuido de la red.

## [2026-06-19 19:10:00] ReestructuraciÃ³n Modular (Models/Core/API) y Lado de Montaje

### Arquitectura y RefactorizaciÃ³n
- **SeparaciÃ³n de LÃ³gica de Negocio:** Se crearon las carpetas `js/models/`, `js/api/` y `js/core/` para implementar una arquitectura mÃ¡s limpia (Clean Architecture). Las clases de entidades base (`Rack.js`, `Device.js`, `Cable.js`) ahora viven en `models/`, separando estrictamente los datos de la lÃ³gica de interfaz de usuario (`ui/`) y estado (`store.js`).
- **MÃ³dulo de ExportaciÃ³n:** La lÃ³gica pesada de exportaciÃ³n se extrajo hacia `js/core/export.js`.
- **Cliente API Base:** Se introdujo `js/api/apiClient.js` como capa fundamental para futuras integraciones de bases de datos.
- **Directorio de Pruebas y Recursos:** Se crearon las carpetas `tests/` para futuras pruebas unitarias (con un archivo base `Rack.test.js`) y `assets/img/` para concentrar imÃ¡genes.

### Mejoras de Interfaz (UI/UX)
- **Lado de Montaje en CreaciÃ³n:** Ahora, al crear o editar un equipo de rack desde el modal (`DeviceModal`), es posible elegir explÃ­citamente el **Lado (Montaje)** (Frontal o Trasero) mediante un nuevo selector. Este valor se guarda en la propiedad `mountSide` del dispositivo.
- **IntegraciÃ³n con Asistente de UbicaciÃ³n:** El Asistente de UbicaciÃ³n RÃ¡pida (`PlacementModal`) ahora lee de manera inteligente la preferencia `mountSide` del equipo desde el catÃ¡logo y la pre-selecciona automÃ¡ticamente para acelerar el despliegue.

## [2026-06-19 12:40:00] RediseÃ±o ArquitectÃ³nico del Modal de Equipos (Acordeones UI)

### AÃ±adido
- **JerarquÃ­a Visual:** Se rediseÃ±Ã³ por completo el formulario modal de "Nuevo Equipo" (`#modal-device`) pasando de un listado vertical estÃ¡tico a un moderno sistema de **MÃ³dulos Colapsables (Acordeones)**.
- **Interruptores de Estado (ON/OFF):** Se introdujo una clase maestra `.module-toggle` que permite al usuario decidir quÃ© bloques de metadatos desea ver y llenar (Red, Credenciales, Notas, EnergÃ­a), ocultando el resto mediante CSS Puro (`display: none`). Esto reduce drÃ¡sticamente la carga cognitiva y el espacio ocupado en pantalla.
- **Campo "Estado":** Se agregÃ³ la propiedad `status` a los dispositivos para distinguir si estÃ¡n Activos, Apagados o en Mantenimiento.

### Refactorizado
- **LÃ³gica Inteligente de JS (`DeviceModal.js`):** El controlador fue actualizado para sincronizarse con los nuevos acordeones. Al abrir un equipo existente a ediciÃ³n, la interfaz ahora enciende automÃ¡ticamente los acordeones correspondientes si detecta datos previamente almacenados (ej. Si el equipo ya tenÃ­a una IP guardada, el mÃ³dulo de "Red" se abrirÃ¡ por defecto).
- AdemÃ¡s, si un usuario apaga un acordeÃ³n antes de guardar, el controlador inyectarÃ¡ en blanco esos datos para no almacenar metadatos basura inactivos en el store.

## [2026-06-19 10:40:00] ReestructuraciÃ³n de DocumentaciÃ³n y ActualizaciÃ³n de SVG
### AÃ±adido
- **ConsolidaciÃ³n de ImÃ¡genes:** Se reubicaron todas las imÃ¡genes vectoriales de la documentaciÃ³n (`mockups`, `ui`, arquitectÃ³nicas) a un directorio centralizado unificado en `doc/img/svg/`.
- **ActualizaciÃ³n Masiva de Rutas:** Se actualizaron dinÃ¡micamente mÃ¡s de 100 referencias de rutas de imÃ¡genes en todos los archivos `.md` y `.html` para que apunten a la nueva estructura estructurada.
- **Renombre de Directorios HTML:** Se actualizaron las referencias de recursos en los manuales interactivos (`manual.html` y `manual_2.html`) para apuntar a las nuevas carpetas renombradas `manual_css/` y `manual_js/` dentro de `doc/html/`.

### Mejoras de Rendimiento (DocumentaciÃ³n)
- **SeparaciÃ³n LÃ³gica de Documentos (User vs Developer):** Se extrajo de manera definitiva toda la teorÃ­a arquitectÃ³nica y de ingenierÃ­a pesada del manual de usuario. Las secciones de "Estructura de Carpetas", "DiseÃ±o AtÃ³mico (Atomic Design)" y el "Layout Map Visual" fueron transformadas al diseÃ±o oscuro premium e integradas como tarjetas en el Dashboard de `arquitectura_2.html`.
- **Limpieza de Manual Lineal:** El documento `manual_lineal.html` fue depurado, eliminando todos los conceptos de ingenierÃ­a que no aportaban valor a un operador final, convirtiÃ©ndolo en una guÃ­a 100% coherente enfocada Ãºnicamente en el uso de la interfaz (desde creaciÃ³n de salas hasta exportaciÃ³n de reportes).
- **FusiÃ³n ArquitectÃ³nica (Single Source of Truth):** Se integrÃ³ toda la documentaciÃ³n y diagramas de `arquitectura.html` dentro de la interfaz moderna tipo Dashboard de `arquitectura_2.html`. Se aÃ±adieron tarjetas enriquecidas describiendo el uso de `WeakMap`, bloqueos `try/finally` a 60fps, y un nuevo panel interactivo sobre Seguridad y Modo Dios.
- **Limpieza de Archivos:** Se eliminÃ³ permanentemente el archivo obsoleto `arquitectura.html` tras la fusiÃ³n exitosa para evitar duplicidad de fuentes de verdad.
- **RefactorizaciÃ³n de `arquitectura.html` previa:** Se eliminaron mÃ¡s de 1200 lÃ­neas de cÃ³digo SVG embebido (*inline*) y se reemplazaron por etiquetas `<img src="...">` apuntando a los archivos externos en `doc/img/svg/`. Esto redujo el peso del archivo de **77 KB a 8.7 KB**, mejorando enormemente su mantenibilidad. Se actualizaron ademÃ¡s los textos descriptivos para documentar las soluciones a fugas de memoria con `WeakMap`, la separaciÃ³n del CSS/JS de los manuales, y las implementaciones de seguridad como el Modo Dios y `crypto.randomUUID()`.

### CorrecciÃ³n de Errores (DocumentaciÃ³n)
- **SincronizaciÃ³n de Diagramas SVG:** Se actualizaron los textos de los diagramas arquitectÃ³nicos (`01_estructura_estado.svg`, `02_ciclo_store.svg`, `03_capas_persistencia.svg`, `04_erd_entidades.svg`) para reflejar los Ãºltimos *bugfixes*:
  - Ocultamiento visual de contraseÃ±as (Modo Dios / Seguridad UX).
  - EliminaciÃ³n de fuga de memoria reciclando Proxies mediante `WeakMap`.
  - Exportaciones de CSV y PNG ahora protegidas contra XSS y cuelgues (try/finally).
  - ActualizaciÃ³n de menciones de IDs de `base-36` al nuevo estÃ¡ndar nativo de 16 caracteres `crypto.randomUUID()`.

## [2026-06-18 17:25:00] ActualizaciÃ³n de Arquitectura Visual (Layout Map) y Manuales
- **Manual de PÃ¡gina Ãšnica (Single-Page):** Se creÃ³ `manual_2.html`, una variante del manual interactivo que muestra todas las secciones en un scroll continuo. Incluye una funcionalidad de ScrollSpy personalizada para actualizar el menÃº lateral de forma dinÃ¡mica.
- **Nuevo Layout Map (`ui_layout_map_full.svg`):** Se diseÃ±Ã³ un mapa estructural completo en SVG con proporciones reales. Se aplicÃ³ una paleta de colores armÃ³nica (Dark Mode) y se agregaron subtÃ­tulos identificando los archivos SVG correspondientes a cada bloque.

### CorrecciÃ³n de Errores (DocumentaciÃ³n)
- **CorrecciÃ³n de "Vista de Rack":** Se corrigiÃ³ un error conceptual en los manuales (`USER_MANUAL.md`, `manual.html`, `manual_2.html`) reubicando `ui_rack_view.svg` desde la secciÃ³n "Sidebar" hacia la secciÃ³n "Main Canvas", clarificando que la vista detallada del gabinete ocupa el espacio central.
- **DivisiÃ³n de Panel Inferior:** Se dividiÃ³ la documentaciÃ³n del "Bloque Rosa/Inferior" en dos componentes funcionales separados: "Bottom Bar / PestaÃ±as" (la franja minimizada) y "Tabla de Datos / Inventario Expandido" (el bloque masivo).

## [2026-06-17 17:50:00] Mockups SVG y CorrecciÃ³n de Bugs
- CreaciÃ³n de mockups vectoriales de la interfaz grÃ¡fica vacÃ­a (modo escritorio y mÃ³vil, tanto en claro como en oscuro) para documentaciÃ³n (`doc/svg/ui_mockup_...`).
### CorrecciÃ³n de Errores (Bugfixes)
- **Carga de Demos:** Se solucionÃ³ el problema de scope global en `main.js` que impedÃ­a cargar dinÃ¡micamente los datos de demostraciÃ³n (se estandarizÃ³ a `window.loadDemoData`).
- **Barra de Capacidad:** Se reemplazÃ³ el uso de `transform` por `width` en `layout.css` para el `.cap-bar-fill`, permitiendo que la barra de progreso se visualice correctamente de nuevo.

## [2026-06-17 14:11:00] CorrecciÃ³n Visual de Barras de Capacidad (EstadÃ­sticas)
### CorrecciÃ³n de Errores (Bugfixes)
- **Barras de Progreso:** Se corrigiÃ³ un problema visual donde las barras de capacidad del panel de EstadÃ­sticas ("Rack Capacity" y "Power") siempre aparecÃ­an vacÃ­as. El motor de actualizaciÃ³n `renderStats()` intentaba escalar un elemento que tenÃ­a un ancho inicial del 0% por defecto (`style.width="0%"` combinado con `transform: scaleX`). Se reescribiÃ³ la lÃ³gica para que el progreso modifique directamente la propiedad `width` (porcentaje de la barra), haciendo que la animaciÃ³n fluya correctamente.

## [2026-06-17 13:36:00] Correcciones en Limpiar Proyecto, Cargar Demos y PWA CachÃ©
### CorrecciÃ³n de Errores (Bugfixes)
- **CachÃ© PWA:** Se incrementÃ³ la versiÃ³n del `CACHE_NAME` en `js/service/service-worker.js` a `v1.1` y se aÃ±adiÃ³ `fileManager.js` a la lista de recursos fuera de lÃ­nea. Esto fuerza a los navegadores a invalidar el cachÃ© antiguo "Cache-First" y descargar los Ãºltimos cambios de cÃ³digo de la interfaz para que los usuarios puedan ver las actualizaciones inmediatamente tras recargar.
- **Cargar Demos:** Se reescribiÃ³ la lÃ³gica del botÃ³n `menu-demo` (`Cargar demos`) haciÃ©ndola asÃ­ncrona. Ahora el sistema espera correctamente a que el manejador de archivos (File System API) termine de guardar la copia de seguridad antes de inyectar y ejecutar `demoData.js`, solucionando el problema donde la funcionalidad habÃ­a dejado de responder.
- **Limpieza de Proyecto:** Al usar la opciÃ³n `Limpiar proyecto` (`ðŸ§¹`), ahora se resetea internamente el manejador de archivos y se actualiza la interfaz para mostrar "Nuevo Proyecto" en la cabecera, desvinculando la sesiÃ³n limpia del archivo anterior para evitar sobreescrituras accidentales por el autoguardado.

## [2026-06-17 13:30:00] ImplementaciÃ³n de File System Access API y Autoguardado
### Sistema de Guardado
- **Apertura Directa:** Se reemplazÃ³ el tradicional campo `<input type="file">` oculto por la API nativa `window.showOpenFilePicker`. Ahora la aplicaciÃ³n puede abrir archivos directamente del sistema y conservar el "handle" (manejador) para sobreescribir los cambios de manera transparente.
- **Autoguardado Inteligente:** Se implementÃ³ un ciclo de `autoSave` con *debounce* (3 segundos). Si el usuario ya ha dado permisos de escritura al archivo en la sesiÃ³n actual, la aplicaciÃ³n guardarÃ¡ automÃ¡ticamente cualquier cambio (arrastre, conexiÃ³n, ediciÃ³n) en el disco duro sin ventanas emergentes.
- **Guardar como...:** Se aÃ±adiÃ³ la opciÃ³n "Guardar como..." en el menÃº de proyecto, permitiendo bifurcar proyectos usando `window.showSaveFilePicker()`.
- **IntegraciÃ³n de Fallback:** Para los navegadores sin soporte completo de esta API web moderna (como Firefox o Safari), el sistema vuelve de manera elegante al mÃ©todo antiguo de descarga/subida clÃ¡sica (blob JSON).
- **Indicador de Proyecto Activo:** Se aÃ±adiÃ³ al diseÃ±o del encabezado el nombre del archivo activo (`#project-filename`) para mejorar la conciencia situacional del usuario.

## [2026-06-16 12:05:00] ReestructuraciÃ³n Documental, ExtracciÃ³n SVG y RediseÃ±o de Manual
- **Limpieza de CÃ³digo HTML (ExtracciÃ³n SVG):** Se extrajeron exitosamente 14 diagramas SVG que se encontraban incrustados en lÃ­nea dentro de `arquitectura_2.html` y se convirtieron en archivos independientes guardados en la carpeta `doc/html/img/Arq2/`. Esto reduce significativamente el peso del HTML base y permite el cacheo independiente de las imÃ¡genes.
- **Correcciones XML en Vectores:** Se solventaron errores de sintaxis en los archivos SVG extraÃ­dos (caracteres `&` sin escapar y etiquetas `<defs>` faltantes para marcadores de flechas) garantizando su perfecta renderizaciÃ³n en navegadores estrictos.
- **Nueva SecciÃ³n de SegmentaciÃ³n:** Se aÃ±adiÃ³ al documento de arquitectura una secciÃ³n ilustrada llamada "Estructura de Directorios y SegmentaciÃ³n". Esta incluye un nuevo diagrama vectorial (`directory_structure.svg`) y explica los beneficios (Mantenibilidad, ColaboraciÃ³n Eficiente, ReutilizaciÃ³n) de aislar la lÃ³gica de UI (`js/ui/`) del estado global (`js/store.js`).

### Mejoras de Interfaz (UI/UX) en el Manual de Usuario
- **Overhaul EstÃ©tico (Glassmorphism & Cards):** Se reescribiÃ³ por completo la hoja de estilos del manual de usuario (`manual.css`). Se adoptÃ³ una estÃ©tica moderna que hace juego con la aplicaciÃ³n principal, utilizando fondos oscuros con "blur", resaltados de neÃ³n sutiles (accent glow) y limitando el ancho mÃ¡ximo de lectura para reducir la fatiga visual.
- **ModernizaciÃ³n TipogrÃ¡fica:** Se integraron las fuentes profesionales `Outfit` (lectura general) y `JetBrains Mono` (etiquetas de cÃ³digo tÃ©cnico) mediante Google Fonts, reemplazando la tipografÃ­a genÃ©rica del sistema.
- **Tarjetas de CaracterÃ­sticas (Feature Grid):** Se desarrollÃ³ un script inteligente que transformÃ³ automÃ¡ticamente todas las listas de viÃ±etas densas e ilegibles (`ul.content-list`) en grillas modernas de tarjetas (`div.feature-grid`). Esto mejora dramÃ¡ticamente la experiencia de escaneo y lectura del manual.
- **ActualizaciÃ³n de Contenido y Rutas:** Se repararon todos los enlaces rotos de imÃ¡genes del manual apuntando a sus nuevas ubicaciones categorizadas (`desk/`, `mobil/`, `Arq/`). AdemÃ¡s, se documentaron oficialmente las Ãºltimas funciones agregadas: Los *Atajos de Estado VacÃ­o* (Empty Canvas Shortcuts) y las opciones extendidas del *MenÃº Contextual* de los Gabinetes.

## [2026-06-16 10:05:00] CorrecciÃ³n de Bug Visual (Inputs & Selects) y Accesos Directos
### Mejoras de Interfaz (UI/UX)
- **CorrecciÃ³n de Recorte Vertical:** Se ajustÃ³ el `padding` (a `0 8px`) y el `line-height` de todos los elementos `input` y `select` globales en `layout.css`. Esto soluciona un problema donde los textos internos aparecÃ­an cortados o empujados hacia abajo despuÃ©s de que la altura general se hubiera estandarizado a 24px en el commit anterior.
- **ActualizaciÃ³n Documental:** Se reflejaron estas nuevas reglas de relleno (padding) y altura de lÃ­nea estricta en el manifiesto principal `DESIGN.md` para evitar recortes futuros.
- **Accesos Directos en Canvas:** Se aÃ±adieron botones interactivos para "+ Rack" en el estado vacÃ­o de la Vista FÃ­sica. AdemÃ¡s, el botÃ³n secundario fue reemplazado por el botÃ³n "âš¡ Agregar Equipo" (UbicaciÃ³n RÃ¡pida asistida) posicionado estratÃ©gicamente en la cabecera de la secciÃ³n "Equipos de Piso / PerifÃ©ricos" para un acceso mÃ¡s intuitivo. TambiÃ©n, cuando hay racks instalados, aparece una tarjeta transparente al final de la fila con borde punteado para agregar el siguiente gabinete rÃ¡pidamente.
- **Botones de AcciÃ³n en Rack:** Se ampliaron las opciones en la cabecera de cada rack, agregando el acceso directo a la UbicaciÃ³n RÃ¡pida (âš¡ Agregar Equipo) y la nueva opciÃ³n "Limpiar Gabinete" (ðŸ§¹), la cual requiere confirmaciÃ³n para evitar la eliminaciÃ³n accidental de todo el contenido del rack. Para mantener la interfaz limpia y minimalista, todas estas acciones (incluyendo Editar y Eliminar) se agruparon dentro de un nuevo **menÃº desplegable (â‹®)** posicionado junto al botÃ³n de rotar (flip).
### Mantenimiento
- **ActualizaciÃ³n de INSTRUCTIONS.md:** Se actualizÃ³ la regla de Flujo de Trabajo para establecer formalmente el "Registro Continuo" en el Changelog y requerir permiso explÃ­cito del usuario para ejecutar los respaldos en Git, evitando historiales inflados con micro-commits.

## [2026-06-16 09:48:00] RefactorizaciÃ³n Modular (CSS, Modales y TopologÃ­a)
### Mejoras de Arquitectura
- ModularizaciÃ³n de `style.css` (~900 lÃ­neas) en componentes especializados (variables, layout, rack, faceplates, modals, panels, misc) e importaciÃ³n unificada.
- DivisiÃ³n de `js/ui/modals.js` en submÃ³dulos funcionales (RackModal, DeviceModal, CableModal, etc.) para mejorar la mantenibilidad de las ventanas flotantes.
- RefactorizaciÃ³n de `js/ui/topology.js` adoptando el patrÃ³n Modelo-Vista-Controlador (MVC), aislando el estado (`TopologyState`), los eventos (`TopologyEvents`), los cÃ¡lculos lÃ³gicos (`TopologyLayout`) y la capa visual del canvas (`TopologyRenderer`).
- ActualizaciÃ³n de `index.html` para orquestar la carga de todos los nuevos mÃ³dulos generados sin romper dependencias (incluyendo el intacto `rack.js`).
- ReorganizaciÃ³n de las imÃ¡genes de arquitectura del manual en carpetas mÃ¡s estructuradas (`doc/html/img/Arq/` y `doc/html/img/ui/`).

## [2026-06-16 07:18:44] EstandarizaciÃ³n a 24px, DESIGN.md YAML y Soporte Claro en Rack
### Mejoras de Interfaz (UI/UX)
- CorrecciÃ³n matemÃ¡tica de densidad: Se redujo la altura estandarizada de todos los controles interactivos de 32px a **24px** (botones, pestaÃ±as, bÃºsquedas) para consolidar la estÃ©tica "IDE-grade".
- Reescritura del manifiesto `DESIGN.md` adaptÃ¡ndolo al estÃ¡ndar profesional `awesome-design-md` (YAML Frontmatter), prohibiendo explÃ­citamente estilos generativos "AI Slop".
- Purga masiva de colores estÃ¡ticos (`#090d17`, `#0a1525`, etc.) en el chasis fÃ­sico del Rack (vistas frontal y trasera). Ahora toda la estructura metÃ¡lica y ranuras responden a variables CSS (`--bg-card1`, `--border`), permitiendo un despliegue perfecto del **Modo Claro** sin deformar el hardware instalado.

## [2026-06-16 00:51:30] Refinamiento UI/UX Premium & DESIGN.md
### Mejoras (UI/UX)
- NormalizaciÃ³n matemÃ¡tica de altura de controles interactivos (botones, tabs, inputs) a \`32px\` con paddings estandarizados.
- CreaciÃ³n de \`DESIGN.md\` en la raÃ­z para dictar el ADN visual del proyecto (fuentes, escala de color, evitar 'AI Slop').
- ReducciÃ³n global de escala tipogrÃ¡fica (2px) para lograr densidad visual estilo IDE.
- Ocultamiento forzado (\`style="display:none !important;"\`) del input nativo de archivos en el HTML principal.
- Limpieza profunda de archivos basura y copias de seguridad obsoletas (\`.backup\`, \`.kilo\`, \`scratch\`).

# Registro de Cambios (Changelog)

## [2026-06-15 20:25] SoluciÃ³n a Bugs de Baja Prioridad (Pulido)
* **BUG-12 (LÃ­mite de Notificaciones):** Se implementÃ³ un lÃ­mite de 5 notificaciones activas en pantalla en `utils.js` para evitar inundaciÃ³n (flooding) de notificaciones.
* **BUG-13 (FOUC del Tema):** Se moviÃ³ la inicializaciÃ³n de `data-theme` al `<head>` de `index.html` mediante un script sÃ­ncrono para eliminar el "flash" blanco que ocurrÃ­a al cargar la app en modo oscuro.
* **BUG-14 (Filtro de Equipos de Piso):** El selector de "Equipos sin Gabinete" en el modal de conexiones ahora distingue entre equipos huÃ©rfanos que sÃ­ requieren rack (`orphanedRack`) y perifÃ©ricos de piso (`orphanedFloor`), mejorando la coherencia de la interfaz.
* **BUG-15 (Historial de Renombrado):** Renombrar una sala (F2) ahora incluye correctamente llamadas a `store.snapshot()` y `store._save()`, permitiendo que el cambio de nombre pueda deshacerse (`Ctrl+Z`).
* **BUG-16 (ExportaciÃ³n CSV):** Se corrigiÃ³ la lÃ³gica de generaciÃ³n del formato CSV en las tablas y en la exportaciÃ³n de inventario (`tables.js` y `modals.js`). Ahora, los textos que contengan comas (ej: Notas, nombres largos) se entrecomillan correctamente, evitando que las columnas se desfasen.
* **BUG-17 (Eventos en Equipos de Piso):** Se aÃ±adiÃ³ `draggable="true"` a las tarjetas de dispositivos de piso (`.floor-device-card`) y se vincularon a `bindRackEvents` para habilitar el arrastre, doble clic (ediciÃ³n) y clic derecho (menÃº contextual), los cuales antes estaban inoperantes.
* **BUG-18 (Overflow en TopologÃ­a):** En el motor de dibujo `topology.js`, la variable continua de tiempo `flowT` (utilizada para animar los paquetes por las conexiones) ahora aplica mÃ³dulo 1 (`% 1`) en cada frame, evitando el potencial desbordamiento de punto flotante tras miles de horas de uso continuo.
## [2026-06-15 19:20] SoluciÃ³n Final a Bugs de Prioridad Media
* **BUG-11 (Congelamiento por Error de PNG):** Se incorporÃ³ un sistema de guarda `try/finally` al exportador PNG topolÃ³gico. Si la cÃ¡mara detecta un fallo al renderizar nodos huÃ©rfanos, el sistema asegura restaurar todas las variables globales y el canvas en la pantalla principal antes de abortar. Se acabÃ³ el congelamiento "pantalla blanca" permanente.
* **BUG-07 (Doble renderizado al cambiar sala):** En el motor de vistas `main.js`, el evento `changeRoom` ahora llama estrictamente a `initTopoPositions()` si estÃ¡s activamente en la pestaÃ±a de TopologÃ­a. Esto previene un desfasamiento donde los equipos de la sala nueva no aparecÃ­an o hacÃ­an titilar la vista.
## [2026-06-15 19:14] CorrecciÃ³n de ValidaciÃ³n y Formularios
* **BUG-08 (ValidaciÃ³n IP Estricta):** Se modificÃ³ la expresiÃ³n regular de validaciÃ³n de direcciones IP en la Tabla de Inventario y en la ventana de EdiciÃ³n. Anteriormente permitÃ­a trÃ­os de nÃºmeros hasta el 999; ahora exige de forma estricta el estÃ¡ndar `0-255` para los 4 octetos, evitando que se guarden IPs falsas en el JSON.
* **BUG-09 (ProtecciÃ³n XSS en Celdas):** (Resuelto preventivamente) La ediciÃ³n rÃ¡pida en celdas de la tabla ya procesa de forma segura carÃ¡cteres especiales como las comillas (`"`) mediante un filtrado `escapeHTML()`, previniendo que se rompa la vista.
## [2026-06-15 18:09] CorrecciÃ³n de Integridad de Datos (Bugs de Prioridad Alta y Media)
* **BUG-06 (Conexiones Fantasma al Eliminar Salas):** Se solucionÃ³ un defecto crÃ­tico donde la funciÃ³n `deleteRoom()` dejaba conexiones ("cables") huÃ©rfanas apuntando a equipos que ya no existÃ­an. Ahora, el sistema recolecta en cascada todos los Gabinetes y Equipos (incluidos los de piso) de la sala a borrar, y purga rigurosamente cualquier conexiÃ³n vinculada a ellos antes de eliminarlos.
* **BUG-10 (ColisiÃ³n Frontal/Trasera en Racks):** Se reparÃ³ el motor lÃ³gico de colisiones `canPlace()`. Anteriormente, el algoritmo ignoraba la cara del gabinete (`mountSide`), impidiendo instalar un servidor en el lado trasero si el lado frontal estaba ocupado. Ahora la lÃ³gica y la interfaz de "InstalaciÃ³n RÃ¡pida" reconocen los lados Frontal y Trasero de forma totalmente independiente.
## [2026-06-15 17:59] GeneraciÃ³n de IDs Segura y UX en Historial
* **BUG-03 (ColisiÃ³n de IDs):** Se reescribiÃ³ la funciÃ³n `uid()` en `js/utils.js` para utilizar `crypto.randomUUID()` nativo del navegador, extrayendo 16 caracteres hexadecimales para generar identificadores de hardware. Esto elimina prÃ¡cticamente cualquier riesgo de colisiÃ³n al clonar gabinetes masivos o arrastrar cientos de equipos rÃ¡pidamente.
* **U-1 (UX en Barra de Herramientas):** Se agregaron contadores numÃ©ricos dinÃ¡micos en tiempo real a los botones de Deshacer y Rehacer (e.g., `â†© 3` / `â†ª 1`). Esto mejora la retroalimentaciÃ³n visual permitiendo al usuario saber exactamente cuÃ¡ntos pasos tiene almacenados en su pila de historial.
## [2026-06-15 17:54] CorrecciÃ³n de Fuga de Memoria y Modo Rendimiento
* **BUG-04 (Fuga de Memoria):** Se solucionÃ³ una grave fuga de memoria (Memory Leak) en el sistema reactivo (`js/store.js`). Se implementÃ³ un cachÃ© local mediante `WeakMap` (`_proxyCache`) para reciclar instancias del Proxy. Esto evita la generaciÃ³n de miles de objetos descartables por segundo durante el ciclo de lectura de `drawTopo` a 60fps, estabilizando drÃ¡sticamente el consumo de RAM.
* **Modo Rendimiento (Interruptor de Animaciones):** Se transformÃ³ el punto de estado de "Sistema operativo" (esquina superior derecha) en un interruptor activo para el Modo Rendimiento. Al hacerle clic, apaga globalmente todas las transiciones, iluminaciones (glow) y animaciones CSS del proyecto a travÃ©s de la clase `no-animations`, y adicionalmente congela el motor de partÃ­culas JavaScript sobre los cables topolÃ³gicos (`flowT`).
## [2026-06-15 17:35] Modo Dios y Mejoras en TopologÃ­a
* **Modo Dios (Seguridad Visual):** Se implementÃ³ un alternador global en el menÃº principal (`ðŸ‘� Modo Dios: Revelar Claves`) para censurar u ocultar masivamente las contraseÃ±as de los equipos. Por defecto, todas las contraseÃ±as se renderizan como `â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢` en Tooltips, HUD TopolÃ³gico, Tablas de Inventario y Modal de EdiciÃ³n, garantizando seguridad visual contra mirones.
* **ExportaciÃ³n Segura de CSV/Excel:** La rutina de exportaciÃ³n de inventario fue mejorada para respetar el Modo Dios; si el modo estÃ¡ apagado, las contraseÃ±as se omiten/censuran en el reporte descargado.
* **Color de Servidores:** Se actualizÃ³ el color representativo de la clase "Servidor" del azul claro original a Esmeralda (`#10b981`) para mejor diferenciaciÃ³n en la TopologÃ­a, CatÃ¡logo y Vista FÃ­sica.
* **Visibilidad de Iconos:** Se corrigiÃ³ un error en el lienzo topolÃ³gico que impedÃ­a la visualizaciÃ³n de los iconos internos debido a superposiciÃ³n de colores (falta de restablecimiento del `fillStyle` a blanco).

## [2026-06-15 16:45] DocumentaciÃ³n de Arquitectura de Inicio
* **DocumentaciÃ³n TÃ©cnica:** Se agregÃ³ una nueva secciÃ³n de "InicializaciÃ³n y Carga de Datos" a los manuales (`manual.html` y `TECHNICAL_DOCS.md`) para explicar cÃ³mo funciona la comprobaciÃ³n del `localStorage` frente al arranque en estado en blanco, y los beneficios arquitectÃ³nicos de desacoplar e inyectar de manera dinÃ¡mica (lazy loading) los datos de demostraciÃ³n de `demoData.js`.

## [2026-06-15 16:35] OptimizaciÃ³n de Arranque y ExportaciÃ³n de Equipos de Piso
* **Arranque en Blanco:** Se modificÃ³ la inicializaciÃ³n en `store.js` y `index.html` para que el proyecto inicie con un estado limpio (una sola sala vacÃ­a) por defecto, en lugar de cargar datos fijos, mejorando la experiencia del nuevo usuario.
* **Carga DinÃ¡mica de Demostraciones:** Se eliminÃ³ la dependencia bloqueante de `demoData.js` en el arranque. Ahora, el script se inyecta dinÃ¡micamente (`loadScript`) Ãºnicamente cuando el usuario hace clic en "âœ¨ Cargar demos", ahorrando memoria y tiempo de carga.
* **Renderizado de Equipos de Piso:** Se corrigiÃ³ `rack.js` para que la secciÃ³n "Equipos de Piso / PerifÃ©ricos" se renderice correctamente en la vista fÃ­sica de la sala, incluso si esta no contiene ningÃºn gabinete.
* **ExportaciÃ³n PNG de Equipos de Piso:** Se aÃ±adiÃ³ la funciÃ³n `exportFloorToPNG()` en `modals.js` y se actualizÃ³ el modal de exportaciÃ³n para permitir generar imÃ¡genes PNG individuales de todos los equipos de piso de una sala.

## [2026-06-10 08:02] DocumentaciÃ³n y GrÃ¡ficos de Atomic Design
* **SecciÃ³n de DiseÃ±o AtÃ³mico:** AdiciÃ³n del nuevo capÃ­tulo interactivo en el manual HTML (`doc/html/manual.html`) y en la documentaciÃ³n tÃ©cnica Markdown (`doc/md/TECHNICAL_DOCS.md`), detallando el mapeo del proyecto a los 5 niveles de la metodologÃ­a.
* **GrÃ¡ficos Vectoriales de EvoluciÃ³n:** CreaciÃ³n de diagramas SVG individuales representando Ã�tomo, MolÃ©cula, Organismo, Plantilla y PÃ¡gina, ademÃ¡s de la infografÃ­a consolidada de esferas (`atomic_design_spheres.svg`).

## [2026-06-10 02:50] ReestructuraciÃ³n Funcional de DocumentaciÃ³n e InfografÃ­as
* **Estructura Documental Funcional:** RefactorizaciÃ³n de `USER_MANUAL.md` e `index.html` para unificar las explicaciones de escritorio y mÃ³vil bajo cada secciÃ³n funcional (GestiÃ³n de Salas, Equipos, TopologÃ­a, etc.), eliminando el capÃ­tulo aislado de Modo MÃ³vil.
* **MenÃº MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial `ui-mobile-menu.svg` mostrando el menÃº hamburguesa.
* **InfografÃ­a de Arquitectura:** CreaciÃ³n de `desktop-vs-mobile-architecture.svg` detallando las diferencias de flujos de trabajo (Drag & Drop vs UbicaciÃ³n RÃ¡pida Asistida, paneles fijos vs off-canvas).
* **InfografÃ­a de Ã�reas:** CreaciÃ³n de `desktop-vs-mobile-areas.svg` comparando el lienzo panorÃ¡mico frente a las pestaÃ±as de salas deslizables en mÃ³viles.

## [2026-06-10 02:45] Modales MÃ³viles de Sala y ConexiÃ³n e Ilustraciones Vectoriales
* **Diagrama de Modal de Nueva Sala MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-room.svg` representando el modal de creaciÃ³n de salas en la vista vertical mÃ³vil.
* **Diagrama de Modal de ConexiÃ³n MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-connection.svg` representando el modal de trazado de conexiones de red en la vista vertical mÃ³vil.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n de los nuevos diagramas en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:40] Formulario de Equipos MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de Formulario de Equipos MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-device.svg` que representa la interfaz del modal de registro/ediciÃ³n de dispositivos adaptado a la vista vertical mÃ³vil.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:35] Inventario MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de Inventario MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-inventory.svg` que representa la tabla de inventario expandida mediante un panel deslizable (drawer) en dispositivos mÃ³viles, mostrando las columnas y etiquetas adaptadas.
* **IntegraciÃ³n en Manuales:** SincronizaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:30] TopologÃ­a MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de TopologÃ­a MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-topology.svg` que representa fielmente el lienzo de la topologÃ­a de red en dispositivos mÃ³viles, mostrando las salas apiladas verticalmente y los enlaces de cableado.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:25] MenÃº de Proyecto MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de MenÃº de Opciones MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-menu.svg` que representa fielmente la interfaz del menÃº de proyecto desplegable en dispositivos mÃ³viles (Abrir, Guardar, Limpiar proyecto, Cargar demos, Modo Claro, ImportaciÃ³n/ExportaciÃ³n).
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:20] Diagrama de CatÃ¡logo y EstadÃ­sticas MÃ³viles (Off-Canvas)
* **Diagrama de CatÃ¡logo y EstadÃ­sticas MÃ³viles:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-catalog.svg` que representa fielmente la interfaz del panel lateral off-canvas en dispositivos mÃ³viles, incluyendo la cuadrÃ­cula de estadÃ­sticas (racks, dispositivos, unidades U y conexiones), barras de progreso, botones de acciÃ³n rÃ¡pida y el catÃ¡logo de dispositivos.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`) explicando la funcionalidad del menÃº off-canvas.

## [2026-06-10 01:40] IntegraciÃ³n de la DocumentaciÃ³n del Orquestador e Historial Reactivo
* **DocumentaciÃ³n del Modo MÃ³vil (Responsive):** CreaciÃ³n e integraciÃ³n del diagrama detallado de la consola en modo mÃ³vil (`ui-mobile.svg`), e inclusiÃ³n de una subsecciÃ³n de diseÃ±o mÃ³vil adaptativo en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario (`USER_MANUAL.md`).
* **IconografÃ­a en el Manual y Docs:** IntegraciÃ³n del logotipo oficial del sistema (`icon.svg`) en la cabecera, favicon y sidebar del manual interactivo HTML y de las especificaciones de la documentaciÃ³n tÃ©cnica.
* **RediseÃ±o del Mapa ArquitectÃ³nico Global:** CreaciÃ³n de una versiÃ³n mucho mÃ¡s amplia (1200x850), completa y detallada de la arquitectura general del sistema (`arquitectura.svg`), incorporando iconos visuales para cada mÃ³dulo, integraciones de archivos y leyendas descriptivas del flujo.
* **ExplicaciÃ³n GrÃ¡fica del AlmacÃ©n Reactivo:** CreaciÃ³n e integraciÃ³n del diagrama explicativo del store reactivo, Proxy ES6, auto-guardado en localStorage e historial (Undo/Redo) (`store-funcionamiento.svg`).
* **ExplicaciÃ³n GrÃ¡fica del Orquestador:** CreaciÃ³n e integraciÃ³n del diagrama detallado sobre la estructura y funcionamiento del orquestador central en la arquitectura reactiva (`orquestador-funcionamiento.svg`).
  * *CorrecciÃ³n:* Solucionado bug de solapamiento de texto encimado en la columna de "MÃ“DULOS RECEPTORES" corrigiendo las coordenadas `y` de posicionamiento absoluto del SVG.
* **ActualizaciÃ³n del Manual Interactivo HTML:** AÃ±adidas las secciones explicativas y vinculados los nuevos diagramas SVG en `doc/html/manual.html` para la secciÃ³n de arquitectura del almacÃ©n y renderizado.
* **ActualizaciÃ³n de DocumentaciÃ³n TÃ©cnica:** IncorporaciÃ³n del flujo de intercepciÃ³n del Proxy, el guardado persistente, el historial de snapshots y el despacho selectivo de eventos en `doc/md/TECHNICAL_DOCS.md`.


## [2026-06-09 20:23] Manual Interactivo HTML y Diagramas TÃ©cnicos
* **Manual Interactivo SPA:** MigraciÃ³n completa de la documentaciÃ³n tÃ©cnica y de usuario de formato texto plano a un portal web interactivo (`doc/html/manual.html`) con navegaciÃ³n lateral dinÃ¡mica y diseÃ±o adaptado en modo oscuro.
* **GrÃ¡ficos TÃ©cnicos SVG:** CreaciÃ³n e integraciÃ³n de diagramas vectoriales nativos explicativos:
  * AnatomÃ­a del Rack (Unidades U frontal/trasero).
  * Nodos de topologÃ­a y cableado de red.
  * Arquitectura reactiva del almacÃ©n central (`store.js`, `main.js`, `js/ui/`).
  * Funcionamiento de los lienzos (Lienzo DOM fÃ­sico vs. Canvas 2D topolÃ³gico).
  * CatÃ¡logo de equipos, eventos de arrastre y asistente de ubicaciÃ³n rÃ¡pida.
  * Flujo de actualizaciÃ³n DOM y despacho selectivo (`interfaz-funcionamiento.svg`).
  * Mapa de directorios y estructura modular del proyecto.
  * Sistema y flujos de exportaciÃ³n (imÃ¡genes PNG HD, tablas Excel/CSV y copias JSON).


## [2026-06-09 15:50] RediseÃ±o del Modal de Equipos
* **DiseÃ±o Compacto y Agrupado:** Se reorganizÃ³ la vista del modal "Nuevo/Editar Equipo" agrupando lÃ³gicamente Identidad, UbicaciÃ³n, Red, AutenticaciÃ³n y EnergÃ­a.
* **Cuadros de ActivaciÃ³n (Toggles):** Se aÃ±adieron casillas de verificaciÃ³n para activar/desactivar dinÃ¡micamente los mÃ³dulos de Red, Usuario y EnergÃ­a, evitando guardar datos innecesarios en equipos "pasivos" o sin gestiÃ³n.
* **SeparaciÃ³n de Tomas ElÃ©ctricas:** Se dividiÃ³ el campo de energÃ­a en "Tomas de Entrada" y "Tomas de Salida" para permitir modelar PDUs o UPSs que alimentan otros equipos, incluyendo tooltips explicativos.
* **Selector Explicito Rack/Piso:** Se aÃ±adiÃ³ un selector principal para alternar explÃ­citamente entre "Gabinete (Rack)" y "Equipo de Piso", controlando dinÃ¡micamente las opciones de tipo de equipo y ocultando el TamaÃ±o (U) cuando es necesario.

## [2026-06-09 14:52] OptimizaciÃ³n de Espacio en MÃ³vil
* **Barras de Herramientas mÃ¡s Compactas:** En la versiÃ³n mÃ³vil, las filas superiores (donde estÃ¡n las opciones de Vista FÃ­sica, TopologÃ­a y el control de zoom) ocupaban demasiado espacio vertical, restando Ã¡rea de trabajo. Se redujeron los mÃ¡rgenes, rellenos (paddings) y el tamaÃ±o de texto de estos botones especÃ­ficamente para pantallas tÃ¡ctiles, logrando un diseÃ±o mucho mÃ¡s esbelto y proporcionando mÃ¡s espacio para visualizar los gabinetes.

## [2026-06-09 14:33] Mejoras Visuales en Panel Lateral
* **Filtros Visibles y Deslizables:** Se restaurÃ³ el comportamiento de deslizamiento horizontal (scroll) en las pestaÃ±as de filtro del catÃ¡logo (Todos, Servers, Red, etc.). Para mantener el diseÃ±o limpio y libre de mÃºltiples barras (scrollbars) invasivas, se han ocultado visualmente las barras horizontales en todas las Ã¡reas de pestaÃ±as superiores. Sin embargo, ahora se puede utilizar la **rueda del ratÃ³n (mouse wheel)** de forma natural sobre los filtros para deslizarlos de izquierda a derecha sin esfuerzo en el modo de escritorio.

## [2026-06-09 14:24] CorrecciÃ³n de Guardado de Nuevos Equipos
* **Nuevas Plantillas de CatÃ¡logo:** Se solucionÃ³ un bug en el que al presionar "+ Agregar Equipo" y llenar el formulario, la informaciÃ³n se perdÃ­a si no era un equipo de piso. Ahora, el sistema guarda el nuevo equipo como plantilla en el CatÃ¡logo y abre automÃ¡ticamente el Asistente de UbicaciÃ³n RÃ¡pida (âš¡) para instalarlo inmediatamente en el rack deseado.

## [2026-06-09 14:18] Nuevos Campos de Equipo: Marca y Modelo
* **Datos de Equipo:** Se aÃ±adieron los campos "Marca" y "Modelo" a la estructura de datos de los equipos (devices).
* **Modal de EdiciÃ³n:** Se actualizÃ³ el formulario de ediciÃ³n de equipos (`#modal-device`) para incluir las nuevas entradas de Marca y Modelo.
* **Tabla de Inventario:** Se agregaron las columnas "Marca" y "Modelo" a la tabla de inventario en el panel inferior, permitiendo visualizaciÃ³n y ediciÃ³n en lÃ­nea.
* **ExportaciÃ³n de Datos:** Se actualizÃ³ la exportaciÃ³n a CSV y a Excel para que incluyan automÃ¡ticamente las nuevas columnas de Marca y Modelo.

## [2026-06-09 12:53] Mejoras Visuales en EstadÃ­sticas y TopologÃ­a
* **Tooltips Personalizados:** Se corrigiÃ³ el recorte visual (`overflow: hidden`) en los botones del panel de estadÃ­sticas, permitiendo mostrar los tooltips personalizados hacia abajo para que no interfieran con otros elementos visuales.
* **Resaltado de Sala Activa:** En la vista de TopologÃ­a, la sala actualmente seleccionada ahora se resalta con un contorno de color blanco para facilitar su identificaciÃ³n en el lienzo.

## [2026-06-09 12:35] ReorganizaciÃ³n de Cabecera y Tooltips Nativos
* **Tooltips en EstadÃ­sticas:** Se aÃ±adieron atributos `title` nativos a los botones de estadÃ­sticas en el panel lateral (y posteriormente se reemplazaron por tooltips personalizados).
* **ReubicaciÃ³n de PestaÃ±as de Vista:** Se movieron los botones "Vista FÃ­sica" y "TopologÃ­a" a la cabecera principal de la aplicaciÃ³n.
* **ReubicaciÃ³n de PestaÃ±as de Salas:** Se movieron las pestaÃ±as de selecciÃ³n de salas ("Data Center", "Edificio A2", etc.) a la barra de herramientas principal, despuÃ©s de los controles de zoom.
* **Fix MÃ³vil:** Se forzÃ³ el comportamiento del `flex-shrink` y `min-width` para los botones de la barra de herramientas principal, evitando el solapamiento en dispositivos mÃ³viles.


## [2026-06-07 19:55] OptimizaciÃ³n de TopologÃ­a de Red Demo
* **Estructura JerÃ¡rquica:** Se modificÃ³ `js/demoData.js` para aplicar una jerarquÃ­a de red realista. Ahora cada sala designa su primer switch como "Main Switch" (o de borde/agregaciÃ³n).
* **Enlaces Backbone:** Ãšnicamente los "Main Switch" de las salas secundarias se enlazan al "Core Switch" en el Data Center mediante un solo enlace de fibra Ã³ptica, reduciendo el desorden previo de interconexiones directas.
* **Equipos de Piso Localizados:** Los equipos distribuidos (cÃ¡maras, impresoras, APs) ahora se conectan de manera lÃ³gica al switch principal de su *propia* sala, en vez de enrutarse de forma irrealista a travÃ©s de todo el recinto hasta el Core Switch.



## [2026-06-07 16:37] ImplementaciÃ³n de Modo Claro

* **Modo Claro / Modo Oscuro:** Se implementÃ³ una paleta de colores alternativa (`[data-theme="light"]`) para soportar visualizaciÃ³n en Modo Claro manteniendo la identidad visual y asegurando alto contraste.

* **Toggle en MenÃº de Proyecto:** Se agregÃ³ la opciÃ³n "â˜€ï¸� Cambiar a Modo Claro" en el menÃº principal "Proyecto". El texto y la funciÃ³n se adaptan dinÃ¡micamente al estado actual del tema.

* **Persistencia del Tema:** La preferencia de tema elegido por el usuario se almacena localmente usando `localStorage` de manera que la aplicaciÃ³n carga directamente en el modo visual preferido.



## [2026-06-07 14:40] SimplificaciÃ³n de CatÃ¡logo

* **AgrupaciÃ³n de Acciones en CatÃ¡logo:** Se consolidaron los tres botones individuales (UbicaciÃ³n RÃ¡pida, Editar, Eliminar) de cada equipo en el panel del catÃ¡logo bajo un Ãºnico botÃ³n de opciones mÃºltiples ("â‹®"). Esto abre un menÃº contextual elegante, limpiando la interfaz visual y mejorando el uso del espacio.



## [2026-06-07 14:33] Correcciones de Interfaz y Experiencia en MÃ³viles

* **PestaÃ±as de Sala en MÃ³vil:** Se solucionÃ³ el problema donde el botÃ³n de cerrar sala ("âœ•") no aparecÃ­a en pantallas tÃ¡ctiles por depender del evento `hover`. Ahora es permanentemente visible en mÃ³viles (`@media (hover: none)`). AdemÃ¡s, se aÃ±adiÃ³ soporte para pulsaciÃ³n larga (`contextmenu`) permitiendo renombrar salas en celulares donde el doble clic no se detectaba correctamente.

* **Cierre AutomÃ¡tico del CatÃ¡logo MÃ³vil:** Se implementÃ³ una lÃ³gica (`closeMobileSidebar`) que oculta automÃ¡ticamente el menÃº lateral (catÃ¡logo) en modo mÃ³vil cada vez que el usuario abre los modales de "AÃ±adir a rack" (UbicaciÃ³n RÃ¡pida), "AÃ±adir Equipo" o "AÃ±adir Gabinete", evitando que el menÃº obstruya la vista del rack.

* **BotÃ³n ExplÃ­cito de Cierre:** Se agregÃ³ un botÃ³n visible ("âœ•") en la cabecera del panel de EstadÃ­sticas/CatÃ¡logo exclusivo para la vista mÃ³vil (`.mobile-only`), proveyendo una forma clara e intuitiva de colapsar el menÃº lateral.

* **Leyendas en EstadÃ­sticas:** Se reincorporaron pequeÃ±as etiquetas de texto descriptivo debajo de los iconos en el panel lateral de estadÃ­sticas para mayor claridad ("Gabinetes", "Equipos", "Capacidad U", "Conexiones").

* **Tooltips de Deshacer/Rehacer:** Se creÃ³ la clase modificadora CSS `.tooltip-bottom` y se aplicÃ³ a los botones de Deshacer/Rehacer en la barra superior. Esto corrige el problema en el que las leyendas emergentes se salÃ­an del Ã¡rea visible de la pantalla hacia arriba.



## [2026-06-07 13:04] Mejoras de UX MÃ³vil y Opciones de InserciÃ³n

* **Seguimiento DinÃ¡mico de Tooltips:** Se reescribiÃ³ la lÃ³gica de posicionamiento de las etiquetas flotantes (tooltips) para que sigan con precisiÃ³n al cursor del ratÃ³n (`mousemove`), mejorando sustancialmente la experiencia frente a la anterior ancla estÃ¡tica a la derecha del rack.

* **Soporte PWA MÃ³vil:** Se aÃ±adiÃ³ una capa de oscurecimiento global (`#mobile-overlay`) y menÃºs laterales tÃ¡ctiles (`off-canvas`) adaptados para pantallas pequeÃ±as, ademÃ¡s de deshabilitar los tooltips conflictivos en dispositivos tÃ¡ctiles puros.

* **Selector Frontal/Trasera en UbicaciÃ³n RÃ¡pida:** Se introdujo la opciÃ³n de seleccionar la cara de montaje ("Frontal" o "Trasera") dentro del flujo asistido de "UbicaciÃ³n RÃ¡pida" (`#modal-quick-placement`), asegurando paridad con el montaje por arrastre (`drag & drop`).

* **IconografÃ­a PWA (Logo):** Se reconstruyÃ³ el Ã­cono del sistema como SVG puro (`icon.svg`), optimizÃ¡ndolo para su uso como Ã­cono de aplicaciÃ³n y se enlazÃ³ de nuevo en todo el proyecto.



## [2026-06-06 21:28] Mejoras en ExportaciÃ³n PNG y Limpieza Visual

* **Ajuste de Zoom en Vista FÃ­sica:** Se corrigiÃ³ un problema de diseÃ±o Flexbox al alejar la vista fÃ­sica; ahora el contenedor principal expande dinÃ¡micamente su ancho base (`width: 100/z %`) relativo al nivel de escalado (`scale(z)`). Esto permite que mÃ¡s gabinetes fluyan y aprovechen todo el ancho disponible de la pantalla al hacer zoom out, en lugar de limitarse a la cuadrÃ­cula original.

* **ExportaciÃ³n PNG Dual:** Se refactorizÃ³ la funciÃ³n de exportaciÃ³n a PNG (`exportRackToPNG`). Ahora, si un gabinete contiene equipos en la vista trasera, el lienzo (Canvas) se expande automÃ¡ticamente y renderiza ambas caras (Frontal y Trasera) una al lado de la otra en una misma imagen, permitiendo reportes integrales.

* **Limpieza de Vista Trasera:** Se eliminÃ³ la repeticiÃ³n del nombre del gabinete en el encabezado de la "Vista Trasera" tanto en la interfaz de usuario como en las imÃ¡genes exportadas, logrando un diseÃ±o mÃ¡s minimalista y profesional.

* **ActualizaciÃ³n de DocumentaciÃ³n:** Se actualizaron `DOC_MANUAL_USUARIO.md` y `DOC_MANUAL_FUNCIONAMIENTO.md` para reflejar el comportamiento del nuevo sistema de renderizado doble y las vistas traseras.

* **ActualizaciÃ³n de IconografÃ­a:** Se limpiÃ³ el fondo azul de los logos e iconos PWA, dejÃ¡ndolos con transparencia, manteniendo la "Variante 2" (gradiente azul y borde cyan).

* **Gestor de Paquetes estricto:** Se implementÃ³ una directiva estricta de entorno mediante el `package.json` para bloquear el uso de `npm` o `yarn`, forzando el uso de `pnpm` como Ãºnico manejador de paquetes del proyecto.



## [2026-06-05 22:25] CorrecciÃ³n CrÃ­tica en Renderizado de Racks e Inventario

* **Fallo de Renderizado e Inventario:** Se corrigiÃ³ un `ReferenceError` en `js/ui/rack.js` relacionado con la restauraciÃ³n del estado de los gabinetes volteados (`flippedRacks`) al recargar la vista. Este error bloqueaba el renderizado de la tabla de inventario en el panel inferior.

* **Persistencia de Vista Trasera:** Se modificÃ³ la funciÃ³n `bindRackEvents` para que la vista trasera persista tras mover o agregar equipos, corrigiendo un comportamiento donde volvÃ­a forzosamente a la vista frontal.



## [2026-06-05 21:25] Montaje Independiente en Vista Trasera

* **Doble Lado de Rack**: La vista trasera ahora funciona como un rack independiente (`mountSide='rear'`), permitiendo montar equipos adicionales en las mismas U pero en la parte de atrÃ¡s del gabinete, ideal para organizadores de cables o PDUs.

* **Sistema de Drag & Drop por Lado**: Al arrastrar un equipo desde el catÃ¡logo hacia los slots de la cara trasera, este se guarda en el Store como "Trasero", evitando colisiones con los equipos de la parte delantera.

* **Interfaz y AnimaciÃ³n**: Botones "ðŸ”„ ATRÃ�S" y "ðŸ–¥ï¸� FRENTE" que activan una animaciÃ³n 3D (`rotateY 180Â°`). Cada lado del rack muestra su propio medidor de Us ocupadas.



## [2026-06-05 20:45] EdiciÃ³n de ConexiÃ³n por Doble Clic en TopologÃ­a

* **Doble clic sobre cable**: Al hacer doble clic sobre cualquier tramo de cable en la vista de TopologÃ­a, se abre directamente el modal de **Editar ConexiÃ³n** con todos los datos precargados (equipo origen/destino, puerto, tipo de cable y color).

* **DetecciÃ³n geomÃ©trica**: Se implementÃ³ un algoritmo de muestreo de curva BÃ©zier (30 segmentos) para detectar con precisiÃ³n si el clic aterrizÃ³ sobre un cable. Tolerancia de 10px en espacio del mundo.

* **Prioridad**: Si el doble clic cae sobre un nodo/equipo, se mantiene el comportamiento original (abrir modal de nueva conexiÃ³n). Solo cuando no hay nodo debajo se evalÃºan los cables.



## [2026-06-05 20:16] Mejoras de trazabilidad en Conexiones

* **UbicaciÃ³n en tabla de conexiones**: Se aÃ±adieron las columnas "Sala/Rack Origen" y "Sala/Rack Destino" a la tabla inferior de conexiones para identificar rÃ¡pidamente dÃ³nde estÃ¡ cada equipo sin depender Ãºnicamente de su nombre.

* **Modal de conexiÃ³n**: Se agregaron campos de solo lectura "UbicaciÃ³n Origen/Destino" que se actualizan dinÃ¡micamente en el modal al conectar equipos.

* **ExportaciÃ³n de datos**: Se actualizaron las funciones de exportaciÃ³n (CSV y Excel) para que tambiÃ©n incluyan las nuevas columnas de ubicaciÃ³n de origen y destino.

* **FunciÃ³n auxiliar**: Se implementÃ³ `getDeviceLocation(device)` en el core (`utils.js`) para resolver ubicaciones de forma global (corrigiendo una incompatibilidad previa de mÃ©todos).

* **Equipos de piso en datos de prueba**: Se aÃ±adieron conexiones a todos los equipos de piso en el Data Center (`js/demoData.js`) para validar visualmente la funcionalidad de las nuevas columnas.



## [2026-06-05 20:10] AplicaciÃ³n de DiseÃ±o de Red y VLANs

* **EstructuraciÃ³n de Salas y Racks**: Se actualizÃ³ la carga de datos de demostraciÃ³n (`js/demoData.js`) para implementar 3 salas principales (Data Center, Edificio A2, Edificio B1) y sus respectivos gabinetes (Racks 101-104, 201-203, 301-305).

* **SegmentaciÃ³n por VLAN**: Se implementÃ³ la propuesta de enrutamiento asignando direcciones IP fijas correspondientes a VLANs especÃ­ficas:

  * VLAN 10 (10.10.10.0/24) para switches de capa de acceso, Core y Firewall.

  * VLAN 20 (10.10.20.0/24) para las UPS de cada gabinete.

  * VLAN 30 (10.10.30.0/24) para Servidores (nodos distribuidos sistemÃ¡ticamente por rack).

  * VLAN 60, 70 y 80 para equipos de piso (CÃ¡maras, Impresoras y TelefonÃ­a IP).

  * Access Points en la red de administraciÃ³n (VLAN 10) proveyendo el trÃ¡fico corporativo y de invitados (VLAN 50, VLAN 90).



## [2026-06-05 19:56] Mejoras de UI y CorrecciÃ³n de Bugs

* **OptimizaciÃ³n visual de EstadÃ­sticas**: Se redujo el espacio ocupado por los datos de estadÃ­sticas en la barra lateral reemplazando el diseÃ±o de cuadrÃ­cula con texto por un diseÃ±o horizontal mÃ¡s compacto usando iconos vectoriales (Gabinetes, Equipos, Unidades U, Conexiones) y tooltips.

* **OptimizaciÃ³n de botones Deshacer/Rehacer**: Se eliminÃ³ el texto para ahorrar espacio; ahora muestran Ãºnicamente los Ã­conos (â†© y â†ª) con leyendas emergentes (tooltips) al pasar el cursor.

* **CorrecciÃ³n del desplazamiento de pestaÃ±as de sala**: Se aÃ±adiÃ³ un margen inferior (`padding-bottom`) en `.room-tabs` para prevenir que la barra de desplazamiento horizontal nativa superponga y bloquee los clics en los botones cuando hay mÃºltiples salas.

* **CorrecciÃ³n de cambio de sala**: Se solucionÃ³ un problema de distinciÃ³n de mayÃºsculas y minÃºsculas (case sensitivity) en `js/ui/catalog.js` donde el evento disparado al hacer clic en las pestaÃ±as (`room-tab-change`) era ignorado por el renderizador (`source.includes('Room')`), impidiendo que la vista fÃ­sica se actualizara correctamente. Se cambiÃ³ el nombre del evento a `changeRoom`.

- Fix: Componentes flotantes (modales, tooltips, mens) ajustados a var(--bg-panel) para soportar el modo claro.



- Fix: Componentes flotantes ajustados a var(--bg-panel) para soportar el modo claro.


## [2026-06-21 21:00:00] ReorganizaciÃ³n de Archivos y Ajustes UI
* **UbicaciÃ³n de Scripts Python:** Se agruparon todos los scripts .py dentro de una nueva carpeta .py para mantener la raÃ­z del proyecto limpia. Se actualizÃ³ INSTRUCTIONS.md reflejando esta regla.
* **OrganizaciÃ³n de Logs:** Se moviÃ³ el archivo logs_cambios.txt de la raÃ­z al directorio doc/log/.
* **CorrecciÃ³n de Iconos PWA:** Se corrigieron las rutas en index.html y json/manifest.json que apuntaban a icons/ en lugar de ssets/icons/, restaurando el favicon.
* **Panel de EstadÃ­sticas Colapsado:** Se modificÃ³ index.html para que el panel de estadÃ­sticas inicie oculto por defecto (clase hidden y chevron â–º), optimizando el espacio inicial.

## [2026-06-21 22:05:00] ExpansiÃ³n del CatÃ¡logo y MigraciÃ³n a SVG
* **EstructuraciÃ³n del CatÃ¡logo:** Se aÃ±adieron nuevas opciones para equipos alineadas a la teorÃ­a de datacenters: patchpanel, organizer, pdu, 	ray, kvm.
* **Filtros UI:** Se rediseÃ±aron las pestaÃ±as laterales del catÃ¡logo dividiÃ©ndolas en Servidores, Red, Storage, Cableado, EnergÃ­a y Accesorios.
* **MigraciÃ³n a SVG MonocromÃ¡tico:** Se reemplazaron los emojis del catÃ¡logo y UI por archivos SVG ubicados en ssets/icons/.
* **Sistema de MÃ¡scaras CSS:** Se implementÃ³ renderizado con mask-image en HTML para tintar los SVGs.
* **Soporte Canvas SVG:** Se implementÃ³ cachÃ© de imÃ¡genes en TopologyRenderer.js para dibujar SVGs en la vista topolÃ³gica.

## [2026-06-21 22:15:00] Bugfix: Iconos de SAN y NAS
* **CatÃ¡logo:** Se corrigiÃ³ un error en el que el catÃ¡logo y la topologÃ­a no encontraban los iconos para equipos cuyo archivo SVG se llamaba diferente al 	ype principal (ej. san.svg y 
as.svg para la categorÃ­a storage). Ahora se extrae correctamente el nombre del archivo desde la ruta definida en el modelo de datos.

 # #   [ 2 0 2 6 - 0 7 - 1 3   1 5 : 3 5 : 0 0 ]   R e n d e r i z a d o   O r t o g o n a l   2 D   e n   V i s t a   F í s i c a 
 *   * * V i s t a   F í s i c a : * *   I m p l e m e n t a c i ó n   d e   l i e n z o   S V G   i n t e r a c t i v o   p a r a   d i b u j a r   c o n e x i o n e s   f í s i c a s   d e   m a n e r a   t r a n s p a r e n t e . 
 *   * * A l g o r i t m o   d e   c a b l e s : * *   D e s a r r o l l o   d e   a l g o r i t m o   d e   t r a z a d o   d e   r u t a s   2 D   d e   t i p o   o r t o g o n a l ,   p e g a d o   a   l o s   b o r d e s   v e r t i c a l e s   d e   l o s   g a b i n e t e s ,   c o n   e s q u i n a s   r e d o n d e a d a s . 
 *   * * A n c l a j e   D O M : * *   I n y e c c i ó n   d e   a t r i b u t o s   d a t a - p o r t   y   d a t a - d e v i c e - i d   e n   f a c e p l a t e s   f r o n t a l e s   y   t r a s e r o s   p a r a   r e f e r e n c i a r   p u n t o s   d e   i n i c i o / f i n   p r e c i s o s . 
  
 