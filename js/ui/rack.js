const UNIT_H = 24; // px por U
let dragState = null;

function renderPhysical() {
  const container = document.getElementById('view-physical');
  if(!container) return;
  const racks = store.currentRacks;
  
  const tooltipEl = document.getElementById('device-tooltip');
  if (tooltipEl) tooltipEl.classList.remove('visible');
  
  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  // Preserve flipped state
  const flippedRacks = new Set();
  container.querySelectorAll('.rack-flipper.flipped').forEach(f => {
    flippedRacks.add(f.id.replace('flipper-', ''));
  });

  if (!racks.length) {
    container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; width:100%; display:flex; flex-wrap:wrap; gap:48px; align-content:flex-start;">
      <div style="display:flex; justify-content:center; width:100%;">
        <div class="empty-state" style="display:flex; flex-direction:column; align-items:center;">
          <div class="icon"><i class="svg-icon icon-server" style="width:48px; height:48px;"></i></div>
          <p>No hay gabinetes en esta sala.</p>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn-primary" id="empty-btn-add-rack">+ Rack</button>
            <button class="btn-secondary" id="empty-btn-load-demo" onclick="if(typeof window.loadDemoData === 'function') window.loadDemoData();">
              <i class="svg-icon icon-bolt" style="width:14px; height:14px; margin-right:4px;"></i> Cargar Plantilla Demo
            </button>
          </div>
        </div>
      </div>
    </div>`;
    const floorSection = renderFloorSection(store._raw.currentRoomId);
    container.querySelector('#view-physical-content').appendChild(floorSection);
    bindRackEvents(container, flippedRacks);
    updateZoomLabel();
    return;
  }

  function buildRackFace(rack, devices, side, searchTerm) {
    const sideDevices = devices.filter(d => (d.mountSide === 'both' || (d.mountSide || 'front') === side));
    let slotsHTML = '';
    let skip = 0;
    for (let u = 1; u <= rack.height; u++) {
      if (skip > 0) { skip--; continue; }
      const dev = sideDevices.find(d => d.slotStart === u);
      if (dev) {
        const h = dev.size * UNIT_H;
        let matchClass = '';
        if (searchTerm) {
          const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
          matchClass = fields.includes(searchTerm) ? 'search-match' : 'search-dim';
        }
        skip = dev.size - 1;
        slotsHTML += `<div class="rack-slot occupied" style="height:${h}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}">
            <div class="device-faceplate ${matchClass}"
                 style="top:0; height:${h}px"
                 data-device-id="${dev.id}"
                 draggable="true">
              ${buildFaceplate(dev, h, side)}
              <div class="device-actions">
                <button class="dev-btn edit" data-edit-dev="${dev.id}" title="Editar"><i class="svg-icon icon-edit" style="width:12px; height:12px;"></i></button>
                <button class="dev-btn del" data-del-dev="${dev.id}" title="Eliminar"><i class="svg-icon icon-trash" style="width:12px; height:12px;"></i></button>
              </div>
            </div>
          </div>`;
      } else {
        slotsHTML += `<div class="rack-slot" style="height:${UNIT_H}px" data-slot="${u}" data-rack="${rack.id}" data-side="${side}"></div>`;
      }
    }
    const railHTML = Array.from({length: rack.height}, (_, i) => `<div class="rail-unit">${i + 1}</div>`).join('');
    const titleText = side === 'front' ? escapeHTML(rack.name) : `Vista Trasera`;
    const btnText = side === 'front' ? '<i class="svg-icon icon-rotate" style="width:14px; height:14px;"></i>' : '<i class="svg-icon icon-desktop" style="width:14px; height:14px;"></i>';

    return `
      <div class="rack-card ${side === 'rear' ? 'rear-view' : ''}" data-rack-id="${rack.id}" data-side="${side}">
        <div class="rack-header">
          <div class="rack-title" title="${titleText}">
            <div class="rack-color-dot" style="background:${side==='rear'?'#3b82f6':escapeHTML(rack.color)}; box-shadow:0 0 6px ${side==='rear'?'#3b82f6':escapeHTML(rack.color)}88"></div>
            <span class="title-text" style="${side==='rear'?'color:var(--text-secondary); font-style:italic':''}">${escapeHTML(rack.name)}${side === 'rear' ? ' (Trasera)' : ''}</span>
          </div>
          <div class="rack-hdr-btns" style="position:relative; display:flex; align-items:center; gap:4px;">
            <button class="btn-flip-rack" data-flip-rack="${escapeHTML(rack.id)}" title="${side === 'front' ? 'Vista Trasera' : 'Vista Frontal'}">${btnText}</button>
            <button class="rack-btn" data-rack-menu-toggle="${escapeHTML(rack.id)}" title="Opciones" style="font-size: 16px; padding: 0 6px; font-weight:bold; cursor:pointer;">⋮</button>
            <div class="dropdown-menu hidden" id="rack-menu-${side}-${rack.id}" style="right:0; top:32px; min-width:190px; z-index:1000;">
              <div class="dropdown-item" data-add-dev-rack="${escapeHTML(rack.id)}"><i class="svg-icon icon-bolt" style="width:14px; height:14px; margin-right:6px;"></i>Agregar Equipo</div>
              <div class="dropdown-item" data-clear-rack="${escapeHTML(rack.id)}"><i class="svg-icon icon-trash" style="width:14px; height:14px; margin-right:6px;"></i>Limpiar Gabinete</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" data-edit-rack="${escapeHTML(rack.id)}"><i class="svg-icon icon-edit" style="width:14px; height:14px; margin-right:6px;"></i>Editar Gabinete</div>
              <div class="dropdown-item" style="color:var(--danger)" data-del-rack="${escapeHTML(rack.id)}"><i class="svg-icon icon-trash" style="width:14px; height:14px; margin-right:6px;"></i>Eliminar Gabinete</div>
            </div>
          </div>
        </div>
        <div class="rack-body">
          <div class="rack-rail-left">${railHTML}</div>
          <div class="rack-slots" id="slots-${side}-${rack.id}">
            ${slotsHTML}
          </div>
          <div class="rack-rail-right">${railHTML}</div>
        </div>
      </div>
    `;
  }

  const racksHTML = racks.map(rack => {
    const devices = store.allDevicesInRack(rack.id);
    
    return `
    <div class="rack-wrapper" data-rack-id="${rack.id}">
      <div class="rack-flipper" id="flipper-${rack.id}">
        <div class="rack-face">${buildRackFace(rack, devices, 'front', searchTerm)}</div>
        <div class="rack-rear">${buildRackFace(rack, devices, 'rear', searchTerm)}</div>
      </div>
      <div style="text-align:center; font-size:9px; color:var(--text-muted); margin-top:4px; font-family:var(--font-mono)">
        ${rack.height}U · ${devices.filter(d => (d.mountSide||'front')==='front' || d.mountSide==='both').reduce((s,d)=>s+d.size,0)}/${rack.height} FRONT · ${devices.filter(d => d.mountSide==='rear' || d.mountSide==='both').reduce((s,d)=>s+d.size,0)}/${rack.height} REAR
      </div>
    </div>`;
  }).join('');

  const addRackHTML = `
    <div class="rack-wrapper" id="canvas-btn-add-rack" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:260px; min-height:300px; border:2px dashed var(--border); border-radius:var(--radius); cursor:pointer; opacity:0.5; transition:all 0.2s;" onmouseover="this.style.opacity='1'; this.style.borderColor='var(--accent)'" onmouseout="this.style.opacity='0.5'; this.style.borderColor='var(--border)'">
      <div style="font-size:32px; color:var(--text-muted); margin-bottom:8px;">+</div>
      <div style="font-family:var(--font-ui); color:var(--text-secondary); font-size:var(--text-sm); font-weight:600;">+Rack</div>
    </div>
  `;

  container.innerHTML = `<div id="view-physical-content" style="transform-origin: 0 0; display:flex; flex-wrap:wrap; gap:48px; align-content:flex-start; width: 100%; position:relative;">
    <svg id="physical-cables-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:100; overflow:visible; display:block;"></svg>
    <div id="racks-area" style="position:relative; display:flex; flex-wrap:wrap; gap:48px; width:100%">
      ${racksHTML}${addRackHTML}
    </div>
  </div>`;

  const floorSection = renderFloorSection(store._raw.currentRoomId);
  container.querySelector('#view-physical-content').appendChild(floorSection);

  bindRackEvents(container, flippedRacks);
  updateZoomLabel();
  requestAnimationFrame(() => setTimeout(drawPhysicalCables, 50));
}

function drawPhysicalCables() {
  const svg = document.getElementById('physical-cables-svg');
  const container = document.getElementById('view-physical-content');
  if (!svg || !container) return;
  svg.innerHTML = '';
  
  const conns = store._raw.connections || [];
  if (!conns.length) return;
  
  const checkboxCables = document.getElementById('checkbox-toggle-cables');
  const showCables = !checkboxCables || checkboxCables.checked;
  svg.style.display = showCables ? 'block' : 'none';
  if (!showCables) return;
  
  const containerRect = container.getBoundingClientRect();
  const scale = containerRect.width ? container.offsetWidth / containerRect.width : 1;

  const getPos = (el) => {
    const rect = el.getBoundingClientRect();
    let x = (rect.left + rect.width / 2 - containerRect.left) * scale;
    let y = (rect.top + rect.height / 2 - containerRect.top) * scale;
    
    const rackCard = el.closest('.rack-card');
    const floorCard = el.closest('.floor-device-card');
    
    const isRack = !!rackCard;
    const isFloor = !rackCard && !!floorCard;
    
    let leftEdgeX = x - 20;
    let rightEdgeX = x + 20;
    let topY = (rect.top - containerRect.top) * scale;
    let bottomY = (rect.bottom - containerRect.top) * scale;
    let rackId = null;
    
    if (rackCard) {
      const rRect = rackCard.getBoundingClientRect();
      leftEdgeX = (rRect.left - containerRect.left) * scale;
      rightEdgeX = (rRect.right - containerRect.left) * scale;
      topY = (rRect.top - containerRect.top) * scale;
      bottomY = (rRect.bottom - containerRect.top) * scale;
      rackId = rackCard.dataset.rackId || null;
    } else if (floorCard) {
      const fRect = floorCard.getBoundingClientRect();
      leftEdgeX = (fRect.left - containerRect.left) * scale;
      rightEdgeX = (fRect.right - containerRect.left) * scale;
      topY = (fRect.top - containerRect.top) * scale;
      bottomY = (fRect.bottom - containerRect.top) * scale;

      // Puerto del equipo de piso: ubicado en el borde superior directamente sobre el icono
      const iconEl = floorCard.querySelector('.floor-device-icon');
      if (iconEl) {
        const iRect = iconEl.getBoundingClientRect();
        x = (iRect.left + iRect.width / 2 - containerRect.left) * scale;
      } else {
        x = leftEdgeX + 28;
      }
      y = topY;
    }
    
    return { x, y, isRack, isFloor, rackCard, floorCard, rackId, leftEdgeX, rightEdgeX, topY, bottomY };
  };

  let minRackTop = Infinity;
  let maxRackBottom = 0;
  container.querySelectorAll('.rack-card').forEach(rc => {
    const r = rc.getBoundingClientRect();
    const t = (r.top - containerRect.top) * scale;
    const b = (r.bottom - containerRect.top) * scale;
    if (t < minRackTop) minRackTop = t;
    if (b > maxRackBottom) maxRackBottom = b;
  });
  if (minRackTop === Infinity) minRackTop = 0;

  let minFloorTop = Infinity;
  container.querySelectorAll('.floor-device-card').forEach(fc => {
    const r = fc.getBoundingClientRect();
    const t = (r.top - containerRect.top) * scale;
    if (t < minFloorTop) minFloorTop = t;
  });
  if (minFloorTop === Infinity) minFloorTop = maxRackBottom + 40;

  conns.forEach((c, index) => {
    let srcEl = document.querySelector(`.rear-port-jack[data-device-id="${c.sourceDeviceId}"][data-port="${escapeHTML(c.sourcePort)}"]`);
    if (!srcEl) srcEl = document.querySelector(`[data-device-id="${c.sourceDeviceId}"]`);
    
    let dstEl = document.querySelector(`.rear-port-jack[data-device-id="${c.targetDeviceId}"][data-port="${escapeHTML(c.targetPort)}"]`);
    if (!dstEl) dstEl = document.querySelector(`[data-device-id="${c.targetDeviceId}"]`);
    
    if (srcEl && dstEl) {
      const p1 = getPos(srcEl);
      const p2 = getPos(dstEl);
      
      const r = 6; // Radio de curvatura
      const isSameRack = p1.isRack && p2.isRack && (p1.rackCard === p2.rackCard || (p1.rackId && p1.rackId === p2.rackId));
      
      let pathStr = '';

      if (isSameRack) {
        // ===================================================================
        // 1. CASO INTRA-RACK: Ambos equipos en el mismo gabinete
        // Viaja por el organizador lateral derecho de este rack
        // ===================================================================
        const gutterX = p1.rightEdgeX + 8 + (index % 5) * 4;
        const dirY = p2.y > p1.y ? 1 : -1;
        const dirX1 = gutterX > p1.x ? 1 : -1;
        const dirX2 = p2.x > gutterX ? 1 : -1;
        
        if (Math.abs(gutterX - p1.x) < r || Math.abs(p2.y - p1.y) < r * 2) {
          pathStr = `M ${p1.x} ${p1.y} L ${gutterX} ${p1.y} L ${gutterX} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          pathStr = `M ${p1.x} ${p1.y} `
            + `L ${gutterX - r * dirX1} ${p1.y} `
            + `Q ${gutterX} ${p1.y}, ${gutterX} ${p1.y + r * dirY} `
            + `L ${gutterX} ${p2.y - r * dirY} `
            + `Q ${gutterX} ${p2.y}, ${gutterX + r * dirX2} ${p2.y} `
            + `L ${p2.x} ${p2.y}`;
        }
      } else if (p1.isRack && p2.isRack) {
        // ===================================================================
        // 2. CASO INTER-RACK: Conexión entre dos gabinetes distintos
        // Viaja por la CANALETA AÉREA SUPERIOR (Overhead Tray) sin cruzar racks
        // ===================================================================
        const overheadY = minRackTop - 14 - (index % 7) * 5;
        
        // Salida inteligente por el lateral más cercano al rack destino
        const exitX = (p2.x < p1.x) 
          ? p1.leftEdgeX - 8 - (index % 4) * 4 
          : p1.rightEdgeX + 8 + (index % 4) * 4;
          
        const enterX = (p1.x < p2.x) 
          ? p2.leftEdgeX - 8 - (index % 4) * 4 
          : p2.rightEdgeX + 8 + (index % 4) * 4;
          
        const dirX1 = exitX > p1.x ? 1 : -1;
        const dirX2 = p2.x > enterX ? 1 : -1;
        const dirG = enterX > exitX ? 1 : -1;
        
        pathStr = `M ${p1.x} ${p1.y} `
          + `L ${exitX - r * dirX1} ${p1.y} `
          + `Q ${exitX} ${p1.y}, ${exitX} ${p1.y - r} `
          + `L ${exitX} ${overheadY + r} `
          + `Q ${exitX} ${overheadY}, ${exitX + r * dirG} ${overheadY} `
          + `L ${enterX - r * dirG} ${overheadY} `
          + `Q ${enterX} ${overheadY}, ${enterX} ${overheadY + r} `
          + `L ${enterX} ${p2.y - r} `
          + `Q ${enterX} ${p2.y}, ${enterX + r * dirX2} ${p2.y} `
          + `L ${p2.x} ${p2.y}`;
      } else {
        // ===================================================================
        // 3. CASO EQUIPOS DE PISO <-> RACK (o Piso <-> Piso)
        // Enrutamiento perimetral segregado: viaja por la canaleta media entre
        // racks y la sección de piso, desciende por los pasillos entre columnas
        // y se conecta en el borde superior sobre el icono, sin tocar texto ni
        // atravesar tarjetas adyacentes.
        // ===================================================================
        const middleGutterY = maxRackBottom > 0
          ? maxRackBottom + 16 + (index % 5) * 3
          : minFloorTop - 20 - (index % 5) * 3;
        
        const pRack = p1.isRack ? p1 : (p2.isRack ? p2 : null);
        const pFloor = p1.isFloor ? p1 : (p2.isFloor ? p2 : null);
        
        if (pRack && pFloor) {
          const fromFloor = p1.isFloor;
          const isRow1 = pFloor.topY <= minFloorTop + 14;
          
          // Canaleta vertical del rack (lado más cercano al punto de entrada del piso)
          const rackGutterX = (pFloor.x < pRack.x) 
            ? pRack.leftEdgeX - 8 - (index % 4) * 4 
            : pRack.rightEdgeX + 8 + (index % 4) * 4;

          const dirXRack = pRack.x > rackGutterX ? 1 : -1;
          
          // Desplazamiento en pasillos para evitar solapamientos
          const aisleOffset = ((index % 3) - 1) * 2;
          const aisleX = pFloor.leftEdgeX - 6 + aisleOffset;
          const rowGutterY = pFloor.topY - 6 + aisleOffset;
          const targetMidX = isRow1 ? pFloor.x : aisleX;
          const rFloor = 4;

          if (fromFloor) {
            // Origen: Piso -> Destino: Rack
            const dirG = rackGutterX > targetMidX ? 1 : -1;
            if (isRow1) {
              pathStr = `M ${pFloor.x} ${pFloor.y} `
                + `L ${pFloor.x} ${middleGutterY + r} `
                + `Q ${pFloor.x} ${middleGutterY}, ${pFloor.x + r * dirG} ${middleGutterY} `
                + `L ${rackGutterX - r * dirG} ${middleGutterY} `
                + `Q ${rackGutterX} ${middleGutterY}, ${rackGutterX} ${middleGutterY - r} `
                + `L ${rackGutterX} ${pRack.y + r} `
                + `Q ${rackGutterX} ${pRack.y}, ${rackGutterX + r * dirXRack} ${pRack.y} `
                + `L ${pRack.x} ${pRack.y}`;
            } else {
              // Fila 2+: Sale hacia el pasillo entre filas y sube por el pasillo entre columnas
              pathStr = `M ${pFloor.x} ${pFloor.y} `
                + `L ${pFloor.x} ${rowGutterY + rFloor} `
                + `Q ${pFloor.x} ${rowGutterY}, ${pFloor.x - rFloor} ${rowGutterY} `
                + `L ${aisleX + rFloor} ${rowGutterY} `
                + `Q ${aisleX} ${rowGutterY}, ${aisleX} ${rowGutterY - rFloor} `
                + `L ${aisleX} ${middleGutterY + r} `
                + `Q ${aisleX} ${middleGutterY}, ${aisleX + r * dirG} ${middleGutterY} `
                + `L ${rackGutterX - r * dirG} ${middleGutterY} `
                + `Q ${rackGutterX} ${middleGutterY}, ${rackGutterX} ${middleGutterY - r} `
                + `L ${rackGutterX} ${pRack.y + r} `
                + `Q ${rackGutterX} ${pRack.y}, ${rackGutterX + r * dirXRack} ${pRack.y} `
                + `L ${pRack.x} ${pRack.y}`;
            }
          } else {
            // Origen: Rack -> Destino: Piso
            const dirG = targetMidX > rackGutterX ? 1 : -1;
            if (isRow1) {
              pathStr = `M ${pRack.x} ${pRack.y} `
                + `L ${rackGutterX - r * dirXRack} ${pRack.y} `
                + `Q ${rackGutterX} ${pRack.y}, ${rackGutterX} ${pRack.y + r} `
                + `L ${rackGutterX} ${middleGutterY - r} `
                + `Q ${rackGutterX} ${middleGutterY}, ${rackGutterX + r * dirG} ${middleGutterY} `
                + `L ${pFloor.x - r * dirG} ${middleGutterY} `
                + `Q ${pFloor.x} ${middleGutterY}, ${pFloor.x} ${middleGutterY + r} `
                + `L ${pFloor.x} ${pFloor.y}`;
            } else {
              // Fila 2+: Baja por el pasillo entre columnas y gira por el pasillo entre filas
              pathStr = `M ${pRack.x} ${pRack.y} `
                + `L ${rackGutterX - r * dirXRack} ${pRack.y} `
                + `Q ${rackGutterX} ${pRack.y}, ${rackGutterX} ${pRack.y + r} `
                + `L ${rackGutterX} ${middleGutterY - r} `
                + `Q ${rackGutterX} ${middleGutterY}, ${rackGutterX + r * dirG} ${middleGutterY} `
                + `L ${aisleX - r * dirG} ${middleGutterY} `
                + `Q ${aisleX} ${middleGutterY}, ${aisleX} ${middleGutterY + r} `
                + `L ${aisleX} ${rowGutterY - rFloor} `
                + `Q ${aisleX} ${rowGutterY}, ${aisleX + rFloor} ${rowGutterY} `
                + `L ${pFloor.x - rFloor} ${rowGutterY} `
                + `Q ${pFloor.x} ${rowGutterY}, ${pFloor.x} ${rowGutterY + rFloor} `
                + `L ${pFloor.x} ${pFloor.y}`;
            }
          }
        } else {
          // Fallback ortogonal limpio (Piso <-> Piso o no-rack)
          const gY = middleGutterY;
          const dirG = p2.x > p1.x ? 1 : -1;
          pathStr = `M ${p1.x} ${p1.y} `
            + `L ${p1.x} ${gY - r} `
            + `Q ${p1.x} ${gY}, ${p1.x + r * dirG} ${gY} `
            + `L ${p2.x - r * dirG} ${gY} `
            + `Q ${p2.x} ${gY}, ${p2.x} ${gY + r} `
            + `L ${p2.x} ${p2.y}`;
        }
      }
      
      const cableColor = c.color || '#3b82f6';
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathStr);
      path.setAttribute('stroke', cableColor);
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-linecap', 'round');
      
      const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle1.setAttribute('cx', p1.x);
      circle1.setAttribute('cy', p1.y);
      circle1.setAttribute('r', '2.5');
      circle1.setAttribute('fill', '#fff');
      circle1.setAttribute('stroke', cableColor);
      circle1.setAttribute('stroke-width', '1');

      const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle2.setAttribute('cx', p2.x);
      circle2.setAttribute('cy', p2.y);
      circle2.setAttribute('r', '2.5');
      circle2.setAttribute('fill', '#fff');
      circle2.setAttribute('stroke', cableColor);
      circle2.setAttribute('stroke-width', '1');

      svg.appendChild(path);
      svg.appendChild(circle1);
      svg.appendChild(circle2);
    }
  });
}

