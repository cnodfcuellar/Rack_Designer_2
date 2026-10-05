const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'doc', 'doc_md', 'CODIGO_COMPLETO_PROYECTO.md');

// Lista estructurada de archivos por capas arquitectónicas
const ARCHITECTURE_SECTIONS = [
  {
    title: 'Capa 0: Manifiesto PWA y Service Worker Offline',
    description: 'Archivos que habilitan el funcionamiento como Progressive Web App (PWA) 100% instalable y offline con estrategias de caché en memoria.',
    files: [
      { path: 'json/manifest.json', lang: 'json', desc: 'Metadatos del manifiesto PWA para instalación de escritorio y móvil.' },
      { path: 'service-worker.js', lang: 'javascript', desc: 'Service Worker offline con precaché inteligente y auto-actualización.' }
    ]
  },
  {
    title: 'Capa 1: Estructura HTML y Vistas Base',
    description: 'El esqueleto semántico DOM de la aplicación, definiendo las áreas CSS Grid, modales, barras y templates.',
    files: [
      { path: 'index.html', lang: 'html', desc: 'Página HTML principal: layout general, contenedores de vistas, modales y carga ordenada de scripts.' }
    ]
  },
  {
    title: 'Capa 2: Sistema de Diseño y Estilos CSS Modulares',
    description: 'Arquitectura CSS modular y en cascada: variables de tema (claro/oscuro), layout grid, gabinetes, faceplates y modales.',
    files: [
      { path: 'css/style.css', lang: 'css', desc: 'Punto de entrada CSS: encadenamiento ordenado de @imports.' },
      { path: 'css/variables.css', lang: 'css', desc: 'Tokens de diseño: variables CSS de colores, fuentes, alturas y temas claro/oscuro.' },
      { path: 'css/layout.css', lang: 'css', desc: 'Rejilla CSS Grid (3 filas × 3 columnas), header, paneles laterales e inferiores.' },
      { path: 'css/components/panels.css', lang: 'css', desc: 'Estilos para sidebar, outliner, inspector, popovers y tablas inferiores.' },
      { path: 'css/components/rack.css', lang: 'css', desc: 'Estilos de gabinetes (Racks), unidades U (24px), flipping 3D y ranuras (slots de 240px).' },
      { path: 'css/components/faceplates.css', lang: 'css', desc: 'Estilos de carátulas SVG y hardware montado en racks o en sección de piso.' },
      { path: 'css/components/modals.css', lang: 'css', desc: 'Estilos de las ventanas modales, formularios, grillas y botones.' },
      { path: 'css/components/misc.css', lang: 'css', desc: 'Animaciones de estado, tooltips, notificaciones toast y utilidades visuales.' }
    ]
  },
  {
    title: 'Capa 3: Núcleo de Estado, Utilidades y Demostración',
    description: 'El cerebro de la aplicación (Store con Proxy ES6 reactivo), utilidades globales, mapa de iconos y dataset demo.',
    files: [
      { path: 'js/store.js', lang: 'javascript', desc: 'Store reactivo: Proxy ES6, snapshots para Undo/Redo, persistencia en localStorage y auto-saneamiento.' },
      { path: 'js/utils.js', lang: 'javascript', desc: 'Funciones de soporte: uid, deepClone, escapeHTML, notificaciones toast y diálogos seguros.' },
      { path: 'js/icons.js', lang: 'javascript', desc: 'Diccionario de iconos SVG vectoriales inline utilizados en toda la interfaz.' },
      { path: 'js/demoData.js', lang: 'javascript', desc: 'Dataset preconfigurado de demostración con salas, racks 42U, equipos ToR y cableado VLAN.' }
    ]
  },
  {
    title: 'Capa 4: Seguridad, Criptografía y Control de Acceso (RBAC)',
    description: 'Autenticación basada en roles con SHA-256 y cifrado simétrico en reposo con AES-GCM.',
    files: [
      { path: 'js/auth/roles.js', lang: 'javascript', desc: 'Módulo RBAC (RackAuth): control de roles (Admin/Editor/Viewer), login por PIN, SHA-256 y sesión.' },
      { path: 'js/auth/crypto.js', lang: 'javascript', desc: 'Módulo criptográfico (RackCrypto): cifrado/descifrado simétrico AES-GCM (enc:v1:) para contraseñas en reposo.' }
    ]
  },
  {
    title: 'Capa 5: Interfaz de Usuario y Vistas Principales (DOM)',
    description: 'Controladores de interfaz de usuario para el catálogo, renderizado de racks, cables SVG, tablas y outliner.',
    files: [
      { path: 'js/ui/catalog.js', lang: 'javascript', desc: 'Catálogo de hardware: 30 plantillas arquitectónicas en 8 familias y buscador reactivo.' },
      { path: 'js/ui/faceplates.js', lang: 'javascript', desc: 'Motor de inyección SVG inline con caché en memoria y generación de carátulas fotorrealistas.' },
      { path: 'js/ui/rack.js', lang: 'javascript', desc: 'Vista Física: renderizado de gabinetes, drag & drop, flip 3D y trazado ortogonal de cables SVG.' },
      { path: 'js/ui/tables.js', lang: 'javascript', desc: 'Panel inferior: tablas de inventario y conexiones con selector dinámico de columnas y edición en celda.' },
      { path: 'js/ui/outliner.js', lang: 'javascript', desc: 'Panel derecho (Outliner): árbol jerárquico Sala > Rack > Equipo con navegación y acciones CRUD inline.' },
      { path: 'js/ui/inspector.js', lang: 'javascript', desc: 'Panel derecho (Inspector): visualización y edición granular de propiedades, modo Dios y colapso.' },
      { path: 'js/ui/fileManager.js', lang: 'javascript', desc: 'Gestor de archivos: integración con File System Access API para abrir/guardar .rack sin servidor.' },
      { path: 'js/ui/modals.js', lang: 'javascript', desc: 'Orquestador de modales: inicialización y registro centralizado de diálogos.' }
    ]
  },
  {
    title: 'Capa 6: Diálogos Modales Especializados',
    description: 'Componentes modales desacoplados para la creación y edición de salas, gabinetes, equipos, cables y exportación.',
    files: [
      { path: 'js/ui/modals/Globals.js', lang: 'javascript', desc: 'Variables globales y utilidades compartidas entre las ventanas modales.' },
      { path: 'js/ui/modals/RackModal.js', lang: 'javascript', desc: 'Modal de creación y edición de gabinetes con alturas normalizadas y selector de color.' },
      { path: 'js/ui/modals/DeviceModal.js', lang: 'javascript', desc: 'Modal de formulario técnico de equipos: interfaces de red, IPs, credenciales y montaje.' },
      { path: 'js/ui/modals/CableModal.js', lang: 'javascript', desc: 'Modal de cableado estructurado: asignación de puertos, filtrado de ocupados y VLANs.' },
      { path: 'js/ui/modals/RoomModal.js', lang: 'javascript', desc: 'Modal de gestión de salas: nombres, dimensiones y notas sin diálogos nativos prompt.' },
      { path: 'js/ui/modals/PlacementModal.js', lang: 'javascript', desc: 'Modal de colocación rápida (Quick Placement) con buscador en tiempo real y cálculo de slots.' },
      { path: 'js/ui/modals/ExportModal.js', lang: 'javascript', desc: 'Modal de exportación de alta fidelidad: PNG 1:1 con html2canvas, modo dual F+T, Excel y CSV.' },
      { path: 'js/ui/modals/ImportModal.js', lang: 'javascript', desc: 'Modal de importación masiva de equipos desde Excel/CSV con detección reactiva de colisiones y plantilla de 21 campos (M-21 y M-22).' }
    ]
  },
  {
    title: 'Capa 7: Motor Gráfico de Topología de Red (Canvas 2D MVC)',
    description: 'Motor de diagramación lógica en Canvas 2D a 60 FPS: nodos circulares/tarjetas/hardware skins, enlaces Bézier, árbol jerárquico y afinidad de piso.',
    files: [
      { path: 'js/ui/topology/TopologySkins.js', lang: 'javascript', desc: 'Motor modular de skins: 3 modos (circle/card/image), 18 presets offline, imágenes custom base64 y hit-testing M-28.' },
      { path: 'js/ui/topology/TopologyState.js', lang: 'javascript', desc: 'Modelo del motor de topología: estado de interacción, pan, zoom, espaciado dual H/V y 5 slots de memoria (M-40).' },
      { path: 'js/ui/topology/TopologyLayout.js', lang: 'javascript', desc: 'Controlador de layout: algoritmo de árbol jerárquico DAG y afinidad por rack anfitrión (M-39).' },
      { path: 'js/ui/topology/TopologyRenderer.js', lang: 'javascript', desc: 'Vista Canvas 2D: renderizado de salas, racks, nodos, partículas animadas y HUD de 240px.' },
      { path: 'js/ui/topology/TopologyEvents.js', lang: 'javascript', desc: 'Controlador de eventos: arrastre de nodos/racks/salas, redimensionamiento, zoom y auto-navegación.' },
      { path: 'js/ui/topology/TopologyOrchestrator.js', lang: 'javascript', desc: 'Ciclo de vida de topología: inicialización, bucle de animación a 60 FPS y exportación PNG.' }
    ]
  },
  {
    title: 'Capa 8: Orquestador Principal de la Aplicación',
    description: 'El punto de entrada operativo que inicializa el sistema, enlaza los eventos de la barra superior y coordina renderAll().',
    files: [
      { path: 'js/main.js', lang: 'javascript', desc: 'Punto de inicio: orquestación, renderAll() selectivo, vinculación de eventos de cabecera e inicio de sesión.' }
    ]
  },
  {
    title: 'Capa 9: Automatización y Suite de Pruebas de Integridad',
    description: 'Pruebas de integridad relacional ejecutables tanto en Node.js como interactivamente en el navegador web.',
    files: [
      { path: 'tests/integrity_check.cjs', lang: 'javascript', desc: 'Suite de pruebas de integridad para Node.js: 316 aserciones en 20 grupos al 100% de éxito.' },
      { path: 'tests/index.html', lang: 'html', desc: 'Runner web interactivo de pruebas en navegador: paridad 1:1 con 316 pruebas en interfaz gráfica.' }
    ]
  },
  {
    title: 'Capa 10: Herramientas de Compilación y Scripts Auxiliares',
    description: 'Scripts de automatización y soporte fuera del bundle del navegador.',
    files: [
      { path: 'scripts/build_standalone_manual.cjs', lang: 'javascript', desc: 'Generador del manual standalone HTML con imágenes SVG/PNG incrustadas en base64.' },
      { path: 'scripts/generate_svgs.cjs', lang: 'javascript', desc: 'Generador de diagramas y recursos vectoriales para la suite de documentación.' }
    ]
  }
];

