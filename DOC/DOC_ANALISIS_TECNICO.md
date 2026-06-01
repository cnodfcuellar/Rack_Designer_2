# 🔬 Análisis Técnico Riguroso — RACK Designer 2

**Versión analizada:** Commit actual en branch `main`  
**Archivos analizados:** `index.html`, `style.css`, `js/utils.js`, `js/store.js`, `js/main.js`, `js/ui/catalog.js`, `js/ui/faceplates.js`, `js/ui/modals.js`, `js/ui/rack.js`, `js/ui/tables.js`, `js/ui/topology.js`  
**Total de líneas de código:** ~2,450 (excluyendo `xlsx.full.min.js`)

---

## 📊 Cuadro Resumen de Calificaciones

| Módulo | Calificación | Estado |
|---|---|---|
| `store.js` — Estado Central | **9.0 / 10** | 🟢 Excelente |
| `utils.js` — Herramientas | **8.5 / 10** | 🟢 Muy Bueno |
| `style.css` — Estilos | **8.5 / 10** | 🟢 Muy Bueno |
| `index.html` — Estructura | **7.5 / 10** | 🟡 Bueno |
| `topology.js` — Motor Canvas | **8.0 / 10** | 🟢 Muy Bueno |
| `rack.js` — Vista Física | **7.5 / 10** | 🟡 Bueno |
| `tables.js` — Panel Inferior | **8.0 / 10** | 🟢 Muy Bueno |
| `modals.js` — Formularios | **7.0 / 10** | 🟡 Bueno |
| `catalog.js` — Catálogo | **7.5 / 10** | 🟡 Bueno |
| `faceplates.js` — Arte | **8.5 / 10** | 🟢 Muy Bueno |
| `main.js` — Controlador | **7.0 / 10** | 🟡 Bueno |
| **PROYECTO GLOBAL** | **7.9 / 10** | 🟢 Muy Bueno |

---

## 📋 Análisis Detallado por Módulo

---

### 1. `js/store.js` — El Cerebro (9.0/10)

**Responsabilidad:** Gestión centralizada del estado (Single Source of Truth), Patrón Observer (Pub/Sub), historial Deshacer/Rehacer, persistencia en `localStorage`.

**✅ Fortalezas:**
- Excelente uso del Patrón **Proxy** de ES6 para detectar mutaciones automáticamente.
- Barrera de seguridad explícita contra ataques de Prototype Pollution: `['__proto__', 'constructor', 'prototype'].includes(key)`.
- La API pública del Store (`addDevice`, `updateDevice`, `deleteDevice`, etc.) es clara y semánticamente correcta.
- El historial de Undo/Redo con 30 pasos y `deepClone` es una implementación sólida y correcta.
- `getStats()` centraliza los cálculos derivados evitando que cada módulo UI los recalcule.

**⚠️ Debilidades:**
- `store._raw` está **expuesto públicamente**. Módulos externos como `catalog.js` y `modals.js` acceden y mutan directamente `store._raw.rooms`, `store._raw.racks`, etc., saltándose la API formal del Store y rompiendo el principio de encapsulación.
- El método `deleteRoom` **no está en `store.js`**, sino en `modals.js`. Esta lógica de negocio debería vivir en el Store.
- El parámetro `devices: []` en la definición de Rack dentro de `_defaultState()` es un artefacto sin uso real (los dispositivos se almacenan en el array plano `state.devices`). Genera confusión.
- No hay validación al cargar datos con `loadData()`. Un archivo JSON corrupto o malicioso podría contaminar el estado.

---

### 2. `js/utils.js` — Herramientas (8.5/10)

**Responsabilidad:** Funciones utilitarias globales: generación de IDs únicos, clonación profunda, interpolación lineal, sanitización HTML, notificaciones toast, descarga de JSON.

**✅ Fortalezas:**
- La función `escapeHTML()` es robusta: usa un mapa de reemplazos para los 5 caracteres peligrosos (`&`, `<`, `>`, `'`, `"`). Es la piedra angular de la seguridad XSS del proyecto.
- `deepClone` con `JSON.parse(JSON.stringify())` es simple y efectivo para el tipo de datos del proyecto (sin fechas ni funciones).
- El sistema de notificaciones `notify()` con `setTimeout` y animación de salida es una implementación de UX muy correcta.

