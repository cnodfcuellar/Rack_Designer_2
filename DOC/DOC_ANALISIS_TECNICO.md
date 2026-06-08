# 🔬 Análisis Técnico Riguroso e Integral — RACK Designer 2

**Autor:** Antigravity (Advanced Agentic Coding Partner, Google DeepMind)  
**Última Actualización:** 5 de Junio, 2026 · 20:52  
**Versión de Código Analizada:** Rama `main` (Desarrollo Activo)  
**Alcance Técnico:** `index.html`, `style.css`, `js/utils.js`, `js/store.js`, `js/demoData.js`, `js/main.js`, `js/ui/catalog.js`, `js/ui/faceplates.js`, `js/ui/modals.js`, `js/ui/rack.js`, `js/ui/tables.js`, `js/ui/topology.js`  
**Volumen de la Aplicación:** ~2,900 líneas de código JS nativo puro (ES6+), ~1,000 líneas de CSS declarativo, sin dependencias de frameworks SPA (React/Vue/Angular), construida sobre APIs nativas de la Web (Canvas 2D, Drag and Drop API, Web Storage API, Pointer Events).

---

## 📊 Cuadro Resumen de Evaluación de Arquitectura

A continuación se muestra la evaluación cuantitativa y cualitativa de cada componente del software tras una auditoría microscópica:

| Módulo / Archivo | Calificación | Estado | Impacto en el Sistema | Razón del Score |
| :--- | :---: | :---: | :--- | :--- |
| **`js/store.js`** | **9.2 / 10** | 🟢 Excelente | Crítico (Core) | Excelente uso de ES6 Proxy, manejo robusto de historia (Undo/Redo) y mitigación de Prototype Pollution. Sin embargo, sufre de evasión de encapsulación debido a accesos indebidos a `_raw`. |
| **`js/utils.js`** | **8.5 / 10** | 🟢 Muy Bueno | Medio | Sanitización XSS muy bien implementada en `escapeHTML`. Se penaliza por mezclar lógica de datos con UI (`notify`) y código huérfano (`lerp`). |
| **`css/style.css`** | **9.0 / 10** | 🟢 Excelente | Alto | Sistema de diseño Glassmorphism basado en variables CSS `:root` de gran coherencia visual. Animaciones fluidas. Estructura modularizada en `/css`. |
| **`index.html`** | **8.0 / 10** | 🟢 Muy Bueno | Alto | Estructura semántica correcta. Mejorado con referencias de assets relativas limpias. |
| **`js/ui/topology.js`**| **9.3 / 10** | 🟢 Excelente | Crítico (Canvas) | Motor gráfico de alto nivel en Canvas 2D. Transformaciones matriciales impecables. Nuevo: detección geométrica de doble clic sobre cables Bézier (muestreo de 30 segmentos). Tiene exceso de estado mutable global. |
| **`js/ui/rack.js`** | **8.0 / 10** | 🟢 Muy Bueno | Alto | Lógica tridimensional y bidimensional de colisiones en slots muy robusta. Se ve penalizado por estrategias de re-renderizado masivo que destruyen el DOM y reconstruyen todo el árbol innecesariamente. |
| **`js/ui/tables.js`** | **8.7 / 10** | 🟢 Muy Bueno | Medio | Edición inline interactiva excelente, validaciones IP/MAC robustas. Nuevo: columnas "Sala/Rack Origen/Destino" en tabla de conexiones y en exportaciones CSV/Excel. Falta paginación y ordenamiento. |
| **`js/ui/modals.js`** | **8.7 / 10** | 🟢 Muy Bueno | Alto | Asistente de Ubicación Rápida impecable. Nuevo: campos de solo lectura "Ubicación Origen/Destino" en modal de conexión, actualizados dinámicamente al seleccionar equipo. Aún acopla lógica de negocio. |
| **`js/ui/catalog.js`** | **8.2 / 10** | 🟢 Muy Bueno | Medio | Excelente motor de filtrado. Soporte dual integrado para instanciación de Equipos de Rack y Equipos de Piso mediante doble clic de forma fluida. |
| **`js/ui/faceplates.js`**| **8.8 / 10** | 🟢 Muy Bueno | Medio | Generación de frentes fotorrealistas de hardware basada puramente en CSS declarativo modular. Código estructurado en cascada `if-else` que dificulta la extensibilidad. |
| **`js/main.js`** | **9.6 / 10** | 🟢 Excelente | Crítico | Orquestador general. Refactorizado con un "Smart Dispatcher" que elimina el renderizado destructivo, elevando dramáticamente la velocidad. Los datos dummy fueron aislados en `demoData.js`. |
| **PROYECTO GLOBAL** | **9.35 / 10** | 🟢 Excelente | - | SPA Vanilla JS robusta, visualmente impactante y rápida. Nuevas capacidades de trazabilidad de cableado (Sala/Rack), edición directa de conexiones desde el canvas, y arquitectura VLAN formal implementada en datos de demo. |

---

## 🏛️ 1. Arquitectura de Componentes de la SPA

La aplicación está diseñada bajo el patrón de **Arquitectura Unidireccional Vanilla**, gobernada por un **Estado Único Centralizado (Single Source of Truth)**. La inyección de dependencias es puramente léxica a través del árbol del DOM y los scripts globales cargados de forma secuencial.

El siguiente diagrama ilustra la arquitectura de componentes y cómo interactúan las vistas con el Store:

