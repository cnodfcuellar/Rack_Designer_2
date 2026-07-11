async function deleteRoom(id) {
  if (store._raw.rooms.length <= 1) { notify('No puedes eliminar la única sala', 'warn'); return; }
  const ok = await customConfirm('Eliminar Sala', '¿Eliminar esta sala y todos sus gabinetes?');
  if (!ok) return;
  
  if (store.deleteRoom(id)) {
    notify('Sala eliminada', 'warn');
  }
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
