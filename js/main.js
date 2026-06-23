let currentView = 'physical';
window.TOPOLOGY_STYLE = 'card'; // 'card' o 'circle'
window.SHOW_PASSWORDS = false;

// ===== AUTENTICACIÓN Y ROLES =====

function applyRoleUI(user) {
  const badge = document.getElementById('user-badge');
  if (!badge) return;
  const isAdm = user.role === RackAuth.ROLES.ADMIN;
  const isView = user.role === RackAuth.ROLES.VIEWER;

  // Badge en el header
  badge.style.display = 'inline-block';
  badge.textContent = isAdm ? '👑 Admin' : isView ? '👁 Espectador' : '✏️ Editor';
  badge.style.color = isAdm ? 'var(--cyan)' : isView ? 'var(--text-secondary)' : 'var(--purple)';
  badge.style.borderColor = isAdm ? 'var(--cyan)' : isView ? 'var(--border)' : 'var(--purple)';
  badge.style.background = isAdm ? 'rgba(34,211,238,0.1)' : isView ? 'rgba(100,116,139,0.1)' : 'rgba(139,92,246,0.15)';
  badge.title = `Sesión: ${user.name}`;

  // Opciones exclusivas de admin en el menú
  const godMode = document.getElementById('menu-toggle-passwords');
  const changePinMenu = document.getElementById('menu-change-pin');
  if (godMode) godMode.style.display = isAdm ? '' : 'none';
  if (changePinMenu) changePinMenu.style.display = isAdm ? '' : 'none';

  // Botones de escritura deshabilitados para viewer
  const writeOnlyBtns = [
    'btn-add-rack', 'btn-add-device-modal',
    'table-btn-add-device', 'table-btn-add-placement', 'table-btn-add-conn'
  ];
  writeOnlyBtns.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.disabled = isView; el.style.opacity = isView ? '0.4' : ''; }
  });
}

function closePinModal() {
  const m = document.getElementById('modal-change-pin');
  if (m) m.style.display = 'none';
  ['pin-current-input','pin-new-input','pin-confirm-input'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const err = document.getElementById('pin-change-error'); if(err) { err.style.display='none'; err.textContent=''; }
  const ok = document.getElementById('pin-change-success'); if(ok) ok.style.display='none';
}

function initAuthModal() {
  const modal = document.getElementById('modal-login');
  if (!modal) {
    console.error('[RackAuth] modal-login no encontrado en el DOM');
    return;
  }

  // Show PIN notice if not yet configured
  if (!RackAuth.isPinConfigured()) {
    const notice = document.getElementById('login-pin-notice');
    if (notice) notice.style.display = 'block';
  }

  function showModal() {
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
  }

  function hideModal() {
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }

  function closeLoginModal(user) {
    hideModal();
    applyRoleUI(user);
    notify(`Bienvenido, ${user.name} 👋`, 'success', 2500);
  }

  // Toggle show/hide PIN
  document.getElementById('login-pin-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('login-pin-input');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // Admin login
  document.getElementById('btn-login-admin')?.addEventListener('click', async () => {
    const pin = document.getElementById('login-pin-input')?.value || '';
    const user = await RackAuth.tryAdminLogin(pin);
    if (user) {
      closeLoginModal(user);
    } else {
      const errEl = document.getElementById('login-error');
      if (errEl) { errEl.style.display = 'block'; }
      setTimeout(() => { if(errEl) errEl.style.display = 'none'; }, 3000);
    }
  });

  // Editor login
  document.getElementById('btn-login-editor')?.addEventListener('click', () => {
    closeLoginModal(RackAuth.loginAsEditor());
  });

  // Viewer login
  document.getElementById('btn-login-viewer')?.addEventListener('click', () => {
    closeLoginModal(RackAuth.loginAsViewer());
  });

  // Enter key on PIN input
  document.getElementById('login-pin-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-login-admin')?.click();
  });

  // Show modal
  showModal();
}

