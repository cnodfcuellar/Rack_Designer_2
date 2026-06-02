# 🎨 Propuesta de Interfaz (Mockup) - RACK Designer v2.1

Este documento detalla la propuesta de diseño visual (Mockup) para la interfaz de usuario de **RACK Designer v2.1**, planteando una modernización estética y funcional que eleva la herramienta a un estándar premium y altamente profesional.

---

## 1. Estética y Concepto Visual

La propuesta se basa en los principios del diseño moderno de cuadros de mando (Dashboards) orientados a herramientas técnicas de alta densidad de información (como software CAD, IDEs y monitores de redes).

*   **Tema Oscuro (Dark Mode):** Utiliza fondos oscuros profundos (tonos carbón y pizarra). Esto reduce la fatiga visual de los ingenieros que pasan horas diseñando centros de datos, y permite que los elementos de hardware resalten.
*   **Acentos Vibrantes (Neón):** Se emplea un color púrpura/violeta (como en el botón principal de *Agregar Equipo* y el logotipo) combinado con sutiles toques de azul cian. Esto dirige la atención del usuario a las acciones primarias sin saturar la vista.
*   **Glassmorphism (Efecto Cristal):** Paneles con ligeras transparencias y bordes suaves (rounded corners) que dan una sensación de profundidad, separando claramente los menús (flotantes) del lienzo de dibujo (fondo).
*   **Tipografía Moderna:** Uso de fuentes sin serifas geométricas y limpias (como *Inter* o *Roboto*), optimizadas para la lectura de datos técnicos (IPs, nombres de servidores).

---

## 2. Estructura de la Interfaz

La pantalla se divide en cinco zonas principales, cada una con un propósito ergonómico específico:

### 2.1. Barra de Navegación Superior (Top Bar)
Actúa como el contexto global del usuario.
*   **Avatar (Foto de perfil) con flecha (`⌄`)**: Menú de la cuenta de usuario (Perfil, Configuración, Cerrar Sesión).
*   **Logotipo Púrpura**: Identidad visual de RACK Designer.
*   **Título y Contexto**: "Data Center Rack Designer v2.1 | Centro de Datos CDMX". Indica claramente qué herramienta y qué proyecto/archivo específico está abierto.
*   **"Dashboard"**: Botón para salir del lienzo y volver al panel general de proyectos.
*   **"Herramientas ⌄"**: Menú desplegable para acciones de archivo globales (Guardar JSON, Cargar JSON, Exportar a PDF).

### 2.2. Barra Lateral de Navegación (Left Navbar)
Una franja muy delgada a la izquierda para cambiar el contexto completo de la aplicación.
*   **Iconos de Navegación**: Acceso rápido al menú principal, gestor de capas, gestor de archivos/proyectos, opciones de descarga y configuración general (engrane). En la parte inferior, acceso a ayuda (`?`) y salida (`[->`).

### 2.3. Panel de Catálogo de Hardware (Hardware Catalog)
Ubicado a la izquierda, contiene todos los elementos que pueden ser añadidos al diseño.
*   **Organización por Categorías**: Separación lógica en *Servidores*, *Switches*, *Routers* y *Periféricos de Piso*.
*   **Botones Tipo Tarjeta (Plantillas)**: Cada botón (ej. "Dell PowerEdge", "Cámara IP") funciona como un elemento arrastrable (Drag & Drop) hacia el lienzo.
*   **Soporte de Doble Clic**: Al hacer doble clic sobre cualquier tarjeta, se invoca instantáneamente el **Asistente de Ubicación Rápida** para añadir el equipo sin arrastrar.

### 2.4. El Lienzo de Dibujo y su Barra de Herramientas (Canvas & Toolbar)
El área central de trabajo y la barra gris que flota encima.
*   **Controles de Archivo y Vista (Izquierda de la barra)**: Iconos para nuevo archivo, capas visuales (ocultar cables/equipos), herramienta de selección por área y bloqueo del lienzo (candado) para prevenir ediciones accidentales.
*   **Controles de Edición (Centro de la barra)**: Botón para insertar un nuevo **Rack/Gabinete vacío** y flechas para **Deshacer (Undo)** y **Rehacer (Redo)** acciones.
*   **Controles del Lienzo (Derecha de la barra)**: Selector de tipografías ("Inter"), Lupa (para hacer Zoom o buscar un equipo), y Engrane (para activar cuadrículas magnéticas o *Snap to Grid*).
*   **El Lienzo**: Muestra los armarios renderizados con precisión y los equipos de piso organizados esquemáticamente.

### 2.5. Panel Inferior (Tabla de Inventario)
La zona de gestión de datos crudos (estilo Excel), vital para reportes.
*   **Listado de Equipo**: Tabla detallada con columnas ordenables (ID, Nombre, Tipo, Ubicación, Fabricante, Estado).
*   **Botón Púrpura "⚡ Agregar Equipo"**: El botón más llamativo del panel inferior. Lanza el **Asistente de Ubicación Rápida (Quick Placement Wizard)** en un modal interactivo, permitiendo añadir equipos al piso o a un rack mediante menús desplegables inteligentes, calculando el espacio disponible en cascada.
*   **Acciones por Fila**: Al final de cada fila existen tres botones rápidos:
    *   **Rayo (`⚡`)**: Acción rápida específica (conectar).
    *   **Lápiz (`✏️`)**: Editar propiedades del equipo (IP, MAC, Nombre).
    *   **Basurero (`🗑️`)**: Eliminar el equipo del sistema.

---

## 3. Conclusión de Diseño

Esta propuesta visual alinea RACK Designer con aplicaciones empresariales de clase mundial. La transición hacia una UI oscura con contrastes púrpuras no solo moderniza el aspecto estético, sino que mejora dramáticamente la usabilidad, resaltando flujos de trabajo críticos como el nuevo *Asistente de Ubicación Rápida* y manteniendo la pantalla principal limpia para el modelado de datos complejos.
