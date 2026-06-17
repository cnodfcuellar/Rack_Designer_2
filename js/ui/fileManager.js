/**
 * fileManager.js
 * Gestiona el guardado y apertura de proyectos usando la File System Access API.
 * Proporciona un fallback para navegadores que no lo soporten.
 */

const fileManager = {
  fileHandle: null,
  fileName: 'Nuevo Proyecto',
  autoSaveTimer: null,
  isSupported: 'showOpenFilePicker' in window,

  /** Actualiza la UI para mostrar el nombre del archivo actual */
  updateUI() {
    const titleSpan = document.getElementById('project-filename');
    if (titleSpan) {
      titleSpan.textContent = this.fileName;
    }
  },

  async requestPermission(handle, withWrite = true) {
    const opts = { mode: withWrite ? 'readwrite' : 'read' };
    if ((await handle.queryPermission(opts)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(opts)) === 'granted') {
      return true;
    }
    return false;
  },

  /** Abre un archivo seleccionando en disco */
  async openProject() {
    if (this.isSupported) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Archivos Rack Designer',
            accept: { 'application/json': ['.rack', '.json'] }
          }],
          multiple: false
        });
        
        this.fileHandle = handle;
        this.fileName = handle.name;
        this.updateUI();

        const file = await handle.getFile();
        const text = await file.text();
        this.loadDataFromString(text);

        notify(`Archivo cargado: ${this.fileName}`, 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          notify('Error al abrir el archivo', 'error');
        }
      }
    } else {
      // Fallback
      document.getElementById('import-file').click();
    }
  },

  /** Guarda el archivo actual. Si no hay handle, hace "Guardar como" */
  async saveProject() {
    if (!this.isSupported) {
      this.downloadFallback();
      return;
    }

    if (!this.fileHandle) {
      return this.saveProjectAs();
    }

    try {
      const hasPermission = await this.requestPermission(this.fileHandle, true);
      if (!hasPermission) {
        notify('Sin permisos para guardar. Use "Guardar como..."', 'error');
        return;
      }
      
      await this.writeToFile(this.fileHandle);
      notify('Guardado exitosamente', 'success');
    } catch (error) {
      console.error(error);
      notify('Error al guardar el archivo', 'error');
    }
  },

  /** Fuerza a elegir un nuevo archivo donde guardar */
  async saveProjectAs() {
    if (!this.isSupported) {
      this.downloadFallback();
      return;
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: this.fileName.endsWith('.rack') ? this.fileName : 'datacenter.rack',
        types: [{
          description: 'Archivos Rack Designer',
          accept: { 'application/json': ['.rack'] }
        }]
      });
      
      this.fileHandle = handle;
      this.fileName = handle.name;
      this.updateUI();
      
      await this.writeToFile(handle);
      notify(`Guardado como: ${this.fileName}`, 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
        notify('Error al guardar el archivo', 'error');
      }
    }
  },

  /** Autoguardado silencioso con debounce */
  autoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    
    this.autoSaveTimer = setTimeout(async () => {
      // Solo autoguardar si hay un handle y tenemos permisos (evitar popups indeseados)
      if (this.isSupported && this.fileHandle) {
        try {
          const perm = await this.fileHandle.queryPermission({ mode: 'readwrite' });
          if (perm === 'granted') {
            await this.writeToFile(this.fileHandle);
            // Pequeño indicador de autoguardado (opcional)
            const titleSpan = document.getElementById('project-filename');
            if (titleSpan) {
              const original = titleSpan.textContent;
              titleSpan.textContent = this.fileName + ' (Guardado)';
              setTimeout(() => { titleSpan.textContent = this.fileName; }, 2000);
            }
          }
        } catch (e) {
          console.warn('Autosave falló silenciosamente', e);
        }
      }
    }, 3000); // 3 segundos después del último cambio
  },

  /** Escribe el JSON en el handle actual */
  async writeToFile(handle) {
    const data = { version: 1, project: store._raw, catalog: CATALOG };
    const content = JSON.stringify(data, null, 2);
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  },

  /** Fallback original */
  downloadFallback() {
    const data = { version: 1, project: store._raw, catalog: CATALOG };
    downloadJSON(data, this.fileName.endsWith('.rack') ? this.fileName : 'datacenter.rack');
    notify('Proyecto descargado (Fallback)', 'success');
  },

  loadDataFromString(text) {
    try {
      const data = JSON.parse(text);
      if (data.project) {
        store.loadData(data.project);
        if (data.catalog) {
          CATALOG.length = 0;
          data.catalog.forEach(c => CATALOG.push(c));
          if(typeof renderCatalog === 'function') renderCatalog();
        }
      } else if (data.rooms) { // formato antiguo
        store.loadData(data);
      } else {
        notify('Archivo inválido', 'error');
      }
    } catch(err) {
      notify('Error al parsear el archivo', 'error');
    }
  }
};
