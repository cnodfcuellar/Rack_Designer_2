# 📖 Manual de Usuario - RACK Designer

Bienvenido a **RACK Designer**, una herramienta visual diseñada para ayudarte a crear, organizar y documentar el equipamiento de un Centro de Datos (Data Center) de forma sencilla, gráfica y sin necesidad de conocimientos avanzados de programación.

Este manual está diseñado para **usuarios principiantes**, explicando paso a paso cómo usar cada botón y función del programa.

---

## 1. Conociendo la Pantalla Principal

Cuando abres el programa, verás la pantalla dividida en tres partes principales:

1. **La Cabecera (Arriba):** Aquí encuentras el Logo del programa, las pestañas que representan tus "Salas" (como si fueran habitaciones de tu edificio) y una barra de búsqueda para buscar equipos rápidamente.
2. **El Lienzo Central (Medio):** Es el área azul grande. Aquí es donde "dibujarás" tus gabinetes (Racks) y conectarás los equipos.
3. **El Panel de Tablas (Abajo):** Una sección oscura donde todo lo que dibujas arriba se convierte automáticamente en una tabla ordenada estilo Excel.

---

## 2. Gestión de Salas (Habitaciones)

Piensa en una "Sala" como un cuarto físico donde guardarás armarios llenos de computadoras.

* **¿Cómo crear una nueva sala?**
  En la parte superior, busca el símbolo `+` que está al lado de las pestañas de salas (Ejemplo: al lado de "Sala Principal"). Haz clic ahí y aparecerá una sala nueva.
* **¿Cómo cambiar el nombre a una sala?**
  Haz **doble clic** (o **mantén presionado** un segundo si usas un celular) sobre el nombre de la pestaña de la sala (por ejemplo, "Sala Backup"). Te dejará escribir un nombre nuevo. Presiona la tecla `Enter` cuando termines.
* **¿Cómo eliminar una sala?**
  Aparecerá una pequeña `x` junto al nombre de la sala (cuando pases el ratón por encima, o al tocarla en celulares). Solo puedes eliminarla si hay más de una sala creada.
* **¿Cómo cambiar entre salas?**
  Simplemente haz un clic normal sobre el nombre de la sala a la que quieres entrar.

---

## 3. La Vista Física (Dibujando los Armarios)

Esta es la vista principal, donde verás los gabinetes (Racks) como si estuvieras parado frente a ellos.

### 3.1. Añadir un nuevo Rack (Armario)
Un Rack es la estructura metálica donde se atornillan los equipos.
1. Asegúrate de estar en la pestaña que dice **"Vista Física"** (en la barra oscura justo arriba del lienzo azul).
2. Haz clic con el botón derecho de tu ratón (Clic derecho) en cualquier parte vacía del fondo azul.
3. Se abrirá un menú. Elige **"Añadir Rack"**.
4. Te preguntará cuántas "Unidades" (U) tiene. Una Unidad es la medida estándar de altura. Un rack pequeño tiene 12U, uno muy grande tiene 42U o 48U. Escribe el número y acepta.
5. ¡Listo! Verás aparecer una caja naranja grande.

### 3.2. Añadir Equipos (Servidores, Switches, Routers)
Para meter un equipo dentro del Rack:
1. Haz clic en el botón de las tres rayitas `☰` (Arriba a la izquierda). Se abrirá el **Catálogo**.
2. Verás una lista con íconos (Servidores, Switches, UPS, etc.).
3. Haz **clic y mantén presionado** el botón del ratón sobre el equipo que quieres.
4. **Arrastra** el equipo (sin soltar el botón) hacia adentro de la caja naranja del Rack.
5. Verás que el Rack tiene espacios enumerados (1, 2, 3...). Suelta el botón del ratón sobre un espacio negro vacío.
6. ¡El equipo quedará "atornillado" en esa posición!

### 3.3. Uso de la Vista Trasera (Parte posterior del Rack)
Algunos equipos como organizadores de cables, PDUs o regletas se instalan en la parte trasera del rack sin ocupar el frente.
1. En la cabecera de cada rack (caja naranja/azul), verás un botón que dice **"🔄 ATRÁS"**. Haz clic en él.
2. El gabinete girará en 3D mostrándote la cara posterior, identificable por un borde y fondo azul oscuro. El título principal del rack no se mostrará para mantener un diseño visual más limpio.
3. Ahora puedes arrastrar equipos del catálogo y soltarlos aquí. ¡No chocarán con los equipos que están en la parte delantera!
4. Para volver al frente, haz clic en el botón **"🖥️ FRENTE"**. El indicador en la parte inferior del rack te mostrará cuántas Unidades (U) tienes ocupadas tanto en el frente (FRONT) como atrás (REAR).

### 3.3. Añadir Equipos de Piso (Periféricos)
A diferencia de los servidores que van en un rack, existen equipos como PCs, Cámaras IP o Puntos de Acceso Wi-Fi que se ubican directamente en la sala.
1. Arrastra un periférico desde el catálogo y suéltalo en el área punteada que dice "Equipos de Piso" en la parte inferior de la sala.
2. También puedes agregarlos instantáneamente sin arrastrar, usando el Asistente de Ubicación Rápida.

### 3.4. Asistente de Ubicación Rápida (⚡)
Si tienes muchos gabinetes y no quieres arrastrar manualmente, puedes usar el Asistente:
1. En el catálogo, haz clic en el botón de opciones (**⋮**) que está a la derecha del equipo y selecciona **"⚡ Ubicación Rápida"**. (También funciona haciendo doble clic sobre el equipo).
2. Alternativamente, en la pestaña "Inventario" del panel inferior, pulsa el botón morado **"⚡ Agregar Equipo"** y elige el modelo de la lista.
3. Selecciona la sala. Si es un equipo de rack, selecciona el gabinete y el sistema calculará automáticamente qué espacios de "U" están libres y caben perfectamente.
4. Presiona "Ubicar Equipo".

