## [2026-07-11] Corrección Masiva de Bugs, Limpieza de Código Muerto y Optimización de Performance

### Correcciones Críticas (8 bugs)
- **Bug #1 — Catálogo eliminaba TODAS las plantillas:** `CATALOG = CATALOG.filter(...)` reasignaba el array completo. Corregido a `CATALOG.length = 0; CATALOG.push(...)` para preservar la referencia.
- **Bug #2 — Service Worker con paths incorrectos:** `service-worker.js` referenciaba archivos inexistentes (`js/core/store.js`, `js/core/RackAuth.js`, `js/ui/canvas.js`). Reescrito con las rutas reales del proyecto. Cache name cambiado de `rack-designer-next-cache-v1` a `rack-designer-next-cache-v2`.
- **Bug #3 — Doble render al cambiar sala:** `catalog.js` llamaba `store.setCurrentRoom()` + `store._emit('change')` duplicando el evento. Eliminada la emisión manual.
- **Bug #4 — Inspector mostraba `Uundefined`:** `inspector.js:48` usaba `dev.position` (inexistente). Corregido a `dev.slotStart`.
- **Bug #5 — deleteRoom dejaba huérfanos en topología:** Las posiciones de `roomPositions`, `rackPositions`, `nodePositions` no se limpiaban al eliminar una sala. Agregado método `_cleanTopologyPositions()` en `store.js`.
- **Bug #6 — deleteRack dejaba huérfanos en topología:** Mismo problema que Bug #5 pero al eliminar un rack. `deleteRack()` ahora llama `_cleanTopologyPositions()`.
- **Bug #7 — deleteRoom no actualizaba estadísticas:** `renderAll()` no incluía `renderStats()` en el branch de `Room`. Agregada la llamada.
- **Bug #8 — Pan/Zoom causaba ~60 writes/sec a localStorage:** `setPan()` y `setZoom()` llamaban `_save()` en cada mousemove. Agregado método `_saveDebounced()` con `requestAnimationFrame` para agrupar escrituras.

### Correcciones Adicionales
- **Bug #9 — Doble registro Service Worker:** `main.js` y `index.html` ambos registraban el SW. Eliminada la línea redundante de `main.js`.

### Optimización
- **Eliminados `renderStats()` duplicados:** `main.js` tenía llamadas duplicadas en los branches de loadData/undo/redo y Rack.

### Eliminación de Código Muerto (6 archivos)
- `js/models/Rack.js`, `Device.js`, `Cable.js` — Clases nunca instanciadas
- `js/api/apiClient.js` — Módulo nunca importado (stubs)
- `js/core/export.js` — Módulo nunca importado (stubs)
- `js/ui/topology.js` — Archivo vacío (solo comentario)
- Eliminados directorios vacíos `js/models/` y `js/api/`
- Eliminado `<script>` tag de `topology.js` en `index.html`
- Eliminada entrada de cache en `service-worker.js`

### Métodos Nuevos en store.js
- `updateRoom(id, props)` — Actualiza propiedades de una sala
- `setCurrentRoom(id)` — Cambia la sala activa
- `setZoom(view, value)` — Establece zoom con debounce
- `setPan(view, x, y)` — Establece pan con debounce
- `deleteRoom(id)` — Elimina sala con limpieza de topología
- `_cleanTopologyPositions({ roomIds, rackIds, deviceIds })` — Limpia posiciones obsoletas
- `_saveDebounced()` — Escritura diferida con `requestAnimationFrame`

### Archivos Modificados
- `js/store.js` — Nuevos métodos, debounce, limpieza de topología
- `js/main.js` — Eliminado SW duplicado, eliminados renderStats duplicados, agregado renderStats para deleteRoom
- `js/ui/catalog.js` — Fix delete-all-templates, fix doble render
- `js/ui/inspector.js` — Fix `dev.position` → `dev.slotStart`
- `js/ui/topology/TopologyEvents.js` — Fix doble modal
- `js/ui/modals/RoomModal.js` — Usa `store.deleteRoom()`
- `service-worker.js` — Reescrito con paths correctos, cache v2
- `index.html` — Eliminado script tag de topology.js
- `AGENTS.md` — Nuevo archivo de onboarding para agentes de IA

### Documentación
- Actualizado CHANGELOG.md (este archivo)
- Actualizado PROJECT_ANALYSIS.md
- Actualizado CODEBASE_ORIENTATION_MAP.md
- Regenerado directory_structure.svg
- Regenerado module_dependencies.svg

---

## [2026-07-10] Motor de Topología Mejorado — Layout, Espaciado y Auto-Orden

### Nuevas Características
- **Botón Auto-Orden (⚡):** Nuevo botón en la barra de la vista de Topología que resetea y recalcula todas las posiciones (salas, racks, nodos) desde cero usando el algoritmo de layout óptimo basado en el tamaño real de las tarjetas.
- **Slider de Espaciado de Nodos:** Control deslizable (rango 40–150 px) para ajustar la separación vertical entre equipos dentro de los racks en tiempo real. El valor persiste entre recargas.
- **Botón de Estilo de Topología (🎛):** Alterna la representación gráfica de los nodos entre modo Tarjeta (card) y modo Círculo (circle).

### Correcciones Críticas (Motor de Layout)
- **Reescritura completa de `TopologyLayout.js`:** El motor de posicionamiento fue rediseñado desde cero para basarse en el **tamaño real de las tarjetas** (`CARD_W=160, CARD_H=60`) en lugar de valores fijos arbitrarios. Esto elimina de raíz las colisiones visuales entre nodos.
- **Grid de dispositivos de piso:** Los equipos instalados directamente en la sala (fuera de un rack) ahora se distribuyen en una **cuadrícula inteligente** (hasta 4 columnas, múltiples filas) en vez de una sola fila horizontal aplastada.
- **Ancho de rack dinámico:** El ancho de cada rack se calcula según el nombre del rack y el nombre del equipo más largo, evitando texto desbordado o recortado.
- **Función privada `_computeLayout()`:** Las tres funciones (`initTopoPositions`, `autoOrderTopo`, `recalcTopoSpacing`) ahora comparten un núcleo matemático común para garantizar consistencia en todos los escenarios.

### Correcciones de UI
- **Botón "Estilo" y Slider invisibles en Vista Física:** Se reemplazó la manipulación de `style.display` con una clase CSS `.force-hide { display: none !important; }` para garantizar que los controles de topología nunca sean visibles fuera de su contexto.
- **Bucle de animación duplicado:** El clic en el botón de Estilo ya no llamaba a `drawTopo()` manualmente, lo que duplicaba el motor de animación y aceleraba los cables.
- **Velocidad de animación:** Se redujo a la mitad la velocidad de las partículas en las conexiones (`flowT` de `0.015` → `0.0075`).

### Archivos Modificados
- `js/ui/topology/TopologyLayout.js` — Reescritura completa (motor de layout)
- `js/ui/topology/TopologyState.js` — Persistencia de `TOPO_SPACING` en el estado guardado
- `js/ui/topology/TopologyRenderer.js` — Ajuste de velocidad de animación
- `js/main.js` — Registro de eventos de slider/botones; toggle de visibilidad por vista
- `index.html` — Botones Auto-Orden y Slider en la barra de herramientas
- `css/layout.css` — Clase `.force-hide` y `.topo-slider`

## [2026-07-10] Panel de Propiedades y Refactorización del Outliner

### Nuevas Características y UI
- **Inspector de Propiedades:** Se introdujo un panel central dinámico (`js/ui/inspector.js`) que renderiza de manera instantánea y en modo de solo lectura los detalles del objeto seleccionado en el Outliner. Soporta mostrar propiedades completas de Salas, Gabinetes y Equipos (con íconos dinámicos FontAwesome).
- **Outliner Mejorado:** El árbol jerárquico (`js/ui/outliner.js`) ahora soporta un estado de selección interactivo global. Al hacer clic simple sobre una Sala, Gabinete o Equipo, el Inspector se actualiza. El doble clic continúa abriendo el modal de edición correspondiente (DeviceModal, RoomModal, RackModal). Se removió un artefacto visual de "U" no definida de la vista.
- **Estadísticas Colapsables:** El panel de estadísticas inferior ahora puede contraerse haciendo clic en su cabecera para otorgar más espacio visual al nuevo Inspector.
- **Soporte SVG:** Se actualizó el layout a `modals_accordions.svg` con la nueva configuración.

### Actualización de Documentación
- **Manual de Usuario:** Se actualizó `USER_MANUAL.md` para reflejar el comportamiento del nuevo Panel Derecho (Outliner interactivo, Inspector y Estadísticas colapsables).
- **Arquitectura:** Se integró `inspector.js` a `CODEBASE_ORIENTATION_MAP.md` y `PROJECT_ANALYSIS.md` junto con los flujos de lectura en README.

## [2026-07-10] Mapa de Orientación del Código (Onboarding Engineer)

### Actualización de Documentación
- **Mapa de Orientación**: Creación de `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` que detalla de forma exhaustiva y técnica la arquitectura modular, flujos de datos reactivos (Proxy ES6), y límites de las capas del proyecto para agilizar el onboarding de desarrolladores.

### Rediseño de la Cabecera Principal y Navegación
- **Dropdowns de Salas y Racks:** Se rediseñó la cabecera principal (`header-main-area`) trasladando la navegación de salas desde la barra inferior hacia la parte superior.
- **Selector Inteligente de Racks:** Se añadió un menú desplegable que lista dinámicamente todos los racks de la sala activa, permitiendo salto rápido y resaltado visual (scroll).
- **Estilos CSS Modernizados:** Se utilizaron menús flotantes (`position: absolute`) para evitar la deformación del layout principal al desplegar, además de sustituir emojis por puntos indicadores CSS de estado activo/inactivo (`.status-dot-nav`).

