function openAddDeviceModal() {
  if (window.closeMobileSidebar) window.closeMobileSidebar();
  editingDeviceId = null;
  editingCatalogId = null;
  document.getElementById('modal-device-title').textContent = 'Nuevo Equipo';
  document.getElementById('modal-device-sub').textContent = 'Registrar un nuevo dispositivo en el inventario';
  ['dev-name','dev-brand','dev-model','dev-ip','dev-mac','dev-serial','dev-user','dev-pass','dev-notes'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('dev-power').value = '200';
  document.getElementById('dev-plugs').value = '1';
  document.getElementById('dev-plugs-out').value = '0';
  document.getElementById('dev-category').value = 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  document.getElementById('dev-type').value = 'server';

  document.getElementById('dev-has-net').checked = false;
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = false;
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = true;
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

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
  
  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));
  
  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
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

  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

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
  
  document.getElementById('dev-category').value = isFloor ? 'floor' : 'rack';
  document.getElementById('dev-category').dispatchEvent(new Event('change'));

  document.getElementById('dev-type').value  = dev.type;
  document.getElementById('dev-size').value  = dev.size || 0;
  document.getElementById('dev-size').closest('.form-row').style.display = isFloor ? 'none' : '';
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

  document.getElementById('dev-has-net').checked = !!(dev.ip || dev.mac);
  document.getElementById('dev-has-net').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-auth').checked = !!(dev.user || dev.pass);
  document.getElementById('dev-has-auth').dispatchEvent(new Event('change'));
  document.getElementById('dev-has-power').checked = !!(dev.power > 0 || dev.plugs > 0 || dev.plugsOut > 0);
  document.getElementById('dev-has-power').dispatchEvent(new Event('change'));

  document.getElementById('modal-device').classList.remove('hidden');
}

function initDeviceModal() {
  document.getElementById('dev-type').addEventListener('change', function() {
    const isFloor = FLOOR_TYPES.has(this.value);
    const sizeRow = document.getElementById('dev-size').closest('.form-row');
    if (sizeRow) {
      sizeRow.style.display = isFloor ? 'none' : '';
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

  const toggleModule = (cbId, inputIds) => {
    const cb = document.getElementById(cbId);
    if (!cb) return;
    cb.addEventListener('change', () => {
      inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.disabled = !cb.checked;
          if (!cb.checked && el.tagName === 'INPUT' && el.type !== 'number') el.value = '';
        }
      });
    });
  };
  toggleModule('dev-has-net', ['dev-ip', 'dev-mac']);
  toggleModule('dev-has-auth', ['dev-user', 'dev-pass']);
  toggleModule('dev-has-power', ['dev-plugs', 'dev-plugs-out', 'dev-power']);

  document.getElementById('modal-device-save').addEventListener('click', () => {
    const name = document.getElementById('dev-name').value.trim();
    const ip   = document.getElementById('dev-ip').value.trim();
    const mac  = document.getElementById('dev-mac').value.trim();
    if (!name) { notify('Ingresa un nombre', 'error'); return; }
    if (ip && !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) { notify('IP inválida (0-255)', 'error'); return; }
    if (mac && !/^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(mac)) { notify('MAC inválida', 'error'); return; }

    const props = {
      name, type: document.getElementById('dev-type').value,
      size: parseInt(document.getElementById('dev-size').value),
      ip, mac,
      serial: document.getElementById('dev-serial').value.trim(),
      brand: document.getElementById('dev-brand').value.trim(),
      model: document.getElementById('dev-model').value.trim(),
      power:  parseInt(document.getElementById('dev-power').value) || 0,
      plugs:  parseInt(document.getElementById('dev-plugs').value) || 0,
      plugsOut: parseInt(document.getElementById('dev-plugs-out').value) || 0,
      user:   document.getElementById('dev-user').value.trim(),
      pass:   document.getElementById('dev-pass').value,
      notes:  document.getElementById('dev-notes').value.trim()
    };

    if (editingCatalogId) {
      const item = CATALOG.find(c => c.id === editingCatalogId);
      if (item) {
        Object.assign(item, props);
        item.power = parseInt(props.power) || 0;
        item.plugs = parseInt(props.plugs) || 0;
        item.plugsOut = parseInt(props.plugsOut) || 0;
        item.size = FLOOR_TYPES.has(props.type) ? 0 : (parseInt(props.size) || 1);
        item.icon = FLOOR_TYPES.has(props.type)
          ? { pc:'💻', camera:'📷', ap:'📶', door:'🚪', printer:'🖨️', phone:'📞' }[props.type]
          : { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' }[props.type];
        item.color = TYPE_COLORS[item.type] || '#8b9ab8';
        renderCatalog();
        notify('Plantilla de catálogo actualizada', 'success');
      }
    } else if (editingDeviceId) {
      store.updateDevice(editingDeviceId, props);
      notify('Equipo actualizado', 'success');
    } else {
      if (FLOOR_TYPES.has(props.type)) {
        store.addFloorDevice(props, store._raw.currentRoomId);
        notify('Equipo de piso agregado con éxito', 'success');
      } else {
        const rack = store.currentRacks[0];
        if (!rack) { notify('Primero crea un gabinete en esta sala', 'error'); return; }
        
        const newItem = {
          id: uid(),
          ...props,
          icon: { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' }[props.type] || '🖥',
          color: TYPE_COLORS[props.type] || '#8b9ab8'
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