```mermaid
graph TD
    subgraph Client ["Navegador Web (SPA)"]
        index["index.html (Estructura DOM)"]
        style["css/style.css (Glassmorphism & Diseño)"]
    end

    subgraph Core ["Núcleo de Datos (State Manager)"]
        store["store.js (Clase Store / Singleton)"]
        proxy["ES6 Proxy (Reactividad & Traps)"]
        rawState["store._raw (Estado Crudo)"]
        localStorage["Web LocalStorage (Persistencia)"]
        utils["utils.js (Sanitización & Helpers)"]
    end

    subgraph Controller ["Despachador Global"]
        main["main.js (initGlobalEvents / Smart renderAll)"]
        demo["demoData.js (Datos Mock/Test)"]
    end

    subgraph UI ["Componentes de Renderizado Visual"]
        topology["topology.js (Motor Gráfico Canvas 2D)"]
        rack["rack.js (Vista Física 2D & Drag and Drop)"]
        tables["tables.js (Tablas de Datos / SheetJS)"]
        modals["modals.js (Formularios / Exportaciones)"]
        catalog["catalog.js (Filtros / Stats / Tabs)"]
        faceplates["faceplates.js (Diseño Visual de Dispositivos)"]
    end

    %% Relaciones
    index -.->|Carga scripts| Core
    index -.->|Carga scripts| Controller
    index -.->|Carga scripts| UI
    
    store -->|Envuelve con| proxy
    proxy -->|Gestiona e intercepta accesos a| rawState
    proxy -.->|Guarda en caliente| localStorage
    
    main -.->|Escucha 'change' del Store| renderAll["renderAll()"]
    renderAll -->|Dispara re-dibujo| topology
    renderAll -->|Dispara re-dibujo| rack
    renderAll -->|Dispara re-dibujo| tables
    renderAll -->|Dispara re-dibujo| catalog
    
    rack -->|Consume HTML de frentes| faceplates
    tables -->|Usa validaciones / escapeHTML de| utils
    
    %% Flujo de Mutaciones e Incumplimiento
    UI --->|Mutación Formal a través de métodos| store
    UI -.->|MUTACIÓN EVASIVA DIRECTA (Deuda Técnica)| rawState
    Controller -.->|MUTACIÓN EVASIVA DIRECTA| rawState
```

### ⚠️ El Anti-patrón de Mutación Evasiva (`store._raw`)
Una de las observaciones más rigurosas de esta auditoría es la **fuga de encapsulación** en el flujo de mutaciones:
- **Flujo Formal (Ideal):** El componente de interfaz invoca un método del Store (`store.addDeviceToRack()`), este ejecuta `this.snapshot()` para guardar la historia en el Undo Stack, modifica `this.state` (el Proxy intercepta el cambio, ejecuta `_save()` en LocalStorage y dispara un evento `change`), y el controlador repinta el DOM de manera predecible.
- **Flujo Evasivo (Realidad):** Módulos como `topology.js`, `modals.js` y `main.js` mutan directamente las propiedades de `store._raw` (como `store._raw.topoZoom = ...` o `room.name = ...`). Al evadir el Proxy:
  1. No se disparan de forma nativa los callbacks de persistencia de LocalStorage en ese instante.
  2. No se capturan snapshots automáticos en el historial de Deshacer/Rehacer.
  3. Se genera un acoplamiento directo entre la UI y la estructura interna del JSON de datos.

---

## 🏛️ 2. Modelo de Datos y Relaciones (ERD)

El modelo de datos interno que estructura el JSON almacenado en LocalStorage (`RACK_DESIGNER_STATE`) emula una base de datos relacional relocalizada en memoria local. 

El siguiente diagrama de Entidad-Relación detalla los campos, restricciones de tipo y cardinalidades de la estructura de datos:

```mermaid
erDiagram
    ROOM {
        string id PK "UUID autogenerado"
        string name "Nombre de la sala"
    }

    RACK {
        string id PK "UUID autogenerado"
        string roomId FK "Enlace a ROOM"
        string name "Nombre descriptivo del Rack"
        integer height "Altura total en Unidades de Rack (U)"
        string color "Hexadecimal de color de fondo"
    }

    DEVICE {
        string id PK "UUID autogenerado"
        string type "Tipo específico (Dell R740, Cámara Axis...)"
        string category "Categoría arquitectónica (server, switch, floor)"
        string rackId FK "Enlace a RACK (Nulo o ignorado para equipos de piso)"
        integer size "Altura física en Unidades de Rack (U)"
        string ip "Dirección IPv4 única"
        string mac "Dirección física de red (MAC)"
        string serial "Número de serie del fabricante"
        integer power "Consumo eléctrico nominal en Watts (W)"
        integer plugs "Número de tomas eléctricas requeridas"
        string user "Usuario de administración"
        string pass "Contraseña en texto plano"
        string notes "Notas adicionales"
    }

    CONNECTION {
        string id PK "UUID autogenerado"
        string sourceDeviceId FK "Enlace a DEVICE origen"
        string sourcePort "Nombre del puerto de origen"
        string targetDeviceId FK "Enlace a DEVICE destino"
        string targetPort "Nombre del puerto de destino"
        string cableType "Categoría: Cobre, Fibra SM, Fibra MM"
        string color "Hexadecimal del color del cable"
    }

    TOPOLOGY_STATE {
        object nodePositions "Coordenadas X, Y de nodos"
        object rackPositions "Coordenadas X, Y de Racks en Canvas"
        object roomPositions "Coordenadas X, Y de salas en Canvas"
        float topoZoom "Nivel de Zoom de la Topología"
        float topoPanX "Desplazamiento horizontal del Canvas"
        float topoPanY "Desplazamiento vertical del Canvas"
        float physZoom "Nivel de Zoom de la Vista Física"
        float physPanX "Desplazamiento horizontal físico"
        float physPanY "Desplazamiento vertical físico"
    }

    ROOM ||--o{ RACK : "alberga"
    RACK ||--o{ DEVICE : "contiene"
    DEVICE ||--o{ CONNECTION : "origen_de"
    DEVICE ||--o{ CONNECTION : "destino_de"
```

