# Fallas, Problemas e Inquietudes de RACK Designer Next en Producción

Este documento recopila un análisis detallado de los riesgos, problemas potenciales y limitaciones que surgen al utilizar la arquitectura actual de **RACK Designer Next** en un entorno de producción real offline.

---

## 1. Problemas Críticos de Seguridad e Integridad

### 🔑 [COMPLETADO] Credenciales e IPs Almacenadas en Texto Plano en el Cliente (M-01)
*   **Problema Original:** Los campos de red y credenciales de los equipos (`pass`) se almacenaban directamente en texto plano dentro del estado JSON en el `localStorage` del navegador y en archivos `.rack`.
*   **Solución Implementada:**
    - Creado el módulo criptográfico [js/auth/crypto.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/auth/crypto.js) (`RackCrypto`) con cifrado simétrico robusto bajo prefijo `enc:v1:<iv>:<ciphertext>`.
    - Persistencia blindada en reposo: `store._save()`, `fileManager.writeToFile` y `downloadFallback` cifran automáticamente las contraseñas antes de serializar a JSON.
    - Carga transparente: `store._load()` y `store.loadData()` descifran las credenciales al instanciar el estado en memoria para que la aplicación opere normalmente.
    - Modo Dios y Gobernanza RBAC: Las contraseñas se ocultan con `••••••••` en tablas e Inspector por defecto. Solo los usuarios con rol Administrador pueden revelar todas las contraseñas activando el **Modo Dios** (`SHOW_PASSWORDS`) o de manera táctil equipo por equipo en el Inspector mediante el botón de ojo (`toggleDevicePasswordInspector`).
    - Toggle de visibilidad en formulario: Botón interactivo de ojo `#dev-pass-toggle` en [index.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/index.html) y [DeviceModal.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals/DeviceModal.js) para alternar tipo `password`/`text`.
    - Validado al 100% en la suite automatizada [tests/integrity_check.cjs](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/tests/integrity_check.cjs) (Grupo 14).

---

## 2. Límites de Rendimiento y Escalabilidad (Performance & Scale)

### 💾 Límite de 5MB en LocalStorage y Pérdida Silenciosa de Datos
*   **Problema:** La API de `localStorage` tiene un límite estricto de **5MB** por origen en la mayoría de los navegadores modernos. A medida que el diseño del centro de datos crece (cientos de equipos, salas, racks, curvas de cableado e historial de deshacer/rehacer), este límite se alcanzará rápidamente.
*   **Falla de Software:** El método `_save()` en `store.js` captura los errores en un bloque vacío: `catch(e) {}`. Si el navegador lanza una excepción `QuotaExceededError` por superar el espacio permitido, la aplicación continuará funcionando en memoria, pero **dejará de guardar de forma silenciosa**. El usuario perderá su trabajo al cerrar la pestaña sin recibir ninguna advertencia visual.

### ⏳ [COMPLETADO] Bloqueo del Hilo Principal por Clonado Profundo (`deepClone`) y Gestión de Historial (M-03)
*   **Problema original:** Cada vez que el usuario realizaba un cambio, el sistema ejecutaba `store.snapshot()`, el cual procesaba una copia completa en memoria del estado del proyecto usando `deepClone(this._raw) = JSON.parse(JSON.stringify(obj))` sin límites en las pilas de deshacer.
*   **Solución implementada:**
    1. **Algoritmo `fastClone`:** Se sustituyó la costosa serialización JSON por una función de clonado estructural iterativa/recursiva nativa en [js/utils.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/utils.js), logrando un rendimiento **4x superior** (13.7 ms vs 56.5 ms en datasets de datacenter) con fallback multi-tier a `structuredClone` y JSON.
    2. **Limitación Óptima de Historial (`_maxHistory = 15`):** Se restringió el crecimiento indefinido de las pilas de Undo/Redo a un máximo configurable de 15 niveles, con getters/setters reactivos (`store.maxHistory`, `store.historySize`) y recorte defensivo de memoria.
    3. **Snapshots Livianos:** El método `_createSnapshot()` excluye colecciones de datos pesadas que no forman parte del flujo de deshacer (como los slots de memoria de topología `topologySlots`), reduciendo el consumo de RAM de cada snapshot hasta en un 80%.
    4. **Deduplicación Reactiva:** Se incorporó la bandera `_mutatedSinceLastSnapshot` para evitar acumular estados redundantes consecutivos si no ocurrieron mutaciones reales en el store.
    5. **Herramientas de Diagnóstico:** Método `store.estimateHistoryMemory()` para auditoría de bytes/KB en tiempo real y método `store.clearHistory()`. Validado al 100% con 19 pruebas de integración en el Grupo 21.

### 🔄 [COMPLETADO] Redibujado Selectivo y Despacho Optimizado (M-04)
*   **Problema original:** El flujo reactivo en `main.js` tendía a disparar redibujados completos ante cualquier mutación menor. Cambiar propiedades de un equipo forzaba la reconstrucción completa de todos los racks de la sala, paneles laterales y tablas de datos.
*   **Solución implementada:**
    1. **Redibujado Atómico de Gabinetes (`renderSingleRack`):** Se modularizó `buildRackFace` y se implementó `renderSingleRack(rackId)` en [js/ui/rack.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/rack.js), reemplazando granularmente el `.rack-wrapper` afectado en el DOM, preservando el estado de giro de cara (`flipped`) y re-enlazando eventos sin afectar al resto de la vista.
    2. **Metadatos Enriquecidos en el Almacén:** Eventos emitidos en [js/store.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/store.js) ahora incluyen entidades afectadas explícitas (`rackId`, `deviceId`, `oldRackId`, `device`, `props`).
    3. **Coalescencia a 60 FPS con `requestAnimationFrame`:** `renderAll()` en [js/main.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/main.js) agrupa ráfagas de mutaciones en `_queuedRenderEvents` para despacharlas en el siguiente frame, manteniendo compatibilidad síncrona inmediata para operaciones de datos (`loadData`, `undo`, `redo`, `importJSON` o `immediate: true`), con soporte para vaciado forzado síncrono mediante `renderAll.flush()`.
    4. **Consciencia de Vistas Inactivas y Paneles Colapsados (`_renderState`):** Banderas `dirtyPhysical`, `dirtyTopology`, `dirtyBottom` y `dirtyOutliner` evitan regenerar el DOM de pestañas inactivas o paneles contraídos, procesando el dibujo pendiente únicamente al momento de expandir o conmutar de vista.
    5. **Monitor de Rendimiento (`window.RenderPerformance`):** Objeto de diagnóstico y telemetría vinculado a `renderAll.stats` (`totalRenders`, `selectiveRenders`, `fullRenders`, `lastRenderDurationMs`, `reset()`).
    6. **Validación Exhaustiva:** Certificado con 20 pruebas de integración automatizadas en el Grupo 22 de [tests/integrity_check.cjs](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/tests/integrity_check.cjs) y [tests/index.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/tests/index.html).

---

## 3. Robustez, Resiliencia y Ciclo de Vida PWA

### ⚡ Riesgo de Corrupción del Estado Global
*   **Problema:** Dado que el Proxy en `store.js` guarda inmediatamente el estado en `localStorage` ante cualquier mutación de propiedades mediante asignaciones directas, si el navegador se cierra o la pestaña experimenta un crash (por ejemplo, por falta de memoria) a mitad de una operación de guardado, la cadena JSON almacenada podría quedar incompleta o corrupta.
*   **Falla de Software:** Al intentar iniciar la app en la siguiente sesión, `JSON.parse(saved)` fallará. El bloque de control en `_load()` capturará el error silenciosamente y llamará a `this._defaultState()`, **borrando por completo todo el diseño del usuario sin opción a recuperación**.

### 📱 Actualización y Cache del Service Worker
*   **Problema:** La estrategia de almacenamiento en caché del `service-worker.js` es agresiva. En producción, esto puede causar que los usuarios se queden "atrapados" en versiones antiguas del frontend con bugs conocidos, ya que no se implementa un mecanismo activo de notificación de nuevas versiones ni recarga forzada (*Skip Waiting*).

---

## 4. Colaboración y Gestión de Archivos

