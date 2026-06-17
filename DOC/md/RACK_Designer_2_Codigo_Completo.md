# RACK Designer 2 — Código Fuente Completo

> Proyecto: Diseñador visual de datacenter con vista física, topología de red, catálogo de equipos e inventario exportable.

---

## Estructura del Proyecto

```
Rack_Designer_2/
├── index.html
├── package.json
├── service-worker.js               ← relay raíz del SW
├── css/
│   ├── style.css                   ← entry point CSS
│   ├── variables.css
│   ├── layout.css
│   └── components/
│       ├── panels.css
│       ├── rack.css
│       ├── faceplates.css
│       ├── modals.css
│       └── misc.css
├── js/
│   ├── utils.js
│   ├── store.js
│   ├── demoData.js
│   ├── main.js
│   ├── service/
│   │   └── service-worker.js
│   └── ui/
│       ├── catalog.js
│       ├── faceplates.js
│       ├── rack.js
│       ├── tables.js
│       ├── topology.js             ← stub
│       ├── modals.js               ← orquestador
│       ├── modals/
│       │   ├── Globals.js
│       │   ├── RackModal.js
│       │   ├── DeviceModal.js
│       │   ├── CableModal.js
│       │   ├── RoomModal.js
│       │   ├── ExportModal.js
│       │   └── PlacementModal.js
│       └── topology/
│           ├── TopologyState.js
│           ├── TopologyEvents.js
│           ├── TopologyLayout.js
│           ├── TopologyRenderer.js
│           └── TopologyOrchestrator.js
└── json/
    └── manifest.json
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>⚡ RACK Designer — Consola del Datacenter</title>
<meta name="description" content="Diseña, documenta y gestiona tu datacenter de forma visual con RACK Designer.">
<meta name="theme-color" content="#0ea5e9">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="RACK Designer">
<link rel="manifest" href="json/manifest.json">
<link rel="apple-touch-icon" href="icons/icon-512x512.png">
<link rel="icon" type="image/svg+xml" href="icons/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<script>
  if (localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
  }
</script>
</head>
<body>

<!-- ============================
     HTML SKELETON
============================= -->
<div id="app">
  <!-- MOBILE OVERLAY -->
  <div id="mobile-overlay" class="hidden"></div>

  <!-- HEADER -->
  <header id="header">
    <div class="header-logo-area">
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="mobile-menu-btn" class="menu-btn" style="display: none;">☰</button>
        <div class="logo">
          <img src="icons/icon.svg" class="logo-icon" alt="Logo" style="height: 24px; width: 24px; object-fit: contain;">
          <div>
            RACK Designer
            <span class="logo-sub">DATACENTER CONSOLE</span>
          </div>
        </div>
      </div>
      <div class="project-menu-wrap">
        <button class="menu-btn" id="btn-project-menu">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
        </button>
        <div class="dropdown-menu hidden" id="project-dropdown">
          <div class="dropdown-item" id="menu-open">📂 Abrir proyecto</div>
          <div class="dropdown-item" id="menu-save">💾 Guardar proyecto</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" id="menu-clear" style="color: var(--red);">🧹 Limpiar proyecto</div>
          <div class="dropdown-item" id="menu-demo">✨ Cargar demos</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" id="menu-theme">☀️ Cambiar a Modo Claro</div>
          <div class="dropdown-item" id="menu-toggle-passwords">👁 Modo Dios: Revelar Claves</div>
          <div class="dropdown-item" id="menu-export-cat">📤 Exportar catálogo</div>
          <div class="dropdown-item" id="menu-import-cat">📥 Importar catálogo</div>
        </div>
      </div>
    </div>
    <div class="header-main-area">
      
      <div class="view-tabs" style="margin-left: 24px;">
        <button class="view-tab active" data-view="physical">⬛ Vista Física</button>
        <button class="view-tab" data-view="topology">◎ Topología</button>
      </div>

      <div class="spacer"></div>
      <div class="h-search">
        <input type="text" id="global-search" placeholder="Buscar equipo, IP, MAC…">
      </div>
      <div class="h-btn-group">
        <button class="h-btn tooltip tooltip-bottom" id="btn-undo" data-tip="Deshacer (Ctrl+Z)" disabled>↩</button>
        <button class="h-btn tooltip tooltip-bottom" id="btn-redo" data-tip="Rehacer (Ctrl+Y)" disabled>↪</button>
      </div>
      <div class="status-dot tooltip" data-tip="Sistema operativo"></div>
      <input type="file" id="file-import" accept=".json" style="display:none">
    </div>
  </header>

  <!-- SIDEBAR -->
  <aside id="sidebar">
    <div class="sb-title" style="display:flex; padding-right:8px;">
      <div id="toggle-stats" style="flex:1; display:flex; justify-content:space-between; align-items:center;">
        <span>ESTADÍSTICAS</span>
        <span id="stats-chevron">▼</span>
      </div>
      <button id="btn-close-sidebar" class="mobile-only" style="background:none; border:none; color:var(--text-secondary); font-size:16px; margin-left:12px; cursor:pointer;" title="Cerrar panel">✕</button>
    </div>
    <div class="sb-header" id="stats-container">
      <div class="sb-stats" id="sidebar-stats">
        <div class="stat-pill tooltip tooltip-bottom" data-tip="Gabinetes">
          <div class="stat-icon-wrap" style="color: #38bdf8; background: rgba(56, 189, 248, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
          </div>
          <div class="value green" id="stat-racks">0</div>
        </div>
        <div class="stat-pill tooltip tooltip-bottom" data-tip="Equipos">
          <div class="stat-icon-wrap" style="color: #f43f5e; background: rgba(244, 63, 94, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="6" rx="1"></rect><rect x="2" y="14" width="20" height="6" rx="1"></rect><line x1="6" y1="7" x2="6" y2="7"></line><line x1="6" y1="17" x2="6" y2="17"></line></svg>
          </div>
          <div class="value" id="stat-devices" style="color: #fff;">0</div>
        </div>
        <div class="stat-pill tooltip tooltip-bottom" data-tip="Unidades U">
          <div class="stat-icon-wrap" style="color: #f59e0b; background: rgba(245, 158, 11, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a6 6 0 1 0 12 0V4"></path></svg>
          </div>
          <div class="value amber" id="stat-units">0/0</div>
        </div>
        <div class="stat-pill tooltip tooltip-bottom" data-tip="Conexiones">
          <div class="stat-icon-wrap" style="color: #22c55e; background: rgba(34, 197, 94, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M12 8v4"></path><path d="M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path></svg>
          </div>
          <div class="value" id="stat-connections" style="color: #fff;">0</div>
        </div>
      </div>
      <div class="cap-bar-wrap">
        <div class="cap-bar-labels"><span>RACK CAPACITY</span><span id="cap-rack-pct">0%</span></div>
        <div class="cap-bar"><div class="cap-bar-fill rack" id="cap-rack-bar" style="width:0%"></div></div>
      </div>
      <div class="cap-bar-wrap">
        <div class="cap-bar-labels"><span>POWER</span><span id="cap-power-val">0 W</span></div>
        <div class="cap-bar"><div class="cap-bar-fill power" id="cap-power-bar" style="width:0%"></div></div>
      </div>
    </div>
    <div class="sb-actions" style="border-top: 1px solid var(--border);">
      <button class="btn-primary" id="btn-add-rack">+ Rack</button>
      <button class="btn-secondary" id="btn-add-device-modal">+ Equipo</button>
    </div>
    <div class="sb-search">
      <input type="text" id="catalog-search" placeholder="Buscar por nombre o tipo…">
    </div>
    <div class="sb-filter-tabs">
      <button class="filter-tab active" data-filter="all">Todos</button>
      <button class="filter-tab" data-filter="server">Servers</button>
      <button class="filter-tab" data-filter="switch">Red</button>
      <button class="filter-tab" data-filter="storage">Storage</button>
      <button class="filter-tab" data-filter="floor">Piso</button>
    </div>
    <div class="catalog" id="catalog"></div>
  </aside>

  <!-- MAIN AREA -->
  <main id="main">
    <div class="main-toolbar">
      <button class="h-btn" id="btn-zoom-out">-</button>
      <span class="zoom-label" id="zoom-level">100%</span>
      <button class="h-btn" id="btn-zoom-in">+</button>
      <button class="h-btn" id="btn-zoom-reset">⊙ 1:1</button>
      <div class="h-divider"></div>
      
      <div class="room-tabs" id="room-tabs"></div>
      <button class="room-tab-add" id="btn-add-room" title="Nueva sala">+</button>

      <div class="spacer"></div>
      
      <button class="h-btn" id="btn-export-png">📸 PNG</button>
      <button class="h-btn" id="btn-expand-main">⛶ Expandir</button>
    </div>
    <div id="view-physical"></div>
    <canvas id="topology-canvas"></canvas>
    <div id="view-topology" class="hidden"></div>
  </main>

  <!-- BOTTOM PANEL -->
  <div id="bottom">
    <div class="bottom-header">
      <div class="tab-pills">
        <button class="tab-pill active" data-tab="inventory">Inventario</button>
        <button class="tab-pill" data-tab="connections">Conexiones</button>
      </div>
      <div class="spacer"></div>
      <button class="btn-primary" id="table-btn-add-device" style="margin-right:8px; display:none;">+ Equipo</button>
      <button class="btn-primary" id="table-btn-add-placement" style="margin-right:8px; display:none; background:rgba(139, 92, 246, 0.15); border-color:var(--purple); color:var(--purple)">⚡ Agregar Equipo</button>
      <button class="btn-primary" id="table-btn-add-conn" style="margin-right:8px; display:none;">+ Conexión</button>
      <div class="h-search" style="margin-right:8px">
        <input type="text" id="table-search" placeholder="Filtrar tabla…" style="width:160px">
      </div>
      <button class="h-btn" id="btn-table-csv" style="margin-right:4px">⬇ CSV</button>
      <button class="h-btn" id="btn-table-excel" style="margin-right:8px">⬇ Excel</button>
      <button class="h-btn" id="btn-expand-bottom">⛶ Expandir</button>
      <button class="h-btn" id="btn-collapse-bottom">▼</button>
    </div>
    <div class="table-wrap" id="bottom-table-wrap"></div>
  </div>
</div>

<!-- DRAG GHOST -->
<div id="drag-ghost"></div>

<!-- NOTIFICATIONS -->
<div id="notif-area"></div>

<!-- CONTEXT MENU -->
<div id="ctx-menu" class="hidden"></div>

<!-- MODALS -->
<div class="modal-overlay hidden" id="modal-rack">
  <div class="modal">
    <div class="modal-title">🗄️ <span id="modal-rack-title">Nuevo Gabinete</span></div>
    <div class="modal-sub">Configura las propiedades del gabinete físico</div>
    <div class="form-row"><label>Nombre del Gabinete</label><input type="text" id="rack-name" placeholder="Rack A1 — Producción"></div>
    <div class="form-grid">
      <div class="form-row"><label>Altura (U)</label><input type="number" id="rack-height" value="24" min="4" max="48"></div>
      <div class="form-row"><label>Color</label>
        <div class="color-input-wrap">
          <input type="color" id="rack-color-picker" value="#0ea5e9">
          <input type="text" id="rack-color" value="#0ea5e9" maxlength="7">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" id="modal-rack-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-rack-save">Guardar</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="modal-device">
  <div class="modal">
    <div class="modal-title">🖥️ <span id="modal-device-title">Editar Equipo</span></div>
    <div class="modal-sub" id="modal-device-sub">Datos técnicos del equipo</div>
    <div class="form-row"><label>Nombre del Equipo</label><input type="text" id="dev-name" placeholder="Server principal"></div>
    <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr;">
      <div class="form-row"><label>Marca</label><input type="text" id="dev-brand" placeholder="HP, Cisco, Dell..."></div>
      <div class="form-row"><label>Modelo</label><input type="text" id="dev-model" placeholder="ProLiant DL380"></div>
      <div class="form-row"><label>Número de Serie</label><input type="text" id="dev-serial" placeholder="SRV-2024-001"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Ubicación Física</label>
        <select id="dev-category">
          <option value="rack">🗄️ Gabinete (Rack)</option>
          <option value="floor">🏢 Equipo de Piso</option>
        </select>
      </div>
      <div class="form-row"><label>Tipo de Equipo</label>
        <select id="dev-type">
          <optgroup label="── Equipos en Rack ──" id="opt-rack">
            <option value="server">🖥 Servidor</option>
            <option value="switch">🔀 Switch</option>
            <option value="router">🌐 Router</option>
            <option value="firewall">🔥 Firewall</option>
            <option value="ups">🔋 UPS</option>
            <option value="storage">💾 Storage</option>
          </optgroup>
          <optgroup label="── Equipos de Piso ──" id="opt-floor" style="display: none;">
            <option value="pc">💻 PC / Workstation</option>
            <option value="camera">📷 Cámara IP</option>
            <option value="ap">📶 Access Point</option>
            <option value="door">🚪 Ctrl de Puerta</option>
            <option value="printer">🖨️ Impresora</option>
            <option value="phone">📞 Teléfono VoIP</option>
          </optgroup>
        </select>
      </div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:12px;">
      <div style="width:24px; padding-bottom:8px; display:flex; justify-content:center;">
        <input type="checkbox" id="dev-has-net" title="Habilitar Red" style="width:16px; height:16px; cursor:pointer;" checked>
      </div>
      <div class="form-row" style="flex:1; margin-bottom:0;"><label>Dirección IP</label><input type="text" id="dev-ip" placeholder="192.168.1.10"></div>
      <div class="form-row" style="flex:1; margin-bottom:0;"><label>Dirección MAC</label><input type="text" id="dev-mac" placeholder="AA:BB:CC:DD:EE:FF"></div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:12px;">
      <div style="width:24px; padding-bottom:8px; display:flex; justify-content:center;">
        <input type="checkbox" id="dev-has-auth" title="Habilitar Credenciales" style="width:16px; height:16px; cursor:pointer;" checked>
      </div>
      <div class="form-row" style="flex:1; margin-bottom:0;"><label>Usuario</label><input type="text" id="dev-user" placeholder="admin"></div>
      <div class="form-row" style="flex:1; margin-bottom:0;"><label>Contraseña</label><input type="password" id="dev-pass" placeholder="••••••••"></div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:12px;">
      <div style="width:24px; padding-bottom:8px; display:flex; justify-content:center;">
        <input type="checkbox" id="dev-has-power" title="Habilitar Energía" style="width:16px; height:16px; cursor:pointer;" checked>
      </div>
      <div class="form-row" style="width:140px; margin-bottom:0;">
        <label>Tomas Eléctricas</label>
        <div style="display:flex; gap:8px;">
          <input type="number" id="dev-plugs" value="1" min="0" max="10" title="Tomas de entrada (alimentación)" style="flex:1;">
          <input type="number" id="dev-plugs-out" value="0" min="0" max="48" title="Tomas de salida (provee energía)" style="flex:1;">
        </div>
      </div>
      <div class="form-row" style="width:100px; margin-bottom:0;">
        <label>Consumo (W)</label>
        <input type="number" id="dev-power" value="200" min="0">
      </div>
      <div style="flex:1;"></div>
      <div class="form-row" id="dev-size-row" style="width:100px; margin-bottom:0;">
        <label>Tamaño (U)</label>
        <select id="dev-size">
          <option value="1">1U</option><option value="2" selected>2U</option>
          <option value="4">4U</option><option value="8">8U</option>
        </select>
      </div>
    </div>
    <div class="form-row"><label>Notas</label><textarea id="dev-notes" rows="2" placeholder="Observaciones técnicas…" style="resize:vertical"></textarea></div>
    <div class="modal-footer">
      <button class="btn-cancel" id="modal-device-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-device-save">Guardar</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="modal-room">
  <div class="modal">
    <div class="modal-title">🏢 Nueva Sala</div>
    <div class="modal-sub">Agregar una sala al centro de datos</div>
    <div class="form-row"><label>Nombre de la Sala</label><input type="text" id="room-name" placeholder="Sala A — Centro de Datos Principal"></div>
    <div class="modal-footer">
      <button class="btn-cancel" id="modal-room-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-room-save">Crear Sala</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="modal-cable">
  <div class="modal">
    <div class="modal-title">🔌 <span id="modal-cable-title">Conectar Equipos</span></div>
    <div class="modal-sub">Conectar puertos entre equipos</div>
    <div class="form-grid">
      <div class="form-row"><label>Equipo Origen</label>
        <select id="cable-src-dev"></select>
      </div>
      <div class="form-row"><label>Puerto Origen</label>
        <input type="text" id="cable-src-port" placeholder="Eth0/1">
      </div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Equipo Destino</label>
        <select id="cable-dst-dev"></select>
      </div>
      <div class="form-row"><label>Puerto Destino</label>
        <input type="text" id="cable-dst-port" placeholder="Eth0/2">
      </div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Tipo de Cable</label>
        <select id="cable-type">
          <option value="Cobre">🟦 Cobre (Cat6/Cat6A)</option>
          <option value="Fibra SM">🔴 Fibra Monomodo</option>
          <option value="Fibra MM">🟡 Fibra Multimodo</option>
          <option value="DAC">🟢 DAC (Direct Attach)</option>
        </select>
      </div>
      <div class="form-row"><label>Color del Cable</label>
        <div class="color-input-wrap">
          <input type="color" id="cable-color-picker" value="#3b82f6">
          <input type="text" id="cable-color" value="#3b82f6">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" id="modal-cable-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-cable-save">Conectar</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="modal-export-png">
  <div class="modal">
    <div class="modal-title">📸 Exportar Rack a PNG</div>
    <div class="modal-sub">Selecciona el gabinete que deseas exportar</div>
    <div id="png-rack-list"></div>
    <div class="modal-footer">
      <button class="btn-cancel" id="modal-png-cancel">Cancelar</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="modal-quick-placement">
  <div class="modal" style="max-width: 450px;">
    <div class="modal-title">⚡ <span id="qp-modal-title">Ubicación Rápida</span></div>
    <div class="modal-sub" id="qp-modal-sub">Ubicar de forma asistida sin arrastrar</div>
    
    <div class="form-row" id="qp-dev-display-row">
      <label>Equipo a instalar</label>
      <input type="text" id="qp-dev-name-display" disabled style="background:var(--bg-card2); opacity:0.8; font-weight:600; color:var(--accent);">
    </div>
    
    <div class="form-row" id="qp-dev-select-row" style="display:none;">
      <label>Seleccionar Equipo del Catálogo</label>
      <select id="qp-dev-select" style="width:100%;"></select>
    </div>
    
    <div class="form-row">
      <label>1. Seleccionar Sala</label>
      <select id="qp-room" style="width:100%;"></select>
    </div>
    
    <div class="form-row" id="qp-rack-row">
      <label>2. Seleccionar Gabinete</label>
      <select id="qp-rack" style="width:100%;"></select>
    </div>
    
    <div class="form-row" id="qp-slot-row">
      <label>3. Seleccionar Ranura (Slot U)</label>
      <select id="qp-slot" style="width:100%;"></select>
    </div>
    
    <div class="form-row" id="qp-side-row">
      <label>4. Lado de Montaje</label>
      <select id="qp-side" style="width:100%;">
        <option value="front" selected>Frontal</option>
        <option value="rear">Trasera</option>
      </select>
    </div>
    
    <div class="modal-footer" style="margin-top:20px;">
      <button class="btn-cancel" id="modal-qp-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-qp-save">Instalar Equipo</button>
    </div>
  </div>
</div>

  <div id="device-tooltip"></div>
  <input type="file" id="import-file" accept=".rack,.json" class="hidden" style="display:none !important;">
  
  <link rel="stylesheet" href="css/mobile-drag-drop.css">
  <script src="js/mobile-drag-drop.min.js"></script>
  <script src="js/mobile-drag-drop-scroll.min.js"></script>
  <script>
    MobileDragDrop.polyfill({
        dragImageTranslateOverride: MobileDragDrop.scrollBehaviourDragImageTranslateOverride
    });
  </script>

  <script src="js/xlsx.full.min.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/store.js"></script>
  <script src="js/ui/catalog.js"></script>
  <script src="js/ui/faceplates.js"></script>
  <script src="js/ui/modals/Globals.js"></script>
  <script src="js/ui/modals/RackModal.js"></script>
  <script src="js/ui/modals/DeviceModal.js"></script>
  <script src="js/ui/modals/CableModal.js"></script>
  <script src="js/ui/modals/RoomModal.js"></script>
  <script src="js/ui/modals/ExportModal.js"></script>
  <script src="js/ui/modals/PlacementModal.js"></script>
  <script src="js/ui/modals.js"></script>
  <script src="js/ui/rack.js"></script>
  <script src="js/ui/topology/TopologyState.js"></script>
  <script src="js/ui/topology/TopologyEvents.js"></script>
  <script src="js/ui/topology/TopologyLayout.js"></script>
  <script src="js/ui/topology/TopologyRenderer.js"></script>
  <script src="js/ui/topology/TopologyOrchestrator.js"></script>
  <script src="js/ui/topology.js"></script>
  <script src="js/ui/tables.js"></script>
  <script src="js/main.js"></script>

<!-- ============================
     PWA — Service Worker Registration
============================= -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((reg) => console.log('[PWA] Service Worker registrado:', reg.scope))
        .catch((err) => console.warn('[PWA] Error al registrar SW:', err));
    });
  }
</script>
</body>
</html>
```

