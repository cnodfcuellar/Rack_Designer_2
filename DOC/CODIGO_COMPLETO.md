# Código Fuente Completo


## index.html

``html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>⚡ RACK Designer — Consola del Datacenter</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">

</head>
<body>

<!-- ============================
     HTML SKELETON
============================= -->
<div id="app">

  <!-- HEADER -->
  <header id="header">
    <div class="header-logo-area">
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="mobile-menu-btn" class="menu-btn" style="display: none;">☰</button>
        <div class="logo">
          <span class="logo-icon">⚡</span>
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
          <div class="dropdown-item" id="menu-export-cat">📤 Exportar catálogo</div>
          <div class="dropdown-item" id="menu-import-cat">📥 Importar catálogo</div>
        </div>
      </div>
    </div>
    <div class="header-main-area">
      <div class="room-tabs" id="room-tabs"></div>
      <button class="room-tab-add" id="btn-add-room" title="Nueva sala">+</button>
      <div class="spacer"></div>
      <div class="h-search">
        <input type="text" id="global-search" placeholder="Buscar equipo, IP, MAC…">
      </div>
      <div class="h-btn-group">
        <button class="h-btn tooltip" id="btn-undo" data-tip="Deshacer (Ctrl+Z)" disabled>↩</button>
        <button class="h-btn tooltip" id="btn-redo" data-tip="Rehacer (Ctrl+Y)" disabled>↪</button>
      </div>
      <div class="status-dot tooltip" data-tip="Sistema operativo"></div>
      <input type="file" id="file-import" accept=".json" style="display:none">
    </div>
  </header>

  <!-- SIDEBAR -->
  <aside id="sidebar">
    <div class="sb-title" id="toggle-stats">
      <span>ESTADÍSTICAS</span>
      <span id="stats-chevron">▼</span>
    </div>
    <div class="sb-header" id="stats-container">
      <div class="sb-stats" id="sidebar-stats">
        <div class="stat-pill tooltip" data-tip="Gabinetes">
          <div class="stat-icon-wrap" style="color: #38bdf8; background: rgba(56, 189, 248, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
          </div>
          <div class="value green" id="stat-racks">0</div>
        </div>
        <div class="stat-pill tooltip" data-tip="Equipos">
          <div class="stat-icon-wrap" style="color: #a855f7; background: rgba(168, 85, 247, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="6" rx="1"></rect><rect x="2" y="14" width="20" height="6" rx="1"></rect><line x1="6" y1="7" x2="6" y2="7"></line><line x1="6" y1="17" x2="6" y2="17"></line></svg>
          </div>
          <div class="value" id="stat-devices" style="color: #fff;">0</div>
        </div>
        <div class="stat-pill tooltip" data-tip="Unidades U">
          <div class="stat-icon-wrap" style="color: #f59e0b; background: rgba(245, 158, 11, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a6 6 0 1 0 12 0V4"></path></svg>
          </div>
          <div class="value amber" id="stat-units">0/0</div>
        </div>
        <div class="stat-pill tooltip" data-tip="Conexiones">
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
      
      <div class="spacer"></div>
      
      <div class="view-tabs">
        <button class="view-tab active" data-view="physical">⬛ Vista Física</button>
        <button class="view-tab" data-view="topology">◎ Topología</button>
      </div>

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
    <div class="form-row"><label>Nombre del Equipo</label><input type="text" id="dev-name" placeholder="Server HP ProLiant DL380"></div>
    <div class="form-grid">
      <div class="form-row"><label>Tipo</label>
        <select id="dev-type">
          <optgroup label="── Equipos en Rack ──">
            <option value="server">🖥 Servidor</option>
            <option value="switch">🔀 Switch</option>
            <option value="router">🌐 Router</option>
            <option value="firewall">🔥 Firewall</option>
            <option value="ups">🔋 UPS</option>
            <option value="storage">💾 Storage</option>
          </optgroup>
          <optgroup label="── Equipos de Piso ──">
            <option value="pc">💻 PC / Workstation</option>
            <option value="camera">📷 Cámara IP</option>
            <option value="ap">📶 Access Point</option>
            <option value="door">🚪 Ctrl de Puerta</option>
            <option value="printer">🖨️ Impresora</option>
            <option value="phone">📞 Teléfono VoIP</option>
          </optgroup>
        </select>
      </div>
      <div class="form-row"><label>Tamaño (U)</label>
        <select id="dev-size">
          <option value="1">1U</option><option value="2" selected>2U</option>
          <option value="4">4U</option><option value="8">8U</option>
        </select>
      </div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Dirección IP</label><input type="text" id="dev-ip" placeholder="192.168.1.10"></div>
      <div class="form-row"><label>Dirección MAC</label><input type="text" id="dev-mac" placeholder="AA:BB:CC:DD:EE:FF"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Número de Serie</label><input type="text" id="dev-serial" placeholder="SRV-2024-001"></div>
      <div class="form-row"><label>Consumo (W)</label><input type="number" id="dev-power" value="200" min="0"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Tomas Eléctricas</label><input type="number" id="dev-plugs" value="1" min="1" max="10"></div>
      <div class="form-row"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Usuario</label><input type="text" id="dev-user" placeholder="admin"></div>
      <div class="form-row"><label>Contraseña</label><input type="password" id="dev-pass" placeholder="••••••••"></div>
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
    
    <div class="modal-footer" style="margin-top:20px;">
      <button class="btn-cancel" id="modal-qp-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-qp-save">Instalar Equipo</button>
    </div>
  </div>
</div>

  <div id="device-tooltip"></div>
  <input type="file" id="import-file" accept=".rack,.json" class="hidden">
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/default.css">
  <script src="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/index.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/scroll-behaviour.min.js"></script>
  <script>
    MobileDragDrop.polyfill({
        dragImageTranslateOverride: MobileDragDrop.scrollBehaviourDragImageTranslateOverride
    });
  </script>

  <script src="js/xlsx.full.min.js"></script>
  <script src="js/utils.js"></script>
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
    <div class="form-row"><label>Nombre del Equipo</label><input type="text" id="dev-name" placeholder="Server HP ProLiant DL380"></div>
    <div class="form-grid">
      <div class="form-row"><label>Tipo</label>
        <select id="dev-type">
          <optgroup label="── Equipos en Rack ──">
            <option value="server">🖥 Servidor</option>
            <option value="switch">🔀 Switch</option>
            <option value="router">🌐 Router</option>
            <option value="firewall">🔥 Firewall</option>
            <option value="ups">🔋 UPS</option>
            <option value="storage">💾 Storage</option>
          </optgroup>
          <optgroup label="── Equipos de Piso ──">
            <option value="pc">💻 PC / Workstation</option>
            <option value="camera">📷 Cámara IP</option>
            <option value="ap">📶 Access Point</option>
            <option value="door">🚪 Ctrl de Puerta</option>
            <option value="printer">🖨️ Impresora</option>
            <option value="phone">📞 Teléfono VoIP</option>
          </optgroup>
        </select>
      </div>
      <div class="form-row"><label>Tamaño (U)</label>
        <select id="dev-size">
          <option value="1">1U</option><option value="2" selected>2U</option>
          <option value="4">4U</option><option value="8">8U</option>
        </select>
      </div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Dirección IP</label><input type="text" id="dev-ip" placeholder="192.168.1.10"></div>
      <div class="form-row"><label>Dirección MAC</label><input type="text" id="dev-mac" placeholder="AA:BB:CC:DD:EE:FF"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Número de Serie</label><input type="text" id="dev-serial" placeholder="SRV-2024-001"></div>
      <div class="form-row"><label>Consumo (W)</label><input type="number" id="dev-power" value="200" min="0"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Tomas Eléctricas</label><input type="number" id="dev-plugs" value="1" min="1" max="10"></div>
      <div class="form-row"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Usuario</label><input type="text" id="dev-user" placeholder="admin"></div>
      <div class="form-row"><label>Contraseña</label><input type="password" id="dev-pass" placeholder="••••••••"></div>
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
    <div class="form-row" style="margin-top:-8px; margin-bottom:10px;">
      <label>Ubicación Origen</label>
      <input type="text" id="cable-src-loc" disabled style="background:var(--bg-card2); opacity:0.8; font-size:11px;">
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Equipo Destino</label>
        <select id="cable-dst-dev"></select>
      </div>
      <div class="form-row"><label>Puerto Destino</label>
        <input type="text" id="cable-dst-port" placeholder="Eth0/2">
      </div>
    </div>
    <div class="form-row" style="margin-top:-8px; margin-bottom:10px;">
      <label>Ubicación Destino</label>
      <input type="text" id="cable-dst-loc" disabled style="background:var(--bg-card2); opacity:0.8; font-size:11px;">
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
    
    <div class="modal-footer" style="margin-top:20px;">
      <button class="btn-cancel" id="modal-qp-cancel">Cancelar</button>
      <button class="btn-confirm" id="modal-qp-save">Instalar Equipo</button>
    </div>
  </div>
</div>

  <div id="device-tooltip"></div>
  <input type="file" id="import-file" accept=".rack,.json" class="hidden">
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/default.css">
  <script src="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/index.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/scroll-behaviour.min.js"></script>
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
  <script src="js/ui/modals.js"></script>
  <script src="js/ui/rack.js"></script>
  <script src="js/ui/topology.js"></script>
<script src="js/ui/tables.js"></script>
<script src="js/demoData.js"></script>
<script src="js/main.js"></script>
</body>
</html>
``

## css\style.css

``css
/* ============================================================
   VARIABLES & RESET
============================================================ */
:root {
  --bg-main:      #0b0f19;
  --bg-panel:     #111827cc;
  --bg-card:      #151c2e;
  --bg-card2:     #1a2235;
  --border:       #25304b;
  --border-light: #2e3d5a;
  --text-primary: #f0f4ff;
  --text-secondary:#8b9ab8;
  --text-muted:   #4a5a78;
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
  --sidebar-w:    280px;
  --header-h:     56px;
  --bottom-h:     220px;
  --rack-unit-h:  24px;
  --font-ui:      'Space Grotesk', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-display: 'Orbitron', sans-serif;
  --radius:       6px;
  --radius-lg:    10px;
  --shadow:       0 4px 24px #00000066;
  --shadow-glow:  0 0 20px var(--accent-glow);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; background: var(--bg-main); color: var(--text-primary); font-family: var(--font-ui); font-size: 13px; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg-card); }
::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }
::selection { background: var(--accent-glow); }

/* ============================================================
   LAYOUT
============================================================ */
#app { display: grid; grid-template-rows: var(--header-h) 1fr auto; grid-template-columns: var(--sidebar-w) 1fr; height: 100vh; }
#header    { grid-column: 1/-1; grid-row: 1; display: flex; align-items: center; padding: 0; background: var(--bg-card); border-bottom: 1px solid var(--border); z-index: 100; }
#sidebar   { grid-column: 1; grid-row: 2; background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
#main      { grid-column: 2; grid-row: 2; overflow: hidden; position: relative; background: var(--bg-main); }
#bottom    { grid-column: 1/-1; grid-row: 3; background: var(--bg-card); border-top: 1px solid var(--border); display: flex; flex-direction: column; transition: height 0.3s ease; height: var(--bottom-h); overflow: hidden; }
#bottom.collapsed { height: 38px !important; }

/* dotgrid background on main */
#main::before { content:''; position:absolute; inset:0; background-image: radial-gradient(circle, #1e2d4a 1px, transparent 1px); background-size: 28px 28px; opacity: 0.4; pointer-events: none; z-index: 0; }

