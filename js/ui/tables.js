let activeTab = 'inventory';
function setActiveTab(tab) {
  activeTab = tab;
}

function renderBottomPanel() {
  const wrap = document.getElementById('bottom-table-wrap');
  if(!wrap) return;
  const searchInput = document.getElementById('table-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const btnDev = document.getElementById('table-btn-add-device');
  const btnQP = document.getElementById('table-btn-add-placement');
  const btnConn = document.getElementById('table-btn-add-conn');
  
  if (activeTab === 'inventory') {
    if (btnDev) btnDev.style.display = 'block';
    if (btnQP) btnQP.style.display = 'block';
    if (btnConn) btnConn.style.display = 'none';
    renderInventoryTable(wrap, query);
  } else {
    if (btnDev) btnDev.style.display = 'none';
    if (btnQP) btnQP.style.display = 'none';
    if (btnConn) btnConn.style.display = 'block';
    renderConnectionsTable(wrap, query);
  }
}

function renderInventoryTable(wrap, query) {
  const devices = store._raw.devices.filter(d => {
    if (!query) return true;
    return [d.name, d.ip, d.mac, d.serial, d.type, d.user, d.pass].join(' ').toLowerCase().includes(query);
  });
  if (!devices.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">📦</div><p>No hay equipos instalados.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Rack</th><th>U</th><th>Lado</th><th>Nombre</th><th>Marca</th><th>Modelo</th><th>Tipo</th><th>IP</th>
      <th>MAC</th><th>Serie</th><th>Usuario</th><th>Contraseña</th><th>Consumo (W)</th><th>Tomas</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${devices.map(d => {
      const isFloor = d.category === 'floor';
      const rack = !isFloor ? store.rackById(d.rackId) : null;
      const locationName = isFloor ? '<span style="color:var(--purple);font-weight:600">PISO</span>' : escapeHTML(rack?.name || '-');
      const slotDisplay = isFloor ? '-' : (d.slotStart || '-');
      const sideDisplay = isFloor ? '-' : ((d.mountSide === 'rear') ? 'Atrás' : 'Frontal');
      return `<tr data-dev-id="${escapeHTML(d.id)}">
        <td>${locationName}</td>
        <td>${slotDisplay}</td>
        <td><span style="font-size:11px;opacity:0.8;border:1px solid rgba(255,255,255,0.1);padding:2px 6px;border-radius:10px;">${sideDisplay}</span></td>
        <td class="editable" data-field="name" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.name)}</td>
        <td class="editable" data-field="brand" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.brand) || '-'}</td>
        <td class="editable" data-field="model" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.model) || '-'}</td>
        <td><span class="type-badge ${escapeHTML(d.type)}">${escapeHTML(d.type)}</span></td>
        <td class="editable" data-field="ip"  data-dev="${escapeHTML(d.id)}">${escapeHTML(d.ip)  || '-'}</td>
        <td class="editable" data-field="mac" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.mac) || '-'}</td>
        <td class="editable" data-field="serial" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.serial) || '-'}</td>
        <td class="editable" data-field="user" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.user) || '-'}</td>
        <td class="editable" data-field="pass" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.pass ? (window.SHOW_PASSWORDS ? d.pass : '••••••••') : '-')}</td>
        <td class="editable" data-field="power" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.power)) || 0}</td>
        <td class="editable" data-field="plugs" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.plugs ?? 1))}</td>
        <td style="white-space:nowrap;">
          <button class="tbl-action" data-edit-dev="${escapeHTML(d.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar">✎</button>
          <button class="tbl-action" data-del-dev="${escapeHTML(d.id)}" style="padding:4px 8px" title="Eliminar">🗑</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;

  wrap.querySelectorAll('td.editable').forEach(td => {
    td.addEventListener('dblclick', () => startCellEdit(td));
  });
  wrap.querySelectorAll('[data-del-dev]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteDevice(btn.dataset.delDev);
      notify('Equipo eliminado', 'warn');
    });
  });
  wrap.querySelectorAll('[data-edit-dev]').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditDeviceModal(btn.dataset.editDev);
    });
  });
}

function startCellEdit(td) {
  const field = td.dataset.field;
  const devId = td.dataset.dev;
  const dev = store.deviceById(devId);
  const orig = dev ? (dev[field] !== undefined && dev[field] !== null ? dev[field] : '') : (td.textContent.trim() === '-' ? '' : td.textContent.trim());
  td.innerHTML = `<input class="cell-edit" value="${escapeHTML(String(orig))}" data-field="${field}" data-dev="${devId}">`;
  const input = td.querySelector('input');
  input.focus(); input.select();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { td.textContent = orig || '-'; }
  });
  input.addEventListener('blur', () => finishCellEdit(input, td, orig));
}

function finishCellEdit(input, td, orig) {
  const field = input.dataset.field;
  const devId = input.dataset.dev;
  const val   = input.value.trim();
  const allowedFields = ['name', 'brand', 'model', 'ip', 'mac', 'serial', 'user', 'pass', 'power', 'plugs'];
  if (!allowedFields.includes(field)) return;
  if (field === 'ip') {
    if (val && !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val)) {
      input.classList.add('error');
      notify('IP inválida. Valores deben estar entre 0 y 255', 'error');
      setTimeout(() => { input.classList.remove('error'); }, 1000);
      return;
    }
  }
  if (field === 'mac') {
    if (val && !/^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(val)) {
      input.classList.add('error');
      notify('MAC inválida. Formato: XX:XX:XX:XX:XX:XX', 'error');
      setTimeout(() => { input.classList.remove('error'); }, 1000);
      return;
    }
  }
  store.updateDevice(devId, { [field]: (field === 'power' || field === 'plugs') ? parseInt(val) || 0 : val });
  if (field === 'pass') {
    td.textContent = val ? (window.SHOW_PASSWORDS ? val : '••••••••') : '-';
  } else {
    td.textContent = val || '-';
  }
}

function renderConnectionsTable(wrap, query) {
  const conns = store._raw.connections.filter(c => {
    if (!query) return true;
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    return [src?.name, dst?.name, c.cableType, c.sourcePort, c.targetPort].join(' ').toLowerCase().includes(query);
  });
  if (!conns.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">🔌</div><p>No hay conexiones de red registradas.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Sala/Rack Origen</th><th>Origen</th><th>Puerto Origen</th><th>Sala/Rack Destino</th><th>Destino</th><th>Puerto Destino</th>
      <th>Tipo Cable</th><th>Color</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${conns.map(c => {
      const src = store.deviceById(c.sourceDeviceId);
      const dst = store.deviceById(c.targetDeviceId);
      return `<tr>
        <td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(src))}</span></td>
        <td><span class="type-badge ${escapeHTML(src?.type||'')}">${escapeHTML(src?.name||'?')}</span></td>
        <td>${escapeHTML(c.sourcePort)}</td>
        <td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(dst))}</span></td>
        <td><span class="type-badge ${escapeHTML(dst?.type||'')}">${escapeHTML(dst?.name||'?')}</span></td>
        <td>${escapeHTML(c.targetPort)}</td>
        <td>${escapeHTML(c.cableType)}</td>
        <td><span class="cable-dot" style="background:${escapeHTML(c.color)};box-shadow:0 0 4px ${escapeHTML(c.color)}"></span> ${escapeHTML(c.color)}</td>
        <td style="white-space:nowrap;">
          <button class="tbl-action" data-edit-conn="${escapeHTML(c.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar">✎</button>
          <button class="tbl-action" data-del-conn="${escapeHTML(c.id)}" style="padding:4px 8px" title="Eliminar">🗑</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;

  wrap.querySelectorAll('[data-del-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteConnection(btn.dataset.delConn);
      notify('Conexión eliminada', 'warn');
    });
  });
  wrap.querySelectorAll('[data-edit-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditCableModal(btn.dataset.editConn);
    });
  });
}

