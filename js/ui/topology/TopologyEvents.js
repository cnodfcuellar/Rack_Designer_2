function initTopology() {
  canvas = document.getElementById('topology-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('pointerdown', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
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
      if (['organizer', 'tray'].includes(dev.type)) continue;
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
    panOrig  = { x: store._raw.topoPanX || 0, y: store._raw.topoPanY || 0 };
    mousePos = { x: mx, y: my, rawX: e.offsetX, rawY: e.offsetY };
  });

  canvas.addEventListener('pointermove', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
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
      let nx = mx + nodeOrig.x;
      let ny = my + nodeOrig.y;
      const r = 24;

      // 1. Restringir a Rack si es un equipo montado en rack
      const rackPos = rackPositions[dev.rackId];
      const rackSize = rackSizes[dev.rackId];
      if (rackPos && rackSize) {
        if (nx - r < rackPos.x) nx = rackPos.x + r;
        if (nx + r > rackPos.x + rackSize.w) nx = rackPos.x + rackSize.w - r;
        if (ny - r < rackPos.y + 40) ny = rackPos.y + 40 + r;
        if (ny + r > rackPos.y + rackSize.h) ny = rackPos.y + rackSize.h - r;
      }

      // 2. Restringir a la Sala para que no pueda salir del recuadro
      const roomId = dev.category === 'floor' ? dev.roomId : store.rackById(dev.rackId)?.roomId;
      const roomPos = roomPositions[roomId];
      const roomSize = roomSizes[roomId];
      if (roomPos && roomSize) {
        if (nx - r < roomPos.x + 10) nx = roomPos.x + 10 + r;
        if (nx + r > roomPos.x + roomSize.w - 10) nx = roomPos.x + roomSize.w - 10 - r;
        if (ny - r < roomPos.y + 50) ny = roomPos.y + 50 + r;
        if (ny + r > roomPos.y + roomSize.h - 10) ny = roomPos.y + roomSize.h - 10 - r;
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

      const floorInRoom = store.allFloorDevicesInRoom(draggingRoom);
      floorInRoom.forEach(dev => {
        if (nodePositions[dev.id]) {
          nodePositions[dev.id].x += dx;
          nodePositions[dev.id].y += dy;
        }
      });
      return;
    }
    
    if (panStart) {
      store._raw.topoPanX = panOrig.x + (e.clientX - panStart.x);
      store._raw.topoPanY = panOrig.y + (e.clientY - panStart.y);
      return;
    }

    // Detect Hover & Cursor State
    hoveredNode = null;
    let newCursor = 'default';

    for (const dev of store._raw.devices) {
      if (['organizer', 'tray'].includes(dev.type)) continue;
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

  canvas.addEventListener('pointerup', e => {
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

  canvas.addEventListener('pointercancel', e => {
    draggingNode = null; draggingRack = null; draggingRoom = null; 
    resizingRack = null; resizingRoom = null;
    panStart = null;
  });

  canvas.addEventListener('dblclick', e => {
    const zoom = store._raw.topoZoom || 1;
    const px   = store._raw.topoPanX || 0;
    const py   = store._raw.topoPanY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    // 1) Doble clic sobre un nodo → abrir modal "Nueva Conexión"
    for (const dev of store._raw.devices) {
      if (['organizer', 'tray'].includes(dev.type)) continue;
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 24*24) {
        openCableModal(dev.id);
        return;
      }
    }

    // 2) Doble clic sobre un cable → abrir modal "Editar Conexión"
    const HIT = 10; // tolerancia en píxeles del mundo
    for (const conn of store._raw.connections) {
      const srcPos = nodePositions[conn.sourceDeviceId];
      const dstPos = nodePositions[conn.targetDeviceId];
      if (!srcPos || !dstPos) continue;

      const x1 = srcPos.x, y1 = srcPos.y;
      const x2 = dstPos.x, y2 = dstPos.y;
      const cx1 = x1 + (x2 - x1) * 0.5;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) * 0.5;
      const cy2 = y2;

      // Muestrear la curva Bézier en 30 segmentos y verificar proximidad
      let hit = false;
      let prevBx = x1, prevBy = y1;
      const STEPS = 30;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        const bx = bezierPoint(x1, cx1, cx2, x2, t);
        const by = bezierPoint(y1, cy1, cy2, y2, t);
        // Distancia del punto al segmento [prev..current]
        const dx = bx - prevBx, dy = by - prevBy;
        const len2 = dx*dx + dy*dy;
        let dist2;
        if (len2 === 0) {
          dist2 = (mx - bx)*(mx - bx) + (my - by)*(my - by);
        } else {
          const tp = Math.max(0, Math.min(1, ((mx - prevBx)*dx + (my - prevBy)*dy) / len2));
          const projX = prevBx + tp*dx;
          const projY = prevBy + tp*dy;
          dist2 = (mx - projX)*(mx - projX) + (my - projY)*(my - projY);
        }
        if (dist2 <= HIT*HIT) { hit = true; break; }
        prevBx = bx; prevBy = by;
      }

      if (hit) {
        openEditCableModal(conn.id);
        return;
      }
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    store._raw.topoZoom = Math.min(3, Math.max(0.1, (store._raw.topoZoom || 1) * delta));
    updateZoomLabel();
  });
}