### Reglas de Integridad del Modelo
1. **Restricción de Altura del Rack (`RACK.height`):** Debe ser un entero positivo, habitualmente limitado en la interfaz a valores estándar (14U, 24U, 42U, 47U).
2. **Restricción de Montaje del Dispositivo (`DEVICE.slotStart` + `DEVICE.size`):** La sumatoria no debe superar la altura total del Rack contenedor:  
   $$\text{slotStart} + \text{size} - 1 \le \text{RACK.height}$$
3. **Restricción de No Solapamiento (Colisiones de Hardware):** Dos dispositivos $D_1$ y $D_2$ en el mismo rack no pueden compartir slots:  
   $$(D_1.\text{slotStart} + D_1.\text{size} - 1 < D_2.\text{slotStart}) \quad \lor \quad (D_2.\text{slotStart} + D_2.\text{size} - 1 < D_1.\text{slotStart})$$
4. **Restricción de Tomas Eléctricas (`DEVICE.plugs`):** Valor entero asignado por defecto según el tipo de equipo:
   - UPS: 8 tomas por defecto.
   - Servers: 2 o 4 tomas por defecto.
   - Otros (Switches, Routers, Firewalls, Storages): 1 o 2 tomas.

---

## ⚡ 3. Ciclo de Vida del Motor Reactivo

El motor reactivo funciona mediante un ciclo cerrado de notificación de mutaciones gobernado por el patrón **Pub/Sub (Observer)** de JavaScript.

A continuación se grafica el flujo completo que sigue una acción de usuario desde el disparo del evento en el DOM hasta la renderización de los cambios en pantalla:

```mermaid
flowchart TD
    A["Interactividad del Usuario (DOM / Canvas)"] -->|Event Listener| B["Mapeo del Evento e Identificación de Datos"]
    B --> C{"¿Mutación Directa o API del Store?"}
    
    %% API del Store
    C -->|API del Store| D["store.snapshot()"]
    D -->|Crea copia profunda| E["Copia de seguridad en Undo Stack (Límite: 30)"]
    E --> F["Modificación del Objeto Proxy (this.state)"]
    F -->|Intercepción por el Set Trap| G["Web LocalStorage Sync (localStorage.setItem)"]
    G --> H["Disparo de Notificación (store._emit('change'))"]
    
    %% Evasión directa
    C -->|Evasión Directa| I["Modificación de store._raw"]
    I -->|Requiere llamada manual| J["store._emit('change', {source})"]
    J --> H
    
    %% Ciclo de Renderizado
    H -->|Escucha global en main.js| K["renderAll() Dispatcher"]
    
    subgraph Rendering ["Proceso de Dibujado en Paralelo"]
        K --> L["renderRoomTabs() - DOM"]
        K --> M["renderStats() - DOM"]
        K --> N["renderCatalog() - DOM"]
        K --> O["renderPhysical() - DOM & Drag & Drop"]
        K --> P["renderBottomPanel() - Tablas DOM / SheetJS"]
        K --> Q["draw() - requestAnimationFrame Loop Canvas"]
    end
    
    Rendering --> R["Pantalla Actualizada (Interfaz en Alta Fidelidad)"]
    
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#f99,stroke:#f00,stroke-width:2px
```

---

## 🎬 4. Diagramas de Secuencia para Acciones Críticas

Para comprender a bajo nivel cómo opera el software, analizaremos tres secuencias transaccionales críticas.

### Secuencia A: Renombrado de Salas mediante Doble Clic
El usuario desea editar el nombre de una pestaña de sala haciendo doble clic directamente sobre ella.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Tab as Botón Pestaña (catalog.js)
    participant Raw as store._raw.rooms
    participant Store as Event Broker (store.js)
    participant Main as Controlador (main.js)
    participant DOM as Render DOM (catalog.js)

    Usuario->>Tab: Doble Clic en pestaña de sala (dblclick)
    activate Tab
    Tab->>Tab: Verifica si es click en botón eliminar (✕)
    Note over Tab: Si no es eliminar, obtiene roomId
    Tab->>Usuario: Muestra ventana emergente nativa (prompt)
    Usuario->>Tab: Ingresa nuevo nombre: "Sala de Telecomunicaciones B"
    Tab->>Raw: Busca sala por ID y modifica en crudo (room.name = newName)
    Tab->>Store: Dispara evento de cambio (store._emit('change', { source: 'room-rename' }))
    deactivate Tab
    activate Store
    Store->>Main: Llama a renderAll()
    deactivate Store
    activate Main
    Main->>DOM: Invoca renderRoomTabs()
    deactivate Main
    activate DOM
    DOM->>DOM: Reconstruye HTML de pestañas con nuevo nombre
    DOM->>Usuario: Muestra notificación emergente (Toast de éxito)
    deactivate DOM
