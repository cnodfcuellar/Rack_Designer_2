/**
 * faceplates.js — Motor de renderizado visual de equipos (SVG-First con Inline Injection)
 * Rack Designer Next
 * 
 * Cada equipo se visualiza a través de gráficos SVG vectoriales de alta fidelidad.
 * Se inyectan en el DOM como SVG inline para permitir que el botón global de animaciones
 * (status-dot / body.no-animations) pause y reanude los LEDs intermitentes y efectos en tiempo real.
 * Los assets por defecto se ubican exclusivamente en assets/svg/default/.
 * Se incluye normalización transparente para rutas heredadas (assets/default/ -> assets/svg/default/).
 */

/**
 * Normaliza cualquier ruta de activo para garantizar que use la ruta canónica assets/svg/default/
 * asegurando retrocompatibilidad total con referencias antiguas (ej. assets/default o default).
 * @param {string} url - Ruta del archivo
 * @returns {string} Ruta normalizada canónica
 */
function normalizeAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/^(\.\/)?(assets\/default\/|default\/)/, 'assets/svg/default/');
}

// Caché en memoria para almacenar el contenido de los SVGs y evitar peticiones de red repetidas
// Caché embebida de alta fidelidad 100% offline (sin fetch(), compatible con file://)
const EMBEDDED_SVG_CACHE = {
  "assets/svg/default/firewall.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"fwChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#201015\"/>\n      <stop offset=\"100%\" stop-color=\"#11080b\"/>\n    </linearGradient>\n    <style>\n      @keyframes fwBlinkG { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #22c55e); } }\n      @keyframes fwBlinkA { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; filter: drop-shadow(0 0 2px #eab308); } }\n      .fw-g { animation: fwBlinkG 2s infinite; }\n      .fw-a { animation: fwBlinkA 1.4s infinite 0.5s; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#fwChassis)\" stroke=\"#451a24\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#2d121a\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#090305\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#2d121a\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#090305\"/>\n  <!-- Icono Escudo Rojo -->\n  <path d=\"M 18 6 L 26 6 L 29 11 C 29 16 22 20 22 20 C 22 20 15 16 15 11 Z\" fill=\"#ef4444\"/>\n  <!-- Display de Estado -->\n  <rect x=\"36\" y=\"5\" width=\"110\" height=\"14\" rx=\"2\" fill=\"#080305\" stroke=\"#ef4444\" stroke-width=\"0.5\"/>\n  <text x=\"42\" y=\"14\" font-family=\"'Consolas', monospace\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#f87171\">FORTIGATE-100F</text>\n  <text x=\"100\" y=\"14\" font-family=\"'Consolas', monospace\" font-size=\"5.5\" fill=\"#22c55e\">ACTIVE</text>\n  <!-- Puertos WAN/LAN -->\n  <g fill=\"#180c10\" stroke=\"#f87171\" stroke-width=\"0.5\">\n    <rect x=\"154\" y=\"6\" width=\"9\" height=\"12\" rx=\"0.5\"/>\n    <rect x=\"166\" y=\"6\" width=\"9\" height=\"12\" rx=\"0.5\"/>\n    <rect x=\"178\" y=\"6\" width=\"9\" height=\"12\" rx=\"0.5\"/>\n    <rect x=\"190\" y=\"6\" width=\"9\" height=\"12\" rx=\"0.5\"/>\n  </g>\n  <!-- LEDs de Alerta Tri-color animados -->\n  <circle class=\"fw-g\" cx=\"210\" cy=\"12\" r=\"2\" fill=\"#22c55e\"/>\n  <circle class=\"fw-a\" cx=\"216\" cy=\"12\" r=\"2\" fill=\"#eab308\"/>\n  <circle cx=\"222\" cy=\"12\" r=\"2\" fill=\"#ef4444\" opacity=\"0.3\"/>\n</svg>",
  "assets/svg/default/floor_ap.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"60\" viewBox=\"0 0 120 60\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"60\" rx=\"4\" fill=\"#0c1420\" stroke=\"#10b981\" stroke-width=\"1.5\"/>\n  <rect x=\"0\" y=\"0\" width=\"4\" height=\"60\" fill=\"#10b981\"/>\n  <!-- Icono Wi-Fi -->\n  <circle cx=\"24\" cy=\"34\" r=\"2.5\" fill=\"#10b981\"/>\n  <path d=\"M 18 28 A 8 8 0 0 1 30 28\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"1.8\"/>\n  <path d=\"M 14 22 A 14 14 0 0 1 34 22\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"1.8\"/>\n  <text x=\"44\" y=\"26\" font-family=\"sans-serif\" font-size=\"10\" font-weight=\"bold\" fill=\"#f8fafc\">Wi-Fi AP</text>\n  <text x=\"44\" y=\"38\" font-family=\"'Consolas', monospace\" font-size=\"8\" fill=\"#94a3b8\">AP-WIFI-6</text>\n</svg>",
  "assets/svg/default/floor_camera.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"60\" viewBox=\"0 0 120 60\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"60\" rx=\"4\" fill=\"#0c1420\" stroke=\"#8b5cf6\" stroke-width=\"1.5\"/>\n  <rect x=\"0\" y=\"0\" width=\"4\" height=\"60\" fill=\"#8b5cf6\"/>\n  <!-- Icono Cámara -->\n  <path d=\"M 12 24 L 26 24 L 32 18 L 32 36 L 26 30 L 12 30 Z\" fill=\"none\" stroke=\"#8b5cf6\" stroke-width=\"1.8\"/>\n  <text x=\"44\" y=\"26\" font-family=\"sans-serif\" font-size=\"10\" font-weight=\"bold\" fill=\"#f8fafc\">Cámara IP</text>\n  <text x=\"44\" y=\"38\" font-family=\"'Consolas', monospace\" font-size=\"8\" fill=\"#94a3b8\">CCTV-DC01</text>\n</svg>",
  "assets/svg/default/floor_pc.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"60\" viewBox=\"0 0 120 60\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"60\" rx=\"4\" fill=\"#0c1420\" stroke=\"#0ea5e9\" stroke-width=\"1.5\"/>\n  <rect x=\"0\" y=\"0\" width=\"4\" height=\"60\" fill=\"#0ea5e9\"/>\n  <!-- Icono PC -->\n  <rect x=\"12\" y=\"14\" width=\"24\" height=\"18\" rx=\"2\" fill=\"none\" stroke=\"#0ea5e9\" stroke-width=\"1.8\"/>\n  <line x1=\"24\" y1=\"32\" x2=\"24\" y2=\"38\" stroke=\"#0ea5e9\" stroke-width=\"1.8\"/>\n  <line x1=\"16\" y1=\"38\" x2=\"32\" y2=\"38\" stroke=\"#0ea5e9\" stroke-width=\"1.8\"/>\n  <text x=\"44\" y=\"26\" font-family=\"sans-serif\" font-size=\"10\" font-weight=\"bold\" fill=\"#f8fafc\">Workstation</text>\n  <text x=\"44\" y=\"38\" font-family=\"'Consolas', monospace\" font-size=\"8\" fill=\"#94a3b8\">PC-CL101</text>\n</svg>",
  "assets/svg/default/floor_printer.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"60\" viewBox=\"0 0 120 60\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"60\" rx=\"4\" fill=\"#0c1420\" stroke=\"#06b6d4\" stroke-width=\"1.5\"/>\n  <rect x=\"0\" y=\"0\" width=\"4\" height=\"60\" fill=\"#06b6d4\"/>\n  <rect x=\"14\" y=\"22\" width=\"20\" height=\"14\" rx=\"1\" fill=\"none\" stroke=\"#06b6d4\" stroke-width=\"1.8\"/>\n  <line x1=\"18\" y1=\"18\" x2=\"30\" y2=\"18\" stroke=\"#06b6d4\" stroke-width=\"1.8\"/>\n  <line x1=\"18\" y1=\"40\" x2=\"30\" y2=\"40\" stroke=\"#06b6d4\" stroke-width=\"1.8\"/>\n  <text x=\"44\" y=\"26\" font-family=\"sans-serif\" font-size=\"10\" font-weight=\"bold\" fill=\"#f8fafc\">Impresora</text>\n  <text x=\"44\" y=\"38\" font-family=\"'Consolas', monospace\" font-size=\"8\" fill=\"#94a3b8\">PRINT-CORP</text>\n</svg>",
  "assets/svg/default/kvm.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"#171e2b\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#243044\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#243044\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- Tirador frontal -->\n  <rect x=\"60\" y=\"9\" width=\"120\" height=\"6\" rx=\"2\" fill=\"#334155\" stroke=\"#64748b\" stroke-width=\"0.8\"/>\n  <circle cx=\"50\" cy=\"12\" r=\"2.5\" fill=\"#0a0f18\" stroke=\"#475569\"/>\n  <circle cx=\"190\" cy=\"12\" r=\"2.5\" fill=\"#0a0f18\" stroke=\"#475569\"/>\n  <!-- Pantalla estado -->\n  <rect x=\"18\" y=\"7\" width=\"24\" height=\"10\" rx=\"1\" fill=\"#040810\" stroke=\"#0284c7\" stroke-width=\"0.5\"/>\n  <text x=\"30\" y=\"14\" font-family=\"sans-serif\" font-size=\"5\" fill=\"#38bdf8\" text-anchor=\"middle\">KVM-17</text>\n</svg>",
  "assets/svg/default/organizer.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"orgChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1e293b\"/>\n      <stop offset=\"100%\" stop-color=\"#0f172a\"/>\n    </linearGradient>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#orgChassis)\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#334155\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#334155\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- Ranuras / Dedos del organizador -->\n  <g fill=\"#080c14\" stroke=\"#475569\" stroke-width=\"0.5\">\n    <rect x=\"16\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"20\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"29\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"33\" y1=\"4\" x2=\"33\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"42\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"46\" y1=\"4\" x2=\"46\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"55\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"59\" y1=\"4\" x2=\"59\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"68\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"72\" y1=\"4\" x2=\"72\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"81\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"85\" y1=\"4\" x2=\"85\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"94\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"98\" y1=\"4\" x2=\"98\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"107\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"111\" y1=\"4\" x2=\"111\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"120\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"124\" y1=\"4\" x2=\"124\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"133\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"137\" y1=\"4\" x2=\"137\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"146\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"150\" y1=\"4\" x2=\"150\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"159\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"163\" y1=\"4\" x2=\"163\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"172\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"176\" y1=\"4\" x2=\"176\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"185\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"189\" y1=\"4\" x2=\"189\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"198\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"202\" y1=\"4\" x2=\"202\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n    <rect x=\"211\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"/>\n    <line x1=\"215\" y1=\"4\" x2=\"215\" y2=\"20\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n  </g>\n</svg>",
  "assets/svg/default/patchpanel.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"#181e29\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#273244\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#273244\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- Franja Blanca para Rotulación -->\n  <rect x=\"14\" y=\"3\" width=\"212\" height=\"4\" rx=\"0.5\" fill=\"#e2e8f0\"/>\n  <!-- 24 Keystones RJ45 agrupados de a 6 -->\n  <g fill=\"#000000\" stroke=\"#64748b\" stroke-width=\"0.6\">\n    <rect x=\"15\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"23\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"31\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"39\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"47\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"55\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"69\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"77\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"85\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"93\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"101\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"109\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"123\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"131\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"139\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"147\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"155\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"163\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"177\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"185\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"193\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"201\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"209\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n    <rect x=\"217\" y=\"9\" width=\"6.5\" height=\"11\" rx=\"0.8\"/>\n  </g>\n</svg>",
  "assets/svg/default/pdu.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"#0a0d14\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n  <!-- Franja Amarilla con Rayo -->\n  <rect x=\"0\" y=\"0\" width=\"24\" height=\"24\" rx=\"2\" fill=\"#eab308\"/>\n  <text x=\"12\" y=\"17\" font-family=\"sans-serif\" font-size=\"14\" font-weight=\"bold\" fill=\"#000\" text-anchor=\"middle\">⚡</text>\n  <!-- Medidor LED de Voltaje -->\n  <rect x=\"28\" y=\"5\" width=\"28\" height=\"14\" rx=\"1\" fill=\"#180404\" stroke=\"#7f1d1d\"/>\n  <text x=\"42\" y=\"15\" font-family=\"'Consolas', monospace\" font-size=\"7.5\" font-weight=\"bold\" fill=\"#ef4444\" text-anchor=\"middle\">231V</text>\n  <!-- 8 Tomas IEC C13 -->\n  <g fill=\"#020408\" stroke=\"#334155\" stroke-width=\"0.8\">\n    <rect x=\"62\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"69\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"82\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"89\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"102\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"109\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"122\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"129\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"142\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"149\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"162\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"169\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"182\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"189\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n    <rect x=\"202\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <circle cx=\"209\" cy=\"12\" r=\"2\" fill=\"#000\" stroke=\"#64748b\" stroke-width=\"0.5\"/>\n  </g>\n  <rect x=\"228\" y=\"0\" width=\"12\" height=\"24\" fill=\"#1e293b\"/>\n</svg>",
  "assets/svg/default/router.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"rtrChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#0f172a\"/>\n      <stop offset=\"100%\" stop-color=\"#020617\"/>\n    </linearGradient>\n    <style>\n      @keyframes rtrOptA { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }\n      @keyframes rtrOptB { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }\n      .opt-1 { animation: rtrOptA 0.9s infinite; }\n      .opt-2 { animation: rtrOptB 1.4s infinite 0.3s; }\n      .opt-3 { animation: rtrOptA 0.6s infinite 0.1s; }\n      .opt-4 { animation: rtrOptB 1.8s infinite 0.5s; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#rtrChassis)\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- Badge Router -->\n  <rect x=\"14\" y=\"5\" width=\"24\" height=\"14\" rx=\"2\" fill=\"#0284c7\"/>\n  <text x=\"26\" y=\"15\" font-family=\"sans-serif\" font-size=\"8\" font-weight=\"bold\" fill=\"#ffffff\" text-anchor=\"middle\">RT</text>\n  <!-- 8 Puertos Ópticos SFP+ -->\n  <g fill=\"#111827\" stroke=\"#38bdf8\" stroke-width=\"0.6\">\n    <rect x=\"44\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-1\" cx=\"50\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"60\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-2\" cx=\"66\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"76\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-3\" cx=\"82\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"92\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-4\" cx=\"98\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"108\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-1\" cx=\"114\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"124\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-2\" cx=\"130\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"140\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-3\" cx=\"146\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"156\" y=\"5\" width=\"12\" height=\"14\" rx=\"1\"/>\n    <circle class=\"opt-4\" cx=\"162\" cy=\"21\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n  </g>\n  <!-- Rejilla de ventilación derecha -->\n  <g stroke=\"#334155\" stroke-width=\"1\">\n    <line x1=\"180\" y1=\"5\" x2=\"180\" y2=\"19\"/>\n    <line x1=\"184\" y1=\"5\" x2=\"184\" y2=\"19\"/>\n    <line x1=\"188\" y1=\"5\" x2=\"188\" y2=\"19\"/>\n    <line x1=\"192\" y1=\"5\" x2=\"192\" y2=\"19\"/>\n    <line x1=\"196\" y1=\"5\" x2=\"196\" y2=\"19\"/>\n    <line x1=\"200\" y1=\"5\" x2=\"200\" y2=\"19\"/>\n  </g>\n  <!-- Consola y Aux -->\n  <rect x=\"208\" y=\"7\" width=\"16\" height=\"10\" rx=\"1\" fill=\"#0369a1\" stroke=\"#38bdf8\" stroke-width=\"0.5\"/>\n  <text x=\"216\" y=\"14\" font-family=\"sans-serif\" font-size=\"5\" fill=\"#fff\" text-anchor=\"middle\">CON</text>\n</svg>",
  "assets/svg/default/server_1u.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"srvChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1e2840\"/>\n      <stop offset=\"100%\" stop-color=\"#141c2e\"/>\n    </linearGradient>\n    <linearGradient id=\"srvEar\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0%\" stop-color=\"#1a2235\"/>\n      <stop offset=\"100%\" stop-color=\"#222d45\"/>\n    </linearGradient>\n    <pattern id=\"srvVents\" width=\"3\" height=\"3\" patternUnits=\"userSpaceOnUse\">\n      <rect width=\"3\" height=\"1.5\" fill=\"#0a0f1a\"/>\n      <rect y=\"1.5\" width=\"3\" height=\"1.5\" fill=\"#141c2e\"/>\n    </pattern>\n    <style>\n      @keyframes srvPulsePwr { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }\n      @keyframes srvPulseNet { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }\n      .srv-pwr { animation: srvPulsePwr 2.5s infinite; }\n      .srv-net { animation: srvPulseNet 1.1s infinite 0.2s; }\n      .srv-diag { animation: srvPulsePwr 3.5s infinite 0.5s; }\n    </style>\n  </defs>\n  <!-- Chasis principal -->\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#srvChassis)\" stroke=\"#2a3652\" stroke-width=\"1\"/>\n  <!-- Oreja izquierda con tornillo -->\n  <rect x=\"0\" y=\"0\" width=\"12\" height=\"24\" fill=\"url(#srvEar)\" stroke=\"#2a3652\" stroke-width=\"0.8\"/>\n  <circle cx=\"6\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n  <!-- Rejilla de ventilación -->\n  <rect x=\"12\" y=\"1\" width=\"28\" height=\"22\" fill=\"url(#srvVents)\"/>\n  <line x1=\"40\" y1=\"1\" x2=\"40\" y2=\"23\" stroke=\"#1a2236\" stroke-width=\"1\"/>\n  <!-- Pantalla LCD de diagnóstico -->\n  <rect x=\"46\" y=\"4\" width=\"144\" height=\"16\" rx=\"2\" fill=\"#051209\" stroke=\"#16381e\" stroke-width=\"0.8\"/>\n  <text x=\"52\" y=\"12\" font-family=\"'Consolas', 'Courier New', monospace\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#22c55e\">POWEREDGE R640</text>\n  <text x=\"52\" y=\"18\" font-family=\"'Consolas', 'Courier New', monospace\" font-size=\"5\" fill=\"#15803d\">IDRAC9: 192.168.1.100 │ ONLINE</text>\n  <!-- LEDs de estado del sistema animados -->\n  <circle class=\"srv-diag\" cx=\"178\" cy=\"9\" r=\"1.5\" fill=\"#22c55e\"/>\n  <circle class=\"srv-net\" cx=\"184\" cy=\"9\" r=\"1.5\" fill=\"#38bdf8\"/>\n  <!-- Botón Power con LED animado -->\n  <rect x=\"198\" y=\"4\" width=\"28\" height=\"16\" rx=\"2\" fill=\"#0f172a\" stroke=\"#334155\" stroke-width=\"0.8\"/>\n  <circle cx=\"212\" cy=\"12\" r=\"4.5\" fill=\"#1e293b\" stroke=\"#64748b\" stroke-width=\"0.8\"/>\n  <circle class=\"srv-pwr\" cx=\"212\" cy=\"12\" r=\"2\" fill=\"#10b981\"/>\n  <!-- Oreja derecha con tornillo -->\n  <rect x=\"228\" y=\"0\" width=\"12\" height=\"24\" fill=\"url(#srvEar)\" stroke=\"#2a3652\" stroke-width=\"0.8\"/>\n  <circle cx=\"234\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n</svg>",
  "assets/svg/default/server_2u.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"48\" viewBox=\"0 0 240 48\">\n  <defs>\n    <linearGradient id=\"srv2uGrad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1e293b\"/>\n      <stop offset=\"100%\" stop-color=\"#0f172a\"/>\n    </linearGradient>\n    <style>\n      @keyframes dskBlink1 { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }\n      @keyframes dskBlink2 { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }\n      @keyframes dskBlink3 { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }\n      .dsk-1 { animation: dskBlink1 0.9s infinite; }\n      .dsk-2 { animation: dskBlink2 1.3s infinite 0.2s; }\n      .dsk-3 { animation: dskBlink3 0.6s infinite 0.4s; }\n      .dsk-4 { animation: dskBlink1 1.7s infinite 0.5s; }\n      .dsk-5 { animation: dskBlink2 0.8s infinite 0.1s; }\n      .dsk-6 { animation: dskBlink3 1.4s infinite 0.3s; }\n      .pwr-led { animation: dskBlink1 2s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"48\" rx=\"2\" fill=\"url(#srv2uGrad)\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <!-- Orejas 2U -->\n  <rect x=\"0\" y=\"0\" width=\"12\" height=\"48\" fill=\"#1a2235\" stroke=\"#2a3652\"/>\n  <circle cx=\"6\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"6\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <rect x=\"228\" y=\"0\" width=\"12\" height=\"48\" fill=\"#1a2235\" stroke=\"#2a3652\"/>\n  <circle cx=\"234\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"234\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <!-- 6 Bahías Hot-Swap 2.5\" -->\n  <g fill=\"#0b0f19\" stroke=\"#1e293b\" stroke-width=\"0.8\">\n    <rect x=\"18\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n    <rect x=\"43\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n    <rect x=\"68\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n    <rect x=\"93\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n    <rect x=\"118\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n    <rect x=\"143\" y=\"6\" width=\"22\" height=\"36\" rx=\"1\"/>\n  </g>\n  <!-- Tiradores y LEDs animados de discos -->\n  <circle class=\"dsk-1\" cx=\"24\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <circle class=\"dsk-2\" cx=\"49\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <circle class=\"dsk-3\" cx=\"74\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <circle class=\"dsk-4\" cx=\"99\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <circle class=\"dsk-5\" cx=\"124\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <circle class=\"dsk-6\" cx=\"149\" cy=\"10\" r=\"1.3\" fill=\"#22c55e\"/>\n  <!-- Panel de control central -->\n  <rect x=\"170\" y=\"6\" width=\"52\" height=\"36\" rx=\"2\" fill=\"#070d17\" stroke=\"#1e293b\"/>\n  <text x=\"174\" y=\"16\" font-family=\"'Consolas', monospace\" font-size=\"6\" font-weight=\"bold\" fill=\"#38bdf8\">HP PROLIANT</text>\n  <text x=\"174\" y=\"24\" font-family=\"'Consolas', monospace\" font-size=\"5\" fill=\"#64748b\">DL380 GEN10</text>\n  <circle cx=\"212\" cy=\"15\" r=\"3\" fill=\"#1e293b\" stroke=\"#38bdf8\" stroke-width=\"0.5\"/>\n  <circle class=\"pwr-led\" cx=\"212\" cy=\"15\" r=\"1.3\" fill=\"#22c55e\"/>\n</svg>",
  "assets/svg/default/server_4u.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"96\" viewBox=\"0 0 240 96\">\n  <defs>\n    <linearGradient id=\"srv4uGrad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#182030\"/>\n      <stop offset=\"100%\" stop-color=\"#0b0f19\"/>\n    </linearGradient>\n    <style>\n      @keyframes bldBlink1 { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #22c55e); } }\n      @keyframes bldBlink2 { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #38bdf8); } }\n      .bld-led1 { animation: bldBlink1 1.2s infinite; }\n      .bld-led2 { animation: bldBlink2 0.9s infinite 0.3s; }\n      .chassis-pwr { animation: bldBlink1 2.2s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"96\" rx=\"2\" fill=\"url(#srv4uGrad)\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <!-- Orejas 4U -->\n  <rect x=\"0\" y=\"0\" width=\"12\" height=\"96\" fill=\"#141b29\" stroke=\"#253248\"/>\n  <circle cx=\"6\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"6\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"6\" cy=\"60\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"6\" cy=\"84\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <rect x=\"228\" y=\"0\" width=\"12\" height=\"96\" fill=\"#141b29\" stroke=\"#253248\"/>\n  <circle cx=\"234\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"234\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"234\" cy=\"60\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <circle cx=\"234\" cy=\"84\" r=\"2.5\" fill=\"#080c14\" stroke=\"#475569\"/>\n  <!-- 8 Bahías Blade Modulares Verticales (Frente 4U) -->\n  <g fill=\"#0c111a\" stroke=\"#1e293b\" stroke-width=\"0.8\">\n    <rect x=\"18\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"43\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"68\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"93\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"118\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"143\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"168\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n    <rect x=\"193\" y=\"6\" width=\"22\" height=\"60\" rx=\"1.5\"/>\n  </g>\n  <!-- Tiradores y LEDs de cada módulo Blade -->\n  <g>\n    <circle class=\"bld-led1\" cx=\"24\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"24\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"49\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"49\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"74\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"74\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"99\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"99\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"124\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"124\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"149\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"149\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"174\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"174\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n    <circle class=\"bld-led1\" cx=\"199\" cy=\"12\" r=\"1.3\" fill=\"#22c55e\"/>\n    <circle class=\"bld-led2\" cx=\"199\" cy=\"17\" r=\"1.1\" fill=\"#38bdf8\"/>\n  </g>\n  <!-- Rejillas de ventilación por módulo blade -->\n  <g stroke=\"#1a2333\" stroke-width=\"0.6\">\n    <line x1=\"22\" y1=\"26\" x2=\"36\" y2=\"26\"/><line x1=\"22\" y1=\"30\" x2=\"36\" y2=\"30\"/><line x1=\"22\" y1=\"34\" x2=\"36\" y2=\"34\"/><line x1=\"22\" y1=\"38\" x2=\"36\" y2=\"38\"/>\n    <line x1=\"47\" y1=\"26\" x2=\"61\" y2=\"26\"/><line x1=\"47\" y1=\"30\" x2=\"61\" y2=\"30\"/><line x1=\"47\" y1=\"34\" x2=\"61\" y2=\"34\"/><line x1=\"47\" y1=\"38\" x2=\"61\" y2=\"38\"/>\n    <line x1=\"72\" y1=\"26\" x2=\"86\" y2=\"26\"/><line x1=\"72\" y1=\"30\" x2=\"86\" y2=\"30\"/><line x1=\"72\" y1=\"34\" x2=\"86\" y2=\"34\"/><line x1=\"72\" y1=\"38\" x2=\"86\" y2=\"38\"/>\n    <line x1=\"97\" y1=\"26\" x2=\"111\" y2=\"26\"/><line x1=\"97\" y1=\"30\" x2=\"111\" y2=\"30\"/><line x1=\"97\" y1=\"34\" x2=\"111\" y2=\"34\"/><line x1=\"97\" y1=\"38\" x2=\"111\" y2=\"38\"/>\n    <line x1=\"122\" y1=\"26\" x2=\"136\" y2=\"26\"/><line x1=\"122\" y1=\"30\" x2=\"136\" y2=\"30\"/><line x1=\"122\" y1=\"34\" x2=\"136\" y2=\"34\"/><line x1=\"122\" y1=\"38\" x2=\"136\" y2=\"38\"/>\n    <line x1=\"147\" y1=\"26\" x2=\"161\" y2=\"26\"/><line x1=\"147\" y1=\"30\" x2=\"161\" y2=\"30\"/><line x1=\"147\" y1=\"34\" x2=\"161\" y2=\"34\"/><line x1=\"147\" y1=\"38\" x2=\"161\" y2=\"38\"/>\n    <line x1=\"172\" y1=\"26\" x2=\"186\" y2=\"26\"/><line x1=\"172\" y1=\"30\" x2=\"186\" y2=\"30\"/><line x1=\"172\" y1=\"34\" x2=\"186\" y2=\"34\"/><line x1=\"172\" y1=\"38\" x2=\"186\" y2=\"38\"/>\n    <line x1=\"197\" y1=\"26\" x2=\"211\" y2=\"26\"/><line x1=\"197\" y1=\"30\" x2=\"211\" y2=\"30\"/><line x1=\"197\" y1=\"34\" x2=\"211\" y2=\"34\"/><line x1=\"197\" y1=\"38\" x2=\"211\" y2=\"38\"/>\n  </g>\n  <!-- Tirador frontal inferior por blade -->\n  <g fill=\"#1f2b3e\" stroke=\"#334155\" stroke-width=\"0.5\">\n    <rect x=\"22\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"47\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"72\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"97\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"122\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"147\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"172\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n    <rect x=\"197\" y=\"52\" width=\"14\" height=\"6\" rx=\"1\"/>\n  </g>\n  <!-- Módulo de Gestión y Ventiladores Inferiores (Zona de 1U inferior, y: 70-90) -->\n  <rect x=\"18\" y=\"70\" width=\"197\" height=\"20\" rx=\"1\" fill=\"#090e16\" stroke=\"#1e293b\" stroke-width=\"0.8\"/>\n  <rect x=\"24\" y=\"73\" width=\"70\" height=\"14\" rx=\"1\" fill=\"#070a0f\" stroke=\"#1d4ed8\" stroke-width=\"0.6\"/>\n  <text x=\"28\" y=\"82\" font-family=\"'Consolas', monospace\" font-size=\"6\" font-weight=\"bold\" fill=\"#38bdf8\">CHASSIS MGMT CONTROLLER</text>\n  <circle class=\"chassis-pwr\" cx=\"102\" cy=\"80\" r=\"2\" fill=\"#10b981\"/>\n  <text x=\"108\" y=\"83\" font-family=\"'Consolas', monospace\" font-size=\"5\" fill=\"#64748b\">OK · DUAL PSU ACTIVE</text>\n  <!-- Rejillas de ventilación de alta potencia a la derecha -->\n  <g fill=\"#0b0f19\" stroke=\"#334155\" stroke-width=\"0.6\">\n    <circle cx=\"160\" cy=\"80\" r=\"6\"/>\n    <circle cx=\"176\" cy=\"80\" r=\"6\"/>\n    <circle cx=\"192\" cy=\"80\" r=\"6\"/>\n    <circle cx=\"206\" cy=\"80\" r=\"6\"/>\n  </g>\n</svg>",
  "assets/svg/default/storage.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"stGrad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1e2430\"/>\n      <stop offset=\"100%\" stop-color=\"#0e131b\"/>\n    </linearGradient>\n    <style>\n      @keyframes dskActG { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #10b981); } }\n      @keyframes dskActB { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 1.5px #38bdf8); } }\n      .d-g1 { animation: dskActG 0.8s infinite; }\n      .d-g2 { animation: dskActG 1.3s infinite 0.2s; }\n      .d-b1 { animation: dskActB 0.6s infinite 0.1s; }\n      .d-b2 { animation: dskActB 1.5s infinite 0.4s; }\n      .san-p { animation: dskActG 2.0s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#stGrad)\" stroke=\"#334155\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- 10 Bahías de Discos Hot-Swap -->\n  <g fill=\"#080c14\" stroke=\"#1e293b\" stroke-width=\"0.6\">\n    <rect x=\"14\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g1\" cx=\"17\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b1\" cx=\"24\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"17\" y1=\"14\" x2=\"24\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"30\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g2\" cx=\"33\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b2\" cx=\"40\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"33\" y1=\"14\" x2=\"40\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"46\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g1\" cx=\"49\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b1\" cx=\"56\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"49\" y1=\"14\" x2=\"56\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"62\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g2\" cx=\"65\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b2\" cx=\"72\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"65\" y1=\"14\" x2=\"72\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"78\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g1\" cx=\"81\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b1\" cx=\"88\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"81\" y1=\"14\" x2=\"88\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"94\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g2\" cx=\"97\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b2\" cx=\"104\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"97\" y1=\"14\" x2=\"104\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"110\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g1\" cx=\"113\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b1\" cx=\"120\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"113\" y1=\"14\" x2=\"120\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"126\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g2\" cx=\"129\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b2\" cx=\"136\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"129\" y1=\"14\" x2=\"136\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"142\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g1\" cx=\"145\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b1\" cx=\"152\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"145\" y1=\"14\" x2=\"152\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n    <rect x=\"158\" y=\"4\" width=\"13\" height=\"16\" rx=\"1\"/>\n    <circle class=\"d-g2\" cx=\"161\" cy=\"7\" r=\"1.1\" fill=\"#10b981\" stroke=\"none\"/>\n    <circle class=\"d-b2\" cx=\"168\" cy=\"7\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <line x1=\"161\" y1=\"14\" x2=\"168\" y2=\"14\" stroke=\"#475569\" stroke-width=\"1\"/>\n  </g>\n  <!-- Controladora SAS / Fibra -->\n  <rect x=\"178\" y=\"5\" width=\"48\" height=\"14\" rx=\"2\" fill=\"#090f1a\" stroke=\"#8b5cf6\" stroke-width=\"0.8\"/>\n  <text x=\"182\" y=\"14\" font-family=\"'Consolas', monospace\" font-size=\"6\" font-weight=\"bold\" fill=\"#c084fc\">SAN-10TB</text>\n  <circle class=\"san-p\" cx=\"220\" cy=\"12\" r=\"1.6\" fill=\"#10b981\"/>\n</svg>",
  "assets/svg/default/switch_24p.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"swChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#111827\"/>\n      <stop offset=\"100%\" stop-color=\"#0b0f19\"/>\n    </linearGradient>\n    <style>\n      @keyframes swActA { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }\n      @keyframes swActB { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }\n      @keyframes swActC { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; filter: drop-shadow(0 0 1px #10b981); } }\n      @keyframes sfpPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #38bdf8); } }\n      .p-a { animation: swActA 0.8s infinite; }\n      .p-b { animation: swActB 1.2s infinite 0.3s; }\n      .p-c { animation: swActC 1.6s infinite 0.7s; }\n      .p-d { animation: swActA 0.5s infinite 0.1s; }\n      .p-e { animation: swActB 2.0s infinite 0.4s; }\n      .sfp-l { animation: sfpPulse 1.1s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#swChassis)\" stroke=\"#1e293b\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#090d16\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#1e293b\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#090d16\"/>\n  <!-- Logo / Marca -->\n  <text x=\"14\" y=\"15\" font-family=\"sans-serif\" font-size=\"7\" font-weight=\"900\" fill=\"#38bdf8\">SW-24G</text>\n  <!-- Matriz de 24 Puertos RJ45 (2 filas de 12) -->\n  <g fill=\"#070a12\" stroke=\"#334155\" stroke-width=\"0.5\">\n    <rect x=\"52\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-a\" cx=\"56.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"52\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-b\" cx=\"56.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"64\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-c\" cx=\"68.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"64\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-d\" cx=\"68.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"76\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-e\" cx=\"80.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"76\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-a\" cx=\"80.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"88\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-b\" cx=\"92.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"88\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-c\" cx=\"92.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"100\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-d\" cx=\"104.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"100\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-e\" cx=\"104.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"112\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-a\" cx=\"116.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"112\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-b\" cx=\"116.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"124\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-c\" cx=\"128.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"124\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-d\" cx=\"128.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"136\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-e\" cx=\"140.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"136\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-a\" cx=\"140.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"148\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-b\" cx=\"152.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"148\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-c\" cx=\"152.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"160\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-d\" cx=\"164.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"160\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-e\" cx=\"164.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"172\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-a\" cx=\"176.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"172\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-b\" cx=\"176.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"184\" y=\"4\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-c\" cx=\"188.5\" cy=\"2.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n    <rect x=\"184\" y=\"13\" width=\"9\" height=\"7\" rx=\"0.8\"/>\n    <circle class=\"p-d\" cx=\"188.5\" cy=\"21.5\" r=\"0.9\" fill=\"#10b981\" stroke=\"none\"/>\n  </g>\n  <!-- 2 Jaulas SFP Fibra -->\n  <g fill=\"#1e293b\" stroke=\"#475569\" stroke-width=\"0.8\">\n    <rect x=\"202\" y=\"5\" width=\"11\" height=\"14\" rx=\"1\"/>\n    <rect x=\"215\" y=\"5\" width=\"11\" height=\"14\" rx=\"1\"/>\n    <circle class=\"sfp-l\" cx=\"207.5\" cy=\"21\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n    <circle class=\"sfp-l\" cx=\"220.5\" cy=\"21\" r=\"1.1\" fill=\"#38bdf8\" stroke=\"none\"/>\n  </g>\n</svg>",
  "assets/svg/default/tray.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <pattern id=\"trayPerf\" width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\">\n      <circle cx=\"3\" cy=\"3\" r=\"1.2\" fill=\"#070a12\"/>\n    </pattern>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"#1e293b\" stroke=\"#475569\" stroke-width=\"1\"/>\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#334155\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#334155\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"12\" y=\"3\" width=\"216\" height=\"18\" fill=\"url(#trayPerf)\"/>\n</svg>",
  "assets/svg/default/ups.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"24\" viewBox=\"0 0 240 24\">\n  <defs>\n    <linearGradient id=\"upsChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1e1b18\"/>\n      <stop offset=\"100%\" stop-color=\"#0f0e0c\"/>\n    </linearGradient>\n    <style>\n      @keyframes upsPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }\n      .ups-on { animation: upsPulse 2.8s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"24\" rx=\"2\" fill=\"url(#upsChassis)\" stroke=\"#443a2b\" stroke-width=\"1\"/>\n  <!-- Orejas -->\n  <rect x=\"0\" y=\"0\" width=\"10\" height=\"24\" fill=\"#29231b\"/><circle cx=\"5\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <rect x=\"230\" y=\"0\" width=\"10\" height=\"24\" fill=\"#29231b\"/><circle cx=\"235\" cy=\"12\" r=\"2\" fill=\"#000\"/>\n  <!-- LEDs de estado -->\n  <circle class=\"ups-on\" cx=\"16\" cy=\"7\" r=\"1.6\" fill=\"#10b981\"/>\n  <circle cx=\"16\" cy=\"12\" r=\"1.6\" fill=\"#f59e0b\" opacity=\"0.2\"/>\n  <circle cx=\"16\" cy=\"17\" r=\"1.6\" fill=\"#ef4444\" opacity=\"0.2\"/>\n  <!-- Display LCD Digital -->\n  <rect x=\"26\" y=\"4\" width=\"140\" height=\"16\" rx=\"2\" fill=\"#0c1726\" stroke=\"#1d4ed8\" stroke-width=\"0.8\"/>\n  <text x=\"32\" y=\"11\" font-family=\"'Consolas', monospace\" font-size=\"6\" font-weight=\"bold\" fill=\"#38bdf8\">SMART-UPS 3000VA</text>\n  <text x=\"32\" y=\"17\" font-family=\"'Consolas', monospace\" font-size=\"5\" fill=\"#93c5fd\">IN:230V │ BATT:100% │ LOAD:42%</text>\n  <!-- Tomas de salida frontales / Jacks -->\n  <g fill=\"#0a0f18\" stroke=\"#64748b\" stroke-width=\"0.8\">\n    <rect x=\"174\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>\n    <rect x=\"190\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>\n    <rect x=\"206\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>\n  </g>\n</svg>",
  "assets/svg/default/ups_2u.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"48\" viewBox=\"0 0 240 48\">\n  <defs>\n    <linearGradient id=\"ups2uChassis\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#1c1916\"/>\n      <stop offset=\"100%\" stop-color=\"#0a0908\"/>\n    </linearGradient>\n    <style>\n      @keyframes upsPulse2u { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; filter: drop-shadow(0 0 2px #10b981); } }\n      .ups2u-on { animation: upsPulse2u 2.5s infinite; }\n      @keyframes battCharge { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }\n      .batt-led { animation: battCharge 1.8s infinite; }\n    </style>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"240\" height=\"48\" rx=\"2\" fill=\"url(#ups2uChassis)\" stroke=\"#443a2b\" stroke-width=\"1\"/>\n  <!-- Orejas 2U -->\n  <rect x=\"0\" y=\"0\" width=\"12\" height=\"48\" fill=\"#29231b\" stroke=\"#3d3428\"/>\n  <circle cx=\"6\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#5c4e3c\"/>\n  <circle cx=\"6\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#5c4e3c\"/>\n  <rect x=\"228\" y=\"0\" width=\"12\" height=\"48\" fill=\"#29231b\" stroke=\"#3d3428\"/>\n  <circle cx=\"234\" cy=\"12\" r=\"2.5\" fill=\"#080c14\" stroke=\"#5c4e3c\"/>\n  <circle cx=\"234\" cy=\"36\" r=\"2.5\" fill=\"#080c14\" stroke=\"#5c4e3c\"/>\n  <!-- Display LCD Digital (Izquierda/Centro) -->\n  <rect x=\"18\" y=\"6\" width=\"130\" height=\"20\" rx=\"2\" fill=\"#071220\" stroke=\"#1d4ed8\" stroke-width=\"0.8\"/>\n  <text x=\"24\" y=\"14\" font-family=\"'Consolas', monospace\" font-size=\"6\" font-weight=\"bold\" fill=\"#38bdf8\">ONLINE UPS 3000VA · PURE SINE</text>\n  <text x=\"24\" y=\"21\" font-family=\"'Consolas', monospace\" font-size=\"5\" fill=\"#93c5fd\">IN: 230V │ OUT: 230V │ BATT: 100% │ LOAD: 38%</text>\n  <!-- Barra de estado / LEDs -->\n  <circle class=\"ups2u-on\" cx=\"156\" cy=\"11\" r=\"2\" fill=\"#10b981\"/>\n  <circle class=\"batt-led\" cx=\"156\" cy=\"18\" r=\"1.5\" fill=\"#38bdf8\"/>\n  <circle cx=\"156\" cy=\"24\" r=\"1.5\" fill=\"#ef4444\" opacity=\"0.3\"/>\n  <!-- Módulo de Baterías Hot-Swap Inferior (Bandeja 2U) -->\n  <rect x=\"18\" y=\"29\" width=\"144\" height=\"14\" rx=\"1\" fill=\"#12100e\" stroke=\"#2e271d\" stroke-width=\"0.8\"/>\n  <line x1=\"18\" y1=\"36\" x2=\"162\" y2=\"36\" stroke=\"#241e17\" stroke-width=\"1\"/>\n  <rect x=\"24\" y=\"32\" width=\"16\" height=\"8\" rx=\"1\" fill=\"#1f1a14\" stroke=\"#443a2b\" stroke-width=\"0.5\"/>\n  <rect x=\"44\" y=\"32\" width=\"16\" height=\"8\" rx=\"1\" fill=\"#1f1a14\" stroke=\"#443a2b\" stroke-width=\"0.5\"/>\n  <rect x=\"64\" y=\"32\" width=\"16\" height=\"8\" rx=\"1\" fill=\"#1f1a14\" stroke=\"#443a2b\" stroke-width=\"0.5\"/>\n  <rect x=\"84\" y=\"32\" width=\"16\" height=\"8\" rx=\"1\" fill=\"#1f1a14\" stroke=\"#443a2b\" stroke-width=\"0.5\"/>\n  <text x=\"108\" y=\"38\" font-family=\"'Consolas', monospace\" font-size=\"5\" fill=\"#786650\">BATTERY PACK · 4x 12V 9Ah</text>\n  <!-- Tomas frontales / breaker derecho -->\n  <g fill=\"#0c1017\" stroke=\"#64748b\" stroke-width=\"0.8\">\n    <rect x=\"174\" y=\"8\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <rect x=\"192\" y=\"8\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <rect x=\"210\" y=\"8\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <rect x=\"174\" y=\"27\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <rect x=\"192\" y=\"27\" width=\"14\" height=\"14\" rx=\"2\"/>\n    <rect x=\"210\" y=\"27\" width=\"14\" height=\"14\" rx=\"2\"/>\n  </g>\n</svg>",
};
const SVG_INLINE_CACHE = Object.assign({}, EMBEDDED_SVG_CACHE);

