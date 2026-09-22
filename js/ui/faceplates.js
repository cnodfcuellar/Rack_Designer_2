/**
 * faceplates.js — Motor de renderizado visual de equipos (SVG-First con Inline Injection)
 * Rack Designer Next
 * 
 * Cada equipo se visualiza a través de gráficos SVG vectoriales de alta fidelidad.
 * Se inyectan en el DOM como SVG inline para permitir que el botón global de animaciones
 * (status-dot / body.no-animations) pause y reanude los LEDs intermitentes y efectos en tiempo real.
 * Los assets por defecto se ubican en assets/svg/default/ y assets/default/.
 */

// Caché en memoria para almacenar el contenido de los SVGs y evitar peticiones de red repetidas
const SVG_INLINE_CACHE = {};

const DEFAULT_SVG_ASSETS = [
  'assets/svg/default/server_1u.svg',
  'assets/svg/default/server_2u.svg',
  'assets/svg/default/server_4u.svg',
  'assets/svg/default/switch_24p.svg',
  'assets/svg/default/router.svg',
  'assets/svg/default/firewall.svg',
  'assets/svg/default/storage.svg',
  'assets/svg/default/ups.svg',
  'assets/svg/default/ups_2u.svg',
  'assets/svg/default/pdu.svg',
  'assets/svg/default/patchpanel.svg',
  'assets/svg/default/organizer.svg',
  'assets/svg/default/kvm.svg',
  'assets/svg/default/tray.svg',
  'assets/svg/default/floor_pc.svg',
  'assets/svg/default/floor_camera.svg',
  'assets/svg/default/floor_ap.svg',
  'assets/svg/default/floor_printer.svg'
];

/**
 * Precarga asíncrona de los 16 archivos SVG predeterminados en memoria.
 */
function preloadFaceplateSvgs() {
  DEFAULT_SVG_ASSETS.forEach(url => {
    fetch(url)
      .then(res => res.ok ? res.text() : '')
      .then(text => {
        if (text) SVG_INLINE_CACHE[url] = text;
      })
      .catch(() => {
        // Fallback a ruta secundaria assets/default/
        const fallbackUrl = 'assets/default/' + url.split('/').pop();
        fetch(fallbackUrl)
          .then(res => res.ok ? res.text() : '')
          .then(text => {
            if (text) {
              SVG_INLINE_CACHE[url] = text;
              SVG_INLINE_CACHE[fallbackUrl] = text;
            }
          })
          .catch(() => {});
      });
  });
}

// Iniciar precarga inmediata
if (typeof window !== 'undefined') {
  preloadFaceplateSvgs();
}

/**
 * Normaliza y prepara el string SVG para ser inyectado como SVG inline en el DOM.
 * @param {string} svgText 
 * @param {string} devType 
 * @returns {string} Marcado SVG preparado
 */
function prepareInlineSvg(svgText, devType) {
  if (!svgText) return '';
  let processed = svgText.trim().replace(/<\?xml[^>]*\?>/gi, '');
  
  // Estandarizar atributos del elemento raíz <svg>
  processed = processed.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/i);
    const viewBoxAttr = viewBoxMatch ? `viewBox="${viewBoxMatch[1]}"` : 'viewBox="0 0 240 24"';
    return `<svg class="faceplate-img" preserveAspectRatio="none" ${viewBoxAttr} style="width:100%; height:100%; display:block;" role="img" aria-label="${devType || 'Dispositivo'}">`;
  });

  return processed;
}

/**
 * Reemplaza dinámicamente un <img> por su contraparte <svg> inline una vez cargado.
 * @param {HTMLImageElement} imgEl 
 * @param {string} svgSrc 
 * @param {string} devType 
 */
function inlineFaceplateImage(imgEl, svgSrc, devType) {
  const replaceWithSvg = (svgText) => {
    if (!svgText) return;
    SVG_INLINE_CACHE[svgSrc] = svgText;
    const parent = imgEl.parentElement;
    if (parent && parent.contains(imgEl)) {
      const svgHtml = prepareInlineSvg(svgText, devType);
      const temp = document.createElement('div');
      temp.innerHTML = svgHtml;
      const svgNode = temp.firstElementChild;
      if (svgNode) {
        parent.replaceChild(svgNode, imgEl);
      }
    }
  };

  if (SVG_INLINE_CACHE[svgSrc]) {
    replaceWithSvg(SVG_INLINE_CACHE[svgSrc]);
  } else {
    fetch(svgSrc)
      .then(res => res.ok ? res.text() : '')
      .then(replaceWithSvg)
      .catch(() => {});
  }
}

