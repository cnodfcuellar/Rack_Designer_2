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

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(56, 189, 248, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('hsla')) return hex;
  if (hex.startsWith('rgb')) {
    return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

let lastAnimTime = 0;

function drawTopo() {
  if (topoAnim) {
    cancelAnimationFrame(topoAnim);
    topoAnim = null;
  }
  if (!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  // Fondo global dinámico según tema
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#f8fafc' : '#0a0f1d';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);
  
  // Patrón de fondo configurable
  const pattern = window.TOPO_BG_PATTERN || 'dots';
  if (pattern === 'dots') {
    ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.14)';
    for (let x = 0; x < W; x += 36) {
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 40) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    for (let y = 0; y < H; y += 40) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();
  } else if (pattern === 'hexagon') {
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const hr = 24;
    const ha = (2 * Math.PI) / 6;
    const hexW = hr * Math.sqrt(3);
    const hexH = hr * 1.5;
    ctx.beginPath();
    for (let y = 0; y < H + hr; y += hexH) {
      const isOdd = Math.floor(y / hexH) % 2 === 1;
      const offsetX = isOdd ? hexW / 2 : 0;
      for (let x = -hr; x < W + hr; x += hexW) {
        const cx = x + offsetX;
        const cy = y;
        for (let i = 0; i < 6; i++) {
          const hpx = cx + hr * Math.cos(ha * i);
          const hpy = cy + hr * Math.sin(ha * i);
          if (i === 0) ctx.moveTo(hpx, hpy);
          else ctx.lineTo(hpx, hpy);
        }
        ctx.closePath();
      }
    }
    ctx.stroke();
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

  const userAlpha = window.TOPO_ALPHA !== undefined ? window.TOPO_ALPHA : 0.25;
  const inherit = window.TOPO_INHERIT_COLORS !== false;

  // Draw Rooms con color temático y transparencia
  store._raw.rooms.forEach(room => {
    const pos = roomPositions[room.id];
    const size = roomSizes[room.id];
    if (!pos || !size) return;

    const baseColor = (inherit && room.color) ? room.color : '#f97316';
    const roomFillAlpha = hoveredNode ? userAlpha * 0.5 : userAlpha;
    const isActiveRoom = room.id === store._raw.currentRoomId;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 24);
    ctx.fillStyle = hexToRgba(baseColor, roomFillAlpha);
    ctx.fill();

    ctx.strokeStyle = isActiveRoom ? '#38bdf8' : hexToRgba(baseColor, 0.75);
    ctx.lineWidth = isActiveRoom ? 3.5 : 2;
    ctx.stroke();

    // Franja de cabecera de la sala
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, 44, [24, 24, 0, 0]);
    ctx.fillStyle = hexToRgba(baseColor, Math.min(0.8, roomFillAlpha + 0.25));
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 20px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name, pos.x + 22, pos.y + 22);

    // Resize Handle Room
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 20, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 20);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = hexToRgba(baseColor, 0.8);
    ctx.fill();
    ctx.restore();
  });

  // Draw Racks con color temático y transparencia
  store._raw.racks.forEach(rack => {
    const pos = rackPositions[rack.id];
    const size = rackSizes[rack.id];
    if (!pos || !size) return;

    const rackBaseColor = (inherit && rack.color) ? rack.color : '#0ea5e9';
    const rackFillAlpha = hoveredNode ? (userAlpha + 0.08) * 0.5 : (userAlpha + 0.08);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, size.h, 14);
    ctx.fillStyle = hexToRgba(rackBaseColor, rackFillAlpha);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(rackBaseColor, 0.85);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Franja de cabecera del rack
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.w, 32, [14, 14, 0, 0]);
    ctx.fillStyle = hexToRgba(rackBaseColor, Math.min(0.85, rackFillAlpha + 0.3));
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(rack.name, pos.x + 14, pos.y + 16);

    // Resize Handle Rack
    ctx.beginPath();
    ctx.moveTo(pos.x + size.w - 16, pos.y + size.h);
    ctx.lineTo(pos.x + size.w, pos.y + size.h - 16);
    ctx.lineTo(pos.x + size.w, pos.y + size.h);
    ctx.fillStyle = hexToRgba(rackBaseColor, 0.85);
    ctx.fill();
    ctx.restore();
  });

  // Draw Connections
  const now = performance.now();
  const dt = lastAnimTime ? Math.min(0.1, (now - lastAnimTime) / 1000) : 0.016;
  lastAnimTime = now;
  if (!document.body.classList.contains('no-animations')) {
    flowT = (flowT + dt * 0.45) % 1;
  }
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const isActive = hoveredNode ? activeConns.has(conn.id) : true;
    
    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;

    const isTree = window.TOPO_LAYOUT_MODE === 'tree';
    const midX = x1 + (x2 - x1) * 0.5;
    const midY = y1 + (y2 - y1) * 0.5;

    ctx.save();
    ctx.beginPath();
    if (isTree) {
      // Trazado Ortogonal de Árbol de Red con esquinas redondeadas (Draw.io style)
      ctx.moveTo(x1, y1);
      const r = 8;
      if (Math.abs(x2 - x1) > r * 2 && Math.abs(y2 - y1) > r * 2) {
        const signX = x2 > x1 ? 1 : -1;
        const signY = y2 > y1 ? 1 : -1;
        ctx.lineTo(x1, midY - signY * r);
        ctx.arcTo(x1, midY, x1 + signX * r, midY, r);
        ctx.lineTo(x2 - signX * r, midY);
        ctx.arcTo(x2, midY, x2, midY + signY * r, r);
        ctx.lineTo(x2, y2);
      } else {
        ctx.lineTo(x1, midY);
        ctx.lineTo(x2, midY);
        ctx.lineTo(x2, y2);
      }
    } else {
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2);
    }
    
    // Diferenciación de cableado frontal vs trasero
    const isRear = conn.facing === 'rear' || conn.targetFacing === 'rear' || conn.sourceFacing === 'rear';
    if (isRear) {
      ctx.setLineDash([5, 4]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = conn.color || '#ffffff';
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.globalAlpha = isActive ? 1 : 0.2;
    ctx.stroke();

    if (isActive) {
      const numParticles = 4;
      for(let i=0; i<numParticles; i++) {
        let t = ((flowT + i/numParticles) % 1);
        const pt = isTree
          ? orthogonalPoint(x1, y1, x2, y2, t)
          : { x: bezierPoint(x1, midX, midX, x2, t), y: bezierPoint(y1, y1, y2, y2, t) };
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
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
      
      // Renderizado de Etiquetas (Nombre e IP según configuración definida por el usuario)
      const namePos = window.TOPO_NAME_POS || 'bottom';
      const ipPos   = window.TOPO_IP_POS   || 'top';
      const rawDevName = dev.name || '';
      const devName = rawDevName.length > 17 ? rawDevName.slice(0, 16) + '…' : rawDevName;
      const devIp   = dev.ip || '';

      function drawNodeName(x, y, align = 'center') {
        if (!devName || namePos === 'none') return;
        ctx.save();
        ctx.font = 'bold 11px "Space Grotesk", sans-serif';
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 1;
        ctx.fillText(devName, x, y);
        ctx.restore();
      }

      function drawNodeIp(x, y, align = 'center') {
        if (!devIp || ipPos === 'none') return;
        ctx.save();
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textBaseline = 'middle';
        const ipWidth = ctx.measureText(devIp).width;
        let boxX = x - ipWidth / 2 - 5;
        let textX = x;
        if (align === 'left') {
          boxX = x;
          textX = x + 5 + ipWidth / 2;
        } else if (align === 'right') {
          boxX = x - ipWidth - 10;
          textX = x - 5 - ipWidth / 2;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, y - 8, ipWidth + 10, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(devIp, textX, y);
        ctx.restore();
      }

      const hasBoth = devName && namePos !== 'none' && devIp && ipPos !== 'none';
      const isTogether = hasBoth && namePos === ipPos;

      if (isTogether) {
        // JUNTOS en la misma posición (arriba, abajo, derecha, izquierda)
        if (namePos === 'bottom') {
          drawNodeName(pos.x, pos.y + r + 12, 'center');
          drawNodeIp(pos.x, pos.y + r + 28, 'center');
        } else if (namePos === 'top') {
          drawNodeIp(pos.x, pos.y - r - 26, 'center');
          drawNodeName(pos.x, pos.y - r - 10, 'center');
        } else if (namePos === 'right') {
          drawNodeName(pos.x + r + 10, pos.y - 7, 'left');
          drawNodeIp(pos.x + r + 10, pos.y + 9, 'left');
        } else if (namePos === 'left') {
          drawNodeName(pos.x - r - 10, pos.y - 7, 'right');
          drawNodeIp(pos.x - r - 10, pos.y + 9, 'right');
        }
      } else {
        // SEPARADOS o independientes
        if (namePos === 'top') {
          drawNodeName(pos.x, pos.y - r - 12, 'center');
        } else if (namePos === 'bottom') {
          drawNodeName(pos.x, pos.y + r + 14, 'center');
        } else if (namePos === 'right') {
          drawNodeName(pos.x + r + 10, pos.y, 'left');
        } else if (namePos === 'left') {
          drawNodeName(pos.x - r - 10, pos.y, 'right');
        }

        if (ipPos === 'top') {
          drawNodeIp(pos.x, pos.y - r - 12, 'center');
        } else if (ipPos === 'bottom') {
          drawNodeIp(pos.x, pos.y + r + 14, 'center');
        } else if (ipPos === 'right') {
          drawNodeIp(pos.x + r + 10, pos.y, 'left');
        } else if (ipPos === 'left') {
          drawNodeIp(pos.x - r - 10, pos.y, 'right');
        }
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
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      const rawCardName = dev.name || '';
      const displayCardName = rawCardName.length > 17 ? rawCardName.slice(0, 16) + '…' : rawCardName;
      ctx.fillText(displayCardName, cx + 36, cy + 18);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
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
      const devFullName = dev.name || 'Desconocido';
      let titleLines = [devFullName];
      if (devFullName.length > 21 && devFullName.includes(' ')) {
        const words = devFullName.split(' ');
        let l1 = '';
        let l2 = '';
        for (const w of words) {
          if ((l1 + ' ' + w).trim().length <= 21) {
            l1 = (l1 + ' ' + w).trim();
          } else {
            l2 = (l2 + ' ' + w).trim();
          }
        }
        if (l1 && l2) {
          titleLines = [l1, l2];
        }
      }

      const hudW = 240;
      const padX = 14;
      const titleLineH = 17;
      const isMulti = titleLines.length > 1;
      const hudH = isMulti ? 116 : 100;

      let hudX = mousePos.rawX + 16;
      let hudY = mousePos.rawY + 16;
      
      if (hudX + hudW > W - 10) hudX = mousePos.rawX - hudW - 16;
      if (hudX < 10) hudX = 10;
      if (hudY + hudH > H - 10) hudY = mousePos.rawY - hudH - 16;
      if (hudY < 10) hudY = 10;

      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = (dev && dev.type && TYPE_COLORS[dev.type]) || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      titleLines.forEach((tl, i) => {
        ctx.fillText(tl, hudX + padX, hudY + 12 + (i * titleLineH));
      });
      
      const propsStartY = hudY + 12 + (titleLines.length * titleLineH) + 6;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`Tipo:  ${String(dev.type || 'unknown').toUpperCase()}`, hudX + padX, propsStartY);
      ctx.fillText(`IP:    ${dev.ip || 'N/A'}`, hudX + padX, propsStartY + 15);
      ctx.fillText(`User:  ${dev.user || 'N/A'}`, hudX + padX, propsStartY + 30);
      ctx.fillText(`Pass:  ${dev.pass ? (window.SHOW_PASSWORDS ? dev.pass : '••••••••') : 'N/A'}`, hudX + padX, propsStartY + 45);
      
      ctx.restore();
    }
  }

  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

function orthogonalPoint(x1, y1, x2, y2, t) {
  const midY = y1 + (y2 - y1) * 0.5;
  const d1 = Math.abs(midY - y1);
  const d2 = Math.abs(x2 - x1);
  const d3 = Math.abs(y2 - midY);
  const total = d1 + d2 + d3;
  if (total <= 0) return { x: x1, y: y1 };
  const targetDist = t * total;
  if (targetDist <= d1) {
    const ratio = d1 > 0 ? targetDist / d1 : 0;
    return { x: x1, y: y1 + (midY - y1) * ratio };
  } else if (targetDist <= d1 + d2) {
    const ratio = d2 > 0 ? (targetDist - d1) / d2 : 0;
    return { x: x1 + (x2 - x1) * ratio, y: midY };
  } else {
    const ratio = d3 > 0 ? (targetDist - d1 - d2) / d3 : 0;
    return { x: x2, y: midY + (y2 - midY) * ratio };
  }
}
