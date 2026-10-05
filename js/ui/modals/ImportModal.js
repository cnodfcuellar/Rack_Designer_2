/**
 * ImportModal.js — M-21 y M-22: Plantilla Completa de Exportación e Importación Masiva (CSV / Excel)
 * RACK Designer Next
 * 
 * Permite:
 * 1. M-21: Generar plantillas completas y estructuradas (Excel y CSV) con todos los campos configurables
 *    del modelo de equipos y hojas de ayuda con valores permitidos.
 * 2. M-22: Importación masiva de equipos desde archivos .xlsx / .csv con validación reactiva en tiempo real,
 *    detección de colisiones de slots, políticas de duplicados y soporte atómico para Deshacer/Rehacer.
 */

// Lista exhaustiva de tipos de equipos reconocidos por el sistema
const VALID_DEVICE_TYPES = [
  'server', 'switch', 'router', 'firewall', 'storage', 'ups', 'pdu',
  'patchpanel', 'camera', 'ap', 'decoder', 'nvr', 'dvr', 'kvm',
  'tray', 'organizer', 'printer', 'phone'
];

// Nombres descriptivos de tipos para la hoja de ayuda
const DEVICE_TYPE_LABELS = {
  'server': 'Servidor Rack (Cómputo / Virtualización)',
  'switch': 'Switch de Red (Acceso / Core / ToR)',
  'router': 'Router / Enrutador de Borde WAN',
  'firewall': 'Firewall UTM / Seguridad Perimetral',
  'storage': 'Storage SAN / NAS / JBOD',
  'ups': 'Sistema de Alimentación Ininterrumpida (UPS)',
  'pdu': 'Unidad de Distribución de Energía (PDU)',
  'patchpanel': 'Panel de Parcheo (Patch Panel / ODF)',
  'camera': 'Cámara IP / Vigilancia (Piso / Pared)',
  'ap': 'Punto de Acceso Wi-Fi (AP)',
  'decoder': 'Decodificador de Video / Matriz Wall',
  'nvr': 'Grabador NVR para Cámaras IP',
  'dvr': 'Grabador DVR Híbrido CCTV',
  'kvm': 'Consola KVM con Pantalla y Teclado',
  'tray': 'Bandeja Porta-equipos / Estante',
  'organizer': 'Organizador Horizontal de Cables',
  'printer': 'Impresora de Red / Periférico de Piso',
  'phone': 'Teléfono IP / Comunicaciones Unificadas'
};

// Columnas estándar de la plantilla completa
const TEMPLATE_COLUMNS = [
  'Sala',
  'Rack',
  'Unidad_U',
  'Lado_Montaje',
  'Nombre',
  'Tipo',
  'Marca',
  'Modelo',
  'Tamano_U',
  'IP',
  'MAC',
  'Serie',
  'Consumo_W',
  'Tomas_Entrada',
  'Tomas_Salida',
  'Usuario',
  'Contrasena',
  'Skin',
  'Puertos_Ethernet',
  'Puertos_Fibra',
  'Notas'
];

/**
 * Normaliza cualquier clave o encabezado a un identificador interno estándar
 */
function normalizeHeaderKey(key) {
  if (!key) return '';
  const clean = String(key).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '');

  if (clean.includes('sala') || clean.includes('room')) return 'roomName';
  if (clean.includes('rack') || clean.includes('gabinete') || clean.includes('ubicacion') || clean.includes('location')) return 'rackName';
  if (clean.includes('slot') || clean.includes('unidad_u') || clean.includes('posicion_u') || clean === 'u') return 'slotStart';
  if (clean.includes('lado') || clean.includes('mount') || clean.includes('cara') || clean === 'side') return 'mountSide';
  if (clean.includes('nombre') || clean.includes('device') || clean === 'name' || clean === 'equipo') return 'name';
  if (clean.includes('tipo') || clean.includes('type') || clean.includes('categoria') || clean.includes('category')) return 'type';
  if (clean.includes('marca') || clean.includes('brand') || clean.includes('fabricante') || clean.includes('vendor')) return 'brand';
  if (clean.includes('modelo') || clean.includes('model')) return 'model';
  if (clean.includes('tamano') || clean.includes('size') || clean.includes('altura')) return 'size';
  if (clean.includes('mac')) return 'mac';
  if (clean.includes('ip')) return 'ip';
  if (clean.includes('serie') || clean.includes('serial')) return 'serial';
  if (clean.includes('consumo') || clean.includes('power') || clean.includes('potencia') || clean.includes('watt')) return 'power';
  if (clean.includes('tomas_salida') || clean.includes('plugs_out') || clean.includes('plugsout')) return 'plugsOut';
  if (clean.includes('tomas') || clean.includes('plugs')) return 'plugs';
  if (clean.includes('usuario') || clean.includes('username') || clean === 'user') return 'user';
  if (clean.includes('contrasena') || clean.includes('password') || clean.includes('pass') || clean.includes('clave')) return 'pass';
  if (clean.includes('skin') || clean.includes('faceplate') || clean.includes('apariencia')) return 'skin';
  if (clean.includes('fibra') || clean.includes('fiber') || clean.includes('sfp')) return 'portsFiber';
  if (clean.includes('eth') || clean.includes('rj45') || clean.includes('ethernet')) return 'portsEth';
  if (clean.includes('nota') || clean.includes('note') || clean.includes('comentario') || clean.includes('descripcion') || clean.includes('detalle')) return 'notes';

  return clean;
}

