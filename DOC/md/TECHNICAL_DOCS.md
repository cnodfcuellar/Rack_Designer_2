# Documentación Técnica - RACK Designer

Este documento detalla la arquitectura, el modelo de datos subyacente y las convenciones de desarrollo de RACK Designer. Está orientado a desarrolladores que deseen extender o auditar la aplicación.

## 1. Arquitectura de la Aplicación

RACK Designer es una Single Page Application (SPA) implementada en **Vanilla JavaScript** (ES6+), HTML5 y CSS3. 

### Decisiones de Diseño Clave:
* **Cero Dependencias de Frameworks:** No utiliza React, Vue ni Angular. El DOM se manipula directamente mediante selectores nativos, lo que garantiza tiempos de carga ultrarrápidos y facilita la auditoría estática.
* **CSS Grid y Flexbox:** Toda la estructura de diseño (incluyendo el "lienzo" de las salas y los modales) está basada en un sistema puro de CSS Grid, asegurando un diseño "responsive" y control preciso de alineaciones sin librerías externas como Bootstrap o Tailwind.
* **Persistencia Local (Local Storage):** La aplicación no requiere backend por defecto. Toda la infraestructura se guarda de forma persistente en el `localStorage` del navegador, garantizando privacidad y acceso offline.

### Estructura de Archivos
* `index.html`: Plantilla principal. Contiene la estructura de contenedores estáticos (Cabecera, Modales, Contenedores de Vistas).
* `css/style.css`: Estilos unificados. Utiliza un robusto sistema de variables CSS (`--bg`, `--surface`, `--accent`) para gestionar el sistema de tematización (Modo Claro/Oscuro).
* `js/store.js`: El corazón de los datos. Controla el estado global (CRUD de elementos y la sincronización con el `localStorage`).
* `js/main.js`: Lógica principal de inicialización y enrutamiento entre pestañas.
* `js/ui/*.js`: Lógica de la interfaz de usuario segregada en dominios (Ej. `modals.js` para los popups, `faceplates.js` para renderizar visualmente los frontales de los gabinetes, `tables.js` para el panel de inventario).

## 2. Modelo de Datos (JSON Schema)

El estado de la aplicación se almacena como un único objeto JSON jerárquico. 

### Objeto Raíz (`store._raw`)
```json
{
  "version": "1.0",
  "rooms": [],
  "racks": [],
  "devices": [],
  "connections": [],
  "currentRoomId": "string"
}
```

### Esquema: Sala (`Room`)
Representa una ubicación física.
* `id` (String): Identificador único (UUID v4).
* `name` (String): Nombre descriptivo (Ej. "Sala de Comunicaciones").

### Esquema: Gabinete (`Rack`)
* `id` (String): Identificador único.
* `roomId` (String): Referencia a la Sala a la que pertenece.
* `name` (String): Identificador del rack (Ej. "RACK-01").
* `height` (Integer): Número total de Unidades (U). Generalmente 42 o 48.
* `color` (String): Color en código HEX para la cabecera visual del rack.

### Esquema: Equipo / Dispositivo (`Device`)
Representa un activo de hardware. Las propiedades varían ligeramente si es de montaje en rack o de piso.
* `id` (String): Identificador único.
* `rackId` (String | null): ID del gabinete donde reside. `null` si es equipo de piso.
* `roomId` (String | null): Obligatorio si el equipo no está en un rack.
* `category` (String): "rack" o "floor".
* `type` (String): Clasificación semántica (Ej. `server`, `switch`, `camera`).
* `name`, `brand`, `model`, `serial` (Strings): Datos de Identidad.
* `size` (Integer): Unidades ocupadas (Ej. 2U). Para `floor`, este valor suele ignorarse o forzarse a 0.
* `slotStart` (Integer): Ubicación en el rack (U inferior ocupada).
* `side` (String): Montaje: "front" (Frontal) o "rear" (Trasero).
* `ip`, `mac` (Strings): Módulo de Red (Habilitable dinámicamente).
* `user`, `pass` (Strings): Módulo de Credenciales.
* `power`, `plugs`, `plugsOut` (Integers): Módulo de Energía (Consumo, Entradas, Salidas).

