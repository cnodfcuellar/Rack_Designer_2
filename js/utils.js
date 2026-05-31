const uid = () => Math.random().toString(36).slice(2, 10);
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
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