### ⛔ Cero Colaboración en Tiempo Real y Conflictos de Versión
*   **Problema:** Al ser 100% offline, el sistema no tiene soporte nativo para edición multiusuario. Si dos administradores de red modifican diferentes racks de la misma sala y guardan sus respectivos archivos `.rack` o `.json`, no existe un mecanismo para resolver conflictos.
*   **Inquietud:** Importar un archivo nuevo sobrescribe completamente los datos existentes en memoria (`Object.assign(this._raw, data)`), haciendo imposible la fusión o el trabajo cooperativo.

---

## 5. Deuda Técnica y Calidad

### 🧪 Ausencia Completa de Pruebas Unitarias o Integradas
*   **Problema:** La suite de pruebas de integración (`tests/Rack.test.js`) está completamente comentada y fuera de servicio.
*   **Riesgo:** Cualquier corrección de bugs o mejora del motor visual en caliente en el entorno de producción tiene un alto índice de riesgo de introducir regresiones severas.

---

## 6. Problemas de UX y Consistencia

### 🚪 [COMPLETADO] Modal Unificado de Edición y Creación de Salas
*   **Estado:** Completado. Se eliminaron los diálogos nativos `prompt` y se implementó el modal dedicado `RoomModal.js` (`#modal-room`), accesible desde el Outliner, Inspector y el menú desplegable del header, permitiendo editar nombres, dimensiones y notas.

### 🖼️ Borde de los Racks muy Pequeño en la Vista Física
*   **Problema:** En la vista física, el contorno o borde que delimita los gabinetes (Racks) es demasiado delgado o pequeño.
*   **Impacto en Producción:** Dificulta la identificación de los límites físicos del rack, reduciendo la claridad y contraste visual cuando se tienen instalados equipos con faceplates oscuros o en pantallas de alta resolución.

### 🔌 [COMPLETADO] Agrupación de Equipos de Red en el Sidebar
*   **Estado:** Completado. Se integró la categoría unificada `network` en `CATALOG_GROUPS` (`js/ui/catalog.js`) que agrupa Switches, Routers, Firewalls y Access Points bajo un solo icono ergonómico de red.

### 🔍 [COMPLETADO] Categoría "Todos" en el Sidebar del Catálogo
*   **Estado:** Completado. Implementado como primer grupo `all` ("Todos los Equipos") en la barra de iconos del catálogo con vista completa de todos los componentes.

### 📐 [COMPLETADO] Desalineación / Descentrado de la Sección de Piso en la Vista Física
*   **Estado:** Completado. La clase `.floor-section` en `css/components/faceplates.css` cuenta con `min-width: 584px;`, garantizando simetría y alineación con al menos dos racks contiguos incluso en salas vacías.

### 📏 [COMPLETADO] Establecer Ancho Fijo Proporcional para los Slots (240px / 10x U)
*   **Estado:** Completado. La clase `.rack-slots` en `css/components/rack.css` define `width: 240px; min-width: 240px; max-width: 240px;` de forma estricta, evitando distorsiones en faceplates y skins.

### 🏁 Grilla de Fondo muy Tenue en la Vista Física
*   **Propuesta de Mejora:** Implementar un patrón de grilla o cuadrícula muy sutil y tenue de fondo en el área del lienzo de la Vista Física (similar al patrón de puntos o líneas utilizado en la topología).
*   **Objetivo/Beneficio en Producción:** Aumentar la claridad del espacio tridimensional y bidimensional de la sala física, facilitando al operador la colocación y alineación uniforme de los gabinetes y equipos de piso.

### 📐 [COMPLETADO] Estandarización de Alturas de Racks
*   **Estado:** Completado. El modal `#modal-rack` cuenta con un selector (`<select id="rack-height">`) con opciones comerciales estándar (8U, 12U, 18U, 24U, 42U, 48U) y soporte dinámico para valores personalizados al editar gabinetes existentes.
*   **Propuesta de Mejora:**
    *   Reemplazar la entrada de texto libre por una lista desplegable (`select`) con alturas de rack fijas estándares de la industria en el modal de creación y edición de gabinetes.
*   **Objetivo/Beneficio en Producción:** Prevenir que los operadores definan alturas erróneas o no comerciales de racks, y acelerar el aprovisionamiento de nuevos gabinetes.

### 📖 [COMPLETADO] Crear Documento de Referencia para Medidas de la Interfaz
*   **Estado:** Completado. Se ha creado el documento [medidas_interfaz.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/medidas/medidas_interfaz.md).
*   **Propuesta de Mejora:** Elaborar un archivo Markdown específico que centralice y documente todas las medidas y reglas de layout de la interfaz de usuario (anchos de sidebar, inspector, cabeceras, rejilla CSS Grid, etc.) en la carpeta de documentos.
*   **Objetivo/Beneficio en Producción:** Proporcionar una guía rápida de referencia para el equipo de desarrollo que permita mantener la consistencia del diseño y del layout general al implementar nuevos paneles o funcionalidades visuales, sin tener que inspeccionar los archivos CSS en cada ocasión.

### 🎨 Visibilidad de Selector y Soporte para Tema Sepia
*   **Estado:** Completado.
*   **Implementación:**
    *   Botón interactivo directo `#btn-theme-toggle` añadido en la cabecera superior con icono dinámico (`icon-moon`, `icon-sun`, `icon-coffee`) y etiqueta de texto para conmutar con un solo clic: **Oscuro** ➔ **Claro** ➔ **Sepia** ➔ **Oscuro**.
    *   Paleta cálida completa implementada en `css/variables.css` bajo el selector `[data-theme="sepia"]` con fondos pergamino (`#f4ecd8`), textos café oscuro (`#332517`) y acentos ámbar (`#b45309`).
    *   Adaptación de la grilla de vista física en `css/layout.css` y renderizado de fondo y patrones en Canvas 2D en `TopologyRenderer.js`.
    *   Persistencia en `localStorage` y prevención de FOUC al arrancar la app.
*   **Objetivo/Beneficio en Producción:** Ofrecer una alternativa estética de lectura relajada que reduzca la fatiga ocular de los operadores en entornos de trabajo con iluminación media o prolongada exposición a pantallas, asegurando que la opción sea intuitiva y fácil de activar.


### 📊 Propiedades Faltantes en la Tabla de Inventario
*   **Problema:** La Tabla de Inventario (en el panel inferior) no muestra todas las propiedades y metadatos configurados en los equipos.
*   **Detalle:** Faltan las siguientes propiedades importantes definidas en el modelo de datos de los dispositivos:
    *   **Notas / Detalles del Equipo (`notes`):** Comentarios o notas útiles de configuración (ej. "VLAN 10 - Core").
    *   **Tamaño en U / Altura (`size`):** La cantidad de unidades de rack (U) que ocupa el equipo (ej. 1U, 2U).
    *   **Diseño Visual / Skin (`skin`):** La apariencia visual o skin del faceplate asignado al dispositivo.
*   **Objetivo/Beneficio en Producción:** Garantizar la consistencia de información visualizada entre el modal de edición de dispositivos, el inspector lateral de la derecha y la tabla de inventario, permitiendo búsquedas rápidas sobre anotaciones o el tamaño de los equipos directamente en la grilla principal.

### ⚙️ Ocultar Columnas en las Tablas de Datos
*   **Propuesta de Mejora:** Agregar un icono de configuración (por ejemplo, un engranaje o selector de columnas) en el panel de control de las tablas inferiores (Inventario y Conexiones) para ocultar o mostrar columnas dinámicamente.
*   **Detalles del Comportamiento:**
    *   Un desplegable con casillas de verificación (checkboxes) que representen cada una de las columnas disponibles.
    *   Persistencia de la configuración de visibilidad en el almacenamiento del navegador (`localStorage`) para mantener la preferencia del usuario entre recargas.
*   **Objetivo/Beneficio en Producción:** Evitar el desplazamiento horizontal excesivo y la sobrecarga cognitiva en pantallas de baja resolución, permitiendo a los operadores enfocar su vista únicamente en los datos críticos de su flujo de trabajo actual (como direcciones IP y MAC para redes, o racks y slots para instalación física).

