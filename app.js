/* ============================================================
   UTILIDADES GLOBALES
============================================================ */
const uid = () => Math.random().toString(36).slice(2, 10);
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const lerp = (a, b, t) => a + (b - a) * t;

function notify(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  const icons = { info: '●', success: '✓', error: '✗', warn: '⚠' };
  el.innerHTML = `<span>${icons[type]||'●'}</span> ${msg}`;
  const area = document.getElementById('notif-area');
  area.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ============================================================
   STORE — ESTADO CENTRAL REACTIVO (Proxy + localStorage)
============================================================ */
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
    renderAll();
  }

  redo() {
    if (!this._redoStack.length) return;
    this._undoStack.push(deepClone(this._raw));
    const next = this._redoStack.pop();
    Object.assign(this._raw, next);
    this._save();
    this._emit('change', { path: 'redo' });
    this._updateHistoryButtons();
    renderAll();
  }

  _updateHistoryButtons() {
    document.getElementById('btn-undo').disabled = !this._undoStack.length;
    document.getElementById('btn-redo').disabled = !this._redoStack.length;
  }

  /* ---- Helpers de datos ---- */
  get currentRoom()  { return this._raw.rooms.find(r => r.id === this._raw.currentRoomId); }
  get currentRacks() { return this._raw.racks.filter(r => r.roomId === this._raw.currentRoomId); }
  allDevicesInRack(rackId) { return this._raw.devices.filter(d => d.rackId === rackId); }
  deviceById(id)     { return this._raw.devices.find(d => d.id === id); }
  rackById(id)       { return this._raw.racks.find(r => r.id === id); }

  addRoom(name) {
    this.snapshot();
    const id = uid();
    this._raw.rooms.push({ id, name });
    this._raw.currentRoomId = id;
    this._save(); renderAll();
  }

  addRack({ name, height, color }) {
    this.snapshot();
    this._raw.racks.push({ id: uid(), roomId: this._raw.currentRoomId, name, height: parseInt(height), color, devices: [] });
    this._save(); renderAll();
  }

  updateRack(id, props) {
    this.snapshot();
    const r = this._raw.racks.find(r => r.id === id);
    if (r) Object.assign(r, props);
    this._save(); renderAll();
  }

  deleteRack(id) {
    this.snapshot();
    this._raw.racks = this._raw.racks.filter(r => r.id !== id);
    this._raw.devices = this._raw.devices.filter(d => d.rackId !== id);
    this._save(); renderAll();
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
    this._save(); renderAll();
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
    this._save(); renderAll();
    return true;
  }

  deleteDevice(id) {
    this.snapshot();
    this._raw.devices = this._raw.devices.filter(d => d.id !== id);
    this._raw.connections = this._raw.connections.filter(c => c.sourceDeviceId !== id && c.targetDeviceId !== id);
    this._save(); renderAll();
  }

  updateDevice(id, props) {
    this.snapshot();
    const d = this._raw.devices.find(d => d.id === id);
    if (d) Object.assign(d, props);
    this._save(); renderAll();
  }

  addConnection(conn) {
    this.snapshot();
    this._raw.connections.push({ id: uid(), ...conn });
    this._save(); renderAll();
  }

  deleteConnection(id) {
    this.snapshot();
    this._raw.connections = this._raw.connections.filter(c => c.id !== id);
    this._save(); renderAll();
  }

  /** Estadísticas calculadas */
  getStats() {
    const racks = this.currentRacks;
    const devices = racks.flatMap(r => this.allDevicesInRack(r.id));
    const totalU = racks.reduce((s, r) => s + r.height, 0);
    const usedU  = devices.reduce((s, d) => s + d.size, 0);
    const power  = devices.reduce((s, d) => s + (parseInt(d.power) || 0), 0);
    return { racks: racks.length, devices: devices.length, totalU, usedU, power, connections: this._raw.connections.length };
  }
}

const store = new Store();

/* ============================================================
   CATÁLOGO DE EQUIPOS (plantillas arrastrables)
============================================================ */
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
];