**⚠️ Debilidades:**
- La función `uid()` usa `Math.random()`, que **no es criptográficamente seguro**. En un entorno multiusuario real, esto podría generar colisiones. La alternativa es `crypto.randomUUID()`.
- El archivo mezcla responsabilidades: herramientas de datos (`deepClone`, `lerp`) con herramientas de UI (`notify`). Debería separarse.
- `lerp` está definida pero **nunca se usa** en ningún módulo. Es código muerto.

---

### 3. `style.css` — Sistema de Diseño (8.5/10)

**Responsabilidad:** Todos los estilos visuales. Define un sistema de diseño completo con variables CSS (tokens de diseño) para colores, tipografía, espaciado y sombras.

**✅ Fortalezas:**
- Uso excelente de `:root` con variables CSS semánticas (`--accent`, `--bg-main`, `--text-primary`). Esto hace que el sistema sea muy mantenible y temizable.
- El archivo está bien organizado en secciones comentadas (VARIABLES, LAYOUT, HEADER, SIDEBAR, etc.).
- El diseño "dark mode" con efectos de glow neón es visualmente premium y consistente.
- Las animaciones CSS (`@keyframes blink`, `@keyframes notif-in`) son correctas y performantes al usar `opacity` y `transform` (propiedades animables por GPU).
- Buen trabajo en responsive con el `@media (max-width: 768px)` para móviles con barras de desplazamiento horizontal.

**⚠️ Debilidades:**
- El archivo es **monolítico** (446 líneas en un solo archivo). En un proyecto más grande debería dividirse en módulos (variables, layout, componentes, responsive).
- El valor de consumo eléctrico máximo `maxPower = 5000` está **hardcodeado en JavaScript (`catalog.js`)** en lugar de ser una variable CSS o configurable.
- Hay estilos inline dispersos en el HTML (`style="margin-right:8px"`, `style="display:none"`). Deberían estar en clases CSS.
- La barra de potencia `.cap-bar-fill.power` siempre es verde/azul sin cambiar de color a amarillo/rojo al acercarse al límite. Falta lógica de alerta visual.

---

### 4. `index.html` — Estructura (7.5/10)

**Responsabilidad:** Único archivo HTML de la aplicación (SPA). Define la estructura del DOM, los modales, el sistema de capas y carga los scripts.

**✅ Fortalezas:**
- Uso correcto de etiquetas semánticas: `<header>`, `<aside>`, `<main>`, `<nav>`.
- Los comentarios de sección (`<!-- HEADER -->`, `<!-- SIDEBAR -->`) hacen el archivo legible.
- El `lang="es"` es correcto para accesibilidad y SEO.
- Carga de fuentes de Google Fonts con `rel="preconnect"` para optimizar la velocidad.

**⚠️ Debilidades:**
- Los `<script>` y `<link>` de CDN para `mobile-drag-drop` están al **final del `<body>`** en lugar de en el `<head>`. El CSS en particular debería estar en el `<head>` para evitar un flash de estilo sin aplicar (FOUC).
- Hay un elemento **duplicado y sin uso**: `<div id="view-topology" class="hidden">` que nunca se muestra; la vista de topología usa el `<canvas>`.
- Hay un `<input type="file" id="import-file">` y otro `<input type="file" id="file-import">`. Dos inputs de importación con IDs diferentes crean confusión y fragmentan la lógica (uno se usa en `modals.js` y el otro en `main.js`).
- No hay `<meta name="description">` ni `<link rel="icon">` para un favicon.
- La dependencia de `mobile-drag-drop` usa una versión **Release Candidate (`rc.2`)**, no una versión estable de producción.

---

### 5. `js/ui/topology.js` — Motor de Topología (8.0/10)

**Responsabilidad:** Motor de renderizado Canvas 2D completo. Dibuja salas, racks, equipos como nodos y cables animados. Gestiona Paneo, Zoom, Drag & Drop de nodos/racks/salas y Redimensionado.

