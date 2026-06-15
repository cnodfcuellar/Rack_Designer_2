
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
  addDeviceToRack(deviceTemplate, rackId, slotStart, mountSide = 'front') {
    const rack = this.rackById(rackId);
    if (!rack) return false;
    const size = parseInt(deviceTemplate.size);
    // Validación de límites
    if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
    // Validación de colisiones
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