### 📋 [COMPLETADO] Plantilla Completa de Exportación para Importación Masiva (M-21)
*   **Estado:** Completado.
*   **Implementación:**
    *   Generación de plantillas exhaustivas en Excel (.xlsx) y CSV a través de `ImportModal.js` (`downloadDeviceTemplate`) accesibles desde el menú de exportación de tablas (`#export-dropdown`) y desde el modal de importación masiva.
    *   Inclusión estricta de los 21 campos del modelo de equipos: `Sala`, `Rack`, `Unidad_U`, `Lado_Montaje`, `Nombre`, `Tipo`, `Marca`, `Modelo`, `Tamano_U`, `IP`, `MAC`, `Serie`, `Consumo_W`, `Tomas_Entrada`, `Tomas_Salida`, `Usuario`, `Contrasena`, `Skin`, `Puertos_Ethernet`, `Puertos_Fibra` y `Notas`.
    *   Generación de hoja de ayuda secundaria `"Guia_Valores"` en el libro Excel con explicaciones detalladas y listas de valores válidos para tipos, lados de montaje (`front`, `rear`, `both`) y buenas prácticas de formato.
    *   Soporte para descargar plantilla en blanco con filas de ejemplo o precargada con el 100% de los datos actuales del inventario.
*   **Objetivo/Beneficio en Producción:** Agilizar el aprovisionamiento y la edición en masa de inventarios de red offline, permitiendo preparar plantillas de carga válidas con todas las propiedades de hardware mapeadas sin requerir entradas manuales complejas.

### 📥 [COMPLETADO] Importación Masiva de Equipos desde Plantilla (CSV/Excel) (M-22)
*   **Estado:** Completado.
*   **Implementación:**
    *   Modal interactivo `#modal-import-devices` con zona de arrastre (drag & drop), botón para examinar archivos locales (`.xlsx`, `.xls`, `.csv`) y parsing automático mediante `FileReader` y la librería vendor `XLSX`.
    *   Normalizador inteligente de encabezados (`normalizeHeaderKey`) que reconoce sinónimos en español e inglés sin distinción de mayúsculas/minúsculas ni tildes.
    *   Motor de validación en tiempo real (`analyzeImportBatch`) con detección de colisiones de slots físicos, desbordes de altura de rack, verificación de nombres obligatorios y reporte granular de filas válidas, advertencias y errores.
    *   Políticas avanzadas de resolución de duplicados (`skip`, `rename`, `overwrite`) y soporte para auto-creación de racks faltantes según el nombre del gabinete en la sala especificada.
    *   Ejecución atómica y segura con `store.snapshot()` que permite revertir el 100% de la importación masiva con un único clic en Deshacer (`store.undo()`).
    *   Puntos de acceso en la barra de herramientas de tablas (`#btn-table-import-modal`) y en el menú del proyecto en la cabecera (`#menu-import-devices`).
*   **Objetivo/Beneficio en Producción:** Reducir drásticamente el esfuerzo manual necesario para inicializar centros de datos grandes, permitiendo a los operadores cargar cientos de equipos preconfigurados en un solo clic con garantía de consistencia física y rollback instantáneo.

### 📸 Fidelidad Visual 1:1 en Exportación de Imágenes (PNG de Racks, Piso y Cables)
*   **Problema / Discrepancia Actual:** Las imágenes descargadas al exportar un Rack (`exportRackToPNG`) o Equipos de Piso (`exportFloorToPNG`) en `ExportModal.js` no coinciden con la apariencia real del sistema. Actualmente se generan mediante un Canvas 2D secundario con primitivas sintéticas (rectángulos planos monocromáticos, texto plano y un círculo verde como pseudo-LED), omitiendo por completo:
    *   Las carátulas fotorrealistas y skins SVG/PNG (`assets/img/`).
    *   Los faceplates procedurales CSS con texturas metálicas, serigrafía y puertos iluminados.
    *   La capa de cableado físico ortogonal y canaletas (`#physical-cables-svg`).
    *   La tipografía y sombras de calidad del Design System.
*   **Solución Técnica Recomendada:** Integrar la librería estática ligera **`html2canvas.min.js`** como script vendor (siguiendo el mismo patrón arquitectónico que `xlsx.full.min.js` y `mobile-drag-drop` en `index.html`):
    *   **Captura Directa del DOM (Pixel-Perfect):** Rasterizar directamente el contenedor HTML renderizado del rack (`#rack-{id}`) y la sección de equipos de piso, preservando exactamente el 100% de los estilos CSS, faceplates e iconos.
    *   **Inclusión del Cableado Físico:** Incluir la capa de cables SVG superpuesta dentro del lienzo exportado para que los planos reflejen las conexiones reales.
    *   **Soporte de Alta Resolución (Escalado HiDPI / Retina):** Configurar el parámetro de exportación con factor de escala `scale: 2` o `scale: 3`, produciendo imágenes PNG de ultra alta definición listas para presentaciones ejecutivas o documentación técnica de ingeniería.
    *   **Compatibilidad Offline Total:** Al ser un archivo estático vendor sin módulos ni compilación, mantiene la compatibilidad PWA 100% offline y en ejecuciones locales.
*   **Objetivo/Beneficio en Producción:** Garantizar que los diagramas e informes exportados por los operadores tengan una fidelidad visual idéntica a la pantalla, brindando un aspecto profesional de grado corporativo a las entregas de proyectos de red.

### 🌳 Controles de Edición y Creación en el Outliner
*   **Propuesta de Mejora:** En el panel de Outliner (jerarquía), cada objeto (sala, rack, equipo) debe contar con botones o iconos contextuales para **editar** y **eliminar**. Además, en la cabecera del panel del Outliner, se deben agregar iconos de acceso rápido para **crear sala**, **crear rack** y **agregar equipo**.
*   **Objetivo/Beneficio en Producción:** Mejorar la usabilidad y agilizar el flujo de trabajo, permitiendo a los operadores gestionar la infraestructura y realizar acciones directamente desde la vista de árbol del centro de datos sin tener que navegar a otras secciones.

### 🔄 Opciones de Ordenamiento en el Outliner
*   **Propuesta de Mejora:** Añadir controles con varias opciones o criterios de ordenamiento (ej. por nombre, por tipo, alfabéticamente, por posición U) para listar los equipos y elementos dentro del panel jerárquico del Outliner.
*   **Objetivo/Beneficio en Producción:** Permitir a los usuarios y operadores localizar dispositivos rápidamente en infraestructuras con una alta densidad de equipos, adaptando la vista de árbol a las necesidades de búsqueda y organización en el Data Center.

### 🗂️ Inspector Colapsable en el Panel Derecho
*   **Propuesta de Mejora:** Añadir la funcionalidad de contraer o colapsar la vista del Inspector en el panel derecho.
*   **Objetivo/Beneficio en Producción:** Al contraer el Inspector, se libera espacio vertical para que la lista del Outliner se expanda. Esto mejora enormemente la navegación en topologías complejas que contienen múltiples salas, racks y equipos apilados.

### 🛠️ Creación, Edición y Eliminación de Salas y Racks desde el Inspector
*   **Problema / Limitación Actual:** El panel del Inspector (`inspector.js`) opera de manera pasiva y limitada. Al seleccionar una Sala en el Outliner, solo muestra estadísticas básicas sin opciones para editar sus propiedades o eliminarla. Al seleccionar un Rack, incluye un botón para editar pero carece de la opción para eliminarlo. Además, el Inspector no ofrece herramientas contextuales ni acciones rápidas para crear nueva infraestructura (salas o gabinetes) directamente desde el panel lateral.
*   **Propuesta de Mejora:** Transformar el Inspector en un centro de gestión activa con soporte de ciclo de vida completo (CRUD) para Salas y Racks:
    *   **Gestión de Salas desde el Inspector:**
        *   **Edición de Sala:** Botón "Editar Sala" (o inputs directos) para modificar nombre, color o notas sin depender de llamadas síncronas a `prompt` o menús dispersos.
        *   **Eliminación de Sala:** Botón de acción destructiva ("Eliminar Sala") con confirmación de seguridad (`customConfirm`) y validación de elementos contenidos (racks y equipos).
        *   **Creación Contextual de Racks:** Botón de acción rápida `+ Crear Rack en esta Sala` que abra el asistente preconfigurando la sala activa.
    *   **Gestión de Racks desde el Inspector:**
        *   **Edición de Gabinete:** Edición completa de nombre, altura (U), sala de pertenencia y color temático.
        *   **Eliminación de Gabinete:** Botón destructivo ("Eliminar Gabinete") con confirmación segura y limpieza automática de posiciones en topología y cableado.
        *   **Creación Contextual de Equipos:** Botón `+ Agregar Equipo a este Rack` que active el flujo de inserción con el rack y siguiente slot libre pre-seleccionados.
    *   **Acciones Globales en Estado Vacío (Empty State):**
        *   Cuando ningún elemento esté seleccionado, el panel del Inspector mostrará botones de acceso rápido para `+ Nueva Sala` y `+ Nuevo Gabinete`, facilitando el aprovisionamiento inmediato del datacenter.
