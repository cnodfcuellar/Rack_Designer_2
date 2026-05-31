let canvas, ctx;
let topoAnim = null;
let panStart = null;
let panOrig = { x: 0, y: 0 };
const nodePositions = {};
const rackPositions = {};
const roomPositions = {};
const roomSizes = {};
const rackSizes = {};
let flowT = 0;

let draggingNode = null, draggingRack = null, draggingRoom = null;
let nodeOrig = null;

let hoveredNode = null;
let mousePos = { x: -1000, y: -1000, rawX: -1000, rawY: -1000 };

function initTopology() {
  canvas = document.getElementById('topology-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('mousedown', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    // 1. Priorizar Nodos (Equipos)
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        draggingNode = dev.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // 2. Comprobar Gabinetes (área del título)
    for (const rack of store._raw.racks) {
      const pos = rackPositions[rack.id];
      const size = rackSizes[rack.id];
      if (!pos || !size) continue;
      if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 40) {
        draggingRack = rack.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // 3. Comprobar Salas (área del título)
    for (const room of store._raw.rooms) {
      const pos = roomPositions[room.id];
      const size = roomSizes[room.id];
      if (!pos || !size) continue;
      if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 50) {
        draggingRoom = room.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // 4. Panorámica (Arrastrar lienzo vacío)
    panStart = { x: e.clientX, y: e.clientY };
    panOrig  = { x: store._raw.panX || 0, y: store._raw.panY || 0 };
  });

  canvas.addEventListener('mousemove', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    mousePos = { x: mx, y: my, rawX: e.offsetX, rawY: e.offsetY };

    if (draggingNode) {
      nodePositions[draggingNode] = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      return;
    }
    if (draggingRack) {
      const np = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      const old = rackPositions[draggingRack];
      const dx = np.x - old.x, dy = np.y - old.y;
      rackPositions[draggingRack] = np;
      store.allDevicesInRack(draggingRack).forEach(dev => {
        if (nodePositions[dev.id]) {
          nodePositions[dev.id].x += dx;
          nodePositions[dev.id].y += dy;
        }
      });
      return;
    }
    if (draggingRoom) {
      const np = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      const old = roomPositions[draggingRoom];
      const dx = np.x - old.x, dy = np.y - old.y;
      roomPositions[draggingRoom] = np;
      
      const racksInRoom = store._raw.racks.filter(r => r.roomId === draggingRoom);
      racksInRoom.forEach(rack => {
        if (rackPositions[rack.id]) {
          rackPositions[rack.id].x += dx;
          rackPositions[rack.id].y += dy;
        }
        store.allDevicesInRack(rack.id).forEach(dev => {
          if (nodePositions[dev.id]) {
            nodePositions[dev.id].x += dx;
            nodePositions[dev.id].y += dy;
          }
        });
      });
      return;
    }
    if (panStart) {
      store._raw.panX = panOrig.x + (e.clientX - panStart.x);
      store._raw.panY = panOrig.y + (e.clientY - panStart.y);
      return;
    }

    // Hover logic
    hoveredNode = null;
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        hoveredNode = dev.id;
        break;
      }
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (draggingNode && e.detail === 2) {
      openCableModal(draggingNode);
    }
    draggingNode = null; draggingRack = null; draggingRoom = null; panStart = null;
  });

  canvas.addEventListener('dblclick', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        openCableModal(dev.id);
        return;
      }
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    store._raw.zoom = Math.min(3, Math.max(0.1, (store._raw.zoom || 1) * delta));
    updateZoomLabel();
  });
}

function initTopoPositions() {
  const margin = 80;
  let currentRoomX = margin;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let currentRackX = currentRoomX + 40;
    let maxRackH = 100;

    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id);
      const rh = Math.max(200, devices.length * 60 + 80);
      const rw = 200;
      
      if (!rackPositions[rack.id]) {
        rackPositions[rack.id] = { x: currentRackX, y: margin + 80 };
      }
      rackSizes[rack.id] = { w: rw, h: rh };

      devices.forEach((dev, di) => {
        if (!nodePositions[dev.id]) {
          nodePositions[dev.id] = {
            x: rackPositions[rack.id].x + rw / 2,
            y: rackPositions[rack.id].y + 60 + di * 60
          };
        }
      });

      currentRackX += rw + 40;
      if (rh > maxRackH) maxRackH = rh;
    });

    const roomW = Math.max(300, currentRackX - currentRoomX);
    const roomH = maxRackH + 120;

    if (!roomPositions[room.id]) {
      roomPositions[room.id] = { x: currentRoomX, y: margin };
    }
    roomSizes[room.id] = { w: roomW, h: roomH };

    currentRoomX += roomW + 80;
  });
}