/**
 * M-21: Genera los datos crudos para la plantilla (matriz de arrays)
 * Si withCurrentData es true, rellena con todos los dispositivos del proyecto.
 * Si es false, crea filas de ejemplo documentadas.
 */
function getDeviceTemplateAOA(withCurrentData = false) {
  const aoa = [TEMPLATE_COLUMNS];

  if (withCurrentData && typeof store !== 'undefined' && store._raw && Array.isArray(store._raw.devices)) {
    store._raw.devices.forEach(d => {
      const isFloor = d.category === 'floor';
      const rack = !isFloor ? store.rackById(d.rackId) : null;
      const room = isFloor ? store._raw.rooms.find(r => r.id === d.roomId) : (rack ? store._raw.rooms.find(r => r.id === rack.roomId) : null);
      
      const sideText = isFloor ? '-' : (d.mountSide === 'both' ? 'Ambas Caras' : (d.mountSide === 'rear' ? 'Trasera' : 'Frontal'));
      const passText = d.pass ? (window.SHOW_PASSWORDS ? d.pass : '••••••••') : '';
      const ethPorts = d.ports && d.ports.ethernet !== undefined ? d.ports.ethernet : '';
      const fiberPorts = d.ports && d.ports.fiber !== undefined ? d.ports.fiber : '';

      aoa.push([
        room ? room.name : '',
        isFloor ? 'PISO' : (rack ? rack.name : ''),
        isFloor ? '-' : (d.slotStart || 1),
        sideText,
        d.name || '',
        d.type || 'server',
        d.brand || '',
        d.model || '',
        d.size || 1,
        d.ip || '',
        d.mac || '',
        d.serial || '',
        d.power || 0,
        d.plugs !== undefined ? d.plugs : 1,
        d.plugsOut !== undefined ? d.plugsOut : 0,
        d.user || 'admin',
        passText,
        d.skin || 'default',
        ethPorts,
        fiberPorts,
        d.notes || ''
      ]);
    });
  } else {
    // Filas ilustrativas de ejemplo guiadas
    const currentRoom = typeof store !== 'undefined' && store.currentRoom ? store.currentRoom.name : 'Data Center Principal';
    const firstRack = typeof store !== 'undefined' && store.currentRacks && store.currentRacks[0] ? store.currentRacks[0].name : 'Rack 101 · Borde & Redes';

    aoa.push([
      currentRoom,
      firstRack,
      1,
      'Ambas Caras',
      'Servidor Virtualizacion Node-01',
      'server',
      'Dell',
      'PowerEdge R750',
      2,
      '10.10.10.15',
      '00:1A:2B:3C:4D:5E',
      'SRV-DELL-750-01',
      750,
      2,
      0,
      'admin',
      'ServPass2026!',
      'server',
      4,
      2,
      'Cluster Proxmox - Nodo Primario Línea A'
    ]);

    aoa.push([
      currentRoom,
      firstRack,
      40,
      'Frontal',
      'Switch Acceso ToR 48P',
      'switch',
      'Cisco',
      'Catalyst 9300-48P',
      1,
      '10.10.10.2',
      '00:1A:2B:3C:4D:60',
      'CSCO-CAT-9300-A',
      350,
      2,
      0,
      'admin',
      'CiscoPass#1',
      'switch',
      48,
      4,
      'Switch Top of Rack - Distribución de VLANs'
    ]);

    aoa.push([
      currentRoom,
      'PISO',
      '-',
      '-',
      'Camara Domo Pasillo Central',
      'camera',
      'Hikvision',
      'DS-2CD2143G2-I',
      1,
      '10.10.40.101',
      '00:1A:2B:3C:4D:77',
      'HIK-CAM-4K-01',
      12,
      1,
      0,
      'admin',
      'CamPass#2026',
      'default',
      1,
      0,
      'Cámara IP PoE conectada a Switch Rack 104'
    ]);
  }

  return aoa;
}

/**
 * M-21: Descarga la plantilla estructurada de importación en formato Excel (.xlsx) o CSV (.csv)
 */
