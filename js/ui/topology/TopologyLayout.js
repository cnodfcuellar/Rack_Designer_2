// ──────────────────────────────────────────────────────────────────
// Topology Layout Engine
// Card size (must match TopologyRenderer.js): 150 × 50 px
// Circle radius: 22 px  (bounding box ~44×44)
// ──────────────────────────────────────────────────────────────────

const CARD_W      = 160;  // card width  + 10px buffer
const CARD_H      = 60;   // card height + 10px buffer
const CIRCLE_D    = 66;   // circle diameter + buffer para etiquetas superior/inferior

// Layout constants
const ROOM_MARGIN   = 80;   // space around the whole diagram
const ROOM_PAD_X    = 24;   // padding inside room (left/right)
const ROOM_PAD_TOP  = 60;   // room header height
const ROOM_PAD_BOT  = 28;   // room footer padding
const RACK_GAP      = 32;   // horizontal gap between racks
const ROOM_GAP      = 60;   // horizontal gap between rooms
const RACK_HEADER_H = 52;   // space for rack label at top and top node IP badge

function _nodeW() { return window.TOPOLOGY_STYLE === 'circle' ? CIRCLE_D : CARD_W; }
function _nodeH() { return window.TOPOLOGY_STYLE === 'circle' ? CIRCLE_D : CARD_H; }

// ──────────────────────────────────────────────────────────────────
// Shared layout computation (returns rooms/racks/nodes/positions)
// Does NOT mutate global state — call _applyLayout() to commit.
// ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────
// M-39: Afinidad de Equipos de Piso por Gabinete
// Encuentra el rack anfitrión de la misma sala al que el equipo de piso
// tiene mayor número de conexiones directas.
// ──────────────────────────────────────────────────────────────────
function _findAffinityRackForFloorDevice(dev, roomRacks, connections, devToRackMap) {
  if (!roomRacks || roomRacks.length === 0) return null;
  const roomRackSet = new Set(roomRacks.map(r => r.id));
  const rackCounts = {};

  (connections || []).forEach(c => {
    let peerId = null;
    if (c.sourceDeviceId === dev.id) peerId = c.targetDeviceId;
    else if (c.targetDeviceId === dev.id) peerId = c.sourceDeviceId;

    if (peerId && devToRackMap[peerId]) {
      const peerRackId = devToRackMap[peerId];
      if (roomRackSet.has(peerRackId)) {
        rackCounts[peerRackId] = (rackCounts[peerRackId] || 0) + 1;
      }
    }
  });

  let bestRackId = null;
  let maxCount = 0;
  roomRacks.forEach(r => {
    const cnt = rackCounts[r.id] || 0;
    if (cnt > maxCount) {
      maxCount = cnt;
      bestRackId = r.id;
    }
  });

  return bestRackId;
}