---

## `package.json`

```json
{
  "name": "Rack_Designer_2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": "^11.5.2",
      "onFail": "download"
    }
  },
  "type": "module"
}
```

---

## CSS

### `css/style.css`

```css
@import "variables.css";
@import "layout.css";
@import "components/panels.css";
@import "components/rack.css";
@import "components/faceplates.css";
@import "components/modals.css";
@import "components/misc.css";
```

---

### `css/variables.css`

```css
/* ============================================================
   VARIABLES & RESET
============================================================ */
:root {
  --bg-main:      #0b0f19;
  --bg-panel:     #111827cc;
  --bg-card:      #151c2e;
  --bg-card1:     #171f30;
  --bg-card2:     #1a2235;
  --border:       #25304b;
  --border-light: #2e3d5a;
  --text-primary: #f0f4ff;
  --text-secondary:#8b9ab8;
  --text-muted:   #8496b0;
  --accent:       #0ea5e9;
  --accent-glow:  #0ea5e933;
  --green:        #10b981;
  --green-glow:   #10b98133;
  --amber:        #f59e0b;
  --amber-glow:   #f59e0b33;
  --red:          #ef4444;
  --red-glow:     #ef444433;
  --purple:       #8b5cf6;
  --cyan:         #06b6d4;
}
[data-theme="light"] {
  --bg-main:      #f0f4f8;
  --bg-panel:     #ffffffcc;
  --bg-card:      #ffffff;
  --bg-card1:     #f8fafc;
  --bg-card2:     #f1f5f9;
  --border:       #e2e8f0;
  --border-light: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary:#334155;
  --text-muted:   #64748b;
  --accent:       #0284c7;
  --accent-glow:  #e0f2fe;
}
:root {
  --sidebar-w:    280px;
  --header-h:     56px;
  --bottom-h:     220px;
  --rack-unit-h:  24px;
  --font-ui:      'Outfit', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-display: 'Outfit', sans-serif;
  --text-xs:      10px;
  --text-sm:      11px;
  --text-base:    12px;
  --text-md:      13px;
  --text-lg:      14px;
  --text-xl:      16px;
  --radius:       6px;
  --radius-lg:    10px;
  --shadow:       0 4px 24px #00000066;
  --shadow-glow:  0 0 20px var(--accent-glow);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%;  background: var(--bg-main); color: var(--text-primary); font-family: var(--font-ui); font-size: var(--text-base); }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg-card); }
::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }

.header-main-area::-webkit-scrollbar,
.main-toolbar::-webkit-scrollbar,
.bottom-header::-webkit-scrollbar,
.room-tabs::-webkit-scrollbar {
  display: none;
}
.header-main-area, .main-toolbar, .bottom-header, .room-tabs {
  scrollbar-width: none;
}

::selection { background: var(--accent-glow); }
```

---

### `css/layout.css`

