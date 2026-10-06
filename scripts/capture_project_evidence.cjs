const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(__dirname, '../.temp_chrome_evidence');
const artifactDir = 'C:/Users/admin/.gemini/antigravity-ide/brain/0de4ef5c-00eb-4497-8397-285133a7672b';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const msgId = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res && res.result ? res.result.value : null;
  }

  async screenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Captura guardada en: ${outPath}`);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('🚀 Iniciando Chrome Headless para captura de evidencias...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,1050',
    `--user-data-dir=${userDataDir}`
  ]);

  await sleep(1500);

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('🔗 Conectado a Chrome:', versionData.Browser);

    // 1. Suite de Pruebas Web
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:8000/tests/index.html', { method: 'PUT' });
    const tabData = await newTabRes.json();
    const client = new CDPClient(tabData.webSocketDebuggerUrl);

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('⏳ Disparando suite de pruebas web...');
    await client.eval(`
      if (typeof window.runAllTests === 'function') {
        window.runAllTests();
      }
    `);

    for (let i = 0; i < 40; i++) {
      await sleep(500);
      const stats = await client.eval(`({ total: totalTests, passed: passedTests, failed: failedTests })`);
      if (stats && stats.total >= 330) {
        console.log(`✅ Pruebas web finalizadas al 100%: ${stats.total} pruebas (${stats.passed} pasadas, ${stats.failed} falladas).`);
        break;
      }
    }

    await sleep(600);
    const testScreenshotPath = path.join(artifactDir, 'evidence_01_test_suite_web.png');
    await client.screenshot(testScreenshotPath);

    // 2. Navegar a la consola del Datacenter
    console.log('🏢 Navegando a la consola del Datacenter (index.html)...');
    await client.send('Page.navigate', { url: 'http://localhost:8000/index.html' });
    await sleep(1500);

    // Autenticar como Admin y cargar datos de demostración si es necesario
    await client.eval(`
      if (window.RackAuth && typeof window.RackAuth.login === 'function') {
        window.RackAuth.login('rack2024');
      } else {
        const pinInput = document.getElementById('pin-input');
        if (pinInput) pinInput.value = 'rack2024';
        const btnAuth = document.getElementById('btn-admin-auth');
        if (btnAuth) btnAuth.click();
      }

      // Si no hay datos, o si quedó en una sala temporal vacía, resetear a demo limpia
      if (typeof window.loadDemoData === 'function') {
        window.loadDemoData();
      }

      // Cerrar modales que hayan quedado abiertos
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));

      // Asegurar que la sala activa sea la principal
      const dc1 = window.store.state.rooms.find(r => r.name.includes('Data Center') || r.id === 'room-dc1') || window.store.state.rooms[0];
      if (dc1 && typeof window.store.setCurrentRoom === 'function') {
        window.store.setCurrentRoom(dc1.id);
      }

      // Activar tema oscuro
      if (typeof window.applyTheme === 'function') {
        window.applyTheme('dark');
      }

      // Asegurar vista física
      const physTab = document.querySelector('.view-tab[data-view="physical"]');
      if (physTab) physTab.click();

      if (typeof window.renderAll === 'function') {
        window.renderAll({ source: 'loadData' });
      }
    `);
    await sleep(1500);

    const physicalScreenshotPath = path.join(artifactDir, 'evidence_02_datacenter_physical.png');
    await client.screenshot(physicalScreenshotPath);

    // 3. Conmutar a vista de Topología y estilo Hardware Skins
    console.log('🌐 Conmutando a la vista de Topología con Hardware Skins (M-28)...');
    await client.eval(`
      const topoTab = document.querySelector('.view-tab[data-view="topology"]');
      if (topoTab) topoTab.click();

      const btnImage = document.getElementById('topo-opt-image');
      if (btnImage) btnImage.click();
      else if (typeof window.setTopologyStyle === 'function') {
        window.setTopologyStyle('image');
      }

      if (typeof window.renderTopology === 'function') {
        window.renderTopology();
      }
    `);
    await sleep(2000);

    const topoScreenshotPath = path.join(artifactDir, 'evidence_03_topology_hardware_skins.png');
    await client.screenshot(topoScreenshotPath);

    // 4. Cambiar a Tema Sepia ergonómico (M-18)
    console.log('☕ Conmutando a Tema Sepia en vista física (M-18)...');
    await client.eval(`
      const physTab = document.querySelector('.view-tab[data-view="physical"]');
      if (physTab) physTab.click();

      if (typeof window.applyTheme === 'function') {
        window.applyTheme('sepia');
      }
      if (typeof window.renderAll === 'function') {
        window.renderAll({ source: 'themeChange' });
      }
    `);
    await sleep(1500);

    const sepiaScreenshotPath = path.join(artifactDir, 'evidence_04_datacenter_sepia_theme.png');
    await client.screenshot(sepiaScreenshotPath);

    // 5. Restaurar tema oscuro y abrir modal de equipo con personalización de Skins (M-28)
    console.log('⚙️ Abriendo modal de equipo (#modal-device) con opciones de Hardware Skins...');
    await client.eval(`
      if (typeof window.applyTheme === 'function') {
        window.applyTheme('dark');
      }
      const dev = window.store.state.devices.find(d => d.type === 'server') || window.store.state.devices[0];
      if (dev && typeof window.openEditDeviceModal === 'function') {
        window.openEditDeviceModal(dev.id);
      }
    `);
    await sleep(1200);

    const modalScreenshotPath = path.join(artifactDir, 'evidence_05_device_hardware_modal.png');
    await client.screenshot(modalScreenshotPath);

    // 6. Abrir modal de conexiones con botón Swap de orientación (M-41)
    console.log('🔌 Abriendo modal de conexiones (#modal-cable) con botón Swap e inversión (M-41)...');
    await client.eval(`
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      const conn = window.store.state.connections[0];
      if (conn && typeof window.openEditCableModal === 'function') {
        window.openEditCableModal(conn.id);
      }
    `);
    await sleep(1200);

    const cableModalScreenshotPath = path.join(artifactDir, 'evidence_06_cable_swap_modal.png');
    await client.screenshot(cableModalScreenshotPath);

    client.close();
    console.log('🎉 ¡Todas las capturas de evidencia se completaron con éxito!');
  } catch (err) {
    console.error('❌ Error capturando evidencias:', err);
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch(e) {}
  }
}

run();