### Esquema: Conexión (`Connection`)
* `id` (String): Identificador de la conexión.
* `srcId`, `dstId` (Strings): IDs de los Equipos de origen y destino.
* `type` (String): Tipo de cableado (Ej. `eth` para Ethernet, `fiber` para Fibra Óptica, `power` para Corriente).

## 3. Dinámica de la UI (Patrones Destacados)

### Formularios Dinámicos
Los modales de edición (ej. `modals.js` -> Modal de Equipos) evitan almacenar propiedades de estado innecesarias utilizando el paradigma del DOM como fuente de verdad en el momento de edición, emparejando la captura con el estado nativo de los `checkboxes` ("Toggles" de Activación).

### Topología Basada en Canvas/DOM
La vista topológica interactúa directamente con eventos de puntero (drag/zoom) sin depender de librerías como D3.js. Esto mantiene el "bundle size" al mínimo.

### Gestión de Vistas (Caras del Rack)
Para resolver la ocupación independiente del frontal y la parte posterior del armario, el motor de dibujado (`faceplates.js`) agrupa a los equipos basándose en el atributo `side`, renderizando una de las dos "colecciones" sin colisiones lógicas en las Unidades (U).

## 4. Estructura y Funcionamiento Técnico Detallado

### Almacén Central Reactivo (`store.js`)
El estado de la aplicación reside en un almacén único y reactivo implementado mediante un **Proxy ES6** que envuelve al objeto `_raw`.
* **Detección de Mutaciones:** Cualquier asignación de propiedades (`set`) o acceso (`get`) en el estado es interceptado.
* **Auto-guardado Síncrono:** En cada mutación del estado, el Proxy ejecuta de manera síncrona la serialización de datos y los escribe en `localStorage` con la clave `RACK_DESIGNER_STATE`.
* **Historial (Deshacer/Rehacer):** Mantiene una pila (`_undoStack` y `_redoStack`) de hasta 30 snapshots clonados en profundidad (`deepClone`) del estado para permitir operaciones de restauración mediante comandos `undo()` y `redo()`.
* **Suscripción de Eventos:** El almacén emite el evento `'change'` al terminar de escribir en el estado, permitiendo que el orquestador (`main.js`) reciba la alerta y desencadene el flujo de actualización.

### Flujo de Actualización DOM y Renderizado (`main.js` y Componentes UI)

El archivo `js/main.js` actúa como el **Controlador / Orquestador** central de la aplicación. Su función principal es doble: inicializar el entorno global del cliente y actuar como un despachador inteligente de eventos ("Dispatcher") para evitar sobrecargas de procesamiento en el DOM.

![Funcionamiento del Orquestador](../html/img/orquestador-funcionamiento.svg)
*Figura: Funcionamiento y enrutamiento de eventos reactivos por parte del orquestador central js/main.js.*

#### 1. Estructura y Componentes
* **`initGlobalEvents()`**: Función encargada de suscribir los manejadores de eventos síncronos de la interfaz de usuario en el arranque. Enlaza los botones de zoom, los controles de paneo, el menú principal (I/O, Modo Claro/Oscuro) y las transiciones de pestañas (Vista Física vs. Vista de Red).
* **`renderAll(event)`**: Enrutador inteligente reactivo. Está suscrito al evento global `'change'` emitido por el `store` reactivo. Cada vez que el estado cambia, el `store` envía un objeto de evento que contiene metadatos sobre qué modelo se mutó (`source`).