function downloadDeviceTemplate(format = 'xlsx', withCurrentData = false) {
  const aoa = getDeviceTemplateAOA(withCurrentData);
  const baseFilename = withCurrentData ? 'Inventario_Completo_Centro_Datos' : 'Plantilla_Importacion_Equipos';

  if (format === 'csv') {
    // Generar CSV con BOM UTF-8 (\uFEFF) para visualización correcta de tildes en Excel
    const csvRows = aoa.map(row => 
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    if (typeof notify === 'function') {
      notify(`Plantilla CSV ${withCurrentData ? 'con datos ' : ''}descargada`, 'success');
    }
    return;
  }

  // Generar archivo Excel (.xlsx) con SheetJS
  if (typeof XLSX === 'undefined') {
    if (typeof notify === 'function') {
      notify('Librería Excel no disponible en memoria. Descargando en CSV...', 'warn');
    }
    return downloadDeviceTemplate('csv', withCurrentData);
  }

  const wb = XLSX.utils.book_new();

  // Hoja 1: Plantilla de Equipos
  const wsTemplate = XLSX.utils.aoa_to_sheet(aoa);
  
  // Establecer anchos de columna visuales cómodos
  wsTemplate['!cols'] = [
    { wch: 22 }, // Sala
    { wch: 26 }, // Rack
    { wch: 10 }, // Unidad_U
    { wch: 14 }, // Lado_Montaje
    { wch: 30 }, // Nombre
    { wch: 14 }, // Tipo
    { wch: 16 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 10 }, // Tamano_U
    { wch: 16 }, // IP
    { wch: 20 }, // MAC
    { wch: 18 }, // Serie
    { wch: 12 }, // Consumo_W
    { wch: 14 }, // Tomas_Entrada
    { wch: 14 }, // Tomas_Salida
    { wch: 14 }, // Usuario
    { wch: 16 }, // Contrasena
    { wch: 14 }, // Skin
    { wch: 16 }, // Puertos_Ethernet
    { wch: 16 }, // Puertos_Fibra
    { wch: 38 }  // Notas
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Plantilla_Equipos');

  // Hoja 2: Valores Permitidos y Referencia de la Infraestructura
  const refAoa = [
    ['CAMPO', 'VALORES VÁLIDOS', 'DESCRIPCIÓN Y NOTAS'],
    ['Tipo (Equipo)', VALID_DEVICE_TYPES.join(', '), 'Categoría del hardware. Ver lista detallada abajo.'],
    ['Lado_Montaje', 'Frontal, Trasera, Ambas Caras (o front, rear, both)', 'Indica la cara del rack donde se monta el equipo.'],
    ['Rack', 'Nombre del gabinete, o "PISO" / "FLOOR"', 'Si se indica "PISO", el equipo se ubica como periférico de sala.'],
    ['Unidad_U', '1 a N (Altura máxima del rack)', 'Ranura física donde empieza el equipo (de abajo hacia arriba).'],
    ['Tamano_U', '1, 2, 3, 4, etc.', 'Número entero de unidades de rack (U) que ocupa el equipo.'],
    ['IP', 'IPv4 Válida (ej: 192.168.1.10)', 'Opcional. Formato estándar x.x.x.x.'],
    ['MAC', 'Formato XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX', 'Opcional. Formato hexadecimal de 6 octetos.'],
    [''],
    ['--- TIPOS DE EQUIPOS SOPORTADOS ---', '', ''],
    ...VALID_DEVICE_TYPES.map(t => [t, DEVICE_TYPE_LABELS[t] || t, '']),
    [''],
    ['--- SALAS EXISTENTES EN ESTE PROYECTO ---', '', ''],
    ...(typeof store !== 'undefined' && store._raw && store._raw.rooms ? store._raw.rooms.map(r => [r.name, `ID: ${r.id}`, '']) : []),
    [''],
    ['--- GABINETES (RACKS) EXISTENTES ---', 'SALA', 'ALTURA'],
    ...(typeof store !== 'undefined' && store._raw && store._raw.racks ? store._raw.racks.map(r => {
      const room = store._raw.rooms.find(rm => rm.id === r.roomId);
      return [r.name, room ? room.name : '', `${r.height}U`];
    }) : [])
  ];

  const wsRef = XLSX.utils.aoa_to_sheet(refAoa);
  wsRef['!cols'] = [{ wch: 34 }, { wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsRef, 'Valores_Permitidos');

  XLSX.writeFile(wb, `${baseFilename}.xlsx`);
  if (typeof notify === 'function') {
    notify(`Plantilla Excel ${withCurrentData ? 'con datos ' : ''}descargada exitosamente`, 'success');
  }
}

/**
 * M-22: Analiza y valida una fila individual cruda
 */
function parseAndValidateDeviceRow(rawRow, index, options = {}) {
  const currentRoomId = options.targetRoomId || (typeof store !== 'undefined' ? store._raw.currentRoomId : null);
  const autoCreateRacks = !!options.autoCreateRacks;
  
  // Normalizar propiedades del objeto
  const item = {};
  for (const [k, v] of Object.entries(rawRow)) {
    const normKey = normalizeHeaderKey(k);
    if (normKey) {
      item[normKey] = typeof v === 'string' ? v.trim() : v;
    }
  }

  const rowNum = index + 2; // Considerando fila 1 de encabezados
  const issues = { errors: [], warnings: [] };

  // 1. Validación de Nombre
  if (!item.name || String(item.name).trim() === '') {
    issues.errors.push(`Fila ${rowNum}: El nombre del equipo es obligatorio.`);
    return { isValid: false, issues, item, rowNum };
  }

  // 2. Validación y normalización de Tipo
  let type = String(item.type || 'server').trim().toLowerCase();
  if (!VALID_DEVICE_TYPES.includes(type)) {
    // Mapeo flexible
    if (type.includes('serv') || type.includes('srv')) type = 'server';
    else if (type.includes('switch') || type.includes('sw')) type = 'switch';
    else if (type.includes('rout') || type.includes('rtr')) type = 'router';
    else if (type.includes('firewall') || type.includes('fw')) type = 'firewall';
    else if (type.includes('stor') || type.includes('nas') || type.includes('san')) type = 'storage';
    else if (type.includes('cam')) type = 'camera';
    else if (type.includes('wifi') || type.includes('ap')) type = 'ap';
    else {
      issues.warnings.push(`Fila ${rowNum}: Tipo "${item.type}" no reconocido; se asignó "server" por defecto.`);
      type = 'server';
    }
  }
  item.type = type;

  // 3. Tamaño en U
  let size = parseInt(item.size, 10);
  if (isNaN(size) || size < 1) size = 1;
  item.size = size;

  // 4. Ubicación: ¿Es equipo de piso o de rack?
  const rackRaw = String(item.rackName || '').trim();
  const isFloor = rackRaw.toUpperCase() === 'PISO' || rackRaw.toUpperCase() === 'FLOOR' || rackRaw === '-' || (rackRaw === '' && ['camera', 'ap', 'printer', 'phone'].includes(type));

  item.category = isFloor ? 'floor' : undefined;

  // 5. Resolución de Sala
  let targetRoom = null;
  if (typeof store !== 'undefined' && store._raw && store._raw.rooms) {
    if (item.roomName) {
      targetRoom = store._raw.rooms.find(r => r.name.toLowerCase() === item.roomName.toLowerCase()) || null;
    }
    if (!targetRoom && currentRoomId) {
      targetRoom = store._raw.rooms.find(r => r.id === currentRoomId) || store._raw.rooms[0] || null;
    }
  }
  item.roomId = targetRoom ? targetRoom.id : currentRoomId;
  item.resolvedRoomName = targetRoom ? targetRoom.name : (item.roomName || 'Sala Actual');

  // 6. Validación de Gabinete (Rack) y Slots si es de Rack
  let targetRack = null;
  if (!isFloor) {
    if (!rackRaw && !options.defaultRackId) {
      issues.errors.push(`Fila ${rowNum}: No se especificó el gabinete (Rack) para el equipo "${item.name}".`);
    } else {
      if (typeof store !== 'undefined' && store._raw && store._raw.racks) {
        if (rackRaw) {
          // Buscar rack por nombre dentro de la sala resuelta
          targetRack = store._raw.racks.find(r => 
            r.name.toLowerCase() === rackRaw.toLowerCase() && 
            (!item.roomId || r.roomId === item.roomId)
          );
          // Si no está en esa sala, buscar globalmente por nombre
          if (!targetRack) {
            targetRack = store._raw.racks.find(r => r.name.toLowerCase() === rackRaw.toLowerCase());
          }
        }
        if (!targetRack && options.defaultRackId) {
          targetRack = store.rackById(options.defaultRackId);
        }
      }

      if (!targetRack) {
        if (autoCreateRacks && rackRaw) {
          issues.warnings.push(`Fila ${rowNum}: El rack "${rackRaw}" no existe y será creado automáticamente (42U).`);
          item.willCreateRack = true;
          item.rackName = rackRaw;
        } else {
          issues.errors.push(`Fila ${rowNum}: El gabinete "${rackRaw}" no fue encontrado en el proyecto.`);
        }
      } else {
        item.rackId = targetRack.id;
        item.resolvedRackName = targetRack.name;
        item.rackHeight = targetRack.height;
      }

      // Validar Unidad U
      let slotStart = parseInt(item.slotStart, 10);
      if (isNaN(slotStart) || slotStart < 1) {
        issues.errors.push(`Fila ${rowNum}: Unidad U inválida ("${item.slotStart}"). Debe ser un número mayor o igual a 1.`);
      } else {
        const rackH = targetRack ? targetRack.height : 42;
        if (slotStart + size - 1 > rackH) {
          issues.errors.push(`Fila ${rowNum}: El equipo "${item.name}" (${size}U en U${slotStart}) desborda la altura del rack (${rackH}U).`);
        }
        item.slotStart = slotStart;
      }

      // Validar Lado de Montaje
      let side = String(item.mountSide || 'front').trim().toLowerCase();
      if (side.includes('ambas') || side.includes('both') || side.includes('dual')) {
        side = 'both';
      } else if (side.includes('tras') || side.includes('rear') || side.includes('atras')) {
        side = 'rear';
      } else {
        side = 'front';
      }
      item.mountSide = side;

      // Validar colisiones físicas con equipos ya existentes en el rack
      if (targetRack && typeof store !== 'undefined' && item.slotStart) {
        const conflictFn = typeof store.sidesConflict === 'function' 
          ? store.sidesConflict.bind(store) 
          : (s1, s2) => (s1 === 'both' || s2 === 'both' || s1 === s2);
        
        const existingInRack = store.allDevicesInRack(targetRack.id).filter(d => conflictFn(d.mountSide, item.mountSide));
        const myStart = item.slotStart;
        const myEnd = item.slotStart + size - 1;

        for (const dev of existingInRack) {
          const dStart = dev.slotStart;
          const dEnd = dev.slotStart + dev.size - 1;
          if (!(myEnd < dStart || myStart > dEnd)) {
            issues.errors.push(`Fila ${rowNum}: Colisión física en U${myStart}-U${myEnd} con el equipo existente "${dev.name}".`);
            break;
          }
        }
      }
    }
  } else {
    item.rackId = null;
    item.resolvedRackName = 'PISO';
    item.slotStart = '-';
    item.mountSide = '-';
  }

  // 7. Validaciones sintácticas de red
  if (item.ip && String(item.ip).trim() !== '') {
    const ipStr = String(item.ip).trim();
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    if (!ipv4Regex.test(ipStr)) {
      issues.warnings.push(`Fila ${rowNum}: Formato de IP "${ipStr}" no cumple con estándar IPv4.`);
    }
  }

  if (item.mac && String(item.mac).trim() !== '') {
    const macStr = String(item.mac).trim();
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macStr)) {
      issues.warnings.push(`Fila ${rowNum}: Formato de MAC "${macStr}" no coincide con patrón estándar (XX:XX:XX:XX:XX:XX).`);
    }
  }

  // 8. Normalización de campos numéricos y auxiliares
  item.power = parseInt(item.power, 10) || 0;
  item.plugs = parseInt(item.plugs, 10) || 1;
  item.plugsOut = parseInt(item.plugsOut, 10) || 0;
  item.brand = item.brand || '';
  item.model = item.model || '';
  item.serial = item.serial || '';
  item.user = item.user || 'admin';
  item.pass = item.pass ? String(item.pass) : '';
  item.notes = item.notes || '';
  item.skin = item.skin || 'default';

  // Configurar puertos estructurados si están presentes
  const portsEth = parseInt(item.portsEth, 10);
  const portsFiber = parseInt(item.portsFiber, 10);
  if (!isNaN(portsEth) || !isNaN(portsFiber)) {
    item.ports = {
      ethernet: !isNaN(portsEth) ? portsEth : 0,
      fiber: !isNaN(portsFiber) ? portsFiber : 0
    };
  }

  const isValid = issues.errors.length === 0;
  return { isValid, issues, item, rowNum };
}

/**
 * M-22: Procesa una lista completa de filas crudas y devuelve el plan de importación
 */
function analyzeImportBatch(rawRows, options = {}) {
  const results = {
    total: rawRows.length,
    validRows: [],
    invalidRows: [],
    allIssues: [],
    warningsCount: 0,
    errorsCount: 0,
    racksToCreate: new Set()
  };

  // Mapa para detectar colisiones internas en el mismo lote
  const internalRackSlots = new Map(); // key: `rackId_side` -> Array<{ start, end, name, rowNum }>

  rawRows.forEach((row, idx) => {
    // Ignorar filas totalmente vacías
    if (!row || Object.values(row).every(v => v === null || v === undefined || String(v).trim() === '')) {
      return;
    }

    const validated = parseAndValidateDeviceRow(row, idx, options);

    if (validated.isValid && !validated.item.isFloor && validated.item.rackId && validated.item.slotStart) {
      const rackKey = `${validated.item.rackId}_${validated.item.mountSide}`;
      const myStart = validated.item.slotStart;
      const myEnd = validated.item.slotStart + validated.item.size - 1;

      if (!internalRackSlots.has(rackKey)) {
        internalRackSlots.set(rackKey, []);
      }
      const existingInBatch = internalRackSlots.get(rackKey);

      for (const item of existingInBatch) {
        if (!(myEnd < item.start || myStart > item.end)) {
          validated.isValid = false;
          validated.issues.errors.push(`Fila ${validated.rowNum}: Colisión interna en el archivo con el equipo "${item.name}" (Fila ${item.rowNum}) en el mismo gabinete.`);
          break;
        }
      }

      if (validated.isValid) {
        existingInBatch.push({ start: myStart, end: myEnd, name: validated.item.name, rowNum: validated.rowNum });
      }
    }

    if (validated.item.willCreateRack && validated.item.rackName) {
      results.racksToCreate.add(validated.item.rackName);
    }

    results.warningsCount += validated.issues.warnings.length;
    results.errorsCount += validated.issues.errors.length;

    if (validated.isValid) {
      results.validRows.push(validated);
    } else {
      results.invalidRows.push(validated);
    }

    results.allIssues.push(...validated.issues.errors.map(msg => ({ type: 'error', msg, rowNum: validated.rowNum })));
    results.allIssues.push(...validated.issues.warnings.map(msg => ({ type: 'warning', msg, rowNum: validated.rowNum })));
  });

  return results;
}

/**
 * M-22: Ejecuta la importación masiva atómicamente en store._raw
 */
function executeDeviceImport(importPlan, options = {}) {
  if (typeof store === 'undefined' || !store._raw) {
    throw new Error('El Store no está inicializado.');
  }

  if (typeof RackAuth !== 'undefined' && typeof RackAuth.can === 'function' && !RackAuth.can('editDevices')) {
    throw new Error('Permisos insuficientes: Se requiere rol Editor o Administrador para importar equipos.');
  }

  const conflictStrategy = options.conflictStrategy || 'rename'; // 'skip' | 'rename' | 'overwrite'
  const validItems = importPlan.validRows.map(r => r.item);

  if (validItems.length === 0) {
    return { success: false, importedCount: 0, message: 'No hay equipos válidos para importar.' };
  }

  // 1. Snapshot atómico para soportar Deshacer / Rehacer
  if (typeof store.snapshot === 'function') {
    store.snapshot();
  }

  // 2. Creación automática de gabinetes si se solicitaron
  const createdRacksMap = new Map();
  if (importPlan.racksToCreate && importPlan.racksToCreate.size > 0 && options.autoCreateRacks) {
    for (const rackName of importPlan.racksToCreate) {
      const newRackId = typeof uid === 'function' ? uid() : ('rack_' + Math.random().toString(36).substr(2, 9));
      const targetRoomId = options.targetRoomId || store._raw.currentRoomId;
      const newRack = {
        id: newRackId,
        roomId: targetRoomId,
        name: rackName,
        height: 42,
        color: '#0ea5e9',
        devices: []
      };
      store._raw.racks.push(newRack);
      createdRacksMap.set(rackName.toLowerCase(), newRackId);
    }
  }

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of validItems) {
    // Si el rack fue creado dinámicamente en este lote, asociar su nuevo ID
    if (item.willCreateRack && item.rackName) {
      const createdId = createdRacksMap.get(item.rackName.toLowerCase());
      if (createdId) {
        item.rackId = createdId;
      }
    }

    // Comprobar existencia previa de equipo por nombre en la misma sala o rack
    let existing = null;
    if (item.category === 'floor') {
      existing = store._raw.devices.find(d => d.category === 'floor' && d.roomId === item.roomId && d.name.toLowerCase() === item.name.toLowerCase());
    } else if (item.rackId) {
      existing = store._raw.devices.find(d => d.rackId === item.rackId && d.name.toLowerCase() === item.name.toLowerCase());
    }

    if (existing) {
      if (conflictStrategy === 'skip') {
        skippedCount++;
        continue;
      } else if (conflictStrategy === 'rename') {
        let counter = 1;
        let newName = `${item.name} (${counter})`;
        while (store._raw.devices.some(d => d.name.toLowerCase() === newName.toLowerCase())) {
          counter++;
          newName = `${item.name} (${counter})`;
        }
        item.name = newName;
      } else if (conflictStrategy === 'overwrite') {
        // Actualizar propiedades del equipo existente
        Object.assign(existing, {
          brand: item.brand,
          model: item.model,
          ip: item.ip,
          mac: item.mac,
          serial: item.serial,
          power: item.power,
          plugs: item.plugs,
          plugsOut: item.plugsOut,
          user: item.user,
          pass: item.pass,
          notes: item.notes,
          skin: item.skin
        });
        if (item.ports) existing.ports = item.ports;
        updatedCount++;
        continue;
      }
    }

    // Crear nuevo objeto de dispositivo
    const deviceId = typeof uid === 'function' ? uid() : ('dev_' + Math.random().toString(36).substr(2, 9));
    const newDevice = {
      id: deviceId,
      rackId: item.category === 'floor' ? null : item.rackId,
      roomId: item.category === 'floor' ? item.roomId : undefined,
      category: item.category,
      name: item.name,
      type: item.type,
      brand: item.brand,
      model: item.model,
      size: item.size,
      ip: item.ip,
      mac: item.mac,
      serial: item.serial,
      power: item.power,
      plugs: item.plugs,
      plugsOut: item.plugsOut,
      user: item.user,
      pass: item.pass,
      notes: item.notes,
      skin: item.skin
    };

    if (item.category !== 'floor') {
      newDevice.slotStart = item.slotStart;
      newDevice.mountSide = item.mountSide;
    }
    if (item.ports) {
      newDevice.ports = item.ports;
    }

    store._raw.devices.push(newDevice);
    importedCount++;
  }

  // 3. Persistir y emitir cambio reactivo
  if (typeof store._save === 'function') {
    store._save();
  }

  if (typeof store._emit === 'function') {
    store._emit('change', { source: 'importDevices' });
  }

  return {
    success: true,
    importedCount,
    updatedCount,
    skippedCount,
    racksCreatedCount: createdRacksMap.size
  };
}

