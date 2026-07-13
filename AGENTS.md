# AGENTS.md — RACK Designer Next

## Project Type
PWA, 100% Vanilla JavaScript (ES6+), HTML5, CSS3. **No build step.** No React/Vue/Angular. No Webpack/Vite.

## How to Run
Open `index.html` via Live Server or any static HTTP server. That's it. No `npm start`, no dev server.

## Package Manager
**pnpm only.** Never use `npm` or `yarn`. The only dependency is `marked` (for build scripts).

## Architecture: Reactive Proxy Pattern
- **`js/store.js`** = the brain. All state lives in `store.state` (Proxy ES6).
- **NEVER mutate DOM to reflect data changes.** Always update `store.state`, then let the Proxy trigger re-renders.
- Proxy auto-saves to `localStorage` (key: `RACK_DESIGNER_NEXT_STATE`) and emits `'change'` events.
- `js/main.js` listens to `'change'` and calls `renderAll()` to redraw UI.

## Script Loading
All JS loaded via `<script>` tags in `index.html` (lines ~540-579). **Not ES modules in browser** despite `"type": "module"` in package.json. Global scope. If you add a new JS file, add a `<script>` tag in `index.html`.

## Key Directories
- `js/store.js` — State + persistence (Proxy)
- `js/main.js` — Orchestrator, event binding, init
- `js/ui/` — View layer (DOM rendering)
- `js/ui/topology/` — Canvas 2D topology engine (5 files, MVC-ish)
- `js/ui/modals/` — Individual modal components
- `js/auth/roles.js` — RBAC with SHA-256 (exposed as `window.RackAuth`)
- `css/` — Modular CSS (variables, layout, components)
- `.agents/` — AI agent profiles and design rules (DESIGN.md, INSTRUCTIONS.md)
- `.py/` — Python utility scripts
- `doc/` — Documentation (md, svg diagrams, changelog)

## Auth System
- Default admin PIN: `rack2024`
- 3 roles: Admin (full), Editor (no PIN change), Viewer (read-only)
- Session stored in `sessionStorage` (volatile, cleared on tab close)
- `RackAuth.can('action')` checks permissions

## Critical Conventions

### Data Flow
1. User action → UI handler calls `store.addDeviceToRack()` (or similar)
2. Store mutates `this._raw`, saves to localStorage, emits `'change'`
3. `main.js` receives event, calls `renderAll()` which redraws affected views

### Do NOT
- Import JS files as ES modules in the browser (they're loaded as classic scripts)
- Use `npm` — only `pnpm`
- Commit without user permission (wait for explicit "commit"/"backup" request)
- Modify DOM directly to update data (go through store)
- Touch `node_modules/` or `pnpm-lock.yaml` unless changing dependencies

### DO
- Update `doc/log/CHANGELOG.md` immediately after any code change
- Keep Python scripts in `.py/` folder
- Keep agent/design files in `.agents/` folder
- Use `store.snapshot()` before batch mutations (enables undo/redo)

## Service Worker
Root `service-worker.js` is the one registered (not `js/service/service-worker.js`). Cache name: `rack-designer-next-cache-v1`.

## Testing
No working tests. `tests/Rack.test.js` is fully commented out. No test framework configured.
