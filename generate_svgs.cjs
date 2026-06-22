const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

const svgs = {
  'server': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#444" />
    <rect x="0" y="0" width="400" height="6" fill="#333" />
    <rect x="0" y="42" width="400" height="6" fill="#333" />
    <g fill="#222">
      ${Array.from({length: 20}).map((_, i) => `<rect x="${20 + i*12}" y="14" width="8" height="20" />`).join('')}
    </g>
    <rect x="300" y="10" width="40" height="28" fill="#111" />
    <rect x="305" y="28" width="6" height="6" fill="#00ff00" />
    <rect x="313" y="22" width="6" height="12" fill="#00ff00" />
    <rect x="321" y="14" width="6" height="20" fill="#00ff00" />
    <circle cx="360" cy="24" r="5" fill="#555" />
    <circle cx="380" cy="24" r="5" fill="#555" />
  </svg>`,

  'switch': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#333" />
    <rect x="0" y="0" width="400" height="8" fill="#222" />
    <rect x="0" y="40" width="400" height="8" fill="#222" />
    <g fill="#e0e0e0">
      ${Array.from({length: 24}).map((_, i) => `<rect x="${20 + i*15}" y="19" width="10" height="10" />`).join('')}
    </g>
  </svg>`,

  'router': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#f0f0f0" />
    <rect x="0" y="40" width="400" height="8" fill="#d0d0d0" />
    <rect x="20" y="8" width="32" height="32" rx="4" fill="#1e90ff" />
    <path d="M 30 20 L 36 28 L 42 20" stroke="#fff" stroke-width="3" fill="none" />
    <rect x="220" y="14" width="60" height="20" fill="#e0e0e0" />
    <g fill="#b0b0b0">
      <rect x="300" y="14" width="10" height="10" />
      <rect x="316" y="14" width="10" height="10" />
      <rect x="300" y="28" width="10" height="10" />
      <rect x="316" y="28" width="10" height="10" />
    </g>
  </svg>`,

  'firewall': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#2b2b2b" />
    <rect x="0" y="0" width="400" height="10" fill="#111" />
    <circle cx="30" cy="24" r="5" fill="#00ff00" />
    <rect x="45" y="20" width="10" height="8" fill="#ff0000" />
    <rect x="70" y="16" width="40" height="16" fill="#555" />
    <circle cx="150" cy="24" r="5" fill="#00ff00" />
    <rect x="165" y="20" width="10" height="8" fill="#ff0000" />
    <rect x="190" y="16" width="40" height="16" fill="#555" />
    <circle cx="270" cy="24" r="5" fill="#00ff00" />
    <rect x="285" y="20" width="10" height="8" fill="#ff0000" />
    <rect x="310" y="16" width="40" height="16" fill="#555" />
  </svg>`,

  'storage': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#ececec" />
    <rect x="16" y="10" width="16" height="12" rx="2" fill="#d4d4d4" />
    <rect x="16" y="26" width="16" height="12" rx="2" fill="#d4d4d4" />
    <g fill="#a0a0a0">
      ${Array.from({length: 30}).map((_, i) => `<rect x="${60 + i*10}" y="12" width="6" height="24" />`).join('')}
    </g>
  </svg>`,

  'ups': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#1c1c1c" />
    <rect x="10" y="8" width="80" height="32" fill="#2a2a2a" />
    <circle cx="24" cy="24" r="6" fill="#00ff00" />
    <rect x="40" y="20" width="40" height="8" fill="#111" />
    <g fill="#444">
      ${Array.from({length: 12}).map((_, i) => `<rect x="${120 + i*20}" y="12" width="12" height="24" rx="2" />`).join('')}
    </g>
  </svg>`,

  'patchpanel': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#2d2d2d" />
    <rect x="0" y="0" width="400" height="8" fill="#1a1a1a" />
    <rect x="0" y="40" width="400" height="8" fill="#1a1a1a" />
    <g fill="#ff00ff">
      ${Array.from({length: 12}).map((_, i) => `<rect x="${20 + i*15}" y="12" width="10" height="10" /> <rect x="${20 + i*15}" y="26" width="10" height="10" />`).join('')}
    </g>
  </svg>`,

  'pdu': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#111" />
    <rect x="360" y="0" width="40" height="48" fill="#eab308" />
    <text x="380" y="32" fill="#000" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">⚡</text>
    <g fill="#000" stroke="#333" stroke-width="2">
      ${Array.from({length: 8}).map((_, i) => `<rect x="${20 + i*40}" y="10" width="24" height="28" rx="4" />`).join('')}
    </g>
  </svg>`,

  'kvm': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#383838" />
    <rect x="100" y="8" width="200" height="8" fill="#111" rx="4" />
    <rect x="80" y="16" width="240" height="32" fill="#222" />
    <rect x="190" y="24" width="20" height="4" fill="#555" />
  </svg>`,

  'tray': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#555555" />
    <rect x="0" y="24" width="400" height="24" fill="#444444" />
    <g fill="#222">
      ${Array.from({length: 25}).map((_, i) => `<rect x="${25 + i*14}" y="16" width="8" height="16" rx="4" />`).join('')}
    </g>
  </svg>`,

  'organizer': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#222" />
    <g fill="#111">
      ${Array.from({length: 40}).map((_, i) => `<rect x="${10 + i*9}" y="12" width="5" height="6" /> <rect x="${10 + i*9}" y="22" width="5" height="6" /> <rect x="${10 + i*9}" y="32" width="5" height="6" />`).join('')}
    </g>
    <rect x="380" y="14" width="10" height="20" fill="#333" rx="2" />
  </svg>`,

  // FLOOR DEVICES
  'pc': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="16" y="8" width="32" height="48" fill="#1e293b" rx="2"/><rect x="24" y="16" width="16" height="4" fill="#0f172a"/><circle cx="32" cy="48" r="4" fill="#10b981"/></svg>`,
  'ap': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><circle cx="32" cy="32" r="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#e2e8f0"/><circle cx="32" cy="32" r="3" fill="#10b981"/></svg>`,
  'camera': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><circle cx="32" cy="32" r="20" fill="#f1f5f9"/><circle cx="32" cy="32" r="14" fill="#0f172a"/><circle cx="32" cy="32" r="6" fill="#334155"/><circle cx="35" cy="29" r="2" fill="#fff"/></svg>`,
  'printer': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="8" y="24" width="48" height="32" fill="#e2e8f0" rx="4"/><rect x="16" y="8" width="32" height="16" fill="#cbd5e1"/><rect x="24" y="40" width="16" height="24" fill="#fff" stroke="#cbd5e1"/><circle cx="48" cy="32" r="2" fill="#ef4444"/></svg>`,
  'phone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="12" y="12" width="40" height="40" fill="#334155" rx="4"/><rect x="20" y="20" width="24" height="12" fill="#94a3b8"/><rect x="20" y="36" width="24" height="12" fill="#1e293b" rx="2"/></svg>`,
  'door': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="transparent"/><rect x="16" y="8" width="32" height="56" fill="#d97706"/><rect x="20" y="12" width="10" height="24" fill="#fcd34d"/><rect x="34" y="12" width="10" height="24" fill="#fcd34d"/><circle cx="44" cy="40" r="2" fill="#000"/></svg>`,
  'san': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#ececec" />
    <rect x="16" y="10" width="16" height="12" rx="2" fill="#d4d4d4" />
    <g fill="#0ea5e9">
      ${Array.from({length: 30}).map((_, i) => `<rect x="${60 + i*10}" y="12" width="6" height="24" />`).join('')}
    </g>
  </svg>`,
  'nas': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 48">
    <rect width="400" height="48" fill="#ececec" />
    <rect x="16" y="10" width="16" height="12" rx="2" fill="#d4d4d4" />
    <g fill="#38bdf8">
      ${Array.from({length: 30}).map((_, i) => `<rect x="${60 + i*10}" y="12" width="6" height="24" />`).join('')}
    </g>
  </svg>`,
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
