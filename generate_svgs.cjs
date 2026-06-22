const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

const svgs = {
  'server': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#1e293b" />
    <rect x="0" y="0" width="20" height="48" fill="#0f172a" /> <!-- Left Ear -->
    <rect x="380" y="0" width="20" height="48" fill="#0f172a" /> <!-- Right Ear -->
    <!-- Drives/Vents -->
    <g fill="#020617" stroke="#334155" stroke-width="1">
      ${Array.from({length: 6}).map((_, i) => `<rect x="${30 + i*35}" y="8" width="30" height="32" rx="2" />`).join('')}
    </g>
    <!-- LCD Panel -->
    <rect x="250" y="12" width="100" height="24" fill="#064e3b" stroke="#047857" rx="2" />
    <text x="255" y="27" fill="#34d399" font-family="monospace" font-size="10">STATUS OK</text>
    <!-- Power Button -->
    <circle cx="365" cy="24" r="6" fill="#10b981" />
  </svg>`,

  'switch': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#334155" />
    <rect x="0" y="0" width="16" height="24" fill="#1e293b" />
    <rect x="384" y="0" width="16" height="24" fill="#1e293b" />
    <!-- RJ45 Ports (24 total: 12x2 grid) -->
    <g fill="#000" stroke="#475569" stroke-width="1">
      ${Array.from({length: 12}).map((_, i) => `
        <rect x="${30 + i*16}" y="3" width="12" height="8" rx="1" />
        <rect x="${30 + i*16}" y="13" width="12" height="8" rx="1" />
      `).join('')}
    </g>
    <!-- LEDs -->
    <g fill="#10b981">
      ${Array.from({length: 12}).map((_, i) => `
        <rect x="${32 + i*16}" y="1" width="2" height="1" />
        <circle cx="${38 + i*16}" cy="12" r="1.5" />
      `).join('')}
    </g>
    <!-- SFP Ports -->
    <g fill="#020617" stroke="#64748b" stroke-width="1.5">
      <rect x="250" y="6" width="18" height="12" rx="1" />
      <rect x="275" y="6" width="18" height="12" rx="1" />
      <rect x="300" y="6" width="18" height="12" rx="1" />
      <rect x="325" y="6" width="18" height="12" rx="1" />
    </g>
    <!-- Power LED -->
    <circle cx="365" cy="12" r="3" fill="#10b981" />
  </svg>`,

  'router': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#0f172a" />
    <rect x="0" y="0" width="16" height="24" fill="#020617" />
    <rect x="384" y="0" width="16" height="24" fill="#020617" />
    <text x="30" y="16" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">ROUTER CORE</text>
    <!-- SFP/WAN Ports -->
    <g fill="#000" stroke="#475569" stroke-width="1">
      ${Array.from({length: 8}).map((_, i) => `<rect x="${150 + i*22}" y="6" width="16" height="12" rx="1" />`).join('')}
    </g>
    <circle cx="350" cy="12" r="3" fill="#f59e0b" />
    <circle cx="365" cy="12" r="3" fill="#10b981" />
  </svg>`,

  'firewall': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#450a0a" />
    <rect x="0" y="0" width="16" height="24" fill="#280505" />
    <rect x="384" y="0" width="16" height="24" fill="#280505" />
    <text x="30" y="16" fill="#fca5a5" font-family="monospace" font-size="12" font-weight="bold">SECURITY APPLIANCE</text>
    <!-- Ports -->
    <g fill="#000" stroke="#7f1d1d" stroke-width="1">
      ${Array.from({length: 6}).map((_, i) => `<rect x="${200 + i*16}" y="6" width="12" height="12" rx="1" />`).join('')}
    </g>
    <circle cx="330" cy="12" r="2" fill="#ef4444" />
    <circle cx="345" cy="12" r="2" fill="#10b981" />
    <circle cx="360" cy="12" r="2" fill="#3b82f6" />
  </svg>`,

  'storage': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#1e293b" />
    <rect x="0" y="0" width="16" height="48" fill="#0f172a" />
    <rect x="384" y="0" width="16" height="48" fill="#0f172a" />
    <!-- HDD Slots -->
    <g fill="#020617" stroke="#475569" stroke-width="1">
      ${Array.from({length: 12}).map((_, i) => `<rect x="${25 + i*26}" y="4" width="22" height="40" rx="2" />`).join('')}
    </g>
    <!-- Blinking LEDs pattern on HDDs -->
    <g fill="#06b6d4">
      ${Array.from({length: 12}).map((_, i) => `<circle cx="${36 + i*26}" cy="38" r="2" />`).join('')}
    </g>
    <circle cx="355" cy="24" r="4" fill="#10b981" />
    <circle cx="370" cy="24" r="4" fill="#ef4444" />
  </svg>`,

  'ups': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#27272a" />
    <rect x="0" y="0" width="16" height="48" fill="#18181b" />
    <rect x="384" y="0" width="16" height="48" fill="#18181b" />
    <!-- Vents left -->
    <g fill="#000">
      ${Array.from({length: 8}).map((_, i) => `<rect x="${30 + i*6}" y="10" width="3" height="28" rx="1" />`).join('')}
    </g>
    <!-- UPS LCD -->
    <rect x="150" y="10" width="80" height="28" fill="#1e40af" stroke="#1d4ed8" rx="3" />
    <text x="155" y="22" fill="#bfdbfe" font-family="monospace" font-size="8">230V IN/OUT</text>
    <text x="155" y="32" fill="#bfdbfe" font-family="monospace" font-size="8">BATT: 100%</text>
    <!-- Buttons -->
    <circle cx="250" cy="24" r="6" fill="#4b5563" />
    <circle cx="270" cy="24" r="6" fill="#4b5563" />
    <circle cx="290" cy="24" r="6" fill="#4b5563" />
  </svg>`,

  'patchpanel': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#1e293b" />
    <rect x="0" y="0" width="16" height="24" fill="#0f172a" />
    <rect x="384" y="0" width="16" height="24" fill="#0f172a" />
    <!-- Patch Ports -->
    <g fill="#000" stroke="#475569" stroke-width="1">
      ${Array.from({length: 24}).map((_, i) => `<rect x="${25 + i*14}" y="6" width="10" height="12" rx="1" />`).join('')}
    </g>
  </svg>`,

  'pdu': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#000" />
    <rect x="0" y="0" width="16" height="24" fill="#111" />
    <rect x="384" y="0" width="16" height="24" fill="#111" />
    <!-- AC Sockets -->
    <g fill="#18181b" stroke="#3f3f46" stroke-width="1">
      ${Array.from({length: 8}).map((_, i) => `<circle cx="${40 + i*40}" cy="12" r="8" />
        <rect x="${38 + i*40}" y="8" width="4" height="2" fill="#000" />
        <rect x="${38 + i*40}" y="14" width="4" height="2" fill="#000" />
      `).join('')}
    </g>
    <!-- LCD Voltage -->
    <rect x="330" y="4" width="40" height="16" fill="#7f1d1d" />
    <text x="335" y="16" fill="#fca5a5" font-family="monospace" font-size="10" font-weight="bold">230</text>
  </svg>`,

  'kvm': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#334155" />
    <rect x="0" y="0" width="16" height="24" fill="#1e293b" />
    <rect x="384" y="0" width="16" height="24" fill="#1e293b" />
    <!-- Display panel closed -->
    <rect x="40" y="2" width="200" height="20" fill="#0f172a" stroke="#475569" />
    <text x="120" y="16" fill="#94a3b8" font-family="sans-serif" font-size="10">KVM CONSOLE</text>
    <rect x="260" y="8" width="80" height="8" fill="#1e293b" rx="2" />
  </svg>`,

  'tray': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#475569" />
    <rect x="0" y="0" width="16" height="24" fill="#334155" />
    <rect x="384" y="0" width="16" height="24" fill="#334155" />
    <!-- Tray surface vents -->
    <g fill="#1e293b">
      ${Array.from({length: 30}).map((_, i) => `<rect x="${25 + i*11}" y="10" width="6" height="4" rx="2" />`).join('')}
    </g>
  </svg>`,

  'organizer': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24">
    <rect width="400" height="24" fill="#0f172a" />
    <rect x="0" y="0" width="16" height="24" fill="#020617" />
    <rect x="384" y="0" width="16" height="24" fill="#020617" />
    <!-- Cable management fingers -->
    <g fill="#334155">
      ${Array.from({length: 20}).map((_, i) => `<rect x="${25 + i*18}" y="0" width="8" height="24" rx="1" />`).join('')}
    </g>
  </svg>`,

  // FLOOR DEVICES
  'pc': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="16" y="8" width="32" height="48" fill="#1e293b" rx="2"/><rect x="24" y="16" width="16" height="4" fill="#0f172a"/><circle cx="32" cy="48" r="4" fill="#10b981"/></svg>`,
  'ap': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><circle cx="32" cy="32" r="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#e2e8f0"/><circle cx="32" cy="32" r="3" fill="#10b981"/></svg>`,
  'camera': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><circle cx="32" cy="32" r="20" fill="#f1f5f9"/><circle cx="32" cy="32" r="14" fill="#0f172a"/><circle cx="32" cy="32" r="6" fill="#334155"/><circle cx="35" cy="29" r="2" fill="#fff"/></svg>`,
  'printer': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="8" y="24" width="48" height="32" fill="#e2e8f0" rx="4"/><rect x="16" y="8" width="32" height="16" fill="#cbd5e1"/><rect x="24" y="40" width="16" height="24" fill="#fff" stroke="#cbd5e1"/><circle cx="48" cy="32" r="2" fill="#ef4444"/></svg>`,
  'phone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="12" y="12" width="40" height="40" fill="#334155" rx="4"/><rect x="20" y="20" width="24" height="12" fill="#94a3b8"/><rect x="20" y="36" width="24" height="12" fill="#1e293b" rx="2"/></svg>`,
  'door': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="16" y="8" width="32" height="56" fill="#d97706"/><rect x="20" y="12" width="10" height="24" fill="#fcd34d"/><rect x="34" y="12" width="10" height="24" fill="#fcd34d"/><circle cx="44" cy="40" r="2" fill="#000"/></svg>`,
  'san': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="12" y="16" width="40" height="32" fill="#1e293b" rx="2"/><g fill="#0ea5e9">${Array.from({length: 4}).map((_, i) => `<rect x="16" y="${20 + i*6}" width="32" height="4"/>`).join('')}</g></svg>`,
  'nas': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="16" y="20" width="32" height="24" fill="#334155" rx="2"/><g fill="#38bdf8"><circle cx="24" cy="32" r="4"/><circle cx="40" cy="32" r="4"/></g></svg>`,
};

const typeMap = {
  'server': 'server',
  'switch': 'network',
  'router': 'network',
  'firewall': 'network',
  'storage': 'storage',
  'ups': 'power',
  'patchpanel': 'wiring',
  'pdu': 'power',
  'kvm': 'accessories',
  'tray': 'accessories',
  'organizer': 'wiring',
  'pc': 'floor',
  'ap': 'network',
  'camera': 'floor',
  'printer': 'floor',
  'phone': 'floor',
  'door': 'floor',
  'san': 'storage',
  'nas': 'storage'
};

for (const [name, content] of Object.entries(svgs)) {
  const folder = typeMap[name] || '';
  const dirPath = path.join(imgDir, folder);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, name + '.svg'), content);
}
console.log('SVGs generated inside assets/img/ subfolders!');
