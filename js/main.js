let currentView = 'physical';

function renderAll() {
  renderRoomTabs();
  renderStats();
  renderCatalog();
  renderPhysical();
  renderBottomPanel();
  updateZoomLabel();
  if (currentView === 'topology') {
    initTopoPositions();
  }
}

// Bind to store mutations
store.on('change', renderAll);

function initGlobalEvents() {
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = Math.min(3, (store._raw[pfx+'Zoom']||1) * 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = Math.max(0.2, (store._raw[pfx+'Zoom']||1) / 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store._raw[pfx+'Zoom'] = 1; store._raw[pfx+'PanX'] = 0; store._raw[pfx+'PanY'] = 0;
    updateZoomLabel();
  });

  // Panning for physical view
  let physPanStart = null;
  let panOrig = { x: 0, y: 0 };
  const viewPhysical = document.getElementById('view-physical');
  if(viewPhysical) {
    viewPhysical.addEventListener('pointerdown', e => {
      if (e.target.closest('.device-faceplate') || e.target.closest('.rack')) return;
      physPanStart = { x: e.clientX, y: e.clientY };
      panOrig = { x: store._raw.physPanX || 0, y: store._raw.physPanY || 0 };
    });
    window.addEventListener('pointermove', e => {
      if (physPanStart && currentView === 'physical') {
        const z = store._raw.physZoom || 1;
        store._raw.physPanX = panOrig.x + (e.clientX - physPanStart.x) / z;
        store._raw.physPanY = panOrig.y + (e.clientY - physPanStart.y) / z;
        updateZoomLabel();
      }
    });
    window.addEventListener('pointerup', () => { physPanStart = null; });
    window.addEventListener('pointercancel', () => { physPanStart = null; });
  }

  // View switching
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentView = tab.dataset.view;
      updateZoomLabel();
      const phys = document.getElementById('view-physical');
      const topo = document.getElementById('topology-canvas');
      if (currentView === 'physical') {
        phys.classList.remove('hidden');
        topo.style.display = 'none';
        stopTopo();
      } else {
        phys.classList.add('hidden');
        topo.style.display = 'block';
        startTopo();
      }
    });
  });

  // Project Menu Dropdown
  const btnMenu = document.getElementById('btn-project-menu');
  const dropdown = document.getElementById('project-dropdown');
  if (btnMenu && dropdown) {
    btnMenu.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) dropdown.classList.add('hidden');
    });

    document.getElementById('menu-open')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      document.getElementById('import-file').click();
    });
    document.getElementById('menu-save')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      const data = { version: 1, project: store._raw, catalog: CATALOG };
      downloadJSON(data, 'datacenter.rack');
    });
    document.getElementById('menu-clear')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (confirm('¿Estás seguro de que deseas limpiar el proyecto? Perderás todos los datos no guardados.')) {
        const roomId = uid();
        store.loadData({
          rooms: [{ id: roomId, name: 'Sala A1' }],
          racks: [],
          devices: [],
          connections: [],
          currentRoomId: roomId,
          selectedDeviceId: null,
          topology: { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} },
          topoZoom: 1, topoPanX: 0, topoPanY: 0,
          physZoom: 1, physPanX: 0, physPanY: 0
        });
        notify('Proyecto limpiado. Nueva sala A1 creada.', 'success');
      }
    });
    document.getElementById('menu-demo')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      loadDemoData();
    });
    document.getElementById('menu-export-cat')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      downloadJSON(CATALOG, 'catalog_backup.json');
    });
    document.getElementById('menu-import-cat')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      alert('Funcionalidad de importar catálogo (Próximamente)');
    });

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.project) {
              store.loadData(data.project);
              if (data.catalog) {
                CATALOG.length = 0;
                data.catalog.forEach(c => CATALOG.push(c));
                renderCatalog();
              }
              notify('Proyecto cargado', 'success');
            } else if (data.rooms) { // old format support
              store.loadData(data);
              notify('Proyecto cargado (formato antiguo)', 'success');
            } else {
              notify('Archivo inválido', 'error');
            }
          } catch(err) {
            notify('Error al leer el archivo', 'error');
          }
          importFile.value = '';
        };
        reader.readAsText(file);
      });
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }
  }

  // Bottom panel tabs
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      setActiveTab(pill.dataset.tab);
      renderBottomPanel();
    });
  });

  let bottomCollapsed = false;
  document.getElementById('btn-collapse-bottom').addEventListener('click', () => {
    bottomCollapsed = !bottomCollapsed;
    const bot = document.getElementById('bottom');
    if (bottomCollapsed) {
      bot.style.height = '38px';
      document.getElementById('btn-collapse-bottom').textContent = '▲';
    } else {
      bot.style.height = 'var(--bottom-h)';
      document.getElementById('btn-collapse-bottom').textContent = '▼';
    }
  });

  document.getElementById('global-search').addEventListener('input', () => {
    renderPhysical();
  });

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCatalog();
    });
  });
  document.getElementById('catalog-search').addEventListener('input', renderCatalog);

  // Header buttons
  document.getElementById('btn-add-rack').addEventListener('click', openAddRackModal);
  document.getElementById('btn-add-device-modal').addEventListener('click', openAddDeviceModal);
  const addDevTableBtn = document.getElementById('table-btn-add-device');
  if(addDevTableBtn) addDevTableBtn.addEventListener('click', openAddDeviceModal);
  const addConnTableBtn = document.getElementById('table-btn-add-conn');
  if(addConnTableBtn) addConnTableBtn.addEventListener('click', () => openCableModal());
  document.getElementById('btn-undo').addEventListener('click', () => store.undo());
  document.getElementById('btn-redo').addEventListener('click', () => store.redo());

  // Expand panel buttons
  document.getElementById('btn-expand-main').addEventListener('click', (e) => {
    const main = document.getElementById('main');
    main.classList.toggle('fullscreen');
    e.target.textContent = main.classList.contains('fullscreen') ? '⛶ Contraer' : '⛶ Expandir';
  });

  document.getElementById('btn-expand-bottom').addEventListener('click', (e) => {
    const bottom = document.getElementById('bottom');
    bottom.classList.toggle('fullscreen');
    e.target.textContent = bottom.classList.contains('fullscreen') ? '⛶ Contraer' : '⛶ Expandir';
  });

  document.getElementById('toggle-stats').addEventListener('click', () => {
    const container = document.getElementById('stats-container');
    const chevron = document.getElementById('stats-chevron');
    container.classList.toggle('hidden');
    chevron.textContent = container.classList.contains('hidden') ? '►' : '▼';
  });

  const tableSearch = document.getElementById('table-search');
  if(tableSearch) tableSearch.addEventListener('input', renderBottomPanel);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); store.redo(); }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      const ctxMenu = document.getElementById('ctx-menu');
      if(ctxMenu) ctxMenu.classList.add('hidden');
    }
  });

  const resizeObs = new ResizeObserver(() => {
    if (currentView === 'topology') { resizeCanvas(); }
  });
  const mainEl = document.getElementById('main');
  if(mainEl) resizeObs.observe(mainEl);
}

