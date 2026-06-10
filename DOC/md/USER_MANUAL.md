# Manual de Usuario - RACK Designer

RACK Designer es una herramienta gráfica profesional para el diseño, documentación e inventario de Centros de Datos. Permite modelar gabinetes, ubicar equipos en rack o en piso, trazar topologías de red y exportar datos para auditorías.

## 1. Interfaz Principal

La interfaz está diseñada para optimizar el área de trabajo y consta de tres áreas clave:
- **Cabecera y Barra de Herramientas:** Contiene las opciones globales (Alternar Modo Claro/Oscuro, Cargar/Guardar proyecto), los selectores de vistas (Vista Física, Topología) y la gestión de Salas.
- **Lienzo Central (Área de Trabajo):** El espacio interactivo donde se visualizan y distribuyen los gabinetes (racks) y equipos de piso.
- **Panel Inferior (Inventario y Catálogo):** Muestra los reportes tabulares en vivo y permite el acceso rápido al Catálogo de Dispositivos predefinidos.

### Interfaz en Dispositivos Móviles (Responsive)

La aplicación cuenta con soporte adaptativo completo para smartphones y tabletas en el Centro de Datos:

![Interfaz Móvil](../html/img/ui-mobile.svg)
*Figura: Vista vertical y compacta adaptada a dispositivos móviles.*

* **Layout Compacto:** Los paneles laterales se ocultan automáticamente bajo el menú hamburguesa `☰` para maximizar el área útil del lienzo físico.
* **Pestañas Deslizantes:** Las pestañas de salas superiores y los filtros de catálogo soportan deslizamiento táctil horizontal.
* **Operaciones Simplificadas:** Para entornos táctiles donde el arrastre (`drag & drop`) puede ser dificultoso, se implementa el botón de **Ubicación Rápida (⚡)** que permite instalar equipos seleccionando su destino por menús guiados.

## 2. Gestión de Salas e Infraestructura

Las Salas representan espacios físicos aislados (ej. "Data Center Principal", "Sala Eléctrica").

* **Crear una Sala:** Haga clic en el símbolo `+` en la barra de pestañas de salas.
* **Renombrar:** Haga doble clic sobre el nombre de la pestaña de la sala.
* **Eliminar:** Utilice el icono `x` en la pestaña (solo visible si existe más de una sala).

### Añadir Gabinetes (Racks)
1. Sitúese en la **Vista Física** de la sala deseada.
2. Haga clic derecho en el fondo del área de trabajo.
3. Seleccione **"Añadir Rack"**, ingrese el nombre, defina la altura en Unidades (U) y seleccione un color para identificarlo.

## 3. Gestión de Equipos (Inventario)

Existen dos categorías principales de dispositivos: **Equipos en Rack** (Servidores, Switches, UPS) y **Equipos de Piso** (Cámaras IP, Workstations, APs).

### Insertar Equipos
* **Arrastrar y Soltar (Drag & Drop):** Abra el catálogo (botón `☰`), haga clic sostenido sobre un equipo y suéltelo sobre el espacio (`U`) deseado dentro de un rack, o en el área punteada de "Equipos de Piso".
* **Ubicación Rápida (⚡):** Utilice el icono de rayo junto a un equipo en el catálogo o en la tabla de inventario. Seleccione la sala y el gabinete de destino; el sistema encontrará automáticamente un espacio disponible y lo ubicará.

### Editar Configuración del Equipo
Haga clic sobre cualquier equipo ya ubicado y presione **"✏️ Editar"** en el panel lateral/inferior. El formulario está organizado lógicamente en módulos:

1. **Ubicación Física:** Permite reclasificar un equipo entre "Gabinete" o "Equipo de Piso", ajustando dinámicamente sus opciones (los equipos de piso no ocupan Unidades de altura).
2. **Identificación:** Marca, Modelo y Número de Serie.
3. **Módulos Opcionales (Casillas de Activación):**
   - **Habilitar Red:** Despliega campos para Dirección IP y Dirección MAC.
   - **Habilitar Credenciales:** Despliega Usuario y Contraseña.
   - **Habilitar Energía:** Despliega configuraciones detalladas de Tomas Eléctricas (Entrada y Salida) y Consumo (W). 

*Nota: La separación de tomas de "Salida" es ideal para documentar equipos proveedores de energía, como regletas (PDUs) o sistemas UPS.*

### Cara Frontal y Trasera de un Rack
El botón de rotación (`🔄 ATRÁS` / `🖥️ FRENTE`) en la cabecera de cada rack permite instalar equipos (como organizadores de cables o PDUs) en la cara posterior sin que colisionen físicamente con los servidores del frente.

## 4. Topología y Cableado

El modo **Topología** (accesible desde la barra superior) dibuja de forma automatizada un mapa de nodos interconectados.

* **Conectar Equipos:** Haga doble clic en un nodo (o utilice el botón derecho) para iniciar una conexión. Luego, seleccione el equipo de destino.
* **Organización Visual:** Puede arrastrar libremente los nodos para organizar el mapa. La topología resalta automáticamente los equipos que pertenecen a la sala que esté actualmente activa.

## 5. Exportación y Respaldo

### Guardar/Cargar Proyecto
Toda su infraestructura se guarda localmente en su navegador automáticamente, pero para respaldos de seguridad o para mover el proyecto a otro equipo:
* **Guardar Proyecto:** En el menú principal (`☰` arriba a la derecha), seleccione guardar. Esto descargará un archivo `.json` con todo el centro de datos.
* **Cargar Proyecto:** Importe un archivo `.json` previamente guardado para restaurar el entorno completo.

### Exportar Reportes (Excel / CSV)
En la sección inferior de "Inventario", los botones `⬇ Excel` y `⬇ CSV` generan instantáneamente un reporte tabular compatible con hojas de cálculo para facilitar la auditoría física.

### Exportar Diagramas Visuales (PNG)
Presione el botón `📷 PNG` en la barra de herramientas y seleccione un rack. El sistema procesará y descargará una imagen de alta resolución. Si el rack contiene equipos traseros, el PNG incluirá ambas caras (Frontal y Trasera) lado a lado automáticamente.

---
*Fin del Documento*