// ──────────────────────────────────────────────────────────────────
// Shared layout computation (returns rooms/racks/nodes/positions)
// Does NOT mutate global state — call _applyLayout() to commit.
// ──────────────────────────────────────────────────────────────────
function _computeLayout() {
  const nW = _nodeW();
  const nH = _nodeH();
  const spacing = Math.max(nH + 10, window.TOPO_SPACING || 70);
  const colGap  = window.TOPO_SPACING_X !== undefined ? window.TOPO_SPACING_X : 28;

  const newRoomPos  = {};
  const newRoomSize = {};
  const newRackPos  = {};
  const newRackSize = {};
  const newNodePos  = {};

  let curRoomX = ROOM_MARGIN;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    const floorDevs = store.allFloorDevicesInRoom(room.id)
                           .filter(d => !['accesorios'].includes(d.type));

    // ── 1. Size each rack (nodos separados horizontalmente en columnas) ──
    const rackLayouts = racks.map(rack => {
      const devs = store.allDevicesInRack(rack.id)
                        .filter(d => !['accesorios'].includes(d.type));
      const rackCols = devs.length > 1 ? (devs.length >= 6 ? 3 : 2) : 1;
      const rw = Math.max(220, rackCols * nW + (rackCols + 1) * colGap);
      const numRows = Math.ceil(devs.length / rackCols);
      const rh = Math.max(140, RACK_HEADER_H + numRows * spacing + 24);
      return { rack, devs, rackCols, numRows, rw, rh };
    });

    // ── 2. Rack row total width (separación fija entre racks con RACK_GAP) ──
    const racksRowW = rackLayouts.reduce((sum, l) => sum + l.rw, 0)
                    + Math.max(0, (rackLayouts.length - 1)) * RACK_GAP;

    // ── 3. Clasificación de equipos de piso por afinidad a gabinetes (M-39) ──
    const devToRackMap = {};
    store._raw.devices.forEach(d => {
      if (d.rackId) devToRackMap[d.id] = d.rackId;
    });

    const conns = store._raw.connections || [];
    const floorDevsByRack = {};
    racks.forEach(r => { floorDevsByRack[r.id] = []; });
    const unassignedFloorDevs = [];

    floorDevs.forEach(dev => {
      const affRackId = _findAffinityRackForFloorDevice(dev, racks, conns, devToRackMap);
      if (affRackId && floorDevsByRack[affRackId]) {
        floorDevsByRack[affRackId].push(dev);
      } else {
        unassignedFloorDevs.push(dev);
      }
    });

    // Configurar columnas y filas de periféricos de piso para cada rack
    let maxAffinityRows = 0;
    const rackFloorConfig = {};

    rackLayouts.forEach(l => {
      const rDevs = floorDevsByRack[l.rack.id] || [];
      if (rDevs.length === 0) {
        rackFloorConfig[l.rack.id] = { cols: 1, rows: 0, devs: [] };
        return;
      }
      const maxColsInRack = Math.max(1, Math.floor((l.rw + colGap) / (nW + colGap)));
      const floorCols = Math.min(rDevs.length, maxColsInRack);
      const floorRows = Math.ceil(rDevs.length / floorCols);
      if (floorRows > maxAffinityRows) maxAffinityRows = floorRows;
      rackFloorConfig[l.rack.id] = { cols: floorCols, rows: floorRows, devs: rDevs };
    });

    const floorRowH = nH + 20;
    const UNASSIGNED_MAX_COLS = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(unassignedFloorDevs.length))));
    const unassignedRows = unassignedFloorDevs.length > 0 
      ? Math.ceil(unassignedFloorDevs.length / UNASSIGNED_MAX_COLS) 
      : 0;
    const unassignedGridW = unassignedFloorDevs.length > 0 
      ? UNASSIGNED_MAX_COLS * (nW + colGap) - colGap 
      : 0;

    const totalFloorH = (maxAffinityRows > 0 ? maxAffinityRows * floorRowH : 0)
                      + (unassignedRows > 0 ? unassignedRows * floorRowH : 0)
                      + (maxAffinityRows > 0 && unassignedRows > 0 ? 20 : 0);

    // ── 4. Dimensiones de la sala ──────────────────────────────────
    const innerW   = Math.max(racksRowW, unassignedGridW, 300);
    const maxRackH = rackLayouts.reduce((m, l) => Math.max(m, l.rh), 0);
    const roomW    = innerW + 2 * ROOM_PAD_X;
    const roomH    = ROOM_PAD_TOP + maxRackH
                   + (totalFloorH > 0 ? 28 + totalFloorH : 0)
                   + ROOM_PAD_BOT;

    newRoomPos[room.id]  = { x: curRoomX, y: ROOM_MARGIN };
    newRoomSize[room.id] = { w: Math.max(roomW, 280), h: Math.max(roomH, 220) };

    // ── 5. Posicionar racks y nodos internos ───────────────────────
    let curRackX = curRoomX + ROOM_PAD_X;
    const rackTopY = ROOM_MARGIN + ROOM_PAD_TOP;
    const floorBaseY = rackTopY + maxRackH + 28;

    rackLayouts.forEach(({ rack, devs, rackCols, numRows, rw, rh }) => {
      newRackPos[rack.id]  = { x: curRackX, y: rackTopY };
      newRackSize[rack.id] = { w: rw, h: rh };

      devs.forEach((dev, di) => {
        const c = di % rackCols;
        const r = Math.floor(di / rackCols);
        const rowCount = (r === numRows - 1 && devs.length % rackCols !== 0) 
          ? (devs.length % rackCols) 
          : rackCols;
        const rowW = rowCount * nW + (rowCount - 1) * colGap;
        const rowStartX = curRackX + (rw - rowW) / 2 + nW / 2;

        newNodePos[dev.id] = {
          x: rowStartX + c * (nW + colGap),
          y: rackTopY + RACK_HEADER_H + r * spacing + nH / 2
        };
      });

      // ── 6. Equipos de piso con afinidad a este rack (M-39) ─────────
      const fConf = rackFloorConfig[rack.id];
      if (fConf && fConf.devs.length > 0) {
        const fCols = fConf.cols;
        const fDevs = fConf.devs;
        const fNumRows = fConf.rows;

        fDevs.forEach((fDev, fi) => {
          const fc = fi % fCols;
          const fr = Math.floor(fi / fCols);
          const fRowCount = (fr === fNumRows - 1 && fDevs.length % fCols !== 0)
            ? (fDevs.length % fCols)
            : fCols;
          const fRowW = fRowCount * nW + (fRowCount - 1) * colGap;
          const fRowStartX = curRackX + (rw - fRowW) / 2 + nW / 2;

          newNodePos[fDev.id] = {
            x: fRowStartX + fc * (nW + colGap),
            y: floorBaseY + fr * floorRowH + nH / 2
          };
        });
      }

      curRackX += rw + RACK_GAP;
    });

    // ── 7. Equipos de piso no asignados (centrados al pie de la sala) ──
    if (unassignedFloorDevs.length > 0) {
      const unassignedStartY = floorBaseY + (maxAffinityRows > 0 ? maxAffinityRows * floorRowH + 20 : 0);
      const startX = curRoomX + (roomW - unassignedGridW) / 2;

      unassignedFloorDevs.forEach((dev, ui) => {
        const col = ui % UNASSIGNED_MAX_COLS;
        const row = Math.floor(ui / UNASSIGNED_MAX_COLS);
        newNodePos[dev.id] = {
          x: startX + col * (nW + colGap) + nW / 2,
          y: unassignedStartY + row * floorRowH + nH / 2
        };
      });
    }

    curRoomX += newRoomSize[room.id].w + ROOM_GAP;
  });

  return { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos };
}

