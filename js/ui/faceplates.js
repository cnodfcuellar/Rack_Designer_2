function buildFaceplate(device, heightPx) {
  const h = heightPx;
  const type = device.type;

  const typeMap = {
    'server': 'server', 'switch': 'network', 'router': 'network',
    'firewall': 'network', 'storage': 'storage', 'ups': 'power',
    'patchpanel': 'wiring', 'pdu': 'power', 'kvm': 'accessories',
    'tray': 'accessories', 'organizer': 'wiring', 'pc': 'floor',
    'ap': 'network', 'camera': 'floor', 'printer': 'floor',
    'phone': 'floor', 'door': 'floor', 'san': 'storage', 'nas': 'storage'
  };
  const category = typeMap[type] || 'accessories';

  let cssFaceplate = '';

  if (type === 'server') {
    const brand = device.name.toLowerCase().includes('hp') ? 'PROLIANT' :
                  device.name.toLowerCase().includes('dell') ? 'DELL POWEREDGE' :
                  device.name.toUpperCase().slice(0, 12);
    cssFaceplate = `<div class="fp-server" style="height:${h}px">
      <div class="ear"></div>
      <div class="vent"></div>
      <div class="fp-mid">
        <div class="dev-name">${escapeHTML(device.name)}</div>
        <div class="lcd">${escapeHTML(brand)} · ${escapeHTML(device.ip) || 'NO IP'}</div>
      </div>
      <div class="fp-right">
        <div class="power-btn"></div>
      </div>
      <div class="ear-r"></div>
    </div>`;
  }
  else if (type === 'switch') {
    const ports = Array.from({length: 24}, (_,i) => {
      const connected = store._raw.connections.some(c =>
        (c.sourceDeviceId === device.id || c.targetDeviceId === device.id));
      const cls = connected && i < 2 ? 'connected' : (i > 20 ? 'inactive' : '');
      return `<div class="port-rj45 ${cls}" style="--blink-delay:${(i*0.13).toFixed(2)}s"></div>`;
    }).join('');
    const sfpPorts = Array.from({length:2}, (_,i) =>
      `<div class="sfp-port" style="--blink-delay:${(i*0.4).toFixed(2)}s"></div>`).join('');
    cssFaceplate = `<div class="fp-switch" style="height:${h}px">
      <div class="ports-grid">${ports}</div>
      <div class="sw-right">${sfpPorts}</div>
    </div>`;
  }
  else if (type === 'ups') {
    cssFaceplate = `<div class="fp-ups" style="height:${h}px">
      <div class="ups-left">
        <div class="ups-led green"></div>
        <div class="ups-led off"></div>
        <div class="ups-led off"></div>
      </div>
      <div class="ups-lcd">
        <div class="ups-lcd-line">230V IN / 230V OUT</div>
        <div class="ups-lcd-line">BATT: 100% LOAD: 45%</div>
        <div class="ups-lcd-line">RUNTIME: 18MIN</div>
      </div>
      <div class="ups-right">
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
      </div>
    </div>`;
  }
  else if (type === 'router') {
    const sfps = Array.from({length:8}, (_,i) =>
      `<div class="sfp-module" style="--blink-delay:${(i*0.3).toFixed(2)}s"></div>`).join('');
    cssFaceplate = `<div class="fp-router" style="height:${h}px">
      <div class="rtr-brand"><div class="rtr-logo">RT</div></div>
      <div class="sfp-row">${sfps}</div>
      <div class="vent-r"></div>
    </div>`;
  }
  else if (type === 'firewall') {
    cssFaceplate = `<div class="fp-firewall" style="height:${h}px">
      <div class="fw-icon" style="color:#ef4444; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">${typeof SVG_ICONS !== 'undefined' && SVG_ICONS['firewall'] ? SVG_ICONS['firewall'] : ''}</div>
      <div class="fw-mid">
        <div class="fw-name">${escapeHTML(device.name)}</div>
        <div class="fw-status">${escapeHTML(device.ip) || 'NO IP'} │ ACTIVE</div>
      </div>
      <div class="fw-leds">
        <div class="fw-led g"></div>
        <div class="fw-led a"></div>
        <div class="fw-led r"></div>
      </div>
    </div>`;
  }
  else if (type === 'storage') {
    const drives = Array.from({length:10}, (_,i) =>
      `<div class="drive-slot ${i < 8 ? 'active' : ''}" style="--blink-delay:${(i*0.2).toFixed(2)}s"></div>`).join('');
    cssFaceplate = `<div class="fp-storage" style="height:${h}px">
      <div class="st-left">
        <div class="ups-led green"></div>
        <div class="ups-led" style="background:var(--cyan);box-shadow:0 0 4px var(--cyan)"></div>
      </div>
      <div class="st-drives">${drives}</div>
      <div class="st-right">
        <div class="st-port"></div>
        <div class="st-port"></div>
        <div class="st-port"></div>
      </div>
    </div>`;
  }
  else {
    // Default
    cssFaceplate = `<div style="height:${h}px;display:flex;align-items:center;padding:0 8px;background:#111;font-size:10px;color:#666">${escapeHTML(device.name)}</div>`;
  }

  // Wrapper híbrido: Intenta cargar la imagen SVG/PNG primero. Si falla (ej. porque se renombró a .archivo.svg), muestra el renderizado CSS.
  const imgSrc = device.skin ? `assets/img/${device.skin}` : `assets/svg/${category}/${type}.svg`;
  
  return `
    <div class="faceplate-wrapper" data-device-id="${device.id}" style="height:${h}px; width:100%; position:relative; overflow:hidden; border-radius: 4px;">
      <img src="${imgSrc}" 
           style="width:100%; height:100%; object-fit:contain; position:absolute; inset:0; z-index:2; display:block;"
           onload="this.nextElementSibling.style.display='none';" 
           onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
           alt="${type}" />
      <div class="faceplate-css-fallback" style="height:100%; width:100%; position:relative; z-index:1;">
        ${cssFaceplate}
      </div>
    </div>`;
}