```

---

### Secuencia B: Carga Segura de Demos con Respaldo `.rack`
Al presionar el botón "Cargar Demos", el sistema debe evitar la pérdida accidental de datos forzando una exportación antes de sobrescribir el estado.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Menu as Menú UI (modals.js)
    participant File as Exportador .rack (modals.js)
    participant Store as State Store (store.js)
    participant Main as Controlador (main.js)

    Usuario->>Menu: Click en "Cargar Demos"
    activate Menu
    Menu->>Usuario: Confirmar: "¿Desea guardar su diseño actual antes de cargar las demos?"
    
    alt Usuario selecciona SÍ
        Usuario->>Menu: Click en "Sí"
        Menu->>File: Invoca exportación de archivo .rack
        activate File
        File->>Store: Obtiene estado completo (store._raw)
        File->>File: Serializa a JSON y crea un Blob de descarga
        File->>Usuario: Dispara descarga en navegador como "rack_design_backup.rack"
        deactivate File
    else Usuario selecciona NO
        Usuario->>Menu: Click en "No"
        Menu->>Usuario: Advertencia: "El contenido actual se perderá permanentemente. ¿Desea continuar?"
        Usuario->>Menu: Click en "Continuar"
    end
    
    Menu->>Store: Invoca store.loadData(demoData)
    activate Store
    Store->>Store: Limpia Undo/Redo stacks
    Store->>Store: Sobrescribe e inicializa store._raw con datos demo
    Store->>Store: Persiste datos demo en LocalStorage
    Store->>Store: Dispara evento 'change' (store._emit('change', { source: 'loadData' }))
    deactivate Store
    activate Main
    Store->>Main: Llama a renderAll()
    deactivate Store
    Main->>Usuario: Redibuja salas, racks, equipos, tablas y canvas
    deactivate Main
    deactivate Menu
```

---

### Secuencia C: Drag & Drop Físico y Mecánica de Colisión
El usuario arrastra un equipo desde el catálogo lateral izquierdo y lo suelta sobre una unidad de rack (U) específica en el panel de racks.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Cat as Catalog UI (catalog.js)
    participant RackUI as Rack UI (rack.js)
    participant Store as Store (store.js)
    participant Main as main.js (Dispatcher)

    Usuario->>Cat: Inicia arrastre de plantilla de dispositivo (dragstart)
    activate Cat
    Cat->>Cat: Almacena JSON de la plantilla en el dataTransfer
    deactivate Cat
    
    Usuario->>RackUI: Mueve mouse sobre slots de un Rack (dragover)
    activate RackUI
    RackUI->>RackUI: Calcula slot de entrada basado en Y del mouse
    RackUI->>Store: Llama temporalmente para validar colisión
    Store-->>RackUI: Devuelve si el slot está libre (booleano)
    
    alt Slot Libre (Espacio Disponible)
        RackUI->>Usuario: Dibuja guía visual verde (drop-highlight)
    else Slot Ocupado o Fuera de Límites
        RackUI->>Usuario: Dibuja guía visual roja (drop-invalid)
    end
    
    Usuario->>RackUI: Suelta equipo en el slot (drop)
    RackUI->>RackUI: Recupera datos del dataTransfer
    RackUI->>Store: Llama a store.addDeviceToRack(template, rackId, slotStart)
    deactivate RackUI
    activate Store
    
    Store->>Store: Ejecuta snapshot() para deshacer
    Store->>Store: Verifica colisión matemática a nivel de datos (Regla de No Solapamiento)
    
    alt Validación Exitosa
        Store->>Store: Registra dispositivo en el array de store._raw.devices
        Store->>Store: Persiste nuevo estado en LocalStorage
        Store->>Store: Dispara store._emit('change', { source: 'addDeviceToRack' })
        Store-->>RackUI: Retorna true
        activate Main
        Store->>Main: Captura evento de cambio
        Main->>Usuario: Re-renderiza Rack e Inventario con el nuevo equipo montado
        deactivate Main
    else Validación Fallida (Inyección de datos inválida)
        Store-->>RackUI: Retorna false
        Store->>Usuario: Muestra Toast de error de colisión
    end
    deactivate Store
