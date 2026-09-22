function openAddDeviceModal() {
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingDeviceId = null;
  editingCatalogId = null;
  document.getElementById('modal-device-title').textContent = 'Nuevo Equipo';
  document.getElementById('modal-device-sub').textContent = 'Registrar un nuevo dispositivo en el inventario';
  ['dev-name','dev-brand','dev-model','dev-ip','dev-mac','dev-serial','dev-user','dev-pass','dev-notes','dev-skin'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const devStatus = document.getElementById('dev-status');
  if (devStatus) devStatus.value = 'active';
  document.getElementById('dev-has-brand').checked = false;
  document.getElementById('dev-has-loc').checked = true;
  document.getElementById('dev-has-net').checked = false;
  document.getElementById('dev-has-auth').checked = false;
  document.getElementById('dev-has-power').checked = false;
  document.getElementById('dev-has-notes').checked = false;
  document.getElementById('dev-has-ports').checked = false;
  document.getElementById('dev-ports-eth').value = '';
  document.getElementById('dev-ports-fib').value = '';

  document.getElementById('dev-power').value = '200';
  document.getElementById('dev-plugs').value = '1';
  document.getElementById('dev-plugs-out').value = '0';
  document.getElementById('dev-category').value = 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  document.getElementById('dev-type').value = 'server';
  document.getElementById('dev-side').value = 'front';

  document.getElementById('dev-has-brand').checked = false;
  document.getElementById('dev-has-loc').checked = true;
  document.getElementById('dev-has-net').checked = false;
  document.getElementById('dev-has-auth').checked = false;
  document.getElementById('dev-has-power').checked = false;
  document.getElementById('dev-has-notes').checked = false;
  document.getElementById('dev-has-skin').checked = false;

  document.getElementById('modal-device').classList.remove('hidden');
}

function openEditCatalogModal(id) {
  editingCatalogId = id;
  editingDeviceId = null;
  const dev = CATALOG.find(c => c.id === id);
  if (!dev) return;
  const isFloor = FLOOR_TYPES.has(dev.type);
  document.getElementById('modal-device-title').textContent = 'Editar Plantilla';
  document.getElementById('modal-device-sub').textContent = isFloor ? 'Equipo de piso — se coloca directamente en la sala' : `Catálogo ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  
  const devStatus = document.getElementById('dev-status');
  if (devStatus) devStatus.value = dev.status || 'active';

  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-side').value  = dev.mountSide || 'front';
  document.getElementById('dev-side-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-brand').value = dev.brand || '';
  document.getElementById('dev-model').value = dev.model || '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-plugs-out').value = dev.plugsOut || 0;
  document.getElementById('dev-user').value  = dev.user || '';
  const passInput = document.getElementById('dev-pass');
  passInput.value = dev.pass || '';
  passInput.type = window.SHOW_PASSWORDS ? 'text' : 'password';
  document.getElementById('dev-notes').value = dev.notes|| '';
  document.getElementById('dev-skin').value = dev.skin || '';

  if (dev.ports) {
    document.getElementById('dev-ports-eth').value = dev.ports.ethernet || '';
    document.getElementById('dev-ports-fib').value = dev.ports.fiber || '';
  } else {
    document.getElementById('dev-ports-eth').value = '';
    document.getElementById('dev-ports-fib').value = '';
  }

  document.getElementById('dev-has-brand').checked = !!(dev.brand || dev.model || dev.serial);
  document.getElementById('dev-has-ports').checked = !!(dev.ports);
  document.getElementById('dev-has-loc').checked = true;
  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-notes').checked = !!(dev.notes);
  document.getElementById('dev-has-skin').checked = !!(dev.skin);

  document.getElementById('modal-device').classList.remove('hidden');
}

function openEditDeviceModal(id) {
  editingCatalogId = null;
  editingDeviceId = id;
  const dev = store.deviceById(id);
  if (!dev) return;
  const isFloor = dev.category === 'floor' || FLOOR_TYPES.has(dev.type);
  document.getElementById('modal-device-title').textContent = 'Editar Equipo';
  document.getElementById('modal-device-sub').textContent = isFloor ? 'Equipo de piso — se coloca directamente en la sala' : `ID: ${id}`;
  document.getElementById('dev-name').value  = dev.name;
  
  const devStatus = document.getElementById('dev-status');
  if (devStatus) devStatus.value = dev.status || 'active';

  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));

  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size || 0;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-side').value  = dev.mountSide || 'front';
  document.getElementById('dev-side-row').style.display = isFloor ? 'none' : '';
  document.getElementById('dev-brand').value = dev.brand || '';
  document.getElementById('dev-model').value = dev.model || '';
  document.getElementById('dev-ip').value    = dev.ip   || '';
  document.getElementById('dev-mac').value   = dev.mac  || '';
  document.getElementById('dev-serial').value= dev.serial|| '';
  document.getElementById('dev-power').value = dev.power || 0;
  document.getElementById('dev-plugs').value = dev.plugs || 1;
  document.getElementById('dev-plugs-out').value = dev.plugsOut || 0;
  document.getElementById('dev-user').value  = dev.user || 'admin';
  const passInput = document.getElementById('dev-pass');
  passInput.value = dev.pass || '';
  passInput.type = window.SHOW_PASSWORDS ? 'text' : 'password';
  document.getElementById('dev-notes').value = dev.notes|| '';
  document.getElementById('dev-skin').value = dev.skin || '';

  if (dev.ports) {
    document.getElementById('dev-ports-eth').value = dev.ports.ethernet || '';
    document.getElementById('dev-ports-fib').value = dev.ports.fiber || '';
  } else {
    document.getElementById('dev-ports-eth').value = '';
    document.getElementById('dev-ports-fib').value = '';
  }

  document.getElementById('dev-has-brand').checked = !!(dev.brand || dev.model || dev.serial);
  document.getElementById('dev-has-ports').checked = !!(dev.ports);
  document.getElementById('dev-has-loc').checked = true;
  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-notes').checked = !!(dev.notes);
  document.getElementById('dev-has-skin').checked = !!(dev.skin);

  document.getElementById('modal-device').classList.remove('hidden');
}

function initDeviceModal() {
  document.getElementById('dev-type').addEventListener('change', function() {
    const isFloor = FLOOR_TYPES.has(this.value);
    const sizeRow = document.getElementById('dev-size').closest('.form-row');
    if (sizeRow) {
      sizeRow.style.display = isFloor ? 'none' : '';
    }
    const sideRow = document.getElementById('dev-side-row');
    if (sideRow) {
      sideRow.style.display = isFloor ? 'none' : '';
    }
    document.getElementById('modal-device-sub').textContent = isFloor
      ? 'Equipo de piso — se coloca directamente en la sala'
      : 'Datos técnicos del equipo en rack';
  });

  document.getElementById('dev-category').addEventListener('change', function() {
    const isFloor = this.value === 'floor';
    document.getElementById('opt-rack').style.display = isFloor ? 'none' : '';
    document.getElementById('opt-floor').style.display = isFloor ? '' : 'none';
    document.getElementById('dev-type').value = isFloor ? 'pc' : 'server';
    document.getElementById('dev-type').dispatchEvent(new Event('change'));
  });

  document.getElementById('modal-device-save').addEventListener('click', () => {
    const name = document.getElementById('dev-name').value.trim();
    const hasNet = document.getElementById('dev-has-net').checked;
    const ip   = hasNet ? document.getElementById('dev-ip').value.trim() : '';
    const mac  = hasNet ? document.getElementById('dev-mac').value.trim() : '';
    
    if (!name) { notify('Ingresa un nombre', 'error'); return; }
    if (ip && !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) { notify('IP inválida (0-255)', 'error'); return; }
    if (mac && !/^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(mac)) { notify('MAC inválida', 'error'); return; }

    const hasBrand = document.getElementById('dev-has-brand').checked;
    const hasAuth = document.getElementById('dev-has-auth').checked;
    const hasPower = document.getElementById('dev-has-power').checked;
    const hasNotes = document.getElementById('dev-has-notes').checked;
    const hasSkin = document.getElementById('dev-has-skin').checked;
    const hasPorts = document.getElementById('dev-has-ports').checked;
    
    const devStatus = document.getElementById('dev-status');

    let ports = null;
    if (hasPorts) {
      ports = {
        ethernet: parseInt(document.getElementById('dev-ports-eth').value) || 0,
        fiber: parseInt(document.getElementById('dev-ports-fib').value) || 0
      };
      if (ports.ethernet === 0 && ports.fiber === 0) ports = null;
    }

    const props = {
      name, 
      type: document.getElementById('dev-type').value,
      status: devStatus ? devStatus.value : 'active',
      size: parseInt(document.getElementById('dev-size').value),
      mountSide: document.getElementById('dev-side').value || 'front',
      ip, mac,
      serial: hasBrand ? document.getElementById('dev-serial').value.trim() : '',
      brand: hasBrand ? document.getElementById('dev-brand').value.trim() : '',
      model: hasBrand ? document.getElementById('dev-model').value.trim() : '',
      power: hasPower ? (parseInt(document.getElementById('dev-power').value) || 0) : 0,
      plugs: hasPower ? (parseInt(document.getElementById('dev-plugs').value) || 0) : 0,
      plugsOut: hasPower ? (parseInt(document.getElementById('dev-plugs-out').value) || 0) : 0,
      user: hasAuth ? document.getElementById('dev-user').value.trim() : '',
      pass: hasAuth ? document.getElementById('dev-pass').value : '',
      notes: hasNotes ? document.getElementById('dev-notes').value.trim() : '',
      skin: hasSkin ? document.getElementById('dev-skin').value.trim() : ''
    };
    if (ports) props.ports = ports;

    if (editingCatalogId) {
      if (typeof updateCatalogItem === 'function') {
        props.power = parseInt(props.power) || 0;
        props.plugs = parseInt(props.plugs) || 0;
        props.plugsOut = parseInt(props.plugsOut) || 0;
        props.size = FLOOR_TYPES.has(props.type) ? 0 : (parseInt(props.size) || 1);
        props.color = (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[props.type]) || '#38bdf8';
        updateCatalogItem(editingCatalogId, props);
        notify('Plantilla de catálogo actualizada', 'success');
      }
    } else if (editingDeviceId) {
      const currentDev = store.deviceById(editingDeviceId);
      if (currentDev && currentDev.rackId && typeof canPlace === 'function') {
        const targetSide = props.mountSide || currentDev.mountSide || 'front';
        const targetSize = props.size || currentDev.size || 1;
        if (!canPlace(currentDev.rackId, currentDev.slotStart, targetSize, targetSide, editingDeviceId)) {
          notify('Conflicto de espacio en el rack para el tamaño o lado seleccionado', 'error');
          return;
        }
      }
      store.updateDevice(editingDeviceId, props);
      notify('Equipo actualizado', 'success');
    } else {
      if (FLOOR_TYPES.has(props.type)) {
        store.addFloorDevice(props, store._raw.currentRoomId);
        notify('Equipo de piso agregado con éxito', 'success');
      } else {
        const rack = store.currentRacks[0];
        if (!rack) { notify('Primero crea un gabinete en esta sala', 'error'); return; }
        
        const typeIconMap = {
          server: 'assets/icons/server/server.svg',
          switch: 'assets/icons/network/switch.svg',
          router: 'assets/icons/network/router.svg',
          firewall: 'assets/icons/network/firewall.svg',
          storage: 'assets/icons/storage/san.svg',
          nvr: 'assets/icons/security/nvr.svg',
          dvr: 'assets/icons/security/dvr.svg',
          decoder: 'assets/icons/security/decoder.svg',
          ups: 'assets/icons/power/ups.svg',
          pdu: 'assets/icons/power/pdu.svg',
          energia: 'assets/icons/power/ups.svg',
          patchpanel: 'assets/icons/wiring/patchpanel.svg',
          odf: 'assets/icons/wiring/patchpanel.svg',
          organizer: 'assets/icons/wiring/organizer.svg',
          tray: 'assets/icons/accessories/tray.svg',
          blind: 'assets/icons/accessories/tray.svg',
          kvm: 'assets/icons/accessories/kvm.svg',
          pc: 'assets/icons/floor/pc.svg',
          camera: 'assets/icons/floor/camera.svg',
          ap: 'assets/icons/network/ap.svg',
          door: 'assets/icons/floor/door.svg',
          printer: 'assets/icons/floor/printer.svg',
          phone: 'assets/icons/floor/phone.svg'
        };

        const newItem = {
          id: uid(),
          ...props,
          isCustom: true,
          icon: typeIconMap[props.type] || 'assets/icons/server/server.svg',
          color: (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[props.type]) || '#38bdf8'
        };
        if (typeof addCatalogItem === 'function') addCatalogItem(newItem);
        
        document.getElementById('modal-device').classList.add('hidden');
        openQuickPlacementModal(newItem.id);
        return;
      }
    }
    document.getElementById('modal-device').classList.add('hidden');
  });

  document.getElementById('modal-device-cancel').addEventListener('click', () => {
    document.getElementById('modal-device').classList.add('hidden');
  });
}
