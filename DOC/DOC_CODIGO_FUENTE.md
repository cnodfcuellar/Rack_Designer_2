# 💻 Documentación del Código Fuente - RACK Designer

Este documento es una guía profunda del código fuente (Source Code). Su objetivo es explicar a los futuros desarrolladores **qué hace cada archivo**, **cuáles son sus funciones principales** y **por qué se tomaron ciertas decisiones de diseño y programación**.

---

## 1. Filosofía de Desarrollo

El código fue escrito utilizando **Vanilla JavaScript (ES6+)**. 
* **¿Por qué Vanilla JS?** Para garantizar que el programa sea ultra ligero, no dependa de NodeJS ni de procesos de compilación (Webpack/Vite), y pueda ejecutarse instantáneamente en cualquier navegador.
* **¿Cómo se mantiene ordenado?** Para evitar que un solo archivo tenga miles de líneas, el código se dividió en "Módulos" (Archivos separados por responsabilidad). Todos se comunican a través de un "Cerebro" central llamado `Store`.

---

## 2. El Núcleo (Core)

### 2.1. `js/store.js` (El Cerebro de la Aplicación)
Este es el archivo más importante. Aquí vive la clase `Store`, que actúa como la **Única Fuente de Verdad (Single Source of Truth)**.

* **¿Por qué se creó?** Si la Vista Física y la Tabla de Inventario modifican los datos directamente, se genera un caos (código espagueti). En cambio, ambos le piden al `Store` que modifique los datos y el `Store` les avisa cuando los datos cambiaron para que se actualicen.
* **Funciones Clave:**
  * `constructor()`: Inicializa el estado vacío (salas, conexiones) y el historial (para Deshacer/Rehacer).
  * `subscribe(listener)` / `notify()`: Patrón *Observer*. Permite que otros archivos (como `rack.js`) se "suscriban". Cuando el estado cambia, `notify()` avisa a todos los suscriptores para que redibujen la pantalla.
  * `addDevice(...)` / `updateDevice(...)` / `removeDevice(...)`: Métodos para mutar el estado de los equipos.
  * `pushHistory()`: **¿Por qué existe?** Antes de borrar o mover un equipo, esta función clona los datos y los guarda en memoria. Esto es lo que permite que funcionen los botones de `Deshacer` y `Rehacer`.

### 2.2. `js/main.js` (El Controlador Principal)
Es el archivo que arranca el programa cuando se carga la página.
* **¿Qué hace?** Crea la variable global `window.appStore = new Store()` para que todos los módulos tengan acceso al cerebro.
* **Funciones Clave:**
  * `init()`: Ejecuta las funciones de arranque de la UI (ej. `initCatalog()`, `initRacks()`).
  * `bindGlobalEvents()`: Escucha botones estáticos como el menú hamburguesa, el guardado de proyecto o la importación de JSON.
  * `loadProject(data)`: **¿Por qué está aquí?** Toma un archivo JSON externo, lo inyecta en el `store` y fuerza a todas las pantallas a redibujarse.

### 2.3. `js/utils.js` (Herramientas Compartidas)
Contiene funciones matemáticas o de uso general que no pertenecen a ninguna vista gráfica.
* **Funciones Clave:**
  * `generateId()`: Crea un identificador único (UUID) para cada equipo y cable. Esto es vital para saber exactamente qué equipo estamos moviendo o borrando.
  * `exportToCSV(...)`: Toma los datos del inventario y los formatea como texto separado por comas para descargar.
  * `DEVICE_TYPES`: **¿Por qué existe?** Es un diccionario (objeto) de configuración que define los colores, nombres y tamaños por defecto (Ej: `ROUTER`, `SWITCH`). Si queremos agregar un nuevo tipo de máquina, solo se añade aquí.

---

## 3. Módulos de Interfaz de Usuario (`js/ui/`)

Todos los archivos en esta carpeta se encargan **exclusivamente de dibujar (Renderizar)** y escuchar clics del usuario.

### 3.1. `ui/rack.js` (Vista Física y Drag & Drop)
Controla la visualización de los armarios y la lógica de arrastrar/soltar equipos.
* **Funciones Clave:**
  * `renderRacks()`: Lee los datos del `Store` y genera el código HTML (`innerHTML`) para dibujar la caja naranja del Rack y sus ranuras (Slots).
  * `handleDragStart()` / `handleDrop()`: **¿Por qué se usan?** Implementan la API nativa de Drag & Drop de HTML5 (o el Polyfill en teléfonos móviles). Permiten capturar el `id` del equipo que el usuario agarró y soltarlo en el número de "U" (ranura) correspondiente.

