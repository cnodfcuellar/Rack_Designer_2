# Technical Context

## Core Technologies
- **Frontend:** HTML5, Vanilla JavaScript (ES6+), CSS3.
- **Data Persistence:** Browser `localStorage` (limit ~5MB) and `sessionStorage` (for Auth).
- **Security & Crypto:** Web Crypto API + pure JS fallback for AES-GCM 256-bit symmetric encryption (`js/auth/crypto.js`) and SHA-256 RBAC (`js/auth/roles.js`).
- **Package Manager:** `pnpm` exclusively (no `npm` or `yarn`).
- **External Dependencies:** `marked` (for markdown parsing), `xlsx` (vendor script), `mobile-drag-drop` (vendor script), `html2canvas` (vendor script).

## Development Setup
- **Server:** Any basic static server (VS Code Live Server, `npx serve`, `python -m http.server`).
- **Build Step:** NONE. No Webpack, no Vite, no transpilation.

## Technical Constraints
1. **Script Load Order:** Extremely critical. `crypto.js` and `roles.js` must load before `store.js`. `store.js` must load before UI components. `main.js` must load last.
2. **Storage Quotas:** Heavy use of `JSON.stringify` on large datacenter objects can rapidly exhaust `localStorage` (~5MB limit).
3. **Memory Limits & Historial (Resuelto con M-03):** Mitigado mediante `fastClone(obj)` en `utils.js`, snapshots livianos sin `topologySlots` y límite de 15 instantáneas (`store.maxHistory = 15`).
4. **Protocolo Local `file:///`:** Todo el código del cliente y runners de prueba (`tests/index.html`) debe operar 100% offline sin depender de llamadas `fetch()` que serían bloqueadas por directivas de seguridad CORS en esquemas locales.
5. **CSS Cascading:** CSS import chain must strictly adhere to the defined hierarchy in `style.css`.
