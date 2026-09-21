/* js/ui/inspector.js */

function getIconForDeviceType(type) {
  const t = String(type).toLowerCase();
  switch(t) {
    case 'server':
    case 'storage':
      return 'svg-icon icon-server';
    case 'switch':
    case 'router':
    case 'ap':
    case 'gestion':
    case 'accesorios':
      return 'svg-icon icon-network';
    case 'pc':
      return 'svg-icon icon-desktop';
    case 'pdu':
    case 'ups':
      return 'svg-icon icon-bolt';
    case 'firewall':
    case 'door':
      return 'svg-icon icon-lock';
    default:
      return 'svg-icon icon-server';
  }
}

async function deleteRoomFromInspector(roomId) {
  if (typeof deleteRoom === 'function') {
    await deleteRoom(roomId);
  } else if (typeof store.deleteRoom === 'function') {
    if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
      notify('Espectadores no pueden eliminar salas.', 'error', 3000);
      return;
    }
    if (store._raw.rooms && store._raw.rooms.length <= 1) {
      notify('No puedes eliminar la única sala', 'warn');
      return;
    }
    const ok = await customConfirm('Eliminar Sala', '¿Eliminar esta sala y todos sus gabinetes asociados?');
    if (ok) {
      store.deleteRoom(roomId);
      notify('Sala eliminada', 'warn');
    }
  }
  if (window.appState && window.appState.selectedId === roomId) {
    window.appState.selectedId = null;
    window.appState.selectedType = null;
    if (typeof window.renderInspector === 'function') {
      window.renderInspector(null, null);
    }
  }
}

async function deleteRackFromInspector(rackId) {
  if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
    notify('Espectadores no pueden eliminar gabinetes.', 'error', 3000);
    return;
  }
  const rack = store.rackById(rackId);
  const ok = await customConfirm('Eliminar Gabinete', `¿Estás seguro de eliminar "${rack ? rack.name : 'este gabinete'}" y todos los equipos instalados en él?`);
  if (ok) {
    store.deleteRack(rackId);
    notify('Gabinete eliminado', 'warn');
    if (window.appState && window.appState.selectedId === rackId) {
      window.appState.selectedId = null;
      window.appState.selectedType = null;
      if (typeof window.renderInspector === 'function') {
        window.renderInspector(null, null);
      }
    }
  }
}

async function deleteDeviceFromInspector(devId) {
  if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
    notify('Espectadores no pueden eliminar equipos.', 'error', 3000);
    return;
  }
  const dev = store.deviceById(devId);
  const ok = await customConfirm('Eliminar Equipo', `¿Estás seguro de eliminar "${dev ? dev.name : 'este equipo'}" y sus conexiones?`);
  if (ok) {
    store.deleteDevice(devId);
    notify('Equipo eliminado', 'warn');
    if (window.appState && window.appState.selectedId === devId) {
      window.appState.selectedId = null;
      window.appState.selectedType = null;
      if (typeof window.renderInspector === 'function') {
        window.renderInspector(null, null);
      }
    }
  }
}

window.deleteRoomFromInspector = deleteRoomFromInspector;
window.deleteRackFromInspector = deleteRackFromInspector;
window.deleteDeviceFromInspector = deleteDeviceFromInspector;

