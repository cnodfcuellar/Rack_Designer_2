# Technical Context

## Core Technologies
- **Frontend Core:** HTML5 semántico, Vanilla JavaScript (ES6+), CSS3 modular (con variables y diseño de cuadrícula/flexbox).
- **Arquitectura de Estado:** Patrón ES6 `Proxy` reactivo sobre singleton `store.js` con intercepción en `set`, persistencia automática y despacho de eventos `'change'`.
- **Persistencia Local:** `localStorage` del navegador con doble ranura de respaldo redundante (`RACK_DESIGNER_NEXT_STATE_BACKUP`) y `sessionStorage` para credenciales de sesión en memoria volátil.
- **Seguridad Criptográfica en Reposo (`js/auth/crypto.js`):** Web Crypto API nativa con derivación PBKDF2 y cifrado simétrico AES-GCM 256-bit (`enc:v1:<iv>:<ciphertext>`), complementado con fallback puro en JavaScript para entornos locales.
- **Autenticación y RBAC (`js/auth/roles.js`):** Control de acceso basado en 3 roles (Admin, Editor, Viewer) protegido por PIN con digest SHA-256 (`RackAuth`).
- **Renderizado Gráfico Dual:**
  - **Alzado Físico:** Motor DOM + SVG inline (`faceplates.js` con `EMBEDDED_SVG_CACHE`) y canaletas de cableado vectorial.
  - **Topología Lógica:** Motor Canvas 2D acelerado por hardware (`TopologyOrchestrator.js`, `TopologyRenderer.js`, `TopologyLayout.js`, `TopologySkins.js`).
- **Galería de Assets y Skins (`assets/img/`):** Biblioteca offline de 19 archivos SVG vectoriales isométricos (proyección a 30°, iluminación en 3 planos facetados, paleta carbón/cian con acentos luminosos y sombras de suelo).
- **Paquetería y Dependencias:** Exclusivamente `pnpm` (prohibido `npm` o `yarn`). Única dependencia en tiempo de desarrollo: `marked`.
- **Librerías Vendor (Global Scripts):** `xlsx.full.min.js` (SheetJS), `html2canvas.min.js`, `mobile-drag-drop.min.js`, `mobile-drag-drop-scroll.min.js`.

## Development Setup
- **Ejecución Local:** Cualquier servidor estático simple (VS Code Live Server en `index.html`, `npx serve .`, o `python -m http.server 8000`).
- **Sin Paso de Compilación:** Cero Webpack, Vite, Babel o transpildor. Todo el código fuente se ejecuta de forma nativa en el navegador.

## Technical Constraints & Guardrails
1. **Orden Estricto de Carga de Scripts:** 32 etiquetas `<script>` en `index.html` cargadas en ámbito global (no módulos ES en navegador):
   - `Vendor` ➔ `Core (crypto, roles, store, utils, icons, demoData)` ➔ `UI` ➔ `Modals` ➔ `Topology` ➔ `Orchestrator (fileManager, modals)` ➔ `Init (main.js)`.
2. **Cascada de Estilos CSS (`css/style.css`):** Cadena estricta: `variables.css` ➔ `layout.css` ➔ `panels.css` ➔ `rack.css` ➔ `faceplates.css` ➔ `modals.css` ➔ `misc.css`.
3. **Compatibilidad Local Offline `file:///`:** Todo el código y los test runners (`tests/index.html`) deben operar sin depender de llamadas `fetch()` que dispararían bloqueos de seguridad por directivas CORS en esquemas locales.
4. **Optimización de Historial y Memoria RAM (M-03):** Pipeline de clonado con `fastClone(obj)` (4x más rápido que JSON), límite estricto de 15 instantáneas (`store.maxHistory = 15`), snapshots livianos sin `topologySlots` y deduplicación $O(1)$ con `_mutatedSinceLastSnapshot`.
5. **Redibujado Granular y Rendimiento a 60 FPS (M-04):** Despacho reactivo de interfaz mediante coalescencia rAF, renderizado selectivo de gabinetes individuales con `renderSingleRack(rackId)` y banderas de estado sucio para pestañas inactivas.