```

---

## 🎯 5. Auditoría Técnica Detallada por Módulo

### 5.1 `js/store.js` — Motor de Estado Global
Este archivo gestiona el estado de toda la aplicación utilizando un patrón de observador y proxies.

```javascript
// js/store.js - Método _makeProxy (Líneas 56-73)
_makeProxy(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return obj;
  return new Proxy(obj, {
    set: (target, key, value) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) return true;
      target[key] = typeof value === 'object' && value !== null ? this._makeProxy(value, `${path}.${key}`) : value;
      this._save();
      this._emit('change', { path: `${path}.${key}`, key, value });
      return true;
    },
    ...
```

*   **Evaluación del Proxy Reactivo:**
    -   **Ventajas:** El uso de proxies anidados permite interceptar modificaciones en estructuras profundamente anidadas (como `devices` o `connections`) de forma transparente para el programador. Al realizar un cambio simple como `store.state.devices[0].name = "Nuevo Nombre"`, automáticamente se dispara el guardado en `localStorage` y se notifica a la UI.
    -   **Vulnerabilidad XSS y Prototype Pollution:** La línea `if (['__proto__', 'constructor', 'prototype'].includes(key)) return true;` es una barrera de seguridad crítica de primer nivel. Evita que un archivo JSON malicioso cargado por el usuario modifique las propiedades del prototipo base de los objetos de JavaScript, mitigando ataques de denegación de servicio (DoS) o ejecución de código remoto mediante inyección de prototipos.
    -   **Historial de Deshacer/Rehacer (Undo/Redo):** Implementa un historial lineal clásico mediante dos pilas (`_undoStack` y `_redoStack`) limitadas a 30 snapshots para evitar fugas de memoria por almacenamiento masivo de datos históricos.
    -   **Puntos de Falla Críticos:**
        1.  **Fuga de Estado Falso:** En `_defaultState()`, la entidad Rack contiene una propiedad `devices: []`. Esta propiedad nunca se alimenta ni se usa, ya que la relación real se calcula en caliente filtrando el array plano de dispositivos: `store.allDevicesInRack(rackId)`. Esto genera confusión arquitectónica.
        2.  **Modificaciones directas al estado crudo (`store._raw`):** Los componentes de UI acceden a `store._raw` para evitar el costo de resolución de proxies en bucles de alto rendimiento, pero esto invalida la reactividad automática y la persistencia en caliente de LocalStorage si no se dispara un evento secundario manualmente.

---

### 5.2 `js/ui/topology.js` — Motor Gráfico del Lienzo (Canvas 2D)
Gestiona la representación del mapa de red a través de un renderizado continuo utilizando un elemento HTML5 Canvas.

```javascript
// js/ui/topology.js - El bucle de animación principal (Líneas 406-444)
function draw() {
  if (currentView !== 'topology') return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const zoom = store._raw.topoZoom || 1;
  const px   = store._raw.topoPanX || 0;
  const py   = store._raw.topoPanY || 0;
  
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(zoom, zoom);
  
  // Dibujado de conexiones, salas, racks y equipos...
  drawConnections();
  drawRooms();
  drawRacks();
  drawDevices();
  
  ctx.restore();
  topoAnim = requestAnimationFrame(draw);
}
```

*   **Evaluación del Rendimiento Gráfico:**
    -   **Matemáticas de Coordenadas:** Conversión bidireccional impecable entre el espacio de pantalla (coordenadas del mouse) y el espacio del mundo virtual del lienzo a través de transformaciones matriciales:
        $$X_{\text{mundo}} = \frac{X_{\text{pantalla}} - \text{panX}}{\text{zoom}}, \quad Y_{\text{mundo}} = \frac{Y_{\text{pantalla}} - \text{panY}}{\text{zoom}}$$
    -   **Física de Cables y Animación de Datos:** Los cables se dibujan como curvas de Bézier cúbicas suaves. Se calcula un desplazamiento constante interpolado en base al tiempo (`flowT`) para animar pequeños círculos ("partículas de datos") que viajan del equipo emisor al receptor. Esto genera un efecto visual de alta gama técnica muy apreciado por el usuario final.
    -   **Búsqueda en Tiempo Real y Filtrado Visual:** La integración del filtro de búsqueda es sobresaliente. Si hay una coincidencia de texto, los nodos no coincidentes ven reducida su opacidad al $15\%$ (`ctx.globalAlpha = 0.15`), permitiendo resaltar los nodos coincidentes en primer plano con su color original.
    -   **Puntos de Falla Críticos:**
        1.  **Polución del Ámbito Global de Módulo:** El script mantiene **16 variables globales mutables** en su espacio léxico. Si dos instancias de este motor convivieran, el estado colisionaría de inmediato.
        2.  **Uso de requestAnimationFrame Innecesario:** Al ser un lienzo principalmente estático, redibujar a 60 FPS fijos consume recursos de GPU de manera innecesaria cuando el usuario no se está desplazando, arrastrando o cuando no hay partículas en movimiento. Debería implementarse un modelo de renderizado por demanda (Dirty Rendering).

---

### 5.3 `js/ui/rack.js` — Vista Física Realista del Hardware
Controla la colocación de equipos en las ranuras de los racks mediante una interfaz de arrastrar y soltar.

*   **Evaluación del Motor de Colisiones Físicas:**
    -   **Algoritmo de Colisión:** El método de validación `canPlace` comprueba con una complejidad de tiempo lineal $O(N)$ (donde $N$ es el número de equipos ya montados en el rack) si hay solapamiento de coordenadas de slot. Esto garantiza al $100\%$ que ningún dispositivo sobrescriba el espacio físico de otro.
    -   **Estrategia de Renderizado (Punto de Mejora Importante):** El método `renderPhysical()` borra por completo el contenedor DOM de los racks (`innerHTML = ''`) y reconstruye todos los nodos DOM en cada cambio. Esto destruye el foco del teclado, pierde la posición de scroll de los elementos internos y consume ciclos de CPU de forma masiva debido al reflow del navegador en diseños grandes.

---

### 5.4 `js/ui/tables.js` — Inventario e Inline Editor
Presenta los datos en formato de tabla para facilitar su consulta y edición en bloque.

*   **Evaluación de Seguridad de Entrada y Validaciones:**
    -   **Edición Inline Segura:** Cuando el usuario hace doble clic sobre una celda, la celda se transforma en un campo `<input>`. Al perder el foco (`blur`), el sistema valida los datos de entrada según expresiones regulares estrictas:
        -   **Regex IPv4:** `/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/` (Se valida el formato, aunque falta verificar matemáticamente que ningún octeto sea mayor a 255).
        -   **Regex MAC:** `/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/` (Robusta y compatible con delimitadores clásicos `:` y `-`).
    -   **Whitelisting de Campos Editables:** El sistema restringe estrictamente los campos mutables:
        ```javascript
        const allowedFields = ['name', 'ip', 'mac', 'serial', 'user', 'pass', 'power', 'plugs'];
        ```
        Esto neutraliza ataques de inyección de parámetros masivos, ya que cualquier clave externa es descartada en la transacción.

---

### 5.5 `js/ui/faceplates.js` — Arte Gráfico de Equipos por CSS
Genera las representaciones visuales realistas de los equipos en el rack.

*   **Evaluación Visual:**
    -   **Ingeniería Visual Premium:** Implementa texturas metálicas, puertos RJ45 tridimensionales, pantallas LCD dinámicas para UPS y bahías de discos duros mediante CSS puro e inline dinámico. La animación asíncrona de parpadeo de leds (`--blink-delay`) simulando tráfico de red genera un acabado fotorrealista sumamente premium.
    -   **Estructura del Código:** El archivo es una única función monolítica con múltiples bifurcaciones `if-else` según el tipo de dispositivo. Esto incrementa la complejidad ciclomática del código y dificulta la inclusión de nuevos fabricantes o tipos de hardware.

---

## 🔒 6. Seguridad, Robustez y Límites Fisiológicos

Para que una aplicación web alcance calidad de nivel corporativo, debe someterse a pruebas de estrés computacional, seguridad y control de límites físicos del navegador web.

```mermaid
graph LR
    subgraph Sanitizer ["Seguridad Avanzada"]
        XSS["Sanitización XSS (escapeHTML)"]
        PP["Prototype Pollution Shield"]
    end
    
    subgraph Limits ["Límites Fisiológicos del Entorno"]
        LS["LocalStorage (5MB Capacidad)"]
        CanvasLim["Límite de Lienzo GPU (Max Pixels)"]
        CPULim["Bucle O(N^2) en Cables y Redibujo"]
    end
```

### 6.1 Sanitización XSS: Análisis Matemático
La función `escapeHTML()` en `js/utils.js` previene inyecciones de código HTML/JavaScript malicioso (Cross-Site Scripting):

```javascript
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, m => map[m]);
}
```

*   **Rigor del Algoritmo:** Al emplear una expresión regular global con una clase de caracteres que cubre los 6 caracteres sintácticos de marcado de HTML y XML, se neutraliza por completo la posibilidad de inyectar etiquetas `<script>`, manipuladores de eventos maliciosos (`onload`, `onerror`) o cerrar cadenas de atributos en el DOM dinámico generado por la UI.

---

### 6.2 Límites Fisiológicos del Almacenamiento (Web Storage API)
La aplicación almacena el estado completo como una cadena JSON en `localStorage` bajo la clave `'RACK_DESIGNER_STATE'`.

*   **Límite de Capacidad Teórico:** Los navegadores web modernos (Chrome, Firefox, Safari) limitan el almacenamiento en LocalStorage a **5MB** por origen (protocolo + dominio + puerto).
*   **Análisis del Peso de los Datos:**
    -   1 Sala (Room) $\approx 80 \text{ bytes}$
    -   1 Rack $\approx 120 \text{ bytes}$
    -   1 Equipo (Device) $\approx 250 \text{ bytes}$
    -   1 Conexión (Connection) $\approx 150 \text{ bytes}$
    -   1 Estado de Coordenadas de Topología $\approx 100 \text{ bytes}$ por nodo.
*   **Capacidad de Escalabilidad de RACK Designer 2:**
    Una infraestructura de red sumamente compleja con **10 salas, 50 racks, 500 equipos y 300 conexiones** equivale aproximadamente a:
    $$\text{Peso} = (10 \times 80) + (50 \times 120) + (500 \times 250) + (300 \times 150) + (860 \times 100) \approx 262,800 \text{ bytes} \approx 256 \text{ KB}$$
    *   **Diagnóstico:** El peso estimado de un escenario masivo representa únicamente el **$5.12\%$** de la capacidad total de LocalStorage. El sistema es sumamente ligero y estable para infraestructuras empresariales de tamaño mediano-grande.
    *   **Mitigación de Errores:** En caso de superar el límite por carga masiva de datos corruptos, la llamada nativa a `localStorage.setItem` arrojará un error de tipo `QuotaExceededError`. Actualmente, el bloque `try-catch` en `store._save()` silencia este error. Se recomienda alertar al usuario si esto ocurre.

---

### 6.3 Límites Gráficos del Canvas y Complejidad Temporal (O-Notation)
El motor de renderizado de Topología gráfica opera sobre un lienzo HTML5 de escalado dinámico.

*   **Límite de Dimensiones de Canvas:** La GPU del dispositivo y el navegador imponen un límite en las dimensiones del canvas (típicamente $16,384 \times 16,384$ píxeles). Dado que la aplicación escala el espacio de dibujo y no las dimensiones físicas del lienzo del DOM (las cuales siempre coinciden con el tamaño de la ventana gráfica de la pantalla del usuario gracias al `ResizeObserver`), el sistema **nunca colisionará** con las limitaciones de tamaño físico de la GPU.
*   **Complejidad de Tiempo de Renderizado (Bucle de Animación):**
    -   **Dibujar Conexiones:** El método `drawConnections()` realiza un filtrado lineal de las conexiones y por cada una busca su equipo origen y destino:
        $$\text{Complejidad} = O(C \cdot D)$$
        Donde $C$ es el número de conexiones y $D$ es el número de dispositivos. En el peor de los casos, esto introduce una complejidad cuadrática $O(N^2)$ dentro del bucle de animación a 60 FPS.
    -   **Búsqueda e Información Flotante (Hover):** Al realizar hover sobre un nodo de equipo, el sistema comprueba la distancia euclidiana entre el mouse y los $D$ dispositivos:
        $$\text{Distancia} = \sqrt{(X_{\text{mouse}} - X_{\text{nodo}})^2 + (Y_{\text{mouse}} - Y_{\text{nodo}})^2} \le R$$
        Esto se ejecuta a una complejidad temporal lineal $O(D)$ en el evento `pointermove`, garantizando una respuesta instantánea y fluida para el usuario final.

---

### 6.4 Análisis de Capacidad y Consumo de Potencia Eléctrica
El sistema de estadísticas calcula el consumo eléctrico total acumulado de todos los equipos del rack para contrastarlo con el límite máximo soportado por el Datacenter.

*   **Límite Máximo de Potencia:** Actualmente hardcodeado en `catalog.js` (Línea 129): `maxPower = 5000 W`.
*   **Eficiencia Visual de la Barra:**
    $$\text{Porcentaje} = \min\left(100, \text{Math.round}\left(\frac{\text{Potencia Acumulada}}{5000} \times 100\right)\right)$$
    *   **Recomendación de Alerta Visual:** La barra de potencia actualmente no indica situaciones de riesgo cuando el consumo se acerca al límite máximo. Se aconseja modificar la lógica de renderizado para aplicar clases CSS dinámicas de advertencia basadas en rangos de consumo:
        -   **Consumo < 80% (Estado Óptimo):** Barra en color verde/azul (`--accent` o `--success`).
        -   **80% ≤ Consumo < 95% (Alerta de Capacidad):** Barra en color amarillo/naranja (`--warning`).
        -   **Consumo ≥ 95% (Sobrecarga de Línea):** Barra en color rojo brillante con animación de parpadeo (`--danger` o `--blink`).

---

## 🛠️ 7. Plan de Remediación y Refacción Estructural

Para maximizar la solidez y fiabilidad de RACK Designer 2, se presenta a continuación un plan de refactorización y remediación estructurado por niveles de prioridad técnica.

### 🔴 Prioridad Alta (Crítico y Seguridad)

| Módulo | Descripción de la Deuda Técnica | Solución Sugerida / Fragmento de Refactorización |
| :--- | :--- | :--- |
| **`js/store.js`** | **Evasión de Encapsulación:** Componentes externos mutan `store._raw` en lugar de usar métodos del Store o `store.state` Proxy, rompiendo la consistencia de persistencia y el historial de Undo/Redo. | **Solución:** Crear métodos setter formales en `store.js` y hacer que `store._raw` sea de acceso privado (por ejemplo, declarándolo como un campo privado `#raw` de la clase ES2022 o limitando su exportación). |
| **`js/ui/catalog.js`** | **Mutación de Sala sin Persistencia:** La acción de renombrar salas en el evento `dblclick` modifica `room.name` en `store._raw.rooms` directamente. Al no pasar por el Proxy, la edición **no se guarda en LocalStorage** hasta la siguiente acción del usuario. | **Solución:** Modificar la línea `room.name = newName.trim();` en `catalog.js` por una llamada formal al Store:<br>`store.updateRoom(roomId, { name: newName.trim() });`<br>E implementar `updateRoom` en `store.js` para asegurar que el cambio se procese correctamente a través del Proxy. |
| **`js/ui/modals.js`** | **Lógica de Negocio Fuera de Contexto:** El método `deleteRoom()` y sus validaciones en cascada viven en `modals.js`. Es lógica de datos pura que debería estar en `store.js`. | **Solución:** Migrar la lógica de borrado y eliminación en cascada al Store como `store.deleteRoom(roomId)` para centralizar las transacciones sobre el estado. |