window.renderInspector = function(entityType, entityId) {
  const container = document.getElementById('inspector-content');
  if (!container) return;

  const data = store._raw;
  if (!entityId || !entityType) {
    container.innerHTML = `
      <div class="inspector-empty-box">
        <div class="inspector-empty-icon">
          <i class="svg-icon icon-server" style="width:20px; height:20px;"></i>
        </div>
        <div style="font-weight:600; color:var(--text-primary); font-size:13px;">Consola de Infraestructura</div>
        <div style="color:var(--text-muted); font-size:11px; line-height:1.4;">Selecciona una sala, gabinete o equipo en el Outliner o en la vista física para inspeccionar y gestionar sus propiedades.</div>
        <div class="inspector-btn-group" style="margin-top:10px;">
          <button class="btn-inspector btn-inspector-primary" onclick="if(typeof openAddRoomModal === 'function') openAddRoomModal();">
            <i class="svg-icon icon-building" style="width:13px; height:13px;"></i> + Nueva Sala
          </button>
          <button class="btn-inspector btn-inspector-secondary" onclick="if(typeof openAddRackModal === 'function') openAddRackModal();">
            <i class="svg-icon icon-server" style="width:13px; height:13px;"></i> + Nuevo Gabinete
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (entityType === 'device') {
    const dev = data.devices.find(d => d.id === entityId);
    if (!dev) {
      container.innerHTML = '<div style="color:var(--danger); padding:8px;">Error: Equipo no encontrado</div>';
      return;
    }

    const rack = data.racks.find(r => r.id === dev.rackId);
    const room = data.rooms.find(r => r.id === dev.roomId);
    
    const locationStr = rack ? `${escapeHTML(rack.name)} (U${dev.slotStart})` : (room ? `${escapeHTML(room.name)} (Piso)` : 'Desconocida');

    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--accent-glow); color:var(--accent); width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="${getIconForDeviceType(dev.type)}"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text-primary); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;" title="${escapeHTML(dev.name)}">${escapeHTML(dev.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">${escapeHTML(dev.type)}</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Ubicación:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;" title="${locationStr}">${locationStr.length > 18 ? locationStr.substring(0, 15) + '...' : locationStr}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Tipo:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;">${escapeHTML(String(dev.type).toUpperCase())}</span>
          </div>
    `;

    if (dev.ip) {
      html += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">IP:</span>
            <span style="color:var(--accent); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.ip)}</span>
          </div>
      `;
    }

    if (dev.mac) {
      html += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">MAC:</span>
            <span style="color:var(--accent); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.mac)}</span>
          </div>
      `;
    }

    html += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Usuario:</span>
            <span style="color:var(--text-primary); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.user || 'N/A')}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Contraseña:</span>
            <span style="color:var(--text-primary); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.pass ? (window.SHOW_PASSWORDS ? dev.pass : '••••••••') : 'N/A')}</span>
          </div>
    `;

    if (dev.notes && dev.notes.trim()) {
      html += `
          <div style="margin-top:4px; border-top:1px solid var(--border); padding-top:6px; display:flex; flex-direction:column; gap:4px;">
            <span style="color:var(--text-muted); font-size:11px; font-weight:600; text-transform:uppercase;">Notas:</span>
            <div style="color:var(--text-secondary); font-size:12px; white-space:pre-wrap; font-style:italic; background:rgba(255,255,255,0.02); padding:6px; border-radius:4px; border:1px solid var(--border-light); max-height:80px; overflow-y:auto;">${escapeHTML(dev.notes)}</div>
          </div>
      `;
    }

    html += `
        </div>
        
        <div class="inspector-btn-group">
          <div class="inspector-btn-row">
            <button class="btn-inspector btn-inspector-secondary" style="flex:1;" onclick="if(typeof openEditDeviceModal === 'function') openEditDeviceModal('${escapeHTML(dev.id)}')">
              <i class="svg-icon icon-edit" style="width:12px; height:12px;"></i> Editar Equipo
            </button>
            <button class="btn-inspector btn-inspector-danger" style="flex:1;" onclick="deleteDeviceFromInspector('${escapeHTML(dev.id)}')">
              <i class="svg-icon icon-trash" style="width:12px; height:12px;"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } else if (entityType === 'rack') {
    const rack = data.racks.find(r => r.id === entityId);
    if (!rack) return;
    const room = data.rooms.find(r => r.id === rack.roomId);
    const rackDevs = data.devices.filter(d => d.rackId === rack.id);
    const uOccupied = rackDevs.reduce((sum, d) => sum + (d.size || d.height || 1), 0);
    const uPct = rack.height ? Math.round((uOccupied / rack.height) * 100) : 0;
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--accent-glow); color:var(--accent); width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="svg-icon icon-server" style="width:16px; height:16px;"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text-primary); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(rack.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">GABINETE (${rack.height}U)</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Ubicación:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;">${room ? escapeHTML(room.name) : 'Desconocida'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Capacidad:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;">${rack.height} U</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Ocupación:</span>
            <span style="color:var(--accent); font-size:12px; font-weight:600;">${uOccupied}U / ${rack.height}U (${uPct}%)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Color:</span>
            <span style="display:inline-block; width:16px; height:16px; border-radius:4px; background:${rack.color || '#0ea5e9'};"></span>
          </div>
        </div>
        
        <div class="inspector-btn-group">
          <button class="btn-inspector btn-inspector-primary" onclick="if(typeof openQuickPlacementModal === 'function') openQuickPlacementModal(null);">
            <i class="svg-icon icon-desktop" style="width:13px; height:13px;"></i> + Agregar Equipo a este Rack
          </button>
          <div class="inspector-btn-row">
            <button class="btn-inspector btn-inspector-secondary" style="flex:1;" onclick="if(typeof openEditRackModal === 'function') openEditRackModal('${rack.id}');">
              <i class="svg-icon icon-edit" style="width:12px; height:12px;"></i> Editar
            </button>
            <button class="btn-inspector btn-inspector-danger" style="flex:1;" onclick="deleteRackFromInspector('${rack.id}');">
              <i class="svg-icon icon-trash" style="width:12px; height:12px;"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } else if (entityType === 'room') {
    const room = data.rooms.find(r => r.id === entityId);
    if (!room) return;
    
    const racksCount = data.racks.filter(r => r.roomId === room.id).length;
    const roomRackIds = new Set(data.racks.filter(r => r.roomId === room.id).map(r => r.id));
    const devsCount = data.devices.filter(d => d.roomId === room.id || roomRackIds.has(d.rackId)).length;
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--accent-glow); color:var(--accent); width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="svg-icon icon-building" style="width:16px; height:16px;"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text-primary); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(room.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">SALA / DATACENTER</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Total Gabinetes:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;">${racksCount}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Total Equipos:</span>
            <span style="color:var(--text-primary); font-size:12px; font-weight:600;">${devsCount}</span>
          </div>
        </div>

        <div class="inspector-btn-group">
          <button class="btn-inspector btn-inspector-primary" onclick="if(typeof store.setCurrentRoom === 'function') store.setCurrentRoom('${room.id}'); if(typeof openAddRackModal === 'function') openAddRackModal();">
            <i class="svg-icon icon-server" style="width:13px; height:13px;"></i> + Crear Gabinete en esta Sala
          </button>
          <div class="inspector-btn-row">
            <button class="btn-inspector btn-inspector-secondary" style="flex:1;" onclick="if(typeof openEditRoomModal === 'function') openEditRoomModal('${room.id}');">
              <i class="svg-icon icon-edit" style="width:12px; height:12px;"></i> Editar Sala
            </button>
            <button class="btn-inspector btn-inspector-danger" style="flex:1;" onclick="deleteRoomFromInspector('${room.id}');">
              <i class="svg-icon icon-trash" style="width:12px; height:12px;"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }
};