### Corrección de Errores (Bugfixes)
- **Error Crítico de Racks en Sala:** Se corrigió un error grave al intentar usar `store.allRacksInRoom()` que no existía, cambiándolo por el filtrado nativo `store._raw.racks.filter(...)`, lo cual rompía la inicialización visual completa del entorno.
- **Fallo al Cerrar Sesión:** El handler de logout estaba enterrado dentro de `initChangePinModal()`, haciéndolo dependiente de la inicialización del menú de proyecto. Se reubicó directamente en `init()` para garantizar su registro independiente. Se usa `window.location.reload()` para un reseteo limpio.
- **Demos no cargaban en `file:///`:** La carga dinámica de `demoData.js` via `document.createElement('script')` fallaba por restricciones CORS del navegador en protocolo `file:///`. Se añadió `demoData.js` como `<script>` estático en `index.html`.
- **Protección de renderizado:** Se envolvió `renderRackSelector()` en `try-catch` para evitar que un error en el selector de racks rompa toda la cadena de `renderAll()`.
- **Error de Referencia de Topología**: Se corrigió un `ReferenceError: renderTopology is not defined` en `js/main.js` al hacer clic en el botón de **Estilo** en la vista de topología. Se reemplazó la llamada por un control condicional seguro a `drawTopo()`.

### Mejoras Visuales y UX
- **Rediseño del Header:** Se reorganizó la cabecera principal (`.header-main-area`). Los selectores de Salas y Racks se movieron a la izquierda con íconos de despliegue (`▶`), y los tabs de vista (Física/Topología) se alinearon a la derecha.
- **Barra de Herramientas Transparente:** La barra de controles del canvas ahora tiene fondo 100% transparente y flota sobre el canvas en la parte superior.
- **Equipos de Piso Inteligentes:** El panel inferior de equipos de piso ahora tiene ancho autoescalable: ocupa exactamente el ancho de un rack (`260px`) si está vacío, o se expande al `100%` debajo de los racks si está ocupado.
- **Menú Unificado en Piso:** Se reemplazaron los botones directos de editar/eliminar en las tarjetas de piso por un único botón de opciones (`⋮`) que despliega el menú contextual, unificando la experiencia con el resto de la interfaz. También se corrigió un problema de CSS (`faceplates.css`) que impedía ver estos botones al hacer hover.
- **Nuevo Panel Derecho (Outliner):** Se dividió la pantalla en 3 columnas principales, añadiendo un panel derecho (260px). Se implementó un Outliner (árbol jerárquico estilo Blender) para visualizar y acceder rápidamente a todos los equipos, agrupados por Sala, Rack y Equipos de Piso.
- **Reubicación de Estadísticas:** Se eliminó la caja redundante del título de estadísticas en el panel izquierdo y se trasladaron los "pills" de indicadores (Gabinetes, Equipos, U ocupadas, Potencia) al nuevo panel derecho para compartir espacio debajo del Outliner, aprovechando mejor la verticalidad.


## [2026-06-24] Rediseño y Reubicación de Diagramas SVG (AI Agents)

### Actualización de Documentación
- **Manual de Usuario:** Se actualizó la sección 4 de `doc/doc_md/USER_MANUAL.md` ("Flujo de Trabajo End-to-End"), sustituyendo el tutorial paso a paso por una descripción arquitectónica detallada en 4 fases (Preparación, Diseño Físico, Diseño Lógico, y Auditoría/Respaldo).

### Corrección de Directorio y Rediseño Visual Completo
- **Reubicación:** Los diagramas SVG se movieron al directorio correcto `doc/doc_img/doc_svg/`.
- **Rediseño Profesional Premium:** Los 18 diagramas fueron completamente rediseñados con estética de nivel técnico-industrial: gradientes multicapa, tipografía Segoe UI, simulaciones visuales de interfaz (rack slots, canvas 2D, selects/inputs), filtros SVG de glow/shadow, colores acento semánticos por dominio, y layouts con proporciones de cuadrícula estrictas. Se eliminó el diseño plano y básico anterior.
- **Diagramas generados en `doc/doc_img/doc_svg/`:**
  - `architecture_overview.svg` — Capas Data / Logic / Presentation con cards por módulo.
  - `store_reactivity.svg` — Flujo ES6 Proxy → localStorage/historial/UI con ramas visuales.
  - `roles_permissions.svg` — 3 columnas de roles con ícono de persona, permisos y token de sesión.
  - `theme_switcher.svg` — Tokens CSS Dark/Light con swatches de color reales.
  - `device_skins_fallback.svg` — Comparativa SVG faceplate vs CSS fallback con preview de rack.
  - `autosave_history.svg` — Stack de historial, timer debounce, localStorage y fileHandle.
  - `security_rbac_crypto.svg` — Flujo SHA-256, código Web Crypto API, y escenario anti-tamper.
  - `topology_engine.svg` — Arquitectura MVC + simulación de canvas 2D con nodos y cables.
  - `drag_drop_flow.svg` — 3 fases: Catálogo → Rack slot → Floor drop con eventos.
  - `export_system.svg` — 4 formatos de exportación con simulaciones de JSON/CSV/canvas.
  - `pwa_service_worker.svg` — Intercepción de fetch, rama cache HIT/MISS, manifest install.
  - `hybrid_network_ports.svg` — Selector dinámico SELECT vs INPUT con simulación de UI.
  - `module_dependencies.svg` — Grafo radial con main.js como nodo central.
  - `directory_structure.svg` — Árbol de carpetas coloreado por dominio con descripciones.
  - `file_manager_api.svg` — Open/Save/AutoSave flows con comparativa nativa vs blob fallback.
  - `modals_accordions.svg` — Lista de modales + simulación de acordeón de DeviceModal.
  - `ui_layout_map.svg` — Simulación visual completa de la aplicación con paneles anotados.
  - `user_personas.svg` — 3 tipos de usuario con avatares y matrices de capacidades.

## [2026-06-23] Sistema Dinámico de Interfaces de Red Opcionales (Workflow Architect)

### Configuración Híbrida de Puertos
- **Arquitectura de Datos (`store.js`):** El esquema de los equipos (`devices`) se ha expandido para soportar un objeto `ports` (`{ ethernet, fiber }`) totalmente opcional, manteniendo retrocompatibilidad absoluta con inventarios anteriores.
- **Formulario Inteligente (`DeviceModal.js`):** Se inyectó un nuevo módulo colapsable ("Interfaces de Red") en el modal principal de edición que permite al usuario definir numéricamente la cantidad de puertos SFP (Fibra) y Ethernet de cada equipo.
- **Conexionado Dinámico (`CableModal.js` y `index.html`):** Los campos de "Puerto Origen" y "Puerto Destino" en la interfaz de parcheo evolucionaron de ser únicamente texto libre a ser mutables. Si el sistema detecta que el usuario está cableando un equipo con puertos definidos, la UI inyecta instantáneamente un desplegable restrictivo `<select>` (ej: `Eth-1`, `Eth-2`, `SFP-1`); si el equipo no los define, revierte limpiamente a un campo de texto `<input>`.

## [2026-06-23] Parches de Seguridad (Client-Side) y Normalización UI (Security Architect & UI Designer)

### Seguridad Criptográfica y Control de Sesión
- **Hashing SHA-256 (Web Crypto API):** Se eliminó el almacenamiento en texto plano del PIN de administrador (`rack2024`). El módulo `js/auth/roles.js` ahora computa y almacena asíncronamente únicamente huellas criptográficas SHA-256 (`localStorage`), bloqueando filtraciones de credenciales. Las funciones de validación en `js/main.js` fueron refactorizadas a un modelo `async/await`.
- **Integridad de Sesión Anti-Tampering:** Se implementó un sello de integridad de memoria (*closure token*) mediante `crypto.randomUUID()`. Si un usuario altera manualmente su `sessionStorage` desde DevTools para elevar sus privilegios (ej. de `viewer` a `admin`), el sistema forzará un cierre de sesión automático al detectar la ausencia del token en RAM.

### Arquitectura Visual ("IDE-Grade")
- **Purga de "AI Slop" en UI:** Se eliminaron los estilos CSS "comerciales" (alturas excesivas, paddings gigantes y botones con degradados púrpuras) incrustados en `index.html` para el `#modal-login`. Se reestructuró para forzar el uso de las clases base del sistema (`.modal`, `.btn-confirm`, `.btn-cancel`), aplicando el **Acento Técnico (Cian puro)** y respetando la regla matemática de alturas de **24px** para controles.
- **Scroll Interno y Límites de Visualización:** Se aplicó `max-height: 90vh` y `overflow-y: auto` de forma global a la clase `.modal` en `css/components/modals.css`, garantizando que los modales extensos (como la edición de un equipo con todos los paneles expandidos) se mantengan accesibles en pantallas de baja resolución (laptops) y no oculten los botones de acción ("Guardar" / "Cancelar"). Se implementó además una barra de desplazamiento nativa estilizada que encaja con el entorno profundo de RACK Designer Next.

## [2026-06-23] Optimización PWA y Accesibilidad ARIA (Frontend Developer)

### Progressive Web App (PWA) y Core Web Vitals
- **Instalación Offline:** Se creó el archivo `service-worker.js` para cachear la capa de presentación completa (HTML, CSS, JS, SVGs y fuentes). Esto asegura que RACK Designer Next cargue instantáneamente y sea instalable como aplicación de escritorio/móvil independiente sin requerir conexión a la red.
- **Registro del Service Worker:** Se integró la lógica de registro en `js/main.js` interceptando el evento `load` de la ventana para no bloquear el hilo de renderizado principal (protegiendo el LCP).

### Accesibilidad (WCAG 2.1 AA)
- **Navegación Semántica (Screen Readers):** Se inyectaron etiquetas `aria-label` en todos los controles interactivos y botones iconográficos (menú, controles de zoom, expansión de paneles, etc.) en `index.html`. Ahora los lectores de pantalla vocalizan la intención real de la acción en lugar de leer los caracteres ASCII.

## [2026-06-23] Auditoría y Normalización de UI (UI Designer)