```css
/* ============================================================
   LAYOUT
============================================================ */
#app { display: grid; grid-template-rows: var(--header-h) 1fr auto; grid-template-columns: var(--sidebar-w) 1fr; height: 100vh; overflow: hidden; }
#header    { grid-column: 1/-1; grid-row: 1; display: flex; align-items: center; padding: 0; background: var(--bg-card); border-bottom: 1px solid var(--border); z-index: 100; }
#sidebar   { grid-column: 1; grid-row: 2; background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
#main      { grid-column: 2; grid-row: 2; overflow: hidden; position: relative; background: var(--bg-main); }
#bottom { grid-column: 1/-1; grid-row: 3; background: var(--bg-card); border-top: 1px solid var(--border); display: flex; flex-direction: column; transition: opacity 0.2s ease, transform 0.2s ease; height: var(--bottom-h); overflow: hidden; }
#bottom.collapsed { height: 38px !important; }

#main::before { content:''; position:absolute; inset:0; background-image: radial-gradient(circle, #1e2d4a 1px, transparent 1px); background-size: 28px 28px; opacity: 0.4; pointer-events: none; z-index: 0; }

/* HEADER */
.header-logo-area { width: var(--sidebar-w); height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-right: 1px solid var(--border); flex-shrink: 0; }
.header-main-area { flex: 1; height: 100%; display: flex; align-items: center; padding: 0 16px; gap: 12px; min-width: 0; }
.logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: var(--text-md); font-weight: 700; color: var(--accent); white-space: nowrap; }
.logo-icon { font-size: var(--text-xl); filter: drop-shadow(0 0 8px var(--accent)); }
.logo-sub { font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); font-weight: 400; display: block; margin-top: -4px; }
.project-menu-wrap { position: relative; }
.menu-btn { background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); transition: all 0.2s; padding: 8px; }
.menu-btn:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }
.menu-btn svg { width: 100%; height: 100%; }
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 10px; width: 220px; background: var(--bg-panel); backdrop-filter: blur(16px) saturate(180%); border: 1px solid var(--border-light); border-radius: var(--radius-lg); box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5); z-index: 1000; display: flex; flex-direction: column; padding: 6px 0; }
.dropdown-menu.hidden { display: none; }
.dropdown-item { padding: 10px 16px; font-family: var(--font-ui); font-size: var(--text-base); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
.dropdown-item:hover { background: var(--accent-glow); color: var(--text-primary); border-left: 2px solid var(--accent); padding-left: 14px; }
.dropdown-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 6px 0; }
.h-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
.room-tabs { display: flex; gap: 6px; overflow-x: auto; min-width: 0; padding-bottom: 0; align-items: center; }
.room-tab { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card2); color: var(--text-secondary); font-family: var(--font-ui); font-size: var(--text-sm); cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.room-tab:hover { border-color: var(--accent); color: var(--text-primary); }
.room-tab.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.room-tab .close-btn { font-size: var(--text-xs); transition: opacity 0.2s; }
@media (hover: hover) {
  .room-tab .close-btn { opacity: 0; }
  .room-tab:hover .close-btn { opacity: 1; }
}
@media (hover: none) {
  .room-tab .close-btn { opacity: 1; margin-left: 6px; }
}
.room-tab-add { padding: 5px 12px; border-radius: var(--radius); border: 1px dashed var(--border); background: transparent; color: var(--text-muted); cursor: pointer; font-size: var(--text-lg); transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.room-tab-add:hover { border-color: var(--green); color: var(--green); }
.h-search { position: relative; }
.h-search input { background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-sm); padding: 4px 10px 4px 30px; border-radius: var(--radius); width: 200px; outline: none; transition: all 0.2s; }
.h-search input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); width: 240px; }
.h-search::before { content: '⌕'; position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: var(--text-md); pointer-events: none; }
.h-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card2); color: var(--text-secondary); font-family: var(--font-ui); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.h-btn:hover { border-color: var(--accent); color: var(--text-primary); background: var(--accent-glow); }
.h-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.h-btn.danger:hover { border-color: var(--red); color: var(--red); background: var(--red-glow); }
.h-btn-group { display: flex; gap: 2px; }
.h-btn-group .h-btn { border-radius: 0; }
.h-btn-group .h-btn:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.h-btn-group .h-btn:last-child  { border-radius: 0 var(--radius) var(--radius) 0; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* SIDEBAR */
.sb-header { padding: 12px 14px 8px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
#stats-container.hidden { display: none !important; }
.sb-stats { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 10px; }
.stat-pill { flex: 1; background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 4px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default; }
.stat-pill:hover { border-color: var(--accent); }
.stat-icon-wrap { width: 32px; height: 32px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-wrap svg { width: 16px; height: 16px; }
.stat-pill .value { font-size: var(--text-md); font-weight: 700; color: var(--text-primary); font-family: var(--font-display); line-height: 1; text-align: center; }
.stat-pill .value.green { color: var(--green); }
.stat-pill .value.amber { color: var(--amber); }
.cap-bar-wrap { margin-bottom: 6px; }
.cap-bar-labels { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 3px; }
.cap-bar { height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; }
.cap-bar-fill { height: 100%; border-radius: 3px; transition: transform 0.5s ease; transform-origin: left; width: 100%; transform: scaleX(0); }
.cap-bar-fill.rack  { background: linear-gradient(90deg, var(--accent), var(--cyan)); }
.cap-bar-fill.power { background: linear-gradient(90deg, var(--green), var(--amber)); }
.sb-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid var(--border); }
.btn-primary { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--accent); background: var(--accent-glow); color: var(--accent); font-family: var(--font-ui); font-size: var(--text-sm); font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.btn-primary:hover { background: var(--accent); color: var(--bg-main); }
.btn-secondary { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-family: var(--font-ui); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.btn-secondary:hover { border-color: var(--green); color: var(--green); background: var(--green-glow); }
.sb-search { padding: 8px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.sb-search input { width: 100%; background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-sm); padding: 6px 10px; border-radius: var(--radius); outline: none; }
.sb-search input:focus { border-color: var(--accent); }
.sb-filter-tabs { display: flex; gap: 4px; padding: 8px 14px; flex-shrink: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.sb-filter-tabs::-webkit-scrollbar { display: none; }
.filter-tab { padding: 3px 9px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: var(--text-sm); cursor: pointer; transition: all 0.15s; font-family: var(--font-ui); flex-shrink: 0; }
.filter-tab:hover { border-color: var(--accent); color: var(--text-primary); }
.filter-tab.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.catalog { flex: 1; overflow-y: auto; padding: 6px 14px 14px; }
.catalog-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 6px; cursor: grab; transition: all 0.2s; user-select: none; }
.catalog-item:hover { border-color: var(--accent); background: var(--accent-glow); transform: translateX(2px); }
.catalog-item:active { cursor: grabbing; }
.catalog-item.dragging { opacity: 0.4; }
.cat-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: var(--text-md); flex-shrink: 0; }
.cat-info { flex: 1; min-width: 0; }
.cat-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cat-meta { font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); }
.cat-size { font-size: var(--text-xs); padding: 2px 6px; border-radius: 3px; background: var(--border); color: var(--text-secondary); font-family: var(--font-mono); font-weight: 700; flex-shrink: 0; }

/* MAIN CANVAS */
.main-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); z-index: 10; position: relative; flex-shrink: 0; }
.view-tabs { display: flex; background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.view-tab { padding: 5px 14px; font-size: var(--text-sm); cursor: pointer; color: var(--text-muted); transition: all 0.2s; border: none; background: transparent; font-family: var(--font-ui); display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.view-tab.active { background: var(--accent-glow); color: var(--accent); }
.zoom-label { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); min-width: 42px; text-align: center; }
.spacer { flex: 1; }

#view-physical { padding: 24px; overflow: auto; height: 100%; position: relative; z-index: 1; touch-action: none; }
#view-physical.hidden, #view-topology.hidden { display: none !important; }

#view-topology { position: absolute; inset: 0; z-index: 1; }
#topology-canvas { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
#topology-canvas:active { cursor: grabbing; }

/* MOBILE */
@media (max-width: 768px) {
  #mobile-menu-btn { display: flex !important; margin-right: 8px; }
  #app { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }
  #header { flex-direction: column; height: auto; align-items: stretch; overflow: visible; min-width: 0; }
  .header-logo-area { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 6px 12px; justify-content: flex-start; }
  .header-logo-area .project-menu-wrap { margin-left: auto; }
  .header-main-area { width: 100%; height: auto; flex: none; overflow-x: auto; padding: 6px 12px; flex-wrap: nowrap; gap: 8px; }
  .header-main-area .spacer { display: none; }
  .header-main-area > * { flex-shrink: 0; }
  .room-tabs { overflow-x: visible; }
  #mobile-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 9998; transition: opacity 0.3s ease; }
  #mobile-overlay.hidden { opacity: 0; pointer-events: none; }
  #sidebar { position: fixed; top: 0; left: -100%; width: 85%; max-width: 320px; height: 100vh; z-index: 9999; transition: left 0.3s ease; box-shadow: 10px 0 20px rgba(0,0,0,0.5); }
  #sidebar.open { left: 0; }
  #main { grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  #bottom { min-width: 0; }
  #bottom.fullscreen { height: 85vh !important; }
  .main-toolbar { width: 100%; overflow-x: auto; flex-wrap: nowrap; overflow-y: hidden; padding: 6px 12px; }
  .main-toolbar .spacer { display: none; }
  .main-toolbar > * { flex-shrink: 0; }
  .main-toolbar .room-tabs { min-width: max-content; overflow-x: visible; padding-bottom: 0; margin-bottom: 0; }
  .h-btn, .btn-primary, .btn-secondary, .view-tab { height: 32px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: var(--text-sm); }
  .view-tabs { flex-shrink: 0; }
  .table-container { overflow-x: auto; }
  table.data-table { min-width: 600px; }
  .bottom-header { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding: 6px 16px; }
  .bottom-header .spacer { display: none; }
  .bottom-header .h-btn, .bottom-header .btn-primary { white-space: nowrap; flex-shrink: 0; margin-right: 8px !important; }
  .tab-pills { flex-shrink: 0; margin-right: 8px; }
  .modal { min-width: 0; width: 92%; padding: 16px; margin: 0 auto; max-height: 90vh; overflow-y: auto; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
}

/* Micro-tipografía */
#view-physical .rail-unit { font-size: 7px; }
#view-physical .fp-server .lcd { font-size: 7px; }
#view-physical .fp-server .dev-name { font-size: 8px; }
#view-physical .ups-lcd-line { font-size: 8px; }
#view-physical .fp-firewall .fw-name { font-size: 9px; }
#view-physical .fp-firewall .fw-status { font-size: 8px; }

.bottom-header input { padding: 4px 10px 4px 30px; box-sizing: content-box; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card2); color: var(--text-primary); }

/* Normalización de alturas */
.btn-primary, .btn-secondary, .tab-pill, .h-btn, .room-tab, .view-tab, .filter-tab, .room-tab-add, .btn-cancel, .btn-confirm {
    height: 24px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}

input[type="text"], input[type="number"], input[type="password"], select, .h-search input, .bottom-header input {
    height: 24px !important;
    padding: 0 8px !important;
    line-height: 22px !important;
    box-sizing: border-box !important;
}
```

---

### `css/components/panels.css`

```css
/* ============================================================
   BOTTOM PANEL
============================================================ */
.bottom-header { display: flex; align-items: center; gap: 8px; padding: 0 14px; height: 38px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tab-pills { display: flex; gap: 2px; }
.tab-pill { padding: 5px 14px; border-radius: var(--radius); border: none; background: transparent; color: var(--text-muted); font-family: var(--font-ui); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.tab-pill.active { background: var(--accent-glow); color: var(--accent); }
.table-wrap { flex: 1; overflow: auto; }
body.no-animations *, body.no-animations *::before, body.no-animations *::after { animation: none !important; transition: none !important; }
table.data-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
table.data-table th { padding: 6px 12px; text-align: left; font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); background: var(--bg-card); position: sticky; top: 0; font-family: var(--font-mono); white-space: nowrap; }
table.data-table td { padding: 5px 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-family: var(--font-mono); vertical-align: middle; white-space: nowrap; }
table.data-table tr:hover td { background: var(--bg-card2); }
table.data-table td.editable { cursor: text; }
table.data-table td.editable:hover { color: var(--text-primary); }
table.data-table td input.cell-edit { background: var(--bg-card2); border: 1px solid var(--accent); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-sm); padding: 2px 6px; border-radius: 3px; outline: none; width: 100%; }
table.data-table td input.cell-edit.error { border-color: var(--red); box-shadow: 0 0 8px var(--red-glow); animation: shake 0.3s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
.type-badge { padding: 1px 6px; border-radius: 3px; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.5px; font-family: var(--font-mono); }
.type-badge.server   { background: #0ea5e922; color: var(--accent); }
.type-badge.switch   { background: #10b98122; color: var(--green); }
.type-badge.firewall { background: #ef444422; color: var(--red); }
.type-badge.router   { background: #f59e0b22; color: var(--amber); }
.type-badge.ups      { background: #8b5cf622; color: var(--purple); }
.type-badge.storage  { background: #06b6d422; color: var(--cyan); }
.tbl-action { padding: 2px 7px; border-radius: 3px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: var(--text-xs); cursor: pointer; transition: all 0.15s; font-family: var(--font-ui); }
.tbl-action:hover { border-color: var(--red); color: var(--red); }
.cable-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-sm); }
.empty-state .icon { font-size: 32px; margin-bottom: 8px; opacity: 0.4; }
```

---

### `css/components/rack.css`

```css
/* ============================================================
   RACK COMPONENT
============================================================ */
.rack-wrapper { flex-shrink: 0; display: flex; flex-direction: column; gap: 0; }
.rack-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; position: relative; }
.rack-card.drag-over { border-color: var(--accent); box-shadow: 0 0 20px var(--accent-glow); }
.rack-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card2); border-bottom: 1px solid var(--border); }
.rack-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); }
.rack-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rack-hdr-btns { display: flex; gap: 4px; }
.rack-btn { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); transition: all 0.15s; }
.rack-btn:hover { border-color: var(--accent); color: var(--accent); }
.rack-btn.del:hover { border-color: var(--red); color: var(--red); }
.rack-body { display: flex; background: var(--bg-card1); }
.rack-rail-left, .rack-rail-right { border-left: 1px solid var(--border); border-right: none; }
.rack-rail-right { border-left: 1px solid var(--border); border-right: none; }
.rail-unit { height: var(--rack-unit-h); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: var(--text-xs); color: #2e4060; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.rail-unit:nth-child(5n) { color: #3d5480; }
.rack-slots { flex: 1; position: relative; min-width: 200px; }
.rack-slot { height: var(--rack-unit-h); border-bottom: 1px solid var(--border); position: relative; transition: background 0.15s; flex-shrink: 0; }
.rack-slot.drop-highlight { background: var(--accent-glow) !important; }
.rack-slot.drop-invalid  { background: var(--red-glow) !important; }
.rack-slot.occupied { pointer-events: none; }

/* RACK FLIP */
.rack-wrapper { perspective: 1200px; }
.rack-flipper { position: relative; transform-style: preserve-3d; transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1); }
.rack-flipper.flipped { transform: rotateY(180deg); }
.rack-face, .rack-rear { backface-visibility: hidden; -webkit-backface-visibility: hidden; transition: opacity 0.3s; }
.rack-flipper .rack-face { pointer-events: auto; }
.rack-flipper.flipped .rack-face, .rack-flipper.flipped .rack-face * { pointer-events: none !important; }
.rack-flipper .rack-rear { pointer-events: none; }
.rack-flipper:not(.flipped) .rack-rear, .rack-flipper:not(.flipped) .rack-rear * { pointer-events: none !important; }
.rack-flipper.flipped .rack-rear { pointer-events: auto; }
.rack-face { position: relative; }
.rack-rear { position: absolute; top: 0; left: 0; right: 0; bottom: 0; transform: rotateY(180deg); }
.rack-rear-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card2); border-bottom: 1px solid var(--border); font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary); }
.rack-rear-header .rear-label { display: flex; align-items: center; gap: 6px; }
.rack-rear-header .rear-label::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 6px #ef4444; animation: blink-led 1.4s infinite; }
.rack-rear-slots { flex: 1; overflow-y: auto; padding: 4px 0; }
.rear-slot { display: flex; align-items: stretch; border-bottom: 1px solid #0e1e30; min-height: 24px; }
.rear-slot-unit { width: 20px; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary); background: var(--bg-card2); flex-shrink: 0; border-right: 1px solid var(--border); }
.rear-slot-body { flex: 1; display: flex; align-items: center; padding: 2px 6px; gap: 6px; background: var(--bg-card1); position: relative; border-bottom: 1px solid var(--border); }
.rear-slot-body.has-device { background: linear-gradient(90deg, var(--bg-panel), var(--bg-card1)); border-left: 2px solid var(--device-color, var(--border)); }
.rear-slot-body .rear-device-name { font-size: var(--text-xs); font-family: var(--font-mono); color: #4a8abf; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; flex-shrink: 0; }
.rear-ports { display: flex; flex-wrap: wrap; gap: 3px; flex: 1; align-items: center; }
.rear-port { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.rear-port-jack { width: 10px; height: 7px; border-radius: 2px; background: var(--bg-card2); border: 1px solid var(--border); position: relative; cursor: default; }
.rear-port-jack.active { background: #0a2040; border-color: var(--cable-color, #3b82f6); box-shadow: 0 0 4px var(--cable-color, #3b82f6); }
.rear-port-jack.active::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 4px; height: 3px; background: var(--cable-color, #3b82f6); border-radius: 1px; }
.rear-port-label { font-size: 6px; font-family: var(--font-mono); color: #1e3a5f; white-space: nowrap; max-width: 24px; overflow: hidden; text-overflow: clip; text-align: center; }
.rear-pdu { display: flex; align-items: center; gap: 2px; margin-left: auto; flex-shrink: 0; }
.rear-outlet { width: 10px; height: 10px; border-radius: 50%; background: var(--bg-card2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
.rear-outlet.used { background: #1a3050; border-color: #f59e0b; box-shadow: 0 0 3px #f59e0b66; }
.btn-flip-rack { padding: 2px 7px; font-size: var(--text-xs); border: 1px solid var(--border-light); border-radius: 4px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; font-family: var(--font-mono); letter-spacing: 0.5px; }
.btn-flip-rack:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
.btn-flip-rack.active { border-color: #ef4444; color: #ef4444; background: #ef444420; }
```