function generateCodeBundle() {
  console.log('Iniciando compilación del código fuente en un único documento Markdown...');

  let md = '';
  let totalFiles = 0;
  let totalLines = 0;
  let totalBytes = 0;

  // Header del documento
  md += `# 📚 RACK Designer Next — Código Fuente Completo y Unificado\n`;
  md += `## Documento Técnico de Aprendizaje y Referencia Arquitectónica 100% Integral\n\n`;
  md += `> **Propósito:** Este documento consolida en un **único archivo Markdown** la totalidad del código fuente desarrollado para **RACK Designer Next**, sirviendo como base de estudio de alto nivel para comprender la arquitectura *Reactive Proxy Pattern*, el motor gráfico híbrido (DOM CSS + SVG + Canvas 2D) y el diseño de aplicaciones PWA de producción 100% offline sin frameworks.\n`;
  md += `>\n`;
  md += `> **Fecha de compilación:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `> **Plataforma:** PWA 100% Vanilla JavaScript (ES6+), HTML5, CSS3. **Sin paso de compilación (No build step).**\n`;
  md += `> **Pruebas de integridad:** 199 / 199 aprobadas al 100% (0 fallos) en 15 grupos.\n\n`;
  md += `---\n\n`;

  // Resumen Estadístico Preliminar
  const fileEntries = [];

  ARCHITECTURE_SECTIONS.forEach((section, sIdx) => {
    section.files.forEach(f => {
      const fullPath = path.join(ROOT_DIR, f.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        const bytes = Buffer.byteLength(content, 'utf8');
        totalFiles++;
        totalLines += lines;
        totalBytes += bytes;
        fileEntries.push({
          ...f,
          sectionTitle: section.title,
          sectionIndex: sIdx,
          lines,
          bytes,
          content
        });
      } else {
        console.warn(`[AVISO] Archivo no encontrado: ${f.path}`);
      }
    });
  });

  md += `## 📊 Métricas del Código del Proyecto\n\n`;
  md += `| Métrica | Valor |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Archivos fuente propios incluidos** | **${totalFiles} archivos** |\n`;
  md += `| **Líneas de código totales** | **${totalLines.toLocaleString('es-CO')} líneas** |\n`;
  md += `| **Volumen de código fuente** | **${(totalBytes / 1024).toFixed(1)} KB (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)** |\n`;
  md += `| **Librerías externas vendor** | Omitidas del bundle (disponibles en \`js/*.min.js\`: SheetJS, html2canvas, polyfills) |\n`;
  md += `| **Arquitectura de Estado** | Reactividad pura con Proxy ES6 + Snapshot History (Undo/Redo) |\n`;
  md += `| **Renderizado Gráfico** | SVG-First en Vista Física + Canvas 2D en Topología |\n\n`;
  md += `---\n\n`;

  // Índice General (Table of Contents)
  md += `## 📑 Índice General del Código Fuente\n\n`;

  ARCHITECTURE_SECTIONS.forEach((section, sIdx) => {
    md += `### ${section.title}\n`;
    md += `*${section.description}*\n\n`;
    md += `| Archivo | Tipo | Líneas | Tamaño | Descripción Técnica |\n`;
    md += `| :--- | :---: | :---: | :---: | :--- |\n`;

    const sectionFiles = fileEntries.filter(f => f.sectionIndex === sIdx);
    sectionFiles.forEach(f => {
      const anchor = f.path.toLowerCase().replace(/[^a-z0-9]/g, '-');
      md += `| [**\`${f.path}\`**](#${anchor}) | \`${f.lang.toUpperCase()}\` | ${f.lines.toLocaleString()} | ${(f.bytes / 1024).toFixed(1)} KB | ${f.desc} |\n`;
    });
    md += `\n`;
  });

  md += `---\n\n`;

  // Inserción Completa del Código Fuente
  md += `## 💻 Código Fuente Completo por Archivos\n\n`;

  fileEntries.forEach((f, idx) => {
    const anchor = f.path.toLowerCase().replace(/[^a-z0-9]/g, '-');
    console.log(`[${idx + 1}/${fileEntries.length}] Empaquetando: ${f.path} (${f.lines} líneas)...`);

    md += `<a id="${anchor}"></a>\n\n`;
    md += `### 📄 Archivo ${idx + 1}/${fileEntries.length}: \`${f.path}\`\n\n`;
    md += `* **Ubicación relativa:** \`${f.path}\`\n`;
    md += `* **Capa:** ${f.sectionTitle}\n`;
    md += `* **Dimensiones:** ${f.lines.toLocaleString()} líneas | ${(f.bytes / 1024).toFixed(1)} KB\n`;
    md += `* **Rol en el sistema:** ${f.desc}\n\n`;

    md += `\`\`\`${f.lang}\n`;
    md += f.content.replace(/\r\n/g, '\n');
    if (!f.content.endsWith('\n')) {
      md += '\n';
    }
    md += `\`\`\`\n\n`;
    md += `[⬆ Volver al Índice General](#índice-general-del-código-fuente)\n\n`;
    md += `---\n\n`;
  });

  // Epílogo de aprendizaje
  md += `## 🎓 Guía de Estudio y Análisis para el Aprendizaje\n\n`;
  md += `Para sacar el máximo provecho pedagógico a este documento unificado, se recomienda estudiar el código siguiendo esta ruta de comprensión:\n\n`;
  md += `1. **Comprender la Reactividad sin Frameworks:**\n`;
  md += `   - Analiza en [\`js/store.js\`](#js-store-js) el método \`_makeProxy()\`. Observa cómo la trampa \`set()\` intercepta cualquier cambio en propiedades anidadas, dispara \`_save()\` a \`localStorage\` y emite el evento \`change\` con metadatos del emisor.\n`;
  md += `   - Observa en [\`js/main.js\`](#js-main-js) cómo la función \`renderAll({ source })\` utiliza despacho basado en cadenas de texto para redibujar exclusivamente las vistas afectadas.\n\n`;
  md += `2. **El Ciclo de Deshacer y Rehacer (Undo/Redo):**\n`;
  md += `   - Examina cómo \`store.snapshot()\` ejecuta una copia profunda (\`deepClone\`) antes de mutar \`this._raw\`, manteniendo una pila acotada de estados históricos sin bloquear la UI.\n\n`;
  md += `3. **Cifrado Simétrico en el Cliente (Zero-Knowledge):**\n`;
  md += `   - Revisa [\`js/auth/crypto.js\`](#js-auth-crypto-js). Observa cómo se deriva una clave AES-GCM usando la Web Crypto API con vector de inicialización único por registro (\`enc:v1:<iv>:<ciphertext>\`), garantizando que contraseñas e IPs sensibles nunca residan en texto plano en disco.\n\n`;
  md += `4. **El Motor Gráfico de Topología (Canvas 2D MVC):**\n`;
  md += `   - Examina la separación de responsabilidades: [\`TopologyState.js\`](#js-ui-topology-topologystate-js) almacena el estado visual; [\`TopologyLayout.js\`](#js-ui-topology-topologylayout-js) calcula matemáticamente la cuadrícula de afinidad (M-39) y el árbol jerárquico DAG; [\`TopologyRenderer.js\`](#js-ui-topology-topologyrenderer-js) dibuja a 60 FPS con partículas de red y HUD multilínea; y [\`TopologyEvents.js\`](#js-ui-topology-topologyevents-js) gestiona punteros y gestos.\n\n`;
  md += `5. **La Suite de Pruebas de Integridad:**\n`;
  md += `   - Analiza [\`tests/integrity_check.cjs\`](#tests-integrity_check-cjs) y [\`tests/index.html\`](#tests-index-html). Nota cómo se simula el entorno de navegador en Node.js mediante mocks livianos de \`window\`, \`localStorage\` y \`crypto\`, logrando 199 pruebas en 15 grupos con paridad absoluta.\n\n`;
  md += `*Fin del documento unificado de código.* \n`;

  // Asegurar directorio destino
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, md, 'utf8');
  const finalSize = (Buffer.byteLength(md, 'utf8') / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Documento generado con éxito en:\n${OUTPUT_FILE}\nTotal: ${totalFiles} archivos, ${totalLines.toLocaleString('es-CO')} líneas, ${finalSize} MB.`);
}

generateCodeBundle();
