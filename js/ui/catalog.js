let CATALOG = [
  { id:'c1', name:'Server HP ProLiant', type:'server',     size:2, power:460, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/server/server.svg', color:'#10b981' },
  { id:'c2', name:'Server Dell R740',   type:'server',     size:2, power:550, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/server/server.svg', color:'#10b981' },
  { id:'c3', name:'Server 1U',          type:'server',     size:1, power:200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/server/server.svg', color:'#10b981' },
  { id:'c4', name:'Switch Cisco 48P',   type:'switch',     size:1, power:180, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/network/switch.svg', color:'#10b981' },
  { id:'c5', name:'Switch Managed 24P', type:'switch',     size:1, power:120, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/network/switch.svg', color:'#10b981' },
  { id:'c6', name:'Router Core',        type:'router',     size:1, power:90,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/network/router.svg', color:'#f59e0b' },
  { id:'c7', name:'Firewall Fortinet',  type:'firewall',   size:1, power:40,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/network/firewall.svg', color:'#ef4444' },
  { id:'c8', name:'Access Point Wifi',  type:'ap',         size:0, power:20,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/network/ap.svg', color:'#10b981' },
  { id:'c9', name:'SAN Storage 4U',     type:'storage',    size:4, power:300, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/storage/san.svg', color:'#06b6d4' },
  { id:'c10',name:'NAS 2U',             type:'storage',    size:2, power:150, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/storage/nas.svg', color:'#06b6d4' },
  { id:'c11',name:'Patch Panel 24P',    type:'gestion', size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/wiring/patchpanel.svg', color:'#38bdf8' },
  { id:'c12',name:'Organizador Horiz',  type:'accesorios', size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/wiring/organizer.svg', color:'#94a3b8' },
  { id:'c13',name:'UPS APC 2U',         type:'energia',        size:2, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/power/ups.svg', color:'#8b5cf6' },
  { id:'c14',name:'PDU Básica 1U',      type:'energia',        size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/power/pdu.svg', color:'#eab308' },
  { id:'c15',name:'Bandeja Fija',       type:'accesorios', size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/accessories/tray.svg', color:'#64748b' },
  { id:'c16',name:'Consola KVM 1U',     type:'gestion',        size:1, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/accessories/kvm.svg', color:'#ec4899' },
  { id:'c17',name:'PC Desktop',         type:'pc',         size:0, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/pc.svg', color:'#0ea5e9' },
  { id:'c18',name:'Cámara IP',          type:'camera',     size:0, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/camera.svg', color:'#8b5cf6' },
  { id:'c19',name:'Controlador Puerta', type:'door',       size:0, power:30,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/door.svg', color:'#f59e0b' },
  { id:'c20',name:'Impresora Red',      type:'printer',    size:0, power:350, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/printer.svg', color:'#06b6d4' },
  { id:'c21',name:'Teléfono VoIP',      type:'phone',      size:0, power:10,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/phone.svg', color:'#ef4444' }
];

const TYPE_COLORS = { 
  server:'#10b981', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', 
  storage:'#06b6d4', gestion:'#38bdf8', accesorios:'#94a3b8', 
  energia:'#eab308',  
  pc:'#0ea5e9', camera:'#8b5cf6', ap:'#10b981', door:'#f59e0b', 
  printer:'#06b6d4', phone:'#ef4444' 
};

function addCatalogItem(item) {
  CATALOG.push(item);
  renderCatalog();
}
function updateCatalogItem(id, props) {
  const c = CATALOG.find(x => x.id === id);
  if(c) Object.assign(c, props);
  renderCatalog();
}

const CATALOG_GROUPS = [
  { id: 'all', name: 'Todos los Equipos', types: null, icon: 'grid', color: '#0ea5e9' },
  { id: 'server', name: 'Servidores', types: ['server'], icon: 'server', color: '#10b981' },
  { id: 'network', name: 'Redes (Networking)', types: ['switch', 'router', 'firewall', 'ap', 'gestion'], icon: 'network', color: '#38bdf8' },
  { id: 'storage', name: 'Almacenamiento', types: ['storage'], icon: 'san', color: '#06b6d4' },
  { id: 'energia', name: 'Energía', types: ['energia'], icon: 'ups', color: '#eab308' },
  { id: 'accesorios', name: 'Accesorios', types: ['accesorios'], icon: 'tray', color: '#94a3b8' },
  { id: 'floor', name: 'Periféricos de Piso', types: ['pc', 'camera', 'door', 'printer', 'phone'], icon: 'pc', color: '#8b5cf6' }
];

let currentFlyoutCategory = null;

function renderCategoryIcons() {
  const container = document.getElementById('sidebar-category-icons');
  if (!container) return;
  
  container.innerHTML = CATALOG_GROUPS.map(group => {
    let svgIcon = '';
    if (typeof SVG_ICONS !== 'undefined' && SVG_ICONS[group.icon]) {
      svgIcon = SVG_ICONS[group.icon];
    } else {
      svgIcon = `<i class="svg-icon icon-${group.icon}"></i>`;
    }
    
    const isActive = currentFlyoutCategory === group.id;
    return `
      <div class="sb-category-btn ${isActive ? 'active' : ''}" 
           data-category="${escapeHTML(group.id)}" 
           title="${escapeHTML(group.name).toUpperCase()}"
           style="color: ${group.color}">
        <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">
          ${svgIcon}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.sb-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      if (currentFlyoutCategory === cat) {
        closeFlyout();
      } else {
        openFlyout(cat);
      }
    });
  });
}

function openFlyout(category) {
  document.documentElement.style.setProperty('--sidebar-w', '260px');
  setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  currentFlyoutCategory = category;
  const flyout = document.getElementById('catalog-flyout');
  const title = document.getElementById('flyout-title');
  const group = CATALOG_GROUPS.find(g => g.id === category);
  if (title) title.textContent = group ? group.name.toUpperCase() : category.toUpperCase();
  if (flyout) flyout.classList.remove('hidden');
  renderCategoryIcons();
  renderCatalog();
}

function closeFlyout() {
  document.documentElement.style.setProperty('--sidebar-w', '50px');
  setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  currentFlyoutCategory = null;
  const flyout = document.getElementById('catalog-flyout');
  if(flyout) flyout.classList.add('hidden');
  renderCategoryIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('btn-close-flyout');
  if(closeBtn) closeBtn.addEventListener('click', closeFlyout);
  
  const searchInput = document.getElementById('catalog-search');
  if(searchInput) searchInput.addEventListener('input', renderCatalog);
  renderCategoryIcons();
});

function renderCatalog() {
  const searchInput = document.getElementById('catalog-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const activeGroupId = currentFlyoutCategory || 'all';
  const group = CATALOG_GROUPS.find(g => g.id === activeGroupId);
  
  const list = CATALOG.filter(item => {
    const matchType = !group || !group.types || group.types.includes(item.type);
    const matchQuery = !query || 
      item.name.toLowerCase().includes(query) || 
      item.type.toLowerCase().includes(query);
    return matchType && matchQuery;
  });
  
  const cat = document.getElementById('catalog');
  if(!cat) return;

  if (list.length === 0) {
    cat.innerHTML = `<div style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:12px;">No se encontraron equipos para "${escapeHTML(query)}"</div>`;
    return;
  }

  cat.innerHTML = list.map(item => {
    const iconName = item.icon.split('/').pop().split('.')[0];
    return `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22; display:flex; align-items:center; justify-content:center;">
        <div style="color:${TYPE_COLORS[item.type]}; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">${typeof SVG_ICONS !== 'undefined' && SVG_ICONS[iconName] ? SVG_ICONS[iconName] : ''}</div>
      </div>
      <div class="cat-info">
        <div class="cat-name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
        <div class="cat-meta">${escapeHTML(item.type).toUpperCase()} │ ${escapeHTML(String(item.power))}W</div>
      </div>
      <div class="cat-size">${item.size ? item.size + 'U' : 'Piso'}</div>
      <div class="cat-actions" style="display:flex; align-items:center; margin-left:4px;">
        <button class="cat-btn menu" data-menu-cat="${item.id}" title="Opciones" style="font-size:16px; cursor:pointer; background:none; border:none; color:var(--text-muted); padding: 4px;">⋮</button>
      </div>
    </div>
  `}).join('');
  
  cat.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', onCatalogDragStart);
    el.addEventListener('dragend',   onCatalogDragEnd);
    el.addEventListener('dblclick', () => {
      if (RackAuth.can('editDevices')) {
        openQuickPlacementModal(el.dataset.catalogId);
      } else {
        notify('Espectadores no pueden editar dispositivos.', 'error', 3000);
      }
    });
  });

  cat.querySelectorAll('.cat-btn.menu').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const catId = btn.dataset.menuCat;
      const menu = document.getElementById('ctx-menu');
      if(!menu) return;
      menu.innerHTML = `
        <div class="ctx-item" data-action="cat-place" data-id="${escapeHTML(catId)}"><i class="svg-icon icon-bolt" style="width:14px; height:14px; margin-right:6px;"></i>Ubicación Rápida</div>
        <div class="ctx-item" data-action="cat-edit" data-id="${escapeHTML(catId)}"><i class="svg-icon icon-edit" style="width:14px; height:14px; margin-right:6px;"></i>Editar plantilla</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item danger" data-action="cat-delete" data-id="${escapeHTML(catId)}"><i class="svg-icon icon-trash" style="width:14px; height:14px; margin-right:6px;"></i>Eliminar plantilla</div>
      `;
      menu.style.cssText = `left:${e.clientX}px; top:${e.clientY}px`;
      menu.classList.remove('hidden');

      menu.querySelectorAll('.ctx-item').forEach(item => {
        item.addEventListener('click', async e => {
          e.stopPropagation();
          menu.classList.add('hidden');
          const id = item.dataset.id;
          
          if (!RackAuth.can('editDevices')) {
            notify('Solo editores pueden modificar dispositivos.', 'error', 3000);
            return;
          }

          if (item.dataset.action === 'cat-place') openQuickPlacementModal(id);
          if (item.dataset.action === 'cat-edit') openEditCatalogModal(id);
          if (item.dataset.action === 'cat-delete') {
            const ok = await customConfirm('Eliminar Plantilla', '¿Eliminar plantilla del catálogo?');
            if(ok) {
              const remaining = CATALOG.filter(c => c.id !== id);
              CATALOG.length = 0;
              CATALOG.push(...remaining);
              renderCatalog();
            }
          }
        });
      });
    });
  });
}
function renderRoomTabs() {
  const dropdownList = document.getElementById('room-dropdown-list');
  const label = document.getElementById('room-dropdown-label');
  if(!dropdownList || !label) return;

  const currentRoom = store._raw.rooms.find(r => r.id === store._raw.currentRoomId) || store._raw.rooms[0];
  
  // Update label text
  label.textContent = currentRoom ? currentRoom.name : 'Salas';

  // Render dropdown list
  dropdownList.innerHTML = store._raw.rooms.map(r => `
    <div class="room-tab ${r.id === store._raw.currentRoomId ? 'active' : ''}" data-room-id="${escapeHTML(r.id)}" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:6px; cursor:pointer;">
      <span class="status-dot-nav ${r.id === store._raw.currentRoomId ? 'active' : ''}"></span>
      <span class="room-tab-name" data-select-room="${escapeHTML(r.id)}" style="flex:1; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(r.name)}</span>
      <div style="display:flex; align-items:center; gap:4px;">
        <button class="room-edit-btn" data-edit-room="${escapeHTML(r.id)}" title="Editar sala" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:2px 4px; font-size:12px; border-radius:3px;">✏️</button>
        ${store._raw.rooms.length > 1 ? `<span class="close-btn" data-del-room="${escapeHTML(r.id)}" title="Eliminar sala">✕</span>` : ''}
      </div>
    </div>
  `).join('');

  // Attach events
  dropdownList.querySelectorAll('.room-tab').forEach(tab => {
    tab.addEventListener('click', async e => {
      if (e.target.dataset.delRoom) { 
        await deleteRoom(e.target.dataset.delRoom); 
        return; 
      }
      if (e.target.dataset.editRoom || e.target.closest('.room-edit-btn')) {
        const editBtn = e.target.closest('.room-edit-btn');
        const rId = editBtn ? editBtn.dataset.editRoom : e.target.dataset.editRoom;
        if (typeof openEditRoomModal === 'function') openEditRoomModal(rId);
        dropdownList.classList.add('hidden');
        return;
      }
      store.setCurrentRoom(tab.dataset.roomId);
      dropdownList.classList.add('hidden');
    });
    
    const editRoom = (e) => {
      if (e.target.dataset.delRoom) return;
      e.preventDefault();
      const roomId = tab.dataset.roomId;
      if (typeof openEditRoomModal === 'function') {
        openEditRoomModal(roomId);
        dropdownList.classList.add('hidden');
      }
    };
    tab.addEventListener('dblclick', editRoom);
    tab.addEventListener('contextmenu', editRoom);
  });
}

function renderRackSelector() {
  try {
  const dropdownList = document.getElementById('rack-dropdown-list');
  const label = document.getElementById('rack-dropdown-label');
  if(!dropdownList || !label) return;

  const racks = store._raw.racks.filter(r => r.roomId === store._raw.currentRoomId);
  
  if (racks.length === 0) {
    label.textContent = 'Sin Racks';
    dropdownList.innerHTML = '';
    return;
  }

  // Update label text
  label.textContent = `Racks (${racks.length})`;

  dropdownList.innerHTML = racks.map(r => `
    <button class="room-tab" data-target-rack="${escapeHTML(r.id)}">
      <span class="status-dot-nav"></span> ${escapeHTML(r.name)}
    </button>
  `).join('');

  dropdownList.querySelectorAll('.room-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const targetId = btn.dataset.targetRack;
      const el = document.querySelector(`.rack-wrapper[data-rack-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
        el.style.boxShadow = '0 0 20px var(--accent)';
        setTimeout(() => { el.style.boxShadow = ''; }, 1500);
      }
      dropdownList.classList.add('hidden');
      const rackName = store._raw.racks.find(r => r.id === targetId)?.name || 'Rack';
      label.textContent = rackName;
    });
  });
  } catch(e) { console.error('[renderRackSelector] Error:', e); }
}

function renderStats() {
  const s = store.getGlobalStats();
  
  const elRooms = document.getElementById('stat-global-rooms');
  if(!elRooms) return;
  
  elRooms.textContent = s.totalRooms;
  document.getElementById('stat-global-racks').textContent = s.totalRacks;
  document.getElementById('stat-global-rack-devs').textContent = s.rackDevicesCount;
  document.getElementById('stat-global-floor-devs').textContent = s.floorDevicesCount;
  document.getElementById('stat-global-connections').textContent = s.totalConnections;
}
