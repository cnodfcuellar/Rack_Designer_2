"""
Script para exportar todos los equipos de la vista física a archivos SVG con animaciones CSS internas.
Genera los archivos en 'default/' y en 'assets/svg/default/'.
"""

import os

def create_svgs():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [
        os.path.join(root_dir, 'default'),
        os.path.join(root_dir, 'assets', 'svg', 'default')
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

    svg_catalog = {}

    # 1. SERVIDOR 1U (con LEDs de pulso y diagnóstico)
    svg_catalog['server_1u.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="srvChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e2840"/>
      <stop offset="100%" stop-color="#141c2e"/>
    </linearGradient>
    <linearGradient id="srvEar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a2235"/>
      <stop offset="100%" stop-color="#222d45"/>
    </linearGradient>
    <pattern id="srvVents" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="1.5" fill="#0a0f1a"/>
      <rect y="1.5" width="3" height="1.5" fill="#141c2e"/>
    </pattern>
    <style>
      @keyframes srvPulsePwr { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }
      @keyframes srvPulseNet { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }
      .srv-pwr { animation: srvPulsePwr 2.5s infinite; }
      .srv-net { animation: srvPulseNet 1.1s infinite 0.2s; }
      .srv-diag { animation: srvPulsePwr 3.5s infinite 0.5s; }
    </style>
  </defs>
  <!-- Chasis principal -->
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#srvChassis)" stroke="#2a3652" stroke-width="1"/>
  <!-- Oreja izquierda con tornillo -->
  <rect x="0" y="0" width="12" height="24" fill="url(#srvEar)" stroke="#2a3652" stroke-width="0.8"/>
  <circle cx="6" cy="12" r="2.5" fill="#080c14" stroke="#475569" stroke-width="0.8"/>
  <!-- Rejilla de ventilación -->
  <rect x="12" y="1" width="28" height="22" fill="url(#srvVents)"/>
  <line x1="40" y1="1" x2="40" y2="23" stroke="#1a2236" stroke-width="1"/>
  <!-- Pantalla LCD de diagnóstico -->
  <rect x="46" y="4" width="144" height="16" rx="2" fill="#051209" stroke="#16381e" stroke-width="0.8"/>
  <text x="52" y="12" font-family="'Consolas', 'Courier New', monospace" font-size="6.5" font-weight="bold" fill="#22c55e">POWEREDGE R640</text>
  <text x="52" y="18" font-family="'Consolas', 'Courier New', monospace" font-size="5" fill="#15803d">IDRAC9: 192.168.1.100 │ ONLINE</text>
  <!-- LEDs de estado del sistema animados -->
  <circle class="srv-diag" cx="178" cy="9" r="1.5" fill="#22c55e"/>
  <circle class="srv-net" cx="184" cy="9" r="1.5" fill="#38bdf8"/>
  <!-- Botón Power con LED animado -->
  <rect x="198" y="4" width="28" height="16" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
  <circle cx="212" cy="12" r="4.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
  <circle class="srv-pwr" cx="212" cy="12" r="2" fill="#10b981"/>
  <!-- Oreja derecha con tornillo -->
  <rect x="228" y="0" width="12" height="24" fill="url(#srvEar)" stroke="#2a3652" stroke-width="0.8"/>
  <circle cx="234" cy="12" r="2.5" fill="#080c14" stroke="#475569" stroke-width="0.8"/>
</svg>"""

    # 2. SERVIDOR 2U (con discos hot-swap y LEDs animados)
    svg_catalog['server_2u.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="48" viewBox="0 0 240 48">
  <defs>
    <linearGradient id="srv2uGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <style>
      @keyframes dskBlink1 { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }
      @keyframes dskBlink2 { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }
      @keyframes dskBlink3 { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }
      .dsk-1 { animation: dskBlink1 0.9s infinite; }
      .dsk-2 { animation: dskBlink2 1.3s infinite 0.2s; }
      .dsk-3 { animation: dskBlink3 0.6s infinite 0.4s; }
      .dsk-4 { animation: dskBlink1 1.7s infinite 0.5s; }
      .dsk-5 { animation: dskBlink2 0.8s infinite 0.1s; }
      .dsk-6 { animation: dskBlink3 1.4s infinite 0.3s; }
      .pwr-led { animation: dskBlink1 2s infinite; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="48" rx="2" fill="url(#srv2uGrad)" stroke="#334155" stroke-width="1"/>
  <!-- Orejas 2U -->
  <rect x="0" y="0" width="12" height="48" fill="#1a2235" stroke="#2a3652"/>
  <circle cx="6" cy="12" r="2.5" fill="#080c14" stroke="#475569"/>
  <circle cx="6" cy="36" r="2.5" fill="#080c14" stroke="#475569"/>
  <rect x="228" y="0" width="12" height="48" fill="#1a2235" stroke="#2a3652"/>
  <circle cx="234" cy="12" r="2.5" fill="#080c14" stroke="#475569"/>
  <circle cx="234" cy="36" r="2.5" fill="#080c14" stroke="#475569"/>
  <!-- 6 Bahías Hot-Swap 2.5" -->
  <g fill="#0b0f19" stroke="#1e293b" stroke-width="0.8">
    <rect x="18" y="6" width="22" height="36" rx="1"/>
    <rect x="43" y="6" width="22" height="36" rx="1"/>
    <rect x="68" y="6" width="22" height="36" rx="1"/>
    <rect x="93" y="6" width="22" height="36" rx="1"/>
    <rect x="118" y="6" width="22" height="36" rx="1"/>
    <rect x="143" y="6" width="22" height="36" rx="1"/>
  </g>
  <!-- Tiradores y LEDs animados de discos -->
  <circle class="dsk-1" cx="24" cy="10" r="1.3" fill="#22c55e"/>
  <circle class="dsk-2" cx="49" cy="10" r="1.3" fill="#22c55e"/>
  <circle class="dsk-3" cx="74" cy="10" r="1.3" fill="#22c55e"/>
  <circle class="dsk-4" cx="99" cy="10" r="1.3" fill="#22c55e"/>
  <circle class="dsk-5" cx="124" cy="10" r="1.3" fill="#22c55e"/>
  <circle class="dsk-6" cx="149" cy="10" r="1.3" fill="#22c55e"/>
  <!-- Panel de control central -->
  <rect x="170" y="6" width="52" height="36" rx="2" fill="#070d17" stroke="#1e293b"/>
  <text x="174" y="16" font-family="'Consolas', monospace" font-size="6" font-weight="bold" fill="#38bdf8">HP PROLIANT</text>
  <text x="174" y="24" font-family="'Consolas', monospace" font-size="5" fill="#64748b">DL380 GEN10</text>
  <circle cx="212" cy="15" r="3" fill="#1e293b" stroke="#38bdf8" stroke-width="0.5"/>
  <circle class="pwr-led" cx="212" cy="15" r="1.3" fill="#22c55e"/>
</svg>"""

    # 3. SWITCH 24 PUERTOS + 2 SFP (con LEDs asíncronos parpadeando)
    svg_catalog['switch_24p.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="swChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0b0f19"/>
    </linearGradient>
    <style>
      @keyframes swActA { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }
      @keyframes swActB { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }
      @keyframes swActC { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }
      @keyframes sfpPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }
      .p-a { animation: swActA 0.8s infinite; }
      .p-b { animation: swActB 1.2s infinite 0.3s; }
      .p-c { animation: swActC 1.6s infinite 0.7s; }
      .p-d { animation: swActA 0.5s infinite 0.1s; }
      .p-e { animation: swActB 2.0s infinite 0.4s; }
      .sfp-l { animation: sfpPulse 1.1s infinite; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#swChassis)" stroke="#1e293b" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#1e293b"/><circle cx="5" cy="12" r="2" fill="#090d16"/>
  <rect x="230" y="0" width="10" height="24" fill="#1e293b"/><circle cx="235" cy="12" r="2" fill="#090d16"/>
  <!-- Logo / Marca -->
  <text x="14" y="15" font-family="sans-serif" font-size="7" font-weight="900" fill="#38bdf8">SW-24G</text>
  <!-- Matriz de 24 Puertos RJ45 (2 filas de 12) -->
  <g fill="#070a12" stroke="#334155" stroke-width="0.5">
"""
    # Clases de animación rotativas para simular tráfico de red independiente
    anim_classes = ['p-a', 'p-b', 'p-c', 'p-d', 'p-e']
    for col in range(12):
        x = 52 + col * 12
        cls_top = anim_classes[(col * 2) % len(anim_classes)]
        cls_bot = anim_classes[(col * 2 + 1) % len(anim_classes)]
        svg_catalog['switch_24p.svg'] += f"""    <rect x="{x}" y="4" width="9" height="7" rx="0.8"/>
    <circle class="{cls_top}" cx="{x+4.5}" cy="2.5" r="0.9" fill="#10b981" stroke="none"/>
    <rect x="{x}" y="13" width="9" height="7" rx="0.8"/>
    <circle class="{cls_bot}" cx="{x+4.5}" cy="21.5" r="0.9" fill="#10b981" stroke="none"/>
"""

    svg_catalog['switch_24p.svg'] += """  </g>
  <!-- 2 Jaulas SFP Fibra -->
  <g fill="#1e293b" stroke="#475569" stroke-width="0.8">
    <rect x="202" y="5" width="11" height="14" rx="1"/>
    <rect x="215" y="5" width="11" height="14" rx="1"/>
    <circle class="sfp-l" cx="207.5" cy="21" r="1.1" fill="#38bdf8" stroke="none"/>
    <circle class="sfp-l" cx="220.5" cy="21" r="1.1" fill="#38bdf8" stroke="none"/>
  </g>
</svg>"""

    # 4. ROUTER DE BORDE (con puertos ópticos animados)
    svg_catalog['router.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="rtrChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <style>
      @keyframes rtrOptA { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }
      @keyframes rtrOptB { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }
      .opt-1 { animation: rtrOptA 0.9s infinite; }
      .opt-2 { animation: rtrOptB 1.4s infinite 0.3s; }
      .opt-3 { animation: rtrOptA 0.6s infinite 0.1s; }
      .opt-4 { animation: rtrOptB 1.8s infinite 0.5s; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#rtrChassis)" stroke="#1e293b" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#1e293b"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#1e293b"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- Badge Router -->
  <rect x="14" y="5" width="24" height="14" rx="2" fill="#0284c7"/>
  <text x="26" y="15" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">RT</text>
  <!-- 8 Puertos Ópticos SFP+ -->
  <g fill="#111827" stroke="#38bdf8" stroke-width="0.6">
"""
    anim_opt = ['opt-1', 'opt-2', 'opt-3', 'opt-4']
    for i in range(8):
        x = 44 + i * 16
        cls_opt = anim_opt[i % len(anim_opt)]
        svg_catalog['router.svg'] += f"""    <rect x="{x}" y="5" width="12" height="14" rx="1"/>
    <circle class="{cls_opt}" cx="{x+6}" cy="21" r="1.1" fill="#10b981" stroke="none"/>
"""

    svg_catalog['router.svg'] += """  </g>
  <!-- Rejilla de ventilación derecha -->
  <g stroke="#334155" stroke-width="1">
    <line x1="180" y1="5" x2="180" y2="19"/>
    <line x1="184" y1="5" x2="184" y2="19"/>
    <line x1="188" y1="5" x2="188" y2="19"/>
    <line x1="192" y1="5" x2="192" y2="19"/>
    <line x1="196" y1="5" x2="196" y2="19"/>
    <line x1="200" y1="5" x2="200" y2="19"/>
  </g>
  <!-- Consola y Aux -->
  <rect x="208" y="7" width="16" height="10" rx="1" fill="#0369a1" stroke="#38bdf8" stroke-width="0.5"/>
  <text x="216" y="14" font-family="sans-serif" font-size="5" fill="#fff" text-anchor="middle">CON</text>
</svg>"""

    # 5. FIREWALL DE SEGURIDAD (con LEDs tri-color y escudo)
    svg_catalog['firewall.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="fwChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#201015"/>
      <stop offset="100%" stop-color="#11080b"/>
    </linearGradient>
    <style>
      @keyframes fwBlinkG { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #22c55e); } }
      @keyframes fwBlinkA { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; filter: drop-shadow(0 0 2px #eab308); } }
      .fw-g { animation: fwBlinkG 2s infinite; }
      .fw-a { animation: fwBlinkA 1.4s infinite 0.5s; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#fwChassis)" stroke="#451a24" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#2d121a"/><circle cx="5" cy="12" r="2" fill="#090305"/>
  <rect x="230" y="0" width="10" height="24" fill="#2d121a"/><circle cx="235" cy="12" r="2" fill="#090305"/>
  <!-- Icono Escudo Rojo -->
  <path d="M 18 6 L 26 6 L 29 11 C 29 16 22 20 22 20 C 22 20 15 16 15 11 Z" fill="#ef4444"/>
  <!-- Display de Estado -->
  <rect x="36" y="5" width="110" height="14" rx="2" fill="#080305" stroke="#ef4444" stroke-width="0.5"/>
  <text x="42" y="14" font-family="'Consolas', monospace" font-size="6.5" font-weight="bold" fill="#f87171">FORTIGATE-100F</text>
  <text x="100" y="14" font-family="'Consolas', monospace" font-size="5.5" fill="#22c55e">ACTIVE</text>
  <!-- Puertos WAN/LAN -->
  <g fill="#180c10" stroke="#f87171" stroke-width="0.5">
    <rect x="154" y="6" width="9" height="12" rx="0.5"/>
    <rect x="166" y="6" width="9" height="12" rx="0.5"/>
    <rect x="178" y="6" width="9" height="12" rx="0.5"/>
    <rect x="190" y="6" width="9" height="12" rx="0.5"/>
  </g>
  <!-- LEDs de Alerta Tri-color animados -->
  <circle class="fw-g" cx="210" cy="12" r="2" fill="#22c55e"/>
  <circle class="fw-a" cx="216" cy="12" r="2" fill="#eab308"/>
  <circle cx="222" cy="12" r="2" fill="#ef4444" opacity="0.3"/>
</svg>"""

    # 6. UPS (SISTEMA DE ENERGÍA con display dinámico)
    svg_catalog['ups.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="upsChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1b18"/>
      <stop offset="100%" stop-color="#0f0e0c"/>
    </linearGradient>
    <style>
      @keyframes upsPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }
      .ups-on { animation: upsPulse 2.8s infinite; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#upsChassis)" stroke="#443a2b" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#29231b"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#29231b"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- LEDs de estado -->
  <circle class="ups-on" cx="16" cy="7" r="1.6" fill="#10b981"/>
  <circle cx="16" cy="12" r="1.6" fill="#f59e0b" opacity="0.2"/>
  <circle cx="16" cy="17" r="1.6" fill="#ef4444" opacity="0.2"/>
  <!-- Display LCD Digital -->
  <rect x="26" y="4" width="140" height="16" rx="2" fill="#0c1726" stroke="#1d4ed8" stroke-width="0.8"/>
  <text x="32" y="11" font-family="'Consolas', monospace" font-size="6" font-weight="bold" fill="#38bdf8">SMART-UPS 3000VA</text>
  <text x="32" y="17" font-family="'Consolas', monospace" font-size="5" fill="#93c5fd">IN:230V │ BATT:100% │ LOAD:42%</text>
  <!-- Tomas de salida frontales / Jacks -->
  <g fill="#0a0f18" stroke="#64748b" stroke-width="0.8">
    <rect x="174" y="6" width="12" height="12" rx="2"/>
    <rect x="190" y="6" width="12" height="12" rx="2"/>
    <rect x="206" y="6" width="12" height="12" rx="2"/>
  </g>
</svg>"""

    # 7. PDU (DISTRIBUCIÓN DE ENERGÍA)
    svg_catalog['pdu.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <rect x="0" y="0" width="240" height="24" rx="2" fill="#0a0d14" stroke="#1e293b" stroke-width="1"/>
  <!-- Franja Amarilla con Rayo -->
  <rect x="0" y="0" width="24" height="24" rx="2" fill="#eab308"/>
  <text x="12" y="17" font-family="sans-serif" font-size="14" font-weight="bold" fill="#000" text-anchor="middle">⚡</text>
  <!-- Medidor LED de Voltaje -->
  <rect x="28" y="5" width="28" height="14" rx="1" fill="#180404" stroke="#7f1d1d"/>
  <text x="42" y="15" font-family="'Consolas', monospace" font-size="7.5" font-weight="bold" fill="#ef4444" text-anchor="middle">231V</text>
  <!-- 8 Tomas IEC C13 -->
  <g fill="#020408" stroke="#334155" stroke-width="0.8">
"""
    for i in range(8):
        x = 62 + i * 20
        svg_catalog['pdu.svg'] += f"""    <rect x="{x}" y="5" width="14" height="14" rx="2"/>
    <circle cx="{x+7}" cy="12" r="2" fill="#000" stroke="#64748b" stroke-width="0.5"/>
"""

    svg_catalog['pdu.svg'] += """  </g>
  <rect x="228" y="0" width="12" height="24" fill="#1e293b"/>
</svg>"""

    # 8. ALMACENAMIENTO (SAN / NAS con LEDs de disco activos)
    svg_catalog['storage.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e2430"/>
      <stop offset="100%" stop-color="#0e131b"/>
    </linearGradient>
    <style>
      @keyframes dskActG { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #10b981); } }
      @keyframes dskActB { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #38bdf8); } }
      .d-g1 { animation: dskActG 0.8s infinite; }
      .d-g2 { animation: dskActG 1.3s infinite 0.2s; }
      .d-b1 { animation: dskActB 0.6s infinite 0.1s; }
      .d-b2 { animation: dskActB 1.5s infinite 0.4s; }
      .san-p { animation: dskActG 2.0s infinite; }
    </style>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#stGrad)" stroke="#334155" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#1e293b"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#1e293b"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- 10 Bahías de Discos Hot-Swap -->
  <g fill="#080c14" stroke="#1e293b" stroke-width="0.6">
"""
    for i in range(10):
        x = 14 + i * 16
        cls_g = 'd-g1' if i % 2 == 0 else 'd-g2'
        cls_b = 'd-b1' if i % 2 == 0 else 'd-b2'
        svg_catalog['storage.svg'] += f"""    <rect x="{x}" y="4" width="13" height="16" rx="1"/>
    <circle class="{cls_g}" cx="{x+3}" cy="7" r="1.1" fill="#10b981" stroke="none"/>
    <circle class="{cls_b}" cx="{x+10}" cy="7" r="1.1" fill="#38bdf8" stroke="none"/>
    <line x1="{x+3}" y1="14" x2="{x+10}" y2="14" stroke="#475569" stroke-width="1"/>
"""

    svg_catalog['storage.svg'] += """  </g>
  <!-- Controladora SAS / Fibra -->
  <rect x="178" y="5" width="48" height="14" rx="2" fill="#090f1a" stroke="#8b5cf6" stroke-width="0.8"/>
  <text x="182" y="14" font-family="'Consolas', monospace" font-size="6" font-weight="bold" fill="#c084fc">SAN-10TB</text>
  <circle class="san-p" cx="220" cy="12" r="1.6" fill="#10b981"/>
</svg>"""

    # 9. PATCH PANEL 24 PUERTOS
    svg_catalog['patchpanel.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <rect x="0" y="0" width="240" height="24" rx="2" fill="#181e29" stroke="#334155" stroke-width="1"/>
  <!-- Orejas -->
  <rect x="0" y="0" width="10" height="24" fill="#273244"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#273244"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- Franja Blanca para Rotulación -->
  <rect x="14" y="3" width="212" height="4" rx="0.5" fill="#e2e8f0"/>
  <!-- 24 Keystones RJ45 agrupados de a 6 -->
  <g fill="#000000" stroke="#64748b" stroke-width="0.6">
"""
    for i in range(24):
        group_gap = (i // 6) * 6
        x = 15 + i * 8 + group_gap
        svg_catalog['patchpanel.svg'] += f"""    <rect x="{x}" y="9" width="6.5" height="11" rx="0.8"/>
"""

    svg_catalog['patchpanel.svg'] += """  </g>
</svg>"""

    # 10. ORGANIZADOR HORIZONTAL DE CABLES
    svg_catalog['organizer.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <linearGradient id="orgChassis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="url(#orgChassis)" stroke="#334155" stroke-width="1"/>
  <rect x="0" y="0" width="10" height="24" fill="#334155"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#334155"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- Ranuras / Dedos del organizador -->
  <g fill="#080c14" stroke="#475569" stroke-width="0.5">
"""
    for i in range(16):
        x = 16 + i * 13
        svg_catalog['organizer.svg'] += f"""    <rect x="{x}" y="4" width="8" height="16" rx="2"/>
    <line x1="{x+4}" y1="4" x2="{x+4}" y2="20" stroke="#1e293b" stroke-width="1"/>
"""

    svg_catalog['organizer.svg'] += """  </g>
</svg>"""

    # 11. CONSOLA KVM 1U
    svg_catalog['kvm.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <rect x="0" y="0" width="240" height="24" rx="2" fill="#171e2b" stroke="#334155" stroke-width="1"/>
  <rect x="0" y="0" width="10" height="24" fill="#243044"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#243044"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <!-- Tirador frontal -->
  <rect x="60" y="9" width="120" height="6" rx="2" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
  <circle cx="50" cy="12" r="2.5" fill="#0a0f18" stroke="#475569"/>
  <circle cx="190" cy="12" r="2.5" fill="#0a0f18" stroke="#475569"/>
  <!-- Pantalla estado -->
  <rect x="18" y="7" width="24" height="10" rx="1" fill="#040810" stroke="#0284c7" stroke-width="0.5"/>
  <text x="30" y="14" font-family="sans-serif" font-size="5" fill="#38bdf8" text-anchor="middle">KVM-17</text>
</svg>"""

    # 12. BANDEJA FIJA / TRAY
    svg_catalog['tray.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="24" viewBox="0 0 240 24">
  <defs>
    <pattern id="trayPerf" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.2" fill="#070a12"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="240" height="24" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <rect x="0" y="0" width="10" height="24" fill="#334155"/><circle cx="5" cy="12" r="2" fill="#000"/>
  <rect x="230" y="0" width="10" height="24" fill="#334155"/><circle cx="235" cy="12" r="2" fill="#000"/>
  <rect x="12" y="3" width="216" height="18" fill="url(#trayPerf)"/>
</svg>"""

    # 13. EQUIPOS DE PISO
    # PC
    svg_catalog['floor_pc.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">
  <rect x="0" y="0" width="120" height="60" rx="4" fill="#0c1420" stroke="#0ea5e9" stroke-width="1.5"/>
  <rect x="0" y="0" width="4" height="60" fill="#0ea5e9"/>
  <!-- Icono PC -->
  <rect x="12" y="14" width="24" height="18" rx="2" fill="none" stroke="#0ea5e9" stroke-width="1.8"/>
  <line x1="24" y1="32" x2="24" y2="38" stroke="#0ea5e9" stroke-width="1.8"/>
  <line x1="16" y1="38" x2="32" y2="38" stroke="#0ea5e9" stroke-width="1.8"/>
  <text x="44" y="26" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f8fafc">Workstation</text>
  <text x="44" y="38" font-family="'Consolas', monospace" font-size="8" fill="#94a3b8">PC-CL101</text>
</svg>"""

    # Cámara
    svg_catalog['floor_camera.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">
  <rect x="0" y="0" width="120" height="60" rx="4" fill="#0c1420" stroke="#8b5cf6" stroke-width="1.5"/>
  <rect x="0" y="0" width="4" height="60" fill="#8b5cf6"/>
  <!-- Icono Cámara -->
  <path d="M 12 24 L 26 24 L 32 18 L 32 36 L 26 30 L 12 30 Z" fill="none" stroke="#8b5cf6" stroke-width="1.8"/>
  <text x="44" y="26" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f8fafc">Cámara IP</text>
  <text x="44" y="38" font-family="'Consolas', monospace" font-size="8" fill="#94a3b8">CCTV-DC01</text>
</svg>"""

    # Access Point (AP)
    svg_catalog['floor_ap.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">
  <rect x="0" y="0" width="120" height="60" rx="4" fill="#0c1420" stroke="#10b981" stroke-width="1.5"/>
  <rect x="0" y="0" width="4" height="60" fill="#10b981"/>
  <!-- Icono Wi-Fi -->
  <circle cx="24" cy="34" r="2.5" fill="#10b981"/>
  <path d="M 18 28 A 8 8 0 0 1 30 28" fill="none" stroke="#10b981" stroke-width="1.8"/>
  <path d="M 14 22 A 14 14 0 0 1 34 22" fill="none" stroke="#10b981" stroke-width="1.8"/>
  <text x="44" y="26" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f8fafc">Wi-Fi AP</text>
  <text x="44" y="38" font-family="'Consolas', monospace" font-size="8" fill="#94a3b8">AP-WIFI-6</text>
</svg>"""

    # Impresora
    svg_catalog['floor_printer.svg'] = """<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">
  <rect x="0" y="0" width="120" height="60" rx="4" fill="#0c1420" stroke="#06b6d4" stroke-width="1.5"/>
  <rect x="0" y="0" width="4" height="60" fill="#06b6d4"/>
  <rect x="14" y="22" width="20" height="14" rx="1" fill="none" stroke="#06b6d4" stroke-width="1.8"/>
  <line x1="18" y1="18" x2="30" y2="18" stroke="#06b6d4" stroke-width="1.8"/>
  <line x1="18" y1="40" x2="30" y2="40" stroke="#06b6d4" stroke-width="1.8"/>
  <text x="44" y="26" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f8fafc">Impresora</text>
  <text x="44" y="38" font-family="'Consolas', monospace" font-size="8" fill="#94a3b8">PRINT-CORP</text>
</svg>"""

    # Guardar en todas las carpetas objetivo
    for filename, content in svg_catalog.items():
        for d in target_dirs:
            filepath = os.path.join(d, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Exportado: {filepath}")

    print(f"\n✅ Se han exportado exitosamente {len(svg_catalog)} equipos SVG animados en:")
    for d in target_dirs:
        print(f" - {d}")

if __name__ == '__main__':
    create_svgs()
