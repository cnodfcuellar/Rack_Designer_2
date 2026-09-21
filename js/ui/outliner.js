/* js/ui/outliner.js */

window.outlinerSortMode = window.outlinerSortMode || 'slot';

function sortOutlinerDevices(devs, mode) {
  const list = [...devs];
  if (mode === 'name-asc') {
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  if (mode === 'name-desc') {
    return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }
  if (mode === 'type') {
    return list.sort((a, b) => {
      const comp = (a.type || '').localeCompare(b.type || '');
      return comp !== 0 ? comp : ((b.slotStart || b.position || 0) - (a.slotStart || a.position || 0));
    });
  }
  // 'slot' por defecto: orden físico descendente (mayor U arriba)
  return list.sort((a, b) => ((b.slotStart || b.position || 0) - (a.slotStart || a.position || 0)));
}
window.sortOutlinerDevices = sortOutlinerDevices;

function initOutlinerHeader() {
  const btnAddRoom = document.getElementById('btn-outliner-add-room');
  if (btnAddRoom && !btnAddRoom._bound) {
    btnAddRoom._bound = true;
    btnAddRoom.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof openAddRoomModal === 'function') openAddRoomModal();
    });
  }

  const btnAddRack = document.getElementById('btn-outliner-add-rack');
  if (btnAddRack && !btnAddRack._bound) {
    btnAddRack._bound = true;
    btnAddRack.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.appState && window.appState.selectedType === 'room' && window.appState.selectedId) {
        if (typeof store.setCurrentRoom === 'function') {
          store.setCurrentRoom(window.appState.selectedId);
        }
      }
      if (typeof openAddRackModal === 'function') openAddRackModal();
    });
  }

  const btnAddDev = document.getElementById('btn-outliner-add-dev');
  if (btnAddDev && !btnAddDev._bound) {
    btnAddDev._bound = true;
    btnAddDev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof openQuickPlacementModal === 'function') {
        openQuickPlacementModal(null);
      } else if (typeof openAddDeviceModal === 'function') {
        openAddDeviceModal();
      }
    });
  }

  const sortSelect = document.getElementById('outliner-sort-select');
  if (sortSelect) {
    sortSelect.value = window.outlinerSortMode || 'slot';
    if (!sortSelect._bound) {
      sortSelect._bound = true;
      sortSelect.addEventListener('change', (e) => {
        window.outlinerSortMode = e.target.value;
        renderOutliner();
      });
    }
  }
}