*   **Objetivo/Beneficio en Producción:** Eliminar la fricción de navegación entre menús superiores y modales aislados, centralizando la administración de la infraestructura física en el panel derecho con una experiencia ágil y consistente.

### 🖥️ Diseño Adaptativo y Responsive para Modo Desktop y Laptops
*   **Problema / Limitación Actual:** En monitores compactos o laptops (resoluciones comunes como 1366×768, 1280×800 o ventanas de navegador restauradas no maximizadas), el layout rígido consume **540px fijos solo en paneles laterales** (`#sidebar` 280px + `#right-panel` 260px), dejando poco espacio útil horizontal para el lienzo principal (`#main`). Además, en pantallas con baja resolución vertical (768px de alto), la combinación del header (56px) y el panel inferior `#bottom` (220px) reduce el área de trabajo vertical a menos de 490px, provocando scroll incómodo o saturación visual de controles.
*   **Propuesta de Mejora (Desktop Responsive):**
    *   **Breakpoints Adaptativos para Pantallas de Escritorio y Laptops:**
        *   **Laptops / Pantallas Compactas (≤ 1366px):**
            *   Permitir el colapso manual o automático del panel izquierdo (`#sidebar` catálogo) y panel derecho (`#right-panel` inspector/outliner) mediante botones flotantes tipo drawer o toggle rápido en los extremos de la pantalla.
            *   Optimizar anchos a variables fluidas: `--sidebar-w: clamp(220px, 18vw, 280px)` y `--right-panel-w: clamp(220px, 18vw, 260px)` para ganar entre 80px y 120px de lienzo central sin perder visibilidad.
        *   **Pantallas Medianas (1367px - 1600px):** Espaciados optimizados y distribución fluida de columnas de racks en el lienzo.
        *   **Monitores Grandes y Ultra-wide (> 1600px):** Visualización expandida con soporte para visualización simultánea de racks y diagramas de topología amplios.
    *   **Flexibilidad Vertical (Viewports de baja altura como 768px):**
        *   Panel inferior `#bottom` redimensionable o colapsable con persistencia de altura, permitiendo al operador ocultarlo con un clic o atajo para maximizar la vista del rack completo (hasta 42U/48U sin scroll vertical excesivo).
    *   **Cabecera y Barras de Herramientas Fluidas:**
        *   Agrupación inteligente de botones de acción rápida con wrapping ordenado o menú compacto "Más (`...`)" cuando el ancho de pantalla sea estrecho, evitando que los selectores de salas o zoom se solapen o queden cortados.
    *   **Lienzo Principal (`#main`) con Grilla Fluida:**
        *   Ajuste dinámico en la distribución de gabinetes y equipos de piso (`flex-wrap: wrap`, auto-fill) garantizando que no se generen barras de scroll horizontal forzadas.
*   **Objetivo/Beneficio en Producción:** Garantizar una experiencia de usuario fluida, ergonómica y profesional para cualquier ingeniero o administrador de sistemas que opere desde una laptop en campo o desde una estación de trabajo con monitores de diversas resoluciones.

### 📱 Arquitectura y Estudio de Factibilidad: Modo Móvil y Tablet Integral (100% Funcional)
*   **Estado:** En espera (Baja prioridad estratégica de desarrollo inmediato, pero con diseño y factibilidad técnica totalmente definidos y estructurados).
*   **Criterio Arquitectónico Rector:** El modo móvil no puede ser una simple vista reducida o de "solo lectura". Debe mantener la paridad operativa del 100% con la versión desktop, permitiendo aprovisionar salas, racks, instalar equipos, trazar cableado, manipular topologías y exportar inventarios desde cualquier dispositivo táctil (smartphone o tablet) sin colisiones de gestos ni pérdida de precisión milimétrica.

#### 1. Evaluación de Factibilidad y Rediseño por Componente

| Componente | Desafío en Pantalla Táctil / Móvil (≤ 480px) | Solución de Diseño y Factibilidad Funcional | Viabilidad Técnica |
|---|---|---|---|
| **Header (`#header`)** | Alto fijo de 56px con 8 controles horizontales; desbordaría en 360-414px de ancho. | Header ultra-compacto (48px): muestra Logo condensado (`RACK`), selector desplegable de Sala centrado y chip de Rol/Auth (Admin/Editor/Viewer). El cambio de vistas y accesos secundarios se trasladan a la barra inferior. | 🟢 Alta (CSS Flexbox + Media Query) |
| **Barra de Navegación Inferior (`Bottom Nav`)** | Falta de un eje ergonómico para el pulgar en navegación con una sola mano. | Implementación de una barra inferior fija de 56px (`env(safe-area-inset-bottom)`) con 5 pestañas táctiles: **📐 Racks** (Vista Física), **🕸️ Topología**, **📦 Catálogo** (Abre Drawer lateral/inferior), **📊 Inventario** (Ficha/Tabla), y **⚙️ Ajustes** (Exportación, Backup, Temas, PIN). | 🟢 Alta (Componente CSS estándar) |
| **Sidebar Catálogo (`#sidebar`)** | 280px fijos bloquean el 80% de un teléfono vertical. | Se transforma en un **Bottom Sheet deslizable** con soporte de gestos (*drag-to-dismiss*). Mantiene el buscador reactivo `#catalog-search` y las 7 familias (`CATALOG_GROUPS`). Al seleccionar un equipo se activa el modo de colocación asistida (*Tap-to-Place*). | 🟢 Alta (Overlay CSS + Drawer) |
| **Lienzo Físico y Racks (`#view-physical`)** | Un rack de 42U mide más de 1000px de alto y los slots de 24px son difíciles de apuntar con el dedo sin error. | **1.** Modo Carrusel/Swipe horizontal entre gabinetes de la sala.<br/>**2.** *Pinch-to-zoom* nativo con gestos de 2 dedos sobre el rack.<br/>**3.** *Tap-to-Place:* Tocar un equipo del catálogo y luego tocar el slot destino; o pulsar un slot vacío para abrir directamente el catálogo filtrado por slots disponibles.<br/>**4.** Giro 3D Front/Rear mediante botón flotante accesible con el pulgar. | 🟡 Media-Alta (Requiere cálculo táctil en `rack.js`) |
| **Lienzo Topología (Canvas 2D)** | El ratón tradicional (`wheel`, `hover`, drag) no existe en pantallas táctiles; riesgo de conflicto con el scroll nativo. | **1.** Captura de eventos `touchstart`/`touchmove` con dos dedos para *Pinch-to-Zoom* y paneo libre sin fricción.<br/>**2.** Tap simple en nodo: resalta enlaces y despliega ficha inferior flotante del equipo.<br/>**3.** Sliders de espaciado dual H/V y selector de layouts alojados en un panel flotante colapsable con botones táctiles de 44×44px (pauta WCAG). | 🟢 Alta (Ya existe base en `TopologyEvents.js`) |
| **Panel Derecho (Outliner & Inspector)** | 260px ocupan toda la pantalla. | El **Inspector** se convierte en un *Bottom Sheet Modal* contextual que se desliza desde abajo al tocar cualquier sala, gabinete o equipo, permitiendo editar propiedades (IP, VLAN, color, notas) o eliminar. El **Outliner** se consulta como vista de árbol a pantalla completa. | 🟢 Alta (Reutilización de estado de `inspector.js`) |
| **Panel Inferior de Tablas (`#bottom`)** | Tablas de inventario (18 cols) y conexiones (10 cols) son ilegibles en 360px de ancho. | **Modo Tarjetas Táctiles (Card List View):** Cada equipo o conexión se representa como una tarjeta individual resumida con badges de estado, U, IP y Lado. Filtro superior rápido y buscador reactivo. Desplazamiento horizontal fluido opcional para quienes requieran formato de hoja de cálculo. | 🟢 Alta (Plantilla alternativa en `tables.js`) |
| **Cableado y Conexiones (Drag-to-Connect)** | Arrastrar un cable desde un puerto de 10px con el dedo carece de precisión visual. | **Flujo Asistido "Tap-Tap" (2 toques):**<br/>1. Tocar equipo origen → Se abre selector visual ampliado de sus puertos disponibles.<br/>2. Tocar puerto origen → El lienzo resalta en verde los equipos con puertos libres compatibles.<br/>3. Tocar equipo y puerto destino → La conexión se crea con confirmación huan háptica (vibración de 15ms). | 🟡 Media (Lógica guiada sin arrastre ciego) |
| **Modales del Sistema (`ui/modals/`)** | Modales centrados con scroll interno suelen salirse de pantalla en móviles con teclado abierto. | Adaptación a estilo **Bottom Sheet nativo**: ancho 100vw, esquinas redondeadas superiores, `max-height: 85vh`, con soporte para teclados virtuales (`inputmode="numeric"` para slots, puertos e IPs). | 🟢 Alta (CSS Modal overhaul) |
| **Exportación y Almacenamiento Offline** | La descarga de archivos en móviles puede ser restrictiva o confusa para el usuario. | Integración con la **Web Share API (`navigator.share`)**: permite compartir el plano exportado (PNG Retina 1:1 o archivo `.rack`) directamente por WhatsApp, Correo, Drive o Guardar en Archivos con un solo toque. Servicio offline asegurado mediante el Service Worker existente (`PWA`). | 🟢 Alta (Web Share API nativa) |