function bindRackEvents(container, flippedRacks) {
  container.querySelectorAll('[data-flip-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const rackId = btn.dataset.flipRack;
      const flipper = document.getElementById(`flipper-${rackId}`);
      if (!flipper) return;
      const isFlipped = flipper.classList.toggle('flipped');
      const face = flipper.querySelector('.rack-face');
      const rear = flipper.querySelector('.rack-rear');
      if (face) face.style.pointerEvents = isFlipped ? 'none' : 'auto';
      if (rear) rear.style.pointerEvents = isFlipped ? 'auto' : 'none';
      btn.innerHTML = isFlipped ? '<i class="svg-icon icon-desktop" style="width:14px; height:14px;"></i>' : '<i class="svg-icon icon-rotate" style="width:14px; height:14px;"></i>';
      setTimeout(drawPhysicalCables, 10);
    });
  });
  container.querySelectorAll('[data-rack-menu-toggle]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const parent = btn.closest('.rack-hdr-btns');
      const menu = parent ? parent.querySelector('.dropdown-menu') : null;
      if (!menu) return;
      const isCurrentlyHidden = menu.classList.contains('hidden');
      // Cerrar todos los menús de rack abiertos
      document.querySelectorAll('.dropdown-menu[id^="rack-menu-"]').forEach(m => {
        m.classList.add('hidden');
      });
      document.querySelectorAll('.rack-wrapper.menu-open').forEach(w => {
        w.classList.remove('menu-open');
      });
      if (isCurrentlyHidden) {
        menu.classList.remove('hidden');
        btn.closest('.rack-wrapper')?.classList.add('menu-open');
      }
    });
  });

  container.querySelectorAll('[data-edit-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.closest('.dropdown-menu')?.classList.add('hidden');
      btn.closest('.rack-wrapper')?.classList.remove('menu-open');
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden editar gabinetes.', 'error', 3000);
        return;
      }
      openEditRackModal(btn.dataset.editRack);
    });
  });
  container.querySelectorAll('[data-del-rack]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      btn.closest('.dropdown-menu')?.classList.add('hidden');
      btn.closest('.rack-wrapper')?.classList.remove('menu-open');
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden eliminar gabinetes.', 'error', 3000);
        return;
      }
      const ok = await customConfirm('Eliminar Gabinete', '¿Estás seguro de eliminar este gabinete y todos los equipos instalados en él? Esta acción no se puede deshacer.');
      if (ok) {
        store.deleteRack(btn.dataset.delRack);
        notify('Gabinete eliminado', 'warn');
      }
    });
  });

  container.querySelectorAll('[data-add-dev-rack]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const targetRackId = btn.dataset.addDevRack;
      btn.closest('.dropdown-menu')?.classList.add('hidden');
      btn.closest('.rack-wrapper')?.classList.remove('menu-open');
      openQuickPlacementModal(null);
      if (targetRackId) {
        const rackSelect = document.getElementById('qp-rack');
        if (rackSelect) {
          rackSelect.value = targetRackId;
          if (typeof repopulateQPSlots === 'function') repopulateQPSlots();
        }
      }
    });
  });

  container.querySelectorAll('[data-clear-rack]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const rackId = btn.dataset.clearRack;
      btn.closest('.dropdown-menu')?.classList.add('hidden');
      btn.closest('.rack-wrapper')?.classList.remove('menu-open');
      if (!RackAuth.can('editDevices')) {
        notify('Espectadores no pueden limpiar gabinetes.', 'error', 3000);
        return;
      }
      const ok = await customConfirm('Limpiar Gabinete', '¿Estás seguro de limpiar este gabinete? TODOS los equipos dentro de este rack serán eliminados permanentemente.');
      if (ok) {
        const devices = store.allDevicesInRack(rackId);
        devices.forEach(d => store.deleteDevice(d.id));
        notify('Gabinete limpiado exitosamente', 'success');
      }
    });
  });

  // Eventos para añadir rack desde el canvas
  container.querySelectorAll('#canvas-btn-add-rack, #empty-btn-add-rack').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openAddRackModal();
    });
  });

  container.querySelectorAll('.rack-slot').forEach(slot => {
    slot.addEventListener('dragover',  onSlotDragOver);
    slot.addEventListener('dragleave', onSlotDragLeave);
    slot.addEventListener('drop',      onSlotDrop);
  });
  container.querySelectorAll('.device-faceplate, .floor-device-card').forEach(fp => {
    fp.addEventListener('dragstart', onDeviceDragStart);
    fp.addEventListener('dragend',   onDeviceDragEnd);
    fp.addEventListener('dblclick',  onDeviceDoubleClick);
    fp.addEventListener('contextmenu', onDeviceContextMenu);
    fp.addEventListener('mouseenter', onDeviceMouseEnter);
    fp.addEventListener('mousemove', onDeviceMouseMove);
    fp.addEventListener('mouseleave', onDeviceMouseLeave);
    fp.addEventListener('click', e => {
      e.stopPropagation();
      const devId = fp.dataset.deviceId;
      window.appState = window.appState || {};
      window.appState.selectedType = 'device';
      window.appState.selectedId = devId;
      if (typeof window.renderInspector === 'function') window.renderInspector('device', devId);
      if (typeof window.renderOutliner === 'function') window.renderOutliner();
    });
  });

  container.querySelectorAll('.rack-card').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      const rackId = card.dataset.rackId;
      window.appState = window.appState || {};
      window.appState.selectedType = 'rack';
      window.appState.selectedId = rackId;
      if (typeof window.renderInspector === 'function') window.renderInspector('rack', rackId);
      if (typeof window.renderOutliner === 'function') window.renderOutliner();
    });
  });
  container.querySelectorAll('.dev-btn.edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditDeviceModal(btn.dataset.editDev);
    });
  });
  container.querySelectorAll('.dev-btn.del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const ok = await customConfirm('Eliminar Equipo', '¿Estás seguro de eliminar este equipo?');
      if (ok) {
        store.deleteDevice(btn.dataset.delDev);
        notify('Equipo eliminado', 'warn');
      }
    });
  });
  container.querySelectorAll('.dev-btn.menu').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, btn.dataset.menuDev);
    });
  });

  container.querySelectorAll('.floor-device-card').forEach(card => {
    card.addEventListener('dblclick', e => {
      e.stopPropagation();
      openEditDeviceModal(card.dataset.deviceId);
    });
    card.addEventListener('mouseenter', onDeviceMouseEnter);
    card.addEventListener('mousemove', onDeviceMouseMove);
    card.addEventListener('mouseleave', onDeviceMouseLeave);
  });

  // Restore flipped state
  flippedRacks.forEach(rackId => {
    const flipper = document.getElementById(`flipper-${rackId}`);
    if (flipper) {
      flipper.classList.add('flipped');
      const face = flipper.querySelector('.rack-face');
      const rear = flipper.querySelector('.rack-rear');
      if (face) face.style.pointerEvents = 'none';
      if (rear) rear.style.pointerEvents = 'auto';
      const btn = document.querySelector(`[data-flip-rack="${rackId}"]`);
      if (btn) btn.innerHTML = '<i class="svg-icon icon-desktop" style="width:14px; height:14px;"></i>';
    }
  });
}

