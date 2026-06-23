const UNIT_H = 24; // px por U
let dragState = null;

function renderPhysical() {
  const container = document.getElementById('view-physical');
  if(!container) return;
  const racks = store.currentRacks;
  
  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  // Preserve flipped state
  const flippedRacks = new Set();
  container.querySelectorAll('.rack-flipper.flipped').forEach(f => {
    flippedRacks.add(f.id.replace('flipper-', ''));
  });

  if (!racks.length) {
    container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; width:100%; display:flex; flex-wrap:wrap; gap:24px; align-content:flex-start;">
      <div style="display:flex; justify-content:center; width:100%;">
        <div class="empty-state" style="display:flex; flex-direction:column; align-items:center;">
          <div class="icon">🗄️</div>
          <p>No hay gabinetes en esta sala.</p>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn-primary" id="empty-btn-add-rack">+ Rack</button>
          </div>
        </div>
      </div>
    </div>`;
    const floorSection = renderFloorSection(store._raw.currentRoomId);
    container.querySelector('#view-physical-content').appendChild(floorSection);
    bindRackEvents(container, flippedRacks);
    updateZoomLabel();
    return;
  }

  function buildRackFace(rack, devices, side, searchTerm) {
    const sideDevices = devices.filter(d => (d.mountSide || 'front') === side);
    let slotsHTML = '';
    let skip = 0;
    for (let u = 1; u <= rack.height; u++) {
      if (skip > 0) { skip--; continue; }
      const dev = sideDevices.find(d => d.slotStart === u);
      if (dev) {
        const h = dev.size * UNIT_H;
        let matchClass = '';
        if (searchTerm) {
          const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
          matchClass = fields.includes(searchTerm) ? 'search-match' : 'search-dim';
        }
        skip = dev.size - 1;
        slotsHTML += `<div class="rack-slot occupied" style="height:${h}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}">
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
        slotsHTML += `<div class="rack-slot" style="height:${UNIT_H}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}"></div>`;
      }
    }
    const railHTML = Array.from({length: rack.height}, (_, i) => `<div class="rail-unit">${i + 1}</div>`).join('');
    const titleText = side === 'front' ? escapeHTML(rack.name) : `Vista Trasera`;
    const btnText = side === 'front' ? '🔄' : '🖥️';

    return `
      <div class="rack-card" data-rack-id="${rack.id}" data-side="${side}" style="${side === 'rear' ? 'border-color: #3b82f6; background: #0c1420' : ''}">
        <div class="rack-header" style="${side === 'rear' ? 'background: linear-gradient(90deg, #0f2035, #1a3050)' : ''}">
          <div class="rack-title">
            <div class="rack-color-dot" style="background:${side==='rear'?'#3b82f6':escapeHTML(rack.color)}; box-shadow:0 0 6px ${side==='rear'?'#3b82f6':escapeHTML(rack.color)}88"></div>
            ${titleText}
          </div>
          <div class="rack-hdr-btns" style="position:relative; display:flex; align-items:center; gap:4px;">
            <button class="btn-flip-rack" data-flip-rack="${escapeHTML(rack.id)}" title="${side === 'front' ? 'Vista Trasera' : 'Vista Frontal'}">${btnText}</button>
            <button class="rack-btn" data-rack-menu-toggle="${escapeHTML(rack.id)}" title="Opciones" style="font-size: 16px; padding: 0 6px; font-weight:bold; cursor:pointer;">⋮</button>
            <div class="dropdown-menu hidden" id="rack-menu-${rack.id}" style="right:0; top:32px; min-width:190px; z-index:1000;">
              <div class="dropdown-item" data-add-dev-rack="${escapeHTML(rack.id)}">⚡ Agregar Equipo</div>
              <div class="dropdown-item" data-clear-rack="${escapeHTML(rack.id)}">🧹 Limpiar Gabinete</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" data-edit-rack="${escapeHTML(rack.id)}">✎ Editar Gabinete</div>
              <div class="dropdown-item" style="color:var(--danger)" data-del-rack="${escapeHTML(rack.id)}">🗑 Eliminar Gabinete</div>
            </div>
          </div>
        </div>
        <div class="rack-body">
          <div class="rack-rail-left">${railHTML}</div>
          <div class="rack-slots" style="width:220px" id="slots-${side}-${rack.id}">
            ${slotsHTML}
          </div>
          <div class="rack-rail-right">${railHTML}</div>
        </div>
      </div>
    `;
  }

  const racksHTML = racks.map(rack => {
    const devices = store.allDevicesInRack(rack.id);
    
    return `
    <div class="rack-wrapper" data-rack-id="${rack.id}">
      <div class="rack-flipper" id="flipper-${rack.id}">
        <div class="rack-face">${buildRackFace(rack, devices, 'front', searchTerm)}</div>
        <div class="rack-rear">${buildRackFace(rack, devices, 'rear', searchTerm)}</div>
      </div>
      <div style="text-align:center; font-size:9px; color:var(--text-muted); margin-top:4px; font-family:var(--font-mono)">
        ${rack.height}U · ${devices.filter(d => (d.mountSide||'front')==='front').reduce((s,d)=>s+d.size,0)}/${rack.height} FRONT · ${devices.filter(d => d.mountSide==='rear').reduce((s,d)=>s+d.size,0)}/${rack.height} REAR
      </div>
    </div>`;
  }).join('');

  const addRackHTML = `
    <div class="rack-wrapper" id="canvas-btn-add-rack" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:260px; min-height:300px; border:2px dashed var(--border); border-radius:var(--radius); cursor:pointer; opacity:0.5; transition:all 0.2s;" onmouseover="this.style.opacity='1'; this.style.borderColor='var(--accent)'" onmouseout="this.style.opacity='0.5'; this.style.borderColor='var(--border)'">
      <div style="font-size:32px; color:var(--text-muted); margin-bottom:8px;">+</div>
      <div style="font-family:var(--font-ui); color:var(--text-secondary); font-size:var(--text-sm); font-weight:600;">+Rack</div>
    </div>
  `;

  container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; display:flex; flex-wrap:wrap; gap:24px; align-content:flex-start; width: 100%;">
    <div style="display:flex; flex-wrap:wrap; gap:24px; width:100%;">${racksHTML}${addRackHTML}</div>
  </div>`;

  const floorSection = renderFloorSection(store._raw.currentRoomId);
  container.querySelector('#view-physical-content').appendChild(floorSection);

  bindRackEvents(container, flippedRacks);
  updateZoomLabel();
}

function bindRackEvents(container, flippedRacks) {
  container.querySelectorAll('[data-flip-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const rackId = btn.dataset.flipRack;
      const flipper = document.getElementById(`flipper-${rackId}`);
      if (!flipper) return;
      const isFlipped = flipper.classList.toggle('flipped');
      const face = flipper.querySelector('.rack-face');
      const rear = flipper.querySelector('.rack-rear');
      if (face) face.style.pointerEvents = isFlipped ? 'none' : 'auto';
      if (rear) rear.style.pointerEvents = isFlipped ? 'auto' : 'none';
      btn.textContent = isFlipped ? '🖥️' : '🔄';
    });
  });
  container.querySelectorAll('[data-rack-menu-toggle]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const menu = document.getElementById(`rack-menu-${btn.dataset.rackMenuToggle}`);
      // Cerrar otros menús de rack
      document.querySelectorAll('.dropdown-menu[id^="rack-menu-"]').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });
  });

  container.querySelectorAll('[data-edit-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById(`rack-menu-${btn.dataset.editRack}`)?.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden editar gabinetes.', 'error', 3000);
        return;
      }
      openEditRackModal(btn.dataset.editRack);
    });
  });
  container.querySelectorAll('[data-del-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById(`rack-menu-${btn.dataset.delRack}`)?.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden eliminar gabinetes.', 'error', 3000);
        return;
      }
      if (confirm('¿Eliminar este gabinete y todos sus equipos?')) {
        store.deleteRack(btn.dataset.delRack);
        notify('Gabinete eliminado', 'warn');
      }
    });
  });

  container.querySelectorAll('[data-add-dev-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById(`rack-menu-${btn.dataset.addDevRack}`)?.classList.add('hidden');
      openQuickPlacementModal(null);
    });
  });

  container.querySelectorAll('[data-clear-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const rackId = btn.dataset.clearRack;
      document.getElementById(`rack-menu-${rackId}`)?.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden limpiar gabinetes.', 'error', 3000);
        return;
      }
      if (confirm('⚠️ ¿Estás seguro de limpiar este gabinete? TODOS los equipos dentro de este rack serán eliminados permanentemente.')) {
        const devices = store.allDevicesInRack(rackId);
        devices.forEach(d => store.deleteDevice(d.id));
        notify('Gabinete limpiado exitosamente', 'success');
      }
    });
  });

  // Eventos para añadir rack desde el canvas
  container.querySelectorAll('#canvas-btn-add-rack, #empty-btn-add-rack').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openAddRackModal();
    });
  });

  container.querySelectorAll('.rack-slot').forEach(slot => {
    slot.addEventListener('dragover',  onSlotDragOver);
    slot.addEventListener('dragleave', onSlotDragLeave);
    slot.addEventListener('drop',      onSlotDrop);
  });
  container.querySelectorAll('.device-faceplate, .floor-device-card').forEach(fp => {
    fp.addEventListener('dragstart', onDeviceDragStart);
    fp.addEventListener('dragend',   onDeviceDragEnd);
    fp.addEventListener('dblclick',  onDeviceDoubleClick);
    fp.addEventListener('contextmenu', onDeviceContextMenu);
    fp.addEventListener('mouseenter', onDeviceMouseEnter);
    fp.addEventListener('mousemove', onDeviceMouseMove);
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
    card.addEventListener('mouseenter', onDeviceMouseEnter);
    card.addEventListener('mousemove', onDeviceMouseMove);
    card.addEventListener('mouseleave', onDeviceMouseLeave);
  });

  // Restore flipped state
  flippedRacks.forEach(rackId => {
    const flipper = document.getElementById(`flipper-${rackId}`);
    if (flipper) {
      flipper.classList.add('flipped');
      const face = flipper.querySelector('.rack-face');
      const rear = flipper.querySelector('.rack-rear');
      if (face) face.style.pointerEvents = 'none';
      if (rear) rear.style.pointerEvents = 'auto';
      const btn = document.querySelector(`[data-flip-rack="${rackId}"]`);
      if (btn) btn.textContent = '🖥️';
    }
  });
}

function onCatalogDragStart(e) {
  if (!RackAuth.can('editDevices')) {
    e.preventDefault();
    return;
  }
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
  if (!RackAuth.can('editDevices')) {
    e.preventDefault();
    return;
  }
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
  const mountSide = slot.dataset.side || 'front';
  const rack = store.rackById(rackId);
  const size = dragState.type === 'catalog' ? dragState.item.size : dragState.device.size;
  if (!rack || !slotU) return;

  clearDropHighlights();
  const container = slot.closest('.rack-slots');
  container.querySelectorAll('.rack-slot').forEach(s => {
    const u = parseInt(s.dataset.slot);
    if (u >= slotU && u < slotU + size) {
      const existingFilter = store.allDevicesInRack(rackId).filter(d => (d.mountSide || 'front') === mountSide && d.id !== (dragState.type === 'device' ? dragState.deviceId : null));
      let valid = true;
      for (const d of existingFilter) {
        const dEnd = d.slotStart + d.size - 1;
        const nEnd = slotU + size - 1;
        if (!(nEnd < d.slotStart || slotU > dEnd)) { valid = false; break; }
      }
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
  const mountSide = slot.dataset.side || 'front';
  clearDropHighlights();

  if (dragState.type === 'catalog') {
    const item = { ...dragState.item, name: dragState.item.name };
    const ok = store.addDeviceToRack(item, rackId, slotU, mountSide);
    if (ok) notify(`${item.name} instalado en U${slotU} (${mountSide === 'front' ? 'Frente' : 'Atrás'})`, 'success');
    else    notify(`No hay espacio suficiente: U${slotU}, Lado: ${mountSide}`, 'error');
  } else if (dragState.type === 'device') {
    const ok = store.moveDevice(dragState.deviceId, rackId, slotU, mountSide);
    if (ok) notify(`Equipo movido a U${slotU} (${mountSide === 'front' ? 'Frente' : 'Atrás'})`, 'success');
    else    notify(`Posición inválida: U${slotU}, Lado: ${mountSide}`, 'error');
  }
  dragState = null;
}

function canPlace(rackId, slotStart, size, mountSide = 'front', excludeDeviceId = null) {
  const rack = store.rackById(rackId);
  if (!rack) return false;
  if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
  const existing = store.allDevicesInRack(rackId).filter(d => d.id !== excludeDeviceId && (d.mountSide || 'front') === mountSide);
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
    <div class="tt-row"><span>Pass:</span> <span>${escapeHTML(dev.pass ? (window.SHOW_PASSWORDS ? dev.pass : '••••••••') : 'N/A')}</span></div>
  `;
  
  let x = e.clientX + 15;
  let y = e.clientY + 15;
  if(x + 220 > window.innerWidth) x = e.clientX - 235;
  if(y + tooltip.offsetHeight > window.innerHeight) y = window.innerHeight - tooltip.offsetHeight - 10;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;

  tooltip.classList.add('visible');
}

function onDeviceMouseMove(e) {
  const tooltip = document.getElementById('device-tooltip');
  if(!tooltip || !tooltip.classList.contains('visible')) return;
  let x = e.clientX + 15;
  let y = e.clientY + 15;
  if(x + 220 > window.innerWidth) x = e.clientX - 235;
  if(y + tooltip.offsetHeight > window.innerHeight) y = window.innerHeight - tooltip.offsetHeight - 10;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
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
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn-primary" id="floor-btn-add-device" style="padding: 2px 8px; font-size: 12px; height: 24px; background:rgba(139, 92, 246, 0.15); border-color:var(--purple); color:var(--purple)">⚡ Agregar Equipo</button>
        <span class="floor-device-count">${floorDevices.length} dispositivos</span>
      </div>
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

  const addDevBtn = section.querySelector('#floor-btn-add-device');
  if (addDevBtn) {
    addDevBtn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickPlacementModal(null);
    });
  }

  return section;
}