#### 2. Funcionamiento y Enrutamiento Selectivo
Al recibir el evento, `renderAll` realiza una evaluación condicional basándose en los metadatos para propagar la actualización únicamente a las partes afectadas de la interfaz:
1. **Inicialización o Carga Global (`event === 'loadData'` o cambios masivos como `undo`/`redo`):** Se ejecuta un redibujo total del entorno: se regeneran las pestañas de salas, se redibuja el rack físico, se actualiza el panel inferior de tablas y se actualiza la topología de red.
2. **Mutaciones en Sala (`event.source === 'Room'` o `'changeRoom'`):** Actualiza el listado superior de pestañas de sala (`renderRoomTabs()`) y redibuja la distribución física de gabinetes y equipos correspondientes a la sala seleccionada.
3. **Mutaciones en Equipos o Dispositivos (`event.source === 'Device'`):** Llama a `renderStats()` para actualizar el panel de consumo de energía, espacio y conectividad. Redibuja los slots físicos (`renderPhysical()`) y regenera el catálogo izquierdo (`renderCatalog()`) o las tablas de inventario en el panel inferior.
4. **Mutaciones de Red o Enlaces (`event.source === 'Connection'`):** Llama a `renderStats()` para actualizar los contadores e interactúa con el panel de cables y la vista de topología (`renderBottomPanel()`), asegurando que las líneas y tablas reflejen los nuevos enlaces síncronamente.

Esta estrategia de enrutamiento selectivo desacopla la lógica de almacenamiento del estado de la lógica del DOM y previene la degradación del rendimiento al actualizar solo los fragmentos HTML requeridos.

### Los Lienzos de Trabajo (Canvas vs DOM)
El sistema divide su lógica gráfica en dos entornos independientes y adaptados a su propósito:
* **Vista Física (DOM HTML):** Renderizada en `div#view-physical`. Utiliza cajas y elementos DOM anidados en HTML (`.rack-wrapper`, `.rack-flipper`, `.rack-slot`, `.device-faceplate`) y estilos CSS (con rotación CSS-3D). Interactúa mediante la API nativa de Drag & Drop para arrastrar y soltar equipos.
* **Vista Topológica (Canvas 2D):** Dibujada sobre `canvas#topology-canvas`. Ejecuta un bucle procedimental interactivo a 60fps usando `requestAnimationFrame`. Maneja de forma matemática la interactividad mediante distancias euclidianas (`dx² + dy² <= r²`) para clicks o arrastres de nodos, y realiza transformaciones inversas de coordenadas para gestionar el zoom y paneo continuo.

### Catálogo de Equipos (`catalog.js`)
* **Base de Plantillas:** El archivo `catalog.js` define un array maestro `CATALOG` con plantillas preconfiguradas de servidores, switches, firewalls y periféricos de piso.
* **Render Reactivo:** Al buscar texto o cambiar de categoría, `renderCatalog()` limpia y reconstruye las tarjetas `.catalog-item` con propiedad `draggable="true"`.
* **Instalación:** Soporta arrastre nativo (`dragstart` genera la sombra flotante `#drag-ghost` y define el estado `dragState`) o doble click para abrir el **Asistente de Ubicación Rápida** (modal guiado por menús desplegables para pantallas táctiles).

### Canales de Exportación
* **Respaldo JSON:** Serializa `store._raw` como texto y descarga un archivo `.rack` o `.json` mediante un Blob `application/json`.
* **Tablas (Excel/CSV):** Extrae la información en matrices bidimensionales. Los CSV se crean mediante concatenaciones nativas (`join(',')`), mientras que los Excel se procesan con `xlsx.full.min.js`, agregando las hojas "Inventario" y "Conexiones" en un libro de trabajo consolidado.
* **Imágenes PNG:** Genera lienzos auxiliares (`offCanvas`) escalados a resolución HD (2x). En la física, dibuja las caras frontal y trasera del rack side-by-side; en la topológica, calcula la caja de colisión periférica de las salas para generar una instantánea completa del mapa de red.