### Sistema de Diseño y Accesibilidad
- **Contraste Perfeccionado:** Se aclaró el token `--text-muted` de `#8496b0` a `#94a3b8` en `css/variables.css` y `.agents/DESIGN.md` para garantizar el cumplimiento estricto del ratio de contraste WCAG AA sobre fondos oscuros.
- **Eliminación de "AI Slop":** Se reemplazó la sombra difuminada global (`--shadow`) por una sombra dura de estilo IDE (`0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)`) para una estética más profesional y densa.
- **Micro-Alineación Estricta a 24px:** 
  - Se corrigió `css/components/modals.css` para forzar que todos los inputs, selects y botones de los modales respeten la directriz obligatoria de 24px de altura (`height: 24px !important`).
  - Se ajustó el padding asimétrico de la caja de búsqueda (`.h-search input`) en `css/layout.css` (`padding: 0 8px 0 30px`) para evitar el solapamiento del ícono de la lupa respetando las reglas de la cuadrícula.

## [2026-06-23] Sistema de Control de Acceso Basado en Roles (RBAC) y Actualización de Documentación

### Seguridad y Roles de Usuario
- **Sistema de Roles (RBAC):** Se implementó `js/auth/roles.js` (`RackAuth`) definiendo tres niveles de acceso: Administrador, Editor y Espectador.
- **Protección de Sesión y Autenticación:** Se implementó un modal de inicio de sesión (`#modal-login`) gestionado mediante `sessionStorage`. El PIN de Administrador ("rack2024" por defecto) puede configurarse en un nuevo modal dedicado y se persiste cifrado en `localStorage`.
- **Blindaje de Interfaz y Lógica:** 
  - Se bloquearon las interacciones Drag & Drop (`dragstart`) y el doble clic para inserción rápida a los espectadores.
  - Se añadieron verificaciones (`RackAuth.can()`) en todos los botones destructivos, menús contextuales y la rutina de autoguardado.
  - **Modo Dios Exclusivo:** La revelación global de contraseñas (`window.SHOW_PASSWORDS`) fue restringida exclusivamente a usuarios con rol Administrador.

### Documentación e Infraestructura
- **Actualización de Documentos:** Se actualizó `USER_MANUAL.md` incorporando la sección sobre los roles de usuario. Se actualizó `TECHNICAL_DOCS.md` detallando la implementación y mecanismos de seguridad del RBAC.
- **Generación de Manual Híbrido:** Se optimizó `build_standalone_manual.cjs` con la dependencia `marked` (instalada vía `pnpm`) para combinar los archivos `.md` y generar automáticamente la versión estática `DOC/html/FULL_MANUAL_STANDALONE.html` con imágenes SVG empotradas en Base64.
- **Limpieza de Raíz y Scripts:** Se reorganizó el directorio base, moviendo los scripts Node.js a la carpeta `scripts/`. Se restableció la ubicación estricta del directorio `.py/` y los documentos internos `.agents/` (`DESIGN.md`, `INSTRUCTIONS.md`) conforme a las instrucciones directivas.

## [2026-06-22 10:30:00] Renderizado Híbrido de Faceplates y Mejoras de Interfaz

### Funcionalidades Core
- **Renderizado Híbrido Automático:** Se implementó una lógica híbrida inteligente en `faceplates.js` que intenta cargar primero las imágenes fotorrealistas (SVG/PNG) desde `assets/img/`. Si la imagen no se encuentra, el motor hace un *fallback* automático e instantáneo (vía evento `onerror` en el DOM) hacia el renderizado procedimental en código CSS.
- **Control de Renderizado mediante Sistema de Archivos:** Los usuarios ahora pueden forzar al sistema a usar el renderizado CSS para una categoría de equipo específico simplemente renombrando su archivo de imagen para que comience con un punto (ej. `.switch.svg`). Esto oculta el archivo al motor de red, desencadenando la protección de fallback de forma transparente y sin necesidad de tocar la base de datos o el código fuente.

### Interfaz de Usuario (UI)
- **Panel Inferior Optimizado:** Se ajustó el estado inicial del panel inferior (Tabla de Inventario/Conexiones). Ahora el proyecto carga con este panel totalmente contraído por defecto (`bottomCollapsed = true`), maximizando el área visual de trabajo disponible para la topología y los gabinetes desde el primer segundo.

## [2026-06-22 08:00:00] Arquitectura de Activos Gráficos: Imágenes Fotorrealistas para Faceplates

### Estructura y Organización de Assets
- **Nueva Estructura de Directorios (`assets/img/`):** Se introdujo una jerarquía paralela a los iconos (`network`, `server`, `storage`, `power`, `wiring`, `accessories`, `floor`) destinada exclusivamente a alojar imágenes detalladas (SVGs fotorrealistas o PNGs) para la vista física de los equipos.
- **Diferenciación de Renderizado:** La arquitectura ahora separa semánticamente los iconos abstractos (`assets/icons/`), usados como máscaras CSS en la topología e inventario, de los diseños físicos detallados (`assets/img/`), preparando el ecosistema para permitir a los usuarios subir personalizaciones gráficas (custom faceplates).
- **Generador Automático de SVGs (`generate_svgs.cjs`):** Se creó e implementó un script Node.js para poblar dinámicamente el nuevo árbol de directorios con diseños vectoriales base y organizarlos automáticamente según la taxonomía del catálogo.

## [2026-06-22 06:45:00] Expansión del Catálogo SVG y Actualización de Demostración

### Arquitectura y Renderizado Visual
- **Migración a SVG Dinámicos:** Se reemplazó el uso de Emojis del sistema por iconos SVG monocromáticos en todo el ecosistema gráfico. Los SVGs se colorean dinámicamente usando `mask-image` en el DOM y una caché offline (Canvas) para el motor topológico de alto rendimiento.
- **Jerarquía de Iconos:** Nueva estructura organizada en `assets/icons/` dividida por dominio (`/network`, `/server`, `/power`, `/storage`, `/wiring`, `/accessories`, `/floor`).

### Expansión Teórica del Datacenter
- **Ampliación del Catálogo:** El catálogo base (`catalog.js`) fue sustancialmente enriquecido con infraestructura técnica realista. Se añadieron categorías: Cableado (Patch Panels, Organizadores), Energía (PDU), Almacenamiento (NAS, SAN), Accesorios (KVM, Bandejas) y periféricos de Piso (Controladoras, Accesos).

### Demostración Técnica (`demoData.js`)
- **Redimensionamiento de Racks:** Los gabinetes en la demostración ahora presentan tamaños realistas variados: el Core (`Rack 101`) de 42U, nodos secundarios (`201`, `301`) de 24U, y remotos de 12U.
- **Sala "Bodega":** Se añadió una cuarta sala para equipos de piso (cámaras, AP, controladora), interconectada lógicamente por Ethernet hacia el switch de acceso del Rack 301 para ejemplificar el alcance distribuido de la red.

## [2026-06-19 19:10:00] Reestructuración Modular (Models/Core/API) y Lado de Montaje

### Arquitectura y Refactorización
- **Separación de Lógica de Negocio:** Se crearon las carpetas `js/models/`, `js/api/` y `js/core/` para implementar una arquitectura más limpia (Clean Architecture). Las clases de entidades base (`Rack.js`, `Device.js`, `Cable.js`) ahora viven en `models/`, separando estrictamente los datos de la lógica de interfaz de usuario (`ui/`) y estado (`store.js`).
- **Módulo de Exportación:** La lógica pesada de exportación se extrajo hacia `js/core/export.js`.
- **Cliente API Base:** Se introdujo `js/api/apiClient.js` como capa fundamental para futuras integraciones de bases de datos.
- **Directorio de Pruebas y Recursos:** Se crearon las carpetas `tests/` para futuras pruebas unitarias (con un archivo base `Rack.test.js`) y `assets/img/` para concentrar imágenes.

### Mejoras de Interfaz (UI/UX)
- **Lado de Montaje en Creación:** Ahora, al crear o editar un equipo de rack desde el modal (`DeviceModal`), es posible elegir explícitamente el **Lado (Montaje)** (Frontal o Trasero) mediante un nuevo selector. Este valor se guarda en la propiedad `mountSide` del dispositivo.
- **Integración con Asistente de Ubicación:** El Asistente de Ubicación Rápida (`PlacementModal`) ahora lee de manera inteligente la preferencia `mountSide` del equipo desde el catálogo y la pre-selecciona automáticamente para acelerar el despliegue.

## [2026-06-19 12:40:00] Rediseño Arquitectónico del Modal de Equipos (Acordeones UI)

### Añadido
- **Jerarquía Visual:** Se rediseñó por completo el formulario modal de "Nuevo Equipo" (`#modal-device`) pasando de un listado vertical estático a un moderno sistema de **Módulos Colapsables (Acordeones)**.
- **Interruptores de Estado (ON/OFF):** Se introdujo una clase maestra `.module-toggle` que permite al usuario decidir qué bloques de metadatos desea ver y llenar (Red, Credenciales, Notas, Energía), ocultando el resto mediante CSS Puro (`display: none`). Esto reduce drásticamente la carga cognitiva y el espacio ocupado en pantalla.
- **Campo "Estado":** Se agregó la propiedad `status` a los dispositivos para distinguir si están Activos, Apagados o en Mantenimiento.

### Refactorizado
- **Lógica Inteligente de JS (`DeviceModal.js`):** El controlador fue actualizado para sincronizarse con los nuevos acordeones. Al abrir un equipo existente a edición, la interfaz ahora enciende automáticamente los acordeones correspondientes si detecta datos previamente almacenados (ej. Si el equipo ya tenía una IP guardada, el módulo de "Red" se abrirá por defecto).
- Además, si un usuario apaga un acordeón antes de guardar, el controlador inyectará en blanco esos datos para no almacenar metadatos basura inactivos en el store.

