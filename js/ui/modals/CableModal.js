/* js/ui/modals/CableModal.js */

// editingConnectionId ya está declarado en Globals.js

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

function populateVlanSelect(selectedVlanId = 1) {
  const vlanSelect = document.getElementById('cable-vlan');
  if (!vlanSelect) return;
  const vlans = typeof store.getVlans === 'function' ? store.getVlans() : [];
  let html = '';
  vlans.forEach(v => {
    const sel = Number(v.id) === Number(selectedVlanId) ? 'selected' : '';
    html += `<option value="${v.id}" data-color="${v.color || '#64748b'}" ${sel}>VLAN ${v.id} · ${escapeHTML(v.name)}</option>`;
  });
  vlanSelect.innerHTML = html;
}

function openCableModal(defaultSrcId = null, defaultSrcPort = null) {
  editingConnectionId = null;
  const titleEl = document.getElementById('modal-cable-title');
  if (titleEl) titleEl.textContent = 'Conectar Equipos';
  
  const opts = buildDeviceOptionsGrouped();
  const srcSelect = document.getElementById('cable-src-dev');
  const dstSelect = document.getElementById('cable-dst-dev');
  
  srcSelect.innerHTML = opts;
  dstSelect.innerHTML = opts;
  
  if (defaultSrcId) {
    srcSelect.value = defaultSrcId;
  }
  
  // Seleccionar automáticamente un equipo destino distinto si es posible
  const allDevs = store._raw.devices || [];
  if (allDevs.length > 1) {
    const otherDev = allDevs.find(d => d.id !== srcSelect.value);
    if (otherDev) dstSelect.value = otherDev.id;
  }

  populateVlanSelect(1);
  
  updateCableLocationDisplay('src', defaultSrcPort);
  updateCableLocationDisplay('dst');

  document.getElementById('cable-color').value = '#3b82f6';
  document.getElementById('cable-color-picker').value = '#3b82f6';

  checkCableCollision();
  document.getElementById('modal-cable').classList.remove('hidden');
}

function openEditCableModal(connId) {
  editingConnectionId = connId;
  const conn = store._raw.connections.find(c => c.id === connId);
  if (!conn) return;

  const titleEl = document.getElementById('modal-cable-title');
  if (titleEl) titleEl.textContent = 'Editar Conexión';

  const opts = buildDeviceOptionsGrouped();
  const srcSelect = document.getElementById('cable-src-dev');
  const dstSelect = document.getElementById('cable-dst-dev');
  
  srcSelect.innerHTML = opts;
  dstSelect.innerHTML = opts;

  srcSelect.value = conn.sourceDeviceId;
  dstSelect.value = conn.targetDeviceId;
  
  populateVlanSelect(conn.vlanId || 1);

  updateCableLocationDisplay('src', conn.sourcePort);
  updateCableLocationDisplay('dst', conn.targetPort);

  document.getElementById('cable-type').value = conn.cableType;
  document.getElementById('cable-color').value = conn.color;
  document.getElementById('cable-color-picker').value = conn.color;
  
  checkCableCollision();
  document.getElementById('modal-cable').classList.remove('hidden');
}

function updateCableLocationDisplay(prefix, defaultPort = null) {
  const el = document.getElementById(`cable-${prefix}-dev`);
  const locEl = document.getElementById(`cable-${prefix}-loc`);
  const devId = el ? el.value : null;
  const dev = store.deviceById(devId);

  if (locEl) {
    locEl.value = dev ? getDeviceLocation(dev) : 'Desconocido';
  }
  updateCablePortInput(prefix, dev, defaultPort);
}