**✅ Fortalezas:**
- Implementación matemática correcta de coordenadas: convierte entre espacio de pantalla y espacio del mundo (`(e.offsetX - px) / zoom`).
- Las partículas animadas en los cables (efecto "datos fluyendo") son un gran toque visual logrado con cálculo de puntos de curva de Bézier.
- El `hoveredNode` con resaltado de nodos conectados ("highlight + dim") es una función de UX de nivel profesional.
- El HUD flotante de información al hacer hover sobre un nodo es excelente.
- El uso de `requestAnimationFrame` es el método correcto y eficiente para el bucle de renderizado.
- El `ResizeObserver` en `main.js` que llama a `resizeCanvas()` asegura que el canvas nunca quede mal dimensionado.

**⚠️ Debilidades:**
- El archivo tiene **16 variables globales** en el scope del módulo (`canvas`, `ctx`, `topoAnim`, `panStart`, `nodePositions`, etc.). Si algún otro script las pisa, habrá bugs difíciles de rastrear.
- No hay `auto-layout` (auto-organización). Con muchos nodos, el lienzo queda caótico y hay que organizar todo a mano.
- El color de los Rooms (salas) en el canvas está **hardcodeado** en naranja (`#f97316`), ignorando cualquier posible personalización.
- El `flowT` global aumenta indefinidamente sin reset. Aunque `% 1` lo mantiene funcional, es un anti-patrón.
- Las contraseñas (`dev.pass`) se muestran en texto plano en el HUD flotante de hover.

---

### 6. `js/ui/rack.js` — Vista Física (7.5/10)

**Responsabilidad:** Renderizado DOM de los racks, lógica de Drag & Drop HTML5, manejo de eventos de equipos (hover, doble clic, menú contextual).

**✅ Fortalezas:**
- La lógica de colisión para el Drag & Drop (`canPlace`) es correcta y clara.
- La función `showContextMenu` con posicionamiento dinámico es una UX excelente.
- Los tooltips `#device-tooltip` son informativos y bien posicionados.
- El resaltado de slots (`drop-highlight` / `drop-invalid`) da feedback visual inmediato al usuario.
- Buena validación anti-colisión que evita que dos equipos ocupen el mismo slot.

**⚠️ Debilidades:**
- `renderPhysical()` reconstruye **todo el HTML** del DOM de racks en cada cambio. Para muchos racks con muchos equipos, esto puede causar un parpadeo perceptible y pérdida de scroll position.
- El tooltip muestra la contraseña en texto plano (`dev.pass`).
- El menú contextual (`showContextMenu`) tiene un bug potencial: si se muestra cerca del borde inferior de la pantalla no tiene lógica de "flip" para reposicionarse arriba como sí lo hace el HUD de topología.
- La lógica del ghost de drag (`ghost.innerHTML = buildFaceplate(...)`) es correcta pero el elemento `drag-ghost` vive en el HTML global y no se limpia si el usuario cancela con Escape.

---

### 7. `js/ui/tables.js` — Panel de Tablas (8.0/10)

**Responsabilidad:** Renderizado de tablas de Inventario y Conexiones en el panel inferior. Edición inline de celdas. Validación de IP y MAC. Exportación a CSV y Excel.

**✅ Fortalezas:**
- Validación correcta y con feedback de IP (regex IPv4) y MAC antes de guardar.
- La edición inline con `dblclick` y `blur` es un patrón de UX sólido.
- La integración con SheetJS para exportar a Excel con dos hojas (Inventario + Conexiones) en un solo archivo es una funcionalidad muy valorada.
- El filtro de búsqueda es eficiente y funciona bien en tiempo real.
- El uso de `escapeHTML()` en todas las celdas dinámicas es correcto.

**⚠️ Debilidades:**
- Las tablas **no se pueden ordenar** por columna (clic en cabecera para ordenar por IP, nombre, etc.).
- No hay **paginación**. Con cientos de equipos, la tabla del DOM se vuelve lenta y difícil de navegar.
- La columna de Contraseña se muestra en texto plano. Debería mostrar `••••••` con un botón de "ojo" para revelarla.
- `finishCellEdit` usa `store.updateDevice(devId, { [field]: val })`, lo cual es un uso de notación de corchetes que el escáner SAST marcó, pero está correctamente protegido por el whitelist `allowedFields`.
- La función `startCellEdit` no escapa el `orig` al meterlo en el `value` del input. Si el valor tiene comillas, podría romper el HTML aunque en este caso el atributo `value` del input es tolerante a eso.