function renderOutliner() {
  const container = document.getElementById('outliner-tree');
  if (!container) return;

  initOutlinerHeader();

  const data = store._raw;
  if (!data || !data.rooms || data.rooms.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; font-style:italic; padding:8px;">No hay salas disponibles.</div>';
    return;
  }

  const sortMode = window.outlinerSortMode || 'slot';
  let html = '<ul style="list-style:none; padding-left:0; margin:0; font-size:13px;">';

  data.rooms.forEach(room => {
    const isSelected = window.appState && window.appState.selectedType === 'room' && window.appState.selectedId === room.id;
    const bgStyle = isSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';

    html += `
      <li>
        <details open>
          <summary class="outliner-item outliner-summary" data-type="room" data-id="${room.id}" style="${bgStyle}">
            <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0; overflow:hidden;">
              <svg class="outliner-node-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(room.name)}</span>
            </div>
            <span class="outliner-node-actions">
              <button class="outliner-action-btn" data-outliner-action="edit-room" data-id="${room.id}" title="Editar Sala">✏️</button>
              <button class="outliner-action-btn btn-del" data-outliner-action="del-room" data-id="${room.id}" title="Eliminar Sala">🗑️</button>
            </span>
          </summary>
          <ul style="list-style:none; padding-left:14px; margin:0; border-left:1px dashed var(--border);">
    `;

    // Racks en la sala
    const racks = data.racks.filter(r => r.roomId === room.id);
    racks.forEach(rack => {
      const isRackSelected = window.appState && window.appState.selectedType === 'rack' && window.appState.selectedId === rack.id;
      const rackBgStyle = isRackSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
      const shouldOpenRack = window.appState && (
        (window.appState.selectedType === 'rack' && window.appState.selectedId === rack.id) ||
        (window.appState.selectedType === 'device' && data.devices.find(d => d.id === window.appState.selectedId && d.rackId === rack.id))
      );

      html += `
        <li>
          <details ${shouldOpenRack ? 'open' : ''}>
            <summary class="outliner-item outliner-summary" data-type="rack" data-id="${rack.id}" style="${rackBgStyle}">
              <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0; overflow:hidden;">
                <svg class="outliner-node-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(rack.name)}</span>
              </div>
              <span class="outliner-node-actions">
                <button class="outliner-action-btn" data-outliner-action="edit-rack" data-id="${rack.id}" title="Editar Gabinete">✏️</button>
                <button class="outliner-action-btn btn-del" data-outliner-action="del-rack" data-id="${rack.id}" title="Eliminar Gabinete">🗑️</button>
              </span>
            </summary>
            <ul style="list-style:none; padding-left:14px; margin:0; border-left:1px dashed var(--border);">
      `;

      const rawRackDevs = data.devices.filter(d => d.rackId === rack.id);
      const rackDevs = sortOutlinerDevices(rawRackDevs, sortMode);

      if (rackDevs.length === 0) {
        html += `<li style="padding:3px 6px; color:var(--text-muted); font-size:11px; font-style:italic;">Vacío</li>`;
      } else {
        rackDevs.forEach(dev => {
          const isDevSelected = window.appState && window.appState.selectedType === 'device' && window.appState.selectedId === dev.id;
          const devBgStyle = isDevSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
          const posLabel = dev.slotStart ? `U${dev.slotStart}` : '';

          html += `
            <li class="outliner-item outliner-device" data-type="device" data-id="${dev.id}" style="${devBgStyle}">
              <div style="display:flex; align-items:center; gap:5px; flex:1; min-width:0; overflow:hidden;">
                <svg class="outliner-node-icon" width="11" height="11" style="color:var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(dev.name)}</span>
                ${posLabel ? `<span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); margin-left:auto; padding-right:4px;">${posLabel}</span>` : ''}
              </div>
              <span class="outliner-node-actions">
                <button class="outliner-action-btn" data-outliner-action="edit-dev" data-id="${dev.id}" title="Editar Equipo">✏️</button>
                <button class="outliner-action-btn btn-del" data-outliner-action="del-dev" data-id="${dev.id}" title="Eliminar Equipo">🗑️</button>
              </span>
            </li>
          `;
        });
      }

      html += `
            </ul>
          </details>
        </li>
      `;
    });

    // Equipos de piso
    const rawFloorDevs = data.devices.filter(d => d.roomId === room.id && d.rackId === null);
    if (rawFloorDevs.length > 0) {
      const floorDevs = sortOutlinerDevices(rawFloorDevs, sortMode);
      html += `
        <li>
          <details>
            <summary class="outliner-summary">
              <div style="display:flex; align-items:center; gap:6px; flex:1;">
                <svg class="outliner-node-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                <span>Equipos de Piso</span>
              </div>
            </summary>
            <ul style="list-style:none; padding-left:14px; margin:0; border-left:1px dashed var(--border);">
      `;

      floorDevs.forEach(dev => {
        const isDevSelected = window.appState && window.appState.selectedType === 'device' && window.appState.selectedId === dev.id;
        const devBgStyle = isDevSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';

        html += `
          <li class="outliner-item outliner-device" data-type="device" data-id="${dev.id}" style="${devBgStyle}">
            <div style="display:flex; align-items:center; gap:5px; flex:1; min-width:0; overflow:hidden;">
              <svg class="outliner-node-icon" width="11" height="11" style="color:var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(dev.name)}</span>
            </div>
            <span class="outliner-node-actions">
              <button class="outliner-action-btn" data-outliner-action="edit-dev" data-id="${dev.id}" title="Editar Equipo">✏️</button>
              <button class="outliner-action-btn btn-del" data-outliner-action="del-dev" data-id="${dev.id}" title="Eliminar Equipo">🗑️</button>
            </span>
          </li>
        `;
      });

      html += `
            </ul>
          </details>
        </li>
      `;
    }

    html += `
          </ul>
        </details>
      </li>
    `;
  });

  html += '</ul>';
  container.innerHTML = html;

  // Bind clicks de selección e inspección
  container.querySelectorAll('.outliner-item').forEach(item => {
    item.addEventListener('click', e => {
      // Ignorar si se hizo clic en un botón de acción inline
      if (e.target.closest('[data-outliner-action]')) return;
      e.stopPropagation();

      const type = item.dataset.type;
      const id = item.dataset.id;
      
      window.appState = window.appState || {};
      window.appState.selectedType = type;
      window.appState.selectedId = id;

      container.querySelectorAll('.outliner-item').forEach(el => el.style.background = 'transparent');
      item.style.background = 'rgba(255,255,255,0.05)';
      item.style.borderRadius = '4px';

      if (id && type && typeof window.renderInspector === 'function') {
        window.renderInspector(type, id);
      }
    });

    item.addEventListener('dblclick', e => {
      if (e.target.closest('[data-outliner-action]')) return;
      e.stopPropagation();
      const type = item.dataset.type;
      const id = item.dataset.id;
      if (type === 'device' && id && typeof window.openEditDeviceModal === 'function') {
        window.openEditDeviceModal(id);
      } else if (type === 'rack' && id && typeof window.openEditRackModal === 'function') {
        window.openEditRackModal(id);
      } else if (type === 'room' && id && typeof window.openEditRoomModal === 'function') {
        window.openEditRoomModal(id);
      }
    });
  });

  // Bind acciones inline (M-23)
  container.querySelectorAll('[data-outliner-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const action = btn.dataset.outlinerAction;
      const id = btn.dataset.id;
      if (!action || !id) return;

      if (action === 'edit-room') {
        if (typeof openEditRoomModal === 'function') openEditRoomModal(id);
      } else if (action === 'del-room') {
        if (typeof deleteRoom === 'function') {
          deleteRoom(id);
        }
      } else if (action === 'edit-rack') {
        if (typeof openEditRackModal === 'function') openEditRackModal(id);
      } else if (action === 'del-rack') {
        if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
          notify('Espectadores no pueden eliminar gabinetes.', 'error', 3000);
          return;
        }
        const r = store.rackById(id);
        const ok = await customConfirm('Eliminar Gabinete', `¿Eliminar "${r ? r.name : 'este gabinete'}" y todos los equipos instalados en él?`);
        if (ok) {
          store.deleteRack(id);
          notify('Gabinete eliminado', 'warn');
          if (window.appState && window.appState.selectedId === id) {
            window.appState.selectedId = null;
            window.appState.selectedType = null;
            if (typeof window.renderInspector === 'function') window.renderInspector(null, null);
          }
        }
      } else if (action === 'edit-dev') {
        if (typeof openEditDeviceModal === 'function') openEditDeviceModal(id);
      } else if (action === 'del-dev') {
        if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
          notify('Espectadores no pueden eliminar equipos.', 'error', 3000);
          return;
        }
        const d = store.deviceById(id);
        const ok = await customConfirm('Eliminar Equipo', `¿Eliminar "${d ? d.name : 'este equipo'}" y sus conexiones?`);
        if (ok) {
          store.deleteDevice(id);
          notify('Equipo eliminado', 'warn');
          if (window.appState && window.appState.selectedId === id) {
            window.appState.selectedId = null;
            window.appState.selectedType = null;
            if (typeof window.renderInspector === 'function') window.renderInspector(null, null);
          }
        }
      }
    });
  });

  // Re-render inspector si hay un elemento activo
  if (window.appState && window.appState.selectedType && window.appState.selectedId && typeof window.renderInspector === 'function') {
    window.renderInspector(window.appState.selectedType, window.appState.selectedId);
  }
}