---

### `css/components/faceplates.css`

```css
/* ============================================================
   DEVICE FACEPLATES
============================================================ */
.device-faceplate { position: absolute; left: 0; right: 0; z-index: 2; overflow: hidden; border-radius: 2px; cursor: pointer; transition: box-shadow 0.2s; pointer-events: auto; }
.device-faceplate:hover { z-index: 3; }
.device-faceplate.search-match { box-shadow: 0 0 0 2px var(--accent), 0 0 20px var(--accent-glow) !important; z-index: 4; }
.device-faceplate.search-dim { opacity: 0.2 !important; }

/* Server */
.fp-server { background: linear-gradient(180deg, #1e2840 0%, #141c2e 100%); border: 1px solid #2a3652; display: flex; align-items: center; gap: 0; height: 100%; }
.fp-server .vent { width: 28px; height: 100%; background: repeating-linear-gradient(0deg, transparent, transparent 2px, #0a0f1a 2px, #0a0f1a 3px); border-right: 1px solid #1a2236; flex-shrink: 0; }
.fp-server .ear { width: 12px; background: linear-gradient(90deg, #1a2235, #222d45); border-right: 1px solid #2a3652; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
.fp-server .ear::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #c0c8d8; box-shadow: 0 0 3px #ffffff55; }
.fp-server .fp-mid { flex: 1; padding: 2px 6px; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 1px; }
.fp-server .lcd { background: #000b00; border: 1px solid #1a3020; border-radius: 2px; padding: 1px 4px; font-family: var(--font-mono); font-size: var(--text-xs); color: #00ff88; text-shadow: 0 0 4px #00ff88; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-server .dev-name { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-server .fp-right { display: flex; align-items: center; gap: 4px; padding-right: 8px; flex-shrink: 0; }
.power-btn { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a3a25; background: radial-gradient(circle at 40% 40%, #1aff88, #0d6632); box-shadow: 0 0 6px #00ff8888; flex-shrink: 0; }
.power-btn.off { background: radial-gradient(circle at 40% 40%, #ff4444, #8b0000); box-shadow: 0 0 6px #ff444488; border-color: #3a1a1a; }
.fp-server .ear-r { width: 12px; background: linear-gradient(90deg, #222d45, #1a2235); border-left: 1px solid #2a3652; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
.fp-server .ear-r::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #c0c8d8; box-shadow: 0 0 3px #ffffff55; }

/* Switch */
.fp-switch { background: linear-gradient(180deg, #0f1c2e 0%, #0a1220 100%); border: 1px solid #1e3050; display: flex; align-items: center; gap: 0; height: 100%; }
.fp-switch .ports-grid { flex: 1; display: grid; grid-template-columns: repeat(12, auto); justify-content: center; align-content: center; gap: 4px 5px; padding: 2px 6px; }
.port-rj45 { width: 11px; height: 9px; background: #0a1020; border: 1px solid #2a4060; border-radius: 1px; position: relative; flex-shrink: 0; }
.port-rj45::after { content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%); width: 4px; height: 3px; border-radius: 50% 50% 0 0; background: var(--green); box-shadow: 0 0 4px var(--green); animation: port-blink 2s infinite; animation-delay: var(--blink-delay, 0s); }
.port-rj45.connected::after { animation: port-fast 0.5s infinite; background: var(--cyan); box-shadow: 0 0 4px var(--cyan); }
.port-rj45.inactive::after { background: #2a3a4a; box-shadow: none; animation: none; }
@keyframes port-blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes port-fast  { 0%,100%{opacity:1} 50%{opacity:0.3} }
.fp-switch .sw-right { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 8px; border-left: 1px solid #1e3050; flex-shrink: 0; }
.sfp-port { width: 10px; height: 8px; background: #0a1220; border: 1px solid #2a4060; border-radius: 1px; position: relative; }
.sfp-port::after { content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 3px var(--amber); animation: port-blink 1.5s infinite; }

/* UPS */
.fp-ups { background: linear-gradient(180deg, #0d0f14 0%, #090b10 100%); border: 1px solid #1a1f30; display: flex; align-items: center; gap: 0; height: 100%; }
.fp-ups .ups-left { width: 40px; background: #090b10; border-right: 1px solid #1a1f30; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 4px 0; }
.ups-led { width: 8px; height: 8px; border-radius: 50%; }
.ups-led.green { background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse-dot 2s infinite; }
.ups-led.amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
.ups-led.red   { background: var(--red);   box-shadow: 0 0 6px var(--red); }
.ups-led.off   { background: #1a1f30; }
.fp-ups .ups-lcd { flex: 1; background: #00050f; margin: 6px; border: 1px solid #0a2040; border-radius: 3px; display: flex; flex-direction: column; justify-content: center; padding: 4px 8px; gap: 2px; }
.ups-lcd-line { font-family: var(--font-mono); font-size: var(--text-xs); color: #00aaff; text-shadow: 0 0 6px #00aaff; animation: flicker 8s infinite; }
@keyframes flicker { 0%,95%,100%{opacity:1} 96%,98%{opacity:0.7} }
.fp-ups .ups-right { width: 36px; border-left: 1px solid #1a1f30; height: 100%; background: #0a0c14; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0; }
.ups-jack { width: 14px; height: 10px; background: #0a0f1a; border: 1px solid #2a3050; border-radius: 2px; }

/* Router */
.fp-router { background: linear-gradient(180deg, #14100a 0%, #0f0c07 100%); border: 1px solid #2a2010; display: flex; align-items: center; height: 100%; }
.fp-router .rtr-brand { width: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid #2a2010; height: 100%; flex-shrink: 0; }
.fp-router .rtr-logo { font-family: var(--font-display); font-size: var(--text-md); font-weight: 800; color: var(--amber); text-shadow: -1px 0 0 rgba(255,0,0,0.8), 1px 0 0 rgba(0,255,0,0.5); }
.fp-router .sfp-row { flex: 1; display: flex; align-items: center; justify-content: flex-start; gap: 6px; padding: 4px 10px; }
.sfp-module { width: 14px; height: 11px; background: transparent; border: 1px solid #5a401a; border-radius: 2px; position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sfp-module::before { content: ''; position: absolute; top: 2px; left: 50%; transform: translateX(-50%); width: 6px; height: 1px; background: #5a401a; border-radius: 0; }
.sfp-module::after { content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 4px; height: 3px; border-radius: 1px; background: var(--amber); box-shadow: 0 0 6px var(--amber), 0 0 2px #fff; animation: port-blink 3s infinite; animation-delay: var(--blink-delay, 0s); }
.fp-router .vent-r { width: 28px; height: 100%; background: repeating-linear-gradient(90deg, #14100a, #14100a 2px, #050402 2px, #050402 5px); border-left: 1px solid #2a2010; flex-shrink: 0; }

/* Firewall */
.fp-firewall { background: linear-gradient(180deg, #1a0a0a 0%, #0f0606 100%); border: 1px solid #3a1515; display: flex; align-items: center; height: 100%; }
.fp-firewall .fw-icon { width: 36px; display: flex; align-items: center; justify-content: center; font-size: var(--text-md); border-right: 1px solid #3a1515; height: 100%; flex-shrink: 0; }
.fp-firewall .fw-mid { flex: 1; padding: 4px 8px; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.fp-firewall .fw-name { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--red); text-shadow: 0 0 6px var(--red); }
.fp-firewall .fw-status { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
.fp-firewall .fw-leds { display: flex; gap: 3px; align-items: center; padding-right: 8px; flex-shrink: 0; }
.fw-led { width: 6px; height: 6px; border-radius: 50%; }
.fw-led.g { background: var(--green); box-shadow: 0 0 4px var(--green); animation: pulse-dot 1.5s infinite; }
.fw-led.r { background: var(--red);   box-shadow: 0 0 4px var(--red); }
.fw-led.a { background: var(--amber); box-shadow: 0 0 4px var(--amber); animation: pulse-dot 2s infinite; }

/* Storage */
.fp-storage { background: linear-gradient(180deg, #0a0a1a 0%, #060610 100%); border: 1px solid #1a1a40; display: flex; align-items: center; height: 100%; }
.fp-storage .st-left { width: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-right: 1px solid #1a1a40; height: 100%; flex-shrink: 0; }
.fp-storage .st-drives { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); grid-auto-rows: 1fr; gap: 4px 6px; padding: 4px 12px; align-content: stretch; }
.drive-slot { width: 100%; height: 100%; min-height: 12px; background: transparent; border: 1px solid #2a2a4a; border-radius: 2px; position: relative; }
.drive-slot.active::after { content: ''; position: absolute; top: -3px; right: 2px; width: 3px; height: 3px; border-radius: 50%; background: var(--green); box-shadow: 0 0 4px var(--green); animation: port-blink 1.5s infinite; animation-delay: var(--blink-delay, 0s); }
.fp-storage .st-right { width: 40px; border-left: 1px solid #1a1a40; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex-shrink: 0; padding: 4px; }
.st-port { width: 18px; height: 8px; background: transparent; border: 1px solid #2a2a4a; border-radius: 2px; }

/* Device Actions */
.device-actions { position: absolute; top: 4px; right: 4px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; z-index: 10; }
.device-faceplate:hover .device-actions { opacity: 1; }
.dev-btn { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); transition: all 0.15s; }
.dev-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-card2); }
.dev-btn.del:hover { border-color: var(--red); color: var(--red); }

.sb-title { padding: 8px 14px; font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: var(--bg-card1); border-bottom: 1px solid var(--border); }
.sb-title:hover { color: var(--text-primary); }

.fullscreen { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 9999 !important; background: var(--bg-main) !important; margin: 0 !important; border: none !important; border-radius: 0 !important; max-height: none !important; }

/* Floor Section */
.floor-section { width: 100%; margin-top: 32px; background: var(--bg-card); border: 1px dashed var(--border-light); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.floor-section:hover { border-color: var(--border); }
.floor-section-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--bg-panel); border-bottom: 1px solid var(--border); font-family: var(--font-ui); font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); }
.floor-device-count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); background: rgba(255, 255, 255, 0.05); padding: 2px 8px; border-radius: 20px; }
.floor-devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; padding: 16px; min-height: 90px; transition: all 0.2s ease; }
.floor-devices-grid.drag-over { background: var(--accent-glow); border-color: var(--accent); }
.floor-empty { grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-sm); padding: 24px; border: 1px dashed var(--border); border-radius: var(--radius); }
.floor-device-card { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--bg-card2); border: 1px solid var(--border); border-left: 3px solid var(--floor-color, var(--accent)); border-radius: var(--radius); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.floor-device-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02) 50%, transparent); transform: translateX(-100%); transition: transform 0.5s ease; pointer-events: none; }
.floor-device-card:hover::before { transform: translateX(100%); }
.floor-device-card:hover { border-color: var(--floor-color, var(--accent)); transform: translateY(-2px); box-shadow: 0 4px 16px color-mix(in srgb, var(--floor-color) 20%, transparent), 0 0 1px var(--floor-color); }
.floor-device-icon { font-size: 24px; line-height: 1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius); background: color-mix(in srgb, var(--floor-color) 12%, transparent); border: 1px solid color-mix(in srgb, var(--floor-color) 20%, transparent); color: var(--floor-color); transition: transform 0.2s ease; }
.floor-device-card:hover .floor-device-icon { transform: scale(1.1) rotate(3deg); }
.floor-device-info { min-width: 0; flex: 1; }
.floor-device-name { font-family: var(--font-ui); font-size: var(--text-base); font-weight: 550; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.floor-device-meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.filter-tab[data-filter="floor"] { border-color: rgba(139, 92, 246, 0.3); }
.filter-tab[data-filter="floor"]:hover { border-color: var(--purple); color: var(--text-primary); background: rgba(139, 92, 246, 0.15); }
.filter-tab[data-filter="floor"].active { background: rgba(139, 92, 246, 0.25); border-color: var(--purple); color: var(--purple); }
```

---

### `css/components/modals.css`