const TYPE_COLORS = { server:'#0ea5e9', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', ups:'#8b5cf6', storage:'#06b6d4' };

/* ============================================================
   RENDER — CATÁLOGO LATERAL
============================================================ */
function renderCatalog() {
  const query  = document.getElementById('catalog-search').value.toLowerCase();
  const filter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
  const list   = CATALOG.filter(item => {
    const matchType = filter === 'all' ||
      (filter === 'server'  && item.type === 'server') ||
      (filter === 'switch'  && ['switch','router','firewall'].includes(item.type)) ||
      (filter === 'storage' && ['storage','ups'].includes(item.type));
    const matchQuery = !query || item.name.toLowerCase().includes(query) || item.type.includes(query);
    return matchType && matchQuery;
  });
  const cat = document.getElementById('catalog');
  cat.innerHTML = list.map(item => `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}"
         style="border-left: 3px solid ${TYPE_COLORS[item.type]||'#444'}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22;color:${TYPE_COLORS[item.type]}">${item.icon}</div>
      <div class="cat-info">
        <div class="cat-name">${item.name}</div>
        <div class="cat-meta">${item.type.toUpperCase()} │ ${item.power}W</div>
      </div>
      <div class="cat-size">${item.size}U</div>
      <div class="cat-actions" style="display:flex; flex-direction:column; gap:2px; margin-left:4px;">
        <button class="cat-btn edit" data-edit-cat="${item.id}" title="Editar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--text-muted)">✎</button>
        <button class="cat-btn del" data-del-cat="${item.id}" title="Eliminar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--red)">🗑</button>
      </div>
    </div>
  `).join('');
  // Bind drag events
  cat.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', onCatalogDragStart);
    el.addEventListener('dragend',   onCatalogDragEnd);
  });
  // Bind catalog action buttons
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

/* ============================================================
   RENDER — SALA TABS
============================================================ */
function renderRoomTabs() {
  const tabs = document.getElementById('room-tabs');
  tabs.innerHTML = store._raw.rooms.map(r => `
    <button class="room-tab ${r.id === store._raw.currentRoomId ? 'active' : ''}" data-room-id="${r.id}">
      🏢 ${r.name}
      ${store._raw.rooms.length > 1 ? `<span class="close-btn" data-del-room="${r.id}">✕</span>` : ''}
    </button>
  `).join('');
  tabs.querySelectorAll('.room-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.dataset.delRoom) { deleteRoom(e.target.dataset.delRoom); return; }
      store._raw.currentRoomId = btn.dataset.roomId;
      renderAll();
    });
  });
}

/* ============================================================
   RENDER — ESTADÍSTICAS SIDEBAR
============================================================ */
function renderStats() {
  const s = store.getStats();
  document.getElementById('stat-racks').textContent = s.racks;
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

/* ============================================================
   FACEPLATE BUILDERS — Render HTML de equipos
============================================================ */
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
        <div class="dev-name">${device.name}</div>
        <div class="lcd">${brand} · ${device.ip || 'NO IP'}</div>
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
        <div class="fw-name">${device.name}</div>
        <div class="fw-status">${device.ip || 'NO IP'} │ ACTIVE</div>
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
  return `<div style="height:${h}px;display:flex;align-items:center;padding:0 8px;background:#111;font-size:10px;color:#666">${device.name}</div>`;
}

/* ============================================================
   RENDER — RACKS FÍSICOS
============================================================ */
const UNIT_H = 24; // px por U

