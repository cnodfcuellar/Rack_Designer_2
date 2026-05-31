import { store } from '../store.js';
import { notify } from '../utils.js';
import { CATALOG, renderCatalog, TYPE_COLORS } from './catalog.js';

export let editingRackId   = null;
export let editingDeviceId = null;
export let editingCatalogId = null;

export function openAddRackModal() {
  editingRackId = null;
  document.getElementById('modal-rack-title').textContent = 'Nuevo Gabinete';
  document.getElementById('rack-name').value = '';
  document.getElementById('rack-height').value = '24';
  document.getElementById('rack-color').value = '#0ea5e9';
  document.getElementById('rack-color-picker').value = '#0ea5e9';
  document.getElementById('modal-rack').classList.remove('hidden');
}

export function openEditRackModal(id) {
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

export function openAddDeviceModal() {
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
  document.getElementById('dev-power').value = '200';
  document.getElementById('modal-device').classList.remove('hidden');
}

export function openEditCatalogModal(id) {
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

export function openEditDeviceModal(id) {
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

export function openCableModal(defaultSrcId = null) {
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

export function openPNGModal() {
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

export function deleteRoom(id) {
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

export function exportCSV() {
  const header = 'Rack,Unidad U,Nombre,Tipo,IP,MAC,Serie,Usuario,Consumo(W)\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    return [rack?.name||'', d.slotStart, d.name, d.type, d.ip, d.mac, d.serial, d.user, d.power].join(',');
  }).join('\n');
  downloadBlob(header + rows, 'Inventario_Centro_Datos.csv', 'text/csv');
  notify('CSV exportado', 'success');
}

export function exportJSON() {
  const json = JSON.stringify(store._raw, null, 2);
  downloadBlob(json, 'Rack_Designer_Backup.json', 'application/json');
  notify('Proyecto exportado como JSON', 'success');
}

export function importJSON(e) {
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
export function initModals() {
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
    } else {
      const rack = store.currentRacks[0];
      if (!rack) { notify('Primero crea un gabinete', 'error'); return; }
      notify('Arrastra el equipo desde el catálogo al rack', 'info');
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
    store.addConnection({ sourceDeviceId: srcId, sourcePort: srcPort, targetDeviceId: dstId, targetPort: dstPort, cableType: type, color });
    document.getElementById('modal-cable').classList.add('hidden');
    notify('Cable conectado', 'success');
  });
  document.getElementById('modal-cable-cancel').addEventListener('click', () => {
    document.getElementById('modal-cable').classList.add('hidden');
  });

  document.getElementById('modal-png-cancel').addEventListener('click', () => {
    document.getElementById('modal-export-png').classList.add('hidden');
  });

  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('file-import').click());
  document.getElementById('file-import').addEventListener('change', importJSON);
  document.getElementById('btn-export-png').addEventListener('click', openPNGModal);
}
