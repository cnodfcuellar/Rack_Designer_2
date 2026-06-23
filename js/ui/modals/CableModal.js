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

  const orphanedRack = devices.filter(d => !d.rackId && !FLOOR_TYPES.has(d.type));
  if (orphanedRack.length > 0) {
    html += `<optgroup label="Equipos sin Rack">`;
    orphanedRack.forEach(d => {
      html += `<option value="${escapeHTML(d.id)}">${escapeHTML(d.name)} (${escapeHTML(d.type)})</option>`;
    });
    html += `</optgroup>`;
  }

  const orphanedFloor = devices.filter(d => !d.rackId && FLOOR_TYPES.has(d.type));
  if (orphanedFloor.length > 0) {
    html += `<optgroup label="Equipos de Piso (Sala)">`;
    orphanedFloor.forEach(d => {
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
  
  updateCableLocationDisplay('src');
  updateCableLocationDisplay('dst');

  document.getElementById('cable-src-port').value = 'Eth0/1';
  document.getElementById('cable-dst-port').value = 'Eth0/2';
  document.getElementById('cable-color').value = '#3b82f6';
  document.getElementById('cable-color-picker').value = '#3b82f6';
  
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
  
  updateCableLocationDisplay('src');
  updateCableLocationDisplay('dst');

  document.getElementById('cable-src-port').value = conn.sourcePort;
  document.getElementById('cable-dst-port').value = conn.targetPort;
  document.getElementById('cable-type').value = conn.cableType;
  document.getElementById('cable-color').value = conn.color;
  document.getElementById('cable-color-picker').value = conn.color;
  
  document.getElementById('modal-cable').classList.remove('hidden');
}

function updateCableLocationDisplay(prefix) {
  const el = document.getElementById(`cable-${prefix}-dev`);
  const locEl = document.getElementById(`cable-${prefix}-loc`);
  const devId = el ? el.value : null;
  const dev = store.deviceById(devId);

  if (locEl) {
    locEl.value = dev ? getDeviceLocation(dev) : 'Desconocido';
  }
  updateCablePortInput(prefix, dev);
}

function updateCablePortInput(prefix, dev) {
  const container = document.getElementById(`cable-${prefix}-port-container`);
  if (!container) return;
  
  if (dev && dev.ports) {
    let opts = '';
    const eth = dev.ports.ethernet || 0;
    const fib = dev.ports.fiber || 0;
    
    if (eth > 0) {
      opts += `<optgroup label="Ethernet">`;
      for (let i = 1; i <= eth; i++) opts += `<option value="Eth-${i}">Eth-${i}</option>`;
      opts += `</optgroup>`;
    }
    if (fib > 0) {
      opts += `<optgroup label="SFP (Fibra)">`;
      for (let i = 1; i <= fib; i++) opts += `<option value="SFP-${i}">SFP-${i}</option>`;
      opts += `</optgroup>`;
    }
    container.innerHTML = `<select id="cable-${prefix}-port">${opts}</select>`;
  } else {
    container.innerHTML = `<input type="text" id="cable-${prefix}-port" placeholder="Eth0/1">`;
  }
}

function initCableModal() {
  document.getElementById('cable-src-dev').addEventListener('change', () => updateCableLocationDisplay('src'));
  document.getElementById('cable-dst-dev').addEventListener('change', () => updateCableLocationDisplay('dst'));

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
}
