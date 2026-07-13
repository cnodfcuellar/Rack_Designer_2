# RACK Designer Next

**RACK Designer Next** es una poderosa aplicación web interactiva (PWA) de diseño y gestión de Centros de Datos (Data Centers). Permite modelar infraestructura de TI gestionando salas, gabinetes (Racks), servidores, equipos de red y el cableado físico y lógico que los interconecta.

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
- **Vista Topológica (Lógica):** Motor de dibujo basado en HTML5 `<canvas>` (`js/ui/topology/`), con soporte para zoom, paneo, nodos móviles, enrutamiento de enlaces y físicas de distribución.
- **Control de Acceso Basado en Roles (RBAC):** Autenticación local mediante `js/auth/roles.js` usando encriptación `SHA-256`. Roles soportados: Admin, Editor, Viewer.
- **Exportación:** Soporte completo para exportar configuraciones a JSON (para compartir), listas de inventario a Excel/CSV (usando SheetJS), y renderizado de Racks a imagen PNG (usando html2canvas).
- **Soporte PWA:** Funciona offline como Progressive Web App mediante su `service-worker.js`.

### 4. Mapa de Directorios (Separación de Preocupaciones)
* `js/store.js`: **Estado y Persistencia.** Define la mutación, maneja Undo/Redo y persistencia.
* `js/main.js`: **Orquestador.** Maneja eventos globales, menú principal y cambio de vistas.
* `js/ui/`: **Capa de Vista.** Componentes que reaccionan al estado:
  * `rack.js`: Controlador del entorno físico y capas vectoriales de conexión.
  * `faceplates.js`: Plantillas DOM y anclajes lógicos (`data-port`) de los equipos.
  * `topology/`: Motor MVC de red en Canvas 2D.
* `js/auth/`: **Seguridad.** Módulo de control de acceso.
* `css/`: **Estilizado Modular.** Dividido en variables, componentes (modales, paneles, forms) y utilidades.
* `assets/`: Vectores (`/svg`) e iconos emmascarables estáticos.
* `doc/`: **Centro de Conocimiento.** Documentos de arquitectura, manuales y changelogs.
* `.agents/`: Reglas e instrucciones rígidas para IAs (ej. `AGENTS.md`).

### 5. Librerías Externas (Vía CDN)
Cargadas nativamente en el `<head>` de `index.html`:
- [SheetJS (xlsx)](https://sheetjs.com/): Exportación de cables e inventario a Excel.
- [html2canvas](https://html2canvas.hertzen.com/): Exportación del DOM físico a imágenes PNG.

---

> **Aviso al Programador:** Antes de proponer cambios arquitectónicos severos, por favor consulta la documentación profunda ubicada en `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` y revisa las directrices en `AGENTS.md`.
