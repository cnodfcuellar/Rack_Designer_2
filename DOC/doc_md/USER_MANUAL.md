# RACK Designer Next — Manual de Usuario Definitivo

Bienvenido al manual paso a paso de **RACK Designer Next**, tu herramienta definitiva para gestionar salas, racks, equipos de telecomunicaciones y conexiones. Este manual está diseñado asumiendo que **no tienes experiencia previa** con la aplicación, por lo que te guiaremos desde lo más básico hasta que seas capaz de mapear un centro de datos completo.

---

## 📖 Parte 1: Conceptos Básicos (Para Principiantes)

Antes de hacer clic en cualquier botón, es vital entender qué estamos construyendo.

### ¿Qué es un Datacenter o Sala de Equipos?
Es simplemente una habitación física donde se guardan las computadoras centrales (servidores), los aparatos que reparten internet (switches, routers) y los sistemas de energía (baterías, aires acondicionados). En nuestra aplicación, todo empieza por crear una **Sala**.

### ¿Qué es un "Rack" o "Gabinete"?
Imagina un estante metálico, como un librero muy alto y estandarizado. Su propósito es apilar equipos uno encima del otro para ahorrar espacio. 
En nuestra aplicación, los Racks van **adentro de las Salas**.

### ¿Qué es una Unidad "U"?
Como los estantes del "Rack" están vacíos, necesitamos medir la altura de los equipos para saber cuántos caben. Para ello usamos la medida **"U"**.
- Un Rack de tamaño completo suele tener **42U** de espacio de arriba a abajo.
- Un equipo pequeño ocupa **1U**. Un servidor más grande puede ocupar **2U** o **4U**.

> [!TIP]
> **Vistas de un Rack (Frente y Atrás)**
> Los Racks tienen dos puertas. Por delante (Front) sueles ver los botones de encendido y discos duros. Por detrás (Rear) sueles ver los cables de poder y puertos de red. ¡La aplicación te permite girar el Rack para trabajar por ambas caras!

![Anatomía de un Rack](../doc_img/doc_svg/manual_rack_anatomy.svg)

---

## 🗺️ Parte 2: Conociendo la Interfaz

Al abrir RACK Designer Next, verás tu área de trabajo dividida en **5 paneles principales**. 

![Mapa de la Interfaz](../doc_img/doc_svg/manual_ui_overview.svg)

1. **Barra Superior (Header):** Aquí administras tu "Rol" (para iniciar sesión como Admin y tener permisos para editar), el botón para Exportar tu plano a Excel, y el botón para Guardar el archivo en tu computadora.
2. **Catálogo (Izquierda):** Es tu "tienda" de equipos. Hay categorías para Servidores, Switches, Energía (PDU), y Equipos de Piso. Desde aquí **arrastrarás** los equipos al centro.
3. **Área de Trabajo (Centro):** El lienzo principal. Aquí es donde los Racks cobran vida. En la parte superior de esta área (Cabecera), encontrarás los menús desplegables para seleccionar y crear Salas ("Data Center") y Racks, junto con las pestañas unificadas para cambiar entre **Vista Física** y **Topología**.
4. **Inspector y Árbol (Derecha):** Cuando seleccionas un Rack o un servidor, en este panel verás su nombre, dirección IP, número de serie y otros detalles. También puedes cambiarlos.
5. **Inventario (Abajo):** Una gran tabla tipo Excel que lista todos los equipos que has colocado en tu sala, además de listar los cables y puertos conectados.

---

## ⚡ Parte 3: Flujo de Trabajo y Operaciones Comunes

La aplicación fue diseñada para ser tan fácil como un juego de "arrastrar y soltar".

![Flujo de Trabajo Básico](../doc_img/doc_svg/manual_action_flow.svg)

### Cómo moverse y seleccionar
- **Clic Izquierdo:** Selecciona un objeto (Rack, servidor, etc.). Al seleccionarlo, se iluminará y sus datos aparecerán en el panel de la derecha.
- **Rueda del Ratón:** Haz scroll para hacer acercar (Zoom In) o alejar (Zoom Out).
- **Arrastrar (Drag & Drop):** Haz clic sostenido en un equipo del catálogo izquierdo, muévelo hasta un hueco vacío en tu Rack, y suelta el botón.

### Guardar y Cargar
La aplicación guarda **automáticamente** los cambios en la memoria temporal de tu navegador cada vez que haces un movimiento. Sin embargo, para no perder tu trabajo, debes descargar el archivo:
1. Ve a la **Barra Superior**.
2. Haz clic en **Opciones del Proyecto** -> **Exportar (Save As)**.
3. Se descargará un archivo con extensión `.rack`. ¡Ese es tu proyecto!
4. Para abrirlo mañana, usa **Importar** y selecciona ese mismo archivo.

---

## 🎓 Parte 4: Tutoriales Prácticos Paso a Paso

¡Hora de la práctica! Vamos a crear tres salas distintas desde cero.

### Escenario 1: Datacenter Híbrido (Racks y Piso)
Vamos a crear una sala normal, que contiene 2 Racks con servidores, y adicionalmente un equipo pesado (Aire Acondicionado) que va en el piso, fuera de los racks.