```css
/* ============================================================
   MODALS
============================================================ */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(6px); z-index: 100000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
.modal-overlay.hidden { display: none; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background: var(--bg-panel); backdrop-filter: blur(20px) saturate(200%); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 24px; min-width: 380px; max-width: 540px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.6), 0 0 30px var(--accent-glow); animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from{transform:translateY(30px) scale(0.95);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
.modal-title { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.modal-sub { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 20px; font-family: var(--font-mono); }
.form-row { margin-bottom: 14px; }
.form-row label { display: block; font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); margin-bottom: 5px; font-family: var(--font-mono); }
.form-row input, .form-row select, .form-row textarea { width: 100%; background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-sm); padding: 8px 10px; border-radius: var(--radius); outline: none; transition: border-color 0.2s; }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { border-color: var(--accent); }
.form-row select option { background: var(--bg-card2); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-ui); font-size: var(--text-sm); transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.btn-cancel:hover { border-color: var(--text-secondary); }
.btn-confirm { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--accent); background: var(--accent-glow); color: var(--accent); cursor: pointer; font-family: var(--font-ui); font-size: var(--text-sm); font-weight: 600; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.btn-confirm:hover { background: var(--accent); color: var(--bg-main); }
.btn-confirm.danger { border-color: var(--red); background: var(--red-glow); color: var(--red); }
.btn-confirm.danger:hover { background: var(--red); color: white; }
```

---

### `css/components/misc.css`

```css
/* ============================================================
   DRAG GHOST
============================================================ */
#drag-ghost { position: fixed; pointer-events: none; z-index: 9999; opacity: 0.85; left: -9999px; top: -9999px; }

/* NOTIFICATIONS */
#notif-area { position: fixed; bottom: 240px; right: 16px; z-index: 9000; display: flex; flex-direction: column; gap: 6px; }
.notif { padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius); font-size: var(--text-sm); font-family: var(--font-mono); box-shadow: var(--shadow); animation: notifIn 0.3s; display: flex; align-items: center; gap: 8px; min-width: 200px; max-width: 320px; }
@keyframes notifIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
.notif.success { border-color: var(--green); color: var(--green); }
.notif.error   { border-color: var(--red);   color: var(--red); }
.notif.info    { border-color: var(--accent); color: var(--accent); }
.notif.warn    { border-color: var(--amber);  color: var(--amber); }

/* CONTEXT MENU */
#ctx-menu { position: fixed; background: var(--bg-panel); backdrop-filter: blur(16px) saturate(180%); border: 1px solid var(--border-light); border-radius: var(--radius); padding: 4px 0; z-index: 100000; min-width: 160px; box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5); }
#ctx-menu.hidden { display: none; }
.ctx-item { padding: 8px 14px; font-size: var(--text-sm); font-family: var(--font-ui); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; }
.ctx-item:hover { background: var(--accent-glow); color: var(--text-primary); padding-left: 18px; }
.ctx-item.danger:hover { background: var(--red-glow); color: var(--red); padding-left: 18px; }
.ctx-sep { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 4px 0; }

/* MISC */
.tooltip { position: relative; }
.tooltip::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 5px); left: 50%; transform: translateX(-50%); background: var(--bg-card2); border: 1px solid var(--border); padding: 3px 8px; border-radius: 4px; font-size: var(--text-xs); white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s; font-family: var(--font-mono); color: var(--text-secondary); z-index: 1000; }
.tooltip.tooltip-bottom::after { bottom: auto; top: calc(100% + 5px); }
@media (hover: hover) { .tooltip:hover::after { opacity: 1; } }
@media (min-width: 769px) { .mobile-only { display: none !important; } }
.color-input-wrap { display: flex; align-items: center; gap: 8px; }
.color-input-wrap input[type=color] { width: 32px; height: 28px; padding: 2px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card2); cursor: pointer; }
.color-input-wrap input[type=text] { flex: 1; }
.connectivity-line { position: absolute; pointer-events: none; }

/* Drop zone */
.drop-zone { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 20px; text-align: center; transition: all 0.2s; cursor: pointer; }
.drop-zone.drag-over { border-color: var(--accent); background: var(--accent-glow); }
.drop-zone p { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-sm); }

/* Device Tooltip */
#device-tooltip { position: fixed; background: var(--bg-panel); backdrop-filter: blur(12px) saturate(150%); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 10000; pointer-events: none; width: 220px; transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateX(-15px) scale(0.95); }
#device-tooltip.visible { opacity: 1; transform: translateX(0) scale(1); }
#device-tooltip .tt-title { font-family: var(--font-display); font-size: var(--text-base); font-weight: 700; color: var(--accent); margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
#device-tooltip .tt-row { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between; }
#device-tooltip .tt-row span:first-child { color: var(--text-muted); }
```

---

## JavaScript

### `js/utils.js`

```js
const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
};
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const lerp = (a, b, t) => a + (b - a) * t;

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function notify(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  const icons = { info: '●', success: '✓', error: '✗', warn: '⚠' };
  el.innerHTML = `<span>${icons[type]||'●'}</span> ${escapeHTML(msg)}`;
  const area = document.getElementById('notif-area');
  area.appendChild(el);
  while (area.children.length > 5) {
    area.removeChild(area.firstChild);
  }
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDeviceLocation(device) {
  if (!device) return 'Desconocido';
  let roomName = 'Desconocido';
  if (device.rackId) {
    const rack = store.rackById(device.rackId);
    if (rack) {
      const room = store._raw.rooms.find(r => r.id === rack.roomId);
      roomName = room ? room.name : 'Sala Desconocida';
      return `${roomName} — ${rack.name}`;
    }
  } else if (device.roomId) {
    const room = store._raw.rooms.find(r => r.id === device.roomId);
    roomName = room ? room.name : 'Sala Desconocida';
    return `${roomName} — PISO`;
  }
  return 'Sin asignar';
}
```

---

### `js/store.js`

```js
class Store {
  constructor() {
    this._undoStack = [];
    this._redoStack = [];
    this._listeners = {};
    this._proxyCache = new WeakMap();
    this._raw = this._load();
    this.state = this._makeProxy(this._raw);
  }

  _defaultState() {
    const roomId = uid();
    return {
      rooms: [{ id: roomId, name: 'Sala Principal' }],
      racks: [],
      devices: [],
      connections: [],
      currentRoomId: roomId,
      selectedDeviceId: null,
      topology: { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} },
      topoZoom: 1, topoPanX: 0, topoPanY: 0,
      physZoom: 1, physPanX: 0, physPanY: 0
    };
  }

  _load() {
    try {
      const saved = localStorage.getItem('RACK_DESIGNER_STATE');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return this._defaultState();
  }

  _save() {
    try { localStorage.setItem('RACK_DESIGNER_STATE', JSON.stringify(this._raw)); } catch(e) {}
  }

  _makeProxy(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (this._proxyCache.has(obj)) return this._proxyCache.get(obj);
    const proxy = new Proxy(obj, {
      set: (target, key, value) => {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) return true;
        target[key] = value;
        this._save();
        this._emit('change', { path: `${path}.${key}`, key, value });
        return true;
      },
      get: (target, key) => {
        const val = target[key];
        if (typeof val === 'function') return val.bind(target);
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) return this._makeProxy(val, `${path}.${key}`);
        return val;
      }
    });
    this._proxyCache.set(obj, proxy);
    return proxy;
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  }

  snapshot() {
    this._undoStack.push(deepClone(this._raw));
    if (this._undoStack.length > 30) this._undoStack.shift();
    this._redoStack = [];
    this._updateHistoryButtons();
  }

  undo() {
    if (!this._undoStack.length) return;
    this._redoStack.push(deepClone(this._raw));
    const prev = this._undoStack.pop();
    Object.assign(this._raw, prev);
    this._save();
    this._emit('change', { path: 'undo' });
    this._updateHistoryButtons();
  }

  redo() {
    if (!this._redoStack.length) return;
    this._undoStack.push(deepClone(this._raw));
    const next = this._redoStack.pop();
    Object.assign(this._raw, next);
    this._save();
    this._emit('change', { path: 'redo' });
    this._updateHistoryButtons();
  }

  _updateHistoryButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if(btnUndo) {
      btnUndo.disabled = !this._undoStack.length;
      btnUndo.textContent = this._undoStack.length ? `↩ ${this._undoStack.length}` : '↩';
    }
    if(btnRedo) {
      btnRedo.disabled = !this._redoStack.length;
      btnRedo.textContent = this._redoStack.length ? `↪ ${this._redoStack.length}` : '↪';
    }
  }

  get currentRoom()  { return this._raw.rooms.find(r => r.id === this._raw.currentRoomId); }
  get currentRacks() { return this._raw.racks.filter(r => r.roomId === this._raw.currentRoomId); }
  allDevicesInRack(rackId) { return (this._raw.devices || []).filter(d => d.rackId === rackId && d.category !== 'floor'); }
  allFloorDevicesInRoom(roomId) { return (this._raw.devices || []).filter(d => d.category === 'floor' && d.roomId === roomId); }

  addFloorDevice(template, roomId, floorX = 100, floorY = 100) {
    this.snapshot();
    const device = {
      id: uid(), rackId: null, category: 'floor', roomId,
      name: template.name || 'Nuevo equipo', type: template.type,
      ip: template.ip || '', mac: template.mac || '', serial: template.serial || '',
      power: parseInt(template.power) || 0, plugs: parseInt(template.plugs) || 1,
      user: template.user || 'admin', pass: template.pass || '', notes: template.notes || ''
    };
    this._raw.devices.push(device);
    this._save();
    this._emit('change', { source: 'addFloorDevice' });
    return device;
  }

  deviceById(id)     { return this._raw.devices.find(d => d.id === id); }
  rackById(id)       { return this._raw.racks.find(r => r.id === id); }

  addRoom(name) {
    this.snapshot();
    const id = uid();
    this._raw.rooms.push({ id, name });
    this._raw.currentRoomId = id;
    this._save();
    this._emit('change', { source: 'addRoom' });
  }

  addRack({ name, height, color }) {
    this.snapshot();
    this._raw.racks.push({ id: uid(), roomId: this._raw.currentRoomId, name, height: parseInt(height), color, devices: [] });
    this._save();
    this._emit('change', { source: 'addRack' });
  }

  updateRack(id, props) {
    this.snapshot();
    const r = this._raw.racks.find(r => r.id === id);
    if (r) Object.assign(r, props);
    this._save();
    this._emit('change', { source: 'updateRack' });
  }

  deleteRack(id) {
    this.snapshot();
    this._raw.racks = this._raw.racks.filter(r => r.id !== id);
    this._raw.devices = this._raw.devices.filter(d => d.rackId !== id);
    this._save();
    this._emit('change', { source: 'deleteRack' });
  }

  addDeviceToRack(deviceTemplate, rackId, slotStart, mountSide = 'front') {
    const rack = this.rackById(rackId);
    if (!rack) return false;
    const size = parseInt(deviceTemplate.size);
    if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
    const existing = this.allDevicesInRack(rackId).filter(d => (d.mountSide || 'front') === mountSide);
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = slotStart + size - 1;
      if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
    }
    this.snapshot();
    const newDev = {
      id: uid(), rackId, name: deviceTemplate.name, type: deviceTemplate.type,
      slotStart, size, mountSide, ip: deviceTemplate.ip || '', mac: deviceTemplate.mac || '',
      serial: deviceTemplate.serial || '', power: deviceTemplate.power || 0,
      user: deviceTemplate.user || 'admin', pass: deviceTemplate.pass || '',
      notes: deviceTemplate.notes || ''
    };
    this._raw.devices.push(newDev);
    this._save();
    this._emit('change', { source: 'addDeviceToRack' });
    return true;
  }

  moveDevice(deviceId, newRackId, newSlot, newMountSide) {
    const dev = this.deviceById(deviceId);
    if (!dev) return false;
    const rack = this.rackById(newRackId);
    if (!rack) return false;
    const size = dev.size;
    const side = newMountSide || dev.mountSide || 'front';
    if (newSlot < 1 || newSlot + size - 1 > rack.height) return false;
    const existing = this.allDevicesInRack(newRackId).filter(d => d.id !== deviceId && (d.mountSide || 'front') === side);
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = newSlot + size - 1;
      if (!(nEnd < d.slotStart || newSlot > dEnd)) return false;
    }
    this.snapshot();
    dev.rackId = newRackId;
    dev.slotStart = newSlot;
    dev.mountSide = side;
    this._save();
    this._emit('change', { source: 'moveDevice' });
    return true;
  }

  deleteDevice(id) {
    this.snapshot();
    this._raw.devices = this._raw.devices.filter(d => d.id !== id);
    this._raw.connections = this._raw.connections.filter(c => c.sourceDeviceId !== id && c.targetDeviceId !== id);
    this._save();
    this._emit('change', { source: 'deleteDevice' });
  }

  updateDevice(id, props) {
    this.snapshot();
    const d = this._raw.devices.find(d => d.id === id);
    if (d) Object.assign(d, props);
    this._save();
    this._emit('change', { source: 'updateDevice' });
  }

  addConnection(conn) {
    this.snapshot();
    this._raw.connections.push({ id: uid(), ...conn });
    this._save();
    this._emit('change', { source: 'addConnection' });
  }

  updateConnection(id, props) {
    this.snapshot();
    const c = this._raw.connections.find(c => c.id === id);
    if (c) Object.assign(c, props);
    this._save();
    this._emit('change', { source: 'updateConnection' });
  }

  deleteConnection(id) {
    this.snapshot();
    this._raw.connections = this._raw.connections.filter(c => c.id !== id);
    this._save();
    this._emit('change', { source: 'deleteConnection' });
  }

  saveTopologyState(data) {
    if (!this._raw.topology) this._raw.topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };
    Object.assign(this._raw.topology, data);
    this._save();
  }

  loadData(data) {
    this._undoStack = [];
    this._redoStack = [];
    Object.keys(this._raw).forEach(k => delete this._raw[k]);
    Object.assign(this._raw, data);
    if (!this._raw.topology) {
      this._raw.topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };
    }
    this._save();
    this._emit('change', { source: 'loadData' });
    this._updateHistoryButtons();
  }

  getStats() {
    const racks = this.currentRacks;
    const rackDevices = racks.flatMap(r => this.allDevicesInRack(r.id));
    const floorDevices = this.allFloorDevicesInRoom(this._raw.currentRoomId);
    const allDevices = [...rackDevices, ...floorDevices];
    const totalU = racks.reduce((s, r) => s + r.height, 0);
    const usedU  = rackDevices.reduce((s, d) => s + d.size, 0);
    const power  = allDevices.reduce((s, d) => s + (parseInt(d.power) || 0), 0);
    return { racks: racks.length, devices: allDevices.length, totalU, usedU, power, connections: this._raw.connections.length };
  }
}

const store = new Store();
```

