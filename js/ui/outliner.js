/* js/ui/outliner.js */

function renderOutliner() {
  const container = document.getElementById('outliner-tree');
  if (!container) return;

  const data = store._raw;
  if (!data || !data.rooms || data.rooms.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; font-style:italic;">No hay datos para mostrar.</div>';
    return;
  }

  let html = '<ul style="list-style:none; padding-left:0; margin:0; font-size:13px;">';

  data.rooms.forEach(room => {
    html += `
      <li>
        <details open>
          <summary style="cursor:pointer; padding:4px 0; font-weight:600; color:var(--text); user-select:none;">
             ${escapeHTML(room.name)}
          </summary>
          <ul style="list-style:none; padding-left:16px; margin:0; border-left:1px dashed var(--border);">
    `;

    // Racks
    const racks = data.racks.filter(r => r.roomId === room.id);
    racks.forEach(rack => {
      html += `
        <li>
          <details>
            <summary style="cursor:pointer; padding:3px 0; color:var(--text-secondary); user-select:none;">
               ${escapeHTML(rack.name)}
            </summary>
            <ul style="list-style:none; padding-left:16px; margin:0; border-left:1px dashed var(--border);">
      `;
      const rackDevs = data.devices.filter(d => d.rackId === rack.id).sort((a,b) => b.position - a.position);
      if(rackDevs.length === 0){
          html += `<li style="padding:2px 0; color:var(--text-muted); font-size:12px; font-style:italic;">Vacío</li>`;
      } else {
          rackDevs.forEach(dev => {
            const isSelected = window.appState && window.appState.selectedDeviceId === dev.id;
            const bgStyle = isSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
            html += `<li style="padding:2px 0; color:var(--text-muted); cursor:pointer; ${bgStyle}" class="outliner-item" data-dev-id="${dev.id}" title="Click para inspector, Doble clic para editar">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--blue); margin-right:4px;"></span>
              ${escapeHTML(dev.name)} <span style="font-size:11px; opacity:0.7;">(U${dev.position})</span>
            </li>`;
          });
      }
      html += `
            </ul>
          </details>
        </li>
      `;
    });

    // Floor Devices
    const floorDevs = data.devices.filter(d => d.roomId === room.id && d.rackId === null);
    if (floorDevs.length > 0) {
      html += `
        <li>
          <details>
            <summary style="cursor:pointer; padding:3px 0; color:var(--text-secondary); user-select:none;">
               Equipos de Piso
            </summary>
            <ul style="list-style:none; padding-left:16px; margin:0; border-left:1px dashed var(--border);">
      `;
      floorDevs.forEach(dev => {
        const isSelected = window.appState && window.appState.selectedDeviceId === dev.id;
        const bgStyle = isSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
        html += `<li style="padding:2px 0; color:var(--text-muted); cursor:pointer; ${bgStyle}" class="outliner-item" data-dev-id="${dev.id}" title="Click para inspector, Doble clic para editar">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--purple); margin-right:4px;"></span>
              ${escapeHTML(dev.name)}
            </li>`;
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

  // Bind clicks
  container.querySelectorAll('.outliner-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const devId = item.dataset.devId;
      
      // Set global selection state
      window.appState = window.appState || {};
      window.appState.selectedDeviceId = devId;

      // Highlight selected node (remove from others)
      container.querySelectorAll('.outliner-item').forEach(el => el.style.background = 'transparent');
      item.style.background = 'rgba(255,255,255,0.05)';
      item.style.borderRadius = '4px';

      if (devId && typeof window.renderInspector === 'function') {
        window.renderInspector('device', devId);
      }
    });

    item.addEventListener('dblclick', e => {
      e.stopPropagation();
      const devId = item.dataset.devId;
      if (devId && typeof window.openEditDeviceModal === 'function') {
        window.openEditDeviceModal(devId);
      }
    });

    // Add hover effect
    item.addEventListener('mouseenter', () => { 
      item.style.color = 'var(--text)'; 
      if(item.style.background === 'transparent' || !item.style.background) item.style.background = 'rgba(255,255,255,0.02)';
    });
    item.addEventListener('mouseleave', () => { 
      item.style.color = 'var(--text-muted)'; 
      if(item.style.background === 'rgba(255, 255, 255, 0.02)') item.style.background = 'transparent';
    });
  });

  // Re-render inspector if a device is currently selected
  if (window.appState && window.appState.selectedDeviceId && typeof window.renderInspector === 'function') {
    window.renderInspector('device', window.appState.selectedDeviceId);
  }
}