function getFloorFaceplate(device) {
  const colors = {
    pc:      '#0ea5e9',
    camera:  '#8b5cf6',
    ap:      '#10b981',
    door:    '#f59e0b',
    printer: '#06b6d4',
    phone:   '#ef4444',
  };
  const color = colors[device.type] || '#8b9ab8';
  const name  = escapeHTML(device.name);
  const svgIcon = typeof SVG_ICONS !== 'undefined' && SVG_ICONS[device.type] ? SVG_ICONS[device.type] : '';

  return `
    <div class="floor-device-card" 
         data-device-id="${device.id}" 
         draggable="true"
         style="--floor-color: ${color}">
      <div class="floor-device-icon" style="color:${color}; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${svgIcon}</div>
      <div class="floor-device-info">
        <div class="floor-device-name">${name}</div>
        <div class="floor-device-meta">${escapeHTML(device.ip) || escapeHTML(device.type).toUpperCase()}</div>
      </div>
      <div class="device-actions">
        <button class="dev-btn menu" data-menu-dev="${device.id}" title="Opciones" style="background:none; border:none; font-size:16px; padding:0 8px; color:var(--text-muted); cursor:pointer;">⋮</button>
      </div>
    </div>`;
}

function buildRearView(rack, devices) {
  const TYPE_COLORS_LOCAL = {
    server: '#10b981', switch: '#10b981', router: '#06b6d4',
    firewall: '#ef4444', ups: '#f59e0b', storage: '#8b5cf6'
  };

  // Pre-build a map: deviceId → connections involving it
  const connMap = {};
  (store._raw.connections || []).forEach(c => {
    if (!connMap[c.sourceDeviceId]) connMap[c.sourceDeviceId] = [];
    if (!connMap[c.targetDeviceId]) connMap[c.targetDeviceId] = [];
    connMap[c.sourceDeviceId].push({ conn: c, side: 'src' });
    connMap[c.targetDeviceId].push({ conn: c, side: 'dst' });
  });

  // Build device map by slot
  const deviceMap = {};
  devices.forEach(d => {
    for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d;
  });

  let slotsHTML = '';
  let skip = 0;

  for (let u = 1; u <= rack.height; u++) {
    if (skip > 0) { skip--; continue; }
    const dev = devices.find(d => d.slotStart === u);

    if (dev) {
      skip = dev.size - 1;
      const h = dev.size * UNIT_H;
      const devColor = TYPE_COLORS_LOCAL[dev.type] || '#1e3a5f';
      const conns = connMap[dev.id] || [];

      // Build port pills
      let portsHTML = '';
      if (conns.length > 0) {
        portsHTML = conns.map(({ conn, side }) => {
          const port = side === 'src' ? conn.sourcePort : conn.targetPort;
          const peerId = side === 'src' ? conn.targetDeviceId : conn.sourceDeviceId;
          const peer = store.deviceById(peerId);
          const peerName = peer ? peer.name.slice(0, 14) : '?';
          const cableColor = conn.color || '#3b82f6';
          return `<div class="rear-port" title="${escapeHTML(port)} → ${escapeHTML(peerName)}">
            <div class="rear-port-jack active" data-device-id="${dev.id}" data-port="${escapeHTML(port)}" style="--cable-color:${escapeHTML(cableColor)}"></div>
            <div class="rear-port-label">${escapeHTML(port)}</div>
          </div>`;
        }).join('');
      } else {
        // Show 2 idle ports for empty devices
        portsHTML = `
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>`;
      }

      // Power outlets
      const plugs = parseInt(dev.plugs) || 1;
      const outletHTML = Array.from({ length: Math.min(plugs, 4) }, (_, i) =>
        `<div class="rear-outlet used" title="${escapeHTML(dev.power || 0)}W · Toma ${i+1}"></div>`
      ).join('');

      slotsHTML += `<div class="rear-slot" style="height:${h}px; min-height:${h}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body has-device" style="--device-color:${devColor}">
          <span class="rear-device-name" title="${escapeHTML(dev.name)}">${escapeHTML(dev.name.slice(0,16))}</span>
          <div class="rear-ports">${portsHTML}</div>
          <div class="rear-pdu">${outletHTML}</div>
        </div>
      </div>`;
    } else {
      slotsHTML += `<div class="rear-slot" style="height:${UNIT_H}px; min-height:${UNIT_H}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body"></div>
      </div>`;
    }
  }

  const totalConns = devices.reduce((s, d) => s + (connMap[d.id] ? connMap[d.id].length : 0), 0);

  return `
    <div class="rack-rear-header">
      <span class="rear-label">Vista Trasera</span>
      <span style="color:#2a5080; font-size:9px">${totalConns} cable(s)</span>
    </div>
    <div class="rack-rear-slots">${slotsHTML}</div>`;
}