function onCatalogDragStart(e) {
  if (!RackAuth.can('editDevices')) {
    e.preventDefault();
    return;
  }
  const id = e.currentTarget.dataset.catalogId;
  const item = CATALOG.find(c => c.id === id);
  dragState = { type: 'catalog', item: deepClone(item) };
  e.currentTarget.classList.add('dragging');
  const tooltipEl = document.getElementById('device-tooltip');
  if (tooltipEl) tooltipEl.classList.remove('visible');

  const ghost = document.getElementById('drag-ghost');
  if(ghost) {
    ghost.style.cssText = `position:fixed; width:220px; height:${item.size * UNIT_H}px; border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.8; left:-9999px; top:-9999px;`;
    ghost.innerHTML = buildFaceplate({ ...item, ip: '' }, item.size * UNIT_H);
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 110, item.size * UNIT_H / 2);
  }
  e.dataTransfer.effectAllowed = 'copy';
}

function onCatalogDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  dragState = null;
  clearDropHighlights();
}

function onDeviceDragStart(e) {
  if (!RackAuth.can('editDevices')) {
    e.preventDefault();
    return;
  }
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  const dev = store.deviceById(devId);
  if (!dev) return;
  dragState = { type: 'device', deviceId: devId, device: deepClone(dev) };
  e.dataTransfer.effectAllowed = 'move';
  const tooltipEl = document.getElementById('device-tooltip');
  if (tooltipEl) tooltipEl.classList.remove('visible');

  const ghost = document.getElementById('drag-ghost');
  if(ghost) {
    ghost.style.cssText = `position:fixed; width:220px; height:${dev.size * UNIT_H}px; border-radius:4px; overflow:hidden; pointer-events:none; z-index:9999; opacity:0.7; left:-9999px; top:-9999px;`;
    ghost.innerHTML = buildFaceplate(dev, dev.size * UNIT_H);
    e.dataTransfer.setDragImage(ghost, 110, dev.size * UNIT_H / 2);
  }
}

