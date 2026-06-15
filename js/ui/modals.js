let editingRackId   = null;
let editingDeviceId = null;
let editingCatalogId = null;
let editingConnectionId = null;
const FLOOR_TYPES = new Set(['pc', 'camera', 'ap', 'door', 'printer', 'phone']);

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

function openAddDeviceModal() {
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingDeviceId = null;
  editingCatalogId = null;
  document.getElementById('modal-device-title').textContent = 'Nuevo Equipo';
  document.getElementById('modal-device-sub').textContent = 'Registrar un nuevo dispositivo en el inventario';
  ['dev-name','dev-brand','dev-model','dev-ip','dev-mac','dev-serial','dev-user','dev-pass','dev-notes'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('dev-power').value = '200';
  document.getElementById('dev-plugs').value = '1';
  document.getElementById('dev-plugs-out').value = '0';
  document.getElementById('dev-category').value = 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  document.getElementById('dev-type').value = 'server';

  document.getElementById('dev-has-net').checked = false;
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = false;
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = true;
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

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
  
  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-brand').value = dev.brand || '';
  document.getElementById('dev-model').value = dev.model || '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-plugs-out').value = dev.plugsOut || 0;
  document.getElementById('dev-user').value  = dev.user || '';
  const passInput = document.getElementById('dev-pass');
  passInput.value = dev.pass || '';
  passInput.type = window.SHOW_PASSWORDS ? 'text' : 'password';
  document.getElementById('dev-notes').value = dev.notes|| '';

  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

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
  
  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));

  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size || 0;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-brand').value = dev.brand || '';
  document.getElementById('dev-model').value = dev.model || '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-plugs-out').value = dev.plugsOut || 0;
  document.getElementById('dev-user').value  = dev.user || 'admin';
  const passInput = document.getElementById('dev-pass');
  passInput.value = dev.pass || '';
  passInput.type = window.SHOW_PASSWORDS ? 'text' : 'password';
  document.getElementById('dev-notes').value = dev.notes|| '';

  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

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
  let html = racks.map(r => `
    <button class="btn-secondary" style="width:100%;margin-bottom:8px;justify-content:flex-start" data-export-rack="${escapeHTML(r.id)}">
      📸 Exportar: ${escapeHTML(r.name)} (${r.height}U)
    </button>
  `).join('');

  const floorDevices = store.allFloorDevicesInRoom(store._raw.currentRoomId);
  if (floorDevices.length > 0) {
    html += `
      <div style="margin-top: 16px; margin-bottom: 8px; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 8px;">OTROS EQUIPOS</div>
      <button class="btn-secondary" id="btn-export-floor" style="width:100%; margin-bottom:8px; justify-content:flex-start; border-color: #f59e0b; color: #f59e0b;">
        📸 Exportar Equipos de Piso (${floorDevices.length})
      </button>
    `;
  }
  
  if (!racks.length && !floorDevices.length) {
    html = `<div style="text-align:center;color:var(--text-muted);padding:20px;">No hay gabinetes ni equipos de piso en esta sala para exportar.</div>`;
  }

  list.innerHTML = html;

  list.querySelectorAll('[data-export-rack]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRackToPNG(btn.dataset.exportRack);
    });
  });

  const btnFloor = document.getElementById('btn-export-floor');
  if (btnFloor) {
    btnFloor.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      if (typeof exportFloorToPNG === 'function') exportFloorToPNG(store._raw.currentRoomId);
    });
  }

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
  const header = 'Rack,Unidad U,Lado,Nombre,Marca,Modelo,Tipo,IP,MAC,Serie,Usuario,Consumo(W),Tomas\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    const side = d.category === 'floor' ? '-' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal');
    return [rack?.name||'', d.slotStart||'-', side, d.name, d.brand||'', d.model||'', d.type, d.ip, d.mac, d.serial, d.user, d.power, d.plugs||1].join(',');
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
  
  const frontDevices = devices.filter(d => d.mountSide !== 'rear');
  const rearDevices  = devices.filter(d => d.mountSide === 'rear');
  const hasRear = rearDevices.length > 0;

  const W = 280, UNIT = 24, GAP = 40;
  const H = rack.height * UNIT + 60;
  const totalW = hasRear ? (W * 2 + GAP) : W;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = totalW * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = '#090d17';
  oc.fillRect(0, 0, totalW, H);

  function drawRack(offsetX, sideDevices, title) {
    oc.save();
    oc.translate(offsetX, 0);

    oc.strokeStyle = rack.color;
    oc.lineWidth = 2;
    oc.strokeRect(1, 1, W-2, H-2);

    if (title) {
      oc.fillStyle = rack.color;
      oc.font = 'bold 12px sans-serif';
      oc.fillText(title, 10, 18);
    }
    oc.fillStyle = '#4a5a78';
    oc.font = '9px monospace';
    oc.fillText(`${rack.height}U · ${sideDevices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

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
      const dev = sideDevices.find(d => d.slotStart === u);
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
    oc.restore();
  }

  drawRack(0, frontDevices, hasRear ? rack.name + ' (Frontal)' : rack.name);
  if (hasRear) {
    drawRack(W + GAP, rearDevices, 'Vista Trasera');
  }

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${rack.name.replace(/\s+/g,'_')}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: ${rack.name}`, 'success');
}

