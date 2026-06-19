# Manual de Usuario - RACK Designer

RACK Designer es una herramienta gráfica profesional para el diseño, documentación e inventario de Centros de Datos. Permite modelar gabinetes, ubicar equipos en rack o en piso, trazar topologías de red y exportar datos para auditorías.

## 1. Interfaz Principal

La interfaz está diseñada para optimizar el área de trabajo y consta de tres áreas clave:
- **Cabecera y Barra de Herramientas:** Contiene las opciones globales (Alternar Modo Claro/Oscuro, Cargar/Guardar proyecto), los selectores de vistas (Vista Física, Topología) y la gestión de Salas.
- **Lienzo Central (Área de Trabajo):** El espacio interactivo donde se visualizan y distribuyen los gabinetes (racks) y equipos de piso.
- **Panel Inferior (Inventario y Catálogo):** Muestra los reportes tabulares en vivo y permite el acceso rápido al Catálogo de Dispositivos predefinidos.

**Adaptabilidad a Pantallas:**
La aplicación cuenta con soporte adaptativo completo para smartphones y tabletas. En pantallas de escritorio, el diseño se expande lateralmente. En dispositivos móviles, el layout es compacto: los paneles laterales se ocultan automáticamente bajo un menú hamburguesa `☰` para maximizar el área útil del lienzo físico, logrando una vista vertical optimizada.

![Interfaz Móvil](../html/img/ui-mobile.svg)
*Figura: Vista vertical y compacta adaptada a dispositivos móviles.*

## 2. Gestión de Salas e Infraestructura

Las Salas representan espacios físicos aislados (ej. "Data Center Principal", "Sala Eléctrica").

* **Crear una Sala:** Haga clic en el símbolo `+` en la barra de pestañas de salas. En pantallas táctiles, las pestañas de salas soportan deslizamiento horizontal.
* **Renombrar:** Haga doble clic sobre el nombre de la pestaña de la sala.
* **Eliminar:** Utilice el icono `x` en la pestaña (solo visible si existe más de una sala).

**Interfaz Móvil:** El formulario de creación de salas se adapta automáticamente a la vista móvil para evitar desbordamientos.
![Modal de Nueva Sala en Móvil](../html/img/ui-mobile-modal-room.svg)
*Figura: Modal simplificado para la creación de salas en móviles.*

### Añadir Gabinetes (Racks)
1. Sitúese en la **Vista Física** de la sala deseada.
2. Haga clic derecho en el fondo del área de trabajo (o mantenga presionado en pantallas táctiles).
3. Seleccione **"Añadir Rack"**, ingrese el nombre, defina la altura en Unidades (U) y seleccione un color para identificarlo.

## 3. Gestión de Equipos (Inventario)

Existen dos categorías principales de dispositivos: **Equipos en Rack** (Servidores, Switches, UPS) y **Equipos de Piso** (Cámaras IP, Workstations, APs).

### Insertar Equipos
* **Arrastrar y Soltar (Drag & Drop):** Abra el catálogo (botón `☰`), haga clic sostenido sobre un equipo y suéltelo sobre el espacio (`U`) deseado dentro de un rack, o en el área punteada de "Equipos de Piso".
* **Ubicación Rápida (⚡):** Operación simplificada para entornos táctiles donde el arrastre puede ser dificultoso. Utilice el icono de rayo junto a un equipo en el catálogo. Seleccione la sala y el gabinete de destino; el sistema encontrará automáticamente un espacio disponible y lo ubicará.

**Catálogo en Dispositivos Móviles:** Al pulsar el botón de menú hamburguesa o el de estadísticas, se despliega un panel lateral flotante (Off-Canvas) con métricas globales y el catálogo de dispositivos optimizado para scroll táctil.
![Catálogo y Estadísticas en Móvil](../html/img/ui-mobile-catalog.svg)
*Figura: Panel lateral de Estadísticas y Catálogo de Dispositivos adaptado para pantallas móviles (Menú Off-Canvas).*

### Editar Configuración del Equipo
Haga clic sobre cualquier equipo ya ubicado y presione **"✏️ Editar"** en el panel lateral/inferior. El formulario está organizado lógicamente en módulos:

1. **Ubicación Física:** Permite reclasificar un equipo entre "Gabinete" o "Equipo de Piso", ajustando dinámicamente sus opciones (los equipos de piso no ocupan Unidades de altura).
2. **Identificación:** Marca, Modelo y Número de Serie.
3. **Módulos Opcionales (Casillas de Activación):**
   - **Habilitar Red:** Despliega campos para Dirección IP y Dirección MAC.
   - **Habilitar Credenciales:** Despliega Usuario y Contraseña.
   - **Habilitar Energía:** Despliega configuraciones detalladas de Tomas Eléctricas (Entrada y Salida) y Consumo (W). 

