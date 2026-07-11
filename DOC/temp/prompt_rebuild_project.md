# Prompt de Reconstrucción del Proyecto RACK Designer Next (Atomic Design & 100% Offline)

Este documento contiene un prompt maestro extremadamente detallado que puede ser entregado a un agente de inteligencia artificial o desarrollador para reconstruir este proyecto desde cero. Los requerimientos exigen cumplir con los estándares de **Atomic Design**, mantener la arquitectura reactiva basada en un **Proxy de estado global unidireccional (Vanilla JS)**, conservar todas las características, asegurar que la interfaz sea visualmente idéntica (rich glassmorphism dark theme, layouts optimizados, etc.) y garantizar que el proyecto sea **100% Offline-First**.

---

```markdown
Actúa como un Ingeniero de Software Frontend Senior experto en Vanilla JavaScript (ES6+), CSS3 moderno y HTML5. Tu objetivo es crear desde cero un clon exacto y completamente funcional del sistema "RACK Designer Next", una consola web interactiva de simulación y diseño de datacenters (racks, equipos, topologías de red y cableado).

No debes utilizar frameworks de terceros como React, Vue, Angular o Tailwind CSS. Toda la lógica del DOM y los estilos deben ser Vanilla nativos, estructurados estrictamente bajo los principios de **Atomic Design** y organizados de manera modular.

---

### 1. REQUERIMIENTO CRÍTICO: ARQUITECTURA 100% OFFLINE-FIRST
La aplicación debe funcionar completamente sin conexión a Internet y sin necesidad de un backend o servidor web activo (Offline-First nativo).
1. **Service Worker Offline**: Desarrollar un Service Worker (`service-worker.js`) que implemente la estrategia **Cache-First** para:
   - Almacenar en caché todos los archivos locales del proyecto (HTML, CSS, JS, imágenes, iconos SVG).
   - Pre-cachear todas las librerías cargadas por CDN en el `<head>` del HTML (`xlsx.full.min.js`, `html2canvas.min.js`, FontAwesome, Google Fonts). La aplicación no debe realizar llamadas externas de red a Internet tras la primera carga.
2. **Cero Dependencias de Servidor**: Toda la lógica (hashing de claves, cálculos de topología, generación y parseo de archivos, exportación de informes) debe procesarse localmente en la CPU del cliente utilizando APIs del navegador.
3. **Persistencia Redundante**: Los datos del diseño del datacenter deben almacenarse localmente y sin latencia en el navegador usando `localStorage` (clave `RACK_DESIGNER_NEXT_STATE`) para asegurar que el usuario no pierda información si se cierra la ventana o el navegador se apaga abruptamente.
4. **Acceso al Disco Duro Local**: Implementar la **File System Access API** (`window.showOpenFilePicker` y `window.showSaveFilePicker`) para cargar y guardar los archivos `.rack` o `.json` directamente en el almacenamiento del usuario, de forma puramente local y transparente.

---

### 2. REGLA DE ORO DE ARQUITECTURA (Unidireccional Reactiva)
Debes emular un patrón reactivo unidireccional en Vanilla JS:
1. **Estado Único (Store)**: Existe un único objeto centralizado (`state` dentro de `Store`) gestionado por un `Proxy` de ES6. Cualquier mutación (añadir rack, editar equipo, conectar cable, mover nodo) debe hacerse directamente en este objeto.
2. **Persistencia Automática**: El Proxy interceptará los `set` para guardar el estado en `localStorage` y disparar un evento global de ventana (`window.dispatchEvent(new Event('store-updated'))`).
3. **Autoguardado Asíncrono**: Configurar una función de autoguardado en el archivo de disco con un debounce de 3 segundos tras cada edición del Store para optimizar el rendimiento y evitar escrituras simultáneas en disco.
4. **Renderizado Unidireccional**: Todos los controladores visuales se suscriben a `store-updated` para redibujar la interfaz basándose únicamente en los datos vigentes en el Store. Nunca manipules el DOM directamente para actualizar datos sin alterar previamente el estado.
5. **Undo/Redo**: Mantener una pila (stack) ilimitada de historial de snapshots del estado global para revertir o repetir acciones (`ctrl+z` / `ctrl+y`).

---

### 3. SISTEMA DE DISEÑO Y ESTÉTICA VISUAL: TEMA CLARO Y TEMA OSCURO (Dynamic Dual Themes)
La aplicación debe admitir la alternancia dinámica entre **Tema Oscuro** y **Tema Claro** mediante variables CSS (tokens de diseño) controlados por el atributo `data-theme` en la etiqueta `<html>`:
1. **Evitar parpadeo de color en carga (FOUC)**: En el `<head>` del `index.html` debe ejecutarse un script síncrono que lea inmediatamente la clave `theme` de `localStorage` y aplique el atributo `data-theme` en `document.documentElement` antes de renderizar el cuerpo del documento.
2. **Tema Oscuro (Por defecto)**:
   - Fondos profundos: `#090d16` y `#0f172a`.
   - Bordes y líneas divisoras: `#1e293b` (o semitransparentes `rgba(255,255,255,0.08)`).
   - Textos principales: `#f8fafc`.
   - Efecto Glassmorphism: Paneles laterales y modales usando `backdrop-filter: blur(12px) saturate(150%)`.