function getInventoryData() {
  const data = [['Rack / Ubicación', 'Unidad U', 'Lado', 'Nombre', 'Marca', 'Modelo', 'Tipo', 'IP', 'MAC', 'Serie', 'Usuario', 'Contraseña', 'Consumo (W)']];
  store._raw.devices.forEach(d => {
    const isFloor = d.category === 'floor';
    const rack = !isFloor ? store.rackById(d.rackId) : null;
    const passDisplay = d.pass ? (window.SHOW_PASSWORDS ? d.pass : '••••••••') : '';
    data.push([
      isFloor ? 'PISO' : (rack?.name || ''), 
      isFloor ? '-' : (d.slotStart || ''), 
      isFloor ? '-' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal'),
      d.name, d.brand||'', d.model||'', d.type, d.ip, d.mac, d.serial, d.user, passDisplay, d.power
    ]);
  });
  return data;
}

function getConnectionsData() {
  const data = [['Sala/Rack Origen', 'Origen', 'Puerto Origen', 'Sala/Rack Destino', 'Destino', 'Puerto Destino', 'Tipo Cable', 'Color']];
  store._raw.connections.forEach(c => {
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    data.push([getDeviceLocation(src), src?.name||'?', c.sourcePort, getDeviceLocation(dst), dst?.name||'?', c.targetPort, c.cableType, c.color]);
  });
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCsv = document.getElementById('btn-table-csv');
  const btnExcel = document.getElementById('btn-table-excel');
  
  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      let data, filename;
      if (activeTab === 'inventory') {
        data = getInventoryData();
        filename = 'Inventario.csv';
      } else {
        data = getConnectionsData();
        filename = 'Conexiones.csv';
      }
      const csvContent = data.map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      notify(`CSV de ${activeTab === 'inventory' ? 'Inventario' : 'Conexiones'} exportado con éxito`, 'success');
    });
  }

  if (btnExcel) {
    btnExcel.addEventListener('click', () => {
      if (typeof XLSX === 'undefined') {
        notify('Librería Excel no cargada. Actualiza la página o revisa la red.', 'error');
        return;
      }
      const wb = XLSX.utils.book_new();
      
      const wsInv = XLSX.utils.aoa_to_sheet(getInventoryData());
      XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");
      
      const wsConn = XLSX.utils.aoa_to_sheet(getConnectionsData());
      XLSX.utils.book_append_sheet(wb, wsConn, "Conexiones");
      
      XLSX.writeFile(wb, 'Rack_Designer_Completo.xlsx');
      notify('Excel exportado con éxito', 'success');
    });
  }
});