// ──────────────────────────────────────────────────────────────────
// Jerarquía para Árbol de Red (Core → Distribución → Acceso → Soporte)
// ──────────────────────────────────────────────────────────────────
function _getDeviceTier(dev) {
  const type = (dev.type || '').toLowerCase();
  const name = (dev.name || '').toLowerCase();
  const model = (dev.model || '').toLowerCase();
  const cat = (dev.category || '').toLowerCase();
  const s = `${type} ${name} ${model} ${cat}`;

  // Capa 4: Infraestructura / Energía / Soporte
  if (type === 'ups' || type === 'pdu' || type === 'ats' || s.includes('ups') || s.includes('pdu') || s.includes('ats') || s.includes('kvm') || s.includes('organizador') || s.includes('bandeja')) {
    return 3;
  }
  // Capa 1: Borde & Núcleo (Routers, Firewalls, Gateways, Core Switches)
  if (type === 'router' || type === 'firewall' || s.includes('router') || s.includes('firewall') || s.includes('gateway') || s.includes('core') || s.includes('borde') || s.includes('border')) {
    return 0;
  }
  // Capa 2: Distribución & Cómputo (Servidores, Storage, SAN, NAS, Blades)
  if (type === 'servidor' || type === 'server' || type === 'storage' || type === 'nas' || type === 'san' || s.includes('servidor') || s.includes('server') || s.includes('storage') || s.includes('nas') || s.includes('san') || s.includes('distrib') || s.includes('blade') || s.includes('virtualiz') || s.includes('hypervisor') || s.includes('cómputo')) {
    return 1;
  }
  // Capa 3: Acceso & Dispositivos de Piso / Cámaras / PCs
  return 2;
}

