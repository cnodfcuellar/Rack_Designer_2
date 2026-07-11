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
          <summary class="outliner-item outliner-summary" data-type="room" data-id="${room.id}">
            <span class="outliner-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
            <svg class="outliner-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
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
            <summary class="outliner-item outliner-summary" data-type="rack" data-id="${rack.id}">
              <span class="outliner-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
              <svg class="outliner-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              ${escapeHTML(rack.name)}
            </summary>
            <ul style="list-style:none; padding-left:16px; margin:0; border-left:1px dashed var(--border);">
      `;
      const rackDevs = data.devices.filter(d => d.rackId === rack.id).sort((a,b) => b.position - a.position);
      if(rackDevs.length === 0){
          html += `<li style="padding:2px 0; color:var(--text-muted); font-size:12px; font-style:italic;">Vacío</li>`;
      } else {
          rackDevs.forEach(dev => {
            const isSelected = window.appState && window.appState.selectedType === 'device' && window.appState.selectedId === dev.id;
            const bgStyle = isSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
            html += `<li class="outliner-item outliner-device" data-type="device" data-id="${dev.id}" title="Click para inspector, Doble clic para editar">
              <span style="width:12px; display:inline-block;"></span>
              <svg class="outliner-node-icon" style="color:var(--blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              ${escapeHTML(dev.name)}
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
            <summary class="outliner-summary" style="cursor:pointer; padding:3px 0; color:var(--text-secondary); user-select:none;">
              <span class="outliner-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
              <svg class="outliner-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
               Equipos de Piso
            </summary>
            <ul style="list-style:none; padding-left:16px; margin:0; border-left:1px dashed var(--border);">
      `;
      floorDevs.forEach(dev => {
        const isSelected = window.appState && window.appState.selectedType === 'device' && window.appState.selectedId === dev.id;
        const bgStyle = isSelected ? 'background:rgba(255,255,255,0.05); border-radius:4px;' : '';
        html += `<li class="outliner-item outliner-device" data-type="device" data-id="${dev.id}" title="Click para inspector, Doble clic para editar">
              <span style="width:12px; display:inline-block;"></span>
              <svg class="outliner-node-icon" style="color:var(--purple);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
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
      const type = item.dataset.type;
      const id = item.dataset.id;
      
      // Set global selection state
      window.appState = window.appState || {};
      window.appState.selectedType = type;
      window.appState.selectedId = id;

      // Highlight selected node (remove from others)
      container.querySelectorAll('.outliner-item').forEach(el => el.style.background = 'transparent');
      item.style.background = 'rgba(255,255,255,0.05)';
      item.style.borderRadius = '4px';

      if (id && type && typeof window.renderInspector === 'function') {
        window.renderInspector(type, id);
      }
    });

    item.addEventListener('dblclick', e => {
      e.stopPropagation();
      const type = item.dataset.type;
      const id = item.dataset.id;
      if (type === 'device' && id && typeof window.openEditDeviceModal === 'function') {
        window.openEditDeviceModal(id);
      } else if (type === 'rack' && id && typeof window.openEditRackModal === 'function') {
        window.openEditRackModal(id);
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

  // Re-render inspector if an entity is currently selected
  if (window.appState && window.appState.selectedType && window.appState.selectedId && typeof window.renderInspector === 'function') {
    window.renderInspector(window.appState.selectedType, window.appState.selectedId);
  }
}
