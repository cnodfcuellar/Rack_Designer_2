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
  addEventListener: () => {},
  removeEventListener: () => {},
  body: { appendChild: () => {}, removeChild: () => {} },
  getElementById: (id) => {
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

loadScript('../js/utils.js');
loadScript('../js/icons.js');
loadScript('../js/store.js');
loadScript('../js/auth/roles.js');
loadScript('../js/ui/tables.js');
loadScript('../js/ui/modals/Globals.js');
loadScript('../js/ui/modals/RoomModal.js');
loadScript('../js/ui/modals/CableModal.js');
loadScript('../js/ui/catalog.js');
loadScript('../js/ui/inspector.js');
loadScript('../js/ui/outliner.js');
loadScript('../js/ui/modals/PlacementModal.js');
loadScript('../js/ui/modals/ExportModal.js');
loadScript('../js/ui/faceplates.js');
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
  assert(Array.isArray(CONNECTIONS_COLUMNS) && CONNECTIONS_COLUMNS.length === 10, `Columnas: CONNECTIONS_COLUMNS define 10 columnas (encontradas: ${CONNECTIONS_COLUMNS.length})`);
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
