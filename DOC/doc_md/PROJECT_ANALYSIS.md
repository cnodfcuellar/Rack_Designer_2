# Análisis Arquitectónico del Proyecto: RACK Designer Next

Este documento es una guía estructural dirigida a todos los agentes de IA y desarrolladores, proporcionando un mapa mental completo de la arquitectura del proyecto, la ubicación de sus módulos, la responsabilidad de cada archivo y el estado evolutivo de la plataforma.

---

## 1. Visión General de la Arquitectura

**RACK Designer Next** es una Aplicación Web Progresiva (PWA) interactiva y de alto rendimiento, diseñada para el diseño, simulación y documentación de infraestructuras de centros de datos (Gabinetes, Servidores, Switches, Routers, Patch Panels, PDUs, UPS y Conexiones de Red físicas y lógicas).

### Principios Fundamentales:
* **Zero-Build & Vanilla Web**: 100% Vanilla JavaScript (ES6+), HTML5 semántico y CSS3 moderno. Sin compiladores (Webpack, Vite), sin frameworks pesados (React, Vue, Angular) y sin pasos de compilación intermedios.
* **Reactividad Nativa mediante Proxy ES6**: El estado centralizado (`store.js`) intercepta mutaciones directamente con traps de `Proxy`, disparando autoguardado (`localStorage`) y eventos de re-renderizado selectivo (`renderAll({ source })`).
* **Motor Visual SVG-First**: Los equipos de rack se renderizan mediante archivos vectoriales SVG modulares e independientes (`assets/svg/default/`), inyectados dinámicamente en el DOM con caché en memoria (`SVG_INLINE_CACHE`), desacoplando la geometría visual del CSS global.
* **Gestión Dual de Vistas**:
  * **Vista Física (Rack 2D)**: Ranuras U de 24px, chasis interactivo frontal/trasero, drag-and-drop de dispositivos y trazado ortogonal de cables con rieles laterales.
  * **Vista Lógica (Topología Canvas 2D)**: Diagramación interactiva de nodos y enlaces con motor MVC dedicado, pan/zoom infinito y layout de fuerzas.

---

## 2. Archivos Raíz (Configuración y Entry Points)

* **`index.html`**: El punto de entrada principal de la aplicación. Contiene el esqueleto DOM (dashboard, barra superior, catálogo lateral, lienzo central, inspector derecho, tablas de datos inferiores y ventanas modales). Carga 32 scripts clásicos en orden determinista estricto.
* **`package.json` / `pnpm-lock.yaml`**: Configuración del ecosistema de dependencias. **Regla estricta:** uso exclusivo de `pnpm`. La única dependencia de desarrollo es `marked` (empleada para compilar manuales HTML desde Markdown).
* **`service-worker.js`**: Controlador de Service Worker para PWA, habilitando funcionamiento 100% offline (estrategia Cache-First con fallback a red) e instalabilidad de escritorio/móvil. Versión activa de caché: `rack-designer-next-cache-v12` con ciclo de vida automatizado (`reg.update()` en arranque).
* **`AGENTS.md`**: Reglas críticas para agentes de IA: directivas de arquitectura, flujo de datos unidireccional, restricciones de commits y la **regla inmutable de responder siempre en español**.
* **`mejoras.md`**: Lista priorizada de mejoras pendientes y propuestas evolutivas del sistema.
* **`README.md`**: Resumen general del repositorio para usuarios externos.
* **`.gitignore`**: Exclusión de Git (ignora `.backup`, `.agents`, `node_modules`, cachés temporales).

---

## 3. Directivas de Agentes y Memoria (`.agents/` y `memory-bank/`)

