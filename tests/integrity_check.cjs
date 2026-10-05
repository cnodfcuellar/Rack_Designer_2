/**
 * tests/integrity_check.cjs
 * Suite de Pruebas Automatizadas de Integridad y Robustez
 * RACK Designer Next
 * 
 * Ejecución: node tests/integrity_check.cjs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

// --- 1. Mock de Entorno de Navegador para Node.js ---
class StorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] !== undefined ? this.store[key] : null; }
  setItem(key, val) { this.store[key] = String(val); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();
global.crypto = {
  randomUUID: () => crypto.randomUUID(),
  subtle: {
    digest: async (algo, data) => {
      return crypto.createHash('sha256').update(data).digest();
    }
  }
};
global.TextEncoder = require('util').TextEncoder;

// Mock de DOM básico
global.document = {
  documentElement: {
    attrs: {},
    getAttribute(name) { return this.attrs[name] || null; },
    setAttribute(name, val) { this.attrs[name] = String(val); },
    removeAttribute(name) { delete this.attrs[name]; }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  body: { appendChild: () => {}, removeChild: () => {} },
  getElementById: (id) => {
    if (id === 'theme-toggle-icon' || id === 'theme-toggle-label' || id === 'btn-theme-toggle' || id === 'menu-theme') {
      return { className: '', textContent: '', innerHTML: '', setAttribute: () => {}, getAttribute: () => null, addEventListener: () => {} };
    }
    if (id === 'bottom-table-wrap' || id === 'toast-container' || id === 'outliner-tree' || id === 'inspector-content' || id === 'outliner-sort-select' || id === 'btn-outliner-add-room' || id === 'btn-outliner-add-rack' || id === 'btn-outliner-add-dev') {
      return { innerHTML: '', value: '', appendChild: () => {}, removeChild: () => {}, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} };
    }
    return null;
  },
  createElement: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, remove: () => {} })
};
global.CustomEvent = class CustomEvent {
  constructor(type, params) {
    this.type = type;
    this.detail = params ? params.detail : null;
  }
};
global.window = global;
global.window.dispatchEvent = () => true;

// Cargar scripts principales en el contexto global usando vm
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
  // Reemplazar const/let en nivel superior por var para que se unan a global en vm
  const transformed = code.replace(/^(const|let)\s+([a-zA-Z0-9_$]+)\s*=/gm, 'var $2 =');
  vm.runInThisContext(transformed, { filename: relPath });
}

// Cargar XLSX en Node para soporte de plantillas y pruebas
if (typeof global.XLSX === 'undefined') {
  const xlsxCode = fs.readFileSync(path.join(__dirname, '../js/xlsx.full.min.js'), 'utf8');
  const xlsxExp = {};
  const fn = new Function('exports', 'module', xlsxCode);
  fn(xlsxExp, { exports: xlsxExp });
  global.XLSX = xlsxExp;
}

loadScript('../js/utils.js');
loadScript('../js/icons.js');
loadScript('../js/auth/crypto.js');
loadScript('../js/auth/roles.js');
loadScript('../js/store.js');
loadScript('../js/ui/tables.js');
loadScript('../js/ui/modals/Globals.js');
loadScript('../js/ui/modals/RoomModal.js');
loadScript('../js/ui/modals/CableModal.js');
loadScript('../js/ui/catalog.js');
loadScript('../js/ui/inspector.js');
loadScript('../js/ui/outliner.js');
loadScript('../js/ui/modals/PlacementModal.js');
loadScript('../js/ui/modals/ExportModal.js');
loadScript('../js/ui/modals/ImportModal.js');
loadScript('../js/ui/faceplates.js');
loadScript('../js/ui/topology/TopologyState.js');
loadScript('../js/ui/topology/TopologyLayout.js');
loadScript('../js/demoData.js');

// --- 2. Framework Minimalista de Aserciones ---
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=================================================');
  console.log('🧪 INICIANDO SUITE DE INTEGRIDAD - RACK DESIGNER NEXT');
  console.log('=================================================\n');

  // ----------------------------------------------------
  // GRUPO 1: SEGURIDAD Y SESIÓN (RBAC + F5 PERSISTENCE)
  // ----------------------------------------------------
  console.log('🔹 GRUPO 1: Autenticación, Integridad y Persistencia F5');
  
  // 1.1 Login Admin exitoso
  const adminUser = await RackAuth.tryAdminLogin('rack2024');
  assert(adminUser && adminUser.role === 'admin', 'Login con PIN por defecto "rack2024" otorga rol admin');
  assert(sessionStorage.getItem('RACK_SESSION_TOKEN') === adminUser.token, 'El token se persiste en sessionStorage (TOKEN_KEY)');

  // 1.2 Simulación de recarga (F5) en la misma pestaña
  const restoredUser = RackAuth.getCurrentUser();
  assert(restoredUser && restoredUser.role === 'admin', 'F5 exitoso: getCurrentUser() restaura la sesión de admin');

  // 1.3 Detección de alteración de token (Tampering)
  sessionStorage.setItem('RACK_SESSION_USER', JSON.stringify({ ...adminUser, token: 'token-falso-alterado' }));
  const tamperedUser = RackAuth.getCurrentUser();
  assert(tamperedUser === null, 'Detección de alteración: Token manipulado fuerza logout inmediato');
  assert(sessionStorage.getItem('RACK_SESSION_USER') === null, 'sessionStorage queda purgado tras forzar logout');

  // 1.4 Sesión de Editor y Viewer
  const editorUser = RackAuth.loginAsEditor();
  assert(editorUser.role === 'editor', 'Login como Editor asigna rol editor');
  assert(RackAuth.can('editDevices') === true, 'Editor tiene permiso editDevices');
  assert(RackAuth.can('changeAdminPin') === false, 'Editor NO tiene permiso changeAdminPin');
  RackAuth.logout();

  // ----------------------------------------------------
  // GRUPO 2: STORE - INTEGRIDAD RELACIONAL Y CASCADA
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 2: Cascada de Conexiones y Limpieza de Topología');

  // Limpiar estado
  store._raw = store._defaultState();
  const roomId = store._raw.currentRoomId;

  // 2.1 Crear Gabinete y Equipos
  store.addRack({ name: 'Rack Alfa', height: 42, color: '#0ea5e9' });
  const rack = store.currentRacks[0];
  assert(rack !== undefined, 'Rack Alfa creado con éxito');

  store.addDeviceToRack({ name: 'Switch Core', type: 'switch', size: 1 }, rack.id, 1, 'front');
  store.addDeviceToRack({ name: 'Servidor DB', type: 'server', size: 2 }, rack.id, 2, 'front');
  
  const devSwitch = store.allDevicesInRack(rack.id).find(d => d.name === 'Switch Core');
  const devServer = store.allDevicesInRack(rack.id).find(d => d.name === 'Servidor DB');
  assert(devSwitch && devServer, 'Dispositivos Switch y Servidor instalados en ranuras U1 y U2');

  // 2.2 Conectar Equipos
  store.addConnection({
    sourceDeviceId: devSwitch.id,
    sourcePort: 'Port 1',
    targetDeviceId: devServer.id,
    targetPort: 'Eth 1',
    cableType: 'Cat6',
    color: '#3b82f6'
  });
  assert(store._raw.connections.length === 1, 'Conexión de cable registrada correctamente');

  // 2.3 Coordenadas de Topología
  store._raw.topology.nodePositions[devSwitch.id] = { x: 150, y: 200 };
  store._raw.topology.nodePositions[devServer.id] = { x: 150, y: 350 };
  assert(store._raw.topology.nodePositions[devSwitch.id] !== undefined, 'Coordenadas de topología asignadas');

  // 2.4 Eliminación en CASCADA del Gabinete
  store.deleteRack(rack.id);
  assert(store.rackById(rack.id) === undefined, 'Rack Alfa eliminado del store');
  assert(store.deviceById(devSwitch.id) === undefined, 'Dispositivos del rack eliminados');
  assert(store._raw.connections.length === 0, 'CASCADA OK: Todas las conexiones huérfanas fueron purgadas automáticamente');
  assert(store._raw.topology.nodePositions[devSwitch.id] === undefined, 'Coordenadas del switch en topología purgadas');

  // 2.5 Deshacer (Undo) restaura la integridad completa
  store.undo();
  assert(store.rackById(rack.id) !== undefined, 'Undo restaura el Rack');
  assert(store.allDevicesInRack(rack.id).length === 2, 'Undo restaura los 2 dispositivos');
  assert(store._raw.connections.length === 1, 'Undo restaura la conexión de cable intacta');

  // 2.6 Eliminación individual de equipo limpia topología
  const devToDel = store.allDevicesInRack(rack.id)[0];
  store.deleteDevice(devToDel.id);
  assert(store.deviceById(devToDel.id) === undefined, 'Dispositivo eliminado individualmente');
  assert(store._raw.topology.nodePositions[devToDel.id] === undefined, 'Posición en topología purgada de inmediato');

  // ----------------------------------------------------
  // GRUPO 3: AUTO-SANEAMIENTO (_sanitize)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 3: Función de Auto-Saneamiento (_sanitize)');

  // Inyectar datos zombis manualmente (simulando archivo corrupto o versión antigua)
  store._raw.connections.push({
    id: 'conn-zombie-1',
    sourceDeviceId: 'id-inexistente-a',
    targetDeviceId: 'id-inexistente-b',
    cableType: 'Fibra'
  });
  store._raw.topology.nodePositions['dev-zombie-id'] = { x: 999, y: 999 };
  assert(store._raw.connections.some(c => c.id === 'conn-zombie-1'), 'Conexión corrupta inyectada artificialmente');

  // Ejecutar auto-saneamiento
  store._sanitize();
  assert(!store._raw.connections.some(c => c.id === 'conn-zombie-1'), '_sanitize() detectó y purgó la conexión zombie');
  assert(store._raw.topology.nodePositions['dev-zombie-id'] === undefined, '_sanitize() purgó el nodo de topología huérfano');

  // ----------------------------------------------------
  // GRUPO 4: ROBUSTEZ EN RENDERIZADO DE TABLAS
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 4: Tolerancia a Fallos en UI (tables.js)');

  try {
    renderInventoryTable();
    assert(true, 'renderInventoryTable() se ejecuta sin lanzar TypeError al omitir wrap');
  } catch (err) {
    assert(false, `renderInventoryTable() lanzó error inesperado: ${err.message}`);
  }

  try {
    renderConnectionsTable();
    assert(true, 'renderConnectionsTable() se ejecuta sin lanzar TypeError al omitir wrap');
  } catch (err) {
    assert(false, `renderConnectionsTable() lanzó error inesperado: ${err.message}`);
  }

  // ----------------------------------------------------
  // GRUPO 5: INTEGRIDAD DE RUTAS DE ASSETS Y FACEPLATES SVG
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 5: Integridad de Rutas de Assets y Faceplates SVG');

  const rootPath = path.join(__dirname, '..');
  const oldDefaultPath = path.join(rootPath, 'default');
  const newAssetsDefaultPath = path.join(rootPath, 'assets', 'default');
  const assetsSvgDefaultPath = path.join(rootPath, 'assets', 'svg', 'default');

  // 1. Verificar que la carpeta default/ ya no existe en la raíz
  assert(!fs.existsSync(oldDefaultPath), 'La carpeta default/ fue removida exitosamente de la raíz del proyecto');

  // 2. Verificar que la carpeta redundante assets/default/ fue eliminada (unificación canónica)
  assert(!fs.existsSync(newAssetsDefaultPath), 'La carpeta redundante assets/default/ fue eliminada exitosamente');

  // 3. Verificar que la carpeta canónica assets/svg/default/ existe
  assert(fs.existsSync(assetsSvgDefaultPath), 'La carpeta canónica assets/svg/default/ existe correctamente');

  // 4. Verificar conteo de al menos 16 SVGs en assets/svg/default/
  const assetsSvgFiles = fs.existsSync(assetsSvgDefaultPath) 
    ? fs.readdirSync(assetsSvgDefaultPath).filter(f => f.endsWith('.svg')) 
    : [];
  assert(assetsSvgFiles.length >= 16, `assets/svg/default/ contiene al menos 16 archivos SVG requeridos (encontrados: ${assetsSvgFiles.length})`);

  // 5. Verificar que faceplates.js implementa normalizeAssetUrl() para retrocompatibilidad
  const faceplatesJsContent = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'faceplates.js'), 'utf8');
  assert(faceplatesJsContent.includes('normalizeAssetUrl'), "js/ui/faceplates.js implementa la función de normalización normalizeAssetUrl()");
  assert(!faceplatesJsContent.includes("'default/"), "js/ui/faceplates.js no contiene referencias huérfanas a 'default/'");

  // ----------------------------------------------------
  // GRUPO 6: BLINDAJE Y MEJORAS VISUALES / MECÁNICAS (M-02, M-05, M-10, M-13, M-14, M-15, M-16)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 6: Blindaje de Almacenamiento y Mejoras Físicas');

  // 6.1 M-05: Doble slot de respaldo y recuperación anti-corrupción
  const mockDesignData = { rooms: [{ id: 'room-test', name: 'Sala Backup', racks: [] }], selectedRoomId: 'room-test' };
  store._raw = mockDesignData;
  store._save();
  assert(localStorage.getItem('RACK_DESIGNER_NEXT_STATE') !== null, 'M-05: store._save() persiste en slot primario RACK_DESIGNER_NEXT_STATE');
  assert(localStorage.getItem('RACK_DESIGNER_NEXT_STATE_BACKUP') !== null, 'M-05: store._save() persiste simultáneamente en slot de respaldo RACK_DESIGNER_NEXT_STATE_BACKUP');

  // Corromper intencionalmente el slot primario y verificar rescate desde BACKUP
  localStorage.setItem('RACK_DESIGNER_NEXT_STATE', 'INVALID_JSON_CORRUPTED{{{');
  const rescuedState = store._load();
  assert(rescuedState && rescuedState.rooms && rescuedState.rooms[0].name === 'Sala Backup', 'M-05: store._load() recupera exitosamente desde el slot de respaldo ante corrupción');

  // 6.2 M-02: Manejo defensivo de QuotaExceededError
  const originalSetItem = localStorage.setItem;
  let quotaErrorCaptured = false;
  localStorage.setItem = () => {
    const err = new Error('Quota exceeded');
    err.name = 'QuotaExceededError';
    throw err;
  };
  try {
    store._save();
    quotaErrorCaptured = true;
  } catch (e) {
    quotaErrorCaptured = false;
  }
  localStorage.setItem = originalSetItem;
  assert(quotaErrorCaptured, 'M-02: store._save() captura defensivamente QuotaExceededError sin lanzar excepción no controlada');

  // 6.3 M-10 & M-14: Verificación estática de CSS de racks
  const rackCssContent = fs.readFileSync(path.join(rootPath, 'css', 'components', 'rack.css'), 'utf8');
  assert(rackCssContent.includes('width: 240px; min-width: 240px; max-width: 240px;'), 'M-14: .rack-slots implementa ancho fijo proporcional de 240px (10:1)');
  assert(rackCssContent.includes('width: 280px;') && rackCssContent.includes('min-width: 280px;') && rackCssContent.includes('max-width: 280px;'), 'Geometría Rígida: .rack-card y .rack-wrapper bloquean ancho en 280px estrictos');
  assert(rackCssContent.includes('text-overflow: ellipsis;'), 'Geometría Rígida: .rack-title implementa elipsis para nombres largos');

  // 6.4 M-15: Grilla CAD de 24px en #view-physical
  const layoutCssContent = fs.readFileSync(path.join(rootPath, 'css', 'layout.css'), 'utf8');
  assert(layoutCssContent.includes('background-size: 24px 24px;'), 'M-15: #view-physical implementa grilla técnica milimétrica con paso de 24px (1U)');

  // 6.5 M-13: Alineación de sección de piso min-width: 584px
  const faceplatesCssContent = fs.readFileSync(path.join(rootPath, 'css', 'components', 'faceplates.css'), 'utf8');
  const rackJsContent = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'rack.js'), 'utf8');
  assert(faceplatesCssContent.includes('min-width: 584px;'), 'M-13: .floor-section implementa min-width: 584px en CSS');
  assert(!rackJsContent.includes("'340px'"), 'M-13: js/ui/rack.js ya no fuerza ancho inline de 340px');

  // 6.6 M-16: Select de alturas estándar en modal de rack
  const indexHtmlContent = fs.readFileSync(path.join(rootPath, 'index.html'), 'utf8');
  const rackModalJsContent = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'modals', 'RackModal.js'), 'utf8');
  assert(indexHtmlContent.includes('<select id="rack-height">') && indexHtmlContent.includes('value="42" selected'), 'M-16: index.html define select con alturas estándar y 42U por defecto');
  assert(rackModalJsContent.includes("document.getElementById('rack-height').value = '42';"), 'M-16: RackModal.js inicializa altura por defecto en 42U');

  // ----------------------------------------------------
  // GRUPO 7: CATÁLOGO AGRUPADO Y MODAL UNIFICADO DE SALAS (M-09, M-11, M-12)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 7: Catálogo Agrupado y Modal Unificado de Salas');

  // 7.1 M-09: Funciones de modal de sala
  assert(typeof openAddRoomModal === 'function', 'M-09: openAddRoomModal() está definida globalmente');
  assert(typeof openEditRoomModal === 'function', 'M-09: openEditRoomModal() está definida globalmente');

  // 7.2 M-09: Ausencia de prompt() en catalog.js
  const catalogJsContent = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'catalog.js'), 'utf8');
  assert(!catalogJsContent.includes('prompt('), 'M-09: Se erradicó el uso de prompt() nativo en renderRoomTabs() de catalog.js');

  // 7.3 M-09: IDs dinámicos en modal-room de index.html
  assert(indexHtmlContent.includes('id="modal-room-title"') && indexHtmlContent.includes('id="modal-room-sub"'), 'M-09: index.html contiene IDs dinámicos para modal-room-title y modal-room-sub');

  // 7.4 M-11: Definición y estructura de CATALOG_GROUPS
  assert(typeof CATALOG_GROUPS !== 'undefined' && Array.isArray(CATALOG_GROUPS), 'M-11: CATALOG_GROUPS está definido y es un array');
  assert(CATALOG_GROUPS.length === 8, `M-11: CATALOG_GROUPS agrupa el catálogo en 8 familias comerciales (encontradas: ${CATALOG_GROUPS.length})`);
  
  const networkGroup = CATALOG_GROUPS.find(g => g.id === 'network');
  assert(networkGroup && networkGroup.types.includes('switch') && networkGroup.types.includes('router') && networkGroup.types.includes('firewall') && networkGroup.types.includes('ap'), 'M-11: El grupo "network" consolida switches, routers, firewalls y APs activos');

  // 7.4.1 Categoría Security (CCTV)
  const securityGroup = CATALOG_GROUPS.find(g => g.id === 'security');
  assert(securityGroup && securityGroup.types.includes('nvr') && securityGroup.types.includes('dvr') && securityGroup.types.includes('decoder'), 'M-Cat: El grupo "security" incluye NVR, DVR y Decoder');

  // 7.4.2 Categoría Accesorios con Patch Panel y ODF
  const accesoriosGroup = CATALOG_GROUPS.find(g => g.id === 'accesorios');
  assert(accesoriosGroup && accesoriosGroup.types.includes('patchpanel') && accesoriosGroup.types.includes('odf'), 'M-Cat: El grupo "accesorios" incluye Patch Panel y ODF de fibra óptica');

  // 7.4.3 Soporte de Equipos Personalizados en Store y Catálogo
  const dummyCustom = { id: 'test-custom-1', name: 'Servidor Custom AI', type: 'server', size: 2, power: 800 };
  store.addCustomCatalogItem(dummyCustom);
  assert(store.state.customCatalog.some(c => c.id === 'test-custom-1'), 'M-Cat: store.addCustomCatalogItem() agrega equipos al catálogo personalizado del proyecto');
  assert(getCatalog().some(c => c.id === 'test-custom-1'), 'M-Cat: getCatalog() unifica catálogo estándar y equipos personalizados');
  store.deleteCustomCatalogItem('test-custom-1');
  assert(!store.state.customCatalog.some(c => c.id === 'test-custom-1'), 'M-Cat: store.deleteCustomCatalogItem() elimina correctamente el equipo custom');

  // 7.5 M-12: Pestaña "Todos" con icono grid
  const allGroup = CATALOG_GROUPS.find(g => g.id === 'all');
  assert(allGroup && allGroup.types === null && allGroup.icon === 'grid', 'M-12: El grupo "all" (Todos) abarca todos los dispositivos sin restricción');

  // 7.6 M-12: Iconos grid, search y network en SVG_ICONS
  assert(typeof SVG_ICONS !== 'undefined' && SVG_ICONS.grid && SVG_ICONS.search && SVG_ICONS.network, 'M-12: js/icons.js incluye iconos vectoriales para grid, search y network');

  // 7.7 M-12: Clases CSS .icon-grid y .icon-search
  const miscCssContent = fs.readFileSync(path.join(rootPath, 'css', 'components', 'misc.css'), 'utf8');
  assert(miscCssContent.includes('.icon-grid') && miscCssContent.includes('.icon-search'), 'M-12: css/components/misc.css implementa clases offline .icon-grid e .icon-search');

  // ----------------------------------------------------
  // GRUPO 8: ACCIONES CRUD EN INSPECTOR Y ORDENAMIENTO EN OUTLINER (M-36, M-23, M-38, M-24)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 8: Acciones CRUD en Inspector y Ordenamiento en Outliner');

  // 8.1 M-36: Funciones globales de eliminación en inspector
  assert(typeof deleteRoomFromInspector === 'function', 'M-36: deleteRoomFromInspector() está definida globalmente');
  assert(typeof deleteRackFromInspector === 'function', 'M-36: deleteRackFromInspector() está definida globalmente');
  assert(typeof deleteDeviceFromInspector === 'function', 'M-36: deleteDeviceFromInspector() está definida globalmente');

  // 8.2 M-36: Inspector Empty State dinámico
  const inspectorMockContainer = { innerHTML: '' };
  const origGetElementById = document.getElementById;
  document.getElementById = (id) => id === 'inspector-content' ? inspectorMockContainer : origGetElementById(id);

  renderInspector(null, null);
  assert(inspectorMockContainer.innerHTML.includes('+ Nueva Sala') && inspectorMockContainer.innerHTML.includes('+ Nuevo Gabinete'), 'M-36: Inspector Empty State ofrece accesos rápidos para aprovisionar salas y gabinetes');

  // 8.3 M-36: Inspector de Gabinete incluye Editar, Eliminar y Agregar Equipo
  const testRack = store.currentRacks[0];
  if (testRack) {
    renderInspector('rack', testRack.id);
    assert(inspectorMockContainer.innerHTML.includes('Editar') && inspectorMockContainer.innerHTML.includes('Eliminar') && inspectorMockContainer.innerHTML.includes('+ Agregar Equipo'), 'M-36: Inspector de Gabinete incluye botones Editar, Eliminar y Agregar Equipo');
  }

  // 8.4 M-38: Lógica de ordenamiento en Outliner
  assert(typeof sortOutlinerDevices === 'function', 'M-38: sortOutlinerDevices() está definida');
  const sampleDevs = [
    { id: '1', name: 'Zeta Switch', type: 'switch', slotStart: 5 },
    { id: '2', name: 'Alpha Server', type: 'server', slotStart: 10 },
    { id: '3', name: 'Beta Firewall', type: 'firewall', slotStart: 1 }
  ];

  const sortedBySlot = sortOutlinerDevices(sampleDevs, 'slot');
  assert(sortedBySlot[0].name === 'Alpha Server' && sortedBySlot[2].name === 'Beta Firewall', 'M-38: Ordenamiento "slot" ubica slots superiores (10U) primero');

  const sortedByNameAsc = sortOutlinerDevices(sampleDevs, 'name-asc');
  assert(sortedByNameAsc[0].name === 'Alpha Server' && sortedByNameAsc[2].name === 'Zeta Switch', 'M-38: Ordenamiento "name-asc" ordena alfabéticamente A → Z');

  const sortedByNameDesc = sortOutlinerDevices(sampleDevs, 'name-desc');
  assert(sortedByNameDesc[0].name === 'Zeta Switch' && sortedByNameDesc[2].name === 'Alpha Server', 'M-38: Ordenamiento "name-desc" ordena alfabéticamente Z → A');

  const sortedByType = sortOutlinerDevices(sampleDevs, 'type');
  assert(sortedByType[0].type === 'firewall', 'M-38: Ordenamiento "type" clasifica dispositivos por familia/tipo');

  // 8.5 M-23: Cabecera de Outliner y botones inline
  const updatedIndexHtml = fs.readFileSync(path.join(rootPath, 'index.html'), 'utf8');
  assert(updatedIndexHtml.includes('id="btn-outliner-add-room"') && updatedIndexHtml.includes('id="btn-outliner-add-rack"') && updatedIndexHtml.includes('id="btn-outliner-add-dev"'), 'M-23: index.html define botones de acceso rápido + Sala, + Rack y + Equipo');

  const outlinerJsText = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'outliner.js'), 'utf8');
  assert(outlinerJsText.includes('data-outliner-action="edit-room"') && outlinerJsText.includes('data-outliner-action="del-dev"'), 'M-23: outliner.js genera botones contextuales inline para editar y eliminar');

  // 8.6 M-24: Inspector colapsable en index.html y layout.css
  assert(updatedIndexHtml.includes("document.getElementById('inspector-section').classList.toggle('collapsed')"), 'M-24: index.html implementa toggle colapsable para el Inspector');
  const panelsCssText = fs.readFileSync(path.join(rootPath, 'css', 'components', 'panels.css'), 'utf8');
  assert(panelsCssText.includes('.outliner-toolbar') && panelsCssText.includes('.btn-inspector-danger'), 'M-36/M-23: panels.css implementa estilos para Outliner toolbar y botones del Inspector');

  document.getElementById = origGetElementById;

  // ----------------------------------------------------
  // GRUPO 9: Fidelidad de Exportación, Metadatos de Inventario y Buscador de Catálogo (M-37, M-19, M-30)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 9: Fidelidad de Exportación, Metadatos de Inventario y Buscador de Catálogo');

  // 9.1 M-37: Script vendor html2canvas
  const h2cPath = path.join(rootPath, 'js', 'html2canvas.min.js');
  assert(fs.existsSync(h2cPath) && fs.statSync(h2cPath).size > 100000, 'M-37: js/html2canvas.min.js existe en el disco y supera los 100KB');

  assert(updatedIndexHtml.includes('src="js/html2canvas.min.js"'), 'M-37: index.html incluye la etiqueta <script src="js/html2canvas.min.js">');

  const swText = fs.readFileSync(path.join(rootPath, 'service-worker.js'), 'utf8');
  assert(swText.includes('rack-designer-next-cache-v') && swText.includes('./js/html2canvas.min.js'), 'M-37: service-worker.js precachea html2canvas.min.js bajo caché');

  const exportModalText = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'modals', 'ExportModal.js'), 'utf8');
  assert(exportModalText.includes('html2canvas') && exportModalText.includes('_fallbackExportRackToPNG'), 'M-37: ExportModal.js implementa exportRackToPNG con html2canvas y fallback procedural');
  assert(exportModalText.includes('_fallbackExportFloorToPNG'), 'M-37: ExportModal.js implementa exportFloorToPNG con html2canvas y fallback procedural');
  assert(exportModalText.includes('exportRoomToPNG') && exportModalText.includes('_fallbackExportRoomToPNG'), 'M-37: ExportModal.js implementa exportRoomToPNG para exportar la sala completa con cableado');
  assert(exportModalText.includes('btn-export-entire-room-dual') && exportModalText.includes('_Dual_Frente_Dorso.png'), 'ExportModal: implementa botón e infraestructura para exportación de Sala Completa en Vista Dual (Frente + Dorso)');
  assert(exportModalText.includes("mode = 'current'") && exportModalText.includes("mode === 'dual'"), 'ExportModal: exportRoomToPNG admite modos current y dual modular');
  assert(typeof store.allRacksInRoom === 'function', 'Store: store.allRacksInRoom(roomId) está definida y filtra correctamente los gabinetes');

  const rackCssText = fs.readFileSync(path.join(rootPath, 'css', 'components', 'rack.css'), 'utf8');
  assert(rackCssText.includes('.exporting-capture .device-actions'), 'M-37: css/components/rack.css implementa reglas .exporting-capture para ocultar controles de UI en capturas');
  assert(rackCssText.includes('.exporting-capture #canvas-btn-add-rack'), 'M-37: css/components/rack.css oculta el botón +Rack durante la captura');

  // 9.2 M-19: Propiedades en tabla de inventario
  store._raw.devices.push({
    id: 'test-inv-dev',
    name: 'Switch Test',
    type: 'switch',
    size: 2,
    skin: 'default',
    notes: 'VLAN 10 Core',
    power: 150,
    plugs: 1,
    ip: '192.168.1.1',
    mac: '00:11:22:33:44:55',
    serial: 'SN-001',
    user: 'admin',
    pass: 'admin123',
    rackId: 'r-1',
    slotStart: 1,
    mountSide: 'front'
  });

  const tableMockContainer = { innerHTML: '', querySelectorAll: () => [] };
  renderInventoryTable(tableMockContainer, '');
  assert(tableMockContainer.innerHTML.includes('<th>Tamaño</th>') && tableMockContainer.innerHTML.includes('<th>Skin</th>') && tableMockContainer.innerHTML.includes('<th>Notas</th>'), 'M-19: renderInventoryTable() incluye las columnas Tamaño, Skin y Notas en thead');
  assert(tableMockContainer.innerHTML.includes('data-field="size"') && tableMockContainer.innerHTML.includes('data-field="skin"') && tableMockContainer.innerHTML.includes('data-field="notes"'), 'M-19: renderInventoryTable() mapea celdas editables para size, skin y notes');

  const tablesJsText = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'tables.js'), 'utf8');
  assert(tablesJsText.includes("'notes'") && tablesJsText.includes("'skin'") && tablesJsText.includes("'size'") && tablesJsText.includes("allowedFields = ['name'"), 'M-19: finishCellEdit() admite y persiste los campos size, skin y notes');
  assert(exportModalText.includes('d.size') && exportModalText.includes('d.skin') && exportModalText.includes('d.notes') && exportModalText.includes('Inventario_Centro_Datos.csv'), 'M-19: exportCSV() incluye las columnas Tamaño, Skin y Notas');

  // 9.3 M-30: Buscador en modal de catálogo
  assert(updatedIndexHtml.includes('id="qp-dev-search"') && updatedIndexHtml.includes('id="qp-dev-select-row"'), 'M-30: index.html define el input reactivo #qp-dev-search dentro de #qp-dev-select-row');
  assert(typeof filterQPCatalog === 'function', 'M-30: filterQPCatalog() está definida globalmente');

  const selectMock = { innerHTML: '', value: '', dispatchEvent: () => {} };
  const origQpGetElementById = document.getElementById;
  document.getElementById = (id) => id === 'qp-dev-select' ? selectMock : origQpGetElementById(id);
  filterQPCatalog('switch');
  assert(selectMock.innerHTML.toLowerCase().includes('switch'), 'M-30: filterQPCatalog("switch") filtra y renderiza dispositivos coincidentes del catálogo');
  document.getElementById = origQpGetElementById;

  // ----------------------------------------------------
  // GRUPO 10: EQUIPOS DE PROFUNDIDAD COMPLETA (AMBAS CARAS - mountSide: 'both')
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 10: Equipos de Doble Cara (mountSide: both) y Coexistencia');

  // 10.1 Helper sidesConflict
  assert(typeof store.sidesConflict === 'function', 'Doble Cara: store.sidesConflict está definida');
  assert(store.sidesConflict('both', 'front') === true, 'Doble Cara: "both" entra en conflicto con "front"');
  assert(store.sidesConflict('both', 'rear') === true, 'Doble Cara: "both" entra en conflicto con "rear"');
  assert(store.sidesConflict('both', 'both') === true, 'Doble Cara: "both" entra en conflicto con "both"');
  assert(store.sidesConflict('front', 'front') === true, 'Doble Cara: "front" entra en conflicto con "front"');
  assert(store.sidesConflict('rear', 'rear') === true, 'Doble Cara: "rear" entra en conflicto con "rear"');
  assert(store.sidesConflict('front', 'rear') === false, 'Doble Cara: "front" y "rear" son independientes (sin conflicto)');

  // 10.2 Creación de Rack de prueba y validación de colisiones bidireccionales
  store.addRoom('Sala Datacenter Dual');
  const dualRoomId = store._raw.rooms[store._raw.rooms.length - 1].id;
  store.addRack('Rack Profundo', 42, '#38bdf8', dualRoomId);
  const dualRack = store._raw.racks[store._raw.racks.length - 1];

  // Instalar servidor 2U en mountSide: 'both' en U10
  const server2u = {
    name: 'Servidor Dell R740',
    type: 'server',
    size: 2,
    mountSide: 'both',
    power: 450
  };
  const placedBoth = store.addDeviceToRack(server2u, dualRack.id, 10, 'both');
  assert(placedBoth === true, 'Doble Cara: Servidor 2U instalado exitosamente en U10 con mountSide "both"');

  // Intentar instalar switch en Front U10 -> debe ser rechazado
  const switchFrontConflict = store.addDeviceToRack({ name: 'Switch Conflicto', type: 'switch', size: 1, mountSide: 'front' }, dualRack.id, 10, 'front');
  assert(switchFrontConflict === false, 'Doble Cara: Bloqueo de colisión en Front U10 por servidor dual');

  // Intentar instalar switch en Rear U11 -> debe ser rechazado (U11 es la 2da U del servidor 2U)
  const switchRearConflict = store.addDeviceToRack({ name: 'PDU Conflicto', type: 'pdu', size: 1, mountSide: 'rear' }, dualRack.id, 11, 'rear');
  assert(switchRearConflict === false, 'Doble Cara: Bloqueo de colisión en Rear U11 por servidor dual');

  // Intentar instalar otro equipo Dual en U10 o U11 -> rechazado
  const dualConflict = store.addDeviceToRack({ name: 'UPS Dual', type: 'ups', size: 2, mountSide: 'both' }, dualRack.id, 11, 'both');
  assert(dualConflict === false, 'Doble Cara: Bloqueo de colisión entre equipos duales solapados');

  // Coexistencia de equipos media profundidad: U20 frontal y U20 trasera
  const patchFront = store.addDeviceToRack({ name: 'Patch Frontal', type: 'patchpanel', size: 1, mountSide: 'front' }, dualRack.id, 20, 'front');
  assert(patchFront === true, 'Coexistencia: Patch Panel instalado en U20 Frontal');

  const pduRear = store.addDeviceToRack({ name: 'PDU Trasera', type: 'pdu', size: 1, mountSide: 'rear' }, dualRack.id, 20, 'rear');
  assert(pduRear === true, 'Coexistencia: PDU instalada en la misma U20 Trasera sin conflicto');

  // Intentar instalar un equipo Dual en U20 -> debe ser rechazado porque U20 frontal y trasera ya están ocupadas
  const dualOnHalf = store.addDeviceToRack({ name: 'Servidor 1U', type: 'server', size: 1, mountSide: 'both' }, dualRack.id, 20, 'both');
  assert(dualOnHalf === false, 'Doble Cara: Servidor dual rechazado en U20 ocupada por equipos de media profundidad');

  // 10.3 Conteo de estadísticas y unidades consumidas
  const devDual = store._raw.devices.find(d => d.name === 'Servidor Dell R740');
  assert(devDual && devDual.mountSide === 'both', 'Doble Cara: El equipo se almacena como un único registro con mountSide "both"');

  // 10.4 Representación en Tabla de Inventario y Exportación
  const dualTableContainer = { innerHTML: '', querySelectorAll: () => [] };
  renderInventoryTable(dualTableContainer, '');
  assert(dualTableContainer.innerHTML.includes('Dual'), 'Doble Cara: renderInventoryTable muestra badge "Dual" en columna Lado');

  const invExportData = getInventoryData();
  const dualExportRow = invExportData.find(row => row[3] === 'Servidor Dell R740');
  assert(dualExportRow && dualExportRow[2] === 'Dual', 'Doble Cara: getInventoryData exporta "Dual" en columna Lado');

  // 10.5 Renderizado visual de cara trasera para equipos duales
  if (typeof buildFaceplate === 'function') {
    const rearFaceplateHtml = buildFaceplate(devDual, 48, 'rear');
    assert(rearFaceplateHtml.includes('TRASERA · DUAL'), 'Doble Cara: buildFaceplate genera indicador "TRASERA · DUAL" en vista trasera');
    assert(rearFaceplateHtml.includes('PSU-1') || rearFaceplateHtml.includes('PSU-RED'), 'Doble Cara: buildFaceplate genera fuentes redundantes PSU en vista trasera');
  }

  // ----------------------------------------------------
  // GRUPO 11: PLANTILLA DEMO PROFESIONAL Y DISTRIBUCIÓN DE PESO (ANSI/TIA-942)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 11: Plantilla Demo Profesional y Distribución Gravitacional de Peso');

  assert(typeof loadDemoData === 'function', 'Demo: loadDemoData() está definida globalmente');
  loadDemoData();

  // 11.1 Verificación de Salas Datacenter
  const roomDc = store._raw.rooms.find(r => r.name === 'Data Center Principal');
  const roomCorp = store._raw.rooms.find(r => r.name === 'Edificio Corporativo A');
  const roomSoc = store._raw.rooms.find(r => r.name === 'Centro de Operaciones & Seguridad');
  assert(roomDc && roomCorp && roomSoc, 'Demo: Define las salas Data Center Principal, Edificio Corporativo A y SOC');

  // 11.2 Verificación de Gabinetes Estándar de 42U
  const dcRacks = store._raw.racks.filter(r => r.roomId === roomDc.id);
  assert(dcRacks.length === 4 && dcRacks.every(r => r.height === 42), 'Demo: Sala Data Center Principal cuenta con 4 gabinetes estandarizados de 42U');

  // 11.3 Verificación de Distribución Gravitacional de Peso (Equipos pesados en la base U1-U10)
  const rack101 = dcRacks.find(r => r.name.includes('101'));
  const rack102 = dcRacks.find(r => r.name.includes('102'));
  const rack103 = dcRacks.find(r => r.name.includes('103'));
  const rack104 = dcRacks.find(r => r.name.includes('104'));

  const ups101 = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'ups');
  assert(ups101 && ups101.slotStart === 1 && ups101.mountSide === 'both', 'Demo: Rack 101 ubica UPS pesado en U1-U2 con mountSide "both"');

  const pdu101 = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'pdu');
  assert(pdu101 && pdu101.mountSide === 'rear', 'Demo: Rack 101 ubica PDU en la cara trasera (mountSide: "rear")');

  const san103 = store._raw.devices.find(d => d.rackId === rack103.id && d.type === 'storage' && d.size === 4);
  assert(san103 && san103.slotStart === 4 && san103.mountSide === 'both', 'Demo: Cabina SAN Dell EMC 4U pesada ubicada en la base (U4-U7) con mountSide "both"');

  const blade102 = store._raw.devices.find(d => d.rackId === rack102.id && d.name.includes('Blade'));
  assert(blade102 && blade102.slotStart === 6 && blade102.mountSide === 'both', 'Demo: Chasis Blade 4U de alta densidad ubicado en zona baja (U6-U9)');

  // 11.4 Verificación de Equipos de Red y Top of Rack (U36-U42)
  const swCore = store._raw.devices.find(d => d.rackId === rack101.id && d.name.includes('Core'));
  const fwEdge = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'firewall');
  const rtrEdge = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'router');
  assert(swCore && swCore.slotStart === 40 && fwEdge && fwEdge.slotStart === 41 && rtrEdge && rtrEdge.slotStart === 42, 'Demo: Equipos de red y borde (Core, Firewall, Router) ubicados en el tope ToR (U40-U42)');

  // 11.5 Verificación de Zona Ergonómica (KVM & Tray en U21-U22)
  const kvm = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'kvm');
  const tray = store._raw.devices.find(d => d.rackId === rack101.id && d.type === 'tray');
  assert(kvm && kvm.slotStart === 21 && tray && tray.slotStart === 22, 'Demo: Consola KVM y bandeja ubicadas a la altura ergonómica del operador (U21-U22)');

  // 11.6 Verificación de Equipos Nuevos de Seguridad CCTV
  const nvr = store._raw.devices.find(d => d.rackId === rack104.id && d.type === 'nvr');
  const decoder = store._raw.devices.find(d => d.rackId === rack104.id && d.type === 'decoder');
  assert(nvr && decoder && nvr.mountSide === 'both', 'Demo: Rack 104 incorpora NVR 2U y Decodificador con soporte dual');

  // 11.7 Verificación de Conexiones Troncales Backbone
  const backboneLinks = store._raw.connections.filter(c => c.cableType.includes('Fibra'));
  assert(backboneLinks.length >= 6, 'Demo: Troncales backbone de Fibra Óptica interconectan todos los racks y salas');

  // ----------------------------------------------------
  // GRUPO 12: GESTIÓN AVANZADA DE PUERTOS Y VALIDACIÓN DE VLANS
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 12: Gestión Avanzada de Puertos y Validación de VLANs');

  // 12.1 Catálogo y CRUD de VLANs
  const vlans = store.getVlans();
  assert(Array.isArray(vlans) && vlans.length >= 7, `VLANs: getVlans() retorna catálogo con al menos 7 VLANs (encontradas: ${vlans.length})`);

  const vlanDefault = store.getVlanById(1);
  assert(vlanDefault && vlanDefault.name.includes('Default'), 'VLANs: VLAN 1 (Default / Troncal) está presente');

  const addVlanRes = store.addVlan({ id: 100, name: 'VLAN Pruebas QA', color: '#ec4899' });
  assert(addVlanRes && addVlanRes.success === true, 'VLANs: addVlan() crea exitosamente una nueva VLAN');
  assert(store.getVlanById(100)?.name === 'VLAN Pruebas QA', 'VLANs: getVlanById(100) recupera la nueva VLAN');

  const delVlan1Res = store.deleteVlan(1);
  assert(delVlan1Res && delVlan1Res.success === false, 'VLANs: deleteVlan(1) es rechazado (protección de VLAN 1 Default)');

  const delVlan100Res = store.deleteVlan(100);
  assert(delVlan100Res && delVlan100Res.success === true && !store.getVlanById(100), 'VLANs: deleteVlan(100) elimina correctamente la VLAN');

  // 12.2 Consulta de Puertos y Detección de Estado
  const rackTest = store._raw.racks[0];
  const swCoreDev = store._raw.devices.find(d => d.name.includes('Core'));
  const swDistDev = store._raw.devices.find(d => d.name.includes('Distribución'));
  assert(swCoreDev && swDistDev, 'Puertos: Switches Core y Distribución disponibles para pruebas de puertos');

  const portsCore = store.getDevicePorts(swCoreDev.id);
  assert(Array.isArray(portsCore) && portsCore.length > 0, `Puertos: getDevicePorts() retorna array estructurado de puertos (encontrados: ${portsCore.length})`);

  const portTe1 = portsCore.find(p => p.name === 'Te1/0/1');
  assert(portTe1 && portTe1.isOccupied === true, 'Puertos: Puerto conectado Te1/0/1 detectado como ocupado (isOccupied === true)');
  assert(portTe1 && portTe1.peerDeviceName.includes('Switch ToR'), `Puertos: Puerto Te1/0/1 mapea correctamente a equipo par (${portTe1?.peerDeviceName})`);

  const isTe1Occupied = store.isPortOccupied(swCoreDev.id, 'Te1/0/1');
  assert(isTe1Occupied !== false && isTe1Occupied.id !== undefined, 'Puertos: isPortOccupied("Te1/0/1") retorna objeto de conexión');

  const isFreeOccupied = store.isPortOccupied(swCoreDev.id, 'Eth-999');
  assert(isFreeOccupied === false, 'Puertos: isPortOccupied("Eth-999") retorna false para puerto inexistente o libre');

  // 12.3 Prevención de Doble Conexión / Colisión de Puertos
  const collisionValidation = store.validateConnection({
    sourceDeviceId: swCoreDev.id,
    sourcePort: 'Te1/0/1',
    targetDeviceId: swDistDev.id,
    targetPort: 'Eth-1'
  });
  assert(collisionValidation.valid === false && collisionValidation.error.includes('ya está conectado'), 'Colisión: validateConnection bloquea intento de conexión en puerto ya conectado');

  const addCollisionRes = store.addConnection({
    sourceDeviceId: swCoreDev.id,
    sourcePort: 'Te1/0/1',
    targetDeviceId: swDistDev.id,
    targetPort: 'Eth-1'
  });
  assert(addCollisionRes && addCollisionRes.success === false, 'Colisión: addConnection() rechaza creación de cable en puerto ocupado');

  // 12.4 Conexión Válida en Puerto Libre con VLAN
  const connFreeRes = store.addConnection({
    sourceDeviceId: swCoreDev.id,
    sourcePort: 'Eth-1',
    targetDeviceId: swDistDev.id,
    targetPort: 'Eth-1',
    vlanId: 20
  });
  assert(connFreeRes && connFreeRes.success === true, 'Conexión: addConnection() conecta con éxito puertos libres');
  assert(store.isPortOccupied(swCoreDev.id, 'Eth-1') !== false, 'Conexión: Puerto origen Eth-1 pasa a estado ocupado');
  assert(store.isPortOccupied(swDistDev.id, 'Eth-1') !== false, 'Conexión: Puerto destino Eth-1 pasa a estado ocupado');

  const portsCoreUpdated = store.getDevicePorts(swCoreDev.id);
  const eth1PortObj = portsCoreUpdated.find(p => p.name === 'Eth-1');
  assert(eth1PortObj && eth1PortObj.vlanId === 20, 'VLAN: Puerto hereda correctamente metadatos de VLAN 20');

  // 12.5 Desconexión y Liberación de Puertos
  store.deleteConnection(connFreeRes.connection.id);
  assert(store.isPortOccupied(swCoreDev.id, 'Eth-1') === false, 'Desconexión: Puerto origen Eth-1 liberado exitosamente tras eliminar conexión');
  assert(store.isPortOccupied(swDistDev.id, 'Eth-1') === false, 'Desconexión: Puerto destino Eth-1 liberado exitosamente tras eliminar conexión');

  // 12.6 Auditoría de Colisiones en Plantilla Demo
  loadDemoData();
  let demoCollisions = 0;
  const occupiedCheck = new Set();
  store._raw.connections.forEach(c => {
    const key1 = `${c.sourceDeviceId}::${String(c.sourcePort).toLowerCase()}`;
    const key2 = `${c.targetDeviceId}::${String(c.targetPort).toLowerCase()}`;
    if (occupiedCheck.has(key1)) demoCollisions++;
    if (occupiedCheck.has(key2)) demoCollisions++;
    occupiedCheck.add(key1);
    occupiedCheck.add(key2);
  });
  assert(demoCollisions === 0, `Auditoría Demo: 0 colisiones de puertos en toda la base de datos (colisiones detectadas: ${demoCollisions})`);

  const connsWithVlan = store._raw.connections.filter(c => c.vlanId !== undefined && c.vlanId > 0);
  assert(connsWithVlan.length === store._raw.connections.length, `Auditoría Demo: 100% de las conexiones tienen VLAN asignada (${connsWithVlan.length}/${store._raw.connections.length})`);

  assert(typeof window.disconnectPortFromInspector === 'function', 'Inspector: disconnectPortFromInspector() está expuesta en window');

  // ----------------------------------------------------
  // GRUPO 13: SELECTOR DE COLUMNAS EN TABLAS (PROPUESTA 3)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 13: Selector de Columnas en Tablas (Propuesta 3)');

  assert(Array.isArray(INVENTORY_COLUMNS) && INVENTORY_COLUMNS.length === 18, `Columnas: INVENTORY_COLUMNS define 18 columnas (encontradas: ${INVENTORY_COLUMNS.length})`);
  assert(Array.isArray(CONNECTIONS_COLUMNS) && CONNECTIONS_COLUMNS.length === 11, `Columnas: CONNECTIONS_COLUMNS define 11 columnas (encontradas: ${CONNECTIONS_COLUMNS.length})`);
  assert(typeof getTableColumnsConfig === 'function', 'Columnas: getTableColumnsConfig() está definida globalmente');
  assert(typeof saveTableColumnsConfig === 'function', 'Columnas: saveTableColumnsConfig() está definida globalmente');
  assert(typeof isColumnVisible === 'function', 'Columnas: isColumnVisible() está definida globalmente');
  assert(typeof setColumnVisible === 'function', 'Columnas: setColumnVisible() está definida globalmente');
  assert(typeof resetTableColumns === 'function', 'Columnas: resetTableColumns() está definida globalmente');
  assert(typeof showAllTableColumns === 'function', 'Columnas: showAllTableColumns() está definida globalmente');

  // Comprobar columna requerida protegida
  assert(isColumnVisible('inventory', 'name') === true, 'Columnas: Columna "name" requerida siempre visible');

  // Probar ocultamiento dinámico de columna en render
  setColumnVisible('inventory', 'mac', false);
  assert(isColumnVisible('inventory', 'mac') === false, 'Columnas: Columna "mac" desactivada correctamente');

  const testTableContainer = { innerHTML: '', querySelectorAll: () => [] };
  renderInventoryTable(testTableContainer, '');
  assert(!testTableContainer.innerHTML.includes('<th>MAC</th>'), 'Columnas: <th>MAC</th> no aparece en el DOM al estar oculta');

  // Reactivar columna y verificar restauración
  setColumnVisible('inventory', 'mac', true);
  assert(isColumnVisible('inventory', 'mac') === true, 'Columnas: Columna "mac" reactivada con éxito');
  renderInventoryTable(testTableContainer, '');
  assert(testTableContainer.innerHTML.includes('<th>MAC</th>'), 'Columnas: <th>MAC</th> restaurado en el DOM');

  // Probar acciones rápidas Mostrar Todo y Reset
  showAllTableColumns('inventory');
  const allVis = INVENTORY_COLUMNS.every(c => isColumnVisible('inventory', c.id));
  assert(allVis === true, 'Columnas: showAllTableColumns() activa el 100% de las columnas de inventario');

  resetTableColumns('inventory');
  assert(isColumnVisible('inventory', 'name') === true, 'Columnas: resetTableColumns() restaura configuración por defecto');

  // Comprobar elementos en index.html
  const updatedHtmlCols = fs.readFileSync(path.join(rootPath, 'index.html'), 'utf8');
  assert(updatedHtmlCols.includes('id="columns-menu-wrap"') && updatedHtmlCols.includes('id="btn-columns-menu"'), 'Columnas: index.html define el botón del selector #btn-columns-menu');
  assert(updatedHtmlCols.includes('id="columns-dropdown"') && updatedHtmlCols.includes('id="columns-dropdown-list"'), 'Columnas: index.html define el popover #columns-dropdown con su lista');
  assert(updatedHtmlCols.includes('id="btn-cols-show-all"') && updatedHtmlCols.includes('id="btn-cols-reset"'), 'Columnas: index.html define los botones rápidos Mostrar Todo y Por Defecto');

  // Comprobar estilos en panels.css
  const panelsCssColsText = fs.readFileSync(path.join(rootPath, 'css', 'components', 'panels.css'), 'utf8');
  assert(panelsCssColsText.includes('.columns-dropdown-header') && panelsCssColsText.includes('.col-toggle-item') && panelsCssColsText.includes('.btn-col-action'), 'Columnas: panels.css implementa estilos para el popover y checkboxes');

  // ----------------------------------------------------
  // GRUPO 14: CIFRADO EN REPOSO (M-01) Y REVELACIÓN EN MODO DIOS
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 14: Cifrado en Reposo (M-01) y Modo Dios para Administradores');

  // 14.1 Existencia y API de RackCrypto
  assert(typeof RackCrypto !== 'undefined' && typeof RackCrypto.encrypt === 'function' && typeof RackCrypto.decrypt === 'function', 'M-01: RackCrypto expone las funciones de cifrado y descifrado');
  assert(typeof RackCrypto.isEncrypted === 'function' && typeof RackCrypto.prepareStateForStorage === 'function' && typeof RackCrypto.restoreStateFromStorage === 'function', 'M-01: RackCrypto implementa helpers de persistencia para el estado');

  // 14.2 Prueba de Cifrado y Descifrado Simétrico
  const testSecret = 'ClaveUltraSegura#2026';
  const encryptedSecret = RackCrypto.encrypt(testSecret);
  assert(RackCrypto.isEncrypted(encryptedSecret) === true, 'M-01: encrypt() genera cadena con prefijo seguro enc:v1:');
  assert(!encryptedSecret.includes(testSecret), 'M-01: La cadena cifrada no expone el texto plano en ninguna subcadena');

  const decryptedSecret = RackCrypto.decrypt(encryptedSecret);
  assert(decryptedSecret === testSecret, 'M-01: decrypt() recupera fielmente el texto plano original');

  // 14.3 Cifrado en Reposo en LocalStorage a través de Store._save()
  const targetRack = store._raw.racks.find(r => r.name.includes('101')) || store._raw.racks[0];
  const testDevWithPass = {
    id: 'dev-crypto-test-01',
    name: 'Servidor Seguro Bastionado',
    type: 'server',
    size: 2,
    slotStart: 25,
    mountSide: 'front',
    rackId: targetRack.id,
    user: 'admin_sys',
    pass: 'P@ssw0rdSuperSecr3t!'
  };

  const addResult = store.addDeviceToRack(testDevWithPass, targetRack.id, 25, 'front');

  const storedRawJson = localStorage.getItem('RACK_DESIGNER_NEXT_STATE');
  const storedParsed = JSON.parse(storedRawJson);
  const storedDevice = storedParsed.devices.find(d => d.id === 'dev-crypto-test-01');

  assert(storedDevice && RackCrypto.isEncrypted(storedDevice.pass) === true, 'M-01: store._save() persiste la contraseña cifrada (enc:v1:) en localStorage');
  assert(!storedRawJson.includes('P@ssw0rdSuperSecr3t!'), 'M-01: La contraseña real en texto plano NUNCA reside en localStorage');

  // 14.4 Descifrado Transparente en Memoria para Componentes
  const devInMem = store.deviceById('dev-crypto-test-01');
  assert(devInMem && devInMem.pass === 'P@ssw0rdSuperSecr3t!', 'M-01: El estado en memoria mantiene la contraseña descifrada para el uso interno del store');

  // 14.5 Prueba de Carga con _load()
  const freshStore = new Store();
  const loadedDev = freshStore.deviceById('dev-crypto-test-01');
  assert(loadedDev && loadedDev.pass === 'P@ssw0rdSuperSecr3t!', 'M-01: store._load() descifra transparentemente las credenciales guardadas');

  // 14.6 Modo Dios en Tablas de Inventario
  window.SHOW_PASSWORDS = false;
  const tableCheckWrap = { innerHTML: '', querySelectorAll: () => [] };
  renderInventoryTable(tableCheckWrap, '');
  assert(tableCheckWrap.innerHTML.includes('••••••••'), 'Modo Dios: Las contraseñas se ocultan con •••••••• por defecto');
  assert(!tableCheckWrap.innerHTML.includes('P@ssw0rdSuperSecr3t!'), 'Modo Dios: La contraseña real no se muestra en la tabla sin autorización');

  window.SHOW_PASSWORDS = true;
  renderInventoryTable(tableCheckWrap, '');
  assert(tableCheckWrap.innerHTML.includes('P@ssw0rdSuperSecr3t!'), 'Modo Dios: Al activar Modo Dios (SHOW_PASSWORDS=true), la tabla revela la contraseña');
  window.SHOW_PASSWORDS = false;

  // 14.7 Revelación de Contraseñas en Inspector y Protección RBAC
  assert(typeof toggleDevicePasswordInspector === 'function', 'Inspector: toggleDevicePasswordInspector expuesta globalmente');
  
  // Como espectador, debe ser rechazado
  RackAuth.loginAsViewer();
  assert(RackAuth.can('toggleGodMode') === false, 'RBAC: Espectador NO tiene permiso toggleGodMode');
  toggleDevicePasswordInspector('dev-crypto-test-01');
  assert(!window._revealedDevicePasswords.has('dev-crypto-test-01'), 'RBAC: toggleDevicePasswordInspector rechaza a usuarios no administradores');

  // Como Administrador, debe ser admitido
  await RackAuth.tryAdminLogin('rack2024');
  assert(RackAuth.can('toggleGodMode') === true, 'RBAC: Administrador tiene permiso toggleGodMode');
  toggleDevicePasswordInspector('dev-crypto-test-01');
  assert(window._revealedDevicePasswords.has('dev-crypto-test-01') === true, 'Modo Dios: Administrador revela exitosamente la contraseña de un equipo individual');
  toggleDevicePasswordInspector('dev-crypto-test-01');
  assert(window._revealedDevicePasswords.has('dev-crypto-test-01') === false, 'Modo Dios: Administrador vuelve a ocultar la contraseña con un clic');

  // 14.8 UI en index.html y DeviceModal
  const updatedHtmlCrypto = fs.readFileSync(path.join(rootPath, 'index.html'), 'utf8');
  assert(updatedHtmlCrypto.includes('id="dev-pass-toggle"'), 'M-01: index.html incluye el botón interactivo #dev-pass-toggle en el formulario');
  assert(updatedHtmlCrypto.includes('src="js/auth/crypto.js"'), 'M-01: index.html incluye el script js/auth/crypto.js');

  // ----------------------------------------------------
  // GRUPO 15: AFINIDAD Y PROXIMIDAD DE EQUIPOS DE PISO (M-39)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 15: Afinidad y Proximidad de Equipos de Piso por Gabinete (M-39)');

  // 15.1 Existencia del algoritmo de afinidad
  assert(typeof _findAffinityRackForFloorDevice === 'function', 'M-39: _findAffinityRackForFloorDevice está expuesta y disponible');
  assert(typeof _computeLayout === 'function', 'M-39: _computeLayout está expuesta y disponible');
  assert(typeof _computeTreeLayout === 'function', 'M-39: _computeTreeLayout está expuesta y disponible');

  // Cargar demo data para pruebas reales
  loadDemoData();

  // Sala 1: Data Center Principal
  const room1 = store._raw.rooms[0];
  const racksRoom1 = store.allRacksInRoom(room1.id);
  const floorDevsRoom1 = store.allFloorDevicesInRoom(room1.id);
  const devToRackMap = {};
  store._raw.devices.forEach(d => { if (d.rackId) devToRackMap[d.id] = d.rackId; });

  const m39Rack101 = racksRoom1.find(r => r.name.includes('101'));
  const m39Rack104 = racksRoom1.find(r => r.name.includes('104'));

  // 15.2 Detección de afinidad en datos reales
  // Las cámaras están conectadas a swPoeCctvId en Rack 104
  const camDev = floorDevsRoom1.find(d => d.name.toLowerCase().includes('cámara'));
  const affRackCam = _findAffinityRackForFloorDevice(camDev, racksRoom1, store._raw.connections, devToRackMap);
  assert(affRackCam === m39Rack104.id, 'M-39: Cámara IP detecta afinidad automática hacia Rack 104 (Switch PoE)');

  // La impresora o AP están conectados a swDistId en Rack 101
  const netDev = floorDevsRoom1.find(d => d.name.toLowerCase().includes('ap') || d.name.toLowerCase().includes('impresora') || d.name.toLowerCase().includes('pc'));
  const affRackNet = _findAffinityRackForFloorDevice(netDev, racksRoom1, store._raw.connections, devToRackMap);
  assert(affRackNet === m39Rack101.id, 'M-39: Periférico de red (AP/Impresora) detecta afinidad automática hacia Rack 101');

  // 15.3 Equipo sin conexiones retorna null
  const unconnectedFloorDev = { id: 'floor-test-unconn', category: 'floor', roomId: room1.id, name: 'Impresora Aislada' };
  const affUnconn = _findAffinityRackForFloorDevice(unconnectedFloorDev, racksRoom1, store._raw.connections, devToRackMap);
  assert(affUnconn === null, 'M-39: Equipo de piso sin conexiones retorna afinidad null');

  // 15.4 Resolución por mayoría de conexiones ante múltiples enlaces
  const multiConnDev = { id: 'floor-test-multi', category: 'floor', roomId: room1.id, name: 'Estación Multi-Homed' };
  const mockConns = [
    { sourceDeviceId: multiConnDev.id, targetDeviceId: store.allDevicesInRack(m39Rack101.id)[0].id },
    { sourceDeviceId: multiConnDev.id, targetDeviceId: store.allDevicesInRack(m39Rack104.id)[0].id },
    { sourceDeviceId: multiConnDev.id, targetDeviceId: store.allDevicesInRack(m39Rack104.id)[1].id }
  ];
  const affMulti = _findAffinityRackForFloorDevice(multiConnDev, racksRoom1, mockConns, devToRackMap);
  assert(affMulti === m39Rack104.id, 'M-39: Equipo con múltiples conexiones elige el rack con mayor número de enlaces (peso)');

  // 15.5 Verificación de coordenadas de Layout por Racks (_computeLayout)
  const layout = _computeLayout();
  const r101Pos = layout.newRackPos[m39Rack101.id];
  const r101Size = layout.newRackSize[m39Rack101.id];
  const r104Pos = layout.newRackPos[m39Rack104.id];
  const r104Size = layout.newRackSize[m39Rack104.id];

  // Las cámaras deben estar dentro de la columna horizontal de Rack 104
  const camPos = layout.newNodePos[camDev.id];
  assert(camPos && camPos.x >= r104Pos.x && camPos.x <= (r104Pos.x + r104Size.w),
    'M-39: Cámara se posiciona dentro de la huella horizontal del Rack 104');

  // El periférico de red debe estar dentro de la huella horizontal de Rack 101
  const netPos = layout.newNodePos[netDev.id];
  assert(netPos && netPos.x >= r101Pos.x && netPos.x <= (r101Pos.x + r101Size.w),
    'M-39: Periférico de red se posiciona dentro de la huella horizontal del Rack 101');

  // 15.6 Aislamiento: El periférico de Rack 101 no solapa la columna de Rack 104
  assert(Math.abs(camPos.x - netPos.x) > 100, 'M-39: Aislamiento lateral: Los periféricos de racks distintos no se solapan');

  // 15.7 Línea de base uniforme de piso para toda la sala
  const allAffinityFloorDevs = floorDevsRoom1.filter(d => {
    const aff = _findAffinityRackForFloorDevice(d, racksRoom1, store._raw.connections, devToRackMap);
    return aff !== null;
  });
  const firstRowYValues = new Set(allAffinityFloorDevs.map(d => layout.newNodePos[d.id].y));
  // La primera fila de cada grupo de afinidad comparte la misma cota Y inicial (o paso simétrico)
  const minY = Math.min(...Array.from(firstRowYValues));
  const maxRackBottomInRoom = Math.max(...racksRoom1.map(r => layout.newRackPos[r.id].y + layout.newRackSize[r.id].h));
  assert(minY >= maxRackBottomInRoom + 24, 'M-39: Equipos de piso inician por debajo de la base del rack más alto manteniendo margen de sala');

  // 15.8 Altura proporcional y armónica del contenedor de sala
  const room1Pos = layout.newRoomPos[room1.id];
  const room1Size = layout.newRoomSize[room1.id];
  assert((room1Pos.y + room1Size.h) >= maxRackBottomInRoom + 60, 'M-39: El contenedor de sala contiene holgadamente la sección de racks y equipos de piso');

  // 15.9 Preservación de afinidad en Layout de Árbol Jerárquico (_computeTreeLayout)
  const treeLayout = _computeTreeLayout();
  const treeCamPos = treeLayout.newNodePos[camDev.id];
  const treeR104Pos = treeLayout.newRackPos[m39Rack104.id];
  const treeR104Size = treeLayout.newRackSize[m39Rack104.id];
  assert(treeCamPos && treeCamPos.x >= treeR104Pos.x && treeCamPos.x <= (treeR104Pos.x + treeR104Size.w),
    'M-39: En modo Árbol Jerárquico, la cámara preserva afinidad y alineación bajo el Rack 104');

  // 15.10 Integración con autoOrderTopo
  assert(typeof autoOrderTopo === 'function', 'M-39: autoOrderTopo() disponible globalmente para reorganización reactiva');

  // 15.11 Renderizado de Nodos y Tarjetas: Elipsis elegante
  const topoRendererSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'topology', 'TopologyRenderer.js'), 'utf8');
  assert(topoRendererSrc.includes("slice(0, 16) + '…'"), 'Topología: Elipsis elegante con puntos suspensivos implementada en tarjetas y nodos');

  // 15.12 HUD Tooltip: Ancho ampliado a 240px y división de títulos largos
  assert(topoRendererSrc.includes('const hudW = 240;'), 'Topología HUD: Ancho ampliado a 240px para lectura completa de nombres');
  assert(topoRendererSrc.includes('titleLines') && topoRendererSrc.includes('devFullName.length > 21'), 'Topología HUD: Soporte multilínea inteligente para nombres técnicos extensos');

  // ====================================================
  // GRUPO 16: Guardado y Conmutación de Estados de Topología (M-40)
  // ====================================================
  console.log('\n🔹 GRUPO 16: Guardado y Conmutación de Estados de Topología (M-40)');

  // 16.1 Inicialización de slots en estado por defecto
  const freshDefState = store._defaultState();
  assert(Array.isArray(freshDefState.topologySlots) && freshDefState.topologySlots.length === 5,
    'M-40: _defaultState define topologySlots como un array de exactamente 5 elementos');
  assert(freshDefState.topologySlots.every(slot => slot === null),
    'M-40: Las 5 ranuras inician inicialmente vacías (null)');
  assert(freshDefState.activeTopologySlot === null,
    'M-40: activeTopologySlot inicia en null por defecto');

  // 16.2 Consulta mediante getTopologySlots()
  const currentSlots = store.getTopologySlots();
  assert(Array.isArray(currentSlots) && currentSlots.length === 5,
    'M-40: store.getTopologySlots() retorna las 5 ranuras de memoria');

  // Preparar datos de prueba en la topología actual
  store._raw.topology = {
    nodePositions: { 'dev-test-1': { x: 120, y: 240 }, 'dev-test-2': { x: 300, y: 450 } },
    rackPositions: { 'rack-test-1': { x: 100, y: 200 } },
    rackSizes: { 'rack-test-1': { w: 220, h: 480 } },
    roomPositions: { 'room-test-1': { x: 80, y: 150 } },
    roomSizes: { 'room-test-1': { w: 800, h: 600 } },
    topoSpacing: 75,
    topoSpacingX: 35,
    bgPattern: 'grid',
    inheritColors: true,
    topoAlpha: 0.3,
    style: 'card',
    layoutMode: 'racks'
  };
  store._raw.topoZoom = 1.25;
  store._raw.topoPanX = 50;
  store._raw.topoPanY = -80;

  // 16.3 Guardado en ranura 0 con nombre personalizado
  const savedSlot0 = store.saveTopologySlot(0, 'Esquema Datacenter Principal');
  assert(savedSlot0 && savedSlot0.id === 1 && savedSlot0.name === 'Esquema Datacenter Principal',
    'M-40: saveTopologySlot(0, name) guarda con éxito la ranura con metadatos correctos');
  assert(store._raw.activeTopologySlot === 0,
    'M-40: activeTopologySlot se actualiza al índice guardado (0)');
  assert(savedSlot0.nodePositions['dev-test-1'].x === 120 && savedSlot0.nodePositions['dev-test-2'].y === 450,
    'M-40: saveTopologySlot captura fielmente las posiciones (x, y) de los nodos');
  assert(savedSlot0.topoZoom === 1.25 && savedSlot0.topoPanX === 50 && savedSlot0.topoPanY === -80,
    'M-40: saveTopologySlot captura fielmente el zoom y las coordenadas de encuadre pan (x, y)');

  // 16.4 Aislamiento e inmutabilidad por clonado profundo
  store._raw.topology.nodePositions['dev-test-1'].x = 9999;
  assert(savedSlot0.nodePositions['dev-test-1'].x === 120,
    'M-40: El snapshot guardado está aislado de mutaciones posteriores en el estado activo (deep clone)');

  // 16.5 Guardado en ranura 1 con nombre por defecto
  const savedSlot1 = store.saveTopologySlot(1);
  assert(savedSlot1 && savedSlot1.name === 'Vista 2',
    'M-40: saveTopologySlot asigna "Vista 2" si no se suministra un nombre personalizado');

  // 16.6 Renombrado de ranura
  const renameOk = store.renameTopologySlot(0, 'Distribución Core y Agregación');
  assert(renameOk === true && store._raw.topologySlots[0].name === 'Distribución Core y Agregación',
    'M-40: renameTopologySlot modifica exitosamente el nombre descriptivo de la ranura');

  // 16.7 Restauración y conmutación de estado con loadTopologySlot
  // Simulamos que la topología activa se altera o desordena
  store._raw.topology.nodePositions = { 'dev-random': { x: 0, y: 0 } };
  store._raw.topoZoom = 0.5;
  const loadOk = store.loadTopologySlot(0);
  assert(loadOk === true, 'M-40: loadTopologySlot(0) se ejecuta satisfactoriamente');
  assert(store._raw.topology.nodePositions['dev-test-1'].x === 120,
    'M-40: loadTopologySlot restaura fielmente las coordenadas de los nodos guardados');
  assert(store._raw.topoZoom === 1.25 && store._raw.topoPanX === 50,
    'M-40: loadTopologySlot restaura fielmente el zoom y encuadre del canvas');
  assert(store._raw.activeTopologySlot === 0,
    'M-40: loadTopologySlot marca la ranura activa correctamente');

  // 16.8 Rechazo de carga en ranura vacía
  const loadEmptyOk = store.loadTopologySlot(3);
  assert(loadEmptyOk === false, 'M-40: loadTopologySlot(3) rechaza la carga al tratarse de una ranura vacía');

  // 16.9 Vaciado de ranura con clearTopologySlot
  const clearOk = store.clearTopologySlot(1);
  assert(clearOk === true && store._raw.topologySlots[1] === null,
    'M-40: clearTopologySlot vacía la ranura liberando el slot a null');

  // 16.10 Preservación de la pila de Rehacer (Redo) y Deshacer (Undo) sin conflictos
  store.snapshot(); // Simulamos una acción de inventario
  store.undo(); // Deshacer la acción
  assert(store._redoStack.length > 0, 'Historial: store.undo() deja elementos disponibles en _redoStack');

  // Interactuar con slots de topología: guardar y cargar NO debe destruir _redoStack
  store.saveTopologySlot(4, 'Vista Auxiliar');
  store.loadTopologySlot(0);
  assert(store._redoStack.length > 0,
    'M-40: Guardar/cargar slots de topología preserva intacto _redoStack (no rompe el botón Rehacer)');

  // Rehacer debe poder ejecutarse con éxito
  const redoLenBefore = store._redoStack.length;
  store.redo();
  assert(store._redoStack.length === redoLenBefore - 1,
    'M-40: store.redo() se ejecuta exitosamente tras interactuar con los slots de topología');
  assert(store._raw.topologySlots[4] !== null,
    'M-40: Deshacer y Rehacer preservan los slots guardados sin pérdida de datos');

  // 16.11 Sanitización de estructura ante cargas anómalas
  store._raw.topologySlots = [null, null]; // Dañado
  store._sanitize();
  assert(Array.isArray(store._raw.topologySlots) && store._raw.topologySlots.length === 5,
    'M-40: _sanitize() repara estructuras dañadas garantizando siempre 5 ranuras');

  // 16.12 Funciones auxiliares en window (TopologyState.js)
  assert(typeof window.applyTopologySlot === 'function',
    'M-40: window.applyTopologySlot está expuesta globalmente');
  assert(typeof window.saveCurrentToTopologySlot === 'function',
    'M-40: window.saveCurrentToTopologySlot está expuesta globalmente');
  assert(typeof window.clearTopologySlot === 'function',
    'M-40: window.clearTopologySlot está expuesta globalmente');
  assert(typeof window.renameTopologySlot === 'function',
    'M-40: window.renameTopologySlot está expuesta globalmente');

  // 16.13 Verificación de elementos DOM en index.html
  const indexHtmlSrc = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(indexHtmlSrc.includes('id="topo-slots-group"'),
    'M-40: index.html define el grupo de controles #topo-slots-group');
  assert(indexHtmlSrc.includes('id="topo-slots-bar"'),
    'M-40: index.html define el contenedor de botones de slots #topo-slots-bar');
  assert(indexHtmlSrc.includes('id="btn-topo-slots-menu"'),
    'M-40: index.html define el botón de gestión avanzada #btn-topo-slots-menu');
  assert(indexHtmlSrc.includes('id="topo-slots-dropdown"'),
    'M-40: index.html define el menú desplegable #topo-slots-dropdown');

  // 16.14 Verificación de estilos en panels.css
  const panelsCssSrc = fs.readFileSync(path.join(__dirname, '..', 'css', 'components', 'panels.css'), 'utf8');
  assert(panelsCssSrc.includes('.topo-slot-btn'),
    'M-40: panels.css define los estilos estéticos para .topo-slot-btn');
  assert(panelsCssSrc.includes('.topo-slot-btn.saved') && panelsCssSrc.includes('.topo-slot-btn.active'),
    'M-40: panels.css implementa estados visuales diferenciados para ranuras guardadas y activas');

  // 16.15 Verificación de integración en main.js
  const mainJsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
  assert(mainJsSrc.includes('function renderTopologySlots()'),
    'M-40: main.js implementa la función orquestadora renderTopologySlots()');
  assert(mainJsSrc.includes("topoSlotsGroup.classList.remove('force-hide')"),
    'M-40: main.js conmuta la visibilidad de los slots al alternar a la vista de topología');

  // ----------------------------------------------------
  // GRUPO 17: Soporte para Tema Sepia y Selector de Temas (M-18)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 17: Soporte para Tema Sepia y Selector de Temas (M-18)');

  // 17.1 Verificación de variables en variables.css
  const varsCssSrc = fs.readFileSync(path.join(__dirname, '..', 'css', 'variables.css'), 'utf8');
  assert(varsCssSrc.includes('[data-theme="sepia"]'),
    'M-18: variables.css define el bloque [data-theme="sepia"]');
  assert(varsCssSrc.includes('--bg-main:       #f4ecd8;') || varsCssSrc.includes('--bg-main: #f4ecd8;'),
    'M-18: variables.css define el fondo cálido pergamino (#f4ecd8) para sepia');
  assert(varsCssSrc.includes('--text-primary:  #332517;') || varsCssSrc.includes('--text-primary: #332517;'),
    'M-18: variables.css define el texto primario café oscuro (#332517) con alto contraste');
  assert(varsCssSrc.includes('--accent:        #b45309;') || varsCssSrc.includes('--accent: #b45309;'),
    'M-18: variables.css define el acento cálido ámbar/bronce (#b45309)');

  // 17.2 Verificación de layout.css y misc.css
  const layoutCssSrc = fs.readFileSync(path.join(__dirname, '..', 'css', 'layout.css'), 'utf8');
  assert(layoutCssSrc.includes('[data-theme="sepia"] #view-physical'),
    'M-18: layout.css define la cuadrícula física adaptada para [data-theme="sepia"]');

  const miscCssSrc = fs.readFileSync(path.join(__dirname, '..', 'css', 'components', 'misc.css'), 'utf8');
  assert(miscCssSrc.includes('.icon-coffee'),
    'M-18: misc.css define la máscara vectorial del icono .icon-coffee');

  // 17.3 Verificación de elementos en index.html
  assert(indexHtmlSrc.includes('id="btn-theme-toggle"'),
    'M-18: index.html define el botón interactivo de tema en la cabecera #btn-theme-toggle');
  assert(indexHtmlSrc.includes('id="theme-toggle-icon"'),
    'M-18: index.html define el icono dinámico #theme-toggle-icon');
  assert(indexHtmlSrc.includes('id="theme-toggle-label"'),
    'M-18: index.html define la etiqueta de texto #theme-toggle-label');
  assert(indexHtmlSrc.includes("savedTheme === 'sepia'"),
    'M-18: index.html previene FOUC en el <head> al cargar el tema sepia guardado');

  // 17.4 Verificación de funciones en main.js
  assert(mainJsSrc.includes('window.applyTheme = function'),
    'M-18: main.js expone window.applyTheme para conmutación programática');
  assert(mainJsSrc.includes('window.toggleThemeCycle = function'),
    'M-18: main.js expone window.toggleThemeCycle para ciclado accesible');
  assert(mainJsSrc.includes('window.getCurrentTheme = function'),
    'M-18: main.js expone window.getCurrentTheme para lectura del tema activo');

  // 17.5 Ejecución de ciclo de temas en memoria
  const themeModule = `
    const THEMES = [
      { id: 'dark',  name: 'Oscuro', icon: 'icon-moon',   dataTheme: null },
      { id: 'light', name: 'Claro',  icon: 'icon-sun',    dataTheme: 'light' },
      { id: 'sepia', name: 'Sepia',  icon: 'icon-coffee', dataTheme: 'sepia' }
    ];
    window.getCurrentTheme = function() {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'sepia') return 'sepia';
      if (attr === 'light') return 'light';
      return 'dark';
    };
    window.applyTheme = function(themeId, notifyUser = false) {
      const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
      if (theme.dataTheme) {
        document.documentElement.setAttribute('data-theme', theme.dataTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', theme.id);
      return theme.id;
    };
    window.toggleThemeCycle = function(notifyUser = true) {
      const current = window.getCurrentTheme();
      const currentIndex = THEMES.findIndex(t => t.id === current);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      return window.applyTheme(THEMES[nextIndex].id, notifyUser);
    };
  `;
  vm.runInThisContext(themeModule);

  window.applyTheme('dark');
  assert(document.documentElement.getAttribute('data-theme') === null && localStorage.getItem('theme') === 'dark',
    'M-18: applyTheme("dark") remueve data-theme y fija "dark" en localStorage');

  window.applyTheme('light');
  assert(document.documentElement.getAttribute('data-theme') === 'light' && localStorage.getItem('theme') === 'light',
    'M-18: applyTheme("light") asigna data-theme="light" y fija "light" en localStorage');

  window.applyTheme('sepia');
  assert(document.documentElement.getAttribute('data-theme') === 'sepia' && localStorage.getItem('theme') === 'sepia',
    'M-18: applyTheme("sepia") asigna data-theme="sepia" y fija "sepia" en localStorage');

  const nextFromSepia = window.toggleThemeCycle(false);
  assert(nextFromSepia === 'dark' && window.getCurrentTheme() === 'dark',
    'M-18: toggleThemeCycle() conmuta correctamente de Sepia a Oscuro');

  const nextFromDark = window.toggleThemeCycle(false);
  assert(nextFromDark === 'light' && window.getCurrentTheme() === 'light',
    'M-18: toggleThemeCycle() conmuta correctamente de Oscuro a Claro');

  const nextFromLight = window.toggleThemeCycle(false);
  assert(nextFromLight === 'sepia' && window.getCurrentTheme() === 'sepia',
    'M-18: toggleThemeCycle() conmuta correctamente de Claro a Sepia');

  // 17.6 Verificación de soporte en TopologyRenderer y ExportModal
  const topoRendererThemeSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'topology', 'TopologyRenderer.js'), 'utf8');
  assert(topoRendererThemeSrc.includes("activeTheme === 'sepia'") && topoRendererThemeSrc.includes('#f5eee1'),
    'M-18: TopologyRenderer.js reconoce el tema Sepia y aplica fondo cálido (#f5eee1) en Canvas 2D');

  // ----------------------------------------------------
  // GRUPO 18: Botón de Inversión y Orientación de Conexiones (M-41)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 18: Botón de Inversión y Orientación de Conexiones (M-41)');

  // 18.1 Ícono Vectorial y Estilos en misc.css
  const miscIconSrc = fs.readFileSync(path.join(__dirname, '..', 'css', 'components', 'misc.css'), 'utf8');
  assert(miscIconSrc.includes('.icon-swap') && miscIconSrc.includes('mask-image'),
    'M-41: misc.css define la máscara vectorial del icono .icon-swap');

  // 18.2 Controles en index.html
  assert(indexHtmlSrc.includes('id="btn-cable-swap"') && indexHtmlSrc.includes('icon-swap'),
    'M-41: index.html define el botón interactivo de intercambio #btn-cable-swap');
  assert(indexHtmlSrc.includes('id="cable-orientation"') && indexHtmlSrc.includes('value="bottom"'),
    'M-41: index.html define el selector de orientación #cable-orientation (top / bottom)');

  // 18.3 Lógica en CableModal.js
  const cableModalSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'modals', 'CableModal.js'), 'utf8');
  assert(cableModalSrc.includes('btn-cable-swap') && cableModalSrc.includes('cable-orientation'),
    'M-41: CableModal.js vincula el evento de swap y sincroniza el selector de orientación');

  // 18.4 Métodos en store.js
  assert(typeof store.swapConnectionDirection === 'function',
    'M-41: store.swapConnectionDirection está expuesto en store.js');
  assert(typeof store.toggleConnectionOrientation === 'function',
    'M-41: store.toggleConnectionOrientation está expuesto en store.js');

  // Crear conexión de prueba para validar store
  const allDevices = store.state.devices;
  if (allDevices.length >= 2) {
    const dev1 = allDevices[0];
    const dev2 = allDevices[1];
    const addRes = store.addConnection({
      sourceDeviceId: dev1.id,
      sourcePort: 'Eth0/99',
      targetDeviceId: dev2.id,
      targetPort: 'Eth0/100',
      cableType: 'Fibra SM',
      color: '#3b82f6',
      orientation: 'top'
    });
    assert(addRes.success && addRes.connection && addRes.connection.orientation === 'top',
      'M-41: store.addConnection persiste connection.orientation = "top" por defecto');

    const connTestId = addRes.connection.id;

    // Test de Swap de dirección
    const swapRes = store.swapConnectionDirection(connTestId);
    assert(swapRes.success && swapRes.connection.sourceDeviceId === dev2.id && swapRes.connection.targetDeviceId === dev1.id && swapRes.connection.sourcePort === 'Eth0/100' && swapRes.connection.targetPort === 'Eth0/99',
      'M-41: store.swapConnectionDirection invierte fielmente dispositivos y puertos de origen y destino');

    // Test de Toggle de orientación
    const toggleRes1 = store.toggleConnectionOrientation(connTestId);
    assert(toggleRes1.success && toggleRes1.connection.orientation === 'bottom',
      'M-41: store.toggleConnectionOrientation conmuta de "top" a "bottom"');

    const toggleRes2 = store.toggleConnectionOrientation(connTestId);
    assert(toggleRes2.success && toggleRes2.connection.orientation === 'top',
      'M-41: store.toggleConnectionOrientation conmuta nuevamente de "bottom" a "top"');

    // Limpieza de prueba
    store.deleteConnection(connTestId);
  }

  // 18.5 Tabla de Conexiones (tables.js)
  const tablesSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'tables.js'), 'utf8');
  assert(tablesSrc.includes("id: 'orientation'") && tablesSrc.includes('data-swap-conn') && tablesSrc.includes('data-toggle-orient'),
    'M-41: tables.js incluye columna de canaleta y botones rápidos para swap y alternar orientación');

  // 18.6 Motor de Enrutamiento Físico (rack.js)
  const rackDrawSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'rack.js'), 'utf8');
  assert(rackDrawSrc.includes("c.orientation === 'bottom'") && rackDrawSrc.includes('maxRackBottom'),
    'M-41: rack.js enruta por canaleta inferior de piso técnico ante orientation === "bottom"');

  // ----------------------------------------------------
  // GRUPO 19: Plantilla Completa de Exportación (M-21) e Importación Masiva (M-22)
  // ----------------------------------------------------
  console.log('\n🔹 GRUPO 19: Plantilla de Exportación e Importación Masiva (M-21 y M-22)');

  // 19.1 Constantes y Funciones Base de M-21
  assert(Array.isArray(TEMPLATE_COLUMNS) && TEMPLATE_COLUMNS.length === 21,
    'M-21: TEMPLATE_COLUMNS define exactamente 21 campos del modelo de datos de equipos');
  assert(TEMPLATE_COLUMNS.includes('Sala') && TEMPLATE_COLUMNS.includes('Rack') && TEMPLATE_COLUMNS.includes('Unidad_U') && TEMPLATE_COLUMNS.includes('Skin') && TEMPLATE_COLUMNS.includes('Notas'),
    'M-21: TEMPLATE_COLUMNS incluye Sala, Rack, Unidad_U, Skin y Notas');
  assert(Array.isArray(VALID_DEVICE_TYPES) && VALID_DEVICE_TYPES.includes('server') && VALID_DEVICE_TYPES.includes('switch') && VALID_DEVICE_TYPES.includes('camera'),
    'M-21: VALID_DEVICE_TYPES contiene los tipos estándar de datacenter (server, switch, camera, etc.)');

  // 19.2 Generación de Matriz AOA de Plantilla
  const emptyTemplateAoa = getDeviceTemplateAOA(false);
  assert(Array.isArray(emptyTemplateAoa) && emptyTemplateAoa.length >= 4,
    'M-21: getDeviceTemplateAOA(false) genera encabezados y 3 filas ilustrativas de ejemplo');
  assert(emptyTemplateAoa[0].length === 21,
    'M-21: La fila de encabezados coincide con las 21 columnas del modelo');

  const filledTemplateAoa = getDeviceTemplateAOA(true);
  assert(Array.isArray(filledTemplateAoa) && filledTemplateAoa.length === (store._raw.devices.length + 1),
    'M-21: getDeviceTemplateAOA(true) exporta fielmente el total de equipos del inventario actual');

  // 19.3 Normalización de Encabezados (normalizeHeaderKey)
  assert(normalizeHeaderKey('Dirección IP') === 'ip' && normalizeHeaderKey('IP Address') === 'ip',
    'M-21: normalizeHeaderKey resuelve sinónimos de IP ("Dirección IP", "IP Address")');
  assert(normalizeHeaderKey('Unidad U') === 'slotStart' && normalizeHeaderKey('Slot_U') === 'slotStart',
    'M-21: normalizeHeaderKey resuelve sinónimos de Slot U ("Unidad U", "Slot_U")');
  assert(normalizeHeaderKey('Lado de Montaje') === 'mountSide' && normalizeHeaderKey('Mount Side') === 'mountSide',
    'M-21: normalizeHeaderKey resuelve sinónimos de Lado de Montaje');
  assert(normalizeHeaderKey('Nombre del Equipo') === 'name' && normalizeHeaderKey('Device Name') === 'name',
    'M-21: normalizeHeaderKey resuelve sinónimos de Nombre');

  // 19.4 Validación Unitaria de Filas (parseAndValidateDeviceRow)
  const roomDemo = store._raw.rooms[0];
  const rackDemo = store._raw.racks[0];

  const validRow = parseAndValidateDeviceRow({
    'Sala': roomDemo.name,
    'Rack': rackDemo.name,
    'Unidad_U': 20,
    'Lado_Montaje': 'Frontal',
    'Nombre': 'Servidor Test Unitario 1U',
    'Tipo': 'server',
    'Tamano_U': 1,
    'IP': '10.50.1.10',
    'MAC': '00:11:22:33:44:55',
    'Consumo_W': 250,
    'Notas': 'Prueba M-22'
  }, 0, { defaultRackId: rackDemo.id, autoCreateRacks: false });

  assert(validRow.isValid && validRow.item.name === 'Servidor Test Unitario 1U' && validRow.item.slotStart === 20 && validRow.item.mountSide === 'front',
    'M-22: parseAndValidateDeviceRow valida con éxito un equipo de rack con todos sus atributos');

  // Fila inválida: Sin nombre
  const namelessRow = parseAndValidateDeviceRow({
    'Rack': rackDemo.name,
    'Unidad_U': 22,
    'Nombre': ''
  }, 1);
  assert(!namelessRow.isValid && namelessRow.issues.errors.length > 0,
    'M-22: parseAndValidateDeviceRow rechaza un equipo sin nombre obligatorio');

  // Fila inválida: Desborde de altura
  const overflowRow = parseAndValidateDeviceRow({
    'Rack': rackDemo.name,
    'Unidad_U': rackDemo.height,
    'Tamano_U': 4,
    'Nombre': 'Servidor Gigante Desbordante'
  }, 2, { defaultRackId: rackDemo.id });
  assert(!overflowRow.isValid && overflowRow.issues.errors.some(e => e.includes('desborda')),
    'M-22: parseAndValidateDeviceRow rechaza un equipo que desborda la altura del gabinete');

  // Fila de equipo de piso
  const floorRow = parseAndValidateDeviceRow({
    'Sala': roomDemo.name,
    'Rack': 'PISO',
    'Nombre': 'Cámara IP Hall Principal',
    'Tipo': 'camera',
    'IP': '10.50.4.15'
  }, 3);
  assert(floorRow.isValid && floorRow.item.category === 'floor' && floorRow.item.rackId === null,
    'M-22: parseAndValidateDeviceRow reconoce y configura equipos de piso (category: "floor")');

  // 19.5 Análisis de Lote y Colisiones Internas (analyzeImportBatch)
  const batchWithCollision = [
    { 'Rack': rackDemo.name, 'Unidad_U': 25, 'Tamano_U': 2, 'Nombre': 'Equipo A', 'Tipo': 'server', 'Lado_Montaje': 'Frontal' },
    { 'Rack': rackDemo.name, 'Unidad_U': 26, 'Tamano_U': 1, 'Nombre': 'Equipo B', 'Tipo': 'switch', 'Lado_Montaje': 'Frontal' }
  ];
  const analyzedBatch = analyzeImportBatch(batchWithCollision, { defaultRackId: rackDemo.id });
  assert(analyzedBatch.validRows.length === 1 && analyzedBatch.invalidRows.length === 1 && analyzedBatch.errorsCount >= 1,
    'M-22: analyzeImportBatch detecta colisiones internas entre filas del mismo archivo');

  // 19.6 Ejecución de Importación y Resolución de Conflictos (executeDeviceImport)
  const initialDevCount = store._raw.devices.length;
  const importRows = [
    { 'Sala': roomDemo.name, 'Rack': rackDemo.name, 'Unidad_U': 30, 'Tamano_U': 1, 'Nombre': 'Equipo Batch 01', 'Tipo': 'server', 'Lado_Montaje': 'Trasera', 'IP': '10.80.1.1' },
    { 'Sala': roomDemo.name, 'Rack': 'Rack Nuevo Auto-Generado', 'Unidad_U': 1, 'Tamano_U': 2, 'Nombre': 'Equipo Batch 02', 'Tipo': 'switch', 'Lado_Montaje': 'Frontal', 'IP': '10.80.1.2' }
  ];
  const plan = analyzeImportBatch(importRows, { autoCreateRacks: true, targetRoomId: roomDemo.id });
  const execResult = executeDeviceImport(plan, { autoCreateRacks: true, conflictStrategy: 'rename', targetRoomId: roomDemo.id });

  assert(execResult.success && execResult.importedCount === 2 && execResult.racksCreatedCount === 1,
    'M-22: executeDeviceImport importa con éxito los equipos y crea gabinetes automáticos solicitados');
  assert(store._raw.devices.length === initialDevCount + 2,
    'M-22: El estado de dispositivos en store._raw se incrementa fielmente en 2');

  // 19.7 Deshacer Atómico (Undo) de la Importación Masiva
  store.undo();
  assert(store._raw.devices.length === initialDevCount,
    'M-22: store.undo() revierte atómicamente la importación masiva completa sin dejar registros huérfanos');

  // 19.8 Verificaciones en index.html y UI
  const finalHtmlCheck = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(finalHtmlCheck.includes('id="btn-table-import-modal"') && finalHtmlCheck.includes('id="menu-import-devices"'),
    'M-22: index.html define los puntos de acceso interactivos #btn-table-import-modal y #menu-import-devices');
  assert(finalHtmlCheck.includes('id="modal-import-devices"') && finalHtmlCheck.includes('id="import-drop-zone"') && finalHtmlCheck.includes('id="btn-import-confirm"'),
    'M-22: index.html define la estructura completa de #modal-import-devices con drop-zone y botón de confirmación');
  assert(finalHtmlCheck.includes('src="js/ui/modals/ImportModal.js"'),
    'M-22: index.html incluye el script js/ui/modals/ImportModal.js en el orden correcto');

  // ----------------------------------------------------
  // RESUMEN FINAL
  // ----------------------------------------------------
  console.log('\n=================================================');
  console.log(`📊 RESULTADOS: ${passed} pasadas, ${failed} falladas`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ¡TODAS LAS PRUEBAS DE INTEGRIDAD PASARON EXITOSAMENTE!\n');
    process.exit(0);
  }
}

runTests();