*Nota: La separación de tomas de "Salida" es ideal para documentar equipos proveedores de energía, como regletas (PDUs) o sistemas UPS.*

**Interfaz Móvil:** Los modales de configuración de equipo se reestructuran visualmente en pantallas verticales apilando los campos en una grilla compacta de dos columnas.
![Modal de Equipo en Móvil](../html/img/ui-mobile-modal-device.svg)
*Figura: Formulario de adición y edición de equipos optimizado para dispositivos móviles.*

### Inventario Deslizable
El panel inferior muestra todos los dispositivos. En escritorio, ocupa el ancho inferior. En **Móvil**, funciona como un contenedor deslizable verticalmente (drawer) que se puede arrastrar hacia arriba para expandir la lista, contando con desplazamiento horizontal táctil para las distintas columnas.
![Inventario en Móvil](../html/img/ui-mobile-inventory.svg)
*Figura: Tabla de inventario expandida y adaptada para scroll en pantallas móviles.*

### Cara Frontal y Trasera de un Rack
El botón de rotación (`🔄 ATRÁS` / `🖥️ FRENTE`) en la cabecera de cada rack permite instalar equipos (como organizadores de cables o PDUs) en la cara posterior sin que colisionen físicamente con los servidores del frente.

## 4. Topología y Cableado

El modo **Topología** (accesible desde la barra superior) dibuja de forma automatizada un mapa de nodos interconectados.

* **Conectar Equipos:** Haga doble clic en un nodo (o utilice el botón derecho/pulsación larga) para iniciar una conexión. Luego, seleccione el equipo de destino.
* **Organización Visual:** Puede arrastrar libremente los nodos para organizar el mapa. La topología resalta automáticamente los equipos que pertenecen a la sala que esté actualmente activa.

**Topología en Dispositivos Móviles:** En pantallas pequeñas, el mapa auto-escala el nivel de zoom y organiza verticalmente las salas conectadas. Los modales de conexión de puertos también se redimensionan para evitar desbordamientos de campos.
![Topología en Móvil](../html/img/ui-mobile-topology.svg)
*Figura: Vista de la topología lógica y cableado de red en dispositivos móviles.*

![Modal de Conexión en Móvil](../html/img/ui-mobile-modal-connection.svg)
*Figura: Formulario estructurado para el trazado de conexiones y puertos en móviles.*

## 5. Exportación y Respaldo

### Guardar/Cargar Proyecto

* **Guardar Proyecto:** En el menú principal (icono de tres líneas o nube), selecciona **Guardar proyecto**. Si es la primera vez, el navegador te preguntará dónde guardar el archivo (usando la File System Access API). Las siguientes veces que guardes, se sobrescribirá silenciosamente ese archivo. Adicionalmente, el sistema **autoguardará** tus progresos cada 3 segundos en el mismo archivo siempre que mantengas la pestaña abierta.
* **Guardar como...:** Si deseas bifurcar tu proyecto, usa esta opción para crear un nuevo archivo de destino.
* **Cargar Proyecto:** Selecciona **Abrir proyecto** en el menú. Te permitirá cargar un archivo `.json` o `.rack` directo desde tu sistema de archivos, manteniendo el enlace (handle) activo para futuros autoguardados.
*(Nota: Si usas navegadores sin soporte completo como Firefox o Safari, el sistema utilizará el método clásico de descargas manuales).*

**Gestión en Móvil:** El menú de opciones globales es accesible mediante un botón hamburguesa superior derecho, desplegando un menú claro y adaptado para comandos táctiles.
![Menú de Opciones en Móvil](../html/img/ui-mobile-menu.svg)
*Figura: Menú de gestión de proyectos adaptado a pantallas móviles.*

### Exportar Reportes (Excel / CSV)
En la sección inferior de "Inventario", los botones `⬇ Excel` y `⬇ CSV` generan instantáneamente un reporte tabular compatible con hojas de cálculo para facilitar la auditoría física.

### Exportar Diagramas Visuales (PNG)
Presione el botón `📷 PNG` en la barra de herramientas y seleccione un rack. El sistema procesará y descargará una imagen de alta resolución. Si el rack contiene equipos traseros, el PNG incluirá ambas caras (Frontal y Trasera) lado a lado automáticamente. Adicionalmente, si la sala contiene equipos ubicados en el piso, aparecerá una opción para exportar "Equipos de Piso" de forma independiente.

---

## 6. Arquitectura Visual (Layout Map)

Para facilitar la comprensión del sistema, a continuación se presenta el mapa estructural (Layout Map) de la aplicación, el cual divide la interfaz en zonas lógicas para su navegación y gestión.

