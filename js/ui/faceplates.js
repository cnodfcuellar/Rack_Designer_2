import { store } from '../store.js';

export function buildFaceplate(device, heightPx) {
  const h = heightPx;
  const type = device.type;

  if (type === 'server') {
    const brand = device.name.toLowerCase().includes('hp') ? 'PROLIANT' :
                  device.name.toLowerCase().includes('dell') ? 'DELL POWEREDGE' :
                  device.name.toUpperCase().slice(0, 12);
    return `<div class="fp-server" style="height:${h}px">
      <div class="ear"></div>
      <div class="vent"></div>
      <div class="fp-mid">
        <div class="dev-name">${device.name}</div>
        <div class="lcd">${brand} · ${device.ip || 'NO IP'}</div>
      </div>
      <div class="fp-right">
        <div class="power-btn"></div>
      </div>
      <div class="ear-r"></div>
    </div>`;
  }
  if (type === 'switch') {
    const ports = Array.from({length: 24}, (_,i) => {
      const connected = store._raw.connections.some(c =>
        (c.sourceDeviceId === device.id || c.targetDeviceId === device.id));
      const cls = connected && i < 2 ? 'connected' : (i > 20 ? 'inactive' : '');
      return `<div class="port-rj45 ${cls}" style="--blink-delay:${(i*0.13).toFixed(2)}s"></div>`;
    }).join('');
    const sfpPorts = Array.from({length:2}, (_,i) =>
      `<div class="sfp-port" style="--blink-delay:${(i*0.4).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-switch" style="height:${h}px">
      <div class="ports-grid">${ports}</div>
      <div class="sw-right">${sfpPorts}</div>
    </div>`;
  }
  if (type === 'ups') {
    return `<div class="fp-ups" style="height:${h}px">
      <div class="ups-left">
        <div class="ups-led green"></div>
        <div class="ups-led off"></div>
        <div class="ups-led off"></div>
      </div>
      <div class="ups-lcd">
        <div class="ups-lcd-line">230V IN / 230V OUT</div>
        <div class="ups-lcd-line">BATT: 100% LOAD: 45%</div>
        <div class="ups-lcd-line">RUNTIME: 18MIN</div>
      </div>
      <div class="ups-right">
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
        <div class="ups-jack"></div>
      </div>
    </div>`;
  }
  if (type === 'router') {
    const sfps = Array.from({length:8}, (_,i) =>
      `<div class="sfp-module" style="--blink-delay:${(i*0.3).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-router" style="height:${h}px">
      <div class="rtr-brand"><div class="rtr-logo">RT</div></div>
      <div class="sfp-row">${sfps}</div>
      <div class="vent-r"></div>
    </div>`;
  }
  if (type === 'firewall') {
    return `<div class="fp-firewall" style="height:${h}px">
      <div class="fw-icon">🔥</div>
      <div class="fw-mid">
        <div class="fw-name">${device.name}</div>
        <div class="fw-status">${device.ip || 'NO IP'} │ ACTIVE</div>
      </div>
      <div class="fw-leds">
        <div class="fw-led g"></div>
        <div class="fw-led a"></div>
        <div class="fw-led r"></div>
      </div>
    </div>`;
  }
  if (type === 'storage') {
    const drives = Array.from({length:10}, (_,i) =>
      `<div class="drive-slot ${i < 8 ? 'active' : ''}" style="--blink-delay:${(i*0.2).toFixed(2)}s"></div>`).join('');
    return `<div class="fp-storage" style="height:${h}px">
      <div class="st-left">
        <div class="ups-led green"></div>
        <div class="ups-led" style="background:var(--cyan);box-shadow:0 0 4px var(--cyan)"></div>
      </div>
      <div class="st-drives">${drives}</div>
      <div class="st-right">
        <div class="st-port"></div>
        <div class="st-port"></div>
        <div class="st-port"></div>
      </div>
    </div>`;
  }
  // Default
  return `<div style="height:${h}px;display:flex;align-items:center;padding:0 8px;background:#111;font-size:10px;color:#666">${device.name}</div>`;
}