// Registrar también claves retrocompatibles en SVG_INLINE_CACHE
Object.keys(EMBEDDED_SVG_CACHE).forEach(k => {
  const legacyKey = k.replace('assets/svg/default/', 'assets/default/');
  SVG_INLINE_CACHE[legacyKey] = EMBEDDED_SVG_CACHE[k];
});

const DEFAULT_SVG_ASSETS = [
  'assets/svg/default/server_1u.svg',
  'assets/svg/default/server_2u.svg',
  'assets/svg/default/server_4u.svg',
  'assets/svg/default/switch_24p.svg',
  'assets/svg/default/router.svg',
  'assets/svg/default/firewall.svg',
  'assets/svg/default/storage.svg',
  'assets/svg/default/ups.svg',
  'assets/svg/default/ups_2u.svg',
  'assets/svg/default/pdu.svg',
  'assets/svg/default/patchpanel.svg',
  'assets/svg/default/organizer.svg',
  'assets/svg/default/kvm.svg',
  'assets/svg/default/tray.svg',
  'assets/svg/default/floor_pc.svg',
  'assets/svg/default/floor_camera.svg',
  'assets/svg/default/floor_ap.svg',
  'assets/svg/default/floor_printer.svg'
];

/**
 * Precarga asíncrona de los archivos SVG predeterminados en memoria desde la ruta canónica.
 */
