let editingRoomId = null;

function openAddRoomModal() {
  if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
    notify('Espectadores no pueden crear salas.', 'error', 3000);
    return;
  }
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingRoomId = null;
  const titleEl = document.getElementById('modal-room-title');
  const subEl   = document.getElementById('modal-room-sub');
  const saveBtn = document.getElementById('modal-room-save');
  const inputEl = document.getElementById('room-name');
  
  if (titleEl) titleEl.textContent = 'Nueva Sala';
  if (subEl)   subEl.textContent   = 'Agregar una sala al centro de datos';
  if (saveBtn) saveBtn.textContent = 'Crear Sala';
  if (inputEl) {
    inputEl.value = '';
    setTimeout(() => inputEl.focus(), 100);
  }
  const modal = document.getElementById('modal-room');
  if (modal) modal.classList.remove('hidden');
}

function openEditRoomModal(id) {
  if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
    notify('Espectadores no pueden editar salas.', 'error', 3000);
    return;
  }
  const room = store._raw.rooms.find(r => r.id === id);
  if (!room) return;
  
  editingRoomId = id;
  const titleEl = document.getElementById('modal-room-title');
  const subEl   = document.getElementById('modal-room-sub');
  const saveBtn = document.getElementById('modal-room-save');
  const inputEl = document.getElementById('room-name');
  
  if (titleEl) titleEl.textContent = 'Editar Sala';
  if (subEl)   subEl.textContent   = 'Renombrar o actualizar la sala seleccionada';
  if (saveBtn) saveBtn.textContent = 'Guardar Cambios';
  if (inputEl) {
    inputEl.value = room.name;
    setTimeout(() => inputEl.focus(), 100);
  }
  const modal = document.getElementById('modal-room');
  if (modal) modal.classList.remove('hidden');
}

async function deleteRoom(id) {
  if (typeof RackAuth !== 'undefined' && !RackAuth.can('editDevices')) {
    notify('Espectadores no pueden eliminar salas.', 'error', 3000);
    return;
  }
  if (store._raw.rooms.length <= 1) { 
    notify('No puedes eliminar la única sala', 'warn'); 
    return; 
  }
  const ok = await customConfirm('Eliminar Sala', '¿Eliminar esta sala y todos sus gabinetes?');
  if (!ok) return;
  
  if (store.deleteRoom(id)) {
    notify('Sala eliminada', 'warn');
  }
}

function initRoomModal() {
  const btnAddRoom = document.getElementById('btn-add-room');
  if (btnAddRoom) {
    btnAddRoom.addEventListener('click', () => openAddRoomModal());
  }
  
  const btnRoomSave = document.getElementById('modal-room-save');
  if (btnRoomSave) {
    btnRoomSave.addEventListener('click', () => {
      const inputEl = document.getElementById('room-name');
      const name = inputEl ? inputEl.value.trim() : '';
      if (!name) { 
        notify('Ingresa un nombre para la sala', 'error'); 
        return; 
      }
      
      if (editingRoomId) {
        store.updateRoom(editingRoomId, { name });
        notify(`Sala actualizada a "${name}"`, 'success');
      } else {
        store.addRoom(name);
        notify(`Sala "${name}" creada`, 'success');
      }
      
      const modal = document.getElementById('modal-room');
      if (modal) modal.classList.add('hidden');
      editingRoomId = null;
    });
  }
  
  const btnRoomCancel = document.getElementById('modal-room-cancel');
  if (btnRoomCancel) {
    btnRoomCancel.addEventListener('click', () => {
      const modal = document.getElementById('modal-room');
      if (modal) modal.classList.add('hidden');
      editingRoomId = null;
    });
  }

  // Guardar con Enter en el input
  const inputEl = document.getElementById('room-name');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (btnRoomSave) btnRoomSave.click();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.openAddRoomModal = openAddRoomModal;
  window.openEditRoomModal = openEditRoomModal;
  window.deleteRoom = deleteRoom;
}
