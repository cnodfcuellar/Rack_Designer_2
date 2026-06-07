# Registro de Cambios (Changelog)

Este archivo guarda el registro de todos los cambios, mejoras y correcciones realizadas en el proyecto.

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
