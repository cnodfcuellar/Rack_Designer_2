# 🗄️ Gestión de Datos — RACK Designer 2

> Cómo el proyecto almacena, lee, modifica y exporta todos sus datos.

---

## 1. Estructura del Estado (El JSON que vive en memoria y localStorage)

Todo el proyecto gira en torno a **un único objeto JavaScript** (`store._raw`) que contiene 6 colecciones principales:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 520" width="860" height="520">
  <defs>
    <style>
      .pulse-border { animation: pulseBorder 2.5s infinite; }
      @keyframes pulseBorder { 0%,100%{stroke-opacity:1} 50%{stroke-opacity:0.3} }
      .flow-arrow { animation: flowAnim 1.8s infinite linear; stroke-dasharray: 8 4; }
      @keyframes flowAnim { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
    </style>
    <marker id="arr1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#38bdf8"/>
    </marker>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d17"/>
    </linearGradient>
  </defs>

  <rect width="860" height="520" fill="url(#bgGrad)" rx="18"/>
  <text x="430" y="34" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="monospace" font-weight="bold">
    store._raw — Estructura completa del estado JSON
  </text>

  <!-- ROOMS -->
  <rect x="20" y="60" width="180" height="140" rx="10" fill="#0c1929" stroke="#38bdf8" stroke-width="2" class="pulse-border"/>
  <text x="110" y="82" text-anchor="middle" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">🏢 rooms [ ]</text>
  <rect x="32" y="92" width="156" height="96" rx="6" fill="#0a1520"/>
  <text x="40" y="110" fill="#64748b" font-size="9" font-family="monospace">id: "a1b2c3"</text>
  <text x="40" y="124" fill="#64748b" font-size="9" font-family="monospace">name: "Sala A: CDP"</text>
  <line x1="32" y1="132" x2="188" y2="132" stroke="#1e293b" stroke-width="1"/>
  <text x="40" y="148" fill="#4a5a78" font-size="9" font-family="monospace">id: "d4e5f6"</text>
  <text x="40" y="162" fill="#4a5a78" font-size="9" font-family="monospace">name: "Sala B: Backup"</text>
  <text x="110" y="185" text-anchor="middle" fill="#1e4a7a" font-size="9" font-family="monospace">← sala activa: currentRoomId</text>

  <!-- RACKS -->
  <rect x="220" y="60" width="200" height="165" rx="10" fill="#0c1929" stroke="#10b981" stroke-width="2" class="pulse-border"/>
  <text x="320" y="82" text-anchor="middle" fill="#10b981" font-size="12" font-family="monospace" font-weight="bold">🗄️ racks [ ]</text>
  <rect x="232" y="92" width="176" height="121" rx="6" fill="#0a1520"/>
  <text x="240" y="110" fill="#64748b" font-size="9" font-family="monospace">id: "r001"</text>
  <text x="240" y="124" fill="#64748b" font-size="9" font-family="monospace">roomId: "a1b2c3"  ←FK</text>
  <text x="240" y="138" fill="#64748b" font-size="9" font-family="monospace">name: "Rack 1"</text>
  <text x="240" y="152" fill="#64748b" font-size="9" font-family="monospace">height: 24      (U)</text>
  <text x="240" y="166" fill="#64748b" font-size="9" font-family="monospace">color: "#0ea5e9"</text>
  <line x1="232" y1="174" x2="408" y2="174" stroke="#1e293b" stroke-width="1"/>
  <text x="240" y="188" fill="#4a5a78" font-size="9" font-family="monospace">id: "r002" | roomId | ...</text>

  <!-- DEVICES -->
  <rect x="440" y="60" width="210" height="230" rx="10" fill="#0c1929" stroke="#f59e0b" stroke-width="2" class="pulse-border"/>
  <text x="545" y="82" text-anchor="middle" fill="#f59e0b" font-size="12" font-family="monospace" font-weight="bold">📦 devices [ ]</text>
  <rect x="452" y="92" width="186" height="185" rx="6" fill="#0a1520"/>
  <text x="460" y="110" fill="#64748b" font-size="9" font-family="monospace">id: "dev001"</text>
  <text x="460" y="124" fill="#64748b" font-size="9" font-family="monospace">rackId: "r001"    ←FK</text>
  <text x="460" y="138" fill="#64748b" font-size="9" font-family="monospace">roomId: null</text>
  <text x="460" y="152" fill="#f59e0b" font-size="9" font-family="monospace">category: "rack"|"floor"</text>
  <text x="460" y="166" fill="#64748b" font-size="9" font-family="monospace">name: "Switch Cisco 48P"</text>
  <text x="460" y="180" fill="#64748b" font-size="9" font-family="monospace">type: "switch"</text>
  <text x="460" y="194" fill="#64748b" font-size="9" font-family="monospace">slotStart: 1  size: 1</text>
  <text x="460" y="208" fill="#64748b" font-size="9" font-family="monospace">mountSide: "front"|"rear"</text>
  <text x="460" y="222" fill="#64748b" font-size="9" font-family="monospace">ip / mac / serial</text>
  <text x="460" y="236" fill="#ef4444" font-size="9" font-family="monospace">user / pass  ← 🔴 exposición</text>
  <text x="460" y="250" fill="#64748b" font-size="9" font-family="monospace">power / plugs / plugsOut</text>
  <text x="460" y="264" fill="#64748b" font-size="9" font-family="monospace">brand / model / notes</text>

  <!-- CONNECTIONS -->
  <rect x="665" y="60" width="180" height="175" rx="10" fill="#0c1929" stroke="#8b5cf6" stroke-width="2" class="pulse-border"/>
  <text x="755" y="82" text-anchor="middle" fill="#8b5cf6" font-size="12" font-family="monospace" font-weight="bold">🔌 connections [ ]</text>
  <rect x="677" y="92" width="156" height="130" rx="6" fill="#0a1520"/>
  <text x="685" y="110" fill="#64748b" font-size="9" font-family="monospace">id: "conn01"</text>
  <text x="685" y="124" fill="#64748b" font-size="9" font-family="monospace">sourceDeviceId   ←FK</text>
  <text x="685" y="138" fill="#64748b" font-size="9" font-family="monospace">sourcePort: "Eth0/1"</text>
  <text x="685" y="152" fill="#64748b" font-size="9" font-family="monospace">targetDeviceId   ←FK</text>
  <text x="685" y="166" fill="#64748b" font-size="9" font-family="monospace">targetPort: "Port1"</text>
  <text x="685" y="180" fill="#64748b" font-size="9" font-family="monospace">cableType: "Fibra SM"</text>
  <text x="685" y="194" fill="#64748b" font-size="9" font-family="monospace">color: "#ef4444"</text>

  <!-- TOPOLOGY -->
  <rect x="20" y="320" width="200" height="140" rx="10" fill="#0c1929" stroke="#06b6d4" stroke-width="2" class="pulse-border"/>
  <text x="120" y="342" text-anchor="middle" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold">🗺️ topology { }</text>
  <rect x="32" y="352" width="176" height="96" rx="6" fill="#0a1520"/>
  <text x="40" y="370" fill="#64748b" font-size="9" font-family="monospace">nodePositions: {devId→{x,y}}</text>
  <text x="40" y="384" fill="#64748b" font-size="9" font-family="monospace">rackPositions: {rackId→{x,y}}</text>
  <text x="40" y="398" fill="#64748b" font-size="9" font-family="monospace">rackSizes:     {rackId→{w,h}}</text>
  <text x="40" y="412" fill="#64748b" font-size="9" font-family="monospace">roomPositions: {roomId→{x,y}}</text>
  <text x="40" y="426" fill="#64748b" font-size="9" font-family="monospace">roomSizes:     {roomId→{w,h}}</text>

  <!-- META -->
  <rect x="240" y="320" width="190" height="140" rx="10" fill="#0c1929" stroke="#f472b6" stroke-width="1.5"/>
  <text x="335" y="342" text-anchor="middle" fill="#f472b6" font-size="12" font-family="monospace" font-weight="bold">⚙️ meta / ui</text>
  <rect x="252" y="352" width="166" height="96" rx="6" fill="#0a1520"/>
  <text x="260" y="370" fill="#64748b" font-size="9" font-family="monospace">currentRoomId: "a1b2c3"</text>
  <text x="260" y="384" fill="#64748b" font-size="9" font-family="monospace">selectedDeviceId: null</text>
  <text x="260" y="398" fill="#64748b" font-size="9" font-family="monospace">topoZoom: 1.0</text>
  <text x="260" y="412" fill="#64748b" font-size="9" font-family="monospace">topoPanX: 0</text>
  <text x="260" y="426" fill="#64748b" font-size="9" font-family="monospace">topoPanY: 0</text>

  <!-- FK arrows -->
  <line x1="200" y1="130" x2="220" y2="130" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr1)" class="flow-arrow"/>
  <line x1="420" y1="130" x2="440" y2="130" stroke="#10b981" stroke-width="1.5" marker-end="url(#arr1)" class="flow-arrow"/>
  <line x1="650" y1="140" x2="665" y2="140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arr1)" class="flow-arrow"/>
  <text x="207" y="125" fill="#38bdf8" font-size="8" font-family="monospace">FK</text>
  <text x="427" y="125" fill="#10b981" font-size="8" font-family="monospace">FK</text>
  <text x="652" y="135" fill="#f59e0b" font-size="8" font-family="monospace">FK</text>

  <!-- Notes box -->
  <rect x="440" y="320" width="405" height="140" rx="10" fill="#0d0d1a" stroke="#1e293b" stroke-width="1"/>
  <text x="642" y="344" text-anchor="middle" fill="#475569" font-size="11" font-family="monospace" font-weight="bold">📌 Notas de diseño</text>
  <circle cx="458" cy="368" r="4" fill="#10b981"/>
  <text x="468" y="372" fill="#94a3b8" font-size="10" font-family="monospace">No hay base de datos. Todo vive en memoria RAM.</text>
  <circle cx="458" cy="390" r="4" fill="#38bdf8"/>
  <text x="468" y="394" fill="#94a3b8" font-size="10" font-family="monospace">Persistido en localStorage bajo la clave</text>
  <text x="468" y="408" fill="#38bdf8" font-size="10" font-family="monospace">  "RACK_DESIGNER_STATE"</text>
  <circle cx="458" cy="428" r="4" fill="#ef4444"/>
  <text x="468" y="432" fill="#94a3b8" font-size="10" font-family="monospace">user/pass se guardan sin cifrado (BUG-01/02).</text>
  <circle cx="458" cy="448" r="4" fill="#f59e0b"/>
  <text x="468" y="452" fill="#94a3b8" font-size="10" font-family="monospace">Todas las FK son strings de uid() base-36.</text>
