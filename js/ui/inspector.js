/* js/ui/inspector.js */

window.renderInspector = function(entityType, entityId) {
  const container = document.getElementById('inspector-content');
  if (!container) return;

  const data = window.store._raw;
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
            <i class="${getIconForType(dev.type)}"></i>
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
  }
};
