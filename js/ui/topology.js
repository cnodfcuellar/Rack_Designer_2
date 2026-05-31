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
  }
}

function saveTopo() {
  store.saveTopologyState({ nodePositions, rackPositions, roomPositions, roomSizes, rackSizes });
}

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

    // Check Resizing first
    for (const rack of store._raw.racks) {
      const pos = rackPositions[rack.id];
      const size = rackSizes[rack.id];
      if (!pos || !size) continue;
      if (mx >= pos.x + size.w - 20 && mx <= pos.x + size.w && my >= pos.y + size.h - 20 && my <= pos.y + size.h) {
        resizingRack = rack.id;
        return;
      }
    }
    for (const room of store._raw.rooms) {
      const pos = roomPositions[room.id];
      const size = roomSizes[room.id];
      if (!pos || !size) continue;
      if (mx >= pos.x + size.w - 24 && mx <= pos.x + size.w && my >= pos.y + size.h - 24 && my <= pos.y + size.h) {
        resizingRoom = room.id;
        return;
      }
    }

    // Dragging Nodes
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
    // Dragging Racks
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
    // Dragging Rooms
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
    // Pan
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

    if (resizingRack) {
      const rackPos = rackPositions[resizingRack];
      const rack = store._raw.racks.find(r => r.id === resizingRack);
      const roomPos = roomPositions[rack.roomId];
      const roomSize = roomSizes[rack.roomId];

      let newW = mx - rackPos.x;
      let newH = my - rackPos.y;

      let maxDevX = rackPos.x + 100;
      let maxDevY = rackPos.y + 80;
      store.allDevicesInRack(resizingRack).forEach(dev => {
        const dp = nodePositions[dev.id];
        if (dp) {
          if (dp.x + 35 > maxDevX) maxDevX = dp.x + 35;
          if (dp.y + 35 > maxDevY) maxDevY = dp.y + 35;
        }
      });
      const minW = Math.max(160, maxDevX - rackPos.x);
      const minH = Math.max(100, maxDevY - rackPos.y);

      if (newW < minW) newW = minW;
      if (newH < minH) newH = minH;

      if (roomPos && roomSize) {
        if (rackPos.x + newW > roomPos.x + roomSize.w - 10) newW = roomPos.x + roomSize.w - rackPos.x - 10;
        if (rackPos.y + newH > roomPos.y + roomSize.h - 10) newH = roomPos.y + roomSize.h - rackPos.y - 10;
      }
      rackSizes[resizingRack] = { w: newW, h: newH };
      return;
    }

    if (resizingRoom) {
      const roomPos = roomPositions[resizingRoom];
      let newW = mx - roomPos.x;
      let newH = my - roomPos.y;

      let maxRackX = roomPos.x + 150;
      let maxRackY = roomPos.y + 100;
      store._raw.racks.filter(r => r.roomId === resizingRoom).forEach(rack => {
        const rp = rackPositions[rack.id];
        const rs = rackSizes[rack.id];
        if (rp && rs) {
          if (rp.x + rs.w + 15 > maxRackX) maxRackX = rp.x + rs.w + 15;
          if (rp.y + rs.h + 15 > maxRackY) maxRackY = rp.y + rs.h + 15;
        }
      });
      const minW = Math.max(250, maxRackX - roomPos.x);
      const minH = Math.max(150, maxRackY - roomPos.y);

      if (newW < minW) newW = minW;
      if (newH < minH) newH = minH;

      roomSizes[resizingRoom] = { w: newW, h: newH };
      return;
    }

    if (draggingNode) {
      const dev = store._raw.devices.find(d => d.id === draggingNode);
      const rackPos = rackPositions[dev.rackId];
      const rackSize = rackSizes[dev.rackId];
      
      let nx = mx + nodeOrig.x;
      let ny = my + nodeOrig.y;

      if (rackPos && rackSize) {
        const r = 24;
        if (nx - r < rackPos.x) nx = rackPos.x + r;
        if (nx + r > rackPos.x + rackSize.w) nx = rackPos.x + rackSize.w - r;
        if (ny - r < rackPos.y + 40) ny = rackPos.y + 40 + r;
        if (ny + r > rackPos.y + rackSize.h) ny = rackPos.y + rackSize.h - r;
      }
      nodePositions[draggingNode] = { x: nx, y: ny };
      return;
    }
    
    if (draggingRack) {
      const rack = store._raw.racks.find(r => r.id === draggingRack);
      const roomPos = roomPositions[rack.roomId];
      const roomSize = roomSizes[rack.roomId];
      const rackSize = rackSizes[draggingRack];

      let nx = mx + nodeOrig.x;
      let ny = my + nodeOrig.y;

      if (roomPos && roomSize && rackSize) {
        if (nx < roomPos.x + 10) nx = roomPos.x + 10;
        if (nx + rackSize.w > roomPos.x + roomSize.w - 10) nx = roomPos.x + roomSize.w - rackSize.w - 10;
        if (ny < roomPos.y + 50) ny = roomPos.y + 50;
        if (ny + rackSize.h > roomPos.y + roomSize.h - 10) ny = roomPos.y + roomSize.h - rackSize.h - 10;
      }

      const np = { x: nx, y: ny };
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

    // Detect Hover & Cursor State
    hoveredNode = null;
    let newCursor = 'default';

    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        hoveredNode = dev.id;
        newCursor = 'grab';
        break;
      }
    }

    if (!hoveredNode) {
      for (const rack of store._raw.racks) {
        const pos = rackPositions[rack.id];
        const size = rackSizes[rack.id];
        if (!pos || !size) continue;
        if (mx >= pos.x + size.w - 20 && mx <= pos.x + size.w && my >= pos.y + size.h - 20 && my <= pos.y + size.h) {
          newCursor = 'nwse-resize';
          break;
        }
        if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 40) {
          newCursor = 'grab';
          break;
        }
      }
      for (const room of store._raw.rooms) {
        const pos = roomPositions[room.id];
        const size = roomSizes[room.id];
        if (!pos || !size) continue;
        if (mx >= pos.x + size.w - 24 && mx <= pos.x + size.w && my >= pos.y + size.h - 24 && my <= pos.y + size.h) {
          newCursor = 'nwse-resize';
          break;
        }
        if (mx >= pos.x && mx <= pos.x + size.w && my >= pos.y && my <= pos.y + 50) {
          newCursor = 'grab';
          break;
        }
      }
    }
    
    if (canvas.style.cursor !== newCursor) canvas.style.cursor = newCursor;
  });

  canvas.addEventListener('mouseup', e => {
    if (draggingNode && e.detail === 2) {
      openCableModal(draggingNode);
    }
    if (draggingNode || draggingRack || draggingRoom || resizingRack || resizingRoom) {
      saveTopo(); // Guardar cualquier cambio de posición o tamaño
    }
    draggingNode = null; draggingRack = null; draggingRoom = null; 
    resizingRack = null; resizingRoom = null;
    panStart = null;
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
  loadTopoState();
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
      if (!rackSizes[rack.id]) {
        rackSizes[rack.id] = { w: rw, h: rh };
      }

      devices.forEach((dev, di) => {
        if (!nodePositions[dev.id]) {
          nodePositions[dev.id] = {
            x: rackPositions[rack.id].x + rackSizes[rack.id].w / 2,
            y: rackPositions[rack.id].y + 60 + di * 60
          };
        }
      });

      currentRackX += rackSizes[rack.id].w + 40;
      if (rackSizes[rack.id].h > maxRackH) maxRackH = rackSizes[rack.id].h;
    });

    const roomW = Math.max(300, currentRackX - currentRoomX);
    const roomH = maxRackH + 120;

    if (!roomPositions[room.id]) {
      roomPositions[room.id] = { x: currentRoomX, y: margin };
    }
    if (!roomSizes[room.id]) {
      roomSizes[room.id] = { w: roomW, h: roomH };
    }

    currentRoomX += roomSizes[room.id].w + 80;
  });
  saveTopo();
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
  
  // Fondo global
  ctx.fillStyle = '#2255aa';
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

  // Draw Rooms
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 24);
    ctx.fillStyle = '#f97316' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px 'Space Grotesk', sans-serif`;
    ctx.fillText(room.name, pos.x + 24, pos.y + 40);

    // Resize Handle Room
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 20, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 20);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#c2410c';
    ctx.fill();
    ctx.restore();
  });

  // Draw Racks
  store._raw.racks.forEach(rack => {
    const pos = rackPositions[rack.id];
    const size = rackSizes[rack.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 12);
    ctx.fillStyle = '#65a30d' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x + 15, pos.y + 25);

    // Resize Handle Rack
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 16, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 16);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#ffffffaa';
    ctx.fill();
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
    
    if (isHoverTarget) {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff66'; 
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
      ctx.fillStyle = '#ffffff22'; 
      ctx.fill();
    }
    
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.fill(); ctx.stroke();
    
    ctx.font = '16px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const icons = { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' };
    ctx.fillText(icons[dev.type]||'●', pos.x, pos.y);
    
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dev.name.slice(0, 16), pos.x, pos.y + r + 12);
    ctx.restore();
  });

  ctx.restore(); // Restaurar matriz
  
  if (hoveredNode) {
    const dev = store.deviceById(hoveredNode);
    if (dev) {
      ctx.save();
      const hudW = 180;
      const hudH = 100;
      let hudX = mousePos.rawX + 20;
      let hudY = mousePos.rawY + 20;
      
      if (hudX + hudW > W) hudX = mousePos.rawX - hudW - 20;
      if (hudY + hudH > H) hudY = mousePos.rawY - hudH - 20;

      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = TYPE_COLORS[dev.type] || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

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
  if (lbl) lbl.textContent = Math.round((store._raw.zoom || 1) * 100) + '%';
}
