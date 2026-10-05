/**
 * TopologySkins.js — Sistema Avanzado de Skins Visuales en Topología (M-28)
 * RACK Designer Next
 * 
 * Gestiona los 3 modos de representación visual en Canvas 2D:
 * 1. 'circle' (Nodos): Modo minimalista circular con icono central y etiquetas independientes.
 * 2. 'card' (Tarjetas): Modo rectangular tradicional (150×50) con datos de equipo e IP.
 * 3. 'image' (Hardware / Imágenes): Modo arquitectónico/fotorrealista (140×50) con
 *    chasis de hardware procedimental, orejas de montaje en rack, frontal de equipo
 *    basado en EMBEDDED_SVG_CACHE y soporte para imágenes personalizadas (.png, .jpg, .svg).
 */

const TopologySkins = (function() {
  const MODES = {
    CIRCLE: 'circle',
    CARD: 'card',
    IMAGE: 'image'
  };

  // Dimensiones canónicas y límites de espaciado para layout y colisiones
  const DIMENSIONS = {
    circle: {
      width: 44,
      height: 44,
      radius: 22,
      boundW: 66,
      boundH: 66
    },
    card: {
      width: 150,
      height: 50,
      radius: 8,
      boundW: 160,
      boundH: 60
    },
    image: {
      width: 140,
      height: 50,
      radius: 4,
      boundW: 150,
      boundH: 60
    }
  };

  // Presets de hardware predefinidos vinculados con los SVGs de EMBEDDED_SVG_CACHE
  const HARDWARE_PRESETS = {
    'server_1u': 'assets/svg/default/server_1u.svg',
    'server_2u': 'assets/svg/default/server_2u.svg',
    'server_4u': 'assets/svg/default/server_4u.svg',
    'switch': 'assets/svg/default/switch_24p.svg',
    'router': 'assets/svg/default/router.svg',
    'firewall': 'assets/svg/default/firewall.svg',
    'storage': 'assets/svg/default/storage.svg',
    'ups': 'assets/svg/default/ups.svg',
    'pdu': 'assets/svg/default/pdu.svg',
    'patchpanel': 'assets/svg/default/patchpanel.svg',
    'organizer': 'assets/svg/default/organizer.svg',
    'kvm': 'assets/svg/default/kvm.svg',
    'tray': 'assets/svg/default/tray.svg',
    'pc': 'assets/svg/default/floor_pc.svg',
    'ap': 'assets/svg/default/floor_ap.svg',
    'camera': 'assets/svg/default/floor_camera.svg',
    'printer': 'assets/svg/default/floor_printer.svg',
    'door': 'assets/svg/default/floor_door.svg',
    'phone': 'assets/svg/default/floor_phone.svg'
  };

  // Mapeo automático de tipo y tamaño de equipo al preset de hardware idóneo
  function getPresetForDevice(dev) {
    if (!dev) return 'server_2u';
    if (dev.preset && HARDWARE_PRESETS[dev.preset]) return dev.preset;
    
    const type = (dev.type || 'server').toLowerCase();
    const size = parseInt(dev.size) || 1;

    if (type === 'server') {
      if (size >= 4) return 'server_4u';
      if (size === 2 || size === 3) return 'server_2u';
      return 'server_1u';
    }
    if (type === 'switch') return 'switch';
    if (type === 'router') return 'router';
    if (type === 'firewall') return 'firewall';
    if (type === 'storage' || type === 'nas' || type === 'san') return 'storage';
    if (type === 'ups' || type === 'energia') return 'ups';
    if (type === 'pdu') return 'pdu';
    if (type === 'patchpanel' || type === 'odf') return 'patchpanel';
    if (type === 'organizer') return 'organizer';
    if (type === 'kvm') return 'kvm';
    if (type === 'tray') return 'tray';
    if (type === 'pc' || type === 'workstation') return 'pc';
    if (type === 'ap' || type === 'wifi') return 'ap';
    if (type === 'camera' || type === 'nvr' || type === 'dvr' || type === 'decoder') return 'camera';
    if (type === 'printer') return 'printer';
    if (type === 'door') return 'door';
    if (type === 'phone' || type === 'voip') return 'phone';
    
    return 'server_1u';
  }

  // Caché de elementos Image para Canvas 2D
  const imageCache = {};

  /**
   * Obtiene o genera el objeto Image() para renderizar el equipo en Canvas 2D.
   * Soporta fotos/imágenes del usuario (DataURL base64), skins personalizados
   * y SVGs vectoriales de EMBEDDED_SVG_CACHE.
   */
  function getHardwareImage(dev) {
    if (!dev) return null;
    const cacheKey = dev.customTopoImage || dev.skin || (dev.id ? `${dev.id}_${getPresetForDevice(dev)}` : getPresetForDevice(dev));
    if (imageCache[cacheKey]) return imageCache[cacheKey];

    // 1. Imagen personalizada del usuario (DataURL base64 o URL directa)
    if (dev.customTopoImage && typeof Image !== 'undefined') {
      const img = new Image();
      img.src = dev.customTopoImage;
      imageCache[cacheKey] = img;
      return img;
    }

    // 2. Skin personalizado especificado en dev.skin
    let svgKey = null;
    if (dev.skin && typeof EMBEDDED_SVG_CACHE !== 'undefined') {
      const normalized = typeof normalizeAssetUrl === 'function' ? normalizeAssetUrl(dev.skin) : dev.skin;
      if (EMBEDDED_SVG_CACHE[normalized]) {
        svgKey = normalized;
      } else if (EMBEDDED_SVG_CACHE['assets/svg/default/' + dev.skin]) {
        svgKey = 'assets/svg/default/' + dev.skin;
      }
    }

    // 3. Preset por defecto según tipo y tamaño de equipo
    if (!svgKey) {
      const preset = getPresetForDevice(dev);
      svgKey = HARDWARE_PRESETS[preset];
    }

    if (svgKey && typeof EMBEDDED_SVG_CACHE !== 'undefined' && EMBEDDED_SVG_CACHE[svgKey] && typeof Image !== 'undefined') {
      try {
        const svgContent = EMBEDDED_SVG_CACHE[svgKey];
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        imageCache[cacheKey] = img;
        return img;
      } catch (e) {
        // En entornos sin Blob/URL (Node.js tests) retornamos null
        return null;
      }
    }

    return null;
  }

  /**
   * Obtiene las dimensiones de geometría de un modo de skin dado.
   */
  function getNodeDimensions(mode) {
    const m = mode || (typeof window !== 'undefined' ? window.TOPOLOGY_STYLE : 'card') || 'card';
    return DIMENSIONS[m] || DIMENSIONS.card;
  }

  /**
   * Comprueba si las coordenadas (mx, my) están dentro del área interactiva del nodo.
   * Unifica el hit-testing para arrastre, hover y doble clic en los 3 modos.
   */
  function isPointInNode(pos, mx, my, mode) {
    if (!pos || typeof mx !== 'number' || typeof my !== 'number') return false;
    const m = mode || (typeof window !== 'undefined' ? window.TOPOLOGY_STYLE : 'card') || 'card';

    if (m === 'circle') {
      const dx = mx - pos.x;
      const dy = my - pos.y;
      return (dx * dx + dy * dy) <= (24 * 24);
    }

    if (m === 'image') {
      const dim = DIMENSIONS.image;
      const halfW = dim.width / 2;
      const halfH = dim.height / 2;
      return mx >= (pos.x - halfW) && mx <= (pos.x + halfW) &&
             my >= (pos.y - halfH) && my <= (pos.y + halfH);
    }

    // Modo 'card' (por defecto)
    const dim = DIMENSIONS.card;
    const halfW = dim.width / 2;
    const halfH = dim.height / 2;
    return mx >= (pos.x - halfW) && mx <= (pos.x + halfW) &&
           my >= (pos.y - halfH) && my <= (pos.y + halfH);
  }

  /**
   * Renderiza un equipo en modo Hardware / Imagen en el Canvas 2D.
   * Dibuja orejas de montaje en rack, frontal metálico o imagen fotorrealista,
   * y una banda de datos nítida con Nombre, Tipo, LED y dirección IP.
   */
  function renderHardwareNode(ctx, dev, pos, isHoverTarget, isActive, TYPE_COLORS) {
    if (!ctx || !dev || !pos) return;

    const dim = DIMENSIONS.image;
    const cardW = dim.width;
    const cardH = dim.height;
    const cx = pos.x - cardW / 2;
    const cy = pos.y - cardH / 2;
    const col = (TYPE_COLORS && TYPE_COLORS[dev.type]) || '#38bdf8';
    const isFloor = dev.category === 'floor' || (typeof FLOOR_TYPES !== 'undefined' && FLOOR_TYPES.has(dev.type));

    // 1. Resplandor / Halo de selección / hover
    if (isHoverTarget) {
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cx - 4, cy - 4, cardW + 8, cardH + 8, 8);
      } else {
        ctx.rect(cx - 4, cy - 4, cardW + 8, cardH + 8);
      }
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fill();
      ctx.restore();
    }

    // 2. Chasis del equipo
    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cx, cy, cardW, cardH, 5);
    } else {
      ctx.rect(cx, cy, cardW, cardH);
    }
    // Gradiente metálico oscuro para el chasis
    try {
      const grad = ctx.createLinearGradient(cx, cy, cx, cy + cardH);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
    } catch (e) {
      ctx.fillStyle = '#0f172a';
    }
    ctx.fill();
    ctx.strokeStyle = isHoverTarget ? '#ffffff' : col;
    ctx.lineWidth = isHoverTarget ? 2 : 1.5;
    ctx.stroke();

    // 3. Orejas de montaje de Rack (si es equipo en rack)
    if (!isFloor) {
      const earW = 8;
      // Oreja izquierda
      ctx.fillStyle = '#263449';
      ctx.fillRect(cx, cy, earW, cardH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, earW, cardH);
      // Tornillos oreja izquierda
      ctx.fillStyle = '#0a0e17';
      ctx.beginPath();
      ctx.arc(cx + 4, cy + 10, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy + cardH - 10, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Oreja derecha
      ctx.fillStyle = '#263449';
      ctx.fillRect(cx + cardW - earW, cy, earW, cardH);
      ctx.strokeRect(cx + cardW - earW, cy, earW, cardH);
      // Tornillos oreja derecha
      ctx.fillStyle = '#0a0e17';
      ctx.beginPath();
      ctx.arc(cx + cardW - 4, cy + 10, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + cardW - 4, cy + cardH - 10, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Carátula / Gráfico vectorial del equipo o frontal procedural
    const img = getHardwareImage(dev);
    const contentX = !isFloor ? cx + 9 : cx + 4;
    const contentW = !isFloor ? cardW - 18 : cardW - 8;
    const faceplateH = 24;

    if (img && img.complete && img.naturalWidth > 0) {
      try {
        ctx.save();
        // Recorte redondeado para no desbordar
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(contentX, cy + 2, contentW, faceplateH, 3);
        } else {
          ctx.rect(contentX, cy + 2, contentW, faceplateH);
        }
        ctx.clip();
        ctx.drawImage(img, contentX, cy + 2, contentW, faceplateH);
        ctx.restore();
      } catch (err) {
        // Fallback procedural
      }
    } else {
      // Frontal procedimental estilizado si la imagen aún no está cargada
      ctx.save();
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(contentX, cy + 2, contentW, faceplateH);
      // Rejilla de puertos o ventilación procedimental
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.4;
      for (let vx = contentX + 6; vx < contentX + contentW - 12; vx += 8) {
        ctx.fillRect(vx, cy + 6, 5, 8);
      }
      ctx.restore();
    }

    // 5. Franja técnica inferior con fondo de alto contraste
    const bottomH = 20;
    const bottomY = cy + cardH - bottomH;
    ctx.fillStyle = 'rgba(10, 15, 26, 0.92)';
    ctx.fillRect(cx + 1, bottomY, cardW - 2, bottomH - 1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 1, bottomY);
    ctx.lineTo(cx + cardW - 1, bottomY);
    ctx.stroke();

    // LED de Estado del Dispositivo (verde: activo, amarillo: mantenimiento, rojo/apagado)
    let ledColor = '#10b981';
    if (dev.status === 'maintenance') ledColor = '#f59e0b';
    else if (dev.status === 'offline') ledColor = '#ef4444';

    ctx.beginPath();
    ctx.arc(cx + 12, bottomY + 10, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = ledColor;
    ctx.shadowColor = ledColor;
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Nombre del Dispositivo (Truncado si es largo)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f8fafc';
    const rawDevName = dev.name || 'Sin Nombre';
    const maxTextW = dev.ip ? 58 : 108;
    let devName = rawDevName;
    if (ctx.measureText(devName).width > maxTextW) {
      while (devName.length > 3 && ctx.measureText(devName + '…').width > maxTextW) {
        devName = devName.slice(0, -1);
      }
      devName += '…';
    }
    ctx.fillText(devName, cx + 18, bottomY + 10);

    // Dirección IP (si existe)
    if (dev.ip) {
      ctx.textAlign = 'right';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      let devIp = dev.ip;
      if (ctx.measureText(devIp).width > 56) {
        devIp = devIp.split('.').slice(-2).join('.'); // Muestra los últimos octetos si es muy larga
      }
      ctx.fillText(devIp, cx + cardW - 8, bottomY + 10);
    }

    ctx.restore();
  }

  return {
    MODES,
    HARDWARE_PRESETS,
    DIMENSIONS,
    getPresetForDevice,
    getHardwareImage,
    getNodeDimensions,
    isPointInNode,
    renderHardwareNode
  };
})();

if (typeof window !== 'undefined') {
  window.TopologySkins = TopologySkins;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TopologySkins };
}
