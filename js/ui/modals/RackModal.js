function openAddRackModal() {
  if (!RackAuth.can('editDevices')) {
    notify('🚫 Espectadores no pueden crear gabinetes.', 'error', 3000);
    return;
  }
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingRackId = null;
  document.getElementById('modal-rack-title').textContent = 'Nuevo Gabinete';
  document.getElementById('rack-name').value = '';
  document.getElementById('rack-height').value = '24';
  document.getElementById('rack-color').value = '#0ea5e9';
  document.getElementById('rack-color-picker').value = '#0ea5e9';
  document.getElementById('modal-rack').classList.remove('hidden');
}

function openEditRackModal(id) {
  if (!RackAuth.can('editDevices')) {
    notify('🚫 Espectadores no pueden editar gabinetes.', 'error', 3000);
    return;
  }
  editingRackId = id;
  const rack = store.rackById(id);
  if (!rack) return;
  document.getElementById('modal-rack-title').textContent = 'Editar Gabinete';
  document.getElementById('rack-name').value   = rack.name;
  document.getElementById('rack-height').value = rack.height;
  document.getElementById('rack-color').value  = rack.color;
  document.getElementById('rack-color-picker').value = rack.color;
  document.getElementById('modal-rack').classList.remove('hidden');
}

function initRackModal() {
  document.getElementById('modal-rack-save').addEventListener('click', () => {
    const name   = document.getElementById('rack-name').value.trim();
    const height = parseInt(document.getElementById('rack-height').value);
    const color  = document.getElementById('rack-color').value;
    if (!name) { notify('Ingresa un nombre para el gabinete', 'error'); return; }
    
    if (editingRackId) {
      const devices = store.allDevicesInRack(editingRackId);
      const overflowingDevices = devices.filter(d => d.slotStart + d.size - 1 > height);

      if (overflowingDevices.length > 0) {
        const confirmMsg = `Al reducir a ${height}U, se perderán ${overflowingDevices.length} equipo(s) y sus conexiones porque quedan fuera de límite. ¿Deseas continuar y eliminarlos?`;
        if (!confirm(confirmMsg)) {
          return;
        }
        overflowingDevices.forEach(d => store.deleteDevice(d.id));
      }

      store.updateRack(editingRackId, { name, height, color });
    } else {
      store.addRack({ name, height, color });
    }
    document.getElementById('modal-rack').classList.add('hidden');
    notify(editingRackId ? 'Gabinete actualizado' : 'Gabinete creado', 'success');
    editingRackId = null;
  });

  document.getElementById('modal-rack-cancel').addEventListener('click', () => {
    document.getElementById('modal-rack').classList.add('hidden');
  });

  document.getElementById('rack-color-picker').addEventListener('input', e => {
    document.getElementById('rack-color').value = e.target.value;
  });
  document.getElementById('rack-color').addEventListener('input', e => {
    document.getElementById('rack-color-picker').value = e.target.value;
  });
}
