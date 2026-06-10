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