function resizeCanvas() {
  if(!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function drawTopo() {
  if(!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  // Fondo global (Lienzo)
  ctx.fillStyle = '#2255aa'; // Azul brillante según el esquema del usuario
  ctx.fillRect(0, 0, W, H);
  
  // Puntos de malla
  ctx.fillStyle = '#ffffff22';
  for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
  }

  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);

  // Determinar conexiones activas si hay hover
  let connectedNodes = new Set();
  let activeConns = new Set();
  if (hoveredNode) {
    connectedNodes.add(hoveredNode);
    store._raw.connections.forEach(c => {
      if (c.sourceDeviceId === hoveredNode || c.targetDeviceId === hoveredNode) {
        connectedNodes.add(c.sourceDeviceId);
        connectedNodes.add(c.targetDeviceId);
        activeConns.add(c.id);
      }
    });
  }

  // Draw Rooms (Cajas naranjas)
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 24);
    ctx.fillStyle = '#f97316' + (hoveredNode ? '66' : 'ff'); // Naranja brillante
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Título Sala
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px 'Space Grotesk', sans-serif`;
    ctx.fillText(room.name, pos.x + 24, pos.y + 40);
    ctx.restore();
  });

  // Draw Racks (Cajas verdes)
  store._raw.racks.forEach(rack => {
    const pos = rackPositions[rack.id];
    const size = rackSizes[rack.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 12);
    ctx.fillStyle = '#65a30d' + (hoveredNode ? '66' : 'ff'); // Verde
    ctx.fill();
    ctx.strokeStyle = '#ffffff'; // Borde blanco según diseño
    ctx.lineWidth = 2;
    ctx.stroke();

    // Título Rack
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x + 15, pos.y + 25);
    ctx.restore();
  });

  // Draw Connections
  flowT += 0.015;
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const isActive = hoveredNode ? activeConns.has(conn.id) : true;
    
    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;
    // Curvas Bézier controladas para cables que pueden ser largos inter-salas
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
    ctx.strokeStyle = conn.color || '#ffffff';
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.globalAlpha = isActive ? 1 : 0.2;
    ctx.stroke();

    // Partículas fluyendo
    if (isActive) {
      const numParticles = 4;
      for(let i=0; i<numParticles; i++) {
        let t = ((flowT + i/numParticles) % 1);
        const bx = bezierPoint(x1, cx1, cx2, x2, t);
        const by = bezierPoint(y1, cy1, cy2, y2, t);
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }
    ctx.restore();
  });

  // Draw Device Nodes
  store._raw.devices.forEach(dev => {
    const pos = nodePositions[dev.id];
    if (!pos) return;
    const col = TYPE_COLORS[dev.type] || '#888';
    const r = 22;
    const isActive = hoveredNode ? connectedNodes.has(dev.id) : true;
    const isHoverTarget = hoveredNode === dev.id;

    ctx.save();
    ctx.globalAlpha = isActive ? 1 : 0.4;
    
    // Glow si es target
    if (isHoverTarget) {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff66'; 
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff22'; 
      ctx.fill();
    }
    
    // Circle
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
    ctx.fillStyle = '#0f172a'; // Oscuro
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.fill(); ctx.stroke();
    
    // Icon
    ctx.font = '16px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const icons = { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' };
    ctx.fillText(icons[dev.type]||'●', pos.x, pos.y);
    
    // Name
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dev.name.slice(0, 16), pos.x, pos.y + r + 12);
    ctx.restore();
  });

  ctx.restore(); // Restaurar matriz para tooltips HUD fijos (absolutos en pantalla)
  
  // Dibujar Tooltip HUD si hay hover
  if (hoveredNode) {
    const dev = store.deviceById(hoveredNode);
    const rack = store.rackById(dev.rackId);
    if (dev) {
      ctx.save();
      const hudW = 180;
      const hudH = 100;
      let hudX = mousePos.rawX + 20;
      let hudY = mousePos.rawY + 20;
      
      // Evitar salir de pantalla
      if (hudX + hudW > W) hudX = mousePos.rawX - hudW - 20;
      if (hudY + hudH > H) hudY = mousePos.rawY - hudH - 20;

      // HUD Background
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = TYPE_COLORS[dev.type] || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // HUD Content
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      ctx.fillText(dev.name, hudX + 12, hudY + 24);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`Tipo:  ${dev.type.toUpperCase()}`, hudX + 12, hudY + 44);
      ctx.fillText(`IP:    ${dev.ip || 'N/A'}`, hudX + 12, hudY + 59);
      ctx.fillText(`User:  ${dev.user || 'N/A'}`, hudX + 12, hudY + 74);
      ctx.fillText(`Pass:  ${dev.pass || 'N/A'}`, hudX + 12, hudY + 89);
      
      ctx.restore();
    }
  }

  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

function startTopo() {
  resizeCanvas();
  initTopoPositions(); // Ahora recalcula cada vez que entras por si hubo nuevas salas/racks
  if (topoAnim) cancelAnimationFrame(topoAnim);
  drawTopo();
}

function stopTopo() {
  if (topoAnim) cancelAnimationFrame(topoAnim);
  topoAnim = null;
}

function updateZoomLabel() {
  const lbl = document.getElementById('zoom-level');
  if (lbl) lbl.textContent = Math.round((store._raw.zoom || 1) * 100) + '%';
}