function updateCablePortInput(prefix, dev, defaultPort = null) {
  const container = document.getElementById(`cable-${prefix}-port-container`);
  if (!container) return;
  
  if (!dev) {
    container.innerHTML = `<input type="text" id="cable-${prefix}-port" placeholder="Eth0/1">`;
    return;
  }

  const filterFreeOnly = document.getElementById('cable-filter-free-ports')?.checked ?? true;
  const allPorts = typeof store.getDevicePorts === 'function' ? store.getDevicePorts(dev.id) : [];

  if (allPorts.length === 0) {
    container.innerHTML = `<input type="text" id="cable-${prefix}-port" placeholder="Eth0/1" value="${escapeHTML(defaultPort || 'Eth0/1')}">`;
    attachPortChangeListener(prefix);
    return;
  }

  // Agrupar puertos por tipo
  const ethPorts = [];
  const sfpPorts = [];
  const otherPorts = [];

  allPorts.forEach(p => {
    // Si estamos editando esta misma conexión, su puerto no cuenta como ocupado para sí misma
    const isOccupiedByAnother = p.isOccupied && (!editingConnectionId || p.connectionId !== editingConnectionId);
    const item = { ...p, isOccupiedForModal: isOccupiedByAnother };
    if (p.type === 'fiber') sfpPorts.push(item);
    else if (p.type === 'ethernet') ethPorts.push(item);
    else otherPorts.push(item);
  });

  const buildGroupHTML = (label, ports) => {
    let groupHtml = '';
    ports.forEach(p => {
      const isSelected = defaultPort && String(p.name).toLowerCase() === String(defaultPort).toLowerCase();
      if (p.isOccupiedForModal) {
        if (!filterFreeOnly || isSelected) {
          groupHtml += `<option value="${escapeHTML(p.name)}" ${isSelected ? 'selected' : 'disabled'} style="color:var(--text-muted); background:var(--bg-card);">🔴 ${escapeHTML(p.name)} (Ocupado · a ${escapeHTML(p.peerDeviceName)} [${escapeHTML(p.peerPort)}])</option>`;
        }
      } else {
        groupHtml += `<option value="${escapeHTML(p.name)}" ${isSelected ? 'selected' : ''}>🟢 ${escapeHTML(p.name)} (Libre)</option>`;
      }
    });
    return groupHtml ? `<optgroup label="${escapeHTML(label)}">${groupHtml}</optgroup>` : '';
  };

  let opts = '';
  opts += buildGroupHTML('Ethernet / Cobre', ethPorts);
  opts += buildGroupHTML('SFP / Fibra Óptica', sfpPorts);
  opts += buildGroupHTML('Otros Puertos', otherPorts);

  opts += `<optgroup label="Personalizado"><option value="__custom__">✏️ Ingresar otro puerto...</option></optgroup>`;

  container.innerHTML = `<select id="cable-${prefix}-port" style="width:100%;">${opts}</select>`;
  
  const selectEl = document.getElementById(`cable-${prefix}-port`);
  if (defaultPort) {
    selectEl.value = defaultPort;
    // Si no coincidió exactamente, verificar si existe la opción
    if (!selectEl.value || selectEl.value === '__custom__') {
      // Reemplazar con input personalizado si no está en la lista
      switchToCustomPortInput(prefix, defaultPort);
      return;
    }
  }

  attachPortChangeListener(prefix);
}