/* ============================================================
   HEADER
============================================================ */
.header-logo-area { width: var(--sidebar-w); height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-right: 1px solid var(--border); flex-shrink: 0; }
.header-main-area { flex: 1; height: 100%; display: flex; align-items: center; padding: 0 16px; gap: 12px; min-width: 0; }
.logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--accent); white-space: nowrap; letter-spacing: 1px; }
.logo-icon { font-size: 18px; filter: drop-shadow(0 0 8px var(--accent)); }
.logo-sub { font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); font-weight: 400; letter-spacing: 2px; display: block; margin-top: -4px; }
.project-menu-wrap { position: relative; }
.menu-btn { background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); transition: all 0.2s; padding: 8px; }
.menu-btn:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }
.menu-btn svg { width: 100%; height: 100%; }
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 10px; width: 220px; background: rgba(21, 28, 46, 0.85); backdrop-filter: blur(16px) saturate(180%); border: 1px solid var(--border-light); border-top: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5); z-index: 1000; display: flex; flex-direction: column; padding: 6px 0; }
.dropdown-menu.hidden { display: none; }
.dropdown-item { padding: 10px 16px; font-family: var(--font-ui); font-size: 13px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
.dropdown-item:hover { background: var(--accent-glow); color: var(--text-primary); border-left: 2px solid var(--accent); padding-left: 14px; }
.dropdown-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 6px 0; }
.h-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
.room-tabs { display: flex; gap: 6px; overflow-x: auto; min-width: 0; padding-bottom: 6px; align-items: center; }
.room-tab { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card2); color: var(--text-secondary); font-family: var(--font-ui); font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.room-tab:hover { border-color: var(--accent); color: var(--text-primary); }
.room-tab.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.room-tab .close-btn { opacity: 0; font-size: 10px; transition: opacity 0.2s; }
.room-tab:hover .close-btn { opacity: 1; }
.room-tab-add { padding: 4px 10px; border-radius: var(--radius); border: 1px dashed var(--border); background: transparent; color: var(--text-muted); cursor: pointer; font-size: 16px; line-height: 1; transition: all 0.2s; }
.room-tab-add:hover { border-color: var(--green); color: var(--green); }
.h-search { position: relative; }
.h-search input { background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; padding: 5px 10px 5px 30px; border-radius: var(--radius); width: 200px; outline: none; transition: all 0.2s; }
.h-search input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); width: 240px; }
.h-search::before { content: '⌕'; position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }
.h-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card2); color: var(--text-secondary); font-family: var(--font-ui); font-size: 11px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.h-btn:hover { border-color: var(--accent); color: var(--text-primary); background: var(--accent-glow); }
.h-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.h-btn.danger:hover { border-color: var(--red); color: var(--red); background: var(--red-glow); }
.h-btn-group { display: flex; gap: 2px; }
.h-btn-group .h-btn { border-radius: 0; }
.h-btn-group .h-btn:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.h-btn-group .h-btn:last-child  { border-radius: 0 var(--radius) var(--radius) 0; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* ============================================================
   SIDEBAR
============================================================ */
.sb-header { padding: 12px 14px 8px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
#stats-container.hidden { display: none !important; }
.sb-stats { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 10px; }
.stat-pill { flex: 1; background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 4px; display: flex; flex-direction: column; align-items: center; gap: 6px; overflow: hidden; cursor: default; }
.stat-pill:hover { border-color: var(--accent); }
.stat-icon-wrap { width: 32px; height: 32px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-wrap svg { width: 16px; height: 16px; }
.stat-pill .value { font-size: 15px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); line-height: 1; text-align: center; }
.stat-pill .value.green { color: var(--green); }
.stat-pill .value.amber { color: var(--amber); }
.cap-bar-wrap { margin-bottom: 6px; }
.cap-bar-labels { display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 3px; }
.cap-bar { height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; }
.cap-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.cap-bar-fill.rack  { background: linear-gradient(90deg, var(--accent), var(--cyan)); }
.cap-bar-fill.power { background: linear-gradient(90deg, var(--green), var(--amber)); }
.sb-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid var(--border); }
.btn-primary { padding: 7px 10px; border-radius: var(--radius); border: 1px solid var(--accent); background: var(--accent-glow); color: var(--accent); font-family: var(--font-ui); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px; }
.btn-primary:hover { background: var(--accent); color: var(--bg-main); }
.btn-secondary { padding: 7px 10px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-family: var(--font-ui); font-size: 11px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px; }
.btn-secondary:hover { border-color: var(--green); color: var(--green); background: var(--green-glow); }
.sb-search { padding: 8px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.sb-search input { width: 100%; background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: 11px; padding: 6px 10px; border-radius: var(--radius); outline: none; }
.sb-search input:focus { border-color: var(--accent); }
.sb-filter-tabs { 
  display: flex; 
  gap: 4px; 
  padding: 8px 14px; 
  flex-shrink: 0; 
  overflow-x: auto; 
  scrollbar-width: none; 
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.sb-filter-tabs::-webkit-scrollbar {
  display: none;
}
.filter-tab { 
  padding: 3px 9px; 
  border-radius: 20px; 
  border: 1px solid var(--border); 
  background: transparent; 
  color: var(--text-muted); 
  font-size: 11px; 
  cursor: pointer; 
  transition: all 0.15s; 
  font-family: var(--font-ui); 
  flex-shrink: 0;
}
.filter-tab:hover { border-color: var(--accent); color: var(--text-primary); }
.filter-tab.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.catalog { flex: 1; overflow-y: auto; padding: 6px 14px 14px; }
.catalog-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 6px; cursor: grab; transition: all 0.2s; user-select: none; }
.catalog-item:hover { border-color: var(--accent); background: var(--accent-glow); transform: translateX(2px); }
.catalog-item:active { cursor: grabbing; }
.catalog-item.dragging { opacity: 0.4; }
.cat-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.cat-info { flex: 1; min-width: 0; }
.cat-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cat-meta { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.cat-size { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: var(--border); color: var(--text-secondary); font-family: var(--font-mono); font-weight: 700; flex-shrink: 0; }

/* ============================================================
   MAIN CANVAS AREA
============================================================ */
.main-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); z-index: 10; position: relative; flex-shrink: 0; }
.view-tabs { display: flex; background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.view-tab { padding: 5px 14px; font-size: 12px; cursor: pointer; color: var(--text-muted); transition: all 0.2s; border: none; background: transparent; font-family: var(--font-ui); }
.view-tab.active { background: var(--accent-glow); color: var(--accent); }
.zoom-label { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 42px; text-align: center; }
.spacer { flex: 1; }

/* Physical view */
#view-physical { padding: 24px; overflow: auto; height: 100%; position: relative; z-index: 1; touch-action: none; }
#view-physical.hidden, #view-topology.hidden { display: none !important; }

/* Topology canvas */
#view-topology { position: absolute; inset: 0; z-index: 1; }
#topology-canvas { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
#topology-canvas:active { cursor: grabbing; }

/* ============================================================
   RACK COMPONENT
============================================================ */
.rack-wrapper { flex-shrink: 0; display: flex; flex-direction: column; gap: 0; }
.rack-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; position: relative; }
.rack-card.drag-over { border-color: var(--accent); box-shadow: 0 0 20px var(--accent-glow); }
.rack-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card2); border-bottom: 1px solid var(--border); }
.rack-title { font-size: 12px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); }
.rack-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rack-hdr-btns { display: flex; gap: 4px; }
.rack-btn { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all 0.15s; }
.rack-btn:hover { border-color: var(--accent); color: var(--accent); }
.rack-btn.del:hover { border-color: var(--red); color: var(--red); }
.rack-body { display: flex; background: #090d17; }
.rack-rail-left, .rack-rail-right { width: 22px; background: linear-gradient(180deg, #1a2035 0%, #0f1522 100%); display: flex; flex-direction: column; border-right: 1px solid #1e2c44; border-left: 1px solid #1e2c44; flex-shrink: 0; }
.rack-rail-right { border-left: 1px solid #1e2c44; border-right: none; }
.rail-unit { height: var(--rack-unit-h); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 7px; color: #2e4060; border-bottom: 1px solid #0d1220; flex-shrink: 0; }
.rail-unit:nth-child(5n) { color: #3d5480; }
.rack-slots { flex: 1; position: relative; min-width: 200px; }
.rack-slot { height: var(--rack-unit-h); border-bottom: 1px solid #0d1220; position: relative; transition: background 0.15s; flex-shrink: 0; }
.rack-slot.drop-highlight { background: var(--accent-glow) !important; }
.rack-slot.drop-invalid  { background: var(--red-glow) !important; }
.rack-slot.occupied { pointer-events: none; }

/* ============================================================
   DEVICE FACEPLATES
============================================================ */
.device-faceplate { position: absolute; left: 0; right: 0; z-index: 2; overflow: hidden; border-radius: 2px; cursor: pointer; transition: box-shadow 0.2s; pointer-events: auto; }
.device-faceplate:hover { z-index: 3; }
.device-faceplate.search-match { box-shadow: 0 0 0 2px var(--accent), 0 0 20px var(--accent-glow) !important; z-index: 4; }
.device-faceplate.search-dim { opacity: 0.2 !important; }

/* Server faceplate */
.fp-server { background: linear-gradient(180deg, #1e2840 0%, #141c2e 100%); border: 1px solid #2a3652; display: flex; align-items: center; gap: 0; height: 100%; }
.fp-server .vent { width: 28px; height: 100%; background: repeating-linear-gradient(0deg, transparent, transparent 2px, #0a0f1a 2px, #0a0f1a 3px); border-right: 1px solid #1a2236; flex-shrink: 0; }
.fp-server .ear { width: 12px; background: linear-gradient(90deg, #1a2235, #222d45); border-right: 1px solid #2a3652; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
.fp-server .ear::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #c0c8d8; box-shadow: 0 0 3px #ffffff55; }
.fp-server .fp-mid { flex: 1; padding: 2px 6px; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 1px; }
.fp-server .lcd { background: #000b00; border: 1px solid #1a3020; border-radius: 2px; padding: 1px 4px; font-family: var(--font-mono); font-size: 7px; color: #00ff88; text-shadow: 0 0 4px #00ff88; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-server .dev-name { font-family: var(--font-mono); font-size: 8px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-server .fp-right { display: flex; align-items: center; gap: 4px; padding-right: 8px; flex-shrink: 0; }
.power-btn { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a3a25; background: radial-gradient(circle at 40% 40%, #1aff88, #0d6632); box-shadow: 0 0 6px #00ff8888; flex-shrink: 0; }
.power-btn.off { background: radial-gradient(circle at 40% 40%, #ff4444, #8b0000); box-shadow: 0 0 6px #ff444488; border-color: #3a1a1a; }
.fp-server .ear-r { width: 12px; background: linear-gradient(90deg, #222d45, #1a2235); border-left: 1px solid #2a3652; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
.fp-server .ear-r::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #c0c8d8; box-shadow: 0 0 3px #ffffff55; }

/* Switch faceplate */
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

/* UPS faceplate */
.fp-ups { background: linear-gradient(180deg, #0d0f14 0%, #090b10 100%); border: 1px solid #1a1f30; display: flex; align-items: center; gap: 0; height: 100%; }
.fp-ups .ups-left { width: 40px; background: #090b10; border-right: 1px solid #1a1f30; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 4px 0; }
.ups-led { width: 8px; height: 8px; border-radius: 50%; }
.ups-led.green { background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse-dot 2s infinite; }
.ups-led.amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
.ups-led.red   { background: var(--red);   box-shadow: 0 0 6px var(--red); }
.ups-led.off   { background: #1a1f30; }
.fp-ups .ups-lcd { flex: 1; background: #00050f; margin: 6px; border: 1px solid #0a2040; border-radius: 3px; display: flex; flex-direction: column; justify-content: center; padding: 4px 8px; gap: 2px; }
.ups-lcd-line { font-family: var(--font-mono); font-size: 8px; color: #00aaff; text-shadow: 0 0 6px #00aaff; letter-spacing: 1px; animation: flicker 8s infinite; }
@keyframes flicker { 0%,95%,100%{opacity:1} 96%,98%{opacity:0.7} }
.fp-ups .ups-right { width: 36px; border-left: 1px solid #1a1f30; height: 100%; background: #0a0c14; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0; }
.ups-jack { width: 14px; height: 10px; background: #0a0f1a; border: 1px solid #2a3050; border-radius: 2px; }

/* Router faceplate */
.fp-router { background: linear-gradient(180deg, #14100a 0%, #0f0c07 100%); border: 1px solid #2a2010; display: flex; align-items: center; height: 100%; }
.fp-router .rtr-brand { width: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid #2a2010; height: 100%; flex-shrink: 0; }
.fp-router .rtr-logo { font-family: var(--font-display); font-size: 14px; font-weight: 800; color: var(--amber); letter-spacing: 1px; text-shadow: -1px 0 0 rgba(255,0,0,0.8), 1px 0 0 rgba(0,255,0,0.5); }
.fp-router .sfp-row { flex: 1; display: flex; align-items: center; justify-content: flex-start; gap: 6px; padding: 4px 10px; }
.sfp-module { width: 14px; height: 11px; background: transparent; border: 1px solid #5a401a; border-radius: 2px; position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sfp-module::before { content: ''; position: absolute; top: 2px; left: 50%; transform: translateX(-50%); width: 6px; height: 1px; background: #5a401a; border-radius: 0; }
.sfp-module::after { content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 4px; height: 3px; border-radius: 1px; background: var(--amber); box-shadow: 0 0 6px var(--amber), 0 0 2px #fff; animation: port-blink 3s infinite; animation-delay: var(--blink-delay, 0s); }
.fp-router .vent-r { width: 28px; height: 100%; background: repeating-linear-gradient(90deg, #14100a, #14100a 2px, #050402 2px, #050402 5px); border-left: 1px solid #2a2010; flex-shrink: 0; }

/* Firewall faceplate */
.fp-firewall { background: linear-gradient(180deg, #1a0a0a 0%, #0f0606 100%); border: 1px solid #3a1515; display: flex; align-items: center; height: 100%; }
.fp-firewall .fw-icon { width: 36px; display: flex; align-items: center; justify-content: center; font-size: 14px; border-right: 1px solid #3a1515; height: 100%; flex-shrink: 0; }
.fp-firewall .fw-mid { flex: 1; padding: 4px 8px; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.fp-firewall .fw-name { font-family: var(--font-mono); font-size: 9px; color: var(--red); text-shadow: 0 0 6px var(--red); }
.fp-firewall .fw-status { font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); }
.fp-firewall .fw-leds { display: flex; gap: 3px; align-items: center; padding-right: 8px; flex-shrink: 0; }
.fw-led { width: 6px; height: 6px; border-radius: 50%; }
.fw-led.g { background: var(--green); box-shadow: 0 0 4px var(--green); animation: pulse-dot 1.5s infinite; }
.fw-led.r { background: var(--red);   box-shadow: 0 0 4px var(--red); }
.fw-led.a { background: var(--amber); box-shadow: 0 0 4px var(--amber); animation: pulse-dot 2s infinite; }

/* Storage faceplate */
.fp-storage { background: linear-gradient(180deg, #0a0a1a 0%, #060610 100%); border: 1px solid #1a1a40; display: flex; align-items: center; height: 100%; }
.fp-storage .st-left { width: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-right: 1px solid #1a1a40; height: 100%; flex-shrink: 0; }
.fp-storage .st-drives { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); grid-auto-rows: 1fr; gap: 4px 6px; padding: 4px 12px; align-content: stretch; }
.drive-slot { width: 100%; height: 100%; min-height: 12px; background: transparent; border: 1px solid #2a2a4a; border-radius: 2px; position: relative; }
.drive-slot.active::after { content: ''; position: absolute; top: -3px; right: 2px; width: 3px; height: 3px; border-radius: 50%; background: var(--green); box-shadow: 0 0 4px var(--green); animation: port-blink 1.5s infinite; animation-delay: var(--blink-delay, 0s); }
.fp-storage .st-right { width: 40px; border-left: 1px solid #1a1a40; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex-shrink: 0; padding: 4px; }
.st-port { width: 18px; height: 8px; background: transparent; border: 1px solid #2a2a4a; border-radius: 2px; }

/* ============================================================
   BOTTOM PANEL
============================================================ */
.bottom-header { display: flex; align-items: center; gap: 8px; padding: 0 14px; height: 38px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tab-pills { display: flex; gap: 2px; }
.tab-pill { padding: 4px 12px; border-radius: var(--radius); border: none; background: transparent; color: var(--text-muted); font-family: var(--font-ui); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.tab-pill.active { background: var(--accent-glow); color: var(--accent); }
.table-wrap { flex: 1; overflow: auto; }
table.data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
table.data-table th { padding: 6px 12px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); border-bottom: 1px solid var(--border); background: var(--bg-card); position: sticky; top: 0; font-family: var(--font-mono); white-space: nowrap; }
table.data-table td { padding: 5px 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-family: var(--font-mono); vertical-align: middle; white-space: nowrap; }
table.data-table tr:hover td { background: var(--bg-card2); }
table.data-table td.editable { cursor: text; }
table.data-table td.editable:hover { color: var(--text-primary); }
table.data-table td input.cell-edit { background: var(--bg-card2); border: 1px solid var(--accent); color: var(--text-primary); font-family: var(--font-mono); font-size: 11px; padding: 2px 6px; border-radius: 3px; outline: none; width: 100%; }
table.data-table td input.cell-edit.error { border-color: var(--red); box-shadow: 0 0 8px var(--red-glow); animation: shake 0.3s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
.type-badge { padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-mono); }
.type-badge.server   { background: #0ea5e922; color: var(--accent); }
.type-badge.switch   { background: #10b98122; color: var(--green); }
.type-badge.firewall { background: #ef444422; color: var(--red); }
.type-badge.router   { background: #f59e0b22; color: var(--amber); }
.type-badge.ups      { background: #8b5cf622; color: var(--purple); }
.type-badge.storage  { background: #06b6d422; color: var(--cyan); }
.tbl-action { padding: 2px 7px; border-radius: 3px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 10px; cursor: pointer; transition: all 0.15s; font-family: var(--font-ui); }
.tbl-action:hover { border-color: var(--red); color: var(--red); }
.cable-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
.empty-state .icon { font-size: 32px; margin-bottom: 8px; opacity: 0.4; }

/* ============================================================
   MODALS
============================================================ */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(6px); z-index: 100000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
.modal-overlay.hidden { display: none; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background: rgba(21, 28, 46, 0.9); backdrop-filter: blur(20px) saturate(200%); border: 1px solid var(--border-light); border-top: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 24px; min-width: 380px; max-width: 540px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.6), 0 0 30px var(--accent-glow); animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from{transform:translateY(30px) scale(0.95);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
.modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.modal-sub { font-size: 11px; color: var(--text-muted); margin-bottom: 20px; font-family: var(--font-mono); }
.form-row { margin-bottom: 14px; }
.form-row label { display: block; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-family: var(--font-mono); }
.form-row input, .form-row select, .form-row textarea { width: 100%; background: var(--bg-card2); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; padding: 8px 10px; border-radius: var(--radius); outline: none; transition: border-color 0.2s; }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { border-color: var(--accent); }
.form-row select option { background: var(--bg-card2); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-ui); font-size: 12px; transition: all 0.2s; }
.btn-cancel:hover { border-color: var(--text-secondary); }
.btn-confirm { padding: 8px 16px; border-radius: var(--radius); border: 1px solid var(--accent); background: var(--accent-glow); color: var(--accent); cursor: pointer; font-family: var(--font-ui); font-size: 12px; font-weight: 600; transition: all 0.2s; }
.btn-confirm:hover { background: var(--accent); color: var(--bg-main); }
.btn-confirm.danger { border-color: var(--red); background: var(--red-glow); color: var(--red); }
.btn-confirm.danger:hover { background: var(--red); color: white; }

/* ============================================================
   DRAG GHOST
============================================================ */
#drag-ghost { position: fixed; pointer-events: none; z-index: 9999; opacity: 0.85; left: -9999px; top: -9999px; }

/* ============================================================
   NOTIFICATIONS
============================================================ */
#notif-area { position: fixed; bottom: 240px; right: 16px; z-index: 9000; display: flex; flex-direction: column; gap: 6px; }
.notif { padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius); font-size: 12px; font-family: var(--font-mono); box-shadow: var(--shadow); animation: notifIn 0.3s; display: flex; align-items: center; gap: 8px; min-width: 200px; max-width: 320px; }
@keyframes notifIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
.notif.success { border-color: var(--green); color: var(--green); }
.notif.error   { border-color: var(--red);   color: var(--red); }
.notif.info    { border-color: var(--accent); color: var(--accent); }
.notif.warn    { border-color: var(--amber);  color: var(--amber); }

/* ============================================================
   CONTEXT MENU
============================================================ */
#ctx-menu { position: fixed; background: rgba(21, 28, 46, 0.85); backdrop-filter: blur(16px) saturate(180%); border: 1px solid var(--border-light); border-top: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); padding: 4px 0; z-index: 100000; min-width: 160px; box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5); }
#ctx-menu.hidden { display: none; }
.ctx-item { padding: 8px 14px; font-size: 12px; font-family: var(--font-ui); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; }
.ctx-item:hover { background: var(--accent-glow); color: var(--text-primary); padding-left: 18px; }
.ctx-item.danger:hover { background: var(--red-glow); color: var(--red); padding-left: 18px; }
.ctx-sep { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 4px 0; }

/* ============================================================
   MISC
============================================================ */
.tooltip { position: relative; }
.tooltip::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 5px); left: 50%; transform: translateX(-50%); background: var(--bg-card2); border: 1px solid var(--border); padding: 3px 8px; border-radius: 4px; font-size: 10px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s; font-family: var(--font-mono); color: var(--text-secondary); }
.tooltip:hover::after { opacity: 1; }
.color-input-wrap { display: flex; align-items: center; gap: 8px; }
.color-input-wrap input[type=color] { width: 32px; height: 28px; padding: 2px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card2); cursor: pointer; }
.color-input-wrap input[type=text] { flex: 1; }
.connectivity-line { position: absolute; pointer-events: none; }

/* File drop zone */
.drop-zone { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 20px; text-align: center; transition: all 0.2s; cursor: pointer; }
.drop-zone.drag-over { border-color: var(--accent); background: var(--accent-glow); }
.drop-zone p { color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
/* ============================================================
   DEVICE ACTIONS (HOVER)
============================================================ */
.device-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}
.device-faceplate:hover .device-actions {
  opacity: 1;
}
.dev-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.15s;
}
.dev-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-card2); }
.dev-btn.del:hover { border-color: var(--red); color: var(--red); }

.sb-title { padding: 8px 14px; font-size: 10px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: var(--bg-card1); border-bottom: 1px solid var(--border); }
.sb-title:hover { color: var(--text-primary); }

.fullscreen { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 9999 !important; background: var(--bg-main) !important; margin: 0 !important; border: none !important; border-radius: 0 !important; max-height: none !important; }

/* ============================================================
   TOOLTIPS FLOTANTES
============================================================ */
#device-tooltip { position: fixed; background: rgba(21, 28, 46, 0.85); backdrop-filter: blur(12px) saturate(150%); border: 1px solid var(--border-light); border-top: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 10000; pointer-events: none; width: 220px; transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateX(-15px) scale(0.95); }
#device-tooltip.visible { opacity: 1; transform: translateX(0) scale(1); }
#device-tooltip .tt-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
#device-tooltip .tt-row { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between; }
#device-tooltip .tt-row span:first-child { color: var(--text-muted); }

/* ============================================================
   MOBILE RESPONSIVENESS
============================================================ */
@media (max-width: 768px) {
  #mobile-menu-btn { display: flex !important; margin-right: 8px; }
  
  /* App grid is 1 column, allow header to grow vertically */
  #app { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }
  
  /* Header splits into two rows */
  #header { flex-direction: column; height: auto; align-items: stretch; overflow: visible; min-width: 0; }
  .header-logo-area { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 8px 16px; justify-content: flex-start; }
  .header-logo-area .project-menu-wrap { margin-left: auto; }
  
  /* Make the main area a horizontally scrolling ribbon */
  .header-main-area { width: 100%; height: auto; flex: none; overflow-x: auto; padding: 8px 16px; flex-wrap: nowrap; gap: 12px; }
  .header-main-area .spacer { display: none; }
  .header-main-area > * { flex-shrink: 0; }
  .room-tabs { overflow-x: visible; }
  
  #sidebar { 
    position: fixed; top: 110px; left: -100%; width: 260px; height: calc(100vh - 110px); 
    z-index: 999; transition: left 0.3s ease; box-shadow: 10px 0 20px rgba(0,0,0,0.5);
  }
  #sidebar.open { left: 0; }
  #main { grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  #bottom { min-width: 0; }
  
  /* Make toolbars scrollable horizontally instead of wrapping awkwardly */
  .main-toolbar { width: 100%; overflow-x: auto; flex-wrap: nowrap; overflow-y: hidden; }
  .main-toolbar .spacer { display: none; } /* Hide spacers so items group together */
  .main-toolbar .h-btn { white-space: nowrap; flex-shrink: 0; }
  .view-tabs { flex-shrink: 0; }
  
  /* Tables panel horizontally scrollable */
  .table-container { overflow-x: auto; }
  table.data-table { min-width: 600px; }
  
  /* Bottom controls scrollable */
  .bottom-header { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding: 6px 16px; }
  .bottom-header .spacer { display: none; }
  .bottom-header .h-btn, .bottom-header .btn-primary { white-space: nowrap; flex-shrink: 0; margin-right: 8px !important; }
  .tab-pills { flex-shrink: 0; margin-right: 8px; }

  /* Modals */
  .modal { min-width: 0; width: 92%; padding: 16px; margin: 0 auto; max-height: 90vh; overflow-y: auto; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
}

/* ============================================================
   FLOOR DEVICES SECTION
============================================================ */
.floor-section {
  width: 100%;
  margin-top: 32px;
  background: var(--bg-card);
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floor-section:hover {
  border-color: var(--border);
}

.floor-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(21, 28, 46, 0.6);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.floor-device-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 20px;
}

.floor-devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 16px;
  min-height: 90px;
  transition: all 0.2s ease;
}

.floor-devices-grid.drag-over {
  background: var(--accent-glow);
  border-color: var(--accent);
}

.floor-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 24px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

.floor-device-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--floor-color, var(--accent));
  border-radius: var(--radius);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.floor-device-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02) 50%, transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.floor-device-card:hover::before {
  transform: translateX(100%);
}

.floor-device-card:hover {
  border-color: var(--floor-color, var(--accent));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--floor-color) 20%, transparent), 0 0 1px var(--floor-color);
}

.floor-device-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--floor-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--floor-color) 20%, transparent);
  color: var(--floor-color);
  transition: transform 0.2s ease;
}

.floor-device-card:hover .floor-device-icon {
  transform: scale(1.1) rotate(3deg);
}

.floor-device-info {
  min-width: 0;
  flex: 1;
}

.floor-device-name {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 550;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.floor-device-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Catalog tab color accent for floor filter */
.filter-tab[data-filter="floor"] {
  border-color: rgba(139, 92, 246, 0.3);
}
.filter-tab[data-filter="floor"]:hover {
  border-color: var(--purple);
  color: var(--text-primary);
  background: rgba(139, 92, 246, 0.15);
}
.filter-tab[data-filter="floor"].active {
  background: rgba(139, 92, 246, 0.25);
  border-color: var(--purple);
  color: var(--purple);
}

``

## js\store.js

``javascript

class Store {
  constructor() {
    this._undoStack = [];
    this._redoStack = [];
    this._listeners = {};
    this._raw = this._load();
    this.state = this._makeProxy(this._raw);
  }

  _defaultState() {
    const roomId = uid();
    const rack1  = uid();
    const rack2  = uid();
    const dev1   = uid();
    const dev2   = uid();
    const dev3   = uid();
    const dev4   = uid();
    return {
      rooms: [{ id: roomId, name: 'Sala A: Centro de Datos Principal' }],
      racks: [
        { id: rack1, roomId, name: 'Rack rack 1', height: 14, color: '#0ea5e9', devices: [] },
        { id: rack2, roomId, name: 'Rack rack 2', height: 14, color: '#10b981', devices: [] }
      ],
      devices: [
        { id: dev1, rackId: rack1, name: 'Switch Cisco 48P', type: 'switch',   slotStart: 1, size: 1, ip: '192.168.1.1',  mac: '04:05:0F:11:02:AA', serial: 'CSW-001', power: 180, user: 'admin', pass: 'cisco123', notes: '' },
        { id: dev2, rackId: rack1, name: 'Firewall Fortinet', type: 'firewall', slotStart: 2, size: 1, ip: '192.183.18.1', mac: '04:05:0F:11:02:BB', serial: 'FWL-001', power: 40,  user: 'Diana',    pass: 'fort123',  notes: '' },
        { id: dev3, rackId: rack2, name: 'Server Dell R740',  type: 'server',   slotStart: 1, size: 2, ip: '192.183.18.2', mac: '03:02:25:51:6C:CC', serial: 'SRV-001', power: 550, user: 'Aktadelina', pass: 'dell456', notes: '' },
        { id: dev4, rackId: rack2, name: 'SAN Storage 4U',   type: 'storage',  slotStart: 3, size: 4, ip: '192.168.1.50', mac: 'AA:BB:CC:DD:EE:FF',  serial: 'STO-001', power: 300, user: 'admin',    pass: 'san789',   notes: '' }
      ],
      connections: [
        { id: uid(), sourceDeviceId: dev1, sourcePort: 'Eth0/1', targetDeviceId: dev2, targetPort: 'Port1', cableType: 'Cobre', color: '#3b82f6' },
        { id: uid(), sourceDeviceId: dev2, sourcePort: 'Port2',  targetDeviceId: dev3, targetPort: 'Eth0', cableType: 'Fibra SM', color: '#ef4444' }
      ],
      currentRoomId: roomId,
      selectedDeviceId: null,
      topoPositions: {},
      zoom: 1,
      panX: 0,
      panY: 0
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
    return new Proxy(obj, {
      set: (target, key, value) => {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) return true;
        target[key] = typeof value === 'object' && value !== null ? this._makeProxy(value, `${path}.${key}`) : value;
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
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  }

  /** Guarda snapshot para Deshacer */
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
    if(btnUndo) btnUndo.disabled = !this._undoStack.length;
    if(btnRedo) btnRedo.disabled = !this._redoStack.length;
  }

  /* ---- Helpers de datos ---- */
  get currentRoom()  { return this._raw.rooms.find(r => r.id === this._raw.currentRoomId); }
  get currentRacks() { return this._raw.racks.filter(r => r.roomId === this._raw.currentRoomId); }
  allDevicesInRack(rackId) { return (this._raw.devices || []).filter(d => d.rackId === rackId && d.category !== 'floor'); }
  allFloorDevicesInRoom(roomId) { return (this._raw.devices || []).filter(d => d.category === 'floor' && d.roomId === roomId); }

  addFloorDevice(template, roomId, floorX = 100, floorY = 100) {
    this.snapshot();
    const device = {
      id:        uid(),
      rackId:    null,
      category:  'floor',
      roomId:    roomId,
      name:      template.name  || 'Nuevo equipo',
      type:      template.type,
      ip:        template.ip    || '',
      mac:       template.mac   || '',
      serial:    template.serial|| '',
      power:     parseInt(template.power) || 0,
      plugs:     parseInt(template.plugs) || 1,
      user:      template.user  || 'admin',
      pass:      template.pass  || '',
      notes:     template.notes || ''
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

  /** Agrega un equipo al rack en la posición dada */
  addDeviceToRack(deviceTemplate, rackId, slotStart) {
    const rack = this.rackById(rackId);
    if (!rack) return false;
    const size = parseInt(deviceTemplate.size);
    // Validación de límites
    if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
    // Validación de colisiones
    const existing = this.allDevicesInRack(rackId);
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = slotStart + size - 1;
      if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
    }
    this.snapshot();
    const newDev = {
      id: uid(), rackId, name: deviceTemplate.name, type: deviceTemplate.type,
      slotStart, size, ip: deviceTemplate.ip || '', mac: deviceTemplate.mac || '',
      serial: deviceTemplate.serial || '', power: deviceTemplate.power || 0,
      user: deviceTemplate.user || 'admin', pass: deviceTemplate.pass || '',
      notes: deviceTemplate.notes || ''
    };
    this._raw.devices.push(newDev);
    this._save(); 
    this._emit('change', { source: 'addDeviceToRack' });
    return true;
  }

  moveDevice(deviceId, newRackId, newSlot) {
    const dev = this.deviceById(deviceId);
    if (!dev) return false;
    const rack = this.rackById(newRackId);
    if (!rack) return false;
    const size = dev.size;
    if (newSlot < 1 || newSlot + size - 1 > rack.height) return false;
    const existing = this.allDevicesInRack(newRackId).filter(d => d.id !== deviceId);
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = newSlot + size - 1;
      if (!(nEnd < d.slotStart || newSlot > dEnd)) return false;
    }
    this.snapshot();
    dev.rackId = newRackId;
    dev.slotStart = newSlot;
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
    this._save();
    this._emit('change', { source: 'loadData' });
    this._updateHistoryButtons();
  }

  /** Estadísticas calculadas */
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
``

## js\demoData.js

``javascript
function loadDemoData() {
  const r1 = uid(); const r2 = uid(); const r3 = uid();
  const rooms = [
    { id: r1, name: 'Data Center' },
    { id: r2, name: 'Edificio A2' },
    { id: r3, name: 'Edificio B1' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  const rackSpecs = [
    // Data Center
    { room: r1, name: 'Rack 101', id_num: 101 },
    { room: r1, name: 'Rack 102', id_num: 102 },
    { room: r1, name: 'Rack 103', id_num: 103 },
    { room: r1, name: 'Rack 104', id_num: 104 },
    // Edificio A2
    { room: r2, name: 'Rack 201', id_num: 201 },
    { room: r2, name: 'Rack 202', id_num: 202 },
    { room: r2, name: 'Rack 203', id_num: 203 },
    // Edificio B1
    { room: r3, name: 'Rack 301', id_num: 301 },
    { room: r3, name: 'Rack 302', id_num: 302 },
    { room: r3, name: 'Rack 303', id_num: 303 },
    { room: r3, name: 'Rack 304', id_num: 304 },
    { room: r3, name: 'Rack 305', id_num: 305 }
  ];

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  let coreSwitchId = uid();
  let firewallId = uid();

  rackSpecs.forEach((spec, index) => {
    const rackId = uid();
    racks.push({
      id: rackId, roomId: spec.room, 
      name: spec.name, 
      height: 42, color: colors[index % colors.length], devices: []
    });

    // Switch - VLAN 10
    const swId = uid();
    devices.push({ id: swId, rackId, name: `Switch ${spec.name}`, type: 'switch', slotStart: 40, size: 1, ip: `10.10.10.${spec.id_num}`, mac: `00:11:22:33:10:${spec.id_num.toString(16)}`, serial: `SW-${spec.id_num}`, power: 250, plugs: 1, user: 'admin', pass: 'cisco', notes: 'VLAN 10 - Infraestructura' });

    // UPS - VLAN 20
    const upsId = uid();
    devices.push({ id: upsId, rackId, name: `UPS ${spec.name}`, type: 'ups', slotStart: 1, size: 2, ip: `10.10.20.${spec.id_num}`, mac: `00:11:22:33:20:${spec.id_num.toString(16)}`, serial: `UPS-${spec.id_num}`, power: 3000, plugs: 8, user: 'admin', pass: 'ups123', notes: 'VLAN 20 - UPS' });

    // Servers - VLAN 30
    let baseIP = (index * 10) + 10;
    
    for(let s=1; s<=5; s++) {
      const srvId = uid();
      let srvIp = `10.10.30.${baseIP + s}`;
      devices.push({ id: srvId, rackId, name: `Servidor Nodo ${s} - ${spec.name}`, type: 'server', slotStart: 3 + (s-1)*3, size: 2, ip: srvIp, mac: 'AA:BB:CC:00:30:'+(baseIP+s).toString(16), serial: `SRV-${spec.id_num}-${s}`, power: 600, plugs: 2, user: 'root', pass: 'secret', notes: 'VLAN 30 - Servidores' });
      
      // Conexión del servidor al switch del rack
      connections.push({ id: uid(), sourceDeviceId: srvId, sourcePort: `eth0`, targetDeviceId: swId, targetPort: `Gi1/0/${s}`, cableType: 'Cobre', color: '#10b981' });
    }

    // Si es Rack 101, meter Firewall y Core Switch
    if(spec.id_num === 101) {
      devices.push({ id: firewallId, rackId, name: `Firewall Edge`, type: 'firewall', slotStart: 42, size: 1, ip: '10.10.10.1', mac: '12:34:56:78:90:01', serial: 'FW-01', power: 100, plugs: 1, user: 'admin', pass: 'fortinet', notes: 'VLAN 10 - Gateway' });
      devices.push({ id: coreSwitchId, rackId, name: `Core Switch`, type: 'switch', slotStart: 41, size: 1, ip: '10.10.10.2', mac: '12:34:56:78:90:02', serial: 'CSW-01', power: 300, plugs: 2, user: 'admin', pass: 'cisco', notes: 'VLAN 10 - Core' });
      connections.push({ id: uid(), sourceDeviceId: firewallId, sourcePort: 'LAN1', targetDeviceId: coreSwitchId, targetPort: 'Te1/0/1', cableType: 'DAC', color: '#ef4444' });
    }
    
    // Todos los switches de rack se conectan al Core Switch
    connections.push({ id: uid(), sourceDeviceId: swId, sourcePort: 'Te1/1/1', targetDeviceId: coreSwitchId, targetPort: `Te1/0/${spec.id_num}`, cableType: 'Fibra SM', color: '#3b82f6' });
  });

  // Equipos de piso
  const cam1 = uid(); const cam2 = uid(); const cam3 = uid();
  const prt1 = uid(); const prt2 = uid(); const prt3 = uid();
  const tel1 = uid(); const tel2 = uid();
  const ap1 = uid(); const ap2 = uid();

  devices.push(
    // Cámaras - VLAN 60
    { id: cam1, rackId: null, category: 'floor', roomId: r1, name: 'Cámara 01', type: 'camera', ip: '10.10.60.10', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    { id: cam2, rackId: null, category: 'floor', roomId: r2, name: 'Cámara 02', type: 'camera', ip: '10.10.60.11', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    { id: cam3, rackId: null, category: 'floor', roomId: r3, name: 'Cámara 03', type: 'camera', ip: '10.10.60.12', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    // Impresoras - VLAN 70
    { id: prt1, rackId: null, category: 'floor', roomId: r1, name: 'Impresora Administración', type: 'printer', ip: '10.10.70.10', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    { id: prt2, rackId: null, category: 'floor', roomId: r2, name: 'Impresora Finanzas', type: 'printer', ip: '10.10.70.11', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    { id: prt3, rackId: null, category: 'floor', roomId: r3, name: 'Impresora Recepción', type: 'printer', ip: '10.10.70.12', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    // Telefonía - VLAN 80
    { id: tel1, rackId: null, category: 'floor', roomId: r2, name: 'Teléfono 01', type: 'phone', ip: '10.10.80.10', mac: '', serial: '', power: 10, plugs: 1, user: '', pass: '', notes: 'VLAN 80' },
    { id: tel2, rackId: null, category: 'floor', roomId: r3, name: 'Teléfono 02', type: 'phone', ip: '10.10.80.11', mac: '', serial: '', power: 10, plugs: 1, user: '', pass: '', notes: 'VLAN 80' },
    // Access Points - IP Fija en VLAN 10 (proveen VLAN 50 / 90)
    { id: ap1, rackId: null, category: 'floor', roomId: r2, name: 'AP A2 Corporativo', type: 'ap', ip: '10.10.10.20', mac: '', serial: '', power: 20, plugs: 1, user: 'admin', pass: '', notes: 'Provee VLAN 50 y 90' },
    { id: ap2, rackId: null, category: 'floor', roomId: r3, name: 'AP B1 Corporativo', type: 'ap', ip: '10.10.10.30', mac: '', serial: '', power: 20, plugs: 1, user: 'admin', pass: '', notes: 'Provee VLAN 50 y 90' }
  );

  // Conexiones de equipos de piso al Core Switch (simplificado para demo)
  connections.push(
    { id: uid(), sourceDeviceId: cam1, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/1', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: cam2, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/2', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: cam3, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/3', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: prt1, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/10', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: prt2, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/11', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: prt3, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/12', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: tel1, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/20', cableType: 'Cobre', color: '#8b5cf6' },
    { id: uid(), sourceDeviceId: tel2, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/21', cableType: 'Cobre', color: '#8b5cf6' },
    { id: uid(), sourceDeviceId: ap1, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/30', cableType: 'Cobre', color: '#0ea5e9' },
    { id: uid(), sourceDeviceId: ap2, sourcePort: 'eth0', targetDeviceId: coreSwitchId, targetPort: 'Gi2/0/31', cableType: 'Cobre', color: '#0ea5e9' }
  );

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: r1,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if(typeof initTopoPositions === 'function') initTopoPositions();
  renderAll();
  
  notify('Redimensionamiento de IP y VLANs aplicado con éxito', 'success');
}
``

## js\utils.js

``javascript
const uid = () => Math.random().toString(36).slice(2, 10);
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
``

## js\main.js

``javascript
let currentView = 'physical';

function renderAll(event = {}) {
  const source = event.source || event.path || '';
  
  if (!source || ['loadData', 'undo', 'redo'].includes(source)) {
    renderRoomTabs();
    renderStats();
    renderCatalog();
    renderPhysical();
    renderBottomPanel();
    updateZoomLabel();
    if (currentView === 'topology') initTopoPositions();
    return;
  }

  if (source.includes('Room') || source === 'room-rename') {
    renderRoomTabs();
    renderPhysical();
  }
  
  if (source.includes('Rack')) {
    renderStats();
    renderPhysical();
  }
  
  if (source.includes('Device') || source === 'addFloorDevice' || source === 'moveDevice' || source === 'deleteDevice' || source === 'updateDevice' || source === 'addDeviceToRack') {
    renderStats();
    renderPhysical();
    renderBottomPanel();
  }
  
  if (source.includes('Connection')) {
    renderStats();
    renderBottomPanel();
  }

  if (source.includes('Zoom') || source.includes('Pan')) {
    updateZoomLabel();
  }
}

// Bind to store mutations
store.on('change', renderAll);

function initGlobalEvents() {
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = Math.min(3, (store._raw[pfx+'Zoom']||1) * 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = Math.max(0.2, (store._raw[pfx+'Zoom']||1) / 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = 1; store._raw[pfx+'PanX'] = 0; store._raw[pfx+'PanY'] = 0;
    updateZoomLabel();
  });

  // Panning for physical view
  let physPanStart = null;
  let panOrig = { x: 0, y: 0 };
  const viewPhysical = document.getElementById('view-physical');
  if(viewPhysical) {
    viewPhysical.addEventListener('pointerdown', e => {
      if (e.target.closest('.device-faceplate') || e.target.closest('.rack')) return;
      physPanStart = { x: e.clientX, y: e.clientY };
      panOrig = { x: store._raw.physPanX || 0, y: store._raw.physPanY || 0 };
    });
    window.addEventListener('pointermove', e => {
      if (physPanStart && currentView === 'physical') {
        const z = store._raw.physZoom || 1;
        store._raw.physPanX = panOrig.x + (e.clientX - physPanStart.x) / z;
        store._raw.physPanY = panOrig.y + (e.clientY - physPanStart.y) / z;
        updateZoomLabel();
      }
    });
    window.addEventListener('pointerup', () => { physPanStart = null; });
    window.addEventListener('pointercancel', () => { physPanStart = null; });
  }

  // View switching
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentView = tab.dataset.view;
      updateZoomLabel();
      const phys = document.getElementById('view-physical');
      const topo = document.getElementById('topology-canvas');
      if (currentView === 'physical') {
        phys.classList.remove('hidden');
        topo.style.display = 'none';
        stopTopo();
      } else {
        phys.classList.add('hidden');
        topo.style.display = 'block';
        startTopo();
      }
    });
  });

  // Project Menu Dropdown
  const btnMenu = document.getElementById('btn-project-menu');
  const dropdown = document.getElementById('project-dropdown');
  if (btnMenu && dropdown) {
    btnMenu.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) dropdown.classList.add('hidden');
    });

    document.getElementById('menu-open')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      document.getElementById('import-file').click();
    });
    document.getElementById('menu-save')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      const data = { version: 1, project: store._raw, catalog: CATALOG };
      downloadJSON(data, 'datacenter.rack');
    });
    document.getElementById('menu-clear')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (confirm('¿Estás seguro de que deseas limpiar el proyecto? Perderás todos los datos no guardados.')) {
        const roomId = uid();
        store.loadData({
          rooms: [{ id: roomId, name: 'Sala A1' }],
          racks: [],
          devices: [],
          connections: [],
          currentRoomId: roomId,
          selectedDeviceId: null,
          topology: { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} },
          topoZoom: 1, topoPanX: 0, topoPanY: 0,
          physZoom: 1, physPanX: 0, physPanY: 0
        });
        notify('Proyecto limpiado. Nueva sala A1 creada.', 'success');
      }
    });
    document.getElementById('menu-demo')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      const wantSave = confirm('¿Deseas guardar una copia de tu proyecto actual antes de cargar las demostraciones?\n\n(Recomendado para no perder tu progreso)');
      if (wantSave) {
        if (typeof exportJSON === 'function') exportJSON();
        // Dar un pequeño respiro para que el navegador inicie la descarga
        setTimeout(() => { loadDemoData(); }, 1500);
      } else {
        const proceed = confirm('⚠️ ADVERTENCIA: Todo tu diseño actual se perderá de forma permanente.\n\n¿Estás seguro de que quieres continuar SIN GUARDAR?');
        if (proceed) {
          loadDemoData();
        }
      }
    });
    document.getElementById('menu-export-cat')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      downloadJSON(CATALOG, 'catalog_backup.json');
    });
    document.getElementById('menu-import-cat')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      alert('Funcionalidad de importar catálogo (Próximamente)');
    });

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.project) {
              store.loadData(data.project);
              if (data.catalog) {
                CATALOG.length = 0;
                data.catalog.forEach(c => CATALOG.push(c));
                renderCatalog();
              }
              notify('Proyecto cargado', 'success');
            } else if (data.rooms) { // old format support
              store.loadData(data);
              notify('Proyecto cargado (formato antiguo)', 'success');
            } else {
              notify('Archivo inválido', 'error');
            }
          } catch(err) {
            notify('Error al leer el archivo', 'error');
          }
          importFile.value = '';
        };
        reader.readAsText(file);
      });
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }
  }

  // Bottom panel tabs
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      setActiveTab(pill.dataset.tab);
      renderBottomPanel();
    });
  });

  let bottomCollapsed = false;
  document.getElementById('btn-collapse-bottom').addEventListener('click', () => {
    bottomCollapsed = !bottomCollapsed;
    const bot = document.getElementById('bottom');
    if (bottomCollapsed) {
      bot.style.height = '38px';
      document.getElementById('btn-collapse-bottom').textContent = '▲';
    } else {
      bot.style.height = 'var(--bottom-h)';
      document.getElementById('btn-collapse-bottom').textContent = '▼';
    }
  });

  document.getElementById('global-search').addEventListener('input', () => {
    renderPhysical();
  });

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCatalog();
    });
  });
  document.getElementById('catalog-search').addEventListener('input', renderCatalog);

  // Header buttons
  document.getElementById('btn-add-rack').addEventListener('click', openAddRackModal);
  document.getElementById('btn-add-device-modal').addEventListener('click', openAddDeviceModal);
  const addDevTableBtn = document.getElementById('table-btn-add-device');
  if(addDevTableBtn) addDevTableBtn.addEventListener('click', openAddDeviceModal);
  const addPlacementTableBtn = document.getElementById('table-btn-add-placement');
  if(addPlacementTableBtn) addPlacementTableBtn.addEventListener('click', () => openQuickPlacementModal(null));
  const addConnTableBtn = document.getElementById('table-btn-add-conn');
  if(addConnTableBtn) addConnTableBtn.addEventListener('click', () => openCableModal());
  document.getElementById('btn-undo').addEventListener('click', () => store.undo());
  document.getElementById('btn-redo').addEventListener('click', () => store.redo());

  // Expand panel buttons
  document.getElementById('btn-expand-main').addEventListener('click', (e) => {
    const main = document.getElementById('main');
    main.classList.toggle('fullscreen');
    e.target.textContent = main.classList.contains('fullscreen') ? '⛶ Contraer' : '⛶ Expandir';
  });

  document.getElementById('btn-expand-bottom').addEventListener('click', (e) => {
    const bottom = document.getElementById('bottom');
    bottom.classList.toggle('fullscreen');
    e.target.textContent = bottom.classList.contains('fullscreen') ? '⛶ Contraer' : '⛶ Expandir';
  });

  document.getElementById('toggle-stats').addEventListener('click', () => {
    const container = document.getElementById('stats-container');
    const chevron = document.getElementById('stats-chevron');
    container.classList.toggle('hidden');
    chevron.textContent = container.classList.contains('hidden') ? '►' : '▼';
  });

  const tableSearch = document.getElementById('table-search');
  if(tableSearch) tableSearch.addEventListener('input', renderBottomPanel);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); store.redo(); }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      const ctxMenu = document.getElementById('ctx-menu');
      if(ctxMenu) ctxMenu.classList.add('hidden');
    }
  });

  const resizeObs = new ResizeObserver(() => {
    if (currentView === 'topology') { resizeCanvas(); }
  });
  const mainEl = document.getElementById('main');
  if(mainEl) resizeObs.observe(mainEl);
}

// loadDemoData() has been extracted to js/demoData.js for cleaner architecture
function init() {
  initTopology();
  initModals();
  initGlobalEvents();

  // Asegurar que canvas de topología empiece oculto
  const topoCanvas = document.getElementById('topology-canvas');
  if(topoCanvas) topoCanvas.style.display = 'none';

  renderAll();
  notify('⚡ RACK Designer modularizado', 'success', 2500);
}

init();
``

## js\ui\catalog.js

``javascript
let CATALOG = [
  { id:'c1', name:'Server HP ProLiant', type:'server',   size:2, power:460, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
  { id:'c2', name:'Server Dell R740',   type:'server',   size:2, power:550, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
  { id:'c3', name:'Server 1U',          type:'server',   size:1, power:200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
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

const TYPE_COLORS = { server:'#0ea5e9', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', ups:'#8b5cf6', storage:'#06b6d4', pc:'#0ea5e9', camera:'#8b5cf6', ap:'#10b981', door:'#f59e0b', printer:'#06b6d4', phone:'#ef4444' };

function addCatalogItem(item) {
  CATALOG.push(item);
  renderCatalog();
}
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
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}"
         style="border-left: 3px solid ${TYPE_COLORS[item.type]||'#444'}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22;color:${TYPE_COLORS[item.type]}">${escapeHTML(item.icon)}</div>
      <div class="cat-info">
        <div class="cat-name">${escapeHTML(item.name)}</div>
        <div class="cat-meta">${escapeHTML(item.type).toUpperCase()} │ ${escapeHTML(String(item.power))}W</div>
      </div>
      <div class="cat-size">${item.size ? item.size + 'U' : 'Piso'}</div>
      <div class="cat-actions" style="display:flex; flex-direction:column; gap:2px; margin-left:4px;">
        <button class="cat-btn place" data-place-cat="${item.id}" title="Ubicación Rápida" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--accent)">⚡</button>
        <button class="cat-btn edit" data-edit-cat="${item.id}" title="Editar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--text-muted)">✎</button>
        <button class="cat-btn del" data-del-cat="${item.id}" title="Eliminar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--red)">🗑</button>
      </div>
    </div>
  `).join('');
  
  cat.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', onCatalogDragStart);
    el.addEventListener('dragend',   onCatalogDragEnd);
    el.addEventListener('dblclick', () => {
      openQuickPlacementModal(el.dataset.catalogId);
    });
  });

  cat.querySelectorAll('.cat-btn.place').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickPlacementModal(btn.dataset.placeCat);
    });
  });
  
  cat.querySelectorAll('.cat-btn.edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditCatalogModal(btn.dataset.editCat);
    });
  });
  
  cat.querySelectorAll('.cat-btn.del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if(confirm('¿Eliminar plantilla del catálogo?')) {
        CATALOG = CATALOG.filter(c => c.id !== btn.dataset.delCat);
        renderCatalog();
      }
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
    
    btn.addEventListener('dblclick', e => {
      if (e.target.dataset.delRoom) return;
      const roomId = btn.dataset.roomId;
      const room = store._raw.rooms.find(r => r.id === roomId);
      if (room) {
        const newName = prompt('Editar nombre de la sala:', room.name);
        if (newName !== null && newName.trim() !== '') {
          room.name = newName.trim();
          store._emit('change', { source: 'room-rename' });
          notify('Sala renombrada a ' + room.name, 'success');
        }
      }
    });
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
  document.getElementById('cap-rack-bar').style.width = `${rackPct}%`;
  
  const maxPower = 5000;
  const powerPct = Math.min(100, Math.round((s.power / maxPower) * 100));
  document.getElementById('cap-power-val').textContent = `${s.power} W`;
  document.getElementById('cap-power-bar').style.width = `${powerPct}%`;
}
``

## js\ui\modals.js

``javascript
let editingRackId   = null;
let editingDeviceId = null;
let editingCatalogId = null;
let editingConnectionId = null;
const FLOOR_TYPES = new Set(['pc', 'camera', 'ap', 'door', 'printer', 'phone']);

function openAddRackModal() {
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

function openAddDeviceModal() {
  editingDeviceId = null;
  editingCatalogId = null;
  document.getElementById('modal-device-title').textContent = 'Nuevo Equipo';
  document.getElementById('modal-device-sub').textContent = 'Registrar un nuevo dispositivo en el inventario';
  ['dev-name','dev-ip','dev-mac','dev-serial','dev-user','dev-pass','dev-notes'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('dev-type').value = 'server';
  document.getElementById('dev-size').value = '2';
  document.getElementById('dev-size').closest('.form-row').style.display = '';
  document.getElementById('dev-power').value = '200';
  document.getElementById('dev-plugs').value = '1';
  document.getElementById('modal-device').classList.remove('hidden');
}

function openEditCatalogModal(id) {
  editingCatalogId = id;
  editingDeviceId = null;
  const dev = CATALOG.find(c => c.id === id);
  if (!dev) return;
  const isFloor = FLOOR_TYPES.has(dev.type);
  document.getElementById('modal-device-title').textContent = 'Editar Plantilla';
  document.getElementById('modal-device-sub').textContent = isFloor ? 'Equipo de piso — se coloca directamente en la sala' : `Catálogo ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-user').value  = dev.user || '';
  document.getElementById('dev-pass').value  = dev.pass || '';
  document.getElementById('dev-notes').value = dev.notes|| '';
  document.getElementById('modal-device').classList.remove('hidden');
}

function openEditDeviceModal(id) {
  editingCatalogId = null;
  editingDeviceId = id;
  const dev = store.deviceById(id);
  if (!dev) return;
  const isFloor = dev.category === 'floor' || FLOOR_TYPES.has(dev.type);
  document.getElementById('modal-device-title').textContent = 'Editar Equipo';
  document.getElementById('modal-device-sub').textContent = isFloor ? 'Equipo de piso — se coloca directamente en la sala' : `ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size || 0;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-user').value  = dev.user || '';
  document.getElementById('dev-pass').value  = dev.pass || '';
  document.getElementById('dev-notes').value = dev.notes|| '';
  document.getElementById('modal-device').classList.remove('hidden');
}

function buildDeviceOptionsGrouped() {
  const rooms = store._raw.rooms;
  const racks = store._raw.racks;
  const devices = store._raw.devices;
  let html = '';

  rooms.forEach(room => {
    const roomRacks = racks.filter(r => r.roomId === room.id);
    roomRacks.forEach(rack => {
      const rackDevs = devices.filter(d => d.rackId === rack.id);
      if (rackDevs.length > 0) {
        html += `<optgroup label="${escapeHTML(room.name)} — ${escapeHTML(rack.name)}">`;
        rackDevs.forEach(d => {
          html += `<option value="${escapeHTML(d.id)}">${escapeHTML(d.name)} (${escapeHTML(d.type)})</option>`;
        });
        html += `</optgroup>`;
      }
    });
  });

  const orphaned = devices.filter(d => !d.rackId);
  if (orphaned.length > 0) {
    html += `<optgroup label="Sin Gabinete">`;
    orphaned.forEach(d => {
      html += `<option value="${escapeHTML(d.id)}">${escapeHTML(d.name)} (${escapeHTML(d.type)})</option>`;
    });
    html += `</optgroup>`;
  }

  return html || '<option value="">No hay equipos disponibles</option>';
}

function openCableModal(defaultSrcId = null) {
  editingConnectionId = null;
  const titleEl = document.getElementById('modal-cable-title');
  if (titleEl) titleEl.textContent = 'Conectar Equipos';
  
  const opts = buildDeviceOptionsGrouped();
  document.getElementById('cable-src-dev').innerHTML = opts;
  document.getElementById('cable-dst-dev').innerHTML = opts;
  if (defaultSrcId) document.getElementById('cable-src-dev').value = defaultSrcId;
  document.getElementById('cable-src-port').value = 'Eth0/1';
  document.getElementById('cable-dst-port').value = 'Eth0/2';
  document.getElementById('cable-color').value = '#3b82f6';
  document.getElementById('cable-color-picker').value = '#3b82f6';
  updateCableLocationDisplay('src');
  updateCableLocationDisplay('dst');
  document.getElementById('modal-cable').classList.remove('hidden');
}

function openEditCableModal(connId) {
  editingConnectionId = connId;
  const conn = store._raw.connections.find(c => c.id === connId);
  if (!conn) return;

  const titleEl = document.getElementById('modal-cable-title');
  if (titleEl) titleEl.textContent = 'Editar Conexión';

  const opts = buildDeviceOptionsGrouped();
  document.getElementById('cable-src-dev').innerHTML = opts;
  document.getElementById('cable-dst-dev').innerHTML = opts;

  document.getElementById('cable-src-dev').value = conn.sourceDeviceId;
  document.getElementById('cable-dst-dev').value = conn.targetDeviceId;
  document.getElementById('cable-src-port').value = conn.sourcePort;
  document.getElementById('cable-dst-port').value = conn.targetPort;
  document.getElementById('cable-type').value = conn.cableType;
  document.getElementById('cable-color').value = conn.color;
  document.getElementById('cable-color-picker').value = conn.color;
  updateCableLocationDisplay('src');
  updateCableLocationDisplay('dst');
  document.getElementById('modal-cable').classList.remove('hidden');
}

function updateCableLocationDisplay(prefix) {
  const el = document.getElementById(`cable-${prefix}-dev`);
  const locEl = document.getElementById(`cable-${prefix}-loc`);
  if (!el || !locEl) return;
  const devId = el.value;
  if (!devId) {
    locEl.value = 'Desconocido';
    return;
  }
  const dev = store.deviceById(devId);
  locEl.value = getDeviceLocation(dev);
}

function openPNGModal() {
  const list = document.getElementById('png-rack-list');
  const racks = store.currentRacks;
  list.innerHTML = racks.map(r => `
    <button class="btn-secondary" style="width:100%;margin-bottom:8px;justify-content:flex-start" data-export-rack="${escapeHTML(r.id)}">
      📸 Exportar: ${escapeHTML(r.name)} (${r.height}U)
    </button>
  `).join('');
  list.querySelectorAll('[data-export-rack]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRackToPNG(btn.dataset.exportRack);
    });
  });
  document.getElementById('modal-export-png').classList.remove('hidden');
}

function deleteRoom(id) {
  if (store._raw.rooms.length <= 1) { notify('No puedes eliminar la única sala', 'warn'); return; }
  if (!confirm('¿Eliminar esta sala y todos sus gabinetes?')) return;
  store.snapshot();
  const racks = store._raw.racks.filter(r => r.roomId === id);
  racks.forEach(r => {
    store._raw.devices = store._raw.devices.filter(d => d.rackId !== r.id);
  });
  store._raw.racks = store._raw.racks.filter(r => r.roomId !== id);
  store._raw.rooms = store._raw.rooms.filter(r => r.id !== id);
  store._raw.currentRoomId = store._raw.rooms[0]?.id;
  store._save(); 
  store._emit('change', { source: 'deleteRoom' });
  notify('Sala eliminada', 'warn');
}

function exportCSV() {
  const header = 'Rack,Unidad U,Nombre,Tipo,IP,MAC,Serie,Usuario,Consumo(W),Tomas\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    return [rack?.name||'', d.slotStart, d.name, d.type, d.ip, d.mac, d.serial, d.user, d.power, d.plugs||1].join(',');
  }).join('\n');
  downloadBlob(header + rows, 'Inventario_Centro_Datos.csv', 'text/csv');
  notify('CSV exportado', 'success');
}

function exportJSON() {
  const json = JSON.stringify(store._raw, null, 2);
  downloadBlob(json, 'Rack_Designer_Backup.rack', 'application/json');
  notify('Proyecto exportado como archivo .rack', 'success');
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.rooms || !data.racks || !data.devices) throw new Error('Estructura inválida');
      store.snapshot();
      Object.assign(store._raw, data);
      store._save();
      store._emit('change', { source: 'importJSON' });
      notify('Proyecto cargado exitosamente', 'success');
    } catch(err) {
      notify('Archivo inválido: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function exportRackToPNG(rackId) {
  const rack    = store.rackById(rackId);
  const devices = store.allDevicesInRack(rackId);
  const W = 280, UNIT = 24;
  const H = rack.height * UNIT + 60;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = W * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = '#090d17';
  oc.fillRect(0, 0, W, H);
  oc.strokeStyle = rack.color;
  oc.lineWidth = 2;
  oc.strokeRect(1, 1, W-2, H-2);

  oc.fillStyle = rack.color;
  oc.font = 'bold 12px sans-serif';
  oc.fillText(rack.name, 10, 18);
  oc.fillStyle = '#4a5a78';
  oc.font = '9px monospace';
  oc.fillText(`${rack.height}U · ${devices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

  oc.fillStyle = '#1a2035';
  oc.fillRect(0, 40, 18, rack.height * UNIT);
  oc.fillRect(W-18, 40, 18, rack.height * UNIT);

  for (let u = 1; u <= rack.height; u++) {
    const y = 40 + (u-1) * UNIT;
    oc.fillStyle = u % 5 === 0 ? '#3d5480' : '#1e2d44';
    oc.font = '7px monospace';
    oc.textAlign = 'center';
    oc.fillText(u, 9, y + UNIT/2 + 3);
    oc.fillText(u, W-9, y + UNIT/2 + 3);
    oc.strokeStyle = '#0d1220';
    oc.lineWidth = 0.5;
    oc.beginPath(); oc.moveTo(18, y); oc.lineTo(W-18, y); oc.stroke();
  }

  const typeColors = TYPE_COLORS;
  for (let u = 1; u <= rack.height; u++) {
    const dev = devices.find(d => d.slotStart === u);
    if (!dev) continue;
    const y = 40 + (u-1) * UNIT;
    const h = dev.size * UNIT;
    const col = typeColors[dev.type] || '#888';

    oc.fillStyle = col + '22';
    oc.fillRect(18, y, W-36, h);
    oc.strokeStyle = col;
    oc.lineWidth = 1;
    oc.strokeRect(18, y, W-36, h);

    oc.fillStyle = col;
    oc.font = `bold ${Math.min(10, h-4)}px sans-serif`;
    oc.textAlign = 'left';
    oc.fillText(dev.name.slice(0,22), 24, y + h/2 - 2);
    if (h > 24) {
      oc.fillStyle = '#8b9ab8';
      oc.font = '8px monospace';
      oc.fillText(dev.ip || 'NO IP', 24, y + h/2 + 10);
    }
    oc.beginPath();
    oc.arc(W-26, y + h/2, 4, 0, Math.PI*2);
    oc.fillStyle = '#00ff88';
    oc.fill();
  }

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${rack.name.replace(/\s+/g,'_')}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: ${rack.name}`, 'success');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Bind modal UI events
function initModals() {
  document.getElementById('cable-src-dev').addEventListener('change', () => updateCableLocationDisplay('src'));
  document.getElementById('cable-dst-dev').addEventListener('change', () => updateCableLocationDisplay('dst'));

  document.getElementById('dev-type').addEventListener('change', function() {
    const isFloor = FLOOR_TYPES.has(this.value);
    const sizeRow = document.getElementById('dev-size').closest('.form-row');
    if (sizeRow) {
      sizeRow.style.display = isFloor ? 'none' : '';
    }
    document.getElementById('modal-device-sub').textContent = isFloor
      ? 'Equipo de piso — se coloca directamente en la sala'
      : 'Datos técnicos del equipo en rack';
  });

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
        if (!confirm(confirmMsg)) {
          return;
        }
        // User confirmed: remove the devices (and their connections implicitly)
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

  document.getElementById('modal-device-save').addEventListener('click', () => {
    const name = document.getElementById('dev-name').value.trim();
    const ip   = document.getElementById('dev-ip').value.trim();
    const mac  = document.getElementById('dev-mac').value.trim();
    if (!name) { notify('Ingresa un nombre', 'error'); return; }
    if (ip && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) { notify('IP inválida', 'error'); return; }
    if (mac && !/^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(mac)) { notify('MAC inválida', 'error'); return; }

    const props = {
      name, type: document.getElementById('dev-type').value,
      size: parseInt(document.getElementById('dev-size').value),
      ip, mac,
      serial: document.getElementById('dev-serial').value.trim(),
      power:  parseInt(document.getElementById('dev-power').value) || 0,
      plugs:  parseInt(document.getElementById('dev-plugs').value) || 1,
      user:   document.getElementById('dev-user').value.trim(),
      pass:   document.getElementById('dev-pass').value,
      notes:  document.getElementById('dev-notes').value.trim()
    };

    if (editingCatalogId) {
      const item = CATALOG.find(c => c.id === editingCatalogId);
      if (item) {
        Object.assign(item, props);
        item.power = parseInt(props.power) || 0;
        item.plugs = parseInt(props.plugs) || 1;
        item.size = FLOOR_TYPES.has(props.type) ? 0 : (parseInt(props.size) || 1);
        item.icon = FLOOR_TYPES.has(props.type)
          ? { pc:'💻', camera:'📷', ap:'📶', door:'🚪', printer:'🖨️', phone:'📞' }[props.type]
          : { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' }[props.type];
        item.color = TYPE_COLORS[item.type] || '#8b9ab8';
        renderCatalog();
        notify('Plantilla de catálogo actualizada', 'success');
      }
    } else if (editingDeviceId) {
      store.updateDevice(editingDeviceId, props);
      notify('Equipo actualizado', 'success');
    } else {
      if (FLOOR_TYPES.has(props.type)) {
        store.addFloorDevice(props, store._raw.currentRoomId);
        notify('Equipo de piso agregado con éxito', 'success');
      } else {
        const rack = store.currentRacks[0];
        if (!rack) { notify('Primero crea un gabinete', 'error'); return; }
        notify('Arrastra el equipo desde el catálogo al rack', 'info');
      }
    }
    document.getElementById('modal-device').classList.add('hidden');
  });

  document.getElementById('modal-device-cancel').addEventListener('click', () => {
    document.getElementById('modal-device').classList.add('hidden');
  });

  document.getElementById('btn-add-room').addEventListener('click', () => {
    document.getElementById('room-name').value = '';
    document.getElementById('modal-room').classList.remove('hidden');
  });
  document.getElementById('modal-room-save').addEventListener('click', () => {
    const name = document.getElementById('room-name').value.trim();
    if (!name) { notify('Ingresa un nombre para la sala', 'error'); return; }
    store.addRoom(name);
    document.getElementById('modal-room').classList.add('hidden');
    notify(`Sala "${name}" creada`, 'success');
  });
  document.getElementById('modal-room-cancel').addEventListener('click', () => {
    document.getElementById('modal-room').classList.add('hidden');
  });

  document.getElementById('cable-color-picker').addEventListener('input', e => {
    document.getElementById('cable-color').value = e.target.value;
  });
  document.getElementById('modal-cable-save').addEventListener('click', () => {
    const srcId   = document.getElementById('cable-src-dev').value;
    const dstId   = document.getElementById('cable-dst-dev').value;
    const srcPort = document.getElementById('cable-src-port').value.trim();
    const dstPort = document.getElementById('cable-dst-port').value.trim();
    const type    = document.getElementById('cable-type').value;
    const color   = document.getElementById('cable-color').value;
    if (!srcId || !dstId || srcId === dstId) { notify('Selecciona dos equipos distintos', 'error'); return; }
    
    if (editingConnectionId) {
      store.updateConnection(editingConnectionId, { sourceDeviceId: srcId, sourcePort: srcPort, targetDeviceId: dstId, targetPort: dstPort, cableType: type, color });
      notify('Conexión actualizada', 'success');
    } else {
      store.addConnection({ sourceDeviceId: srcId, sourcePort: srcPort, targetDeviceId: dstId, targetPort: dstPort, cableType: type, color });
      notify('Cable conectado', 'success');
    }
    
    document.getElementById('modal-cable').classList.add('hidden');
    editingConnectionId = null;
  });
  document.getElementById('modal-cable-cancel').addEventListener('click', () => {
    document.getElementById('modal-cable').classList.add('hidden');
  });

  document.getElementById('modal-png-cancel').addEventListener('click', () => {
    document.getElementById('modal-export-png').classList.add('hidden');
  });

  const btnExportCsv = document.getElementById('btn-export-csv');
  if(btnExportCsv) btnExportCsv.addEventListener('click', exportCSV);

  const btnExportJson = document.getElementById('btn-export-json');
  if(btnExportJson) btnExportJson.addEventListener('click', exportJSON);

  const btnImportJson = document.getElementById('btn-import-json');
  if(btnImportJson) btnImportJson.addEventListener('click', () => document.getElementById('file-import').click());

  const fileImport = document.getElementById('file-import');
  if(fileImport) fileImport.addEventListener('change', importJSON);
  document.getElementById('btn-export-png').addEventListener('click', () => {
    if (typeof currentView !== 'undefined' && currentView === 'topology') {
      if (typeof exportTopologyToPNG === 'function') exportTopologyToPNG();
    } else {
      openPNGModal();
    }
  });

  // Quick placement events
  document.getElementById('qp-dev-select').addEventListener('change', function() {
    const catalogId = this.value;
    const item = CATALOG.find(c => c.id === catalogId);
    if (!item) return;
    qpCatalogItem = item;
    
    const isFloor = FLOOR_TYPES.has(item.type);
    const rackRow = document.getElementById('qp-rack-row');
    const slotRow = document.getElementById('qp-slot-row');
    
    document.getElementById('qp-modal-title').textContent = isFloor ? '⚡ Ubicar Periférico en Sala' : '⚡ Ubicar en Rack Asistido';
    document.getElementById('qp-modal-sub').textContent = isFloor 
      ? 'Ubicar periférico en el piso de la sala de forma instantánea' 
      : `Instalar ${item.size}U de forma asistida sin arrastrar`;

    if (isFloor) {
      rackRow.style.display = 'none';
      slotRow.style.display = 'none';
    } else {
      rackRow.style.display = '';
      slotRow.style.display = '';
      repopulateQPRacks();
    }
  });

  document.getElementById('qp-room').addEventListener('change', () => {
    if (qpCatalogItem && !FLOOR_TYPES.has(qpCatalogItem.type)) {
      repopulateQPRacks();
    }
  });

  document.getElementById('qp-rack').addEventListener('change', () => {
    if (qpCatalogItem && !FLOOR_TYPES.has(qpCatalogItem.type)) {
      repopulateQPSlots();
    }
  });

  document.getElementById('modal-qp-cancel').addEventListener('click', () => {
    document.getElementById('modal-quick-placement').classList.add('hidden');
    qpCatalogItem = null;
  });

  document.getElementById('modal-qp-save').addEventListener('click', () => {
    if (!qpCatalogItem) return;
    
    const roomId = document.getElementById('qp-room').value;
    const isFloor = FLOOR_TYPES.has(qpCatalogItem.type);
    
    if (isFloor) {
      store.addFloorDevice(qpCatalogItem, roomId);
      notify(`${qpCatalogItem.name} ubicado en piso de sala`, 'success');
      document.getElementById('modal-quick-placement').classList.add('hidden');
      qpCatalogItem = null;
    } else {
      const rackId = document.getElementById('qp-rack').value;
      const slotU = parseInt(document.getElementById('qp-slot').value);
      
      if (!rackId || isNaN(slotU)) {
        notify('Selecciona un gabinete y slot válidos', 'error');
        return;
      }
      
      const ok = store.addDeviceToRack(qpCatalogItem, rackId, slotU);
      if (ok) {
        notify(`${qpCatalogItem.name} instalado en rack en U${slotU}`, 'success');
        document.getElementById('modal-quick-placement').classList.add('hidden');
        qpCatalogItem = null;
      } else {
        notify('Espacio ocupado o gabinete inválido', 'error');
      }
    }
  });
}

let qpCatalogItem = null;

function openQuickPlacementModal(catalogId = null) {
  const displayRow = document.getElementById('qp-dev-display-row');
  const selectRow = document.getElementById('qp-dev-select-row');
  
  if (catalogId === null) {
    // Flujo de Tabla (Agregar Equipo): mostramos el selector
    displayRow.style.display = 'none';
    selectRow.style.display = '';
    
    const select = document.getElementById('qp-dev-select');
    select.innerHTML = CATALOG.map((item, i) => 
      `<option value="${escapeHTML(item.id)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(item.icon)} ${escapeHTML(item.name)} (${escapeHTML(item.type.toUpperCase())})</option>`
    ).join('');
    
    qpCatalogItem = CATALOG[0];
  } else {
    // Flujo de Catálogo: mostramos etiqueta fija
    displayRow.style.display = '';
    selectRow.style.display = 'none';
    
    const item = CATALOG.find(c => c.id === catalogId);
    if (!item) return;
    qpCatalogItem = item;
  }

  const isFloor = FLOOR_TYPES.has(qpCatalogItem.type);

  // Set titles
  document.getElementById('qp-modal-title').textContent = isFloor ? '⚡ Ubicar Periférico en Sala' : '⚡ Ubicar en Rack Asistido';
  document.getElementById('qp-modal-sub').textContent = isFloor 
    ? 'Ubicar periférico en el piso de la sala de forma instantánea' 
    : `Instalar ${qpCatalogItem.size}U de forma asistida sin arrastrar`;
  
  document.getElementById('qp-dev-name-display').value = `${qpCatalogItem.name} (${qpCatalogItem.type.toUpperCase()}${isFloor ? '' : ' - ' + qpCatalogItem.size + 'U'})`;

  // Populate Rooms
  const roomSelect = document.getElementById('qp-room');
  roomSelect.innerHTML = store._raw.rooms.map(r => 
    `<option value="${escapeHTML(r.id)}" ${r.id === store._raw.currentRoomId ? 'selected' : ''}>🏢 ${escapeHTML(r.name)}</option>`
  ).join('');

  // Toggle rows
  const rackRow = document.getElementById('qp-rack-row');
  const slotRow = document.getElementById('qp-slot-row');
  
  if (isFloor) {
    rackRow.style.display = 'none';
    slotRow.style.display = 'none';
  } else {
    rackRow.style.display = '';
    slotRow.style.display = '';
    repopulateQPRacks();
  }

  document.getElementById('modal-quick-placement').classList.remove('hidden');
}

function repopulateQPRacks() {
  const roomId = document.getElementById('qp-room').value;
  const rackSelect = document.getElementById('qp-rack');
  const racks = store._raw.racks.filter(r => r.roomId === roomId);
  
  if (!racks.length) {
    rackSelect.innerHTML = '<option value="">No hay gabinetes en esta sala</option>';
    document.getElementById('qp-slot').innerHTML = '<option value="">Requiere un gabinete</option>';
    return;
  }
  
  rackSelect.innerHTML = racks.map((r, i) => 
    `<option value="${escapeHTML(r.id)}" ${i === 0 ? 'selected' : ''}>🗄️ ${escapeHTML(r.name)} (${r.height}U)</option>`
  ).join('');
  
  repopulateQPSlots();
}

function repopulateQPSlots() {
  const rackId = document.getElementById('qp-rack').value;
  const slotSelect = document.getElementById('qp-slot');
  if (!rackId || !qpCatalogItem) {
    slotSelect.innerHTML = '<option value="">Selecciona un gabinete</option>';
    return;
  }
  
  const rack = store.rackById(rackId);
  const size = qpCatalogItem.size || 1;
  const availableSlots = [];
  
  for (let u = 1; u <= rack.height - size + 1; u++) {
    if (canPlace(rackId, u, size)) {
      availableSlots.push(u);
    }
  }
  
  if (!availableSlots.length) {
    slotSelect.innerHTML = '<option value="">No hay slots libres de ' + size + 'U</option>';
    return;
  }
  
  slotSelect.innerHTML = availableSlots.map(u => 
    `<option value="${u}">Posición U${u} (Libre)</option>`
  ).join('');
}
``

## js\ui\tables.js

``javascript
let activeTab = 'inventory';
function setActiveTab(tab) {
  activeTab = tab;
}

function renderBottomPanel() {
  const wrap = document.getElementById('bottom-table-wrap');
  if(!wrap) return;
  const searchInput = document.getElementById('table-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const btnDev = document.getElementById('table-btn-add-device');
  const btnQP = document.getElementById('table-btn-add-placement');
  const btnConn = document.getElementById('table-btn-add-conn');
  
  if (activeTab === 'inventory') {
    if (btnDev) btnDev.style.display = 'block';
    if (btnQP) btnQP.style.display = 'block';
    if (btnConn) btnConn.style.display = 'none';
    renderInventoryTable(wrap, query);
  } else {
    if (btnDev) btnDev.style.display = 'none';
    if (btnQP) btnQP.style.display = 'none';
    if (btnConn) btnConn.style.display = 'block';
    renderConnectionsTable(wrap, query);
  }
}

function renderInventoryTable(wrap, query) {
  const devices = store._raw.devices.filter(d => {
    if (!query) return true;
    return [d.name, d.ip, d.mac, d.serial, d.type, d.user, d.pass].join(' ').toLowerCase().includes(query);
  });
  if (!devices.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">📦</div><p>No hay equipos instalados.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Rack</th><th>U</th><th>Nombre</th><th>Tipo</th><th>IP</th>
      <th>MAC</th><th>Serie</th><th>Usuario</th><th>Contraseña</th><th>Consumo (W)</th><th>Tomas</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${devices.map(d => {
      const isFloor = d.category === 'floor';
      const rack = !isFloor ? store.rackById(d.rackId) : null;
      const locationName = isFloor ? '<span style="color:var(--purple);font-weight:600">PISO</span>' : escapeHTML(rack?.name || '-');
      const slotDisplay = isFloor ? '-' : (d.slotStart || '-');
      return `<tr data-dev-id="${escapeHTML(d.id)}">
        <td>${locationName}</td>
        <td>${slotDisplay}</td>
        <td class="editable" data-field="name" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.name)}</td>
        <td><span class="type-badge ${escapeHTML(d.type)}">${escapeHTML(d.type)}</span></td>
        <td class="editable" data-field="ip"  data-dev="${escapeHTML(d.id)}">${escapeHTML(d.ip)  || '-'}</td>
        <td class="editable" data-field="mac" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.mac) || '-'}</td>
        <td class="editable" data-field="serial" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.serial) || '-'}</td>
        <td class="editable" data-field="user" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.user) || '-'}</td>
        <td class="editable" data-field="pass" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.pass) || '-'}</td>
        <td class="editable" data-field="power" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.power)) || 0}</td>
        <td class="editable" data-field="plugs" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.plugs)) || 1}</td>
        <td style="white-space:nowrap;">
          <button class="tbl-action" data-edit-dev="${escapeHTML(d.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar">✎</button>
          <button class="tbl-action" data-del-dev="${escapeHTML(d.id)}" style="padding:4px 8px" title="Eliminar">🗑</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;

  wrap.querySelectorAll('td.editable').forEach(td => {
    td.addEventListener('dblclick', () => startCellEdit(td));
  });
  wrap.querySelectorAll('[data-del-dev]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteDevice(btn.dataset.delDev);
      notify('Equipo eliminado', 'warn');
    });
  });
  wrap.querySelectorAll('[data-edit-dev]').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditDeviceModal(btn.dataset.editDev);
    });
  });
}

function startCellEdit(td) {
  const field = td.dataset.field;
  const devId = td.dataset.dev;
  const orig  = td.textContent.trim() === '-' ? '' : td.textContent.trim();
  td.innerHTML = `<input class="cell-edit" value="${orig}" data-field="${field}" data-dev="${devId}">`;
  const input = td.querySelector('input');
  input.focus(); input.select();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { td.textContent = orig || '-'; }
  });
  input.addEventListener('blur', () => finishCellEdit(input, td, orig));
}

function finishCellEdit(input, td, orig) {
  const field = input.dataset.field;
  const devId = input.dataset.dev;
  const val   = input.value.trim();
  const allowedFields = ['name', 'ip', 'mac', 'serial', 'user', 'pass', 'power', 'plugs'];
  if (!allowedFields.includes(field)) return;
  if (field === 'ip') {
    if (val && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val)) {
      input.classList.add('error');
      notify('IP inválida. Formato: 0-255.0-255.0-255.0-255', 'error');
      setTimeout(() => { input.classList.remove('error'); }, 1000);
      return;
    }
  }
  if (field === 'mac') {
    if (val && !/^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(val)) {
      input.classList.add('error');
      notify('MAC inválida. Formato: XX:XX:XX:XX:XX:XX', 'error');
      setTimeout(() => { input.classList.remove('error'); }, 1000);
      return;
    }
  }
  store.updateDevice(devId, { [field]: (field === 'power' || field === 'plugs') ? parseInt(val) || 0 : val });
  td.textContent = val || '-';
}

function renderConnectionsTable(wrap, query) {
  const conns = store._raw.connections.filter(c => {
    if (!query) return true;
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    return [src?.name, dst?.name, c.cableType, c.sourcePort, c.targetPort].join(' ').toLowerCase().includes(query);
  });
  if (!conns.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">🔌</div><p>No hay conexiones de red registradas.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Sala/Rack Origen</th><th>Origen</th><th>Puerto Origen</th><th>Sala/Rack Destino</th><th>Destino</th><th>Puerto Destino</th>
      <th>Tipo Cable</th><th>Color</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${conns.map(c => {
      const src = store.deviceById(c.sourceDeviceId);
      const dst = store.deviceById(c.targetDeviceId);
      return `<tr>
        <td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(src))}</span></td>
        <td><span class="type-badge ${escapeHTML(src?.type||'')}">${escapeHTML(src?.name||'?')}</span></td>
        <td>${escapeHTML(c.sourcePort)}</td>
        <td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(dst))}</span></td>
        <td><span class="type-badge ${escapeHTML(dst?.type||'')}">${escapeHTML(dst?.name||'?')}</span></td>
        <td>${escapeHTML(c.targetPort)}</td>
        <td>${escapeHTML(c.cableType)}</td>
        <td><span class="cable-dot" style="background:${escapeHTML(c.color)};box-shadow:0 0 4px ${escapeHTML(c.color)}"></span> ${escapeHTML(c.color)}</td>
        <td style="white-space:nowrap;">
          <button class="tbl-action" data-edit-conn="${escapeHTML(c.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar">✎</button>
          <button class="tbl-action" data-del-conn="${escapeHTML(c.id)}" style="padding:4px 8px" title="Eliminar">🗑</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;

  wrap.querySelectorAll('[data-del-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteConnection(btn.dataset.delConn);
      notify('Conexión eliminada', 'warn');
    });
  });
  wrap.querySelectorAll('[data-edit-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditCableModal(btn.dataset.editConn);
    });
  });
}

function getInventoryData() {
  const data = [['Rack / Ubicación', 'Unidad U', 'Nombre', 'Tipo', 'IP', 'MAC', 'Serie', 'Usuario', 'Contraseña', 'Consumo (W)']];
  store._raw.devices.forEach(d => {
    const isFloor = d.category === 'floor';
    const rack = !isFloor ? store.rackById(d.rackId) : null;
    data.push([
      isFloor ? 'PISO' : (rack?.name || ''), 
      isFloor ? '-' : (d.slotStart || ''), 
      d.name, d.type, d.ip, d.mac, d.serial, d.user, d.pass, d.power
    ]);
  });
  return data;
}

function getConnectionsData() {
  const data = [['Sala/Rack Origen', 'Origen', 'Puerto Origen', 'Sala/Rack Destino', 'Destino', 'Puerto Destino', 'Tipo Cable', 'Color']];
  store._raw.connections.forEach(c => {
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    data.push([getDeviceLocation(src), src?.name||'?', c.sourcePort, getDeviceLocation(dst), dst?.name||'?', c.targetPort, c.cableType, c.color]);
  });
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCsv = document.getElementById('btn-table-csv');
  const btnExcel = document.getElementById('btn-table-excel');
  
  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      let data, filename;
      if (activeTab === 'inventory') {
        data = getInventoryData();
        filename = 'Inventario.csv';
      } else {
        data = getConnectionsData();
        filename = 'Conexiones.csv';
      }
      const csvContent = data.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      notify(`CSV de ${activeTab === 'inventory' ? 'Inventario' : 'Conexiones'} exportado con éxito`, 'success');
    });
  }

  if (btnExcel) {
    btnExcel.addEventListener('click', () => {
      if (typeof XLSX === 'undefined') {
        notify('Librería Excel no cargada. Actualiza la página o revisa la red.', 'error');
        return;
      }
      const wb = XLSX.utils.book_new();
      
      const wsInv = XLSX.utils.aoa_to_sheet(getInventoryData());
      XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");
      
      const wsConn = XLSX.utils.aoa_to_sheet(getConnectionsData());
      XLSX.utils.book_append_sheet(wb, wsConn, "Conexiones");
      
      XLSX.writeFile(wb, 'Rack_Designer_Completo.xlsx');
      notify('Excel exportado con éxito', 'success');
    });
  }
});
``

## js\ui\topology.js

``javascript
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

function initTopology() {
  canvas = document.getElementById('topology-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('pointerdown', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    // Check Resizing first
    for (const rack of store._raw.racks) {
      const pos = rackPositions[rack.id];
      const size = rackSizes[rack.id];
      if (!pos || !size) continue;
      if (mx >= pos.x + size.w - 20 && mx <= pos.x + size.w && my >= pos.y + size.h - 20 && my <= pos.y + size.h) {
        resizingRack = rack.id;
        return;
      }
    }
    for (const room of store._raw.rooms) {
      const pos = roomPositions[room.id];
      const size = roomSizes[room.id];
      if (!pos || !size) continue;
      if (mx >= pos.x + size.w - 24 && mx <= pos.x + size.w && my >= pos.y + size.h - 24 && my <= pos.y + size.h) {
        resizingRoom = room.id;
        return;
      }
    }

    // Dragging Nodes
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        draggingNode = dev.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // Dragging Racks
    for (const rack of store._raw.racks) {
      const pos = rackPositions[rack.id];
      const size = rackSizes[rack.id];
      if (!pos || !size) continue;
      if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 40) {
        draggingRack = rack.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // Dragging Rooms
    for (const room of store._raw.rooms) {
      const pos = roomPositions[room.id];
      const size = roomSizes[room.id];
      if (!pos || !size) continue;
      if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 50) {
        draggingRoom = room.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // Pan
    panStart = { x: e.clientX, y: e.clientY };
    panOrig  = { x: store._raw.topoPanX || 0, y: store._raw.topoPanY || 0 };
    mousePos = { x: mx, y: my, rawX: e.offsetX, rawY: e.offsetY };
  });

  canvas.addEventListener('pointermove', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    mousePos = { x: mx, y: my, rawX: e.offsetX, rawY: e.offsetY };

    if (resizingRack) {
      const rackPos = rackPositions[resizingRack];
      const rack = store._raw.racks.find(r => r.id === resizingRack);
      const roomPos = roomPositions[rack.roomId];
      const roomSize = roomSizes[rack.roomId];

      let newW = mx - rackPos.x;
      let newH = my - rackPos.y;

      let maxDevX = rackPos.x + 100;
      let maxDevY = rackPos.y + 80;
      store.allDevicesInRack(resizingRack).forEach(dev => {
        const dp = nodePositions[dev.id];
        if (dp) {
          if (dp.x + 35 > maxDevX) maxDevX = dp.x + 35;
          if (dp.y + 35 > maxDevY) maxDevY = dp.y + 35;
        }
      });
      const minW = Math.max(160, maxDevX - rackPos.x);
      const minH = Math.max(100, maxDevY - rackPos.y);

      if (newW < minW) newW = minW;
      if (newH < minH) newH = minH;

      if (roomPos && roomSize) {
        if (rackPos.x + newW > roomPos.x + roomSize.w - 10) newW = roomPos.x + roomSize.w - rackPos.x - 10;
        if (rackPos.y + newH > roomPos.y + roomSize.h - 10) newH = roomPos.y + roomSize.h - rackPos.y - 10;
      }
      rackSizes[resizingRack] = { w: newW, h: newH };
      return;
    }

    if (resizingRoom) {
      const roomPos = roomPositions[resizingRoom];
      let newW = mx - roomPos.x;
      let newH = my - roomPos.y;

      let maxRackX = roomPos.x + 150;
      let maxRackY = roomPos.y + 100;
      store._raw.racks.filter(r => r.roomId === resizingRoom).forEach(rack => {
        const rp = rackPositions[rack.id];
        const rs = rackSizes[rack.id];
        if (rp && rs) {
          if (rp.x + rs.w + 15 > maxRackX) maxRackX = rp.x + rs.w + 15;
          if (rp.y + rs.h + 15 > maxRackY) maxRackY = rp.y + rs.h + 15;
        }
      });
      const minW = Math.max(250, maxRackX - roomPos.x);
      const minH = Math.max(150, maxRackY - roomPos.y);

      if (newW < minW) newW = minW;
      if (newH < minH) newH = minH;

      roomSizes[resizingRoom] = { w: newW, h: newH };
      return;
    }

    if (draggingNode) {
      const dev = store._raw.devices.find(d => d.id === draggingNode);
      let nx = mx + nodeOrig.x;
      let ny = my + nodeOrig.y;
      const r = 24;

      // 1. Restringir a Rack si es un equipo montado en rack
      const rackPos = rackPositions[dev.rackId];
      const rackSize = rackSizes[dev.rackId];
      if (rackPos && rackSize) {
        if (nx - r < rackPos.x) nx = rackPos.x + r;
        if (nx + r > rackPos.x + rackSize.w) nx = rackPos.x + rackSize.w - r;
        if (ny - r < rackPos.y + 40) ny = rackPos.y + 40 + r;
        if (ny + r > rackPos.y + rackSize.h) ny = rackPos.y + rackSize.h - r;
      }

      // 2. Restringir a la Sala para que no pueda salir del recuadro
      const roomId = dev.category === 'floor' ? dev.roomId : store.rackById(dev.rackId)?.roomId;
      const roomPos = roomPositions[roomId];
      const roomSize = roomSizes[roomId];
      if (roomPos && roomSize) {
        if (nx - r < roomPos.x + 10) nx = roomPos.x + 10 + r;
        if (nx + r > roomPos.x + roomSize.w - 10) nx = roomPos.x + roomSize.w - 10 - r;
        if (ny - r < roomPos.y + 50) ny = roomPos.y + 50 + r;
        if (ny + r > roomPos.y + roomSize.h - 10) ny = roomPos.y + roomSize.h - 10 - r;
      }

      nodePositions[draggingNode] = { x: nx, y: ny };
      return;
    }
    
    if (draggingRack) {
      const rack = store._raw.racks.find(r => r.id === draggingRack);
      const roomPos = roomPositions[rack.roomId];
      const roomSize = roomSizes[rack.roomId];
      const rackSize = rackSizes[draggingRack];

      let nx = mx + nodeOrig.x;
      let ny = my + nodeOrig.y;

      if (roomPos && roomSize && rackSize) {
        if (nx < roomPos.x + 10) nx = roomPos.x + 10;
        if (nx + rackSize.w > roomPos.x + roomSize.w - 10) nx = roomPos.x + roomSize.w - rackSize.w - 10;
        if (ny < roomPos.y + 50) ny = roomPos.y + 50;
        if (ny + rackSize.h > roomPos.y + roomSize.h - 10) ny = roomPos.y + roomSize.h - rackSize.h - 10;
      }

      const np = { x: nx, y: ny };
      const old = rackPositions[draggingRack];
      const dx = np.x - old.x, dy = np.y - old.y;
      rackPositions[draggingRack] = np;
      
      store.allDevicesInRack(draggingRack).forEach(dev => {
        if (nodePositions[dev.id]) {
          nodePositions[dev.id].x += dx;
          nodePositions[dev.id].y += dy;
        }
      });
      return;
    }

    if (draggingRoom) {
      const np = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      const old = roomPositions[draggingRoom];
      const dx = np.x - old.x, dy = np.y - old.y;
      roomPositions[draggingRoom] = np;
      
      const racksInRoom = store._raw.racks.filter(r => r.roomId === draggingRoom);
      racksInRoom.forEach(rack => {
        if (rackPositions[rack.id]) {
          rackPositions[rack.id].x += dx;
          rackPositions[rack.id].y += dy;
        }
        store.allDevicesInRack(rack.id).forEach(dev => {
          if (nodePositions[dev.id]) {
            nodePositions[dev.id].x += dx;
            nodePositions[dev.id].y += dy;
          }
        });
      });

      const floorInRoom = store.allFloorDevicesInRoom(draggingRoom);
      floorInRoom.forEach(dev => {
        if (nodePositions[dev.id]) {
          nodePositions[dev.id].x += dx;
          nodePositions[dev.id].y += dy;
        }
      });
      return;
    }
    
    if (panStart) {
      store._raw.topoPanX = panOrig.x + (e.clientX - panStart.x);
      store._raw.topoPanY = panOrig.y + (e.clientY - panStart.y);
      return;
    }

    // Detect Hover & Cursor State
    hoveredNode = null;
    let newCursor = 'default';

    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        hoveredNode = dev.id;
        newCursor = 'grab';
        break;
      }
    }

    if (!hoveredNode) {
      for (const rack of store._raw.racks) {
        const pos = rackPositions[rack.id];
        const size = rackSizes[rack.id];
        if (!pos || !size) continue;
        if (mx >= pos.x + size.w - 20 && mx <= pos.x + size.w && my >= pos.y + size.h - 20 && my <= pos.y + size.h) {
          newCursor = 'nwse-resize';
          break;
        }
        if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 40) {
          newCursor = 'grab';
          break;
        }
      }
      for (const room of store._raw.rooms) {
        const pos = roomPositions[room.id];
        const size = roomSizes[room.id];
        if (!pos || !size) continue;
        if (mx >= pos.x + size.w - 24 && mx <= pos.x + size.w && my >= pos.y + size.h - 24 && my <= pos.y + size.h) {
          newCursor = 'nwse-resize';
          break;
        }
        if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 50) {
          newCursor = 'grab';
          break;
        }
      }
    }
    
    if (canvas.style.cursor !== newCursor) canvas.style.cursor = newCursor;
  });

  canvas.addEventListener('pointerup', e => {
    if (draggingNode && e.detail === 2) {
      openCableModal(draggingNode);
    }
    if (draggingNode || draggingRack || draggingRoom || resizingRack || resizingRoom) {
      saveTopo(); // Guardar cualquier cambio de posición o tamaño
    }
    draggingNode = null; draggingRack = null; draggingRoom = null; 
    resizingRack = null; resizingRoom = null;
    panStart = null;
  });

  canvas.addEventListener('pointercancel', e => {
    draggingNode = null; draggingRack = null; draggingRoom = null; 
    resizingRack = null; resizingRoom = null;
    panStart = null;
  });

  canvas.addEventListener('dblclick', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    // 1) Doble clic sobre un nodo → abrir modal "Nueva Conexión"
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        openCableModal(dev.id);
        return;
      }
    }

    // 2) Doble clic sobre un cable → abrir modal "Editar Conexión"
    const HIT = 10; // tolerancia en píxeles del mundo
    for (const conn of store._raw.connections) {
      const srcPos = nodePositions[conn.sourceDeviceId];
      const dstPos = nodePositions[conn.targetDeviceId];
      if (!srcPos || !dstPos) continue;

      const x1 = srcPos.x, y1 = srcPos.y;
      const x2 = dstPos.x, y2 = dstPos.y;
      const cx1 = x1 + (x2 - x1) * 0.5;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) * 0.5;
      const cy2 = y2;

      // Muestrear la curva Bézier en 30 segmentos y verificar proximidad
      let hit = false;
      let prevBx = x1, prevBy = y1;
      const STEPS = 30;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        const bx = bezierPoint(x1, cx1, cx2, x2, t);
        const by = bezierPoint(y1, cy1, cy2, y2, t);
        // Distancia del punto al segmento [prev..current]
        const dx = bx - prevBx, dy = by - prevBy;
        const len2 = dx*dx + dy*dy;
        let dist2;
        if (len2 === 0) {
          dist2 = (mx - bx)*(mx - bx) + (my - by)*(my - by);
        } else {
          const tp = Math.max(0, Math.min(1, ((mx - prevBx)*dx + (my - prevBy)*dy) / len2));
          const projX = prevBx + tp*dx;
          const projY = prevBy + tp*dy;
          dist2 = (mx - projX)*(mx - projX) + (my - projY)*(my - projY);
        }
        if (dist2 <= HIT*HIT) { hit = true; break; }
        prevBx = bx; prevBy = by;
      }

      if (hit) {
        openEditCableModal(conn.id);
        return;
      }
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    store._raw.topoZoom = Math.min(3, Math.max(0.1, (store._raw.topoZoom || 1) * delta));
    updateZoomLabel();
  });
}

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
      
      if (!rackPositions[rack.id]) {
        rackPositions[rack.id] = { x: currentRackX, y: margin + 80 };
      }
      if (!rackSizes[rack.id]) {
        rackSizes[rack.id] = { w: rw, h: rh };
      }

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

    if (!roomPositions[room.id]) {
      roomPositions[room.id] = { x: currentRoomX, y: margin };
    }
    if (!roomSizes[room.id]) {
      roomSizes[room.id] = { w: roomW, h: roomH };
    }

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