## [2026-06-19 10:40:00] Reestructuración de Documentación y Actualización de SVG
### Añadido
- **Consolidación de Imágenes:** Se reubicaron todas las imágenes vectoriales de la documentación (`mockups`, `ui`, arquitectónicas) a un directorio centralizado unificado en `doc/img/svg/`.
- **Actualización Masiva de Rutas:** Se actualizaron dinámicamente más de 100 referencias de rutas de imágenes en todos los archivos `.md` y `.html` para que apunten a la nueva estructura estructurada.
- **Renombre de Directorios HTML:** Se actualizaron las referencias de recursos en los manuales interactivos (`manual.html` y `manual_2.html`) para apuntar a las nuevas carpetas renombradas `manual_css/` y `manual_js/` dentro de `doc/html/`.

### Mejoras de Rendimiento (Documentación)
- **Separación Lógica de Documentos (User vs Developer):** Se extrajo de manera definitiva toda la teoría arquitectónica y de ingeniería pesada del manual de usuario. Las secciones de "Estructura de Carpetas", "Diseño Atómico (Atomic Design)" y el "Layout Map Visual" fueron transformadas al diseño oscuro premium e integradas como tarjetas en el Dashboard de `arquitectura_2.html`.
- **Limpieza de Manual Lineal:** El documento `manual_lineal.html` fue depurado, eliminando todos los conceptos de ingeniería que no aportaban valor a un operador final, convirtiéndolo en una guía 100% coherente enfocada únicamente en el uso de la interfaz (desde creación de salas hasta exportación de reportes).
- **Fusión Arquitectónica (Single Source of Truth):** Se integró toda la documentación y diagramas de `arquitectura.html` dentro de la interfaz moderna tipo Dashboard de `arquitectura_2.html`. Se añadieron tarjetas enriquecidas describiendo el uso de `WeakMap`, bloqueos `try/finally` a 60fps, y un nuevo panel interactivo sobre Seguridad y Modo Dios.
- **Limpieza de Archivos:** Se eliminó permanentemente el archivo obsoleto `arquitectura.html` tras la fusión exitosa para evitar duplicidad de fuentes de verdad.
- **Refactorización de `arquitectura.html` previa:** Se eliminaron más de 1200 líneas de código SVG embebido (*inline*) y se reemplazaron por etiquetas `<img src="...">` apuntando a los archivos externos en `doc/img/svg/`. Esto redujo el peso del archivo de **77 KB a 8.7 KB**, mejorando enormemente su mantenibilidad. Se actualizaron además los textos descriptivos para documentar las soluciones a fugas de memoria con `WeakMap`, la separación del CSS/JS de los manuales, y las implementaciones de seguridad como el Modo Dios y `crypto.randomUUID()`.

### Corrección de Errores (Documentación)
- **Sincronización de Diagramas SVG:** Se actualizaron los textos de los diagramas arquitectónicos (`01_estructura_estado.svg`, `02_ciclo_store.svg`, `03_capas_persistencia.svg`, `04_erd_entidades.svg`) para reflejar los últimos *bugfixes*:
  - Ocultamiento visual de contraseñas (Modo Dios / Seguridad UX).
  - Eliminación de fuga de memoria reciclando Proxies mediante `WeakMap`.
  - Exportaciones de CSV y PNG ahora protegidas contra XSS y cuelgues (try/finally).
  - Actualización de menciones de IDs de `base-36` al nuevo estándar nativo de 16 caracteres `crypto.randomUUID()`.

## [2026-06-18 17:25:00] Actualización de Arquitectura Visual (Layout Map) y Manuales
- **Manual de Página Única (Single-Page):** Se creó `manual_2.html`, una variante del manual interactivo que muestra todas las secciones en un scroll continuo. Incluye una funcionalidad de ScrollSpy personalizada para actualizar el menú lateral de forma dinámica.
- **Nuevo Layout Map (`ui_layout_map_full.svg`):** Se diseñó un mapa estructural completo en SVG con proporciones reales. Se aplicó una paleta de colores armónica (Dark Mode) y se agregaron subtítulos identificando los archivos SVG correspondientes a cada bloque.

### Corrección de Errores (Documentación)
- **Corrección de "Vista de Rack":** Se corrigió un error conceptual en los manuales (`USER_MANUAL.md`, `manual.html`, `manual_2.html`) reubicando `ui_rack_view.svg` desde la sección "Sidebar" hacia la sección "Main Canvas", clarificando que la vista detallada del gabinete ocupa el espacio central.
- **División de Panel Inferior:** Se dividió la documentación del "Bloque Rosa/Inferior" en dos componentes funcionales separados: "Bottom Bar / Pestañas" (la franja minimizada) y "Tabla de Datos / Inventario Expandido" (el bloque masivo).

## [2026-06-17 17:50:00] Mockups SVG y Corrección de Bugs
- Creación de mockups vectoriales de la interfaz gráfica vacía (modo escritorio y móvil, tanto en claro como en oscuro) para documentación (`doc/svg/ui_mockup_...`).
### Corrección de Errores (Bugfixes)
- **Carga de Demos:** Se solucionó el problema de scope global en `main.js` que impedía cargar dinámicamente los datos de demostración (se estandarizó a `window.loadDemoData`).
- **Barra de Capacidad:** Se reemplazó el uso de `transform` por `width` en `layout.css` para el `.cap-bar-fill`, permitiendo que la barra de progreso se visualice correctamente de nuevo.

## [2026-06-17 14:11:00] Corrección Visual de Barras de Capacidad (Estadísticas)
### Corrección de Errores (Bugfixes)
- **Barras de Progreso:** Se corrigió un problema visual donde las barras de capacidad del panel de Estadísticas ("Rack Capacity" y "Power") siempre aparecían vacías. El motor de actualización `renderStats()` intentaba escalar un elemento que tenía un ancho inicial del 0% por defecto (`style.width="0%"` combinado con `transform: scaleX`). Se reescribió la lógica para que el progreso modifique directamente la propiedad `width` (porcentaje de la barra), haciendo que la animación fluya correctamente.

## [2026-06-17 13:36:00] Correcciones en Limpiar Proyecto, Cargar Demos y PWA Caché
### Corrección de Errores (Bugfixes)
- **Caché PWA:** Se incrementó la versión del `CACHE_NAME` en `js/service/service-worker.js` a `v1.1` y se añadió `fileManager.js` a la lista de recursos fuera de línea. Esto fuerza a los navegadores a invalidar el caché antiguo "Cache-First" y descargar los últimos cambios de código de la interfaz para que los usuarios puedan ver las actualizaciones inmediatamente tras recargar.
- **Cargar Demos:** Se reescribió la lógica del botón `menu-demo` (`Cargar demos`) haciéndola asíncrona. Ahora el sistema espera correctamente a que el manejador de archivos (File System API) termine de guardar la copia de seguridad antes de inyectar y ejecutar `demoData.js`, solucionando el problema donde la funcionalidad había dejado de responder.
- **Limpieza de Proyecto:** Al usar la opción `Limpiar proyecto` (`🧹`), ahora se resetea internamente el manejador de archivos y se actualiza la interfaz para mostrar "Nuevo Proyecto" en la cabecera, desvinculando la sesión limpia del archivo anterior para evitar sobreescrituras accidentales por el autoguardado.

## [2026-06-17 13:30:00] Implementación de File System Access API y Autoguardado
### Sistema de Guardado
- **Apertura Directa:** Se reemplazó el tradicional campo `<input type="file">` oculto por la API nativa `window.showOpenFilePicker`. Ahora la aplicación puede abrir archivos directamente del sistema y conservar el "handle" (manejador) para sobreescribir los cambios de manera transparente.
- **Autoguardado Inteligente:** Se implementó un ciclo de `autoSave` con *debounce* (3 segundos). Si el usuario ya ha dado permisos de escritura al archivo en la sesión actual, la aplicación guardará automáticamente cualquier cambio (arrastre, conexión, edición) en el disco duro sin ventanas emergentes.
- **Guardar como...:** Se añadió la opción "Guardar como..." en el menú de proyecto, permitiendo bifurcar proyectos usando `window.showSaveFilePicker()`.
- **Integración de Fallback:** Para los navegadores sin soporte completo de esta API web moderna (como Firefox o Safari), el sistema vuelve de manera elegante al método antiguo de descarga/subida clásica (blob JSON).
- **Indicador de Proyecto Activo:** Se añadió al diseño del encabezado el nombre del archivo activo (`#project-filename`) para mejorar la conciencia situacional del usuario.

## [2026-06-16 12:05:00] Reestructuración Documental, Extracción SVG y Rediseño de Manual
- **Limpieza de Código HTML (Extracción SVG):** Se extrajeron exitosamente 14 diagramas SVG que se encontraban incrustados en línea dentro de `arquitectura_2.html` y se convirtieron en archivos independientes guardados en la carpeta `doc/html/img/Arq2/`. Esto reduce significativamente el peso del HTML base y permite el cacheo independiente de las imágenes.
- **Correcciones XML en Vectores:** Se solventaron errores de sintaxis en los archivos SVG extraídos (caracteres `&` sin escapar y etiquetas `<defs>` faltantes para marcadores de flechas) garantizando su perfecta renderización en navegadores estrictos.
- **Nueva Sección de Segmentación:** Se añadió al documento de arquitectura una sección ilustrada llamada "Estructura de Directorios y Segmentación". Esta incluye un nuevo diagrama vectorial (`directory_structure.svg`) y explica los beneficios (Mantenibilidad, Colaboración Eficiente, Reutilización) de aislar la lógica de UI (`js/ui/`) del estado global (`js/store.js`).