---

### 8. `js/ui/modals.js` — Formularios y Exportación (7.0/10)

**Responsabilidad:** Lógica de apertura/cierre de modales, guardado de formularios, exportación (CSV, JSON, PNG), importación de JSON, eliminación de salas.

**✅ Fortalezas:**
- La exportación a PNG mediante un Canvas oculto offscreen es una técnica elegante que no requiere librerías externas.
- La validación de IP y MAC en el modal de equipo es correcta.
- La lógica de "reducción de rack con equipos en overflow" (advertencia antes de borrar equipos que quedan fuera del nuevo tamaño) es una gran adición de calidad.
- El modal comparte lógica entre "nuevo equipo", "editar equipo" y "editar plantilla de catálogo", lo cual reduce la duplicación de HTML.

**⚠️ Debilidades:**
- `deleteRoom` **no debería estar en `modals.js`**. Es una operación de negocio puro que debería vivir en `store.js` como `store.deleteRoom(id)`.
- `exportCSV` está **duplicado**: existe tanto en `modals.js` como tiene una versión diferente en `tables.js`. Esto viola el principio DRY (Don't Repeat Yourself) y genera inconsistencias.
- Al agregar un nuevo equipo desde el modal (`openAddDeviceModal`), el usuario espera poder elegir en qué Rack colocarlo. En cambio, el sistema le dice "arrastra desde el catálogo", lo cual es confuso.
- El comentario `alert('Funcionalidad de importar catálogo (Próximamente)')` es una promesa incumplida que debería estar implementada o removida.
- No hay validación de tipo en el `importJSON`: no verifica que `data.connections` sea un array, etc.

---

### 9. `js/ui/catalog.js` — Catálogo y Estadísticas (7.5/10)

**Responsabilidad:** Renderizado del catálogo de plantillas de equipos, filtros de categoría, gestión CRUD del catálogo, renderizado de tabs de salas, estadísticas del sidebar.

**✅ Fortalezas:**
- El sistema de filtros por categoría (`all`, `server`, `switch`, `storage`) es limpio y funcional.
- La integración con los eventos de drag en cada item del catálogo es correcta.
- Las estadísticas de capacidad (barras de progreso de Rack y Power) son una funcionalidad de alto valor para un gestor de datacenter.
- El catálogo es editable en runtime: se pueden modificar y eliminar plantillas.

**⚠️ Debilidades:**
- `renderRoomTabs()` **está en `catalog.js`**, lo cual es semánticamente incorrecto. El manejo de salas no tiene nada que ver con el catálogo.
- El `CATALOG` es una variable global mutable (`let`). Si el usuario elimina una plantilla, esa eliminación se pierde al recargar la página porque el catálogo **no persiste** en `localStorage`.
- El límite de potencia máxima (`maxPower = 5000`) está hardcodeado en `renderStats()`. Debería ser configurable por el usuario.
- El catálogo no permite añadir plantillas con tamaños personalizados más allá de los predefinidos (1, 2, 4, 8U).

---

### 10. `js/ui/faceplates.js` — Arte de Equipos (8.5/10)

**Responsabilidad:** Genera HTML con representaciones visuales "realistas" de los frentes de cada tipo de equipo para la Vista Física.

**✅ Fortalezas:**
- Código creativo de alto impacto visual. El switch con 24 puertos RJ-45 animados, el UPS con pantalla LCD, el storage con slots de discos, son un diferenciador impresionante.
- La función es pura (dado el mismo dispositivo, siempre produce el mismo HTML), lo cual la hace predecible y testeable.
- El uso de `--blink-delay` como variable CSS inline permite que las animaciones estén desfasadas entre puertos, dando una sensación de actividad realista.
- El detector de marca (`device.name.toLowerCase().includes('hp')`) es un toque de detalle.

**⚠️ Debilidades:**
- La función es un `if/if/if` encadenado de 96 líneas. Un objeto de dispatch (`const renderers = { server: renderServer, switch: renderSwitch }`) sería más mantenible y extensible.
- Los valores del LCD del UPS (`230V IN`, `BATT: 100%`, `RUNTIME: 18MIN`) son **completamente ficticios y hardcodeados**. Deberían mostrar datos reales del equipo si existieran (por ejemplo, el campo `power`).
- No hay faceplate para un tipo de equipo desconocido más que un `<div>` gris genérico. Debería haber un tipo "generic" más elaborado.
- `faceplates.js` llama a `store._raw.connections` directamente para detectar si un switch tiene conexiones. Esto crea un acoplamiento directo con el Store.

---

### 11. `js/main.js` — Controlador Principal (7.0/10)

**Responsabilidad:** Punto de entrada. Inicializa todos los módulos, define eventos globales (zoom, paneo, atajos de teclado, menú de proyecto), y contiene la función `loadDemoData`.

**✅ Fortalezas:**
- `renderAll()` como función de re-renderizado global es simple y predecible.
- `store.on('change', renderAll)` establece el ciclo reactivo principal correctamente.
- El manejo de atajos de teclado (`Ctrl+Z`, `Ctrl+Y`, `Escape`) es una excelente adición de productividad.
- El `ResizeObserver` para redimensionar el canvas es la forma moderna y correcta de hacerlo.
- `loadDemoData()` genera datos realistas y complejos que sirven para demostrar todas las capacidades.

**⚠️ Debilidades:**
- `renderAll()` ejecuta **todos los renderizados** (salas, stats, catálogo, físico, tabla) aunque solo haya cambiado un campo de un equipo. Esto es ineficiente. Debería granularizarse (ej: si solo cambia un device, re-renderizar solo la vista física y la tabla).
- La función `loadDemoData()` tiene **219 líneas** dentro de `main.js`. Debería estar en su propio archivo `demo.js`.
- Las funciones de zoom/paneo para la Vista Física usan `store._raw.physZoom` directamente en lugar de métodos del Store, rompiendo la encapsulación.
- No hay manejo de errores si `getElementById` devuelve `null` en algunos listeners de `initGlobalEvents`.

---

## 🎯 Listado de Mejoras (Ordenadas por Impacto)

### 🔴 CRÍTICAS (Alto impacto, resolver primero)

| # | Mejora | Módulo | Justificación |
|---|---|---|---|
| 1 | **Encapsular `store._raw`**: Crear métodos formales para todo acceso al estado. | `store.js` | Elimina acoplamiento, mejora mantenibilidad. |
| 2 | **Ocultar contraseñas**: Mostrar `••••••` en tooltip, HUD y tabla con botón de ojo. | `rack.js`, `topology.js`, `tables.js` | Datos sensibles expuestos visualmente. |
| 3 | **Persistir el catálogo en localStorage**: Guardar el array `CATALOG` para que las ediciones del usuario sobrevivan recargas. | `catalog.js` / `store.js` | Los cambios al catálogo se pierden. |
| 4 | **Mover `deleteRoom` al Store**: Crear `store.deleteRoom(id)` que limpie cascada de racks y devices. | `store.js` / `modals.js` | Lógica de negocio fuera del Store. |
| 5 | **Eliminar duplicación de `exportCSV`**: Una única función en `tables.js` o `utils.js`. | `modals.js` / `tables.js` | Viola DRY, genera inconsistencias. |

### 🟠 IMPORTANTES (Calidad y UX)

| # | Mejora | Módulo | Justificación |
|---|---|---|---|
| 6 | **Renderizado granular**: No llamar a `renderAll()` en cada cambio; usar el `source` del evento para renderizar solo lo necesario. | `main.js` | Mejora rendimiento con muchos datos. |
| 7 | **Ordenar columnas en la tabla**: Clic en cabecera para ordenar ascendente/descendente. | `tables.js` | Funcionalidad estándar de toda tabla. |
| 8 | **Alerta visual de consumo**: Barras de capacidad que cambian a amarillo (80%) y rojo (95%). | `style.css` / `catalog.js` | Valor alto para el usuario final. |
| 9 | **Auto-layout en Topología**: Botón "Auto-ordenar" que aplica algoritmo de fuerza dirigida. | `topology.js` | Con muchos nodos el grafo queda caótico. |
| 10 | **Implementar Importar Catálogo**: Completar la función "Próximamente" del menú. | `main.js` | Promesa incumplida en la UI. |
| 11 | **Separar `renderRoomTabs` de `catalog.js`**: Moverla a su propio archivo `rooms.js` o a `main.js`. | `catalog.js` | Responsabilidad mal ubicada. |
| 12 | **Poder elegir Rack al agregar equipo**: En el modal de nuevo equipo, añadir un `<select>` de Rack y slot. | `modals.js` | El flujo actual es confuso. |
| 13 | **Paginación o virtualización en tablas**: Máximo 50 filas por página con navegación. | `tables.js` | Rendimiento con cientos de equipos. |
| 14 | **Separar `loadDemoData` a un archivo propio**: Crear `js/demo.js`. | `main.js` | `main.js` tiene demasiada responsabilidad. |

### 🟡 MEJORAS DE CALIDAD DE CÓDIGO

| # | Mejora | Módulo | Justificación |
|---|---|---|---|
| 15 | **Reemplazar `Math.random()` por `crypto.randomUUID()`** en `uid()`. | `utils.js` | IDs más seguros y únicos. |
| 16 | **Eliminar código muerto `lerp()`** que nunca se usa. | `utils.js` | Mantiene el código limpio. |
| 17 | **Refactorizar `faceplates.js`** a un objeto de dispatch en lugar de if/if/if. | `faceplates.js` | Más fácil de extender con nuevos tipos. |
| 18 | **Eliminar el array `devices: []` falso** dentro de la definición de Rack en `_defaultState()`. | `store.js` | Genera confusión arquitectural. |
| 19 | **Corregir posición del `<link>` y `<script>` de CDN** al `<head>` y eliminar `#view-topology` sin uso. | `index.html` | Buenas prácticas de HTML. |
| 20 | **Añadir validación de esquema en `importJSON`**: Verificar que `rooms`, `racks`, `devices`, `connections` sean arrays. | `main.js` | Robustez al importar archivos dañados. |
| 21 | **Encapsular variables globales de topology**: Envolverlas en un objeto `topoState` para evitar colisiones con el scope global. | `topology.js` | Reduce riesgo de bugs con variables globales. |

### 🟢 MEJORAS FUTURAS (Features Nuevas)

| # | Mejora | Módulo | Justificación |
|---|---|---|---|
| 22 | **Modo Claro/Oscuro (Light Mode Toggle)**: Botón sol/luna que cambie las variables CSS de `:root`. | `style.css` / `main.js` | Accesibilidad y preferencias del usuario. |
| 23 | **Gestión de Puertos Reales**: Que cada equipo tenga puertos numerados y se pueda conectar "Puerto 24 del Switch" al "eth0 del Server". | `store.js` / `topology.js` | Funcionalidad de nivel Enterprise. |
| 24 | **Alertas de Capacidad Configurables**: Que el usuario defina el umbral de potencia máxima (actualmente fijo en 5,000W). | `catalog.js` / `modals.js` | Adaptabilidad a distintos data centers. |
| 25 | **Múltiple Selección y Copiar/Pegar**: Seleccionar varios equipos con `Ctrl+Clic` y duplicarlos. | `rack.js` / `main.js` | Mejora de productividad para diseños grandes. |

---

## 📈 Conclusión General

RACK Designer 2 es un proyecto de **nivel muy bueno** (7.9/10). Demuestra un dominio sólido de JavaScript moderno, patrones de arquitectura frontend (Observer, Single Source of Truth) y técnicas avanzadas de renderizado (Canvas 2D, Drag & Drop API). 

**Los puntos más destacados son** la capa de seguridad XSS bien implementada, el motor de topología Canvas con animaciones de partículas, y el diseño visual premium con el sistema de tokens CSS.

**Las áreas de mayor oportunidad** son la encapsulación del Store (demasiados módulos tocan `_raw` directamente), la granularidad del re-renderizado (actualmente todo o nada), la persistencia del catálogo y la duplicación de lógica de exportación CSV.

Resolviendo las 5 mejoras críticas, el proyecto subiría a un sólido **9.0/10** y estaría listo para un entorno de producción empresarial.