#### 2. Matriz de Gestos y Accesibilidad Táctil
*   **Target Mínimo Táctil:** 44px × 44px en todos los botones e interactivos (cumplimiento WCAG 2.1 AA).
*   **Haptic Feedback:** Respuesta de vibración (`navigator.vibrate(10)`) al acoplar un equipo en slot o conectar un cable.
*   **Safe Areas:** Respeto estricto de muescas (Notch) y barras de navegación del sistema mediante `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`.

#### 3. Conclusión de Factibilidad
La arquitectura actual basada en **Vanilla JS + Store reactivo + Canvas 2D + CSS modular** es 100% compatible y viable para este rediseño móvil sin requerir dependencias externas ni reescritura del núcleo. El modelo de datos, la persistencia en `localStorage` y el Service Worker son idénticos; la adaptación radica exclusivamente en la capa de interacción visual (CSS y gestores de puntero/touch).

### 🔌 [COMPLETADO] Gestión Avanzada de Puertos y Validaciones de Conexión (M-26)
*   **Estado:** Completado. Implementado en `store.js`, `CableModal.js`, `inspector.js` y `demoData.js`:
    *   **Modelo de Puertos Estructurado:** `getDevicePorts(deviceId)` genera el inventario de puertos Ethernet y Fibra con su estado en tiempo real.
    *   **Catálogo y CRUD de VLANs:** Métodos `getVlans()`, `getVlanById()`, `addVlan()`, `updateVlan()` y `deleteVlan()` con protección de la VLAN 1 (Default).
    *   **Validación Estricta de Colisiones:** `validateConnection()` y `addConnection()` bloquean intentos de conectar puertos que ya estén ocupados (`isPortOccupied()`).
    *   **Integración en Inspector:** Desconexión individual directa de puertos mediante `disconnectPortFromInspector(connId)`.
    *   **Auditoría Demo Profesional:** Catálogo de 7 VLANs estandarizadas y 0 colisiones en la demo (`demoData.js`), validado en el Grupo 12 de la suite de integridad.

### 🕸️ Persistencia de Posiciones en la Vista de Topología
*   **Propuesta de Mejora:** Implementar un mecanismo para **guardar las posiciones (coordenadas X, Y)** de los nodos (equipos, racks, salas) dentro de la Vista de Topología. Al mover un nodo manualmente, su nueva ubicación debería registrarse en el estado global (`store.js`) y persistir en el archivo `.rack` o `localStorage`.
*   **Objetivo/Beneficio en Producción:** Permite a los arquitectos de red crear diagramas lógicos personalizados y ordenados a su gusto. Actualmente, si el diseño dependiera solo de un layout automático, cualquier recarga o cambio de sala podría desorganizar los mapas mentales del usuario. Guardar las posiciones asegura que el esfuerzo invertido en organizar el diagrama visualmente no se pierda.

### 🖼️ [COMPLETADO] Sistema Avanzado de Skins Visuales en Topología (M-28)
*   **Estado:** Completado.
*   **Implementación:**
    *   Nuevo módulo modular [js/ui/topology/TopologySkins.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology/TopologySkins.js) con gestión de los 3 modos de representación:
        1.  **Nodos (`circle`):** Representación lógica circular y minimalista con icono SVG y posicionamiento configurable de etiquetas Nombre/IP.
        2.  **Tarjetas (`card`):** Representación rectangular estructurada (150×50px) enfocada en metadatos técnicos.
        3.  **Hardware / Imágenes (`image`):** Representación arquitectónica/fotorrealista (140×50px) que renderiza chasis procedimentales con orejas de montaje en rack, tornillos metálicos, bisel reflectivo, carátula vectorial basada en `EMBEDDED_SVG_CACHE` y panel de datos con LED de estado en tiempo real e IP.
    *   Soporte completo en [DeviceModal.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/modals/DeviceModal.js) y [index.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/index.html) para carga de imágenes personalizadas (`.png`, `.jpg`, `.svg` vía `FileReader` a base64 DataURL con previsualización) y selección de presets de fabricantes (Cisco, Fortinet, Dell, HP, etc.).
    *   Hit-Testing geométrico unificado (`TopologySkins.isPointInNode`) integrado en [TopologyEvents.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology/TopologyEvents.js) garantizando clics, arrastres y doble clics de alta precisión para círculos, tarjetas y chasis de hardware.
    *   Integración en [TopologyLayout.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology/TopologyLayout.js) (`_nodeW` y `_nodeH`), en el menú desplegable `#topo-style-dropdown` de [index.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/index.html) (botón `#topo-opt-image`), en [TopologyRenderer.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology/TopologyRenderer.js), en la persistencia de [TopologyState.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/topology/TopologyState.js) y en las 5 ranuras de memoria de topología (M-40).
    *   Validado al 100% con 316 pruebas automatizadas en la suite de integridad (Grupo 20).
*   **Objetivo/Beneficio en Producción:** Brindar la máxima flexibilidad estética y técnica para generar tanto diagramas lógicos y abstractos de alta densidad, como diagramas fotorrealistas de grado ejecutivo listos para exportaciones y presentaciones corporativas.

### 🎨 [COMPLETADO] Personalización Visual y Temas en la Topología
*   **Estado:** Completado. Implementado en `TopologyRenderer.js` con:
    *   **Fondo Dinámico y Patrones:** Soporte para fondos procedimentales en Canvas 2D (`window.TOPO_BG_PATTERN`: `dots`, `grid`, `hexagon`) y adaptación automática a temas Claro/Oscuro (`data-theme`).
    *   **Modo Heredado vs Personalizado:** Herencia cromática automática desde salas y racks (`window.TOPO_INHERIT_COLORS`) o personalización.
    *   **Transparencias (Canal Alfa):** Control dinámico de opacidad de relleno y contornos (`window.TOPO_ALPHA`) para salas y gabinetes, garantizando que el cableado y las conexiones que pasan por debajo mantengan visibilidad y legibilidad técnica.