### Mejoras de Interfaz (UI/UX) en el Manual de Usuario
- **Overhaul Estético (Glassmorphism & Cards):** Se reescribió por completo la hoja de estilos del manual de usuario (`manual.css`). Se adoptó una estética moderna que hace juego con la aplicación principal, utilizando fondos oscuros con "blur", resaltados de neón sutiles (accent glow) y limitando el ancho máximo de lectura para reducir la fatiga visual.
- **Modernización Tipográfica:** Se integraron las fuentes profesionales `Outfit` (lectura general) y `JetBrains Mono` (etiquetas de código técnico) mediante Google Fonts, reemplazando la tipografía genérica del sistema.
- **Tarjetas de Características (Feature Grid):** Se desarrolló un script inteligente que transformó automáticamente todas las listas de viñetas densas e ilegibles (`ul.content-list`) en grillas modernas de tarjetas (`div.feature-grid`). Esto mejora dramáticamente la experiencia de escaneo y lectura del manual.
- **Actualización de Contenido y Rutas:** Se repararon todos los enlaces rotos de imágenes del manual apuntando a sus nuevas ubicaciones categorizadas (`desk/`, `mobil/`, `Arq/`). Además, se documentaron oficialmente las últimas funciones agregadas: Los *Atajos de Estado Vacío* (Empty Canvas Shortcuts) y las opciones extendidas del *Menú Contextual* de los Gabinetes.

## [2026-06-16 10:05:00] Corrección de Bug Visual (Inputs & Selects) y Accesos Directos
### Mejoras de Interfaz (UI/UX)
- **Corrección de Recorte Vertical:** Se ajustó el `padding` (a `0 8px`) y el `line-height` de todos los elementos `input` y `select` globales en `layout.css`. Esto soluciona un problema donde los textos internos aparecían cortados o empujados hacia abajo después de que la altura general se hubiera estandarizado a 24px en el commit anterior.
- **Actualización Documental:** Se reflejaron estas nuevas reglas de relleno (padding) y altura de línea estricta en el manifiesto principal `DESIGN.md` para evitar recortes futuros.
- **Accesos Directos en Canvas:** Se añadieron botones interactivos para "+ Rack" en el estado vacío de la Vista Física. Además, el botón secundario fue reemplazado por el botón "⚡ Agregar Equipo" (Ubicación Rápida asistida) posicionado estratégicamente en la cabecera de la sección "Equipos de Piso / Periféricos" para un acceso más intuitivo. También, cuando hay racks instalados, aparece una tarjeta transparente al final de la fila con borde punteado para agregar el siguiente gabinete rápidamente.
- **Botones de Acción en Rack:** Se ampliaron las opciones en la cabecera de cada rack, agregando el acceso directo a la Ubicación Rápida (⚡ Agregar Equipo) y la nueva opción "Limpiar Gabinete" (🧹), la cual requiere confirmación para evitar la eliminación accidental de todo el contenido del rack. Para mantener la interfaz limpia y minimalista, todas estas acciones (incluyendo Editar y Eliminar) se agruparon dentro de un nuevo **menú desplegable (⋮)** posicionado junto al botón de rotar (flip).
### Mantenimiento
- **Actualización de INSTRUCTIONS.md:** Se actualizó la regla de Flujo de Trabajo para establecer formalmente el "Registro Continuo" en el Changelog y requerir permiso explícito del usuario para ejecutar los respaldos en Git, evitando historiales inflados con micro-commits.

## [2026-06-16 09:48:00] Refactorización Modular (CSS, Modales y Topología)
### Mejoras de Arquitectura
- Modularización de `style.css` (~900 líneas) en componentes especializados (variables, layout, rack, faceplates, modals, panels, misc) e importación unificada.
- División de `js/ui/modals.js` en submódulos funcionales (RackModal, DeviceModal, CableModal, etc.) para mejorar la mantenibilidad de las ventanas flotantes.
- Refactorización de `js/ui/topology.js` adoptando el patrón Modelo-Vista-Controlador (MVC), aislando el estado (`TopologyState`), los eventos (`TopologyEvents`), los cálculos lógicos (`TopologyLayout`) y la capa visual del canvas (`TopologyRenderer`).
- Actualización de `index.html` para orquestar la carga de todos los nuevos módulos generados sin romper dependencias (incluyendo el intacto `rack.js`).
- Reorganización de las imágenes de arquitectura del manual en carpetas más estructuradas (`doc/html/img/Arq/` y `doc/html/img/ui/`).

## [2026-06-16 07:18:44] Estandarización a 24px, DESIGN.md YAML y Soporte Claro en Rack
### Mejoras de Interfaz (UI/UX)
- Corrección matemática de densidad: Se redujo la altura estandarizada de todos los controles interactivos de 32px a **24px** (botones, pestañas, búsquedas) para consolidar la estética "IDE-grade".
- Reescritura del manifiesto `DESIGN.md` adaptándolo al estándar profesional `awesome-design-md` (YAML Frontmatter), prohibiendo explícitamente estilos generativos "AI Slop".
- Purga masiva de colores estáticos (`#090d17`, `#0a1525`, etc.) en el chasis físico del Rack (vistas frontal y trasera). Ahora toda la estructura metálica y ranuras responden a variables CSS (`--bg-card1`, `--border`), permitiendo un despliegue perfecto del **Modo Claro** sin deformar el hardware instalado.

## [2026-06-16 00:51:30] Refinamiento UI/UX Premium & DESIGN.md
### Mejoras (UI/UX)
- Normalización matemática de altura de controles interactivos (botones, tabs, inputs) a \`32px\` con paddings estandarizados.
- Creación de \`DESIGN.md\` en la raíz para dictar el ADN visual del proyecto (fuentes, escala de color, evitar 'AI Slop').
- Reducción global de escala tipográfica (2px) para lograr densidad visual estilo IDE.
- Ocultamiento forzado (\`style="display:none !important;"\`) del input nativo de archivos en el HTML principal.
- Limpieza profunda de archivos basura y copias de seguridad obsoletas (\`.backup\`, \`.kilo\`, \`scratch\`).

# Registro de Cambios (Changelog)

## [2026-06-15 20:25] Solución a Bugs de Baja Prioridad (Pulido)
* **BUG-12 (Límite de Notificaciones):** Se implementó un límite de 5 notificaciones activas en pantalla en `utils.js` para evitar inundación (flooding) de notificaciones.
* **BUG-13 (FOUC del Tema):** Se movió la inicialización de `data-theme` al `<head>` de `index.html` mediante un script síncrono para eliminar el "flash" blanco que ocurría al cargar la app en modo oscuro.
* **BUG-14 (Filtro de Equipos de Piso):** El selector de "Equipos sin Gabinete" en el modal de conexiones ahora distingue entre equipos huérfanos que sí requieren rack (`orphanedRack`) y periféricos de piso (`orphanedFloor`), mejorando la coherencia de la interfaz.
* **BUG-15 (Historial de Renombrado):** Renombrar una sala (F2) ahora incluye correctamente llamadas a `store.snapshot()` y `store._save()`, permitiendo que el cambio de nombre pueda deshacerse (`Ctrl+Z`).
* **BUG-16 (Exportación CSV):** Se corrigió la lógica de generación del formato CSV en las tablas y en la exportación de inventario (`tables.js` y `modals.js`). Ahora, los textos que contengan comas (ej: Notas, nombres largos) se entrecomillan correctamente, evitando que las columnas se desfasen.
* **BUG-17 (Eventos en Equipos de Piso):** Se añadió `draggable="true"` a las tarjetas de dispositivos de piso (`.floor-device-card`) y se vincularon a `bindRackEvents` para habilitar el arrastre, doble clic (edición) y clic derecho (menú contextual), los cuales antes estaban inoperantes.
* **BUG-18 (Overflow en Topología):** En el motor de dibujo `topology.js`, la variable continua de tiempo `flowT` (utilizada para animar los paquetes por las conexiones) ahora aplica módulo 1 (`% 1`) en cada frame, evitando el potencial desbordamiento de punto flotante tras miles de horas de uso continuo.
## [2026-06-15 19:20] Solución Final a Bugs de Prioridad Media
* **BUG-11 (Congelamiento por Error de PNG):** Se incorporó un sistema de guarda `try/finally` al exportador PNG topológico. Si la cámara detecta un fallo al renderizar nodos huérfanos, el sistema asegura restaurar todas las variables globales y el canvas en la pantalla principal antes de abortar. Se acabó el congelamiento "pantalla blanca" permanente.
* **BUG-07 (Doble renderizado al cambiar sala):** En el motor de vistas `main.js`, el evento `changeRoom` ahora llama estrictamente a `initTopoPositions()` si estás activamente en la pestaña de Topología. Esto previene un desfasamiento donde los equipos de la sala nueva no aparecían o hacían titilar la vista.
## [2026-06-15 19:14] Corrección de Validación y Formularios
* **BUG-08 (Validación IP Estricta):** Se modificó la expresión regular de validación de direcciones IP en la Tabla de Inventario y en la ventana de Edición. Anteriormente permitía tríos de números hasta el 999; ahora exige de forma estricta el estándar `0-255` para los 4 octetos, evitando que se guarden IPs falsas en el JSON.
* **BUG-09 (Protección XSS en Celdas):** (Resuelto preventivamente) La edición rápida en celdas de la tabla ya procesa de forma segura carácteres especiales como las comillas (`"`) mediante un filtrado `escapeHTML()`, previniendo que se rompa la vista.
## [2026-06-15 18:09] Corrección de Integridad de Datos (Bugs de Prioridad Alta y Media)
* **BUG-06 (Conexiones Fantasma al Eliminar Salas):** Se solucionó un defecto crítico donde la función `deleteRoom()` dejaba conexiones ("cables") huérfanas apuntando a equipos que ya no existían. Ahora, el sistema recolecta en cascada todos los Gabinetes y Equipos (incluidos los de piso) de la sala a borrar, y purga rigurosamente cualquier conexión vinculada a ellos antes de eliminarlos.
* **BUG-10 (Colisión Frontal/Trasera en Racks):** Se reparó el motor lógico de colisiones `canPlace()`. Anteriormente, el algoritmo ignoraba la cara del gabinete (`mountSide`), impidiendo instalar un servidor en el lado trasero si el lado frontal estaba ocupado. Ahora la lógica y la interfaz de "Instalación Rápida" reconocen los lados Frontal y Trasero de forma totalmente independiente.
## [2026-06-15 17:59] Generación de IDs Segura y UX en Historial
* **BUG-03 (Colisión de IDs):** Se reescribió la función `uid()` en `js/utils.js` para utilizar `crypto.randomUUID()` nativo del navegador, extrayendo 16 caracteres hexadecimales para generar identificadores de hardware. Esto elimina prácticamente cualquier riesgo de colisión al clonar gabinetes masivos o arrastrar cientos de equipos rápidamente.
* **U-1 (UX en Barra de Herramientas):** Se agregaron contadores numéricos dinámicos en tiempo real a los botones de Deshacer y Rehacer (e.g., `↩ 3` / `↪ 1`). Esto mejora la retroalimentación visual permitiendo al usuario saber exactamente cuántos pasos tiene almacenados en su pila de historial.
## [2026-06-15 17:54] Corrección de Fuga de Memoria y Modo Rendimiento
* **BUG-04 (Fuga de Memoria):** Se solucionó una grave fuga de memoria (Memory Leak) en el sistema reactivo (`js/store.js`). Se implementó un caché local mediante `WeakMap` (`_proxyCache`) para reciclar instancias del Proxy. Esto evita la generación de miles de objetos descartables por segundo durante el ciclo de lectura de `drawTopo` a 60fps, estabilizando drásticamente el consumo de RAM.
* **Modo Rendimiento (Interruptor de Animaciones):** Se transformó el punto de estado de "Sistema operativo" (esquina superior derecha) en un interruptor activo para el Modo Rendimiento. Al hacerle clic, apaga globalmente todas las transiciones, iluminaciones (glow) y animaciones CSS del proyecto a través de la clase `no-animations`, y adicionalmente congela el motor de partículas JavaScript sobre los cables topológicos (`flowT`).
## [2026-06-15 17:35] Modo Dios y Mejoras en Topología
* **Modo Dios (Seguridad Visual):** Se implementó un alternador global en el menú principal (`👁 Modo Dios: Revelar Claves`) para censurar u ocultar masivamente las contraseñas de los equipos. Por defecto, todas las contraseñas se renderizan como `••••••••` en Tooltips, HUD Topológico, Tablas de Inventario y Modal de Edición, garantizando seguridad visual contra mirones.
* **Exportación Segura de CSV/Excel:** La rutina de exportación de inventario fue mejorada para respetar el Modo Dios; si el modo está apagado, las contraseñas se omiten/censuran en el reporte descargado.
* **Color de Servidores:** Se actualizó el color representativo de la clase "Servidor" del azul claro original a Esmeralda (`#10b981`) para mejor diferenciación en la Topología, Catálogo y Vista Física.
* **Visibilidad de Iconos:** Se corrigió un error en el lienzo topológico que impedía la visualización de los iconos internos debido a superposición de colores (falta de restablecimiento del `fillStyle` a blanco).