/**
 * Resuelve la ruta del archivo SVG correspondiente según el tipo y tamaño del equipo.
 * Si el equipo tiene una skin personalizada configurada, se prioriza.
 * @param {Object} device 
 * @returns {string} Ruta al archivo SVG
 */
function getSvgFaceplatePath(device) {
  if (device && device.skin) {
    return `assets/img/${device.skin}`;
  }

  const type = ((device && device.type) || 'server').toLowerCase();
  const name = ((device && device.name) || '').toLowerCase();
  const size = (device && device.size) ? parseInt(device.size, 10) : 1;

  // Servidores (1U, 2U o 4U Blade/Chasis)
  if (type === 'server') {
    if (size >= 4) return 'assets/svg/default/server_4u.svg';
    return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/server_1u.svg';
  }

  // Seguridad y Video (NVR, DVR, Decoder)
  if (type === 'nvr' || type === 'dvr') {
    return size >= 2 ? 'assets/svg/default/storage.svg' : 'assets/svg/default/server_1u.svg';
  }
  if (type === 'decoder') {
    return 'assets/svg/default/router.svg';
  }

  // Switches y conectividad de red
  if (type === 'switch') return 'assets/svg/default/switch_24p.svg';
  if (type === 'router') return 'assets/svg/default/router.svg';
  if (type === 'firewall') return 'assets/svg/default/firewall.svg';

  // Almacenamiento (Storage, SAN, NAS)
  if (type === 'storage' || type === 'nas' || type === 'san') {
    if (size >= 4) return 'assets/svg/default/server_4u.svg';
    return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/storage.svg';
  }

  // Energía (UPS y PDU)
  if (type === 'ups') {
    return size >= 2 ? 'assets/svg/default/ups_2u.svg' : 'assets/svg/default/ups.svg';
  }
  if (type === 'pdu') return 'assets/svg/default/pdu.svg';
  if (type === 'energia' || type === 'power') {
    if (name.includes('pdu')) return 'assets/svg/default/pdu.svg';
    return size >= 2 ? 'assets/svg/default/ups_2u.svg' : 'assets/svg/default/ups.svg';
  }

  // Cableado y Gestión
  if (type === 'patchpanel' || type === 'odf') return 'assets/svg/default/patchpanel.svg';
  if (type === 'gestion') {
    return name.includes('kvm') ? 'assets/svg/default/kvm.svg' : 'assets/svg/default/patchpanel.svg';
  }
  if (type === 'organizer' || type === 'organizador') return 'assets/svg/default/organizer.svg';
  if (type === 'kvm') return 'assets/svg/default/kvm.svg';
  if (type === 'tray' || type === 'bandeja' || type === 'accessories') return 'assets/svg/default/tray.svg';

  // Equipos de piso o externos
  if (type === 'pc') return 'assets/svg/default/floor_pc.svg';
  if (type === 'camera') return 'assets/svg/default/floor_camera.svg';
  if (type === 'ap') return 'assets/svg/default/floor_ap.svg';
  if (type === 'printer') return 'assets/svg/default/floor_printer.svg';

  // Fallback genérico según altura
  if (size >= 4) return 'assets/svg/default/server_4u.svg';
  return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/server_1u.svg';
}

/**
 * Construye la carátula frontal o trasera (faceplate) para un equipo de rack.
 * Inyecta SVG inline (o fallback reactivo con auto-inlining) para que las animaciones
 * de los LEDs respondan de inmediato a body.no-animations.
 * @param {Object} device - Objeto de dispositivo
 * @param {number} heightPx - Altura calculada en píxeles (size * UNIT_H)
 * @param {string} side - 'front' o 'rear'
 * @returns {string} Marcado HTML con imagen SVG y etiquetas legibles
 */
function buildFaceplate(device, heightPx, side = 'front') {
  if (side === 'rear') {
    return buildRearFaceplate(device, heightPx);
  }

  const h = heightPx;
  const svgSrc = getSvgFaceplatePath(device);
  const devName = escapeHTML(device.name || 'Dispositivo');
  const devIp = escapeHTML(device.ip || '');
  const devType = escapeHTML((device.type || 'server').toUpperCase());

  let visualElement = '';
  if (SVG_INLINE_CACHE[svgSrc]) {
    visualElement = prepareInlineSvg(SVG_INLINE_CACHE[svgSrc], devType);
  } else {
    visualElement = `
      <img src="${svgSrc}" 
           class="faceplate-img" 
           alt="${devType} - ${devName}"
           draggable="false"
           onload="inlineFaceplateImage(this, '${svgSrc}', '${devType}')"
           onerror="if(!this.dataset.fallback){this.dataset.fallback=1; this.src='assets/default/' + this.src.split('/').pop();}" />`;
  }

  return `
    <div class="faceplate-wrapper" data-device-id="${device.id}" data-dev-type="${devType.toLowerCase()}" style="height:${h}px;">
      ${visualElement}
      <div class="faceplate-overlay-info">
        <span class="faceplate-label dev-title" title="${devName}">${devName}</span>
        ${devIp ? `<span class="faceplate-label dev-meta" title="${devIp}">${devIp}</span>` : ''}
      </div>
    </div>`;
}