</svg>
```

---

## 2. El Store — Ciclo de vida completo (Proxy ES6 + Undo/Redo + localStorage)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 560" width="860" height="560">
  <defs>
    <style>
      .flow2 { animation: flow2 2s infinite linear; stroke-dasharray: 10 5; }
      @keyframes flow2 { from{stroke-dashoffset:30} to{stroke-dashoffset:0} }
    </style>
    <marker id="a-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#38bdf8"/>
    </marker>
    <marker id="a-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#10b981"/>
    </marker>
    <marker id="a-purple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#8b5cf6"/>
    </marker>
    <marker id="a-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#ef4444"/>
    </marker>
    <marker id="a-amber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#f59e0b"/>
    </marker>
    <filter id="glow2">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="860" height="560" fill="#090d17" rx="18"/>
  <text x="430" y="30" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="monospace" font-weight="bold">
    Ciclo de Vida del Store — Desde una acción hasta el guardado
  </text>

  <!-- ACCION DEL USUARIO -->
  <rect x="20" y="55" width="150" height="66" rx="10" fill="#0f2a4a" stroke="#38bdf8" stroke-width="2" filter="url(#glow2)"/>
  <text x="95" y="78" text-anchor="middle" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">① USER</text>
  <text x="95" y="94" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="monospace">Arrastra equipo</text>
  <text x="95" y="108" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="monospace">Edita en modal</text>
  <line x1="170" y1="88" x2="220" y2="88" stroke="#38bdf8" stroke-width="2" marker-end="url(#a-blue)" class="flow2"/>

  <!-- snapshot() -->
  <rect x="220" y="55" width="160" height="66" rx="10" fill="#1e1040" stroke="#8b5cf6" stroke-width="2"/>
  <text x="300" y="76" text-anchor="middle" fill="#a78bfa" font-size="11" font-family="monospace" font-weight="bold">② snapshot()</text>
  <text x="300" y="92" text-anchor="middle" fill="#6d5ba8" font-size="9" font-family="monospace">deepClone(_raw)</text>
  <text x="300" y="106" text-anchor="middle" fill="#6d5ba8" font-size="9" font-family="monospace">→ undoStack.push()</text>
  <line x1="300" y1="121" x2="300" y2="170" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#a-purple)" stroke-dasharray="5,3"/>

  <!-- undoStack -->
  <rect x="220" y="170" width="160" height="96" rx="8" fill="#130d2e" stroke="#8b5cf6" stroke-width="1"/>
  <text x="300" y="190" text-anchor="middle" fill="#7c3aed" font-size="10" font-family="monospace" font-weight="bold">undoStack [ ]</text>
  <text x="300" y="208" text-anchor="middle" fill="#4c3f7a" font-size="9" font-family="monospace">max 30 snapshots</text>
  <rect x="232" y="214" width="32" height="12" rx="2" fill="#1e1040" stroke="#8b5cf6" stroke-width="0.5"/>
  <rect x="270" y="214" width="32" height="12" rx="2" fill="#1e1040" stroke="#8b5cf6" stroke-width="0.5"/>
  <rect x="308" y="214" width="32" height="12" rx="2" fill="#2a1a5a" stroke="#a78bfa" stroke-width="1"/>
  <text x="324" y="224" text-anchor="middle" fill="#a78bfa" font-size="8" font-family="monospace">NEW</text>
  <text x="300" y="250" text-anchor="middle" fill="#4c3f7a" font-size="9" font-family="monospace">← Ctrl+Z restaura desde aquí</text>
  <text x="300" y="262" text-anchor="middle" fill="#4c3f7a" font-size="9" font-family="monospace">   Ctrl+Y guarda en redoStack</text>
  <line x1="380" y1="88" x2="430" y2="88" stroke="#38bdf8" stroke-width="2" marker-end="url(#a-blue)" class="flow2"/>

  <!-- Mutación _raw -->
  <rect x="430" y="55" width="180" height="66" rx="10" fill="#0f2a1a" stroke="#10b981" stroke-width="2"/>
  <text x="520" y="76" text-anchor="middle" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">③ Mutación _raw</text>
  <text x="520" y="92" text-anchor="middle" fill="#6d9a82" font-size="9" font-family="monospace">dev.rackId = newRack</text>
  <text x="520" y="106" text-anchor="middle" fill="#6d9a82" font-size="9" font-family="monospace">_raw.devices.push(dev)</text>
  <line x1="520" y1="121" x2="520" y2="170" stroke="#10b981" stroke-width="1.5" marker-end="url(#a-green)" class="flow2"/>

  <!-- Proxy ES6 -->
  <rect x="430" y="170" width="180" height="96" rx="8" fill="#0a1f14" stroke="#10b981" stroke-width="1.5"/>
  <text x="520" y="190" text-anchor="middle" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">Proxy ES6</text>
  <text x="520" y="206" text-anchor="middle" fill="#3d7059" font-size="9" font-family="monospace">set(target, key, value) {</text>
  <text x="520" y="220" text-anchor="middle" fill="#3d7059" font-size="9" font-family="monospace">  target[key] = value;</text>
  <text x="520" y="234" text-anchor="middle" fill="#3d7059" font-size="9" font-family="monospace">  this._save();    ← auto</text>
  <text x="520" y="248" text-anchor="middle" fill="#3d7059" font-size="9" font-family="monospace">  this._emit('change');</text>
  <text x="520" y="262" text-anchor="middle" fill="#3d7059" font-size="9" font-family="monospace">}</text>
  <line x1="610" y1="218" x2="660" y2="218" stroke="#10b981" stroke-width="1.5" marker-end="url(#a-green)" class="flow2"/>

  <!-- _save() localStorage -->
  <rect x="660" y="170" width="185" height="96" rx="8" fill="#1a1200" stroke="#f59e0b" stroke-width="2"/>
  <text x="752" y="190" text-anchor="middle" fill="#f59e0b" font-size="11" font-family="monospace" font-weight="bold">④ _save()</text>
  <text x="752" y="206" text-anchor="middle" fill="#8a6a00" font-size="9" font-family="monospace">localStorage.setItem(</text>
  <text x="752" y="220" text-anchor="middle" fill="#f59e0b" font-size="9" font-family="monospace">  'RACK_DESIGNER_STATE',</text>
  <text x="752" y="234" text-anchor="middle" fill="#8a6a00" font-size="9" font-family="monospace">  JSON.stringify(_raw)</text>
  <text x="752" y="248" text-anchor="middle" fill="#8a6a00" font-size="9" font-family="monospace">)</text>
  <text x="752" y="262" text-anchor="middle" fill="#4a3800" font-size="9" font-family="monospace">← Ocurre en cada cambio</text>
  <line x1="520" y1="266" x2="520" y2="320" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a-blue)" class="flow2"/>

  <!-- _emit → renderAll() -->
  <rect x="340" y="320" width="360" height="70" rx="10" fill="#0f1d2e" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="520" y="344" text-anchor="middle" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">⑤ _emit('change') → renderAll()</text>
  <text x="520" y="362" text-anchor="middle" fill="#4a6a8a" font-size="9" font-family="monospace">Notifica a todos los listeners registrados en main.js</text>
  <text x="520" y="376" text-anchor="middle" fill="#4a6a8a" font-size="9" font-family="monospace">El orquestador decide qué re-renderizar según source</text>

  <!-- sub-renders -->
  <rect x="60" y="430" width="130" height="40" rx="6" fill="#0d1a2e" stroke="#6366f1" stroke-width="1"/>
  <text x="125" y="455" text-anchor="middle" fill="#818cf8" font-size="10" font-family="monospace">renderPhysical()</text>
  <rect x="210" y="430" width="130" height="40" rx="6" fill="#0d1a2e" stroke="#f59e0b" stroke-width="1"/>
  <text x="275" y="455" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="monospace">renderRoomTabs()</text>
  <rect x="360" y="430" width="130" height="40" rx="6" fill="#0d1a2e" stroke="#06b6d4" stroke-width="1"/>
  <text x="425" y="455" text-anchor="middle" fill="#22d3ee" font-size="10" font-family="monospace">renderStats()</text>
  <rect x="510" y="430" width="145" height="40" rx="6" fill="#0d1a2e" stroke="#ef4444" stroke-width="1"/>
  <text x="582" y="455" text-anchor="middle" fill="#f87171" font-size="10" font-family="monospace">renderBottomPanel()</text>
  <rect x="670" y="430" width="145" height="40" rx="6" fill="#0d1a2e" stroke="#10b981" stroke-width="1"/>
  <text x="742" y="455" text-anchor="middle" fill="#34d399" font-size="10" font-family="monospace">drawTopo() @60fps</text>

  <line x1="365" y1="390" x2="125" y2="430" stroke="#6366f1" stroke-width="1" marker-end="url(#a-purple)"/>
  <line x1="430" y1="390" x2="275" y2="430" stroke="#f59e0b" stroke-width="1" marker-end="url(#a-amber)"/>
  <line x1="520" y1="390" x2="425" y2="430" stroke="#06b6d4" stroke-width="1" marker-end="url(#a-blue)"/>
  <line x1="610" y1="390" x2="582" y2="430" stroke="#ef4444" stroke-width="1" marker-end="url(#a-red)"/>
  <line x1="675" y1="390" x2="742" y2="430" stroke="#10b981" stroke-width="1" marker-end="url(#a-green)"/>

  <!-- Carga inicial -->
  <rect x="20" y="170" width="160" height="96" rx="8" fill="#0d1520" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="100" y="192" text-anchor="middle" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold">Carga inicial</text>
  <text x="100" y="210" text-anchor="middle" fill="#3a5a7a" font-size="9" font-family="monospace">_load() {</text>
  <text x="100" y="224" text-anchor="middle" fill="#3a5a7a" font-size="9" font-family="monospace">  localStorage.getItem()</text>
  <text x="100" y="238" text-anchor="middle" fill="#3a5a7a" font-size="9" font-family="monospace">  JSON.parse(saved)</text>
  <text x="100" y="252" text-anchor="middle" fill="#3a5a7a" font-size="9" font-family="monospace">  || _defaultState()</text>
  <text x="100" y="266" text-anchor="middle" fill="#3a5a7a" font-size="9" font-family="monospace">}</text>
  <line x1="95" y1="121" x2="95" y2="170" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#a-blue)"/>

  <!-- Números etapa -->
  <text x="95" y="510" text-anchor="middle" fill="#38bdf8" font-size="30" font-family="monospace" font-weight="bold" opacity="0.15">①</text>
  <text x="300" y="510" text-anchor="middle" fill="#8b5cf6" font-size="30" font-family="monospace" font-weight="bold" opacity="0.15">②</text>
  <text x="520" y="510" text-anchor="middle" fill="#10b981" font-size="30" font-family="monospace" font-weight="bold" opacity="0.15">③④</text>
  <text x="750" y="510" text-anchor="middle" fill="#f59e0b" font-size="30" font-family="monospace" font-weight="bold" opacity="0.15">④</text>
</svg>
```