---

### `js/ui/catalog.js`

```js
let CATALOG = [
  { id:'c1', name:'Server HP ProLiant', type:'server',   size:2, power:460, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#10b981' },
  { id:'c2', name:'Server Dell R740',   type:'server',   size:2, power:550, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#10b981' },
  { id:'c3', name:'Server 1U',          type:'server',   size:1, power:200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#10b981' },
  { id:'c4', name:'Switch Cisco 48P',   type:'switch',   size:1, power:180, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔀', color:'#10b981' },
  { id:'c5', name:'Switch Managed 24P', type:'switch',   size:1, power:120, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔀', color:'#10b981' },
  { id:'c6', name:'Router Core',        type:'router',   size:1, power:90,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🌐', color:'#f59e0b' },
  { id:'c7', name:'Firewall Fortinet',  type:'firewall', size:1, power:40,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔥', color:'#ef4444' },
  { id:'c8', name:'UPS APC 2U',         type:'ups',      size:2, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔋', color:'#8b5cf6' },
  { id:'c9', name:'SAN Storage 4U',     type:'storage',  size:4, power:300, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💾', color:'#06b6d4' },
  { id:'c10',name:'NAS 2U',             type:'storage',  size:2, power:150, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💾', color:'#06b6d4' },
  { id:'c11', name:'PC Desktop',         type:'pc',       size:0, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💻', color:'#0ea5e9' },
  { id:'c12', name:'Cámara IP',          type:'camera',   size:0, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📷', color:'#8b5cf6' },
  { id:'c13', name:'Access Point Wifi',  type:'ap',       size:0, power:20,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📶', color:'#10b981' },
  { id:'c14', name:'Controlador Puerta', type:'door',     size:0, power:30,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🚪', color:'#f59e0b' },
  { id:'c15', name:'Impresora Red',      type:'printer',  size:0, power:350, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖨️', color:'#06b6d4' },
  { id:'c16', name:'Teléfono VoIP',      type:'phone',    size:0, power:10,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📞', color:'#ef4444' },
];

const TYPE_COLORS = { server:'#10b981', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', ups:'#8b5cf6', storage:'#06b6d4', pc:'#0ea5e9', camera:'#8b5cf6', ap:'#10b981', door:'#f59e0b', printer:'#06b6d4', phone:'#ef4444' };

function addCatalogItem(item) { CATALOG.push(item); renderCatalog(); }
function updateCatalogItem(id, props) {
  const c = CATALOG.find(x => x.id === id);
  if(c) Object.assign(c, props);
  renderCatalog();
}

function renderCatalog() {
  const searchInput = document.getElementById('catalog-search');
  if(!searchInput) return;
  const query  = searchInput.value.toLowerCase();
  const filterBtn = document.querySelector('.filter-tab.active');
  const filter = filterBtn ? filterBtn.dataset.filter : 'all';
  
  const list = CATALOG.filter(item => {
    const matchType = filter === 'all' ||
      (filter === 'server'  && item.type === 'server') ||
      (filter === 'switch'  && ['switch','router','firewall'].includes(item.type)) ||
      (filter === 'storage' && ['storage','ups'].includes(item.type)) ||
      (filter === 'floor'   && ['pc','camera','ap','door','printer','phone'].includes(item.type));
    const matchQuery = !query || item.name.toLowerCase().includes(query) || item.type.includes(query);
    return matchType && matchQuery;
  });
  
  const cat = document.getElementById('catalog');
  cat.innerHTML = list.map(item => `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22;color:${TYPE_COLORS[item.type]}">${escapeHTML(item.icon)}</div>
      <div class="cat-info">
        <div class="cat-name">${escapeHTML(item.name)}</div>
        <div class="cat-meta">${escapeHTML(item.type).toUpperCase()} │ ${escapeHTML(String(item.power))}W</div>
      </div>
      <div class="cat-size">${item.size ? item.size + 'U' : 'Piso'}</div>
      <div class="cat-actions" style="display:flex; align-items:center; margin-left:4px;">
        <button class="cat-btn menu" data-menu-cat="${item.id}" title="Opciones" style="font-size:16px; cursor:pointer; background:none; border:none; color:var(--text-muted); padding: 4px;">⋮</button>
      </div>
    </div>
  `).join('');
  
  cat.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', onCatalogDragStart);
    el.addEventListener('dragend',   onCatalogDragEnd);
    el.addEventListener('dblclick', () => openQuickPlacementModal(el.dataset.catalogId));
  });

  cat.querySelectorAll('.cat-btn.menu').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const catId = btn.dataset.menuCat;
      const menu = document.getElementById('ctx-menu');
      if(!menu) return;
      menu.innerHTML = `
        <div class="ctx-item" data-action="cat-place" data-id="${escapeHTML(catId)}">⚡ Ubicación Rápida</div>
        <div class="ctx-item" data-action="cat-edit" data-id="${escapeHTML(catId)}">✎ Editar plantilla</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item danger" data-action="cat-delete" data-id="${escapeHTML(catId)}">🗑 Eliminar plantilla</div>
      `;
      menu.style.cssText = `left:${e.clientX}px; top:${e.clientY}px`;
      menu.classList.remove('hidden');
      menu.querySelectorAll('.ctx-item[data-action]').forEach(item => {
        item.addEventListener('click', () => {
          menu.classList.add('hidden');
          const id = item.dataset.id;
          if (item.dataset.action === 'cat-place') openQuickPlacementModal(id);
          if (item.dataset.action === 'cat-edit') openEditCatalogModal(id);
          if (item.dataset.action === 'cat-delete') {
            if(confirm('¿Eliminar plantilla del catálogo?')) {
              CATALOG = CATALOG.filter(c => c.id !== id);
              renderCatalog();
            }
          }
        });
      });
    });
  });
}

function renderRoomTabs() {
  const tabs = document.getElementById('room-tabs');
  if(!tabs) return;
  tabs.innerHTML = store._raw.rooms.map(r => `
    <button class="room-tab ${r.id === store._raw.currentRoomId ? 'active' : ''}" data-room-id="${escapeHTML(r.id)}">
      🏢 ${escapeHTML(r.name)}
      ${store._raw.rooms.length > 1 ? `<span class="close-btn" data-del-room="${escapeHTML(r.id)}">✕</span>` : ''}
    </button>
  `).join('');
  tabs.querySelectorAll('.room-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.dataset.delRoom) { deleteRoom(e.target.dataset.delRoom); return; }
      store._raw.currentRoomId = btn.dataset.roomId;
      store._emit('change', { source: 'changeRoom' });
    });
    const editRoom = (e) => {
      if (e.target.dataset.delRoom) return;
      e.preventDefault();
      const roomId = btn.dataset.roomId;
      const room = store._raw.rooms.find(r => r.id === roomId);
      if (room) {
        const newName = prompt('Editar nombre de la sala:', room.name);
        if (newName !== null && newName.trim() !== '') {
          store.snapshot();
          room.name = newName.trim();
          store._save();
          store._emit('change', { source: 'room-rename' });
          notify('Sala renombrada a ' + room.name, 'success');
        }
      }
    };
    btn.addEventListener('dblclick', editRoom);
    btn.addEventListener('contextmenu', editRoom);
  });
}

function renderStats() {
  const s = store.getStats();
  const elRacks = document.getElementById('stat-racks');
  if(!elRacks) return;
  elRacks.textContent = s.racks;
  document.getElementById('stat-devices').textContent = s.devices;
  document.getElementById('stat-units').textContent = `${s.usedU}/${s.totalU}`;
  document.getElementById('stat-connections').textContent = s.connections;
  const rackPct = s.totalU ? Math.round((s.usedU / s.totalU) * 100) : 0;
  document.getElementById('cap-rack-pct').textContent = `${rackPct}%`;
  document.getElementById('cap-rack-bar').style.transform = `scaleX(${rackPct/100})`;
  const maxPower = 5000;
  const powerPct = Math.min(100, Math.round((s.power / maxPower) * 100));
  document.getElementById('cap-power-val').textContent = `${s.power} W`;
  document.getElementById('cap-power-bar').style.transform = `scaleX(${powerPct/100})`;
}
```

---

### `js/ui/faceplates.js`

```js
function buildFaceplate(device, heightPx) {
  const h = heightPx;
  const type = device.type;

  if (type === 'server') {
    const brand = device.name.toLowerCase().includes('hp') ? 'PROLIANT' :
                  device.name.toLowerCase().includes('dell') ? 'DELL POWEREDGE' :
                  device.name.toUpperCase().slice(0, 12);
    return `<div class="fp-server" style="height:${h}px">
      <div class="ear"></div>
      <div class="vent"></div>
      <div class="fp-mid">
        <div class="dev-name">${escapeHTML(device.name)}</div>
        <div class="lcd">${escapeHTML(brand)} · ${escapeHTML(device.ip) || 'NO IP'}</div>
      </div>
      <div class="fp-right"><div class="power-btn"></div></div>
      <div class="ear-r"></div>
    </div>`;
  }
  if (type === 'switch') {
    const ports = Array.from({length: 24}, (_,i) => {
      const connected = store._raw.connections.some(c =>
        (c.sourceDeviceId === device.id || c.targetDeviceId === device.id));
      const cls = connected && i < 2 ? 'connected' : (i > 20 ? 'inactive' : '');
      return `<div class="port-rj45 ${cls}" style="--blink-delay:${(i*0.13).toFixed(2)}s"></div>`;
    }).join('');
    const sfpPorts = Array.from({length:2}, (_,i) =>
      `<div class="sfp-port" style="--blink-delay:${(i*0.4).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-switch" style="height:${h}px">
      <div class="ports-grid">${ports}</div>
      <div class="sw-right">${sfpPorts}</div>
    </div>`;
  }
  if (type === 'ups') {
    return `<div class="fp-ups" style="height:${h}px">
      <div class="ups-left">
        <div class="ups-led green"></div>
        <div class="ups-led off"></div>
        <div class="ups-led off"></div>
      </div>
      <div class="ups-lcd">
        <div class="ups-lcd-line">230V IN / 230V OUT</div>
        <div class="ups-lcd-line">BATT: 100% LOAD: 45%</div>
        <div class="ups-lcd-line">RUNTIME: 18MIN</div>
      </div>
      <div class="ups-right">
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
      </div>
    </div>`;
  }
  if (type === 'router') {
    const sfps = Array.from({length:8}, (_,i) =>
      `<div class="sfp-module" style="--blink-delay:${(i*0.3).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-router" style="height:${h}px">
      <div class="rtr-brand"><div class="rtr-logo">RT</div></div>
      <div class="sfp-row">${sfps}</div>
      <div class="vent-r"></div>
    </div>`;
  }
  if (type === 'firewall') {
    return `<div class="fp-firewall" style="height:${h}px">
      <div class="fw-icon">🔥</div>
      <div class="fw-mid">
        <div class="fw-name">${escapeHTML(device.name)}</div>
        <div class="fw-status">${escapeHTML(device.ip) || 'NO IP'} │ ACTIVE</div>
      </div>
      <div class="fw-leds">
        <div class="fw-led g"></div>
        <div class="fw-led a"></div>
        <div class="fw-led r"></div>
      </div>
    </div>`;
  }
  if (type === 'storage') {
    const drives = Array.from({length:10}, (_,i) =>
      `<div class="drive-slot ${i < 8 ? 'active' : ''}" style="--blink-delay:${(i*0.2).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-storage" style="height:${h}px">
      <div class="st-left">
        <div class="ups-led green"></div>
        <div class="ups-led" style="background:var(--cyan);box-shadow:0 0 4px var(--cyan)"></div>
      </div>
      <div class="st-drives">${drives}</div>
      <div class="st-right">
        <div class="st-port"></div>
        <div class="st-port"></div>
        <div class="st-port"></div>
      </div>
    </div>`;
  }
  return `<div style="height:${h}px;display:flex;align-items:center;padding:0 8px;background:#111;font-size:10px;color:#666">${escapeHTML(device.name)}</div>`;
}

function getFloorFaceplate(device) {
  const icons = { pc:'💻', camera:'📷', ap:'📶', door:'🚪', printer:'🖨️', phone:'📞' };
  const colors = { pc:'#0ea5e9', camera:'#8b5cf6', ap:'#10b981', door:'#f59e0b', printer:'#06b6d4', phone:'#ef4444' };
  const icon  = icons[device.type]  || '📦';
  const color = colors[device.type] || '#8b9ab8';
  const name  = escapeHTML(device.name);
  return `
    <div class="floor-device-card" data-device-id="${device.id}" draggable="true" style="--floor-color: ${color}">
      <div class="floor-device-icon">${icon}</div>
      <div class="floor-device-info">
        <div class="floor-device-name">${name}</div>
        <div class="floor-device-meta">${escapeHTML(device.ip) || escapeHTML(device.type).toUpperCase()}</div>
      </div>
      <div class="device-actions">
        <button class="dev-btn edit" data-edit-dev="${device.id}" title="Editar">✎</button>
        <button class="dev-btn del" data-del-dev="${device.id}" title="Eliminar">🗑</button>
      </div>
    </div>`;
}

function buildRearView(rack, devices) {
  const TYPE_COLORS_LOCAL = { server: '#10b981', switch: '#10b981', router: '#06b6d4', firewall: '#ef4444', ups: '#f59e0b', storage: '#8b5cf6' };
  const connMap = {};
  (store._raw.connections || []).forEach(c => {
    if (!connMap[c.sourceDeviceId]) connMap[c.sourceDeviceId] = [];
    if (!connMap[c.targetDeviceId]) connMap[c.targetDeviceId] = [];
    connMap[c.sourceDeviceId].push({ conn: c, side: 'src' });
    connMap[c.targetDeviceId].push({ conn: c, side: 'dst' });
  });
  const deviceMap = {};
  devices.forEach(d => { for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d; });
  let slotsHTML = '';
  let skip = 0;
  for (let u = 1; u <= rack.height; u++) {
    if (skip > 0) { skip--; continue; }
    const dev = devices.find(d => d.slotStart === u);
    if (dev) {
      skip = dev.size - 1;
      const h = dev.size * UNIT_H;
      const devColor = TYPE_COLORS_LOCAL[dev.type] || '#1e3a5f';
      const conns = connMap[dev.id] || [];
      let portsHTML = conns.length > 0
        ? conns.map(({ conn, side }) => {
            const port = side === 'src' ? conn.sourcePort : conn.targetPort;
            const peerId = side === 'src' ? conn.targetDeviceId : conn.sourceDeviceId;
            const peer = store.deviceById(peerId);
            const peerName = peer ? peer.name.slice(0, 14) : '?';
            const cableColor = conn.color || '#3b82f6';
            return `<div class="rear-port" title="${escapeHTML(port)} → ${escapeHTML(peerName)}">
              <div class="rear-port-jack active" style="--cable-color:${escapeHTML(cableColor)}"></div>
              <div class="rear-port-label">${escapeHTML(port)}</div>
            </div>`;
          }).join('')
        : `<div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>
           <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>`;
      const plugs = parseInt(dev.plugs) || 1;
      const outletHTML = Array.from({ length: Math.min(plugs, 4) }, (_, i) =>
        `<div class="rear-outlet used" title="${escapeHTML(dev.power || 0)}W · Toma ${i+1}"></div>`
      ).join('');
      slotsHTML += `<div class="rear-slot" style="height:${h}px; min-height:${h}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body has-device" style="--device-color:${devColor}">
          <span class="rear-device-name" title="${escapeHTML(dev.name)}">${escapeHTML(dev.name.slice(0,16))}</span>
          <div class="rear-ports">${portsHTML}</div>
          <div class="rear-pdu">${outletHTML}</div>
        </div>
      </div>`;
    } else {
      slotsHTML += `<div class="rear-slot" style="height:${UNIT_H}px; min-height:${UNIT_H}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body"></div>
      </div>`;
    }
  }
  const totalConns = devices.reduce((s, d) => s + (connMap[d.id] ? connMap[d.id].length : 0), 0);
  return `
    <div class="rack-rear-header">
      <span class="rear-label">Vista Trasera</span>
      <span style="color:#2a5080; font-size:9px">${totalConns} cable(s)</span>
    </div>
    <div class="rack-rear-slots">${slotsHTML}</div>`;
}
```