function initChangePinModal() {
  // Open from menu
  document.getElementById('menu-change-pin')?.addEventListener('click', () => {
    const dropdown = document.getElementById('project-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (!RackAuth.can('changeAdminPin')) return;
    const m = document.getElementById('modal-change-pin');
    if (m) m.style.display = 'flex';
  });

  // Cancel
  document.getElementById('btn-pin-cancel')?.addEventListener('click', closePinModal);

  // Save new PIN
  document.getElementById('btn-pin-save')?.addEventListener('click', async () => {
    const current = document.getElementById('pin-current-input')?.value || '';
    const newPin  = document.getElementById('pin-new-input')?.value || '';
    const confirm = document.getElementById('pin-confirm-input')?.value || '';
    const errEl   = document.getElementById('pin-change-error');
    const okEl    = document.getElementById('pin-change-success');
    const hide = el => { if(el) el.style.display='none'; };
    const show = (el, msg) => { if(el){ el.style.display='block'; if(msg) el.textContent=msg; } };
    hide(errEl); hide(okEl);

    const isValidCurrent = await RackAuth.validateAdminPin(current);
    if (!isValidCurrent) {
      return show(errEl, '❌ El PIN actual es incorrecto.');
    }
    if (newPin.length < 4) {
      return show(errEl, '❌ El nuevo PIN debe tener al menos 4 caracteres.');
    }
    if (newPin !== confirm) {
      return show(errEl, '❌ Los PINs nuevos no coinciden.');
    }
    await RackAuth.setAdminPin(newPin);
    show(okEl);
    setTimeout(closePinModal, 1500);
  });

  // Click on badge → logout confirmation
  document.getElementById('user-badge')?.addEventListener('click', () => {
    if (confirm(`¿Cerrar sesión como ${RackAuth.getCurrentUser()?.name}?\n\nSe mostrará el modal de login.`)) {
      RackAuth.logout();
      initAuthModal();
    }
  });
}

// ===== FIN AUTENTICACIÓN =====

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

  if (source.includes('Room') || source === 'room-rename' || source === 'changeRoom') {
    renderRoomTabs();
    renderPhysical();
    if (currentView === 'topology') {
      initTopoPositions();
    }
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
store.on('change', (e) => {
  renderAll(e);
  if (e && !['loadData', 'undo', 'redo', 'importJSON'].includes(e.source || e.path)) {
    // Solo guardar automáticamente si el usuario tiene permisos de edición
    if (typeof fileManager !== 'undefined' && RackAuth.can('editDevices')) {
      fileManager.autoSave();
    }
  }
});

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
  
  document.getElementById('btn-topo-style').addEventListener('click', () => {
    window.TOPOLOGY_STYLE = window.TOPOLOGY_STYLE === 'card' ? 'circle' : 'card';
    if (currentView === 'topology') renderTopology();
  });

  const statusDot = document.querySelector('.status-dot');
  if (statusDot) {
    statusDot.style.cursor = 'pointer';
    statusDot.addEventListener('click', () => {
      const isOff = document.body.classList.toggle('no-animations');
      statusDot.setAttribute('data-tip', isOff ? 'Animaciones: Apagadas' : 'Sistema operativo');
      statusDot.style.background = isOff ? '#f59e0b' : '';
    });
  }

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
      if (!e.target.closest('.rack-hdr-btns')) {
        document.querySelectorAll('.dropdown-menu[id^="rack-menu-"]').forEach(m => m.classList.add('hidden'));
      }
    });

    document.getElementById('menu-theme')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        document.getElementById('menu-theme').textContent = '☀️ Cambiar a Modo Claro';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.getElementById('menu-theme').textContent = '🌙 Cambiar a Modo Oscuro';
      }
    });

    window.SHOW_PASSWORDS = false;
    document.getElementById('menu-toggle-passwords')?.addEventListener('click', (e) => {
      if (!RackAuth.can('toggleGodMode')) {
        notify('⛔ Solo administradores pueden activar el Modo Dios.', 'error', 3000);
        dropdown.classList.add('hidden');
        return;
      }
      dropdown.classList.add('hidden');
      window.SHOW_PASSWORDS = !window.SHOW_PASSWORDS;
      document.getElementById('menu-toggle-passwords').textContent = window.SHOW_PASSWORDS ? '🙈 Modo Dios: Ocultar Claves' : '👁 Modo Dios: Revelar Claves';
      renderAll();
    });

    initChangePinModal();

    // Set initial text
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      document.getElementById('menu-theme').textContent = '🌙 Cambiar a Modo Oscuro';
    }

    document.getElementById('menu-open')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (typeof fileManager !== 'undefined') fileManager.openProject();
      else document.getElementById('import-file').click();
    });
    document.getElementById('menu-save')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden guardar proyectos.', 'error', 3000);
        return;
      }
      if (typeof fileManager !== 'undefined') fileManager.saveProject();
      else {
        const data = { version: 1, project: store._raw, catalog: CATALOG };
        downloadJSON(data, 'datacenter.rack');
      }
    });
    document.getElementById('menu-save-as')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden guardar proyectos.', 'error', 3000);
        return;
      }
      if (typeof fileManager !== 'undefined') fileManager.saveProjectAs();
    });
    document.getElementById('menu-clear')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('clearProject')) {
        notify('🚫 Espectadores no pueden limpiar el proyecto.', 'error', 3000);
        return;
      }
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
        if (typeof fileManager !== 'undefined') {
          fileManager.fileHandle = null;
          fileManager.fileName = 'Nuevo Proyecto';
          fileManager.updateUI();
        }
        notify('Proyecto limpiado. Nueva sala A1 creada.', 'success');
      }
    });
    document.getElementById('menu-demo')?.addEventListener('click', async () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('🚫 Espectadores no pueden cargar demostraciones.', 'error', 3000);
        return;
      }
      const wantSave = confirm('¿Deseas guardar una copia de tu proyecto actual antes de cargar las demostraciones?\n\n(Recomendado para no perder tu progreso)');
      if (!wantSave) {
        const proceed = confirm('⚠️ ADVERTENCIA: Todo tu diseño actual se perderá de forma permanente.\n\n¿Estás seguro de que quieres continuar SIN GUARDAR?');
        if (!proceed) return;
      }

      if (wantSave) {
        if (typeof fileManager !== 'undefined') {
          await fileManager.saveProject();
        } else if (typeof exportJSON === 'function') {
          exportJSON();
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      function runDemo() {
        if (typeof window.loadDemoData === 'function') {
          window.loadDemoData();
          if (typeof fileManager !== 'undefined') {
            fileManager.fileHandle = null;
            fileManager.fileName = 'Proyecto Demo';
            fileManager.updateUI();
          }
        } else {
          notify('Error: no se pudo cargar el módulo de demos', 'error');
        }
      }

      if (typeof window.loadDemoData === 'function') {
        runDemo();
      } else {
        const script = document.createElement('script');
        script.src = 'js/demoData.js';
        script.onload = runDemo;
        script.onerror = () => notify('Error: no se encontró js/demoData.js', 'error');
        document.head.appendChild(script);
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

    window.closeMobileSidebar = () => {
      document.getElementById('sidebar').classList.remove('open');
      const mobileOverlay = document.getElementById('mobile-overlay');
      if (mobileOverlay) mobileOverlay.classList.add('hidden');
    };

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        const mobileOverlay = document.getElementById('mobile-overlay');
        if(mobileOverlay) mobileOverlay.classList.remove('hidden');
      });
    }
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', window.closeMobileSidebar);
    }
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    if (btnCloseSidebar) {
      btnCloseSidebar.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent toggle-stats
        window.closeMobileSidebar();
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

  let bottomCollapsed = true;
  document.getElementById('bottom').style.height = '38px';
  document.getElementById('btn-collapse-bottom').textContent = '▲';

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

  // Soporte para scroll horizontal con la rueda del mouse en los filtros
  const filterTabsContainer = document.querySelector('.sb-filter-tabs');
  if (filterTabsContainer) {
    filterTabsContainer.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        filterTabsContainer.scrollLeft += e.deltaY;
      }
    });
  }

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

  document.addEventListener('DOMContentLoaded', () => {
    // Theme initialization removed (now handled in <head> of index.html to prevent FOUC)
  });

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

