# Análisis Arquitectónico del Proyecto: RACK Designer Next

Este documento es una guía estructural dirigida a todos los agentes de IA y desarrolladores, proporcionando un mapa mental de la arquitectura del proyecto, la ubicación de sus módulos y la responsabilidad de cada archivo.

## 1. Visión General de la Arquitectura
RACK Designer Next es una Aplicación Web Progresiva (PWA) interactiva, diseñada para modelar infraestructuras de centros de datos (Gabinetes, Servidores, Switch, Conexiones de Red). No utiliza frameworks monolíticos pesados (como React o Angular); en su lugar, está construida con **Vanilla JavaScript Moderno (ES6+)** implementando una arquitectura limpia (Clean Architecture) orientada a eventos, con un patrón MVC altamente optimizado y un sistema de estado reactivo mediante `Proxy`.

---

## 2. Archivos Raíz (Configuración y Entry Points)
* **`index.html`**: El punto de entrada principal. Contiene toda la estructura DOM (esqueleto del dashboard, lienzo central, paneles laterales y modales ocultos).
* **`package.json` / `pnpm-lock.yaml`**: Archivos del gestor de paquetes de Node.js. Especifican las dependencias del ecosistema de desarrollo (ej. `marked` para compilar la documentación). Nota: El proyecto requiere estrictamente el uso de `pnpm`.
* **`service-worker.js`**: Archivo de registro principal del Service Worker para la PWA, habilitando el caché sin conexión (Offline-first) y la instalación de escritorio/móvil. Cache name: `rack-designer-next-cache-v2`.
* **`AGENTS.md`**: Guía de onboarding para agentes de IA. Contiene arquitectura, convenciones críticas,禁止事项 y archivos clave del proyecto.
* **`README.md`**: Información superficial del repositorio.
* **`.gitignore`**: Reglas de exclusión de Git (ignora `.backup`, `.agents`, `node_modules`).

---

## 3. Directorio `.agents/` (Directivas para IA)
* **`DESIGN.md`**: El "ADN" visual del proyecto. Dicta las reglas de UI/UX, espaciados estandarizados a 24px, modo oscuro/claro y prohíbe explícitamente estilos comerciales sobrecargados ("AI Slop").
* **`INSTRUCTIONS.md`**: Reglas operativas y flujos de trabajo (uso obligatorio de `pnpm`, registros estrictos en el `CHANGELOG` y la prohibición de ejecutar respaldos Git automáticos sin permiso).
* **`PROJECT_ANALYSIS.md`**: *Este archivo.* Mapa maestro del proyecto.

---

## 4. Directorio `js/` (Lógica Principal y Controladores)
El cerebro de la aplicación, fuertemente modulado:

### 4.1. Core y Estado (Base)
* **`store.js`**: El corazón del sistema. Define el estado global reactivo de la aplicación interceptando los datos con un `Proxy` ES6. Autoguarda automáticamente los cambios en el `localStorage` (con debounce para pan/zoom) y dispara eventos (`change`) hacia los componentes visuales. Expone métodos para CRUD de salas, racks, equipos y conexiones, así como `setZoom()`, `setPan()`, `setCurrentRoom()`, `updateRoom()`, `deleteRoom()` y `_cleanTopologyPositions()`.
* **`main.js`**: El orquestador de arranque. Inicializa la UI, vincula los eventos globales del DOM, gestiona la protección de datos e inicializa el modo de rendimiento.
* **`utils.js`**: Librería de funciones matemáticas y helpers puros (generación segura de IDs con `crypto.randomUUID()`, validadores, etc.).
* **`demoData.js`**: Un archivo inyectable (Lazy Load) que contiene una infraestructura ficticia masiva (racks, servidores) para demostraciones instantáneas.

### 4.2. Módulos de Lógica Pura
* **`js/auth/roles.js`**: Módulo del Sistema de Control de Accesos (RBAC). Gestiona criptográficamente el inicio de sesión (Web Crypto SHA-256) evitando el almacenamiento de texto plano.