function renderPhysical() {
  const container = document.getElementById('view-physical');
  const racks = store.currentRacks;
  const searchTerm = document.getElementById('global-search').value.toLowerCase();

  if (!racks.length) {
    container.innerHTML = `<div class="empty-state" style="margin:auto">
      <div class="icon">🗄️</div>
      <p>No hay gabinetes en esta sala.</p>
      <p>Haz clic en "+ Rack" para agregar uno.</p>
    </div>`;
    return;
  }

  container.innerHTML = racks.map(rack => {
    const devices = store.allDevicesInRack(rack.id);
    const deviceMap = {}; // slotStart -> device
    devices.forEach(d => { for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d; });

    // Generar slots
    let slotsHTML = '';
    let skip = 0;
    for (let u = 1; u <= rack.height; u++) {
      if (skip > 0) { skip--; continue; }
      const dev = devices.find(d => d.slotStart === u);
      if (dev) {
        const h = dev.size * UNIT_H;
        const top = (u - 1) * UNIT_H;
        // Buscar match de búsqueda
        let matchClass = '';
        if (searchTerm) {
          const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
          matchClass = fields.includes(searchTerm) ? 'search-match' : 'search-dim';
        }
        slotsHTML += `
          <div class="rack-slot" style="height:${UNIT_H}px"></div>`;
        skip = dev.size - 1;
        // Overlay del device
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

    // Rails con numeración
    const railHTML = Array.from({length: rack.height}, (_, i) => {
      const u = i + 1;
      return `<div class="rail-unit">${u}</div>`;
    }).join('');

    return `
    <div class="rack-wrapper" data-rack-id="${rack.id}">
      <div class="rack-card" data-rack-id="${rack.id}">
        <div class="rack-header">
          <div class="rack-title">
            <div class="rack-color-dot" style="background:${rack.color}; box-shadow:0 0 6px ${rack.color}88"></div>
            ${rack.name}
          </div>
          <div class="rack-hdr-btns">
            <button class="rack-btn" data-edit-rack="${rack.id}" title="Editar">✎</button>
            <button class="rack-btn del" data-del-rack="${rack.id}" title="Eliminar">🗑</button>
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

  // Bind events
  bindRackEvents(container);
}

function bindRackEvents(container) {
  // Edit / Delete rack
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
  // Drag & Drop slots
  container.querySelectorAll('.rack-slot').forEach(slot => {
    slot.addEventListener('dragover',  onSlotDragOver);
    slot.addEventListener('dragleave', onSlotDragLeave);
    slot.addEventListener('drop',      onSlotDrop);
  });
  // Device faceplate events
  container.querySelectorAll('.device-faceplate').forEach(fp => {
    fp.addEventListener('dragstart', onDeviceDragStart);
    fp.addEventListener('dragend',   onDeviceDragEnd);
    fp.addEventListener('dblclick',  onDeviceDoubleClick);
    fp.addEventListener('contextmenu', onDeviceContextMenu);
  });
  // Device action buttons
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
}

/* ============================================================
   DRAG & DROP — DESDE CATÁLOGO
============================================================ */
let dragState = null;

function onCatalogDragStart(e) {
  const id = e.currentTarget.dataset.catalogId;
  const item = CATALOG.find(c => c.id === id);
  dragState = { type: 'catalog', item: deepClone(item) };
  e.currentTarget.classList.add('dragging');

  // Ghost
  const ghost = document.getElementById('drag-ghost');
  ghost.style.cssText = `
    position:fixed; width:220px; height:${item.size * UNIT_H}px;
    border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.8;
    left:-9999px; top:-9999px;
  `;
  ghost.innerHTML = buildFaceplate({ ...item, ip: '' }, item.size * UNIT_H);
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 110, item.size * UNIT_H / 2);
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
  ghost.style.cssText = `
    position:fixed; width:220px; height:${dev.size * UNIT_H}px;
    border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.7;
    left:-9999px; top:-9999px;
  `;
  ghost.innerHTML = buildFaceplate(dev, dev.size * UNIT_H);
  e.dataTransfer.setDragImage(ghost, 110, dev.size * UNIT_H / 2);
}

function onDeviceDragEnd(e) {
  dragState = null;
  clearDropHighlights();
  document.getElementById('drag-ghost').style.left = '-9999px';
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
  // Highlight affected slots
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

/* ============================================================
   DEVICE EVENTS
============================================================ */
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
  const dev = store.deviceById(devId);
  menu.innerHTML = `
    <div class="ctx-item" data-action="edit" data-id="${devId}">✎ Editar equipo</div>
    <div class="ctx-item" data-action="cable" data-id="${devId}">🔌 Agregar cable</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" data-action="delete" data-id="${devId}">🗑 Eliminar ${dev?.name || ''}</div>
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

document.addEventListener('click', () => document.getElementById('ctx-menu').classList.add('hidden'));

/* ============================================================
   BOTTOM PANEL — TABLAS
============================================================ */
let activeTab = 'inventory';

function renderBottomPanel() {
  const wrap = document.getElementById('bottom-table-wrap');
  const query = document.getElementById('table-search').value.toLowerCase();
  
  const btnDev = document.getElementById('table-btn-add-device');
  const btnConn = document.getElementById('table-btn-add-conn');
  
  if (activeTab === 'inventory') {
    if (btnDev) btnDev.style.display = 'block';
    if (btnConn) btnConn.style.display = 'none';
    renderInventoryTable(wrap, query);
  } else {
    if (btnDev) btnDev.style.display = 'none';
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
      <th>MAC</th><th>Serie</th><th>Usuario</th><th>Contraseña</th><th>Consumo (W)</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${devices.map(d => {
      const rack = store.rackById(d.rackId);
      return `<tr data-dev-id="${d.id}">
        <td>${rack?.name || '-'}</td>
        <td>${d.slotStart}</td>
        <td class="editable" data-field="name" data-dev="${d.id}">${d.name}</td>
        <td><span class="type-badge ${d.type}">${d.type}</span></td>
        <td class="editable" data-field="ip"  data-dev="${d.id}">${d.ip  || '-'}</td>
        <td class="editable" data-field="mac" data-dev="${d.id}">${d.mac || '-'}</td>
        <td class="editable" data-field="serial" data-dev="${d.id}">${d.serial || '-'}</td>
        <td class="editable" data-field="user" data-dev="${d.id}">${d.user || '-'}</td>
        <td class="editable" data-field="pass" data-dev="${d.id}">${d.pass || '-'}</td>
        <td class="editable" data-field="power" data-dev="${d.id}">${d.power || 0}</td>
        <td>
          <button class="tbl-action" data-del-dev="${d.id}">✕ Eliminar</button>
          <button class="tbl-action" onclick="openEditDeviceModal('${d.id}')" style="border-color:var(--accent);color:var(--accent)">✎ Editar</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;

  // Inline editing
  wrap.querySelectorAll('td.editable').forEach(td => {
    td.addEventListener('dblclick', () => startCellEdit(td));
  });
  wrap.querySelectorAll('[data-del-dev]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteDevice(btn.dataset.delDev);
      notify('Equipo eliminado', 'warn');
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
  // Validaciones
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
  store.updateDevice(devId, { [field]: field === 'power' ? parseInt(val) || 0 : val });
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
      <th>Origen</th><th>Puerto Origen</th><th>Destino</th><th>Puerto Destino</th>
      <th>Tipo Cable</th><th>Color</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${conns.map(c => {
      const src = store.deviceById(c.sourceDeviceId);
      const dst = store.deviceById(c.targetDeviceId);
      return `<tr>
        <td><span class="type-badge ${src?.type||''}">${src?.name||'?'}</span></td>
        <td>${c.sourcePort}</td>
        <td><span class="type-badge ${dst?.type||''}">${dst?.name||'?'}</span></td>
        <td>${c.targetPort}</td>
        <td>${c.cableType}</td>
        <td><span class="cable-dot" style="background:${c.color};box-shadow:0 0 4px ${c.color}"></span> ${c.color}</td>
        <td><button class="tbl-action" data-del-conn="${c.id}">✕ Eliminar</button></td>
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
}

/* ============================================================
   TOPOLOGY CANVAS
============================================================ */
const canvas  = document.getElementById('topology-canvas');
const ctx     = canvas.getContext('2d');
let topoAnim  = null;
let panStart  = null;
let panOrig   = { x: 0, y: 0 };
const nodePositions = {};   // { deviceId: {x,y} }
const rackPositions = {};   // { rackId: {x,y} }
let flowT = 0;

function initTopoPositions() {
  const racks = store.currentRacks;
  const margin = 60;
  const rackW  = 180;
  const rackH_base = 280;
  racks.forEach((rack, ri) => {
    if (!rackPositions[rack.id]) {
      rackPositions[rack.id] = { x: margin + ri * (rackW + 80), y: margin };
    }
    const devices = store.allDevicesInRack(rack.id);
    devices.forEach((dev, di) => {
      if (!nodePositions[dev.id]) {
        nodePositions[dev.id] = {
          x: rackPositions[rack.id].x + rackW / 2,
          y: rackPositions[rack.id].y + 60 + di * 55
        };
      }
    });
  });
}

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function drawTopo() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  // Background dots
  ctx.fillStyle = '#1e2d4a22';
  for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
  }

  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);

  // Draw rack containers
  const racks = store.currentRacks;
  racks.forEach(rack => {
    const pos = rackPositions[rack.id] || { x: 60, y: 60 };
    const devs = store.allDevicesInRack(rack.id);
    const rh = Math.max(200, devs.length * 55 + 80);
    const rw = 190;

    // Rack container
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x - 10, pos.y - 10, rw, rh, 12);
    ctx.fillStyle = rack.color + '11';
    ctx.strokeStyle = rack.color + '66';
    ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();

    // Rack label
    ctx.fillStyle = rack.color;
    ctx.font = `bold 11px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x, pos.y + 8);
    ctx.restore();
  });

  // Draw connections (Bezier curves + flow dots)
  flowT += 0.015;
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;

    // Cable line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.strokeStyle = conn.color || '#3b82f6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.stroke();

    // Flow dot
    const t = (Math.sin(flowT + conn.id.charCodeAt(0) * 0.1) * 0.5 + 0.5);
    const bx = bezierPoint(x1, cx1, cx2, x2, t);
    const by = bezierPoint(y1, cy1, cy2, y2, t);
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fillStyle = conn.color || '#3b82f6';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();
  });

  // Draw device nodes
  store._raw.devices.forEach(dev => {
    const pos = nodePositions[dev.id];
    if (!pos) return;
    const col = TYPE_COLORS[dev.type] || '#888';
    const r = 22;

    ctx.save();
    // Glow
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
    ctx.fillStyle = col + '22'; ctx.fill();
    // Circle
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
    ctx.fillStyle = '#151c2e';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    // Icon
    ctx.font = '14px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const icons = { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' };
    ctx.fillText(icons[dev.type]||'●', pos.x, pos.y);
    // Name
    ctx.font = '9px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#c0cce0';
    ctx.fillText(dev.name.slice(0, 14), pos.x, pos.y + r + 10);
    // IP
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = col;
    ctx.fillText(dev.ip || '', pos.x, pos.y + r + 20);
    ctx.restore();
  });

  ctx.restore();
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

// Canvas Drag for nodes
let draggingNode = null, draggingRack = null;
let nodeOrig = null;

canvas.addEventListener('mousedown', e => {
  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;
  const mx = (e.offsetX - px) / zoom;
  const my = (e.offsetY - py) / zoom;

  // Check device nodes first
  for (const dev of store._raw.devices) {
    const pos = nodePositions[dev.id];
    if (!pos) continue;
    const dx = mx - pos.x, dy = my - pos.y;
    if (dx*dx + dy*dy <= 22*22) {
      draggingNode = dev.id;
      nodeOrig = { x: pos.x - mx, y: pos.y - my };
      return;
    }
  }
  // Rack drag
  for (const rack of store.currentRacks) {
    const pos = rackPositions[rack.id];
    if (!pos) continue;
    const devs = store.allDevicesInRack(rack.id);
    const rh = Math.max(200, devs.length * 55 + 80);
    if (mx >= pos.x-10 && mx <= pos.x+180 && my >= pos.y-10 && my <= pos.y+rh) {
      draggingRack = rack.id;
      nodeOrig = { x: pos.x - mx, y: pos.y - my };
      return;
    }
  }
  // Pan
  panStart = { x: e.clientX, y: e.clientY };
  panOrig  = { x: store._raw.panX || 0, y: store._raw.panY || 0 };
});

canvas.addEventListener('mousemove', e => {
  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;
  const mx = (e.offsetX - px) / zoom;
  const my = (e.offsetY - py) / zoom;

  if (draggingNode) {
    nodePositions[draggingNode] = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
    return;
  }
  if (draggingRack) {
    const np = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
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
  if (panStart) {
    store._raw.panX = panOrig.x + (e.clientX - panStart.x);
    store._raw.panY = panOrig.y + (e.clientY - panStart.y);
  }
});

canvas.addEventListener('mouseup', e => {
  if (draggingNode && e.detail === 2) {
    openCableModal(draggingNode);
  }
  draggingNode = null; draggingRack = null; panStart = null;
});

canvas.addEventListener('dblclick', e => {
  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;
  const mx = (e.offsetX - px) / zoom;
  const my = (e.offsetY - py) / zoom;
  for (const dev of store._raw.devices) {
    const pos = nodePositions[dev.id];
    if (!pos) continue;
    const dx = mx - pos.x, dy = my - pos.y;
    if (dx*dx + dy*dy <= 22*22) {
      openCableModal(dev.id);
      return;
    }
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  store._raw.zoom = Math.min(3, Math.max(0.2, (store._raw.zoom || 1) * delta));
  updateZoomLabel();
});

/* ============================================================
   MODALES
============================================================ */
let editingRackId   = null;
let editingDeviceId = null;

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

document.getElementById('modal-rack-save').addEventListener('click', () => {
  const name   = document.getElementById('rack-name').value.trim();
  const height = parseInt(document.getElementById('rack-height').value);
  const color  = document.getElementById('rack-color').value;
  if (!name) { notify('Ingresa un nombre para el gabinete', 'error'); return; }
  if (editingRackId) store.updateRack(editingRackId, { name, height, color });
  else store.addRack({ name, height, color });
  document.getElementById('modal-rack').classList.add('hidden');
  notify(editingRackId ? 'Gabinete actualizado' : 'Gabinete creado', 'success');
  editingRackId = null;
});

document.getElementById('modal-rack-cancel').addEventListener('click', () => {
  document.getElementById('modal-rack').classList.add('hidden');
});

// Sync color picker
document.getElementById('rack-color-picker').addEventListener('input', e => {
  document.getElementById('rack-color').value = e.target.value;
});
document.getElementById('rack-color').addEventListener('input', e => {
  document.getElementById('rack-color-picker').value = e.target.value;
});

function openAddDeviceModal() {
  editingDeviceId = null;
  document.getElementById('modal-device-title').textContent = 'Nuevo Equipo';
  document.getElementById('modal-device-sub').textContent = 'Registrar un nuevo dispositivo en el inventario';
  ['dev-name','dev-ip','dev-mac','dev-serial','dev-user','dev-pass','dev-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('dev-type').value = 'server';
  document.getElementById('dev-size').value = '2';
  document.getElementById('dev-power').value = '200';
  document.getElementById('modal-device').classList.remove('hidden');
}

let editingCatalogId = null;

function openEditCatalogModal(id) {
  editingCatalogId = id;
  editingDeviceId = null;
  const dev = CATALOG.find(c => c.id === id);
  if (!dev) return;
  document.getElementById('modal-device-title').textContent = 'Editar Plantilla';
  document.getElementById('modal-device-sub').textContent = `Catálogo ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
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
  document.getElementById('modal-device-title').textContent = 'Editar Equipo';
  document.getElementById('modal-device-sub').textContent = `ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-user').value  = dev.user || '';
  document.getElementById('dev-pass').value  = dev.pass || '';
  document.getElementById('dev-notes').value = dev.notes|| '';
  document.getElementById('modal-device').classList.remove('hidden');
}

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
    user:   document.getElementById('dev-user').value.trim(),
    pass:   document.getElementById('dev-pass').value,
    notes:  document.getElementById('dev-notes').value.trim()
  };

  if (editingCatalogId) {
    const item = CATALOG.find(c => c.id === editingCatalogId);
    if (item) {
      Object.assign(item, props);
      item.power = parseInt(props.power) || 0;
      item.size = parseInt(props.size) || 1;
      item.icon = TYPE_COLORS[item.type] ? {server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾'}[item.type] : '●';
      item.color = TYPE_COLORS[item.type] || '#888';
      renderCatalog();
      notify('Plantilla de catálogo actualizada', 'success');
    }
  } else if (editingDeviceId) {
    store.updateDevice(editingDeviceId, props);
    notify('Equipo actualizado', 'success');
    renderPhysical();
    renderBottomPanel();
  } else {
    // Agregar sin rack (aparece en catálogo virtual)
    const rack = store.currentRacks[0];
    if (!rack) { notify('Primero crea un gabinete', 'error'); return; }
    notify('Arrastra el equipo desde el catálogo al rack', 'info');
  }
  document.getElementById('modal-device').classList.add('hidden');
});

document.getElementById('modal-device-cancel').addEventListener('click', () => {
  document.getElementById('modal-device').classList.add('hidden');
});

// Room modal
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

// Cable modal
function openCableModal(defaultSrcId = null) {
  const devices = store._raw.devices;
  const opts = devices.map(d => `<option value="${d.id}">${d.name} (${d.type})</option>`).join('');
  document.getElementById('cable-src-dev').innerHTML = opts;
  document.getElementById('cable-dst-dev').innerHTML = opts;
  if (defaultSrcId) document.getElementById('cable-src-dev').value = defaultSrcId;
  document.getElementById('cable-src-port').value = 'Eth0/1';
  document.getElementById('cable-dst-port').value = 'Eth0/2';
  document.getElementById('cable-color').value = '#3b82f6';
  document.getElementById('cable-color-picker').value = '#3b82f6';
  document.getElementById('modal-cable').classList.remove('hidden');
}

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
  store.addConnection({ sourceDeviceId: srcId, sourcePort: srcPort, targetDeviceId: dstId, targetPort: dstPort, cableType: type, color });
  document.getElementById('modal-cable').classList.add('hidden');
  notify('Cable conectado', 'success');
});
document.getElementById('modal-cable-cancel').addEventListener('click', () => {
  document.getElementById('modal-cable').classList.add('hidden');
});

/* ============================================================
   EXPORT / IMPORT
============================================================ */
document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
document.getElementById('btn-export-json').addEventListener('click', exportJSON);
document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('file-import').click());
document.getElementById('file-import').addEventListener('change', importJSON);
document.getElementById('btn-export-png').addEventListener('click', openPNGModal);

function exportCSV() {
  const header = 'Rack,Unidad U,Nombre,Tipo,IP,MAC,Serie,Usuario,Consumo(W)\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    return [rack?.name||'', d.slotStart, d.name, d.type, d.ip, d.mac, d.serial, d.user, d.power].join(',');
  }).join('\n');
  downloadBlob(header + rows, 'Inventario_Centro_Datos.csv', 'text/csv');
  notify('CSV exportado', 'success');
}

function exportJSON() {
  const json = JSON.stringify(store._raw, null, 2);
  downloadBlob(json, 'Rack_Designer_Backup.json', 'application/json');
  notify('Proyecto exportado como JSON', 'success');
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
      renderAll();
      notify('Proyecto cargado exitosamente', 'success');
    } catch(err) {
      notify('Archivo inválido: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function openPNGModal() {
  const list = document.getElementById('png-rack-list');
  const racks = store.currentRacks;
  list.innerHTML = racks.map(r => `
    <button class="btn-secondary" style="width:100%;margin-bottom:8px;justify-content:flex-start" data-export-rack="${r.id}">
      📸 Exportar: ${r.name} (${r.height}U)
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

document.getElementById('modal-png-cancel').addEventListener('click', () => {
  document.getElementById('modal-export-png').classList.add('hidden');
});

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

  // Background
  oc.fillStyle = '#090d17';
  oc.fillRect(0, 0, W, H);
  oc.strokeStyle = rack.color;
  oc.lineWidth = 2;
  oc.strokeRect(1, 1, W-2, H-2);

  // Title
  oc.fillStyle = rack.color;
  oc.font = 'bold 12px sans-serif';
  oc.fillText(rack.name, 10, 18);
  oc.fillStyle = '#4a5a78';
  oc.font = '9px monospace';
  oc.fillText(`${rack.height}U · ${devices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

  // Rails
  oc.fillStyle = '#1a2035';
  oc.fillRect(0, 40, 18, rack.height * UNIT);
  oc.fillRect(W-18, 40, 18, rack.height * UNIT);

  // Unit numbers
  for (let u = 1; u <= rack.height; u++) {
    const y = 40 + (u-1) * UNIT;
    oc.fillStyle = u % 5 === 0 ? '#3d5480' : '#1e2d44';
    oc.font = '7px monospace';
    oc.textAlign = 'center';
    oc.fillText(u, 9, y + UNIT/2 + 3);
    oc.fillText(u, W-9, y + UNIT/2 + 3);
    // Grid line
    oc.strokeStyle = '#0d1220';
    oc.lineWidth = 0.5;
    oc.beginPath(); oc.moveTo(18, y); oc.lineTo(W-18, y); oc.stroke();
  }

  // Devices
  const deviceMap = {};
  devices.forEach(d => { for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d; });

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

    // Device info
    oc.fillStyle = col;
    oc.font = `bold ${Math.min(10, h-4)}px sans-serif`;
    oc.textAlign = 'left';
    oc.fillText(dev.name.slice(0,22), 24, y + h/2 - 2);
    if (h > 24) {
      oc.fillStyle = '#8b9ab8';
      oc.font = '8px monospace';
      oc.fillText(dev.ip || 'NO IP', 24, y + h/2 + 10);
    }
    // Power LED
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
  store._save(); renderAll();
  notify('Sala eliminada', 'warn');
}

/* ============================================================
   ZOOM CONTROLS
============================================================ */
function updateZoomLabel() {
  const z = store._raw.zoom || 1;
  const px = store._raw.panX || 0;
  const py = store._raw.panY || 0;
  document.getElementById('zoom-label').textContent = Math.round(z * 100) + '%';
  const vp = document.getElementById('view-physical');
  vp.style.transform = `scale(${z}) translate(${px}px, ${py}px)`;
  vp.style.transformOrigin = 'top left';
}
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  store._raw.zoom = Math.min(3, (store._raw.zoom||1) * 1.2);
  updateZoomLabel();
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  store._raw.zoom = Math.max(0.2, (store._raw.zoom||1) / 1.2);
  updateZoomLabel();
});
document.getElementById('btn-zoom-reset').addEventListener('click', () => {
  store._raw.zoom = 1; store._raw.panX = 0; store._raw.panY = 0;
  updateZoomLabel();
});

// Panning for physical view
let physPanStart = null;
const viewPhysical = document.getElementById('view-physical');
viewPhysical.addEventListener('mousedown', e => {
  if (e.target.closest('.device-faceplate') || e.target.closest('.rack')) return;
  physPanStart = { x: e.clientX, y: e.clientY };
  panOrig = { x: store._raw.panX || 0, y: store._raw.panY || 0 };
});
window.addEventListener('mousemove', e => {
  if (physPanStart && currentView === 'physical') {
    const z = store._raw.zoom || 1;
    store._raw.panX = panOrig.x + (e.clientX - physPanStart.x) / z;
    store._raw.panY = panOrig.y + (e.clientY - physPanStart.y) / z;
    updateZoomLabel();
  }
});
window.addEventListener('mouseup', () => { physPanStart = null; });

/* ============================================================
   VIEW SWITCHING
============================================================ */
let currentView = 'physical';
document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentView = tab.dataset.view;
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

/* ============================================================
   BOTTOM PANEL
============================================================ */
document.querySelectorAll('.tab-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeTab = pill.dataset.tab;
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

/* ============================================================
   GLOBAL SEARCH
============================================================ */
document.getElementById('global-search').addEventListener('input', () => {
  renderPhysical();
});

/* ============================================================
   CATALOG FILTER
============================================================ */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCatalog();
  });
});
document.getElementById('catalog-search').addEventListener('input', renderCatalog);

/* ============================================================
   HEADER BUTTON BINDINGS
============================================================ */
document.getElementById('btn-add-rack').addEventListener('click', openAddRackModal);
document.getElementById('btn-add-device-modal').addEventListener('click', openAddDeviceModal);
document.getElementById('table-btn-add-device').addEventListener('click', openAddDeviceModal);
document.getElementById('table-btn-add-conn').addEventListener('click', () => openCableModal());
document.getElementById('btn-undo').addEventListener('click', () => store.undo());
document.getElementById('btn-redo').addEventListener('click', () => store.redo());

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
document.getElementById('table-search').addEventListener('input', renderBottomPanel);

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); store.redo(); }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    document.getElementById('ctx-menu').classList.add('hidden');
  }
});

/* ============================================================
   RESIZE OBSERVER
============================================================ */
const resizeObs = new ResizeObserver(() => {
  if (currentView === 'topology') { resizeCanvas(); }
});
resizeObs.observe(document.getElementById('main'));

/* ============================================================
   RENDER ALL — punto central de re-renderizado
============================================================ */
function renderAll() {
  renderRoomTabs();
  renderStats();
  renderCatalog();
  renderPhysical();
  renderBottomPanel();
  updateZoomLabel();
  // Si la topología está activa, actualizar posiciones
  if (currentView === 'topology') {
    initTopoPositions();
  }
}

/* ============================================================
   INIT
============================================================ */
(function init() {
  // Asegurar que canvas de topología empiece oculto
  document.getElementById('topology-canvas').style.display = 'none';
  renderAll();
  notify('⚡ RACK Designer iniciado', 'success', 2500);
  // Update history buttons state
  store._updateHistoryButtons();
})();