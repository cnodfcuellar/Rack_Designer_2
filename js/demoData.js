function loadDemoData() {
  const r1 = uid(); const r2 = uid(); const r3 = uid();
  const rooms = [
    { id: r1, name: 'Sala Principal (Core)' },
    { id: r2, name: 'Sala Secundaria (Edge)' },
    { id: r3, name: 'Sala de Cómputo (Storage/Servers)' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  const racksPerRoom = [4, 3, 5];
  let c = 0;
  
  const switchIds = [];
  const serverIds = [];
  const routerIds = [];

  racksPerRoom.forEach((num, roomIdx) => {
    for (let i=0; i<num; i++) {
      const rackId = uid();
      racks.push({
        id: rackId, roomId: rooms[roomIdx].id, 
        name: `Rack ${roomIdx+1}0${i+1}`, 
        height: 42, color: colors[c % colors.length], devices: []
      });
      c++;

      // UPS
      const upsId = uid();
      devices.push({ id: upsId, rackId, name: 'UPS APC 3000VA', type: 'ups', slotStart: 1, size: 2, ip: '10.0.'+(roomIdx+1)+'.'+(i+1), mac: '00:11:22:33:44:55', serial: 'UPS-'+uid(), power: 3000, plugs: 8, user: 'admin', pass: 'ups123', notes: 'Respaldo 15m' });

      // Servers
      for(let s=1; s<=5; s++) {
        const srvId = uid();
        serverIds.push(srvId);
        devices.push({ id: srvId, rackId, name: `Server Dell R740 - Nodo ${s}`, type: 'server', slotStart: 3 + (s-1)*3, size: 2, ip: '192.168.10.'+(s*10), mac: 'AA:BB:CC:00:11:22', serial: 'SRV-'+uid(), power: 600, plugs: (s % 2 === 0 ? 4 : 2), user: 'root', pass: 'secret', notes: 'Cluster ESXi' });
      }

      // Storage
      if (roomIdx === 2 && i < 2) {
         const stoId = uid();
         devices.push({ id: stoId, rackId, name: `SAN Storage NetApp`, type: 'storage', slotStart: 20, size: 4, ip: '192.168.20.5', mac: 'FF:AA:BB:CC:DD:EE', serial: 'STO-'+uid(), power: 1200, plugs: 2, user: 'admin', pass: 'netapp', notes: 'LUNs 0-10' });
      }

      // Switches
      const swId = uid();
      switchIds.push(swId);
      devices.push({ id: swId, rackId, name: `Switch 48P - Acceso`, type: 'switch', slotStart: 40, size: 1, ip: '192.168.1.254', mac: 'FF:EE:DD:CC:BB:AA', serial: 'SW-'+uid(), power: 250, plugs: 1, user: 'admin', pass: 'cisco', notes: 'Trunk a Core' });
      
      // Routers / Firewalls
      if(i === 0 && roomIdx === 0) {
         const rtrId = uid();
         routerIds.push(rtrId);
         devices.push({ id: rtrId, rackId, name: `Edge Router BGP`, type: 'router', slotStart: 41, size: 1, ip: '10.0.0.1', mac: '12:34:56:78:90:AB', serial: 'RTR-'+uid(), power: 180, plugs: 2, user: 'admin', pass: 'admin', notes: 'Enlace ISP Principal' });
         const fwId = uid();
         devices.push({ id: fwId, rackId, name: `Firewall FortiGate`, type: 'firewall', slotStart: 42, size: 1, ip: '10.0.0.2', mac: '12:34:56:78:90:BB', serial: 'FWL-'+uid(), power: 100, plugs: 1, user: 'admin', pass: 'fortinet', notes: 'DMZ' });
      }
    }
  });

  // Conexiones: Servidores al Switch de su Rack
  serverIds.forEach((srv, i) => {
    const sw = switchIds[Math.floor(i / 5)]; // Asumimos 5 servidores por rack y switch
    if (sw) {
      connections.push({ id: uid(), sourceDeviceId: srv, sourcePort: `eth0`, targetDeviceId: sw, targetPort: `Gi1/0/${(i%5)+1}`, cableType: 'UTP Cat6a', color: '#10b981' });
    }
  });

  // Conexiones: Switches entre sí
  for(let i=0; i<switchIds.length-1; i++) {
    connections.push({ id: uid(), sourceDeviceId: switchIds[i], sourcePort: 'Te1/1/1', targetDeviceId: switchIds[i+1], targetPort: 'Te1/1/2', cableType: 'Fibra OM4', color: '#3b82f6' });
  }

  // Conexiones: Primer switch a router
  if(routerIds.length > 0 && switchIds.length > 0) {
    connections.push({ id: uid(), sourceDeviceId: routerIds[0], sourcePort: 'Gi0/0/0', targetDeviceId: switchIds[0], targetPort: 'Te1/1/4', cableType: 'DAC', color: '#ef4444' });
  }

  // NUEVOS EQUIPOS DE PISO EN LAS DEMOS
  const floorDev1 = uid();
  const floorDev2 = uid();
  const floorDev3 = uid();
  const floorDev4 = uid();
  const floorDev5 = uid();

  devices.push(
    { id: floorDev1, rackId: null, category: 'floor', roomId: r1, name: 'PC Monitoreo - NOC', type: 'pc', ip: '10.0.1.150', mac: '00:AA:BB:CC:DD:11', serial: 'PC-' + uid(), power: 250, plugs: 1, user: 'operator', pass: 'noc2026', notes: 'Consola de Monitoreo NOC 24/7' },
    { id: floorDev2, rackId: null, category: 'floor', roomId: r1, name: 'Cámara Seguridad NOC', type: 'camera', ip: '10.0.1.160', mac: '00:AA:BB:CC:DD:22', serial: 'CAM-' + uid(), power: 15, plugs: 1, user: 'admin', pass: 'camera123', notes: 'Cámara Domo PTZ' },
    { id: floorDev3, rackId: null, category: 'floor', roomId: r1, name: 'AP Core WiFi', type: 'ap', ip: '10.0.1.170', mac: '00:AA:BB:CC:DD:33', serial: 'AP-' + uid(), power: 20, plugs: 1, user: 'admin', pass: 'wifi2026', notes: 'SSID: NOC_Admin' },
    { id: floorDev4, rackId: null, category: 'floor', roomId: r2, name: 'Teléfono VoIP Recepción', type: 'phone', ip: '10.0.2.180', mac: '00:AA:BB:CC:DD:44', serial: 'TEL-' + uid(), power: 10, plugs: 1, user: 'reception', pass: 'tel789', notes: 'VoIP Grandstream' },
    { id: floorDev5, rackId: null, category: 'floor', roomId: r3, name: 'Impresora Administrativa', type: 'printer', ip: '10.0.3.190', mac: '00:AA:BB:CC:DD:55', serial: 'PRT-' + uid(), power: 350, plugs: 1, user: 'admin', pass: 'print456', notes: 'Láser Color Multifunción' }
  );

  if (switchIds.length > 0) {
    connections.push(
      { id: uid(), sourceDeviceId: floorDev1, sourcePort: 'eth0', targetDeviceId: switchIds[0], targetPort: 'Gi1/0/43', cableType: 'UTP Cat6a', color: '#0ea5e9' },
      { id: uid(), sourceDeviceId: floorDev2, sourcePort: 'PoE', targetDeviceId: switchIds[0], targetPort: 'Gi1/0/44', cableType: 'PoE Camera', color: '#8b5cf6' },
      { id: uid(), sourceDeviceId: floorDev3, sourcePort: 'PoE', targetDeviceId: switchIds[0], targetPort: 'Gi1/0/45', cableType: 'PoE WiFi', color: '#10b981' }
    );
  }

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: r1,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if(typeof initTopoPositions === 'function') initTopoPositions();
  renderAll();
  
  notify('Demostración gigante cargada', 'success');
}