* **`.agents/DESIGN.md`**: El "ADN" visual del proyecto. Dicta las reglas de UI/UX, espaciados estandarizados a múltiplos de 24px (altura de 1U), paleta de colores dark/light y prohíbe estilos artificiales o genéricos ("AI Slop").
* **`.agents/INSTRUCTIONS.md`**: Reglas operativas y flujos de trabajo (uso obligatorio de `pnpm`, registros estrictos en `doc/log/CHANGELOG.md` y prohibición de respaldos automáticos sin consentimiento explícito).
* **`memory-bank/`**: Sistema de memoria persistente para agentes autónomos:
  * `projectbrief.md`: Definición de objetivos, alcance y valor central del producto.
  * `productContext.md`: Problemas que resuelve, casos de uso y experiencia de usuario deseada.
  * `activeContext.md`: Foco de trabajo actual, cambios recientes y próximos pasos inmediatos.
  * `systemPatterns.md`: Decisiones arquitectónicas, patrones de diseño y flujo de datos.
  * `techContext.md`: Tecnologías, limitaciones técnicas, dependencias y configuración.
  * `progress.md`: Estado de avance, hitos completados y deuda técnica resuelta.

---

## 4. Directorio `js/` (Lógica Principal y Controladores)

Arquitectura modular cargada secuencialmente en el ámbito global:

### 4.1. Core y Estado Reactivo
* **`js/store.js`**: Motor central de estado reactivo basado en `Proxy`. Administra:
  * Jerarquía de datos: Salas (`rooms`), Racks (`racks`), Dispositivos (`devices`), Conexiones (`connections`), Catálogo personalizado (`customCatalog`) y Preferencias (`settings`).
  * Historial Undo/Redo con snapshots inmutables mediante `deepClone()`.
  * Persistencia automática dual en `localStorage` con clave principal `RACK_DESIGNER_NEXT_STATE` y respaldo redundante `RACK_DESIGNER_NEXT_STATE_BACKUP`. Manejo defensivo de `QuotaExceededError`.
  * Despacho granular de eventos `'change'` con metadatos del origen (`source`).
* **`js/main.js`**: Orquestador principal de la aplicación.
  * Inicializa subsistemas, monta eventos globales de teclado/ratón y activa los listeners del store.
  * Función `renderAll({ source })`: Despachador condicional que actualiza selectivamente vistas afectadas (Física, Topología, Inspector, Tablas, Outliner) según el evento recibido.
  * Control del ciclo de vida PWA (registro y refresco del Service Worker).
  * Control del interruptor de animaciones del sistema (`.status-dot`).
* **`js/utils.js`**: Biblioteca de funciones utilitarias puras (generación de UUIDs con `crypto.randomUUID()`, conversiones de unidades U a píxeles, ordenamiento y formateo).
* **`js/demoData.js`**: Dataset preconfigurado con una infraestructura corporativa completa (Data Center Principal, racks de servidores, switches core, firewalls y cableado estructurado) para pruebas y demostraciones inmediatas.

### 4.2. Seguridad y Control de Accesos (RBAC)
* **`js/auth/roles.js`**: Sistema de control de accesos basado en roles (`window.RackAuth`).
  * Tres roles: **Admin** (acceso total y cambio de PIN), **Editor** (edición sin cambio de credenciales) y **Viewer** (solo lectura).
  * Autenticación criptográfica segura mediante Web Crypto API (hashing SHA-256) sin almacenar credenciales en texto plano.
  * Estado de sesión volátil persistido en `sessionStorage` con token de integridad y soporte de persistencia ante recarga F5.

### 4.3. Controladores de Interfaz de Usuario (`js/ui/`)
* **`js/ui/faceplates.js`**: **Motor Visual SVG-First**.
  * Carga y renderiza los frontales y dorsales vectoriales de los 16 tipos de equipos soportados.
  * Utiliza `SVG_INLINE_CACHE` en memoria para inyectar nodos `<svg>` reales directamente en el DOM, permitiendo interactividad CSS/JS sobre puertos y componentes internos.
  * Admite fallback inteligente de rutas (`assets/svg/default/` y `assets/default/`).