---

## 3. Las 3 Capas de Persistencia del Proyecto

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 420" width="860" height="420">
  <defs>
    <style>
      .layer-flow { animation: layerFlow 2.5s infinite linear; stroke-dasharray: 12 6; }
      @keyframes layerFlow { from{stroke-dashoffset:36} to{stroke-dashoffset:0} }
      .glow-icon { animation: glowIcon 3s infinite ease-in-out; }
      @keyframes glowIcon { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.6)} }
    </style>
    <marker id="la" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#94a3b8"/>
    </marker>
    <marker id="la2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#f59e0b"/>
    </marker>
    <marker id="la3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#10b981"/>
    </marker>
    <marker id="la3r" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <polygon points="8 0,0 3,8 6" fill="#10b981"/>
    </marker>
    <marker id="lar" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <polygon points="8 0,0 3,8 6" fill="#94a3b8"/>
    </marker>
  </defs>
  <rect width="860" height="420" fill="#090d17" rx="18"/>
  <text x="430" y="30" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="monospace" font-weight="bold">
    3 Capas de Persistencia de Datos
  </text>

  <!-- Capa 1: RAM -->
  <rect x="30" y="60" width="240" height="140" rx="12" fill="#0c1929" stroke="#38bdf8" stroke-width="2"/>
  <text x="35" y="55" fill="#38bdf8" font-size="11" font-family="monospace">CAPA 1 — VOLÁTIL</text>
  <text x="150" y="88" text-anchor="middle" font-size="28" class="glow-icon">🧠</text>
  <text x="150" y="112" text-anchor="middle" fill="#38bdf8" font-size="13" font-family="monospace" font-weight="bold">Memoria RAM</text>
  <text x="150" y="130" text-anchor="middle" fill="#3a5a7a" font-size="10" font-family="monospace">store._raw  (objeto JS vivo)</text>
  <text x="150" y="146" text-anchor="middle" fill="#3a5a7a" font-size="10" font-family="monospace">undoStack[] / redoStack[]</text>
  <text x="150" y="162" text-anchor="middle" fill="#3a5a7a" font-size="10" font-family="monospace">Listeners (callbacks UI)</text>
  <text x="150" y="184" text-anchor="middle" fill="#1e4a7a" font-size="9" font-family="monospace">⚡ Perdido al cerrar pestaña</text>

  <!-- Arrow RAM → localStorage (guardar) -->
  <line x1="270" y1="122" x2="320" y2="122" stroke="#94a3b8" stroke-width="2" class="layer-flow" marker-end="url(#la)"/>
  <text x="295" y="113" text-anchor="middle" fill="#475569" font-size="8" font-family="monospace">JSON.stringify</text>
  <text x="295" y="120" text-anchor="middle" fill="#475569" font-size="8" font-family="monospace">+ setItem()</text>

  <!-- Arrow localStorage → RAM (cargar) -->
  <line x1="320" y1="140" x2="270" y2="140" stroke="#475569" stroke-width="1" marker-end="url(#lar)" stroke-dasharray="4,3"/>
  <text x="295" y="158" text-anchor="middle" fill="#2a3a4a" font-size="8" font-family="monospace">JSON.parse</text>
  <text x="295" y="166" text-anchor="middle" fill="#2a3a4a" font-size="8" font-family="monospace">+ getItem()</text>

  <!-- Capa 2: localStorage -->
  <rect x="320" y="60" width="240" height="140" rx="12" fill="#1a1200" stroke="#f59e0b" stroke-width="2"/>
  <text x="325" y="55" fill="#f59e0b" font-size="11" font-family="monospace">CAPA 2 — SEMI-PERSISTENTE</text>
  <text x="440" y="88" text-anchor="middle" font-size="28" class="glow-icon">💾</text>
  <text x="440" y="112" text-anchor="middle" fill="#f59e0b" font-size="13" font-family="monospace" font-weight="bold">localStorage</text>
  <text x="440" y="130" text-anchor="middle" fill="#8a6a00" font-size="10" font-family="monospace">Clave: RACK_DESIGNER_STATE</text>
  <text x="440" y="146" text-anchor="middle" fill="#8a6a00" font-size="10" font-family="monospace">Valor: JSON completo de _raw</text>
  <text x="440" y="162" text-anchor="middle" fill="#8a6a00" font-size="10" font-family="monospace">Tamaño máx ~5 MB (límite browser)</text>
  <text x="440" y="184" text-anchor="middle" fill="#4a3800" font-size="9" font-family="monospace">🟡 Sobrevive al F5 / cierre pestaña</text>

  <!-- Arrow localStorage → .rack -->
  <line x1="560" y1="122" x2="610" y2="122" stroke="#10b981" stroke-width="2" class="layer-flow" marker-end="url(#la3)"/>
  <text x="585" y="113" text-anchor="middle" fill="#1a6a3a" font-size="8" font-family="monospace">exportJSON()</text>
  <text x="585" y="120" text-anchor="middle" fill="#1a6a3a" font-size="8" font-family="monospace">Blob download</text>

  <!-- Arrow .rack → localStorage (importar) -->
  <line x1="610" y1="140" x2="560" y2="140" stroke="#0a4a2a" stroke-width="1" marker-end="url(#la3r)" stroke-dasharray="4,3"/>
  <text x="585" y="158" text-anchor="middle" fill="#0a4a2a" font-size="8" font-family="monospace">importJSON()</text>
  <text x="585" y="166" text-anchor="middle" fill="#0a4a2a" font-size="8" font-family="monospace">FileReader+parse</text>

  <!-- Capa 3: Archivo .rack -->
  <rect x="610" y="60" width="230" height="140" rx="12" fill="#061a10" stroke="#10b981" stroke-width="2"/>
  <text x="615" y="55" fill="#10b981" font-size="11" font-family="monospace">CAPA 3 — PERMANENTE</text>
  <text x="725" y="88" text-anchor="middle" font-size="28" class="glow-icon">📁</text>
  <text x="725" y="112" text-anchor="middle" fill="#10b981" font-size="13" font-family="monospace" font-weight="bold">Archivo .rack</text>
  <text x="725" y="130" text-anchor="middle" fill="#3d7059" font-size="10" font-family="monospace">JSON puro (ext. renombrada)</text>
  <text x="725" y="146" text-anchor="middle" fill="#3d7059" font-size="10" font-family="monospace">Descarga del navegador</text>
  <text x="725" y="162" text-anchor="middle" fill="#3d7059" font-size="10" font-family="monospace">Contiene TODO el store._raw</text>
  <text x="725" y="184" text-anchor="middle" fill="#1a4a2a" font-size="9" font-family="monospace">✅ Permanente hasta borrar</text>

  <!-- Fila inferior: exportaciones extras -->
  <text x="430" y="232" text-anchor="middle" fill="#475569" font-size="12" font-family="monospace">— Exportaciones adicionales (solo lectura, no re-importables) —</text>

  <rect x="30" y="255" width="185" height="140" rx="10" fill="#0c1929" stroke="#06b6d4" stroke-width="1.5"/>
  <text x="122" y="275" text-anchor="middle" fill="#22d3ee" font-size="11" font-family="monospace" font-weight="bold">📊 CSV / Excel</text>
  <text x="122" y="293" text-anchor="middle" fill="#1a5a7a" font-size="9" font-family="monospace">modals.js → exportCSV()</text>
  <text x="122" y="310" text-anchor="middle" fill="#2a7a9a" font-size="9" font-family="monospace">Rack, U, Lado, Nombre</text>
  <text x="122" y="326" text-anchor="middle" fill="#2a7a9a" font-size="9" font-family="monospace">Marca, Modelo, Tipo</text>
  <text x="122" y="342" text-anchor="middle" fill="#2a7a9a" font-size="9" font-family="monospace">IP, MAC, Serie, User</text>
  <text x="122" y="358" text-anchor="middle" fill="#ef4444" font-size="9" font-family="monospace">⚠ sin pass, sin CSV-escape</text>
  <text x="122" y="378" text-anchor="middle" fill="#1a4a5a" font-size="8" font-family="monospace">❌ No re-importable</text>

  <rect x="240" y="255" width="185" height="140" rx="10" fill="#0c1929" stroke="#6366f1" stroke-width="1.5"/>
  <text x="332" y="275" text-anchor="middle" fill="#818cf8" font-size="11" font-family="monospace" font-weight="bold">🖼️ PNG Rack</text>
  <text x="332" y="293" text-anchor="middle" fill="#3a3a7a" font-size="9" font-family="monospace">modals.js → exportRackToPNG()</text>
  <text x="332" y="310" text-anchor="middle" fill="#4a4a9a" font-size="9" font-family="monospace">Canvas offscreen 2x resolución</text>
  <text x="332" y="326" text-anchor="middle" fill="#4a4a9a" font-size="9" font-family="monospace">Vista frontal + trasera</text>
  <text x="332" y="342" text-anchor="middle" fill="#4a4a9a" font-size="9" font-family="monospace">toDataURL('image/png')</text>
  <text x="332" y="378" text-anchor="middle" fill="#1a1a5a" font-size="8" font-family="monospace">❌ No re-importable</text>

  <rect x="450" y="255" width="185" height="140" rx="10" fill="#0c1929" stroke="#f472b6" stroke-width="1.5"/>
  <text x="542" y="275" text-anchor="middle" fill="#f472b6" font-size="11" font-family="monospace" font-weight="bold">🗺️ PNG Topología</text>
  <text x="542" y="293" text-anchor="middle" fill="#7a3a6a" font-size="9" font-family="monospace">topology.js → exportTopologyToPNG()</text>
  <text x="542" y="310" text-anchor="middle" fill="#9a4a8a" font-size="9" font-family="monospace">Canvas offscreen temporal</text>
  <text x="542" y="326" text-anchor="middle" fill="#9a4a8a" font-size="9" font-family="monospace">zoom=1, pan=0 para export</text>
  <text x="542" y="342" text-anchor="middle" fill="#ef4444" font-size="9" font-family="monospace">⚠ Sin try/finally (BUG-11)</text>
  <text x="542" y="378" text-anchor="middle" fill="#4a1a3a" font-size="8" font-family="monospace">❌ No re-importable</text>

  <rect x="660" y="255" width="170" height="140" rx="10" fill="#0c1929" stroke="#10b981" stroke-width="1.5"/>
  <text x="745" y="275" text-anchor="middle" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">📋 Tablas UI</text>
  <text x="745" y="293" text-anchor="middle" fill="#2a6a4a" font-size="9" font-family="monospace">tables.js</text>
  <text x="745" y="310" text-anchor="middle" fill="#2a6a4a" font-size="9" font-family="monospace">renderInventoryTable()</text>
  <text x="745" y="326" text-anchor="middle" fill="#2a6a4a" font-size="9" font-family="monospace">Solo visualización HTML</text>
  <text x="745" y="342" text-anchor="middle" fill="#2a6a4a" font-size="9" font-family="monospace">Edición inline → store</text>
  <text x="745" y="378" text-anchor="middle" fill="#1a4a2a" font-size="8" font-family="monospace">🔁 Reactivo al Store</text>
