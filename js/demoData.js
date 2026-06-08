function loadDemoData() {
  const r1 = uid(); const r2 = uid(); const r3 = uid();
  const rooms = [
    { id: r1, name: 'Data Center' },
    { id: r2, name: 'Edificio A2' },
    { id: r3, name: 'Edificio B1' }
  ];

  const racks = [];
  const devices = [];
  const connections = [];

  const rackSpecs = [
    // Data Center
    { room: r1, name: 'Rack 101', id_num: 101 },
    { room: r1, name: 'Rack 102', id_num: 102 },
    { room: r1, name: 'Rack 103', id_num: 103 },
    { room: r1, name: 'Rack 104', id_num: 104 },
    // Edificio A2
    { room: r2, name: 'Rack 201', id_num: 201 },
    { room: r2, name: 'Rack 202', id_num: 202 },
    { room: r2, name: 'Rack 203', id_num: 203 },
    // Edificio B1
    { room: r3, name: 'Rack 301', id_num: 301 },
    { room: r3, name: 'Rack 302', id_num: 302 },
    { room: r3, name: 'Rack 303', id_num: 303 },
    { room: r3, name: 'Rack 304', id_num: 304 },
    { room: r3, name: 'Rack 305', id_num: 305 }
  ];

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  let coreSwitchId = uid();
  let firewallId = uid();
  let switchesByRoom = { [r1]: [], [r2]: [], [r3]: [] };

  rackSpecs.forEach((spec, index) => {
    const rackId = uid();
    racks.push({
      id: rackId, roomId: spec.room, 
      name: spec.name, 
      height: 42, color: colors[index % colors.length], devices: []
    });

    // Switch - VLAN 10
    const swId = uid();
    switchesByRoom[spec.room].push(swId);
    devices.push({ id: swId, rackId, name: `Switch ${spec.name}`, type: 'switch', slotStart: 40, size: 1, ip: `10.10.10.${spec.id_num}`, mac: `00:11:22:33:10:${spec.id_num.toString(16)}`, serial: `SW-${spec.id_num}`, power: 250, plugs: 1, user: 'admin', pass: 'cisco', notes: 'VLAN 10 - Infraestructura' });

    // UPS - VLAN 20
    const upsId = uid();
    devices.push({ id: upsId, rackId, name: `UPS ${spec.name}`, type: 'ups', slotStart: 1, size: 2, ip: `10.10.20.${spec.id_num}`, mac: `00:11:22:33:20:${spec.id_num.toString(16)}`, serial: `UPS-${spec.id_num}`, power: 3000, plugs: 8, user: 'admin', pass: 'ups123', notes: 'VLAN 20 - UPS' });

    // Servers - VLAN 30
    let baseIP = (index * 10) + 10;
    
    for(let s=1; s<=5; s++) {
      const srvId = uid();
      let srvIp = `10.10.30.${baseIP + s}`;
      devices.push({ id: srvId, rackId, name: `Servidor Nodo ${s} - ${spec.name}`, type: 'server', slotStart: 3 + (s-1)*3, size: 2, ip: srvIp, mac: 'AA:BB:CC:00:30:'+(baseIP+s).toString(16), serial: `SRV-${spec.id_num}-${s}`, power: 600, plugs: 2, user: 'root', pass: 'secret', notes: 'VLAN 30 - Servidores' });
      
      // Conexión del servidor al switch del rack
      connections.push({ id: uid(), sourceDeviceId: srvId, sourcePort: `eth0`, targetDeviceId: swId, targetPort: `Gi1/0/${s}`, cableType: 'Cobre', color: '#10b981' });
    }

    // Si es Rack 101, meter Firewall y Core Switch
    if(spec.id_num === 101) {
      devices.push({ id: firewallId, rackId, name: `Firewall Edge`, type: 'firewall', slotStart: 42, size: 1, ip: '10.10.10.1', mac: '12:34:56:78:90:01', serial: 'FW-01', power: 100, plugs: 1, user: 'admin', pass: 'fortinet', notes: 'VLAN 10 - Gateway' });
      devices.push({ id: coreSwitchId, rackId, name: `Core Switch`, type: 'switch', slotStart: 41, size: 1, ip: '10.10.10.2', mac: '12:34:56:78:90:02', serial: 'CSW-01', power: 300, plugs: 2, user: 'admin', pass: 'cisco', notes: 'VLAN 10 - Core' });
      connections.push({ id: uid(), sourceDeviceId: firewallId, sourcePort: 'LAN1', targetDeviceId: coreSwitchId, targetPort: 'Te1/0/1', cableType: 'DAC', color: '#ef4444' });
    }
  });

  // Conexiones de Racks a Core Switch o Main Switch de su Sala
  switchesByRoom[r1].forEach((swId, index) => {
    connections.push({ id: uid(), sourceDeviceId: swId, sourcePort: 'Te1/1/1', targetDeviceId: coreSwitchId, targetPort: `Te1/0/${10 + index}`, cableType: 'Fibra SM', color: '#3b82f6' });
  });

  let r2MainSw = switchesByRoom[r2][0];
  connections.push({ id: uid(), sourceDeviceId: r2MainSw, sourcePort: 'Te1/1/2', targetDeviceId: coreSwitchId, targetPort: 'Te1/0/20', cableType: 'Fibra SM', color: '#ef4444' });
  switchesByRoom[r2].forEach((swId, index) => {
    if (swId !== r2MainSw) {
      connections.push({ id: uid(), sourceDeviceId: swId, sourcePort: 'Te1/1/1', targetDeviceId: r2MainSw, targetPort: `Te1/0/${10 + index}`, cableType: 'Cobre', color: '#3b82f6' });
    }
  });

  let r3MainSw = switchesByRoom[r3][0];
  connections.push({ id: uid(), sourceDeviceId: r3MainSw, sourcePort: 'Te1/1/2', targetDeviceId: coreSwitchId, targetPort: 'Te1/0/30', cableType: 'Fibra SM', color: '#ef4444' });
  switchesByRoom[r3].forEach((swId, index) => {
    if (swId !== r3MainSw) {
      connections.push({ id: uid(), sourceDeviceId: swId, sourcePort: 'Te1/1/1', targetDeviceId: r3MainSw, targetPort: `Te1/0/${10 + index}`, cableType: 'Cobre', color: '#3b82f6' });
    }
  });

  // Equipos de piso
  const cam1 = uid(); const cam2 = uid(); const cam3 = uid();
  const prt1 = uid(); const prt2 = uid(); const prt3 = uid();
  const tel1 = uid(); const tel2 = uid();
  const ap1 = uid(); const ap2 = uid();

  devices.push(
    // Cámaras - VLAN 60
    { id: cam1, rackId: null, category: 'floor', roomId: r1, name: 'Cámara 01', type: 'camera', ip: '10.10.60.10', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    { id: cam2, rackId: null, category: 'floor', roomId: r2, name: 'Cámara 02', type: 'camera', ip: '10.10.60.11', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    { id: cam3, rackId: null, category: 'floor', roomId: r3, name: 'Cámara 03', type: 'camera', ip: '10.10.60.12', mac: '', serial: '', power: 15, plugs: 1, user: 'admin', pass: '', notes: 'VLAN 60' },
    // Impresoras - VLAN 70
    { id: prt1, rackId: null, category: 'floor', roomId: r1, name: 'Impresora Administración', type: 'printer', ip: '10.10.70.10', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    { id: prt2, rackId: null, category: 'floor', roomId: r2, name: 'Impresora Finanzas', type: 'printer', ip: '10.10.70.11', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    { id: prt3, rackId: null, category: 'floor', roomId: r3, name: 'Impresora Recepción', type: 'printer', ip: '10.10.70.12', mac: '', serial: '', power: 150, plugs: 1, user: '', pass: '', notes: 'VLAN 70' },
    // Telefonía - VLAN 80
    { id: tel1, rackId: null, category: 'floor', roomId: r2, name: 'Teléfono 01', type: 'phone', ip: '10.10.80.10', mac: '', serial: '', power: 10, plugs: 1, user: '', pass: '', notes: 'VLAN 80' },
    { id: tel2, rackId: null, category: 'floor', roomId: r3, name: 'Teléfono 02', type: 'phone', ip: '10.10.80.11', mac: '', serial: '', power: 10, plugs: 1, user: '', pass: '', notes: 'VLAN 80' },
    // Access Points - IP Fija en VLAN 10 (proveen VLAN 50 / 90)
    { id: ap1, rackId: null, category: 'floor', roomId: r2, name: 'AP A2 Corporativo', type: 'ap', ip: '10.10.10.20', mac: '', serial: '', power: 20, plugs: 1, user: 'admin', pass: '', notes: 'Provee VLAN 50 y 90' },
    { id: ap2, rackId: null, category: 'floor', roomId: r3, name: 'AP B1 Corporativo', type: 'ap', ip: '10.10.10.30', mac: '', serial: '', power: 20, plugs: 1, user: 'admin', pass: '', notes: 'Provee VLAN 50 y 90' }
  );

  // Conexiones de equipos de piso al switch de su propia sala
  connections.push(
    { id: uid(), sourceDeviceId: cam1, sourcePort: 'eth0', targetDeviceId: switchesByRoom[r1][0], targetPort: 'Gi2/0/1', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: cam2, sourcePort: 'eth0', targetDeviceId: r2MainSw, targetPort: 'Gi2/0/2', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: cam3, sourcePort: 'eth0', targetDeviceId: r3MainSw, targetPort: 'Gi2/0/3', cableType: 'Cobre', color: '#10b981' },
    { id: uid(), sourceDeviceId: prt1, sourcePort: 'eth0', targetDeviceId: switchesByRoom[r1][0], targetPort: 'Gi2/0/10', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: prt2, sourcePort: 'eth0', targetDeviceId: r2MainSw, targetPort: 'Gi2/0/11', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: prt3, sourcePort: 'eth0', targetDeviceId: r3MainSw, targetPort: 'Gi2/0/12', cableType: 'Cobre', color: '#f59e0b' },
    { id: uid(), sourceDeviceId: tel1, sourcePort: 'eth0', targetDeviceId: r2MainSw, targetPort: 'Gi2/0/20', cableType: 'Cobre', color: '#8b5cf6' },
    { id: uid(), sourceDeviceId: tel2, sourcePort: 'eth0', targetDeviceId: r3MainSw, targetPort: 'Gi2/0/21', cableType: 'Cobre', color: '#8b5cf6' },
    { id: uid(), sourceDeviceId: ap1, sourcePort: 'eth0', targetDeviceId: r2MainSw, targetPort: 'Gi2/0/30', cableType: 'Cobre', color: '#0ea5e9' },
    { id: uid(), sourceDeviceId: ap2, sourcePort: 'eth0', targetDeviceId: r3MainSw, targetPort: 'Gi2/0/31', cableType: 'Cobre', color: '#0ea5e9' }
  );

  const topology = { nodePositions: {}, rackPositions: {}, rackSizes: {}, roomPositions: {}, roomSizes: {} };

  store.loadData({
    rooms, racks, devices, connections, currentRoomId: r1,
    selectedDeviceId: null, topology,
    topoZoom: 1, topoPanX: 0, topoPanY: 0,
    physZoom: 1, physPanX: 0, physPanY: 0
  });

  if(typeof initTopoPositions === 'function') initTopoPositions();
  renderAll();
  
  notify('Redimensionamiento de IP y VLANs aplicado con éxito', 'success');
}