function preloadFaceplateSvgs() {
  DEFAULT_SVG_ASSETS.forEach(url => {
    const canonicalUrl = normalizeAssetUrl(url);
    fetch(canonicalUrl)
      .then(res => res.ok ? res.text() : '')
      .then(text => {
        if (text) {
          SVG_INLINE_CACHE[canonicalUrl] = text;
          const legacyUrl = canonicalUrl.replace('assets/svg/default/', 'assets/default/');
          SVG_INLINE_CACHE[legacyUrl] = text;
        }
      })
      .catch(() => {});
  });
}

// Iniciar precarga inmediata
if (typeof window !== 'undefined') {
  preloadFaceplateSvgs();
}

/**
 * Normaliza y prepara el string SVG para ser inyectado como SVG inline en el DOM.
 * @param {string} svgText 
 * @param {string} devType 
 * @returns {string} Marcado SVG preparado
 */
function prepareInlineSvg(svgText, devType) {
  if (!svgText) return '';
  let processed = svgText.trim().replace(/<\?xml[^>]*\?>/gi, '');
  
  // Estandarizar atributos del elemento raíz <svg>
  processed = processed.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/i);
    const viewBoxAttr = viewBoxMatch ? `viewBox="${viewBoxMatch[1]}"` : 'viewBox="0 0 240 24"';
    return `<svg class="faceplate-img" preserveAspectRatio="none" ${viewBoxAttr} style="width:100%; height:100%; display:block;" role="img" aria-label="${devType || 'Dispositivo'}">`;
  });

  return processed;
}