function switchToCustomPortInput(prefix, initialVal = '') {
  const container = document.getElementById(`cable-${prefix}-port-container`);
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex; gap:6px;">
      <input type="text" id="cable-${prefix}-port" value="${escapeHTML(initialVal)}" placeholder="Ej: Gi1/0/1" style="flex:1;">
      <button type="button" class="btn-secondary" id="btn-cancel-custom-${prefix}" title="Volver a lista de puertos" style="padding:0 8px; font-size:11px;">Lista</button>
    </div>
  `;
  document.getElementById(`btn-cancel-custom-${prefix}`).addEventListener('click', () => {
    const el = document.getElementById(`cable-${prefix}-dev`);
    const dev = el ? store.deviceById(el.value) : null;
    updateCablePortInput(prefix, dev);
    checkCableCollision();
  });
  attachPortChangeListener(prefix);
}

function attachPortChangeListener(prefix) {
  const portInput = document.getElementById(`cable-${prefix}-port`);
  if (!portInput) return;

  portInput.addEventListener('change', () => {
    if (portInput.value === '__custom__') {
      switchToCustomPortInput(prefix, '');
    } else {
      checkCableCollision();
    }
  });
  portInput.addEventListener('input', () => checkCableCollision());
}

function checkCableCollision() {
  const alertEl = document.getElementById('cable-collision-alert');
  const msgEl = document.getElementById('cable-collision-msg');
  const saveBtn = document.getElementById('modal-cable-save');
  if (!alertEl || !msgEl) return;

  const srcId = document.getElementById('cable-src-dev')?.value;
  const dstId = document.getElementById('cable-dst-dev')?.value;
  const srcPort = document.getElementById('cable-src-port')?.value?.trim();
  const dstPort = document.getElementById('cable-dst-port')?.value?.trim();

  if (!srcId || !dstId || !srcPort || !dstPort) {
    alertEl.classList.add('hidden');
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  if (typeof store.validateConnection === 'function') {
    const val = store.validateConnection({
      sourceDeviceId: srcId,
      sourcePort: srcPort,
      targetDeviceId: dstId,
      targetPort: dstPort,
      excludeConnectionId: editingConnectionId
    });

    if (!val.valid) {
      alertEl.classList.remove('hidden');
      msgEl.textContent = val.error;
      if (saveBtn) saveBtn.disabled = true;
      return;
    }
  }

  alertEl.classList.add('hidden');
  if (saveBtn) saveBtn.disabled = false;
}

function initCableModal() {
  const srcDevSelect = document.getElementById('cable-src-dev');
  const dstDevSelect = document.getElementById('cable-dst-dev');
  const filterFreeCb = document.getElementById('cable-filter-free-ports');
  const vlanSelect = document.getElementById('cable-vlan');

  if (srcDevSelect) {
    srcDevSelect.addEventListener('change', () => {
      updateCableLocationDisplay('src');
      checkCableCollision();
    });
  }

  if (dstDevSelect) {
    dstDevSelect.addEventListener('change', () => {
      updateCableLocationDisplay('dst');
      checkCableCollision();
    });
  }

  if (filterFreeCb) {
    filterFreeCb.addEventListener('change', () => {
      const srcDev = store.deviceById(srcDevSelect?.value);
      const dstDev = store.deviceById(dstDevSelect?.value);
      const curSrcPort = document.getElementById('cable-src-port')?.value;
      const curDstPort = document.getElementById('cable-dst-port')?.value;
      updateCablePortInput('src', srcDev, curSrcPort);
      updateCablePortInput('dst', dstDev, curDstPort);
      checkCableCollision();
    });
  }

  if (vlanSelect) {
    vlanSelect.addEventListener('change', () => {
      const opt = vlanSelect.options[vlanSelect.selectedIndex];
      if (opt && opt.dataset.color) {
        document.getElementById('cable-color').value = opt.dataset.color;
        document.getElementById('cable-color-picker').value = opt.dataset.color;
      }
    });
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
    const vlanId  = parseInt(document.getElementById('cable-vlan')?.value) || 1;
    const vlanOpt = document.getElementById('cable-vlan')?.selectedOptions[0];
    const vlanName = vlanOpt ? vlanOpt.textContent.split('·')[1]?.trim() || 'Default' : 'Default';

    if (!srcId || !dstId || srcId === dstId) {
      notify('Selecciona dos equipos distintos', 'error');
      return;
    }
    
    if (!srcPort || !dstPort) {
      notify('Debes seleccionar o ingresar los puertos de ambos equipos', 'error');
      return;
    }

    if (editingConnectionId) {
      const res = store.updateConnection(editingConnectionId, {
        sourceDeviceId: srcId,
        sourcePort: srcPort,
        targetDeviceId: dstId,
        targetPort: dstPort,
        cableType: type,
        color,
        vlanId,
        vlanName
      });
      if (res && res.success === false) {
        notify(res.error, 'error');
        return;
      }
      notify('Conexión actualizada', 'success');
    } else {
      const res = store.addConnection({
        sourceDeviceId: srcId,
        sourcePort: srcPort,
        targetDeviceId: dstId,
        targetPort: dstPort,
        cableType: type,
        color,
        vlanId,
        vlanName
      });
      if (res && res.success === false) {
        notify(res.error, 'error');
        return;
      }
      notify('Cable conectado', 'success');
    }
    
    document.getElementById('modal-cable').classList.add('hidden');
    editingConnectionId = null;
  });
  
  document.getElementById('modal-cable-cancel').addEventListener('click', () => {
    document.getElementById('modal-cable').classList.add('hidden');
    editingConnectionId = null;
  });
}

if (typeof window !== 'undefined') {
  window.openCableModal = openCableModal;
  window.openEditCableModal = openEditCableModal;
  window.initCableModal = initCableModal;
}