### 3.2. `ui/topology.js` (Vista Lógica y Motor Gráfico)
Este archivo es complejo porque **no usa HTML**. Utiliza un lienzo gráfico (`<canvas>`) para dibujar los equipos como círculos y los cables como curvas.
* **¿Por qué se codificó así?** Dibujar 500 cables en HTML usando `<div>` haría que el navegador se congele. Usar el API nativa de Canvas permite aceleración por tarjeta de video (GPU).
* **Funciones Clave:**
  * `draw()`: Es el ciclo principal de renderizado. Limpia el lienzo y dibuja todo desde cero en 1 milisegundo.
  * `drawNode(...)` / `drawEdge(...)`: Instrucciones matemáticas para dibujar círculos, textos y curvas de Bézier cuadráticas (los cables).
  * Eventos de ratón (`mousedown`, `mousemove`, `wheel`): Capturan las coordenadas `X` e `Y` del ratón y aplican matemáticas de matrices (Translación y Escala) para permitir el efecto de **Paneo** y **Zoom**.

### 3.3. `ui/faceplates.js` (Arte y Dibujo de Equipos)
* **¿Qué hace?** Toma el bloque HTML de un equipo instalado en el rack, crea un pequeño `<canvas>` adentro de él y dibuja luces verdes y rojas, ventiladores o conectores dependiendo de qué equipo sea.
* **¿Por qué se hizo así?** En lugar de cargar imágenes `.png` o `.jpg` pesadas para cada router, el sistema los "dibuja" matemáticamente con código. Esto hace que el programa pese apenas unos kilobytes y cargue de inmediato.

### 3.4. `ui/catalog.js` (Menú de la Izquierda)
* **Funciones Clave:**
  * `initCatalog()`: Lee las constantes de `utils.js` y genera automáticamente los botones de "Servidor", "Switch", etc., para que el usuario pueda arrastrarlos. Si el catálogo crece, este archivo los procesará solos sin tener que editar el HTML. Además, vincula el soporte para pantallas táctiles y el doble clic (ícono `⚡`) para invocar el Asistente de Ubicación Rápida.

### 3.5. `ui/tables.js` (El Panel Inferior)
* **Funciones Clave:**
  * `renderInventory()` / `renderConnections()`: Limpian y llenan las etiquetas `<tr>` y `<td>` (filas y columnas) en la tabla inferior cada vez que el `Store` avisa que hubo un cambio.
  * `filterTables(query)`: Oculta o muestra filas basándose en lo que el usuario escribió en la barra de búsqueda, usando la propiedad CSS `display: none`.

### 3.6. `ui/modals.js` (Ventanas Emergentes)
* **¿Qué hace?** Centraliza el manejo de los formularios (ej. Cuadros de texto para cambiar el nombre, IP o MAC de un equipo) y del Asistente de Ubicación Rápida.
* **Funciones Clave:**
  * `openDeviceModal(...)`: Recibe el ID de un equipo, lo busca en el `Store`, rellena las cajas de texto del formulario con los datos actuales, y muestra la ventana en pantalla.
  * `openQuickPlacementModal(...)`: Abre el asistente inteligente con recálculo en cascada de ubicaciones disponibles y soporte de reactividad en caliente.
  * Al hacer clic en "Guardar", emite una llamada a `store.updateDevice(...)` o `store.addFloorDevice(...)`.

---

## 4. Resumen del Flujo de Ejecución (Ciclo de Vida)

1. El navegador lee `index.html`.
2. Se cargan los archivos `.js` en orden.
3. Se ejecuta `main.js`, el cual inicializa el `Store`.
4. Todos los módulos UI (`rack.js`, `topology.js`) dicen: *"Oye Store, avísame cuando algo cambie"* (`store.subscribe()`).
5. El usuario interactúa con la UI (ej. borra un equipo).
6. La UI envía la orden al `Store`: `store.removeDevice(ID)`.
7. El `Store` borra el dato de su memoria RAM.
8. El `Store` grita a todos: *"¡Los datos cambiaron!"* (`notify()`).
9. `rack.js` recibe el grito, borra la pantalla y dibuja los Racks sin el equipo.
10. `tables.js` recibe el grito, y borra la fila correspondiente en la tabla.
