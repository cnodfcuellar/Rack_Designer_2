const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
};
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const lerp = (a, b, t) => a + (b - a) * t;

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function notify(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  const icons = { info: '●', success: '✓', error: '✗', warn: '⚠' };
  el.innerHTML = `<span>${icons[type]||'●'}</span> ${escapeHTML(msg)}`;
  const area = document.getElementById('notif-area');
  area.appendChild(el);
  while (area.children.length > 5) {
    area.removeChild(area.firstChild);
  }
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDeviceLocation(device) {
  if (!device) return 'Desconocido';
  let roomName = 'Desconocido';
  if (device.rackId) {
    const rack = store.rackById(device.rackId);
    if (rack) {
      const room = store._raw.rooms.find(r => r.id === rack.roomId);
      roomName = room ? room.name : 'Sala Desconocida';
      return `${roomName} — ${rack.name}`;
    }
  } else if (device.roomId) {
    const room = store._raw.rooms.find(r => r.id === device.roomId);
    roomName = room ? room.name : 'Sala Desconocida';
    return `${roomName} — PISO`;
  }
  return 'Sin asignar';
}