---

### `js/ui/rack.js`

> Archivo de 529 líneas — renderPhysical, drag-and-drop, context menu, tooltips, floor section.

```js
const UNIT_H = 24;
let dragState = null;

function renderPhysical() {
  const container = document.getElementById('view-physical');
  if(!container) return;
  const racks = store.currentRacks;
  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  const flippedRacks = new Set();
  container.querySelectorAll('.rack-flipper.flipped').forEach(f => {
    flippedRacks.add(f.id.replace('flipper-', ''));
  });

  if (!racks.length) {
    container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; width:100%; display:flex; flex-wrap:wrap; gap:24px; align-content:flex-start;">
      <div style="display:flex; justify-content:center; width:100%;">
        <div class="empty-state" style="display:flex; flex-direction:column; align-items:center;">
          <div class="icon">🗄️</div>
          <p>No hay gabinetes en esta sala.</p>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn-primary" id="empty-btn-add-rack">+ Rack</button>
          </div>
        </div>
      </div>
    </div>`;
    const floorSection = renderFloorSection(store._raw.currentRoomId);
    container.querySelector('#view-physical-content').appendChild(floorSection);
    bindRackEvents(container, flippedRacks);
    updateZoomLabel();
    return;
  }

  function buildRackFace(rack, devices, side, searchTerm) {
    const sideDevices = devices.filter(d => (d.mountSide || 'front') === side);
    let slotsHTML = '';
    let skip = 0;
    for (let u = 1; u <= rack.height; u++) {
      if (skip > 0) { skip--; continue; }
      const dev = sideDevices.find(d => d.slotStart === u);
      if (dev) {
        const h = dev.size * UNIT_H;
        let matchClass = '';
        if (searchTerm) {
          const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
          matchClass = fields.includes(searchTerm) ? 'search-match' : 'search-dim';
        }
        skip = dev.size - 1;
        slotsHTML += `<div class="rack-slot occupied" style="height:${h}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}">
            <div class="device-faceplate ${matchClass}" style="top:0; height:${h}px" data-device-id="${dev.id}" draggable="true">
              ${buildFaceplate(dev, h)}
              <div class="device-actions">
                <button class="dev-btn edit" data-edit-dev="${dev.id}" title="Editar">✎</button>
                <button class="dev-btn del" data-del-dev="${dev.id}" title="Eliminar">🗑</button>
              </div>
            </div>
          </div>`;
      } else {
        slotsHTML += `<div class="rack-slot" style="height:${UNIT_H}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}"></div>`;
      }
    }
    const railHTML = Array.from({length: rack.height}, (_, i) => `<div class="rail-unit">${i + 1}</div>`).join('');
    const titleText = side === 'front' ? escapeHTML(rack.name) : `Vista Trasera`;
    const btnText = side === 'front' ? '🔄' : '🖥️';
    return `
      <div class="rack-card" data-rack-id="${rack.id}" data-side="${side}" style="${side === 'rear' ? 'border-color: #3b82f6; background: #0c1420' : ''}">
        <div class="rack-header" style="${side === 'rear' ? 'background: linear-gradient(90deg, #0f2035, #1a3050)' : ''}">
          <div class="rack-title">
            <div class="rack-color-dot" style="background:${side==='rear'?'#3b82f6':escapeHTML(rack.color)}; box-shadow:0 0 6px ${side==='rear'?'#3b82f6':escapeHTML(rack.color)}88"></div>
            ${titleText}
          </div>
          <div class="rack-hdr-btns" style="position:relative; display:flex; align-items:center; gap:4px;">
            <button class="btn-flip-rack" data-flip-rack="${escapeHTML(rack.id)}" title="${side === 'front' ? 'Vista Trasera' : 'Vista Frontal'}">${btnText}</button>
            <button class="rack-btn" data-rack-menu-toggle="${escapeHTML(rack.id)}" title="Opciones" style="font-size: 16px; padding: 0 6px; font-weight:bold; cursor:pointer;">⋮</button>
            <div class="dropdown-menu hidden" id="rack-menu-${rack.id}" style="right:0; top:32px; min-width:190px; z-index:1000;">
              <div class="dropdown-item" data-add-dev-rack="${escapeHTML(rack.id)}">⚡ Agregar Equipo</div>
              <div class="dropdown-item" data-clear-rack="${escapeHTML(rack.id)}">🧹 Limpiar Gabinete</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" data-edit-rack="${escapeHTML(rack.id)}">✎ Editar Gabinete</div>
              <div class="dropdown-item" style="color:var(--danger)" data-del-rack="${escapeHTML(rack.id)}">🗑 Eliminar Gabinete</div>
            </div>
          </div>
        </div>
        <div class="rack-body">
          <div class="rack-rail-left">${railHTML}</div>
          <div class="rack-slots" style="width:220px" id="slots-${side}-${rack.id}">${slotsHTML}</div>
          <div class="rack-rail-right">${railHTML}</div>
        </div>
      </div>
    `;
  }

  const racksHTML = racks.map(rack => {
    const devices = store.allDevicesInRack(rack.id);
    return `
    <div class="rack-wrapper" data-rack-id="${rack.id}">
      <div class="rack-flipper" id="flipper-${rack.id}">
        <div class="rack-face">${buildRackFace(rack, devices, 'front', searchTerm)}</div>
        <div class="rack-rear">${buildRackFace(rack, devices, 'rear', searchTerm)}</div>
      </div>
      <div style="text-align:center; font-size:9px; color:var(--text-muted); margin-top:4px; font-family:var(--font-mono)">
        ${rack.height}U · ${devices.filter(d => (d.mountSide||'front')==='front').reduce((s,d)=>s+d.size,0)}/${rack.height} FRONT · ${devices.filter(d => d.mountSide==='rear').reduce((s,d)=>s+d.size,0)}/${rack.height} REAR
      </div>
    </div>`;
  }).join('');

  const addRackHTML = `<div class="rack-wrapper" id="canvas-btn-add-rack" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:260px; min-height:300px; border:2px dashed var(--border); border-radius:var(--radius); cursor:pointer; opacity:0.5; transition:all 0.2s;" onmouseover="this.style.opacity='1'; this.style.borderColor='var(--accent)'" onmouseout="this.style.opacity='0.5'; this.style.borderColor='var(--border)'">
    <div style="font-size:32px; color:var(--text-muted); margin-bottom:8px;">+</div>
    <div style="font-family:var(--font-ui); color:var(--text-secondary); font-size:var(--text-sm); font-weight:600;">+Rack</div>
  </div>`;

  container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; display:flex; flex-wrap:wrap; gap:24px; align-content:flex-start; width: 100%;">
    <div style="display:flex; flex-wrap:wrap; gap:24px; width:100%;">${racksHTML}${addRackHTML}</div>
  </div>`;

  const floorSection = renderFloorSection(store._raw.currentRoomId);
  container.querySelector('#view-physical-content').appendChild(floorSection);
  bindRackEvents(container, flippedRacks);
  updateZoomLabel();
}

// bindRackEvents, drag handlers, context menu, tooltips, renderFloorSection
// (ver archivo completo en js/ui/rack.js para implementación completa de ~529 líneas)
function canPlace(rackId, slotStart, size, mountSide = 'front', excludeDeviceId = null) {
  const rack = store.rackById(rackId);
  if (!rack) return false;
  if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
  const existing = store.allDevicesInRack(rackId).filter(d => d.id !== excludeDeviceId && (d.mountSide || 'front') === mountSide);
  for (const d of existing) {
    const dEnd = d.slotStart + d.size - 1;
    const nEnd = slotStart + size - 1;
    if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
  }
  return true;
}
```

---

### `js/ui/modals.js`

```js
// Modals orchestrator
function initModals() {
  initRackModal();
  initDeviceModal();
  initCableModal();
  initRoomModal();
  initExportModal();
  initPlacementModal();
}
```

---

### `js/ui/modals/Globals.js`

```js
let editingRackId   = null;
let editingDeviceId = null;
let editingCatalogId = null;
let editingConnectionId = null;
const FLOOR_TYPES = new Set(['pc', 'camera', 'ap', 'door', 'printer', 'phone']);
```

---

### `js/ui/modals/RackModal.js`

```js
function openAddRackModal() {
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingRackId = null;
  document.getElementById('modal-rack-title').textContent = 'Nuevo Gabinete';
  document.getElementById('rack-name').value = '';
  document.getElementById('rack-height').value = '24';
  document.getElementById('rack-color').value = '#0ea5e9';
  document.getElementById('rack-color-picker').value = '#0ea5e9';
  document.getElementById('modal-rack').classList.remove('hidden');
}

function openEditRackModal(id) {
  editingRackId = id;
  const rack = store.rackById(id);
  if (!rack) return;
  document.getElementById('modal-rack-title').textContent = 'Editar Gabinete';
  document.getElementById('rack-name').value   = rack.name;
  document.getElementById('rack-height').value = rack.height;
  document.getElementById('rack-color').value  = rack.color;
  document.getElementById('rack-color-picker').value = rack.color;
  document.getElementById('modal-rack').classList.remove('hidden');
}

function initRackModal() {
  document.getElementById('modal-rack-save').addEventListener('click', () => {
    const name   = document.getElementById('rack-name').value.trim();
    const height = parseInt(document.getElementById('rack-height').value);
    const color  = document.getElementById('rack-color').value;
    if (!name) { notify('Ingresa un nombre para el gabinete', 'error'); return; }
    if (editingRackId) {
      const devices = store.allDevicesInRack(editingRackId);
      const overflowingDevices = devices.filter(d => d.slotStart + d.size - 1 > height);
      if (overflowingDevices.length > 0) {
        const confirmMsg = `Al reducir a ${height}U, se perderán ${overflowingDevices.length} equipo(s) y sus conexiones porque quedan fuera de límite. ¿Deseas continuar y eliminarlos?`;
        if (!confirm(confirmMsg)) return;
        overflowingDevices.forEach(d => store.deleteDevice(d.id));
      }
      store.updateRack(editingRackId, { name, height, color });
    } else {
      store.addRack({ name, height, color });
    }
    document.getElementById('modal-rack').classList.add('hidden');
    notify(editingRackId ? 'Gabinete actualizado' : 'Gabinete creado', 'success');
    editingRackId = null;
  });
  document.getElementById('modal-rack-cancel').addEventListener('click', () => {
    document.getElementById('modal-rack').classList.add('hidden');
  });
  document.getElementById('rack-color-picker').addEventListener('input', e => {
    document.getElementById('rack-color').value = e.target.value;
  });
  document.getElementById('rack-color').addEventListener('input', e => {
    document.getElementById('rack-color-picker').value = e.target.value;
  });
}
```