3. **Tema Claro**:
   - Fondos claros y limpios: `#f8fafc` y `#ffffff`.
   - Bordes y líneas divisoras: `#e2e8f0` (o semitransparentes `rgba(0,0,0,0.08)`).
   - Textos principales: `#0f172a`.
   - Paneles con sombras suaves limpias en lugar de resplandor de luz (glow).
4. **Tipografías**: Google Fonts `Outfit` para títulos y UI, `JetBrains Mono` o `Space Grotesk` para números de U, IPs, comandos y tablas.
5. **Acentos Dinámicos**: Colores para representar tipos de red (Cobre: Azul, Fibra: Verde, DAC: Naranja, Alarmas: Rojo).

---

### 4. ORGANIZACIÓN DEL CÓDIGO (Estructura Atomic Design)
Debes organizar los recursos de la aplicación en la siguiente estructura de carpetas:

```text
/css/
  /variables.css      <-- Tokens de diseño (colores dark/light, fuentes, sombras)
  /layout.css         <-- Estructura de rejilla principal (Grid de 3 columnas)
  /components/        <-- Estilos de átomos, moléculas y organismos
/js/
  /core/
    /store.js         <-- Proxy de estado global, persistencia, undo/redo
    /utils.js         <-- Helpers, generador de UUIDs, escapado HTML
  /auth/
    /roles.js         <-- Sistema de autenticación RBAC con SHA-256 criptográfico local
  /components/
    /atoms/           <-- Botones base, inputs, selectores de color, iconos SVG
    /molecules/       <-- FormFields, StatPill, SlotUnit, PortNode, ContextMenuItem
    /organisms/       <-- CatalogSidebar, OutlinerTree, InspectorPanel, TopologyCanvas, RackChassis, InventoryTables, ModalController
    /templates/       <-- DashboardLayout (andamiaje principal que conecta paneles)
    /pages/           <-- App (inicializador global, eventos PWA, bootstrap)
```

---

### 5. DETALLE DE COMPONENTES DEL DISEÑO ATÓMICO

#### A. ÁTOMOS (Atoms)
1. **BaseButton**: Botón personalizable con estados (primary, secondary, danger, confirm, icon-only) y transiciones hover con glow.
2. **BaseInput**: Inputs de texto, selectores de color, y dropdowns de estilo oscuro/claro homogeneizados.
3. **ColorDot**: Punto indicador de estado o color de rack.
4. **SVGIcon**: Iconografía pura monocromática cargada dinámicamente mediante `mask-image` de CSS para colorearla al vuelo sin re-importar.
5. **ThemeToggler**: Botón atomizado en la cabecera (Header) con icono de Sol/Luna que alterna el tema de la aplicación mutando el atributo `data-theme` en la etiqueta HTML y almacenando la preferencia en `localStorage`.

#### B. MOLÉCULAS (Molecules)
1. **FormField**: Contenedor vertical que une un label de tipografía monospace con un `BaseInput` o selector.
2. **StatPill**: Píldora de métrica individual que contiene un icono coloreado, un label y el valor de contador.
3. **SlotUnit**: Fila individual del riel del rack (muestra el número de la unidad de rack U, con borde inferior delgado).
4. **PortNode**: Representación gráfica pequeña de un puerto Ethernet/SFP con indicación visual de si está conectado o libre.
5. **ContextMenuItem**: Ítem individual para menús flotantes con icono, texto y atajo de teclado.

#### C. ORGANISMOS (Organisms)
1. **CatalogSidebar**: Panel izquierdo que contiene:
   - Buscador/filtro de equipos por texto.
   - Pestañas por categoría (Servidores, Switches, Almacenamiento, Periféricos).
   - Elementos del catálogo arrastrables (drag-and-drop nativo de HTML5 con ghost visual transparente) para montarse en el rack.
2. **OutlinerTree**: Árbol jerárquico interactivo (Salas > Racks > Equipos). Permite:
   - Colapsar/expandir nodos.
   - Seleccionar un nodo para enfocarlo en el Inspector.
   - Eliminar o clonar elementos mediante atajos de teclado o menú contextual.
3. **InspectorPanel**: Panel central-derecho dinámico que lee la selección activa:
   - Muestra propiedades clave (Físicas y de Red) del elemento seleccionado (Room, Rack, Device o Cable).
   - Muestra estadísticas generales de la sala seleccionada o a nivel global si no hay selección (ej. Nro. de salas, total de racks, equipos montados en rack, equipos de piso, total de conexiones de red).
4. **RackChassis (Gabinete)**: Para renderizar el rack físicamente escala a escala:
   - Configurable de 4U a 48U.
   - Admite visualización frontal y trasera mediante un efecto 3D flip (volteo en eje Y usando CSS perspective y transform con control de pointer-events).
   - Zona de slots interactiva que detecta colisiones: no se puede colocar un equipo si colisiona con otro o excede la altura.
   - Detección de arrastre y soltar nativa.
   - Cada equipo montado muestra sus propiedades en un menú flotante de acciones rápidas (Editar, Eliminar, Duplicar).
