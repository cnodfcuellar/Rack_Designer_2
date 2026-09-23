let activeTab = 'inventory';

/* ============================================================
   TABLE COLUMNS DEFINITIONS & CONFIGURATION (PROPUESTA 3)
============================================================ */
const STORAGE_KEY_TABLE_COLS = 'RACK_DESIGNER_TABLE_COLUMNS';

const INVENTORY_COLUMNS = [
  { id: 'rack', label: 'Rack', category: 'Ubicación', default: true },
  { id: 'slot', label: 'U', category: 'Ubicación', default: true },
  { id: 'side', label: 'Lado', category: 'Ubicación', default: true },
  { id: 'name', label: 'Nombre', category: 'Identificación', default: true, required: true },
  { id: 'brand', label: 'Marca', category: 'Hardware', default: true },
  { id: 'model', label: 'Modelo', category: 'Hardware', default: true },
  { id: 'type', label: 'Tipo', category: 'Hardware', default: true },
  { id: 'size', label: 'Tamaño', category: 'Hardware', default: true },
  { id: 'ip', label: 'IP', category: 'Red', default: true },
  { id: 'mac', label: 'MAC', category: 'Red', default: true },
  { id: 'serial', label: 'Serie', category: 'Hardware', default: true },
  { id: 'user', label: 'Usuario', category: 'Acceso', default: true },
  { id: 'pass', label: 'Contraseña', category: 'Acceso', default: true },
  { id: 'power', label: 'Consumo (W)', category: 'Energía', default: true },
  { id: 'plugs', label: 'Tomas', category: 'Energía', default: true },
  { id: 'skin', label: 'Skin', category: 'Diseño', default: true },
  { id: 'notes', label: 'Notas', category: 'General', default: true },
  { id: 'actions', label: 'Acciones', category: 'Control', default: true, required: true }
];

const CONNECTIONS_COLUMNS = [
  { id: 'srcLocation', label: 'Sala/Rack Origen', category: 'Origen', default: true },
  { id: 'srcDevice', label: 'Origen', category: 'Origen', default: true },
  { id: 'sourcePort', label: 'Puerto Origen', category: 'Origen', default: true },
  { id: 'dstLocation', label: 'Sala/Rack Destino', category: 'Destino', default: true },
  { id: 'dstDevice', label: 'Destino', category: 'Destino', default: true },
  { id: 'targetPort', label: 'Puerto Destino', category: 'Destino', default: true },
  { id: 'vlan', label: 'VLAN', category: 'Red', default: true },
  { id: 'cableType', label: 'Tipo Cable', category: 'Físico', default: true },
  { id: 'color', label: 'Color', category: 'Físico', default: true },
  { id: 'actions', label: 'Acciones', category: 'Control', default: true, required: true }
];

function getTableColumnsConfig() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_TABLE_COLS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {}

  const def = { inventory: {}, connections: {} };
  INVENTORY_COLUMNS.forEach(c => { def.inventory[c.id] = c.default; });
  CONNECTIONS_COLUMNS.forEach(c => { def.connections[c.id] = c.default; });
  return def;
}

function saveTableColumnsConfig(config) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TABLE_COLS, JSON.stringify(config));
    }
  } catch (e) {}
}

function isColumnVisible(tableType, colId) {
  const list = tableType === 'inventory' ? INVENTORY_COLUMNS : CONNECTIONS_COLUMNS;
  const colDef = list.find(c => c.id === colId);
  if (colDef && colDef.required) return true;

  const config = getTableColumnsConfig();
  if (config && config[tableType] && config[tableType][colId] !== undefined) {
    return !!config[tableType][colId];
  }
  return colDef ? colDef.default : true;
}

function setColumnVisible(tableType, colId, visible) {
  const config = getTableColumnsConfig();
  if (!config[tableType]) config[tableType] = {};
  config[tableType][colId] = visible;
  saveTableColumnsConfig(config);
  updateColumnsBadge();
  renderBottomPanel();
}

function resetTableColumns(tableType) {
  const config = getTableColumnsConfig();
  const list = tableType === 'inventory' ? INVENTORY_COLUMNS : CONNECTIONS_COLUMNS;
  config[tableType] = {};
  list.forEach(c => { config[tableType][c.id] = c.default; });
  saveTableColumnsConfig(config);
  updateColumnsBadge();
  renderColumnsDropdown();
  renderBottomPanel();
}