**Paso 1: Crear la Sala y los Racks**
1. En la **Barra Superior (Cabecera)**, verás un menú desplegable que dice "Data Center" y a su lado un botón **"+"**.
2. Haz clic en el menú o selecciona la sala existente. En el panel Derecho (Inspector), cámbiale el nombre a `Mi Datacenter Híbrido`.
3. En la misma barra superior, junto al menú desplegable de "Racks", haz clic en el botón **"+"** para agregar un Rack. Aparecerá un cajón negro en el lienzo central.
4. En el panel Derecho, ponle nombre a ese rack: `RACK-01`.
5. Repite el paso 3 y 4 para crear otro rack llamado `RACK-02`.

**Paso 2: Llenar el RACK-01**
1. Ve al panel Izquierdo (Catálogo) y haz clic en la categoría **Servers** para expandirla.
2. Haz clic sostenido sobre un "Dell Server (2U)" y arrástralo hacia el `RACK-01` en el lienzo central. Suéltalo en un hueco vacío.
3. Expande la categoría **Network**. Arrastra un "Switch 48P (1U)" y suéltalo justo arriba del servidor.

**Paso 3: Añadir el equipo de piso**
1. En el Catálogo, busca la categoría **Floor / Piso**.
2. Arrastra una "Unidad InRow (Aire Acondicionado)". Notarás que el sistema *no te deja* meterlo dentro del Rack. 
3. **¿Cómo lo coloco en el piso?** Muy simple: En la parte inferior del Rack, verás una zona punteada llamada **"Floor Equip (Exterior)"**. Suelta el equipo ahí.
4. Haz clic en el aire acondicionado recién colocado y, en el panel Derecho, llámalo `Aire-Principal`. ¡Felicidades, completaste el escenario 1!

---

### Escenario 2: Sala de Telecomunicaciones (Solo Racks)
Este cuarto más pequeño no tiene equipos en el piso, solo equipos de red y parcheo.

**Paso 1: Crear una Sala nueva**
1. Ve a la **Barra Superior (Cabecera)** y haz clic en el botón **"+"** que está al lado del selector de Salas ("Data Center").
2. En el panel Derecho, llámala `Cuarto de Telecomunicaciones`. Notarás que el lienzo central se vacía (porque entraste a tu nueva sala vacía).

**Paso 2: Montar el Gabinete de Red**
1. En la Barra Superior, haz clic en el botón **"+"** junto al selector de Racks y llámalo `RACK-TELCO` en el panel derecho.
2. Ve al Catálogo -> Categoría **Network**.
3. Arrastra un "Patch Panel (1U)" a la parte más alta del rack.
4. Arrastra un "Router Core (4U)" debajo del patch panel.
5. Ve al panel Derecho y en las propiedades del Router escribe en la IP: `192.168.1.1`.

> [!NOTE]
> En este escenario no usamos equipos de piso. Tu vista principal (Topológica o Frontal) mostrará el cuarto ordenado y exclusivamente dedicado a equipos montados.

---

### Escenario 3: Sala de Fuerza / Energía (Solo Equipos de Piso)
En el sótano del edificio, tenemos una sala de baterías gigantes y generadores que no caben en ningún rack.

**Paso 1: Crear la Sala de Energía**
1. En la Barra Superior, haz clic en el botón **"+"** junto al selector de Salas.
2. En el panel Derecho, nómbrala `Cuarto de Baterías`.

**Paso 2: Llenar el cuarto sin usar Racks**
Dado que esta sala no necesita racks metálicos altos, insertaremos los equipos de manera independiente.
1. **NO** hagas clic en el botón "+" de Racks.
2. Ve directamente al Catálogo -> Categoría **Floor / Piso**.
3. Arrastra un "Standalone UPS" hacia el lienzo vacío central.
4. Como no hay un Rack, la aplicación creará automáticamente una zona invisible (un chasis contenedor de piso) para alojarlo.
5. Arrastra un "Desk / Escritorio" al lienzo.
6. En el panel Derecho, renombra los equipos a `Batería-Principal` y `Mesa Operador`.

---

¡Has completado tu capacitación básica! Ahora sabes cómo navegar por la aplicación, qué significan los conceptos, cómo arrastrar componentes y cómo estructurar cuartos enteros según tus necesidades del mundo real. 

Si te equivocas, recuerda usar la opción de **Deshacer (Undo)** o simplemente seleccionar el equipo mal colocado y presionar el botón **Eliminar (Trash/Basurero)** en el Inspector (Panel Derecho).

---

## 🔌 Parte 4: Visualización de Conexiones Físicas

¡Ahora también puedes visualizar cómo están conectados los cables en la vida real!
1. Crea una conexión entre dos equipos en la pestaña de Inventario ("+ Conexión").
2. Ve a la **Vista Física** (botón superior central).
3. Haz clic en el interruptor deslizable **"Cables"** de la barra de herramientas.
4. Verás que se dibujan automáticamente los cables desde los puertos, organizados ortogonalmente y agrupándose en los bordes del rack.
5. Usa el botón rotar del rack para ver la parte trasera (Rear View) desde donde nacen las conexiones.