## [2026-06-15 16:45] Documentación de Arquitectura de Inicio
* **Documentación Técnica:** Se agregó una nueva sección de "Inicialización y Carga de Datos" a los manuales (`manual.html` y `TECHNICAL_DOCS.md`) para explicar cómo funciona la comprobación del `localStorage` frente al arranque en estado en blanco, y los beneficios arquitectónicos de desacoplar e inyectar de manera dinámica (lazy loading) los datos de demostración de `demoData.js`.

## [2026-06-15 16:35] Optimización de Arranque y Exportación de Equipos de Piso
* **Arranque en Blanco:** Se modificó la inicialización en `store.js` y `index.html` para que el proyecto inicie con un estado limpio (una sola sala vacía) por defecto, en lugar de cargar datos fijos, mejorando la experiencia del nuevo usuario.
* **Carga Dinámica de Demostraciones:** Se eliminó la dependencia bloqueante de `demoData.js` en el arranque. Ahora, el script se inyecta dinámicamente (`loadScript`) únicamente cuando el usuario hace clic en "✨ Cargar demos", ahorrando memoria y tiempo de carga.
* **Renderizado de Equipos de Piso:** Se corrigió `rack.js` para que la sección "Equipos de Piso / Periféricos" se renderice correctamente en la vista física de la sala, incluso si esta no contiene ningún gabinete.
* **Exportación PNG de Equipos de Piso:** Se añadió la función `exportFloorToPNG()` en `modals.js` y se actualizó el modal de exportación para permitir generar imágenes PNG individuales de todos los equipos de piso de una sala.

## [2026-06-10 08:02] Documentación y Gráficos de Atomic Design
* **Sección de Diseño Atómico:** Adición del nuevo capítulo interactivo en el manual HTML (`doc/html/manual.html`) y en la documentación técnica Markdown (`doc/md/TECHNICAL_DOCS.md`), detallando el mapeo del proyecto a los 5 niveles de la metodología.
* **Gráficos Vectoriales de Evolución:** Creación de diagramas SVG individuales representando Átomo, Molécula, Organismo, Plantilla y Página, además de la infografía consolidada de esferas (`atomic_design_spheres.svg`).

## [2026-06-10 02:50] Reestructuración Funcional de Documentación e Infografías
* **Estructura Documental Funcional:** Refactorización de `USER_MANUAL.md` e `index.html` para unificar las explicaciones de escritorio y móvil bajo cada sección funcional (Gestión de Salas, Equipos, Topología, etc.), eliminando el capítulo aislado de Modo Móvil.
* **Menú Móvil:** Creación de la ilustración vectorial `ui-mobile-menu.svg` mostrando el menú hamburguesa.
* **Infografía de Arquitectura:** Creación de `desktop-vs-mobile-architecture.svg` detallando las diferencias de flujos de trabajo (Drag & Drop vs Ubicación Rápida Asistida, paneles fijos vs off-canvas).
* **Infografía de Áreas:** Creación de `desktop-vs-mobile-areas.svg` comparando el lienzo panorámico frente a las pestañas de salas deslizables en móviles.

## [2026-06-10 02:45] Modales Móviles de Sala y Conexión e Ilustraciones Vectoriales
* **Diagrama de Modal de Nueva Sala Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-modal-room.svg` representando el modal de creación de salas en la vista vertical móvil.
* **Diagrama de Modal de Conexión Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-modal-connection.svg` representando el modal de trazado de conexiones de red en la vista vertical móvil.
* **Integración en Manuales:** Vinculación e integración de los nuevos diagramas en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:40] Formulario de Equipos Móvil e Ilustración Vectorial
* **Diagrama de Formulario de Equipos Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-modal-device.svg` que representa la interfaz del modal de registro/edición de dispositivos adaptado a la vista vertical móvil.
* **Integración en Manuales:** Vinculación e integración del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:35] Inventario Móvil e Ilustración Vectorial
* **Diagrama de Inventario Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-inventory.svg` que representa la tabla de inventario expandida mediante un panel deslizable (drawer) en dispositivos móviles, mostrando las columnas y etiquetas adaptadas.
* **Integración en Manuales:** Sincronización e integración del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:30] Topología Móvil e Ilustración Vectorial
* **Diagrama de Topología Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-topology.svg` que representa fielmente el lienzo de la topología de red en dispositivos móviles, mostrando las salas apiladas verticalmente y los enlaces de cableado.
* **Integración en Manuales:** Vinculación e integración del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:25] Menú de Proyecto Móvil e Ilustración Vectorial
* **Diagrama de Menú de Opciones Móvil:** Creación de la ilustración vectorial nativa `ui-mobile-menu.svg` que representa fielmente la interfaz del menú de proyecto desplegable en dispositivos móviles (Abrir, Guardar, Limpiar proyecto, Cargar demos, Modo Claro, Importación/Exportación).
* **Integración en Manuales:** Vinculación e integración del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:20] Diagrama de Catálogo y Estadísticas Móviles (Off-Canvas)
* **Diagrama de Catálogo y Estadísticas Móviles:** Creación de la ilustración vectorial nativa `ui-mobile-catalog.svg` que representa fielmente la interfaz del panel lateral off-canvas en dispositivos móviles, incluyendo la cuadrícula de estadísticas (racks, dispositivos, unidades U y conexiones), barras de progreso, botones de acción rápida y el catálogo de dispositivos.
* **Integración en Manuales:** Vinculación e integración del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`) explicando la funcionalidad del menú off-canvas.

## [2026-06-10 01:40] Integración de la Documentación del Orquestador e Historial Reactivo
* **Documentación del Modo Móvil (Responsive):** Creación e integración del diagrama detallado de la consola en modo móvil (`ui-mobile.svg`), e inclusión de una subsección de diseño móvil adaptativo en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario (`USER_MANUAL.md`).
* **Iconografía en el Manual y Docs:** Integración del logotipo oficial del sistema (`icon.svg`) en la cabecera, favicon y sidebar del manual interactivo HTML y de las especificaciones de la documentación técnica.
* **Rediseño del Mapa Arquitectónico Global:** Creación de una versión mucho más amplia (1200x850), completa y detallada de la arquitectura general del sistema (`arquitectura.svg`), incorporando iconos visuales para cada módulo, integraciones de archivos y leyendas descriptivas del flujo.
* **Explicación Gráfica del Almacén Reactivo:** Creación e integración del diagrama explicativo del store reactivo, Proxy ES6, auto-guardado en localStorage e historial (Undo/Redo) (`store-funcionamiento.svg`).
* **Explicación Gráfica del Orquestador:** Creación e integración del diagrama detallado sobre la estructura y funcionamiento del orquestador central en la arquitectura reactiva (`orquestador-funcionamiento.svg`).
  * *Corrección:* Solucionado bug de solapamiento de texto encimado en la columna de "MÓDULOS RECEPTORES" corrigiendo las coordenadas `y` de posicionamiento absoluto del SVG.