</svg>
```

---

## 4. Esquema ERD — Relaciones entre Entidades

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 400" width="860" height="400">
  <defs>
    <style>
      .erd-flow { animation: erdFlow 2s infinite linear; stroke-dasharray: 8 4; }
      @keyframes erdFlow { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
    </style>
    <marker id="erd-arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#475569"/>
    </marker>
    <marker id="erd-arr2" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#8b5cf6"/>
    </marker>
  </defs>
  <rect width="860" height="400" fill="#090d17" rx="18"/>
  <text x="430" y="30" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="monospace" font-weight="bold">
    ERD — Relaciones entre Entidades del Proyecto
  </text>

  <!-- ROOM -->
  <rect x="20" y="70" width="175" height="165" rx="10" fill="#0f1e30" stroke="#38bdf8" stroke-width="2"/>
  <rect x="20" y="70" width="175" height="30" rx="10" fill="#0a2a4a"/>
  <text x="107" y="91" text-anchor="middle" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">🏢 ROOM</text>
  <line x1="20" y1="100" x2="195" y2="100" stroke="#38bdf8" stroke-width="1"/>
  <text x="30" y="118" fill="#475569" font-size="9" font-family="monospace">🔑 id          string</text>
  <text x="30" y="134" fill="#475569" font-size="9" font-family="monospace">   name        string</text>
  <line x1="20" y1="142" x2="195" y2="142" stroke="#1e293b" stroke-width="0.5"/>
  <text x="30" y="158" fill="#1e4a7a" font-size="9" font-family="monospace">1 ──── N  RACK</text>
  <text x="30" y="174" fill="#1e4a7a" font-size="9" font-family="monospace">1 ──── N  DEVICE (floor)</text>
  <text x="30" y="190" fill="#1e4a7a" font-size="9" font-family="monospace">1 ──── 1  topology pos</text>
  <text x="107" y="225" text-anchor="middle" fill="#38bdf8" font-size="11" font-family="monospace">1</text>
  <line x1="195" y1="130" x2="305" y2="130" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#erd-arr)" class="erd-flow"/>
  <text x="298" y="118" fill="#38bdf8" font-size="11" font-family="monospace">N</text>

  <!-- RACK -->
  <rect x="305" y="70" width="185" height="200" rx="10" fill="#0f201a" stroke="#10b981" stroke-width="2"/>
  <rect x="305" y="70" width="185" height="30" rx="10" fill="#0a2a1a"/>
  <text x="397" y="91" text-anchor="middle" fill="#10b981" font-size="12" font-family="monospace" font-weight="bold">🗄️ RACK</text>
  <line x1="305" y1="100" x2="490" y2="100" stroke="#10b981" stroke-width="1"/>
  <text x="315" y="118" fill="#475569" font-size="9" font-family="monospace">🔑 id          string</text>
  <text x="315" y="134" fill="#475569" font-size="9" font-family="monospace">🔗 roomId      FK→ROOM</text>
  <text x="315" y="150" fill="#475569" font-size="9" font-family="monospace">   name        string</text>
  <text x="315" y="166" fill="#475569" font-size="9" font-family="monospace">   height      int (U)</text>
  <text x="315" y="182" fill="#475569" font-size="9" font-family="monospace">   color       #hex</text>
  <line x1="305" y1="190" x2="490" y2="190" stroke="#1e293b" stroke-width="0.5"/>
  <text x="315" y="206" fill="#1a4a3a" font-size="9" font-family="monospace">1 ──── N  DEVICE (rack)</text>
  <text x="315" y="222" fill="#1a4a3a" font-size="9" font-family="monospace">1 ──── 1  topology pos/size</text>
  <text x="315" y="238" fill="#1a4a3a" font-size="9" font-family="monospace">front|rear (col. independientes)</text>
  <text x="397" y="262" text-anchor="middle" fill="#10b981" font-size="11" font-family="monospace">1</text>
  <line x1="490" y1="130" x2="590" y2="130" stroke="#10b981" stroke-width="1.5" marker-end="url(#erd-arr)" class="erd-flow"/>
  <text x="583" y="118" fill="#10b981" font-size="11" font-family="monospace">N</text>

  <!-- DEVICE -->
  <rect x="590" y="50" width="200" height="300" rx="10" fill="#1a1300" stroke="#f59e0b" stroke-width="2"/>
  <rect x="590" y="50" width="200" height="30" rx="10" fill="#2a2000"/>
  <text x="690" y="71" text-anchor="middle" fill="#f59e0b" font-size="12" font-family="monospace" font-weight="bold">📦 DEVICE</text>
  <line x1="590" y1="80" x2="790" y2="80" stroke="#f59e0b" stroke-width="1"/>
  <text x="600" y="98" fill="#475569" font-size="9" font-family="monospace">🔑 id          string</text>
  <text x="600" y="114" fill="#475569" font-size="9" font-family="monospace">🔗 rackId      FK→RACK | null</text>
  <text x="600" y="130" fill="#475569" font-size="9" font-family="monospace">🔗 roomId      FK→ROOM | null</text>
  <text x="600" y="146" fill="#f59e0b" font-size="9" font-family="monospace">   category    "rack"|"floor"</text>
  <text x="600" y="162" fill="#475569" font-size="9" font-family="monospace">   name        string</text>
  <text x="600" y="178" fill="#475569" font-size="9" font-family="monospace">   type        switch|server|...</text>
  <text x="600" y="194" fill="#475569" font-size="9" font-family="monospace">   slotStart   int (U)</text>
  <text x="600" y="210" fill="#475569" font-size="9" font-family="monospace">   size        int (U)</text>
  <text x="600" y="226" fill="#475569" font-size="9" font-family="monospace">   mountSide   "front"|"rear"</text>
  <text x="600" y="242" fill="#475569" font-size="9" font-family="monospace">   ip / mac / serial</text>
  <text x="600" y="258" fill="#ef4444" font-size="9" font-family="monospace">   user / pass  🔴 plain text</text>
  <text x="600" y="274" fill="#475569" font-size="9" font-family="monospace">   power / plugs / plugsOut</text>
  <text x="600" y="290" fill="#475569" font-size="9" font-family="monospace">   brand / model / notes</text>
  <text x="600" y="306" fill="#475569" font-size="9" font-family="monospace">   floorX / floorY (floor)</text>
  <line x1="590" y1="316" x2="790" y2="316" stroke="#2a1a00" stroke-width="0.5"/>
  <text x="600" y="332" fill="#6a4a00" font-size="9" font-family="monospace">N ──── N  (via CONNECTIONS)</text>

  <!-- CONNECTIONS -->
  <rect x="590" y="368" width="200" height="22" rx="4" fill="#1a0d2e" stroke="#8b5cf6" stroke-width="1"/>
  <text x="690" y="383" text-anchor="middle" fill="#8b5cf6" font-size="10" font-family="monospace" font-weight="bold">🔌 CONNECTIONS (tabla unión)</text>
  <line x1="690" y1="350" x2="690" y2="368" stroke="#8b5cf6" stroke-width="1" marker-end="url(#erd-arr2)"/>

  <!-- Leyenda -->
  <rect x="20" y="285" width="260" height="100" rx="8" fill="#0d0d1a" stroke="#1e293b" stroke-width="1"/>
  <text x="150" y="305" text-anchor="middle" fill="#475569" font-size="11" font-family="monospace" font-weight="bold">Leyenda</text>
  <text x="30" y="323" fill="#94a3b8" font-size="10" font-family="monospace">🔑  Clave primaria (id único uid())</text>
  <text x="30" y="339" fill="#94a3b8" font-size="10" font-family="monospace">🔗  Clave foránea (FK string)</text>
  <text x="30" y="355" fill="#ef4444" font-size="10" font-family="monospace">🔴  Campo de riesgo de seguridad</text>
  <text x="30" y="371" fill="#94a3b8" font-size="10" font-family="monospace">N:M  vía tabla CONNECTIONS</text>
</svg>
```

---

## 5. Resumen del Ciclo Completo

| Evento | Función | Destino |
|--------|---------|---------|
| Usuario hace cambio | `store.snapshot()` → mutación `_raw` | RAM (undoStack + _raw) |
| Proxy intercepta `set` | `_save()` automático | `localStorage` |
| `_emit('change')` | `renderAll()` en main.js | DOM (UI re-render) |
| Exportar proyecto | `exportJSON()` → Blob | Archivo `.rack` en disco |
| Importar proyecto | `importJSON()` → `loadData()` | Sobreescribe `_raw` + localStorage |
| Ctrl+Z | `undo()` → `Object.assign(_raw, prev)` | RAM + localStorage |
| Abrir app (F5) | `_load()` → `localStorage.getItem()` | RAM (estado restaurado) |