function onDeviceDragEnd(e) {
  dragState = null;
  clearDropHighlights();
  const ghost = document.getElementById('drag-ghost');
  if(ghost) ghost.style.left = '-9999px';
}

function onSlotDragOver(e) {
  e.preventDefault();
  if (!dragState) return;
  e.dataTransfer.dropEffect = dragState.type === 'catalog' ? 'copy' : 'move';
  const slot = e.currentTarget;
  const slotU = parseInt(slot.dataset.slot);
  const rackId = slot.dataset.rack;
  const slotMountSide = slot.dataset.side || 'front';
  const rack = store.rackById(rackId);
  const size = dragState.type === 'catalog' ? dragState.item.size : dragState.device.size;
  if (!rack || !slotU) return;

  const targetItemSide = dragState.type === 'catalog' ? dragState.item.mountSide : dragState.device.mountSide;
  const effectiveSide = targetItemSide === 'both' ? 'both' : slotMountSide;

  clearDropHighlights();
  const container = slot.closest('.rack-slots');
  const excludeId = dragState.type === 'device' ? dragState.deviceId : null;
  const conflictFn = store.sidesConflict ? store.sidesConflict.bind(store) : (s1, s2) => (s1 || 'front') === (s2 || 'front');

  container.querySelectorAll('.rack-slot').forEach(s => {
    const u = parseInt(s.dataset.slot);
    if (u >= slotU && u < slotU + size) {
      const existingFilter = store.allDevicesInRack(rackId).filter(d => d.id !== excludeId && conflictFn(d.mountSide, effectiveSide));
      let valid = true;
      for (const d of existingFilter) {
        const dEnd = d.slotStart + d.size - 1;
        const nEnd = slotU + size - 1;
        if (!(nEnd < d.slotStart || slotU > dEnd)) { valid = false; break; }
      }
      s.classList.add(valid ? 'drop-highlight' : 'drop-invalid');
    }
  });
}

function onSlotDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    clearDropHighlights();
  }
}

function onSlotDrop(e) {
  e.preventDefault();
  if (!dragState) return;
  const slot  = e.currentTarget;
  const slotU = parseInt(slot.dataset.slot);
  const rackId = slot.dataset.rack;
  const slotMountSide = slot.dataset.side || 'front';
  clearDropHighlights();

  if (dragState.type === 'catalog') {
    const item = { ...dragState.item, name: dragState.item.name };
    const effectiveSide = item.mountSide === 'both' ? 'both' : slotMountSide;
    const ok = store.addDeviceToRack(item, rackId, slotU, effectiveSide);
    const sideLabel = effectiveSide === 'both' ? 'Ambas Caras' : (effectiveSide === 'front' ? 'Frente' : 'Atrás');
    if (ok) notify(`${item.name} instalado en U${slotU} (${sideLabel})`, 'success');
    else    notify(`No hay espacio suficiente: U${slotU}, Lado: ${sideLabel}`, 'error');
  } else if (dragState.type === 'device') {
    const effectiveSide = dragState.device.mountSide === 'both' ? 'both' : slotMountSide;
    const ok = store.moveDevice(dragState.deviceId, rackId, slotU, effectiveSide);
    const sideLabel = effectiveSide === 'both' ? 'Ambas Caras' : (effectiveSide === 'front' ? 'Frente' : 'Atrás');
    if (ok) notify(`Equipo movido a U${slotU} (${sideLabel})`, 'success');
    else    notify(`Posición inválida: U${slotU}, Lado: ${sideLabel}`, 'error');
  }
  dragState = null;
}

