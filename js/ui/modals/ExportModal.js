function getActiveThemeBg() {
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const bg = window.getComputedStyle(document.documentElement).getPropertyValue('--bg-main').trim();
    if (bg) return bg;
  }
  return isLight ? '#f0f4f8' : '#0b0f19';
}

function openPNGModal() {
  const list = document.getElementById('png-rack-list');
  const racks = store.currentRacks;
  const currentRoom = store.currentRoom;
  const roomName = currentRoom ? currentRoom.name : 'Sala Actual';
  const floorDevices = store.allFloorDevicesInRoom(store._raw.currentRoomId);
  const hasItems = racks.length > 0 || floorDevices.length > 0;

  let html = '';

  if (hasItems) {
    html += `
      <div style="margin-bottom:14px; display:flex; flex-direction:column; gap:8px;">
        <button class="btn-primary" id="btn-export-entire-room-dual" style="width:100%; justify-content:center; padding:10px 14px; font-weight:600; font-size:12px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; border:none; box-shadow:0 4px 12px rgba(16,185,129,0.28); border-radius:var(--radius); cursor:pointer; display:flex; align-items:center;">
          <i class="svg-icon icon-grid" style="width:15px; height:15px; margin-right:8px;"></i>Exportar Sala Completa — Vista Dual (F+T)
        </button>
        <button class="btn-secondary" id="btn-export-entire-room" style="width:100%; justify-content:center; padding:8px 12px; font-weight:600; font-size:11px; border-color:var(--border); color:var(--text-primary); border-radius:var(--radius); cursor:pointer; display:flex; align-items:center;">
          <i class="svg-icon icon-image" style="width:14px; height:14px; margin-right:7px;"></i>Exportar Sala Completa (Vista Actual 1:1)
        </button>
        <div style="font-size:10px; color:var(--text-muted); text-align:center; margin-top:2px; font-family:var(--font-mono);">
          Vista Dual: Recuadros modulares con frente y dorso lado a lado por rack + equipos de piso
        </div>
      </div>
      <div style="display:flex; align-items:center; margin:10px 0 10px 0; gap:8px;">
        <div style="height:1px; flex:1; background:var(--border);"></div>
        <div style="font-size:10px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-family:var(--font-mono);">Gabinetes Individuales</div>
        <div style="height:1px; flex:1; background:var(--border);"></div>
      </div>
    `;
  }

  if (racks.length > 0) {
    html += racks.map(r => {
      const devices = store.allDevicesInRack(r.id);
      const hasRear = devices.some(d => d.mountSide === 'rear' || d.mountSide === 'both');
      const flipper = typeof document !== 'undefined' ? document.getElementById(`flipper-${r.id}`) : null;
      const isFlipped = flipper ? flipper.classList.contains('flipped') : false;

      return `
        <div style="margin-bottom:8px; background:var(--bg-card1); border:1px solid var(--border); border-radius:var(--radius); padding:8px 10px;">
          <div style="font-size:11px; font-weight:600; color:var(--text-primary); margin-bottom:6px; font-family:var(--font-mono); display:flex; justify-content:space-between; align-items:center;">
            <span><i class="svg-icon icon-server" style="width:13px; height:13px; margin-right:4px;"></i>${escapeHTML(r.name)} (${r.height}U)</span>
            <span style="font-size:9px; color:var(--text-muted);">${hasRear ? 'Doble Cara' : (isFlipped ? 'Activo: Trasera' : 'Activo: Frontal')}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary" style="flex:1; justify-content:center; font-size:11px; padding:4px 6px;" data-export-rack="${escapeHTML(r.id)}" data-side="front" title="Exportar solo cara frontal">
              <i class="svg-icon icon-image" style="width:12px; height:12px; margin-right:4px;"></i>Frontal
            </button>
            <button class="btn-secondary" style="flex:1; justify-content:center; font-size:11px; padding:4px 6px;" data-export-rack="${escapeHTML(r.id)}" data-side="rear" title="Exportar solo cara trasera">
              <i class="svg-icon icon-rotate" style="width:12px; height:12px; margin-right:4px;"></i>Trasera
            </button>
            <button class="btn-secondary" style="flex:1.2; justify-content:center; font-size:11px; padding:4px 6px; border-color:var(--accent); color:var(--accent);" data-export-rack="${escapeHTML(r.id)}" data-side="both" title="Exportar frontal y trasera lado a lado en un solo PNG">
              <i class="svg-icon icon-grid" style="width:12px; height:12px; margin-right:4px;"></i>Ambos Lados
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  const floorDevicesList = store.allFloorDevicesInRoom(store._raw.currentRoomId);
  if (floorDevicesList.length > 0) {
    html += `
      <div style="margin-top: 14px; margin-bottom: 8px; font-size: 10px; font-weight:600; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px; text-transform:uppercase; letter-spacing:0.5px; font-family:var(--font-mono);">Equipos de Piso / Periféricos</div>
      <button class="btn-secondary" id="btn-export-floor" style="width:100%; margin-bottom:8px; justify-content:flex-start; border-color: #f59e0b; color: #f59e0b;">
        <i class="svg-icon icon-image" style="width:14px; height:14px; margin-right:6px;"></i>Exportar Equipos de Piso (${floorDevicesList.length})
      </button>
    `;
  }
  
  if (!racks.length && !floorDevicesList.length) {
    html = `<div style="text-align:center;color:var(--text-muted);padding:20px;">No hay gabinetes ni equipos de piso en esta sala para exportar.</div>`;
  }

  list.innerHTML = html;

  const btnExportRoomDual = document.getElementById('btn-export-entire-room-dual');
  if (btnExportRoomDual) {
    btnExportRoomDual.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRoomToPNG(store._raw.currentRoomId, 'dual');
    });
  }

  const btnExportRoom = document.getElementById('btn-export-entire-room');
  if (btnExportRoom) {
    btnExportRoom.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRoomToPNG(store._raw.currentRoomId, 'current');
    });
  }

  list.querySelectorAll('[data-export-rack]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRackToPNG(btn.dataset.exportRack, btn.dataset.side);
    });
  });

  const btnFloor = document.getElementById('btn-export-floor');
  if (btnFloor) {
    btnFloor.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      if (typeof exportFloorToPNG === 'function') exportFloorToPNG(store._raw.currentRoomId);
    });
  }

  document.getElementById('modal-export-png').classList.remove('hidden');
}

function exportCSV() {
  const header = 'Rack,Unidad U,Lado,Nombre,Marca,Modelo,Tipo,Tamaño,IP,MAC,Serie,Usuario,Consumo(W),Tomas,Skin,Notas\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    const side = d.category === 'floor' ? '-' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal');
    return [
      rack?.name || '',
      d.slotStart || '-',
      side,
      d.name || '',
      d.brand || '',
      d.model || '',
      d.type || '',
      d.size || 1,
      d.ip || '',
      d.mac || '',
      d.serial || '',
      d.user || '',
      d.power || 0,
      d.plugs || 1,
      d.skin || 'default',
      d.notes || ''
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
  }).join('\n');
  downloadBlob(header + rows, 'Inventario_Centro_Datos.csv', 'text/csv');
  notify('CSV exportado', 'success');
}

function exportJSON() {
  const json = JSON.stringify(store._raw, null, 2);
  downloadBlob(json, 'Rack_Designer_Next_Backup.rack', 'application/json');
  notify('Proyecto exportado como archivo .rack', 'success');
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.rooms || !data.racks || !data.devices) throw new Error('Estructura inválida');
      store.snapshot();
      Object.assign(store._raw, data);
      store._save();
      store._emit('change', { source: 'importJSON' });
      notify('Proyecto cargado exitosamente', 'success');
    } catch(err) {
      notify('Archivo inválido: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

async function exportRackToPNG(rackId, side) {
  const rack = store.rackById(rackId);
  if (!rack) return;

  // Intento de exportación en Alta Fidelidad 1:1 vía html2canvas (M-37)
  const rackWrapper = typeof document !== 'undefined' ? document.querySelector(`.rack-wrapper[data-rack-id="${rackId}"]`) : null;
  if (typeof html2canvas === 'function' && rackWrapper) {
    const flipper = rackWrapper.querySelector('.rack-flipper');
    const face = flipper ? flipper.querySelector('.rack-face') : null;
    const rear = flipper ? flipper.querySelector('.rack-rear') : null;
    const isCurrentlyFlipped = flipper ? flipper.classList.contains('flipped') : false;
    const targetSide = side || (isCurrentlyFlipped ? 'rear' : 'front');

    const phys = document.getElementById('view-physical-content');
    const prevPhysZoom = phys ? phys.style.zoom : '';
    const prevPhysTransform = phys ? phys.style.transform : '';

    const prevWrapperStyles = {
      perspective: rackWrapper.style.perspective,
      transform: rackWrapper.style.transform,
      overflow: rackWrapper.style.overflow
    };

    const prevFlipperStyles = flipper ? {
      transform: flipper.style.transform,
      transformStyle: flipper.style.transformStyle,
      webkitTransformStyle: flipper.style.webkitTransformStyle,
      transition: flipper.style.transition
    } : null;

    const prevFaceStyles = face ? {
      display: face.style.display,
      position: face.style.position,
      transform: face.style.transform,
      visibility: face.style.visibility
    } : null;

    const prevRearStyles = rear ? {
      display: rear.style.display,
      position: rear.style.position,
      transform: rear.style.transform,
      visibility: rear.style.visibility,
      top: rear.style.top,
      left: rear.style.left,
      right: rear.style.right,
      bottom: rear.style.bottom
    } : null;

    try {
      if (phys) {
        phys.style.zoom = '1';
        phys.style.transform = 'none';
      }

      rackWrapper.classList.add('exporting-capture');
      rackWrapper.style.perspective = 'none';

      if (flipper) {
        flipper.style.transform = 'none';
        flipper.style.transformStyle = 'flat';
        if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = 'flat';
        flipper.style.transition = 'none';
      }

      const themeBg = getActiveThemeBg();

      const prepareSide = (s) => {
        if (s === 'rear') {
          if (face) face.style.display = 'none';
          if (rear) {
            rear.style.display = 'block';
            rear.style.position = 'relative';
            rear.style.transform = 'none';
            rear.style.visibility = 'visible';
            rear.style.top = 'auto';
            rear.style.left = 'auto';
          }
        } else {
          if (rear) rear.style.display = 'none';
          if (face) {
            face.style.display = 'block';
            face.style.position = 'relative';
            face.style.transform = 'none';
            face.style.visibility = 'visible';
          }
        }
      };

      if (targetSide === 'both') {
        // 1. Capturar cara Frontal
        prepareSide('front');
        await new Promise(r => setTimeout(r, 50));
        const canvasFront = await html2canvas(rackWrapper, {
          scale: 2,
          backgroundColor: themeBg,
          useCORS: true,
          logging: false
        });

        // 2. Capturar cara Trasera
        prepareSide('rear');
        await new Promise(r => setTimeout(r, 50));
        const canvasRear = await html2canvas(rackWrapper, {
          scale: 2,
          backgroundColor: themeBg,
          useCORS: true,
          logging: false
        });

        // 3. Componer ambas caras en un único canvas horizontal
        const pad = 24 * 2;
        const gap = 36 * 2;
        const totalW = canvasFront.width + canvasRear.width + gap + pad * 2;
        const totalH = Math.max(canvasFront.height, canvasRear.height) + pad * 2;

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = totalW;
        combinedCanvas.height = totalH;
        const ctx = combinedCanvas.getContext('2d');

        ctx.fillStyle = themeBg;
        ctx.fillRect(0, 0, totalW, totalH);

        ctx.drawImage(canvasFront, pad, pad);
        ctx.drawImage(canvasRear, pad + canvasFront.width + gap, pad);

        const url = combinedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${rack.name.replace(/\s+/g, '_')}_Ambos_Lados.png`;
        link.href = url;
        link.click();
        notify(`PNG exportado (Alta Fidelidad 1:1): ${rack.name} (Frontal + Trasera)`, 'success');
        return;
      } else {
        prepareSide(targetSide);
        await new Promise(r => setTimeout(r, 50));
        const canvas = await html2canvas(rackWrapper, {
          scale: 2,
          backgroundColor: themeBg,
          useCORS: true,
          logging: false
        });

        const sideSuffix = targetSide === 'rear' ? '_Trasera' : '_Frontal';
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${rack.name.replace(/\s+/g, '_')}${sideSuffix}.png`;
        link.href = url;
        link.click();
        notify(`PNG exportado (Alta Fidelidad 1:1): ${rack.name} (${targetSide === 'rear' ? 'Vista Trasera' : 'Vista Frontal'})`, 'success');
        return;
      }
    } catch (err) {
      console.warn('[html2canvas] Fallback a renderizado 2D procedimental:', err);
    } finally {
      rackWrapper.classList.remove('exporting-capture');
      rackWrapper.style.perspective = prevWrapperStyles.perspective;
      rackWrapper.style.transform = prevWrapperStyles.transform;
      rackWrapper.style.overflow = prevWrapperStyles.overflow;

      if (flipper && prevFlipperStyles) {
        flipper.style.transform = prevFlipperStyles.transform;
        flipper.style.transformStyle = prevFlipperStyles.transformStyle;
        if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = prevFlipperStyles.webkitTransformStyle;
        flipper.style.transition = prevFlipperStyles.transition;
      }

      if (face && prevFaceStyles) {
        face.style.display = prevFaceStyles.display;
        face.style.position = prevFaceStyles.position;
        face.style.transform = prevFaceStyles.transform;
        face.style.visibility = prevFaceStyles.visibility;
      }

      if (rear && prevRearStyles) {
        rear.style.display = prevRearStyles.display;
        rear.style.position = prevRearStyles.position;
        rear.style.transform = prevRearStyles.transform;
        rear.style.visibility = prevRearStyles.visibility;
        rear.style.top = prevRearStyles.top;
        rear.style.left = prevRearStyles.left;
        rear.style.right = prevRearStyles.right;
        rear.style.bottom = prevRearStyles.bottom;
      }

      if (phys) {
        phys.style.zoom = prevPhysZoom;
        phys.style.transform = prevPhysTransform;
      }
    }
  }

  // Fallback procedural en Canvas 2D
  _fallbackExportRackToPNG(rack, side);
}

function _fallbackExportRackToPNG(rack, side) {
  const devices = store.allDevicesInRack(rack.id);
  const frontDevices = devices.filter(d => d.mountSide !== 'rear');
  const rearDevices  = devices.filter(d => d.mountSide === 'rear');
  const hasRear = rearDevices.length > 0;

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const themeBg = getActiveThemeBg();
  const railBg = isLight ? '#e2e8f0' : '#1a2035';
  const textMuted = isLight ? '#64748b' : '#4a5a78';

  const W = 280, UNIT = 24, GAP = 40;
  const H = rack.height * UNIT + 60;
  
  let showFront = true;
  let showRear = false;
  if (side === 'rear') {
    showFront = false;
    showRear = true;
  } else if (side === 'front') {
    showFront = true;
    showRear = false;
  } else {
    showRear = hasRear;
  }

  const totalW = (showFront && showRear) ? (W * 2 + GAP) : W;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = totalW * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = themeBg;
  oc.fillRect(0, 0, totalW, H);

  function drawRack(offsetX, sideDevices, title) {
    oc.save();
    oc.translate(offsetX, 0);

    oc.strokeStyle = rack.color;
    oc.lineWidth = 2;
    oc.strokeRect(1, 1, W-2, H-2);

    if (title) {
      oc.fillStyle = rack.color;
      oc.font = 'bold 12px sans-serif';
      oc.fillText(title, 10, 18);
    }
    oc.fillStyle = textMuted;
    oc.font = '9px monospace';
    oc.fillText(`${rack.height}U · ${sideDevices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

    oc.fillStyle = railBg;
    oc.fillRect(0, 40, 18, rack.height * UNIT);
    oc.fillRect(W-18, 40, 18, rack.height * UNIT);

    for (let u = 1; u <= rack.height; u++) {
      const y = 40 + (rack.height - u) * UNIT;
      oc.fillStyle = u % 5 === 0 ? (isLight ? '#94a3b8' : '#3d5480') : (isLight ? '#cbd5e1' : '#1e2d44');
      oc.font = '7px monospace';
      oc.textAlign = 'center';
      oc.fillText(u, 9, y + UNIT/2 + 3);
      oc.fillText(u, W-9, y + UNIT/2 + 3);
      oc.strokeStyle = isLight ? '#e2e8f0' : '#0d1220';
      oc.lineWidth = 0.5;
      oc.beginPath(); oc.moveTo(18, y); oc.lineTo(W-18, y); oc.stroke();
    }

    const typeColors = TYPE_COLORS;
    for (let u = 1; u <= rack.height; u++) {
      const dev = sideDevices.find(d => d.slotStart === u);
      if (!dev) continue;
      const h = dev.size * UNIT;
      const y = 40 + (rack.height - (u + dev.size - 1)) * UNIT;
      const col = typeColors[dev.type] || '#888';

      oc.fillStyle = col + '22';
      oc.fillRect(18, y, W-36, h);
      oc.strokeStyle = col;
      oc.lineWidth = 1;
      oc.strokeRect(18, y, W-36, h);

      oc.fillStyle = col;
      oc.font = `bold ${Math.min(10, h-4)}px sans-serif`;
      oc.textAlign = 'left';
      oc.fillText(dev.name.slice(0,22), 24, y + h/2 - 2);
      if (h > 24) {
        oc.fillStyle = isLight ? '#334155' : '#8b9ab8';
        oc.font = '8px monospace';
        oc.fillText(dev.ip || 'NO IP', 24, y + h/2 + 10);
      }
      oc.beginPath();
      oc.arc(W-26, y + h/2, 4, 0, Math.PI*2);
      oc.fillStyle = '#00ff88';
      oc.fill();
    }
    oc.restore();
  }

  if (showFront && showRear) {
    drawRack(0, frontDevices, rack.name + ' (Frontal)');
    drawRack(W + GAP, rearDevices, 'Vista Trasera');
  } else if (showRear) {
    drawRack(0, rearDevices, rack.name + ' (Vista Trasera)');
  } else {
    drawRack(0, frontDevices, rack.name);
  }

  const sideSuffix = side === 'rear' ? '_Trasera' : (side === 'both' ? '_Ambos_Lados' : (side === 'front' && hasRear ? '_Frontal' : ''));
  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${rack.name.replace(/\s+/g,'_')}${sideSuffix}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: ${rack.name}${side === 'both' ? ' (Ambos Lados)' : (side === 'rear' ? ' (Trasera)' : '')}`, 'success');
}

// Función para dibujar iconos vectoriales de equipos de piso en Canvas 2D
function drawFloorIconCanvas(oc, type, color, cx, cy, size = 34) {
  oc.save();
  const x = cx;
  const y = cy;
  const r = 6;
  
  // Caja con esquinas redondeadas y fondo suave
  oc.beginPath();
  oc.moveTo(x + r, y);
  oc.lineTo(x + size - r, y);
  oc.arcTo(x + size, y, x + size, y + r, r);
  oc.lineTo(x + size, y + size - r);
  oc.arcTo(x + size, y + size, x + size - r, y + size, r);
  oc.lineTo(x + r, y + size);
  oc.arcTo(x, y + size, x, y + size - r, r);
  oc.lineTo(x, y + r);
  oc.arcTo(x, y, x + r, y, r);
  oc.closePath();

  oc.fillStyle = color + '1a';
  oc.fill();
  oc.strokeStyle = color + '40';
  oc.lineWidth = 1;
  oc.stroke();

  // Trazado del icono
  oc.strokeStyle = color;
  oc.fillStyle = color;
  oc.lineWidth = 1.8;
  oc.lineCap = 'round';
  oc.lineJoin = 'round';

  const midX = x + size / 2;
  const midY = y + size / 2;

  switch (type) {
    case 'camera': {
      oc.beginPath();
      oc.strokeRect(midX - 9, midY - 6, 18, 12);
      oc.beginPath();
      oc.arc(midX, midY, 3.5, 0, Math.PI * 2);
      oc.stroke();
      oc.beginPath();
      oc.arc(midX + 5, midY - 3, 1, 0, Math.PI * 2);
      oc.fill();
      break;
    }
    case 'printer': {
      oc.beginPath();
      oc.strokeRect(midX - 5, midY - 8, 10, 4);
      oc.beginPath();
      oc.strokeRect(midX - 8, midY - 4, 16, 8);
      oc.beginPath();
      oc.moveTo(midX - 5, midY + 4);
      oc.lineTo(midX - 5, midY + 8);
      oc.lineTo(midX + 5, midY + 8);
      oc.lineTo(midX + 5, midY + 4);
      oc.stroke();
      break;
    }
    case 'phone': {
      oc.beginPath();
      oc.moveTo(midX - 6, midY - 5);
      oc.lineTo(midX - 2, midY - 5);
      oc.lineTo(midX - 1, midY - 2);
      oc.lineTo(midX - 3, midY);
      oc.quadraticCurveTo(midX, midY + 3, midX + 3, midY);
      oc.lineTo(midX + 5, midY - 2);
      oc.lineTo(midX + 6, midY + 1);
      oc.quadraticCurveTo(midX + 2, midY + 7, midX - 5, midY);
      oc.closePath();
      oc.stroke();
      break;
    }
    case 'ap': {
      oc.beginPath();
      oc.moveTo(midX, midY + 7);
      oc.lineTo(midX, midY - 1);
      oc.stroke();
      oc.beginPath();
      oc.moveTo(midX - 4, midY + 2);
      oc.lineTo(midX, midY - 2);
      oc.lineTo(midX + 4, midY + 2);
      oc.stroke();
      oc.beginPath();
      oc.arc(midX, midY - 1, 6, -Math.PI * 0.8, -Math.PI * 0.2);
      oc.stroke();
      break;
    }
    case 'pc': {
      oc.beginPath();
      oc.strokeRect(midX - 8, midY - 8, 16, 11);
      oc.beginPath();
      oc.moveTo(midX, midY + 3);
      oc.lineTo(midX, midY + 7);
      oc.moveTo(midX - 4, midY + 7);
      oc.lineTo(midX + 4, midY + 7);
      oc.stroke();
      break;
    }
    case 'door': {
      oc.beginPath();
      oc.strokeRect(midX - 6, midY - 9, 12, 18);
      oc.beginPath();
      oc.arc(midX + 2, midY, 1.2, 0, Math.PI * 2);
      oc.fill();
      break;
    }
    default: {
      oc.beginPath();
      oc.strokeRect(midX - 7, midY - 7, 14, 14);
      oc.moveTo(midX - 7, midY);
      oc.lineTo(midX + 7, midY);
      oc.stroke();
      break;
    }
  }

  oc.restore();
}

async function exportFloorToPNG(roomId) {
  const floorDevices = store.allFloorDevicesInRoom(roomId);
  const room = store._raw.rooms.find(r => r.id === roomId);
  if (!floorDevices.length) return;

  const phys = document.getElementById('view-physical-content');
  const prevPhysZoom = phys ? phys.style.zoom : '';
  const prevPhysTransform = phys ? phys.style.transform : '';

  // Intento de exportación en Alta Fidelidad 1:1 vía html2canvas (M-37)
  const floorEl = typeof document !== 'undefined' ? document.querySelector('.floor-section') : null;
  if (typeof html2canvas === 'function' && floorEl) {
    const interactiveElements = floorEl.querySelectorAll('#floor-btn-add-device, .device-actions');
    const prevDisplays = [];
    interactiveElements.forEach(el => {
      prevDisplays.push({ el, display: el.style.display });
      el.style.display = 'none';
    });

    try {
      if (phys) {
        phys.style.zoom = '1';
        phys.style.transform = 'none';
      }
      floorEl.classList.add('exporting-capture');
      const themeBg = getActiveThemeBg();
      const canvas = await html2canvas(floorEl, {
        scale: 2,
        backgroundColor: themeBg,
        useCORS: true,
        logging: false
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Equipos_Piso_${room ? room.name.replace(/\s+/g, '_') : 'Sala'}.png`;
      link.href = url;
      link.click();
      notify(`PNG exportado (Alta Fidelidad 1:1): Equipos de Piso`, 'success');
      return;
    } catch (err) {
      console.warn('[html2canvas] Fallback a renderizado 2D procedimental para piso:', err);
    } finally {
      interactiveElements.forEach(({ el, display }) => {
        el.style.display = display;
      });
      if (floorEl) floorEl.classList.remove('exporting-capture');
      if (phys) {
        phys.style.zoom = prevPhysZoom;
        phys.style.transform = prevPhysTransform;
      }
    }
  }

  // Fallback procedural en Canvas 2D
  _fallbackExportFloorToPNG(roomId, floorDevices, room);
}

function _fallbackExportFloorToPNG(roomId, floorDevices, room) {
  const cols = 2;
  const rowHeight = 76;
  const colWidth = 270;
  const padding = 24;
  
  const rows = Math.ceil(floorDevices.length / cols);
  
  const W = cols * colWidth + padding * 2;
  const H = rows * rowHeight + padding * 2 + 50;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = W * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const themeBg = getActiveThemeBg();
  oc.fillStyle = themeBg;
  oc.fillRect(0, 0, W, H);

  oc.fillStyle = '#f59e0b';
  oc.font = 'bold 16px sans-serif';
  oc.fillText(`Equipos de Piso / Periféricos - ${room ? room.name : 'Sala'}`, padding, padding + 15);

  oc.fillStyle = isLight ? '#64748b' : '#4a5a78';
  oc.font = '11px monospace';
  oc.fillText(`${floorDevices.length} dispositivos`, padding, padding + 35);

  const colors = {
    pc:      '#0ea5e9',
    camera:  '#8b5cf6',
    ap:      '#10b981',
    door:    '#f59e0b',
    printer: '#06b6d4',
    phone:   '#ef4444',
  };

  floorDevices.forEach((dev, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = padding + col * colWidth;
    const y = padding + 55 + row * rowHeight;
    const cardW = colWidth - 16;
    const cardH = rowHeight - 16;
    
    const color = colors[dev.type] || '#8b9ab8';
    
    // Fondo de tarjeta con borde
    oc.fillStyle = isLight ? '#f8fafc' : '#0c1420';
    oc.fillRect(x, y, cardW, cardH);
    oc.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
    oc.lineWidth = 1;
    oc.strokeRect(x, y, cardW, cardH);

    // Borde izquierdo de color
    oc.fillStyle = color;
    oc.fillRect(x, y, 4, cardH);

    // Icono vectorial
    const iconSize = 34;
    const iconX = x + 12;
    const iconY = y + (cardH - iconSize) / 2;
    drawFloorIconCanvas(oc, dev.type, color, iconX, iconY, iconSize);

    // Textos informativos
    const textX = iconX + iconSize + 12;
    oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
    oc.font = 'bold 12px sans-serif';
    oc.textAlign = 'left';
    oc.fillText(dev.name.slice(0, 22), textX, y + 20);

    oc.fillStyle = isLight ? '#64748b' : '#8b9ab8';
    oc.font = '10px monospace';
    oc.fillText(String(dev.type || 'unknown').toUpperCase(), textX, y + 35);
    
    if (dev.ip) {
      oc.fillText(`IP: ${dev.ip}`, textX, y + 48);
    }
  });

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Equipos_Piso_${room ? room.name.replace(/\s+/g,'_') : 'Sala'}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: Equipos de Piso (${floorDevices.length})`, 'success');
}

async function exportRoomToPNG(roomId, mode = 'current') {
  const room = store._raw.rooms.find(r => r.id === roomId) || store.currentRoom;
  if (!room) return;

  const racks = (typeof store.allRacksInRoom === 'function')
    ? store.allRacksInRoom(room.id)
    : (store._raw.racks || []).filter(r => r.roomId === room.id);
  const floorDevices = (typeof store.allFloorDevicesInRoom === 'function')
    ? store.allFloorDevicesInRoom(room.id)
    : (store._raw.devices || []).filter(d => d.category === 'floor' && d.roomId === room.id);
  if (!racks.length && !floorDevices.length) {
    notify('No hay elementos en esta sala para exportar', 'warn');
    return;
  }

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const themeBg = getActiveThemeBg();
  const phys = document.getElementById('view-physical-content');

  // --- MODO DUAL: Frente + Dorso por Gabinete en Recuadro Modular ---
  if (mode === 'dual') {
    if (typeof html2canvas === 'function' && phys) {
      const prevPhysZoom = phys.style.zoom;
      const prevPhysTransform = phys.style.transform;

      // Ocultar botones interactivos de la sala
      const interactiveElements = phys.querySelectorAll(
        '#canvas-btn-add-rack, #floor-btn-add-device, .device-actions, .btn-flip-rack, [data-rack-menu-toggle], .dropdown-menu, .rack-menu'
      );
      const hiddenElementsMap = [];
      interactiveElements.forEach(el => {
        hiddenElementsMap.push({ el, display: el.style.display });
        el.style.display = 'none';
      });

      const cablesSvg = document.getElementById('physical-cables-svg');
      let prevCablesDisplay = '';
      if (cablesSvg) {
        prevCablesDisplay = cablesSvg.style.display;
        cablesSvg.style.display = 'none';
      }

      try {
        phys.classList.add('exporting-capture');
        phys.style.zoom = '1';
        phys.style.transform = 'none';

        const renderedModules = [];

        for (const rack of racks) {
          const rackWrapper = phys.querySelector(`.rack-wrapper[data-rack-id="${rack.id}"]`);
          if (!rackWrapper) continue;

          const flipper = rackWrapper.querySelector('.rack-flipper');
          const face = flipper ? flipper.querySelector('.rack-face') : null;
          const rear = flipper ? flipper.querySelector('.rack-rear') : null;

          const prevWrapperStyles = {
            perspective: rackWrapper.style.perspective,
            transform: rackWrapper.style.transform,
            overflow: rackWrapper.style.overflow
          };
          const prevFlipperStyles = flipper ? {
            transform: flipper.style.transform,
            transformStyle: flipper.style.transformStyle,
            webkitTransformStyle: flipper.style.webkitTransformStyle,
            transition: flipper.style.transition
          } : null;
          const prevFaceStyles = face ? {
            display: face.style.display,
            position: face.style.position,
            transform: face.style.transform,
            visibility: face.style.visibility
          } : null;
          const prevRearStyles = rear ? {
            display: rear.style.display,
            position: rear.style.position,
            transform: rear.style.transform,
            visibility: rear.style.visibility,
            top: rear.style.top,
            left: rear.style.left,
            right: rear.style.right,
            bottom: rear.style.bottom
          } : null;

          rackWrapper.classList.add('exporting-capture');
          rackWrapper.style.perspective = 'none';
          if (flipper) {
            flipper.style.transform = 'none';
            flipper.style.transformStyle = 'flat';
            if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = 'flat';
            flipper.style.transition = 'none';
          }

          const prepareSide = (s) => {
            if (s === 'rear') {
              if (face) face.style.display = 'none';
              if (rear) {
                rear.style.display = 'block';
                rear.style.position = 'relative';
                rear.style.transform = 'none';
                rear.style.visibility = 'visible';
                rear.style.top = 'auto';
                rear.style.left = 'auto';
              }
            } else {
              if (rear) rear.style.display = 'none';
              if (face) {
                face.style.display = 'block';
                face.style.position = 'relative';
                face.style.transform = 'none';
                face.style.visibility = 'visible';
              }
            }
          };

          // 1. Capturar Cara Frontal
          prepareSide('front');
          await new Promise(r => setTimeout(r, 40));
          const canvasFront = await html2canvas(rackWrapper, {
            scale: 2,
            backgroundColor: themeBg,
            useCORS: true,
            logging: false
          });

          // 2. Capturar Cara Trasera
          prepareSide('rear');
          await new Promise(r => setTimeout(r, 40));
          const canvasRear = await html2canvas(rackWrapper, {
            scale: 2,
            backgroundColor: themeBg,
            useCORS: true,
            logging: false
          });

          // Restaurar estilos de este rack
          rackWrapper.classList.remove('exporting-capture');
          rackWrapper.style.perspective = prevWrapperStyles.perspective;
          rackWrapper.style.transform = prevWrapperStyles.transform;
          rackWrapper.style.overflow = prevWrapperStyles.overflow;
          if (flipper && prevFlipperStyles) {
            flipper.style.transform = prevFlipperStyles.transform;
            flipper.style.transformStyle = prevFlipperStyles.transformStyle;
            if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = prevFlipperStyles.webkitTransformStyle;
            flipper.style.transition = prevFlipperStyles.transition;
          }
          if (face && prevFaceStyles) {
            face.style.display = prevFaceStyles.display;
            face.style.position = prevFaceStyles.position;
            face.style.transform = prevFaceStyles.transform;
            face.style.visibility = prevFaceStyles.visibility;
          }
          if (rear && prevRearStyles) {
            rear.style.display = prevRearStyles.display;
            rear.style.position = prevRearStyles.position;
            rear.style.transform = prevRearStyles.transform;
            rear.style.visibility = prevRearStyles.visibility;
            rear.style.top = prevRearStyles.top;
            rear.style.left = prevRearStyles.left;
            rear.style.right = prevRearStyles.right;
            rear.style.bottom = prevRearStyles.bottom;
          }

          // 3. Crear Módulo Modular del Rack
          const rackDevs = store.allDevicesInRack(rack.id);
          const usedU = rackDevs.reduce((sum, d) => sum + (d.size || 1), 0);
          const rackWatts = rackDevs.reduce((sum, d) => sum + (d.power || 0), 0);
          const rColor = rack.color || '#3b82f6';

          const pad = 20 * 2;
          const colGap = 24 * 2;
          const headH = 58 * 2;
          const subHeadH = 28 * 2;
          const contentH = Math.max(canvasFront.height, canvasRear.height);

          const modW = canvasFront.width + canvasRear.width + colGap + pad * 2;
          const modH = headH + subHeadH + contentH + pad;

          const modCanvas = document.createElement('canvas');
          modCanvas.width = modW;
          modCanvas.height = modH;
          const mctx = modCanvas.getContext('2d');

          // Fondo modular redondeado
          const modBg = isLight ? '#ffffff' : '#0c1420';
          const modBorder = isLight ? '#e2e8f0' : '#1e293b';

          mctx.fillStyle = modBg;
          mctx.beginPath();
          if (mctx.roundRect) mctx.roundRect(0, 0, modW, modH, 16);
          else mctx.rect(0, 0, modW, modH);
          mctx.fill();

          mctx.strokeStyle = rColor;
          mctx.lineWidth = 3;
          mctx.beginPath();
          if (mctx.roundRect) mctx.roundRect(1.5, 1.5, modW - 3, modH - 3, 16);
          else mctx.strokeRect(1.5, 1.5, modW - 3, modH - 3);
          mctx.stroke();

          // Franja superior de color
          mctx.fillStyle = rColor;
          mctx.fillRect(0, 0, modW, 8);

          // Título de cabecera
          mctx.fillStyle = rColor;
          mctx.font = 'bold 24px sans-serif';
          mctx.textAlign = 'left';
          mctx.fillText(`GABINETE: ${rack.name.toUpperCase()}`, pad, 48);

          mctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
          mctx.font = '16px monospace';
          mctx.fillText(`${rack.height}U · ${usedU}U USADAS · ${rackWatts}W`, pad, 78);

          // Badge "VISTA DUAL (F+T)"
          const badgeText = 'VISTA DUAL (F+T)';
          mctx.font = 'bold 14px monospace';
          const badgeW = mctx.measureText(badgeText).width + 24;
          const badgeH = 28;
          const badgeX = modW - pad - badgeW;
          const badgeY = 32;

          mctx.fillStyle = isLight ? '#f1f5f9' : '#1a2438';
          mctx.beginPath();
          if (mctx.roundRect) mctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
          else mctx.rect(badgeX, badgeY, badgeW, badgeH);
          mctx.fill();
          mctx.strokeStyle = rColor;
          mctx.lineWidth = 1.5;
          mctx.stroke();

          mctx.fillStyle = rColor;
          mctx.textAlign = 'center';
          mctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 19);

          // Línea divisoria bajo cabecera
          mctx.strokeStyle = modBorder;
          mctx.lineWidth = 1.5;
          mctx.beginPath();
          mctx.moveTo(pad, headH - 12);
          mctx.lineTo(modW - pad, headH - 12);
          mctx.stroke();

          // Subcabeceras de columna (Frontal / Trasera)
          const col1CenterX = pad + canvasFront.width / 2;
          const col2CenterX = pad + canvasFront.width + colGap + canvasRear.width / 2;

          mctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
          mctx.font = 'bold 18px sans-serif';
          mctx.textAlign = 'center';
          mctx.fillText('VISTA FRONTAL', col1CenterX, headH + 16);
          mctx.fillText('VISTA TRASERA', col2CenterX, headH + 16);

          // Dibujar caras
          mctx.drawImage(canvasFront, pad, headH + subHeadH);
          mctx.drawImage(canvasRear, pad + canvasFront.width + colGap, headH + subHeadH);

          renderedModules.push({ rack, canvas: modCanvas, width: modW, height: modH });
        }

        // Restaurar elementos globales ocultos
        hiddenElementsMap.forEach(({ el, display }) => { el.style.display = display; });
        if (cablesSvg) cablesSvg.style.display = prevCablesDisplay;
        phys.classList.remove('exporting-capture');
        phys.style.zoom = prevPhysZoom;
        phys.style.transform = prevPhysTransform;

        if (!renderedModules.length) {
          throw new Error('No se pudieron renderizar los módulos de rack');
        }

        // 4. Renderizar Equipos de Piso (si existen)
        let floorCanvas = null;
        if (floorDevices.length > 0) {
          const fcols = Math.min(4, Math.max(2, renderedModules.length * 2));
          const fcolW = 280 * 2;
          const frowH = 75 * 2;
          const frows = Math.ceil(floorDevices.length / fcols);
          const fpad = 24 * 2;

          const ftotalW = fpad * 2 + fcols * fcolW;
          const ftotalH = fpad * 2 + 50 * 2 + frows * frowH;

          floorCanvas = document.createElement('canvas');
          floorCanvas.width = ftotalW;
          floorCanvas.height = ftotalH;
          const fctx = floorCanvas.getContext('2d');

          fctx.fillStyle = isLight ? '#ffffff' : '#0c1420';
          fctx.beginPath();
          if (fctx.roundRect) fctx.roundRect(0, 0, ftotalW, ftotalH, 16);
          else fctx.rect(0, 0, ftotalW, ftotalH);
          fctx.fill();
          fctx.strokeStyle = '#f59e0b';
          fctx.lineWidth = 2.5;
          fctx.stroke();

          fctx.fillStyle = '#f59e0b';
          fctx.fillRect(0, 0, ftotalW, 8);

          fctx.fillStyle = '#f59e0b';
          fctx.font = 'bold 24px sans-serif';
          fctx.textAlign = 'left';
          fctx.fillText('EQUIPOS DE PISO / PERIFÉRICOS', fpad, 48);

          fctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
          fctx.font = '16px monospace';
          fctx.fillText(`${floorDevices.length} dispositivos en sala`, fpad, 76);

          const floorColors = { pc: '#0ea5e9', camera: '#8b5cf6', ap: '#10b981', door: '#f59e0b', printer: '#06b6d4', phone: '#ef4444' };
          floorDevices.forEach((dev, idx) => {
            const col = idx % fcols;
            const row = Math.floor(idx / fcols);
            const x = fpad + col * fcolW;
            const y = fpad + 50 * 2 + row * frowH;
            const cardW = fcolW - 16 * 2;
            const cardH = frowH - 12 * 2;
            const dColor = floorColors[dev.type] || '#8b9ab8';

            fctx.fillStyle = isLight ? '#f8fafc' : '#111b2b';
            fctx.fillRect(x, y, cardW, cardH);
            fctx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
            fctx.lineWidth = 1.5;
            fctx.strokeRect(x, y, cardW, cardH);

            fctx.fillStyle = dColor;
            fctx.fillRect(x, y, 6, cardH);

            const iconSize = 44;
            const iconX = x + 18;
            const iconY = y + (cardH - iconSize) / 2;
            drawFloorIconCanvas(fctx, dev.type, dColor, iconX, iconY, iconSize);

            const textX = iconX + iconSize + 16;
            fctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
            fctx.font = 'bold 18px sans-serif';
            fctx.textAlign = 'left';
            fctx.fillText(dev.name.slice(0, 24), textX, y + 28);

            fctx.fillStyle = isLight ? '#64748b' : '#8b9ab8';
            fctx.font = '14px monospace';
            fctx.fillText(String(dev.type || 'unknown').toUpperCase(), textX, y + 50);

            if (dev.ip) {
              fctx.fillText(`IP: ${dev.ip}`, textX, y + 70);
            }
          });
        }

        // 5. Ensamblado Panorámico de la Sala
        const margin = 36 * 2;
        const modGap = 40 * 2;
        const totalModulesW = renderedModules.reduce((s, m) => s + m.width, 0) + (renderedModules.length - 1) * modGap;
        const maxModH = Math.max(...renderedModules.map(m => m.height));

        const canvasTotalW = Math.max(totalModulesW + margin * 2, floorCanvas ? floorCanvas.width + margin * 2 : 0, 1400);
        const roomHeadH = 100 * 2;
        const floorSectionH = floorCanvas ? floorCanvas.height + 36 * 2 : 0;
        const canvasTotalH = margin + roomHeadH + maxModH + floorSectionH + margin;

        const mainCanvas = document.createElement('canvas');
        mainCanvas.width = canvasTotalW;
        mainCanvas.height = canvasTotalH;
        const ctx = mainCanvas.getContext('2d');

        ctx.fillStyle = themeBg;
        ctx.fillRect(0, 0, canvasTotalW, canvasTotalH);

        // Cabecera General
        const totalRacks = racks.length;
        const totalFloor = floorDevices.length;
        const allDevsInRoom = store._raw.devices.filter(d => d.roomId === room.id);
        const totalUsedU = allDevsInRoom.filter(d => d.category !== 'floor').reduce((s, d) => s + (d.size || 1), 0);
        const totalPowerW = allDevsInRoom.reduce((s, d) => s + (d.power || 0), 0);

        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SALA: ${(room.name || 'Datacenter').toUpperCase()}`, margin, margin + 44);

        ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
        ctx.font = '20px monospace';
        ctx.fillText(
          `${totalRacks} GABINETES (VISTA DUAL) · ${totalFloor} EQUIPOS DE PISO · ${totalUsedU}U OCUPADAS · ${(totalPowerW/1000).toFixed(2)} kW`,
          margin,
          margin + 84
        );

        // Badge General
        const mainBadgeText = 'VISTA DUAL PANORÁMICA';
        ctx.font = 'bold 16px monospace';
        const mbW = ctx.measureText(mainBadgeText).width + 28;
        const mbH = 34;
        const mbX = canvasTotalW - margin - mbW;
        const mbY = margin + 26;

        ctx.fillStyle = isLight ? '#e0f2fe' : '#0369a1';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mbX, mbY, mbW, mbH, 8);
        else ctx.rect(mbX, mbY, mbW, mbH);
        ctx.fill();
        ctx.fillStyle = isLight ? '#0284c7' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(mainBadgeText, mbX + mbW / 2, mbY + 23);

        // Línea divisoria
        ctx.strokeStyle = isLight ? '#cbd5e1' : '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin + roomHeadH - 16);
        ctx.lineTo(canvasTotalW - margin, margin + roomHeadH - 16);
        ctx.stroke();

        // Módulos horizontalmente
        let currentX = margin;
        const startRacksY = margin + roomHeadH;
        renderedModules.forEach(mod => {
          ctx.drawImage(mod.canvas, currentX, startRacksY);
          currentX += mod.width + modGap;
        });

        // Equipos de piso
        if (floorCanvas) {
          const floorY = startRacksY + maxModH + 36 * 2;
          ctx.drawImage(floorCanvas, margin, floorY);
        }

        const url = mainCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Sala_${(room.name || 'Datacenter').replace(/\s+/g, '_')}_Dual_Frente_Dorso.png`;
        link.href = url;
        link.click();
        notify(`PNG exportado (Vista Dual Sala): Sala ${room.name}`, 'success');
        return;

      } catch (err) {
        console.error('[html2canvas] Fallo en captura dual de sala:', err);
        notify(`Aviso: Error en captura dual 1:1 (${err.message || err}). Usando renderizado alternativo.`, 'warn');
      } finally {
        hiddenElementsMap.forEach(({ el, display }) => { el.style.display = display; });
        if (cablesSvg) cablesSvg.style.display = prevCablesDisplay;
        if (phys) {
          phys.classList.remove('exporting-capture');
          phys.style.zoom = prevPhysZoom;
          phys.style.transform = prevPhysTransform;
        }
      }
    }

    // Fallback procedural en Canvas 2D para modo dual
    _fallbackExportRoomToPNG(room, racks, floorDevices, 'dual');
    return;
  }

  // --- MODO CURRENT: Vista Actual 1:1 ---
  if (typeof html2canvas === 'function' && phys) {
    const prevPhysZoom = phys.style.zoom;
    const prevPhysTransform = phys.style.transform;
    const prevPhysPadding = phys.style.padding;
    const prevPhysWidth = phys.style.width;
    const prevPhysMaxWidth = phys.style.maxWidth;
    const prevPhysMinWidth = phys.style.minWidth;
    const prevPhysBoxSizing = phys.style.boxSizing;
    const prevPhysOverflow = phys.style.overflow;

    const floorSec = phys.querySelector('.floor-section');
    const hasFloorDevs = floorDevices && floorDevices.length > 0;
    let prevFloorDisplay = '';
    if (floorSec && !hasFloorDevs) {
      prevFloorDisplay = floorSec.style.display;
      floorSec.style.display = 'none';
    }

    // Aplanar transformaciones 3D de cada rack individual en la sala
    const preservedRacks = [];
    phys.querySelectorAll('.rack-wrapper').forEach(rw => {
      if (rw.id === 'canvas-btn-add-rack') return;
      const flipper = rw.querySelector('.rack-flipper');
      const face = flipper ? flipper.querySelector('.rack-face') : null;
      const rear = flipper ? flipper.querySelector('.rack-rear') : null;
      const isCurrentlyFlipped = flipper ? flipper.classList.contains('flipped') : false;

      preservedRacks.push({
        rw,
        prevWrapperStyles: {
          perspective: rw.style.perspective,
          transform: rw.style.transform,
          overflow: rw.style.overflow
        },
        flipper,
        prevFlipperStyles: flipper ? {
          transform: flipper.style.transform,
          transformStyle: flipper.style.transformStyle,
          webkitTransformStyle: flipper.style.webkitTransformStyle,
          transition: flipper.style.transition
        } : null,
        face,
        prevFaceStyles: face ? {
          display: face.style.display,
          position: face.style.position,
          transform: face.style.transform,
          visibility: face.style.visibility
        } : null,
        rear,
        prevRearStyles: rear ? {
          display: rear.style.display,
          position: rear.style.position,
          transform: rear.style.transform,
          visibility: rear.style.visibility,
          top: rear.style.top,
          left: rear.style.left,
          right: rear.style.right,
          bottom: rear.style.bottom
        } : null,
        isCurrentlyFlipped
      });
    });

    // Ocultar botones y elementos de interfaz interactivos directamente con display: none
    const interactiveElements = phys.querySelectorAll(
      '#canvas-btn-add-rack, #floor-btn-add-device, .device-actions, .btn-flip-rack, [data-rack-menu-toggle], .dropdown-menu, .rack-menu'
    );
    const hiddenElementsMap = [];
    interactiveElements.forEach(el => {
      hiddenElementsMap.push({ el, display: el.style.display });
      el.style.display = 'none';
    });

    const cablesSvg = document.getElementById('physical-cables-svg');
    let prevCablesDisplay = '';
    const hasCablesDrawn = cablesSvg && cablesSvg.querySelectorAll('path, line').length > 0;
    if (cablesSvg) {
      prevCablesDisplay = cablesSvg.style.display;
      if (!hasCablesDrawn) {
        cablesSvg.style.display = 'none';
      } else {
        const w = phys.scrollWidth || phys.offsetWidth;
        const h = phys.scrollHeight || phys.offsetHeight;
        cablesSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        cablesSvg.setAttribute('width', w);
        cablesSvg.setAttribute('height', h);
        cablesSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
    }

    try {
      phys.classList.add('exporting-capture');
      phys.style.zoom = '1';
      phys.style.transform = 'none';
      phys.style.padding = '32px';
      phys.style.width = 'max-content';
      phys.style.maxWidth = 'none';
      phys.style.minWidth = 'max-content';
      phys.style.boxSizing = 'border-box';
      phys.style.overflow = 'visible';

      preservedRacks.forEach(({ rw, flipper, face, rear, isCurrentlyFlipped }) => {
        rw.classList.add('exporting-capture');
        rw.style.perspective = 'none';

        if (flipper) {
          flipper.style.transform = 'none';
          flipper.style.transformStyle = 'flat';
          if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = 'flat';
          flipper.style.transition = 'none';
        }

        if (isCurrentlyFlipped) {
          if (face) face.style.display = 'none';
          if (rear) {
            rear.style.display = 'block';
            rear.style.position = 'relative';
            rear.style.transform = 'none';
            rear.style.visibility = 'visible';
            rear.style.top = 'auto';
            rear.style.left = 'auto';
          }
        } else {
          if (rear) rear.style.display = 'none';
          if (face) {
            face.style.display = 'block';
            face.style.position = 'relative';
            face.style.transform = 'none';
            face.style.visibility = 'visible';
          }
        }
      });

      // Asegurar redibujado fiel de cables si existen
      if (hasCablesDrawn && typeof drawPhysicalCables === 'function') {
        void phys.offsetHeight;
        drawPhysicalCables();
      }

      await new Promise(resolve => setTimeout(resolve, 80));

      const canvas = await html2canvas(phys, {
        scale: 2,
        backgroundColor: themeBg,
        useCORS: true,
        logging: false
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Sala_${(room.name || 'Datacenter').replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
      notify(`PNG exportado (Alta Fidelidad 1:1): Sala ${room.name}`, 'success');
      return;
    } catch (err) {
      console.error('[html2canvas] Fallo en captura 1:1 de sala:', err);
      notify(`Aviso: Error en captura 1:1 (${err.message || err}). Usando renderizado alternativo.`, 'warn');
    } finally {
      hiddenElementsMap.forEach(({ el, display }) => {
        el.style.display = display;
      });
      if (cablesSvg) {
        cablesSvg.style.display = prevCablesDisplay;
        cablesSvg.removeAttribute('xmlns');
        cablesSvg.removeAttribute('width');
        cablesSvg.removeAttribute('height');
        cablesSvg.removeAttribute('viewBox');
      }

      phys.classList.remove('exporting-capture');
      phys.style.zoom = prevPhysZoom;
      phys.style.transform = prevPhysTransform;
      phys.style.padding = prevPhysPadding;
      phys.style.width = prevPhysWidth;
      phys.style.maxWidth = prevPhysMaxWidth;
      phys.style.minWidth = prevPhysMinWidth;
      phys.style.boxSizing = prevPhysBoxSizing;
      phys.style.overflow = prevPhysOverflow;

      if (floorSec && !hasFloorDevs) {
        floorSec.style.display = prevFloorDisplay;
      }

      preservedRacks.forEach(({ rw, prevWrapperStyles, flipper, prevFlipperStyles, face, prevFaceStyles, rear, prevRearStyles }) => {
        rw.classList.remove('exporting-capture');
        rw.style.perspective = prevWrapperStyles.perspective;
        rw.style.transform = prevWrapperStyles.transform;
        rw.style.overflow = prevWrapperStyles.overflow;

        if (flipper && prevFlipperStyles) {
          flipper.style.transform = prevFlipperStyles.transform;
          flipper.style.transformStyle = prevFlipperStyles.transformStyle;
          if (flipper.style.webkitTransformStyle !== undefined) flipper.style.webkitTransformStyle = prevFlipperStyles.webkitTransformStyle;
          flipper.style.transition = prevFlipperStyles.transition;
        }

        if (face && prevFaceStyles) {
          face.style.display = prevFaceStyles.display;
          face.style.position = prevFaceStyles.position;
          face.style.transform = prevFaceStyles.transform;
          face.style.visibility = prevFaceStyles.visibility;
        }

        if (rear && prevRearStyles) {
          rear.style.display = prevRearStyles.display;
          rear.style.position = prevRearStyles.position;
          rear.style.transform = prevRearStyles.transform;
          rear.style.visibility = prevRearStyles.visibility;
          rear.style.top = prevRearStyles.top;
          rear.style.left = prevRearStyles.left;
          rear.style.right = prevRearStyles.right;
          rear.style.bottom = prevRearStyles.bottom;
        }
      });

      // Restaurar cables con el zoom/pan original
      if (typeof drawPhysicalCables === 'function') {
        drawPhysicalCables();
      }
    }
  }

  // Fallback procedimental en Canvas 2D
  _fallbackExportRoomToPNG(room, racks, floorDevices, 'current');
}

function _fallbackExportRoomToPNG(room, racks, floorDevices, mode = 'current') {
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const themeBg = getActiveThemeBg();
  const railBg = isLight ? '#e2e8f0' : '#1a2035';
  const textMuted = isLight ? '#64748b' : '#4a5a78';

  const W = 280, UNIT = 24;

  function render2DRackColumn(oc, rack, startX, startY, sideDevices) {
    const H = rack.height * UNIT + 60;
    oc.save();
    oc.translate(startX, startY);

    oc.strokeStyle = rack.color;
    oc.lineWidth = 2;
    oc.strokeRect(1, 1, W - 2, H - 2);

    oc.fillStyle = railBg;
    oc.fillRect(0, 40, 18, rack.height * UNIT);
    oc.fillRect(W - 18, 40, 18, rack.height * UNIT);

    for (let u = 1; u <= rack.height; u++) {
      const y = 40 + (rack.height - u) * UNIT;
      oc.fillStyle = u % 5 === 0 ? (isLight ? '#94a3b8' : '#3d5480') : (isLight ? '#cbd5e1' : '#1e2d44');
      oc.font = '7px monospace';
      oc.textAlign = 'center';
      oc.fillText(u, 9, y + UNIT / 2 + 3);
      oc.fillText(u, W - 9, y + UNIT / 2 + 3);
      oc.strokeStyle = isLight ? '#e2e8f0' : '#0d1220';
      oc.lineWidth = 0.5;
      oc.beginPath(); oc.moveTo(18, y); oc.lineTo(W - 18, y); oc.stroke();
    }

    const typeColors = TYPE_COLORS;
    for (let u = 1; u <= rack.height; u++) {
      const dev = sideDevices.find(d => d.slotStart === u);
      if (!dev) continue;
      const h = dev.size * UNIT;
      const y = 40 + (rack.height - (u + dev.size - 1)) * UNIT;
      const col = typeColors[dev.type] || '#888';

      oc.fillStyle = col + '22';
      oc.fillRect(18, y, W - 36, h);
      oc.strokeStyle = col;
      oc.lineWidth = 1;
      oc.strokeRect(18, y, W - 36, h);

      oc.fillStyle = col;
      oc.font = `bold ${Math.min(10, h - 4)}px sans-serif`;
      oc.textAlign = 'left';
      oc.fillText(dev.name.slice(0, 22), 24, y + h / 2 - 2);
      if (h > 24) {
        oc.fillStyle = isLight ? '#334155' : '#8b9ab8';
        oc.font = '8px monospace';
        oc.fillText(dev.ip || 'NO IP', 24, y + h / 2 + 10);
      }
      oc.beginPath();
      oc.arc(W - 26, y + h / 2, 4, 0, Math.PI * 2);
      oc.fillStyle = '#00ff88';
      oc.fill();
    }

    oc.restore();
  }

  if (mode === 'dual') {
    // --- FALLBACK 2D MODO DUAL MODULAR ---
    const modPad = 16;
    const colGap = 20;
    const modW = W * 2 + colGap + modPad * 2;
    const headH = 50;
    const subHeadH = 22;
    const maxRackH = racks.length ? Math.max(...racks.map(r => r.height * UNIT + 60)) : 300;
    const modH = headH + subHeadH + maxRackH + modPad;
    const modGap = 36;

    const racksRowW = racks.length ? (racks.length * modW + (racks.length - 1) * modGap) : 0;
    const floorCols = Math.min(4, Math.max(2, racks.length * 2));
    const floorColW = 240;
    const floorRowH = 70;
    const floorRows = Math.ceil((floorDevices || []).length / floorCols);
    const floorW = floorRows > 0 ? (floorCols * floorColW) : 0;

    const contentW = Math.max(racksRowW, floorW, 600);
    const totalW = contentW + 60;
    const totalH = 80 + (racks.length ? modH + 40 : 0) + (floorRows > 0 ? floorRows * floorRowH + 70 : 0) + 40;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = totalW * 2;
    offCanvas.height = totalH * 2;
    const oc = offCanvas.getContext('2d');
    oc.scale(2, 2);

    oc.fillStyle = themeBg;
    oc.fillRect(0, 0, totalW, totalH);

    // Cabecera General
    oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
    oc.font = 'bold 18px sans-serif';
    oc.fillText(`Sala: ${room.name} (Vista Dual Frontal + Trasera)`, 30, 35);

    oc.fillStyle = textMuted;
    oc.font = '11px monospace';
    oc.fillText(`${racks.length} gabinetes modulares · ${floorDevices.length} equipos de piso`, 30, 54);

    let currentX = 30;
    const startY = 80;

    racks.forEach(rack => {
      const devices = store.allDevicesInRack(rack.id);
      const frontDevices = devices.filter(d => d.mountSide !== 'rear');
      const rearDevices = devices.filter(d => d.mountSide === 'rear' || d.mountSide === 'both');
      const usedU = devices.reduce((s, d) => s + (d.size || 1), 0);
      const rackWatts = devices.reduce((s, d) => s + (d.power || 0), 0);
      const rColor = rack.color || '#3b82f6';

      // Recuadro modular
      oc.fillStyle = isLight ? '#ffffff' : '#0c1420';
      oc.fillRect(currentX, startY, modW, modH);
      oc.strokeStyle = rColor;
      oc.lineWidth = 2;
      oc.strokeRect(currentX, startY, modW, modH);

      // Franja superior
      oc.fillStyle = rColor;
      oc.fillRect(currentX, startY, modW, 4);

      // Título y ocupación
      oc.fillStyle = rColor;
      oc.font = 'bold 13px sans-serif';
      oc.fillText(`GABINETE: ${rack.name.toUpperCase()}`, currentX + modPad, startY + 22);

      oc.fillStyle = textMuted;
      oc.font = '9px monospace';
      oc.fillText(`${rack.height}U · ${usedU}U USADAS · ${rackWatts}W`, currentX + modPad, startY + 38);

      // Badge VISTA DUAL
      oc.fillStyle = isLight ? '#f1f5f9' : '#1e293b';
      oc.fillRect(currentX + modW - modPad - 110, startY + 12, 110, 22);
      oc.strokeStyle = rColor;
      oc.strokeRect(currentX + modW - modPad - 110, startY + 12, 110, 22);
      oc.fillStyle = rColor;
      oc.font = 'bold 9px monospace';
      oc.textAlign = 'center';
      oc.fillText('VISTA DUAL (F+T)', currentX + modW - modPad - 55, startY + 26);
      oc.textAlign = 'left';

      // Subcabeceras
      oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      oc.font = 'bold 10px sans-serif';
      oc.textAlign = 'center';
      oc.fillText('VISTA FRONTAL', currentX + modPad + W / 2, startY + headH + 12);
      oc.fillText('VISTA TRASERA', currentX + modPad + W + colGap + W / 2, startY + headH + 12);
      oc.textAlign = 'left';

      // Columnas
      render2DRackColumn(oc, rack, currentX + modPad, startY + headH + subHeadH, frontDevices);
      render2DRackColumn(oc, rack, currentX + modPad + W + colGap, startY + headH + subHeadH, rearDevices);

      currentX += modW + modGap;
    });

    // Equipos de piso
    if (floorDevices && floorDevices.length > 0) {
      const floorStartY = startY + modH + 30;
      oc.fillStyle = '#f59e0b';
      oc.font = 'bold 14px sans-serif';
      oc.fillText('Equipos de Piso / Periféricos', 30, floorStartY);

      const colors = { pc: '#0ea5e9', camera: '#8b5cf6', ap: '#10b981', door: '#f59e0b', printer: '#06b6d4', phone: '#ef4444' };
      floorDevices.forEach((dev, index) => {
        const col = index % floorCols;
        const row = Math.floor(index / floorCols);
        const x = 30 + col * floorColW;
        const y = floorStartY + 15 + row * floorRowH;
        const color = colors[dev.type] || '#8b9ab8';
        const cardW = floorColW - 15;
        const cardH = floorRowH - 15;

        oc.fillStyle = isLight ? '#f8fafc' : '#0c1420';
        oc.fillRect(x, y, cardW, cardH);
        oc.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
        oc.lineWidth = 1;
        oc.strokeRect(x, y, cardW, cardH);

        oc.fillStyle = color;
        oc.fillRect(x, y, 4, cardH);

        const iconSize = 30;
        const iconX = x + 8;
        const iconY = y + (cardH - iconSize) / 2;
        drawFloorIconCanvas(oc, dev.type, color, iconX, iconY, iconSize);

        const textX = iconX + iconSize + 10;
        oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        oc.font = 'bold 11px sans-serif';
        oc.textAlign = 'left';
        oc.fillText(dev.name.slice(0, 20), textX, y + 18);

        oc.fillStyle = isLight ? '#64748b' : '#8b9ab8';
        oc.font = '9px monospace';
        oc.fillText(String(dev.type || 'unknown').toUpperCase(), textX, y + 32);

        if (dev.ip) {
          oc.fillText(`IP: ${dev.ip}`, textX, y + 44);
        }
      });
    }

    const url = offCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Sala_${(room.name || 'Datacenter').replace(/\s+/g, '_')}_Dual_Frente_Dorso.png`;
    link.href = url;
    link.click();
    notify(`PNG exportado: Sala ${room.name} (Vista Dual)`, 'success');
    return;
  }

  // --- FALLBACK 2D MODO CURRENT ---
  const GAP = 40;
  const maxRackH = racks.length ? Math.max(...racks.map(r => r.height * UNIT + 60)) : 300;
  const racksRowW = racks.length ? (racks.length * W + (racks.length - 1) * GAP) : 0;
  const floorCols = 2;
  const floorColW = 240;
  const floorRowH = 70;
  const floorRows = Math.ceil((floorDevices || []).length / floorCols);
  const floorW = floorRows > 0 ? (floorCols * floorColW) : 0;

  const contentW = Math.max(racksRowW, floorW, 400);
  const totalW = contentW + 60;
  const totalH = 70 + (racks.length ? maxRackH + 40 : 0) + (floorRows > 0 ? floorRows * floorRowH + 70 : 0) + 40;

  const offCanvas = document.createElement('canvas');
  offCanvas.width = totalW * 2;
  offCanvas.height = totalH * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = themeBg;
  oc.fillRect(0, 0, totalW, totalH);

  oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  oc.font = 'bold 18px sans-serif';
  oc.fillText(`Sala: ${room.name}`, 30, 35);

  oc.fillStyle = textMuted;
  oc.font = '11px monospace';
  oc.fillText(`${racks.length} gabinetes · ${floorDevices.length} equipos de piso`, 30, 52);

  let currentX = 30;
  const startY = 70;
  racks.forEach(rack => {
    const devices = store.allDevicesInRack(rack.id);
    const flipper = typeof document !== 'undefined' ? document.getElementById(`flipper-${rack.id}`) : null;
    const isFlipped = flipper ? flipper.classList.contains('flipped') : false;
    const sideDevices = isFlipped ? devices.filter(d => d.mountSide === 'rear' || d.mountSide === 'both') : devices.filter(d => d.mountSide !== 'rear');

    oc.save();
    oc.translate(currentX, startY);

    oc.fillStyle = rack.color;
    oc.font = 'bold 12px sans-serif';
    oc.fillText(rack.name + (isFlipped ? ' (Trasera)' : ''), 10, 18);

    oc.fillStyle = textMuted;
    oc.font = '9px monospace';
    oc.fillText(`${rack.height}U · ${sideDevices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

    oc.restore();

    render2DRackColumn(oc, rack, currentX, startY, sideDevices);
    currentX += W + GAP;
  });

  if (floorDevices && floorDevices.length > 0) {
    const floorStartY = startY + (racks.length ? maxRackH + 40 : 0);
    oc.fillStyle = '#f59e0b';
    oc.font = 'bold 14px sans-serif';
    oc.fillText('Equipos de Piso / Periféricos', 30, floorStartY);

    const colors = { pc: '#0ea5e9', camera: '#8b5cf6', ap: '#10b981', door: '#f59e0b', printer: '#06b6d4', phone: '#ef4444' };
    floorDevices.forEach((dev, index) => {
      const col = index % floorCols;
      const row = Math.floor(index / floorCols);
      const x = 30 + col * floorColW;
      const y = floorStartY + 15 + row * floorRowH;
      const color = colors[dev.type] || '#8b9ab8';
      const cardW = floorColW - 15;
      const cardH = floorRowH - 15;

      oc.fillStyle = isLight ? '#f8fafc' : '#0c1420';
      oc.fillRect(x, y, cardW, cardH);
      oc.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
      oc.lineWidth = 1;
      oc.strokeRect(x, y, cardW, cardH);

      oc.fillStyle = color;
      oc.fillRect(x, y, 4, cardH);

      const iconSize = 30;
      const iconX = x + 8;
      const iconY = y + (cardH - iconSize) / 2;
      drawFloorIconCanvas(oc, dev.type, color, iconX, iconY, iconSize);

      const textX = iconX + iconSize + 10;
      oc.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      oc.font = 'bold 11px sans-serif';
      oc.textAlign = 'left';
      oc.fillText(dev.name.slice(0, 20), textX, y + 18);

      oc.fillStyle = isLight ? '#64748b' : '#8b9ab8';
      oc.font = '9px monospace';
      oc.fillText(String(dev.type || 'unknown').toUpperCase(), textX, y + 32);

      if (dev.ip) {
        oc.fillText(`IP: ${dev.ip}`, textX, y + 44);
      }
    });
  }

  const url = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Sala_${(room.name || 'Datacenter').replace(/\s+/g, '_')}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: Sala ${room.name}`, 'success');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function initExportModal() {
  const btnExportCsv = document.getElementById('btn-export-csv');
  if(btnExportCsv) btnExportCsv.addEventListener('click', exportCSV);

  const btnExportJson = document.getElementById('btn-export-json');
  if(btnExportJson) btnExportJson.addEventListener('click', exportJSON);

  const btnImportJson = document.getElementById('btn-import-json');
  if(btnImportJson) btnImportJson.addEventListener('click', () => document.getElementById('file-import').click());

  const fileImport = document.getElementById('file-import');
  if(fileImport) fileImport.addEventListener('change', importJSON);
  
  const btnExportPng = document.getElementById('btn-export-png');
  if(btnExportPng) {
    btnExportPng.addEventListener('click', () => {
      if (typeof currentView !== 'undefined' && currentView === 'topology') {
        if (typeof exportTopologyToPNG === 'function') exportTopologyToPNG();
      } else {
        openPNGModal();
      }
    });
  }
  
  const modalPngCancel = document.getElementById('modal-png-cancel');
  if(modalPngCancel) {
    modalPngCancel.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
    });
  }
}

window.exportRackToPNG = exportRackToPNG;
window.exportFloorToPNG = exportFloorToPNG;
window.exportRoomToPNG = exportRoomToPNG;
window.exportCSV = exportCSV;