function drawTopo() {
  if(!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  // Fondo global
  ctx.fillStyle = '#2255aa';
  ctx.fillRect(0, 0, W, H);
  
  // Puntos de malla
  ctx.fillStyle = '#ffffff22';
  for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
  }

  const zoom = store._raw.topoZoom || 1;
  const px   = store._raw.topoPanX || 0;
  const py   = store._raw.topoPanY || 0;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);

  let connectedNodes = new Set();
  let activeConns = new Set();
  if (hoveredNode) {
    connectedNodes.add(hoveredNode);
    store._raw.connections.forEach(c => {
      if (c.sourceDeviceId === hoveredNode || c.targetDeviceId === hoveredNode) {
        connectedNodes.add(c.sourceDeviceId);
        connectedNodes.add(c.targetDeviceId);
        activeConns.add(c.id);
      }
    });
  }

  // Draw Rooms
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 24);
    ctx.fillStyle = '#f97316' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px 'Space Grotesk', sans-serif`;
    ctx.fillText(room.name, pos.x + 24, pos.y + 40);

    // Resize Handle Room
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 20, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 20);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#c2410c';
    ctx.fill();
    ctx.restore();
  });

  // Draw Racks
  store._raw.racks.forEach(rack => {
    const pos = rackPositions[rack.id];
    const size = rackSizes[rack.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 12);
    ctx.fillStyle = '#65a30d' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x + 15, pos.y + 25);

    // Resize Handle Rack
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 16, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 16);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#ffffffaa';
    ctx.fill();
    ctx.restore();
  });

  // Draw Connections
  flowT += 0.015;
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const isActive = hoveredNode ? activeConns.has(conn.id) : true;
    
    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
    ctx.strokeStyle = conn.color || '#ffffff';
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.globalAlpha = isActive ? 1 : 0.2;
    ctx.stroke();

    if (isActive) {
      const numParticles = 4;
      for(let i=0; i<numParticles; i++) {
        let t = ((flowT + i/numParticles) % 1);
        const bx = bezierPoint(x1, cx1, cx2, x2, t);
        const by = bezierPoint(y1, cy1, cy2, y2, t);
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }
    ctx.restore();
  });

  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  // Draw Device Nodes
  store._raw.devices.forEach(dev => {
    const pos = nodePositions[dev.id];
    if (!pos) return;
    const col = TYPE_COLORS[dev.type] || '#888';
    const r = 22;
    
    let isActive = true;
    if (searchTerm) {
      const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
      isActive = fields.includes(searchTerm);
    } else {
      isActive = hoveredNode ? connectedNodes.has(dev.id) : true;
    }
    
    const isHoverTarget = hoveredNode === dev.id;

    ctx.save();
    ctx.globalAlpha = isActive ? 1 : 0.15; // Dim significantly if not matching
    
    if (isHoverTarget) {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff66'; 
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff22'; 
      ctx.fill();
    }
    
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.fill(); ctx.stroke();
    
    ctx.font = '16px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const icons = { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾', pc:'💻', camera:'📷', ap:'📶', door:'🚪', printer:'🖨️', phone:'📞' };
    ctx.fillText(icons[dev.type]||'●', pos.x, pos.y);
    
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dev.name.slice(0, 16), pos.x, pos.y + r + 12);
    
    if (dev.ip) {
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const ipWidth = ctx.measureText(dev.ip).width;
      const ipY = pos.y + r + 27;
      
      // Pill background
      ctx.fillStyle = '#e2e8f0'; // Light gray-white
      ctx.beginPath();
      ctx.roundRect(pos.x - ipWidth/2 - 6, ipY - 8, ipWidth + 12, 16, 4);
      ctx.fill();

      // Black text
      ctx.fillStyle = '#000000';
      ctx.fillText(dev.ip, pos.x, ipY);
    }
    
    ctx.restore();
  });

  ctx.restore(); // Restaurar matriz
  
  if (hoveredNode) {
    const dev = store.deviceById(hoveredNode);
    if (dev) {
      ctx.save();
      const hudW = 180;
      const hudH = 100;
      let hudX = mousePos.rawX + 20;
      let hudY = mousePos.rawY + 20;
      
      if (hudX + hudW > W) hudX = mousePos.rawX - hudW - 20;
      if (hudY + hudH > H) hudY = mousePos.rawY - hudH - 20;

      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = TYPE_COLORS[dev.type] || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      ctx.fillText(dev.name, hudX + 12, hudY + 24);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`Tipo:  ${dev.type.toUpperCase()}`, hudX + 12, hudY + 44);
      ctx.fillText(`IP:    ${dev.ip || 'N/A'}`, hudX + 12, hudY + 59);
      ctx.fillText(`User:  ${dev.user || 'N/A'}`, hudX + 12, hudY + 74);
      ctx.fillText(`Pass:  ${dev.pass || 'N/A'}`, hudX + 12, hudY + 89);
      
      ctx.restore();
    }
  }

  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

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
      phys.style.transform = `scale(${z}) translate(${px}px, ${py}px)`;
    }
  }
}

function exportTopologyToPNG() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (pos && size) {
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x + size.w > maxX) maxX = pos.x + size.w;
      if (pos.y + size.h > maxY) maxY = pos.y + size.h;
    }
  });
  
  if (minX === Infinity) {
    notify('No hay topología para exportar', 'warn');
    return;
  }
  
  const margin = 100;
  minX -= margin; minY -= margin;
  maxX += margin; maxY += margin;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width * 2;
  offCanvas.height = height * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);
  
  // Temporarily swap global context, pan and zoom
  const oldCtx = ctx;
  const oldCanvas = canvas;
  const oldZoom = store._raw.topoZoom;
  const oldPanX = store._raw.topoPanX;
  const oldPanY = store._raw.topoPanY;
  const oldHover = hoveredNode;
  
  ctx = oc;
  canvas = offCanvas; 
  store._raw.topoZoom = 1;
  store._raw.topoPanX = -minX;
  store._raw.topoPanY = -minY;
  hoveredNode = null;
  
  // Draw one frame offscreen
  cancelAnimationFrame(topoAnim);
  drawTopo();
  cancelAnimationFrame(topoAnim); // drawTopo requests another frame, stop it
  
  const url = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Topologia_Centro_Datos.png`;
  link.href = url;
  link.click();
  
  // Restore globals
  ctx = oldCtx;
  canvas = oldCanvas;
  store._raw.topoZoom = oldZoom;
  store._raw.topoPanX = oldPanX;
  store._raw.topoPanY = oldPanY;
  hoveredNode = oldHover;
  
  notify('Topología exportada a PNG', 'success');
  startTopo(); // resume normal loop
}
``

