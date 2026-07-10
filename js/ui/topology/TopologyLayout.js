// ──────────────────────────────────────────────────────────────────
// Topology Layout Engine
// Card size (must match TopologyRenderer.js): 150 × 50 px
// Circle radius: 22 px  (bounding box ~44×44)
// ──────────────────────────────────────────────────────────────────

const CARD_W      = 160;  // card width  + 10px buffer
const CARD_H      = 60;   // card height + 10px buffer
const CIRCLE_D    = 54;   // circle diameter + halo buffer

// Layout constants
const ROOM_MARGIN   = 80;   // space around the whole diagram
const ROOM_PAD_X    = 24;   // padding inside room (left/right)
const ROOM_PAD_TOP  = 60;   // room header height
const ROOM_PAD_BOT  = 28;   // room footer padding
const RACK_GAP      = 32;   // horizontal gap between racks
const ROOM_GAP      = 60;   // horizontal gap between rooms
const RACK_HEADER_H = 40;   // space for rack label at top

function _nodeW() { return window.TOPOLOGY_STYLE === 'circle' ? CIRCLE_D : CARD_W; }
function _nodeH() { return window.TOPOLOGY_STYLE === 'circle' ? CIRCLE_D : CARD_H; }

// ──────────────────────────────────────────────────────────────────
// Shared layout computation (returns rooms/racks/nodes/positions)
// Does NOT mutate global state — call _applyLayout() to commit.
// ──────────────────────────────────────────────────────────────────
function _computeLayout() {
  const nW = _nodeW();
  const nH = _nodeH();
  const spacing = Math.max(nH + 10, window.TOPO_SPACING || 70);

  const newRoomPos  = {};
  const newRoomSize = {};
  const newRackPos  = {};
  const newRackSize = {};
  const newNodePos  = {};

  let curRoomX = ROOM_MARGIN;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    const floorDevs = store.allFloorDevicesInRoom(room.id)
                           .filter(d => !['organizer','tray'].includes(d.type));

    // ── 1. Size each rack ──────────────────────────────────────────
    const rackLayouts = racks.map(rack => {
      const devs = store.allDevicesInRack(rack.id)
                        .filter(d => !['organizer','tray'].includes(d.type));
      const rw = Math.max(nW + 40, CARD_W + 40);  // rack at least as wide as a card
      const rh = RACK_HEADER_H + devs.length * spacing + (devs.length > 0 ? 16 : 0);
      return { rack, devs, rw: Math.max(rw, 200), rh: Math.max(rh, 140) };
    });

    // ── 2. Rack row total width ────────────────────────────────────
    const racksRowW = rackLayouts.reduce((sum, l) => sum + l.rw, 0)
                    + Math.max(0, (rackLayouts.length - 1)) * RACK_GAP;

    // ── 3. Floor-device grid (4 columns max) ───────────────────────
    const FLOOR_COLS  = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(floorDevs.length))));
    const floorGridW  = floorDevs.length > 0 ? FLOOR_COLS * (nW + 20) - 20 : 0;
    const floorRows   = floorDevs.length > 0 ? Math.ceil(floorDevs.length / FLOOR_COLS) : 0;
    const floorGridH  = floorRows * (nH + 20);

    // ── 4. Room dimensions ────────────────────────────────────────
    const innerW   = Math.max(racksRowW, floorGridW);
    const maxRackH = rackLayouts.reduce((m, l) => Math.max(m, l.rh), 0);
    const roomW    = innerW + 2 * ROOM_PAD_X;
    const roomH    = ROOM_PAD_TOP + maxRackH
                   + (floorDevs.length > 0 ? 24 + floorGridH : 0)
                   + ROOM_PAD_BOT;

    newRoomPos[room.id]  = { x: curRoomX, y: ROOM_MARGIN };
    newRoomSize[room.id] = { w: Math.max(roomW, 280), h: Math.max(roomH, 220) };

    // ── 5. Position racks inside room ─────────────────────────────
    let curRackX = curRoomX + ROOM_PAD_X;
    const rackTopY = ROOM_MARGIN + ROOM_PAD_TOP;

    rackLayouts.forEach(({ rack, devs, rw, rh }) => {
      newRackPos[rack.id]  = { x: curRackX, y: rackTopY };
      newRackSize[rack.id] = { w: rw, h: rh };

      const nodeX = curRackX + rw / 2;
      devs.forEach((dev, di) => {
        newNodePos[dev.id] = {
          x: nodeX,
          y: rackTopY + RACK_HEADER_H + di * spacing + nH / 2
        };
      });

      curRackX += rw + RACK_GAP;
    });

    // ── 6. Position floor devices in grid below racks ─────────────
    const floorStartY = ROOM_MARGIN + ROOM_PAD_TOP + maxRackH + 24;
    floorDevs.forEach((dev, fi) => {
      const col = fi % FLOOR_COLS;
      const row = Math.floor(fi / FLOOR_COLS);
      newNodePos[dev.id] = {
        x: curRoomX + ROOM_PAD_X + col * (nW + 20) + nW / 2,
        y: floorStartY + row * (nH + 20) + nH / 2
      };
    });

    curRoomX += newRoomSize[room.id].w + ROOM_GAP;
  });

  return { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos };
}