/**
 * Reemplaza dinámicamente un <img> por su contraparte <svg> inline una vez cargado.
 * @param {HTMLImageElement} imgEl 
 * @param {string} svgSrc 
 * @param {string} devType 
 */
function inlineFaceplateImage(imgEl, svgSrc, devType) {
  const canonicalSrc = normalizeAssetUrl(svgSrc);
  const replaceWithSvg = (svgText) => {
    if (!svgText) return;
    SVG_INLINE_CACHE[canonicalSrc] = svgText;
    const parent = imgEl.parentElement;
    if (parent && parent.contains(imgEl)) {
      const svgHtml = prepareInlineSvg(svgText, devType);
      const temp = document.createElement('div');
      temp.innerHTML = svgHtml;
      const svgNode = temp.firstElementChild;
      if (svgNode) {
        parent.replaceChild(svgNode, imgEl);
      }
    }
  };

  if (SVG_INLINE_CACHE[canonicalSrc]) {
    replaceWithSvg(SVG_INLINE_CACHE[canonicalSrc]);
  } else {
    fetch(canonicalSrc)
      .then(res => res.ok ? res.text() : '')
      .then(replaceWithSvg)
      .catch(() => {});
  }
}

/**
 * Resuelve la ruta del archivo SVG correspondiente según el tipo y tamaño del equipo.
 * Si el equipo tiene una skin personalizada configurada, se prioriza.
 * @param {Object} device 
 * @returns {string} Ruta al archivo SVG
 */
