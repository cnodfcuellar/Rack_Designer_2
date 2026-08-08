# Technical Context

## Core Technologies
- **Frontend:** HTML5, Vanilla JavaScript (ES6+), CSS3.
- **Data Persistence:** Browser `localStorage` (limit ~5MB) and `sessionStorage` (for Auth).
- **Package Manager:** `pnpm` exclusively (no `npm` or `yarn`).
- **External Dependencies:** `marked` (for markdown parsing), `xlsx` (vendor script), `mobile-drag-drop` (vendor script).

## Development Setup
- **Server:** Any basic static server (VS Code Live Server, `npx serve`, `python -m http.server`).
- **Build Step:** NONE. No Webpack, no Vite, no transpilation.

## Technical Constraints
1. **Script Load Order:** Extremely critical. `store.js` must load before UI components. `main.js` must load last.
2. **Storage Quotas:** Heavy use of `JSON.stringify` on large datacenter objects can rapidly exhaust `localStorage`.
3. **Memory Limits:** The `deepClone` implementation for Undo/Redo is memory-intensive for large topologies.
4. **CSS Cascading:** CSS import chain must strictly adhere to the defined hierarchy in `style.css`.