5. **TopologyCanvas (Canvas 2D)**: Lienzo interactivo en Canvas HTML5 para red:
   - Permite arrastrar salas, racks y periféricos como nodos y conectarlos.
   - Zoom mediante scroll (rueda del ratón) y paneo manteniendo presionado el botón central/izquierdo.
   - Dibujo dinámico de cables usando curvas Bézier cúbicas coloreadas según el tipo (Cobre: azul, DAC: naranja, Fibra: verde).
   - Algoritmo de ordenamiento automático (Force-Directed / Espaciado radial) mediante botón interactivo y slider para ajustar la distancia de separación (`radial recalculation`).
   - Muestra un tooltip fotorrealista flotante en el Canvas que sigue al cursor y detalla el nombre del equipo, tipo, IP, usuario y contraseña del nodo seleccionado.
6. **InventoryTables**: Panel inferior colapsable que organiza pestañas de tablas dinámicas:
   - **Equipos**: Inventario completo con buscador global.
   - **Racks**: Listado de gabinetes con su altura total, espacio ocupado, peso/consumo.
   - **Conexiones**: Parcheo completo mostrando puerto de origen y destino.
   - Integración nativa con la librería **SheetJS** local (pre-cacheada por el Service Worker) para exportación a Excel y descarga en CSV sin conectividad de red.
7. **ModalController**: Gestor de diálogos flotantes mediante acordeones colapsables para configurar:
   - **Gabinete**: Nombre, altura en U, color, marca, modelo, ubicación.
   - **Equipo**: Nombre, tipo (Server, Switch, PDU, Patch Panel, etc.), altura U, puertos físicos de red (RJ45/SFP), IP, máscara, gateway, credenciales (usuario/contraseña ocultados pero visualizables), consumo (watts), skin de chasis fotorrealista (imagen o SVG) y modo fallback a CSS si no carga la imagen.
   - **Conexión (Cables)**: Selector inteligente de puerto de salida del dispositivo A a puerto de entrada del dispositivo B, especificando tipo de cable, longitud y velocidad.
   - **Login**: Protección de acceso mediante PIN criptográfico local usando **Web Crypto API** (hashing SHA-256 en cliente) con roles: Admin (lectura/escritura total), Editor (puede modificar pero no alterar configuraciones globales/roles), Viewer (solo lectura).

#### D. PLANTILLAS (Templates)
1. **DashboardLayout**: Estructura de rejilla principal de tres columnas fijas:
   - Fila de cabecera superior (Header) con título de proyecto, sesión de login, controles Undo/Redo, estado de guardado, ThemeToggler e importación/exportación rápida.
   - Panel izquierdo: Catálogo de dispositivos.
   - Panel Central: Área de trabajo principal dividida en pestañas deslizables con transiciones suaves (Vista Física de Racks vs Vista de Topología de Red).
   - Panel derecho: Árbol Outliner (arriba) e Inspector/Estadísticas (abajo).
   - Panel inferior deslizante para tablas de inventario detalladas.

#### E. PÁGINAS (Pages)
1. **App**: Punto de entrada de la aplicación. Inicializa el ciclo de vida, instancia el `Store` global, registra el Service Worker (PWA Offline), intercepta atajos de teclado globales y se encarga del renderizado principal distribuyendo la información a todos los organismos de la interfaz reactiva.

---

### 6. ESPECIFICACIÓN TÉCNICA DEL CUIDADO DE ERRORES (Fail-Safe Tooltips)
Para garantizar la fiabilidad del sistema en producción, los tooltips flotantes en la vista física (HTML/CSS) y la vista de topología (Canvas 2D) deben incorporar validaciones a prueba de fallos:
- Encapsular la lógica de hover en bloques `try-catch`.
- Utilizar "Optional Chaining" (`?.`) y destructuración con valores por defecto para leer la IP (`dev.network?.ip || 'N/A'`) y credenciales (`dev.credentials?.user || 'N/A'`), previniendo errores de tipo `TypeError` si un dispositivo heredado o importado carece de dichos objetos.
- Castear el tipo de equipo a cadena antes de procesarlo (`String(dev.type).toUpperCase()`).
- Evitar solapamientos: la posición del tooltip debe recalcularse dinámicamente en `mousemove` para que nunca quede bajo el cursor del ratón (lo que causaría bucles infinitos de `mouseenter/mouseleave`) y mantenerse dentro de los límites del viewport de la pantalla.

Genera el código de este proyecto completo, asegurando que todos los módulos estén perfectamente vinculados, sean legibles, cumplan con los estándares visuales e interactivos mencionados y tengan un diseño limpio y profesional.
```

---

### Cómo proceder:
1. Lee las especificaciones de este prompt.
2. Si requieres clonar el proyecto actual estructurándolo de este modo, puedes utilizar este archivo como mapa de ruta exacto para la refactorización o regeneración del software.
3. El archivo queda guardado en `doc/temp/prompt_rebuild_project.md` de forma totalmente pasiva sin alterar el código ejecutable de la aplicación principal.