### 4.3. Controladores de Interfaz (`js/ui/`)
Módulos que escuchan al `store` y mutan el DOM:
* **`js/ui/modals.js`**: Cargador maestro de todas las ventanas flotantes (modales).
* **`js/ui/modals/`**: Submódulos separados para cada ventana específica (`DeviceModal.js` para formularios colapsables, `CableModal.js` para los parcheos de red inteligentes, `RoomModal.js`, etc.).
* **`js/ui/rack.js`**: Motor de renderizado del hardware. Pinta el chasis del gabinete y encaja los equipos SVG pixel-perfect dentro de sus ranuras U.
* **`js/ui/catalog.js`**: Administra la galería lateral izquierda (el catálogo) y sus lógicas de Drag & Drop (arrastrar y soltar).
* **`js/ui/outliner.js`**: Genera el árbol de jerarquía (Outliner) interactivo en el panel derecho superior. Gestiona el estado de selección de Salas, Gabinetes y Equipos.
* **`js/ui/inspector.js`**: Controlador del "Inspector de Propiedades" central en el panel derecho. Renderiza dinámicamente tarjetas de solo lectura con atributos físicos y lógicos del ítem seleccionado.
* **`js/ui/tables.js`**: Controla el bloque inferior masivo del sistema, pintando las tablas de inventario en tiempo real.
* **`js/ui/fileManager.js`**: Interfaz moderna de interacción con el sistema de archivos local (`window.showOpenFilePicker`) para abrir y guardar los `.json` directamente en el disco.
* **`js/ui/topology/`**: El ecosistema gráfico de red en Canvas 2D. Está dividido en un patrón MVC estricto: `TopologyState` (estado y persistencia), `TopologyEvents` (interacción del usuario), `TopologyLayout` (motor de posicionamiento), `TopologyRenderer` (dibujado Canvas 2D) y `TopologyOrchestrator` (coordinador principal).

---

## 5. Directorio `css/` (Sistema de Diseño)
Arquitectura modular de estilos.
* **`variables.css`**: Todos los tokens del proyecto (colores dark/light, grosores, medidas fijas).
* **`layout.css`**: El andamiaje (CSS Grid de 3 columnas) que posiciona la cabecera, catálogo izquierdo, lienzo central, panel derecho (Outliner) y panel inferior.
* **`style.css`**: Archivo puente que consolida todas las importaciones.
* **`css/components/`**: Archivos de micro-estilos para modales, paneles colapsables e inputs genéricos.

---

## 6. Directorios de Recursos Estáticos (`assets/`)
* **`assets/icons/`**: Íconos monocromáticos SVG abstractos clasificados por carpetas (`/network`, `/server`, `/storage`, etc.), usados con CSS Masking para colorearlos dinámicamente en el lienzo de topología.
* **`assets/svg/`**: Diseños físicos de equipos vectoriales (faceplates) que se muestran fotorealistas al insertar un dispositivo en el Rack virtual.

---

## 7. Directorio `doc/` (Documentación)
* **`doc/log/CHANGELOG.md`**: Diario obligatorio de modificaciones para que cualquier agente y el humano mantengan el hilo conductor.
* **`doc/doc_md/USER_MANUAL.md`**: Guía operativa y funcional para el operador final de la infraestructura.
* **`doc/doc_md/CODEBASE_ORIENTATION_MAP.md`**: Mapa arquitectónico y técnico para desarrolladores.
* **`doc/doc_img/doc_svg/`**: Diagramas SVG de arquitectura, estructura de directorios y flujos.

---

## 8. Directorios de Utilidad (Scripts / Tests / Py)
* **`scripts/`**: Pequeños programas Node.js de construcción. Por ejemplo, `build_standalone_manual.cjs` (combina archivos Markdown usando `marked` en un solo manual HTML).
* **`tests/`**: Suite de pruebas y TDD (Test Driven Development) para proteger componentes críticos. Nota: Actualmente sin tests funcionales (comentados).
* **`.py/`**: Directorio aislado para scripts analíticos auxiliares de Python.

---
## Actualización: Enrutamiento de Cables Físicos (2D)
Implementado el trazado estético de cables punto a punto en Vista Física.
*   Se descartó el 3D en favor de SVG superpuesto con enrutamiento ortogonal (líneas escondidas en los rieles laterales).
*   Se desarrolló un interruptor visual (.ui-switch) en la barra principal para activar la capa vectorial.

---
## 9. Estado Actual del Proyecto (Última Actualización)
La fase de reestructuración de UI/UX, enfocada en la creación de paneles responsivos y una arquitectura visual más limpia, ha concluido exitosamente. 
- **Layout y Grid**: El sistema CSS Grid (`layout.css`) es ahora extremadamente robusto, manejando dimensiones fijas precisas (como el panel derecho de `300px` y la caja de estadísticas de `180px`), evitando desbordamientos (`minmax(0, 1fr)`).
- **Catálogo y Jerarquía**: La agrupación semántica del catálogo de hardware (dividiendo en "energía" y "accesorios") y la refactorización visual del árbol jerárquico (Outliner interactivo usando `<details>`) mejoran drásticamente la UX.
- **Limpieza de Código**: Los scripts auxiliares para inyección masiva de datos (scripts `patch*.py`) han sido estandarizados bajo el directorio de utilidad `.py/`, manteniendo la raíz del proyecto libre de deuda técnica y artefactos temporales.
