function deleteRoom(id) {
  if (store._raw.rooms.length <= 1) { notify('No puedes eliminar la única sala', 'warn'); return; }
  if (!confirm('¿Eliminar esta sala y todos sus gabinetes?')) return;
  store.snapshot();
  
  const racks = store._raw.racks.filter(r => r.roomId === id);
  const rackIds = racks.map(r => r.id);
  
  const devicesToDelete = store._raw.devices.filter(d => 
    rackIds.includes(d.rackId) || (d.category === 'floor' && d.roomId === id)
  );
  const deviceIdsToDelete = new Set(devicesToDelete.map(d => d.id));
  
  store._raw.connections = store._raw.connections.filter(c => 
    !deviceIdsToDelete.has(c.sourceDeviceId) && !deviceIdsToDelete.has(c.targetDeviceId)
  );
  
  store._raw.devices = store._raw.devices.filter(d => !deviceIdsToDelete.has(d.id));
  store._raw.racks = store._raw.racks.filter(r => r.roomId !== id);
  store._raw.rooms = store._raw.rooms.filter(r => r.id !== id);
  store._raw.currentRoomId = store._raw.rooms[0]?.id;
  
  store._save(); 
  store._emit('change', { source: 'deleteRoom' });
  notify('Sala eliminada', 'warn');
}

function initRoomModal() {
  const btnAddRoom = document.getElementById('btn-add-room');
  if(btnAddRoom) {
    btnAddRoom.addEventListener('click', () => {
      document.getElementById('room-name').value = '';
      document.getElementById('modal-room').classList.remove('hidden');
    });
  }
  
  const btnRoomSave = document.getElementById('modal-room-save');
  if(btnRoomSave) {
    btnRoomSave.addEventListener('click', () => {
      const name = document.getElementById('room-name').value.trim();
      if (!name) { notify('Ingresa un nombre para la sala', 'error'); return; }
      store.addRoom(name);
      document.getElementById('modal-room').classList.add('hidden');
      notify(`Sala "${name}" creada`, 'success');
    });
  }
  
  const btnRoomCancel = document.getElementById('modal-room-cancel');
  if(btnRoomCancel) {
    btnRoomCancel.addEventListener('click', () => {
      document.getElementById('modal-room').classList.add('hidden');
    });
  }
}
