Viewed CHANGELOG.md:1-11

El sistema de carga de datos al iniciar el proyecto funciona en base a una arquitectura de **persistencia local** y **arranque perezoso (lazy loading)**. Te explico paso a paso lo que ocurre exactamente desde que abres `index.html` en el navegador:

### 1. Lectura de la Memoria Caché (El cerebro principal)
Lo primero que se ejecuta al cargar la página es el archivo `js/store.js`. Cuando este archivo arranca, crea el Almacén de Datos (el `store`) y hace una comprobación crítica:
*   Va al `localStorage` de tu navegador web y busca la llave `rack_designer_state`.
*   **Si encuentra datos:** Significa que ya habías trabajado antes en el proyecto. Toma ese archivo de texto JSON guardado en el navegador, lo decodifica y lo inyecta a la memoria RAM de la aplicación (`store._raw`).
*   **Si NO encuentra datos:** Significa que es la primera vez que abres la app o limpiaste la caché. En este caso, en lugar de cargar datos fijos, ejecuta una función interna llamada `_defaultState()`, la cual crea un lienzo en blanco (Una sola sala llamada "Data Center Principal", sin racks, sin equipos y sin cables).

### 2. El Orquestador Dibuja la Interfaz
Una vez que el `store` ya tiene los datos (ya sea tu proyecto recuperado o el lienzo en blanco), entra a funcionar el archivo `js/main.js`. 
Este archivo hace una llamada general a una función llamada `renderAll()`. Básicamente, le dice a todos los módulos gráficos (`rack.js`, `topology.js`, `catalog.js`, `tables.js`): *"Tomen la información que tiene el Store y dibujen todo en pantalla"*. Así es como aparecen tus salas, el inventario y los gabinetes.

### 3. La Carga Dinámica de Demos (El cambio que hicimos hoy)
Antes, el archivo `js/demoData.js` (que contiene miles de líneas con equipos, IPs y racks de prueba) se cargaba siempre de forma obligatoria al abrir `index.html`. Esto hacía que la aplicación iniciara más lento y siempre te sobreescribiera tu lienzo en blanco.

Ahora, funciona bajo demanda **(Carga dinámica)**:
1. El archivo `demoData.js` ya no existe en el arranque de la aplicación.
2. Si un usuario quiere ver los datos de prueba, debe abrir el menú principal (`☰`) y presionar **"✨ Cargar demos"**.
3. Al hacer clic, la aplicación literalmente "inyecta" una etiqueta `<script src="js/demoData.js">` en el código de la página en ese preciso momento.
4. El navegador descarga el archivo, lo lee, y la función dentro del archivo inyecta toda la red de pruebas al `store`, obligando a la interfaz a redibujarse.

**En resumen:** El proyecto inicia leyendo tu disco duro local (`localStorage`) de manera instantánea. Si está vacío arranca en blanco, y los archivos pesados como las demostraciones ya no penalizan la carga porque solo se descargan de internet/disco si tú oprimes el botón.