## js\ui\rack.js

``javascript
const UNIT_H = 24; // px por U
let dragState = null;

function renderPhysical() {
  const container = document.getElementById('view-physical');
  if(!container) return;
  const racks = store.currentRacks;
  
  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  if (!racks.length) {
    container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; width:100%; display:flex; justify-content:center;">
      <div class="empty-state">
        <div class="icon">🗄️</div>
        <p>No hay gabinetes en esta sala.</p>
        <p>Haz clic en "+ Rack" para agregar uno.</p>
      </div>
    </div>`;
    updateZoomLabel();
    return;
  }

  const racksHTML = racks.map(rack => {
    const devices = store.allDevicesInRack(rack.id);
    const deviceMap = {};
    devices.forEach(d => { for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d; });

    let slotsHTML = '';
    let skip = 0;
    for (let u = 1; u <= rack.height; u++) {
      if (skip > 0) { skip--; continue; }
      const dev = devices.find(d => d.slotStart === u);
      if (dev) {
        const h = dev.size * UNIT_H;
        let matchClass = '';
        if (searchTerm) {
          const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
          matchClass = fields.includes(searchTerm) ? 'search-match' : 'search-dim';
        }
        slotsHTML += `<div class="rack-slot" style="height:${UNIT_H}px"></div>`;
        skip = dev.size - 1;
        slotsHTML = slotsHTML.slice(0, -`<div class="rack-slot" style="height:${UNIT_H}px"></div>`.length);
        slotsHTML += `
          <div class="rack-slot occupied" style="height:${h}px" data-slot="${u}" data-rack="${rack.id}">
            <div class="device-faceplate ${matchClass}"
                 style="top:0; height:${h}px"
                 data-device-id="${dev.id}"
                 draggable="true">
              ${buildFaceplate(dev, h)}
              <div class="device-actions">
                <button class="dev-btn edit" data-edit-dev="${dev.id}" title="Editar">✎</button>
                <button class="dev-btn del" data-del-dev="${dev.id}" title="Eliminar">🗑</button>
              </div>
            </div>
          </div>`;
      } else {
        slotsHTML += `<div class="rack-slot" style="height:${UNIT_H}px" data-slot="${u}" data-rack="${rack.id}"></div>`;
      }
    }

    const railHTML = Array.from({length: rack.height}, (_, i) => `<div class="rail-unit">${i + 1}</div>`).join('');

    return `
    <div class="rack-wrapper" data-rack-id="${rack.id}">
      <div class="rack-card" data-rack-id="${rack.id}">
        <div class="rack-header">
          <div class="rack-title">
            <div class="rack-color-dot" style="background:${escapeHTML(rack.color)}; box-shadow:0 0 6px ${escapeHTML(rack.color)}88"></div>
            ${escapeHTML(rack.name)}
          </div>
          <div class="rack-hdr-btns">
            <button class="rack-btn" data-edit-rack="${escapeHTML(rack.id)}" title="Editar">✎</button>
            <button class="rack-btn del" data-del-rack="${escapeHTML(rack.id)}" title="Eliminar">🗑</button>
          </div>
        </div>
        <div class="rack-body">
          <div class="rack-rail-left">${railHTML}</div>
          <div class="rack-slots" style="width:220px" id="slots-${rack.id}">
            ${slotsHTML}
          </div>
          <div class="rack-rail-right">${railHTML}</div>
        </div>
      </div>
      <div style="text-align:center; font-size:9px; color:var(--text-muted); margin-top:4px; font-family:var(--font-mono)">
        ${rack.height}U · ${devices.reduce((s,d)=>s+d.size,0)}/${rack.height} usado · ${devices.reduce((s,d)=>s+(parseInt(d.power)||0),0)}W
      </div>
    </div>`;
  }).join('');

  container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; display:flex; flex-wrap:wrap; gap:24px; align-content:flex-start; width: 100%;">
    <div style="display:flex; flex-wrap:wrap; gap:24px; width:100%;">${racksHTML}</div>
  </div>`;

  const floorSection = renderFloorSection(store._raw.currentRoomId);
  container.querySelector('#view-physical-content').appendChild(floorSection);

  bindRackEvents(container);
  updateZoomLabel();
}

function bindRackEvents(container) {
  container.querySelectorAll('[data-edit-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditRackModal(btn.dataset.editRack);
    });
  });
  container.querySelectorAll('[data-del-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('¿Eliminar este gabinete y todos sus equipos?')) {
        store.deleteRack(btn.dataset.delRack);
        notify('Gabinete eliminado', 'warn');
      }
    });
  });
  container.querySelectorAll('.rack-slot').forEach(slot => {
    slot.addEventListener('dragover',  onSlotDragOver);
    slot.addEventListener('dragleave', onSlotDragLeave);
    slot.addEventListener('drop',      onSlotDrop);
  });
  container.querySelectorAll('.device-faceplate').forEach(fp => {
    fp.addEventListener('dragstart', onDeviceDragStart);
    fp.addEventListener('dragend',   onDeviceDragEnd);
    fp.addEventListener('dblclick',  onDeviceDoubleClick);
    fp.addEventListener('contextmenu', onDeviceContextMenu);
    fp.addEventListener('mouseenter', onDeviceMouseEnter);
    fp.addEventListener('mouseleave', onDeviceMouseLeave);
  });
  container.querySelectorAll('.dev-btn.edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditDeviceModal(btn.dataset.editDev);
    });
  });
  container.querySelectorAll('.dev-btn.del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('¿Eliminar este equipo?')) {
        store.deleteDevice(btn.dataset.delDev);
        notify('Equipo eliminado', 'warn');
      }
    });
  });

  container.querySelectorAll('.floor-device-card').forEach(card => {
    card.addEventListener('dblclick', e => {
      e.stopPropagation();
      openEditDeviceModal(card.dataset.deviceId);
    });
    card.addEventListener('mouseenter', e => {
      const devId = card.dataset.deviceId;
      const dev = store.deviceById(devId);
      if(!dev) return;

      const tooltip = document.getElementById('device-tooltip');
      if(!tooltip) return;

      tooltip.innerHTML = `
        <div class="tt-title">${escapeHTML(dev.name)}</div>
        <div class="tt-row"><span>Tipo:</span> <span>${escapeHTML(dev.type.toUpperCase())}</span></div>
        <div class="tt-row"><span>IP:</span> <span>${escapeHTML(dev.ip || 'N/A')}</span></div>
        <div class="tt-row"><span>User:</span> <span>${escapeHTML(dev.user || 'N/A')}</span></div>
        <div class="tt-row"><span>Pass:</span> <span>${escapeHTML(dev.pass || 'N/A')}</span></div>
      `;
      
      const rect = card.getBoundingClientRect();
      tooltip.style.left = `${rect.right + 10}px`;
      let top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
      if(top < 20) top = 20;
      if(top + tooltip.offsetHeight > window.innerHeight - 20) top = window.innerHeight - tooltip.offsetHeight - 20;
      tooltip.style.top = `${top}px`;

      tooltip.classList.add('visible');
    });
    card.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('device-tooltip');
      if(tooltip) tooltip.classList.remove('visible');
    });
  });
}