* **Actualización del Manual Interactivo HTML:** Añadidas las secciones explicativas y vinculados los nuevos diagramas SVG en `doc/html/manual.html` para la sección de arquitectura del almacén y renderizado.
* **Actualización de Documentación Técnica:** Incorporación del flujo de intercepción del Proxy, el guardado persistente, el historial de snapshots y el despacho selectivo de eventos en `doc/md/TECHNICAL_DOCS.md`.


## [2026-06-09 20:23] Manual Interactivo HTML y Diagramas Técnicos
* **Manual Interactivo SPA:** Migración completa de la documentación técnica y de usuario de formato texto plano a un portal web interactivo (`doc/html/manual.html`) con navegación lateral dinámica y diseño adaptado en modo oscuro.
* **Gráficos Técnicos SVG:** Creación e integración de diagramas vectoriales nativos explicativos:
  * Anatomía del Rack (Unidades U frontal/trasero).
  * Nodos de topología y cableado de red.
  * Arquitectura reactiva del almacén central (`store.js`, `main.js`, `js/ui/`).
  * Funcionamiento de los lienzos (Lienzo DOM físico vs. Canvas 2D topológico).
  * Catálogo de equipos, eventos de arrastre y asistente de ubicación rápida.
  * Flujo de actualización DOM y despacho selectivo (`interfaz-funcionamiento.svg`).
  * Mapa de directorios y estructura modular del proyecto.
  * Sistema y flujos de exportación (imágenes PNG HD, tablas Excel/CSV y copias JSON).


## [2026-06-09 15:50] Rediseño del Modal de Equipos
* **Diseño Compacto y Agrupado:** Se reorganizó la vista del modal "Nuevo/Editar Equipo" agrupando lógicamente Identidad, Ubicación, Red, Autenticación y Energía.
* **Cuadros de Activación (Toggles):** Se añadieron casillas de verificación para activar/desactivar dinámicamente los módulos de Red, Usuario y Energía, evitando guardar datos innecesarios en equipos "pasivos" o sin gestión.
* **Separación de Tomas Eléctricas:** Se dividió el campo de energía en "Tomas de Entrada" y "Tomas de Salida" para permitir modelar PDUs o UPSs que alimentan otros equipos, incluyendo tooltips explicativos.
* **Selector Explicito Rack/Piso:** Se añadió un selector principal para alternar explícitamente entre "Gabinete (Rack)" y "Equipo de Piso", controlando dinámicamente las opciones de tipo de equipo y ocultando el Tamaño (U) cuando es necesario.

## [2026-06-09 14:52] Optimización de Espacio en Móvil
* **Barras de Herramientas más Compactas:** En la versión móvil, las filas superiores (donde están las opciones de Vista Física, Topología y el control de zoom) ocupaban demasiado espacio vertical, restando área de trabajo. Se redujeron los márgenes, rellenos (paddings) y el tamaño de texto de estos botones específicamente para pantallas táctiles, logrando un diseño mucho más esbelto y proporcionando más espacio para visualizar los gabinetes.

## [2026-06-09 14:33] Mejoras Visuales en Panel Lateral
* **Filtros Visibles y Deslizables:** Se restauró el comportamiento de deslizamiento horizontal (scroll) en las pestañas de filtro del catálogo (Todos, Servers, Red, etc.). Para mantener el diseño limpio y libre de múltiples barras (scrollbars) invasivas, se han ocultado visualmente las barras horizontales en todas las áreas de pestañas superiores. Sin embargo, ahora se puede utilizar la **rueda del ratón (mouse wheel)** de forma natural sobre los filtros para deslizarlos de izquierda a derecha sin esfuerzo en el modo de escritorio.

## [2026-06-09 14:24] Corrección de Guardado de Nuevos Equipos
* **Nuevas Plantillas de Catálogo:** Se solucionó un bug en el que al presionar "+ Agregar Equipo" y llenar el formulario, la información se perdía si no era un equipo de piso. Ahora, el sistema guarda el nuevo equipo como plantilla en el Catálogo y abre automáticamente el Asistente de Ubicación Rápida (⚡) para instalarlo inmediatamente en el rack deseado.

## [2026-06-09 14:18] Nuevos Campos de Equipo: Marca y Modelo
* **Datos de Equipo:** Se añadieron los campos "Marca" y "Modelo" a la estructura de datos de los equipos (devices).
* **Modal de Edición:** Se actualizó el formulario de edición de equipos (`#modal-device`) para incluir las nuevas entradas de Marca y Modelo.
* **Tabla de Inventario:** Se agregaron las columnas "Marca" y "Modelo" a la tabla de inventario en el panel inferior, permitiendo visualización y edición en línea.
* **Exportación de Datos:** Se actualizó la exportación a CSV y a Excel para que incluyan automáticamente las nuevas columnas de Marca y Modelo.

## [2026-06-09 12:53] Mejoras Visuales en Estadísticas y Topología
* **Tooltips Personalizados:** Se corrigió el recorte visual (`overflow: hidden`) en los botones del panel de estadísticas, permitiendo mostrar los tooltips personalizados hacia abajo para que no interfieran con otros elementos visuales.
* **Resaltado de Sala Activa:** En la vista de Topología, la sala actualmente seleccionada ahora se resalta con un contorno de color blanco para facilitar su identificación en el lienzo.

## [2026-06-09 12:35] Reorganización de Cabecera y Tooltips Nativos
* **Tooltips en Estadísticas:** Se añadieron atributos `title` nativos a los botones de estadísticas en el panel lateral (y posteriormente se reemplazaron por tooltips personalizados).
* **Reubicación de Pestañas de Vista:** Se movieron los botones "Vista Física" y "Topología" a la cabecera principal de la aplicación.
* **Reubicación de Pestañas de Salas:** Se movieron las pestañas de selección de salas ("Data Center", "Edificio A2", etc.) a la barra de herramientas principal, después de los controles de zoom.
* **Fix Móvil:** Se forzó el comportamiento del `flex-shrink` y `min-width` para los botones de la barra de herramientas principal, evitando el solapamiento en dispositivos móviles.


## [2026-06-07 19:55] Optimización de Topología de Red Demo
* **Estructura Jerárquica:** Se modificó `js/demoData.js` para aplicar una jerarquía de red realista. Ahora cada sala designa su primer switch como "Main Switch" (o de borde/agregación).
* **Enlaces Backbone:** Únicamente los "Main Switch" de las salas secundarias se enlazan al "Core Switch" en el Data Center mediante un solo enlace de fibra óptica, reduciendo el desorden previo de interconexiones directas.
* **Equipos de Piso Localizados:** Los equipos distribuidos (cámaras, impresoras, APs) ahora se conectan de manera lógica al switch principal de su *propia* sala, en vez de enrutarse de forma irrealista a través de todo el recinto hasta el Core Switch.



## [2026-06-07 16:37] Implementación de Modo Claro

* **Modo Claro / Modo Oscuro:** Se implementó una paleta de colores alternativa (`[data-theme="light"]`) para soportar visualización en Modo Claro manteniendo la identidad visual y asegurando alto contraste.

* **Toggle en Menú de Proyecto:** Se agregó la opción "☀️ Cambiar a Modo Claro" en el menú principal "Proyecto". El texto y la función se adaptan dinámicamente al estado actual del tema.

* **Persistencia del Tema:** La preferencia de tema elegido por el usuario se almacena localmente usando `localStorage` de manera que la aplicación carga directamente en el modo visual preferido.



## [2026-06-07 14:40] Simplificación de Catálogo

* **Agrupación de Acciones en Catálogo:** Se consolidaron los tres botones individuales (Ubicación Rápida, Editar, Eliminar) de cada equipo en el panel del catálogo bajo un único botón de opciones múltiples ("⋮"). Esto abre un menú contextual elegante, limpiando la interfaz visual y mejorando el uso del espacio.



## [2026-06-07 14:33] Correcciones de Interfaz y Experiencia en Móviles

* **Pestañas de Sala en Móvil:** Se solucionó el problema donde el botón de cerrar sala ("✕") no aparecía en pantallas táctiles por depender del evento `hover`. Ahora es permanentemente visible en móviles (`@media (hover: none)`). Además, se añadió soporte para pulsación larga (`contextmenu`) permitiendo renombrar salas en celulares donde el doble clic no se detectaba correctamente.

* **Cierre Automático del Catálogo Móvil:** Se implementó una lógica (`closeMobileSidebar`) que oculta automáticamente el menú lateral (catálogo) en modo móvil cada vez que el usuario abre los modales de "Añadir a rack" (Ubicación Rápida), "Añadir Equipo" o "Añadir Gabinete", evitando que el menú obstruya la vista del rack.

* **Botón Explícito de Cierre:** Se agregó un botón visible ("✕") en la cabecera del panel de Estadísticas/Catálogo exclusivo para la vista móvil (`.mobile-only`), proveyendo una forma clara e intuitiva de colapsar el menú lateral.

* **Leyendas en Estadísticas:** Se reincorporaron pequeñas etiquetas de texto descriptivo debajo de los iconos en el panel lateral de estadísticas para mayor claridad ("Gabinetes", "Equipos", "Capacidad U", "Conexiones").

* **Tooltips de Deshacer/Rehacer:** Se creó la clase modificadora CSS `.tooltip-bottom` y se aplicó a los botones de Deshacer/Rehacer en la barra superior. Esto corrige el problema en el que las leyendas emergentes se salían del área visible de la pantalla hacia arriba.



## [2026-06-07 13:04] Mejoras de UX Móvil y Opciones de Inserción

* **Seguimiento Dinámico de Tooltips:** Se reescribió la lógica de posicionamiento de las etiquetas flotantes (tooltips) para que sigan con precisión al cursor del ratón (`mousemove`), mejorando sustancialmente la experiencia frente a la anterior ancla estática a la derecha del rack.

* **Soporte PWA Móvil:** Se añadió una capa de oscurecimiento global (`#mobile-overlay`) y menús laterales táctiles (`off-canvas`) adaptados para pantallas pequeñas, además de deshabilitar los tooltips conflictivos en dispositivos táctiles puros.

