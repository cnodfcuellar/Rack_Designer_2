/**
 * demoData.js — Plantilla de Demostración Profesional de Centro de Datos
 * RACK Designer Next
 * 
 * Implementa las mejores prácticas de ingeniería de infraestructura (ANSI/TIA-942 y TIA-606-C):
 * - Distribución Gravitacional de Peso: Equipos pesados (UPS, SAN, Servidores densos) en la base (U1 en adelante).
 * - Zona Ergonómica de Operación: Consola KVM y bandeja porta-herramientas a la altura de trabajo (U20-U24).
 * - Zona Top-of-Rack (ToR) y Redes: Switches Core/ToR, Firewalls, Routers, Patch Panels y ODFs de Fibra en la parte superior (U36-U42).
 * - Soporte Bipolar: Equipos de profundidad completa (mountSide: 'both') y PDUs traseras (mountSide: 'rear').
 */

function loadDemoData(templateType = 'tia942') {
  if (templateType === 'university' || templateType === 'campus' || templateType === 'utn') {
    return loadUniversityDemoData();
  }
  const r1 = uid(); // Data Center Principal
  const r2 = uid(); // Edificio Corporativo A
  const r3 = uid(); // Centro de Operaciones & Seguridad

  const rooms = [
    { id: r1, name: 'Data Center Principal' },
    { id: r2, name: 'Edificio Corporativo A' },
    { id: r3, name: 'Centro de Operaciones & Seguridad' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  // =========================================================================
  // SALA 1: DATA CENTER PRINCIPAL (Gabinetes de 42U Estándar)
  // =========================================================================
  const rack101Id = uid(); // Rack 101: Borde & Redes
  const rack102Id = uid(); // Rack 102: Virtualización & Cómputo
  const rack103Id = uid(); // Rack 103: Almacenamiento Masivo SAN/NAS
  const rack104Id = uid(); // Rack 104: Seguridad & CCTV

  racks.push(
    { id: rack101Id, roomId: r1, name: 'Rack 101 · Borde & Redes', height: 42, color: '#0ea5e9', devices: [] },
    { id: rack102Id, roomId: r1, name: 'Rack 102 · Virtualización & Cómputo', height: 42, color: '#10b981', devices: [] },
    { id: rack103Id, roomId: r1, name: 'Rack 103 · Storage SAN/NAS', height: 42, color: '#8b5cf6', devices: [] },
    { id: rack104Id, roomId: r1, name: 'Rack 104 · Seguridad & CCTV', height: 42, color: '#f43f5e', devices: [] }
  );

  // --- RACK 101: BORDE & REDES ---
  // U1-U2: UPS Pesado en la Base
  const ups101Id = uid();
  devices.push({
    id: ups101Id, rackId: rack101Id, name: 'UPS Online 3000VA A', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.10.20.1', mac: '00:1A:2B:20:01:01',
    serial: 'UPS-3000-01', brand: 'APC', model: 'Smart-UPS RT 3000VA', user: 'admin', pass: 'upspass',
    notes: 'Alimentación redundante Línea A - Borde'
  });

  // U3: PDU Trasera
  const pdu101Id = uid();
  devices.push({
    id: pdu101Id, rackId: rack101Id, name: 'PDU Horizontal 8 Tomas A', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B',
    notes: 'PDU Trasera Alimentación Redes'
  });

  // U10-U11: Servidor Monitoreo & Syslog
  const srvSyslogId = uid();
  devices.push({
    id: srvSyslogId, rackId: rack101Id, name: 'Servidor Gestión & Syslog', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.10.10.10', mac: '00:1A:2B:10:01:10',
    serial: 'SRV-LOG-01', brand: 'Dell', model: 'PowerEdge R740', user: 'admin', pass: 'sysadmin2026',
    notes: 'Servidor SIEM, Syslog & Monitoreo Zabbix'
  });

  // U21: Consola KVM Ergonómica
  const kvm101Id = uid();
  devices.push({
    id: kvm101Id, rackId: rack101Id, name: 'Consola KVM LCD 1U', type: 'kvm', slotStart: 21, size: 1,
    mountSide: 'both', power: 30, plugs: 1, brand: 'ATEN', model: 'CL1000M',
    notes: 'Consola retráctil con display LCD y teclado'
  });

  // U22: Bandeja de Trabajo
  const tray101Id = uid();
  devices.push({
    id: tray101Id, rackId: rack101Id, name: 'Bandeja Porta-Herramientas', type: 'tray', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Genérica', model: 'Shelf 1U',
    notes: 'Bandeja metálica para instrumental técnico'
  });

  // U36: ODF Fibra Óptica 24P
  const odf101Id = uid();
  devices.push({
    id: odf101Id, rackId: rack101Id, name: 'Bandeja ODF Fibra 24P', type: 'odf', slotStart: 36, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U',
    notes: 'Distribuidor óptico para enlaces backbone'
  });

  // U37: Organizador Horizontal
  const org101aId = uid();
  devices.push({
    id: org101aId, rackId: rack101Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });

  // U38: Switch Distribución 48P
  const swDistId = uid();
  devices.push({
    id: swDistId, rackId: rack101Id, name: 'Switch Distribución 48P', type: 'switch', slotStart: 38, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.10.10.5', mac: '00:1A:2B:10:01:05',
    serial: 'SW-DIST-01', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026',
    notes: 'Distribución agregada hacia racks de cómputo y storage'
  });

  // U39: Organizador Horizontal
  const org101bId = uid();
  devices.push({
    id: org101bId, rackId: rack101Id, name: 'Organizador Inter-Switch 1U', type: 'organizer', slotStart: 39, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });

  // U40: Switch Core 10G Nexus
  const swCoreId = uid();
  devices.push({
    id: swCoreId, rackId: rack101Id, name: 'Switch Core Nexus 10G/40G', type: 'switch', slotStart: 40, size: 1,
    mountSide: 'front', power: 450, plugs: 2, ip: '10.10.10.2', mac: '00:1A:2B:10:01:02',
    serial: 'NX-9300-01', brand: 'Cisco', model: 'Nexus 93180YC-FX', user: 'admin', pass: 'nexus2026',
    notes: 'Núcleo de conmutación de ultra baja latencia'
  });

  // U41: Firewall Perimetral Next-Gen
  const fwEdgeId = uid();
  devices.push({
    id: fwEdgeId, rackId: rack101Id, name: 'Firewall Perimetral Next-Gen', type: 'firewall', slotStart: 41, size: 1,
    mountSide: 'front', power: 120, plugs: 2, ip: '10.10.10.1', mac: '00:1A:2B:10:01:01',
    serial: 'FG-100F-01', brand: 'Fortinet', model: 'FortiGate 100F', user: 'admin', pass: 'fortigate2026',
    notes: 'Seguridad perimetral, VPN IPsec y SD-WAN'
  });

  // U42: Router Borde BGP
  const rtrEdgeId = uid();
  devices.push({
    id: rtrEdgeId, rackId: rack101Id, name: 'Router Borde BGP', type: 'router', slotStart: 42, size: 1,
    mountSide: 'front', power: 180, plugs: 2, ip: '200.48.10.1', mac: '00:1A:2B:10:01:00',
    serial: 'ASR-1001-01', brand: 'Cisco', model: 'ASR 1001-X', user: 'admin', pass: 'cisco2026',
    notes: 'Enlace BGP dual a operadores Tier-1'
  });

  // --- RACK 102: VIRTUALIZACIÓN & CÓMPUTO ---
  // U1-U2: UPS Pesado en la Base
  const ups102Id = uid();
  devices.push({
    id: ups102Id, rackId: rack102Id, name: 'UPS Online 3000VA B', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.10.20.2', mac: '00:1A:2B:20:02:01',
    serial: 'UPS-3000-02', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Alimentación redundante Línea B - Cómputo'
  });

  // U3: PDU Trasera
  const pdu102Id = uid();
  devices.push({
    id: pdu102Id, rackId: rack102Id, name: 'PDU Horizontal 8 Tomas B', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });

  // U6-U9: Chasis Blade Modular 4U
  const bladeChassisId = uid();
  devices.push({
    id: bladeChassisId, rackId: rack102Id, name: 'Chasis Blade Modular 4U', type: 'server', slotStart: 6, size: 4,
    mountSide: 'both', power: 1800, plugs: 4, ip: '10.10.30.20', mac: '00:1A:2B:10:02:20',
    serial: 'BLD-SYN-01', brand: 'HPE', model: 'Synergy 12000', notes: 'Alta densidad de procesamiento blade'
  });

  // U10-U11: Nodo Virtualización 01
  const srvNode1Id = uid();
  devices.push({
    id: srvNode1Id, rackId: rack102Id, name: 'Servidor Virtualización Nodo 01', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 550, plugs: 2, ip: '10.10.30.11', mac: '00:1A:2B:10:02:11',
    serial: 'SRV-R740-01', brand: 'Dell', model: 'PowerEdge R740xd', user: 'root', pass: 'vmware2026',
    notes: 'Cluster VMware vSphere ESXi 8.0'
  });

  // U12-U13: Nodo Virtualización 02
  const srvNode2Id = uid();
  devices.push({
    id: srvNode2Id, rackId: rack102Id, name: 'Servidor Virtualización Nodo 02', type: 'server', slotStart: 12, size: 2,
    mountSide: 'both', power: 550, plugs: 2, ip: '10.10.30.12', mac: '00:1A:2B:10:02:12',
    serial: 'SRV-R740-02', brand: 'Dell', model: 'PowerEdge R740xd', user: 'root', pass: 'vmware2026',
    notes: 'Cluster VMware vSphere ESXi 8.0'
  });

  // U14-U15: Servidor Base de Datos SQL
  const srvSqlId = uid();
  devices.push({
    id: srvSqlId, rackId: rack102Id, name: 'Servidor Base de Datos SQL', type: 'server', slotStart: 14, size: 2,
    mountSide: 'both', power: 650, plugs: 2, ip: '10.10.30.15', mac: '00:1A:2B:10:02:15',
    serial: 'SRV-R750-SQL', brand: 'Dell', model: 'PowerEdge R750', user: 'sa', pass: 'sqlcluster2026',
    notes: 'SQL Server Enterprise en High Availability'
  });

  // U16: Servidor Web Frontend 1U
  const srvWebId = uid();
  devices.push({
    id: srvWebId, rackId: rack102Id, name: 'Servidor Web Frontend 1U', type: 'server', slotStart: 16, size: 1,
    mountSide: 'both', power: 250, plugs: 2, ip: '10.10.30.30', mac: '00:1A:2B:10:02:30',
    serial: 'SRV-R340-WEB', brand: 'Dell', model: 'PowerEdge R340', user: 'admin', pass: 'web2026',
    notes: 'Balanceador Nginx Ingress Controller'
  });

  // U38: Patch Panel Cat6A
  const patch102Id = uid();
  devices.push({
    id: patch102Id, rackId: rack102Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'CommScope', model: 'Systimax Cat6A'
  });

  // U39: Organizador Horizontal
  const org102Id = uid();
  devices.push({
    id: org102Id, rackId: rack102Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 39, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });

  // U40: Switch ToR Cómputo 48P
  const swTorCompId = uid();
  devices.push({
    id: swTorCompId, rackId: rack102Id, name: 'Switch ToR Cómputo 48P', type: 'switch', slotStart: 40, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.10.10.21', mac: '00:1A:2B:10:02:40',
    serial: 'SW-TOR-01', brand: 'Cisco', model: 'Catalyst 9300-48T', notes: 'Top of Rack Switch Cómputo'
  });

  // --- RACK 103: ALMACENAMIENTO MASIVO SAN/NAS ---
  // U1-U2: UPS Pesado en la Base
  const ups103Id = uid();
  devices.push({
    id: ups103Id, rackId: rack103Id, name: 'UPS Online 3000VA C', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.10.20.3', mac: '00:1A:2B:20:03:01',
    serial: 'UPS-3000-03', brand: 'APC', model: 'Smart-UPS RT 3000VA'
  });

  // U3: PDU Trasera
  const pdu103Id = uid();
  devices.push({
    id: pdu103Id, rackId: rack103Id, name: 'PDU Horizontal 8 Tomas C', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });

  // U4-U7: Cabina SAN Dell EMC 4U Pesada
  const sanStorageId = uid();
  devices.push({
    id: sanStorageId, rackId: rack103Id, name: 'Cabina SAN Dell EMC 4U', type: 'storage', slotStart: 4, size: 4,
    mountSide: 'both', power: 1200, plugs: 4, ip: '10.10.40.10', mac: '00:1A:2B:10:03:10',
    serial: 'SAN-PST-5000', brand: 'Dell EMC', model: 'PowerStore 5000T', user: 'admin', pass: 'sanadmin2026',
    notes: 'Array All-Flash NVMe para Bases de Datos y Cómputo'
  });

  // U8-U9: Cabina JBOD 2U
  const jbodStorageId = uid();
  devices.push({
    id: jbodStorageId, rackId: rack103Id, name: 'Cabina Expansión JBOD 2U', type: 'storage', slotStart: 8, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.10.40.11', mac: '00:1A:2B:10:03:11',
    serial: 'JBOD-ME424', brand: 'Dell EMC', model: 'ME424 Expansion', notes: 'Expansión de capacidad 24 bahías SAS'
  });

  // U10-U11: Servidor NAS Backup 2U
  const nasStorageId = uid();
  devices.push({
    id: nasStorageId, rackId: rack103Id, name: 'Servidor NAS Backup 2U', type: 'storage', slotStart: 10, size: 2,
    mountSide: 'both', power: 400, plugs: 2, ip: '10.10.40.20', mac: '00:1A:2B:10:03:20',
    serial: 'NAS-RS3621', brand: 'Synology', model: 'RackStation RS3621xs+', user: 'admin', pass: 'nasbackup2026',
    notes: 'Repositorio de respaldo inmutable Veeam'
  });

  // U38: Bandeja ODF Fibra SAN
  const odfSanId = uid();
  devices.push({
    id: odfSanId, rackId: rack103Id, name: 'Bandeja ODF Fibra SAN 24P', type: 'odf', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U',
    notes: 'Interconexión óptica Fibre Channel OM4'
  });

  // U39: Organizador Horizontal
  const org103Id = uid();
  devices.push({
    id: org103Id, rackId: rack103Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 39, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });

  // U40: Switch SAN Fibre Channel 24P
  const swSanId = uid();
  devices.push({
    id: swSanId, rackId: rack103Id, name: 'Switch SAN Fibre Channel 24P', type: 'switch', slotStart: 40, size: 1,
    mountSide: 'front', power: 280, plugs: 2, ip: '10.10.40.2', mac: '00:1A:2B:10:03:02',
    serial: 'SW-FC-01', brand: 'Brocade', model: 'G620 32Gb FC', notes: 'Fabric SAN Principal de almacenamiento'
  });

  // --- RACK 104: SEGURIDAD CCTV & VIDEOVIGILANCIA ---
  // U1-U2: UPS Pesado en la Base
  const ups104Id = uid();
  devices.push({
    id: ups104Id, rackId: rack104Id, name: 'UPS Online 2000VA CCTV', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 2000, plugs: 6, plugsOut: 6, ip: '10.10.20.4', mac: '00:1A:2B:20:04:01',
    serial: 'UPS-2000-01', brand: 'APC', model: 'Smart-UPS RT 2000VA'
  });

  // U3: PDU Trasera
  const pdu104Id = uid();
  devices.push({
    id: pdu104Id, rackId: rack104Id, name: 'PDU Horizontal 8 Tomas D', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });

  // U6-U7: Grabador NVR Enterprise 2U
  const nvrEntId = uid();
  devices.push({
    id: nvrEntId, rackId: rack104Id, name: 'Grabador NVR Enterprise 2U', type: 'nvr', slotStart: 6, size: 2,
    mountSide: 'both', power: 350, plugs: 2, ip: '10.10.60.2', mac: '00:1A:2B:10:04:02',
    serial: 'NVR-64CH-01', brand: 'Hikvision', model: 'DS-9664NI-I8', user: 'admin', pass: 'nvr2026',
    notes: 'Grabador 64 canales RAID-5 CCTV Datacenter'
  });

  // U8: Grabador NVR 1U
  const nvrSecId = uid();
  devices.push({
    id: nvrSecId, rackId: rack104Id, name: 'Grabador NVR Perimetral 1U', type: 'nvr', slotStart: 8, size: 1,
    mountSide: 'both', power: 150, plugs: 1, ip: '10.10.60.3', mac: '00:1A:2B:10:04:03',
    serial: 'NVR-32CH-02', brand: 'Hikvision', model: 'DS-7732NI-I4', notes: 'Grabación 32 canales exteriores'
  });

  // U9: Decodificador Video Wall 1U
  const decoderId = uid();
  devices.push({
    id: decoderId, rackId: rack104Id, name: 'Decodificador Video Wall 1U', type: 'decoder', slotStart: 9, size: 1,
    mountSide: 'both', power: 80, plugs: 1, ip: '10.10.60.5', mac: '00:1A:2B:10:04:05',
    serial: 'DEC-HDMI-01', brand: 'Hikvision', model: 'DS-6916UDI', notes: 'Salidas HDMI matriz para Centro de Monitoreo'
  });

  // U38: Patch Panel Cat6A
  const patch104Id = uid();
  devices.push({
    id: patch104Id, rackId: rack104Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'CommScope', model: 'Systimax Cat6A'
  });

  // U39: Organizador Horizontal
  const org104Id = uid();
  devices.push({
    id: org104Id, rackId: rack104Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 39, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });

  // U40: Switch PoE+ 48P Cámaras
  const swPoeCctvId = uid();
  devices.push({
    id: swPoeCctvId, rackId: rack104Id, name: 'Switch PoE+ 48P Cámaras', type: 'switch', slotStart: 40, size: 1,
    mountSide: 'front', power: 450, plugs: 2, ip: '10.10.60.1', mac: '00:1A:2B:10:04:01',
    serial: 'SW-POE-48P', brand: 'Cisco', model: 'Catalyst 9300-48P', notes: 'Alimentación PoE 802.3at cámaras IP'
  });

  // =========================================================================
  // SALA 2: EDIFICIO CORPORATIVO A (Gabinete IDF Telecomunicaciones 24U)
  // =========================================================================
  const rack201Id = uid();
  racks.push({
    id: rack201Id, roomId: r2, name: 'Rack IDF · Planta Baja', height: 24, color: '#0ea5e9', devices: []
  });

  // U1-U2: UPS Pesado en la Base
  const ups201Id = uid();
  devices.push({
    id: ups201Id, rackId: rack201Id, name: 'UPS Smart-UPS 1500VA', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 1500, plugs: 6, plugsOut: 6, ip: '10.10.20.10', brand: 'APC', model: 'Smart-UPS 1500'
  });

  // U3: PDU Trasera
  const pdu201Id = uid();
  devices.push({
    id: pdu201Id, rackId: rack201Id, name: 'PDU Trasera 6 Tomas', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 6, brand: 'APC', model: 'AP7900B'
  });

  // U6-U7: Servidor Local de Archivos 2U
  const srvCorpId = uid();
  devices.push({
    id: srvCorpId, rackId: rack201Id, name: 'Servidor Archivos Local 2U', type: 'server', slotStart: 6, size: 2,
    mountSide: 'both', power: 400, plugs: 2, ip: '10.10.50.10', mac: '00:1A:2B:20:01:10',
    serial: 'SRV-CORP-01', brand: 'Dell', model: 'PowerEdge R740', notes: 'Active Directory & File Server Local'
  });

  // U21: Patch Panel Cat6A 24P
  const patch201Id = uid();
  devices.push({
    id: patch201Id, rackId: rack201Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 21, size: 1,
    mountSide: 'front', power: 0, plugs: 0
  });

  // U22: Organizador 1U
  const org201Id = uid();
  devices.push({
    id: org201Id, rackId: rack201Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0
  });

  // U23: Switch de Acceso PoE 48P
  const swCorpId = uid();
  devices.push({
    id: swCorpId, rackId: rack201Id, name: 'Switch Acceso PoE 48P', type: 'switch', slotStart: 23, size: 1,
    mountSide: 'front', power: 400, plugs: 2, ip: '10.10.50.2', mac: '00:1A:2B:20:01:02',
    serial: 'SW-CORP-48P', brand: 'Cisco', model: 'Catalyst 9200-48P', notes: 'Distribución usuarios, telefonía y APs'
  });

  // U24: Router Sucursal
  const rtrCorpId = uid();
  devices.push({
    id: rtrCorpId, rackId: rack201Id, name: 'Router Sucursal 1U', type: 'router', slotStart: 24, size: 1,
    mountSide: 'front', power: 100, plugs: 1, ip: '10.10.50.1', mac: '00:1A:2B:20:01:01',
    serial: 'ISR-4331-01', brand: 'Cisco', model: 'ISR 4331', notes: 'Enlace SD-WAN a Data Center'
  });

  // =========================================================================
  // SALA 3: CENTRO DE OPERACIONES & SEGURIDAD (Gabinete SOC 24U)
  // =========================================================================
  const rack301Id = uid();
  racks.push({
    id: rack301Id, roomId: r3, name: 'Rack SOC · Monitoreo & Control', height: 24, color: '#f43f5e', devices: []
  });

  // U1-U2: UPS Pesado en la Base
  const ups301Id = uid();
  devices.push({
    id: ups301Id, rackId: rack301Id, name: 'UPS Smart-UPS 1500VA', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 1500, plugs: 6, plugsOut: 6, ip: '10.10.20.20', brand: 'APC', model: 'Smart-UPS 1500'
  });

  // U3: PDU Trasera
  const pdu301Id = uid();
  devices.push({
    id: pdu301Id, rackId: rack301Id, name: 'PDU Trasera 6 Tomas', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 6, brand: 'APC', model: 'AP7900B'
  });

  // U6-U7: Servidor SIEM SOC
  const srvSocId = uid();
  devices.push({
    id: srvSocId, rackId: rack301Id, name: 'Servidor Eventos SIEM SOC', type: 'server', slotStart: 6, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.10.70.10', mac: '00:1A:2B:30:01:10',
    serial: 'SRV-SOC-01', brand: 'Dell', model: 'PowerEdge R740', notes: 'Analizador de Incidentes de Seguridad'
  });

  // U22: Patch Panel 24P Cat6A
  const patch301Id = uid();
  devices.push({
    id: patch301Id, rackId: rack301Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0
  });

  // U23: Organizador 1U
  const org301Id = uid();
  devices.push({
    id: org301Id, rackId: rack301Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 23, size: 1,
    mountSide: 'front', power: 0, plugs: 0
  });

  // U24: Switch Acceso SOC 24P
  const swSocId = uid();
  devices.push({
    id: swSocId, rackId: rack301Id, name: 'Switch Acceso SOC 24P', type: 'switch', slotStart: 24, size: 1,
    mountSide: 'front', power: 250, plugs: 2, ip: '10.10.70.2', mac: '00:1A:2B:30:01:02',
    serial: 'SW-SOC-24P', brand: 'Cisco', model: 'Catalyst 9200-24P', notes: 'Conectividad estaciones de operadores'
  });

  // =========================================================================
  // EQUIPOS DE PISO (PERIFÉRICOS DE INFRAESTRUCTURA)
  // =========================================================================
  // Periféricos en Sala 1 (Data Center)
  const camDc1 = uid(); const camDc2 = uid(); const prtDc = uid(); const apDc = uid(); const pcDiagDc = uid();
  devices.push(
    { id: camDc1, rackId: null, category: 'floor', roomId: r1, name: 'Cámara Pasillo Frío', type: 'camera', ip: '10.10.60.101', brand: 'Axis', model: 'P3245-V', power: 15, plugs: 1, notes: 'VLAN 60 CCTV' },
    { id: camDc2, rackId: null, category: 'floor', roomId: r1, name: 'Cámara Pasillo Caliente', type: 'camera', ip: '10.10.60.102', brand: 'Axis', model: 'P3245-V', power: 15, plugs: 1, notes: 'VLAN 60 CCTV' },
    { id: prtDc, rackId: null, category: 'floor', roomId: r1, name: 'Impresora Reportes NOC', type: 'printer', ip: '10.10.70.101', brand: 'HP', model: 'LaserJet Pro M404n', power: 120, plugs: 1, notes: 'VLAN 70 Datos' },
    { id: apDc, rackId: null, category: 'floor', roomId: r1, name: 'AP WiFi 6 Datacenter', type: 'ap', ip: '10.10.10.25', brand: 'Ubiquiti', model: 'UniFi U6 Pro', power: 13, plugs: 1, notes: 'WiFi Gestión' },
    { id: pcDiagDc, rackId: null, category: 'floor', roomId: r1, name: 'Consola Diagnóstico Piso', type: 'pc', ip: '10.10.10.50', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'Terminal local' }
  );

  // Periféricos en Sala 2 (Edificio Corporativo A)
  const pcCorp1 = uid(); const pcCorp2 = uid(); const prtCorp = uid(); const telCorp1 = uid(); const telCorp2 = uid(); const apCorp = uid();
  devices.push(
    { id: pcCorp1, rackId: null, category: 'floor', roomId: r2, name: 'Estación Finanzas 01', type: 'pc', ip: '10.10.50.101', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1 },
    { id: pcCorp2, rackId: null, category: 'floor', roomId: r2, name: 'Estación Recepción', type: 'pc', ip: '10.10.50.102', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1 },
    { id: prtCorp, rackId: null, category: 'floor', roomId: r2, name: 'Impresora Multifunción Corp', type: 'printer', ip: '10.10.70.102', brand: 'HP', model: 'LaserJet Enterprise', power: 150, plugs: 1 },
    { id: telCorp1, rackId: null, category: 'floor', roomId: r2, name: 'Teléfono IP Recepción', type: 'phone', ip: '10.10.80.11', brand: 'Cisco', model: 'IP Phone 8841', power: 10, plugs: 1 },
    { id: telCorp2, rackId: null, category: 'floor', roomId: r2, name: 'Teléfono IP Gerencia', type: 'phone', ip: '10.10.80.12', brand: 'Cisco', model: 'IP Phone 8841', power: 10, plugs: 1 },
    { id: apCorp, rackId: null, category: 'floor', roomId: r2, name: 'AP WiFi Corporativo', type: 'ap', ip: '10.10.10.26', brand: 'Ubiquiti', model: 'UniFi U6 Pro', power: 13, plugs: 1 }
  );

  // Periféricos en Sala 3 (Centro de Operaciones SOC)
  const pcSoc1 = uid(); const pcSoc2 = uid(); const camSoc = uid(); const apSoc = uid();
  devices.push(
    { id: pcSoc1, rackId: null, category: 'floor', roomId: r3, name: 'Estación Operador SOC 1', type: 'pc', ip: '10.10.70.101', brand: 'Dell', model: 'Precision 3650', power: 150, plugs: 1 },
    { id: pcSoc2, rackId: null, category: 'floor', roomId: r3, name: 'Estación Operador SOC 2', type: 'pc', ip: '10.10.70.102', brand: 'Dell', model: 'Precision 3650', power: 150, plugs: 1 },
    { id: camSoc, rackId: null, category: 'floor', roomId: r3, name: 'Cámara Domo Sala SOC', type: 'camera', ip: '10.10.60.103', brand: 'Axis', model: 'P3245-V', power: 15, plugs: 1 },
    { id: apSoc, rackId: null, category: 'floor', roomId: r3, name: 'AP WiFi Sala Operaciones', type: 'ap', ip: '10.10.10.27', brand: 'Ubiquiti', model: 'UniFi U6 Pro', power: 13, plugs: 1 }
  );

  // =========================================================================
  // CABLEADO ESTRUCTURADO Y ENLACES (FIBRA, DAC Y COBRE CAT6A)
  // =========================================================================
  // 1. Enlaces Troncales de Red (Backbone Inter-Rack desde Core Switch en Rack 101)
  // - Hacia Switch ToR Cómputo (Rack 102)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/1',
    targetDeviceId: swTorCompId, targetPort: 'Te1/1/1',
    cableType: 'Fibra SM', color: '#38bdf8',
    vlanId: 1, vlanName: 'Default / Troncal'
  });
  // - Hacia Switch SAN Fibre Channel (Rack 103)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/2',
    targetDeviceId: swSanId, targetPort: 'Te1/1/1',
    cableType: 'Fibra OM4', color: '#06b6d4',
    vlanId: 1, vlanName: 'Default / Troncal'
  });
  // - Hacia Switch PoE CCTV (Rack 104)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/3',
    targetDeviceId: swPoeCctvId, targetPort: 'Te1/1/1',
    cableType: 'Fibra SM', color: '#f43f5e',
    vlanId: 1, vlanName: 'Default / Troncal'
  });
  // - Hacia Switch Distribución local (Rack 101)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/4',
    targetDeviceId: swDistId, targetPort: 'Te1/1/1',
    cableType: 'DAC', color: '#3b82f6',
    vlanId: 1, vlanName: 'Default / Troncal'
  });
  // - Inter-Sala: Hacia Switch Edificio Corporativo A (Rack 201)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/5',
    targetDeviceId: swCorpId, targetPort: 'Te1/1/1',
    cableType: 'Fibra SM', color: '#0ea5e9',
    vlanId: 1, vlanName: 'Default / Troncal'
  });
  // - Inter-Sala: Hacia Switch SOC (Rack 301)
  connections.push({
    id: uid(), sourceDeviceId: swCoreId, sourcePort: 'Te1/0/6',
    targetDeviceId: swSocId, targetPort: 'Te1/1/1',
    cableType: 'Fibra SM', color: '#8b5cf6',
    vlanId: 1, vlanName: 'Default / Troncal'
  });

  // 2. Borde e Internet (Rack 101)
  // Router Borde -> Firewall
  connections.push({
    id: uid(), sourceDeviceId: rtrEdgeId, sourcePort: 'Gi0/0/0',
    targetDeviceId: fwEdgeId, targetPort: 'WAN1',
    cableType: 'DAC', color: '#ef4444',
    vlanId: 99, vlanName: 'DMZ / Borde'
  });
  // Firewall -> Switch Core
  connections.push({
    id: uid(), sourceDeviceId: fwEdgeId, sourcePort: 'LAN1',
    targetDeviceId: swCoreId, targetPort: 'Te1/0/48',
    cableType: 'DAC', color: '#ef4444',
    vlanId: 99, vlanName: 'DMZ / Borde'
  });
  // Servidor Syslog -> Switch Distribución
  connections.push({
    id: uid(), sourceDeviceId: srvSyslogId, sourcePort: 'eth0',
    targetDeviceId: swDistId, targetPort: 'Gi1/0/10',
    cableType: 'Cobre', color: '#10b981',
    vlanId: 10, vlanName: 'Gestión / Mgmt'
  });

  // 3. Conexiones Servidores Cómputo (Rack 102)
  connections.push(
    { id: uid(), sourceDeviceId: srvNode1Id, sourcePort: 'eth0', targetDeviceId: swTorCompId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: srvNode2Id, sourcePort: 'eth0', targetDeviceId: swTorCompId, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: srvSqlId,   sourcePort: 'eth0', targetDeviceId: swTorCompId, targetPort: 'Gi1/0/3', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: srvWebId,   sourcePort: 'eth0', targetDeviceId: swTorCompId, targetPort: 'Gi1/0/4', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: bladeChassisId, sourcePort: 'eth0', targetDeviceId: swTorCompId, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' }
  );

  // 4. Conexiones Storage SAN / NAS (Rack 103)
  connections.push(
    { id: uid(), sourceDeviceId: sanStorageId, sourcePort: 'fc0', targetDeviceId: swSanId, targetPort: 'fc1/1', cableType: 'Fibra OM4', color: '#06b6d4', vlanId: 50, vlanName: 'Storage / SAN' },
    { id: uid(), sourceDeviceId: jbodStorageId, sourcePort: 'sas0', targetDeviceId: sanStorageId, targetPort: 'exp0', cableType: 'Cobre', color: '#64748b', vlanId: 50, vlanName: 'Storage / SAN' },
    { id: uid(), sourceDeviceId: nasStorageId, sourcePort: 'eth0', targetDeviceId: swCoreId, targetPort: 'Te1/0/10', cableType: 'Fibra OM4', color: '#06b6d4', vlanId: 50, vlanName: 'Storage / SAN' }
  );

  // 5. Conexiones Seguridad CCTV (Rack 104)
  connections.push(
    { id: uid(), sourceDeviceId: nvrEntId, sourcePort: 'eth0', targetDeviceId: swPoeCctvId, targetPort: 'Gi1/0/47', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' },
    { id: uid(), sourceDeviceId: nvrSecId, sourcePort: 'eth0', targetDeviceId: swPoeCctvId, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' },
    { id: uid(), sourceDeviceId: decoderId, sourcePort: 'eth0', targetDeviceId: swPoeCctvId, targetPort: 'Gi1/0/46', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' }
  );

  // 6. Conexiones Periféricos de Piso a Switches
  // En Sala 1 (Data Center)
  connections.push(
    { id: uid(), sourceDeviceId: camDc1, sourcePort: 'eth0', targetDeviceId: swPoeCctvId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' },
    { id: uid(), sourceDeviceId: camDc2, sourcePort: 'eth0', targetDeviceId: swPoeCctvId, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' },
    { id: uid(), sourceDeviceId: prtDc,  sourcePort: 'eth0', targetDeviceId: swDistId, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#f59e0b', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: apDc,   sourcePort: 'eth0', targetDeviceId: swDistId, targetPort: 'Gi1/0/21', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: pcDiagDc, sourcePort: 'eth0', targetDeviceId: swDistId, targetPort: 'Gi1/0/22', cableType: 'Cobre', color: '#10b981', vlanId: 10, vlanName: 'Gestión / Mgmt' }
  );

  // En Sala 2 (Edificio Corporativo A)
  connections.push(
    { id: uid(), sourceDeviceId: srvCorpId, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: pcCorp1, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: pcCorp2, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/11', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: prtCorp, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#f59e0b', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: telCorp1, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#8b5cf6', vlanId: 30, vlanName: 'VoIP / Telefonía' },
    { id: uid(), sourceDeviceId: telCorp2, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/21', cableType: 'Cobre', color: '#8b5cf6', vlanId: 30, vlanName: 'VoIP / Telefonía' },
    { id: uid(), sourceDeviceId: apCorp, sourcePort: 'eth0', targetDeviceId: swCorpId, targetPort: 'Gi1/0/30', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'Datos Corporativos' }
  );

  // En Sala 3 (Centro de Operaciones SOC)
  connections.push(
    { id: uid(), sourceDeviceId: srvSocId, sourcePort: 'eth0', targetDeviceId: swSocId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: pcSoc1, sourcePort: 'eth0', targetDeviceId: swSocId, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: pcSoc2, sourcePort: 'eth0', targetDeviceId: swSocId, targetPort: 'Gi1/0/6', cableType: 'Cobre', color: '#10b981', vlanId: 20, vlanName: 'Datos Corporativos' },
    { id: uid(), sourceDeviceId: camSoc, sourcePort: 'eth0', targetDeviceId: swSocId, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#f43f5e', vlanId: 40, vlanName: 'CCTV / Seguridad' },
    { id: uid(), sourceDeviceId: apSoc, sourcePort: 'eth0', targetDeviceId: swSocId, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'Datos Corporativos' }
  );

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: r1,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if (typeof initTopoPositions === 'function') initTopoPositions();
  if (typeof renderAll === 'function') renderAll();
  
  if (typeof notify === 'function') {
    notify('Plantilla de Centro de Datos profesional cargada con éxito (Norma TIA-942)', 'success');
  }
}

/**
 * loadUniversityDemoData — Plantilla de Campus Universitario a Gran Escala
 * Universidad Tecnológica Nacional (UTN)
 * 
 * Implementa una arquitectura jerárquica de 3 capas:
 * - Capa de Núcleo (Core): 2x Switches L3 10/25/40G Nexus/Catalyst en HA (VSS/vPC)
 * - Capa de Distribución: Switches L3 por edificio (ADM, AUL, ING, TIC, RES, etc.)
 * - Capa de Acceso: Switches PoE+ para puestos de trabajo, telefonía IP, cámaras y APs
 * - Perímetro y DMZ: Routers BGP multi-homing ISP duales y Clúster Firewall NGFW en HA
 * - Data Center ToR: Segmentación de cómputo, bases de datos (ERP, Académico, LMS), SAN y DMZ
 * - 24 VLANs según plan de direccionamiento 10.0.0.0/8
 */
function loadUniversityDemoData() {
  // 1. Definición de Salas / Edificios del Campus UTN
  const rDcc = uid(); // DCC: Data Center Central
  const rTic = uid(); // TIC: Tecnología, Redes, NOC & SOC
  const rAdm = uid(); // ADM: Administración (Rectorado, Finanzas, RRHH)
  const rAul = uid(); // AUL: Aulas Generales (3 Pisos)
  const rIng = uid(); // ING: Facultad de Ingeniería & Laboratorios
  const rBib = uid(); // BIB: Biblioteca Central
  const rLab = uid(); // LAB: Laboratorios Especializados de Investigación
  const rCam = uid(); // CAM: Centro de Seguridad & Monitoreo CCTV
  const rDep = uid(); // DEP: Deportes & Polideportivo
  const rRes = uid(); // RES: Residencia Estudiantil

  const rooms = [
    { id: rDcc, name: 'DCC · Centro de Datos Central' },
    { id: rTic, name: 'TIC · Tecnología, NOC & SOC' },
    { id: rAdm, name: 'ADM · Edificio Administración' },
    { id: rAul, name: 'AUL · Edificio Aulas Generales' },
    { id: rIng, name: 'ING · Facultad de Ingeniería' },
    { id: rBib, name: 'BIB · Biblioteca Central' },
    { id: rLab, name: 'LAB · Laboratorios de Investigación' },
    { id: rCam, name: 'CAM · Seguridad & CCTV' },
    { id: rDep, name: 'DEP · Deportes & Polideportivo' },
    { id: rRes, name: 'RES · Residencia Estudiantil' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  // =========================================================================
  // 2. GABINETES (RACKS ESTRUCTURADOS)
  // =========================================================================
  // Racks en DCC (Data Center Central)
  const rackDcc01Id = uid();
  const rackDcc02Id = uid();
  const rackDcc03Id = uid();

  // Racks en TIC (Tecnología, NOC & Perímetro)
  const rackTic01Id = uid();
  const rackTic02Id = uid();

  // Racks en Edificios de Campus
  const rackAdm01Id = uid();
  const rackAul01Id = uid();
  const rackIng01Id = uid();
  const rackBib01Id = uid();
  const rackLab01Id = uid();
  const rackCam01Id = uid();
  const rackDep01Id = uid();
  const rackRes01Id = uid();

  racks.push(
    { id: rackDcc01Id, roomId: rDcc, name: 'DCC-01 · Servidores Principales', height: 42, color: '#0ea5e9', devices: [] },
    { id: rackDcc02Id, roomId: rDcc, name: 'DCC-02 · Aplicaciones & Storage', height: 42, color: '#8b5cf6', devices: [] },
    { id: rackDcc03Id, roomId: rDcc, name: 'DCC-03 · Borde DMZ & ToR', height: 42, color: '#10b981', devices: [] },
    { id: rackTic01Id, roomId: rTic, name: 'TIC-01 · Core Backbone & Perímetro', height: 42, color: '#06b6d4', devices: [] },
    { id: rackTic02Id, roomId: rTic, name: 'TIC-02 · Distribución & NOC/SOC', height: 42, color: '#3b82f6', devices: [] },
    { id: rackAdm01Id, roomId: rAdm, name: 'ADM-01 · Distribución Rectorado', height: 42, color: '#f59e0b', devices: [] },
    { id: rackAul01Id, roomId: rAul, name: 'AUL-01 · Distribución Aulas (3 Pisos)', height: 42, color: '#ec4899', devices: [] },
    { id: rackIng01Id, roomId: rIng, name: 'ING-01 · Distribución Ingeniería & Labs', height: 42, color: '#6366f1', devices: [] },
    { id: rackBib01Id, roomId: rBib, name: 'BIB-01 · Comunicaciones & Catálogo', height: 24, color: '#14b8a6', devices: [] },
    { id: rackLab01Id, roomId: rLab, name: 'LAB-01 · Red Científica & SCADA', height: 24, color: '#eab308', devices: [] },
    { id: rackCam01Id, roomId: rCam, name: 'CAM-01 · Seguridad & CCTV Central', height: 42, color: '#f43f5e', devices: [] },
    { id: rackDep01Id, roomId: rDep, name: 'DEP-01 · Comunicaciones Deportes', height: 18, color: '#84cc16', devices: [] },
    { id: rackRes01Id, roomId: rRes, name: 'RES-01 · Distribución Residencias', height: 24, color: '#a855f7', devices: [] }
  );

  // =========================================================================
  // 3. EQUIPOS DE RACK — SALA 1: DCC (DATA CENTER CENTRAL)
  // =========================================================================
  // --- RACK DCC-01: SERVIDORES PRINCIPALES ---
  const upsDcc01Id = uid();
  devices.push({
    id: upsDcc01Id, rackId: rackDcc01Id, name: 'UPS Online 3000VA A', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.61', mac: '00:1A:2B:12:01:61',
    serial: 'UPS-DCC-01A', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Alimentación redundante Servidores Core Línea A'
  });
  const pduDcc01Id = uid();
  devices.push({
    id: pduDcc01Id, rackId: rackDcc01Id, name: 'PDU Posterior Monitoreable 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 10, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B', notes: 'PDU Trasera Servidores'
  });
  const ad01Id = uid();
  devices.push({
    id: ad01Id, rackId: rackDcc01Id, name: 'AD01 · Active Directory Primario', type: 'server', slotStart: 4, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.20.11', mac: '00:1A:2B:90:20:11',
    serial: 'SRV-AD01', brand: 'Dell', model: 'PowerEdge R750', user: 'administrator', pass: 'utnAdmin2026!',
    notes: 'Controlador de Dominio dc01.utn.edu, Kerberos & LDAP (VLAN 20 SERVERS)'
  });
  const ad02Id = uid();
  devices.push({
    id: ad02Id, rackId: rackDcc01Id, name: 'AD02 · Active Directory Réplica', type: 'server', slotStart: 6, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.20.12', mac: '00:1A:2B:90:20:12',
    serial: 'SRV-AD02', brand: 'Dell', model: 'PowerEdge R750', user: 'administrator', pass: 'utnAdmin2026!',
    notes: 'Controlador de Dominio dc02.utn.edu, Catálogo Global (VLAN 20 SERVERS)'
  });
  const dns01Id = uid();
  devices.push({
    id: dns01Id, rackId: rackDcc01Id, name: 'DNS01 · Servidor DNS Primario', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.90.20.21', mac: '00:1A:2B:90:20:21',
    serial: 'SRV-DNS01', brand: 'HPE', model: 'ProLiant DL380 Gen10', user: 'admin', pass: 'dnsRoot2026!',
    notes: 'Servidor DNS interno autoritativo dns01.utn.edu (VLAN 20 SERVERS)'
  });
  const dns02Id = uid();
  devices.push({
    id: dns02Id, rackId: rackDcc01Id, name: 'DNS02 · Servidor DNS Secundario', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.90.20.22', mac: '00:1A:2B:90:20:22',
    serial: 'SRV-DNS02', brand: 'HPE', model: 'ProLiant DL380 Gen10', user: 'admin', pass: 'dnsRoot2026!',
    notes: 'Servidor DNS secundario dns02.utn.edu (VLAN 20 SERVERS)'
  });
  const dhcp01Id = uid();
  devices.push({
    id: dhcp01Id, rackId: rackDcc01Id, name: 'DHCP01 · Servidor DHCP Alta Disp.', type: 'server', slotStart: 12, size: 2,
    mountSide: 'both', power: 350, plugs: 2, ip: '10.90.20.31', mac: '00:1A:2B:90:20:31',
    serial: 'SRV-DHCP01', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'dhcpCluster2026',
    notes: 'Failover DHCP Partner 1 (VLAN 20 SERVERS - Rangos Campus)'
  });
  const dhcp02Id = uid();
  devices.push({
    id: dhcp02Id, rackId: rackDcc01Id, name: 'DHCP02 · Servidor DHCP Failover', type: 'server', slotStart: 14, size: 2,
    mountSide: 'both', power: 350, plugs: 2, ip: '10.90.20.32', mac: '00:1A:2B:90:20:32',
    serial: 'SRV-DHCP02', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'dhcpCluster2026',
    notes: 'Failover DHCP Partner 2 (VLAN 20 SERVERS)'
  });
  const ntpMonId = uid();
  devices.push({
    id: ntpMonId, rackId: rackDcc01Id, name: 'NTP-MON01 · Servidor NTP & Zabbix', type: 'server', slotStart: 16, size: 2,
    mountSide: 'both', power: 400, plugs: 2, ip: '10.90.20.41', mac: '00:1A:2B:90:20:41',
    serial: 'SRV-NTP-MON', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'zabbixPass2026',
    notes: 'Reloj Stratum 1 y Monitoreo SNMP Infraestructura (VLAN 20 SERVERS)'
  });
  const syslogId = uid();
  devices.push({
    id: syslogId, rackId: rackDcc01Id, name: 'SYSLOG01 · Servidor Central Logs SIEM', type: 'server', slotStart: 18, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.20.61', mac: '00:1A:2B:90:20:61',
    serial: 'SRV-SYSLOG01', brand: 'Dell', model: 'PowerEdge R750', user: 'admin', pass: 'siemSecure2026',
    notes: 'Recolección centralizada Syslog, Wazuh y SIEM (VLAN 20 SERVERS)'
  });
  const kvmDcc01Id = uid();
  devices.push({
    id: kvmDcc01Id, rackId: rackDcc01Id, name: 'Consola KVM LCD 1U', type: 'kvm', slotStart: 21, size: 1,
    mountSide: 'both', power: 25, plugs: 1, brand: 'ATEN', model: 'CL1000M', notes: 'Pantalla retráctil y teclado local'
  });
  const trayDcc01Id = uid();
  devices.push({
    id: trayDcc01Id, rackId: rackDcc01Id, name: 'Bandeja Porta-Herramientas 1U', type: 'tray', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Genérica', model: 'Shelf 1U', notes: 'Zona ergonómica de trabajo'
  });
  const orgDcc01Id = uid();
  devices.push({
    id: orgDcc01Id, rackId: rackDcc01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppDcc01Id = uid();
  devices.push({
    id: ppDcc01Id, rackId: rackDcc01Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const swTorDcc01Id = uid();
  devices.push({
    id: swTorDcc01Id, rackId: rackDcc01Id, name: 'Switch ToR DCC-01 48P 10G', type: 'switch', slotStart: 39, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.51', mac: '00:1A:2B:12:01:51',
    serial: 'TOR-DCC-01', brand: 'Cisco', model: 'Nexus 9348GC-FXP', user: 'admin', pass: 'cisco2026!',
    notes: 'Switch Top-of-Rack para Servidores Base (VLAN 10 MGMT)'
  });
  const odfDcc01Id = uid();
  devices.push({
    id: odfDcc01Id, rackId: rackDcc01Id, name: 'ODF Fibra Troncal 24P', type: 'odf', slotStart: 40, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U', notes: 'Troncal óptico inter-rack'
  });

  // --- RACK DCC-02: APLICACIONES, ERP & STORAGE ---
  const upsDcc02Id = uid();
  devices.push({
    id: upsDcc02Id, rackId: rackDcc02Id, name: 'UPS Online 3000VA B', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.62', mac: '00:1A:2B:12:01:62',
    serial: 'UPS-DCC-02B', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Alimentación redundante Almacenamiento & ERP Línea B'
  });
  const pduDcc02Id = uid();
  devices.push({
    id: pduDcc02Id, rackId: rackDcc02Id, name: 'PDU Posterior Monitoreable 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 10, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const sanStorageId = uid();
  devices.push({
    id: sanStorageId, rackId: rackDcc02Id, name: 'NAS01 · Cabina Almacenamiento SAN/NAS', type: 'storage', slotStart: 4, size: 4,
    mountSide: 'both', power: 800, plugs: 4, ip: '10.90.220.11', mac: '00:1A:2B:90:22:11',
    serial: 'SAN-AFF-A250', brand: 'NetApp', model: 'AFF A250 NVMe', user: 'admin', pass: 'netappStorage2026',
    notes: 'Volúmenes iSCSI/NFS para BDs y Máquinas Virtuales (VLAN 220 STORAGE - 10.90.220.0/24)'
  });
  const backup01Id = uid();
  devices.push({
    id: backup01Id, rackId: rackDcc02Id, name: 'BACKUP01 · Servidor Veeam Backup', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 550, plugs: 2, ip: '10.90.210.11', mac: '00:1A:2B:90:21:11',
    serial: 'SRV-BKP01', brand: 'HPE', model: 'ProLiant DL380 con LTO-8', user: 'admin', pass: 'veeamBackup2026',
    notes: 'Repositorio de Respaldos y Cinta Inmutable (VLAN 210 BACKUP - 10.90.210.0/24)'
  });
  const erp01Id = uid();
  devices.push({
    id: erp01Id, rackId: rackDcc02Id, name: 'ERP01 · Servidor ERP Institucional', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.150.11', mac: '00:1A:2B:90:15:11',
    serial: 'SRV-ERP01', brand: 'Dell', model: 'PowerEdge R750', user: 'admin', pass: 'erpProd2026!',
    notes: 'Servidor Aplicativo ERP Finanzas/RRHH (VLAN 150 ERP - 10.90.150.0/24)'
  });
  const erp02Id = uid();
  devices.push({
    id: erp02Id, rackId: rackDcc02Id, name: 'ERP02 · Base de Datos ERP Cluster', type: 'server', slotStart: 12, size: 2,
    mountSide: 'both', power: 600, plugs: 2, ip: '10.90.150.12', mac: '00:1A:2B:90:15:12',
    serial: 'SRV-ERP02', brand: 'Dell', model: 'PowerEdge R750', user: 'oracle', pass: 'oraDbCluster2026',
    notes: 'Oracle Database Enterprise para ERP Institucional (VLAN 150 ERP)'
  });
  const acad01Id = uid();
  devices.push({
    id: acad01Id, rackId: rackDcc02Id, name: 'ACADEMICO01 · Servidor Gestión Académica', type: 'server', slotStart: 14, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.160.11', mac: '00:1A:2B:90:16:11',
    serial: 'SRV-ACAD01', brand: 'Dell', model: 'PowerEdge R750', user: 'admin', pass: 'acadProd2026!',
    notes: 'Gestión de Alumnos, Inscripciones y Actas (VLAN 160 ACADEMICO - 10.90.160.0/24)'
  });
  const acad02Id = uid();
  devices.push({
    id: acad02Id, rackId: rackDcc02Id, name: 'ACADEMICO02 · BD Sistema Académico', type: 'server', slotStart: 16, size: 2,
    mountSide: 'both', power: 550, plugs: 2, ip: '10.90.160.12', mac: '00:1A:2B:90:16:12',
    serial: 'SRV-ACAD02', brand: 'Dell', model: 'PowerEdge R750', user: 'postgres', pass: 'acadPg2026!',
    notes: 'Cluster PostgreSQL para Sistema Académico (VLAN 160 ACADEMICO)'
  });
  const lms01Id = uid();
  devices.push({
    id: lms01Id, rackId: rackDcc02Id, name: 'LMS01 · Campus Virtual Moodle/Canvas', type: 'server', slotStart: 18, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.90.160.21', mac: '00:1A:2B:90:16:21',
    serial: 'SRV-LMS01', brand: 'HPE', model: 'ProLiant DL380 Gen10', user: 'admin', pass: 'lmsMoodle2026!',
    notes: 'Plataforma Virtual de Aprendizaje para 5000 estudiantes (VLAN 160 ACADEMICO)'
  });
  const orgDcc02Id = uid();
  devices.push({
    id: orgDcc02Id, rackId: rackDcc02Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppDcc02Id = uid();
  devices.push({
    id: ppDcc02Id, rackId: rackDcc02Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const swTorDcc02Id = uid();
  devices.push({
    id: swTorDcc02Id, rackId: rackDcc02Id, name: 'Switch ToR DCC-02 48P 10G', type: 'switch', slotStart: 39, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.52', mac: '00:1A:2B:12:01:52',
    serial: 'TOR-DCC-02', brand: 'Cisco', model: 'Nexus 9348GC-FXP', user: 'admin', pass: 'cisco2026!',
    notes: 'Switch Top-of-Rack para Storage y Aplicaciones (VLAN 10 MGMT)'
  });
  const odfDcc02Id = uid();
  devices.push({
    id: odfDcc02Id, rackId: rackDcc02Id, name: 'ODF Fibra Troncal 24P', type: 'odf', slotStart: 40, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // --- RACK DCC-03: BORDE DMZ & INTERCONNECT TOR ---
  const upsDcc03Id = uid();
  devices.push({
    id: upsDcc03Id, rackId: rackDcc03Id, name: 'UPS Online 3000VA C', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.63', mac: '00:1A:2B:12:01:63',
    serial: 'UPS-DCC-03C', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Alimentación redundante DMZ y Redes ToR'
  });
  const pduDcc03Id = uid();
  devices.push({
    id: pduDcc03Id, rackId: rackDcc03Id, name: 'PDU Posterior Monitoreable 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 10, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const web01Id = uid();
  devices.push({
    id: web01Id, rackId: rackDcc03Id, name: 'WEB01 · Portal Institucional (DMZ)', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.90.200.11', mac: '00:1A:2B:90:20:01',
    serial: 'SRV-WEB01', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'nginxPub2026!',
    notes: 'Servidor Web Público www.utn.edu con WAF (VLAN 200 DMZ - 10.90.200.0/24)'
  });
  const mail01Id = uid();
  devices.push({
    id: mail01Id, rackId: rackDcc03Id, name: 'MAIL01 · Correo Institucional (DMZ)', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.90.200.21', mac: '00:1A:2B:90:20:02',
    serial: 'SRV-MAIL01', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'mailUtn2026!',
    notes: 'Servidor de Correo mail.utn.edu Postfix/Exchange Edge (VLAN 200 DMZ)'
  });
  const orgDcc03Id = uid();
  devices.push({
    id: orgDcc03Id, rackId: rackDcc03Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 36, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppDcc03Id = uid();
  devices.push({
    id: ppDcc03Id, rackId: rackDcc03Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const swTorDmzId = uid();
  devices.push({
    id: swTorDmzId, rackId: rackDcc03Id, name: 'Switch ToR DMZ 24P Gigabit', type: 'switch', slotStart: 38, size: 1,
    mountSide: 'front', power: 180, plugs: 2, ip: '10.120.10.53', mac: '00:1A:2B:12:01:53',
    serial: 'TOR-DMZ-24P', brand: 'Cisco', model: 'Catalyst 9300-24T', user: 'admin', pass: 'cisco2026!',
    notes: 'Switch aislado para zona desmilitarizada DMZ (VLAN 10 MGMT / VLAN 200 DMZ)'
  });
  const swDccInterconnectId = uid();
  devices.push({
    id: swDccInterconnectId, rackId: rackDcc03Id, name: 'Switch ToR DCC Interconnect 48P 25/100G', type: 'switch', slotStart: 39, size: 1,
    mountSide: 'front', power: 450, plugs: 2, ip: '10.120.10.50', mac: '00:1A:2B:12:01:50',
    serial: 'NX-93180-DCC', brand: 'Cisco', model: 'Nexus 93180YC-FX', user: 'admin', pass: 'nexus2026!',
    notes: 'Agregador ToR de alta velocidad hacia Core del Campus (VLAN 10 MGMT)'
  });
  const odfDcc03Id = uid();
  devices.push({
    id: odfDcc03Id, rackId: rackDcc03Id, name: 'ODF Fibra Troncal Campus 48P', type: 'odf', slotStart: 40, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 2U', notes: 'Distribuidor óptico hacia TIC/Core'
  });

  // =========================================================================
  // 4. EQUIPOS DE RACK — SALA 2: TIC (TECNOLOGÍA, NOC & REDES)
  // =========================================================================
  // --- RACK TIC-01: CORE BACKBONE & PERÍMETRO ---
  const upsTic01Id = uid();
  devices.push({
    id: upsTic01Id, rackId: rackTic01Id, name: 'UPS Online Modular 3000VA', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.64', mac: '00:1A:2B:12:01:64',
    serial: 'UPS-TIC-01', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Respaldo eléctrico para Core y Borde ISP'
  });
  const pduTic01Id = uid();
  devices.push({
    id: pduTic01Id, rackId: rackTic01Id, name: 'PDU Posterior Monitoreable 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 10, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const pbx01Id = uid();
  devices.push({
    id: pbx01Id, rackId: rackTic01Id, name: 'PBX01 · Servidor Telefonía IP Asterisk/CUCM', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 400, plugs: 2, ip: '10.130.70.10', mac: '00:1A:2B:13:07:10',
    serial: 'SRV-PBX01', brand: 'Cisco', model: 'Business Edition 6000', user: 'admin', pass: 'ciscoVoice2026',
    notes: 'Central IP PBX SIP para 500 extensiones universitarias (VLAN 70 VOICE - 10.130.70.0/24)'
  });
  const wlc01Id = uid();
  devices.push({
    id: wlc01Id, rackId: rackTic01Id, name: 'WLC-01 · Wireless Controller Primario', type: 'switch', slotStart: 12, size: 1,
    mountSide: 'front', power: 250, plugs: 2, ip: '10.120.10.15', mac: '00:1A:2B:12:01:15',
    serial: 'WLC-9800-01', brand: 'Cisco', model: 'Catalyst 9800-40', user: 'admin', pass: 'wifiAdmin2026!',
    notes: 'Controlador de 250 Access Points Wi-Fi 6 multi-SSID (VLAN 10 MGMT)'
  });
  const wlc02Id = uid();
  devices.push({
    id: wlc02Id, rackId: rackTic01Id, name: 'WLC-02 · Wireless Controller Secundario HA', type: 'switch', slotStart: 13, size: 1,
    mountSide: 'front', power: 250, plugs: 2, ip: '10.120.10.16', mac: '00:1A:2B:12:01:16',
    serial: 'WLC-9800-02', brand: 'Cisco', model: 'Catalyst 9800-40', user: 'admin', pass: 'wifiAdmin2026!',
    notes: 'Alta disponibilidad SSO (Stateful Switchover) para Wi-Fi (VLAN 10 MGMT)'
  });
  const kvmTic01Id = uid();
  devices.push({
    id: kvmTic01Id, rackId: rackTic01Id, name: 'Consola KVM LCD 1U', type: 'kvm', slotStart: 21, size: 1,
    mountSide: 'both', power: 25, plugs: 1, brand: 'ATEN', model: 'CL1000M'
  });
  const odfCampusId = uid();
  devices.push({
    id: odfCampusId, rackId: rackTic01Id, name: 'ODF Troncal Campus OS2 48P', type: 'odf', slotStart: 35, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U', notes: 'Backbone de fibra óptica hacia todos los edificios'
  });
  const swCore01Id = uid();
  devices.push({
    id: swCore01Id, rackId: rackTic01Id, name: 'CORE-01 · Switch Core Backbone L3 Primario', type: 'switch', slotStart: 36, size: 1,
    mountSide: 'front', power: 450, plugs: 2, ip: '10.120.10.1', mac: '00:1A:2B:12:01:01',
    serial: 'CORE-CAT9500-01', brand: 'Cisco', model: 'Catalyst 9500-48Y4C', user: 'admin', pass: 'coreUtn2026!',
    notes: 'Switch Core Backbone 40G/100G OSPF/BGP/VRRP Gateway Principal (VLAN 10 MGMT - 10.120.10.1)'
  });
  const swCore02Id = uid();
  devices.push({
    id: swCore02Id, rackId: rackTic01Id, name: 'CORE-02 · Switch Core Backbone L3 Redundante', type: 'switch', slotStart: 37, size: 1,
    mountSide: 'front', power: 450, plugs: 2, ip: '10.120.10.2', mac: '00:1A:2B:12:01:02',
    serial: 'CORE-CAT9500-02', brand: 'Cisco', model: 'Catalyst 9500-48Y4C', user: 'admin', pass: 'coreUtn2026!',
    notes: 'Switch Core Backbone Secundario HA MLAG/StackWise (VLAN 10 MGMT - 10.120.10.2)'
  });
  const orgTic01Id = uid();
  devices.push({
    id: orgTic01Id, rackId: rackTic01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const fw01Id = uid();
  devices.push({
    id: fw01Id, rackId: rackTic01Id, name: 'FW-01 · Firewall Perimetral Next-Gen Master', type: 'firewall', slotStart: 39, size: 1,
    mountSide: 'front', power: 120, plugs: 2, ip: '10.120.10.3', mac: '00:1A:2B:12:01:03',
    serial: 'FG-200F-01', brand: 'Fortinet', model: 'FortiGate 200F', user: 'admin', pass: 'fortiMaster2026!',
    notes: 'Inspección NGFW, IPS, VPN IPsec/SSL, NAT e Inspección SSL (VLAN 10 MGMT / WAN)'
  });
  const fw02Id = uid();
  devices.push({
    id: fw02Id, rackId: rackTic01Id, name: 'FW-02 · Firewall Perimetral Next-Gen Slave HA', type: 'firewall', slotStart: 40, size: 1,
    mountSide: 'front', power: 120, plugs: 2, ip: '10.120.10.4', mac: '00:1A:2B:12:01:04',
    serial: 'FG-200F-02', brand: 'Fortinet', model: 'FortiGate 200F', user: 'admin', pass: 'fortiMaster2026!',
    notes: 'Cluster High Availability A-P con sincronización de estado (VLAN 10 MGMT / WAN)'
  });
  const rtrIsp1Id = uid();
  devices.push({
    id: rtrIsp1Id, rackId: rackTic01Id, name: 'ROUTER-01 · Borde BGP ISP-1 (10 Gbps)', type: 'router', slotStart: 41, size: 1,
    mountSide: 'front', power: 180, plugs: 2, ip: '200.48.1.1', mac: '00:1A:2B:01:00:01',
    serial: 'ASR-1001X-01', brand: 'Cisco', model: 'ASR 1001-X', user: 'admin', pass: 'bgpIsp1Pass2026',
    notes: 'Enlace BGP Fibra Primario Telecom / Claro 10 Gbps ASN 64512'
  });
  const rtrIsp2Id = uid();
  devices.push({
    id: rtrIsp2Id, rackId: rackTic01Id, name: 'ROUTER-02 · Borde BGP ISP-2 (10 Gbps Redundante)', type: 'router', slotStart: 42, size: 1,
    mountSide: 'front', power: 180, plugs: 2, ip: '190.12.2.1', mac: '00:1A:2B:02:00:01',
    serial: 'ASR-1001X-02', brand: 'Cisco', model: 'ASR 1001-X', user: 'admin', pass: 'bgpIsp2Pass2026',
    notes: 'Enlace BGP Fibra Secundario Telefónica / Level3 10 Gbps'
  });

  // --- RACK TIC-02: DISTRIBUCIÓN TIC & NOC/SOC ---
  const upsTic02Id = uid();
  devices.push({
    id: upsTic02Id, rackId: rackTic02Id, name: 'UPS Online 2000VA', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 2000, plugs: 8, plugsOut: 8, ip: '10.120.10.65', mac: '00:1A:2B:12:01:65',
    serial: 'UPS-TIC-02', brand: 'APC', model: 'Smart-UPS RT 2000VA'
  });
  const pduTic02Id = uid();
  devices.push({
    id: pduTic02Id, rackId: rackTic02Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const nocSrvId = uid();
  devices.push({
    id: nocSrvId, rackId: rackTic02Id, name: 'NOC-SRV01 · Monitoreo y Grafana NOC', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 450, plugs: 2, ip: '10.40.10.11', mac: '00:1A:2B:40:10:11',
    serial: 'SRV-NOC01', brand: 'Dell', model: 'PowerEdge R740', user: 'admin', pass: 'nocGrafana2026!',
    notes: 'Dashboards NOC/SOC en tiempo real, NetFlow y Prometheus'
  });
  const swDistTicId = uid();
  devices.push({
    id: swDistTicId, rackId: rackTic02Id, name: 'DIST-TIC01 · Switch Distribución TIC L3', type: 'switch', slotStart: 37, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.41', mac: '00:1A:2B:12:01:41',
    serial: 'DIST-TIC-01', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026!',
    notes: 'Capa Distribución Edificio TIC (VLAN 10 MGMT - 10.120.10.41)'
  });
  const swAccTicId = uid();
  devices.push({
    id: swAccTicId, rackId: rackTic02Id, name: 'SW-TIC-01 · Switch Acceso 48P PoE+ TIC', type: 'switch', slotStart: 38, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.141', mac: '00:1A:2B:12:01:42',
    serial: 'SW-TIC-48P', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Conectividad estaciones de ingenieros NOC/SOC, Telefonía y APs'
  });
  const ppTic02Id = uid();
  devices.push({
    id: ppTic02Id, rackId: rackTic02Id, name: 'Patch Panel Cat6A 48P (2U)', type: 'patchpanel', slotStart: 39, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const odfTic02Id = uid();
  devices.push({
    id: odfTic02Id, rackId: rackTic02Id, name: 'ODF Fibra Distribución 24P', type: 'odf', slotStart: 41, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 5. EQUIPOS DE RACK — SALA 3: ADM (EDIFICIO ADMINISTRACIÓN)
  // =========================================================================
  const upsAdm01Id = uid();
  devices.push({
    id: upsAdm01Id, rackId: rackAdm01Id, name: 'UPS Online 3000VA ADM', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.66', mac: '00:1A:2B:12:01:66',
    serial: 'UPS-ADM-01', brand: 'APC', model: 'Smart-UPS RT 3000VA'
  });
  const pduAdm01Id = uid();
  devices.push({
    id: pduAdm01Id, rackId: rackAdm01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const swDistAdm01Id = uid();
  devices.push({
    id: swDistAdm01Id, rackId: rackAdm01Id, name: 'DIST-ADM01 · Switch Distribución ADM L3', type: 'switch', slotStart: 34, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.11', mac: '00:1A:2B:12:01:11',
    serial: 'DIST-ADM-01', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026!',
    notes: 'Distribución Edificio ADM hacia Core (VLAN 10 MGMT - 10.120.10.11)'
  });
  const swDistAdm02Id = uid();
  devices.push({
    id: swDistAdm02Id, rackId: rackAdm01Id, name: 'DIST-ADM02 · Switch Distribución ADM L3 HA', type: 'switch', slotStart: 35, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.12', mac: '00:1A:2B:12:01:12',
    serial: 'DIST-ADM-02', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026!',
    notes: 'Distribución Secundaria HA (VLAN 10 MGMT - 10.120.10.12)'
  });
  const swAccAdm01Id = uid();
  devices.push({
    id: swAccAdm01Id, rackId: rackAdm01Id, name: 'SW-ADM-01 · Acceso 48P PoE+ Rectorado & Finanzas', type: 'switch', slotStart: 36, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.101', mac: '00:1A:2B:12:01:05',
    serial: 'SW-ADM-48P-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Puestos de trabajo, Teléfonos IP y APs Rectorado (VLAN 30, 70, 170)'
  });
  const swAccAdm02Id = uid();
  devices.push({
    id: swAccAdm02Id, rackId: rackAdm01Id, name: 'SW-ADM-02 · Acceso 48P PoE+ RRHH & Secretaría', type: 'switch', slotStart: 37, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.102', mac: '00:1A:2B:12:01:06',
    serial: 'SW-ADM-48P-02', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Puestos administrativos, Cámaras e Impresoras (VLAN 30, 80, 90)'
  });
  const orgAdm01Id = uid();
  devices.push({
    id: orgAdm01Id, rackId: rackAdm01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 38, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppAdm01Id = uid();
  devices.push({
    id: ppAdm01Id, rackId: rackAdm01Id, name: 'Patch Panel Cat6A 48P (2U)', type: 'patchpanel', slotStart: 39, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const odfAdm01Id = uid();
  devices.push({
    id: odfAdm01Id, rackId: rackAdm01Id, name: 'ODF Fibra Óptica 24P Enlace Campus', type: 'odf', slotStart: 41, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 6. EQUIPOS DE RACK — SALA 4: AUL (EDIFICIO AULAS GENERALES)
  // =========================================================================
  const upsAul01Id = uid();
  devices.push({
    id: upsAul01Id, rackId: rackAul01Id, name: 'UPS Online 3000VA AUL', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.67', mac: '00:1A:2B:12:01:67',
    serial: 'UPS-AUL-01', brand: 'APC', model: 'Smart-UPS RT 3000VA'
  });
  const pduAul01Id = uid();
  devices.push({
    id: pduAul01Id, rackId: rackAul01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const swDistAul01Id = uid();
  devices.push({
    id: swDistAul01Id, rackId: rackAul01Id, name: 'DIST-AUL01 · Switch Distribución Aulas L3', type: 'switch', slotStart: 32, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.21', mac: '00:1A:2B:12:01:21',
    serial: 'DIST-AUL-01', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026!',
    notes: 'Distribución 60 Aulas (VLAN 10 MGMT - 10.120.10.21)'
  });
  const swAccAul01Id = uid();
  devices.push({
    id: swAccAul01Id, rackId: rackAul01Id, name: 'SW-AUL-01 · Acceso 48P PoE+ Piso 1', type: 'switch', slotStart: 33, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.121', mac: '00:1A:2B:12:01:22',
    serial: 'SW-AUL-P1-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Aulas Piso 1: PCs docentes, Proyectores y APs Estudiantes (VLAN 130, 180)'
  });
  const swAccAul02Id = uid();
  devices.push({
    id: swAccAul02Id, rackId: rackAul01Id, name: 'SW-AUL-02 · Acceso 48P PoE+ Piso 2', type: 'switch', slotStart: 34, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.122', mac: '00:1A:2B:12:01:23',
    serial: 'SW-AUL-P2-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Aulas Piso 2: PCs docentes y APs Estudiantes (VLAN 130, 180)'
  });
  const swAccAul03Id = uid();
  devices.push({
    id: swAccAul03Id, rackId: rackAul01Id, name: 'SW-AUL-03 · Acceso 48P PoE+ Piso 3', type: 'switch', slotStart: 35, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.123', mac: '00:1A:2B:12:01:24',
    serial: 'SW-AUL-P3-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Aulas Piso 3: PCs docentes y APs Estudiantes (VLAN 130, 180)'
  });
  const orgAul01Id = uid();
  devices.push({
    id: orgAul01Id, rackId: rackAul01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 36, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppAul01aId = uid();
  devices.push({
    id: ppAul01aId, rackId: rackAul01Id, name: 'Patch Panel Cat6A 48P Troncal Pisos 1-2', type: 'patchpanel', slotStart: 37, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const ppAul01bId = uid();
  devices.push({
    id: ppAul01bId, rackId: rackAul01Id, name: 'Patch Panel Cat6A 48P Troncal Piso 3', type: 'patchpanel', slotStart: 39, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const odfAul01Id = uid();
  devices.push({
    id: odfAul01Id, rackId: rackAul01Id, name: 'ODF Fibra Óptica 24P Enlace Campus OS2', type: 'odf', slotStart: 41, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 7. EQUIPOS DE RACK — SALA 5: ING (FACULTAD DE INGENIERÍA)
  // =========================================================================
  const upsIng01Id = uid();
  devices.push({
    id: upsIng01Id, rackId: rackIng01Id, name: 'UPS Online 3000VA ING', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.68', mac: '00:1A:2B:12:01:68',
    serial: 'UPS-ING-01', brand: 'APC', model: 'Smart-UPS RT 3000VA'
  });
  const pduIng01Id = uid();
  devices.push({
    id: pduIng01Id, rackId: rackIng01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const swDistIng01Id = uid();
  devices.push({
    id: swDistIng01Id, rackId: rackIng01Id, name: 'DIST-ING01 · Switch Distribución Ingeniería L3', type: 'switch', slotStart: 33, size: 1,
    mountSide: 'front', power: 350, plugs: 2, ip: '10.120.10.31', mac: '00:1A:2B:12:01:31',
    serial: 'DIST-ING-01', brand: 'Cisco', model: 'Catalyst 9300-48UXM', user: 'admin', pass: 'cisco2026!',
    notes: 'Distribución Facultad de Ingeniería (VLAN 10 MGMT - 10.120.10.31)'
  });
  const swAccIng01Id = uid();
  devices.push({
    id: swAccIng01Id, rackId: rackIng01Id, name: 'SW-ING-01 · Acceso 48P PoE+ Lab Sistemas', type: 'switch', slotStart: 34, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.131', mac: '00:1A:2B:12:01:32',
    serial: 'SW-ING-SIS-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Laboratorios de Sistemas y Computación (VLAN 110 LAB - 10.60.110.0/24)'
  });
  const swAccIng02Id = uid();
  devices.push({
    id: swAccIng02Id, rackId: rackIng01Id, name: 'SW-ING-02 · Acceso 48P PoE+ Lab Redes & Telecom', type: 'switch', slotStart: 35, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.132', mac: '00:1A:2B:12:01:33',
    serial: 'SW-ING-RED-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Laboratorio de Redes Cisco y Telecomunicaciones (VLAN 110 LAB)'
  });
  const swAccIng03Id = uid();
  devices.push({
    id: swAccIng03Id, rackId: rackIng01Id, name: 'SW-ING-03 · Acceso 48P PoE+ Lab Electrónica & IoT', type: 'switch', slotStart: 36, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.133', mac: '00:1A:2B:12:01:34',
    serial: 'SW-ING-IOT-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Laboratorio de Mecatrónica, Robótica e IoT (VLAN 100 IOT / VLAN 110 LAB)'
  });
  const orgIng01Id = uid();
  devices.push({
    id: orgIng01Id, rackId: rackIng01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppIng01Id = uid();
  devices.push({
    id: ppIng01Id, rackId: rackIng01Id, name: 'Patch Panel Cat6A 48P (2U)', type: 'patchpanel', slotStart: 38, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const odfIng01Id = uid();
  devices.push({
    id: odfIng01Id, rackId: rackIng01Id, name: 'ODF Fibra Óptica 24P Enlace Campus OS2', type: 'odf', slotStart: 40, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 8. EQUIPOS DE RACK — SALA 6: BIB (BIBLIOTECA CENTRAL - 24U)
  // =========================================================================
  const upsBib01Id = uid();
  devices.push({
    id: upsBib01Id, rackId: rackBib01Id, name: 'UPS Online 1500VA BIB', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 1500, plugs: 8, plugsOut: 8, ip: '10.120.10.69', mac: '00:1A:2B:12:01:69',
    serial: 'UPS-BIB-01', brand: 'APC', model: 'Smart-UPS 1500VA'
  });
  const pduBib01Id = uid();
  devices.push({
    id: pduBib01Id, rackId: rackBib01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const srvBib01Id = uid();
  devices.push({
    id: srvBib01Id, rackId: rackBib01Id, name: 'SRV-BIB01 · Servidor Catálogo Koha OPAC', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 400, plugs: 2, ip: '10.50.120.10', mac: '00:1A:2B:50:12:10',
    serial: 'SRV-BIB-KOHA', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'kohaBiblio2026',
    notes: 'Servidor Catálogo Bibliográfico Koha y Préstamos (VLAN 120 BIBLIOTECA - 10.50.120.0/24)'
  });
  const swAccBib01Id = uid();
  devices.push({
    id: swAccBib01Id, rackId: rackBib01Id, name: 'SW-BIB-01 · Switch Acceso 48P PoE+ Biblioteca', type: 'switch', slotStart: 19, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.151', mac: '00:1A:2B:12:01:51',
    serial: 'SW-BIB-48P', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Terminales de consulta, APs Salas de Estudio y CCTV (VLAN 120, 180, 80)'
  });
  const ppBib01Id = uid();
  devices.push({
    id: ppBib01Id, rackId: rackBib01Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 20, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const orgBib01Id = uid();
  devices.push({
    id: orgBib01Id, rackId: rackBib01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 21, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const odfBib01Id = uid();
  devices.push({
    id: odfBib01Id, rackId: rackBib01Id, name: 'ODF Fibra Óptica 12P Enlace Campus', type: 'odf', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 9. EQUIPOS DE RACK — SALA 7: LAB (LABORATORIOS DE INVESTIGACIÓN - 24U)
  // =========================================================================
  const upsLab01Id = uid();
  devices.push({
    id: upsLab01Id, rackId: rackLab01Id, name: 'UPS Online 1500VA LAB', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 1500, plugs: 8, plugsOut: 8, ip: '10.120.10.70', mac: '00:1A:2B:12:01:70',
    serial: 'UPS-LAB-01', brand: 'APC', model: 'Smart-UPS 1500VA'
  });
  const pduLab01Id = uid();
  devices.push({
    id: pduLab01Id, rackId: rackLab01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const srvLab01Id = uid();
  devices.push({
    id: srvLab01Id, rackId: rackLab01Id, name: 'SRV-LAB01 · Adquisición SCADA & Cómputo I+D', type: 'server', slotStart: 8, size: 2,
    mountSide: 'both', power: 500, plugs: 2, ip: '10.60.110.10', mac: '00:1A:2B:60:11:10',
    serial: 'SRV-LAB-SCADA', brand: 'Dell', model: 'PowerEdge R750', user: 'admin', pass: 'scadaResearch2026',
    notes: 'Servidor Adquisición de Datos y Clúster de Simulación (VLAN 110 LAB / VLAN 140 INVESTIGACION)'
  });
  const swAccLab01Id = uid();
  devices.push({
    id: swAccLab01Id, rackId: rackLab01Id, name: 'SW-LAB-01 · Switch Acceso 48P PoE+ Científico', type: 'switch', slotStart: 19, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.161', mac: '00:1A:2B:12:01:61',
    serial: 'SW-LAB-48P', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Estaciones de investigadores y bancos de prueba (VLAN 140 INVESTIGACION - 10.30.140.0/24)'
  });
  const ppLab01Id = uid();
  devices.push({
    id: ppLab01Id, rackId: rackLab01Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 20, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const orgLab01Id = uid();
  devices.push({
    id: orgLab01Id, rackId: rackLab01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 21, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const odfLab01Id = uid();
  devices.push({
    id: odfLab01Id, rackId: rackLab01Id, name: 'ODF Fibra Óptica 12P Enlace Campus', type: 'odf', slotStart: 22, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 10. EQUIPOS DE RACK — SALA 8: CAM (SEGURIDAD & CCTV)
  // =========================================================================
  const upsCam01Id = uid();
  devices.push({
    id: upsCam01Id, rackId: rackCam01Id, name: 'UPS Online 3000VA CAM', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 3000, plugs: 8, plugsOut: 8, ip: '10.120.10.71', mac: '00:1A:2B:12:01:71',
    serial: 'UPS-CAM-01', brand: 'APC', model: 'Smart-UPS RT 3000VA', notes: 'Alimentación ininterrumpida CCTV 24/7'
  });
  const pduCam01Id = uid();
  devices.push({
    id: pduCam01Id, rackId: rackCam01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const nvr01Id = uid();
  devices.push({
    id: nvr01Id, rackId: rackCam01Id, name: 'NVR01 · Grabador CCTV 64 Canales RAID 6', type: 'storage', slotStart: 6, size: 2,
    mountSide: 'both', power: 250, plugs: 2, ip: '10.100.80.10', mac: '00:1A:2B:10:08:10',
    serial: 'NVR-64CH-01', brand: 'Hikvision', model: 'DS-9664NI-I8', user: 'admin', pass: 'hikCctv2026!',
    notes: 'Grabador NVR 64 Cámaras Cámaras Zona Norte y Aulas (VLAN 80 CCTV - 10.100.80.0/22)'
  });
  const nvr02Id = uid();
  devices.push({
    id: nvr02Id, rackId: rackCam01Id, name: 'NVR02 · Grabador CCTV 64 Canales RAID 6 HA', type: 'storage', slotStart: 8, size: 2,
    mountSide: 'both', power: 250, plugs: 2, ip: '10.100.80.20', mac: '00:1A:2B:10:08:20',
    serial: 'NVR-64CH-02', brand: 'Hikvision', model: 'DS-9664NI-I8', user: 'admin', pass: 'hikCctv2026!',
    notes: 'Grabador NVR 64 Cámaras Zona Sur y Perímetro (VLAN 80 CCTV)'
  });
  const srvAcc01Id = uid();
  devices.push({
    id: srvAcc01Id, rackId: rackCam01Id, name: 'SRV-ACC01 · Servidor Control Acceso Biométrico', type: 'server', slotStart: 10, size: 2,
    mountSide: 'both', power: 350, plugs: 2, ip: '10.100.90.10', mac: '00:1A:2B:10:09:10',
    serial: 'SRV-ACCESS-01', brand: 'Dell', model: 'PowerEdge R650', user: 'admin', pass: 'accessSec2026',
    notes: 'Control de Molinetes, Puertas y Credenciales RFID (VLAN 90 ACCESS - 10.100.90.0/24)'
  });
  const kvmCam01Id = uid();
  devices.push({
    id: kvmCam01Id, rackId: rackCam01Id, name: 'Consola KVM LCD 1U', type: 'kvm', slotStart: 21, size: 1,
    mountSide: 'both', power: 25, plugs: 1, brand: 'ATEN', model: 'CL1000M'
  });
  const swCam01Id = uid();
  devices.push({
    id: swCam01Id, rackId: rackCam01Id, name: 'SW-CAM-01 · Switch PoE CCTV 48P PoE+ Zona Norte', type: 'switch', slotStart: 35, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.181', mac: '00:1A:2B:12:01:81',
    serial: 'SW-CCTV-48P-01', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Alimentación PoE para Cámaras IP Edificios ADM, AUL, BIB (VLAN 80 CCTV)'
  });
  const swCam02Id = uid();
  devices.push({
    id: swCam02Id, rackId: rackCam01Id, name: 'SW-CAM-02 · Switch PoE CCTV 48P PoE+ Zona Sur', type: 'switch', slotStart: 36, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.182', mac: '00:1A:2B:12:01:82',
    serial: 'SW-CCTV-48P-02', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'Alimentación PoE Cámaras ING, LAB, DEP, RES y Perímetro (VLAN 80 CCTV)'
  });
  const orgCam01Id = uid();
  devices.push({
    id: orgCam01Id, rackId: rackCam01Id, name: 'Organizador Horizontal 1U', type: 'organizer', slotStart: 37, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'PatchLink 1U'
  });
  const ppCam01Id = uid();
  devices.push({
    id: ppCam01Id, rackId: rackCam01Id, name: 'Patch Panel Cat6A 48P (2U)', type: 'patchpanel', slotStart: 38, size: 2,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP48688TGY'
  });
  const odfCam01Id = uid();
  devices.push({
    id: odfCam01Id, rackId: rackCam01Id, name: 'ODF Fibra Óptica 24P Enlace Backbone', type: 'odf', slotStart: 40, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 11. EQUIPOS DE RACK — SALA 9: DEP (DEPORTES & POLIDEPORTIVO - 18U)
  // =========================================================================
  const upsDep01Id = uid();
  devices.push({
    id: upsDep01Id, rackId: rackDep01Id, name: 'UPS Online 1000VA DEP', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 1000, plugs: 6, plugsOut: 6, ip: '10.120.10.72', mac: '00:1A:2B:12:01:72',
    serial: 'UPS-DEP-01', brand: 'APC', model: 'Smart-UPS 1000VA'
  });
  const pduDep01Id = uid();
  devices.push({
    id: pduDep01Id, rackId: rackDep01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 6, brand: 'APC', model: 'AP7900B'
  });
  const swAccDep01Id = uid();
  devices.push({
    id: swAccDep01Id, rackId: rackDep01Id, name: 'SW-DEP-01 · Switch Acceso 24P PoE+ Deportes', type: 'switch', slotStart: 14, size: 1,
    mountSide: 'front', power: 180, plugs: 2, ip: '10.120.10.171', mac: '00:1A:2B:12:01:71',
    serial: 'SW-DEP-24P', brand: 'Cisco', model: 'Catalyst 9200-24P', user: 'admin', pass: 'cisco2026!',
    notes: 'APs Polideportivo, Canchas y CCTV Exterior (VLAN 180, 80)'
  });
  const ppDep01Id = uid();
  devices.push({
    id: ppDep01Id, rackId: rackDep01Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 15, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const odfDep01Id = uid();
  devices.push({
    id: odfDep01Id, rackId: rackDep01Id, name: 'ODF Fibra Óptica 12P Enlace Campus', type: 'odf', slotStart: 16, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 12. EQUIPOS DE RACK — SALA 10: RES (RESIDENCIA ESTUDIANTIL - 24U)
  // =========================================================================
  const upsRes01Id = uid();
  devices.push({
    id: upsRes01Id, rackId: rackRes01Id, name: 'UPS Online 2000VA RES', type: 'ups', slotStart: 1, size: 2,
    mountSide: 'both', power: 2000, plugs: 8, plugsOut: 8, ip: '10.120.10.73', mac: '00:1A:2B:12:01:73',
    serial: 'UPS-RES-01', brand: 'APC', model: 'Smart-UPS 2000VA'
  });
  const pduRes01Id = uid();
  devices.push({
    id: pduRes01Id, rackId: rackRes01Id, name: 'PDU Horizontal 1U', type: 'pdu', slotStart: 3, size: 1,
    mountSide: 'rear', power: 0, plugs: 1, plugsOut: 8, brand: 'APC', model: 'AP7900B'
  });
  const swDistRes01Id = uid();
  devices.push({
    id: swDistRes01Id, rackId: rackRes01Id, name: 'DIST-RES01 · Switch Distribución Residencias L3', type: 'switch', slotStart: 18, size: 1,
    mountSide: 'front', power: 250, plugs: 2, ip: '10.120.10.81', mac: '00:1A:2B:12:01:81',
    serial: 'DIST-RES-01', brand: 'Cisco', model: 'Catalyst 9300-24T', user: 'admin', pass: 'cisco2026!',
    notes: 'Distribución Residencia Estudiantil (VLAN 10 MGMT - 10.120.10.81)'
  });
  const swAccRes01Id = uid();
  devices.push({
    id: swAccRes01Id, rackId: rackRes01Id, name: 'SW-RES-01 · Switch Acceso 48P PoE+ Dormitorios', type: 'switch', slotStart: 19, size: 1,
    mountSide: 'front', power: 370, plugs: 2, ip: '10.120.10.191', mac: '00:1A:2B:12:01:91',
    serial: 'SW-RES-48P', brand: 'Cisco', model: 'Catalyst 9200-48P', user: 'admin', pass: 'cisco2026!',
    notes: 'APs Wi-Fi Dormitorios y Control de Acceso (VLAN 180 WIFI-STUDENT / VLAN 90 ACCESS)'
  });
  const ppRes01Id = uid();
  devices.push({
    id: ppRes01Id, rackId: rackRes01Id, name: 'Patch Panel Cat6A 24P', type: 'patchpanel', slotStart: 20, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Panduit', model: 'DP24688TGY'
  });
  const odfRes01Id = uid();
  devices.push({
    id: odfRes01Id, rackId: rackRes01Id, name: 'ODF Fibra Óptica 24P Enlace Campus', type: 'odf', slotStart: 21, size: 1,
    mountSide: 'front', power: 0, plugs: 0, brand: 'Corning', model: 'Pretium 1U'
  });

  // =========================================================================
  // 13. PERIFÉRICOS DE PISO (FLOOR DEVICES) POR SALA
  // =========================================================================
  // En DCC:
  const camDc1 = uid(); const doorDc1 = uid(); const pcDcDiag = uid();
  devices.push(
    { id: camDc1, rackId: null, category: 'floor', roomId: rDcc, name: 'Cámara Térmica DCC Pasillo', type: 'camera', ip: '10.100.80.25', brand: 'Axis', model: 'Q1942-E', power: 18, plugs: 1, notes: 'VLAN 80 CCTV' },
    { id: doorDc1, rackId: null, category: 'floor', roomId: rDcc, name: 'Control Biométrico Puerta DCC', type: 'door', ip: '10.100.90.15', brand: 'ZKTeco', model: 'ProCapture-T', power: 20, plugs: 1, notes: 'VLAN 90 ACCESS' },
    { id: pcDcDiag, rackId: null, category: 'floor', roomId: rDcc, name: 'Consola Diagnóstico Datacenter', type: 'pc', ip: '10.120.10.99', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 10 MGMT' }
  );

  // En TIC:
  const pcNoc = uid(); const pcSoc = uid(); const telTic = uid(); const apTic = uid();
  devices.push(
    { id: pcNoc, rackId: null, category: 'floor', roomId: rTic, name: 'Estación Operador NOC UTN', type: 'pc', ip: '10.120.10.201', brand: 'Dell', model: 'Precision 3650', power: 150, plugs: 1, notes: 'VLAN 10 MGMT' },
    { id: pcSoc, rackId: null, category: 'floor', roomId: rTic, name: 'Estación Ciberseguridad SOC', type: 'pc', ip: '10.100.240.11', brand: 'Dell', model: 'Precision 3650', power: 150, plugs: 1, notes: 'VLAN 240 SECURITY' },
    { id: telTic, rackId: null, category: 'floor', roomId: rTic, name: 'Teléfono IP Helpdesk TIC', type: 'phone', ip: '10.130.70.151', brand: 'Cisco', model: 'IP Phone 8845', power: 12, plugs: 1, notes: 'VLAN 70 VOICE' },
    { id: apTic, rackId: null, category: 'floor', roomId: rTic, name: 'AP Wi-Fi Sala Técnica TIC', type: 'ap', ip: '10.110.170.21', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 170 WIFI-STAFF' }
  );

  // En ADM:
  const pcAdm1 = uid(); const pcAdm2 = uid(); const telAdm1 = uid(); const telAdm2 = uid(); const prtAdm = uid(); const camAdm = uid(); const apAdm = uid(); const doorAdm = uid();
  devices.push(
    { id: pcAdm1, rackId: null, category: 'floor', roomId: rAdm, name: 'PC Rectorado', type: 'pc', ip: '10.10.30.15', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 30 ADMIN' },
    { id: pcAdm2, rackId: null, category: 'floor', roomId: rAdm, name: 'PC Finanzas & Contabilidad', type: 'pc', ip: '10.10.30.22', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 30 ADMIN' },
    { id: telAdm1, rackId: null, category: 'floor', roomId: rAdm, name: 'Teléfono IP Despacho Rector', type: 'phone', ip: '10.130.70.101', brand: 'Cisco', model: 'IP Phone 8845', power: 12, plugs: 1, notes: 'VLAN 70 VOICE' },
    { id: telAdm2, rackId: null, category: 'floor', roomId: rAdm, name: 'Teléfono IP Secretaría Finanzas', type: 'phone', ip: '10.130.70.102', brand: 'Cisco', model: 'IP Phone 8841', power: 10, plugs: 1, notes: 'VLAN 70 VOICE' },
    { id: prtAdm, rackId: null, category: 'floor', roomId: rAdm, name: 'Impresora Multifunción ADM', type: 'printer', ip: '10.10.30.50', brand: 'HP', model: 'LaserJet Enterprise M608', power: 150, plugs: 1, notes: 'VLAN 30 ADMIN' },
    { id: camAdm, rackId: null, category: 'floor', roomId: rAdm, name: 'Cámara Hall Rectorado', type: 'camera', ip: '10.100.80.11', brand: 'Hikvision', model: 'DS-2CD2143G2', power: 12, plugs: 1, notes: 'VLAN 80 CCTV' },
    { id: apAdm, rackId: null, category: 'floor', roomId: rAdm, name: 'AP Wi-Fi Edificio Rectorado', type: 'ap', ip: '10.110.170.11', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 170 WIFI-STAFF / VLAN 190 GUEST' },
    { id: doorAdm, rackId: null, category: 'floor', roomId: rAdm, name: 'Molinete Acceso ADM', type: 'door', ip: '10.100.90.11', brand: 'ZKTeco', model: 'TS2000 Pro', power: 25, plugs: 1, notes: 'VLAN 90 ACCESS' }
  );

  // En AUL:
  const pcAul1 = uid(); const pcAul2 = uid(); const apAul1 = uid(); const apAul2 = uid(); const camAul = uid();
  devices.push(
    { id: pcAul1, rackId: null, category: 'floor', roomId: rAul, name: 'PC Docente Aula Magna 101', type: 'pc', ip: '10.20.130.11', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 130 AULAS' },
    { id: pcAul2, rackId: null, category: 'floor', roomId: rAul, name: 'PC Docente Aula 201', type: 'pc', ip: '10.20.130.21', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 130 AULAS' },
    { id: apAul1, rackId: null, category: 'floor', roomId: rAul, name: 'AP Wi-Fi Estudiantes Piso 1', type: 'ap', ip: '10.110.180.10', brand: 'Cisco', model: 'Catalyst 9130AX', power: 20, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT (Alta Densidad)' },
    { id: apAul2, rackId: null, category: 'floor', roomId: rAul, name: 'AP Wi-Fi Estudiantes Piso 2', type: 'ap', ip: '10.110.180.20', brand: 'Cisco', model: 'Catalyst 9130AX', power: 20, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT (Alta Densidad)' },
    { id: camAul, rackId: null, category: 'floor', roomId: rAul, name: 'Cámara Domo Pasillo Central AUL', type: 'camera', ip: '10.100.80.31', brand: 'Hikvision', model: 'DS-2CD2143G2', power: 12, plugs: 1, notes: 'VLAN 80 CCTV' }
  );

  // En ING:
  const pcIng1 = uid(); const pcIng2 = uid(); const apIng = uid(); const camIng = uid();
  devices.push(
    { id: pcIng1, rackId: null, category: 'floor', roomId: rIng, name: 'PC Laboratorio Redes Cisco', type: 'pc', ip: '10.60.110.21', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 110 LAB' },
    { id: pcIng2, rackId: null, category: 'floor', roomId: rIng, name: 'PC Laboratorio Desarrollo Software', type: 'pc', ip: '10.60.110.31', brand: 'Dell', model: 'OptiPlex 7090', power: 90, plugs: 1, notes: 'VLAN 110 LAB' },
    { id: apIng, rackId: null, category: 'floor', roomId: rIng, name: 'AP Wi-Fi Facultad Ingeniería', type: 'ap', ip: '10.110.180.30', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT' },
    { id: camIng, rackId: null, category: 'floor', roomId: rIng, name: 'Cámara Seguridad Pasillo ING', type: 'camera', ip: '10.100.80.51', brand: 'Hikvision', model: 'DS-2CD2143G2', power: 12, plugs: 1, notes: 'VLAN 80 CCTV' }
  );

  // En BIB:
  const pcBib1 = uid(); const pcBib2 = uid(); const prtBib = uid(); const apBib = uid(); const camBib = uid();
  devices.push(
    { id: pcBib1, rackId: null, category: 'floor', roomId: rBib, name: 'Terminal Consulta OPAC 01', type: 'pc', ip: '10.50.120.21', brand: 'Dell', model: 'OptiPlex 3080 Micro', power: 65, plugs: 1, notes: 'VLAN 120 BIBLIOTECA' },
    { id: pcBib2, rackId: null, category: 'floor', roomId: rBib, name: 'Terminal Consulta OPAC 02', type: 'pc', ip: '10.50.120.22', brand: 'Dell', model: 'OptiPlex 3080 Micro', power: 65, plugs: 1, notes: 'VLAN 120 BIBLIOTECA' },
    { id: prtBib, rackId: null, category: 'floor', roomId: rBib, name: 'Impresora Autoservicio Alumnos', type: 'printer', ip: '10.50.120.30', brand: 'HP', model: 'LaserJet Managed MFP', power: 120, plugs: 1, notes: 'VLAN 120 BIBLIOTECA' },
    { id: apBib, rackId: null, category: 'floor', roomId: rBib, name: 'AP Wi-Fi Sala Lectura Biblioteca', type: 'ap', ip: '10.110.180.40', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT' },
    { id: camBib, rackId: null, category: 'floor', roomId: rBib, name: 'Cámara Mostrador Biblioteca', type: 'camera', ip: '10.100.80.71', brand: 'Hikvision', model: 'DS-2CD2143G2', power: 12, plugs: 1, notes: 'VLAN 80 CCTV' }
  );

  // En LAB:
  const pcLab1 = uid(); const apLab = uid();
  devices.push(
    { id: pcLab1, rackId: null, category: 'floor', roomId: rLab, name: 'Estación de Trabajo I+D Científico', type: 'pc', ip: '10.30.140.11', brand: 'Dell', model: 'Precision 5820', power: 250, plugs: 1, notes: 'VLAN 140 INVESTIGACION' },
    { id: apLab, rackId: null, category: 'floor', roomId: rLab, name: 'AP Wi-Fi Laboratorios Avanzados', type: 'ap', ip: '10.110.170.31', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 170 WIFI-STAFF' }
  );

  // En CAM:
  const pcCam1 = uid(); const pcCam2 = uid(); const camExt1 = uid();
  devices.push(
    { id: pcCam1, rackId: null, category: 'floor', roomId: rCam, name: 'Videowall Monitoreo Guardias 01', type: 'pc', ip: '10.100.80.5', brand: 'Dell', model: 'Precision 3650', power: 180, plugs: 1, notes: 'VLAN 80 CCTV' },
    { id: pcCam2, rackId: null, category: 'floor', roomId: rCam, name: 'Consola Despacho Seguridad 02', type: 'pc', ip: '10.100.80.6', brand: 'Dell', model: 'Precision 3650', power: 180, plugs: 1, notes: 'VLAN 80 CCTV' },
    { id: camExt1, rackId: null, category: 'floor', roomId: rCam, name: 'Cámara Domo PTZ Perímetro Campus', type: 'camera', ip: '10.100.80.91', brand: 'Hikvision', model: 'DS-2DF8442IXS-AEL', power: 35, plugs: 1, notes: 'VLAN 80 CCTV' }
  );

  // En DEP:
  const apDep = uid(); const camDep = uid();
  devices.push(
    { id: apDep, rackId: null, category: 'floor', roomId: rDep, name: 'AP Wi-Fi Polideportivo & Canchas', type: 'ap', ip: '10.110.180.50', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT' },
    { id: camDep, rackId: null, category: 'floor', roomId: rDep, name: 'Cámara Gimnasio Principal', type: 'camera', ip: '10.100.80.81', brand: 'Hikvision', model: 'DS-2CD2143G2', power: 12, plugs: 1, notes: 'VLAN 80 CCTV' }
  );

  // En RES:
  const apRes1 = uid(); const apRes2 = uid(); const doorRes = uid();
  devices.push(
    { id: apRes1, rackId: null, category: 'floor', roomId: rRes, name: 'AP Wi-Fi Pabellón Residencias A', type: 'ap', ip: '10.110.180.60', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT' },
    { id: apRes2, rackId: null, category: 'floor', roomId: rRes, name: 'AP Wi-Fi Pabellón Residencias B', type: 'ap', ip: '10.110.180.61', brand: 'Cisco', model: 'Catalyst 9120AX', power: 15, plugs: 1, notes: 'VLAN 180 WIFI-STUDENT' },
    { id: doorRes, rackId: null, category: 'floor', roomId: rRes, name: 'Torniquete Acceso Dormitorios', type: 'door', ip: '10.100.90.21', brand: 'ZKTeco', model: 'TS2000 Pro', power: 25, plugs: 1, notes: 'VLAN 90 ACCESS' }
  );

  // =========================================================================
  // 14. CABLEADO ESTRUCTURADO Y ENLACES (BACKBONE Y DISTRIBUCIÓN)
  // =========================================================================
  // 1. Enlaces Perímetro / Internet e Inter-Core
  connections.push(
    { id: uid(), sourceDeviceId: rtrIsp1Id, sourcePort: 'Gi0/0/0', targetDeviceId: fw01Id, targetPort: 'port1', cableType: 'DAC', color: '#ef4444', vlanId: 230, vlanName: 'NETWORK / Borde' },
    { id: uid(), sourceDeviceId: rtrIsp2Id, sourcePort: 'Gi0/0/0', targetDeviceId: fw02Id, targetPort: 'port1', cableType: 'DAC', color: '#ef4444', vlanId: 230, vlanName: 'NETWORK / Borde' },
    { id: uid(), sourceDeviceId: fw01Id, sourcePort: 'ha', targetDeviceId: fw02Id, targetPort: 'ha', cableType: 'DAC', color: '#eab308', vlanId: 240, vlanName: 'SECURITY / HA Sync' },
    { id: uid(), sourceDeviceId: fw01Id, sourcePort: 'port2', targetDeviceId: swCore01Id, targetPort: 'Te1/0/48', cableType: 'DAC', color: '#10b981', vlanId: 10, vlanName: 'MGMT / Gestión' },
    { id: uid(), sourceDeviceId: fw02Id, sourcePort: 'port2', targetDeviceId: swCore02Id, targetPort: 'Te1/0/48', cableType: 'DAC', color: '#10b981', vlanId: 10, vlanName: 'MGMT / Gestión' },
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Fo1/0/1', targetDeviceId: swCore02Id, targetPort: 'Fo1/0/1', cableType: 'Fibra OM4', color: '#06b6d4', vlanId: 10, vlanName: 'Core Interconnect vPC 40G' }
  );

  // 2. Core hacia Top-of-Rack Data Center Central
  connections.push(
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/1', targetDeviceId: swDccInterconnectId, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#38bdf8', vlanId: 10, vlanName: 'Backbone DCC 10G' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/1', targetDeviceId: swDccInterconnectId, targetPort: 'Te1/0/2', cableType: 'Fibra OS2', color: '#38bdf8', vlanId: 10, vlanName: 'Backbone DCC 10G HA' },
    { id: uid(), sourceDeviceId: swDccInterconnectId, sourcePort: 'Te1/0/10', targetDeviceId: swTorDcc01Id, targetPort: 'Te1/0/1', cableType: 'DAC', color: '#3b82f6', vlanId: 20, vlanName: 'SERVERS Trunk' },
    { id: uid(), sourceDeviceId: swDccInterconnectId, sourcePort: 'Te1/0/11', targetDeviceId: swTorDcc02Id, targetPort: 'Te1/0/1', cableType: 'DAC', color: '#8b5cf6', vlanId: 220, vlanName: 'STORAGE Trunk' },
    { id: uid(), sourceDeviceId: swDccInterconnectId, sourcePort: 'Te1/0/12', targetDeviceId: swTorDmzId, targetPort: 'Te1/0/1', cableType: 'Fibra OM4', color: '#f59e0b', vlanId: 200, vlanName: 'DMZ Trunk' }
  );

  // 3. Core hacia Distribución de Edificios (Backbone de Fibra Monomodo OS2)
  connections.push(
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/5', targetDeviceId: swDistAdm01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#f59e0b', vlanId: 10, vlanName: 'Troncal Campus ADM' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/5', targetDeviceId: swDistAdm02Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#f59e0b', vlanId: 10, vlanName: 'Troncal Campus ADM HA' },
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/6', targetDeviceId: swDistAul01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#ec4899', vlanId: 10, vlanName: 'Troncal Campus AUL' },
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/7', targetDeviceId: swDistIng01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#6366f1', vlanId: 10, vlanName: 'Troncal Campus ING' },
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/8', targetDeviceId: swDistTicId, targetPort: 'Te1/0/1', cableType: 'DAC', color: '#06b6d4', vlanId: 10, vlanName: 'Troncal Local TIC' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/9', targetDeviceId: swAccBib01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#14b8a6', vlanId: 10, vlanName: 'Troncal Campus BIB' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/10', targetDeviceId: swAccLab01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#eab308', vlanId: 10, vlanName: 'Troncal Campus LAB' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/11', targetDeviceId: swCam01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#f43f5e', vlanId: 10, vlanName: 'Troncal Campus CAM' },
    { id: uid(), sourceDeviceId: swCore02Id, sourcePort: 'Te1/0/12', targetDeviceId: swAccDep01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#84cc16', vlanId: 10, vlanName: 'Troncal Campus DEP' },
    { id: uid(), sourceDeviceId: swCore01Id, sourcePort: 'Te1/0/13', targetDeviceId: swDistRes01Id, targetPort: 'Te1/0/1', cableType: 'Fibra OS2', color: '#a855f7', vlanId: 10, vlanName: 'Troncal Campus RES' }
  );

  // 4. Distribución hacia Acceso dentro de los Edificios
  connections.push(
    // En ADM:
    { id: uid(), sourceDeviceId: swDistAdm01Id, sourcePort: 'Gi1/0/1', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#f59e0b', vlanId: 10, vlanName: 'Trunk Acceso ADM-01' },
    { id: uid(), sourceDeviceId: swDistAdm02Id, sourcePort: 'Gi1/0/1', targetDeviceId: swAccAdm02Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#f59e0b', vlanId: 10, vlanName: 'Trunk Acceso ADM-02' },
    // En AUL:
    { id: uid(), sourceDeviceId: swDistAul01Id, sourcePort: 'Gi1/0/1', targetDeviceId: swAccAul01Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#ec4899', vlanId: 130, vlanName: 'Trunk Aulas Piso 1' },
    { id: uid(), sourceDeviceId: swDistAul01Id, sourcePort: 'Gi1/0/2', targetDeviceId: swAccAul02Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#ec4899', vlanId: 130, vlanName: 'Trunk Aulas Piso 2' },
    { id: uid(), sourceDeviceId: swDistAul01Id, sourcePort: 'Gi1/0/3', targetDeviceId: swAccAul03Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#ec4899', vlanId: 130, vlanName: 'Trunk Aulas Piso 3' },
    // En ING:
    { id: uid(), sourceDeviceId: swDistIng01Id, sourcePort: 'Gi1/0/1', targetDeviceId: swAccIng01Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#6366f1', vlanId: 110, vlanName: 'Trunk Lab Sistemas' },
    { id: uid(), sourceDeviceId: swDistIng01Id, sourcePort: 'Gi1/0/2', targetDeviceId: swAccIng02Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#6366f1', vlanId: 110, vlanName: 'Trunk Lab Redes' },
    { id: uid(), sourceDeviceId: swDistIng01Id, sourcePort: 'Gi1/0/3', targetDeviceId: swAccIng03Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#6366f1', vlanId: 100, vlanName: 'Trunk Lab IoT' },
    // En TIC:
    { id: uid(), sourceDeviceId: swDistTicId, sourcePort: 'Gi1/0/1', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#3b82f6', vlanId: 10, vlanName: 'Trunk Acceso TIC' },
    // En CAM:
    { id: uid(), sourceDeviceId: swCam01Id, sourcePort: 'Gi1/0/47', targetDeviceId: swCam02Id, targetPort: 'Gi1/0/47', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'Interlink CCTV PoE' },
    // En RES:
    { id: uid(), sourceDeviceId: swDistRes01Id, sourcePort: 'Gi1/0/1', targetDeviceId: swAccRes01Id, targetPort: 'Gi1/0/48', cableType: 'Cobre', color: '#a855f7', vlanId: 180, vlanName: 'Trunk Dormitorios' }
  );

  // 5. Conexiones a Servidores del Data Center
  connections.push(
    { id: uid(), sourceDeviceId: ad01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: ad02Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: dns01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/3', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: dns02Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/4', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: dhcp01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: dhcp02Id, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/6', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: ntpMonId, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/7', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: syslogId, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/8', cableType: 'Cobre', color: '#0ea5e9', vlanId: 20, vlanName: 'SERVERS' },
    { id: uid(), sourceDeviceId: sanStorageId, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/1', cableType: 'Fibra OM4', color: '#8b5cf6', vlanId: 220, vlanName: 'STORAGE' },
    { id: uid(), sourceDeviceId: backup01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#8b5cf6', vlanId: 210, vlanName: 'BACKUP' },
    { id: uid(), sourceDeviceId: erp01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#8b5cf6', vlanId: 150, vlanName: 'ERP' },
    { id: uid(), sourceDeviceId: erp02Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/11', cableType: 'Cobre', color: '#8b5cf6', vlanId: 150, vlanName: 'ERP' },
    { id: uid(), sourceDeviceId: acad01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#8b5cf6', vlanId: 160, vlanName: 'ACADEMICO' },
    { id: uid(), sourceDeviceId: acad02Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/16', cableType: 'Cobre', color: '#8b5cf6', vlanId: 160, vlanName: 'ACADEMICO' },
    { id: uid(), sourceDeviceId: lms01Id, sourcePort: 'eth0', targetDeviceId: swTorDcc02Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#8b5cf6', vlanId: 160, vlanName: 'ACADEMICO' },
    { id: uid(), sourceDeviceId: web01Id, sourcePort: 'eth0', targetDeviceId: swTorDmzId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#10b981', vlanId: 200, vlanName: 'DMZ' },
    { id: uid(), sourceDeviceId: mail01Id, sourcePort: 'eth0', targetDeviceId: swTorDmzId, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#10b981', vlanId: 200, vlanName: 'DMZ' }
  );

  // 6. Conexiones a Equipos de Gestión y Seguridad Especiales
  connections.push(
    { id: uid(), sourceDeviceId: pbx01Id, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#ef4444', vlanId: 70, vlanName: 'VOICE' },
    { id: uid(), sourceDeviceId: wlc01Id, sourcePort: 'eth0', targetDeviceId: swCore01Id, targetPort: 'Te1/0/20', cableType: 'Fibra OM4', color: '#06b6d4', vlanId: 10, vlanName: 'MGMT' },
    { id: uid(), sourceDeviceId: wlc02Id, sourcePort: 'eth0', targetDeviceId: swCore02Id, targetPort: 'Te1/0/20', cableType: 'Fibra OM4', color: '#06b6d4', vlanId: 10, vlanName: 'MGMT' },
    { id: uid(), sourceDeviceId: nocSrvId, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#3b82f6', vlanId: 10, vlanName: 'MGMT' },
    { id: uid(), sourceDeviceId: srvBib01Id, sourcePort: 'eth0', targetDeviceId: swAccBib01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#14b8a6', vlanId: 120, vlanName: 'BIBLIOTECA' },
    { id: uid(), sourceDeviceId: srvLab01Id, sourcePort: 'eth0', targetDeviceId: swAccLab01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#eab308', vlanId: 110, vlanName: 'LAB' },
    { id: uid(), sourceDeviceId: nvr01Id, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: nvr02Id, sourcePort: 'eth0', targetDeviceId: swCam02Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: srvAcc01Id, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#f59e0b', vlanId: 90, vlanName: 'ACCESS' }
  );

  // 7. Conexiones a Dispositivos de Piso
  // En DCC:
  connections.push(
    { id: uid(), sourceDeviceId: camDc1, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: doorDc1, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/11', cableType: 'Cobre', color: '#f59e0b', vlanId: 90, vlanName: 'ACCESS' },
    { id: uid(), sourceDeviceId: pcDcDiag, sourcePort: 'eth0', targetDeviceId: swTorDcc01Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#10b981', vlanId: 10, vlanName: 'MGMT' }
  );

  // En TIC:
  connections.push(
    { id: uid(), sourceDeviceId: pcNoc, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#10b981', vlanId: 10, vlanName: 'MGMT' },
    { id: uid(), sourceDeviceId: pcSoc, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#ef4444', vlanId: 240, vlanName: 'SECURITY' },
    { id: uid(), sourceDeviceId: telTic, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/3', cableType: 'Cobre', color: '#ef4444', vlanId: 70, vlanName: 'VOICE' },
    { id: uid(), sourceDeviceId: apTic, sourcePort: 'eth0', targetDeviceId: swAccTicId, targetPort: 'Gi1/0/4', cableType: 'Cobre', color: '#0ea5e9', vlanId: 170, vlanName: 'WIFI-STAFF' }
  );

  // En ADM:
  connections.push(
    { id: uid(), sourceDeviceId: pcAdm1, sourcePort: 'eth0', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#f59e0b', vlanId: 30, vlanName: 'ADMIN' },
    { id: uid(), sourceDeviceId: pcAdm2, sourcePort: 'eth0', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/2', cableType: 'Cobre', color: '#f59e0b', vlanId: 30, vlanName: 'ADMIN' },
    { id: uid(), sourceDeviceId: telAdm1, sourcePort: 'eth0', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#ef4444', vlanId: 70, vlanName: 'VOICE' },
    { id: uid(), sourceDeviceId: telAdm2, sourcePort: 'eth0', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/11', cableType: 'Cobre', color: '#ef4444', vlanId: 70, vlanName: 'VOICE' },
    { id: uid(), sourceDeviceId: prtAdm, sourcePort: 'eth0', targetDeviceId: swAccAdm02Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#f59e0b', vlanId: 30, vlanName: 'ADMIN' },
    { id: uid(), sourceDeviceId: camAdm, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/12', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: apAdm, sourcePort: 'eth0', targetDeviceId: swAccAdm01Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#0ea5e9', vlanId: 170, vlanName: 'WIFI-STAFF' },
    { id: doorAdm, sourceDeviceId: doorAdm, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#f59e0b', vlanId: 90, vlanName: 'ACCESS' }
  );

  // En AUL:
  connections.push(
    { id: uid(), sourceDeviceId: pcAul1, sourcePort: 'eth0', targetDeviceId: swAccAul01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#ec4899', vlanId: 130, vlanName: 'AULAS' },
    { id: uid(), sourceDeviceId: pcAul2, sourcePort: 'eth0', targetDeviceId: swAccAul02Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#ec4899', vlanId: 130, vlanName: 'AULAS' },
    { id: uid(), sourceDeviceId: apAul1, sourcePort: 'eth0', targetDeviceId: swAccAul01Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#ec4899', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: apAul2, sourcePort: 'eth0', targetDeviceId: swAccAul02Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#ec4899', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: camAul, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' }
  );

  // En ING:
  connections.push(
    { id: uid(), sourceDeviceId: pcIng1, sourcePort: 'eth0', targetDeviceId: swAccIng02Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#6366f1', vlanId: 110, vlanName: 'LAB' },
    { id: uid(), sourceDeviceId: pcIng2, sourcePort: 'eth0', targetDeviceId: swAccIng01Id, targetPort: 'Gi1/0/1', cableType: 'Cobre', color: '#6366f1', vlanId: 110, vlanName: 'LAB' },
    { id: uid(), sourceDeviceId: apIng, sourcePort: 'eth0', targetDeviceId: swAccIng01Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#6366f1', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: camIng, sourcePort: 'eth0', targetDeviceId: swCam02Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' }
  );

  // En BIB:
  connections.push(
    { id: uid(), sourceDeviceId: pcBib1, sourcePort: 'eth0', targetDeviceId: swAccBib01Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#14b8a6', vlanId: 120, vlanName: 'BIBLIOTECA' },
    { id: uid(), sourceDeviceId: pcBib2, sourcePort: 'eth0', targetDeviceId: swAccBib01Id, targetPort: 'Gi1/0/6', cableType: 'Cobre', color: '#14b8a6', vlanId: 120, vlanName: 'BIBLIOTECA' },
    { id: uid(), sourceDeviceId: prtBib, sourcePort: 'eth0', targetDeviceId: swAccBib01Id, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#14b8a6', vlanId: 120, vlanName: 'BIBLIOTECA' },
    { id: uid(), sourceDeviceId: apBib, sourcePort: 'eth0', targetDeviceId: swAccBib01Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#0ea5e9', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: camBib, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/25', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' }
  );

  // En LAB:
  connections.push(
    { id: uid(), sourceDeviceId: pcLab1, sourcePort: 'eth0', targetDeviceId: swAccLab01Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#eab308', vlanId: 140, vlanName: 'INVESTIGACION' },
    { id: uid(), sourceDeviceId: apLab, sourcePort: 'eth0', targetDeviceId: swAccLab01Id, targetPort: 'Gi1/0/10', cableType: 'Cobre', color: '#0ea5e9', vlanId: 170, vlanName: 'WIFI-STAFF' }
  );

  // En CAM:
  connections.push(
    { id: uid(), sourceDeviceId: pcCam1, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/30', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: pcCam2, sourcePort: 'eth0', targetDeviceId: swCam01Id, targetPort: 'Gi1/0/31', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' },
    { id: uid(), sourceDeviceId: camExt1, sourcePort: 'eth0', targetDeviceId: swCam02Id, targetPort: 'Gi1/0/20', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' }
  );

  // En DEP:
  connections.push(
    { id: uid(), sourceDeviceId: apDep, sourcePort: 'eth0', targetDeviceId: swAccDep01Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#84cc16', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: camDep, sourcePort: 'eth0', targetDeviceId: swCam02Id, targetPort: 'Gi1/0/25', cableType: 'Cobre', color: '#f43f5e', vlanId: 80, vlanName: 'CCTV' }
  );

  // En RES:
  connections.push(
    { id: uid(), sourceDeviceId: apRes1, sourcePort: 'eth0', targetDeviceId: swAccRes01Id, targetPort: 'Gi1/0/5', cableType: 'Cobre', color: '#a855f7', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: apRes2, sourcePort: 'eth0', targetDeviceId: swAccRes01Id, targetPort: 'Gi1/0/6', cableType: 'Cobre', color: '#a855f7', vlanId: 180, vlanName: 'WIFI-STUDENT' },
    { id: uid(), sourceDeviceId: doorRes, sourcePort: 'eth0', targetDeviceId: swAccRes01Id, targetPort: 'Gi1/0/15', cableType: 'Cobre', color: '#f59e0b', vlanId: 90, vlanName: 'ACCESS' }
  );

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: rDcc,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if (typeof initTopoPositions === 'function') initTopoPositions();
  if (typeof renderAll === 'function') renderAll();
  
  if (typeof notify === 'function') {
    notify('Plantilla de Campus Universitario UTN cargada con éxito (Red Jerárquica 3 Capas, 10 Edificios)', 'success');
  }
}

if (typeof window !== 'undefined') {
  window.loadDemoData = loadDemoData;
  window.loadUniversityDemoData = loadUniversityDemoData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadDemoData, loadUniversityDemoData };
}