function _computeTreeLayout() {
  const nW = _nodeW();
  const nH = _nodeH();
  const colGap = window.TOPO_SPACING_X !== undefined ? window.TOPO_SPACING_X : 28;
  const rowGap = Math.max(90, (window.TOPO_SPACING || 60) * 1.8);

  const newRoomPos  = {};
  const newRoomSize = {};
  const newRackPos  = {};
  const newRackSize = {};
  const newNodePos  = {};

  // 1. Recolectar todos los dispositivos válidos
  const allDevs = [];
  const devMap = {};
  store._raw.rooms.forEach(room => {
    store._raw.racks.filter(r => r.roomId === room.id).forEach(rack => {
      store.allDevicesInRack(rack.id).filter(d => !['accesorios'].includes(d.type)).forEach(d => {
        allDevs.push(d);
        devMap[d.id] = { dev: d, roomId: room.id, rackId: rack.id, isFloor: false };
      });
    });
    store.allFloorDevicesInRoom(room.id).filter(d => !['accesorios'].includes(d.type)).forEach(d => {
      allDevs.push(d);
      devMap[d.id] = { dev: d, roomId: room.id, rackId: null, isFloor: true };
    });
  });

  if (allDevs.length === 0) return _computeLayout();

  // 2. Identificar dispositivos con conexiones y asignar base tier sólo a los conectados
  const conns = store._raw.connections || [];
  const connectedDevIds = new Set();
  conns.forEach(c => {
    if (c.sourceDeviceId) connectedDevIds.add(c.sourceDeviceId);
    if (c.targetDeviceId) connectedDevIds.add(c.targetDeviceId);
  });

  const tiers = {};
  allDevs.forEach(d => {
    if (connectedDevIds.has(d.id)) {
      tiers[d.id] = _getDeviceTier(d);
    } else {
      tiers[d.id] = null; // No conectado
    }
  });

  // 3. Ajustar tiers basándose en el grafo de conexiones (DAG Padre -> Hijo)
  const adj = {}; // padre -> lista de hijos
  allDevs.forEach(d => { adj[d.id] = []; });

  conns.forEach(c => {
    const u = c.sourceDeviceId;
    const v = c.targetDeviceId;
    if (devMap[u] && devMap[v] && tiers[u] !== null && tiers[v] !== null) {
      const tU = tiers[u];
      const tV = tiers[v];
      if (tU < tV) {
        adj[u].push(v);
      } else if (tV < tU) {
        adj[v].push(u);
      } else {
        // Si comparten el mismo tier base, orientamos por la dirección source -> target
        adj[u].push(v);
      }
    }
  });

  // Relajación de niveles: para todo enlace u -> v, tier[v] debe ser al menos tier[u] + 1
  for (let iter = 0; iter < allDevs.length; iter++) {
    let changed = false;
    allDevs.forEach(uDev => {
      const u = uDev.id;
      if (tiers[u] === null) return;
      adj[u].forEach(v => {
        if (tiers[v] !== null && tiers[v] <= tiers[u]) {
          tiers[v] = tiers[u] + 1;
          changed = true;
        }
      });
    });
    if (!changed) break;
  }

  // Nivel máximo entre dispositivos conectados
  let maxGlobalConnectedTier = 0;
  Object.values(tiers).forEach(t => {
    if (t !== null && t > maxGlobalConnectedTier) maxGlobalConnectedTier = t;
  });

  // 4. Distribuir salas y racks con los nodos en sus niveles calculados
  let curRoomX = ROOM_MARGIN;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    const floorDevs = store.allFloorDevicesInRoom(room.id).filter(d => !['accesorios'].includes(d.type));

    // El rack inicia por debajo de la cabecera de la sala (ROOM_PAD_TOP = 60/64)
    const rackTopY = ROOM_MARGIN + ROOM_PAD_TOP;
    const startY = rackTopY + RACK_HEADER_H;

    // Analizamos cada rack
    const rackLayouts = racks.map(rack => {
      const devs = store.allDevicesInRack(rack.id).filter(d => !['accesorios'].includes(d.type));
      if (devs.length === 0) {
        return { rack, devs, rackTiers: {}, tierKeys: [], maxCols: 1, rw: 200, rh: 140 };
      }

      // Separar conectados y no conectados
      const connDevs   = devs.filter(d => tiers[d.id] !== null);
      const unconnDevs = devs.filter(d => tiers[d.id] === null);

      // Tiers de dispositivos conectados en este rack
      const rackTiers = {};
      connDevs.forEach(d => {
        const t = tiers[d.id];
        if (!rackTiers[t]) rackTiers[t] = [];
        rackTiers[t].push(d);
      });
      const connTierKeys = Object.keys(rackTiers).map(Number).sort((a, b) => a - b);
      const maxConnCols = connTierKeys.reduce((m, k) => Math.max(m, rackTiers[k].length), 0);

      // Ancho de columnas para el rack
      const maxCols = Math.max(maxConnCols, Math.min(unconnDevs.length, 2), 1);
      const rw = Math.max(220, maxCols * nW + (maxCols + 1) * colGap);

      // Los dispositivos no conectados van en la parte baja del rack
      const unconnStartTier = connTierKeys.length > 0 
        ? Math.max(...connTierKeys) + 1 
        : Math.max(1, maxGlobalConnectedTier);

      // Agrupar los no conectados en filas de hasta maxCols
      const unconnCols = Math.max(1, maxCols);
      for (let i = 0; i < unconnDevs.length; i += unconnCols) {
        const row = unconnDevs.slice(i, i + unconnCols);
        const t = unconnStartTier + Math.floor(i / unconnCols);
        rackTiers[t] = row;
      }

      const allTierKeys = Object.keys(rackTiers).map(Number).sort((a, b) => a - b);
      const maxT = allTierKeys.length > 0 ? Math.max(...allTierKeys) : 0;

      const maxY = startY + maxT * rowGap;
      const rh = Math.max(160, (maxY + nH / 2 + 24) - rackTopY);

      return { rack, devs, rackTiers, tierKeys: allTierKeys, maxCols, rw, rh };
    });

    // Ancho total de la fila de racks (separación estándar fija con RACK_GAP)
    const racksRowW = rackLayouts.reduce((sum, l) => sum + l.rw, 0)
                    + Math.max(0, (rackLayouts.length - 1)) * RACK_GAP;

    // ── Clasificación de equipos de piso por afinidad de rack (M-39) ──
    const devToRackMap = {};
    store._raw.devices.forEach(d => {
      if (d.rackId) devToRackMap[d.id] = d.rackId;
    });

    const floorDevsByRack = {};
    racks.forEach(r => { floorDevsByRack[r.id] = []; });
    const unassignedFloorDevs = [];

    floorDevs.forEach(dev => {
      const affRackId = _findAffinityRackForFloorDevice(dev, racks, conns, devToRackMap);
      if (affRackId && floorDevsByRack[affRackId]) {
        floorDevsByRack[affRackId].push(dev);
      } else {
        unassignedFloorDevs.push(dev);
      }
    });

    let maxAffinityFloorRows = 0;
    const rackFloorConfig = {};
    const floorRowH = nH + 24;

    rackLayouts.forEach(l => {
      const rDevs = floorDevsByRack[l.rack.id] || [];
      if (rDevs.length === 0) {
        rackFloorConfig[l.rack.id] = { cols: 1, rows: 0, devs: [] };
        return;
      }
      const maxColsInRack = Math.max(1, Math.floor((l.rw + colGap) / (nW + colGap)));
      const floorCols = Math.min(rDevs.length, maxColsInRack);
      const floorRows = Math.ceil(rDevs.length / floorCols);
      if (floorRows > maxAffinityFloorRows) maxAffinityFloorRows = floorRows;
      rackFloorConfig[l.rack.id] = { cols: floorCols, rows: floorRows, devs: rDevs };
    });

    const UNASSIGNED_MAX_COLS = Math.max(1, Math.min(6, unassignedFloorDevs.length));
    const unassignedFloorRows = unassignedFloorDevs.length > 0 
      ? Math.ceil(unassignedFloorDevs.length / UNASSIGNED_MAX_COLS) 
      : 0;
    const unassignedGridW = unassignedFloorDevs.length > 0 
      ? UNASSIGNED_MAX_COLS * (nW + colGap) - colGap 
      : 0;

    const totalFloorH = (maxAffinityFloorRows > 0 ? maxAffinityFloorRows * floorRowH : 0)
                      + (unassignedFloorRows > 0 ? unassignedFloorRows * floorRowH : 0)
                      + (maxAffinityFloorRows > 0 && unassignedFloorRows > 0 ? 20 : 0);

    const innerW = Math.max(racksRowW, unassignedGridW, 300);
    const maxRackBottom = rackLayouts.reduce((m, l) => Math.max(m, rackTopY + l.rh), rackTopY + 160);
    const roomW = innerW + 2 * ROOM_PAD_X;
    const roomH = (maxRackBottom - ROOM_MARGIN) + (totalFloorH > 0 ? 30 + totalFloorH : 0) + ROOM_PAD_BOT;

    newRoomPos[room.id] = { x: curRoomX, y: ROOM_MARGIN };
    newRoomSize[room.id] = { w: roomW, h: Math.max(roomH, 260) };

    const floorBaseY = maxRackBottom + 24;

    // Posicionar racks dentro de la sala
    let curRackX = curRoomX + ROOM_PAD_X;
    rackLayouts.forEach(({ rack, rackTiers, tierKeys, rw, rh }) => {
      newRackPos[rack.id] = { x: curRackX, y: rackTopY };
      newRackSize[rack.id] = { w: rw, h: rh };

      // Ubicar cada dispositivo interno en su posición (X, Y)
      tierKeys.forEach(t => {
        const rowDevs = rackTiers[t];
        const rowY = startY + t * rowGap + nH / 2;
        const rowTotalW = rowDevs.length * nW + (rowDevs.length - 1) * colGap;
        const rowStartX = curRackX + (rw - rowTotalW) / 2 + nW / 2;

        rowDevs.forEach((dev, colIdx) => {
          newNodePos[dev.id] = {
            x: rowStartX + colIdx * (nW + colGap),
            y: rowY
          };
        });
      });

      // Equipos de piso afines a este rack (M-39)
      const fConf = rackFloorConfig[rack.id];
      if (fConf && fConf.devs.length > 0) {
        const fCols = fConf.cols;
        const fDevs = fConf.devs;
        const fNumRows = fConf.rows;

        fDevs.forEach((fDev, fi) => {
          const fc = fi % fCols;
          const fr = Math.floor(fi / fCols);
          const fRowCount = (fr === fNumRows - 1 && fDevs.length % fCols !== 0)
            ? (fDevs.length % fCols)
            : fCols;
          const fRowW = fRowCount * nW + (fRowCount - 1) * colGap;
          const fRowStartX = curRackX + (rw - fRowW) / 2 + nW / 2;

          newNodePos[fDev.id] = {
            x: fRowStartX + fc * (nW + colGap),
            y: floorBaseY + fr * floorRowH + nH / 2
          };
        });
      }

      curRackX += rw + RACK_GAP;
    });

    // Posicionar floor devices no asignados o desconectados en la base de la sala
    if (unassignedFloorDevs.length > 0) {
      const unassignedStartY = floorBaseY + (maxAffinityFloorRows > 0 ? maxAffinityFloorRows * floorRowH + 20 : 0);
      const unassignedStartX = curRoomX + (roomW - unassignedGridW) / 2;

      unassignedFloorDevs.forEach((dev, fi) => {
        const c = fi % UNASSIGNED_MAX_COLS;
        const r = Math.floor(fi / UNASSIGNED_MAX_COLS);
        newNodePos[dev.id] = {
          x: unassignedStartX + c * (nW + colGap) + nW / 2,
          y: unassignedStartY + r * floorRowH + nH / 2
        };
      });
    }

    curRoomX += roomW + ROOM_GAP;
  });

  return { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos };
}

