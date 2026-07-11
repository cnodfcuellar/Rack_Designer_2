# RACK Designer Next

Un diseñador web interactivo para gabinetes de telecomunicaciones (Racks) y cableado de red (Topología).

## 🚀 Guía Rápida para Desarrolladores (Onboarding)

Si vas a continuar desarrollando este proyecto en otra computadora, esto es **exactamente lo que necesitas saber** para no romper la arquitectura y entender cómo fluye la información.

### 1. El Stack Tecnológico (Sin Build Step)
Este proyecto es **100% Vanilla JavaScript (ES6+), HTML5 y CSS3 nativo**. 
- **No hay React, Vue ni Angular.**
- **No necesitas Node.js, Webpack, Vite ni NPM** para compilar el proyecto (el `package.json` existe solo por control de versiones/pnpm lock, pero no es requerido para el frontend).
- **Cómo ejecutarlo:** Simplemente abre el proyecto en VS Code y usa la extensión **Live Server** (o cualquier servidor HTTP estático) para servir el `index.html`. Funciona directamente en el navegador.

### 2. La Regla de Oro: La Arquitectura Reactiva (Unidireccional)
El proyecto emula un comportamiento estilo *React/Redux* usando un **Proxy ES6 nativo**.
- **El Cerebro (`js/store.js`):** Toda la información de los gabinetes, equipos y cables vive en el objeto `state` dentro de `store.js`. 
- **La Mutación:** **NUNCA** debes modificar el DOM directamente para reflejar un cambio de datos. Si un usuario mueve un equipo o cambia su IP, debes actualizar los datos en el `store`.
- **La Reacción:** Al modificar el `store`, el *Proxy* lo detecta automáticamente, guarda todo en `localStorage` (para persistencia) y dispara un evento global en el `window` llamado `store-updated`.
- **El Renderizado:** El archivo `js/main.js` y los módulos en `js/ui/` escuchan el evento `store-updated` y redibujan la interfaz basándose *exclusivamente* en los nuevos datos.

### 3. Estructura de Directorios (Segmentación Estricta)
Para mantener el código mantenible, no mezcles lógica:

* `/js/models/`: **Lógica de Negocio Pura.** Clases base que definen qué es un Rack, un Equipo o un Cable (`Rack.js`, `Device.js`, `Cable.js`).
* `/js/api/` y `/js/core/`: Conexión externa (mocks) y utilidades pesadas como exportación JSON.
* `/js/store.js`: **Persistencia y Reactividad.** Define cómo mutan los datos. No sabe nada de HTML o CSS, sólo coordina los Modelos y dispara eventos.
* `/js/utils.js`: Funciones auxiliares genéricas (generación de UUIDs, validaciones).
* `/js/ui/`: **La Vista.** Aquí van los componentes que pintan el HTML (ej. `rack.js`, `topology.js`, `modals.js`, `outliner.js`, `inspector.js`). Estos archivos leen del store y generan el DOM.
* `/css/` y `/assets/`: Estilos CSS segmentados y recursos estáticos (imágenes).
* `/doc/` y `/tests/`: Documentación y pruebas unitarias base.

### 4. ¿Dónde encontrar la documentación técnica profunda?
Antes de tocar el código de renderizado o intentar entender cómo funciona el Canvas de la Topología o el Drag & Drop, abre los siguientes archivos:
👉 `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` y `doc/doc_md/PROJECT_ANALYSIS.md`
Ahí encontrarás el mapa arquitectónico detallando el ciclo de vida, los módulos, cómo funciona el Viaje en el Tiempo (Undo/Redo) y el ruteo del cableado.

### 5. ¿Qué librerías externas se usan?
Se cargan vía CDN directamente en el `<head>` del `index.html`:
- **SheetJS (xlsx):** Para la exportación a Excel en el módulo de Conexiones.
- **html2canvas:** Para tomar "fotografías" de los racks y exportarlos a PNG.
- **FontAwesome:** Para la iconografía de la UI.
- **Google Fonts:** Tipografías `Outfit` y `JetBrains Mono`.

---
*Si mantienes la separación entre el Estado (Store) y la Vista (UI), el proyecto escalará infinitamente sin convertirse en código espagueti.*