---

### `js/ui/modals/RoomModal.js`

```js
function deleteRoom(id) {
  if (store._raw.rooms.length <= 1) { notify('No puedes eliminar la única sala', 'warn'); return; }
  if (!confirm('¿Eliminar esta sala y todos sus gabinetes?')) return;
  store.snapshot();
  const racks = store._raw.racks.filter(r => r.roomId === id);
  const rackIds = racks.map(r => r.id);
  const devicesToDelete = store._raw.devices.filter(d => rackIds.includes(d.rackId) || (d.category === 'floor' && d.roomId === id));
  const deviceIdsToDelete = new Set(devicesToDelete.map(d => d.id));
  store._raw.connections = store._raw.connections.filter(c => !deviceIdsToDelete.has(c.sourceDeviceId) && !deviceIdsToDelete.has(c.targetDeviceId));
  store._raw.devices = store._raw.devices.filter(d => !deviceIdsToDelete.has(d.id));
  store._raw.racks = store._raw.racks.filter(r => r.roomId !== id);
  store._raw.rooms = store._raw.rooms.filter(r => r.id !== id);
  store._raw.currentRoomId = store._raw.rooms[0]?.id;
  store._save();
  store._emit('change', { source: 'deleteRoom' });
  notify('Sala eliminada', 'warn');
}

function initRoomModal() {
  const btnAddRoom = document.getElementById('btn-add-room');
  if(btnAddRoom) {
    btnAddRoom.addEventListener('click', () => {
      document.getElementById('room-name').value = '';
      document.getElementById('modal-room').classList.remove('hidden');
    });
  }
  const btnRoomSave = document.getElementById('modal-room-save');
  if(btnRoomSave) {
    btnRoomSave.addEventListener('click', () => {
      const name = document.getElementById('room-name').value.trim();
      if (!name) { notify('Ingresa un nombre para la sala', 'error'); return; }
      store.addRoom(name);
      document.getElementById('modal-room').classList.add('hidden');
      notify(`Sala "${name}" creada`, 'success');
    });
  }
  const btnRoomCancel = document.getElementById('modal-room-cancel');
  if(btnRoomCancel) {
    btnRoomCancel.addEventListener('click', () => {
      document.getElementById('modal-room').classList.add('hidden');
    });
  }
}
```

---

### `js/ui/modals/DeviceModal.js`

> 214 líneas — openAddDeviceModal, openEditCatalogModal, openEditDeviceModal, initDeviceModal con toggles de red/auth/power.

_(Ver archivo en `js/ui/modals/DeviceModal.js` para implementación completa)_

---

### `js/ui/modals/CableModal.js`

> 130 líneas — buildDeviceOptionsGrouped, openCableModal, openEditCableModal, initCableModal.

_(Ver archivo en `js/ui/modals/CableModal.js` para implementación completa)_

---

### `js/ui/modals/ExportModal.js`

> 300 líneas — openPNGModal, exportRackToPNG (Canvas 2D), exportFloorToPNG, exportCSV, exportJSON, importJSON, initExportModal.

_(Ver archivo en `js/ui/modals/ExportModal.js` para implementación completa)_

---

### `js/ui/modals/PlacementModal.js`

> 188 líneas — openQuickPlacementModal, repopulateQPRacks, repopulateQPSlots, initPlacementModal.

_(Ver archivo en `js/ui/modals/PlacementModal.js` para implementación completa)_

---

### `js/ui/tables.js`

> 256 líneas — renderBottomPanel, renderInventoryTable, startCellEdit, finishCellEdit, renderConnectionsTable, getInventoryData, getConnectionsData, exportación CSV/Excel.

_(Ver archivo en `js/ui/tables.js` para implementación completa)_

---

### `js/ui/topology/TopologyState.js`

```js
let canvas, ctx;
let topoAnim = null;
let panStart = null;
let panOrig = { x: 0, y: 0 };
let nodePositions = {};
let rackPositions = {};
let roomPositions = {};
let roomSizes = {};
let rackSizes = {};
let flowT = 0;

let draggingNode = null, draggingRack = null, draggingRoom = null;
let resizingRack = null, resizingRoom = null;
let nodeOrig = null;

let hoveredNode = null;
let mousePos = { x: -1000, y: -1000, rawX: -1000, rawY: -1000 };
let cursorMode = 'default';

function loadTopoState() {
  const top = store._raw.topology;
  if (top) {
    nodePositions = top.nodePositions || {};
    rackPositions = top.rackPositions || {};
    roomPositions = top.roomPositions || {};
    roomSizes = top.roomSizes || {};
    rackSizes = top.rackSizes || {};
  }
}

function saveTopo() {
  store.saveTopologyState({ nodePositions, rackPositions, roomPositions, roomSizes, rackSizes });
}
```

---

### `js/ui/topology/TopologyLayout.js`

```js
function initTopoPositions() {
  loadTopoState();
  const margin = 80;
  let currentRoomX = margin;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let currentRackX = currentRoomX + 40;
    let maxRackH = 100;

    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id);
      const rh = Math.max(200, devices.length * 60 + 80);
      const rw = 200;
      if (!rackPositions[rack.id]) rackPositions[rack.id] = { x: currentRackX, y: margin + 80 };
      if (!rackSizes[rack.id]) rackSizes[rack.id] = { w: rw, h: rh };
      devices.forEach((dev, di) => {
        if (!nodePositions[dev.id]) {
          nodePositions[dev.id] = {
            x: rackPositions[rack.id].x + rackSizes[rack.id].w / 2,
            y: rackPositions[rack.id].y + 60 + di * 60
          };
        }
      });
      currentRackX += rackSizes[rack.id].w + 40;
      if (rackSizes[rack.id].h > maxRackH) maxRackH = rackSizes[rack.id].h;
    });

    const roomW = Math.max(300, currentRackX - currentRoomX);
    const roomH = maxRackH + 140;
    if (!roomPositions[room.id]) roomPositions[room.id] = { x: currentRoomX, y: margin };
    if (!roomSizes[room.id]) roomSizes[room.id] = { w: roomW, h: roomH };

    const floorDevices = store.allFloorDevicesInRoom(room.id);
    floorDevices.forEach((dev, fi) => {
      if (!nodePositions[dev.id]) {
        nodePositions[dev.id] = {
          x: roomPositions[room.id].x + 50 + (fi % 4) * 60,
          y: roomPositions[room.id].y + roomSizes[room.id].h - 50
        };
      }
    });
    currentRoomX += roomSizes[room.id].w + 80;
  });
  saveTopo();
}

function resizeCanvas() {
  if(!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
```

---

### `js/ui/topology/TopologyOrchestrator.js`

```js
function startTopo() {
  resizeCanvas();
  initTopoPositions();
  if (topoAnim) cancelAnimationFrame(topoAnim);
  drawTopo();
}

function stopTopo() {
  if (topoAnim) cancelAnimationFrame(topoAnim);
  topoAnim = null;
}

function updateZoomLabel() {
  const lbl = document.getElementById('zoom-level');
  const pfx = currentView === 'physical' ? 'phys' : 'topo';
  const z = store._raw[pfx+'Zoom'] || 1;
  const px = store._raw[pfx+'PanX'] || 0;
  const py = store._raw[pfx+'PanY'] || 0;
  if (lbl) lbl.textContent = Math.round(z * 100) + '%';
  if (currentView === 'physical') {
    const phys = document.getElementById('view-physical-content');
    if (phys) {
      phys.style.zoom = z;
      phys.style.transform = `translate(${px}px, ${py}px)`;
      phys.style.width = '100%';
    }
  }
}

function exportTopologyToPNG() {
  // Calcula bounding box de todas las salas
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id]; const size = roomSizes[room.id];
    if (pos && size) {
      if (pos.x < minX) minX = pos.x; if (pos.y < minY) minY = pos.y;
      if (pos.x + size.w > maxX) maxX = pos.x + size.w; if (pos.y + size.h > maxY) maxY = pos.y + size.h;
    }
  });
  if (minX === Infinity) { notify('No hay topología para exportar', 'warn'); return; }
  const margin = 100;
  minX -= margin; minY -= margin; maxX += margin; maxY += margin;
  const width = maxX - minX; const height = maxY - minY;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width * 2; offCanvas.height = height * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);
  const oldCtx = ctx, oldCanvas = canvas;
  const oldZoom = store._raw.topoZoom, oldPanX = store._raw.topoPanX, oldPanY = store._raw.topoPanY;
  const oldHover = hoveredNode;
  try {
    ctx = oc; canvas = offCanvas;
    store._raw.topoZoom = 1; store._raw.topoPanX = -minX; store._raw.topoPanY = -minY;
    hoveredNode = null;
    cancelAnimationFrame(topoAnim); drawTopo(); cancelAnimationFrame(topoAnim);
    const url = offCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Topologia_Centro_Datos.png`; link.href = url; link.click();
    notify('Topología exportada a PNG', 'success');
  } finally {
    ctx = oldCtx; canvas = oldCanvas;
    store._raw.topoZoom = oldZoom; store._raw.topoPanX = oldPanX; store._raw.topoPanY = oldPanY;
    hoveredNode = oldHover; drawTopo();
  }
  startTopo();
}
```

---

### `js/ui/topology/TopologyRenderer.js` (fragmento clave)

```js
function drawTopo() {
  if(!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#2255aa'; ctx.fillRect(0, 0, W, H);
  // Puntos de malla
  ctx.fillStyle = '#ffffff22';
  for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
  }
  const zoom = store._raw.topoZoom || 1;
  const px = store._raw.topoPanX || 0, py = store._raw.topoPanY || 0;
  ctx.save(); ctx.translate(px, py); ctx.scale(zoom, zoom);
  // Dibuja salas, racks, cables animados con partículas Bezier, nodos de dispositivos
  // ... (ver archivo completo TopologyRenderer.js)
  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}
```

---

### `js/main.js`

```js
let currentView = 'physical';

function renderAll(event = {}) {
  const source = event.source || event.path || '';
  if (!source || ['loadData', 'undo', 'redo'].includes(source)) {
    renderRoomTabs(); renderStats(); renderCatalog(); renderPhysical(); renderBottomPanel(); updateZoomLabel();
    if (currentView === 'topology') initTopoPositions();
    return;
  }
  if (source.includes('Room') || source === 'room-rename' || source === 'changeRoom') {
    renderRoomTabs(); renderPhysical();
    if (currentView === 'topology') initTopoPositions();
  }
  if (source.includes('Rack')) { renderStats(); renderPhysical(); }
  if (source.includes('Device') || source === 'addFloorDevice' || source === 'moveDevice' || source === 'deleteDevice' || source === 'updateDevice' || source === 'addDeviceToRack') {
    renderStats(); renderPhysical(); renderBottomPanel();
  }
  if (source.includes('Connection')) { renderStats(); renderBottomPanel(); }
  if (source.includes('Zoom') || source.includes('Pan')) { updateZoomLabel(); }
}

store.on('change', renderAll);

function init() {
  initTopology();
  initModals();
  initGlobalEvents();
  const topoCanvas = document.getElementById('topology-canvas');
  if(topoCanvas) topoCanvas.style.display = 'none';
  renderAll();
  notify('⚡ RACK Designer modularizado', 'success', 2500);
}

init();
```

---

### `js/demoData.js`

> 145 líneas — Genera 3 salas (Data Center, Edificio A2, Edificio B1), 12 racks con 5 servidores + switch + UPS cada uno, firewall, core switch, y equipos de piso (cámaras, impresoras, teléfonos, APs). Conecta todo con links de fibra/cobre.

_(Ver archivo completo en `js/demoData.js`)_

---

## `service-worker.js` (raíz — relay)

```js
// RACK Designer — Service Worker Relay (Raíz)
importScripts('./js/service/service-worker.js');
```

---

## `js/service/service-worker.js`

```js
const CACHE_NAME = 'rack-designer-v1';

const ASSETS_TO_CACHE = [
  './', './index.html', './json/manifest.json', './css/style.css',
  './js/utils.js', './js/store.js', './js/demoData.js', './js/main.js',
  './js/ui/catalog.js', './js/ui/faceplates.js', './js/ui/modals.js',
  './js/ui/rack.js', './js/ui/topology.js', './js/ui/tables.js',
  './js/service/service-worker.js', './js/xlsx.full.min.js',
  './icons/icon-192.png', './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url).catch((err) => console.warn('[SW] No se pudo cachear:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') return networkResponse;
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('./index.html');
      });
    })
  );
});
```

---

## `json/manifest.json`

```json
{
  "name": "RACK Designer — Datacenter Console",
  "short_name": "RACK Designer",
  "description": "Diseña, documenta y gestiona tu datacenter de forma visual con RACK Designer.",
  "start_url": "../index.html",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#0b0f19",
  "theme_color": "#0ea5e9",
  "lang": "es",
  "icons": [
    { "src": "../icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "../icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["productivity", "utilities", "business"],
  "prefer_related_applications": false
}
```

---

> **Nota:** Los archivos de terceros (`xlsx.full.min.js`, `mobile-drag-drop.min.js`, `mobile-drag-drop-scroll.min.js`) no se incluyen en este documento por ser librerías externas. Los archivos `js/ui/modals/DeviceModal.js`, `CableModal.js`, `ExportModal.js`, `PlacementModal.js` y `js/ui/tables.js` están disponibles completos en el repositorio con toda su lógica de validación, formularios y exportación.