* **Selector Frontal/Trasera en Ubicación Rápida:** Se introdujo la opción de seleccionar la cara de montaje ("Frontal" o "Trasera") dentro del flujo asistido de "Ubicación Rápida" (`#modal-quick-placement`), asegurando paridad con el montaje por arrastre (`drag & drop`).

* **Iconografía PWA (Logo):** Se reconstruyó el ícono del sistema como SVG puro (`icon.svg`), optimizándolo para su uso como ícono de aplicación y se enlazó de nuevo en todo el proyecto.



## [2026-06-06 21:28] Mejoras en Exportación PNG y Limpieza Visual

* **Ajuste de Zoom en Vista Física:** Se corrigió un problema de diseño Flexbox al alejar la vista física; ahora el contenedor principal expande dinámicamente su ancho base (`width: 100/z %`) relativo al nivel de escalado (`scale(z)`). Esto permite que más gabinetes fluyan y aprovechen todo el ancho disponible de la pantalla al hacer zoom out, en lugar de limitarse a la cuadrícula original.

* **Exportación PNG Dual:** Se refactorizó la función de exportación a PNG (`exportRackToPNG`). Ahora, si un gabinete contiene equipos en la vista trasera, el lienzo (Canvas) se expande automáticamente y renderiza ambas caras (Frontal y Trasera) una al lado de la otra en una misma imagen, permitiendo reportes integrales.

* **Limpieza de Vista Trasera:** Se eliminó la repetición del nombre del gabinete en el encabezado de la "Vista Trasera" tanto en la interfaz de usuario como en las imágenes exportadas, logrando un diseño más minimalista y profesional.

* **Actualización de Documentación:** Se actualizaron `DOC_MANUAL_USUARIO.md` y `DOC_MANUAL_FUNCIONAMIENTO.md` para reflejar el comportamiento del nuevo sistema de renderizado doble y las vistas traseras.

* **Actualización de Iconografía:** Se limpió el fondo azul de los logos e iconos PWA, dejándolos con transparencia, manteniendo la "Variante 2" (gradiente azul y borde cyan).

* **Gestor de Paquetes estricto:** Se implementó una directiva estricta de entorno mediante el `package.json` para bloquear el uso de `npm` o `yarn`, forzando el uso de `pnpm` como único manejador de paquetes del proyecto.



## [2026-06-05 22:25] Corrección Crítica en Renderizado de Racks e Inventario

* **Fallo de Renderizado e Inventario:** Se corrigió un `ReferenceError` en `js/ui/rack.js` relacionado con la restauración del estado de los gabinetes volteados (`flippedRacks`) al recargar la vista. Este error bloqueaba el renderizado de la tabla de inventario en el panel inferior.

* **Persistencia de Vista Trasera:** Se modificó la función `bindRackEvents` para que la vista trasera persista tras mover o agregar equipos, corrigiendo un comportamiento donde volvía forzosamente a la vista frontal.



## [2026-06-05 21:25] Montaje Independiente en Vista Trasera

* **Doble Lado de Rack**: La vista trasera ahora funciona como un rack independiente (`mountSide='rear'`), permitiendo montar equipos adicionales en las mismas U pero en la parte de atrás del gabinete, ideal para organizadores de cables o PDUs.

* **Sistema de Drag & Drop por Lado**: Al arrastrar un equipo desde el catálogo hacia los slots de la cara trasera, este se guarda en el Store como "Trasero", evitando colisiones con los equipos de la parte delantera.

* **Interfaz y Animación**: Botones "🔄 ATRÁS" y "🖥️ FRENTE" que activan una animación 3D (`rotateY 180°`). Cada lado del rack muestra su propio medidor de Us ocupadas.



## [2026-06-05 20:45] Edición de Conexión por Doble Clic en Topología

* **Doble clic sobre cable**: Al hacer doble clic sobre cualquier tramo de cable en la vista de Topología, se abre directamente el modal de **Editar Conexión** con todos los datos precargados (equipo origen/destino, puerto, tipo de cable y color).

* **Detección geométrica**: Se implementó un algoritmo de muestreo de curva Bézier (30 segmentos) para detectar con precisión si el clic aterrizó sobre un cable. Tolerancia de 10px en espacio del mundo.

* **Prioridad**: Si el doble clic cae sobre un nodo/equipo, se mantiene el comportamiento original (abrir modal de nueva conexión). Solo cuando no hay nodo debajo se evalúan los cables.



## [2026-06-05 20:16] Mejoras de trazabilidad en Conexiones

* **Ubicación en tabla de conexiones**: Se añadieron las columnas "Sala/Rack Origen" y "Sala/Rack Destino" a la tabla inferior de conexiones para identificar rápidamente dónde está cada equipo sin depender únicamente de su nombre.

* **Modal de conexión**: Se agregaron campos de solo lectura "Ubicación Origen/Destino" que se actualizan dinámicamente en el modal al conectar equipos.

* **Exportación de datos**: Se actualizaron las funciones de exportación (CSV y Excel) para que también incluyan las nuevas columnas de ubicación de origen y destino.

* **Función auxiliar**: Se implementó `getDeviceLocation(device)` en el core (`utils.js`) para resolver ubicaciones de forma global (corrigiendo una incompatibilidad previa de métodos).

* **Equipos de piso en datos de prueba**: Se añadieron conexiones a todos los equipos de piso en el Data Center (`js/demoData.js`) para validar visualmente la funcionalidad de las nuevas columnas.



## [2026-06-05 20:10] Aplicación de Diseño de Red y VLANs

* **Estructuración de Salas y Racks**: Se actualizó la carga de datos de demostración (`js/demoData.js`) para implementar 3 salas principales (Data Center, Edificio A2, Edificio B1) y sus respectivos gabinetes (Racks 101-104, 201-203, 301-305).

* **Segmentación por VLAN**: Se implementó la propuesta de enrutamiento asignando direcciones IP fijas correspondientes a VLANs específicas:

  * VLAN 10 (10.10.10.0/24) para switches de capa de acceso, Core y Firewall.

  * VLAN 20 (10.10.20.0/24) para las UPS de cada gabinete.

  * VLAN 30 (10.10.30.0/24) para Servidores (nodos distribuidos sistemáticamente por rack).

  * VLAN 60, 70 y 80 para equipos de piso (Cámaras, Impresoras y Telefonía IP).

  * Access Points en la red de administración (VLAN 10) proveyendo el tráfico corporativo y de invitados (VLAN 50, VLAN 90).



## [2026-06-05 19:56] Mejoras de UI y Corrección de Bugs

* **Optimización visual de Estadísticas**: Se redujo el espacio ocupado por los datos de estadísticas en la barra lateral reemplazando el diseño de cuadrícula con texto por un diseño horizontal más compacto usando iconos vectoriales (Gabinetes, Equipos, Unidades U, Conexiones) y tooltips.

* **Optimización de botones Deshacer/Rehacer**: Se eliminó el texto para ahorrar espacio; ahora muestran únicamente los íconos (↩ y ↪) con leyendas emergentes (tooltips) al pasar el cursor.

* **Corrección del desplazamiento de pestañas de sala**: Se añadió un margen inferior (`padding-bottom`) en `.room-tabs` para prevenir que la barra de desplazamiento horizontal nativa superponga y bloquee los clics en los botones cuando hay múltiples salas.

* **Corrección de cambio de sala**: Se solucionó un problema de distinción de mayúsculas y minúsculas (case sensitivity) en `js/ui/catalog.js` donde el evento disparado al hacer clic en las pestañas (`room-tab-change`) era ignorado por el renderizador (`source.includes('Room')`), impidiendo que la vista física se actualizara correctamente. Se cambió el nombre del evento a `changeRoom`.

- Fix: Componentes flotantes (modales, tooltips, mens) ajustados a var(--bg-panel) para soportar el modo claro.



- Fix: Componentes flotantes ajustados a var(--bg-panel) para soportar el modo claro.


## [2026-06-21 21:00:00] Reorganización de Archivos y Ajustes UI
* **Ubicación de Scripts Python:** Se agruparon todos los scripts .py dentro de una nueva carpeta .py para mantener la raíz del proyecto limpia. Se actualizó INSTRUCTIONS.md reflejando esta regla.
* **Organización de Logs:** Se movió el archivo logs_cambios.txt de la raíz al directorio doc/log/.
* **Corrección de Iconos PWA:** Se corrigieron las rutas en index.html y json/manifest.json que apuntaban a icons/ en lugar de ssets/icons/, restaurando el favicon.
* **Panel de Estadísticas Colapsado:** Se modificó index.html para que el panel de estadísticas inicie oculto por defecto (clase hidden y chevron ►), optimizando el espacio inicial.

## [2026-06-21 22:05:00] Expansión del Catálogo y Migración a SVG
* **Estructuración del Catálogo:** Se añadieron nuevas opciones para equipos alineadas a la teoría de datacenters: patchpanel, organizer, pdu, 	ray, kvm.
* **Filtros UI:** Se rediseñaron las pestañas laterales del catálogo dividiéndolas en Servidores, Red, Storage, Cableado, Energía y Accesorios.
* **Migración a SVG Monocromático:** Se reemplazaron los emojis del catálogo y UI por archivos SVG ubicados en ssets/icons/.
* **Sistema de Máscaras CSS:** Se implementó renderizado con mask-image en HTML para tintar los SVGs.
* **Soporte Canvas SVG:** Se implementó caché de imágenes en TopologyRenderer.js para dibujar SVGs en la vista topológica.

## [2026-06-21 22:15:00] Bugfix: Iconos de SAN y NAS
* **Catálogo:** Se corrigió un error en el que el catálogo y la topología no encontraban los iconos para equipos cuyo archivo SVG se llamaba diferente al 	ype principal (ej. san.svg y 
as.svg para la categoría storage). Ahora se extrae correctamente el nombre del archivo desde la ruta definida en el modelo de datos.