function loadDemoData() {
  const r1 = uid(); const r2 = uid(); const r3 = uid();
  const rooms = [
    { id: r1, name: 'Sala Principal (Core)' },
    { id: r2, name: 'Sala Secundaria (Edge)' },
    { id: r3, name: 'Sala de Cómputo (Storage/Servers)' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  const racksPerRoom = [4, 3, 5];
  let c = 0;
  
  const switchIds = [];
  const serverIds = [];
  const routerIds = [];

  racksPerRoom.forEach((num, roomIdx) => {
    for (let i=0; i<num; i++) {
      const rackId = uid();
      racks.push({
        id: rackId, roomId: rooms[roomIdx].id, 
        name: `Rack ${roomIdx+1}0${i+1}`, 
        height: 42, color: colors[c % colors.length], devices: []
      });
      c++;

      // UPS
      const upsId = uid();
      devices.push({ id: upsId, rackId, name: 'UPS APC 3000VA', type: 'ups', slotStart: 1, size: 2, ip: '10.0.'+(roomIdx+1)+'.'+(i+1), mac: '00:11:22:33:44:55', serial: 'UPS-'+uid(), power: 3000, user: 'admin', pass: 'ups123', notes: 'Respaldo 15m' });

      // Servers
      for(let s=1; s<=5; s++) {
        const srvId = uid();
        serverIds.push(srvId);
        devices.push({ id: srvId, rackId, name: `Server Dell R740 - Nodo ${s}`, type: 'server', slotStart: 3 + (s-1)*3, size: 2, ip: '192.168.10.'+(s*10), mac: 'AA:BB:CC:00:11:22', serial: 'SRV-'+uid(), power: 600, user: 'root', pass: 'secret', notes: 'Cluster ESXi' });
      }

      // Storage
      if (roomIdx === 2 && i < 2) {
         const stoId = uid();
         devices.push({ id: stoId, rackId, name: `SAN Storage NetApp`, type: 'storage', slotStart: 20, size: 4, ip: '192.168.20.5', mac: 'FF:AA:BB:CC:DD:EE', serial: 'STO-'+uid(), power: 1200, user: 'admin', pass: 'netapp', notes: 'LUNs 0-10' });
      }

      // Switches
      const swId = uid();
      switchIds.push(swId);
      devices.push({ id: swId, rackId, name: `Switch 48P - Acceso`, type: 'switch', slotStart: 40, size: 1, ip: '192.168.1.254', mac: 'FF:EE:DD:CC:BB:AA', serial: 'SW-'+uid(), power: 250, user: 'admin', pass: 'cisco', notes: 'Trunk a Core' });
      
      // Routers / Firewalls
      if(i === 0 && roomIdx === 0) {
         const rtrId = uid();
         routerIds.push(rtrId);
         devices.push({ id: rtrId, rackId, name: `Edge Router BGP`, type: 'router', slotStart: 41, size: 1, ip: '10.0.0.1', mac: '12:34:56:78:90:AB', serial: 'RTR-'+uid(), power: 180, user: 'admin', pass: 'admin', notes: 'Enlace ISP Principal' });
         const fwId = uid();
         devices.push({ id: fwId, rackId, name: `Firewall FortiGate`, type: 'firewall', slotStart: 42, size: 1, ip: '10.0.0.2', mac: '12:34:56:78:90:BB', serial: 'FWL-'+uid(), power: 100, user: 'admin', pass: 'fortinet', notes: 'DMZ' });
      }
    }
  });

  // Conexiones: Servidores al Switch de su Rack
  serverIds.forEach((srv, i) => {
    const sw = switchIds[Math.floor(i / 5)]; // Asumimos 5 servidores por rack y switch
    if (sw) {
      connections.push({ id: uid(), sourceDeviceId: srv, sourcePort: `eth0`, targetDeviceId: sw, targetPort: `Gi1/0/${(i%5)+1}`, cableType: 'UTP Cat6a', color: '#10b981' });
    }
  });

  // Conexiones: Switches entre sí
  for(let i=0; i<switchIds.length-1; i++) {
    connections.push({ id: uid(), sourceDeviceId: switchIds[i], sourcePort: 'Te1/1/1', targetDeviceId: switchIds[i+1], targetPort: 'Te1/1/2', cableType: 'Fibra OM4', color: '#3b82f6' });
  }

  // Conexiones: Primer switch a router
  if(routerIds.length > 0 && switchIds.length > 0) {
    connections.push({ id: uid(), sourceDeviceId: routerIds[0], sourcePort: 'Gi0/0/0', targetDeviceId: switchIds[0], targetPort: 'Te1/1/4', cableType: 'DAC', color: '#ef4444' });
  }

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: r1,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if(typeof initTopoPositions === 'function') initTopoPositions();
  renderAll();
  
  notify('Demostración gigante cargada', 'success');
}

function init() {
  initTopology();
  initModals();
  initGlobalEvents();

  // Asegurar que canvas de topología empiece oculto
  const topoCanvas = document.getElementById('topology-canvas');
  if(topoCanvas) topoCanvas.style.display = 'none';

  renderAll();
  notify('⚡ RACK Designer modularizado', 'success', 2500);
}

init();