function onCatalogDragStart(e) {
  const id = e.currentTarget.dataset.catalogId;
  const item = CATALOG.find(c => c.id === id);
  dragState = { type: 'catalog', item: deepClone(item) };
  e.currentTarget.classList.add('dragging');

  const ghost = document.getElementById('drag-ghost');
  if(ghost) {
    ghost.style.cssText = `position:fixed; width:220px; height:${item.size * UNIT_H}px; border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.8; left:-9999px; top:-9999px;`;
    ghost.innerHTML = buildFaceplate({ ...item, ip: '' }, item.size * UNIT_H);
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 110, item.size * UNIT_H / 2);
  }
  e.dataTransfer.effectAllowed = 'copy';
}

function onCatalogDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  dragState = null;
  clearDropHighlights();
}

function onDeviceDragStart(e) {
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  const dev = store.deviceById(devId);
  if (!dev) return;
  dragState = { type: 'device', deviceId: devId, device: deepClone(dev) };
  e.dataTransfer.effectAllowed = 'move';

  const ghost = document.getElementById('drag-ghost');
  if(ghost) {
    ghost.style.cssText = `position:fixed; width:220px; height:${dev.size * UNIT_H}px; border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.7; left:-9999px; top:-9999px;`;
    ghost.innerHTML = buildFaceplate(dev, dev.size * UNIT_H);
    e.dataTransfer.setDragImage(ghost, 110, dev.size * UNIT_H / 2);
  }
}