// ──────────────────────────────────────────────────────────────────
// initTopoPositions — called on first load; only fills missing slots
// ──────────────────────────────────────────────────────────────────
function initTopoPositions() {
  loadTopoState();
  const layoutResult = window.TOPO_LAYOUT_MODE === 'tree' ? _computeTreeLayout() : _computeLayout();
  const { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos } = layoutResult;

  Object.keys(newRoomPos).forEach(id  => { if (!roomPositions[id])  roomPositions[id]  = newRoomPos[id];  });
  Object.keys(newRoomSize).forEach(id => { if (!roomSizes[id])      roomSizes[id]      = newRoomSize[id]; });
  Object.keys(newRackPos).forEach(id  => { if (!rackPositions[id])  rackPositions[id]  = newRackPos[id];  });
  Object.keys(newRackSize).forEach(id => { if (!rackSizes[id])      rackSizes[id]      = newRackSize[id]; });
  Object.keys(newNodePos).forEach(id  => { if (!nodePositions[id])  nodePositions[id]  = newNodePos[id];  });

  saveTopo();
}

// ──────────────────────────────────────────────────────────────────
// autoOrderTopo — full reset + recompute (called by Auto-Order btn)
// ──────────────────────────────────────────────────────────────────
window.autoOrderTopo = function() {
  nodePositions = {};
  rackPositions = {};
  roomPositions = {};
  rackSizes     = {};
  roomSizes     = {};

  const layoutResult = window.TOPO_LAYOUT_MODE === 'tree' ? _computeTreeLayout() : _computeLayout();
  const { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos } = layoutResult;

  Object.assign(roomPositions,  newRoomPos);
  Object.assign(roomSizes,      newRoomSize);
  Object.assign(rackPositions,  newRackPos);
  Object.assign(rackSizes,      newRackSize);
  Object.assign(nodePositions,  newNodePos);

  saveTopo();
  notify(window.TOPO_LAYOUT_MODE === 'tree' ? 'Topología organizada en Árbol Jerárquico' : 'Topología organizada por Racks', 'success', 2000);
};

