# Registro de Cambios (Changelog)

Este archivo guarda el registro de todos los cambios, mejoras y correcciones realizadas en el proyecto.

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