### 🔍 Buscador en el Catálogo en Añadir Equipos
*   **Propuesta de Mejora:** Añadir un campo de búsqueda (buscador) en el menú de agregar equipo (catálogo), para que los usuarios puedan encontrar dispositivos rápidamente, complementando el sistema deslizable que ya existe.
*   **Objetivo/Beneficio en Producción:** Agiliza significativamente el flujo de trabajo al permitir localizar y añadir equipos específicos de manera inmediata dentro de un catálogo extenso, sin tener que navegar o desplazarse manualmente por todas las opciones disponibles.

### 🏷️ [COMPLETADO] Separación de Etiquetas en Nodos de Topología (Modo Nodos)
*   **Estado:** Completado. En el modo circular (`window.TOPOLOGY_STYLE === 'circle'`), la dirección IP se renderiza como pastilla superior flotante con borde y texto cian, mientras que el nombre del dispositivo se renderiza en la parte inferior con sombra de contraste, eliminando solapamientos.

### 🌲 Layout de Árbol Genealógico en la Vista de Topología
*   **Propuesta de Mejora:** Añadir un nuevo modo de disposición (layout) en la Vista de Topología que organice los nodos en forma de **árbol genealógico** (jerárquico de arriba hacia abajo o de izquierda a derecha), donde los equipos principales (core switches, routers de borde) se posicionen como raíz y los equipos dependientes se ramifiquen hacia abajo en niveles sucesivos.
    *   **Control de separación horizontal:** Un slider o input numérico que permita ajustar la distancia entre nodos hermanos (mismo nivel jerárquico).
    *   **Control de separación vertical:** Un slider o input numérico que permita ajustar la distancia entre niveles padre-hijo del árbol.
*   **Objetivo/Beneficio en Producción:** Ofrece una representación visual clara de la jerarquía lógica de la red (core → distribución → acceso), facilitando la comprensión de dependencias y la planificación de redundancia. Los controles de espaciado permiten adaptar el diagrama a diferentes densidades de equipos y tamaños de pantalla o exportación.

### 📍 [COMPLETADO] Afinidad y Proximidad de Equipos de Piso por Gabinete en Topología (M-39)
*   **Estado:** Completado. Implementado en `TopologyLayout.js` (`_findAffinityRackForFloorDevice`, `_computeLayout`, `_computeTreeLayout`) con:
    *   **Detección de Rack Anfitrión:** Cálculo ponderado de afinidad analizando los enlaces de red (`connections`) de cada periférico hacia los switches/equipos de cada gabinete de la misma sala.
    *   **Alineación en Cuadrante Inferior:** Submódulos de periféricos ubicados directamente bajo el eje horizontal (`minX` a `maxX`) del rack anfitrión, organizados en subcolumnas compactas que nunca desbordan el ancho del gabinete ni solapan gabinetes vecinos.
    *   **Preservación de Cuadrícula y Armonía:** La línea de base vertical (`floorBaseY`) es uniforme para todos los gabinetes de la sala; los equipos sin conexión se posicionan ordenadamente al pie de la sala, y la altura total de la sala se calcula de forma reactiva adaptándose con holgura.
*   **Problema / Limitación Previa:** En el motor de topología (`TopologyLayout.js`), los equipos de piso (`floor devices`) se ubicaban en una cuadrícula homogénea global al fondo de la sala (máximo 4 columnas) o en una fila horizontal general. Cuando un equipo de piso (p. ej. cámara IP, AP, impresora de red o teléfono VoIP) estaba conectado a un switch alojado en un rack específico (p. ej. Rack 101 o Rack 104), las líneas de cableado Bézier o enlaces ortogonales cruzaban horizontalmente toda la sala atravesando otros gabinetes, generando saturación visual ("spaghetti lines").
*   **Propuesta de Mejora:** Implementar un algoritmo de **Afinidad por Gabinete (Rack Proximity Layout)** para equipos de piso en la Vista de Topología, ubicándolos lo más cercano posible al rack al que están conectados, **sin dañar ni alterar la armonía visual y la alineación estandarizada** de la sala:
    *   **Asignación por Dependencia de Conexión:** El motor analiza la lista de conexiones (`connections`) del equipo de piso. Si está conectado a un switch, router o panel dentro de un gabinete determinado, hereda dicho rack como su *Gabinete Anfitrión*.
    *   **Cuadrante Inferior Dedicado por Rack:** En lugar de una cuadrícula desvinculada al fondo, los equipos de piso se agrupan en columnas o submódulos alineados verticalmente justo debajo del eje horizontal (`minX` a `maxX`) del rack al que pertenecen.
    *   **Preservación de la Armonía y Cuadrícula:**
        *   Los periféricos se distribuyen en filas compactas bajo el ancho del rack anfitrión, respetando los mismos pasos de espaciado técnico (`colGap` horizontal y `rowGap` vertical) regulados por los controles de la barra superior.
        *   Si varios equipos de piso dependen del mismo gabinete, se organizan en sub-filas simétricas sin desbordar el margen lateral hacia los gabinetes contiguos (`RACK_GAP = 32px`), evitando solapamientos con las columnas de otros racks.
        *   Los equipos de piso sin conexiones activas (*unconnected*) se mantienen en una zona neutra o centrada al final, preservando la limpieza del lienzo.
        *   La altura total del contenedor de la sala se calcula de forma reactiva y uniforme considerando el rack con mayor número de periféricos adyacentes, manteniendo la base de la sala plana y elegante.
*   **Objetivo/Beneficio en Producción:**
    *   **Trazado de cables limpio y directo:** Elimina cruces horizontales masivos de cables a lo largo de la sala; los cables descienden directamente desde el switch ToR/distribución hasta sus periféricos adyacentes al pie.
    *   **Lectura arquitectónica instantánea:** Los operadores identifican de un solo vistazo qué cámaras, puntos de acceso o estaciones de trabajo están alimentados por el Switch PoE de cada rack.
    *   **Geometría armónica:** El diagrama conserva su diseño ortogonal, proporciones matemáticas y simetría profesional sin romper las pautas estéticas ya consolidadas.

### 💾 Guardado y Conmutación de Estados de Topología (5 Slots de Posiciones Personalizadas) (M-40) ✅ **[COMPLETADO 2026-10-02]**
*   **Estado de Implementación:** Implementado al 100% y certificado con la suite de pruebas automatizadas en `tests/integrity_check.cjs` (**233 pruebas totales en 16 grupos pasando con 0 fallos**). Incluye:
    *   **Arquitectura de Estado Aislada:** Gestión en `store.js` mediante `saveTopologySlot`, `loadTopologySlot`, `clearTopologySlot` y `renameTopologySlot` completamente desvinculada de `this.snapshot()` para no destruir la pila de Rehacer (`_redoStack`).
    *   **Preservación en Undo/Redo:** `undo()` y `redo()` sanean atómicamente claves huérfanas y conservan intactos los `topologySlots` y `activeTopologySlot` sin pérdida de ranuras guardadas.
    *   **Solución Híbrida de Ergonomía en la Barra de Topología:**
        *   Sliders interactivos H y V reubicados dentro del popover `🎛️ Estilo` con indicadores de valor en píxeles en tiempo real (`28px`, `60px`).
        *   Botonera compacta con icono intuitivo `👁️ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 💾 ]` y botón sintético `⚡ Auto`.
        *   Menú flotante de gestión de ranuras anclado con `right: 0 !important; left: auto !important;` previniendo cualquier desbordamiento o colisión con el panel del inspector.
        *   Ancho total de la barra reducido de 854px a ~495px, garantizando un margen libre superior a 330px (más del 40% del área útil).
