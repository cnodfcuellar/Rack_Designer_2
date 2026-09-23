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

function loadDemoData() {
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

if (typeof window !== 'undefined') {
  window.loadDemoData = loadDemoData;
}