function getSvgFaceplatePath(device) {
  if (device && device.skin) {
    return normalizeAssetUrl(`assets/img/${device.skin}`);
  }

  const type = ((device && device.type) || 'server').toLowerCase();
  const name = ((device && device.name) || '').toLowerCase();
  const size = (device && device.size) ? parseInt(device.size, 10) : 1;

  // Servidores (1U, 2U o 4U Blade/Chasis)
  if (type === 'server') {
    if (size >= 4) return 'assets/svg/default/server_4u.svg';
    return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/server_1u.svg';
  }

  // Seguridad y Video (NVR, DVR, Decoder)
  if (type === 'nvr' || type === 'dvr') {
    return size >= 2 ? 'assets/svg/default/storage.svg' : 'assets/svg/default/server_1u.svg';
  }
  if (type === 'decoder') {
    return 'assets/svg/default/router.svg';
  }

  // Switches y conectividad de red
  if (type === 'switch') return 'assets/svg/default/switch_24p.svg';
  if (type === 'router') return 'assets/svg/default/router.svg';
  if (type === 'firewall') return 'assets/svg/default/firewall.svg';

  // Almacenamiento (Storage, SAN, NAS)
  if (type === 'storage' || type === 'nas' || type === 'san') {
    if (size >= 4) return 'assets/svg/default/server_4u.svg';
    return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/storage.svg';
  }

  // Energía (UPS y PDU)
  if (type === 'ups') {
    return size >= 2 ? 'assets/svg/default/ups_2u.svg' : 'assets/svg/default/ups.svg';
  }
  if (type === 'pdu') return 'assets/svg/default/pdu.svg';
  if (type === 'energia' || type === 'power') {
    if (name.includes('pdu')) return 'assets/svg/default/pdu.svg';
    return size >= 2 ? 'assets/svg/default/ups_2u.svg' : 'assets/svg/default/ups.svg';
  }

  // Cableado y Gestión
  if (type === 'patchpanel' || type === 'odf') return 'assets/svg/default/patchpanel.svg';
  if (type === 'gestion') {
    return name.includes('kvm') ? 'assets/svg/default/kvm.svg' : 'assets/svg/default/patchpanel.svg';
  }
  if (type === 'organizer' || type === 'organizador') return 'assets/svg/default/organizer.svg';
  if (type === 'kvm') return 'assets/svg/default/kvm.svg';
  if (type === 'tray' || type === 'bandeja' || type === 'accessories') return 'assets/svg/default/tray.svg';

  // Equipos de piso o externos
  if (type === 'pc') return 'assets/svg/default/floor_pc.svg';
  if (type === 'camera') return 'assets/svg/default/floor_camera.svg';
  if (type === 'ap') return 'assets/svg/default/floor_ap.svg';
  if (type === 'printer') return 'assets/svg/default/floor_printer.svg';

  // Fallback genérico según altura
  if (size >= 4) return 'assets/svg/default/server_4u.svg';
  return size >= 2 ? 'assets/svg/default/server_2u.svg' : 'assets/svg/default/server_1u.svg';
}

