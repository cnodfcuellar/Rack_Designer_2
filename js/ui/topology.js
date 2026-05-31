import { store } from '../store.js';
import { TYPE_COLORS } from './catalog.js';
import { openCableModal } from './modals.js';

let canvas, ctx;
let topoAnim = null;
let panStart = null;
let panOrig = { x: 0, y: 0 };
export const nodePositions = {};
export const rackPositions = {};
let flowT = 0;

let draggingNode = null, draggingRack = null;
let nodeOrig = null;

export function initTopology() {
  canvas = document.getElementById('topology-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('mousedown', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    // Check device nodes first
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 22*22) {
        draggingNode = dev.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // Rack drag
    for (const rack of store.currentRacks) {
      const pos = rackPositions[rack.id];
      if (!pos) continue;
      const devs = store.allDevicesInRack(rack.id);
      const rh = Math.max(200, devs.length * 55 + 80);
      if (mx >= pos.x-10 && mx <= pos.x+180 && my >= pos.y-10 && my <= pos.y+rh) {
        draggingRack = rack.id;
        nodeOrig = { x: pos.x - mx, y: pos.y - my };
        return;
      }
    }
    // Pan
    panStart = { x: e.clientX, y: e.clientY };
    panOrig  = { x: store._raw.panX || 0, y: store._raw.panY || 0 };
  });

  canvas.addEventListener('mousemove', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;

    if (draggingNode) {
      nodePositions[draggingNode] = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      return;
    }
    if (draggingRack) {
      const np = { x: mx + nodeOrig.x, y: my + nodeOrig.y };
      const old = rackPositions[draggingRack];
      const dx = np.x - old.x, dy = np.y - old.y;
      rackPositions[draggingRack] = np;
      store.allDevicesInRack(draggingRack).forEach(dev => {
        if (nodePositions[dev.id]) {
          nodePositions[dev.id].x += dx;
          nodePositions[dev.id].y += dy;
        }
      });
      return;
    }
    if (panStart) {
      store._raw.panX = panOrig.x + (e.clientX - panStart.x);
      store._raw.panY = panOrig.y + (e.clientY - panStart.y);
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (draggingNode && e.detail === 2) {
      openCableModal(draggingNode);
    }
    draggingNode = null; draggingRack = null; panStart = null;
  });

  canvas.addEventListener('dblclick', e => {
    const zoom = store._raw.zoom || 1;
    const px   = store._raw.panX || 0;
    const py   = store._raw.panY || 0;
    const mx = (e.offsetX - px) / zoom;
    const my = (e.offsetY - py) / zoom;
    for (const dev of store._raw.devices) {
      const pos = nodePositions[dev.id];
      if (!pos) continue;
      const dx = mx - pos.x, dy = my - pos.y;
      if (dx*dx + dy*dy <= 22*22) {
        openCableModal(dev.id);
        return;
      }
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    store._raw.zoom = Math.min(3, Math.max(0.2, (store._raw.zoom || 1) * delta));
    updateZoomLabel();
  });
}

export function initTopoPositions() {
  const racks = store.currentRacks;
  const margin = 60;
  const rackW  = 180;
  racks.forEach((rack, ri) => {
    if (!rackPositions[rack.id]) {
      rackPositions[rack.id] = { x: margin + ri * (rackW + 80), y: margin };
    }
    const devices = store.allDevicesInRack(rack.id);
    devices.forEach((dev, di) => {
      if (!nodePositions[dev.id]) {
        nodePositions[dev.id] = {
          x: rackPositions[rack.id].x + rackW / 2,
          y: rackPositions[rack.id].y + 60 + di * 55
        };
      }
    });
  });
}

export function resizeCanvas() {
  if(!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

export function drawTopo() {
  if(!canvas || !ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  // Background dots
  ctx.fillStyle = '#1e2d4a22';
  for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
  }

  const zoom = store._raw.zoom || 1;
  const px   = store._raw.panX || 0;
  const py   = store._raw.panY || 0;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);

  // Draw rack containers
  const racks = store.currentRacks;
  racks.forEach(rack => {
    const pos = rackPositions[rack.id] || { x: 60, y: 60 };
    const devs = store.allDevicesInRack(rack.id);
    const rh = Math.max(200, devs.length * 55 + 80);
    const rw = 190;

    // Rack container
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x - 10, pos.y - 10, rw, rh, 12);
    ctx.fillStyle = rack.color + '11';
    ctx.strokeStyle = rack.color + '66';
    ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();

    // Rack label
    ctx.fillStyle = rack.color;
    ctx.font = `bold 11px 'Space Grotesk', sans-serif`;
    ctx.fillText(rack.name, pos.x, pos.y + 8);
    ctx.restore();
  });

  // Draw connections (Bezier curves + flow dots)
  flowT += 0.015;
  store._raw.connections.forEach(conn => {
    const srcPos = nodePositions[conn.sourceDeviceId];
    const dstPos = nodePositions[conn.targetDeviceId];
    if (!srcPos || !dstPos) return;

    const x1 = srcPos.x, y1 = srcPos.y;
    const x2 = dstPos.x, y2 = dstPos.y;
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;

    // Cable line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.strokeStyle = conn.color || '#3b82f6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.stroke();

    // Flow dot
    const t = (Math.sin(flowT + conn.id.charCodeAt(0) * 0.1) * 0.5 + 0.5);
    const bx = bezierPoint(x1, cx1, cx2, x2, t);
    const by = bezierPoint(y1, cy1, cy2, y2, t);
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fillStyle = conn.color || '#3b82f6';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();
  });

  // Draw device nodes
  store._raw.devices.forEach(dev => {
    const pos = nodePositions[dev.id];
    if (!pos) return;
    const col = TYPE_COLORS[dev.type] || '#888';
    const r = 22;

    ctx.save();
    // Glow
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI*2);
    ctx.fillStyle = col + '22'; ctx.fill();
    // Circle
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
    ctx.fillStyle = '#151c2e';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    // Icon
    ctx.font = '14px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const icons = { server:'🖥', switch:'🔀', router:'🌐', firewall:'🔥', ups:'🔋', storage:'💾' };
    ctx.fillText(icons[dev.type]||'●', pos.x, pos.y);
    // Name
    ctx.font = '9px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#c0cce0';
    ctx.fillText(dev.name.slice(0, 14), pos.x, pos.y + r + 10);
    // IP
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = col;
    ctx.fillText(dev.ip || '', pos.x, pos.y + r + 20);
    ctx.restore();
  });

  ctx.restore();
  topoAnim = requestAnimationFrame(drawTopo);
}

function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

export function startTopo() {
  resizeCanvas();
  initTopoPositions();
  if (topoAnim) cancelAnimationFrame(topoAnim);
  drawTopo();
}

export function stopTopo() {
  if (topoAnim) cancelAnimationFrame(topoAnim);
  topoAnim = null;
}

export function updateZoomLabel() {
  const lbl = document.getElementById('zoom-level');
  if (lbl) lbl.textContent = Math.round((store._raw.zoom || 1) * 100) + '%';
}
