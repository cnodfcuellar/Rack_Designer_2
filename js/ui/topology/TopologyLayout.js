// Helper: estimate text pixel width (approx 8px per char for 14px bold font)
function estTextWidth(str, px) { return (str || '').length * px * 0.62; }

function initTopoPositions() {
  loadTopoState();
  const margin = 80;
  const RACK_PAD_X = 20;   // padding left inside room before first rack
  const RACK_PAD_Y = 70;   // padding top inside room (below room label)
  const RACK_GAP   = 30;   // horizontal gap between racks
  const ROOM_PAD_R = 30;   // extra padding right of last rack
  const MIN_RACK_W = 180;
  let currentRoomX = margin;
  const spacing = window.TOPO_SPACING || 60;

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let currentRackX = currentRoomX + RACK_PAD_X;
    let maxRackH = 100;

    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id).filter(d => !['organizer', 'tray'].includes(d.type));
      const rh = Math.max(200, devices.length * spacing + 80);

      // Rack width: wide enough for its name and longest device name
      const rw = Math.max(MIN_RACK_W,
        estTextWidth(rack.name, 16) + 30,
        ...devices.map(d => estTextWidth(d.name, 14) + 60)
      );

      if (!rackPositions[rack.id]) {
        rackPositions[rack.id] = { x: currentRackX, y: margin + RACK_PAD_Y };
      }
      if (!rackSizes[rack.id]) {
        rackSizes[rack.id] = { w: rw, h: rh };
      }

      devices.forEach((dev, di) => {
        if (!nodePositions[dev.id]) {
          nodePositions[dev.id] = {
            x: rackPositions[rack.id].x + rackSizes[rack.id].w / 2,
            y: rackPositions[rack.id].y + 55 + di * spacing
          };
        }
      });

      currentRackX += rackSizes[rack.id].w + RACK_GAP;
      if (rackSizes[rack.id].h > maxRackH) maxRackH = rackSizes[rack.id].h;
    });

    const roomW = Math.max(300, currentRackX - currentRoomX + ROOM_PAD_R);
    const roomH = maxRackH + RACK_PAD_Y + 70;

    if (!roomPositions[room.id]) {
      roomPositions[room.id] = { x: currentRoomX, y: margin };
    }
    if (!roomSizes[room.id]) {
      roomSizes[room.id] = { w: roomW, h: roomH };
    }

    const floorDevices = store.allFloorDevicesInRoom(room.id).filter(d => !['organizer', 'tray'].includes(d.type));
    floorDevices.forEach((dev, fi) => {
      if (!nodePositions[dev.id]) {
        nodePositions[dev.id] = {
          x: roomPositions[room.id].x + RACK_PAD_X + (fi % 4) * spacing,
          y: roomPositions[room.id].y + roomSizes[room.id].h - 50
        };
      }
    });

    currentRoomX += roomSizes[room.id].w + 60;
  });
  saveTopo();
}

function resizeCanvas() {
  if(!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.autoOrderTopo = function() {
  const margin = 80;
  const RACK_PAD_X = 20;
  const RACK_PAD_Y = 70;
  const RACK_GAP   = 30;
  const ROOM_PAD_R = 30;
  const MIN_RACK_W = 180;
  let currentRoomX = margin;
  const spacing = window.TOPO_SPACING || 60;

  // Reset all positions so everything is recalculated from scratch
  nodePositions = {};
  rackPositions = {};
  roomPositions = {};
  rackSizes = {};
  roomSizes = {};

  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let currentRackX = currentRoomX + RACK_PAD_X;
    let maxRackH = 100;

    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id).filter(d => !['organizer', 'tray'].includes(d.type));
      const rh = Math.max(200, devices.length * spacing + 80);
      const rw = Math.max(MIN_RACK_W,
        estTextWidth(rack.name, 16) + 30,
        ...devices.map(d => estTextWidth(d.name, 14) + 60)
      );

      rackPositions[rack.id] = { x: currentRackX, y: margin + RACK_PAD_Y };
      rackSizes[rack.id] = { w: rw, h: rh };

      devices.forEach((dev, di) => {
        nodePositions[dev.id] = {
          x: rackPositions[rack.id].x + rackSizes[rack.id].w / 2,
          y: rackPositions[rack.id].y + 55 + di * spacing
        };
      });

      currentRackX += rackSizes[rack.id].w + RACK_GAP;
      if (rackSizes[rack.id].h > maxRackH) maxRackH = rackSizes[rack.id].h;
    });

    const roomW = Math.max(300, currentRackX - currentRoomX + ROOM_PAD_R);
    const roomH = maxRackH + RACK_PAD_Y + 70;
    roomPositions[room.id] = { x: currentRoomX, y: margin };
    roomSizes[room.id] = { w: roomW, h: roomH };

    const floorDevices = store.allFloorDevicesInRoom(room.id).filter(d => !['organizer', 'tray'].includes(d.type));
    floorDevices.forEach((dev, fi) => {
      nodePositions[dev.id] = {
        x: roomPositions[room.id].x + RACK_PAD_X + (fi % 4) * spacing,
        y: roomPositions[room.id].y + roomSizes[room.id].h - 50
      };
    });

    currentRoomX += roomSizes[room.id].w + 60;
  });

  saveTopo();
  notify('🗂 Topología reordenada automáticamente', 'success', 2000);
};

window.recalcTopoSpacing = function(newSpacing) {
  window.TOPO_SPACING = newSpacing;
  
  store._raw.rooms.forEach(room => {
    const racks = store._raw.racks.filter(r => r.roomId === room.id);
    let maxRackH = 100;
    
    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id).filter(d => !['organizer', 'tray'].includes(d.type));
      const rh = Math.max(200, devices.length * newSpacing + 80);
      
      if (rackSizes[rack.id]) {
        rackSizes[rack.id].h = rh;
      }
      
      devices.forEach((dev, di) => {
        if (nodePositions[dev.id] && rackPositions[rack.id]) {
          nodePositions[dev.id].y = rackPositions[rack.id].y + 60 + di * newSpacing;
        }
      });
      
      if (rh > maxRackH) maxRackH = rh;
    });
    
    if (roomSizes[room.id]) {
      roomSizes[room.id].h = maxRackH + 140;
    }
    
    const floorDevices = store.allFloorDevicesInRoom(room.id).filter(d => !['organizer', 'tray'].includes(d.type));
    floorDevices.forEach((dev, fi) => {
      if (nodePositions[dev.id] && roomPositions[room.id]) {
        nodePositions[dev.id].y = roomPositions[room.id].y + roomSizes[room.id].h - 50;
        nodePositions[dev.id].x = roomPositions[room.id].x + 50 + (fi % 4) * newSpacing;
      }
    });
  });
  
  saveTopo();
};
