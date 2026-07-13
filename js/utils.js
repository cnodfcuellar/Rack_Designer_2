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
  const icons = { info: '<i class="svg-icon icon-bolt" style="width:14px;height:14px;"></i>', success: '<i class="svg-icon icon-check" style="width:14px;height:14px;"></i>', error: '<i class="svg-icon icon-x" style="width:14px;height:14px;"></i>', warn: '<i class="svg-icon icon-warning" style="width:14px;height:14px;"></i>' };
  el.innerHTML = `${icons[type]||'<i class="svg-icon icon-bolt" style="width:14px;height:14px;"></i>'} ${escapeHTML(msg)}`;
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

function customConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '110000';
    
    overlay.innerHTML = `
      <div class="modal custom-dialog scale-in" style="max-width: 400px; padding: 20px;">
        <div class="modal-title">
          <i class="svg-icon icon-warning" style="width:18px; height:18px; color: var(--amber);"></i> ${escapeHTML(title)}
        </div>
        <div class="modal-sub" style="margin-top: 12px; color: var(--text-secondary); line-height: 1.5; font-family: var(--font-ui), sans-serif;">
          ${escapeHTML(message)}
        </div>
        <div class="modal-footer" style="margin-top: 24px;">
          <button class="btn-cancel" id="dialog-btn-cancel">Cancelar</button>
          <button class="btn-confirm danger" id="dialog-btn-confirm">Confirmar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const cleanup = (value) => {
      overlay.classList.add('fade-out');
      overlay.addEventListener('animationend', () => {
        overlay.remove();
      });
      setTimeout(() => {
        if (document.body.contains(overlay)) overlay.remove();
      }, 300);
      resolve(value);
    };

    overlay.querySelector('#dialog-btn-confirm').addEventListener('click', () => cleanup(true));
    overlay.querySelector('#dialog-btn-cancel').addEventListener('click', () => cleanup(false));
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}
