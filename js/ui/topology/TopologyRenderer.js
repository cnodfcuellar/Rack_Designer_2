const topoIconCache = {};
function getTopoIcon(type) {
  if (topoIconCache[type]) return topoIconCache[type];
  const catItem = typeof CATALOG !== 'undefined' ? CATALOG.find(c => c.type === type) : null;
  const iconName = catItem && catItem.icon ? catItem.icon.split('/').pop().split('.')[0] : type;
  const svgStr = typeof SVG_ICONS !== 'undefined' ? SVG_ICONS[iconName] : null;
  if (!svgStr) return null;
  
  const coloredSvg = svgStr.replace(/currentColor/g, '#ffffff');
  const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const img = new Image();
  img.src = url;
  topoIconCache[type] = img;
  return img;
}

function drawTopo() {
  if(!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  // Fondo global
  ctx.fillStyle = '#2255aa';
  ctx.fillRect(0, 0, W, H);
  
  // Puntos de malla
  ctx.fillStyle = '#ffffff22';
  for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
  }

  const zoom = store._raw.topoZoom || 1;
  const px   = store._raw.topoPanX || 0;
  const py   = store._raw.topoPanY || 0;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);

  let connectedNodes = new Set();
  let activeConns = new Set();
  if (hoveredNode) {
    connectedNodes.add(hoveredNode);
    store._raw.connections.forEach(c => {
      if (c.sourceDeviceId === hoveredNode || c.targetDeviceId === hoveredNode) {
        connectedNodes.add(c.sourceDeviceId);
        connectedNodes.add(c.targetDeviceId);
        activeConns.add(c.id);
      }
    });
  }

  // Draw Rooms
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 24);
    const isActiveRoom = room.id === store._raw.currentRoomId;
    ctx.fillStyle = '#f97316' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = isActiveRoom ? '#ffffff' : '#c2410c';
    ctx.lineWidth = isActiveRoom ? 4 : 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px 'Space Grotesk', sans-serif`;
    ctx.fillText(room.name, pos.x + 24, pos.y + 40);

    // Resize Handle Room
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 20, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 20);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#c2410c';
    ctx.fill();
    ctx.restore();
  });

  // Draw Racks
  store._raw.racks.forEach(rack => {
    const pos = rackPositions[rack.id];
    const size = rackSizes[rack.id];
    if (!pos || !size) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 12);
    ctx.fillStyle = '#65a30d' + (hoveredNode ? '66' : 'ff');
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x + 15, pos.y + 25);

    // Resize Handle Rack
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 16, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 16);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = '#ffffffaa';
    ctx.fill();
    ctx.restore();
  });

  // Draw Connections
  if (!document.body.classList.contains('no-animations')) {
    flowT = (flowT + 0.0075) % 1;
  }
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const isActive = hoveredNode ? activeConns.has(conn.id) : true;
    
    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
    ctx.strokeStyle = conn.color || '#ffffff';
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.globalAlpha = isActive ? 1 : 0.2;
    ctx.stroke();

    if (isActive) {
      const numParticles = 4;
      for(let i=0; i<numParticles; i++) {
        let t = ((flowT + i/numParticles) % 1);
        const bx = bezierPoint(x1, cx1, cx2, x2, t);
        const by = bezierPoint(y1, cy1, cy2, y2, t);
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }
    ctx.restore();
  });

  const searchInput = document.getElementById('global-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  // Draw Device Nodes
  store._raw.devices.forEach(dev => {
    if (['accesorios'].includes(dev.type)) return;
    const pos = nodePositions[dev.id];
    if (!pos) return;
    const col = TYPE_COLORS[dev.type] || '#888';
    const r = 22;
    
    let isActive = true;
    if (searchTerm) {
      const fields = [dev.name, dev.ip, dev.mac, dev.serial, dev.type, dev.user].join(' ').toLowerCase();
      isActive = fields.includes(searchTerm);
    } else {
      isActive = hoveredNode ? connectedNodes.has(dev.id) : true;
    }
    
    const isHoverTarget = hoveredNode === dev.id;

    ctx.save();
    ctx.globalAlpha = isActive ? 1 : 0.15; // Dim significantly if not matching
    
    if (window.TOPOLOGY_STYLE === 'circle') {
      if (isHoverTarget) {
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI*2);
        ctx.fillStyle = '#ffffff66'; 
        ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
        ctx.fillStyle = '#ffffff22'; 
        ctx.fill();
      }
      
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.fill(); ctx.stroke();
      
      ctx.font = '16px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      const img = getTopoIcon(dev.type);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, pos.x - 10, pos.y - 10, 20, 20);
      } else {
        ctx.font = '12px "Space Grotesk", sans-serif';
        ctx.fillText(dev.type.substring(0, 2).toUpperCase(), pos.x, pos.y);
      }
      
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dev.name.slice(0, 16), pos.x, pos.y - r - 26);
      
      if (dev.ip) {
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        const ipWidth = ctx.measureText(dev.ip).width;
        const ipY = pos.y - r - 10;
        
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(pos.x - ipWidth/2 - 6, ipY - 8, ipWidth + 12, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillText(dev.ip, pos.x, ipY);
      }
    } else {
      // CARD STYLE
      const cardW = 150;
      const cardH = 50;
      const cx = pos.x - cardW/2;
      const cy = pos.y - cardH/2;

      if (isHoverTarget) {
        ctx.beginPath(); ctx.roundRect(cx - 4, cy - 4, cardW + 8, cardH + 8, 12);
        ctx.fillStyle = '#ffffff33'; 
        ctx.fill();
      }
      
      ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 8);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.fill(); ctx.stroke();
      
      const img = getTopoIcon(dev.type);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, cx + 12, cy + 12, 16, 16);
      } else {
        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dev.type.substring(0, 2).toUpperCase(), cx + 20, cy + 20);
      }
      
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dev.name.slice(0, 20), cx + 36, cy + 18);
      
      if (dev.ip) {
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(dev.ip, cx + 36, cy + 34);
      }
    }
    
    ctx.restore();
  });

  ctx.restore(); // Restaurar matriz
  
  if (hoveredNode) {
    const dev = store.deviceById(hoveredNode);
    if (dev) {
      ctx.save();
      const hudW = 180;
      const hudH = 100;
      let hudX = mousePos.rawX + 20;
      let hudY = mousePos.rawY + 20;
      
      if (hudX + hudW > W) hudX = mousePos.rawX - hudW - 20;
      if (hudY + hudH > H) hudY = mousePos.rawY - hudH - 20;

      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = (dev && dev.type && TYPE_COLORS[dev.type]) || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      ctx.fillText(dev.name || 'Desconocido', hudX + 12, hudY + 24);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`Tipo:  ${String(dev.type || 'unknown').toUpperCase()}`, hudX + 12, hudY + 44);
      ctx.fillText(`IP:    ${dev.ip || 'N/A'}`, hudX + 12, hudY + 59);
      ctx.fillText(`User:  ${dev.user || 'N/A'}`, hudX + 12, hudY + 74);
      ctx.fillText(`Pass:  ${dev.pass ? (window.SHOW_PASSWORDS ? dev.pass : '••••••••') : 'N/A'}`, hudX + 12, hudY + 89);
      
      ctx.restore();
    }
  }

  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}