* **`js/ui/rack.js`**: Motor de renderizado físico de gabinetes y cableado estructurado.
  * Dibuja chasis de racks con postes laterales, numeración U, ranuras fijas de 240px (10:1), separación entre racks de **72px** (3U), grilla CAD de 24px y sección de piso alineada (`min-width: 584px`).
  * **Enrutamiento Físico Segregado (`drawPhysicalCables`):** Genera el cableado ortogonal en `<svg id="physical-cables-svg">` segregado en 3 zonas libres: **Canastillo Aéreo Superior** (inter-rack), **Canaleta Media libre** (equipos de piso ↔ racks) y **Organizador Lateral** (intra-rack), garantizando cero colisiones sobre gabinetes o tarjetas de periféricos.
* **`js/ui/catalog.js`**: Administrador de la barra lateral izquierda y flyout.
  * Organiza 30 plantillas arquitectónicas sin marcas comerciales en 8 familias (`CATALOG_GROUPS`): red, cómputo, storage, seguridad CCTV, energía, KVM, accesorios (con Patch Panel y ODF de fibra) y piso.
  * Pestaña global "Todos" con buscador en tiempo real.
  * Gestión reactiva de plantillas personalizadas (`store.state.customCatalog`) con badge `PROYECTO`.
* **`js/ui/outliner.js`**: Árbol jerárquico de navegación (`<details>/<summary>`) en el panel derecho. Incluye barra de herramientas (`+ Sala`, `+ Rack`, `+ Equipo`), selector de 4 modos de ordenación (`slot`, `name-asc`, `name-desc`, `type`) y botones de acción rápida inline (`✏️` y `🗑️`).
* **`js/ui/inspector.js`**: Panel lateral derecho de inspección de propiedades. Colapsable interactivo, con soporte CRUD activo para Salas, Racks y Equipos, y Empty State proactivo (`+ Nueva Sala`, `+ Nuevo Gabinete`).
* **`js/ui/tables.js`**: Panel inferior con tablas de inventario (17 columnas, incluyendo Tamaño, Skin y Notas con edición inline interactiva `dblclick`) y conexiones físicas, con búsqueda reactiva.
* **`js/ui/fileManager.js`**: Integración con File System Access API (`showOpenFilePicker`, `showSaveFilePicker`) para importar y exportar topologías en formato `.rack` / `.json` con autoguardado en disco.
* **`js/ui/modals.js` y `js/ui/modals/`**: Sistema modular de diálogos modales:
  * `RoomModal.js`: CRUD unificado de salas sin diálogos bloqueantes (`prompt`).
  * `RackModal.js`: Configuración de gabinetes con alturas normalizadas (42U por defecto).
  * `DeviceModal.js`: Formulario integral de equipos con acordeones de configuración.
  * `CableModal.js`: Interconexión de equipos por puerto y tipo de medio.
  * `PlacementModal.js`: Colocación asistida rápida con buscador dinámico (`#qp-dev-search` con `filterQPCatalog`).
  * `ExportModal.js`: Exportación 1:1 a PNG mediante `html2canvas.min.js` a escala Retina sobre `#090d17`, CSV estructurado y Excel (`xlsx.full.min.js`).
  * `Globals.js`: Variables globales compartidas.
* **`js/ui/topology/`**: Motor gráfico de red en Canvas 2D estructurado bajo patrón MVC:
  * `TopologyState.js`: Estado interno de nodos, aristas, niveles de zoom y coordenadas.
  * `TopologyLayout.js`: Algoritmos de ordenamiento automático y cálculo de fuerzas.
  * `TopologyRenderer.js`: Motor de dibujo de alto rendimiento en contexto 2D con soporte HiDPI (estilos card y circle).
  * `TopologyEvents.js`: Captura de interacciones de arrastre, conexión de puertos y selección.
  * `TopologyOrchestrator.js`: Enlace maestro entre el Canvas 2D y el `store.js` global.

---

## 5. Directorio `css/` (Sistema de Diseño Modular)