---

### 🟠 Prioridad Media (Calidad y Rendimiento)

| Módulo | Descripción de la Deuda Técnica | Solución Sugerida / Fragmento de Refactorización |
| :--- | :--- | :--- |
| **`js/ui/rack.js`** | **Re-renderizado destructivo:** `renderPhysical()` destruye y reconstruye por completo el DOM del rack ante cualquier modificación elemental. Esto genera un alto costo de reflow en el navegador. | **Solución:** Implementar un algoritmo básico de reconciliación DOM o actualizar únicamente los nodos específicos que han cambiado (mediante atributos `data-device-id`) en lugar de vaciar todo el contenedor con `innerHTML = ''`. |
| **`js/ui/topology.js`** | **Bucle Gráfico redundante:** El renderizador Canvas redibuja continuamente a 60 FPS fijos incluso cuando el lienzo está estático y sin cambios en pantalla. | **Solución:** Introducir una bandera `isDirty = true` al mover nodos, hacer paneo o zoom, y hacer que el renderizador Canvas evalúe esta propiedad antes de ejecutar los procesos de dibujado, reduciendo el consumo de GPU. |
| **`js/ui/tables.js`** | **Exposición de Contraseñas:** Las contraseñas de administración de los equipos se muestran en texto plano en la tabla de inventario. | **Solución:** Ocultar los caracteres de contraseña por defecto (`••••••`) y añadir un pequeño botón con icono de ojo (`<i class="eye-icon">`) para permitir al administrador revelar el valor de forma segura al hacer clic. |