function onDeviceDragEnd(e) {
  dragState = null;
  clearDropHighlights();
  const ghost = document.getElementById('drag-ghost');
  if(ghost) ghost.style.left = '-9999px';
}

function onSlotDragOver(e) {
  e.preventDefault();
  if (!dragState) return;
  e.dataTransfer.dropEffect = dragState.type === 'catalog' ? 'copy' : 'move';
  const slot = e.currentTarget;
  const slotU = parseInt(slot.dataset.slot);
  const rackId = slot.dataset.rack;
  const rack = store.rackById(rackId);
  const size = dragState.type === 'catalog' ? dragState.item.size : dragState.device.size;
  if (!rack || !slotU) return;

  clearDropHighlights();
  const container = slot.closest('.rack-slots');
  container.querySelectorAll('.rack-slot').forEach(s => {
    const u = parseInt(s.dataset.slot);
    if (u >= slotU && u < slotU + size) {
      const valid = canPlace(rackId, slotU, size, dragState.type === 'device' ? dragState.deviceId : null);
      s.classList.add(valid ? 'drop-highlight' : 'drop-invalid');
    }
  });
}

function onSlotDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    clearDropHighlights();
  }
}

function onSlotDrop(e) {
  e.preventDefault();
  if (!dragState) return;
  const slot  = e.currentTarget;
  const slotU = parseInt(slot.dataset.slot);
  const rackId = slot.dataset.rack;
  clearDropHighlights();

  if (dragState.type === 'catalog') {
    const item = { ...dragState.item, name: dragState.item.name };
    const ok = store.addDeviceToRack(item, rackId, slotU);
    if (ok) notify(`${item.name} instalado en U${slotU}`, 'success');
    else    notify('No hay espacio suficiente en esa posición', 'error');
  } else if (dragState.type === 'device') {
    const ok = store.moveDevice(dragState.deviceId, rackId, slotU);
    if (ok) notify('Equipo movido', 'success');
    else    notify('Posición inválida o colisión detectada', 'error');
  }
  dragState = null;
}

