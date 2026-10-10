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
  badge.style.display = 'inline-flex';
  badge.style.alignItems = 'center';
  badge.innerHTML = isAdm 
    ? '<i class="svg-icon icon-crown" style="width:12px;height:12px;margin-right:4px;"></i><span class="badge-text">Admin</span>' 
    : isView 
      ? '<i class="svg-icon icon-eye" style="width:12px;height:12px;margin-right:4px;"></i><span class="badge-text">Espectador</span>' 
      : '<i class="svg-icon icon-edit" style="width:12px;height:12px;margin-right:4px;"></i><span class="badge-text">Editor</span>';
  badge.style.color = isAdm ? 'var(--cyan)' : isView ? 'var(--text-secondary)' : 'var(--accent)';
  badge.style.borderColor = isAdm ? 'var(--cyan)' : isView ? 'var(--border)' : 'var(--accent)';
  badge.style.background = isAdm ? 'rgba(34,211,238,0.1)' : isView ? 'rgba(100,116,139,0.1)' : 'var(--accent-glow)';
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
    notify(`Bienvenido, ${user.name}`, 'success', 2500);
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
      return show(errEl, 'El PIN actual es incorrecto.');
    }
    if (newPin.length < 4) {
      return show(errEl, 'El nuevo PIN debe tener al menos 4 caracteres.');
    }
    if (newPin !== confirm) {
      return show(errEl, 'Los PINs nuevos no coinciden.');
    }
    await RackAuth.setAdminPin(newPin);
    show(okEl);
    setTimeout(closePinModal, 1500);
  });
}

// ===== FIN AUTENTICACIÓN =====

// ===== M-04: SISTEMA DE REDIBUJADO SELECTIVO Y MONITOR DE RENDIMIENTO =====
window.RenderPerformance = {
  totalRenders: 0,
  selectiveRenders: 0,
  fullRenders: 0,
  skippedRenders: 0,
  lastRenderDurationMs: 0,
  activeView: 'physical',
  reset() {
    this.totalRenders = 0;
    this.selectiveRenders = 0;
    this.fullRenders = 0;
    this.skippedRenders = 0;
    this.lastRenderDurationMs = 0;
  }
};

window._renderState = {
  dirtyPhysical: false,
  dirtyTopology: false,
  dirtyBottom: false,
  dirtyOutliner: false
};

let _rafRenderId = null;
let _queuedRenderEvents = [];

function flushRenderQueue() {
  if (_rafRenderId) {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(_rafRenderId);
    }
    _rafRenderId = null;
  }
  if (_queuedRenderEvents.length > 0) {
    const events = [..._queuedRenderEvents];
    _queuedRenderEvents = [];
    _executeRenderAll(events);
  }
}

function _executeRenderAll(events) {
  const activeView = (typeof window !== 'undefined' && window.currentView) ? window.currentView : currentView;
  const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  
  const isFullRedraw = !events.length || events.some(e => {
    const s = e.source || e.path || '';
    return !s || ['loadData', 'undo', 'redo', 'importJSON', 'full'].includes(s);
  });

  window.RenderPerformance.totalRenders++;
  window.RenderPerformance.activeView = activeView;

  if (isFullRedraw) {
    window.RenderPerformance.fullRenders++;
    renderRoomTabs();
    renderRackSelector();
    renderStats();
    if (typeof renderOutliner === 'function') renderOutliner();
    renderCatalog();
    renderPhysical();
    window._renderState.dirtyPhysical = false;
    renderBottomPanel();
    window._renderState.dirtyBottom = false;
    updateZoomLabel();
    if (activeView === 'topology') {
      if (typeof loadTopoState === 'function') loadTopoState();
      if (typeof initTopoPositions === 'function') initTopoPositions(true);
      if (typeof drawTopo === 'function') drawTopo();
    }
    if (typeof renderTopologySlots === 'function') renderTopologySlots();
    
    const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    window.RenderPerformance.lastRenderDurationMs = Math.round((endTime - startTime) * 100) / 100;
    return;
  }

  window.RenderPerformance.selectiveRenders++;

  const affectedRackIds = new Set();
  const affectedDeviceIds = new Set();
  let hasRoomChange = false;
  let hasRackStructureChange = false;
  let hasDeviceChange = false;
  let hasConnChange = false;
  let hasZoomChange = false;
  let hasCatalogChange = false;
  let hasTopoSlotChange = false;

  for (const e of events) {
    const s = e.source || e.path || '';
    if (s.includes('Room') || s === 'room-rename' || s === 'changeRoom') hasRoomChange = true;
    if (s.includes('Rack')) {
      if ((s === 'updateRack' || s === 'moveDevice' || s === 'addDeviceToRack' || s === 'deleteDevice') && e.rackId) {
        affectedRackIds.add(e.rackId);
      } else {
        hasRackStructureChange = true;
      }
    }
    if (s.includes('Device') || ['addFloorDevice', 'moveDevice', 'deleteDevice', 'updateDevice', 'addDeviceToRack'].includes(s)) {
      hasDeviceChange = true;
      if (e.rackId) affectedRackIds.add(e.rackId);
      if (e.oldRackId) affectedRackIds.add(e.oldRackId);
      if (e.deviceId) affectedDeviceIds.add(e.deviceId);
      if (e.device && e.device.rackId) affectedRackIds.add(e.device.rackId);
    }
    if (s.includes('Connection') || ['addConnection', 'updateConnection', 'deleteConnection', 'swapConnectionDirection', 'toggleConnectionOrientation'].includes(s)) {
      hasConnChange = true;
    }
    if (s.includes('Zoom') || s.includes('Pan')) hasZoomChange = true;
    if (s.includes('Catalog') || s === 'addCustomCatalogItem' || s === 'deleteCustomCatalogItem') hasCatalogChange = true;
    if (s.includes('TopologySlot') || ['saveTopologySlot', 'loadTopologySlot', 'clearTopologySlot', 'renameTopologySlot'].includes(s)) hasTopoSlotChange = true;
  }

  // 1. Zoom / Pan
  if (hasZoomChange) {
    updateZoomLabel();
  }

  // 2. Salas
  if (hasRoomChange) {
    renderRoomTabs();
    renderRackSelector();
    renderStats();
    if (activeView === 'physical') {
      renderPhysical();
      window._renderState.dirtyPhysical = false;
    } else {
      window._renderState.dirtyPhysical = true;
      if (typeof initTopoPositions === 'function') initTopoPositions();
      if (typeof drawTopo === 'function') drawTopo();
    }
    if (typeof renderOutliner === 'function') renderOutliner();
    renderBottomPanel();
    const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    window.RenderPerformance.lastRenderDurationMs = Math.round((endTime - startTime) * 100) / 100;
    return;
  }

  // 3. Catálogo
  if (hasCatalogChange) {
    renderCatalog();
  }

  // 4. Slots de Topología
  if (hasTopoSlotChange) {
    if (typeof renderTopologySlots === 'function') renderTopologySlots();
    if (activeView === 'topology' && typeof drawTopo === 'function') drawTopo();
  }

  // 5. Estadísticas
  if (hasDeviceChange || hasRackStructureChange || hasConnChange) {
    renderStats();
  }

  // 6. Racks (Estructura global: añadir o borrar rack)
  if (hasRackStructureChange) {
    renderRackSelector();
    if (typeof renderOutliner === 'function') renderOutliner();
    if (activeView === 'physical') {
      renderPhysical();
      window._renderState.dirtyPhysical = false;
    } else {
      window._renderState.dirtyPhysical = true;
      if (typeof drawTopo === 'function') drawTopo();
    }
    renderBottomPanel();
    const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    window.RenderPerformance.lastRenderDurationMs = Math.round((endTime - startTime) * 100) / 100;
    return;
  }

  // 7. Dispositivos y Racks individuales
  if (hasDeviceChange || affectedRackIds.size > 0) {
    // Vista Física
    if (activeView === 'physical') {
      let allUpdated = affectedRackIds.size > 0;
      if (allUpdated && typeof window.renderSingleRack === 'function') {
        for (const rid of affectedRackIds) {
          const ok = window.renderSingleRack(rid);
          if (!ok) { allUpdated = false; break; }
        }
      } else {
        allUpdated = false;
      }

      if (!allUpdated) {
        renderPhysical();
      }
      window._renderState.dirtyPhysical = false;
    } else {
      window._renderState.dirtyPhysical = true;
      if (typeof drawTopo === 'function') drawTopo();
    }

    // Outliner
    const outlinerSection = document.getElementById('outliner-section');
    const isOutlinerOpen = !outlinerSection || !outlinerSection.classList.contains('collapsed');
    if (isOutlinerOpen && typeof renderOutliner === 'function') {
      renderOutliner();
    } else {
      window._renderState.dirtyOutliner = true;
    }

    // Inspector selectivo: si la entidad seleccionada fue afectada, refrescarla
    if (window.appState && window.appState.selectedId && typeof window.renderInspector === 'function') {
      if (affectedDeviceIds.has(window.appState.selectedId) || affectedRackIds.has(window.appState.selectedId)) {
        window.renderInspector(window.appState.selectedType, window.appState.selectedId);
      }
    }

    // Panel Inferior (Tablas)
    const bottomEl = document.getElementById('bottom');
    const isBottomVisible = bottomEl && bottomEl.offsetHeight > 45;
    if (isBottomVisible) {
      renderBottomPanel();
      window._renderState.dirtyBottom = false;
    } else {
      window._renderState.dirtyBottom = true;
    }
  }

  // 8. Conexiones
  if (hasConnChange) {
    if (activeView === 'physical') {
      if (typeof drawPhysicalCables === 'function') {
        requestAnimationFrame(() => setTimeout(drawPhysicalCables, 20));
      }
    } else if (activeView === 'topology') {
      if (typeof drawTopo === 'function') drawTopo();
    }
    
    const bottomEl = document.getElementById('bottom');
    const isBottomVisible = bottomEl && bottomEl.offsetHeight > 45;
    if (isBottomVisible) {
      renderBottomPanel();
      window._renderState.dirtyBottom = false;
    } else {
      window._renderState.dirtyBottom = true;
    }
  }

  const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  window.RenderPerformance.lastRenderDurationMs = Math.round((endTime - startTime) * 100) / 100;
}