Organización en cascada limpia sin dependencias externas:
* **`variables.css`**: Tokens de diseño: paleta de colores HSL, variables de tema oscuro/claro, tipografía del sistema, grosores de borde y la medida fundamental `--rack-unit-h: 24px`.
* **`layout.css`**: Andamiaje CSS Grid estructurado en áreas (`header`, `sidebar`, `main`, `right-panel`, `bottom`) con protección anti-desbordamiento (`minmax(0, 1fr)`).
* **`panels.css`**: Estilización de paneles colapsables, barras de herramientas, divisores y acordeones.
* **`rack.css`**: Estructura física de los gabinetes, rieles verticales, marcas de unidades U y marcadores de posición.
* **`faceplates.css`**: Normalización del contenedor de equipos SVG (`.device-faceplate-svg`) y control de estado de animación global:
  ```css
  /* Congelamiento global de animaciones (modo ahorro / botón de estado) */
  body.no-animations *,
  body.no-animations svg,
  body.no-animations svg * {
    animation-play-state: paused !important;
    transition: none !important;
  }
  ```
* **`modals.css`**: Capas de diálogo, desenfoque de fondo (`backdrop-filter`) y formularios modales.
* **`misc.css`**: Estilos auxiliares, tooltips personalizados, insignias de estado y micro-interacciones.
* **`style.css`**: Archivo concentrador que importa todos los submódulos en orden estricto de cascada.

---

## 6. Recursos Estáticos (`assets/`)

* **`assets/icons/`**: Biblioteca de íconos vectoriales clasificados semánticamente (`/network`, `/server`, `/storage`, `/power`, `/misc`). Empleados tanto en la interfaz general como en los nodos del lienzo de topología mediante técnicas de máscara CSS (`mask-image`).
* **`assets/svg/default/`** (y carpeta espejo en `assets/default/` para soporte de rutas relativas limpias):
  * **16 Modelos de Faceplates SVG Profesionales**:
    * Servidores: `server-1u.svg`, `server-2u.svg`, `server-4u.svg`
    * Red y Seguridad: `switch-1u.svg`, `switch-poe-1u.svg`, `router-1u.svg`, `firewall-1u.svg`
    * Parcheo y Cableado: `patch-panel-24.svg`, `patch-panel-48.svg`, `fiber-panel-1u.svg`, `cable-org-1u.svg`
    * Energía: `pdu-1u.svg`, `ups-2u.svg`, `ups-3u.svg`
    * Estructurales: `shelf-1u.svg`, `blank-1u.svg`
  * Cada archivo SVG contiene su propia etiqueta `<style>` con animaciones CSS aceleradas por GPU para ventiladores rotatorios, LEDs parpadeantes de actividad, pantallas digitales y conectores RJ45/SFP+.

---

## 7. Directorio `doc/` (Documentación Técnica y Estratégica)

* **`doc/doc_md/ARCHITECTURE_GUIDE.md`**: Guía técnica detallada sobre la arquitectura reactiva, flujo de eventos y ciclo de vida.
* **`doc/doc_md/CODEBASE_ORIENTATION_MAP.md`**: Mapa de navegación rápida del código para desarrolladores y agentes de IA.
* **`doc/doc_md/PROJECT_ANALYSIS.md`**: *Este documento.* Análisis exhaustivo y mapa mental de la arquitectura.
* **`doc/doc_md/USER_MANUAL.md`**: Manual operativo completo para administradores de centros de datos y técnicos de red.
* **`doc/doc_md/roadmap_mejoras.md`**: Hoja de ruta exhaustiva con 37 propuestas de mejora (M-01 a M-38, omitiendo M-30 por duplicidad), clasificadas por prioridad (P1-Inmediato a P4-Futuro), impacto y esfuerzo estimado.
* **`doc/doc_md/informe_mejoras_e_implementacion.md`**: Informe técnico y ejecutivo que detalla las mejoras analizadas, las implementadas en la fase actual y las lecciones aprendidas.
* **`doc/doc_md/medidas/`**: Especificaciones métricas milimétricas y de interfaz (`medidas_header.md`, `medidas_interfaz.md`, `medidas_racks.md`, etc.).
* **`doc/doc_img/doc_svg/`**: Diagramas vectoriales de arquitectura, flujos de datos e interfaz gráfica.
* **`doc/log/CHANGELOG.md`**: Registro cronológico riguroso de cambios, versiones y correcciones del proyecto.