/**
 * Construye la carátula técnica trasera para un equipo de rack.
 * @param {Object} device 
 * @param {number} heightPx 
 * @returns {string} Marcado HTML
 */
function buildRearFaceplate(device, heightPx) {
  const h = heightPx;
  const devName = escapeHTML(device.name || 'Dispositivo');
  const plugs = parseInt(device.plugs) || (device.type === 'server' ? 2 : 1);
  const ethernetPorts = (device.ports && device.ports.ethernet) || 2;
  
  let psuHTML = '';
  for (let i = 0; i < Math.min(plugs, 4); i++) {
    psuHTML += `
      <div style="display:flex; align-items:center; gap:4px; background:rgba(0,0,0,0.5); padding:2px 5px; border-radius:3px; border:1px solid rgba(255,255,255,0.12);" title="Fuente de Alimentación PSU ${i+1}">
        <div style="width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 5px #10b981;"></div>
        <span style="font-size:9px; font-family:var(--font-mono); color:#94a3b8; font-weight:600;">PSU-${i+1}</span>
      </div>`;
  }
  
  let netHTML = '';
  if (ethernetPorts > 0) {
    netHTML += `<div style="display:flex; gap:2px; align-items:center;" title="${ethernetPorts} puertos LAN traseros">`;
    for (let i = 0; i < Math.min(ethernetPorts, 8); i++) {
      netHTML += `<div class="rear-port-jack" data-device-id="${device.id}" data-port="Eth${i+1}" style="width:9px; height:7px; background:#0f172a; border:1px solid #38bdf8; border-radius:1px;"></div>`;
    }
    netHTML += `</div>`;
  }

  const isDual = device.mountSide === 'both';
  const badgeLabel = isDual ? 'TRASERA · DUAL' : 'TRASERA';

  return `
    <div class="faceplate-wrapper rear-faceplate" data-device-id="${device.id}" style="height:${h}px; background:linear-gradient(90deg, #09111e 0%, #132238 50%, #09111e 100%); border:1px solid #1e3a5f; display:flex; align-items:center; justify-content:space-between; padding:0 12px; box-sizing:border-box; position:relative; overflow:hidden;">
      <div style="display:flex; align-items:center; gap:8px; z-index:2;">
        <span style="font-size:9px; font-weight:700; background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); border-radius:3px; padding:1px 5px; font-family:var(--font-mono); letter-spacing:0.5px;">${badgeLabel}</span>
        <span style="font-size:11px; font-weight:600; color:#cbd5e1; font-family:var(--font-mono); max-width:110px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${devName}">${devName}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px; z-index:2;">
        ${netHTML}
        ${psuHTML}
      </div>
      <div style="position:absolute; inset:0; opacity:0.04; background-image:radial-gradient(#ffffff 1px, transparent 1px); background-size:6px 6px; pointer-events:none;"></div>
    </div>`;
}

/**
 * Renderiza la tarjeta para dispositivos de planta/piso (floor devices).
 * @param {Object} device 
 * @returns {string} Marcado HTML
 */
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

/**
 * Construye la vista posterior (rear view) del rack y sus conexiones de energía/red.
 * @param {Object} rack 
 * @param {Array} devices 
 * @returns {string} Marcado HTML de la vista trasera
 */
function buildRearView(rack, devices) {
  const TYPE_COLORS_LOCAL = {
    server: '#10b981', switch: '#10b981', router: '#06b6d4',
    firewall: '#ef4444', ups: '#f59e0b', storage: '#8b5cf6'
  };

  // Mapear conexiones activas por dispositivo
  const connMap = {};
  (store._raw.connections || []).forEach(c => {
    if (!connMap[c.sourceDeviceId]) connMap[c.sourceDeviceId] = [];
    if (!connMap[c.targetDeviceId]) connMap[c.targetDeviceId] = [];
    connMap[c.sourceDeviceId].push({ conn: c, side: 'src' });
    connMap[c.targetDeviceId].push({ conn: c, side: 'dst' });
  });

  // Mapa de dispositivos por unidad U
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

      // Construcción de los puertos traseros
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
        portsHTML = `
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>`;
      }

      // Tomas de corriente / PDU
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
