# System Patterns

## Architecture: Reactive Proxy Pattern
The application emulates a modern React/Redux reactive architecture using native ES6 `Proxy`:
1. **User Action:** UI event handler is triggered.
2. **Store Mutator:** Handler calls a method on `store` (e.g., `store.addDeviceToRack()`).
3. **Snapshot:** The store calls `snapshot()` to deepClone state for Undo/Redo tracking.
4. **Proxy Interception:** Mutation on `this._raw` is intercepted by the Proxy `set` trap.
5. **Persistence & Emission:** The Proxy automatically saves to `localStorage` and emits a `'change'` event.
6. **Re-render:** `main.js` catches the `'change'` event and selectively triggers `renderAll({ source })`.

## Component Relationships
- `js/store.js`: The absolute source of truth. Handles state, persistence, and events.
- `js/main.js`: Orchestrator. Binds global events and triggers layout re-renders.
- `js/ui/`: View layer modules. Must never mutate data directly. Only read from `store.state` and render to DOM.
- `js/ui/topology/`: Specialized Canvas 2D engine operating as an MVC subset.

## Design Patterns
- **No ES Modules in Browser:** Scripts are loaded sequentially in the global scope via `<script>` tags in `index.html`.
- **Modular CSS:** Cascading architecture where later files override earlier ones (`variables.css` -> `layout.css` -> `components.css`).
- **RBAC (Role Based Access Control):** Managed globally via `window.RackAuth`.
