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
    store._raw.zoom = Math.min(3, (store._raw.zoom||1) * 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    store._raw.zoom = Math.max(0.2, (store._raw.zoom||1) / 1.2);
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    store._raw.zoom = 1; store._raw.panX = 0; store._raw.panY = 0;
    updateZoomLabel();
  });

  // Panning for physical view
  let physPanStart = null;
  let panOrig = { x: 0, y: 0 };
  const viewPhysical = document.getElementById('view-physical');
  if(viewPhysical) {
    viewPhysical.addEventListener('mousedown', e => {
      if (e.target.closest('.device-faceplate') || e.target.closest('.rack')) return;
      physPanStart = { x: e.clientX, y: e.clientY };
      panOrig = { x: store._raw.panX || 0, y: store._raw.panY || 0 };
    });
    window.addEventListener('mousemove', e => {
      if (physPanStart && currentView === 'physical') {
        const z = store._raw.zoom || 1;
        store._raw.panX = panOrig.x + (e.clientX - physPanStart.x) / z;
        store._raw.panY = panOrig.y + (e.clientY - physPanStart.y) / z;
        updateZoomLabel();
      }
    });
    window.addEventListener('mouseup', () => { physPanStart = null; });
  }

  // View switching
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentView = tab.dataset.view;
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