// ──────────────────────────────────────────────────────────────────
// Control del Modal de Importación Masiva en Interfaz de Usuario
// ──────────────────────────────────────────────────────────────────

let currentParsedRows = null;
let currentImportPlan = null;

/**
 * Abre el modal interactivo de importación
 */
function openImportModal() {
  const modal = document.getElementById('modal-import-devices');
  if (!modal) return;

  currentParsedRows = null;
  currentImportPlan = null;

  // Rellenar selector de salas
  const roomSelect = document.getElementById('import-room-select');
  if (roomSelect && typeof store !== 'undefined' && store._raw && store._raw.rooms) {
    roomSelect.innerHTML = store._raw.rooms.map(r => 
      `<option value="${r.id}" ${r.id === store._raw.currentRoomId ? 'selected' : ''}>${escapeHTML(r.name)}</option>`
    ).join('');
  }

  // Resetear estados visuales
  const fileInput = document.getElementById('import-file-input');
  if (fileInput) fileInput.value = '';

  const dropZone = document.getElementById('import-drop-zone');
  if (dropZone) {
    dropZone.classList.remove('has-file');
    const label = document.getElementById('import-file-name-label');
    if (label) label.textContent = 'Haz clic o arrastra aquí tu archivo .xlsx o .csv';
  }

  const previewContainer = document.getElementById('import-preview-container');
  if (previewContainer) previewContainer.classList.add('hidden');

  const btnConfirm = document.getElementById('btn-import-confirm');
  if (btnConfirm) {
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<i class="svg-icon icon-upload" style="width:14px;height:14px;margin-right:6px;"></i>Importar Equipos';
  }

  modal.classList.remove('hidden');
}