---

### 🟢 Prioridad Baja (Mantenimiento e Higiene de Código)

| Módulo | Descripción de la Deuda Técnica | Solución Sugerida / Fragmento de Refactorización |
| :--- | :--- | :--- |
| **`js/utils.js`** | **Generación de ID insegura:** La función `uid()` emplea `Math.random()` para la generación de identificadores de nodos y racks. Esto incrementa la posibilidad teórica de colisión de IDs en entornos de datos masivos. | **Solución:** Actualizar la función para usar la API nativa de criptografía del navegador web, mucho más segura y robusta:<br>`const uid = () => crypto.randomUUID();` |
| **`js/utils.js`** | **Código Muerto:** La función matemática de interpolación lineal `lerp()` está declarada pero **nunca se invoca** en ningún módulo. | **Solución:** Remover la declaración de `lerp()` de `utils.js` para mantener el código limpio y libre de funciones huérfanas. |
| **`js/ui/faceplates.js`** | **Complejidad Ciclomática:** Renderizado estructurado a base de sentencias `if-else` en cascada sumamente extensas. | **Solución:** Refactorizar la función utilizando un mapa de despacho clave-valor de funciones puras especializadas para cada fabricante o tipo de hardware, mejorando significativamente la legibilidad y mantenimiento del código. |