function canPlace(rackId, slotStart, size, excludeDeviceId = null) {
  const rack = store.rackById(rackId);
  if (!rack) return false;
  if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
  const existing = store.allDevicesInRack(rackId).filter(d => d.id !== excludeDeviceId);
  for (const d of existing) {
    const dEnd = d.slotStart + d.size - 1;
    const nEnd = slotStart + size - 1;
    if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
  }
  return true;
}

function clearDropHighlights() {
  document.querySelectorAll('.drop-highlight, .drop-invalid').forEach(el => {
    el.classList.remove('drop-highlight', 'drop-invalid');
  });
}

function onDeviceDoubleClick(e) {
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  openEditDeviceModal(devId);
}

function onDeviceContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  showContextMenu(e.clientX, e.clientY, devId);
}

function showContextMenu(x, y, devId) {
  const menu = document.getElementById('ctx-menu');
  if(!menu) return;
  const dev = store.deviceById(devId);
  menu.innerHTML = `
    <div class="ctx-item" data-action="edit" data-id="${escapeHTML(devId)}">✎ Editar equipo</div>
    <div class="ctx-item" data-action="cable" data-id="${escapeHTML(devId)}">🔌 Agregar cable</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" data-action="delete" data-id="${escapeHTML(devId)}">🗑 Eliminar ${escapeHTML(dev?.name || '')}</div>
  `;
  menu.style.cssText = `left:${x}px; top:${y}px`;
  menu.classList.remove('hidden');

  menu.querySelectorAll('.ctx-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      menu.classList.add('hidden');
      const id = item.dataset.id;
      if (item.dataset.action === 'edit')   openEditDeviceModal(id);
      if (item.dataset.action === 'delete') { store.deleteDevice(id); notify('Equipo eliminado', 'warn'); }
      if (item.dataset.action === 'cable')  openCableModal(id);
    });
  });
}

