const DEFAULT_CATALOG = [
  // 1. Cómputo (Servidores y Chasis)
  { id:'c-srv-1u', name:'Servidor Rack 1U (General)', type:'server', size:1, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Dual PSU, 4x 1GbE RJ45, 2x 10G SFP+', icon:'assets/icons/server/server.svg', color:'#10b981', ports:{ethernet:4, fiber:2} },
  { id:'c-srv-2u', name:'Servidor Rack 2U (Cómputo / Virtualización)', type:'server', size:2, power:500, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Dual Xeon/EPYC, 8x SFF, 4x 10GbE SFP+', icon:'assets/icons/server/server.svg', color:'#10b981', ports:{ethernet:4, fiber:4} },
  { id:'c-srv-4u', name:'Servidor Rack 4U (Misión Crítica / GPU)', type:'server', size:4, power:1200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Soporte Multi-GPU, 24x bahías SAS/NVMe', icon:'assets/icons/server/server.svg', color:'#10b981', ports:{ethernet:8, fiber:4} },
  { id:'c-srv-blade', name:'Chasis Blade 3U (Modular)', type:'server', size:3, power:900, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Bahías para servidores blade y switches modulares', icon:'assets/icons/server/server.svg', color:'#10b981', ports:{ethernet:8, fiber:4} },

  // 2. Redes y Comunicaciones (Networking activo)
  { id:'c-sw-24p', name:'Switch de Acceso 24P Gigabit (1U)', type:'switch', size:1, power:65, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'24x RJ45 10/100/1000 + 4x SFP Uplink', icon:'assets/icons/network/switch.svg', color:'#38bdf8', ports:{ethernet:24, fiber:4} },
  { id:'c-sw-48p', name:'Switch de Acceso 48P PoE+ (1U)', type:'switch', size:1, power:370, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'48x RJ45 PoE+ 802.3at + 4x SFP+ 10G', icon:'assets/icons/network/switch.svg', color:'#38bdf8', ports:{ethernet:48, fiber:4} },
  { id:'c-sw-core', name:'Switch Core / Distribución 2U (10G/40G)', type:'switch', size:2, power:450, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Chasis de alta densidad, backplane redundante', icon:'assets/icons/network/switch.svg', color:'#38bdf8', ports:{ethernet:24, fiber:16} },
  { id:'c-sw-agg', name:'Switch de Agregación 1U (Fibra SFP+)', type:'switch', size:1, power:150, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'24x SFP+ 10G + 4x QSFP 40G uplinks', icon:'assets/icons/network/switch.svg', color:'#38bdf8', ports:{ethernet:8, fiber:24} },
  { id:'c-rtr-edge', name:'Router de Borde / WAN 1U', type:'router', size:1, power:90, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Enrutamiento BGP/OSPF, 8x GbE + 4x SFP+', icon:'assets/icons/network/router.svg', color:'#f59e0b', ports:{ethernet:8, fiber:4} },
  { id:'c-fw-utm', name:'Firewall UTM / Perimetral 1U', type:'firewall', size:1, power:85, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Inspección NGFW, VPN IPSec, redundancia HA', icon:'assets/icons/network/firewall.svg', color:'#ef4444', ports:{ethernet:8, fiber:4} },

  // 3. Almacenamiento Masivo (Storage)
  { id:'c-nas-2u', name:'Storage NAS 2U (12 Bahías)', type:'storage', size:2, power:220, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Almacenamiento iSCSI / NFS / SMB', icon:'assets/icons/storage/nas.svg', color:'#06b6d4', ports:{ethernet:4, fiber:2} },
  { id:'c-san-4u', name:'Cabina SAN 4U (Alta Disponibilidad)', type:'storage', size:4, power:600, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Controladoras duales activas, Fibre Channel / 10GbE', icon:'assets/icons/storage/san.svg', color:'#06b6d4', ports:{ethernet:4, fiber:8} },
  { id:'c-jbod-2u', name:'Cajón Expansión JBOD 2U', type:'storage', size:2, power:180, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'24x bahías SAS 12Gbps para expansión SAN/NAS', icon:'assets/icons/storage/san.svg', color:'#06b6d4', ports:{ethernet:2, fiber:4} },

  // 4. Seguridad y CCTV (Security)
  { id:'c-nvr-1u', name:'Grabador NVR 1U (16/32 Canales IP)', type:'nvr', size:1, power:120, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'NVR 4K H.265+, 4 bahías SATA, 16x puertos PoE integrados', icon:'assets/icons/security/nvr.svg', color:'#f43f5e', ports:{ethernet:16, fiber:1} },
  { id:'c-nvr-2u', name:'Grabador NVR 2U (64/128 Canales RAID)', type:'nvr', size:2, power:250, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'NVR Empresarial, 8 bahías RAID 5/6, fuente redundante', icon:'assets/icons/security/nvr.svg', color:'#f43f5e', ports:{ethernet:4, fiber:2} },
  { id:'c-dvr-1u', name:'Grabador Híbrido DVR 1U (16 Ch BNC+IP)', type:'dvr', size:1, power:90, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Grabador analógico HD-TVI/AHD + soporte IP híbrido', icon:'assets/icons/security/dvr.svg', color:'#f43f5e', ports:{ethernet:2, fiber:0} },
  { id:'c-dec-1u', name:'Decodificador de Video / Video Wall 1U', type:'decoder', size:1, power:75, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Matriz decodificadora para múltiples pantallas HDMI/DP', icon:'assets/icons/security/decoder.svg', color:'#f43f5e', ports:{ethernet:4, fiber:1} },

  // 5. Energía y Respaldo Eléctrico (Power)
  { id:'c-ups-1500', name:'UPS Online 1500VA / 1350W (2U)', type:'ups', size:2, power:60, plugs:1, plugsOut:8, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Doble conversión, onda senoidal pura, factor 0.9', icon:'assets/icons/power/ups.svg', color:'#eab308' },
  { id:'c-ups-3000', name:'UPS Online 3000VA / 2700W (2U)', type:'ups', size:2, power:110, plugs:1, plugsOut:8, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Doble conversión, ranura SNMP de gestión remota', icon:'assets/icons/power/ups.svg', color:'#eab308' },
  { id:'c-pdu-1u', name:'PDU Horizontal 1U (8 Tomas C13)', type:'pdu', size:1, power:0, plugs:1, plugsOut:8, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Distribuidor eléctrico básico con breaker térmico', icon:'assets/icons/power/pdu.svg', color:'#eab308' },
  { id:'c-pdu-mon', name:'PDU Monitoreable 1U (Amperímetro LCD)', type:'pdu', size:1, power:10, plugs:1, plugsOut:8, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Medición de corriente en tiempo real y puerto Ethernet', icon:'assets/icons/power/pdu.svg', color:'#eab308' },

  // 6. Accesorios y Cableado (Accesorios pasivos)
  { id:'c-pp-24', name:'Patch Panel Cat6A RJ45 24P (1U)', type:'patchpanel', size:1, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Terminación 110/Krone T568A/B con barra trasera', icon:'assets/icons/wiring/patchpanel.svg', color:'#94a3b8', ports:{ethernet:24, fiber:0} },
  { id:'c-pp-48', name:'Patch Panel Cat6A RJ45 48P (2U)', type:'patchpanel', size:2, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Terminación 48 puertos de alta densidad', icon:'assets/icons/wiring/patchpanel.svg', color:'#94a3b8', ports:{ethernet:48, fiber:0} },
  { id:'c-odf-24', name:'Bandeja ODF Fibra Óptica 24P (1U)', type:'odf', size:1, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Distribuidor óptico con casete de fusión y adaptadores LC/SC dúplex', icon:'assets/icons/wiring/patchpanel.svg', color:'#94a3b8', ports:{ethernet:0, fiber:24} },
  { id:'c-org-1u', name:'Organizador Horizontal de Cables (1U)', type:'organizer', size:1, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Pasacables ranurado con tapa desmontable frontal', icon:'assets/icons/wiring/organizer.svg', color:'#94a3b8' },
  { id:'c-tray-1u', name:'Bandeja Ventilada Fija 1U', type:'tray', size:1, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Soporte para equipos no rackeables de hasta 25kg', icon:'assets/icons/accessories/tray.svg', color:'#64748b' },
  { id:'c-blind-1u', name:'Panel Ciego Cierre de Flujo 1U', type:'blind', size:1, power:0, ip:'', mac:'', serial:'', user:'', pass:'', notes:'Gestión de flujo de aire térmico en pasillos frío/caliente', icon:'assets/icons/accessories/tray.svg', color:'#64748b' },

  // 7. Gestión y Monitoreo (KVM)
  { id:'c-kvm-1u', name:'Consola KVM Rackeable 1U (Pantalla + Teclado)', type:'kvm', size:1, power:25, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Pantalla LCD 17" plegable con switch KVM de 8 puertos', icon:'assets/icons/accessories/kvm.svg', color:'#ec4899', ports:{ethernet:8, fiber:0} },

  // 8. Periféricos de Planta / Piso (Floor)
  { id:'c-fl-pc', name:'Estación de Trabajo / PC Cliente (Piso)', type:'pc', size:0, power:200, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'PC de escritorio / estación de monitoreo', icon:'assets/icons/floor/pc.svg', color:'#0ea5e9', ports:{ethernet:1, fiber:0} },
  { id:'c-fl-cam', name:'Cámara IP Domo / Bullet PoE (Piso)', type:'camera', size:0, power:15, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Cámara de seguridad 4K PoE exterior/interior', icon:'assets/icons/floor/camera.svg', color:'#f43f5e', ports:{ethernet:1, fiber:0} },
  { id:'c-fl-ap', name:'Punto de Acceso WiFi 6 (Piso/Techo)', type:'ap', size:0, power:18, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'AP empresarial de doble banda concurrente', icon:'assets/icons/network/ap.svg', color:'#10b981', ports:{ethernet:1, fiber:0} },
  { id:'c-fl-door', name:'Controladora de Acceso Biométrica (Piso)', type:'door', size:0, power:25, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Lector de huella / RFID y cerradura electromagnética', icon:'assets/icons/floor/door.svg', color:'#f59e0b', ports:{ethernet:1, fiber:0} },
  { id:'c-fl-prn', name:'Impresora Multifuncional de Red (Piso)', type:'printer', size:0, power:350, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Impresora láser color con conexión Ethernet', icon:'assets/icons/floor/printer.svg', color:'#06b6d4', ports:{ethernet:1, fiber:0} },
  { id:'c-fl-tel', name:'Teléfono IP VoIP PoE (Piso)', type:'phone', size:0, power:8, ip:'', mac:'', serial:'', user:'admin', pass:'', notes:'Teléfono de escritorio SIP con pantalla y altavoz HD', icon:'assets/icons/floor/phone.svg', color:'#ef4444', ports:{ethernet:1, fiber:0} }
];

let CATALOG = [...DEFAULT_CATALOG];
window.DEFAULT_CATALOG = DEFAULT_CATALOG;
window.CATALOG = CATALOG;

function getCatalog() {
  const custom = (typeof store !== 'undefined' && store.state && Array.isArray(store.state.customCatalog)) 
    ? store.state.customCatalog 
    : [];
  return [...DEFAULT_CATALOG, ...custom];
}
window.getCatalog = getCatalog;

function syncCatalog() {
  const list = getCatalog();
  CATALOG.length = 0;
  CATALOG.push(...list);
  return CATALOG;
}
window.syncCatalog = syncCatalog;

const TYPE_COLORS = { 
  server:'#10b981', switch:'#10b981', router:'#f59e0b', firewall:'#ef4444', 
  storage:'#06b6d4', nvr:'#f43f5e', dvr:'#f43f5e', decoder:'#f43f5e',
  ups:'#eab308', pdu:'#eab308', energia:'#eab308',
  patchpanel:'#38bdf8', odf:'#38bdf8', organizer:'#94a3b8', tray:'#64748b', blind:'#64748b',
  accesorios:'#94a3b8', gestion:'#38bdf8', kvm:'#ec4899',
  pc:'#0ea5e9', camera:'#f43f5e', ap:'#10b981', door:'#f59e0b', 
  printer:'#06b6d4', phone:'#ef4444' 
};

function addCatalogItem(item) {
  if (typeof store !== 'undefined' && store.addCustomCatalogItem) {
    store.addCustomCatalogItem(item);
  } else {
    CATALOG.push(item);
    renderCatalog();
  }
}

function updateCatalogItem(id, props) {
  if (typeof store !== 'undefined' && store.state && store.state.customCatalog) {
    const custom = store.state.customCatalog.find(x => x.id === id);
    if (custom) {
      store.snapshot();
      Object.assign(custom, props);
      store._save();
      store._emit('change', { source: 'updateCustomCatalog' });
      return;
    }
  }
  const c = CATALOG.find(x => x.id === id);
  if (c) Object.assign(c, props);
  renderCatalog();
}

function deleteCatalogItem(id) {
  if (typeof store !== 'undefined' && store.deleteCustomCatalogItem) {
    const isCustom = store.state.customCatalog && store.state.customCatalog.some(c => c.id === id);
    if (isCustom) {
      store.deleteCustomCatalogItem(id);
      return;
    }
  }
  const idx = CATALOG.findIndex(c => c.id === id);
  if (idx !== -1) {
    CATALOG.splice(idx, 1);
    renderCatalog();
  }
}

const CATALOG_GROUPS = [
  { id: 'all',        name: 'Todos los Equipos',       types: null,                                                              icon: 'grid',    color: '#0ea5e9' },
  { id: 'compute',    name: 'Servidores y Cómputo',    types: ['server'],                                                        icon: 'server',  color: '#10b981' },
  { id: 'network',    name: 'Redes y Comunicaciones',  types: ['switch', 'router', 'firewall', 'ap'],                            icon: 'network', color: '#38bdf8' },
  { id: 'storage',    name: 'Almacenamiento',          types: ['storage'],                                                       icon: 'san',     color: '#06b6d4' },
  { id: 'security',   name: 'Seguridad y CCTV',        types: ['nvr', 'dvr', 'decoder'],                                         icon: 'camera',  color: '#f43f5e' },
  { id: 'power',      name: 'Energía y Respaldo',      types: ['ups', 'pdu', 'energia'],                                         icon: 'ups',     color: '#eab308' },
  { id: 'accesorios', name: 'Accesorios y Cableado',   types: ['patchpanel', 'odf', 'organizer', 'tray', 'blind', 'accesorios', 'gestion'], icon: 'tray',    color: '#94a3b8' },
  { id: 'floor',      name: 'Periféricos de Piso',     types: ['pc', 'camera', 'door', 'printer', 'phone'],                      icon: 'pc',      color: '#a855f7' }
];
window.CATALOG_GROUPS = CATALOG_GROUPS;

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
  syncCatalog();
  const searchInput = document.getElementById('catalog-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const activeGroupId = currentFlyoutCategory || 'all';
  const group = CATALOG_GROUPS.find(g => g.id === activeGroupId);
  
  const list = CATALOG.filter(item => {
    const matchType = !group || !group.types || group.types.includes(item.type);
    const matchQuery = !query || 
      item.name.toLowerCase().includes(query) || 
      item.type.toLowerCase().includes(query) ||
      (item.notes && item.notes.toLowerCase().includes(query));
    return matchType && matchQuery;
  });
  
  const cat = document.getElementById('catalog');
  if(!cat) return;

  if (list.length === 0) {
    cat.innerHTML = `<div style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:12px;">No se encontraron equipos para "${escapeHTML(query)}"</div>`;
    return;
  }

  cat.innerHTML = list.map(item => {
    const isCustom = item.isCustom || (typeof store !== 'undefined' && store.state && store.state.customCatalog && store.state.customCatalog.some(c => c.id === item.id));
    const iconName = item.icon ? item.icon.split('/').pop().split('.')[0] : item.type;
    let iconSvg = '';
    if (typeof SVG_ICONS !== 'undefined') {
      iconSvg = SVG_ICONS[iconName] || SVG_ICONS[item.type] || (item.type === 'odf' ? SVG_ICONS['patchpanel'] : '') || (item.type === 'blind' ? SVG_ICONS['tray'] : '') || '';
    }
    const color = item.color || TYPE_COLORS[item.type] || '#38bdf8';

    return `
    <div class="catalog-item" draggable="true" data-catalog-id="${item.id}">
      <div class="cat-icon" style="background:${color}22; display:flex; align-items:center; justify-content:center;">
        <div style="color:${color}; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">${iconSvg}</div>
      </div>
      <div class="cat-info">
        <div class="cat-name" title="${escapeHTML(item.name)}">
          ${escapeHTML(item.name)}
          ${isCustom ? '<span style="font-size:9px; background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:0px 4px; border-radius:3px; margin-left:4px; font-weight:600;">PROYECTO</span>' : ''}
        </div>
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
              deleteCatalogItem(id);
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
