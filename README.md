# RACK Designer Next

**RACK Designer Next** es una poderosa aplicación web interactiva (PWA) de diseño y gestión de Centros de Datos (Data Centers). Permite modelar infraestructura de TI gestionando salas, gabinetes (Racks), servidores, equipos de red y el cableado físico y lógico que los interconecta.

---

## 🏢 Desglose de Funcionalidades Completas
*Detalle extraído del mapa arquitectónico principal (`architecture_overview.svg`).*

### ⚙️ Gestión Core
- **Salas (Rooms):** Creación y eliminación en cascada, navegación por dropdown, auto-limpieza de posiciones topológicas, actualización de estadísticas en vivo.
- **Gabinetes (Racks):** Alturas personalizables (4-48U), colores dinámicos, animación CSS 3D (*flip* frontal/trasero), guías de unidades (U markers) y prevención de desbordamientos.
- **Equipos (Devices):** 21 plantillas en 7 categorías. Soporte detallado de hardware: credenciales, consumo energético (W), direcciones IP/MAC validadas y carga de *skins* personalizadas.

### 🔌 Conexiones y Vistas (Rendering)
- **Vista Física (DOM + SVG):** Renderizado de chasis y faceplates en CSS puro, superpuesto con una capa interactiva vectorial para el enrutamiento inteligente de cables ortogonales segregados (bandeja aérea superior o canaleta bajo piso técnico, M-41).
- **Vista Topológica (Canvas 2D):** Diagrama de red con motor de físicas (*auto-order*), nodos arrastrables, layouts por racks y árbol jerárquico DAG, control dual interactivo de espaciado H/V, afinidad automática de equipos de piso por gabinete (M-39), 5 ranuras de memoria de vistas (M-40), 3 modos de skins visuales: Cards, Nodos e imágenes/hardware fotorrealista con 18 presets offline (M-28) y temas adaptativos (Oscuro, Claro y Sepia, M-18).
- **Tipos de Cables y Gestión de Enlaces:** Soporte para Cobre, Fibra (SM/MM) y DAC, selector de colores, asignación gráfica de puertos, selector de orientación de canaleta y botón rápido Swap de inversión de sentido (M-41).

### 🗃️ Interacción y Flujos de Datos
- **Drag & Drop Inteligente:** Inserción de catálogo a rack, movimiento de equipos entre gabinetes, y despliegue de equipos de piso (*Floor Devices*).
- **Deshacer / Rehacer (Undo/Redo):** Máquina del tiempo reactiva con hasta 30 instantáneas aisladas (`deepClone`).
- **Exportación e Importación Masiva:** Imágenes PNG a escala Retina 1:1 (`html2canvas`), hojas de cálculo Excel/CSV (Inventario y Conexiones vía SheetJS), plantillas estructuradas de 21 campos con hoja de ayuda (M-21), importación masiva de equipos con detección de colisiones de slots y rollback atómico (M-22), y File System Access API para backups JSON cifrados (`.rack`).
- **Seguridad en Reposo y Modo Dios (M-01):** Cifrado simétrico AES-GCM (`enc:v1:`) en `localStorage` y `.rack`, enmascaramiento por defecto y revelación autorizada bajo rol Admin.
- **Motor de Búsqueda:** Búsqueda global superior (IP/MAC/Nombre), buscador en tiempo real en catálogo y en colocación asistida.

---

## 🚀 Guía Rápida para Desarrolladores (Onboarding)

Si vas a continuar desarrollando este proyecto, estas son las reglas fundamentales que rigen la arquitectura. **Leer esto evitará que rompas el flujo de la aplicación.**

### 1. El Stack Tecnológico (Cero Compilación)
Este proyecto es **100% Vanilla JavaScript (ES6+), HTML5 y CSS3 nativo**.
- **Sin Frameworks:** No hay React, Vue, Angular, Svelte ni Tailwind.
- **Sin Build Step:** No necesitas Webpack, Vite, ni compilar nada para ver los cambios. Aunque existe un `package.json` (solo usar `pnpm`), el frontend corre nativamente en el navegador.
- **Cómo ejecutarlo:** Simplemente abre el proyecto en tu editor y usa **Live Server** (o cualquier servidor HTTP estático) apuntando a `index.html`.

