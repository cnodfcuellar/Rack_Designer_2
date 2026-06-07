let currentView = 'physical';

function renderAll(event = {}) {
  const source = event.source || event.path || '';
  
  if (!source || ['loadData', 'undo', 'redo'].includes(source)) {
    renderRoomTabs();
    renderStats();
    renderCatalog();
    renderPhysical();
    renderBottomPanel();
    updateZoomLabel();
    if (currentView === 'topology') initTopoPositions();
    return;
  }

  if (source.includes('Room') || source === 'room-rename') {
    renderRoomTabs();
    renderPhysical();
  }
  
  if (source.includes('Rack')) {
    renderStats();
    renderPhysical();
  }
  
  if (source.includes('Device') || source === 'addFloorDevice' || source === 'moveDevice' || source === 'deleteDevice' || source === 'updateDevice' || source === 'addDeviceToRack') {
    renderStats();
    renderPhysical();
    renderBottomPanel();
  }
  
  if (source.includes('Connection')) {
    renderStats();
    renderBottomPanel();
  }

  if (source.includes('Zoom') || source.includes('Pan')) {
    updateZoomLabel();
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
      const wantSave = confirm('¿Deseas guardar una copia de tu proyecto actual antes de cargar las demostraciones?\n\n(Recomendado para no perder tu progreso)');
      if (wantSave) {
        if (typeof exportJSON === 'function') exportJSON();
        // Dar un pequeño respiro para que el navegador inicie la descarga
        setTimeout(() => { loadDemoData(); }, 1500);
      } else {
        const proceed = confirm('⚠️ ADVERTENCIA: Todo tu diseño actual se perderá de forma permanente.\n\n¿Estás seguro de que quieres continuar SIN GUARDAR?');
        if (proceed) {
          loadDemoData();
        }
      }
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
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        if(mobileOverlay) mobileOverlay.classList.remove('hidden');
      });
    }
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        mobileOverlay.classList.add('hidden');
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
  const addPlacementTableBtn = document.getElementById('table-btn-add-placement');
  if(addPlacementTableBtn) addPlacementTableBtn.addEventListener('click', () => openQuickPlacementModal(null));
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

// loadDemoData() has been extracted to js/demoData.js for cleaner architecture
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