function renderAll(event = {}) {
  const source = event.source || event.path || '';
  
  // En eventos síncronos forzados o en entornos sin requestAnimationFrame
  const isSync = event.immediate || !source || ['loadData', 'undo', 'redo', 'importJSON', 'full'].includes(source) || typeof requestAnimationFrame !== 'function';

  if (isSync) {
    if (_queuedRenderEvents.length > 0) {
      _queuedRenderEvents.push(event);
      flushRenderQueue();
    } else {
      _executeRenderAll([event]);
    }
    return;
  }

  // Agrupamiento (Coalescing) a 60 FPS con requestAnimationFrame
  _queuedRenderEvents.push(event);
  if (!_rafRenderId) {
    _rafRenderId = requestAnimationFrame(() => {
      _rafRenderId = null;
      flushRenderQueue();
    });
  }
}
renderAll.flush = flushRenderQueue;
renderAll.stats = window.RenderPerformance;
window.renderAll = renderAll;

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
    store.setZoom(currentView, Math.min(3, Math.round(((store._raw[pfx+'Zoom'] || 1) + 0.1) * 10) / 10));
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    const pfx = currentView === 'physical' ? 'phys' : 'topo';
    store.setZoom(currentView, Math.max(0.2, Math.round(((store._raw[pfx+'Zoom'] || 1) - 0.1) * 10) / 10));
    updateZoomLabel();
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    store.setZoom(currentView, 1);
    store.setPan(currentView, 0, 0);
    updateZoomLabel();
  });
  
  // Popover de personalización de topología
  const btnTopoStyle = document.getElementById('btn-topo-style');
  const topoDropdown = document.getElementById('topo-style-dropdown');
  const btnTopoStyleClose = document.getElementById('btn-topo-style-close');
  const btnLayoutRacks = document.getElementById('topo-layout-racks');
  const btnLayoutTree = document.getElementById('topo-layout-tree');
  const btnOptCard = document.getElementById('topo-opt-card');
  const btnOptCircle = document.getElementById('topo-opt-circle');
  const btnOptImage = document.getElementById('topo-opt-image');
  const topoPatternSelect = document.getElementById('topo-pattern-select');
  const topoAlphaSlider = document.getElementById('topo-alpha-slider');
  const topoAlphaVal = document.getElementById('topo-alpha-val');
  const topoInheritColors = document.getElementById('topo-inherit-colors');
  const topoLabelsSection = document.getElementById('topo-labels-section');
  const topoLabelPreset = document.getElementById('topo-label-preset');
  const topoNamePos = document.getElementById('topo-name-pos');
  const topoIpPos = document.getElementById('topo-ip-pos');

  function syncTopoStyleUI() {
    const isTree = (window.TOPO_LAYOUT_MODE || 'racks') === 'tree';
    if (btnLayoutRacks && btnLayoutTree) {
      if (!isTree) {
        btnLayoutRacks.style.borderColor = 'var(--accent)';
        btnLayoutRacks.style.color = 'var(--accent)';
        btnLayoutRacks.style.background = 'rgba(56, 189, 248, 0.15)';
        btnLayoutTree.style.borderColor = '';
        btnLayoutTree.style.color = '';
        btnLayoutTree.style.background = '';
      } else {
        btnLayoutTree.style.borderColor = 'var(--accent)';
        btnLayoutTree.style.color = 'var(--accent)';
        btnLayoutTree.style.background = 'rgba(56, 189, 248, 0.15)';
        btnLayoutRacks.style.borderColor = '';
        btnLayoutRacks.style.color = '';
        btnLayoutRacks.style.background = '';
      }
    }

    const activeStyle = window.TOPOLOGY_STYLE || 'card';
    const styleBtns = [
      { btn: btnOptCard, style: 'card' },
      { btn: btnOptCircle, style: 'circle' },
      { btn: btnOptImage, style: 'image' }
    ];

    styleBtns.forEach(({ btn, style }) => {
      if (!btn) return;
      if (activeStyle === style) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
        btn.style.background = 'rgba(56, 189, 248, 0.15)';
      } else {
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.style.background = '';
      }
    });

    if (topoLabelsSection) {
      topoLabelsSection.style.display = (activeStyle === 'circle') ? 'block' : 'none';
    }
    if (topoLabelPreset) {
      topoLabelPreset.value = window.TOPO_LABEL_PRESET || 'separated';
    }
    if (topoNamePos) {
      topoNamePos.value = window.TOPO_NAME_POS || 'bottom';
    }
    if (topoIpPos) {
      topoIpPos.value = window.TOPO_IP_POS || 'top';
    }
    if (topoPatternSelect && window.TOPO_BG_PATTERN) {
      topoPatternSelect.value = window.TOPO_BG_PATTERN;
    }
    if (topoAlphaSlider && window.TOPO_ALPHA !== undefined) {
      topoAlphaSlider.value = Math.round(window.TOPO_ALPHA * 100);
      if (topoAlphaVal) topoAlphaVal.textContent = `${Math.round(window.TOPO_ALPHA * 100)}%`;
    }
    if (topoInheritColors && window.TOPO_INHERIT_COLORS !== undefined) {
      topoInheritColors.checked = window.TOPO_INHERIT_COLORS;
    }
  }

  if (topoLabelPreset) {
    topoLabelPreset.addEventListener('change', (e) => {
      const p = e.target.value;
      window.TOPO_LABEL_PRESET = p;
      if (p === 'separated') {
        window.TOPO_NAME_POS = 'bottom';
        window.TOPO_IP_POS = 'top';
      } else if (p === 'separated_inv') {
        window.TOPO_NAME_POS = 'top';
        window.TOPO_IP_POS = 'bottom';
      } else if (p === 'together_bottom') {
        window.TOPO_NAME_POS = 'bottom';
        window.TOPO_IP_POS = 'bottom';
      } else if (p === 'together_top') {
        window.TOPO_NAME_POS = 'top';
        window.TOPO_IP_POS = 'top';
      } else if (p === 'together_right') {
        window.TOPO_NAME_POS = 'right';
        window.TOPO_IP_POS = 'right';
      } else if (p === 'together_left') {
        window.TOPO_NAME_POS = 'left';
        window.TOPO_IP_POS = 'left';
      }
      if (topoNamePos) topoNamePos.value = window.TOPO_NAME_POS;
      if (topoIpPos) topoIpPos.value = window.TOPO_IP_POS;
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  function handleCustomLabelPosChange() {
    const nPos = topoNamePos ? topoNamePos.value : 'bottom';
    const iPos = topoIpPos ? topoIpPos.value : 'top';
    window.TOPO_NAME_POS = nPos;
    window.TOPO_IP_POS = iPos;
    
    if (nPos === 'bottom' && iPos === 'top') window.TOPO_LABEL_PRESET = 'separated';
    else if (nPos === 'top' && iPos === 'bottom') window.TOPO_LABEL_PRESET = 'separated_inv';
    else if (nPos === 'bottom' && iPos === 'bottom') window.TOPO_LABEL_PRESET = 'together_bottom';
    else if (nPos === 'top' && iPos === 'top') window.TOPO_LABEL_PRESET = 'together_top';
    else if (nPos === 'right' && iPos === 'right') window.TOPO_LABEL_PRESET = 'together_right';
    else if (nPos === 'left' && iPos === 'left') window.TOPO_LABEL_PRESET = 'together_left';
    else window.TOPO_LABEL_PRESET = 'custom';

    if (topoLabelPreset) topoLabelPreset.value = window.TOPO_LABEL_PRESET;
    if (typeof saveTopo === 'function') saveTopo();
    if (typeof drawTopo === 'function') drawTopo();
  }

  if (topoNamePos) topoNamePos.addEventListener('change', handleCustomLabelPosChange);
  if (topoIpPos) topoIpPos.addEventListener('change', handleCustomLabelPosChange);

  if (btnLayoutRacks) {
    btnLayoutRacks.addEventListener('click', () => {
      if (typeof applyTopoLayoutMode === 'function') {
        applyTopoLayoutMode('racks');
      }
      syncTopoStyleUI();
    });
  }

  if (btnLayoutTree) {
    btnLayoutTree.addEventListener('click', () => {
      if (typeof applyTopoLayoutMode === 'function') {
        applyTopoLayoutMode('tree');
      }
      syncTopoStyleUI();
    });
  }

  if (btnTopoStyle && topoDropdown) {
    btnTopoStyle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !topoDropdown.classList.contains('hidden');
      if (isOpen) {
        topoDropdown.classList.add('hidden');
        btnTopoStyle.setAttribute('aria-expanded', 'false');
      } else {
        syncTopoStyleUI();
        topoDropdown.classList.remove('hidden');
        btnTopoStyle.setAttribute('aria-expanded', 'true');
      }
    });

    if (btnTopoStyleClose) {
      btnTopoStyleClose.addEventListener('click', () => {
        topoDropdown.classList.add('hidden');
        btnTopoStyle.setAttribute('aria-expanded', 'false');
      });
    }

    topoDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
      if (!topoDropdown.contains(e.target) && e.target !== btnTopoStyle) {
        topoDropdown.classList.add('hidden');
        btnTopoStyle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (btnOptCard) {
    btnOptCard.addEventListener('click', () => {
      window.TOPOLOGY_STYLE = 'card';
      syncTopoStyleUI();
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  if (btnOptCircle) {
    btnOptCircle.addEventListener('click', () => {
      window.TOPOLOGY_STYLE = 'circle';
      syncTopoStyleUI();
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  if (btnOptImage) {
    btnOptImage.addEventListener('click', () => {
      window.TOPOLOGY_STYLE = 'image';
      syncTopoStyleUI();
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  if (topoPatternSelect) {
    topoPatternSelect.addEventListener('change', (e) => {
      window.TOPO_BG_PATTERN = e.target.value;
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  if (topoAlphaSlider) {
    topoAlphaSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      window.TOPO_ALPHA = val / 100;
      if (topoAlphaVal) topoAlphaVal.textContent = `${val}%`;
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  if (topoInheritColors) {
    topoInheritColors.addEventListener('change', (e) => {
      window.TOPO_INHERIT_COLORS = e.target.checked;
      if (typeof saveTopo === 'function') saveTopo();
      if (typeof drawTopo === 'function') drawTopo();
    });
  }

  const spacingSlider = document.getElementById('topo-spacing');
  const spacingVal = document.getElementById('topo-spacing-val');
  if (spacingSlider) {
    spacingSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (spacingVal) spacingVal.textContent = `${val}px`;
      if (typeof recalcTopoSpacing === 'function') {
        recalcTopoSpacing(val);
      }
    });
  }

  const spacingSliderX = document.getElementById('topo-spacing-x');
  const spacingXVal = document.getElementById('topo-spacing-x-val');
  if (spacingSliderX) {
    spacingSliderX.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (spacingXVal) spacingXVal.textContent = `${val}px`;
      if (typeof recalcTopoSpacingX === 'function') {
        recalcTopoSpacingX(val);
      }
    });
  }

  const btnAutoOrder = document.getElementById('btn-topo-autoorder');
  if (btnAutoOrder) {
    btnAutoOrder.addEventListener('click', () => {
      if (typeof autoOrderTopo === 'function') autoOrderTopo();
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // M-40: Ranuras de Memoria de Topología (5 Slots de Posiciones)
  // ──────────────────────────────────────────────────────────────────
  const btnTopoSlotsMenu = document.getElementById('btn-topo-slots-menu');
  const topoSlotsDropdown = document.getElementById('topo-slots-dropdown');
  const btnTopoSlotsClose = document.getElementById('btn-topo-slots-close');
  const btnTopoSlotsQuickSave = document.getElementById('btn-topo-slots-quick-save');
  const topoSlotsBar = document.getElementById('topo-slots-bar');
  const topoSlotsList = document.getElementById('topo-slots-list');

  function renderTopologySlots() {
    if (!topoSlotsBar) return;
    const slots = (typeof store !== 'undefined' && typeof store.getTopologySlots === 'function')
      ? store.getTopologySlots()
      : [null, null, null, null, null];
    const activeSlot = (typeof store !== 'undefined' && store._raw)
      ? store._raw.activeTopologySlot
      : null;

    // 1. Renderizar los 5 botones compactos en la barra
    topoSlotsBar.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const slot = slots[i];
      const isSaved = !!slot;
      const isActive = activeSlot === i;
      const btn = document.createElement('button');
      btn.className = `topo-slot-btn ${isSaved ? 'saved' : 'empty'} ${isActive ? 'active' : ''}`;
      btn.setAttribute('data-slot', i);
      btn.textContent = (i + 1);
      const tipText = isSaved 
        ? `Slot ${i + 1}: "${slot.name}" (Clic para cargar)` 
        : `Slot ${i + 1}: Vacío (Clic para guardar posición actual)`;
      btn.title = tipText;
      btn.setAttribute('aria-label', tipText);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isSaved) {
          if (typeof window.applyTopologySlot === 'function') {
            window.applyTopologySlot(i);
          }
        } else {
          if (typeof window.saveCurrentToTopologySlot === 'function') {
            window.saveCurrentToTopologySlot(i);
          }
        }
      });
      topoSlotsBar.appendChild(btn);
    }

    // Actualizar indicador compacto (para <= 1100px)
    const compactNum = document.getElementById('topo-slots-compact-num');
    if (compactNum) {
      compactNum.textContent = activeSlot !== null ? `[${activeSlot + 1}]` : '';
    }

    // 2. Renderizar lista detallada en el dropdown si existe
    if (topoSlotsList) {
      topoSlotsList.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const slot = slots[i];
        const isSaved = !!slot;
        const isActive = activeSlot === i;

        const card = document.createElement('div');
        card.className = `topo-slot-card ${isActive ? 'active-slot' : ''}`;

        const header = document.createElement('div');
        header.className = 'topo-slot-card-header';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'topo-slot-card-title';
        titleDiv.innerHTML = `<span style="color:${isActive ? 'var(--accent)' : 'var(--text-muted)'}; font-family:var(--font-mono); font-weight:700;">[${i + 1}]</span> <span>${escapeHTML(isSaved ? slot.name : 'Ranura Vacía')}</span>`;

        const timeSpan = document.createElement('span');
        timeSpan.style.cssText = 'font-size:10px; color:var(--text-muted); font-family:var(--font-mono);';
        if (isSaved && slot.savedAt) {
          const d = new Date(slot.savedAt);
          timeSpan.textContent = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          timeSpan.title = `Guardado: ${d.toLocaleString()}`;
        } else {
          timeSpan.textContent = 'Libre';
        }

        header.appendChild(titleDiv);
        header.appendChild(timeSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'topo-slot-card-actions';

        if (isSaved) {
          // Botón Cargar
          const btnLoad = document.createElement('button');
          btnLoad.className = 'topo-slot-action-btn';
          btnLoad.innerHTML = '▶ Cargar';
          btnLoad.title = 'Cargar este estado en la vista de topología';
          btnLoad.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.applyTopologySlot === 'function') window.applyTopologySlot(i);
          });
          actionsDiv.appendChild(btnLoad);

          // Botón Sobrescribir
          const btnSave = document.createElement('button');
          btnSave.className = 'topo-slot-action-btn';
          btnSave.innerHTML = '💾 Guardar';
          btnSave.title = 'Sobrescribir ranura con las posiciones actuales';
          btnSave.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.saveCurrentToTopologySlot === 'function') window.saveCurrentToTopologySlot(i);
          });
          actionsDiv.appendChild(btnSave);

          // Botón Renombrar
          const btnRen = document.createElement('button');
          btnRen.className = 'topo-slot-action-btn';
          btnRen.innerHTML = '✏️';
          btnRen.title = 'Renombrar esta vista';
          btnRen.addEventListener('click', (e) => {
            e.stopPropagation();
            const newName = prompt(`Nuevo nombre para la Vista ${i + 1}:`, slot.name);
            if (newName && newName.trim() && typeof window.renameTopologySlot === 'function') {
              window.renameTopologySlot(i, newName.trim());
            }
          });
          actionsDiv.appendChild(btnRen);

          // Botón Vaciar
          const btnClr = document.createElement('button');
          btnClr.className = 'topo-slot-action-btn btn-danger';
          btnClr.innerHTML = '🗑️';
          btnClr.title = 'Vaciar esta ranura de memoria';
          btnClr.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`¿Vaciar la Ranura ${i + 1} ("${slot.name}")?`)) {
              if (typeof window.clearTopologySlot === 'function') window.clearTopologySlot(i);
            }
          });
          actionsDiv.appendChild(btnClr);
        } else {
          // Botón Guardar aquí
          const btnSaveHere = document.createElement('button');
          btnSaveHere.className = 'topo-slot-action-btn';
          btnSaveHere.style.cssText = 'flex:1; justify-content:center;';
          btnSaveHere.innerHTML = '💾 Guardar Posición Actual';
          btnSaveHere.title = 'Guardar la topología actual en esta ranura vacía';
          btnSaveHere.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.saveCurrentToTopologySlot === 'function') window.saveCurrentToTopologySlot(i);
          });
          actionsDiv.appendChild(btnSaveHere);
        }

        card.appendChild(header);
        card.appendChild(actionsDiv);
        topoSlotsList.appendChild(card);
      }
    }
  }

  window.renderTopologySlots = renderTopologySlots;

  if (btnTopoSlotsMenu && topoSlotsDropdown) {
    btnTopoSlotsMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = topoSlotsDropdown.classList.contains('hidden');
      if (isHidden) {
        renderTopologySlots();
        topoSlotsDropdown.classList.remove('hidden');
        btnTopoSlotsMenu.setAttribute('aria-expanded', 'true');
      } else {
        topoSlotsDropdown.classList.add('hidden');
        btnTopoSlotsMenu.setAttribute('aria-expanded', 'false');
      }
    });

    if (btnTopoSlotsClose) {
      btnTopoSlotsClose.addEventListener('click', () => {
        topoSlotsDropdown.classList.add('hidden');
        btnTopoSlotsMenu.setAttribute('aria-expanded', 'false');
      });
    }

    topoSlotsDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    const compactBtn = document.getElementById('topo-slots-compact-btn');
    if (compactBtn) {
      compactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        btnTopoSlotsMenu.click();
      });
    }

    document.addEventListener('click', (e) => {
      if (!topoSlotsDropdown.contains(e.target) && !btnTopoSlotsMenu.contains(e.target) && !(compactBtn && compactBtn.contains(e.target))) {
        topoSlotsDropdown.classList.add('hidden');
        btnTopoSlotsMenu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (btnTopoSlotsQuickSave) {
    btnTopoSlotsQuickSave.addEventListener('click', (e) => {
      e.stopPropagation();
      const slots = store.getTopologySlots();
      let targetIdx = slots.findIndex(s => s === null);
      if (targetIdx === -1) {
        targetIdx = (store._raw.activeTopologySlot !== null && store._raw.activeTopologySlot !== undefined)
          ? store._raw.activeTopologySlot
          : 0;
      }
      if (typeof window.saveCurrentToTopologySlot === 'function') {
        window.saveCurrentToTopologySlot(targetIdx);
      }
    });
  }

  const statusDot = document.querySelector('.status-dot');
  if (statusDot) {
    statusDot.style.cursor = 'pointer';
    statusDot.addEventListener('click', () => {
      const isOff = document.body.classList.toggle('no-animations');
      statusDot.setAttribute('data-tip', isOff ? 'Animaciones: Apagadas' : 'Sistema operativo');
      statusDot.style.background = isOff ? '#f59e0b' : '';
      if (typeof notify === 'function') {
        notify(isOff ? 'Animaciones apagadas' : 'Animaciones activadas', 'info', 2000);
      }
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
        store.setPan('physical', panOrig.x + (e.clientX - physPanStart.x) / z, panOrig.y + (e.clientY - physPanStart.y) / z);
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
      const btnStyle = document.getElementById('btn-topo-style');
      const spacingGroup = document.getElementById('topo-spacing-group');
      const spacingSlider = document.getElementById('topo-spacing');
      const btnAutoOrd = document.getElementById('btn-topo-autoorder');
      const btnCables = document.getElementById('btn-toggle-cables');
      const btnCableMode = document.getElementById('btn-cable-mode');
      const topoSlotsGroup = document.getElementById('topo-slots-group');
      const topoSlotsDropdown = document.getElementById('topo-slots-dropdown');
      if (currentView === 'physical') {
        phys.classList.remove('hidden');
        topo.style.display = 'none';
        const topoDropdown = document.getElementById('topo-style-dropdown');
        if (topoDropdown) topoDropdown.classList.add('hidden');
        if (topoSlotsDropdown) topoSlotsDropdown.classList.add('hidden');
        if (btnStyle) btnStyle.classList.add('force-hide');
        if (spacingGroup) spacingGroup.classList.add('force-hide');
        if (spacingSlider) spacingSlider.classList.add('force-hide');
        if (btnAutoOrd) btnAutoOrd.classList.add('force-hide');
        if (topoSlotsGroup) topoSlotsGroup.classList.add('force-hide');
        if (btnCables) btnCables.classList.remove('force-hide');
        if (btnCableMode) btnCableMode.classList.remove('force-hide');
        stopTopo();
        if (window._renderState && window._renderState.dirtyPhysical) {
          renderPhysical();
          window._renderState.dirtyPhysical = false;
        }
      } else {
        phys.classList.add('hidden');
        topo.style.display = 'block';
        if (btnStyle) btnStyle.classList.remove('force-hide');
        if (spacingGroup) spacingGroup.classList.remove('force-hide');
        if (spacingSlider) spacingSlider.classList.remove('force-hide');
        if (btnAutoOrd) btnAutoOrd.classList.remove('force-hide');
        if (topoSlotsGroup) topoSlotsGroup.classList.remove('force-hide');
        if (btnCables) btnCables.classList.add('force-hide');
        if (btnCableMode) btnCableMode.classList.add('force-hide');
        if (typeof window.exitInteractiveCableMode === 'function') window.exitInteractiveCableMode();
        if (typeof renderTopologySlots === 'function') renderTopologySlots();
        startTopo();
        if (window._renderState && window._renderState.dirtyTopology) {
          if (typeof drawTopo === 'function') drawTopo();
          window._renderState.dirtyTopology = false;
        }
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
      if (!dropdown.contains(e.target) && !btnMenu.contains(e.target)) dropdown.classList.add('hidden');
      if (!e.target.closest('.rack-hdr-btns')) {
        document.querySelectorAll('.dropdown-menu[id^="rack-menu-"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.rack-wrapper.menu-open').forEach(w => w.classList.remove('menu-open'));
      }
      
      // Close nav dropdowns
      if (!e.target.closest('.nav-dropdown-wrapper')) {
        document.querySelectorAll('.nav-dropdown-list').forEach(list => list.classList.add('hidden'));
      }
    });

    document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const wrapper = btn.closest('.nav-dropdown-wrapper');
        const list = wrapper.querySelector('.nav-dropdown-list');
        // Close others
        document.querySelectorAll('.nav-dropdown-list').forEach(l => {
          if (l !== list) l.classList.add('hidden');
        });
        list.classList.toggle('hidden');
      });
    });

    const THEMES = [
      { id: 'dark',  name: 'Oscuro', icon: 'icon-moon',   dataTheme: null },
      { id: 'light', name: 'Claro',  icon: 'icon-sun',    dataTheme: 'light' },
      { id: 'sepia', name: 'Sepia',  icon: 'icon-coffee', dataTheme: 'sepia' }
    ];

    window.getCurrentTheme = function() {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'sepia') return 'sepia';
      if (attr === 'light') return 'light';
      return 'dark';
    };

    window.applyTheme = function(themeId, notifyUser = false) {
      const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
      if (theme.dataTheme) {
        document.documentElement.setAttribute('data-theme', theme.dataTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', theme.id);

      // Actualizar botón de la cabecera
      const toggleIcon = document.getElementById('theme-toggle-icon');
      const toggleLabel = document.getElementById('theme-toggle-label');
      const toggleBtn = document.getElementById('btn-theme-toggle');
      if (toggleIcon) {
        toggleIcon.className = `svg-icon ${theme.icon}`;
      }
      if (toggleLabel) {
        toggleLabel.textContent = theme.name;
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('data-tip', `Tema: ${theme.name} (Clic para alternar)`);
      }

      // Actualizar elemento en el menú del proyecto
      const menuTheme = document.getElementById('menu-theme');
      if (menuTheme) {
        menuTheme.innerHTML = `<i class="svg-icon ${theme.icon}" style="width:14px;height:14px;margin-right:6px;"></i>Tema: ${theme.name}`;
      }

      // Redibujar topología si está activa
      if (window.drawTopo && typeof drawTopo === 'function') {
        try { drawTopo(); } catch(e) {}
      }

      if (notifyUser && typeof notify === 'function') {
        notify(`Tema cambiado a ${theme.name}`, 'info', 1500);
      }
      return theme.id;
    };

    window.toggleThemeCycle = function(notifyUser = true) {
      const current = window.getCurrentTheme();
      const currentIndex = THEMES.findIndex(t => t.id === current);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      return window.applyTheme(THEMES[nextIndex].id, notifyUser);
    };

    // Vincular botón directo en la cabecera
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      window.toggleThemeCycle(true);
    });

    // Vincular opción en el menú del proyecto
    document.getElementById('menu-theme')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      window.toggleThemeCycle(true);
    });

    // Inicializar estado del tema actual
    const initialTheme = localStorage.getItem('theme') || (document.documentElement.getAttribute('data-theme') || 'dark');
    window.applyTheme(initialTheme, false);

    window.SHOW_PASSWORDS = false;
    document.getElementById('menu-toggle-passwords')?.addEventListener('click', (e) => {
      if (!RackAuth.can('toggleGodMode')) {
        notify('Solo administradores pueden activar el Modo Dios.', 'error', 3000);
        dropdown.classList.add('hidden');
        return;
      }
      dropdown.classList.add('hidden');
      window.SHOW_PASSWORDS = !window.SHOW_PASSWORDS;
      document.getElementById('menu-toggle-passwords').innerHTML = window.SHOW_PASSWORDS ? '<i class="svg-icon icon-eye-off" style="width:14px;height:14px;margin-right:6px;"></i>Modo Dios: Ocultar Claves' : '<i class="svg-icon icon-eye" style="width:14px;height:14px;margin-right:6px;"></i>Modo Dios: Revelar Claves';
      renderAll();
    });

    initChangePinModal();

    document.getElementById('menu-open')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (typeof fileManager !== 'undefined') fileManager.openProject();
      else document.getElementById('import-file').click();
    });
    document.getElementById('menu-save')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden guardar proyectos.', 'error', 3000);
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
        notify('Espectadores no pueden guardar proyectos.', 'error', 3000);
        return;
      }
      if (typeof fileManager !== 'undefined') fileManager.saveProjectAs();
    });
    document.getElementById('menu-clear')?.addEventListener('click', async () => {
      dropdown.classList.add('hidden');
      if (!RackAuth.can('clearProject')) {
        notify('Espectadores no pueden limpiar el proyecto.', 'error', 3000);
        return;
      }
      const ok = await customConfirm('Limpiar Proyecto', '¿Estás seguro de que deseas limpiar el proyecto? Perderás todos los datos no guardados.');
      if (ok) {
        const roomId = uid();
        store.loadData({
          rooms: [{ id: roomId, name: 'Sala A1' }],
          racks: [],
          devices: [],
          connections: [],
          customCatalog: [],
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
    function openDemoSelectionModal() {
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden cargar demostraciones.', 'error', 3000);
        return;
      }
      const modal = document.getElementById('modal-demo-selection');
      if (modal) {
        modal.classList.remove('hidden');
      } else {
        executeLoadDemo('tia942');
      }
    }
    window.openDemoSelectionModal = openDemoSelectionModal;

    async function executeLoadDemo(demoType) {
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden cargar demostraciones.', 'error', 3000);
        return;
      }
      const wantSave = await customConfirm('Guardar Respaldo', '¿Deseas guardar una copia de tu proyecto actual antes de cargar la demostración?\n\n(Recomendado para no perder tu progreso)');
      if (!wantSave) {
        const proceed = await customConfirm('Advertencia', 'ADVERTENCIA: Todo tu diseño actual se perderá de forma permanente.\n\n¿Estás seguro de que quieres continuar SIN GUARDAR?');
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
        if (demoType === 'university' && typeof window.loadUniversityDemoData === 'function') {
          window.loadUniversityDemoData();
        } else if (typeof window.loadDemoData === 'function') {
          window.loadDemoData(demoType);
        } else {
          notify('Error: no se pudo cargar el módulo de demos', 'error');
          return;
        }

        if (typeof fileManager !== 'undefined') {
          fileManager.fileHandle = null;
          fileManager.fileName = demoType === 'university' ? 'Campus UTN' : 'Proyecto Demo';
          fileManager.updateUI();
        }
        document.getElementById('modal-demo-selection')?.classList.add('hidden');
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
    }

    document.getElementById('menu-demo')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      openDemoSelectionModal();
    });

    document.getElementById('btn-load-demo-tia942')?.addEventListener('click', () => {
      executeLoadDemo('tia942');
    });

    document.getElementById('btn-load-demo-utn')?.addEventListener('click', () => {
      executeLoadDemo('university');
    });

    document.getElementById('card-demo-tia942')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-load-demo-tia942')) return;
      executeLoadDemo('tia942');
    });

    document.getElementById('card-demo-utn')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-load-demo-utn')) return;
      executeLoadDemo('university');
    });

    document.getElementById('btn-close-demo-modal')?.addEventListener('click', () => {
      document.getElementById('modal-demo-selection')?.classList.add('hidden');
    });

    document.getElementById('modal-demo-selection')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-demo-selection') {
        e.target.classList.add('hidden');
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
    document.getElementById('menu-import-devices')?.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      if (typeof openImportModal === 'function') {
        openImportModal();
      }
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

    window.closeMobileDrawers = () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
      const rightPanel = document.getElementById('right-panel');
      if (rightPanel) rightPanel.classList.remove('open');
      const mobileOverlay = document.getElementById('mobile-overlay');
      if (mobileOverlay) mobileOverlay.classList.add('hidden');
    };
    window.closeMobileSidebar = window.closeMobileDrawers;

    window.openMobileRightPanel = () => {
      const rightPanel = document.getElementById('right-panel');
      if (rightPanel) rightPanel.classList.add('open');
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
      const mobileOverlay = document.getElementById('mobile-overlay');
      if (mobileOverlay) mobileOverlay.classList.remove('hidden');
    };

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        const willOpen = !sidebar.classList.contains('open');
        if (willOpen) {
          if (typeof openFlyout === 'function') {
            openFlyout(typeof currentFlyoutCategory !== 'undefined' && currentFlyoutCategory ? currentFlyoutCategory : 'all');
          }
          sidebar.classList.add('open');
          const rightPanel = document.getElementById('right-panel');
          if (rightPanel) rightPanel.classList.remove('open');
          const mobileOverlay = document.getElementById('mobile-overlay');
          if (mobileOverlay) mobileOverlay.classList.remove('hidden');
        } else {
          window.closeMobileDrawers();
        }
      });
    }
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', window.closeMobileDrawers);
    }
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    if (btnCloseSidebar) {
      btnCloseSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
        window.closeMobileDrawers();
      });
    }
    const btnCloseRightPanel = document.getElementById('btn-close-right-panel');
    if (btnCloseRightPanel) {
      btnCloseRightPanel.addEventListener('click', (e) => {
        e.stopPropagation();
        window.closeMobileDrawers();
      });
    }
  }

  // Bottom panel tabs
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      setActiveTab(pill.dataset.tab);
      if (typeof window !== 'undefined' && window.innerWidth <= 768 && bottomCollapsed) {
        toggleMobileBottomSheet(true);
      } else {
        renderBottomPanel();
      }
    });
  });

  // M-25A Paso 3.5: Redimensionamiento manual de altura (Drag-to-Resize)
  const bottomResizer = document.getElementById('bottom-resizer');
  const bottomPanel = document.getElementById('bottom');
  const btnCollapseBottom = document.getElementById('btn-collapse-bottom');

  const DEFAULT_BOTTOM_HEIGHT = window.innerWidth <= 1366 ? 200 : 220;
  const STORAGE_KEY_BOTTOM_HEIGHT = 'RACK_BOTTOM_PANEL_HEIGHT';

  let savedBottomH = parseInt(localStorage.getItem(STORAGE_KEY_BOTTOM_HEIGHT), 10);
  let currentBottomH = (!isNaN(savedBottomH) && savedBottomH >= 120 && savedBottomH <= 500)
    ? savedBottomH
    : DEFAULT_BOTTOM_HEIGHT;

  function setBottomHeight(h, save = true) {
    if (!bottomPanel) return;
    const maxHeight = Math.max(250, Math.floor((window.innerHeight || 800) * 0.65));
    const clampedH = Math.max(120, Math.min(maxHeight, Math.min(500, Math.round(h))));
    currentBottomH = clampedH;
    if (document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
      document.documentElement.style.setProperty('--bottom-h', `${clampedH}px`);
    }
    if (!bottomCollapsed && !bottomPanel.classList.contains('fullscreen')) {
      bottomPanel.style.height = `${clampedH}px`;
    }
    if (save) {
      try { localStorage.setItem(STORAGE_KEY_BOTTOM_HEIGHT, clampedH); } catch(e) {}
    }
  }

  // Inicializar --bottom-h con la altura guardada
  if (document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
    document.documentElement.style.setProperty('--bottom-h', `${currentBottomH}px`);
  }

  let bottomCollapsed = true;
  if (bottomPanel) bottomPanel.style.height = '38px';
  if (btnCollapseBottom) btnCollapseBottom.textContent = '▲';

  function toggleMobileBottomSheet(expand) {
    if (!bottomPanel) return;
    const shouldExpand = (typeof expand === 'boolean') ? expand : bottomCollapsed;
    bottomCollapsed = !shouldExpand;
    if (shouldExpand) {
      if (window.innerWidth <= 768) {
        bottomPanel.classList.add('sheet-expanded');
        bottomPanel.style.height = '72vh';
      } else {
        bottomPanel.classList.remove('sheet-expanded');
        bottomPanel.style.height = `${currentBottomH}px`;
      }
      if (btnCollapseBottom) btnCollapseBottom.textContent = '▼';
      if (window._renderState && window._renderState.dirtyBottom) {
        renderBottomPanel();
        window._renderState.dirtyBottom = false;
      }
    } else {
      if (window.innerWidth <= 768) {
        bottomPanel.classList.remove('sheet-expanded');
      }
      bottomPanel.style.height = '38px';
      if (btnCollapseBottom) btnCollapseBottom.textContent = '▲';
    }
  }

  if (btnCollapseBottom && bottomPanel) {
    btnCollapseBottom.addEventListener('click', () => {
      toggleMobileBottomSheet();
    });
  }

  if (bottomResizer && bottomPanel) {
    let isDragging = false;
    let startY = 0;
    let startH = 0;

    bottomResizer.addEventListener('pointerdown', (e) => {
      if (bottomCollapsed || bottomPanel.classList.contains('fullscreen')) return;
      isDragging = true;
      startY = e.clientY;
      startH = bottomPanel.getBoundingClientRect().height;
      bottomResizer.setPointerCapture(e.pointerId);
      bottomResizer.classList.add('is-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    });

    bottomResizer.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      setBottomHeight(startH + deltaY, false);
    });

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      bottomResizer.classList.remove('is-resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setBottomHeight(currentBottomH, true);
    };

    bottomResizer.addEventListener('pointerup', stopDragging);
    bottomResizer.addEventListener('pointercancel', stopDragging);

    bottomResizer.addEventListener('dblclick', () => {
      setBottomHeight(DEFAULT_BOTTOM_HEIGHT, true);
    });

    bottomResizer.addEventListener('click', () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        toggleMobileBottomSheet();
      }
    });
  }

  const globalSearchInput = document.getElementById('global-search');
  const globalSearchWrap = document.getElementById('h-search-wrap');
  const btnToggleGlobalSearch = document.getElementById('btn-toggle-global-search');
  const btnClearGlobalSearch = document.getElementById('btn-clear-global-search');

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', () => {
      if (btnClearGlobalSearch) {
        btnClearGlobalSearch.style.display = globalSearchInput.value ? 'block' : 'none';
      }
      renderPhysical();
    });
  }

  if (btnToggleGlobalSearch && globalSearchWrap) {
    btnToggleGlobalSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = globalSearchWrap.classList.toggle('is-open');
      if (isOpen && globalSearchInput) {
        globalSearchInput.focus();
        globalSearchInput.select();
      }
    });
  }

  if (btnClearGlobalSearch && globalSearchInput) {
    btnClearGlobalSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      globalSearchInput.value = '';
      btnClearGlobalSearch.style.display = 'none';
      renderPhysical();
      globalSearchInput.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (globalSearchWrap && globalSearchWrap.classList.contains('is-open')) {
      if (!globalSearchWrap.contains(e.target)) {
        globalSearchWrap.classList.remove('is-open');
      }
    }
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

  // Soporte para desplazamiento horizontal fluido con rueda del ratón en la barra del lienzo
  const mainToolbarEl = document.querySelector('.main-toolbar');
  if (mainToolbarEl) {
    mainToolbarEl.addEventListener('wheel', (e) => {
      // Bloquear estrictamente cualquier scroll vertical al interactuar con la barra
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      mainToolbarEl.scrollLeft += delta;
    }, { passive: false });

    // Garantizar que la barra nunca retenga desplazamiento vertical
    mainToolbarEl.addEventListener('scroll', () => {
      if (mainToolbarEl.scrollTop !== 0) {
        mainToolbarEl.scrollTop = 0;
      }
    });
  }

  // Header buttons
  document.getElementById('btn-add-rack').addEventListener('click', openAddRackModal);
  document.getElementById('btn-add-rack-nav')?.addEventListener('click', openAddRackModal);
  document.getElementById('btn-add-device-modal').addEventListener('click', openAddDeviceModal);
  const addDevTableBtn = document.getElementById('table-btn-add-device');
  if(addDevTableBtn) addDevTableBtn.addEventListener('click', () => openQuickPlacementModal(null));
  
  const checkboxCables = document.getElementById('checkbox-toggle-cables');
  if (checkboxCables) {
    checkboxCables.addEventListener('change', () => {
      const svg = document.getElementById('physical-cables-svg');
      if (svg) {
        svg.style.display = checkboxCables.checked ? 'block' : 'none';
        if (checkboxCables.checked && typeof drawPhysicalCables === 'function') {
          drawPhysicalCables();
        }
      }
    });
  }

  // M-34: Botón para alternar Modo Cableado Interactivo
  const btnCableMode = document.getElementById('btn-cable-mode');
  if (btnCableMode) {
    btnCableMode.addEventListener('click', () => {
      if (typeof window.toggleInteractiveCableMode === 'function') {
        window.toggleInteractiveCableMode();
      }
    });
  }
  
  const addConnTableBtn = document.getElementById('table-btn-add-conn');
  if(addConnTableBtn) addConnTableBtn.addEventListener('click', () => openCableModal());
  document.getElementById('btn-undo').addEventListener('click', () => store.undo());
  document.getElementById('btn-redo').addEventListener('click', () => store.redo());

  const btnExpandMain = document.getElementById('btn-expand-main');
  if (btnExpandMain) {
    btnExpandMain.addEventListener('click', () => {
      const main = document.getElementById('main');
      if (!main) return;
      const isFullscreen = main.classList.toggle('fullscreen');
      btnExpandMain.innerHTML = isFullscreen
        ? '<i class="svg-icon icon-maximize" style="width:14px;height:14px;margin-right:4px;"></i><span class="btn-text">Contraer</span>'
        : '<i class="svg-icon icon-maximize" style="width:14px;height:14px;margin-right:4px;"></i><span class="btn-text">Expandir</span>';
      btnExpandMain.title = isFullscreen ? 'Contraer pantalla completa' : 'Expandir área de trabajo a pantalla completa';
    });
  }

  const btnExpandBottom = document.getElementById('btn-expand-bottom');
  if (btnExpandBottom) {
    btnExpandBottom.addEventListener('click', () => {
      const bottom = document.getElementById('bottom');
      if (!bottom) return;
      const isFullscreen = bottom.classList.toggle('fullscreen');
      btnExpandBottom.innerHTML = isFullscreen
        ? '<i class="svg-icon icon-maximize" style="width:14px;height:14px;margin-right:4px;"></i><span class="btn-text">Contraer</span>'
        : '<i class="svg-icon icon-maximize" style="width:14px;height:14px;margin-right:4px;"></i><span class="btn-text">Expandir</span>';
      btnExpandBottom.title = isFullscreen ? 'Contraer panel inferior' : 'Expandir o restaurar panel inferior';
    });
  }

  // M-25A: Colapso/Expansión fluido del panel derecho (Drawer lateral)
  const rightPanelBtn = document.getElementById('btn-toggle-right-panel');
  if (rightPanelBtn) {
    rightPanelBtn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const rightPanel = document.getElementById('right-panel');
        if (!rightPanel) return;
        const willOpen = !rightPanel.classList.contains('open');
        if (willOpen) {
          if (typeof window.openMobileRightPanel === 'function') {
            window.openMobileRightPanel();
          } else {
            rightPanel.classList.add('open');
            const mobileOverlay = document.getElementById('mobile-overlay');
            if (mobileOverlay) mobileOverlay.classList.remove('hidden');
          }
        } else {
          if (typeof window.closeMobileDrawers === 'function') {
            window.closeMobileDrawers();
          } else {
            rightPanel.classList.remove('open');
          }
        }
        return;
      }
      const app = document.getElementById('app');
      if (!app) return;
      const isCollapsed = app.classList.toggle('right-panel-collapsed');
      rightPanelBtn.classList.toggle('active', isCollapsed);
      
      const label = document.getElementById('right-panel-toggle-label');
      if (label) {
        label.textContent = isCollapsed ? 'Mostrar' : 'Panel';
      }
      rightPanelBtn.setAttribute('data-tip', isCollapsed ? 'Mostrar panel lateral (Outliner/Inspector)' : 'Ocultar panel lateral (Outliner/Inspector)');
      
      try {
        sessionStorage.setItem('RACK_RIGHT_PANEL_COLLAPSED', isCollapsed ? '1' : '0');
      } catch (err) { /* no-op */ }

      // Disparar recálculo de geometría de topología si está activa
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.currentView === 'topology' && typeof drawTopo === 'function') {
          drawTopo();
        }
      }, 320);
    });

    // Restaurar preferencia previa de sesión
    try {
      if (sessionStorage.getItem('RACK_RIGHT_PANEL_COLLAPSED') === '1') {
        const app = document.getElementById('app');
        if (app) app.classList.add('right-panel-collapsed');
        rightPanelBtn.classList.add('active');
        const label = document.getElementById('right-panel-toggle-label');
        if (label) label.textContent = 'Mostrar';
        rightPanelBtn.setAttribute('data-tip', 'Mostrar panel lateral (Outliner/Inspector)');
      }
    } catch (err) { /* no-op */ }
  }



  const tableSearch = document.getElementById('table-search');
  const tableSearchClear = document.getElementById('table-search-clear');

  function updateTableSearchClear() {
    if (!tableSearchClear || !tableSearch) return;
    if (tableSearch.value.trim().length > 0) {
      tableSearchClear.classList.remove('hidden');
    } else {
      tableSearchClear.classList.add('hidden');
    }
  }

  if (tableSearch) {
    tableSearch.addEventListener('input', () => {
      updateTableSearchClear();
      renderBottomPanel();
    });
  }

  if (tableSearchClear) {
    tableSearchClear.addEventListener('click', () => {
      if (tableSearch) {
        tableSearch.value = '';
        tableSearch.focus();
      }
      updateTableSearchClear();
      renderBottomPanel();
    });
  }

  const btnToggleTableSearch = document.getElementById('btn-toggle-table-search');
  const tableSearchWrap = document.getElementById('table-search-wrap');

  if (btnToggleTableSearch && tableSearchWrap) {
    btnToggleTableSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = tableSearchWrap.classList.toggle('is-open');
      if (isOpen && tableSearch) {
        tableSearch.focus();
        tableSearch.select();
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (tableSearchWrap && tableSearchWrap.classList.contains('is-open')) {
      if (!tableSearchWrap.contains(e.target)) {
        tableSearchWrap.classList.remove('is-open');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Theme initialization removed (now handled in <head> of index.html to prevent FOUC)
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); store.redo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      const searchWrap = document.getElementById('h-search-wrap');
      const searchInput = document.getElementById('global-search');
      if (searchWrap && searchInput) {
        e.preventDefault();
        searchWrap.classList.add('is-open');
        searchInput.focus();
        searchInput.select();
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      const ctxMenu = document.getElementById('ctx-menu');
      if(ctxMenu) ctxMenu.classList.add('hidden');
      const searchWrap = document.getElementById('h-search-wrap');
      if (searchWrap) searchWrap.classList.remove('is-open');
      const tableSearchWrapEl = document.getElementById('table-search-wrap');
      if (tableSearchWrapEl) tableSearchWrapEl.classList.remove('is-open');
    }
  });

  const resizeObs = new ResizeObserver(() => {
    if (currentView === 'topology') { resizeCanvas(); }
  });
  const mainEl = document.getElementById('main');
  if(mainEl) resizeObs.observe(mainEl);
}

// demoData.js se carga dinámicamente solo cuando el usuario pulsa "Cargar demos"
function init() {
  initTopology();
  initModals();
  initGlobalEvents();

  // Asegurar que canvas de topología empiece oculto
  const topoCanvas = document.getElementById('topology-canvas');
  if(topoCanvas) topoCanvas.style.display = 'none';
  ['btn-topo-style', 'topo-spacing', 'topo-spacing-group', 'btn-topo-autoorder', 'topo-slots-group'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('force-hide');
  });

  renderAll();
  notify('RACK Designer Next modularizado', 'success', 2500);

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

  // Logout — registrar siempre, funciona con file:// y http://
  const badge = document.getElementById('user-badge');
  if (badge) {
    badge.addEventListener('click', async () => {
      const user = RackAuth.getCurrentUser();
      const userName = user ? user.name : 'Usuario';
      const ok = await customConfirm('Cerrar Sesión', '¿Cerrar sesión como ' + userName + '?');
      if (ok) {
        RackAuth.logout();
        window.location.reload();
      }
    });
  }

}

init();
