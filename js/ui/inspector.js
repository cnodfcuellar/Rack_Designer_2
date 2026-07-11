/* js/ui/inspector.js */

function getIconForDeviceType(type) {
  switch(type) {
    case 'server': return 'fa-solid fa-server';
    case 'switch':
    case 'router': return 'fa-solid fa-network-wired';
    case 'patch_panel': return 'fa-solid fa-grip-vertical';
    case 'pdu': return 'fa-solid fa-plug';
    case 'ups': return 'fa-solid fa-battery-half';
    case 'firewall': return 'fa-solid fa-shield-halved';
    case 'storage': return 'fa-solid fa-database';
    default: return 'fa-solid fa-box';
  }
}

window.renderInspector = function(entityType, entityId) {
  const container = document.getElementById('inspector-content');
  if (!container) return;

  const data = store._raw;
  if (!entityId || !entityType) {
    container.innerHTML = '<div style="text-align:center; padding-top:20px; color:var(--text-muted); font-style:italic;">Ningún elemento seleccionado</div>';
    return;
  }

  if (entityType === 'device') {
    const dev = data.devices.find(d => d.id === entityId);
    if (!dev) {
      container.innerHTML = '<div style="color:var(--danger);">Error: Equipo no encontrado</div>';
      return;
    }

    const rack = data.racks.find(r => r.id === dev.rackId);
    const room = data.rooms.find(r => r.id === dev.roomId);
    
    const locationStr = rack ? `${escapeHTML(rack.name)} (U${dev.position})` : (room ? `${escapeHTML(room.name)} (Piso)` : 'Desconocida');

    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--blue); color:white; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="${getIconForDeviceType(dev.type)}"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;" title="${escapeHTML(dev.name)}">${escapeHTML(dev.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">${escapeHTML(dev.type)}</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Ubicación:</span>
            <span style="color:var(--text); font-size:12px; font-weight:600;" title="${locationStr}">${locationStr.length > 18 ? locationStr.substring(0, 15) + '...' : locationStr}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Estado:</span>
            <span style="color:var(--text); font-size:12px; display:flex; align-items:center; gap:4px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${dev.status === 'active' ? 'var(--green)' : 'var(--red)'};"></span>
              ${dev.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Consumo:</span>
            <span style="color:var(--amber); font-size:12px; font-weight:600;">${dev.power ? dev.power.watts : 0} W</span>
          </div>
    `;

    if (dev.network && dev.network.ip) {
      html += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">IP:</span>
            <span style="color:var(--purple); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.network.ip)}</span>
          </div>
      `;
    }

    if (dev.network && dev.network.mac) {
      html += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">MAC:</span>
            <span style="color:var(--purple); font-size:12px; font-family:var(--font-mono);">${escapeHTML(dev.network.mac)}</span>
          </div>
      `;
    }

    html += `
        </div>
        
        <button class="btn-secondary" style="width:100%; justify-content:center; padding:8px; margin-top:4px;" onclick="window.openEditDeviceModal('${dev.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Editar Equipo
        </button>
      </div>
    `;

    container.innerHTML = html;
  } else if (entityType === 'rack') {
    const rack = data.racks.find(r => r.id === entityId);
    if (!rack) return;
    const room = data.rooms.find(r => r.id === rack.roomId);
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--blue); color:white; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="fa-solid fa-server"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(rack.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">GABINETE</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Ubicación:</span>
            <span style="color:var(--text); font-size:12px; font-weight:600;">${room ? escapeHTML(room.name) : 'Desconocida'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Capacidad:</span>
            <span style="color:var(--text); font-size:12px; font-weight:600;">${rack.height} U</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Color:</span>
            <span style="display:inline-block; width:16px; height:16px; border-radius:4px; background:${rack.color || '#0ea5e9'};"></span>
          </div>
        </div>
        
        <button class="btn-secondary" style="width:100%; justify-content:center; padding:8px; margin-top:4px;" onclick="if(typeof openEditRackModal === 'function') openEditRackModal('${rack.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Editar Gabinete
        </button>
      </div>
    `;
    container.innerHTML = html;
  } else if (entityType === 'room') {
    const room = data.rooms.find(r => r.id === entityId);
    if (!room) return;
    
    const racksCount = data.racks.filter(r => r.roomId === room.id).length;
    
    // Contar equipos de piso (tienen roomId) y equipos en rack (tienen rackId de un rack de esta sala)
    const roomRackIds = new Set(data.racks.filter(r => r.roomId === room.id).map(r => r.id));
    const devsCount = data.devices.filter(d => d.roomId === room.id || roomRackIds.has(d.rackId)).length;
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--blue); color:white; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:16px;">
            <i class="fa-solid fa-building"></i>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:bold; color:var(--text); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${escapeHTML(room.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">SALA / DATACENTER</div>
          </div>
        </div>
        
        <div style="background:var(--bg-card2); border:1px solid var(--border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Total Gabinetes:</span>
            <span style="color:var(--text); font-size:12px; font-weight:600;">${racksCount}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-muted); font-size:12px;">Total Equipos:</span>
            <span style="color:var(--text); font-size:12px; font-weight:600;">${devsCount}</span>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }
};
