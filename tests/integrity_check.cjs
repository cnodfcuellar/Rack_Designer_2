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
loadScript('../js/ui/modals/RoomModal.js');
loadScript('../js/ui/catalog.js');
loadScript('../js/ui/inspector.js');
loadScript('../js/ui/outliner.js');

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

  // 2. Verificar que assets/default/ existe
  assert(fs.existsSync(newAssetsDefaultPath), 'La carpeta assets/default/ existe correctamente');

  // 3. Verificar conteo de 16 SVGs en assets/default/
  const defaultSvgFiles = fs.existsSync(newAssetsDefaultPath) 
    ? fs.readdirSync(newAssetsDefaultPath).filter(f => f.endsWith('.svg')) 
    : [];
  assert(defaultSvgFiles.length === 16, `assets/default/ contiene los 16 archivos SVG requeridos (encontrados: ${defaultSvgFiles.length})`);

  // 4. Verificar conteo de 16 SVGs en assets/svg/default/
  const assetsSvgFiles = fs.existsSync(assetsSvgDefaultPath) 
    ? fs.readdirSync(assetsSvgDefaultPath).filter(f => f.endsWith('.svg')) 
    : [];
  assert(assetsSvgFiles.length === 16, `assets/svg/default/ contiene los 16 archivos SVG requeridos (encontrados: ${assetsSvgFiles.length})`);

  // 5. Verificar que faceplates.js no contiene referencias huérfanas a 'default/'
  const faceplatesJsContent = fs.readFileSync(path.join(rootPath, 'js', 'ui', 'faceplates.js'), 'utf8');
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
  assert(rackCssContent.includes('border: 1.5px solid') && rackCssContent.includes('box-shadow: 0 4px 20px'), 'M-10: .rack-card implementa borde reforzado de 1.5px y sombra de datacenter');
  assert(rackCssContent.includes('width: 240px; min-width: 240px; max-width: 240px;'), 'M-14: .rack-slots implementa ancho fijo proporcional de 240px (10:1)');

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
  assert(CATALOG_GROUPS.length === 7, `M-11: CATALOG_GROUPS agrupa el catálogo en 7 familias comerciales (encontradas: ${CATALOG_GROUPS.length})`);
  
  const networkGroup = CATALOG_GROUPS.find(g => g.id === 'network');
  assert(networkGroup && networkGroup.types.includes('switch') && networkGroup.types.includes('router') && networkGroup.types.includes('firewall') && networkGroup.types.includes('ap'), 'M-11: El grupo "network" consolida switches, routers, firewalls, APs y patch panels');

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
