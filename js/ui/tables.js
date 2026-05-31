import { store } from '../store.js';
import { notify } from '../utils.js';
import { openEditDeviceModal } from './modals.js';

export let activeTab = 'inventory';
export function setActiveTab(tab) {
  activeTab = tab;
}

export function renderBottomPanel() {
  const wrap = document.getElementById('bottom-table-wrap');
  if(!wrap) return;
  const searchInput = document.getElementById('table-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const btnDev = document.getElementById('table-btn-add-device');
  const btnConn = document.getElementById('table-btn-add-conn');
  
  if (activeTab === 'inventory') {
    if (btnDev) btnDev.style.display = 'block';
    if (btnConn) btnConn.style.display = 'none';
    renderInventoryTable(wrap, query);
  } else {
    if (btnDev) btnDev.style.display = 'none';
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
      <th>Rack</th><th>U</th><th>Nombre</th><th>Tipo</th><th>IP</th>
      <th>MAC</th><th>Serie</th><th>Usuario</th><th>Contraseña</th><th>Consumo (W)</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${devices.map(d => {
      const rack = store.rackById(d.rackId);
      return `<tr data-dev-id="${d.id}">
        <td>${rack?.name || '-'}</td>
        <td>${d.slotStart}</td>
        <td class="editable" data-field="name" data-dev="${d.id}">${d.name}</td>
        <td><span class="type-badge ${d.type}">${d.type}</span></td>
        <td class="editable" data-field="ip"  data-dev="${d.id}">${d.ip  || '-'}</td>
        <td class="editable" data-field="mac" data-dev="${d.id}">${d.mac || '-'}</td>
        <td class="editable" data-field="serial" data-dev="${d.id}">${d.serial || '-'}</td>
        <td class="editable" data-field="user" data-dev="${d.id}">${d.user || '-'}</td>
        <td class="editable" data-field="pass" data-dev="${d.id}">${d.pass || '-'}</td>
        <td class="editable" data-field="power" data-dev="${d.id}">${d.power || 0}</td>
        <td>
          <button class="tbl-action" data-del-dev="${d.id}">✕ Eliminar</button>
          <button class="tbl-action" data-edit-dev="${d.id}" style="border-color:var(--accent);color:var(--accent)">✎ Editar</button>
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
  const orig  = td.textContent.trim() === '-' ? '' : td.textContent.trim();
  td.innerHTML = `<input class="cell-edit" value="${orig}" data-field="${field}" data-dev="${devId}">`;
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
  if (field === 'ip') {
    if (val && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val)) {
      input.classList.add('error');
      notify('IP inválida. Formato: 0-255.0-255.0-255.0-255', 'error');
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
  store.updateDevice(devId, { [field]: field === 'power' ? parseInt(val) || 0 : val });
  td.textContent = val || '-';
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
      <th>Origen</th><th>Puerto Origen</th><th>Destino</th><th>Puerto Destino</th>
      <th>Tipo Cable</th><th>Color</th><th>Acciones</th>
    </tr></thead>
    <tbody>
    ${conns.map(c => {
      const src = store.deviceById(c.sourceDeviceId);
      const dst = store.deviceById(c.targetDeviceId);
      return `<tr>
        <td><span class="type-badge ${src?.type||''}">${src?.name||'?'}</span></td>
        <td>${c.sourcePort}</td>
        <td><span class="type-badge ${dst?.type||''}">${dst?.name||'?'}</span></td>
        <td>${c.targetPort}</td>
        <td>${c.cableType}</td>
        <td><span class="cable-dot" style="background:${c.color};box-shadow:0 0 4px ${c.color}"></span> ${c.color}</td>
        <td><button class="tbl-action" data-del-conn="${c.id}">✕ Eliminar</button></td>
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
}