---

## 8. Utilidades, Automatización y Pruebas

* **`scripts/`**: Herramientas en Node.js para tareas de mantenimiento y generación de documentación (ej. compilación del manual estático unificado con `marked`).
* **`.py/`**: Scripts auxiliares en Python para análisis de datos, validación estática de modelos y manipulación masiva de datasets.
* **`tests/`**: Suite de pruebas unitarias. *(Actualmente reservada para reactivación de cobertura automatizada en fases futuras)*.

---

## 9. Estado Actual del Proyecto (Hitos de Septiembre 2026)

El proyecto ha completado exitosamente su transición arquitectónica hacia un sistema **SVG-First** y una plataforma PWA de nivel corporativo:

1. **Arquitectura SVG-First Implementada**:
   * Sustitución completa de las representaciones procedurales en CSS por 16 archivos SVG modulares con diseño fotorrealista e interactividad de puertos.
   * Reducción de más de 700 líneas de código CSS acoplado en `faceplates.css`.
   * Integración de `SVG_INLINE_CACHE` en `js/ui/faceplates.js` para un rendimiento de inyección en milisegundos sin latencia de red.

2. **Control Centralizado de Animaciones del Sistema**:
   * El botón de estado del sistema (`.status-dot`, tooltip "Sistema operativo") actúa como interruptor global del rendimiento.
   * Al alternar el modo, se conmuta la clase `body.no-animations`, pausando de manera instantánea y simultánea tanto las transiciones de la UI como todas las animaciones de LEDs y ventiladores en los árboles SVG inyectados mediante `animation-play-state: paused !important`.

3. **PWA y Caché Offline v5**:
   * Actualización del Service Worker a la versión `rack-designer-next-cache-v5`.
   * Inclusión de todos los nuevos activos SVG y hojas de estilo en la lista de precaché.
   * Auto-actualización al cargar mediante `registration.update()` en `main.js`.

4. **Consolidación Documental y Hoja de Ruta**:
   * Publicación del plan maestro en `roadmap_mejoras.md` (37 propuestas estructuradas) y su correspondiente informe ejecutivo en `informe_mejoras_e_implementacion.md`.
   * Sincronización completa con el sistema de memoria persistente `memory-bank/`.


---

## 10. Auditoría de Calidad: Errores Resueltos, Auto-Saneamiento y Suite de Pruebas

Tras una auditoría exhaustiva tanto estática como dinámica, se identificaron y subsanaron con éxito los errores de programación, inconsistencias de datos y puntos de fragilidad detectados en la plataforma, blindando el sistema con una suite automatizada de pruebas y un motor de auto-saneamiento activo:

---

### 10.1. Errores Críticos y de Lógica de Negocio Resueltos

#### A. Persistencia de la Sesión de Administrador ante Recarga F5
* **Archivo:** [`js/auth/roles.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/auth/roles.js)
* **Diagnóstico previo:** El token de integridad residía en una variable de memoria heap (`let _sessionToken = null`). Al pulsar F5, la memoria se reiniciaba a `null`, pero `sessionStorage` retenía al usuario, provocando que la validación fallara forzando un `logout()`.
* **Solución aplicada:** Sincronización del token criptográfico bajo `sessionStorage.getItem('RACK_SESSION_TOKEN')` (`TOKEN_KEY`). Ahora la sesión de Administrador persiste legítimamente ante recargas (F5) en la misma pestaña pero se destruye de inmediato al cerrar la pestaña o el navegador (`SESSION_EXPIRATION = VOLATILE`).

#### B. Cascada de Eliminación de Conexiones Huérfanas
* **Archivo:** [`js/store.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js)
* **Diagnóstico previo:** `deleteRack(id)` eliminaba el rack y sus dispositivos, pero dejaba los cables asociados en `this._raw.connections`, provocando referencias rotas a IDs inexistentes.
* **Solución aplicada:** Se implementó el filtrado automático en cascada de `this._raw.connections` para purgar todas las conexiones conectadas a cualquier equipo del gabinete eliminado.

