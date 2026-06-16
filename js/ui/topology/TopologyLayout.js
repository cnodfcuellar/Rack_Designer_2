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
    const roomH = maxRackH + 140;

    if (!roomPositions[room.id]) {
      roomPositions[room.id] = { x: currentRoomX, y: margin };
    }
    if (!roomSizes[room.id]) {
      roomSizes[room.id] = { w: roomW, h: roomH };
    }

    const floorDevices = store.allFloorDevicesInRoom(room.id);
    floorDevices.forEach((dev, fi) => {
      if (!nodePositions[dev.id]) {
        nodePositions[dev.id] = {
          x: roomPositions[room.id].x + 50 + (fi % 4) * 60,
          y: roomPositions[room.id].y + roomSizes[room.id].h - 50
        };
      }
    });

    currentRoomX += roomSizes[room.id].w + 80;
  });
  saveTopo();
}

function resizeCanvas() {
  if(!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
