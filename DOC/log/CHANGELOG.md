# Registro de Cambios (Changelog)


## [2026-06-10 01:40] Integración de la Documentación del Orquestador e Historial Reactivo
* **Iconografía en el Manual y Docs:** Integración del logotipo oficial del sistema (`icon.svg`) en la cabecera, favicon y sidebar del manual interactivo HTML y de las especificaciones de la documentación técnica.
* **Rediseño del Mapa Arquitectónico Global:** Creación de una versión mucho más amplia (1200x850), completa y detallada de la arquitectura general del sistema (`arquitectura.svg`), incorporando iconos visuales para cada módulo, integraciones de archivos y leyendas descriptivas del flujo.
* **Explicación Gráfica del Almacén Reactivo:** Creación e integración del diagrama explicativo del store reactivo, Proxy ES6, auto-guardado en localStorage e historial (Undo/Redo) (`store-funcionamiento.svg`).
* **Explicación Gráfica del Orquestador:** Creación e integración del diagrama detallado sobre la estructura y funcionamiento del orquestador central en la arquitectura reactiva (`orquestador-funcionamiento.svg`).
  * *Corrección:* Solucionado bug de solapamiento de texto encimado en la columna de "MÓDULOS RECEPTORES" corrigiendo las coordenadas `y` de posicionamiento absoluto del SVG.
* **Actualización del Manual Interactivo HTML:** Añadidas las secciones explicativas y vinculados los nuevos diagramas SVG en `doc/html/index.html` para la sección de arquitectura del almacén y renderizado.
* **Actualización de Documentación Técnica:** Incorporación del flujo de intercepción del Proxy, el guardado persistente, el historial de snapshots y el despacho selectivo de eventos en `doc/md/TECHNICAL_DOCS.md`.


## [2026-06-09 20:23] Manual Interactivo HTML y Diagramas Técnicos
* **Manual Interactivo SPA:** Migración completa de la documentación técnica y de usuario de formato texto plano a un portal web interactivo (`doc/html/index.html`) con navegación lateral dinámica y diseño adaptado en modo oscuro.
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