function showAllTableColumns(tableType) {
  const config = getTableColumnsConfig();
  const list = tableType === 'inventory' ? INVENTORY_COLUMNS : CONNECTIONS_COLUMNS;
  config[tableType] = {};
  list.forEach(c => { config[tableType][c.id] = true; });
  saveTableColumnsConfig(config);
  updateColumnsBadge();
  renderColumnsDropdown();
  renderBottomPanel();
}

function updateColumnsBadge() {
  const badge = document.getElementById('columns-count-badge');
  if (!badge) return;
  const list = activeTab === 'inventory' ? INVENTORY_COLUMNS : CONNECTIONS_COLUMNS;
  let visibleCount = 0;
  list.forEach(c => {
    if (isColumnVisible(activeTab, c.id)) visibleCount++;
  });
  badge.textContent = `(${visibleCount}/${list.length})`;
}

function renderColumnsDropdown() {
  const listEl = document.getElementById('columns-dropdown-list');
  const indicator = document.getElementById('columns-active-tab-indicator');
  if (!listEl) return;

  const currentTab = activeTab === 'inventory' ? 'inventory' : 'connections';
  if (indicator) {
    indicator.textContent = currentTab === 'inventory' ? 'Inventario' : 'Conexiones';
  }

  const cols = currentTab === 'inventory' ? INVENTORY_COLUMNS : CONNECTIONS_COLUMNS;

  listEl.innerHTML = cols.map(c => {
    const isVis = isColumnVisible(currentTab, c.id);
    const isReq = !!c.required;
    return `
      <label class="col-toggle-item" style="${isReq ? 'opacity:0.75; cursor:not-allowed;' : ''}">
        <input type="checkbox" data-col-id="${c.id}" ${isVis ? 'checked' : ''} ${isReq ? 'disabled' : ''}>
        <div class="col-toggle-label">
          <span>${c.label} ${isReq ? '<span style="font-size:9px; color:var(--text-muted);">(Fijo)</span>' : ''}</span>
          <span class="col-category-badge">${c.category}</span>
        </div>
      </label>
    `;
  }).join('');

  listEl.querySelectorAll('input[type="checkbox"]:not([disabled])').forEach(cb => {
    cb.addEventListener('change', () => {
      setColumnVisible(currentTab, cb.dataset.colId, cb.checked);
    });
  });

  updateColumnsBadge();
}

function setActiveTab(tab) {
  activeTab = tab;
  updateColumnsBadge();
  renderColumnsDropdown();
}