/**
 * Cierra el modal de importación
 */
function closeImportModal() {
  const modal = document.getElementById('modal-import-devices');
  if (modal) modal.classList.add('hidden');
  currentParsedRows = null;
  currentImportPlan = null;
}

/**
 * Procesa un archivo subido por el usuario (Excel o CSV)
 */
function handleImportFile(file) {
  if (!file) return;

  const dropZoneLabel = document.getElementById('import-file-name-label');
  if (dropZoneLabel) {
    dropZoneLabel.textContent = `Analizando: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      if (typeof XLSX === 'undefined') {
        throw new Error('Librería SheetJS no encontrada.');
      }

      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        if (typeof notify === 'function') {
          notify('El archivo seleccionado no contiene filas de datos.', 'warn');
        }
        if (dropZoneLabel) dropZoneLabel.textContent = 'El archivo está vacío.';
        return;
      }

      currentParsedRows = rawRows;
      updateImportPreviewUI();

      if (dropZoneLabel) {
        dropZoneLabel.textContent = `Archivo cargado: ${file.name} (${rawRows.length} registros)`;
      }
      const dropZone = document.getElementById('import-drop-zone');
      if (dropZone) dropZone.classList.add('has-file');

    } catch (err) {
      console.error('[ImportModal] Error al procesar archivo:', err);
      if (typeof notify === 'function') {
        notify('Error al leer el archivo. Comprueba que sea un Excel o CSV válido.', 'error');
      }
      if (dropZoneLabel) dropZoneLabel.textContent = 'Error al leer el archivo.';
    }
  };

  reader.onerror = function() {
    if (typeof notify === 'function') {
      notify('Fallo en la lectura del archivo.', 'error');
    }
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Actualiza la vista previa del plan de importación en el modal
 */
function updateImportPreviewUI() {
  if (!currentParsedRows) return;

  const roomSelect = document.getElementById('import-room-select');
  const targetRoomId = roomSelect ? roomSelect.value : null;

  const autoCreateCheck = document.getElementById('import-auto-create-racks');
  const autoCreateRacks = autoCreateCheck ? autoCreateCheck.checked : true;

  const conflictSelect = document.getElementById('import-conflict-strategy');
  const conflictStrategy = conflictSelect ? conflictSelect.value : 'rename';

  currentImportPlan = analyzeImportBatch(currentParsedRows, {
    targetRoomId,
    autoCreateRacks,
    conflictStrategy
  });

  const previewContainer = document.getElementById('import-preview-container');
  if (previewContainer) previewContainer.classList.remove('hidden');

  // Actualizar contadores
  const countTotal = document.getElementById('import-count-total');
  const countValid = document.getElementById('import-count-valid');
  const countWarnings = document.getElementById('import-count-warnings');
  const countErrors = document.getElementById('import-count-errors');

  if (countTotal) countTotal.textContent = currentImportPlan.total;
  if (countValid) countValid.textContent = currentImportPlan.validRows.length;
  if (countWarnings) countWarnings.textContent = currentImportPlan.warningsCount;
  if (countErrors) countErrors.textContent = currentImportPlan.errorsCount;

  // Renderizar tabla previa (primeras 20 filas)
  const tbody = document.getElementById('import-preview-tbody');
  if (tbody) {
    const allCombined = [...currentImportPlan.validRows, ...currentImportPlan.invalidRows]
      .sort((a, b) => a.rowNum - b.rowNum);

    tbody.innerHTML = allCombined.slice(0, 30).map(rowObj => {
      const isOk = rowObj.isValid;
      const statusBadge = isOk 
        ? `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(16,185,129,0.15);color:#10b981;"><i class="svg-icon icon-check" style="width:10px;height:10px;"></i> Válido</span>`
        : `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(239,68,68,0.15);color:#ef4444;"><i class="svg-icon icon-x" style="width:10px;height:10px;"></i> Error</span>`;

      const msg = rowObj.issues.errors[0] || rowObj.issues.warnings[0] || (rowObj.item.willCreateRack ? 'Rack nuevo a crear' : 'Listo para importar');
      const msgColor = rowObj.issues.errors.length ? '#ef4444' : (rowObj.issues.warnings.length ? '#f59e0b' : 'var(--text-muted)');

      return `
        <tr style="border-bottom: 1px solid var(--border); font-size: 11px;">
          <td style="padding: 6px 8px; font-family:var(--font-mono); text-align:center;">${rowObj.rowNum}</td>
          <td style="padding: 6px 8px;">${statusBadge}</td>
          <td style="padding: 6px 8px; font-weight:600; color:var(--text-primary);">${escapeHTML(rowObj.item.name || '-')}</td>
          <td style="padding: 6px 8px; color:var(--text-secondary);">${escapeHTML(rowObj.item.resolvedRackName || '-')}</td>
          <td style="padding: 6px 8px; font-family:var(--font-mono);">${rowObj.item.slotStart !== undefined ? escapeHTML(String(rowObj.item.slotStart)) : '-'}</td>
          <td style="padding: 6px 8px; font-family:var(--font-mono);">${escapeHTML(rowObj.item.ip || '-')}</td>
          <td style="padding: 6px 8px; color:${msgColor}; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHTML(msg)}">${escapeHTML(msg)}</td>
        </tr>
      `;
    }).join('');
  }

  // Activar o desactivar botón de confirmación
  const btnConfirm = document.getElementById('btn-import-confirm');
  if (btnConfirm) {
    const validCount = currentImportPlan.validRows.length;
    btnConfirm.disabled = validCount === 0;
    btnConfirm.innerHTML = `<i class="svg-icon icon-upload" style="width:14px;height:14px;margin-right:6px;"></i>Confirmar e Importar (${validCount} Equipos)`;
  }
}