/**
 * Construye la carátula frontal o trasera (faceplate) para un equipo de rack.
 * Inyecta SVG inline (o fallback reactivo con auto-inlining) para que las animaciones
 * de los LEDs respondan de inmediato a body.no-animations.
 * @param {Object} device - Objeto de dispositivo
 * @param {number} heightPx - Altura calculada en píxeles (size * UNIT_H)
 * @param {string} side - 'front' o 'rear'
 * @returns {string} Marcado HTML con imagen SVG y etiquetas legibles
 */
function buildFaceplate(device, heightPx, side = 'front') {
  if (side === 'rear') {
    return buildRearFaceplate(device, heightPx);
  }

  const h = heightPx;
  const svgSrc = normalizeAssetUrl(getSvgFaceplatePath(device));
  const devName = escapeHTML(device.name || 'Dispositivo');
  const devIp = escapeHTML(device.ip || '');
  const devType = escapeHTML((device.type || 'server').toUpperCase());

  let visualElement = '';
  if (SVG_INLINE_CACHE[svgSrc]) {
    visualElement = prepareInlineSvg(SVG_INLINE_CACHE[svgSrc], devType);
  } else {
    visualElement = `
      <img src="${svgSrc}" 
           class="faceplate-img" 
           alt="${devType} - ${devName}"
           draggable="false"
           onload="inlineFaceplateImage(this, '${svgSrc}', '${devType}')"
           onerror="if(!this.dataset.fallback && window.SVG_INLINE_CACHE && window.SVG_INLINE_CACHE['${svgSrc}']){this.dataset.fallback=1; inlineFaceplateImage(this, '${svgSrc}', '${devType}');}" />`;
  }

  return `
    <div class="faceplate-wrapper" data-device-id="${device.id}" data-dev-type="${devType.toLowerCase()}" style="height:${h}px;">
      ${visualElement}
      <div class="faceplate-overlay-info">
        <span class="faceplate-label dev-title" title="${devName}">${devName}</span>
        ${devIp ? `<span class="faceplate-label dev-meta" title="${devIp}">${devIp}</span>` : ''}
      </div>
    </div>`;
}

