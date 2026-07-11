function openPNGModal() {
  const list = document.getElementById('png-rack-list');
  const racks = store.currentRacks;
  let html = racks.map(r => `
    <button class="btn-secondary" style="width:100%;margin-bottom:8px;justify-content:flex-start" data-export-rack="${escapeHTML(r.id)}">
      📸 Exportar: ${escapeHTML(r.name)} (${r.height}U)
    </button>
  `).join('');

  const floorDevices = store.allFloorDevicesInRoom(store._raw.currentRoomId);
  if (floorDevices.length > 0) {
    html += `
      <div style="margin-top: 16px; margin-bottom: 8px; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 8px;">OTROS EQUIPOS</div>
      <button class="btn-secondary" id="btn-export-floor" style="width:100%; margin-bottom:8px; justify-content:flex-start; border-color: #f59e0b; color: #f59e0b;">
        📸 Exportar Equipos de Piso (${floorDevices.length})
      </button>
    `;
  }
  
  if (!racks.length && !floorDevices.length) {
    html = `<div style="text-align:center;color:var(--text-muted);padding:20px;">No hay gabinetes ni equipos de piso en esta sala para exportar.</div>`;
  }

  list.innerHTML = html;

  list.querySelectorAll('[data-export-rack]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-export-png').classList.add('hidden');
      exportRackToPNG(btn.dataset.exportRack);
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
  const header = 'Rack,Unidad U,Lado,Nombre,Marca,Modelo,Tipo,IP,MAC,Serie,Usuario,Consumo(W),Tomas\n';
  const rows = store._raw.devices.map(d => {
    const rack = store.rackById(d.rackId);
    const side = d.category === 'floor' ? '-' : (d.mountSide === 'rear' ? 'Atrás' : 'Frontal');
    return [rack?.name||'', d.slotStart||'-', side, d.name, d.brand||'', d.model||'', d.type, d.ip, d.mac, d.serial, d.user, d.power, d.plugs||1].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
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

function exportRackToPNG(rackId) {
  const rack    = store.rackById(rackId);
  const devices = store.allDevicesInRack(rackId);
  
  const frontDevices = devices.filter(d => d.mountSide !== 'rear');
  const rearDevices  = devices.filter(d => d.mountSide === 'rear');
  const hasRear = rearDevices.length > 0;

  const W = 280, UNIT = 24, GAP = 40;
  const H = rack.height * UNIT + 60;
  const totalW = hasRear ? (W * 2 + GAP) : W;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = totalW * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = '#090d17';
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
    oc.fillStyle = '#4a5a78';
    oc.font = '9px monospace';
    oc.fillText(`${rack.height}U · ${sideDevices.reduce((s,d)=>s+d.size,0)} usadas`, 10, 30);

    oc.fillStyle = '#1a2035';
    oc.fillRect(0, 40, 18, rack.height * UNIT);
    oc.fillRect(W-18, 40, 18, rack.height * UNIT);

    for (let u = 1; u <= rack.height; u++) {
      const y = 40 + (u-1) * UNIT;
      oc.fillStyle = u % 5 === 0 ? '#3d5480' : '#1e2d44';
      oc.font = '7px monospace';
      oc.textAlign = 'center';
      oc.fillText(u, 9, y + UNIT/2 + 3);
      oc.fillText(u, W-9, y + UNIT/2 + 3);
      oc.strokeStyle = '#0d1220';
      oc.lineWidth = 0.5;
      oc.beginPath(); oc.moveTo(18, y); oc.lineTo(W-18, y); oc.stroke();
    }

    const typeColors = TYPE_COLORS;
    for (let u = 1; u <= rack.height; u++) {
      const dev = sideDevices.find(d => d.slotStart === u);
      if (!dev) continue;
      const y = 40 + (u-1) * UNIT;
      const h = dev.size * UNIT;
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
        oc.fillStyle = '#8b9ab8';
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

  drawRack(0, frontDevices, hasRear ? rack.name + ' (Frontal)' : rack.name);
  if (hasRear) {
    drawRack(W + GAP, rearDevices, 'Vista Trasera');
  }

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${rack.name.replace(/\s+/g,'_')}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: ${rack.name}`, 'success');
}

function exportFloorToPNG(roomId) {
  const floorDevices = store.allFloorDevicesInRoom(roomId);
  const room = store._raw.rooms.find(r => r.id === roomId);
  if (!floorDevices.length) return;

  const cols = 2;
  const rowHeight = 70;
  const colWidth = 240;
  const padding = 20;
  
  const rows = Math.ceil(floorDevices.length / cols);
  
  const W = cols * colWidth + padding * 2;
  const H = rows * rowHeight + padding * 2 + 40;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = W * 2;
  offCanvas.height = H * 2;
  const oc = offCanvas.getContext('2d');
  oc.scale(2, 2);

  oc.fillStyle = '#090d17';
  oc.fillRect(0, 0, W, H);

  oc.fillStyle = '#f59e0b';
  oc.font = 'bold 16px sans-serif';
  oc.fillText(`Equipos de Piso - ${room ? room.name : 'Sala'}`, padding, padding + 15);

  oc.fillStyle = '#4a5a78';
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
    const y = padding + 50 + row * rowHeight;
    
    const color = colors[dev.type] || '#8b9ab8';
    
    oc.fillStyle = '#0c1420';
    oc.fillRect(x, y, colWidth - 15, rowHeight - 15);
    oc.strokeStyle = color;
    oc.lineWidth = 1;
    oc.strokeRect(x, y, colWidth - 15, rowHeight - 15);

    oc.fillStyle = color;
    oc.fillRect(x, y, 6, rowHeight - 15);

    oc.fillStyle = color;
    oc.font = 'bold 12px sans-serif';
    oc.fillText(dev.name.slice(0, 25), x + 16, y + 20);

    oc.fillStyle = '#8b9ab8';
    oc.font = '10px monospace';
    oc.fillText(dev.type.toUpperCase(), x + 16, y + 36);
    
    if (dev.ip) {
      oc.fillText(`IP: ${dev.ip}`, x + 16, y + 48);
    }
  });

  const url  = offCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Equipos_Piso_${room ? room.name.replace(/\s+/g,'_') : 'Sala'}.png`;
  link.href = url;
  link.click();
  notify(`PNG exportado: Equipos de Piso`, 'success');
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