function canPlace(rackId, slotStart, size, mountSide = 'front', excludeDeviceId = null) {
  const rack = store.rackById(rackId);
  if (!rack) return false;
  if (slotStart < 1 || slotStart + size - 1 > rack.height) return false;
  const conflictFn = store.sidesConflict ? store.sidesConflict.bind(store) : (s1, s2) => (s1 || 'front') === (s2 || 'front');
  const existing = store.allDevicesInRack(rackId).filter(d => d.id !== excludeDeviceId && conflictFn(d.mountSide, mountSide));
  for (const d of existing) {
    const dEnd = d.slotStart + d.size - 1;
    const nEnd = slotStart + size - 1;
    if (!(nEnd < d.slotStart || slotStart > dEnd)) return false;
  }
  return true;
}

function clearDropHighlights() {
  document.querySelectorAll('.drop-highlight, .drop-invalid').forEach(el => {
    el.classList.remove('drop-highlight', 'drop-invalid');
  });
}

function onDeviceDoubleClick(e) {
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  openEditDeviceModal(devId);
}

function onDeviceContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const devId = e.currentTarget.dataset.deviceId;
  showContextMenu(e.clientX, e.clientY, devId);
}

function showContextMenu(x, y, devId) {
  const menu = document.getElementById('ctx-menu');
  if(!menu) return;
  const dev = store.deviceById(devId);
  menu.innerHTML = `
    <div class="ctx-item" data-action="edit" data-id="${escapeHTML(devId)}"><i class="svg-icon icon-edit" style="width:14px; height:14px; margin-right:6px;"></i>Editar equipo</div>
    <div class="ctx-item" data-action="cable" data-id="${escapeHTML(devId)}"><i class="svg-icon icon-plug" style="width:14px; height:14px; margin-right:6px;"></i>Agregar cable</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" data-action="delete" data-id="${escapeHTML(devId)}"><i class="svg-icon icon-trash" style="width:14px; height:14px; margin-right:6px;"></i>Eliminar ${escapeHTML(dev?.name || '')}</div>
  `;
  menu.style.cssText = `left:${x}px; top:${y}px`;
  menu.classList.remove('hidden');

  menu.querySelectorAll('.ctx-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      menu.classList.add('hidden');
      const id = item.dataset.id;
      if (item.dataset.action === 'edit')   openEditDeviceModal(id);
      if (item.dataset.action === 'delete') { store.deleteDevice(id); notify('Equipo eliminado', 'warn'); }
      if (item.dataset.action === 'cable')  openCableModal(id);
    });
  });
}

