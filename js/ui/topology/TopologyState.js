let canvas, ctx;
let topoAnim = null;
let panStart = null;
let panOrig = { x: 0, y: 0 };
let nodePositions = {};
let rackPositions = {};
let roomPositions = {};
let roomSizes = {};
let rackSizes = {};
let flowT = 0;

let draggingNode = null, draggingRack = null, draggingRoom = null;
let resizingRack = null, resizingRoom = null;
let nodeOrig = null;
let dragSnapshotTaken = false;
let dragPointerStart = null;

let hoveredNode = null;
let mousePos = { x: -1000, y: -1000, rawX: -1000, rawY: -1000 };
let cursorMode = 'default';

function loadTopoState() {
  const top = store._raw.topology;
  if (top) {
    nodePositions = top.nodePositions || {};
    rackPositions = top.rackPositions || {};
    roomPositions = top.roomPositions || {};
    roomSizes = top.roomSizes || {};
    rackSizes = top.rackSizes || {};
    // Restore saved spacing value and sync slider UI
    if (top.topoSpacing) {
      window.TOPO_SPACING = top.topoSpacing;
      const slider = document.getElementById('topo-spacing');
      if (slider) slider.value = top.topoSpacing;
      const valEl = document.getElementById('topo-spacing-val');
      if (valEl) valEl.textContent = `${top.topoSpacing}px`;
    }
    if (top.topoSpacingX !== undefined) {
      window.TOPO_SPACING_X = top.topoSpacingX;
      const sliderX = document.getElementById('topo-spacing-x');
      if (sliderX) sliderX.value = top.topoSpacingX;
      const valXEl = document.getElementById('topo-spacing-x-val');
      if (valXEl) valXEl.textContent = `${top.topoSpacingX}px`;
    }
    if (top.bgPattern) {
      window.TOPO_BG_PATTERN = top.bgPattern;
      const patSelect = document.getElementById('topo-pattern-select');
      if (patSelect) patSelect.value = top.bgPattern;
    }
    if (top.inheritColors !== undefined) {
      window.TOPO_INHERIT_COLORS = top.inheritColors;
      const chkInherit = document.getElementById('topo-inherit-colors');
      if (chkInherit) chkInherit.checked = top.inheritColors;
    }
    if (top.topoAlpha !== undefined) {
      window.TOPO_ALPHA = top.topoAlpha;
      const alphaSlider = document.getElementById('topo-alpha-slider');
      const alphaVal = document.getElementById('topo-alpha-val');
      if (alphaSlider) alphaSlider.value = Math.round(top.topoAlpha * 100);
      if (alphaVal) alphaVal.textContent = `${Math.round(top.topoAlpha * 100)}%`;
    }
    if (top.style) {
      window.TOPOLOGY_STYLE = top.style;
    }
    if (top.layoutMode) {
      window.TOPO_LAYOUT_MODE = top.layoutMode;
    } else {
      window.TOPO_LAYOUT_MODE = 'racks';
    }
    if (top.labelPreset) {
      window.TOPO_LABEL_PRESET = top.labelPreset;
    }
    if (top.namePos) {
      window.TOPO_NAME_POS = top.namePos;
    }
    if (top.ipPos) {
      window.TOPO_IP_POS = top.ipPos;
    }
  }
}

function saveTopo() {
  store.saveTopologyState({ 
    nodePositions, 
    rackPositions, 
    roomPositions, 
    roomSizes, 
    rackSizes, 
    topoSpacing: window.TOPO_SPACING || 60,
    topoSpacingX: window.TOPO_SPACING_X !== undefined ? window.TOPO_SPACING_X : 28,
    bgPattern: window.TOPO_BG_PATTERN || 'dots',
    inheritColors: window.TOPO_INHERIT_COLORS !== false,
    topoAlpha: window.TOPO_ALPHA !== undefined ? window.TOPO_ALPHA : 0.25,
    style: window.TOPOLOGY_STYLE || 'card',
    layoutMode: window.TOPO_LAYOUT_MODE || 'racks',
    labelPreset: window.TOPO_LABEL_PRESET || 'separated',
    namePos: window.TOPO_NAME_POS || 'bottom',
    ipPos: window.TOPO_IP_POS || 'top'
  });
}

// ──────────────────────────────────────────────────────────────────
// M-40: Interfaz operativa de 5 ranuras de memoria (Slots)
// ──────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.applyTopologySlot = function(slotIndex) {
    if (typeof store === 'undefined' || typeof store.loadTopologySlot !== 'function') return false;
    const success = store.loadTopologySlot(slotIndex);
    if (!success) {
      if (typeof notify === 'function') notify(`La ranura ${slotIndex + 1} está vacía`, 'warn');
      return false;
    }
    loadTopoState();
    if (typeof syncTopoStyleUI === 'function') syncTopoStyleUI();
    if (typeof updateZoomLabel === 'function') updateZoomLabel();
    if (typeof drawTopo === 'function') drawTopo();
    if (typeof renderTopologySlots === 'function') renderTopologySlots();

    const slotData = store._raw.topologySlots?.[slotIndex];
    const name = slotData?.name || `Vista ${slotIndex + 1}`;
    if (typeof notify === 'function') notify(`Vista cargada: ${name}`, 'success', 2000);
    return true;
  };

  window.saveCurrentToTopologySlot = function(slotIndex, customName) {
    if (typeof store === 'undefined' || typeof store.saveTopologySlot !== 'function') return null;
    // Sincronizar estado actual antes de capturar el snapshot
    saveTopo();
    const saved = store.saveTopologySlot(slotIndex, customName);
    if (saved) {
      if (typeof renderTopologySlots === 'function') renderTopologySlots();
      if (typeof notify === 'function') notify(`Topología guardada en Slot ${slotIndex + 1}: ${saved.name}`, 'success', 2200);
    }
    return saved;
  };

  window.clearTopologySlot = function(slotIndex) {
    if (typeof store === 'undefined' || typeof store.clearTopologySlot !== 'function') return false;
    const res = store.clearTopologySlot(slotIndex);
    if (typeof renderTopologySlots === 'function') renderTopologySlots();
    if (typeof notify === 'function') notify(`Ranura ${slotIndex + 1} vaciada`, 'info', 1800);
    return res;
  };

  window.renameTopologySlot = function(slotIndex, newName) {
    if (typeof store === 'undefined' || typeof store.renameTopologySlot !== 'function') return false;
    const res = store.renameTopologySlot(slotIndex, newName);
    if (typeof renderTopologySlots === 'function') renderTopologySlots();
    if (typeof notify === 'function') notify(`Ranura ${slotIndex + 1} renombrada a "${newName}"`, 'success', 1800);
    return res;
  };
}