![Layout Map Estructural](../html/img/mockup/svg_mocks_area/ui_layout_map_full.svg)
*Figura: Mapa Estructural de Rack Designer 2.*

Aquí tienes la descripción de cada área y su propósito:

### 1. Logo / Top Left (Bloque Pizarra Oscuro)
*   **Corresponde a:** La cabecera izquierda:
    ![Cabecera Izquierda](../html/img/mockup/svg_mocks_area/ui_app_header.svg)
*   **Función:** Es el ancla de marca y navegación principal. Contiene el isotipo iluminado, el nombre de la app ("RACK Designer"), el estado o nombre del archivo actual ("Nuevo Proyecto") y el botón de menú tipo hamburguesa para acceder a configuraciones globales, guardar, abrir o exportar el proyecto.

### 2. Top Header (Bloque Celeste)
*   **Corresponde a:** La barra superior global:
    ![Barra Superior Global](../html/img/mockup/svg_mocks_area/ui_top_bar.svg)
*   **Función:** Contiene los controles de estado global y búsqueda. Aquí el usuario cambia el modo principal de la aplicación (alternando entre **"Vista Física"** y **"Topología"**). También aloja los botones de Deshacer/Rehacer, el indicador de estado del sistema (el punto verde) y la barra de búsqueda global ("Buscar equipo, IP, MAC...").

### 3. Toolbar / Tabs (Bloque Violeta)
*   **Corresponde a:** Los controles de vista y zoom:
    ![Controles de Vista y Zoom](../html/img/mockup/svg_mocks_area/ui_zoom_controls.svg)
*   **Función:** Actúa como una barra de herramientas flotante pegada al lienzo. Su objetivo exclusivo es manipular la cámara y el entorno visual. Incluye controles de **Zoom** (`-`, `+`, `1:1`), el selector de la ubicación o sala actual (ej. "Sala A1"), y botones para exportar el lienzo a imagen ("PNG") o ponerlo en pantalla completa ("Expandir").

### 4. Sidebar (Bloque Gris/Lateral)
*   **Corresponde a:** Los paneles laterales contextuales:
    ![Sidebar](../html/img/mockup/svg_mocks_area/ui_sidebar.svg)
    ![Stats Panel](../html/img/mockup/svg_mocks_area/ui_stats_panel.svg)
*   **Función:** Es un panel dinámico multipropósito que cambia según lo que el usuario esté haciendo:
    *   **Catálogo (Librería):** Muestra botones para agregar racks/equipos, una barra de búsqueda local, filtros (Servers, Red, Storage) y las tarjetas de los equipos arrastrables (Switch, Router, Firewall, UPS) indicando cuántas "U" ocupan.
    *   **Estadísticas (Dashboard):** Muestra las métricas de la sala (cantidad de servidores, ocupación de unidades U, nodos de red) y las barras de progreso de Capacidad del Rack y Consumo Eléctrico (W).

### 5. Main Canvas (Bloque Gris Claro/Central)
*   **Corresponde a:** El espacio de trabajo principal y las vistas de detalle:
    ![Lienzo Principal](../html/img/mockup/svg_mocks_area/ui_main_canvas.svg)
    ![Rack View](../html/img/mockup/svg_mocks_area/ui_rack_view.svg)
*   **Función:** 
    *   **Lienzo interactivo:** Es el área cuadriculada principal donde el usuario arrastra y suelta gabinetes desde la Sidebar para armar la distribución física de la sala o el esquema de topología.
    *   **Vista de Rack:** Si el usuario abre un gabinete, este mismo lienzo central se transforma para mostrar el detalle vertical frontal y trasero (ej. Rack 101 de 42U), permitiendo atornillar los equipos unidad por unidad.

### 6. Bottom Bar / Pestañas (Bloque Rojo)
*   **Corresponde a:** La barra inferior minimizada:
    ![Barra Inferior](../html/img/mockup/svg_mocks_area/ui_bottom_bar.svg)
*   **Función:** Muestra pestañas rápidas ("Inventario", "Conexiones"), accesos directos para agregar equipos ("⚡ Agregar Equipo"), botones de exportación ("↓ CSV", "↓ Excel") y el control para expandir la tabla completa (▲).

### 7. Tabla de Datos / Inventario Expandido (Bloque Salmón)
*   **Corresponde a:** El panel inferior a pantalla completa:
    ![Tabla de Inventario](../html/img/mockup/svg_mocks_area/ui_table_inventory.svg)
*   **Función:** Es el centro de gestión de datos crudos. Cuando se expande, revela la tabla completa permitiendo auditar y editar masivamente características avanzadas como marcas, modelos, IPs, MACs, contraseñas y consumo eléctrico de todos los equipos del proyecto.

---
*Fin del Documento*