document.addEventListener('click', () => {
  const menu = document.getElementById('ctx-menu');
  if(menu) menu.classList.add('hidden');
});

function onDeviceMouseEnter(e) {
  try {
    const devId = e.currentTarget.dataset.deviceId;
    const dev = store.deviceById(devId);
    if(!dev) return;

    const tooltip = document.getElementById('device-tooltip');
    if(!tooltip) return;

    const safeName = dev.name || 'Desconocido';
    const safeType = dev.type ? String(dev.type).toUpperCase() : 'DESCONOCIDO';
    const safeIp   = dev.ip || 'N/A';
    const safeUser = dev.user || 'N/A';
    
    let safePass = 'N/A';
    if (dev.pass) {
      safePass = (typeof window !== 'undefined' && window.SHOW_PASSWORDS) ? dev.pass : '••••••••';
    }

    tooltip.innerHTML = `
      <div class="tt-title">${escapeHTML(String(safeName))}</div>
      <div class="tt-row"><span>Tipo:</span> <span>${escapeHTML(safeType)}</span></div>
      <div class="tt-row"><span>IP:</span> <span>${escapeHTML(String(safeIp))}</span></div>
      <div class="tt-row"><span>User:</span> <span>${escapeHTML(String(safeUser))}</span></div>
      <div class="tt-row"><span>Pass:</span> <span>${escapeHTML(String(safePass))}</span></div>
    `;
    
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    if(x + 220 > window.innerWidth) x = e.clientX - 235;
    
    const tooltipHeight = tooltip.offsetHeight || 150;
    if(y + tooltipHeight > window.innerHeight) y = window.innerHeight - tooltipHeight - 10;
    
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;

    tooltip.classList.add('visible');
  } catch (err) {
    console.error('Error showing tooltip:', err);
  }
}