document.addEventListener('click', () => {
  const menu = document.getElementById('ctx-menu');
  if(menu) menu.classList.add('hidden');
});

function onDeviceMouseEnter(e) {
  const devId = e.currentTarget.dataset.deviceId;
  const dev = store.deviceById(devId);
  if(!dev) return;

  const tooltip = document.getElementById('device-tooltip');
  if(!tooltip) return;

  tooltip.innerHTML = `
    <div class="tt-title">${escapeHTML(dev.name)}</div>
    <div class="tt-row"><span>Tipo:</span> <span>${escapeHTML(dev.type.toUpperCase())}</span></div>
    <div class="tt-row"><span>IP:</span> <span>${escapeHTML(dev.ip || 'N/A')}</span></div>
    <div class="tt-row"><span>User:</span> <span>${escapeHTML(dev.user || 'N/A')}</span></div>
    <div class="tt-row"><span>Pass:</span> <span>${escapeHTML(dev.pass || 'N/A')}</span></div>
  `;
  
  const rackEl = e.currentTarget.closest('.rack-wrapper');
  if(rackEl) {
    const rect = rackEl.getBoundingClientRect();
    const fpRect = e.currentTarget.getBoundingClientRect();
    
    tooltip.style.left = `${rect.right + 20}px`;
    let top = fpRect.top + (fpRect.height / 2) - (tooltip.offsetHeight / 2);
    if(top < 20) top = 20;
    if(top + tooltip.offsetHeight > window.innerHeight - 20) top = window.innerHeight - tooltip.offsetHeight - 20;
    tooltip.style.top = `${top}px`;
  }

  tooltip.classList.add('visible');
}

function onDeviceMouseLeave(e) {
  const tooltip = document.getElementById('device-tooltip');
  if(tooltip) tooltip.classList.remove('visible');
}

function renderFloorSection(roomId) {
  const floorDevices = store.allFloorDevicesInRoom(roomId);
  
  const section = document.createElement('div');
  section.className = 'floor-section';
  section.dataset.roomId = roomId;
  section.style.width = '100%';
  section.innerHTML = `
    <div class="floor-section-header">
      <span>Equipos de Piso / Periféricos</span>
      <span class="floor-device-count">${floorDevices.length} dispositivos</span>
    </div>
    <div class="floor-devices-grid" id="floor-grid-${roomId}" data-room-id="${roomId}">
      ${floorDevices.length === 0
        ? '<div class="floor-empty">Arrastra periféricos o equipos aquí para ubicarlos en la sala</div>'
        : floorDevices.map(d => getFloorFaceplate(d)).join('')
      }
    </div>`;

  const grid = section.querySelector('.floor-devices-grid');
  
  grid.addEventListener('dragover', e => {
    e.preventDefault();
    grid.classList.add('drag-over');
  });
  
  grid.addEventListener('dragleave', () => {
    grid.classList.remove('drag-over');
  });
  
  grid.addEventListener('drop', e => {
    e.preventDefault();
    grid.classList.remove('drag-over');
    
    if (dragState && dragState.type === 'catalog') {
      const template = dragState.item;
      const floorTypes = ['pc', 'camera', 'ap', 'door', 'printer', 'phone'];
      
      if (floorTypes.includes(template.type)) {
        store.addFloorDevice(template, roomId);
        notify(`${template.name} ubicado en la sala`, 'success');
      } else {
        notify('Este equipo requiere montaje obligatorio en Rack', 'warn');
      }
    }
  });

  return section;
}
``

## js\ui\faceplates.js

``javascript
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
      <div class="fp-right">
        <div class="power-btn"></div>
      </div>
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
  // Default
  return `<div style="height:${h}px;display:flex;align-items:center;padding:0 8px;background:#111;font-size:10px;color:#666">${escapeHTML(device.name)}</div>`;
}

function getFloorFaceplate(device) {
  const icons = {
    pc:       '💻',
    camera:   '📷',
    ap:       '📶',
    door:     '🚪',
    printer:  '🖨️',
    phone:    '📞',
  };
  const colors = {
    pc:      '#0ea5e9',
    camera:  '#8b5cf6',
    ap:      '#10b981',
    door:    '#f59e0b',
    printer: '#06b6d4',
    phone:   '#ef4444',
  };
  const icon  = icons[device.type]  || '📦';
  const color = colors[device.type] || '#8b9ab8';
  const name  = escapeHTML(device.name);

  return `
    <div class="floor-device-card" 
         data-device-id="${device.id}" 
         style="--floor-color: ${color}">
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

``

