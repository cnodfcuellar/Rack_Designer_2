let CATALOG = [
  { id:'c1', name:'Server HP ProLiant', type:'server',   size:2, power:460, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
  { id:'c2', name:'Server Dell R740',   type:'server',   size:2, power:550, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
  { id:'c3', name:'Server 1U',          type:'server',   size:1, power:200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖥', color:'#0ea5e9' },
  { id:'c4', name:'Switch Cisco 48P',   type:'switch',   size:1, power:180, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔀', color:'#10b981' },
  { id:'c5', name:'Switch Managed 24P', type:'switch',   size:1, power:120, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔀', color:'#10b981' },
  { id:'c6', name:'Router Core',        type:'router',   size:1, power:90,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🌐', color:'#f59e0b' },
  { id:'c7', name:'Firewall Fortinet',  type:'firewall', size:1, power:40,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔥', color:'#ef4444' },
  { id:'c8', name:'UPS APC 2U',         type:'ups',      size:2, power:0,   ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🔋', color:'#8b5cf6' },
  { id:'c9', name:'SAN Storage 4U',     type:'storage',  size:4, power:300, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💾', color:'#06b6d4' },
  { id:'c10',name:'NAS 2U',             type:'storage',  size:2, power:150, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💾', color:'#06b6d4' },
  { id:'c11', name:'PC Desktop',         type:'pc',       size:0, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'💻', color:'#0ea5e9' },
  { id:'c12', name:'Cámara IP',          type:'camera',   size:0, power:15,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📷', color:'#8b5cf6' },
  { id:'c13', name:'Access Point Wifi',  type:'ap',       size:0, power:20,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📶', color:'#10b981' },
  { id:'c14', name:'Controlador Puerta', type:'door',     size:0, power:30,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🚪', color:'#f59e0b' },
  { id:'c15', name:'Impresora Red',      type:'printer',  size:0, power:350, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'🖨️', color:'#06b6d4' },
  { id:'c16', name:'Teléfono VoIP',      type:'phone',    size:0, power:10,  ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'', icon:'📞', color:'#ef4444' },
];

const TYPE_COLORS = { server:'#0ea5e9', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', ups:'#8b5cf6', storage:'#06b6d4', pc:'#0ea5e9', camera:'#8b5cf6', ap:'#10b981', door:'#f59e0b', printer:'#06b6d4', phone:'#ef4444' };

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
      (filter === 'server'  && item.type === 'server') ||
      (filter === 'switch'  && ['switch','router','firewall'].includes(item.type)) ||
      (filter === 'storage' && ['storage','ups'].includes(item.type)) ||
      (filter === 'floor'   && ['pc','camera','ap','door','printer','phone'].includes(item.type));
    const matchQuery = !query || item.name.toLowerCase().includes(query) || item.type.includes(query);
    return matchType && matchQuery;
  });
  
  const cat = document.getElementById('catalog');
  cat.innerHTML = list.map(item => `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}"
         style="border-left: 3px solid ${TYPE_COLORS[item.type]||'#444'}">
      <div class="cat-icon" style="background:${TYPE_COLORS[item.type]}22;color:${TYPE_COLORS[item.type]}">${escapeHTML(item.icon)}</div>
      <div class="cat-info">
        <div class="cat-name">${escapeHTML(item.name)}</div>
        <div class="cat-meta">${escapeHTML(item.type).toUpperCase()} │ ${escapeHTML(String(item.power))}W</div>
      </div>
      <div class="cat-size">${item.size ? item.size + 'U' : 'Piso'}</div>
      <div class="cat-actions" style="display:flex; flex-direction:column; gap:2px; margin-left:4px;">
        <button class="cat-btn place" data-place-cat="${item.id}" title="Ubicación Rápida" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--accent)">⚡</button>
        <button class="cat-btn edit" data-edit-cat="${item.id}" title="Editar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--text-muted)">✎</button>
        <button class="cat-btn del" data-del-cat="${item.id}" title="Eliminar" style="font-size:10px; cursor:pointer; background:none; border:none; color:var(--red)">🗑</button>
      </div>
    </div>
  `).join('');
  
  cat.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', onCatalogDragStart);
    el.addEventListener('dragend',   onCatalogDragEnd);
    el.addEventListener('dblclick', () => {
      openQuickPlacementModal(el.dataset.catalogId);
    });
  });

  cat.querySelectorAll('.cat-btn.place').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickPlacementModal(btn.dataset.placeCat);
    });
  });
  
  cat.querySelectorAll('.cat-btn.edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditCatalogModal(btn.dataset.editCat);
    });
  });
  
  cat.querySelectorAll('.cat-btn.del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if(confirm('¿Eliminar plantilla del catálogo?')) {
        CATALOG = CATALOG.filter(c => c.id !== btn.dataset.delCat);
        renderCatalog();
      }
    });
  });
}

function renderRoomTabs() {
  const tabs = document.getElementById('room-tabs');
  if(!tabs) return;
  tabs.innerHTML = store._raw.rooms.map(r => `
    <button class="room-tab ${r.id === store._raw.currentRoomId ? 'active' : ''}" data-room-id="${escapeHTML(r.id)}">
      🏢 ${escapeHTML(r.name)}
      ${store._raw.rooms.length > 1 ? `<span class="close-btn" data-del-room="${escapeHTML(r.id)}">✕</span>` : ''}
    </button>
  `).join('');
  tabs.querySelectorAll('.room-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.dataset.delRoom) { deleteRoom(e.target.dataset.delRoom); return; }
      store._raw.currentRoomId = btn.dataset.roomId;
      store._emit('change', { source: 'changeRoom' });
    });
    
    btn.addEventListener('dblclick', e => {
      if (e.target.dataset.delRoom) return;
      const roomId = btn.dataset.roomId;
      const room = store._raw.rooms.find(r => r.id === roomId);
      if (room) {
        const newName = prompt('Editar nombre de la sala:', room.name);
        if (newName !== null && newName.trim() !== '') {
          room.name = newName.trim();
          store._emit('change', { source: 'room-rename' });
          notify('Sala renombrada a ' + room.name, 'success');
        }
      }
    });
  });
}

function renderStats() {
  const s = store.getStats();
  const elRacks = document.getElementById('stat-racks');
  if(!elRacks) return;
  
  elRacks.textContent = s.racks;
  document.getElementById('stat-devices').textContent = s.devices;
  document.getElementById('stat-units').textContent = `${s.usedU}/${s.totalU}`;
  document.getElementById('stat-connections').textContent = s.connections;
  
  const rackPct = s.totalU ? Math.round((s.usedU / s.totalU) * 100) : 0;
  document.getElementById('cap-rack-pct').textContent = `${rackPct}%`;
  document.getElementById('cap-rack-bar').style.width = `${rackPct}%`;
  
  const maxPower = 5000;
  const powerPct = Math.min(100, Math.round((s.power / maxPower) * 100));
  document.getElementById('cap-power-val').textContent = `${s.power} W`;
  document.getElementById('cap-power-bar').style.width = `${powerPct}%`;
}
