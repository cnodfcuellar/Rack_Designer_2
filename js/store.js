
const DEFAULT_VLANS = [
  { id: 1, name: 'Default / Troncal', color: '#64748b' },
  { id: 10, name: 'Gestión / Mgmt', color: '#0ea5e9' },
  { id: 20, name: 'Datos Corporativos', color: '#10b981' },
  { id: 30, name: 'VoIP / Telefonía', color: '#8b5cf6' },
  { id: 40, name: 'CCTV / Seguridad', color: '#f43f5e' },
  { id: 50, name: 'Storage / SAN', color: '#06b6d4' },
  { id: 99, name: 'DMZ / Borde', color: '#f59e0b' }
];

class Store {
  constructor() {
    this._undoStack = [];
    this._redoStack = [];
    this._maxHistory = 15; // M-03: Límite óptimo de 15 pasos de historial para balancear memoria y capacidad de deshacer
    this._mutatedSinceLastSnapshot = true;
    this._listeners = {};
    this._proxyCache = new WeakMap();
    this._raw = this._load();
  }

  get state() {
    return this._makeProxy(this._raw);
  }

  set state(val) {
    this._raw = val;
    this._mutatedSinceLastSnapshot = true;
  }

  _defaultState() {
    const roomId = uid();
    return {
      rooms: [{ id: roomId, name: 'Sala Principal' }],
      racks: [],
      devices: [],
      connections: [],
      customCatalog: [],
      vlans: JSON.parse(JSON.stringify(DEFAULT_VLANS)),
      currentRoomId: roomId,
      selectedDeviceId: null,
      topology: { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} },
      topologySlots: [null, null, null, null, null],
      activeTopologySlot: null,
      topoZoom: 1, topoPanX: 0, topoPanY: 0,
      physZoom: 1, physPanX: 0, physPanY: 0
    };
  }

  _sanitize() {
    if (!this._raw.devices) this._raw.devices = [];
    if (!this._raw.connections) this._raw.connections = [];
    if (!this._raw.rooms) this._raw.rooms = [];
    if (!this._raw.racks) this._raw.racks = [];
    if (!this._raw.customCatalog) this._raw.customCatalog = [];
    if (!this._raw.vlans || !Array.isArray(this._raw.vlans) || this._raw.vlans.length === 0) {
      this._raw.vlans = JSON.parse(JSON.stringify(DEFAULT_VLANS));
    }
    
    // M-40: Garantizar estructura de 5 ranuras de memoria de topología
    if (!Array.isArray(this._raw.topologySlots) || this._raw.topologySlots.length !== 5) {
      const existing = Array.isArray(this._raw.topologySlots) ? this._raw.topologySlots : [];
      this._raw.topologySlots = [0, 1, 2, 3, 4].map(i => existing[i] || null);
    }
    if (this._raw.activeTopologySlot === undefined) {
      this._raw.activeTopologySlot = null;
    }

    const validDeviceIds = new Set(this._raw.devices.map(d => d.id));
    
    // Purgar conexiones huérfanas
    this._raw.connections = this._raw.connections.filter(c => 
      validDeviceIds.has(c.sourceDeviceId) && validDeviceIds.has(c.targetDeviceId)
    );
    
    // Purgar posiciones de topología huérfanas
    if (this._raw.topology && this._raw.topology.nodePositions) {
      for (const id in this._raw.topology.nodePositions) {
        if (!validDeviceIds.has(id)) {
          delete this._raw.topology.nodePositions[id];
        }
      }
    }
  }

  _load() {
    // 1. Intentar cargar desde el slot primario
    try {
      const saved = localStorage.getItem('RACK_DESIGNER_NEXT_STATE');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (typeof RackCrypto !== 'undefined' && typeof RackCrypto.restoreStateFromStorage === 'function') {
          parsed = RackCrypto.restoreStateFromStorage(parsed);
        }
        this._raw = parsed;
        this._sanitize();
        this.state = this._makeProxy(this._raw);
        return this._raw;
      }
    } catch(e) {
      console.warn('[Store] Error parseando slot principal de estado. Intentando slot de respaldo...', e);
    }

    // 2. M-05: Fallback al slot de respaldo redundante
    try {
      const backup = localStorage.getItem('RACK_DESIGNER_NEXT_STATE_BACKUP');
      if (backup) {
        let parsedBackup = JSON.parse(backup);
        if (typeof RackCrypto !== 'undefined' && typeof RackCrypto.restoreStateFromStorage === 'function') {
          parsedBackup = RackCrypto.restoreStateFromStorage(parsedBackup);
        }
        this._raw = parsedBackup;
        this._sanitize();
        this.state = this._makeProxy(this._raw);
        if (typeof notify === 'function') {
          try { notify('Se recuperó el diseño desde el respaldo de seguridad automático.', 'warning', 6000); } catch (_) {}
        }
        return this._raw;
      }
    } catch(backupErr) {
      console.error('[Store] Error parseando slot de respaldo:', backupErr);
    }

    const def = this._defaultState();
    this._raw = def;
    this.state = this._makeProxy(this._raw);
    return def;
  }

  _save() {
    this._mutatedSinceLastSnapshot = true;
    try {
      // M-01: Cifrado en reposo para credenciales y contraseñas sensibles
      const stateToPersist = (typeof RackCrypto !== 'undefined' && typeof RackCrypto.prepareStateForStorage === 'function')
        ? RackCrypto.prepareStateForStorage(this._raw)
        : this._raw;
      const serialized = JSON.stringify(stateToPersist);
      localStorage.setItem('RACK_DESIGNER_NEXT_STATE', serialized);
      // M-05: Doble slot de respaldo para prevenir pérdida por cierres abruptos
      localStorage.setItem('RACK_DESIGNER_NEXT_STATE_BACKUP', serialized);
    } catch(e) {
      // M-02: Detección y manejo defensivo de QuotaExceededError
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.number === -2147024882)) {
        console.error('[Store] Almacenamiento local lleno (QuotaExceededError).', e);
        if (typeof notify === 'function') {
          try { notify('⚠️ Almacenamiento del navegador lleno (5MB). Descarga tu diseño en .rack para no perder cambios.', 'error', 8000); } catch (_) {}
        }
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
          try {
            window.dispatchEvent(new CustomEvent('rack-storage-quota-exceeded', { detail: { error: e } }));
          } catch (_) {}
        }
      } else {
        console.error('[Store] Error al guardar estado en localStorage:', e);
      }
    }
  }

  _saveDebounced() {
    if (this._saveTimer) cancelAnimationFrame(this._saveTimer);
    this._saveTimer = requestAnimationFrame(() => {
      this._saveTimer = null;
      this._save();
    });
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

  get maxHistory() {
    return this._maxHistory;
  }

  set maxHistory(val) {
    const num = parseInt(val, 10);
    this._maxHistory = (!isNaN(num) && num > 0) ? num : 15;
    while (this._undoStack.length > this._maxHistory) this._undoStack.shift();
    while (this._redoStack.length > this._maxHistory) this._redoStack.shift();
    this._updateHistoryButtons();
  }

  get historySize() {
    return {
      undo: this._undoStack.length,
      redo: this._redoStack.length,
      max: this._maxHistory
    };
  }

  clearHistory() {
    this._undoStack = [];
    this._redoStack = [];
    this._mutatedSinceLastSnapshot = true;
    this._updateHistoryButtons();
  }

  estimateHistoryMemory() {
    try {
      let totalBytes = 0;
      for (const item of this._undoStack) {
        totalBytes += JSON.stringify(item).length * 2;
      }
      for (const item of this._redoStack) {
        totalBytes += JSON.stringify(item).length * 2;
      }
      return {
        bytes: totalBytes,
        kb: +(totalBytes / 1024).toFixed(2),
        mb: +(totalBytes / (1024 * 1024)).toFixed(3)
      };
    } catch (_) {
      return { bytes: 0, kb: 0, mb: 0 };
    }
  }

  _createSnapshot() {
    // M-03: Snapshot liviano excluyendo slots persistentes de topología que no participan en el undo
    const snap = {};
    for (const k of Object.keys(this._raw)) {
      if (k === 'topologySlots' || k === 'activeTopologySlot') continue;
      snap[k] = this._raw[k];
    }
    return deepClone(snap);
  }

  /** Guarda snapshot para Deshacer (M-03: optimizado con fastClone, límite N=15 y prevención de duplicados) */
  snapshot() {
    if (!this._mutatedSinceLastSnapshot && this._undoStack.length > 0) {
      return;
    }
    this._undoStack.push(this._createSnapshot());
    while (this._undoStack.length > this._maxHistory) {
      this._undoStack.shift();
    }
    this._redoStack = [];
    this._mutatedSinceLastSnapshot = false;
    this._updateHistoryButtons();
  }

  undo() {
    if (!this._undoStack.length) return;
    this._redoStack.push(this._createSnapshot());
    while (this._redoStack.length > this._maxHistory) {
      this._redoStack.shift();
    }
    const prev = this._undoStack.pop();

    // Preservar slots de topología persistentes configurados por el usuario
    const currentSlots = deepClone(this._raw.topologySlots || [null, null, null, null, null]);
    const currentActiveSlot = this._raw.activeTopologySlot !== undefined ? this._raw.activeTopologySlot : null;

    // Limpieza atómica de claves para evitar huérfanos
    Object.keys(this._raw).forEach(k => {
      if (!(k in prev) && k !== 'topologySlots' && k !== 'activeTopologySlot') delete this._raw[k];
    });
    Object.assign(this._raw, prev);

    if (Array.isArray(currentSlots) && currentSlots.length === 5) {
      this._raw.topologySlots = currentSlots;
      this._raw.activeTopologySlot = currentActiveSlot;
    }

    this._mutatedSinceLastSnapshot = true;
    this._save();
    this._emit('change', { path: 'undo', source: 'undo' });
    this._updateHistoryButtons();
  }

  redo() {
    if (!this._redoStack.length) return;
    this._undoStack.push(this._createSnapshot());
    while (this._undoStack.length > this._maxHistory) {
      this._undoStack.shift();
    }
    const next = this._redoStack.pop();

    // Preservar slots de topología persistentes configurados por el usuario
    const currentSlots = deepClone(this._raw.topologySlots || [null, null, null, null, null]);
    const currentActiveSlot = this._raw.activeTopologySlot !== undefined ? this._raw.activeTopologySlot : null;

    // Limpieza atómica de claves para evitar huérfanos
    Object.keys(this._raw).forEach(k => {
      if (!(k in next) && k !== 'topologySlots' && k !== 'activeTopologySlot') delete this._raw[k];
    });
    Object.assign(this._raw, next);

    if (Array.isArray(currentSlots) && currentSlots.length === 5) {
      this._raw.topologySlots = currentSlots;
      this._raw.activeTopologySlot = currentActiveSlot;
    }

    this._mutatedSinceLastSnapshot = true;
    this._save();
    this._emit('change', { path: 'redo', source: 'redo' });
    this._updateHistoryButtons();
  }

  _updateHistoryButtons() {
    if (typeof document === 'undefined') return;
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

  /* ---- Helpers de datos ---- */
  get currentRoom()  { return this._raw.rooms.find(r => r.id === this._raw.currentRoomId); }
  get currentRacks() { return this._raw.racks.filter(r => r.roomId === this._raw.currentRoomId); }
  allRacksInRoom(roomId) { return (this._raw.racks || []).filter(r => r.roomId === roomId); }
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

  addCustomCatalogItem(item) {
    this.snapshot();
    if (!this._raw.customCatalog) this._raw.customCatalog = [];
    const newItem = Object.assign({}, item, { isCustom: true });
    this._raw.customCatalog.push(newItem);
    this._save();
    this._emit('change', { source: 'addCustomCatalogItem' });
    return newItem;
  }

  deleteCustomCatalogItem(id) {
    this.snapshot();
    if (!this._raw.customCatalog) this._raw.customCatalog = [];
    this._raw.customCatalog = this._raw.customCatalog.filter(c => c.id !== id);
    this._save();
    this._emit('change', { source: 'deleteCustomCatalogItem' });
  }

  addRoom(name) {
    this.snapshot();
    const id = uid();
    this._raw.rooms.push({ id, name });
    this._raw.currentRoomId = id;
    this._save(); 
    this._emit('change', { source: 'addRoom' });
  }

  updateRoom(id, props) {
    this.snapshot();
    const room = this._raw.rooms.find(r => r.id === id);
    if (room) Object.assign(room, props);
    this._save();
    this._emit('change', { source: 'room-rename' });
  }

  setCurrentRoom(id) {
    this._raw.currentRoomId = id;
    this._save();
    this._emit('change', { source: 'changeRoom' });
  }

  setZoom(view, value) {
    const pfx = view === 'physical' ? 'phys' : 'topo';
    this._raw[pfx + 'Zoom'] = value;
    this._saveDebounced();
    this._emit('change', { source: 'setZoom' });
  }

  setPan(view, x, y) {
    const pfx = view === 'physical' ? 'phys' : 'topo';
    this._raw[pfx + 'PanX'] = x;
    this._raw[pfx + 'PanY'] = y;
    this._saveDebounced();
    this._emit('change', { source: 'setPan' });
  }

  deleteRoom(id) {
    if (this._raw.rooms.length <= 1) return false;
    this.snapshot();
    
    const racks = this._raw.racks.filter(r => r.roomId === id);
    const rackIds = racks.map(r => r.id);
    const devicesToDelete = this._raw.devices.filter(d => 
      rackIds.includes(d.rackId) || (d.category === 'floor' && d.roomId === id)
    );
    const deviceIdsToDelete = new Set(devicesToDelete.map(d => d.id));
    
    this._raw.connections = this._raw.connections.filter(c => 
      !deviceIdsToDelete.has(c.sourceDeviceId) && !deviceIdsToDelete.has(c.targetDeviceId)
    );
    this._raw.devices = this._raw.devices.filter(d => !deviceIdsToDelete.has(d.id));
    this._raw.racks = this._raw.racks.filter(r => r.roomId !== id);
    this._raw.rooms = this._raw.rooms.filter(r => r.id !== id);
    this._raw.currentRoomId = this._raw.rooms[0]?.id;

    this._cleanTopologyPositions({ roomIds: [id], rackIds, deviceIds: [...deviceIdsToDelete] });
    
    this._save();
    this._emit('change', { source: 'deleteRoom' });
    return true;
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
    this._emit('change', { source: 'updateRack', rackId: id, props });
  }

  deleteRack(id) {
    this.snapshot();
    const deviceIds = this._raw.devices.filter(d => d.rackId === id).map(d => d.id);
    const deviceIdSet = new Set(deviceIds);

    // Cascada: eliminar cables vinculados a los equipos de este rack
    this._raw.connections = this._raw.connections.filter(c => 
      !deviceIdSet.has(c.sourceDeviceId) && !deviceIdSet.has(c.targetDeviceId)
    );
    this._raw.devices = this._raw.devices.filter(d => d.rackId !== id);
    this._raw.racks = this._raw.racks.filter(r => r.id !== id);

    this._cleanTopologyPositions({ rackIds: [id], deviceIds });
    
    this._save(); 
    this._emit('change', { source: 'deleteRack', rackId: id });
  }

  /** Comprueba si dos caras de montaje entran en conflicto físico */
  sidesConflict(side1, side2) {
    const s1 = side1 || 'front';
    const s2 = side2 || 'front';
    if (s1 === 'both' || s2 === 'both') return true;
    return s1 === s2;
  }

  /** Agrega un equipo al rack en la posición dada */
  addDeviceToRack(deviceTemplate, rackId, slotStart, mountSide) {
    const rack = this.rackById(rackId);
    if (!rack) return false;
    const size = parseInt(deviceTemplate.size);
    // Validación de límites
    if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
    // Lado objetivo: si la plantilla indica 'both', se preserva 'both' por defecto
    const targetSide = mountSide || deviceTemplate.mountSide || 'front';
    // Validación de colisiones con verificación bidireccional de caras
    const existing = this.allDevicesInRack(rackId).filter(d => this.sidesConflict(d.mountSide, targetSide));
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = slotStart + size - 1;
      if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
    }
    this.snapshot();
    const newDev = {
      id: deviceTemplate.id || uid(), rackId, name: deviceTemplate.name, type: deviceTemplate.type,
      slotStart, size, mountSide: targetSide, ip: deviceTemplate.ip || '', mac: deviceTemplate.mac || '',
      serial: deviceTemplate.serial || '', power: deviceTemplate.power || 0,
      user: deviceTemplate.user || 'admin', pass: deviceTemplate.pass || '',
      notes: deviceTemplate.notes || ''
    };
    if (deviceTemplate.skin) newDev.skin = deviceTemplate.skin;
    if (deviceTemplate.plugs !== undefined) newDev.plugs = deviceTemplate.plugs;
    if (deviceTemplate.plugsOut !== undefined) newDev.plugsOut = deviceTemplate.plugsOut;
    this._raw.devices.push(newDev);
    this._save(); 
    this._emit('change', { source: 'addDeviceToRack', rackId, device: newDev });
    return true;
  }

  moveDevice(deviceId, newRackId, newSlot, newMountSide) {
    const dev = this.deviceById(deviceId);
    if (!dev) return false;
    const rack = this.rackById(newRackId);
    if (!rack) return false;
    const size = dev.size;
    const side = newMountSide !== undefined ? newMountSide : (dev.mountSide || 'front');
    if (newSlot < 1 || newSlot + size - 1 > rack.height) return false;
    const existing = this.allDevicesInRack(newRackId).filter(d => d.id !== deviceId && this.sidesConflict(d.mountSide, side));
    for (const d of existing) {
      const dEnd = d.slotStart + d.size - 1;
      const nEnd = newSlot + size - 1;
      if (!(nEnd < d.slotStart || newSlot > dEnd)) return false;
    }
    const oldRackId = dev.rackId;
    this.snapshot();
    dev.rackId = newRackId;
    dev.slotStart = newSlot;
    dev.mountSide = side;
    this._save(); 
    this._emit('change', { source: 'moveDevice', deviceId, rackId: newRackId, oldRackId });
    return true;
  }

  deleteDevice(id) {
    const devToDelete = this.deviceById(id);
    const rackId = devToDelete ? devToDelete.rackId : null;
    this.snapshot();
    this._raw.devices = this._raw.devices.filter(d => d.id !== id);
    this._raw.connections = this._raw.connections.filter(c => c.sourceDeviceId !== id && c.targetDeviceId !== id);
    this._cleanTopologyPositions({ deviceIds: [id] });
    this._save(); 
    this._emit('change', { source: 'deleteDevice', deviceId: id, rackId });
  }

  updateDevice(id, props) {
    this.snapshot();
    const d = this._raw.devices.find(d => d.id === id);
    if (d) Object.assign(d, props);
    this._save(); 
    this._emit('change', { source: 'updateDevice', deviceId: id, rackId: d ? d.rackId : null, device: d, props });
  }

  /* ---- Métodos de VLANs ---- */
  getVlans() {
    return this._raw.vlans || [];
  }

  getVlanById(id) {
    return (this._raw.vlans || []).find(v => Number(v.id) === Number(id)) || null;
  }

  addVlan({ id, name, color }) {
    this.snapshot();
    if (!this._raw.vlans) this._raw.vlans = [];
    const vId = Number(id);
    if (!vId || isNaN(vId)) return { success: false, error: 'ID de VLAN inválido' };
    if (this.getVlanById(vId)) return { success: false, error: `La VLAN ${vId} ya existe.` };
    const newVlan = { id: vId, name: (name || `VLAN ${vId}`).trim(), color: color || '#64748b' };
    this._raw.vlans.push(newVlan);
    this._save();
    this._emit('change', { source: 'addVlan', vlan: newVlan });
    return { success: true, vlan: newVlan };
  }

  updateVlan(id, props) {
    this.snapshot();
    const vlan = this.getVlanById(id);
    if (!vlan) return { success: false, error: 'VLAN no encontrada' };
    Object.assign(vlan, props);
    this._save();
    this._emit('change', { source: 'updateVlan', vlan });
    return { success: true, vlan };
  }

  deleteVlan(id) {
    const vId = Number(id);
    if (vId === 1) return { success: false, error: 'No se puede eliminar la VLAN 1 (Default).' };
    this.snapshot();
    this._raw.vlans = (this._raw.vlans || []).filter(v => Number(v.id) !== vId);
    this._save();
    this._emit('change', { source: 'deleteVlan', id: vId });
    return { success: true };
  }

  /* ---- Motor de Consulta de Puertos y Validación ---- */
  getDevicePorts(deviceId) {
    const dev = this.deviceById(deviceId);
    if (!dev) return [];

    const portsMap = new Map();
    const conns = (this._raw.connections || []).filter(c => c.sourceDeviceId === deviceId || c.targetDeviceId === deviceId);
    const portConfigs = dev.portConfigs || {};

    let ethCount = 0;
    let fibCount = 0;
    if (dev.ports) {
      ethCount = parseInt(dev.ports.ethernet) || 0;
      fibCount = parseInt(dev.ports.fiber) || 0;
    } else {
      const t = String(dev.type).toLowerCase();
      if (t === 'switch') { ethCount = 24; fibCount = 4; }
      else if (t === 'router' || t === 'firewall') { ethCount = 8; fibCount = 2; }
      else if (t === 'patchpanel') { ethCount = 24; fibCount = 0; }
      else if (t === 'odf') { ethCount = 0; fibCount = 24; }
      else if (t === 'server') { ethCount = 4; fibCount = 2; }
      else if (t === 'storage' || t === 'san') { ethCount = 4; fibCount = 8; }
      else if (t === 'ups' || t === 'pdu') { ethCount = 1; fibCount = 0; }
      else if (['pc', 'camera', 'ap', 'door', 'printer', 'phone'].includes(t)) { ethCount = 1; fibCount = 0; }
      else { ethCount = 2; fibCount = 0; }
    }

    for (let i = 1; i <= ethCount; i++) {
      const pName = `Eth-${i}`;
      portsMap.set(pName.toLowerCase(), {
        id: pName,
        name: pName,
        label: `Eth ${i}`,
        type: 'ethernet',
        isOccupied: false,
        connection: null,
        connectionId: null,
        peerDeviceId: null,
        peerDeviceName: null,
        peerPort: null,
        cableType: null,
        cableColor: null,
        vlanId: 1,
        vlanName: 'Default / Troncal',
        vlanColor: '#64748b',
        alias: '',
        mode: 'access'
      });
    }

    for (let i = 1; i <= fibCount; i++) {
      const pName = `SFP-${i}`;
      portsMap.set(pName.toLowerCase(), {
        id: pName,
        name: pName,
        label: `SFP ${i}`,
        type: 'fiber',
        isOccupied: false,
        connection: null,
        connectionId: null,
        peerDeviceId: null,
        peerDeviceName: null,
        peerPort: null,
        cableType: null,
        cableColor: null,
        vlanId: 1,
        vlanName: 'Default / Troncal',
        vlanColor: '#64748b',
        alias: '',
        mode: 'trunk'
      });
    }

    conns.forEach(c => {
      const isSrc = c.sourceDeviceId === deviceId;
      const portName = isSrc ? c.sourcePort : c.targetPort;
      const peerDevId = isSrc ? c.targetDeviceId : c.sourceDeviceId;
      const peerPort = isSrc ? c.targetPort : c.sourcePort;
      const peerDev = this.deviceById(peerDevId);
      const key = String(portName).trim().toLowerCase();

      let portObj = portsMap.get(key);
      if (!portObj) {
        const isFiber = /sfp|fibra|fc|te|opt/i.test(portName);
        portObj = {
          id: portName,
          name: portName,
          label: portName,
          type: isFiber ? 'fiber' : 'ethernet',
          isOccupied: false,
          alias: '',
          mode: isFiber ? 'trunk' : 'access'
        };
        portsMap.set(key, portObj);
      }

      const vId = c.vlanId !== undefined ? Number(c.vlanId) : 1;
      const vObj = this.getVlanById(vId);

      portObj.isOccupied = true;
      portObj.connection = c;
      portObj.connectionId = c.id;
      portObj.peerDeviceId = peerDevId;
      portObj.peerDeviceName = peerDev ? peerDev.name : 'Desconocido';
      portObj.peerPort = peerPort;
      portObj.cableType = c.cableType || 'Cobre';
      portObj.cableColor = c.color || '#3b82f6';
      portObj.vlanId = vId;
      portObj.vlanName = c.vlanName || (vObj ? vObj.name : `VLAN ${vId}`);
      portObj.vlanColor = vObj ? vObj.color : '#64748b';
    });

    for (const [key, pObj] of portsMap.entries()) {
      if (portConfigs[pObj.name]) {
        const cfg = portConfigs[pObj.name];
        if (cfg.alias) pObj.alias = cfg.alias;
        if (cfg.mode) pObj.mode = cfg.mode;
        if (cfg.vlanId !== undefined && !pObj.isOccupied) {
          pObj.vlanId = Number(cfg.vlanId);
          const vObj = this.getVlanById(pObj.vlanId);
          pObj.vlanName = cfg.vlanName || (vObj ? vObj.name : `VLAN ${pObj.vlanId}`);
          pObj.vlanColor = vObj ? vObj.color : '#64748b';
        }
      }
    }

    return Array.from(portsMap.values());
  }

  isPortOccupied(deviceId, portName, excludeConnectionId = null) {
    if (!deviceId || !portName) return false;
    const pName = String(portName).trim().toLowerCase();
    const conn = (this._raw.connections || []).find(c => {
      if (excludeConnectionId && c.id === excludeConnectionId) return false;
      const isSrc = c.sourceDeviceId === deviceId && String(c.sourcePort).trim().toLowerCase() === pName;
      const isDst = c.targetDeviceId === deviceId && String(c.targetPort).trim().toLowerCase() === pName;
      return isSrc || isDst;
    });
    return conn || false;
  }

  validateConnection({ sourceDeviceId, sourcePort, targetDeviceId, targetPort, excludeConnectionId = null }) {
    if (!sourceDeviceId || !targetDeviceId) {
      return { valid: false, error: 'Debes seleccionar el equipo de origen y de destino.' };
    }
    if (!sourcePort || !String(sourcePort).trim() || !targetPort || !String(targetPort).trim()) {
      return { valid: false, error: 'Debes especificar los puertos de origen y destino.' };
    }
    const sPort = String(sourcePort).trim();
    const tPort = String(targetPort).trim();

    if (sourceDeviceId === targetDeviceId && sPort.toLowerCase() === tPort.toLowerCase()) {
      return { valid: false, error: 'No es posible conectar un puerto consigo mismo en el mismo equipo.' };
    }

    const srcOccupied = this.isPortOccupied(sourceDeviceId, sPort, excludeConnectionId);
    if (srcOccupied) {
      const srcDev = this.deviceById(sourceDeviceId);
      const peerDevId = srcOccupied.sourceDeviceId === sourceDeviceId ? srcOccupied.targetDeviceId : srcOccupied.sourceDeviceId;
      const peerDev = this.deviceById(peerDevId);
      return {
        valid: false,
        error: `El puerto "${sPort}" de "${srcDev ? srcDev.name : 'Origen'}" ya está conectado a "${peerDev ? peerDev.name : 'otro equipo'}".`,
        conflict: { deviceId: sourceDeviceId, port: sPort, connection: srcOccupied }
      };
    }

    const dstOccupied = this.isPortOccupied(targetDeviceId, tPort, excludeConnectionId);
    if (dstOccupied) {
      const dstDev = this.deviceById(targetDeviceId);
      const peerDevId = dstOccupied.sourceDeviceId === targetDeviceId ? dstOccupied.targetDeviceId : dstOccupied.sourceDeviceId;
      const peerDev = this.deviceById(peerDevId);
      return {
        valid: false,
        error: `El puerto "${tPort}" de "${dstDev ? dstDev.name : 'Destino'}" ya está conectado a "${peerDev ? peerDev.name : 'otro equipo'}".`,
        conflict: { deviceId: targetDeviceId, port: tPort, connection: dstOccupied }
      };
    }

    return { valid: true };
  }

  setDevicePortConfig(deviceId, portName, config) {
    this.snapshot();
    const dev = this.deviceById(deviceId);
    if (!dev) return false;
    if (!dev.portConfigs) dev.portConfigs = {};
    dev.portConfigs[portName] = Object.assign(dev.portConfigs[portName] || {}, config);
    this._save();
    this._emit('change', { source: 'setDevicePortConfig', deviceId, portName });
    return true;
  }

  addConnection(conn, { force = false } = {}) {
    if (!force) {
      const val = this.validateConnection(conn);
      if (!val.valid) {
        console.warn('[Store] Intento de conexión inválida:', val.error);
        return { success: false, error: val.error, conflict: val.conflict };
      }
    }

    this.snapshot();
    const vId = conn.vlanId !== undefined ? Number(conn.vlanId) : 1;
    const vObj = this.getVlanById(vId);
    const newConn = {
      id: uid(),
      sourceDeviceId: conn.sourceDeviceId,
      sourcePort: String(conn.sourcePort).trim(),
      targetDeviceId: conn.targetDeviceId,
      targetPort: String(conn.targetPort).trim(),
      cableType: conn.cableType || 'Cobre',
      color: conn.color || (vObj ? vObj.color : '#3b82f6'),
      vlanId: vId,
      vlanName: conn.vlanName || (vObj ? vObj.name : `VLAN ${vId}`),
      notes: conn.notes || '',
      orientation: conn.orientation === 'bottom' ? 'bottom' : 'top'
    };
    this._raw.connections.push(newConn);
    this._save(); 
    this._emit('change', { source: 'addConnection', connection: newConn });
    return { success: true, connection: newConn };
  }

  updateConnection(id, props, { force = false } = {}) {
    const c = this._raw.connections.find(conn => conn.id === id);
    if (!c) return { success: false, error: 'Conexión no encontrada' };

    if (!force) {
      const merged = {
        sourceDeviceId: props.sourceDeviceId !== undefined ? props.sourceDeviceId : c.sourceDeviceId,
        sourcePort: props.sourcePort !== undefined ? props.sourcePort : c.sourcePort,
        targetDeviceId: props.targetDeviceId !== undefined ? props.targetDeviceId : c.targetDeviceId,
        targetPort: props.targetPort !== undefined ? props.targetPort : c.targetPort,
        excludeConnectionId: id
      };
      const val = this.validateConnection(merged);
      if (!val.valid) {
        console.warn('[Store] Intento de actualización de conexión inválida:', val.error);
        return { success: false, error: val.error, conflict: val.conflict };
      }
    }

    this.snapshot();
    if (props.vlanId !== undefined) {
      props.vlanId = Number(props.vlanId);
      const vObj = this.getVlanById(props.vlanId);
      if (vObj && !props.vlanName) props.vlanName = vObj.name;
    }
    Object.assign(c, props);
    this._save();
    this._emit('change', { source: 'updateConnection', connection: c });
    return { success: true, connection: c };
  }

  swapConnectionDirection(id) {
    const c = this._raw.connections.find(conn => conn.id === id);
    if (!c) return { success: false, error: 'Conexión no encontrada' };
    return this.updateConnection(id, {
      sourceDeviceId: c.targetDeviceId,
      sourcePort: c.targetPort,
      targetDeviceId: c.sourceDeviceId,
      targetPort: c.sourcePort
    });
  }

  toggleConnectionOrientation(id) {
    const c = this._raw.connections.find(conn => conn.id === id);
    if (!c) return { success: false, error: 'Conexión no encontrada' };
    const newOrientation = c.orientation === 'bottom' ? 'top' : 'bottom';
    return this.updateConnection(id, { orientation: newOrientation });
  }

  deleteConnection(id) {
    this.snapshot();
    this._raw.connections = this._raw.connections.filter(c => c.id !== id);
    this._save(); 
    this._emit('change', { source: 'deleteConnection' });
  }

  _cleanTopologyPositions({ roomIds = [], rackIds = [], deviceIds = [] } = {}) {
    const t = this._raw.topology;
    if (!t) return;
    if (roomIds.length)  { for (const id of roomIds)  { delete t.roomPositions[id]; delete t.roomSizes[id]; } }
    if (rackIds.length)  { for (const id of rackIds)  { delete t.rackPositions[id]; delete t.rackSizes[id]; } }
    if (deviceIds.length) { for (const id of deviceIds) { delete t.nodePositions[id]; } }
  }

  addCustomCatalogItem(item) {
    this.snapshot();
    if (!this._raw.customCatalog) this._raw.customCatalog = [];
    this._raw.customCatalog.push(item);
    this._save();
    this._emit('change', { source: 'addCustomCatalogItem', item });
    return item;
  }

  deleteCustomCatalogItem(id) {
    this.snapshot();
    if (!this._raw.customCatalog) this._raw.customCatalog = [];
    this._raw.customCatalog = this._raw.customCatalog.filter(c => c.id !== id);
    this._save();
    this._emit('change', { source: 'deleteCustomCatalogItem', id });
  }

  saveTopologyState(data) {
    if (!this._raw.topology) this._raw.topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };
    Object.assign(this._raw.topology, data);
    this._save();
    this._emit('change', { source: 'saveTopology' });
  }

  // ──────────────────────────────────────────────────────────────────
  // M-40: Gestión de Ranuras de Memoria de Topología (5 Slots)
  // ──────────────────────────────────────────────────────────────────
  saveTopologySlot(slotIndex, customName) {
    const idx = parseInt(slotIndex, 10);
    if (isNaN(idx) || idx < 0 || idx > 4) return null;

    if (!Array.isArray(this._raw.topologySlots) || this._raw.topologySlots.length !== 5) {
      this._raw.topologySlots = [null, null, null, null, null];
    }

    const currentTopo = this._raw.topology || {};
    const defaultName = `Vista ${idx + 1}`;
    const prevSlot = this._raw.topologySlots[idx];
    const name = (customName && customName.trim()) ? customName.trim() : (prevSlot && prevSlot.name ? prevSlot.name : defaultName);

    const slotData = {
      id: idx + 1,
      name,
      savedAt: new Date().toISOString(),
      nodePositions: JSON.parse(JSON.stringify(currentTopo.nodePositions || {})),
      rackPositions: JSON.parse(JSON.stringify(currentTopo.rackPositions || {})),
      rackSizes: JSON.parse(JSON.stringify(currentTopo.rackSizes || {})),
      roomPositions: JSON.parse(JSON.stringify(currentTopo.roomPositions || {})),
      roomSizes: JSON.parse(JSON.stringify(currentTopo.roomSizes || {})),
      topoZoom: this._raw.topoZoom !== undefined ? this._raw.topoZoom : 1,
      topoPanX: this._raw.topoPanX !== undefined ? this._raw.topoPanX : 0,
      topoPanY: this._raw.topoPanY !== undefined ? this._raw.topoPanY : 0,
      topoSpacing: currentTopo.topoSpacing !== undefined ? currentTopo.topoSpacing : (typeof window !== 'undefined' ? window.TOPO_SPACING || 60 : 60),
      topoSpacingX: currentTopo.topoSpacingX !== undefined ? currentTopo.topoSpacingX : (typeof window !== 'undefined' ? window.TOPO_SPACING_X || 28 : 28),
      bgPattern: currentTopo.bgPattern || (typeof window !== 'undefined' ? window.TOPO_BG_PATTERN || 'dots' : 'dots'),
      inheritColors: currentTopo.inheritColors !== undefined ? currentTopo.inheritColors : (typeof window !== 'undefined' ? window.TOPO_INHERIT_COLORS !== false : true),
      topoAlpha: currentTopo.topoAlpha !== undefined ? currentTopo.topoAlpha : (typeof window !== 'undefined' && window.TOPO_ALPHA !== undefined ? window.TOPO_ALPHA : 0.25),
      style: currentTopo.style || (typeof window !== 'undefined' ? window.TOPOLOGY_STYLE || 'card' : 'card'),
      layoutMode: currentTopo.layoutMode || (typeof window !== 'undefined' ? window.TOPO_LAYOUT_MODE || 'racks' : 'racks'),
      labelPreset: currentTopo.labelPreset || (typeof window !== 'undefined' ? window.TOPO_LABEL_PRESET || 'separated' : 'separated'),
      namePos: currentTopo.namePos || (typeof window !== 'undefined' ? window.TOPO_NAME_POS || 'bottom' : 'bottom'),
      ipPos: currentTopo.ipPos || (typeof window !== 'undefined' ? window.TOPO_IP_POS || 'top' : 'top')
    };

    this._raw.topologySlots[idx] = slotData;
    this._raw.activeTopologySlot = idx;
    this._save();
    this._emit('change', { source: 'saveTopologySlot', slotIndex: idx, slotData });
    return slotData;
  }

  loadTopologySlot(slotIndex) {
    const idx = parseInt(slotIndex, 10);
    if (isNaN(idx) || idx < 0 || idx > 4) return false;
    if (!this._raw.topologySlots || !this._raw.topologySlots[idx]) return false;

    const slotData = this._raw.topologySlots[idx];

    if (!this._raw.topology) {
      this._raw.topology = {};
    }

    this._raw.topology.nodePositions = JSON.parse(JSON.stringify(slotData.nodePositions || {}));
    this._raw.topology.rackPositions = JSON.parse(JSON.stringify(slotData.rackPositions || {}));
    this._raw.topology.rackSizes = JSON.parse(JSON.stringify(slotData.rackSizes || {}));
    this._raw.topology.roomPositions = JSON.parse(JSON.stringify(slotData.roomPositions || {}));
    this._raw.topology.roomSizes = JSON.parse(JSON.stringify(slotData.roomSizes || {}));
    
    if (slotData.topoSpacing !== undefined) this._raw.topology.topoSpacing = slotData.topoSpacing;
    if (slotData.topoSpacingX !== undefined) this._raw.topology.topoSpacingX = slotData.topoSpacingX;
    if (slotData.bgPattern) this._raw.topology.bgPattern = slotData.bgPattern;
    if (slotData.inheritColors !== undefined) this._raw.topology.inheritColors = slotData.inheritColors;
    if (slotData.topoAlpha !== undefined) this._raw.topology.topoAlpha = slotData.topoAlpha;
    if (slotData.style) this._raw.topology.style = slotData.style;
    if (slotData.layoutMode) this._raw.topology.layoutMode = slotData.layoutMode;
    if (slotData.labelPreset) this._raw.topology.labelPreset = slotData.labelPreset;
    if (slotData.namePos) this._raw.topology.namePos = slotData.namePos;
    if (slotData.ipPos) this._raw.topology.ipPos = slotData.ipPos;

    if (slotData.topoZoom !== undefined) this._raw.topoZoom = slotData.topoZoom;
    if (slotData.topoPanX !== undefined) this._raw.topoPanX = slotData.topoPanX;
    if (slotData.topoPanY !== undefined) this._raw.topoPanY = slotData.topoPanY;

    this._raw.activeTopologySlot = idx;
    this._save();
    this._emit('change', { source: 'loadTopologySlot', slotIndex: idx, slotData });
    return true;
  }

  clearTopologySlot(slotIndex) {
    const idx = parseInt(slotIndex, 10);
    if (isNaN(idx) || idx < 0 || idx > 4) return false;

    if (!Array.isArray(this._raw.topologySlots)) {
      this._raw.topologySlots = [null, null, null, null, null];
    }
    this._raw.topologySlots[idx] = null;
    if (this._raw.activeTopologySlot === idx) {
      this._raw.activeTopologySlot = null;
    }
    this._save();
    this._emit('change', { source: 'clearTopologySlot', slotIndex: idx });
    return true;
  }

  renameTopologySlot(slotIndex, newName) {
    const idx = parseInt(slotIndex, 10);
    if (isNaN(idx) || idx < 0 || idx > 4) return false;
    if (!this._raw.topologySlots || !this._raw.topologySlots[idx]) return false;

    const cleanName = (newName && newName.trim()) ? newName.trim() : `Vista ${idx + 1}`;
    this._raw.topologySlots[idx].name = cleanName;
    this._save();
    this._emit('change', { source: 'renameTopologySlot', slotIndex: idx, name: cleanName });
    return true;
  }

  getTopologySlots() {
    if (!Array.isArray(this._raw.topologySlots) || this._raw.topologySlots.length !== 5) {
      const existing = Array.isArray(this._raw.topologySlots) ? this._raw.topologySlots : [];
      this._raw.topologySlots = [0, 1, 2, 3, 4].map(i => existing[i] || null);
    }
    return this._raw.topologySlots;
  }

  loadData(data) {
    this.clearHistory();
    let stateToLoad = data;
    if (typeof RackCrypto !== 'undefined' && typeof RackCrypto.restoreStateFromStorage === 'function') {
      stateToLoad = RackCrypto.restoreStateFromStorage(data);
    }
    Object.keys(this._raw).forEach(k => delete this._raw[k]);
    Object.assign(this._raw, stateToLoad);
    
    if (!this._raw.topology) {
      this._raw.topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };
    }

    this._sanitize();

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
    const allDeviceIds = new Set(allDevices.map(d => d.id));
    const roomConnections = this._raw.connections.filter(c => allDeviceIds.has(c.sourceDeviceId) || allDeviceIds.has(c.targetDeviceId)).length;
    
    return { racks: racks.length, devices: allDevices.length, totalU, usedU, power, connections: roomConnections };
  }

  /** Estadísticas globales del proyecto */
  getGlobalStats() {
    const totalRooms = this._raw.rooms.length;
    const totalRacks = this._raw.racks.length;
    
    // Equipos en rack vs Equipos de piso
    // Los equipos de piso se identifican por estar en FLOOR_TYPES o por tener category === 'floor' 
    // pero de forma más robusta, un equipo de piso no tiene rackId.
    let rackDevicesCount = 0;
    let floorDevicesCount = 0;

    this._raw.devices.forEach(d => {
      if (d.rackId) rackDevicesCount++;
      else floorDevicesCount++;
    });

    const totalConnections = this._raw.connections.length;

    return { totalRooms, totalRacks, rackDevicesCount, floorDevicesCount, totalConnections };
  }
}

const store = new Store();
if (typeof window !== 'undefined') {
  window.store = store;
  window.sidesConflict = store.sidesConflict.bind(store);
}