function onDeviceMouseMove(e) {
  const tooltip = document.getElementById('device-tooltip');
  if(!tooltip || !tooltip.classList.contains('visible')) return;
  let x = e.clientX + 15;
  let y = e.clientY + 15;
  if(x + 220 > window.innerWidth) x = e.clientX - 235;
  if(y + tooltip.offsetHeight > window.innerHeight) y = window.innerHeight - tooltip.offsetHeight - 10;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function onDeviceMouseLeave(e) {
  const tooltip = document.getElementById('device-tooltip');
  if(tooltip) tooltip.classList.remove('visible');
}

function renderFloorSection(roomId) {
  const floorDevices = store.allFloorDevicesInRoom(roomId);
  
  const section = document.createElement('div');
  section.className = 'floor-section';
  section.dataset.roomId = roomId;
  section.innerHTML = `
    <div class="floor-section-header" style="flex-wrap: wrap; gap: 8px;">
      <span style="flex: 1 1 auto; min-width: max-content;">Equipos de Piso / Periféricos</span>
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn-primary" id="floor-btn-add-device" style="padding: 2px 8px; font-size: 12px; height: 24px; background:rgba(56, 189, 248, 0.15); border-color:var(--accent); color:var(--accent); white-space: nowrap;"><i class="svg-icon icon-bolt" style="width:14px; height:14px; margin-right:4px;"></i>Agregar Equipo</button>
        <span class="floor-device-count" style="white-space: nowrap;">${floorDevices.length} dispositivos</span>
      </div>
    </div>
    <div class="floor-devices-grid" id="floor-grid-${roomId}" data-room-id="${roomId}">
      ${floorDevices.length === 0
        ? '<div class="floor-empty">Arrastra periféricos o equipos aquí para ubicarlos en la sala</div>'
        : floorDevices.map(d => getFloorFaceplate(d)).join('')
      }
    </div>`;

  const grid = section.querySelector('.floor-devices-grid');
  
  grid.addEventListener('dragover', e => {
    e.preventDefault();
    grid.classList.add('drag-over');
  });
  
  grid.addEventListener('dragleave', () => {
    grid.classList.remove('drag-over');
  });
  
  grid.addEventListener('drop', e => {
    e.preventDefault();
    grid.classList.remove('drag-over');
    
    if (dragState && dragState.type === 'catalog') {
      const template = dragState.item;
      const floorTypes = ['pc', 'camera', 'ap', 'door', 'printer', 'phone'];
      
      if (floorTypes.includes(template.type)) {
        store.addFloorDevice(template, roomId);
        notify(`${template.name} ubicado en la sala`, 'success');
      } else {
        notify('Este equipo requiere montaje obligatorio en Rack', 'warn');
      }
    }
  });

  const addDevBtn = section.querySelector('#floor-btn-add-device');
  if (addDevBtn) {
    addDevBtn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickPlacementModal(null);
    });
  }

  return section;
}

if (!window._physicalCablesBound) {
  window.addEventListener('resize', () => {
    if (document.getElementById('view-physical') && document.getElementById('view-physical').classList.contains('active')) {
      drawPhysicalCables();
    }
  });
  window._physicalCablesBound = true;
}