*   **Problema / Limitación Previa:** Anteriormente, la Vista de Topología solo contaba con un único estado global de coordenadas (`nodePositions`, `rackPositions`, `roomPositions`, `zoom`, `pan`). Si el usuario organizaba manualmente la topología para un caso de uso específico y luego deseaba explorar otra disposición o reorganizar equipos para una presentación, perdía irrevocablemente la disposición anterior al mover los nodos o pulsar "Auto-Ordenar".
*   **Propuesta de Mejora:** Implementar un sistema de **5 Ranuras de Memoria (Slots / Presets de Topología)** accesibles directamente desde la barra de herramientas de la Vista de Topología:
    *   **Botonera Rápida de 5 Slots:** Controles táctiles compactos `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` en la barra superior de topología con indicador visual de estado (vacío / guardado / activo).
    *   **Guardado y Captura Integral:** Al guardar en un slot (mediante botón "Guardar en Slot", clic largo o menú contextual), se capturan en un snapshot atómico:
        *   Coordenadas `(x, y)` individuales de todos los nodos (`nodePositions`).
        *   Posiciones y dimensiones de gabinetes (`rackPositions`, `rackSizes`).
        *   Posiciones y dimensiones de salas (`roomPositions`, `roomSizes`).
        *   Parámetros de encuadre y visualización: nivel de zoom (`topoZoom`), desplazamiento (`topoPanX`, `topoPanY`), modo de estilo (`card` o `circle`), y espaciados interactivos horizontal y vertical (`topoSpacingX`, `topoSpacing`).
    *   **Conmutación Reactiva Instantánea:** Al hacer clic en un slot guardado, la vista realiza una transición reactiva limpia en Canvas 2D, restaurando exactamente las posiciones, dimensiones y encuadre del estado seleccionado.
    *   **Nombres y Metadatos Personalizados:** Cada slot puede ser renombrado por el operador para identificar su propósito (ej. *"1: Distribución Física"*, *"2: Flujo Core-Acceso"*, *"3: Red CCTV y Wi-Fi"*, *"4: Vista Ejecutiva"*, *"5: Auditoría"*).
    *   **Persistencia Completa en Proyecto:** Los 5 slots se integran en el estado global dentro de `store.state.topologySlots`, guardándose en `localStorage` y exportándose fielmente dentro de los archivos `.rack` y `.json`, permitiendo compartir las diferentes perspectivas del datacenter con otros ingenieros.
*   **Objetivo/Beneficio en Producción:**
    *   **Versatilidad Multi-Perspectiva:** Permite documentar y alternar entre diferentes esquemas lógicos, físicos y funcionales del mismo centro de datos sin tener que rediseñar desde cero.
    *   **Seguridad contra Pérdidas:** Protege horas de diseño manual contra reorganizaciones accidentales o pruebas automáticas de layout.
    *   **Velocidad en Demostraciones y Auditorías:** Facilita cambiar de vista con un solo clic durante reuniones técnicas o revisiones de infraestructura.

### 🔌 Sistema de Cableado Mejorado (Frontal vs Trasero)
*   **Problema:** El sistema de cableado actual no distingue entre los equipos montados en la parte frontal y los equipos montados en la parte trasera del rack.
*   **Propuesta de Mejora:** Mejorar el motor de enrutamiento y la gestión de puertos para que reconozca y gestione conexiones diferenciando claramente si los equipos están en el panel frontal o trasero.
*   **Objetivo/Beneficio en Producción:** Mayor fidelidad a la realidad física del centro de datos y prevención de errores de diseño.

### 🪢 Creación Gráfica e Interactiva de Conexiones en la Vista Física (Drag-to-Connect)
*   **Problema / Limitación Actual:** Actualmente, crear una conexión de red entre dos equipos requiere abrir un formulario modal (`CableModal`), buscar manualmente el equipo y puerto de origen en selectores de texto, y repetir el proceso para el equipo y puerto de destino. Este flujo resulta abstracto, lento y desconectado de la experiencia de manipulación visual de los racks.
*   **Propuesta de Mejora:** Implementar un sistema de conexión visual directo e interactivo sobre el lienzo de la Vista Física, emulando la experiencia táctil de conectar un latiguillo (patch cord) en un datacenter real:
    *   **Modo Cableado / Herramienta de Conexión:** Un botón de acción rápida en la barra de herramientas superior o atajo de teclado (p. ej. tecla `C`) para entrar en "Modo Conexión". Al activarse, los puertos y conectores disponibles en los equipos emiten un resplandor sutil (glow cian) indicando que son interactivos.
    *   **Gesto Natural "Arrastrar para Conectar" (Drag & Connect):**
        *   Hacer clic sostenido (o clic inicial) sobre un puerto o conector del equipo origen inicia el tendido del cable.
        *   Una curva de cable dinámica y elástica (trazado bezier / rubber-band SVG en `#physical-cables-svg`) sigue la trayectoria del cursor en tiempo real con física suave.
    *   **Atracción Magnética (Snap) y Validación Visual:**
        *   Al acercar el cursor a un puerto de un equipo destino válido, el extremo del cable se "imanta" (snap magnético) automáticamente al conector objetivo.
        *   **Feedback cromático:** Si el puerto está libre y es compatible, el indicador y el cable se iluminan en verde/cian con un tooltip informativo flotante (ej. *"Conectar Eth-1 a Switch Core 101"*); si el puerto está ocupado o incompatible, se ilumina en rojo con una advertencia explicativa.
    *   **Selector Rápido de Puerto Flotante (Quick Port Flyout):** Si el usuario arrastra o suelta sobre un equipo sin seleccionar un pin/conector miniatura específico, se despliega un menú flotante ultra-rápido (popover) junto al equipo con sus puertos disponibles (y su tipo: Cobre, Fibra, VLAN), permitiendo elegir el puerto en un solo clic sin abrir modales pesados.
    *   **Finalización Inmediata y Ajuste Rápido:** Al soltar o confirmar el puerto destino, la conexión se registra de inmediato en `store.js` y se re-enruta ortogonalmente por las canaletas físicas. Aparece una pastilla flotante temporal para seleccionar tipo de cable (Cat6, Fibra, DAC) o color con un clic. Presionar `Esc` cancela el tendido en cualquier instante.
*   **Objetivo/Beneficio en Producción:** Transformar una tarea tediosa de ingreso de datos en una interacción visual intuitiva y natural, acelerando drásticamente el diseño de cableado de red y eliminando errores por selección incorrecta de IDs en listas desplegables.

### 🔌 [COMPLETADO] Botón para Invertir y Cambiar Orientación de Conexiones (M-41)
*   **Estado:** Completado. Implementado al 100% y validado con pruebas de integridad (265 pruebas con 0 fallos) e interacción en navegador:
    *   **Botón Swap en Modal de Conexiones (`CableModal.js`):** Botón compacto `#btn-cable-swap` con icono vectorial SVG `.icon-swap` que intercambia instantáneamente equipos y puertos origen/destino recalculando puertos y colisiones sin cerrar el modal.
    *   **Selector de Orientación (`#cable-orientation`):** Selector de canaleta Superior (Techo) e Inferior (Piso) en el modal, persistido en el modelo (`orientation: 'top' | 'bottom'`).
    *   **Trazado Físico en `rack.js`:** Las conexiones inter-rack con orientación inferior descienden a la canaleta de piso técnico y ascienden limpiamente hacia el destino.
    *   **Acciones en Tabla de Conexiones (`tables.js`):** Columna interactiva de Canaleta con toggle de 1 clic y botón de inversión de sentido directo por fila (`data-swap-conn`).
*   **Problema / Necesidad:** Al documentar o modificar conexiones en el centro de datos, los operadores frecuentemente experimentaban dos fricciones comunes:
    1. **Inversión de Sentido en el Formulario:** Si se seleccionan los equipos o puertos en orden inverso (por ejemplo, switch como origen y patch panel como destino, en lugar de patch panel hacia switch), el usuario debe reiniciar y reconfigurar manualmente los 4 selectores (`Equipo Origen`, `Puerto Origen`, `Equipo Destino`, `Puerto Destino`).
    2. **Orientación de Canaleta Fija en Vista Física:** Actualmente, las conexiones entre gabinetes se trazan obligatoriamente por la bandeja aérea superior (*overhead tray*), sin permitir que cables específicos (como alimentación, tierra o cableado troncal bajo piso) se enruten por la canaleta inferior de piso técnico.