/**
 * Construye la carátula técnica trasera para un equipo de rack.
 * @param {Object} device 
 * @param {number} heightPx 
 * @returns {string} Marcado HTML
 */
function buildRearFaceplate(device, heightPx) {
  const h = heightPx;
  const devName = escapeHTML(device.name || 'Dispositivo');
  const plugs = parseInt(device.plugs) || (device.type === 'server' ? 2 : 1);
  const ethernetPorts = (device.ports && device.ports.ethernet) || 2;
  
  let psuHTML = '';
  for (let i = 0; i < Math.min(plugs, 4); i++) {
    psuHTML += `
      <div style="display:flex; align-items:center; gap:4px; background:rgba(0,0,0,0.5); padding:2px 5px; border-radius:3px; border:1px solid rgba(255,255,255,0.12);" title="Fuente de Alimentación PSU ${i+1}">
        <div style="width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 5px #10b981;"></div>
        <span style="font-size:9px; font-family:var(--font-mono); color:#94a3b8; font-weight:600;">PSU-${i+1}</span>
      </div>`;
  }
  
  let netHTML = '';
  if (ethernetPorts > 0) {
    netHTML += `<div style="display:flex; gap:2px; align-items:center;" title="${ethernetPorts} puertos LAN traseros">`;
    for (let i = 0; i < Math.min(ethernetPorts, 8); i++) {
      netHTML += `<div class="rear-port-jack" data-device-id="${device.id}" data-port="Eth${i+1}" style="width:9px; height:7px; background:#0f172a; border:1px solid #38bdf8; border-radius:1px;"></div>`;
    }
    netHTML += `</div>`;
  }

  const isDual = device.mountSide === 'both';
  const badgeLabel = isDual ? 'TRASERA · DUAL' : 'TRASERA';

  return `
    <div class="faceplate-wrapper rear-faceplate" data-device-id="${device.id}" style="height:${h}px; background:linear-gradient(90deg, #09111e 0%, #132238 50%, #09111e 100%); border:1px solid #1e3a5f; display:flex; align-items:center; justify-content:space-between; padding:0 12px; box-sizing:border-box; position:relative; overflow:hidden;">
      <div style="display:flex; align-items:center; gap:8px; z-index:2;">
        <span style="font-size:9px; font-weight:700; background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); border-radius:3px; padding:1px 5px; font-family:var(--font-mono); letter-spacing:0.5px;">${badgeLabel}</span>
        <span style="font-size:11px; font-weight:600; color:#cbd5e1; font-family:var(--font-mono); max-width:110px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${devName}">${devName}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px; z-index:2;">
        ${netHTML}
        ${psuHTML}
      </div>
      <div style="position:absolute; inset:0; opacity:0.04; background-image:radial-gradient(#ffffff 1px, transparent 1px); background-size:6px 6px; pointer-events:none;"></div>
    </div>`;
}