window.applyTopoLayoutMode = function(mode) {
  window.TOPO_LAYOUT_MODE = mode;
  window.autoOrderTopo();
  if (typeof drawTopo === 'function') drawTopo();
};

function _applyLayoutResult(res) {
  if (!res) return;
  const { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos } = res;
  if (newRoomPos)  Object.keys(newRoomPos).forEach(id  => { roomPositions[id]  = newRoomPos[id];  });
  if (newRoomSize) Object.keys(newRoomSize).forEach(id => { roomSizes[id]      = newRoomSize[id]; });
  if (newRackPos)  Object.keys(newRackPos).forEach(id  => { rackPositions[id]  = newRackPos[id];  });
  if (newRackSize) Object.keys(newRackSize).forEach(id => { rackSizes[id]      = newRackSize[id]; });
  if (newNodePos)  Object.keys(newNodePos).forEach(id  => { nodePositions[id]  = newNodePos[id];  });
}

// ──────────────────────────────────────────────────────────────────
// recalcTopoSpacing — live vertical slider update
// ──────────────────────────────────────────────────────────────────
window.recalcTopoSpacing = function(newSpacing) {
  window.TOPO_SPACING = newSpacing;
  const res = window.TOPO_LAYOUT_MODE === 'tree' ? _computeTreeLayout() : _computeLayout();
  _applyLayoutResult(res);
  saveTopo();
  if (typeof drawTopo === 'function') drawTopo();
};

// ──────────────────────────────────────────────────────────────────
// recalcTopoSpacingX — live horizontal slider update
// ──────────────────────────────────────────────────────────────────
window.recalcTopoSpacingX = function(newSpacingX) {
  window.TOPO_SPACING_X = newSpacingX;
  const res = window.TOPO_LAYOUT_MODE === 'tree' ? _computeTreeLayout() : _computeLayout();
  _applyLayoutResult(res);
  saveTopo();
  if (typeof drawTopo === 'function') drawTopo();
};

// ──────────────────────────────────────────────────────────────────
// resizeCanvas
// ──────────────────────────────────────────────────────────────────
function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

if (typeof window !== 'undefined') {
  window._findAffinityRackForFloorDevice = _findAffinityRackForFloorDevice;
  window._computeLayout = _computeLayout;
  window._computeTreeLayout = _computeTreeLayout;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _findAffinityRackForFloorDevice,
    _computeLayout,
    _computeTreeLayout
  };
}