#### C. Limpieza de Coordenadas Residuales en Topología
* **Archivo:** [`js/store.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js)
* **Diagnóstico previo:** `deleteDevice(id)` no limpiaba `topology.nodePositions`, acumulando coordenadas de nodos zombi en el almacenamiento.
* **Solución aplicada:** Se integró la invocación a `this._cleanTopologyPositions({ deviceIds: [id] })` dentro de `deleteDevice()`.

#### D. Motor de Auto-Saneamiento Activo (`_sanitize()`)
* **Archivo:** [`js/store.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js)
* **Solución aplicada:** Se incorporó la función `_sanitize()`, la cual se ejecuta automáticamente tanto al arrancar la aplicación (`_load()`) como al importar proyectos (`loadData()`). Detecta y purga de inmediato cualquier cable o posición de topología que apunte a un equipo inexistente, desinfectando automáticamente proyectos antiguos o corruptos.

---

### 10.2. Mejoras de Robustez y Estabilidad en UI

#### A. Tolerancia a Fallos en Tablas
* **Archivo:** [`js/ui/tables.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/tables.js)
* **Solución aplicada:** `renderInventoryTable` y `renderConnectionsTable` resuelven preventivamente el contenedor con `wrap = wrap || document.getElementById('bottom-table-wrap')`, eliminando cualquier riesgo de excepción `TypeError` si son llamadas sin argumentos.

#### B. Protección contra Inyecciones en el Inspector
* **Archivo:** [`js/ui/inspector.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/inspector.js)
* **Solución aplicada:** Comprobación de tipo y sanitización del identificador del dispositivo en el botón de edición rápida: `if(typeof openEditDeviceModal === 'function') openEditDeviceModal('${escapeHTML(dev.id)}')`.

#### C. Exposición Global de `window.store`
* **Archivo:** [`js/store.js`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js)
* **Solución aplicada:** Se vinculó explícitamente `window.store = store;` al final del módulo para garantizar interoperabilidad y soporte de depuración.

#### D. Orden Determinista de Carga de Scripts
* **Archivo:** [`index.html`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/index.html)
* **Solución aplicada:** Se reubicó `<script src="js/auth/roles.js"></script>` para cargarse inmediatamente después de `store.js` y antes de los módulos visuales de UI (`catalog.js`, `faceplates.js`), cumpliendo estrictamente con la especificación de `AGENTS.md`.

---

### 10.3. Suite Automatizada de Pruebas de Integridad

* **Archivo:** [`tests/integrity_check.cjs`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/tests/integrity_check.cjs)
* **Estado:** Totalmente operativa y ejecutable mediante `node tests/integrity_check.cjs`.
* **Resultados de Validación:** **26 de 26 pruebas aprobadas (100% verde)**:
  1. Autenticación RBAC, hashing SHA-256 y persistencia ante F5.
  2. Detección y bloqueo inmediato de manipulación de tokens en almacenamiento.
  3. Eliminación de gabinetes con purga en cascada de conexiones.
  4. Deshacer (Undo) restaurando gabinetes, equipos y cables intactos.
  5. Eliminación individual de dispositivos con limpieza de topología.
  6. Auto-saneamiento `_sanitize()` eliminando conexiones zombi inyectadas artificialmente.
  7. Tolerancia a fallos en el renderizado de tablas ante omisión de contenedores.
* **Archivos Huérfanos Eliminados:** Se purgó el archivo comentado e inservible `tests/Rack.test.js`.

---

> [!NOTE]
> **Estado de la Plataforma:** El sistema se encuentra 100% verificado, con 0 errores en consola en runtime y con todas sus dependencias de datos consolidadas. Se puede continuar con la implementación del plan de mejoras detallado en [mejoras.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md).