/**
 * Renderiza la tarjeta para dispositivos de planta/piso (floor devices).
 * @param {Object} device 
 * @returns {string} Marcado HTML
 */
function getFloorFaceplate(device) {
  const colors = {
    pc:      '#0ea5e9',
    camera:  '#8b5cf6',
    ap:      '#10b981',
    door:    '#f59e0b',
    printer: '#06b6d4',
    phone:   '#ef4444',
  };
  const color = colors[device.type] || '#8b9ab8';
  const name  = escapeHTML(device.name);
  const rawSvg = typeof SVG_ICONS !== 'undefined' && SVG_ICONS[device.type] ? SVG_ICONS[device.type] : '';
  const svgIcon = rawSvg ? rawSvg.replace('<svg ', '<svg width="22" height="22" ') : '';

  return `
    <div class="floor-device-card" 
         data-device-id="${device.id}" 
         draggable="true"
         style="--floor-color: ${color}">
      <div class="floor-device-icon" style="background:${color}18; border:1px solid ${color}33; color:${color}; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">${svgIcon}</div>
      <div class="floor-device-info">
        <div class="floor-device-name">${name}</div>
        <div class="floor-device-meta">${escapeHTML(device.ip) || escapeHTML(device.type).toUpperCase()}</div>
      </div>
      <div class="device-actions">
        <button class="dev-btn menu" data-menu-dev="${device.id}" title="Opciones" style="background:none; border:none; font-size:16px; padding:0 8px; color:var(--text-muted); cursor:pointer;">⋮</button>
      </div>
    </div>`;
}

/**
 * Construye la vista posterior (rear view) del rack y sus conexiones de energía/red.
 * @param {Object} rack 
 * @param {Array} devices 
 * @returns {string} Marcado HTML de la vista trasera
 */
function buildRearView(rack, devices) {
  const TYPE_COLORS_LOCAL = {
    server: '#10b981', switch: '#10b981', router: '#06b6d4',
    firewall: '#ef4444', ups: '#f59e0b', storage: '#8b5cf6'
  };

  // Mapear conexiones activas por dispositivo
  const connMap = {};
  (store._raw.connections || []).forEach(c => {
    if (!connMap[c.sourceDeviceId]) connMap[c.sourceDeviceId] = [];
    if (!connMap[c.targetDeviceId]) connMap[c.targetDeviceId] = [];
    connMap[c.sourceDeviceId].push({ conn: c, side: 'src' });
    connMap[c.targetDeviceId].push({ conn: c, side: 'dst' });
  });

  // Mapa de dispositivos por unidad U
  const deviceMap = {};
  devices.forEach(d => {
    for (let u = d.slotStart; u < d.slotStart + d.size; u++) deviceMap[u] = d;
  });

  let slotsHTML = '';
  let skip = 0;

  for (let u = 1; u <= rack.height; u++) {
    if (skip > 0) { skip--; continue; }
    const dev = devices.find(d => d.slotStart === u);

    if (dev) {
      skip = dev.size - 1;
      const h = dev.size * UNIT_H;
      const devColor = TYPE_COLORS_LOCAL[dev.type] || '#1e3a5f';
      const conns = connMap[dev.id] || [];

      // Construcción de los puertos traseros
      let portsHTML = '';
      if (conns.length > 0) {
        portsHTML = conns.map(({ conn, side }) => {
          const port = side === 'src' ? conn.sourcePort : conn.targetPort;
          const peerId = side === 'src' ? conn.targetDeviceId : conn.sourceDeviceId;
          const peer = store.deviceById(peerId);
          const peerName = peer ? peer.name.slice(0, 14) : '?';
          const cableColor = conn.color || '#3b82f6';
          return `<div class="rear-port" title="${escapeHTML(port)} → ${escapeHTML(peerName)}">
            <div class="rear-port-jack active" data-device-id="${dev.id}" data-port="${escapeHTML(port)}" style="--cable-color:${escapeHTML(cableColor)}"></div>
            <div class="rear-port-label">${escapeHTML(port)}</div>
          </div>`;
        }).join('');
      } else {
        portsHTML = `
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>
          <div class="rear-port"><div class="rear-port-jack"></div><div class="rear-port-label">—</div></div>`;
      }

      // Tomas de corriente / PDU
      const plugs = parseInt(dev.plugs) || 1;
      const outletHTML = Array.from({ length: Math.min(plugs, 4) }, (_, i) =>
        `<div class="rear-outlet used" title="${escapeHTML(dev.power || 0)}W · Toma ${i+1}"></div>`
      ).join('');

      slotsHTML += `<div class="rear-slot" style="height:${h}px; min-height:${h}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body has-device" style="--device-color:${devColor}">
          <span class="rear-device-name" title="${escapeHTML(dev.name)}">${escapeHTML(dev.name.slice(0,16))}</span>
          <div class="rear-ports">${portsHTML}</div>
          <div class="rear-pdu">${outletHTML}</div>
        </div>
      </div>`;
    } else {
      slotsHTML += `<div class="rear-slot" style="height:${UNIT_H}px; min-height:${UNIT_H}px">
        <div class="rear-slot-unit">${u}</div>
        <div class="rear-slot-body"></div>
      </div>`;
    }
  }

  const totalConns = devices.reduce((s, d) => s + (connMap[d.id] ? connMap[d.id].length : 0), 0);

  return `
    <div class="rack-rear-header">
      <span class="rear-label">Vista Trasera</span>
      <span style="color:#2a5080; font-size:9px">${totalConns} cable(s)</span>
    </div>
    <div class="rack-rear-slots">${slotsHTML}</div>`;
}