function exportFloorToPNG(roomId) {
  const floorDevices = store.allFloorDevicesInRoom(roomId);
  const room = store._raw.rooms.find(r => r.id === roomId);
  if (!floorDevices.length) return;

  const cols = 2;
  const rowHeight = 70;
  const colWidth = 240;
  const padding = 20;
  
  const rows = Math.ceil(floorDevices.length / cols);
  
  const W = cols * colWidth + padding * 2;
  const H = rows * rowHeight + padding * 2 + 40;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = W * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = '#090d17';
  oc.fillRect(0, 0, W, H);

  oc.fillStyle = '#f59e0b';
  oc.font = 'bold 16px sans-serif';
  oc.fillText(`Equipos de Piso - ${room ? room.name : 'Sala'}`, padding, padding + 15);

  oc.fillStyle = '#4a5a78';
  oc.font = '11px monospace';
  oc.fillText(`${floorDevices.length} dispositivos`, padding, padding + 35);

  const colors = {
    pc:      '#0ea5e9',
    camera:  '#8b5cf6',
    ap:      '#10b981',
    door:    '#f59e0b',
    printer: '#06b6d4',
    phone:   '#ef4444',
  };

  floorDevices.forEach((dev, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = padding + col * colWidth;
    const y = padding + 50 + row * rowHeight;
    
    const color = colors[dev.type] || '#8b9ab8';
    
    oc.fillStyle = '#0c1420';
    oc.fillRect(x, y, colWidth - 15, rowHeight - 15);
    oc.strokeStyle = color;
    oc.lineWidth = 1;
    oc.strokeRect(x, y, colWidth - 15, rowHeight - 15);

    oc.fillStyle = color;
    oc.fillRect(x, y, 6, rowHeight - 15);

    oc.fillStyle = color;
    oc.font = 'bold 12px sans-serif';
    oc.fillText(dev.name.slice(0, 25), x + 16, y + 20);

    oc.fillStyle = '#8b9ab8';
    oc.font = '10px monospace';
    oc.fillText(dev.type.toUpperCase(), x + 16, y + 36);
    
    if (dev.ip) {
      oc.fillText(`IP: ${dev.ip}`, x + 16, y + 48);
    }
  });

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Equipos_Piso_${room ? room.name.replace(/\s+/g,'_') : 'Sala'}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: Equipos de Piso`, 'success');
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

  document.getElementById('dev-category').addEventListener('change', function() {
    const isFloor = this.value === 'floor';
    document.getElementById('opt-rack').style.display = isFloor ? 'none' : '';
    document.getElementById('opt-floor').style.display = isFloor ? '' : 'none';
    document.getElementById('dev-type').value = isFloor ? 'pc' : 'server';
    document.getElementById('dev-type').dispatchEvent(new Event('change'));
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

  // Toggle handlers for device modules
  const toggleModule = (cbId, inputIds) => {
    const cb = document.getElementById(cbId);
    if (!cb) return;
    cb.addEventListener('change', () => {
      inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.disabled = !cb.checked;
          if (!cb.checked && el.tagName === 'INPUT' && el.type !== 'number') el.value = '';
        }
      });
    });
  };
  toggleModule('dev-has-net', ['dev-ip', 'dev-mac']);
  toggleModule('dev-has-auth', ['dev-user', 'dev-pass']);
  toggleModule('dev-has-power', ['dev-plugs', 'dev-plugs-out', 'dev-power']);

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
      brand: document.getElementById('dev-brand').value.trim(),
      model: document.getElementById('dev-model').value.trim(),
      power:  parseInt(document.getElementById('dev-power').value) || 0,
      plugs:  parseInt(document.getElementById('dev-plugs').value) || 0,
      plugsOut: parseInt(document.getElementById('dev-plugs-out').value) || 0,
      user:   document.getElementById('dev-user').value.trim(),
      pass:   document.getElementById('dev-pass').value,
      notes:  document.getElementById('dev-notes').value.trim()
    };

    if (editingCatalogId) {
      const item = CATALOG.find(c => c.id === editingCatalogId);
      if (item) {
        Object.assign(item, props);
        item.power = parseInt(props.power) || 0;
        item.plugs = parseInt(props.plugs) || 0;
        item.plugsOut = parseInt(props.plugsOut) || 0;
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
        if (!rack) { notify('Primero crea un gabinete en esta sala', 'error'); return; }
        
        const newItem = {
          id: uid(),
          ...props,
          icon: { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' }[props.type] || '🖥',
          color: TYPE_COLORS[props.type] || '#8b9ab8'
        };
        if (typeof addCatalogItem === 'function') addCatalogItem(newItem);
        
        document.getElementById('modal-device').classList.add('hidden');
        openQuickPlacementModal(newItem.id);
        return; // Prevent adding 'hidden' again below
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
      const mountSide = document.getElementById('qp-side').value;
      
      if (!rackId || isNaN(slotU)) {
        notify('Selecciona un gabinete y slot válidos', 'error');
        return;
      }
      
      const ok = store.addDeviceToRack(qpCatalogItem, rackId, slotU, mountSide);
      if (ok) {
        notify(`${qpCatalogItem.name} instalado en rack en U${slotU} (${mountSide === 'front' ? 'Frontal' : 'Trasera'})`, 'success');
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
  if (window.closeMobileSidebar) window.closeMobileSidebar();
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