function renderBottomPanel() {
  const wrap = document.getElementById('bottom-table-wrap');
  if(!wrap) return;
  const searchInput = document.getElementById('table-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const btnDev = document.getElementById('table-btn-add-device');
  const btnQP = document.getElementById('table-btn-add-placement');
  const btnConn = document.getElementById('table-btn-add-conn');
  
  updateColumnsBadge();

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
  wrap = wrap || document.getElementById('bottom-table-wrap');
  if (!wrap) return;
  const devices = store._raw.devices.filter(d => {
    if (!query) return true;
    return [d.name, d.ip, d.mac, d.serial, d.type, d.user, d.pass, d.brand, d.model, d.notes, d.skin, d.size].join(' ').toLowerCase().includes(query);
  });
  if (!devices.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon" style="color:var(--text-muted); width:48px; height:48px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">${typeof SVG_ICONS !== 'undefined' && SVG_ICONS['nas'] ? SVG_ICONS['nas'] : ''}</div><p>No hay equipos instalados.</p></div>`;
    return;
  }

  const colMap = {
    rack: {
      th: '<th>Rack</th>',
      td: (d, isFloor, rack) => `<td>${isFloor ? '<span style="color:var(--accent);font-weight:600">PISO</span>' : escapeHTML(rack?.name || '-')}</td>`
    },
    slot: {
      th: '<th>U</th>',
      td: (d, isFloor) => `<td>${isFloor ? '-' : (d.slotStart || '-')}</td>`
    },
    side: {
      th: '<th>Lado</th>',
      td: (d, isFloor) => {
        const sideDisplay = isFloor ? '-' : (d.mountSide === 'both' ? 'Dual' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal'));
        const sideStyle = (!isFloor && d.mountSide === 'both') ? 'border-color: rgba(56,189,248,0.5); background: rgba(56,189,248,0.15); color: #38bdf8;' : '';
        return `<td><span style="font-size:11px;opacity:0.8;border:1px solid rgba(255,255,255,0.1);padding:2px 6px;border-radius:10px; ${sideStyle}">${sideDisplay}</span></td>`;
      }
    },
    name: {
      th: '<th>Nombre</th>',
      td: (d) => `<td class="editable" data-field="name" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.name)}</td>`
    },
    brand: {
      th: '<th>Marca</th>',
      td: (d) => `<td class="editable" data-field="brand" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.brand) || '-'}</td>`
    },
    model: {
      th: '<th>Modelo</th>',
      td: (d) => `<td class="editable" data-field="model" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.model) || '-'}</td>`
    },
    type: {
      th: '<th>Tipo</th>',
      td: (d) => `<td><span class="type-badge ${escapeHTML(d.type)}">${escapeHTML(d.type)}</span></td>`
    },
    size: {
      th: '<th>Tamaño</th>',
      td: (d, isFloor) => `<td class="${isFloor ? '' : 'editable'}" data-field="size" data-dev="${escapeHTML(d.id)}">${isFloor ? '-' : (d.size ? `${d.size}U` : '1U')}</td>`
    },
    ip: {
      th: '<th>IP</th>',
      td: (d) => `<td class="editable" data-field="ip" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.ip) || '-'}</td>`
    },
    mac: {
      th: '<th>MAC</th>',
      td: (d) => `<td class="editable" data-field="mac" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.mac) || '-'}</td>`
    },
    serial: {
      th: '<th>Serie</th>',
      td: (d) => `<td class="editable" data-field="serial" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.serial) || '-'}</td>`
    },
    user: {
      th: '<th>Usuario</th>',
      td: (d) => `<td class="editable" data-field="user" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.user) || '-'}</td>`
    },
    pass: {
      th: '<th>Contraseña</th>',
      td: (d) => `<td class="editable" data-field="pass" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.pass ? (window.SHOW_PASSWORDS ? d.pass : '••••••••') : '-')}</td>`
    },
    power: {
      th: '<th>Consumo (W)</th>',
      td: (d) => `<td class="editable" data-field="power" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.power)) || 0}</td>`
    },
    plugs: {
      th: '<th>Tomas</th>',
      td: (d) => `<td class="editable" data-field="plugs" data-dev="${escapeHTML(d.id)}">${escapeHTML(String(d.plugs ?? 1))}</td>`
    },
    skin: {
      th: '<th>Skin</th>',
      td: (d) => `<td class="editable" data-field="skin" data-dev="${escapeHTML(d.id)}">${escapeHTML(d.skin || 'default')}</td>`
    },
    notes: {
      th: '<th>Notas</th>',
      td: (d) => `<td class="editable" data-field="notes" data-dev="${escapeHTML(d.id)}" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHTML(d.notes || '')}">${escapeHTML(d.notes || '-')}</td>`
    },
    actions: {
      th: '<th>Acciones</th>',
      td: (d) => `<td style="white-space:nowrap;">
        <button class="tbl-action" data-edit-dev="${escapeHTML(d.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar"><i class="svg-icon icon-edit" style="width:12px; height:12px;"></i></button>
        <button class="tbl-action" data-del-dev="${escapeHTML(d.id)}" style="padding:4px 8px" title="Eliminar"><i class="svg-icon icon-trash" style="width:12px; height:12px;"></i></button>
      </td>`
    }
  };

  const visibleCols = INVENTORY_COLUMNS.filter(c => isColumnVisible('inventory', c.id));
  const theadHtml = `<thead><tr>${visibleCols.map(c => colMap[c.id].th).join('')}</tr></thead>`;
  const tbodyHtml = `<tbody>${devices.map(d => {
    const isFloor = d.category === 'floor';
    const rack = !isFloor ? store.rackById(d.rackId) : null;
    return `<tr data-dev-id="${escapeHTML(d.id)}">${visibleCols.map(c => colMap[c.id].td(d, isFloor, rack)).join('')}</tr>`;
  }).join('')}</tbody>`;

  wrap.innerHTML = `<table class="data-table">
    ${theadHtml}
    ${tbodyHtml}
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
  const allowedFields = ['name', 'brand', 'model', 'ip', 'mac', 'serial', 'user', 'pass', 'power', 'plugs', 'size', 'skin', 'notes'];
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
  let parsedVal = val;
  if (field === 'power' || field === 'plugs') {
    parsedVal = parseInt(val) || 0;
  } else if (field === 'size') {
    parsedVal = Math.max(1, parseInt(val) || 1);
  }
  store.updateDevice(devId, { [field]: parsedVal });
  if (field === 'pass') {
    td.textContent = val ? (window.SHOW_PASSWORDS ? val : '••••••••') : '-';
  } else if (field === 'size') {
    td.textContent = parsedVal + 'U';
  } else if (field === 'notes') {
    td.textContent = val || '-';
    td.title = val || '';
  } else {
    td.textContent = val || '-';
  }
}

function renderConnectionsTable(wrap, query) {
  wrap = wrap || document.getElementById('bottom-table-wrap');
  if (!wrap) return;
  const conns = store._raw.connections.filter(c => {
    if (!query) return true;
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    const vlanStr = `vlan ${c.vlanId || 1} ${c.vlanName || ''}`;
    return [src?.name, dst?.name, c.cableType, c.sourcePort, c.targetPort, vlanStr].join(' ').toLowerCase().includes(query);
  });
  if (!conns.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon" style="color:var(--text-muted); width:48px; height:48px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">${typeof SVG_ICONS !== 'undefined' && SVG_ICONS['patchpanel'] ? SVG_ICONS['patchpanel'] : ''}</div><p>No hay conexiones de red registradas.</p></div>`;
    return;
  }

  const colConnMap = {
    srcLocation: {
      th: '<th>Sala/Rack Origen</th>',
      td: (c, src) => `<td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(src))}</span></td>`
    },
    srcDevice: {
      th: '<th>Origen</th>',
      td: (c, src) => `<td><span class="type-badge ${escapeHTML(src?.type||'')}">${escapeHTML(src?.name||'?')}</span></td>`
    },
    sourcePort: {
      th: '<th>Puerto Origen</th>',
      td: (c) => `<td><strong>${escapeHTML(c.sourcePort)}</strong></td>`
    },
    dstLocation: {
      th: '<th>Sala/Rack Destino</th>',
      td: (c, src, dst) => `<td><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(getDeviceLocation(dst))}</span></td>`
    },
    dstDevice: {
      th: '<th>Destino</th>',
      td: (c, src, dst) => `<td><span class="type-badge ${escapeHTML(dst?.type||'')}">${escapeHTML(dst?.name||'?')}</span></td>`
    },
    targetPort: {
      th: '<th>Puerto Destino</th>',
      td: (c) => `<td><strong>${escapeHTML(c.targetPort)}</strong></td>`
    },
    vlan: {
      th: '<th>VLAN</th>',
      td: (c) => {
        const vId = c.vlanId !== undefined ? Number(c.vlanId) : 1;
        const vObj = typeof store.getVlanById === 'function' ? store.getVlanById(vId) : null;
        const vColor = vObj ? vObj.color : '#64748b';
        const vName = c.vlanName || (vObj ? vObj.name : `VLAN ${vId}`);
        return `<td><span class="vlan-pill" style="background:${vColor}22; border-color:${vColor}; color:${vColor};">VLAN ${vId} · ${escapeHTML(vName)}</span></td>`;
      }
    },
    cableType: {
      th: '<th>Tipo Cable</th>',
      td: (c) => `<td>${escapeHTML(c.cableType)}</td>`
    },
    color: {
      th: '<th>Color</th>',
      td: (c) => `<td><span class="cable-dot" style="background:${escapeHTML(c.color)};box-shadow:0 0 4px ${escapeHTML(c.color)}"></span> ${escapeHTML(c.color)}</td>`
    },
    actions: {
      th: '<th>Acciones</th>',
      td: (c) => `<td style="white-space:nowrap;">
        <button class="tbl-action" data-edit-conn="${escapeHTML(c.id)}" style="border-color:var(--accent);color:var(--accent);padding:4px 8px" title="Editar"><i class="svg-icon icon-edit" style="width:12px; height:12px;"></i></button>
        <button class="tbl-action" data-del-conn="${escapeHTML(c.id)}" style="padding:4px 8px" title="Eliminar"><i class="svg-icon icon-trash" style="width:12px; height:12px;"></i></button>
      </td>`
    }
  };

  const visibleConnCols = CONNECTIONS_COLUMNS.filter(c => isColumnVisible('connections', c.id));
  const theadHtml = `<thead><tr>${visibleConnCols.map(c => colConnMap[c.id].th).join('')}</tr></thead>`;
  const tbodyHtml = `<tbody>${conns.map(c => {
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    return `<tr>${visibleConnCols.map(col => colConnMap[col.id].td(c, src, dst)).join('')}</tr>`;
  }).join('')}</tbody>`;

  wrap.innerHTML = `<table class="data-table">
    ${theadHtml}
    ${tbodyHtml}
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
  const data = [['Rack / Ubicación', 'Unidad U', 'Lado', 'Nombre', 'Marca', 'Modelo', 'Tipo', 'Tamaño', 'IP', 'MAC', 'Serie', 'Usuario', 'Contraseña', 'Consumo (W)', 'Tomas', 'Skin', 'Notas']];
  store._raw.devices.forEach(d => {
    const isFloor = d.category === 'floor';
    const rack = !isFloor ? store.rackById(d.rackId) : null;
    const passDisplay = d.pass ? (window.SHOW_PASSWORDS ? d.pass : '••••••••') : '';
    data.push([
      isFloor ? 'PISO' : (rack?.name || ''), 
      isFloor ? '-' : (d.slotStart || ''), 
      isFloor ? '-' : (d.mountSide === 'both' ? 'Dual' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal')),
      d.name, d.brand||'', d.model||'', d.type, d.size ? `${d.size}U` : '1U', d.ip, d.mac, d.serial, d.user, passDisplay, d.power, d.plugs ?? 1, d.skin || 'default', d.notes || ''
    ]);
  });
  return data;
}

function getConnectionsData() {
  const data = [['Sala/Rack Origen', 'Origen', 'Puerto Origen', 'Sala/Rack Destino', 'Destino', 'Puerto Destino', 'VLAN', 'Tipo Cable', 'Color']];
  store._raw.connections.forEach(c => {
    const src = store.deviceById(c.sourceDeviceId);
    const dst = store.deviceById(c.targetDeviceId);
    data.push([getDeviceLocation(src), src?.name||'?', c.sourcePort, getDeviceLocation(dst), dst?.name||'?', c.targetPort, `VLAN ${c.vlanId || 1} (${c.vlanName || 'Default'})`, c.cableType, c.color]);
  });
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCsv = document.getElementById('btn-table-csv');
  const btnExcel = document.getElementById('btn-table-excel');
  const btnExportMenu = document.getElementById('btn-export-menu');
  const exportDropdown = document.getElementById('export-dropdown');

  const btnColsMenu = document.getElementById('btn-columns-menu');
  const colsDropdown = document.getElementById('columns-dropdown');
  const btnColsClose = document.getElementById('btn-cols-close');
  const btnColsShowAll = document.getElementById('btn-cols-show-all');
  const btnColsReset = document.getElementById('btn-cols-reset');

  if (btnColsMenu && colsDropdown) {
    btnColsMenu.addEventListener('click', e => {
      e.stopPropagation();
      if (exportDropdown) exportDropdown.classList.add('hidden');
      renderColumnsDropdown();
      colsDropdown.classList.toggle('hidden');
    });
    colsDropdown.addEventListener('click', e => {
      e.stopPropagation();
    });
    if (btnColsClose) {
      btnColsClose.addEventListener('click', e => {
        e.stopPropagation();
        colsDropdown.classList.add('hidden');
      });
    }
    document.addEventListener('click', e => {
      if (!btnColsMenu.contains(e.target) && !colsDropdown.contains(e.target)) {
        colsDropdown.classList.add('hidden');
      }
    });
  }

  if (btnColsShowAll) {
    btnColsShowAll.addEventListener('click', () => {
      showAllTableColumns(activeTab === 'inventory' ? 'inventory' : 'connections');
    });
  }

  if (btnColsReset) {
    btnColsReset.addEventListener('click', () => {
      resetTableColumns(activeTab === 'inventory' ? 'inventory' : 'connections');
    });
  }

  if (btnExportMenu && exportDropdown) {
    btnExportMenu.addEventListener('click', e => {
      e.stopPropagation();
      if (colsDropdown) colsDropdown.classList.add('hidden');
      exportDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', e => {
      if (!btnExportMenu.contains(e.target)) {
        exportDropdown.classList.add('hidden');
      }
    });
  }
  
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
      
      XLSX.writeFile(wb, 'Rack_Designer_Next_Completo.xlsx');
      notify('Excel exportado con éxito', 'success');
    });
  }

  updateColumnsBadge();
});