/**
 * Inicializa los eventos del DOM para el modal de importación
 */
function initImportModalEvents() {
  const modal = document.getElementById('modal-import-devices');
  if (!modal) return;

  const btnClose = document.getElementById('modal-import-close');
  const btnCancel = document.getElementById('modal-import-cancel');
  if (btnClose) btnClose.addEventListener('click', closeImportModal);
  if (btnCancel) btnCancel.addEventListener('click', closeImportModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeImportModal();
  });

  // Selector de archivos y Drag & Drop
  const fileInput = document.getElementById('import-file-input');
  const dropZone = document.getElementById('import-drop-zone');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFile(e.target.files[0]);
      }
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImportFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Descargas de plantillas desde el modal
  const btnDlXlsx = document.getElementById('btn-modal-dl-template-xlsx');
  const btnDlCsv = document.getElementById('btn-modal-dl-template-csv');
  if (btnDlXlsx) btnDlXlsx.addEventListener('click', () => downloadDeviceTemplate('xlsx', false));
  if (btnDlCsv) btnDlCsv.addEventListener('click', () => downloadDeviceTemplate('csv', false));

  // Cambios en opciones de configuración
  const roomSelect = document.getElementById('import-room-select');
  const autoCreateCheck = document.getElementById('import-auto-create-racks');
  const conflictSelect = document.getElementById('import-conflict-strategy');

  if (roomSelect) roomSelect.addEventListener('change', updateImportPreviewUI);
  if (autoCreateCheck) autoCreateCheck.addEventListener('change', updateImportPreviewUI);
  if (conflictSelect) conflictSelect.addEventListener('change', updateImportPreviewUI);

  // Botón Confirmar Importación
  const btnConfirm = document.getElementById('btn-import-confirm');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!currentImportPlan || currentImportPlan.validRows.length === 0) return;

      const roomSelectVal = document.getElementById('import-room-select')?.value;
      const autoCreateVal = document.getElementById('import-auto-create-racks')?.checked;
      const conflictVal = document.getElementById('import-conflict-strategy')?.value;

      try {
        const result = executeDeviceImport(currentImportPlan, {
          targetRoomId: roomSelectVal,
          autoCreateRacks: autoCreateVal,
          conflictStrategy: conflictVal
        });

        if (result.success) {
          const detail = [];
          if (result.importedCount > 0) detail.push(`${result.importedCount} creados`);
          if (result.updatedCount > 0) detail.push(`${result.updatedCount} actualizados`);
          if (result.skippedCount > 0) detail.push(`${result.skippedCount} omitidos`);
          if (result.racksCreatedCount > 0) detail.push(`${result.racksCreatedCount} racks creados`);

          if (typeof notify === 'function') {
            notify(`Importación completada: ${detail.join(', ')}`, 'success', 4000);
          }
          closeImportModal();
        } else {
          if (typeof notify === 'function') {
            notify(result.message || 'Error en la importación', 'error');
          }
        }
      } catch (err) {
        console.error('[ImportModal] Error al ejecutar importación:', err);
        if (typeof notify === 'function') {
          notify(`Error: ${err.message}`, 'error', 4000);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initImportModalEvents);

// Exportación global en window para consumo desde UI y pruebas automatizadas
if (typeof window !== 'undefined') {
  window.downloadDeviceTemplate = downloadDeviceTemplate;
  window.openImportModal = openImportModal;
  window.closeImportModal = closeImportModal;
  window.parseAndValidateDeviceRow = parseAndValidateDeviceRow;
  window.analyzeImportBatch = analyzeImportBatch;
  window.executeDeviceImport = executeDeviceImport;
  window.normalizeHeaderKey = normalizeHeaderKey;
  window.VALID_DEVICE_TYPES = VALID_DEVICE_TYPES;
  window.TEMPLATE_COLUMNS = TEMPLATE_COLUMNS;
}
