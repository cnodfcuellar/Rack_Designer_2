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
  const mountSide = document.getElementById('qp-side').value || 'front';
  
  for (let u = 1; u <= rack.height - size + 1; u++) {
    if (canPlace(rackId, u, size, mountSide)) {
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
let qpCatalogItem = null;

function initPlacementModal() {
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

  document.getElementById('qp-side').addEventListener('change', () => {
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