### 2. La Regla de Oro: Arquitectura Reactiva Centralizada
El proyecto emula un comportamiento estilo *React/Redux* utilizando un **Proxy ES6 nativo**.
- **El Cerebro (`js/store.js`):** Todo el estado (salas, racks, equipos, conexiones, configuraciones) vive en el objeto `state` administrado por un Proxy.
- **Flujo Unidireccional:** **NUNCA** mutes el DOM para reflejar datos. Si un usuario mueve un equipo o conecta un cable, debes ordenarle al `store` que actualice los datos.
- **La Reacción:** Al modificar el `store`, el Proxy guarda automáticamente el estado en `localStorage` (persistencia) y dispara el evento global `store-updated`. El archivo `main.js` y el directorio `js/ui/` escuchan este evento y redibujan las vistas afectadas.

### 3. Características Core del Sistema
- **Vista Física (2D):** Racks y `faceplates` renderizados vía DOM. Incorpora enrutamiento inteligente de cables 2D superponiendo lienzos `<svg>` dinámicos (`js/ui/rack.js`).
- **Vista Topológica (Lógica):** Motor de dibujo basado en HTML5 `<canvas>` (`js/ui/topology/`), con soporte para zoom, paneo, nodos móviles, 3 estilos de representación (Cards, Nodos y Hardware con skins de fábrica o fotos personalizadas en base64, M-28), 5 slots de guardado, enrutamiento de enlaces y físicas de distribución.
- **Control de Acceso Basado en Roles (RBAC):** Autenticación local mediante `js/auth/roles.js` usando encriptación `SHA-256`. Roles soportados: Admin, Editor, Viewer.
- **Exportación e Importación:** Soporte completo para exportar configuraciones a JSON (para compartir), listas de inventario a Excel/CSV, importación masiva reactiva (`ImportModal.js`) y renderizado de Racks a imagen PNG fiel 1:1 (`html2canvas`).
- **Soporte PWA:** Funciona offline como Progressive Web App mediante su `service-worker.js`.
- **Suite de Pruebas:** 316 pruebas automáticas de integridad pasando al 100% en Node.js (`tests/integrity_check.cjs`) y en navegador web (`tests/index.html`).

### 4. Mapa de Directorios (Separación de Preocupaciones)
* `js/store.js`: **Estado y Persistencia.** Define la mutación, maneja Undo/Redo y persistencia.
* `js/main.js`: **Orquestador.** Maneja eventos globales, menú principal y cambio de vistas.
* `js/ui/`: **Capa de Vista.** Componentes que reaccionan al estado:
  * `rack.js`: Controlador del entorno físico y capas vectoriales de conexión.
  * `faceplates.js`: Plantillas DOM y anclajes lógicos (`data-port`) de los equipos.
  * `topology/`: Motor MVC de red en Canvas 2D.
  * `modals/`: Modales modulares de edición, colocación asistida, exportación e importación masiva (`ImportModal.js`).
* `js/auth/`: **Seguridad.** Módulo de control de acceso (`roles.js`) y cifrado (`crypto.js`).
* `css/`: **Estilizado Modular.** Dividido en variables (temas oscuro, claro, sepia), componentes y utilidades.
* `assets/`: Vectores (`/svg`) e iconos emmascarables estáticos.
* `doc/`: **Centro de Conocimiento.** Documentos de arquitectura, manuales y changelogs.
* `.agents/`: Reglas e instrucciones rígidas para IAs (ej. `AGENTS.md`).

### 5. Librerías Externas (Vía CDN)
Cargadas nativamente en el `<head>` de `index.html`:
- [SheetJS (xlsx)](https://sheetjs.com/): Exportación de cables e inventario a Excel.
- [html2canvas](https://html2canvas.hertzen.com/): Exportación del DOM físico a imágenes PNG.

---

> **Aviso al Programador:** Antes de proponer cambios arquitectónicos severos, por favor consulta la documentación profunda ubicada en `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` y revisa las directrices en `AGENTS.md`.
