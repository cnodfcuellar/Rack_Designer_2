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
  { id:'c11',name:'Patch Panel 24P',    type:'patchpanel', size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/wiring/patchpanel.svg', color:'#38bdf8' },
  { id:'c12',name:'Organizador Horiz',  type:'organizer',  size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/wiring/organizer.svg', color:'#94a3b8' },
  { id:'c13',name:'UPS APC 2U',         type:'ups',        size:2, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/power/ups.svg', color:'#8b5cf6' },
  { id:'c14',name:'PDU Básica 1U',      type:'pdu',        size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/power/pdu.svg', color:'#eab308' },
  { id:'c15',name:'Bandeja Fija',       type:'tray',       size:1, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/accessories/tray.svg', color:'#64748b' },
  { id:'c16',name:'Consola KVM 1U',     type:'kvm',        size:1, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/accessories/kvm.svg', color:'#ec4899' },
  { id:'c17',name:'PC Desktop',         type:'pc',         size:0, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/pc.svg', color:'#0ea5e9' },
  { id:'c18',name:'Cámara IP',          type:'camera',     size:0, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/camera.svg', color:'#8b5cf6' },
  { id:'c19',name:'Controlador Puerta', type:'door',       size:0, power:30,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/door.svg', color:'#f59e0b' },
  { id:'c20',name:'Impresora Red',      type:'printer',    size:0, power:350, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/printer.svg', color:'#06b6d4' },
  { id:'c21',name:'Teléfono VoIP',      type:'phone',      size:0, power:10,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'assets/icons/floor/phone.svg', color:'#ef4444' }
];

const TYPE_COLORS = { 
  server:'#10b981', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', 
  storage:'#06b6d4', patchpanel:'#38bdf8', organizer:'#94a3b8', 
  ups:'#8b5cf6', pdu:'#eab308', tray:'#64748b', kvm:'#ec4899', 
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

function renderCatalog() {
  const searchInput = document.getElementById('catalog-search');
  if(!searchInput) return;
  const query  = searchInput.value.toLowerCase();
  const filterBtn = document.querySelector('.filter-tab.active');
  const filter = filterBtn ? filterBtn.dataset.filter : 'all';
  
  const list = CATALOG.filter(item => {
    const matchType = filter === 'all' ||
      (filter === 'server'      && item.type === 'server') ||
      (filter === 'network'     && ['switch','router','firewall'].includes(item.type)) ||
      (filter === 'storage'     && ['storage'].includes(item.type)) ||
      (filter === 'wiring'      && ['patchpanel','organizer'].includes(item.type)) ||
      (filter === 'power'       && ['ups','pdu'].includes(item.type)) ||
      (filter === 'accessories' && ['tray','kvm'].includes(item.type)) ||
      (filter === 'floor'       && ['pc','camera','ap','door','printer','phone'].includes(item.type));
    const matchQuery = !query || item.name.toLowerCase().includes(query) || item.type.includes(query);
    return matchType && matchQuery;
  });
  
  const cat = document.getElementById('catalog');
  cat.innerHTML = list.map(item => {
    const iconName = item.icon.split('/').pop().split('.')[0];
    return `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22; display:flex; align-items:center; justify-content:center;">
        <div style="color:${TYPE_COLORS[item.type]}; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">${typeof SVG_ICONS !== 'undefined' && SVG_ICONS[iconName] ? SVG_ICONS[iconName] : ''}</div>
      </div>
      <div class="cat-info">
        <div class="cat-name">${escapeHTML(item.name)}</div>
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
        notify('🚫 Espectadores no pueden editar dispositivos.', 'error', 3000);
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
        <div class="ctx-item" data-action="cat-place" data-id="${escapeHTML(catId)}">⚡ Ubicación Rápida</div>
        <div class="ctx-item" data-action="cat-edit" data-id="${escapeHTML(catId)}">✎ Editar plantilla</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item danger" data-action="cat-delete" data-id="${escapeHTML(catId)}">🗑 Eliminar plantilla</div>
      `;
      menu.style.cssText = `left:${e.clientX}px; top:${e.clientY}px`;
      menu.classList.remove('hidden');

      menu.querySelectorAll('.ctx-item').forEach(item => {
        item.addEventListener('click', e => {
          e.stopPropagation();
          menu.classList.add('hidden');
          const id = item.dataset.id;
          
          if (!RackAuth.can('editDevices')) {
            notify('🚫 Solo editores pueden modificar dispositivos.', 'error', 3000);
            return;
          }

          if (item.dataset.action === 'cat-place') openQuickPlacementModal(id);
          if (item.dataset.action === 'cat-edit') openEditCatalogModal(id);
          if (item.dataset.action === 'cat-delete') {
            if(confirm('¿Eliminar plantilla del catálogo?')) {
              CATALOG = CATALOG.filter(c => c.id !== id);
              renderCatalog();
            }
          }
        });
      });
    });
  });
}

function renderRoomTabs() {
  const activeContainer = document.getElementById('room-tabs-active');
  const dropdownList = document.getElementById('room-dropdown-list');
  if(!activeContainer || !dropdownList) return;

  const currentRoom = store._raw.rooms.find(r => r.id === store._raw.currentRoomId) || store._raw.rooms[0];
  
  // Render active room
  activeContainer.innerHTML = `
    <button class="room-tab active" data-room-id="${escapeHTML(currentRoom.id)}">
      <span class="status-dot-nav active"></span> ${escapeHTML(currentRoom.name)}
    </button>
  `;

  // Render dropdown list
  dropdownList.innerHTML = store._raw.rooms.map(r => `
    <button class="room-tab ${r.id === store._raw.currentRoomId ? 'active' : ''}" data-room-id="${escapeHTML(r.id)}">
      <span class="status-dot-nav ${r.id === store._raw.currentRoomId ? 'active' : ''}"></span> ${escapeHTML(r.name)}
      ${store._raw.rooms.length > 1 ? `<span class="close-btn" data-del-room="${escapeHTML(r.id)}">✕</span>` : ''}
    </button>
  `).join('');

  // Attach events
  const attachEvents = (container) => {
    container.querySelectorAll('.room-tab').forEach(btn => {
      btn.addEventListener('click', e => {
        if (e.target.dataset.delRoom) { deleteRoom(e.target.dataset.delRoom); return; }
        store._raw.currentRoomId = btn.dataset.roomId;
        store._emit('change', { source: 'changeRoom' });
        dropdownList.classList.add('hidden'); // Close dropdown on select
      });
      
      const editRoom = (e) => {
        if (e.target.dataset.delRoom) return;
        e.preventDefault();
        const roomId = btn.dataset.roomId;
        const room = store._raw.rooms.find(r => r.id === roomId);
        if (room) {
          const newName = prompt('Editar nombre de la sala:', room.name);
          if (newName !== null && newName.trim() !== '') {
            store.snapshot();
            room.name = newName.trim();
            store._save();
            store._emit('change', { source: 'room-rename' });
            notify('Sala renombrada a ' + room.name, 'success');
          }
        }
      };
      btn.addEventListener('dblclick', editRoom);
      btn.addEventListener('contextmenu', editRoom);
    });
  };

  attachEvents(activeContainer);
  attachEvents(dropdownList);
}

function renderRackSelector() {
  try {
  const activeContainer = document.getElementById('rack-tabs-active');
  const dropdownList = document.getElementById('rack-dropdown-list');
  const dropdownWrapper = document.getElementById('rack-dropdown-wrapper');
  if(!activeContainer || !dropdownList || !dropdownWrapper) return;

  const racks = store._raw.racks.filter(r => r.roomId === store._raw.currentRoomId);
  
  if (racks.length === 0) {
    activeContainer.innerHTML = `<button class="room-tab" style="cursor:default; opacity:0.5;">Sin Racks</button>`;
    dropdownList.innerHTML = '';
    return;
  }

  // Por ahora, mostrar el primer rack de la lista como "activo" en la barra
  // (La selección de rack es solo visual para scrollear hacia él, no guarda un 'currentRackId' en el store actual)
  // Pero podemos simplemente mostrar "Racks (N)" o el primero.
  // En tu diseño dice [ • Rack101 ]. Asumiremos que muestra el primer rack por defecto o el último clickeado.
  // Para mantenerlo simple, mostraremos el texto "Seleccionar Rack" o el primer rack.
  const displayRack = racks[0];

  activeContainer.innerHTML = `
    <button class="room-tab active" data-rack-id="${escapeHTML(displayRack.id)}">
      <span class="status-dot-nav active"></span> Racks (${racks.length})
    </button>
  `;

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
        
        // Destacar el rack visualmente
        el.style.boxShadow = '0 0 20px var(--accent)';
        setTimeout(() => { el.style.boxShadow = ''; }, 1500);
      }
      dropdownList.classList.add('hidden');
      
      // Actualizar el texto del activo
      const rackName = store._raw.racks.find(r => r.id === targetId)?.name || 'Rack';
      activeContainer.innerHTML = `
        <button class="room-tab active">
          <span class="status-dot-nav active"></span> ${escapeHTML(rackName)}
        </button>
      `;
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
