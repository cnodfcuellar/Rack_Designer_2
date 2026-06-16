function startTopo() {
  resizeCanvas();
  initTopoPositions();
  if (topoAnim) cancelAnimationFrame(topoAnim);
  drawTopo();
}

function stopTopo() {
  if (topoAnim) cancelAnimationFrame(topoAnim);
  topoAnim = null;
}

function updateZoomLabel() {
  const lbl = document.getElementById('zoom-level');
  const pfx = currentView === 'physical' ? 'phys' : 'topo';
  const z = store._raw[pfx+'Zoom'] || 1;
  const px = store._raw[pfx+'PanX'] || 0;
  const py = store._raw[pfx+'PanY'] || 0;
  if (lbl) lbl.textContent = Math.round(z * 100) + '%';
  
  if (currentView === 'physical') {
    const phys = document.getElementById('view-physical-content');
    if (phys) {
      phys.style.zoom = z;
      phys.style.transform = `translate(${px}px, ${py}px)`;
      phys.style.width = '100%';
    }
  }
}

function exportTopologyToPNG() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (pos && size) {
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x + size.w > maxX) maxX = pos.x + size.w;
      if (pos.y + size.h > maxY) maxY = pos.y + size.h;
    }
  });
  
  if (minX === Infinity) {
    notify('No hay topología para exportar', 'warn');
    return;
  }
  
  const margin = 100;
  minX -= margin; minY -= margin;
  maxX += margin; maxY += margin;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width * 2;
  offCanvas.height = height * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);
  
  // Temporarily swap global context, pan and zoom
  const oldCtx = ctx;
  const oldCanvas = canvas;
  const oldZoom = store._raw.topoZoom;
  const oldPanX = store._raw.topoPanX;
  const oldPanY = store._raw.topoPanY;
  const oldHover = hoveredNode;
  
  try {
    ctx = oc;
    canvas = offCanvas; 
    store._raw.topoZoom = 1;
    store._raw.topoPanX = -minX;
    store._raw.topoPanY = -minY;
    hoveredNode = null;
    
    // Draw one frame offscreen
    cancelAnimationFrame(topoAnim);
    drawTopo();
    cancelAnimationFrame(topoAnim); // drawTopo requests another frame, stop it
    
    const url = offCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Topologia_Centro_Datos.png`;
    link.href = url;
    link.click();
    
    notify('Topología exportada a PNG', 'success');
  } finally {
    // Restore globals
    ctx = oldCtx;
    canvas = oldCanvas;
    store._raw.topoZoom = oldZoom;
    store._raw.topoPanX = oldPanX;
    store._raw.topoPanY = oldPanY;
    hoveredNode = oldHover;
    drawTopo(); // Ensure loop resumes on main canvas
  }
  startTopo(); // resume normal loop
}