*   **Propuesta de Mejora (Solución Simple y Sencilla):**
    *   **Botón Rápido de Inversión (Swap Origen ⇄ Destino) en Modal de Cables (`CableModal.js`):**
        *   Incorporar un botón compacto y accesible con icono vectorial SVG `icon-swap` (`⇄` o `⇅`) situado justo entre el bloque de *Equipo/Puerto Origen* y *Equipo/Puerto Destino*.
        *   Con un solo clic, intercambia los valores de origen por los de destino y viceversa (`src` ⇄ `dst`), rellenando automáticamente las listas de puertos correspondientes y recalculando la validación de colisiones sin pérdida de datos.
    *   **Selector Simple de Orientación de Canaleta (Superior / Inferior):**
        *   Un control conmutador sencillo de 2 estados en el formulario de conexión:
            *   ⬆️ **Canaleta Superior (Techo / Bandeja Aérea)**: El cable viaja por la parte superior de los gabinetes.
            *   ⬇️ **Canaleta Inferior (Piso Técnico / Fondo)**: El cable desciende y viaja por el zócalo o pasillo inferior entre racks.
        *   La propiedad se guarda en el modelo de conexión (`orientation: 'top' | 'bottom'`, por defecto `'top'`) y es respetada inmediatamente por el algoritmo de trazado SVG en `rack.js` (`drawPhysicalCables`).
*   **Objetivo/Beneficio en Producción:**
    *   **Máxima Simplicidad y Cero Fricción:** Ahorra decenas de clics al corregir o invertir la dirección lógica de enlaces de red con una interacción inmediata y directa.
    *   **Fidelidad Física:** Permite representar fielmente instalaciones donde conviven canalizaciones aéreas de fibra óptica con canalizaciones bajo piso técnico para cobre o energía.

### 🔄 Eliminación de Restricciones de Ubicación (Rack vs Piso/Frente)
*   **Problema:** El sistema actual impone restricciones estrictas de tipología entre equipos diseñados para rack y equipos de piso o de frente, limitando la flexibilidad del diseño.
*   **Propuesta de Mejora:** Cambios profundos en la arquitectura para eliminar estas restricciones. No debe haber ninguna restricción respecto a dónde se puede colocar un equipo (cualquier equipo debería poder montarse en rack, piso o frente). Esto requerirá reescribir fuertemente muchos menús, validaciones de arrastrar y soltar (drag & drop) y subsistemas de la aplicación.
*   **Objetivo/Beneficio en Producción:** Flexibilidad absoluta para el arquitecto de infraestructura, permitiendo modelar escenarios no estandarizados o equipos híbridos que la lógica actual prohíbe.

### 📸 Regresión en la Exportación de Racks y Salas a PNG
*   **Problema:** Tras los últimos cambios estructurales y de estilos en la vista física, la función para exportar a imagen (PNG) se ha roto. Ya no es posible exportar un rack específico "1 a 1" (probablemente por fallos al capturar el contenedor o las caras del rack) ni tampoco funciona la exportación completa de la sala.
*   **Requisito:** Al exportar la sala completa en vista física, **el archivo PNG generado debe incluir los cables visibles** si el switch de mostrar cables está activado en la interfaz en ese momento.
*   **Prioridad:** **Crítica/Urgente**, ya que era un punto que estaba funcional y su pérdida impacta la capacidad de generar reportes.

---

## 7. Priorización por Fases (Roadmap del Memory Bank)

> Extraído del `memory-bank/progress.md` y `memory-bank/activeContext.md` — Agosto 2026.

### Fase 1 — Core y Datos (Prioridad Alta)
0. **[REGRESIÓN URGENTE]** Reparar exportación a PNG (1 a 1 por rack y sala completa en vista física) que ha dejado de funcionar tras los últimos cambios estructurales. *(→ Sección 6, 📸)*
1. Handler de `QuotaExceededError` con notificación visual al usuario. *(→ Sección 2, 💾)*
2. Gestión avanzada de puertos: validación, VLAN, submenú, filtrado de ocupados. *(→ Sección 6, 🔌)* ✅ **[COMPLETADO 2026-09-23]**
3. Refactorizar `demoData.js` para nueva estructura de puertos. *(→ Sección 6, 🔌)* ✅ **[COMPLETADO 2026-09-23]**

### Fase 2 — UX y Usabilidad
4. Buscador en catálogo del modal de equipos. *(→ Sección 6, 🔍)*
5. Controles de edición/eliminación inline en el Outliner. *(→ Sección 6, 🌳)*
6. Estandarización de alturas de rack (select con valores fijos, default 8U). *(→ Sección 6, 📐)*
7. Ancho fijo proporcional para slots (10× la unidad U = 240px). *(→ Sección 6, 📏)*
8. Grilla de fondo tenue en vista física. *(→ Sección 6, 🏁)*
9. Categoría "Todos" y agrupación "Network" en sidebar. *(→ Sección 6, 🔍 y 🔌)*
10. Inspector colapsable, opciones de ordenamiento en Outliner. *(→ Sección 6, 🗂️ y 🔄)*
11. Creación, edición y eliminación de salas y racks desde el Inspector. *(→ Sección 6, 🛠️)*
12. Creación gráfica e interactiva de conexiones en vista física (Drag-to-Connect). *(→ Sección 6, 🪢)*
13. Botón para cambiar orientación e invertir conexiones en CableModal y vista física (M-41). *(→ Sección 6, 🔌)* ✅ **[COMPLETADO 2026-10-02]**

### Fase 3 — Topología Avanzada
13. Persistencia de posiciones de nodos en la topología. *(→ Sección 6, 🕸️)* ✅ **[COMPLETADO]**
14. Layout en Árbol Jerárquico estilo Draw.io con conexiones ortogonales redondeadas y reubicación de dispositivos no conectados en la parte baja de racks y sala. *(→ Sección 6, 🕸️)* ✅ **[COMPLETADO 2026-09-27]**
15. Motor de temas y personalización visual en topología (transparencias, patrones de fondo, etiquetas duales IP/Nombre). *(→ Sección 6, 🎨)* ✅ **[COMPLETADO 2026-09-27]**
16. Skins visuales personalizadas en topología (cards, imágenes personalizadas, estilos extendidos). *(→ Sección 6, 🖼️)*
17. Guardado y conmutación de 5 estados (slots de posiciones) de topología (M-40). *(→ Sección 6, 💾)* ✅ **[COMPLETADO 2026-10-02]**

### Fase 4 — Exportación y Colaboración
16. Plantilla completa de exportación con todos los campos. *(→ Sección 6, 📋)*
17. Importación masiva CSV/Excel con validación y resolución de conflictos. *(→ Sección 6, 📥)*
18. Ocultar/mostrar columnas en tablas con persistencia. *(→ Sección 6, ⚙️)*
19. Fidelidad visual 1:1 en exportación de imágenes PNG con html2canvas (racks, cables y piso). *(→ Sección 6, 📸)*
20. **[NUEVO]** Exportación de la sala y gabinetes a formato **SVG** puro (escalable sin pérdida de calidad). Debe ser exacto (1 a 1) y respetar el tema actual de la aplicación (Claro/Oscuro).
21. **[NUEVO]** Exportación de la sala a formato **PDF Vectorial**, ideal para imprimir planos e informes del Datacenter. Debe ser exacto (1 a 1) y respetar el tema actual de la aplicación.

### Fase 5 — Responsive y Avanzado
20. Rediseño completo para móvil/tablet (media queries, gestos, bottom nav). *(→ Sección 6, 📱)*
21. Tema Sepia y visibilidad del theme toggler. *(→ Sección 6, 🎨)*

---

## 8. Decisiones Activas y Contexto de Desarrollo

> Extraído del `memory-bank/activeContext.md` — Agosto 2026.

*   **Stack inmutable:** Mantener el entorno 100% Vanilla JS + `pnpm`. No se introducirán herramientas de build ni frameworks.
*   **Separación estricta estado/DOM:** Todas las actualizaciones de UI deben dispararse desde el Proxy ES6 en `store.js`. Nunca mutar el DOM directamente para reflejar datos.
*   **Documentación como fuente de verdad:** `CODEBASE_ORIENTATION_MAP.md` y `ARCHITECTURE_GUIDE.md` se mantienen actualizados para onboarding de desarrolladores.
*   **Este archivo (`mejoras.md`) es la fuente de verdad** para propuestas de mejora; `roadmap_mejoras.md` analiza su complejidad y dependencias.