// demoData.js se carga dinámicamente solo cuando el usuario pulsa "✨ Cargar demos"
function init() {
  initTopology();
  initModals();
  initGlobalEvents();

  // Asegurar que canvas de topología empiece oculto
  const topoCanvas = document.getElementById('topology-canvas');
  if(topoCanvas) topoCanvas.style.display = 'none';

  renderAll();
  notify('⚡ RACK Designer modularizado', 'success', 2500);

  // Inicializar sistema de autenticación
  // Siempre mostramos el modal al iniciar (sessionStorage no persiste entre sesiones)
  const existingUser = RackAuth.getCurrentUser();
  if (existingUser) {
    // Ya hay sesión activa en esta misma pestaña (ej: recarga con F5)
    console.log('[RackAuth] Sesión restaurada:', existingUser.role);
    applyRoleUI(existingUser);
  } else {
    // Primera visita o nueva pestaña → mostrar login
    console.log('[RackAuth] Sin sesión, mostrando modal de login...');
    // Pequeño delay para que el DOM termine de renderizar
    setTimeout(() => initAuthModal(), 100);
  }

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
          console.log('[Service Worker] Registrado con éxito con scope:', registration.scope);
        })
        .catch(err => {
          console.error('[Service Worker] Error al registrar:', err);
        });
    });
  }
}

init();