// ──────────────────────────────────────────────────────────────────
// initTopoPositions — called on first load; only fills missing slots
// ──────────────────────────────────────────────────────────────────
function initTopoPositions() {
  loadTopoState();
  const { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos } = _computeLayout();

  // Only assign positions that do not already exist (preserve manual moves)
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

  const { newRoomPos, newRoomSize, newRackPos, newRackSize, newNodePos } = _computeLayout();
  Object.assign(roomPositions,  newRoomPos);
  Object.assign(roomSizes,      newRoomSize);
  Object.assign(rackPositions,  newRackPos);
  Object.assign(rackSizes,      newRackSize);
  Object.assign(nodePositions,  newNodePos);

  saveTopo();
  notify('🗂 Topología reordenada automáticamente', 'success', 2000);
};

// ──────────────────────────────────────────────────────────────────
// recalcTopoSpacing — live slider update
// ──────────────────────────────────────────────────────────────────
window.recalcTopoSpacing = function(newSpacing) {
  window.TOPO_SPACING = newSpacing;
  const nH = _nodeH();
  const spacing = Math.max(nH + 10, newSpacing);

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let maxRackH = 0;

    racks.forEach(rack => {
      const devs = store.allDevicesInRack(rack.id)
                        .filter(d => !['organizer','tray'].includes(d.type));
      const rh = RACK_HEADER_H + devs.length * spacing + (devs.length > 0 ? 16 : 0);
      if (rackSizes[rack.id]) rackSizes[rack.id].h = Math.max(rh, 140);

      devs.forEach((dev, di) => {
        if (nodePositions[dev.id] && rackPositions[rack.id]) {
          nodePositions[dev.id].y = rackPositions[rack.id].y + RACK_HEADER_H + di * spacing + _nodeH() / 2;
        }
      });

      if (Math.max(rh, 140) > maxRackH) maxRackH = Math.max(rh, 140);
    });

    if (roomSizes[room.id]) {
      const floorDevs = store.allFloorDevicesInRoom(room.id)
                             .filter(d => !['organizer','tray'].includes(d.type));
      const FLOOR_COLS = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(floorDevs.length))));
      const floorRows  = Math.ceil(floorDevs.length / FLOOR_COLS);
      const floorGridH = floorDevs.length > 0 ? floorRows * (_nodeH() + 20) : 0;
      roomSizes[room.id].h = ROOM_PAD_TOP + maxRackH
                           + (floorDevs.length > 0 ? 24 + floorGridH : 0)
                           + ROOM_PAD_BOT;

      const floorStartY = roomPositions[room.id].y + ROOM_PAD_TOP + maxRackH + 24;
      floorDevs.forEach((dev, fi) => {
        if (nodePositions[dev.id] && roomPositions[room.id]) {
          nodePositions[dev.id].y = floorStartY + Math.floor(fi / FLOOR_COLS) * (_nodeH() + 20) + _nodeH() / 2;
        }
      });
    }
  });

  saveTopo();
};

// ──────────────────────────────────────────────────────────────────
// resizeCanvas
// ──────────────────────────────────────────────────────────────────
function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