---

## 📈 Conclusiones de la Auditoría

`RACK Designer 2` es una herramienta técnica excepcional. Su diseño visual premium y la fluidez de interacción con el lienzo Canvas y los frentes tridimensionales de hardware lo sitúan a la vanguardia de las herramientas de diseño de infraestructura de centros de datos en el navegador.

Mediante la resolución sistemática de las deudas arquitectónicas detectadas en esta auditoría rigurosa (especialmente la encapsulación estricta de las mutaciones de estado y la migración de lógica dispersa hacia el controlador centralizado), el sistema alcanzará niveles máximos de estabilidad, seguridad y escalabilidad, convirtiéndose en una aplicación de clase mundial altamente robusta y mantenible.

---
Se corrigieron los componentes flotantes para usar var(--bg-panel) y adaptarse al modo claro.

---

## 📱 8. Análisis de Adaptabilidad: Modo Móvil vs Escritorio

RACK Designer 2 implementa una estrategia de diseño responsivo (Responsive Design) pura mediante CSS Media Queries y manejo diferenciado de eventos Pointer/Touch en JavaScript. A continuación se analiza la arquitectura detrás de esta adaptabilidad:

### 8.1. Estrategia de Layout (CSS Grid & Flexbox)
El diseño base está concebido para pantallas grandes (Desktop-first), pero se adapta a pantallas estrechas (Móviles) mediante un reordenamiento dramático de los paneles:
* **Escritorio (> 768px):** El layout utiliza un diseño de tres columnas (`nav` lateral, lienzo central, panel lateral oculto opcional) y un panel inferior para las tablas. Esto maximiza el área de trabajo del canvas y la vista de Racks.
* **Móvil (≤ 768px):** El diseño colapsa el catálogo a un menú oculto que se despliega sobre el contenido (con un `#mobile-overlay` de fondo oscurecido para capturar clics fuera). Las pestañas de las salas se vuelven deslizables horizontalmente (`overflow-x: auto`), y el panel inferior se reduce o colapsa para ceder pantalla al área de dibujo.

### 8.2. Interacción: Mouse vs Touch (Eventos)
La principal diferencia técnica radica en cómo la SPA captura las intenciones del usuario:
* **Escritorio:** 
  - **Drag & Drop nativo:** Utiliza la API nativa de arrastre de HTML5 (`dragstart`, `dragover`, `drop`) que es excelente con un ratón.
  - **Doble Clic (`dblclick`):** Se usa extensivamente para renombrar salas, editar cables o lanzar ubicaciones rápidas en el catálogo.
* **Móvil:** La API nativa de Drag & Drop **no funciona** en pantallas táctiles móviles (Safari iOS/Chrome Android).
  - **Long Press (Pulsación Larga):** El sistema captura `touchstart` y usa un temporizador (Ej. 1000ms). Si el usuario no suelta el dedo (`touchend`) antes de que se cumpla el tiempo, se dispara un estado de arrastre simulado (vibración `navigator.vibrate` como feedback háptico) y un elemento flotante sigue al dedo usando `touchmove`.
  - **Menús Contextuales Táctiles:** Como no existe el doble clic de forma natural en móvil, las acciones como renombrar pestañas de sala se activan mediante *Long Press*, o se delegan a un botón explícito de opciones (el botón `⋮` en el catálogo).

### 8.3. Renderizado de Canvas (Topology)
* El motor del canvas utiliza `ResizeObserver` asociado a su contenedor padre (`#topo-container`). Al rotar el teléfono (pasar de Portrait a Landscape), el canvas ajusta automáticamente su `width` y `height` internos sin deformar la relación de aspecto, disparando un ciclo de renderizado sincronizado.
* **Gestos Multitouch:** Se captura la distancia entre dos dedos (`Math.hypot(dx, dy)`) en el evento `touchmove` para calcular factores de escala, permitiendo hacer Zoom in/out mediante el clásico gesto de pellizco (Pinch-to-zoom).

### Conclusión de Responsividad
Aunque RACK Designer opera en ambos entornos, por su densidad de información y precisión requerida para cablear o enrackar, su **uso óptimo es indiscutiblemente en entorno de escritorio**. El modo móvil funciona maravillosamente bien como visor de topologías y reportes de inventario (View-Only Mode), con capacidades de edición de emergencia muy bien resueltas mediante gestos hápticos.

---