### 3.5. Editar la información de un equipo
1. Una vez que el equipo está en el Rack o en el Piso, haz **un clic** sobre él.
2. Mira la parte inferior de la pantalla. Verás un panel con información.
3. Haz clic en el botón **"✏️ Editar"**.
4. Podrás escribir su Nombre real (ej. "Router de Movistar"), su dirección IP (ej. "192.168.1.1") y su dirección MAC.
5. Haz clic en "Guardar".

### 3.6. Eliminar un equipo o un Rack
* **Eliminar un Equipo:** Haz clic en el equipo y luego pulsa el botón **"🗑️ Eliminar"** en el panel inferior.
* **Eliminar un Rack:** Pasa el ratón sobre el título del Rack (la barra superior de la caja naranja). Verás que aparece un icono de un basurero. Haz clic ahí para borrar el armario completo.

---

## 4. La Vista de Topología (Cables y Conexiones)

La Topología es un mapa que te muestra cómo están conectados los equipos mediante cables, ignorando en qué armario físico están.

* **¿Cómo entrar a esta vista?** Haz clic en el botón **"🎯 Topología"** que está justo arriba del lienzo azul.
* **Verás círculos:** Ahora los equipos no se ven como cajas, sino como círculos (Nodos).

### 4.1. Moverse por el mapa
* **Acercar/Alejar:** Gira la **rueda del ratón** hacia adelante o hacia atrás para hacer Zoom.
* **Mover el mapa (Pan):** Haz clic y mantén presionado en cualquier parte vacía del fondo azul y mueve el ratón. Es como arrastrar un mapa de Google Maps.

### 4.2. Crear una conexión (Tirar un cable)
Para conectar el Equipo A con el Equipo B:
1. Haz un clic sobre el círculo del Equipo A. El círculo brillará en amarillo indicando que lo has seleccionado.
2. Mueve el ratón hacia el círculo del Equipo B y haz clic en él.
3. ¡Automáticamente se dibujará un cable curvo conectando a ambos!
4. **Editar un cable existente:** Si haces **doble clic** directamente sobre la línea de un cable ya dibujado, se abrirá una ventana donde podrás editar su tipo, color y puertos sin tener que borrarlo y volverlo a crear.

---

## 5. El Panel Inferior (Reportes tipo Excel)

En la parte inferior de la pantalla siempre verás unas tablas. 

* **Pestaña Inventario:** Te muestra una lista de todos los equipos que has agregado, con su IP, Tipo, Consumo (W), y en qué **Lado** del rack están instalados (Frente o Atrás).
* **Pestaña Conexiones:** Te muestra una lista de todos los cables que has tirado entre los equipos. Incluye detalles de la **Sala y Rack de Origen/Destino**, facilitando encontrar a dónde va cada cable.
* **Barra de Búsqueda:** Escribe ahí cualquier cosa (por ejemplo, "Cisco" o "192.168.") y la tabla se filtrará automáticamente para mostrar solo los resultados correspondientes.

---

## 6. Guardar, Cargar y Exportar

Todo lo que haces se pierde si cierras la ventana sin guardar.

1. **Guardar tu trabajo:** Haz clic en el ícono de las tres rayitas `☰` (arriba a la derecha, al lado de tu proyecto). Elige **"Guardar Proyecto"**. Se descargará un archivo a tu computadora (tipo JSON).
2. **Cargar tu trabajo:** Abre la aplicación mañana, ve al mismo menú, elige **"Cargar Proyecto"**, selecciona el archivo que descargaste ayer y ¡todo volverá a aparecer!
3. **Exportar a Excel/CSV:** En el panel inferior de las tablas, hay botones que dicen `⬇ Excel` y `⬇ CSV`. Haces clic y te descarga la tabla para que la puedas abrir en Microsoft Excel.
4. **Tomar Foto (Exportar PNG):** En la barra del medio, presiona el botón `📷 PNG`. Selecciona el gabinete que deseas exportar. Si el gabinete tiene equipos en su parte trasera, la imagen descargada mostrará automáticamente ambas caras (Frontal y Trasera) una al lado de la otra.

---

## 7. Apariencia (Modo Claro / Oscuro)

RACK Designer incluye por defecto un diseño de "Modo Oscuro" para cuidar la fatiga visual. Si prefieres un diseño más tradicional y luminoso:
1. Haz clic en el ícono de las tres rayitas `☰` (el menú de proyecto arriba a la derecha).
2. Haz clic en **"☀️ Cambiar a Modo Claro"**.
3. Toda la interfaz cambiará instantáneamente a colores claros. El programa recordará tu preferencia la próxima vez que entres (incluso si cierras la pestaña).
4. Para volver, abre el mismo menú y selecciona **"🌙 Cambiar a Modo Oscuro"**.

---

## 8. Uso en Teléfonos Celulares (Modo Móvil)

Puedes abrir este programa en tu celular o tablet.
* **Deslizar menús:** Las barras de menús (donde están las salas y los botones) se pueden **deslizar horizontalmente con el dedo** para ver las opciones ocultas.
* **Arrastrar (Drag & Drop):** En lugar de hacer clic con el ratón, **mantén presionado el dedo por 1 segundo** sobre un equipo del catálogo hasta que vibre o se levante, y luego arrástralo con el dedo hacia el Rack.
* **Renombrar Salas:** Mantén presionado el dedo sobre la pestaña de una sala para cambiarle el nombre (menú contextual).
* **Topología:** Usa dos dedos para hacer "Pellizco" (Pinch) y acercar o alejar el mapa de cables.
