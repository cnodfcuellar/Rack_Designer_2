
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
  allDevicesInRack(rackId) { return this._raw.devices.filter(d => d.rackId === rackId); }
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

  deleteConnection(id) {
    this.snapshot();
    this._raw.connections = this._raw.connections.filter(c => c.id !== id);
    this._save(); 
    this._emit('change', { source: 'deleteConnection' });
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
