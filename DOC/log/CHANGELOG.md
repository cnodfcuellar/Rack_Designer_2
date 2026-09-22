## [2026-09-21] Corrección de Renderizado y Tema en Gabinetes (Vista Física)

### Renderizado Físico (`js/ui/rack.js`, `css/components/rack.css`, `service-worker.js`)
- **Adaptación al Tema Claro/Oscuro:**
  - Se eliminaron los colores oscuros estáticos/quemados (`#060a12`, `#090d16`, etc.) del interior de los gabinetes en `rack.css`.
  - Ahora se utilizan variables CSS (`var(--bg-main)`, `var(--bg-card1)`, `var(--text-muted)`) para que los racks adopten los colores del tema general correctamente (claro u oscuro).
- **Nombre y Apariencia de Vista Trasera:**
  - En `rack.js`, se corrigió el texto de cabecera de la vista trasera para que ya no diga genéricamente "Vista Trasera", sino que incluya el nombre del gabinete (`A2 (Trasera)`).
  - Se removieron los estilos "inline" quemados para la vista trasera y se trasladaron a la clase CSS `.rear-view` para mantener consistencia con el diseño.
- **Service Worker v22:**
  - Incremento de caché a `rack-designer-next-cache-v22` para forzar la actualización de los estilos y scripts.

---

## [2026-09-21] Restauración de Estados por Defecto (Cables y Estadísticas)

### Interfaz Inicial (`index.html`, `service-worker.js`)
- **Cables Ocultos por Defecto:**
  - Se eliminó el atributo `checked` del input `#checkbox-toggle-cables` en `index.html` para que los cables inicien ocultos por defecto, corrigiendo una regresión de los últimos cambios.
- **Panel de Estadísticas Contraído por Defecto:**
  - Se añadió la clase `collapsed` al contenedor `#stats-section` en `index.html` para que el panel de estadísticas inicie contraído por defecto.
- **Service Worker v21:**
  - Incremento de caché a `rack-designer-next-cache-v21` para refresco inmediato en navegador.

---

## [2026-09-21] Ajuste Puntual de Zoom Aritmético de 10% en 10%


### Controles de Interfaz y Zoom Global (`js/main.js`, `service-worker.js`)
- **Pasos Lineales de 10% en Botones de Zoom:**
  - En [js/main.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/main.js#L228-L237), se reemplazó el multiplicador geométrico de 20% (`* 1.2` y `/ 1.2`) por incrementos/decrementos aritméticos redondeados de `0.1` (10% exacto: 100% -> 110%, 120% / 100% -> 90%, 80%).
- **Service Worker v20:**
  - Incremento de caché a `rack-designer-next-cache-v20` para refresco inmediato en navegador.

---

## [2026-09-21] Ajuste Puntual de Separación entre Gabinetes a 48px

### Renderizado Físico y Visibilidad de Cableado (`js/ui/rack.js`, `service-worker.js`)
- **Ajuste Directo de Separación:**
  - Se configuró la separación entre gabinetes en `gap: 48px;` en `#view-physical-content` y `#racks-area` de [js/ui/rack.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/js/ui/rack.js#L127-L132) conforme a la instrucción directa del usuario.
- **Service Worker v19:**
  - Incremento de caché a `rack-designer-next-cache-v19` para refresco inmediato en navegador.

---

## [2026-09-21] Corrección de Cables en Periféricos de Piso, Switch de Conexiones y Capacidad de 3 Racks en Fila

### Renderizado Físico y Visibilidad de Cableado (`js/ui/rack.js`, `index.html`, `service-worker.js`)
- **Corrección Crítica de Reasignación en Periféricos de Piso:**
  - En `getPos()`, las variables `x` e `y` se declaraban con `const`, lo que causaba un error fatal de JavaScript (`TypeError: Assignment to constant variable`) al recalcular la posición sobre el icono de un periférico de piso, interrumpiendo la ejecución completa del trazado de cables.
  - Se corrigieron a declaraciones mutables `let x, let y`, restaurando el dibujo continuo y sin excepciones.
- **Activación por Defecto del Switch de Cables:**
  - En `index.html`, el interruptor interactivo `#checkbox-toggle-cables` ahora incluye el atributo `checked` por defecto, garantizando que al recargar la aplicación las conexiones físicas se visualicen de inmediato.
  - En `js/ui/rack.js`, `#physical-cables-svg` se inicializa con `display: block;` y validación defensiva `!checkboxCables || checkboxCables.checked`.
- **Restauración de Separación Estándar para 3 Racks en Primera Fila:**
  - Se restauró la separación entre gabinetes a `gap: 24px;` en `#view-physical-content` y `#racks-area` (en lugar de `gap: 72px;`).
  - Con un ancho de 280px por rack, 3 gabinetes contiguos ocupan exactamente $888\text{px}$ ($280\text{px} \times 3 + 24\text{px} \times 2$), encajando holgadamente en la primera fila de la vista física sin desbordar ni saltar a una fila inferior.
- **Service Worker v18:**
  - Incremento de caché a `rack-designer-next-cache-v18` para refresco inmediato en navegador.

---

## [2026-09-21] Enrutamiento Perimetral Segregado de Cables a Periféricos de Piso y Puertos Superiores Anti-Colisión

### Cableado Estructurado Físico y Topología de Periféricos (`js/ui/rack.js`, `service-worker.js`)
- **Erradicación de Colisiones sobre Tarjetas de Piso:**
  - Se eliminó el descenso vertical en línea recta que atravesaba por el centro las tarjetas de periféricos de la primera fila (Cámaras de seguridad) para llegar a dispositivos de filas inferiores (APs, Consolas de diagnóstico).
  - Enrutamiento segregado multizona para tarjetas de Fila 2+: el cable desciende verticalmente por el pasillo libre (gap de 12px entre columnas) hasta el gap inter-filas inmediatamente superior al dispositivo, donde gira a 90° horizontalmente hacia el puerto, preservando intactas las tarjetas superiores.
- **Punto de Conexión Superior sobre el Icono:**
  - Los cables ya no terminan en el centro geométrico de la tarjeta sobre el nombre y dirección IP.
  - El puerto de conexión físico se ancla en el borde superior de la tarjeta, alineado con el eje del icono (`floorPortX = iconCenterX, floorPortY = topY`), dejando la información de texto 100% despejada y legible.
  - Círculos conectores terminales estilizados con radio de 2.5px, fondo blanco y borde cromático acorde al tipo de cable.
- **Service Worker v17:**
  - Incremento de caché a `rack-designer-next-cache-v17`.

---

## [2026-09-21] Geometría Rígida e Indeformable del Gabinete (EIA-310), Blindaje de Cabecera y Faceplates 2U/4U

### Arquitectura de Gabinete y Robustez Geométrica (`css/components/rack.css`, `js/ui/rack.js`, `css/components/faceplates.css`, `js/ui/faceplates.js`, `css/components/misc.css`, `service-worker.js`, `tests/integrity_check.cjs`)
- **Blindaje Geométrico Absoluto (Triple Candado de 280px):**
  - Se eliminó la deformación horizontal del gabinete por nombres largos de salas/racks. `.rack-wrapper` y `.rack-card` están bloqueados estrictamente con `width: 280px; min-width: 280px; max-width: 280px; box-sizing: border-box; overflow: hidden;`.
  - El título `.rack-title` ahora utiliza `flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`, impidiendo que un nombre extenso ensanche el gabinete, truncando con puntos suspensivos y preservando el nombre completo en el tooltip nativo `title="..."`.
- **Simetría Milimétrica de Columnas ($20\text{px} + 240\text{px} + 20\text{px} = 280\text{px}$):**
  - Rieles laterales (`.rack-rail-left` y `.rack-rail-right`) bloqueados rígidamente en `width: 20px; min-width: 20px; max-width: 20px; flex-shrink: 0; flex-grow: 0;`.
  - Bahía central de slots (`.rack-slots`) sincronizada en `width: 240px; min-width: 240px; max-width: 240px; flex-shrink: 0; flex-grow: 0;`, erradicando el desfase provocado por el estilo en línea obsoleto de `style="width:220px"` en `rack.js`.
  - Eliminado por completo el "abismo negro" y desalineación vertical entre los números de las unidades U del riel derecho e izquierdo.
- **Orientación Vertical Industrial EIA-310 (U1 en la Base, U42 en el Techo):**
  - Implementación de `display: flex; flex-direction: column-reverse;` en `.rack-slots`, `.rack-rail-left` y `.rack-rail-right`.
  - La unidad base U1 se asienta físicamente en el suelo del gabinete y la unidad superior (U42/U24) se eleva al techo, respetando el estándar físico de centros de datos y DCIM profesional.
  - Los equipos de alta carga gravitacional (UPS y cabinas SAN) se ubican físicamente en la base estructural del rack, y los switches Top-of-Rack (ToR) en la cima bajo el canastillo aéreo.
- **Sellado Vertical y Erradicación del Tooltip Fantasma:**
  - `#device-tooltip` configurado con `visibility: hidden; opacity: 0;` en estado inactivo, eliminando cualquier capa translúcida o texto fantasma impreso sobre los slots del rack. Se limpia proactivamente al inicio de cada renderizado y al arrastrar componentes.
  - Todas las unidades U (`.rail-unit` y `.rack-slot`) reforzadas con `box-sizing: border-box; height: 24px; max-height: 24px; overflow: hidden;`, garantizando que la cuadrícula jamás se descalibre.
- **Nuevas Carátulas SVG Vectoriales de Alta Densidad (2U y 4U):**
  - Creado `ups_2u.svg` (240×48 px) con display digital, LEDs de batería, bandeja hot-swap de 4 baterías y tomas frontales, eliminando la deformación vertical de estiramiento al 200%.
  - Creado `server_4u.svg` (240×96 px) para chasis modulares Blade 4U y servidores de misión crítica con 8 bahías verticales, ventiladores de alta potencia y panel de gestión de chasis, cubriendo los 96px reales sin dejar franjas negras vacías.
  - En `faceplates.css`, regla de alineación a la derecha para dispositivos UPS (`.faceplate-wrapper[data-dev-type="ups"] .faceplate-overlay-info`), evitando colisiones de texto con la pantalla LCD azul.
- **Service Worker v15 y Suite de Integridad:**
  - Service Worker actualizado a `rack-designer-next-cache-v15` con precaché offline de los nuevos activos `server_4u.svg` y `ups_2u.svg`.
  - Suite de integridad ampliada a **114/114 pruebas pasando al 100%**.

---

## [2026-09-21] Plantilla Demo Profesional de Centro de Datos y Distribución Gravitacional de Peso (ANSI/TIA-942)

### Infraestructura y Datos de Demostración (`js/demoData.js`, `js/utils.js`, `service-worker.js`, `tests/integrity_check.cjs`)
- **Ingeniería Real de Gabinete y Distribución de Carga Gravitacional:**
  - **Base (U1 - U4):** Ubicación obligatoria de equipos pesados en la base del gabinete para mantener un centro de gravedad bajo y seguro: sistemas de alimentación ininterrumpida UPS Online (3000VA / 2000VA, `mountSide: 'both'`) y unidades de distribución de energía PDUs traseras (`mountSide: 'rear'`).
  - **Zona Baja (U4 - U15):** Cabinas masivas de almacenamiento SAN All-Flash 4U (Dell EMC PowerStore), módulos de expansión JBOD 2U, servidores NAS de backup y chasis modulares Blade 4U de alta densidad.
  - **Zona Media (U10 - U20):** Servidores de cómputo y virtualización 2U (Dell PowerEdge R740xd ESXi Cluster), servidores de base de datos SQL HA y grabadores de videovigilancia NVR CCTV enterprise de 64 canales.
  - **Zona Ergonómica (U21 - U22):** Consola KVM retráctil 1U (`mountSide: 'both'`) con pantalla LCD/teclado y bandeja metálica fija porta-herramientas ubicadas exactamente a la altura de trabajo del operador humano.
  - **Zona Top of Rack - ToR (U36 - U42):** Equipos ligeros de conectividad perimetral y borde: Switches Core 10G/40G Nexus, Switches ToR de cómputo, Firewalls Next-Gen FortiGate, Routers BGP de borde, Bandejas ODF de Fibra Óptica y Patch Panels Cat6A intercalados con organizadores pasacables 1U para un cableado aéreo impecable.
- **Topología de Salas y Redundancia:**
  - Sala 1: *Data Center Principal* con 4 gabinetes estandarizados de 42U (Borde/Redes, Cómputo/Virtualización, Storage SAN/NAS y Seguridad CCTV).
  - Sala 2: *Edificio Corporativo A* con gabinete IDF de 24U para telecomunicaciones y distribución PoE.
  - Sala 3: *Centro de Operaciones & Seguridad (SOC)* con gabinete de 24U y servidores SIEM.
- **Cableado Estructurado y Troncales Backbone:**
  - Enlaces troncales de fibra óptica (SM / OM4) y DAC de alta velocidad (10G/40G) entre el Switch Core y los switches ToR de cada gabinete y sala remota.
  - Enlaces de cobre Cat6A y PoE hacia servidores y periféricos de piso (cámaras de seguridad, terminales, impresoras, APs WiFi 6 y telefonía).
- **Service Worker v14 y Suite de Pruebas:**
  - Service Worker actualizado a `rack-designer-next-cache-v14`.
  - Suite de integridad expandida con el Grupo 11 (11 nuevas aserciones automáticas, totalizando **113/113 pruebas pasando al 100%**).

---

## [2026-09-21] Soporte Integral para Equipos de Ambas Caras (`mountSide: 'both'`) y Detección de Colisiones Bilaterales

### Arquitectura de Gabinete y Profundidad de Equipos (`js/store.js`, `js/ui/rack.js`, `js/ui/catalog.js`, `js/ui/faceplates.js`, `js/ui/tables.js`, `service-worker.js`)
- **Equipamiento de Doble Cara / Profundidad Completa (`mountSide: 'both'`):**
  - Soporte nativo para servidores enterprise de chasis profundo (1U, 2U, 4U, chasis blade), almacenamiento SAN/NAS/JBOD, grabadores CCTV (NVR/DVR/Decodificadores), UPS online de doble conversión y consolas KVM que atraviesan físicamente todo el fondo del gabinete.
  - El equipo ocupa y bloquea simultáneamente las unidades U en ambas caras (frontal y trasera) evitando colisiones o superposición indebida de hardware.
  - Cuenta estrictamente como un único dispositivo y consumo en el inventario y estadísticas de capacidad (un servidor 2U consume 2U del rack, no 4U duplicadas).
- **Detección y Prevención de Colisiones Bilaterales (`store.sidesConflict`):**
  - Algoritmo matemático unificado `sidesConflict(side1, side2)`: detecta colisión si cualquiera de los lados es `'both'` o si ambos coinciden en `'front'` o `'rear'`.
  - Permite la coexistencia legítima de equipos de media profundidad (p. ej. un Patch Panel en U20 frontal y una PDU en U20 trasera sin interferencia).
  - Bloquea drops, movimientos y ediciones si una unidad U está ocupada en el frente o en la espalda por un equipo profundo.
- **Renderizado Visual Físico Bipolar con Flip 3D:**
  - En la vista frontal (`.rack-face`): renderiza el faceplate operativo frontal (bahías de discos, LEDs de actividad, botón power).
  - En la vista trasera (`.rack-rear`): renderiza el panel técnico trasero con bahías de fuentes redundantes `PSU-1` / `PSU-2`, conectores de red RJ45/SFP y badge distintivo `TRASERA · DUAL`. El slot se marca como `.occupied` impidiendo la inserción de otro equipo en esa posición.
- **Modales y Tablas de Inventario:**
  - Modales de Creación/Edición y Colocación Rápida (`DeviceModal.js`, `PlacementModal.js`, `index.html`) con opción `Ambas Caras (Completo)`.
  - Tabla de inventario global y exportador CSV/Excel identifica equipos profundos con el distintivo `Dual` en color cian datacenter.
- **Service Worker v13 & Suite de Integridad:**
  - Versión de caché actualizada a `rack-designer-next-cache-v13`.
  - Suite de integridad automatizada expandida con 19 aserciones nuevas en el GRUPO 10 (total: 102/102 pruebas pasando al 100%).

---

## [2026-09-21] Sincronización Integral de Documentación Técnica (`doc/doc_md/*`)

### Documentación y Arquitectura del Sistema (`doc/doc_md/`)
- **Actualización y Homologación Exhaustiva de los 14 Documentos Markdown:**
  - `ARCHITECTURE_GUIDE.md`: Sincronización del stack tecnológico (`html2canvas`), 30 plantillas arquitectónicas en 8 familias, persistencia `customCatalog` en Store, CAD grid 24px, gap de 72px, enrutamiento segregado en 3 zonas, Inspector CRUD, Outliner sorting/inline actions, tabla de inventario con 18 columnas y suite de 83 pruebas de integridad.
  - `CODEBASE_ORIENTATION_MAP.md`: Actualización del mapa de archivos del proyecto, árbol de dependencias, scripts en index.html, métodos del Store y tabla de responsabilidades de módulos UI.
  - `PROJECT_ANALYSIS.md`: Actualización a Service Worker v12, eliminación de archivos inexistentes (`cables.js`), documentación de la lógica de renderizado físico en `rack.js` y tabla de componentes modulares.
  - `USER_MANUAL.md`: Guía de usuario con nombres genéricos de datacenter, familia de Seguridad y CCTV, espaciado de 72px, enrutamiento libre de cables, edición inline en tabla y exportación Retina 1:1.
  - `informe_mejoras_e_implementacion.md`: Actualización de métricas de cobertura y suite de 83 pruebas automatizadas pasando al 100%.
  - `roadmap_mejoras.md`: Homologación de estado de mejoras (21 completadas, 17 pendientes), validación de la suite de 83 tests y verificación de la ruta crítica (`M-26`).
  - `medidas_interfaz.md`: Actualización de la cuadrícula CAD de 24px × 24px, gap de 72px entre racks, flex dinámico del Outliner (`flex: 1 1 180px`), colapso del Inspector (`flex: 0 0 auto !important`) y esquemas visuales ASCII y Mermaid.
  - `medidas_lienzo_fisico.md`: Corrección del gap en diagrama Mermaid a 72px y redacción de la sección técnica con las fórmulas matemáticas exactas del enrutamiento de cables segregado en 3 zonas (`overheadY`, `middleGutterY`, `rackGutterX`, $r = 6\text{px}$).
  - `medidas_sidebar.md`: Documentación de las 8 familias comerciales en `CATALOG_GROUPS`, grupo global `all`, badge `PROYECTO` de plantillas personalizadas y acciones de menú contextual `⋮`.
  - `medidas_panel_derecho.md`: Especificación técnica del Outliner con toolbar de ordenamiento (`#outliner-sort-select`), botones de acción rápida, Inspector colapsable con chevron (`-90deg`) y botones CRUD (`.btn-inspector-primary`, `.btn-inspector-danger`).
  - `medidas_panel_inferior.md`: Detalle exhaustivo de las 18 columnas del inventario global (17 de metadatos + acciones), edición en línea de 13 campos con validación en tiempo real (IP y MAC), truncamiento de notas técnicas a 140px con tooltip y menú de exportación con captura Retina 1:1.
  - `medidas_racks.md`: Homologación del ancho total estimado a 280px ($20\text{px} + 240\text{px} + 20\text{px}$), acabado de hardware con borde de 1.5px y sombra 3D, perspectiva de rotación de 1200px y separación técnica de 72px (3U).
  - `medidas_header.md`: Detalle del menú de proyecto con enlace a la Suite de Tests (83 pruebas) y funciones de exportar/importar catálogo, iconos SVG en pestañas e interactividad de sesión RBAC.
  - `medidas_lienzo_topologia.md`: Desacoplamiento del motor Canvas 2D en 5 módulos (`TopologyModel`, `TopologyRenderer`, `TopologyInteraction`, `TopologyLayout`, `TopologyUI`) y sincronización cromática con las 8 familias comerciales.

---

## [2026-09-21] Solución Definitiva: Enrutamiento Segregado de Cables en Vista Física (Cero Cruces sobre Racks o Periféricos)

### Vista Física — Motor de Cableado Estructurado (`js/ui/rack.js`, `service-worker.js`)
- **Arquitectura de Enrutamiento Segregado en 3 Zonas Libres:**
  - **Canastillo Aéreo Superior (Inter-Rack):** Los enlaces troncales entre diferentes gabinetes viajan por la zona aérea superior (`overheadY = minRackTop - 14px`) con selección de salida inteligente por el lateral más cercano al rack de destino. Elimina al 100% cualquier colisión sobre gabinetes intermedios o servidores.
  - **Canaleta Media Segregada (Equipos de Piso ↔ Racks):** Los periféricos de piso (cámaras, impresoras, APs, telefonía) se enrutan hacia la canaleta libre intermedia entre los racks y la sección de piso, ascendiendo verticalmente por el espacio lateral de 72px del gabinete de destino. Se erradicó por completo el paso de cables sobre las tarjetas de periféricos (como ocurría sobre *Impresora Administración*).
  - **Organizador Lateral de Gabinete (Intra-Rack):** Las conexiones internas entre servidores y switches del mismo rack se mantienen estrictamente confinadas en el organizador vertical derecho propio (`gutterX = p1.rightEdgeX + 8px`), sin salir del perímetro del gabinete.
- **Unificación de Coordenadas:** El elemento `<svg id="physical-cables-svg">` se reubicó en el contenedor raíz `#view-physical-content` para compartir el mismo espacio métrico y escala tanto para los gabinetes como para la sección de periféricos de piso.
- **Service Worker v12:** Caché actualizada a `rack-designer-next-cache-v12` para invalidación inmediata de recursos obsoletos en el cliente PWA.
- **Diagramas de Arquitectura Creados:**
  - `doc/doc_img/doc_svg/enrutamiento_equipos_piso_y_racks.svg`: Diagrama integral de doble canaleta (Aérea vs Piso).
  - `doc/doc_img/doc_svg/propuesta_1_canastillo_aereo.svg`: Canastillo superior aéreo.
  - `doc/doc_img/doc_svg/propuesta_2_fila_continua_nowrap.svg`: Disposición en pasillo continuo.
  - `doc/doc_img/doc_svg/propuesta_3_cables_interactivos_hover.svg`: Modo interactivo Smart Focus.

---


### Vista Física — Espaciado entre Gabinetes (`js/ui/rack.js`, `doc/doc_md/medidas_lienzo_fisico.md`)
- **Aumento del gap entre racks de `24px` (1U) a `72px` (3U)** para mejorar la legibilidad y dar espacio visual entre gabinetes en el lienzo físico.
- Cambio aplicado en los dos contenedores Flexbox de `renderPhysical()` (líneas 19 y 124–126 de `rack.js`): tanto el estado "sin racks" como el estado con racks usan el nuevo valor.
- Documentación actualizada en `medidas_lienzo_fisico.md`: sección de proporciones y diagrama ASCII de dos racks ahora reflejan `gap: 72px`.

---

## [2026-09-21] Catálogo Arquitectónico Profesional, Seguridad/CCTV y Equipos Personalizados por Proyecto

### Catálogo de Dispositivos y Estandarización Arquitectónica (`js/ui/catalog.js`, `js/icons.js`, `js/ui/faceplates.js`)
- **Estandarización Genérica de 30 Plantillas de Centro de Datos:**
  - Se erradicaron nombres arbitrarios con marcas comerciales (Dell, Cisco, HP, Fortinet, APC) en favor del **Enfoque Genérico / Arquitectónico**: nombres limpios y descriptivos de ingeniería (e.g., *Servidor Rack 1U/2U/4U*, *Switch de Acceso 24P/48P*, *Switch Core 2U*, *Router de Borde*, *Storage NAS 2U*, *Cabina SAN 4U*, *UPS Online 1500VA/3000VA*, *PDU Horizontal 8 Tomas*, etc.).
  - Específicas potencias técnicas reales estimadas (W) y dotación de puertos por defecto (RJ45 y fibra óptica).
- **Nueva Categoría "Seguridad y CCTV" (`security` - color `#f43f5e`):**
  - Incorporados equipos dedicados: **Grabador NVR 1U (16/32 Ch PoE)**, **Grabador NVR 2U (64/128 Ch RAID)**, **Grabador Híbrido DVR 1U (16 Ch BNC+IP)** y **Decodificador de Video / Video Wall 1U**.
  - Nuevos iconos vectoriales SVG en `js/icons.js` (`nvr`, `dvr`, `decoder`) y mapeo gráfico de faceplates en `js/ui/faceplates.js`.
- **Reorganización en 8 Familias Comerciales (`CATALOG_GROUPS`):**
  - **Redes y Comunicaciones (`network`):** Reservado estrictamente para equipamiento activo (switches, routers, firewalls, APs).
  - **Accesorios y Cableado (`accesorios`):** Reubicación de **Patch Panel Cat6A (24P/48P)** e incorporación formal de la **Bandeja ODF de Fibra Óptica 24P (1U)**, organizadores horizontales pasacables y bandejas de soporte.

### Sistema de Equipos Personalizados por Proyecto (`js/store.js`, `js/ui/modals/DeviceModal.js`, `js/main.js`)
- **Persistencia en el Estado del Proyecto (`store.state.customCatalog`):**
  - Los usuarios pueden crear equipos personalizados desde `+ Equipo` o editarlos desde el catálogo.
  - Métodos reactivos en Store: `addCustomCatalogItem(item)` y `deleteCustomCatalogItem(id)` con soporte completo de undo/redo, auto-saneamiento `_sanitize()`, guardado dual y sincronización.
  - Al exportar el diseño a `.rack` / `.json`, las plantillas personalizadas viajan dentro del proyecto.
  - Al ejecutar **"Limpiar proyecto" / "Nuevo Proyecto"**, el catálogo se reinicia limpiamente mostrando únicamente las plantillas estándar por defecto (`DEFAULT_CATALOG`).
- **Badge Visual de Proyecto:**
  - Los equipos personalizados se destacan en el catálogo y flyout con una etiqueta distintiva `PROYECTO`.

### PWA Offline y Calidad Automatizada (`service-worker.js`, `tests/integrity_check.cjs`, `tests/index.html`)
- **Service Worker v11:**
  - Caché actualizada a `rack-designer-next-cache-v11` con invalidación de recursos antiguos.
- **Suite de Integridad:**
  - Incorporadas pruebas para las 8 familias comerciales, grupo `security`, presencia de ODF/Patch Panel en accesorios, ciclo de vida de `customCatalog` y reactividad de `store.state`.
  - **100% de éxito en las pruebas** tanto en terminal (`pnpm test`) como en navegador web (`tests/index.html`).

---

## [2026-09-21] Sprint 4 de Mejoras: Fidelidad Visual de Exportación, Metadatos de Inventario y Búsqueda en Catálogo (M-37, M-19, M-30)

### Exportación Gráfica de Alta Fidelidad (Fase 3 / Fase 4)
- **Exportación Fiel 1:1 a PNG con html2canvas y Fallback Procedural (`M-37` en `js/ui/modals/ExportModal.js`, `index.html` y `css/components/rack.css`):**
  - Se integró la librería de captura DOM `html2canvas.min.js` (198 KB) en `js/` precacheada en Service Worker (`v10`).
  - `exportRackToPNG()` y `exportFloorToPNG()` ahora renderizan directamente la vista física del DOM con sombras, texturas, tipografía y faceplates SVG reales a escala Retina (`scale: 2`) sobre fondo de datacenter `#090d17`.
  - Se implementó la clase CSS `.exporting-capture` que oculta controles de interfaz (botones flotantes de edición/eliminación) durante la captura gráfica para obtener imágenes limpias de presentación técnica.
  - Se mantuvo arquitectura defensiva de fallback procedimental con Canvas 2D en caso de que `html2canvas` no esté disponible.

### Tabla de Inventario y Edición en Celda (Fase 3)
- **Metadatos Faltantes de Dispositivos y Persistencia Inline (`M-19` en `js/ui/tables.js` y `js/ui/modals/ExportModal.js`):**
  - Se añadieron las columnas `Tamaño` (U), `Skin` (faceplate visual) y `Notas` en la cabecera e hileras de la tabla de inventario (`renderInventoryTable()`).
  - Soporte para edición inline interactiva (`dblclick`) con `finishCellEdit()` que persiste automáticamente cambios de tamaño (validación numérica > 0), skin y notas descriptivas en el estado del store (`store.updateDevice()`).
  - Se amplió el filtro de búsqueda interactiva `#inv-search` para permitir búsquedas instantáneas por contenido de notas y tipo de skin.
  - La exportación CSV en `ExportModal.js` (`exportCSV()`) se sincronizó con las columnas `Tamaño`, `Skin` y `Notas`.

### Búsqueda Asistida en Catálogo y Colocación Rápida (Fase 3)
- **Buscador en Tiempo Real en Modal de Quick Placement (`M-30` en `index.html` y `js/ui/modals/PlacementModal.js`):**
  - Se agregó el campo de búsqueda `<input type="text" id="qp-dev-search">` en el modal de colocación asistida (`#modal-quick-placement`).
  - Implementada la función global reactiva `filterQPCatalog(query)` con filtrado insensible a mayúsculas/minúsculas sobre el nombre comercial y tipo de equipo.
  - Selección inteligente del primer resultado coincidente y recálculo automático de slots disponibles para agilizar el aprovisionamiento.

### PWA Offline y Service Worker (`service-worker.js`)
- **Actualización de Versión de Caché a v10:**
  - Se incrementó el identificador de caché a `rack-designer-next-cache-v10` e incorporó `js/html2canvas.min.js` en la lista de recursos precacheados offline.

### Calidad y Suite de Integridad (`tests/integrity_check.cjs` y `tests/index.html`)
- **Incorporación del Grupo 9: Fidelidad de Exportación, Metadatos de Inventario y Buscador de Catálogo:**
  - 13 nuevas aserciones que validan:
    - Presencia y peso de `html2canvas.min.js`, inclusión de script tag y caché v10.
    - Implementación de `exportRackToPNG` y `exportFloorToPNG` con fallback.
    - Reglas CSS `.exporting-capture`.
    - Columnas y edición inline de `Tamaño`, `Skin` y `Notas` en inventario y CSV.
    - Input de búsqueda `#qp-dev-search` y función `filterQPCatalog()`.
  - La suite se amplía a **78 pruebas automáticas exitosas (78/78 pasando al 100%)** tanto en entorno Node CLI (`pnpm test`) como en el Test Runner web en vivo.

---

## [2026-09-19] Sprint 3 de Mejoras: Gestión Jerárquica Outliner & Inspector (M-36, M-23, M-38, M-24)

### Panel Inspector y Flujos de Aprovisionamiento (Fase 1 / Fase 3)
- **CRUD Integral y Empty State Proactivo en el Inspector (`M-36` en `js/ui/inspector.js` y `css/components/panels.css`):**
  - Se transformó el estado vacío (`Empty State`) del Inspector en una zona de aprovisionamiento ágil con botones de acción directa: `+ Nueva Sala` y `+ Nuevo Gabinete`.
  - Se añadieron vistas contextuales con controles de ciclo de vida completo:
    - **Sala Seleccionada:** Muestra métricas de gabinetes y equipos, con botones para `+ Crear Gabinete en esta Sala`, `Editar Sala` y `Eliminar Sala`.
    - **Gabinete Seleccionado:** Muestra ocupación física en U (utilizadas/libres), con botones para `+ Agregar Equipo a este Rack`, `Editar Gabinete` y `Eliminar Gabinete`.
    - **Equipo Seleccionado:** Muestra especificaciones completas, consumo en Watts, peso, y botones directos para `Editar Equipo` y `Eliminar Equipo`.
  - Se implementaron las funciones globales seguras `deleteRoomFromInspector()`, `deleteRackFromInspector()` y `deleteDeviceFromInspector()` con diálogo de confirmación `customConfirm`, validación RBAC (`RackAuth.can('editDevices')`) y deselección automática de nodos eliminados.

### Jerarquía Visual y Ordenamiento en el Outliner (Fase 3)
- **Acciones Rápidas y Edición Inline en el Árbol (`M-23` en `index.html`, `js/ui/outliner.js` y `css/components/panels.css`):**
  - Se integraron botones compactos de creación directa en la cabecera del Outliner: `+ Sala` (abre modal de sala), `+ Rack` (abre modal de gabinete) y `+ Equipo` (abre colocación rápida).
  - Cada nodo de la jerarquía (Salas, Gabinetes y Dispositivos) ahora presenta botones contextuales inline `✏️` (editar) y `🗑️` (eliminar) visibles al pasar el cursor (hover), con delegación de eventos protegida contra propagación y confirmación previa.
- **Opciones Dinámicas de Ordenamiento (`M-38` en `index.html`, `js/ui/outliner.js` y `css/components/panels.css`):**
  - Se incorporó una barra de herramientas con el selector `#outliner-sort-select` que permite reorganizar los equipos de cada rack en tiempo real según:
    1. `slot`: Posición U (Mayor a menor - orden físico natural de arriba hacia abajo).
    2. `name-asc`: Nombre alfabético (A → Z).
    3. `name-desc`: Nombre alfabético inverso (Z → A).
    4. `type`: Familia y categoría funcional del dispositivo.
  - La función modular `sortOutlinerDevices(devices, mode)` garantiza la reactividad instantánea del árbol.
- **Inspector Colapsable y Expansión Dinámica del Outliner (`M-24` en `index.html`, `css/components/panels.css` y `css/layout.css`):**
  - La cabecera de `#inspector-section` ahora es interactiva mediante cursor pointer y clase `.collapsed`, alternando el colapso del cuerpo del inspector con un indicador chevron giratorio `▼` (`rotate(-90deg)`).
  - Se refactorizó `#outliner-section` en `css/layout.css` retirando el restrictivo `max-height: 25%` por `flex: 1 1 180px; min-height: 120px; max-height: none;`, permitiendo que el árbol jerárquico aproveche fluidamente todo el panel derecho cuando el inspector esté colapsado.

### PWA Offline y Service Worker (`service-worker.js`)
- **Actualización de Versión de Caché:**
  - Se incrementó el identificador de caché a `rack-designer-next-cache-v9` para invalidar y forzar la recarga de los módulos actualizados del Outliner e Inspector.

### Calidad y Suite de Integridad (`tests/integrity_check.cjs` y `tests/index.html`)
- **Incorporación del Grupo 8: Acciones CRUD en Inspector y Ordenamiento en Outliner:**
  - Se diseñaron 13 nuevas aserciones para validar:
    - Funciones globales de eliminación en inspector y saneamiento de selección.
    - Presencia de botones de aprovisionamiento en el Empty State.
    - Ordenamiento dinámico de equipos (`slot`, `name-asc`, `name-desc`, `type`).
    - Botones de acceso rápido en cabecera del Outliner (`+ Sala`, `+ Rack`, `+ Equipo`).
    - Generación de acciones inline `✏️` y `🗑️` en el DOM jerárquico.
    - Capacidad de colapso visual del Inspector.
  - La suite se amplía a **65 pruebas automáticas exitosas (65/65 pasando al 100%)** tanto en CLI (`pnpm test`) como en el Test Runner visual (`tests/index.html`).

---

## [2026-09-19] Sprint 2 de Mejoras: Modal Reactivo de Salas y Catálogo Dinámico por Familias (M-09, M-11, M-12)

### Experiencia de Usuario y Gestión de Salas (Fase 1 / Cierre Fase 1)
- **Erradicación de `prompt()` Nativo y Modal Estándar de Salas (`M-09` en `index.html`, `js/ui/modals/RoomModal.js` y `js/ui/catalog.js`):**
  - Se eliminó el uso de diálogos nativos bloqueantes `prompt()` que causaban fallas en dispositivos táctiles, navegadores móviles y bloqueadores de popups al renombrar salas.
  - Se unificó el flujo de creación y edición en `#modal-room` con título dinámico (`#modal-room-title`), subtítulo orientativo (`#modal-room-sub`) y botones contextuales ("Crear Sala" / "Guardar Cambios").
  - Se crearon las funciones globales `openAddRoomModal()` y `openEditRoomModal(roomId)` con verificación de permisos RBAC (`RackAuth.can('editDevices')`).
  - En el selector de salas del catálogo (`renderRoomTabs()`), se añadieron botones de edición táctil `✏️` (`.room-edit-btn`) para renombrar salas de forma intuitiva sin salir del flujo visual.

### Catálogo de Equipos y Familias Comerciales (Fase 3)
- **Consolidación en Familias Comerciales de Datacenter (`M-11` en `js/ui/catalog.js`):**
  - Se sustituyó la lista plana de 14 categorías por una matriz estructurada `CATALOG_GROUPS` de 7 familias estándar de la industria:
    1. Redes (`network`: switches, routers, firewalls, APs, patch panels).
    2. Cómputo (`servers`: servidores rackables, blade, GPU).
    3. Almacenamiento (`storage`: NAS, SAN, arrays de discos).
    4. Energía (`power`: UPS, PDU).
    5. Gestión de Cableado (`cable_management`: organizadores horizontales y verticales).
    6. Seguridad / Clima / Sensores (`sensors`: CCTV, sensores ambientales, control de acceso).
    7. Accesorios y Paneles Ciegos (`accessories`: blanking panels, bandejas).
  - La agrupación reduce la altura del sidebar a < 350px, eliminando barras de desplazamiento innecesarias y facilitando la navegación rápida.
- **Categoría "Todos los Equipos" y Búsqueda Global en Tiempo Real (`M-12` en `js/ui/catalog.js`, `js/icons.js` y `css/components/misc.css`):**
  - Se implementó la categoría superior "Todos" (`id: 'all'`) en la cabecera del sidebar vertical de 50px con ícono vectorial SVG de cuadrícula (`grid`).
  - Se añadió búsqueda en tiempo real `#catalog-search` sin restricciones de tipo ni categoría, permitiendo filtrar instantáneamente el inventario comercial completo (ej. "Cisco", "Dell", "Switch", etc.).
  - Se integraron nuevos iconos vectoriales SVG limpios para `grid`, `search` y `network` tanto en `js/icons.js` como en las clases offline data-URI `.icon-grid` e `.icon-search` de `css/components/misc.css`.

### PWA Offline y Service Worker (`service-worker.js`)
- **Actualización de Versión de Caché:**
  - Se incrementó el identificador de caché a `rack-designer-next-cache-v8` para invalidar y forzar la recarga de los scripts de catálogo, modales e iconos actualizados.

### Calidad y Pruebas Automatizadas (`tests/integrity_check.cjs` y `tests/index.html`)
- **Configuración de Comando `pnpm test` (`package.json`):**
  - Se configuró `"test": "node tests/integrity_check.cjs"` para que la suite completa pueda ser ejecutada en terminal directamente mediante el comando oficial del repositorio `pnpm test`.
- **Test Runner Visual Interactivo en el Navegador (`tests/index.html`):**
  - Se desarrolló una interfaz gráfica web moderna dedicada a la ejecución y visualización de las pruebas en tiempo real, accesible en `/tests/index.html`.
  - Muestra contadores en vivo (Total: 52, Pasadas: 52, Falladas: 0, Tasa de éxito: 100%), barra de progreso reactiva y desglose por grupos en tarjetas con badges verdes `PASS`.
- **Acceso Directo desde la Consola del Datacenter (`index.html`):**
  - Se incorporó en el menú del proyecto (`#project-dropdown`) el enlace directo *"Suite de Tests (52 pruebas)"* para abrir el runner con un solo clic.
- **Ampliación de la Suite de Integridad (Grupo 7):**
  - Se añadieron 10 nuevas pruebas unitarias y de integración para validar la eliminación de `prompt()`, las funciones globales de salas, la matriz de familias `CATALOG_GROUPS`, el consolidado de red, la categoría "Todos", y la presencia de iconos SVG.
  - La suite se amplía a **52 pruebas automáticas exitosas (52/52 pasando al 100%)**.

---

## [2026-09-19] Sprint 1 de Mejoras: Blindaje de Almacenamiento y Quick Wins Físicos (M-02, M-05, M-10, M-13, M-14, M-15, M-16)

### Blindaje de Datos y Persistencia (Fase 0)
- **Manejo Defensivo de Cuota de Almacenamiento (`M-02` en `js/store.js`):**
  - En `_save()`, se capturan defensivamente las excepciones de tipo `QuotaExceededError` (y códigos equivalentes de navegador como 22, 1014 o -2147024882). Se notifica al operador mediante toast persistente de advertencia para respaldar en archivo `.rack` y se despacha el evento global `rack-storage-quota-exceeded`.
- **Doble Slot de Respaldo y Auto-Recuperación Anti-Corrupción (`M-05` en `js/store.js`):**
  - En `_save()`, se persiste simultáneamente una copia idéntica en el slot redundante `RACK_DESIGNER_NEXT_STATE_BACKUP`.
  - En `_load()`, si el parseo JSON del slot primario falla por corrupción o cierre intempestivo, el sistema rescata automáticamente el estado desde el slot de respaldo redundante, notificando al usuario en lugar de reiniciar al estado por defecto.

### Ergonomía y Perfeccionamiento de la Vista Física (Fase 1)
- **Borde de Contraste y Sombra Realista en Gabinetes (`M-10` en `css/components/rack.css`):**
  - Se reforzó el borde de `.rack-card` a `1.5px solid var(--border-light, #334155)` con sombra física tridimensional `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35)` y respuesta dinámica en hover, mejorando la distinción visual en salas con múltiples gabinetes.
- **Ancho Proporcional Fijo de Slots (`M-14` en `css/components/rack.css`):**
  - Se fijó `.rack-slots` en `width: 240px; min-width: 240px; max-width: 240px;`, asegurando la relación de aspecto 10:1 matemática exacta (10 × 24px de alto = 240px) requerida por el estándar de racks de 19" y concordante con los faceplates SVG (`viewBox="0 0 240 24"`).
- **Grilla Técnica CAD Milimétrica (`M-15` en `css/layout.css`):**
  - Se implementó un patrón de cuadrícula milimétrica de 24px × 24px en `#view-physical` con soporte para temas oscuro y claro, donde cada celda equivale exactamente a 1U de altura para orientar el diseño físico.
- **Alineación Continua de Equipos de Piso (`M-13` en `css/components/faceplates.css` y `js/ui/rack.js`):**
  - Se eliminó el estilo inline de `340px` condicional en `renderFloorSection()` y se aplicó en CSS `.floor-section { min-width: 584px; width: 100%; }`, garantizando que la sección inferior mantenga siempre un ancho armónico alineado con el ancho de dos racks más gap.
- **Alturas de Rack Estandarizadas (`M-16` en `index.html` y `js/ui/modals/RackModal.js`):**
  - Se sustituyó el input numérico libre por `<select id="rack-height">` con las alturas comerciales normalizadas: 8U (Mural), 12U (Comunicaciones), 18U (Intermedio), 24U (Media altura), 42U (Estándar Datacenter - seleccionado por defecto) y 48U (Alta densidad). En `RackModal.js` se añadió soporte de retrocompatibilidad para racks existentes con alturas personalizadas.

### PWA Offline y Service Worker (`service-worker.js`)
- **Actualización de Versión de Caché:**
  - Se incrementó la caché a `rack-designer-next-cache-v7` para asegurar la entrega instantánea de los nuevos recursos estáticos y estilos modificados.

### Calidad y Pruebas Automatizadas (`tests/integrity_check.cjs`)
- **Ampliación de la Suite de Integridad (Grupo 6):**
  - Se agregaron 11 nuevas aserciones automáticas en `tests/integrity_check.cjs` para validar el doble slot de guardado, la recuperación ante JSON corrupto, el manejo de `QuotaExceededError`, los estilos de bordes, el ancho de slots de 240px, la grilla de 24px, la alineación de equipos de piso y las alturas de rack.
  - La suite se amplía a **42 pruebas automáticas ejecutadas en Node.js (42/42 pasando al 100%)**.

---

## [2026-09-19] Reorganización de Recursos Estáticos: Migración de `default/` a `assets/default/`

### Recursos Estáticos y Organización de Archivos
- **Migración de `default/` a `assets/default/`:**
  - Se trasladó la carpeta `default/` (16 archivos vectoriales SVG) desde la raíz del proyecto hacia el interior del directorio `assets/` (`assets/default/`), dejando la raíz del proyecto completamente limpia y estandarizada.
  - Se mantiene la compatibilidad con `assets/svg/default/` y `assets/default/` sin duplicados en la raíz.

### Motor Visual y Renderizado (`js/ui/faceplates.js`)
- **Actualización de Fallbacks de Carga:**
  - Se actualizaron las rutas de fallback en `preloadFaceplateSvgs()` y en el manejador `onerror` de la etiqueta `<img>` en `buildFaceplate()`, redirigiendo cualquier fallo secundario hacia `assets/default/` en lugar de la ruta inexistente de la raíz.

### Service Worker y PWA Offline (`service-worker.js`)
- **Actualización de Caché (`rack-designer-next-cache-v6`):**
  - Se agregaron las 16 rutas de `assets/default/*.svg` al array `ASSETS_TO_CACHE`, asegurando que la PWA tenga pre-cacheadas tanto las rutas de `assets/svg/default/` como las de `assets/default/` para disponibilidad 100% offline.

### Scripts de Mantenimiento (`.py/export_default_svgs.py`)
- **Actualización de Rutas en Script Python:**
  - Se actualizó la función `create_svgs()` para que escriba en `assets/default` y `assets/svg/default`, previniendo la recreación involuntaria de carpetas en la raíz del proyecto.

### Pruebas Automatizadas (`tests/integrity_check.cjs`)
- **Grupo 5 de Integridad de Assets:**
  - Se agregaron 5 nuevas aserciones automáticas para verificar: ausencia de `default/` en la raíz, existencia de los 16 SVGs en `assets/default/`, existencia de los 16 SVGs en `assets/svg/default/` y ausencia de referencias huérfanas en el código JS.
  - La suite se amplía a **31 pruebas automáticas (31/31 pasando con éxito)**.

---

## [2026-09-19] Corrección Integral de Errores de Programación, Auto-Saneamiento y Suite de Pruebas

### Seguridad y Control de Accesos (RBAC)
- **Persistencia de Sesión F5 (`js/auth/roles.js`):**
  - Se corrigió el error por el cual la sesión de Administrador se cerraba forzadamente al presionar F5 debido a que el token de integridad residía únicamente en memoria heap volátil.
  - Se implementó persistencia protegida bajo `sessionStorage.getItem('RACK_SESSION_TOKEN')` (`TOKEN_KEY`), garantizando que la sesión de Administrador persista ante recargas de página en la misma pestaña pero se destruya de inmediato al cerrar la pestaña o el navegador (`SESSION_EXPIRATION = VOLATILE`).

### Capa de Datos y Estado Central (`Store`)
- **Limpieza en Cascada de Conexiones (`js/store.js`):**
  - En `deleteRack(id)`, se implementó el filtrado automático de `this._raw.connections` para eliminar todos los cables cuyos dispositivos de origen o destino pertenecían al gabinete eliminado, eliminando por completo referencias rotas a dispositivos inexistentes.
- **Limpieza de Nodos en Topología (`js/store.js`):**
  - En `deleteDevice(id)`, se integró la llamada a `this._cleanTopologyPositions({ deviceIds: [id] })` para purgar coordenadas de nodos huérfanos en `topology.nodePositions`.
- **Motor de Auto-Saneamiento y Curación (`_sanitize()` en `js/store.js`):**
  - Se implementó el método `_sanitize()`, ejecutado en el arranque (`_load()`) y en la importación de proyectos (`loadData()`), el cual purga silenciosamente conexiones zombis y posiciones de topología huérfanas de proyectos antiguos o manipulados.
- **Exposición Global:**
  - Se expuso formalmente `window.store = store;` para interoperabilidad y compatibilidad de herramientas de depuración.

### Componentes de Interfaz y Robustez
- **Tolerancia a Fallos en Tablas (`js/ui/tables.js`):**
  - Se incorporó resolución preventiva del contenedor `wrap = wrap || document.getElementById('bottom-table-wrap')` en `renderInventoryTable` y `renderConnectionsTable`, eliminando cualquier riesgo de `TypeError` si son invocadas sin argumentos.
- **Inspector de Propiedades (`js/ui/inspector.js`):**
  - Se protegió el botón de edición con comprobación de tipo `typeof openEditDeviceModal === 'function'` y sanitización con `escapeHTML(dev.id)`.
- **Orden Determinista de Scripts (`index.html`):**
  - Se reubicó `<script src="js/auth/roles.js"></script>` para que se cargue antes de los módulos visuales de UI (`catalog.js`, `faceplates.js`), alineándose con la especificación de `AGENTS.md`.

### Limpieza de Código y Documentación Huérfana
- **Sustitución de Test Obsoleto (`tests/integrity_check.cjs`):**
  - Se eliminó el archivo comentado e inservible `tests/Rack.test.js` y se creó la suite de pruebas automatizadas `tests/integrity_check.cjs` con 26 aserciones que cubren RBAC, F5, cascada de conexiones, auto-saneamiento, undo/redo y robustez de tablas (100% pruebas aprobadas).
- **Limpieza Editorial (`doc/doc_md/PROJECT_ANALYSIS.md`):**
  - Se purgaron las líneas de comandos de terminal pegadas involuntariamente entre las secciones 9 y 10.

---

## [2026-09-18] Actualización de Documentación: Análisis Arquitectónico (PROJECT_ANALYSIS.md)

### Documentación Técnica
- **`doc/doc_md/PROJECT_ANALYSIS.md`:**
  - Actualización integral del documento rector de arquitectura del proyecto.
  - Sincronización del estado de PWA y Service Worker a la versión `rack-designer-next-cache-v5` con auto-actualización en arranque.
  - Incorporación detallada del motor visual **SVG-First** (`js/ui/faceplates.js`), caché en memoria `SVG_INLINE_CACHE` e inyección inline de nodos vectoriales interactivos.
  - Documentación del control centralizado de animaciones del sistema (`.status-dot` / `body.no-animations`) y su regla en `css/components/faceplates.css`.
  - Documentación de la suite de 16 activos vectoriales SVG con CSS GPU embebido en `assets/svg/default/`.
  - Inclusión de las referencias y relaciones con `roadmap_mejoras.md` (37 propuestas de mejora), `informe_mejoras_e_implementacion.md` y el sistema de memoria `memory-bank/`.

---

## [2026-09-18] Corrección: Control Global de Animaciones en Equipos SVG (Status Dot)

### Corrección de Bugs y Renderizado UI
- **Inyección Inline de SVGs (`js/ui/faceplates.js`):**
  - Se corrigió el problema por el cual el botón de encendido/apagado de animaciones (`.status-dot` → `body.no-animations`) no afectaba a los LEDs de los equipos en la vista física.
  - Al estar los SVGs previamente aislados dentro de etiquetas `<img>`, el sandbox del navegador impedía que las reglas CSS del documento padre afectaran a los `@keyframes` internos del SVG.
  - Se implementó un motor de inyección de SVG inline con caché en memoria (`SVG_INLINE_CACHE`) y precarga automática (`preloadFaceplateSvgs()`) que inserta el marcado vectorial `<svg>` directamente en el DOM.
- **Reglas CSS de Congelamiento (`css/components/faceplates.css`):**
  - Se añadieron reglas explícitas de alta especificidad para `body.no-animations .faceplate-wrapper *` y `body.no-animations svg.faceplate-img *`, forzando `animation: none !important; transition: none !important;` en todos los LEDs, displays LCD y puertos en tiempo real.
- **Feedback de Usuario (`js/main.js`):**
  - Se conectó la notificación tipo toast (`notify`) al hacer clic en `.status-dot` para informar visualmente al usuario ("Animaciones apagadas" / "Animaciones activadas").
- **Actualización de Service Worker & Caché PWA (`service-worker.js` e `index.html`):**
  - Incremento de versión de caché a `rack-designer-next-cache-v5`.
  - Añadido `reg.update()` en la carga de la página para forzar al navegador a invalidar assets antiguos y descargar la nueva versión de inmediato.

---

## [2026-09-18] Migración Completa al Motor Visual SVG-First con Animaciones GPU

### Arquitectura de Renderizado y UI
- **`js/ui/faceplates.js`:**
  - Migración desde el renderizado procedimental CSS de cientos de divs a un motor declarativo basado en gráficos vectoriales SVG independientes.
  - Nueva función `getSvgFaceplatePath(device)` que resuelve de manera limpia el asset SVG correspondiente según el tipo (`server`, `switch`, `router`, `firewall`, `storage`, `ups`, `pdu`, `patchpanel`, `organizer`, `kvm`, `tray`, etc.) y tamaño en unidades (1U vs. 2U).
  - Integración de `<div class="faceplate-wrapper">` con `<img class="faceplate-img">` y overlay tipográfico `.faceplate-overlay-info` que proyecta el nombre y la IP del dispositivo sobre la carátula de forma nítida.
  - Mecanismo de fallback bidireccional entre `assets/svg/default/` y `default/`.
  - Mantenimiento intacto de las interfaces de dispositivos de piso (`getFloorFaceplate`) y vista trasera (`buildRearView`).

### Estilos y Optimización de Rendimiento
- **`css/components/faceplates.css`:**
  - Eliminación de más de 700 líneas de maquetación CSS procedural obsoleta (`.fp-server`, `.vent`, `.ear`, `.port-rj45`, `.sfp-port`, etc.).
  - Definición de estilos optimizados para `.faceplate-wrapper`, `.faceplate-img` y `.faceplate-label`.
  - Reducción masiva en la cantidad de nodos DOM creados por cada equipo en el rack, eliminando cuellos de botella de renderizado en racks densos de 42U/48U.

### Animaciones Vectoriales GPU
- **`assets/svg/default/*.svg` y `default/*.svg`:**
  - Los 16 archivos SVG generados incorporan bloques `<style>` con animaciones `@keyframes` nativas (`led-blink`, `led-pulse`, `led-fast`).
  - Animación asíncrona y fluida acelerada por GPU para LEDs de actividad en switches, puertos de fibra SFP, displays LCD, unidades de almacenamiento y barras de carga en UPS.

### Service Worker & PWA Offline
- **`service-worker.js`:**
  - Incremento de versión de caché a `rack-designer-next-cache-v4`.
  - Inclusión de los 16 archivos SVG predeterminados en el array de precaché `ASSETS_TO_CACHE` para garantizar funcionamiento offline 100% autónomo.

### Documentación
- **`doc/doc_md/ARCHITECTURE_GUIDE.md`:** Actualizado el árbol de directorios con `assets/svg/default/` y `default/`, y documentado el motor visual SVG-First en la sección de Vista Física.
- **`doc/doc_md/CODEBASE_ORIENTATION_MAP.md`:** Actualizada la estructura de directorios, la fila de `faceplates.js` en la tabla de módulos UI y añadida la receta técnica para agregar y personalizar equipos SVG.
- **`doc/doc_md/USER_MANUAL.md`:** Incluida la descripción de fidelidad visual y comportamiento de LEDs en la sección de Vista Física.

---

## [2026-09-18] Exportación de Equipos Procedurales (CSS/JS) a Archivos SVG

### Recursos Gráficos y Herramientas
- **Carpeta `default/` y `assets/svg/default/`:** Se generaron y exportaron 16 archivos vectoriales SVG nativos estándares basados en el motor de diseño procedural de `faceplates.js` y `faceplates.css`:
  - **Racks y Chasis:** `server_1u.svg`, `server_2u.svg`, `switch_24p.svg`, `router.svg`, `firewall.svg`, `ups.svg`, `pdu.svg`, `storage.svg`, `patchpanel.svg`, `organizer.svg`, `kvm.svg` y `tray.svg`.
  - **Equipos de Piso:** `floor_pc.svg`, `floor_camera.svg`, `floor_ap.svg` y `floor_printer.svg`.
  - Proporciones ajustadas al estándar de rack (240×24 px para 1U, 240×48 px para 2U) con orejas de sujeción, bahías de discos, displays LCD, LEDs, conectores RJ45 y jaulas ópticas SFP.
- **Script `.py/export_default_svgs.py`:** Creado script Python reutilizable para generar o actualizar el catálogo vectorial completo de forma automatizada.

---

## [2026-09-18] Sincronización Completa del Mapa de Ruta (roadmap_mejoras.md)

### Documentación y Arquitectura
- **roadmap_mejoras.md:** Actualización y sincronización total con todas las propuestas recientes de `mejoras.md`:
  - Incorporadas 9 nuevas tareas de trazabilidad: `M-30` (Buscador catálogo), `M-31` (Separación etiquetas topología), `M-32` (Layout árbol genealógico), `M-33` (Cableado frontal vs trasero), `M-34` (Drag-to-Connect en vista física), `M-35` (Sin restricciones de ubicación), `M-36` (CRUD en Inspector), `M-37` (html2canvas fidelidad 1:1) y `M-38` (Orden en Outliner).
  - Total de mejoras pendientes actualizado de 28 a 37 (con M-17 completado).
  - Recalculada la Matriz de Complejidad, Prioridad y Matriz de Decisión (identificando M-37 como Quick Win y M-34 como Proyecto Estratégico).
  - Actualizadas las Fases de Implementación (Fases 2, 3, 4 y 6) con sus respectivos archivos afectados.
  - Actualizados los diagramas Mermaid de Arquitectura Final y Grafo de Dependencias entre tareas.

---

## [2026-09-18] Informe Estratégico de Mejoras e Hoja de Ruta de Implementación

### Documentación y Análisis
- **informe_mejoras_e_implementacion.md:** Creación del informe integral de modernización técnica y de diseño para RACK Designer Next:
  - Clasificación sistemática de todas las propuestas de `mejoras.md` agrupadas en 5 dominios (Core/Datos, UX/Física, Topología, Exportación/Colaboración y Responsive/Calidad).
  - Diagrama de Arquitectura Transformacional (Antes vs. Después) mostrando la unificación de flujos e integración de `html2canvas`.
  - Diagrama de Flujo de Secuencia para conexión física interactiva (*Drag-to-Connect*).
  - Diagrama de Pipeline de exportación visual de alta fidelidad.
  - Diagrama de Grafo de Implementación con dependencias lógicas y matriz de esfuerzo/impacto en 5 fases.

---

## [2026-09-18] Fidelidad Visual de Exportación de Imágenes (html2canvas) en mejoras.md

### Documentación y Roadmap
- **mejoras.md:** Se documentó formalmente en la Sección 6 la propuesta "Fidelidad Visual 1:1 en Exportación de Imágenes (PNG de Racks, Piso y Cables)" y se integró como ítem 19 en la Fase 4 (Exportación y Colaboración) del roadmap:
  - Diagnóstico de discrepancia visual: sustitución del dibujador esquemático básico en Canvas 2D de `ExportModal.js`.
  - Integración de `html2canvas.min.js` como script vendor estático en `index.html` (alineado con la arquitectura offline y sin compiladores).
  - Captura fidedigna del DOM real con carátulas fotorrealistas (`assets/img/`), faceplates procedimentales y capa de cableado SVG (`#physical-cables-svg`).
  - Soporte para exportación en alta resolución con factor de escala `scale: 2` / `scale: 3` (Retina / 4K).

---

## [2026-09-18] Gestión CRUD de Salas y Racks desde el Inspector en mejoras.md

### Documentación y Roadmap
- **mejoras.md:** Se documentó en la Sección 6 la propuesta "Creación, Edición y Eliminación de Salas y Racks desde el Inspector" y se incorporó como ítem 11 en la Fase 2 (UX y Usabilidad) del roadmap:
  - Soporte CRUD integral de Salas (edición directa/modal, eliminación con confirmación segura `customConfirm` y botón `+ Crear Rack en esta Sala`).
  - Soporte CRUD integral de Gabinetes (edición de dimensiones/color, eliminación segura y botón `+ Agregar Equipo a este Rack`).
  - Acciones rápidas en estado vacío (Empty State) para aprovisionar `+ Nueva Sala` o `+ Nuevo Gabinete` sin depender de selectores superiores.

---

## [2026-09-18] Incorporación de Propuesta de Creación Gráfica de Conexiones en Vista Física

### Documentación y Roadmap
- **mejoras.md:** Se documentó formalmente en la Sección 6 la propuesta de "Creación Gráfica e Interactiva de Conexiones en la Vista Física (Drag-to-Connect)" y se integró como ítem 12 de la Fase 2 (UX y Usabilidad) en el roadmap:
  - Herramienta y "Modo Cableado" en la barra de controles con iluminación/glow en puertos interactivos.
  - Gesto natural "arrastrar para conectar" (Drag & Connect) con cable SVG elástico (rubber-band) y física suave.
  - Snap magnético con validación en tiempo real (verde/cian para puertos disponibles, rojo para ocupados o incompatibles).
  - Selector flotante rápido de puertos (Quick Port Flyout) junto al equipo para evitar formularios modales pesados.
  - Persistencia directa en `store.js` y trazado automático en canaletas físicas.

---

## [2026-08-08] Sincronización Completa de Documentación Técnica

### Documentación
- **ARCHITECTURE_GUIDE.md:** Reescritura completa (~740 → ~640 líneas). Actualizado con:
  - Sidebar dinámico flyout (50px colapsado / 260px expandido) con sistema de categorías por iconos.
  - Dos estilos de topología documentados (Card 150×50 y Circle r=22), toggle en el header.
  - Sistema de cables SVG en vista física (`#physical-cables-svg`, `drawPhysicalCables()`).
  - File System Access API con autoguardado (3s debounce) y fallback para Firefox/Safari.
  - Tabla completa de los 33 diagramas SVG (antes solo 10), organizados por categoría.
  - Sistema de autenticación RBAC completo con tabla de permisos y token de integridad.
  - Optimización del Proxy: cache WeakMap, `_saveDebounced()` con `requestAnimationFrame`.
  - Referencia al roadmap `mejoras.md` como Source of Truth del proyecto.
  - Sección de renderizado de cableado físico (SVG inline sobre vista física).
- **CODEBASE_ORIENTATION_MAP.md:** Actualización parcial:
  - Tabla de diagramas SVG expandida de 8 a 33 archivos, organizados por categoría.
  - Variable `--sidebar-w` documentada con estado colapsado (50px) y expandido (260px).
- **USER_MANUAL.md:** Expansión significativa (~143 → ~200+ líneas). Nuevas secciones:
  - Parte 2.5: Roles y permisos con tabla de acceso y PIN por defecto.
  - Parte 5: Visualización de conexiones físicas (crear conexión + cables SVG + topología).
  - Parte 6: Vista de topología completa (controles, estilos card/circle, slider, auto-ordenar, exportar PNG).
  - Parte 7: Exportación de datos (PNG racks, PNG topología, CSV, Excel, JSON .rack).
  - Parte 8: Temas y personalización (claro/oscuro, Modo Dios, pausar animaciones).
  - Actualización del catálogo lateral para reflejar el sistema de flyout con iconos por categoría.

---

## [2026-08-02] Reescritura Completa del Mapa de Orientación del Código

### Documentación
- **CODEBASE_ORIENTATION_MAP.md:** Reescritura total del documento (de ~126 a ~500+ líneas). Ahora incluye:
  - Tabla de contenidos con 17 secciones.
  - Reglas de Oro con tablas de "NUNCA/SIEMPRE".
  - Tabla completa de todos los archivos JS con responsabilidades y cuándo tocarlos.
  - API completa del Store (todos los métodos con sus `source` de emisión).
  - Explicación del Proxy ES6 con código comentado y nota sobre arrays.
  - Tabla del ciclo de renderizado (`renderAll` source dispatch).
  - Estructura CSS con tabla de variables clave y cadena de importación.
  - Sección de Recetas: "¿Qué toco si quiero...?" con guías paso a paso para 8 tareas comunes.
  - Sección de errores frecuentes de novatos con soluciones.
  - Glosario técnico de 16 términos específicos del proyecto.
  - Diagramas Mermaid actualizados del flujo principal.

---

## [2026-07-14] Refinamiento de Interfaz de Usuario y Saneamiento

### Añadido y Modificado
- **Deshacer/Rehacer en Topología:** Se implementó soporte completo para `Ctrl+Z` y `Ctrl+Y` en la vista de Topología. Ahora se captura un *snapshot* inteligente al iniciar el arrastre o redimensionado, permitiendo restaurar posiciones en el canvas correctamente.
- **Enrutamiento por Canaleta (Física):** Se mejoró el algoritmo de trazado de cables ortogonales en la vista física. Ahora, los cables que conectan dispositivos de distintos racks bajan por su propio rack hasta una "canaleta inferior" global, evitando atravesar otros gabinetes horizontalmente.
- **Redibujado Forzado de Cables:** Se solucionó un problema donde los cables no se mostraban inicialmente al activar el interruptor; ahora se fuerza su renderizado al vuelo en `main.js`.
- **Ancho Máximo de Periféricos:** Se estableció un ancho máximo estricto (`180px`) para los equipos de piso en la vista física para evitar que se expandan excesivamente en pantallas grandes.
- **Catálogo Agrupado:** Se agruparon los elementos del catálogo: el organizador y la bandeja fija ahora están en el grupo "accesorios", y los UPS y PDU en "energia". Consola KVM y patchpanel también fueron agrupados correctamente.
- **Mejoras del Outliner:** Se refactorizó visualmente el Outliner para que utilice detalles nativos `<details>` y `<summary>` permitiendo contraer los nodos, además se aplicaron mejoras visuales (padding, hover states y flexbox).
- **CSS Grid (Layout):** Se corrigió la pista central del grid (`1fr` a `minmax(0, 1fr)`) que estaba empujando el panel inferior (`#bottom`) fuera de la pantalla.
- **Dimensiones del Panel Derecho:** Se estandarizó el ancho del panel derecho (`#right-panel`) a `300px` (variable `--right-panel-w`). Se estableció una altura fija estricta de `180px` para la subsección de Estadísticas (`#stats-section`), permitiendo al Inspector de propiedades absorber el espacio sobrante fluidamente.
- **Limpieza de Scripts:** Los scripts temporales de Python (`patch*.py`) utilizados para inicializar datos de prueba fueron movidos de la raíz del proyecto al subdirectorio correcto `.py/` conforme a la arquitectura definida en `AGENTS.md`.

---

## [1.2.0] - 2026-07-13
### Añadido
- **Enrutamiento Físico 2D:** Implementación de trazado ortogonal de cables mediante un `<svg>` dinámico superpuesto a la vista física en `rack.js`.
- **Interruptor UI:** Toggle deslizable `.ui-switch` en la barra superior para mostrar/ocultar cables con estado apagado por defecto.
- **Atributos de Anclaje:** Inyección de `data-device-id` y `data-port` en plantillas de `faceplates.js` para ruteo del DOM.

### Modificado
- **Diseño UI:** Se ajustó la cabecera eliminando el separador entre Data Center y Racks, y se unificaron las pestañas "Vista Física" y "Topología" como un control segmentado para coincidir con el diseño propuesto.
- **Diseño UI:** Se redujo el ancho de la barra lateral (sidebar) y de la zona del logo a 240px ajustando la variable `--sidebar-w` en `css/variables.css`.

### Solucionado
- Error de sintaxis en el evento de rotación de ventana que rompía la aplicación.

---

## [2026-07-13] Saneamiento de Deuda TÃ©cnica y Manual de Usuario Definitivo

### Saneamiento de Estructura y CÃ³digo Muerto
- **EliminaciÃ³n de Directorios Residuales:** Eliminada la carpeta vacÃ­a `js/core/` y la carpeta `js/service/` (junto con su archivo duplicado inactivo `service-worker.js`).
- **Limpieza de DocumentaciÃ³n:** Actualizado el archivo [README.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/README.md) y las reglas en [AGENTS.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/AGENTS.md) para remover referencias obsoletas a `js/models/`, `js/api/` y `js/core/`, sincronizando los manuales tÃ©cnicos con el estado real del repositorio.

### DocumentaciÃ³n de Usuario y Ayudas Visuales
- **Reescritura del Manual de Usuario:** Redactado un manual de usuario completo y amigable para principiantes en [USER_MANUAL.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/USER_MANUAL.md).
- **Esquemas de Ayuda Visual (SVGs):** Creados 3 diagramas didÃ¡cticos embebidos en el manual:
  - [manual_ui_overview.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_ui_overview.svg) (corregido segÃºn el CSS Grid de la interfaz real del proyecto).
  - [manual_rack_anatomy.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_rack_anatomy.svg) (explicaciÃ³n de racks y unidades U).
  - [manual_action_flow.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/manual_action_flow.svg) (flujo interactivo bÃ¡sico).
- **Tutoriales Paso a Paso:** AÃ±adidas guÃ­as para 3 escenarios de diseÃ±o reales (HÃ­brido, Solo Racks, y Solo Piso).

---

## [2026-07-12] AuditorÃ­a de CÃ³digo y ResoluciÃ³n de Errores de DiseÃ±o y Seguridad

### CorrecciÃ³n de Errores de Seguridad y Integridad offline
- **Integridad de SesiÃ³n y Hashing SHA-256 en contextos inseguros:** En `js/auth/roles.js`, se implementÃ³ una funciÃ³n pura de JS `sha256_fallback` y un generador UUID aleatorio alternativo. Esto previene fallos fatales e interrupciones en el login al ejecutar la aplicaciÃ³n en entornos no seguros (como a travÃ©s de una IP de red local `http://192.168.x.x` o mediante el protocolo local `file://`), garantizando el funcionamiento offline al 100%.

### AlineaciÃ³n del Sistema de DiseÃ±o (Compliance con DESIGN.md)
- **Diagrama de Arquitectura Actual:** Creado un nuevo diagrama SVG en [architecture_current.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/architecture_current.svg) que documenta las capas del sistema, flujos de datos reactivos del Store, y los nuevos mecanismos de integridad/seguridad local. Vinculado en [ARCHITECTURE_GUIDE.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/ARCHITECTURE_GUIDE.md).
- **Diagrama de Flujo de ComunicaciÃ³n:** Creado un nuevo diagrama de flujo en [file_communication_flow.svg](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_img/doc_svg/file_communication_flow.svg) detallando la comunicaciÃ³n inter-mÃ³dulo, llamadas a mutadores del Store, eventos de reactividad y disparo del render pipeline. Vinculado en [ARCHITECTURE_GUIDE.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/ARCHITECTURE_GUIDE.md).
- **RefactorizaciÃ³n del Modal de Cambio de PIN:** Se eliminaron los estilos inline en el elemento `#modal-change-pin` dentro de `index.html` y se asignaron clases estÃ¡ndar `.modal`, `.form-row`, `.btn-confirm` y `.btn-cancel`. Esto asegura consistencia visual de botones de 24px de altura y proporciona compatibilidad automÃ¡tica y nativa con el **Tema Claro**.
- **Variables CSS Indefinidas:** Reemplazadas las llamadas a `var(--text)` por `var(--text-primary)` en `layout.css`, `outliner.js` e `inspector.js`. Reemplazadas las referencias a `var(--blue)` por la variable estÃ¡ndar de acento cian `var(--accent)` en `layout.css` e `inspector.js`.
- **Limpieza de variables obsoletas:** Eliminada la variable redundante `--purple` en `variables.css`. Se actualizaron los estilos de badges de usuario en `js/main.js` para usar `var(--accent)` y `var(--accent-glow)`.
- **Limpieza de DiÃ¡logos:** Se simplificÃ³ la estructura y estilo del overlay en `customConfirm` de `js/utils.js` usando clases de CSS estandarizadas, asignando la clase de peligro nativa `.btn-confirm.danger` para la confirmaciÃ³n.

### Robustez y Blindaje contra Excepciones en Tooltips
- **Seguridad en Tooltips de TopologÃ­a:** Modificado `TopologyRenderer.js` para asegurar de forma robusta la lectura y conversiÃ³n a mayÃºsculas del tipo de dispositivo mediante `String(dev.type || 'unknown').toUpperCase()`, evitando que propiedades nulas causen excepciones que interrumpan el bucle de renderizado del canvas.
- **Seguridad en Modales:** Aplicado el mismo blindaje de tipo seguro en `PlacementModal.js` y `ExportModal.js`.

---

## [2026-07-11] Reemplazo Masivo de Emojis por SVG Icons â€” Design System Compliance

### Cambio Principal: EliminaciÃ³n de Emojis del Codebase
- **~140 emojis reemplazados** por `<i class="svg-icon icon-X"></i>` SVG icons en todo el proyecto
- **32 nuevas clases de iconos SVG** agregadas a `css/components/misc.css` (mask-image pattern)
- Iconos nuevos: `icon-menu`, `icon-folder`, `icon-save`, `icon-sun`, `icon-moon`, `icon-eye`, `icon-eye-off`, `icon-upload`, `icon-download`, `icon-x`, `icon-sliders`, `icon-maximize`, `icon-chart`, `icon-flame`, `icon-database`, `icon-battery`, `icon-plug`, `icon-check`, `icon-warning`, `icon-crown`, `icon-prohibited`, `icon-rotate`, `icon-sparkle`, `icon-layout`, `icon-kebab`, `icon-paperclip`
- Iconos existentes reutilizados: `icon-bolt`, `icon-lock`, `icon-edit`, `icon-trash`, `icon-image`, `icon-file`, `icon-desktop`, `icon-building`, `icon-server`

### Archivos Modificados
- **index.html** â€” Todos los emojis en botones, divs, spans, modales reemplazados. Emojis en `<option>` y `<title>` eliminados/conservados (imposible usar HTML en estos elementos)
- **js/main.js** â€” Badge de usuario (textContentâ†’innerHTML), toggle theme, toggle passwords, expand/contrar, notificaciones
- **js/ui/rack.js** â€” Empty state icon, device action buttons, flip button, dropdown menus, context menu, floor section button
- **js/ui/catalog.js** â€” Context menu items, notificaciones de viewer
- **js/ui/tables.js** â€” Edit/delete action buttons
- **js/ui/modals/ExportModal.js** â€” PNG export button text
- **js/ui/modals/DeviceModal.js** â€” **Bug fix**: Iconos de catÃ¡logo corruptos (emojis como `ðŸ’»` en vez de paths como `assets/icons/floor/pc.svg`)
- **js/ui/modals/RackModal.js** â€” Notificaciones de viewer
- **js/ui/modals/PlacementModal.js** â€” Titles, room/rack option text
- **js/ui/topology/TopologyLayout.js** â€” NotificaciÃ³n de auto-orden
- **js/utils.js** â€” Notify function (Unicode symbols â†’ SVG icons), customConfirm dialog

### Bug Fix Adicional
- **DeviceModal.js icon paths**: Los iconos de catÃ¡logo se asignaban como emojis (`ðŸ’»`, `ðŸ–¥`, etc.) que nunca se renderizaban en el grid. Corregido a rutas SVG reales (`assets/icons/floor/pc.svg`, `assets/icons/server/server.svg`, etc.)
- **rack.js purple leftover**: BotÃ³n "Agregar Equipo" del floor section todavÃ­a usaba `rgba(139,92,246,0.15)` y `var(--purple)`. Corregido a `rgba(56,189,248,0.15)` y `var(--accent)`

### Nota sobre Emojis Restantes
- `<title>âš¡ RACK Designer Next</title>` â€” Conservado (imposible usar HTML en title)
- `âœ•` Unicode (U+2715) en close buttons â€” Conservado (carÃ¡cter estÃ¡ndar de UI, no emoji)

---

## [2026-07-11] CorrecciÃ³n Masiva de Bugs, Limpieza de CÃ³digo Muerto y OptimizaciÃ³n de Performance

### Correcciones CrÃ­ticas (8 bugs)
- **Bug #1 â€” CatÃ¡logo eliminaba TODAS las plantillas:** `CATALOG = CATALOG.filter(...)` reasignaba el array completo. Corregido a `CATALOG.length = 0; CATALOG.push(...)` para preservar la referencia.
- **Bug #2 â€” Service Worker con paths incorrectos:** `service-worker.js` referenciaba archivos inexistentes (`js/core/store.js`, `js/core/RackAuth.js`, `js/ui/canvas.js`). Reescrito con las rutas reales del proyecto. Cache name cambiado de `rack-designer-next-cache-v1` a `rack-designer-next-cache-v2`.
- **Bug #3 â€” Doble render al cambiar sala:** `catalog.js` llamaba `store.setCurrentRoom()` + `store._emit('change')` duplicando el evento. Eliminada la emisiÃ³n manual.
- **Bug #4 â€” Inspector mostraba `Uundefined`:** `inspector.js:48` usaba `dev.position` (inexistente). Corregido a `dev.slotStart`.
- **Bug #5 â€” deleteRoom dejaba huÃ©rfanos en topologÃ­a:** Las posiciones de `roomPositions`, `rackPositions`, `nodePositions` no se limpiaban al eliminar una sala. Agregado mÃ©todo `_cleanTopologyPositions()` en `store.js`.
- **Bug #6 â€” deleteRack dejaba huÃ©rfanos en topologÃ­a:** Mismo problema que Bug #5 pero al eliminar un rack. `deleteRack()` ahora llama `_cleanTopologyPositions()`.
- **Bug #7 â€” deleteRoom no actualizaba estadÃ­sticas:** `renderAll()` no incluÃ­a `renderStats()` en el branch de `Room`. Agregada la llamada.
- **Bug #8 â€” Pan/Zoom causaba ~60 writes/sec a localStorage:** `setPan()` y `setZoom()` llamaban `_save()` en cada mousemove. Agregado mÃ©todo `_saveDebounced()` con `requestAnimationFrame` para agrupar escrituras.

### Correcciones Adicionales
- **Bug #9 â€” Doble registro Service Worker:** `main.js` y `index.html` ambos registraban el SW. Eliminada la lÃ­nea redundante de `main.js`.

### OptimizaciÃ³n
- **Eliminados `renderStats()` duplicados:** `main.js` tenÃ­a llamadas duplicadas en los branches de loadData/undo/redo y Rack.

### EliminaciÃ³n de CÃ³digo Muerto (6 archivos)
- `js/models/Rack.js`, `Device.js`, `Cable.js` â€” Clases nunca instanciadas
- `js/api/apiClient.js` â€” MÃ³dulo nunca importado (stubs)
- `js/core/export.js` â€” MÃ³dulo nunca importado (stubs)
- `js/ui/topology.js` â€” Archivo vacÃ­o (solo comentario)
- Eliminados directorios vacÃ­os `js/models/` y `js/api/`
- Eliminado `<script>` tag de `topology.js` en `index.html`
- Eliminada entrada de cache en `service-worker.js`

### MÃ©todos Nuevos en store.js
- `updateRoom(id, props)` â€” Actualiza propiedades de una sala
- `setCurrentRoom(id)` â€” Cambia la sala activa
- `setZoom(view, value)` â€” Establece zoom con debounce
- `setPan(view, x, y)` â€” Establece pan con debounce
- `deleteRoom(id)` â€” Elimina sala con limpieza de topologÃ­a
- `_cleanTopologyPositions({ roomIds, rackIds, deviceIds })` â€” Limpia posiciones obsoletas
- `_saveDebounced()` â€” Escritura diferida con `requestAnimationFrame`

### Archivos Modificados
- `js/store.js` â€” Nuevos mÃ©todos, debounce, limpieza de topologÃ­a
- `js/main.js` â€” Eliminado SW duplicado, eliminados renderStats duplicados, agregado renderStats para deleteRoom
- `js/ui/catalog.js` â€” Fix delete-all-templates, fix doble render
- `js/ui/inspector.js` â€” Fix `dev.position` â†’ `dev.slotStart`
- `js/ui/topology/TopologyEvents.js` â€” Fix doble modal
- `js/ui/modals/RoomModal.js` â€” Usa `store.deleteRoom()`
- `service-worker.js` â€” Reescrito con paths correctos, cache v2
- `index.html` â€” Eliminado script tag de topology.js
- `AGENTS.md` â€” Nuevo archivo de onboarding para agentes de IA

### DocumentaciÃ³n
- Actualizado CHANGELOG.md (este archivo)
- Actualizado PROJECT_ANALYSIS.md
- Actualizado CODEBASE_ORIENTATION_MAP.md
- Regenerado directory_structure.svg
- Regenerado module_dependencies.svg

---

## [2026-07-10] Motor de TopologÃ­a Mejorado â€” Layout, Espaciado y Auto-Orden

### Nuevas CaracterÃ­sticas
- **BotÃ³n Auto-Orden (âš¡):** Nuevo botÃ³n en la barra de la vista de TopologÃ­a que resetea y recalcula todas las posiciones (salas, racks, nodos) desde cero usando el algoritmo de layout Ã³ptimo basado en el tamaÃ±o real de las tarjetas.
- **Slider de Espaciado de Nodos:** Control deslizable (rango 40â€“150 px) para ajustar la separaciÃ³n vertical entre equipos dentro de los racks en tiempo real. El valor persiste entre recargas.
- **BotÃ³n de Estilo de TopologÃ­a (ðŸŽ›):** Alterna la representaciÃ³n grÃ¡fica de los nodos entre modo Tarjeta (card) y modo CÃ­rculo (circle).

### Correcciones CrÃ­ticas (Motor de Layout)
- **Reescritura completa de `TopologyLayout.js`:** El motor de posicionamiento fue rediseÃ±ado desde cero para basarse en el **tamaÃ±o real de las tarjetas** (`CARD_W=160, CARD_H=60`) en lugar de valores fijos arbitrarios. Esto elimina de raÃ­z las colisiones visuales entre nodos.
- **Grid de dispositivos de piso:** Los equipos instalados directamente en la sala (fuera de un rack) ahora se distribuyen en una **cuadrÃ­cula inteligente** (hasta 4 columnas, mÃºltiples filas) en vez de una sola fila horizontal aplastada.
- **Ancho de rack dinÃ¡mico:** El ancho de cada rack se calcula segÃºn el nombre del rack y el nombre del equipo mÃ¡s largo, evitando texto desbordado o recortado.
- **FunciÃ³n privada `_computeLayout()`:** Las tres funciones (`initTopoPositions`, `autoOrderTopo`, `recalcTopoSpacing`) ahora comparten un nÃºcleo matemÃ¡tico comÃºn para garantizar consistencia en todos los escenarios.

### Correcciones de UI
- **BotÃ³n "Estilo" y Slider invisibles en Vista FÃ­sica:** Se reemplazÃ³ la manipulaciÃ³n de `style.display` con una clase CSS `.force-hide { display: none !important; }` para garantizar que los controles de topologÃ­a nunca sean visibles fuera de su contexto.
- **Bucle de animaciÃ³n duplicado:** El clic en el botÃ³n de Estilo ya no llamaba a `drawTopo()` manualmente, lo que duplicaba el motor de animaciÃ³n y aceleraba los cables.
- **Velocidad de animaciÃ³n:** Se redujo a la mitad la velocidad de las partÃ­culas en las conexiones (`flowT` de `0.015` â†’ `0.0075`).

### Archivos Modificados
- `js/ui/topology/TopologyLayout.js` â€” Reescritura completa (motor de layout)
- `js/ui/topology/TopologyState.js` â€” Persistencia de `TOPO_SPACING` en el estado guardado
- `js/ui/topology/TopologyRenderer.js` â€” Ajuste de velocidad de animaciÃ³n
- `js/main.js` â€” Registro de eventos de slider/botones; toggle de visibilidad por vista
- `index.html` â€” Botones Auto-Orden y Slider en la barra de herramientas
- `css/layout.css` â€” Clase `.force-hide` y `.topo-slider`

## [2026-07-10] Panel de Propiedades y RefactorizaciÃ³n del Outliner

### Nuevas CaracterÃ­sticas y UI
- **Inspector de Propiedades:** Se introdujo un panel central dinÃ¡mico (`js/ui/inspector.js`) que renderiza de manera instantÃ¡nea y en modo de solo lectura los detalles del objeto seleccionado en el Outliner. Soporta mostrar propiedades completas de Salas, Gabinetes y Equipos (con Ã­conos dinÃ¡micos FontAwesome).
- **Outliner Mejorado:** El Ã¡rbol jerÃ¡rquico (`js/ui/outliner.js`) ahora soporta un estado de selecciÃ³n interactivo global. Al hacer clic simple sobre una Sala, Gabinete o Equipo, el Inspector se actualiza. El doble clic continÃºa abriendo el modal de ediciÃ³n correspondiente (DeviceModal, RoomModal, RackModal). Se removiÃ³ un artefacto visual de "U" no definida de la vista.
- **EstadÃ­sticas Colapsables:** El panel de estadÃ­sticas inferior ahora puede contraerse haciendo clic en su cabecera para otorgar mÃ¡s espacio visual al nuevo Inspector.
- **Soporte SVG:** Se actualizÃ³ el layout a `modals_accordions.svg` con la nueva configuraciÃ³n.

### ActualizaciÃ³n de DocumentaciÃ³n
- **Manual de Usuario:** Se actualizÃ³ `USER_MANUAL.md` para reflejar el comportamiento del nuevo Panel Derecho (Outliner interactivo, Inspector y EstadÃ­sticas colapsables).
- **Arquitectura:** Se integrÃ³ `inspector.js` a `CODEBASE_ORIENTATION_MAP.md` y `PROJECT_ANALYSIS.md` junto con los flujos de lectura en README.

## [2026-07-10] Mapa de OrientaciÃ³n del CÃ³digo (Onboarding Engineer)

### ActualizaciÃ³n de DocumentaciÃ³n
- **Mapa de OrientaciÃ³n**: CreaciÃ³n de `doc/doc_md/CODEBASE_ORIENTATION_MAP.md` que detalla de forma exhaustiva y tÃ©cnica la arquitectura modular, flujos de datos reactivos (Proxy ES6), y lÃ­mites de las capas del proyecto para agilizar el onboarding de desarrolladores.

### RediseÃ±o de la Cabecera Principal y NavegaciÃ³n
- **Dropdowns de Salas y Racks:** Se rediseÃ±Ã³ la cabecera principal (`header-main-area`) trasladando la navegaciÃ³n de salas desde la barra inferior hacia la parte superior.
- **Selector Inteligente de Racks:** Se aÃ±adiÃ³ un menÃº desplegable que lista dinÃ¡micamente todos los racks de la sala activa, permitiendo salto rÃ¡pido y resaltado visual (scroll).
- **Estilos CSS Modernizados:** Se utilizaron menÃºs flotantes (`position: absolute`) para evitar la deformaciÃ³n del layout principal al desplegar, ademÃ¡s de sustituir emojis por puntos indicadores CSS de estado activo/inactivo (`.status-dot-nav`).

### CorrecciÃ³n de Errores (Bugfixes)
- **Error CrÃ­tico de Racks en Sala:** Se corrigiÃ³ un error grave al intentar usar `store.allRacksInRoom()` que no existÃ­a, cambiÃ¡ndolo por el filtrado nativo `store._raw.racks.filter(...)`, lo cual rompÃ­a la inicializaciÃ³n visual completa del entorno.
- **Fallo al Cerrar SesiÃ³n:** El handler de logout estaba enterrado dentro de `initChangePinModal()`, haciÃ©ndolo dependiente de la inicializaciÃ³n del menÃº de proyecto. Se reubicÃ³ directamente en `init()` para garantizar su registro independiente. Se usa `window.location.reload()` para un reseteo limpio.
- **Demos no cargaban en `file:///`:** La carga dinÃ¡mica de `demoData.js` via `document.createElement('script')` fallaba por restricciones CORS del navegador en protocolo `file:///`. Se aÃ±adiÃ³ `demoData.js` como `<script>` estÃ¡tico en `index.html`.
- **ProtecciÃ³n de renderizado:** Se envolviÃ³ `renderRackSelector()` en `try-catch` para evitar que un error en el selector de racks rompa toda la cadena de `renderAll()`.
- **Error de Referencia de TopologÃ­a**: Se corrigiÃ³ un `ReferenceError: renderTopology is not defined` en `js/main.js` al hacer clic en el botÃ³n de **Estilo** en la vista de topologÃ­a. Se reemplazÃ³ la llamada por un control condicional seguro a `drawTopo()`.

### Mejoras Visuales y UX
- **RediseÃ±o del Header:** Se reorganizÃ³ la cabecera principal (`.header-main-area`). Los selectores de Salas y Racks se movieron a la izquierda con Ã­conos de despliegue (`â–¶`), y los tabs de vista (FÃ­sica/TopologÃ­a) se alinearon a la derecha.
- **Barra de Herramientas Transparente:** La barra de controles del canvas ahora tiene fondo 100% transparente y flota sobre el canvas en la parte superior.
- **Equipos de Piso Inteligentes:** El panel inferior de equipos de piso ahora tiene ancho autoescalable: ocupa exactamente el ancho de un rack (`260px`) si estÃ¡ vacÃ­o, o se expande al `100%` debajo de los racks si estÃ¡ ocupado.
- **MenÃº Unificado en Piso:** Se reemplazaron los botones directos de editar/eliminar en las tarjetas de piso por un Ãºnico botÃ³n de opciones (`â‹®`) que despliega el menÃº contextual, unificando la experiencia con el resto de la interfaz. TambiÃ©n se corrigiÃ³ un problema de CSS (`faceplates.css`) que impedÃ­a ver estos botones al hacer hover.
- **Nuevo Panel Derecho (Outliner):** Se dividiÃ³ la pantalla en 3 columnas principales, aÃ±adiendo un panel derecho (260px). Se implementÃ³ un Outliner (Ã¡rbol jerÃ¡rquico estilo Blender) para visualizar y acceder rÃ¡pidamente a todos los equipos, agrupados por Sala, Rack y Equipos de Piso.
- **ReubicaciÃ³n de EstadÃ­sticas:** Se eliminÃ³ la caja redundante del tÃ­tulo de estadÃ­sticas en el panel izquierdo y se trasladaron los "pills" de indicadores (Gabinetes, Equipos, U ocupadas, Potencia) al nuevo panel derecho para compartir espacio debajo del Outliner, aprovechando mejor la verticalidad.


## [2026-06-24] RediseÃ±o y ReubicaciÃ³n de Diagramas SVG (AI Agents)

### ActualizaciÃ³n de DocumentaciÃ³n
- **Manual de Usuario:** Se actualizÃ³ la secciÃ³n 4 de `doc/doc_md/USER_MANUAL.md` ("Flujo de Trabajo End-to-End"), sustituyendo el tutorial paso a paso por una descripciÃ³n arquitectÃ³nica detallada en 4 fases (PreparaciÃ³n, DiseÃ±o FÃ­sico, DiseÃ±o LÃ³gico, y AuditorÃ­a/Respaldo).

### CorrecciÃ³n de Directorio y RediseÃ±o Visual Completo
- **ReubicaciÃ³n:** Los diagramas SVG se movieron al directorio correcto `doc/doc_img/doc_svg/`.
- **RediseÃ±o Profesional Premium:** Los 18 diagramas fueron completamente rediseÃ±ados con estÃ©tica de nivel tÃ©cnico-industrial: gradientes multicapa, tipografÃ­a Segoe UI, simulaciones visuales de interfaz (rack slots, canvas 2D, selects/inputs), filtros SVG de glow/shadow, colores acento semÃ¡nticos por dominio, y layouts con proporciones de cuadrÃ­cula estrictas. Se eliminÃ³ el diseÃ±o plano y bÃ¡sico anterior.
- **Diagramas generados en `doc/doc_img/doc_svg/`:**
  - `architecture_overview.svg` â€” Capas Data / Logic / Presentation con cards por mÃ³dulo.
  - `store_reactivity.svg` â€” Flujo ES6 Proxy â†’ localStorage/historial/UI con ramas visuales.
  - `roles_permissions.svg` â€” 3 columnas de roles con Ã­cono de persona, permisos y token de sesiÃ³n.
  - `theme_switcher.svg` â€” Tokens CSS Dark/Light con swatches de color reales.
  - `device_skins_fallback.svg` â€” Comparativa SVG faceplate vs CSS fallback con preview de rack.
  - `autosave_history.svg` â€” Stack de historial, timer debounce, localStorage y fileHandle.
  - `security_rbac_crypto.svg` â€” Flujo SHA-256, cÃ³digo Web Crypto API, y escenario anti-tamper.
  - `topology_engine.svg` â€” Arquitectura MVC + simulaciÃ³n de canvas 2D con nodos y cables.
  - `drag_drop_flow.svg` â€” 3 fases: CatÃ¡logo â†’ Rack slot â†’ Floor drop con eventos.
  - `export_system.svg` â€” 4 formatos de exportaciÃ³n con simulaciones de JSON/CSV/canvas.
  - `pwa_service_worker.svg` â€” IntercepciÃ³n de fetch, rama cache HIT/MISS, manifest install.
  - `hybrid_network_ports.svg` â€” Selector dinÃ¡mico SELECT vs INPUT con simulaciÃ³n de UI.
  - `module_dependencies.svg` â€” Grafo radial con main.js como nodo central.
  - `directory_structure.svg` â€” Ã�rbol de carpetas coloreado por dominio con descripciones.
  - `file_manager_api.svg` â€” Open/Save/AutoSave flows con comparativa nativa vs blob fallback.
  - `modals_accordions.svg` â€” Lista de modales + simulaciÃ³n de acordeÃ³n de DeviceModal.
  - `ui_layout_map.svg` â€” SimulaciÃ³n visual completa de la aplicaciÃ³n con paneles anotados.
  - `user_personas.svg` â€” 3 tipos de usuario con avatares y matrices de capacidades.

## [2026-06-23] Sistema DinÃ¡mico de Interfaces de Red Opcionales (Workflow Architect)

### ConfiguraciÃ³n HÃ­brida de Puertos
- **Arquitectura de Datos (`store.js`):** El esquema de los equipos (`devices`) se ha expandido para soportar un objeto `ports` (`{ ethernet, fiber }`) totalmente opcional, manteniendo retrocompatibilidad absoluta con inventarios anteriores.
- **Formulario Inteligente (`DeviceModal.js`):** Se inyectÃ³ un nuevo mÃ³dulo colapsable ("Interfaces de Red") en el modal principal de ediciÃ³n que permite al usuario definir numÃ©ricamente la cantidad de puertos SFP (Fibra) y Ethernet de cada equipo.
- **Conexionado DinÃ¡mico (`CableModal.js` y `index.html`):** Los campos de "Puerto Origen" y "Puerto Destino" en la interfaz de parcheo evolucionaron de ser Ãºnicamente texto libre a ser mutables. Si el sistema detecta que el usuario estÃ¡ cableando un equipo con puertos definidos, la UI inyecta instantÃ¡neamente un desplegable restrictivo `<select>` (ej: `Eth-1`, `Eth-2`, `SFP-1`); si el equipo no los define, revierte limpiamente a un campo de texto `<input>`.

## [2026-06-23] Parches de Seguridad (Client-Side) y NormalizaciÃ³n UI (Security Architect & UI Designer)

### Seguridad CriptogrÃ¡fica y Control de SesiÃ³n
- **Hashing SHA-256 (Web Crypto API):** Se eliminÃ³ el almacenamiento en texto plano del PIN de administrador (`rack2024`). El mÃ³dulo `js/auth/roles.js` ahora computa y almacena asÃ­ncronamente Ãºnicamente huellas criptogrÃ¡ficas SHA-256 (`localStorage`), bloqueando filtraciones de credenciales. Las funciones de validaciÃ³n en `js/main.js` fueron refactorizadas a un modelo `async/await`.
- **Integridad de SesiÃ³n Anti-Tampering:** Se implementÃ³ un sello de integridad de memoria (*closure token*) mediante `crypto.randomUUID()`. Si un usuario altera manualmente su `sessionStorage` desde DevTools para elevar sus privilegios (ej. de `viewer` a `admin`), el sistema forzarÃ¡ un cierre de sesiÃ³n automÃ¡tico al detectar la ausencia del token en RAM.

### Arquitectura Visual ("IDE-Grade")
- **Purga de "AI Slop" en UI:** Se eliminaron los estilos CSS "comerciales" (alturas excesivas, paddings gigantes y botones con degradados pÃºrpuras) incrustados en `index.html` para el `#modal-login`. Se reestructurÃ³ para forzar el uso de las clases base del sistema (`.modal`, `.btn-confirm`, `.btn-cancel`), aplicando el **Acento TÃ©cnico (Cian puro)** y respetando la regla matemÃ¡tica de alturas de **24px** para controles.
- **Scroll Interno y LÃ­mites de VisualizaciÃ³n:** Se aplicÃ³ `max-height: 90vh` y `overflow-y: auto` de forma global a la clase `.modal` en `css/components/modals.css`, garantizando que los modales extensos (como la ediciÃ³n de un equipo con todos los paneles expandidos) se mantengan accesibles en pantallas de baja resoluciÃ³n (laptops) y no oculten los botones de acciÃ³n ("Guardar" / "Cancelar"). Se implementÃ³ ademÃ¡s una barra de desplazamiento nativa estilizada que encaja con el entorno profundo de RACK Designer Next.

## [2026-06-23] OptimizaciÃ³n PWA y Accesibilidad ARIA (Frontend Developer)

### Progressive Web App (PWA) y Core Web Vitals
- **InstalaciÃ³n Offline:** Se creÃ³ el archivo `service-worker.js` para cachear la capa de presentaciÃ³n completa (HTML, CSS, JS, SVGs y fuentes). Esto asegura que RACK Designer Next cargue instantÃ¡neamente y sea instalable como aplicaciÃ³n de escritorio/mÃ³vil independiente sin requerir conexiÃ³n a la red.
- **Registro del Service Worker:** Se integrÃ³ la lÃ³gica de registro en `js/main.js` interceptando el evento `load` de la ventana para no bloquear el hilo de renderizado principal (protegiendo el LCP).

### Accesibilidad (WCAG 2.1 AA)
- **NavegaciÃ³n SemÃ¡ntica (Screen Readers):** Se inyectaron etiquetas `aria-label` en todos los controles interactivos y botones iconogrÃ¡ficos (menÃº, controles de zoom, expansiÃ³n de paneles, etc.) en `index.html`. Ahora los lectores de pantalla vocalizan la intenciÃ³n real de la acciÃ³n en lugar de leer los caracteres ASCII.

## [2026-06-23] AuditorÃ­a y NormalizaciÃ³n de UI (UI Designer)

### Sistema de DiseÃ±o y Accesibilidad
- **Contraste Perfeccionado:** Se aclarÃ³ el token `--text-muted` de `#8496b0` a `#94a3b8` en `css/variables.css` y `.agents/DESIGN.md` para garantizar el cumplimiento estricto del ratio de contraste WCAG AA sobre fondos oscuros.
- **EliminaciÃ³n de "AI Slop":** Se reemplazÃ³ la sombra difuminada global (`--shadow`) por una sombra dura de estilo IDE (`0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)`) para una estÃ©tica mÃ¡s profesional y densa.
- **Micro-AlineaciÃ³n Estricta a 24px:** 
  - Se corrigiÃ³ `css/components/modals.css` para forzar que todos los inputs, selects y botones de los modales respeten la directriz obligatoria de 24px de altura (`height: 24px !important`).
  - Se ajustÃ³ el padding asimÃ©trico de la caja de bÃºsqueda (`.h-search input`) en `css/layout.css` (`padding: 0 8px 0 30px`) para evitar el solapamiento del Ã­cono de la lupa respetando las reglas de la cuadrÃ­cula.

## [2026-06-23] Sistema de Control de Acceso Basado en Roles (RBAC) y ActualizaciÃ³n de DocumentaciÃ³n

### Seguridad y Roles de Usuario
- **Sistema de Roles (RBAC):** Se implementÃ³ `js/auth/roles.js` (`RackAuth`) definiendo tres niveles de acceso: Administrador, Editor y Espectador.
- **ProtecciÃ³n de SesiÃ³n y AutenticaciÃ³n:** Se implementÃ³ un modal de inicio de sesiÃ³n (`#modal-login`) gestionado mediante `sessionStorage`. El PIN de Administrador ("rack2024" por defecto) puede configurarse en un nuevo modal dedicado y se persiste cifrado en `localStorage`.
- **Blindaje de Interfaz y LÃ³gica:** 
  - Se bloquearon las interacciones Drag & Drop (`dragstart`) y el doble clic para inserciÃ³n rÃ¡pida a los espectadores.
  - Se aÃ±adieron verificaciones (`RackAuth.can()`) en todos los botones destructivos, menÃºs contextuales y la rutina de autoguardado.
  - **Modo Dios Exclusivo:** La revelaciÃ³n global de contraseÃ±as (`window.SHOW_PASSWORDS`) fue restringida exclusivamente a usuarios con rol Administrador.

### DocumentaciÃ³n e Infraestructura
- **ActualizaciÃ³n de Documentos:** Se actualizÃ³ `USER_MANUAL.md` incorporando la secciÃ³n sobre los roles de usuario. Se actualizÃ³ `TECHNICAL_DOCS.md` detallando la implementaciÃ³n y mecanismos de seguridad del RBAC.
- **GeneraciÃ³n de Manual HÃ­brido:** Se optimizÃ³ `build_standalone_manual.cjs` con la dependencia `marked` (instalada vÃ­a `pnpm`) para combinar los archivos `.md` y generar automÃ¡ticamente la versiÃ³n estÃ¡tica `DOC/html/FULL_MANUAL_STANDALONE.html` con imÃ¡genes SVG empotradas en Base64.
- **Limpieza de RaÃ­z y Scripts:** Se reorganizÃ³ el directorio base, moviendo los scripts Node.js a la carpeta `scripts/`. Se restableciÃ³ la ubicaciÃ³n estricta del directorio `.py/` y los documentos internos `.agents/` (`DESIGN.md`, `INSTRUCTIONS.md`) conforme a las instrucciones directivas.

## [2026-06-22 10:30:00] Renderizado HÃ­brido de Faceplates y Mejoras de Interfaz

### Funcionalidades Core
- **Renderizado HÃ­brido AutomÃ¡tico:** Se implementÃ³ una lÃ³gica hÃ­brida inteligente en `faceplates.js` que intenta cargar primero las imÃ¡genes fotorrealistas (SVG/PNG) desde `assets/img/`. Si la imagen no se encuentra, el motor hace un *fallback* automÃ¡tico e instantÃ¡neo (vÃ­a evento `onerror` en el DOM) hacia el renderizado procedimental en cÃ³digo CSS.
- **Control de Renderizado mediante Sistema de Archivos:** Los usuarios ahora pueden forzar al sistema a usar el renderizado CSS para una categorÃ­a de equipo especÃ­fico simplemente renombrando su archivo de imagen para que comience con un punto (ej. `.switch.svg`). Esto oculta el archivo al motor de red, desencadenando la protecciÃ³n de fallback de forma transparente y sin necesidad de tocar la base de datos o el cÃ³digo fuente.

### Interfaz de Usuario (UI)
- **Panel Inferior Optimizado:** Se ajustÃ³ el estado inicial del panel inferior (Tabla de Inventario/Conexiones). Ahora el proyecto carga con este panel totalmente contraÃ­do por defecto (`bottomCollapsed = true`), maximizando el Ã¡rea visual de trabajo disponible para la topologÃ­a y los gabinetes desde el primer segundo.

## [2026-06-22 08:00:00] Arquitectura de Activos GrÃ¡ficos: ImÃ¡genes Fotorrealistas para Faceplates

### Estructura y OrganizaciÃ³n de Assets
- **Nueva Estructura de Directorios (`assets/img/`):** Se introdujo una jerarquÃ­a paralela a los iconos (`network`, `server`, `storage`, `power`, `wiring`, `accessories`, `floor`) destinada exclusivamente a alojar imÃ¡genes detalladas (SVGs fotorrealistas o PNGs) para la vista fÃ­sica de los equipos.
- **DiferenciaciÃ³n de Renderizado:** La arquitectura ahora separa semÃ¡nticamente los iconos abstractos (`assets/icons/`), usados como mÃ¡scaras CSS en la topologÃ­a e inventario, de los diseÃ±os fÃ­sicos detallados (`assets/img/`), preparando el ecosistema para permitir a los usuarios subir personalizaciones grÃ¡ficas (custom faceplates).
- **Generador AutomÃ¡tico de SVGs (`generate_svgs.cjs`):** Se creÃ³ e implementÃ³ un script Node.js para poblar dinÃ¡micamente el nuevo Ã¡rbol de directorios con diseÃ±os vectoriales base y organizarlos automÃ¡ticamente segÃºn la taxonomÃ­a del catÃ¡logo.

## [2026-06-22 06:45:00] ExpansiÃ³n del CatÃ¡logo SVG y ActualizaciÃ³n de DemostraciÃ³n

### Arquitectura y Renderizado Visual
- **MigraciÃ³n a SVG DinÃ¡micos:** Se reemplazÃ³ el uso de Emojis del sistema por iconos SVG monocromÃ¡ticos en todo el ecosistema grÃ¡fico. Los SVGs se colorean dinÃ¡micamente usando `mask-image` en el DOM y una cachÃ© offline (Canvas) para el motor topolÃ³gico de alto rendimiento.
- **JerarquÃ­a de Iconos:** Nueva estructura organizada en `assets/icons/` dividida por dominio (`/network`, `/server`, `/power`, `/storage`, `/wiring`, `/accessories`, `/floor`).

### ExpansiÃ³n TeÃ³rica del Datacenter
- **AmpliaciÃ³n del CatÃ¡logo:** El catÃ¡logo base (`catalog.js`) fue sustancialmente enriquecido con infraestructura tÃ©cnica realista. Se aÃ±adieron categorÃ­as: Cableado (Patch Panels, Organizadores), EnergÃ­a (PDU), Almacenamiento (NAS, SAN), Accesorios (KVM, Bandejas) y perifÃ©ricos de Piso (Controladoras, Accesos).

### DemostraciÃ³n TÃ©cnica (`demoData.js`)
- **Redimensionamiento de Racks:** Los gabinetes en la demostraciÃ³n ahora presentan tamaÃ±os realistas variados: el Core (`Rack 101`) de 42U, nodos secundarios (`201`, `301`) de 24U, y remotos de 12U.
- **Sala "Bodega":** Se aÃ±adiÃ³ una cuarta sala para equipos de piso (cÃ¡maras, AP, controladora), interconectada lÃ³gicamente por Ethernet hacia el switch de acceso del Rack 301 para ejemplificar el alcance distribuido de la red.

## [2026-06-19 19:10:00] ReestructuraciÃ³n Modular (Models/Core/API) y Lado de Montaje

### Arquitectura y RefactorizaciÃ³n
- **SeparaciÃ³n de LÃ³gica de Negocio:** Se crearon las carpetas `js/models/`, `js/api/` y `js/core/` para implementar una arquitectura mÃ¡s limpia (Clean Architecture). Las clases de entidades base (`Rack.js`, `Device.js`, `Cable.js`) ahora viven en `models/`, separando estrictamente los datos de la lÃ³gica de interfaz de usuario (`ui/`) y estado (`store.js`).
- **MÃ³dulo de ExportaciÃ³n:** La lÃ³gica pesada de exportaciÃ³n se extrajo hacia `js/core/export.js`.
- **Cliente API Base:** Se introdujo `js/api/apiClient.js` como capa fundamental para futuras integraciones de bases de datos.
- **Directorio de Pruebas y Recursos:** Se crearon las carpetas `tests/` para futuras pruebas unitarias (con un archivo base `Rack.test.js`) y `assets/img/` para concentrar imÃ¡genes.

### Mejoras de Interfaz (UI/UX)
- **Lado de Montaje en CreaciÃ³n:** Ahora, al crear o editar un equipo de rack desde el modal (`DeviceModal`), es posible elegir explÃ­citamente el **Lado (Montaje)** (Frontal o Trasero) mediante un nuevo selector. Este valor se guarda en la propiedad `mountSide` del dispositivo.
- **IntegraciÃ³n con Asistente de UbicaciÃ³n:** El Asistente de UbicaciÃ³n RÃ¡pida (`PlacementModal`) ahora lee de manera inteligente la preferencia `mountSide` del equipo desde el catÃ¡logo y la pre-selecciona automÃ¡ticamente para acelerar el despliegue.

## [2026-06-19 12:40:00] RediseÃ±o ArquitectÃ³nico del Modal de Equipos (Acordeones UI)

### AÃ±adido
- **JerarquÃ­a Visual:** Se rediseÃ±Ã³ por completo el formulario modal de "Nuevo Equipo" (`#modal-device`) pasando de un listado vertical estÃ¡tico a un moderno sistema de **MÃ³dulos Colapsables (Acordeones)**.
- **Interruptores de Estado (ON/OFF):** Se introdujo una clase maestra `.module-toggle` que permite al usuario decidir quÃ© bloques de metadatos desea ver y llenar (Red, Credenciales, Notas, EnergÃ­a), ocultando el resto mediante CSS Puro (`display: none`). Esto reduce drÃ¡sticamente la carga cognitiva y el espacio ocupado en pantalla.
- **Campo "Estado":** Se agregÃ³ la propiedad `status` a los dispositivos para distinguir si estÃ¡n Activos, Apagados o en Mantenimiento.

### Refactorizado
- **LÃ³gica Inteligente de JS (`DeviceModal.js`):** El controlador fue actualizado para sincronizarse con los nuevos acordeones. Al abrir un equipo existente a ediciÃ³n, la interfaz ahora enciende automÃ¡ticamente los acordeones correspondientes si detecta datos previamente almacenados (ej. Si el equipo ya tenÃ­a una IP guardada, el mÃ³dulo de "Red" se abrirÃ¡ por defecto).
- AdemÃ¡s, si un usuario apaga un acordeÃ³n antes de guardar, el controlador inyectarÃ¡ en blanco esos datos para no almacenar metadatos basura inactivos en el store.

## [2026-06-19 10:40:00] ReestructuraciÃ³n de DocumentaciÃ³n y ActualizaciÃ³n de SVG
### AÃ±adido
- **ConsolidaciÃ³n de ImÃ¡genes:** Se reubicaron todas las imÃ¡genes vectoriales de la documentaciÃ³n (`mockups`, `ui`, arquitectÃ³nicas) a un directorio centralizado unificado en `doc/img/svg/`.
- **ActualizaciÃ³n Masiva de Rutas:** Se actualizaron dinÃ¡micamente mÃ¡s de 100 referencias de rutas de imÃ¡genes en todos los archivos `.md` y `.html` para que apunten a la nueva estructura estructurada.
- **Renombre de Directorios HTML:** Se actualizaron las referencias de recursos en los manuales interactivos (`manual.html` y `manual_2.html`) para apuntar a las nuevas carpetas renombradas `manual_css/` y `manual_js/` dentro de `doc/html/`.

### Mejoras de Rendimiento (DocumentaciÃ³n)
- **SeparaciÃ³n LÃ³gica de Documentos (User vs Developer):** Se extrajo de manera definitiva toda la teorÃ­a arquitectÃ³nica y de ingenierÃ­a pesada del manual de usuario. Las secciones de "Estructura de Carpetas", "DiseÃ±o AtÃ³mico (Atomic Design)" y el "Layout Map Visual" fueron transformadas al diseÃ±o oscuro premium e integradas como tarjetas en el Dashboard de `arquitectura_2.html`.
- **Limpieza de Manual Lineal:** El documento `manual_lineal.html` fue depurado, eliminando todos los conceptos de ingenierÃ­a que no aportaban valor a un operador final, convirtiÃ©ndolo en una guÃ­a 100% coherente enfocada Ãºnicamente en el uso de la interfaz (desde creaciÃ³n de salas hasta exportaciÃ³n de reportes).
- **FusiÃ³n ArquitectÃ³nica (Single Source of Truth):** Se integrÃ³ toda la documentaciÃ³n y diagramas de `arquitectura.html` dentro de la interfaz moderna tipo Dashboard de `arquitectura_2.html`. Se aÃ±adieron tarjetas enriquecidas describiendo el uso de `WeakMap`, bloqueos `try/finally` a 60fps, y un nuevo panel interactivo sobre Seguridad y Modo Dios.
- **Limpieza de Archivos:** Se eliminÃ³ permanentemente el archivo obsoleto `arquitectura.html` tras la fusiÃ³n exitosa para evitar duplicidad de fuentes de verdad.
- **RefactorizaciÃ³n de `arquitectura.html` previa:** Se eliminaron mÃ¡s de 1200 lÃ­neas de cÃ³digo SVG embebido (*inline*) y se reemplazaron por etiquetas `<img src="...">` apuntando a los archivos externos en `doc/img/svg/`. Esto redujo el peso del archivo de **77 KB a 8.7 KB**, mejorando enormemente su mantenibilidad. Se actualizaron ademÃ¡s los textos descriptivos para documentar las soluciones a fugas de memoria con `WeakMap`, la separaciÃ³n del CSS/JS de los manuales, y las implementaciones de seguridad como el Modo Dios y `crypto.randomUUID()`.

### CorrecciÃ³n de Errores (DocumentaciÃ³n)
- **SincronizaciÃ³n de Diagramas SVG:** Se actualizaron los textos de los diagramas arquitectÃ³nicos (`01_estructura_estado.svg`, `02_ciclo_store.svg`, `03_capas_persistencia.svg`, `04_erd_entidades.svg`) para reflejar los Ãºltimos *bugfixes*:
  - Ocultamiento visual de contraseÃ±as (Modo Dios / Seguridad UX).
  - EliminaciÃ³n de fuga de memoria reciclando Proxies mediante `WeakMap`.
  - Exportaciones de CSV y PNG ahora protegidas contra XSS y cuelgues (try/finally).
  - ActualizaciÃ³n de menciones de IDs de `base-36` al nuevo estÃ¡ndar nativo de 16 caracteres `crypto.randomUUID()`.

## [2026-06-18 17:25:00] ActualizaciÃ³n de Arquitectura Visual (Layout Map) y Manuales
- **Manual de PÃ¡gina Ãšnica (Single-Page):** Se creÃ³ `manual_2.html`, una variante del manual interactivo que muestra todas las secciones en un scroll continuo. Incluye una funcionalidad de ScrollSpy personalizada para actualizar el menÃº lateral de forma dinÃ¡mica.
- **Nuevo Layout Map (`ui_layout_map_full.svg`):** Se diseÃ±Ã³ un mapa estructural completo en SVG con proporciones reales. Se aplicÃ³ una paleta de colores armÃ³nica (Dark Mode) y se agregaron subtÃ­tulos identificando los archivos SVG correspondientes a cada bloque.

### CorrecciÃ³n de Errores (DocumentaciÃ³n)
- **CorrecciÃ³n de "Vista de Rack":** Se corrigiÃ³ un error conceptual en los manuales (`USER_MANUAL.md`, `manual.html`, `manual_2.html`) reubicando `ui_rack_view.svg` desde la secciÃ³n "Sidebar" hacia la secciÃ³n "Main Canvas", clarificando que la vista detallada del gabinete ocupa el espacio central.
- **DivisiÃ³n de Panel Inferior:** Se dividiÃ³ la documentaciÃ³n del "Bloque Rosa/Inferior" en dos componentes funcionales separados: "Bottom Bar / PestaÃ±as" (la franja minimizada) y "Tabla de Datos / Inventario Expandido" (el bloque masivo).

## [2026-06-17 17:50:00] Mockups SVG y CorrecciÃ³n de Bugs
- CreaciÃ³n de mockups vectoriales de la interfaz grÃ¡fica vacÃ­a (modo escritorio y mÃ³vil, tanto en claro como en oscuro) para documentaciÃ³n (`doc/svg/ui_mockup_...`).
### CorrecciÃ³n de Errores (Bugfixes)
- **Carga de Demos:** Se solucionÃ³ el problema de scope global en `main.js` que impedÃ­a cargar dinÃ¡micamente los datos de demostraciÃ³n (se estandarizÃ³ a `window.loadDemoData`).
- **Barra de Capacidad:** Se reemplazÃ³ el uso de `transform` por `width` en `layout.css` para el `.cap-bar-fill`, permitiendo que la barra de progreso se visualice correctamente de nuevo.

## [2026-06-17 14:11:00] CorrecciÃ³n Visual de Barras de Capacidad (EstadÃ­sticas)
### CorrecciÃ³n de Errores (Bugfixes)
- **Barras de Progreso:** Se corrigiÃ³ un problema visual donde las barras de capacidad del panel de EstadÃ­sticas ("Rack Capacity" y "Power") siempre aparecÃ­an vacÃ­as. El motor de actualizaciÃ³n `renderStats()` intentaba escalar un elemento que tenÃ­a un ancho inicial del 0% por defecto (`style.width="0%"` combinado con `transform: scaleX`). Se reescribiÃ³ la lÃ³gica para que el progreso modifique directamente la propiedad `width` (porcentaje de la barra), haciendo que la animaciÃ³n fluya correctamente.

## [2026-06-17 13:36:00] Correcciones en Limpiar Proyecto, Cargar Demos y PWA CachÃ©
### CorrecciÃ³n de Errores (Bugfixes)
- **CachÃ© PWA:** Se incrementÃ³ la versiÃ³n del `CACHE_NAME` en `js/service/service-worker.js` a `v1.1` y se aÃ±adiÃ³ `fileManager.js` a la lista de recursos fuera de lÃ­nea. Esto fuerza a los navegadores a invalidar el cachÃ© antiguo "Cache-First" y descargar los Ãºltimos cambios de cÃ³digo de la interfaz para que los usuarios puedan ver las actualizaciones inmediatamente tras recargar.
- **Cargar Demos:** Se reescribiÃ³ la lÃ³gica del botÃ³n `menu-demo` (`Cargar demos`) haciÃ©ndola asÃ­ncrona. Ahora el sistema espera correctamente a que el manejador de archivos (File System API) termine de guardar la copia de seguridad antes de inyectar y ejecutar `demoData.js`, solucionando el problema donde la funcionalidad habÃ­a dejado de responder.
- **Limpieza de Proyecto:** Al usar la opciÃ³n `Limpiar proyecto` (`ðŸ§¹`), ahora se resetea internamente el manejador de archivos y se actualiza la interfaz para mostrar "Nuevo Proyecto" en la cabecera, desvinculando la sesiÃ³n limpia del archivo anterior para evitar sobreescrituras accidentales por el autoguardado.

## [2026-06-17 13:30:00] ImplementaciÃ³n de File System Access API y Autoguardado
### Sistema de Guardado
- **Apertura Directa:** Se reemplazÃ³ el tradicional campo `<input type="file">` oculto por la API nativa `window.showOpenFilePicker`. Ahora la aplicaciÃ³n puede abrir archivos directamente del sistema y conservar el "handle" (manejador) para sobreescribir los cambios de manera transparente.
- **Autoguardado Inteligente:** Se implementÃ³ un ciclo de `autoSave` con *debounce* (3 segundos). Si el usuario ya ha dado permisos de escritura al archivo en la sesiÃ³n actual, la aplicaciÃ³n guardarÃ¡ automÃ¡ticamente cualquier cambio (arrastre, conexiÃ³n, ediciÃ³n) en el disco duro sin ventanas emergentes.
- **Guardar como...:** Se aÃ±adiÃ³ la opciÃ³n "Guardar como..." en el menÃº de proyecto, permitiendo bifurcar proyectos usando `window.showSaveFilePicker()`.
- **IntegraciÃ³n de Fallback:** Para los navegadores sin soporte completo de esta API web moderna (como Firefox o Safari), el sistema vuelve de manera elegante al mÃ©todo antiguo de descarga/subida clÃ¡sica (blob JSON).
- **Indicador de Proyecto Activo:** Se aÃ±adiÃ³ al diseÃ±o del encabezado el nombre del archivo activo (`#project-filename`) para mejorar la conciencia situacional del usuario.

## [2026-06-16 12:05:00] ReestructuraciÃ³n Documental, ExtracciÃ³n SVG y RediseÃ±o de Manual
- **Limpieza de CÃ³digo HTML (ExtracciÃ³n SVG):** Se extrajeron exitosamente 14 diagramas SVG que se encontraban incrustados en lÃ­nea dentro de `arquitectura_2.html` y se convirtieron en archivos independientes guardados en la carpeta `doc/html/img/Arq2/`. Esto reduce significativamente el peso del HTML base y permite el cacheo independiente de las imÃ¡genes.
- **Correcciones XML en Vectores:** Se solventaron errores de sintaxis en los archivos SVG extraÃ­dos (caracteres `&` sin escapar y etiquetas `<defs>` faltantes para marcadores de flechas) garantizando su perfecta renderizaciÃ³n en navegadores estrictos.
- **Nueva SecciÃ³n de SegmentaciÃ³n:** Se aÃ±adiÃ³ al documento de arquitectura una secciÃ³n ilustrada llamada "Estructura de Directorios y SegmentaciÃ³n". Esta incluye un nuevo diagrama vectorial (`directory_structure.svg`) y explica los beneficios (Mantenibilidad, ColaboraciÃ³n Eficiente, ReutilizaciÃ³n) de aislar la lÃ³gica de UI (`js/ui/`) del estado global (`js/store.js`).

### Mejoras de Interfaz (UI/UX) en el Manual de Usuario
- **Overhaul EstÃ©tico (Glassmorphism & Cards):** Se reescribiÃ³ por completo la hoja de estilos del manual de usuario (`manual.css`). Se adoptÃ³ una estÃ©tica moderna que hace juego con la aplicaciÃ³n principal, utilizando fondos oscuros con "blur", resaltados de neÃ³n sutiles (accent glow) y limitando el ancho mÃ¡ximo de lectura para reducir la fatiga visual.
- **ModernizaciÃ³n TipogrÃ¡fica:** Se integraron las fuentes profesionales `Outfit` (lectura general) y `JetBrains Mono` (etiquetas de cÃ³digo tÃ©cnico) mediante Google Fonts, reemplazando la tipografÃ­a genÃ©rica del sistema.
- **Tarjetas de CaracterÃ­sticas (Feature Grid):** Se desarrollÃ³ un script inteligente que transformÃ³ automÃ¡ticamente todas las listas de viÃ±etas densas e ilegibles (`ul.content-list`) en grillas modernas de tarjetas (`div.feature-grid`). Esto mejora dramÃ¡ticamente la experiencia de escaneo y lectura del manual.
- **ActualizaciÃ³n de Contenido y Rutas:** Se repararon todos los enlaces rotos de imÃ¡genes del manual apuntando a sus nuevas ubicaciones categorizadas (`desk/`, `mobil/`, `Arq/`). AdemÃ¡s, se documentaron oficialmente las Ãºltimas funciones agregadas: Los *Atajos de Estado VacÃ­o* (Empty Canvas Shortcuts) y las opciones extendidas del *MenÃº Contextual* de los Gabinetes.

## [2026-06-16 10:05:00] CorrecciÃ³n de Bug Visual (Inputs & Selects) y Accesos Directos
### Mejoras de Interfaz (UI/UX)
- **CorrecciÃ³n de Recorte Vertical:** Se ajustÃ³ el `padding` (a `0 8px`) y el `line-height` de todos los elementos `input` y `select` globales en `layout.css`. Esto soluciona un problema donde los textos internos aparecÃ­an cortados o empujados hacia abajo despuÃ©s de que la altura general se hubiera estandarizado a 24px en el commit anterior.
- **ActualizaciÃ³n Documental:** Se reflejaron estas nuevas reglas de relleno (padding) y altura de lÃ­nea estricta en el manifiesto principal `DESIGN.md` para evitar recortes futuros.
- **Accesos Directos en Canvas:** Se aÃ±adieron botones interactivos para "+ Rack" en el estado vacÃ­o de la Vista FÃ­sica. AdemÃ¡s, el botÃ³n secundario fue reemplazado por el botÃ³n "âš¡ Agregar Equipo" (UbicaciÃ³n RÃ¡pida asistida) posicionado estratÃ©gicamente en la cabecera de la secciÃ³n "Equipos de Piso / PerifÃ©ricos" para un acceso mÃ¡s intuitivo. TambiÃ©n, cuando hay racks instalados, aparece una tarjeta transparente al final de la fila con borde punteado para agregar el siguiente gabinete rÃ¡pidamente.
- **Botones de AcciÃ³n en Rack:** Se ampliaron las opciones en la cabecera de cada rack, agregando el acceso directo a la UbicaciÃ³n RÃ¡pida (âš¡ Agregar Equipo) y la nueva opciÃ³n "Limpiar Gabinete" (ðŸ§¹), la cual requiere confirmaciÃ³n para evitar la eliminaciÃ³n accidental de todo el contenido del rack. Para mantener la interfaz limpia y minimalista, todas estas acciones (incluyendo Editar y Eliminar) se agruparon dentro de un nuevo **menÃº desplegable (â‹®)** posicionado junto al botÃ³n de rotar (flip).
### Mantenimiento
- **ActualizaciÃ³n de INSTRUCTIONS.md:** Se actualizÃ³ la regla de Flujo de Trabajo para establecer formalmente el "Registro Continuo" en el Changelog y requerir permiso explÃ­cito del usuario para ejecutar los respaldos en Git, evitando historiales inflados con micro-commits.

## [2026-06-16 09:48:00] RefactorizaciÃ³n Modular (CSS, Modales y TopologÃ­a)
### Mejoras de Arquitectura
- ModularizaciÃ³n de `style.css` (~900 lÃ­neas) en componentes especializados (variables, layout, rack, faceplates, modals, panels, misc) e importaciÃ³n unificada.
- DivisiÃ³n de `js/ui/modals.js` en submÃ³dulos funcionales (RackModal, DeviceModal, CableModal, etc.) para mejorar la mantenibilidad de las ventanas flotantes.
- RefactorizaciÃ³n de `js/ui/topology.js` adoptando el patrÃ³n Modelo-Vista-Controlador (MVC), aislando el estado (`TopologyState`), los eventos (`TopologyEvents`), los cÃ¡lculos lÃ³gicos (`TopologyLayout`) y la capa visual del canvas (`TopologyRenderer`).
- ActualizaciÃ³n de `index.html` para orquestar la carga de todos los nuevos mÃ³dulos generados sin romper dependencias (incluyendo el intacto `rack.js`).
- ReorganizaciÃ³n de las imÃ¡genes de arquitectura del manual en carpetas mÃ¡s estructuradas (`doc/html/img/Arq/` y `doc/html/img/ui/`).

## [2026-06-16 07:18:44] EstandarizaciÃ³n a 24px, DESIGN.md YAML y Soporte Claro en Rack
### Mejoras de Interfaz (UI/UX)
- CorrecciÃ³n matemÃ¡tica de densidad: Se redujo la altura estandarizada de todos los controles interactivos de 32px a **24px** (botones, pestaÃ±as, bÃºsquedas) para consolidar la estÃ©tica "IDE-grade".
- Reescritura del manifiesto `DESIGN.md` adaptÃ¡ndolo al estÃ¡ndar profesional `awesome-design-md` (YAML Frontmatter), prohibiendo explÃ­citamente estilos generativos "AI Slop".
- Purga masiva de colores estÃ¡ticos (`#090d17`, `#0a1525`, etc.) en el chasis fÃ­sico del Rack (vistas frontal y trasera). Ahora toda la estructura metÃ¡lica y ranuras responden a variables CSS (`--bg-card1`, `--border`), permitiendo un despliegue perfecto del **Modo Claro** sin deformar el hardware instalado.

## [2026-06-16 00:51:30] Refinamiento UI/UX Premium & DESIGN.md
### Mejoras (UI/UX)
- NormalizaciÃ³n matemÃ¡tica de altura de controles interactivos (botones, tabs, inputs) a \`32px\` con paddings estandarizados.
- CreaciÃ³n de \`DESIGN.md\` en la raÃ­z para dictar el ADN visual del proyecto (fuentes, escala de color, evitar 'AI Slop').
- ReducciÃ³n global de escala tipogrÃ¡fica (2px) para lograr densidad visual estilo IDE.
- Ocultamiento forzado (\`style="display:none !important;"\`) del input nativo de archivos en el HTML principal.
- Limpieza profunda de archivos basura y copias de seguridad obsoletas (\`.backup\`, \`.kilo\`, \`scratch\`).

# Registro de Cambios (Changelog)

## [2026-06-15 20:25] SoluciÃ³n a Bugs de Baja Prioridad (Pulido)
* **BUG-12 (LÃ­mite de Notificaciones):** Se implementÃ³ un lÃ­mite de 5 notificaciones activas en pantalla en `utils.js` para evitar inundaciÃ³n (flooding) de notificaciones.
* **BUG-13 (FOUC del Tema):** Se moviÃ³ la inicializaciÃ³n de `data-theme` al `<head>` de `index.html` mediante un script sÃ­ncrono para eliminar el "flash" blanco que ocurrÃ­a al cargar la app en modo oscuro.
* **BUG-14 (Filtro de Equipos de Piso):** El selector de "Equipos sin Gabinete" en el modal de conexiones ahora distingue entre equipos huÃ©rfanos que sÃ­ requieren rack (`orphanedRack`) y perifÃ©ricos de piso (`orphanedFloor`), mejorando la coherencia de la interfaz.
* **BUG-15 (Historial de Renombrado):** Renombrar una sala (F2) ahora incluye correctamente llamadas a `store.snapshot()` y `store._save()`, permitiendo que el cambio de nombre pueda deshacerse (`Ctrl+Z`).
* **BUG-16 (ExportaciÃ³n CSV):** Se corrigiÃ³ la lÃ³gica de generaciÃ³n del formato CSV en las tablas y en la exportaciÃ³n de inventario (`tables.js` y `modals.js`). Ahora, los textos que contengan comas (ej: Notas, nombres largos) se entrecomillan correctamente, evitando que las columnas se desfasen.
* **BUG-17 (Eventos en Equipos de Piso):** Se aÃ±adiÃ³ `draggable="true"` a las tarjetas de dispositivos de piso (`.floor-device-card`) y se vincularon a `bindRackEvents` para habilitar el arrastre, doble clic (ediciÃ³n) y clic derecho (menÃº contextual), los cuales antes estaban inoperantes.
* **BUG-18 (Overflow en TopologÃ­a):** En el motor de dibujo `topology.js`, la variable continua de tiempo `flowT` (utilizada para animar los paquetes por las conexiones) ahora aplica mÃ³dulo 1 (`% 1`) en cada frame, evitando el potencial desbordamiento de punto flotante tras miles de horas de uso continuo.
## [2026-06-15 19:20] SoluciÃ³n Final a Bugs de Prioridad Media
* **BUG-11 (Congelamiento por Error de PNG):** Se incorporÃ³ un sistema de guarda `try/finally` al exportador PNG topolÃ³gico. Si la cÃ¡mara detecta un fallo al renderizar nodos huÃ©rfanos, el sistema asegura restaurar todas las variables globales y el canvas en la pantalla principal antes de abortar. Se acabÃ³ el congelamiento "pantalla blanca" permanente.
* **BUG-07 (Doble renderizado al cambiar sala):** En el motor de vistas `main.js`, el evento `changeRoom` ahora llama estrictamente a `initTopoPositions()` si estÃ¡s activamente en la pestaÃ±a de TopologÃ­a. Esto previene un desfasamiento donde los equipos de la sala nueva no aparecÃ­an o hacÃ­an titilar la vista.
## [2026-06-15 19:14] CorrecciÃ³n de ValidaciÃ³n y Formularios
* **BUG-08 (ValidaciÃ³n IP Estricta):** Se modificÃ³ la expresiÃ³n regular de validaciÃ³n de direcciones IP en la Tabla de Inventario y en la ventana de EdiciÃ³n. Anteriormente permitÃ­a trÃ­os de nÃºmeros hasta el 999; ahora exige de forma estricta el estÃ¡ndar `0-255` para los 4 octetos, evitando que se guarden IPs falsas en el JSON.
* **BUG-09 (ProtecciÃ³n XSS en Celdas):** (Resuelto preventivamente) La ediciÃ³n rÃ¡pida en celdas de la tabla ya procesa de forma segura carÃ¡cteres especiales como las comillas (`"`) mediante un filtrado `escapeHTML()`, previniendo que se rompa la vista.
## [2026-06-15 18:09] CorrecciÃ³n de Integridad de Datos (Bugs de Prioridad Alta y Media)
* **BUG-06 (Conexiones Fantasma al Eliminar Salas):** Se solucionÃ³ un defecto crÃ­tico donde la funciÃ³n `deleteRoom()` dejaba conexiones ("cables") huÃ©rfanas apuntando a equipos que ya no existÃ­an. Ahora, el sistema recolecta en cascada todos los Gabinetes y Equipos (incluidos los de piso) de la sala a borrar, y purga rigurosamente cualquier conexiÃ³n vinculada a ellos antes de eliminarlos.
* **BUG-10 (ColisiÃ³n Frontal/Trasera en Racks):** Se reparÃ³ el motor lÃ³gico de colisiones `canPlace()`. Anteriormente, el algoritmo ignoraba la cara del gabinete (`mountSide`), impidiendo instalar un servidor en el lado trasero si el lado frontal estaba ocupado. Ahora la lÃ³gica y la interfaz de "InstalaciÃ³n RÃ¡pida" reconocen los lados Frontal y Trasero de forma totalmente independiente.
## [2026-06-15 17:59] GeneraciÃ³n de IDs Segura y UX en Historial
* **BUG-03 (ColisiÃ³n de IDs):** Se reescribiÃ³ la funciÃ³n `uid()` en `js/utils.js` para utilizar `crypto.randomUUID()` nativo del navegador, extrayendo 16 caracteres hexadecimales para generar identificadores de hardware. Esto elimina prÃ¡cticamente cualquier riesgo de colisiÃ³n al clonar gabinetes masivos o arrastrar cientos de equipos rÃ¡pidamente.
* **U-1 (UX en Barra de Herramientas):** Se agregaron contadores numÃ©ricos dinÃ¡micos en tiempo real a los botones de Deshacer y Rehacer (e.g., `â†© 3` / `â†ª 1`). Esto mejora la retroalimentaciÃ³n visual permitiendo al usuario saber exactamente cuÃ¡ntos pasos tiene almacenados en su pila de historial.
## [2026-06-15 17:54] CorrecciÃ³n de Fuga de Memoria y Modo Rendimiento
* **BUG-04 (Fuga de Memoria):** Se solucionÃ³ una grave fuga de memoria (Memory Leak) en el sistema reactivo (`js/store.js`). Se implementÃ³ un cachÃ© local mediante `WeakMap` (`_proxyCache`) para reciclar instancias del Proxy. Esto evita la generaciÃ³n de miles de objetos descartables por segundo durante el ciclo de lectura de `drawTopo` a 60fps, estabilizando drÃ¡sticamente el consumo de RAM.
* **Modo Rendimiento (Interruptor de Animaciones):** Se transformÃ³ el punto de estado de "Sistema operativo" (esquina superior derecha) en un interruptor activo para el Modo Rendimiento. Al hacerle clic, apaga globalmente todas las transiciones, iluminaciones (glow) y animaciones CSS del proyecto a travÃ©s de la clase `no-animations`, y adicionalmente congela el motor de partÃ­culas JavaScript sobre los cables topolÃ³gicos (`flowT`).
## [2026-06-15 17:35] Modo Dios y Mejoras en TopologÃ­a
* **Modo Dios (Seguridad Visual):** Se implementÃ³ un alternador global en el menÃº principal (`ðŸ‘� Modo Dios: Revelar Claves`) para censurar u ocultar masivamente las contraseÃ±as de los equipos. Por defecto, todas las contraseÃ±as se renderizan como `â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢` en Tooltips, HUD TopolÃ³gico, Tablas de Inventario y Modal de EdiciÃ³n, garantizando seguridad visual contra mirones.
* **ExportaciÃ³n Segura de CSV/Excel:** La rutina de exportaciÃ³n de inventario fue mejorada para respetar el Modo Dios; si el modo estÃ¡ apagado, las contraseÃ±as se omiten/censuran en el reporte descargado.
* **Color de Servidores:** Se actualizÃ³ el color representativo de la clase "Servidor" del azul claro original a Esmeralda (`#10b981`) para mejor diferenciaciÃ³n en la TopologÃ­a, CatÃ¡logo y Vista FÃ­sica.
* **Visibilidad de Iconos:** Se corrigiÃ³ un error en el lienzo topolÃ³gico que impedÃ­a la visualizaciÃ³n de los iconos internos debido a superposiciÃ³n de colores (falta de restablecimiento del `fillStyle` a blanco).

## [2026-06-15 16:45] DocumentaciÃ³n de Arquitectura de Inicio
* **DocumentaciÃ³n TÃ©cnica:** Se agregÃ³ una nueva secciÃ³n de "InicializaciÃ³n y Carga de Datos" a los manuales (`manual.html` y `TECHNICAL_DOCS.md`) para explicar cÃ³mo funciona la comprobaciÃ³n del `localStorage` frente al arranque en estado en blanco, y los beneficios arquitectÃ³nicos de desacoplar e inyectar de manera dinÃ¡mica (lazy loading) los datos de demostraciÃ³n de `demoData.js`.

## [2026-06-15 16:35] OptimizaciÃ³n de Arranque y ExportaciÃ³n de Equipos de Piso
* **Arranque en Blanco:** Se modificÃ³ la inicializaciÃ³n en `store.js` y `index.html` para que el proyecto inicie con un estado limpio (una sola sala vacÃ­a) por defecto, en lugar de cargar datos fijos, mejorando la experiencia del nuevo usuario.
* **Carga DinÃ¡mica de Demostraciones:** Se eliminÃ³ la dependencia bloqueante de `demoData.js` en el arranque. Ahora, el script se inyecta dinÃ¡micamente (`loadScript`) Ãºnicamente cuando el usuario hace clic en "âœ¨ Cargar demos", ahorrando memoria y tiempo de carga.
* **Renderizado de Equipos de Piso:** Se corrigiÃ³ `rack.js` para que la secciÃ³n "Equipos de Piso / PerifÃ©ricos" se renderice correctamente en la vista fÃ­sica de la sala, incluso si esta no contiene ningÃºn gabinete.
* **ExportaciÃ³n PNG de Equipos de Piso:** Se aÃ±adiÃ³ la funciÃ³n `exportFloorToPNG()` en `modals.js` y se actualizÃ³ el modal de exportaciÃ³n para permitir generar imÃ¡genes PNG individuales de todos los equipos de piso de una sala.

## [2026-06-10 08:02] DocumentaciÃ³n y GrÃ¡ficos de Atomic Design
* **SecciÃ³n de DiseÃ±o AtÃ³mico:** AdiciÃ³n del nuevo capÃ­tulo interactivo en el manual HTML (`doc/html/manual.html`) y en la documentaciÃ³n tÃ©cnica Markdown (`doc/md/TECHNICAL_DOCS.md`), detallando el mapeo del proyecto a los 5 niveles de la metodologÃ­a.
* **GrÃ¡ficos Vectoriales de EvoluciÃ³n:** CreaciÃ³n de diagramas SVG individuales representando Ã�tomo, MolÃ©cula, Organismo, Plantilla y PÃ¡gina, ademÃ¡s de la infografÃ­a consolidada de esferas (`atomic_design_spheres.svg`).

## [2026-06-10 02:50] ReestructuraciÃ³n Funcional de DocumentaciÃ³n e InfografÃ­as
* **Estructura Documental Funcional:** RefactorizaciÃ³n de `USER_MANUAL.md` e `index.html` para unificar las explicaciones de escritorio y mÃ³vil bajo cada secciÃ³n funcional (GestiÃ³n de Salas, Equipos, TopologÃ­a, etc.), eliminando el capÃ­tulo aislado de Modo MÃ³vil.
* **MenÃº MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial `ui-mobile-menu.svg` mostrando el menÃº hamburguesa.
* **InfografÃ­a de Arquitectura:** CreaciÃ³n de `desktop-vs-mobile-architecture.svg` detallando las diferencias de flujos de trabajo (Drag & Drop vs UbicaciÃ³n RÃ¡pida Asistida, paneles fijos vs off-canvas).
* **InfografÃ­a de Ã�reas:** CreaciÃ³n de `desktop-vs-mobile-areas.svg` comparando el lienzo panorÃ¡mico frente a las pestaÃ±as de salas deslizables en mÃ³viles.

## [2026-06-10 02:45] Modales MÃ³viles de Sala y ConexiÃ³n e Ilustraciones Vectoriales
* **Diagrama de Modal de Nueva Sala MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-room.svg` representando el modal de creaciÃ³n de salas en la vista vertical mÃ³vil.
* **Diagrama de Modal de ConexiÃ³n MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-connection.svg` representando el modal de trazado de conexiones de red en la vista vertical mÃ³vil.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n de los nuevos diagramas en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:40] Formulario de Equipos MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de Formulario de Equipos MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-modal-device.svg` que representa la interfaz del modal de registro/ediciÃ³n de dispositivos adaptado a la vista vertical mÃ³vil.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:35] Inventario MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de Inventario MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-inventory.svg` que representa la tabla de inventario expandida mediante un panel deslizable (drawer) en dispositivos mÃ³viles, mostrando las columnas y etiquetas adaptadas.
* **IntegraciÃ³n en Manuales:** SincronizaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:30] TopologÃ­a MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de TopologÃ­a MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-topology.svg` que representa fielmente el lienzo de la topologÃ­a de red en dispositivos mÃ³viles, mostrando las salas apiladas verticalmente y los enlaces de cableado.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:25] MenÃº de Proyecto MÃ³vil e IlustraciÃ³n Vectorial
* **Diagrama de MenÃº de Opciones MÃ³vil:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-menu.svg` que representa fielmente la interfaz del menÃº de proyecto desplegable en dispositivos mÃ³viles (Abrir, Guardar, Limpiar proyecto, Cargar demos, Modo Claro, ImportaciÃ³n/ExportaciÃ³n).
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`).

## [2026-06-10 02:20] Diagrama de CatÃ¡logo y EstadÃ­sticas MÃ³viles (Off-Canvas)
* **Diagrama de CatÃ¡logo y EstadÃ­sticas MÃ³viles:** CreaciÃ³n de la ilustraciÃ³n vectorial nativa `ui-mobile-catalog.svg` que representa fielmente la interfaz del panel lateral off-canvas en dispositivos mÃ³viles, incluyendo la cuadrÃ­cula de estadÃ­sticas (racks, dispositivos, unidades U y conexiones), barras de progreso, botones de acciÃ³n rÃ¡pida y el catÃ¡logo de dispositivos.
* **IntegraciÃ³n en Manuales:** VinculaciÃ³n e integraciÃ³n del nuevo diagrama en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario Markdown (`doc/md/USER_MANUAL.md`) explicando la funcionalidad del menÃº off-canvas.

## [2026-06-10 01:40] IntegraciÃ³n de la DocumentaciÃ³n del Orquestador e Historial Reactivo
* **DocumentaciÃ³n del Modo MÃ³vil (Responsive):** CreaciÃ³n e integraciÃ³n del diagrama detallado de la consola en modo mÃ³vil (`ui-mobile.svg`), e inclusiÃ³n de una subsecciÃ³n de diseÃ±o mÃ³vil adaptativo en el manual interactivo HTML (`doc/html/manual.html`) y en el manual de usuario (`USER_MANUAL.md`).
* **IconografÃ­a en el Manual y Docs:** IntegraciÃ³n del logotipo oficial del sistema (`icon.svg`) en la cabecera, favicon y sidebar del manual interactivo HTML y de las especificaciones de la documentaciÃ³n tÃ©cnica.
* **RediseÃ±o del Mapa ArquitectÃ³nico Global:** CreaciÃ³n de una versiÃ³n mucho mÃ¡s amplia (1200x850), completa y detallada de la arquitectura general del sistema (`arquitectura.svg`), incorporando iconos visuales para cada mÃ³dulo, integraciones de archivos y leyendas descriptivas del flujo.
* **ExplicaciÃ³n GrÃ¡fica del AlmacÃ©n Reactivo:** CreaciÃ³n e integraciÃ³n del diagrama explicativo del store reactivo, Proxy ES6, auto-guardado en localStorage e historial (Undo/Redo) (`store-funcionamiento.svg`).
* **ExplicaciÃ³n GrÃ¡fica del Orquestador:** CreaciÃ³n e integraciÃ³n del diagrama detallado sobre la estructura y funcionamiento del orquestador central en la arquitectura reactiva (`orquestador-funcionamiento.svg`).
  * *CorrecciÃ³n:* Solucionado bug de solapamiento de texto encimado en la columna de "MÃ“DULOS RECEPTORES" corrigiendo las coordenadas `y` de posicionamiento absoluto del SVG.
* **ActualizaciÃ³n del Manual Interactivo HTML:** AÃ±adidas las secciones explicativas y vinculados los nuevos diagramas SVG en `doc/html/manual.html` para la secciÃ³n de arquitectura del almacÃ©n y renderizado.
* **ActualizaciÃ³n de DocumentaciÃ³n TÃ©cnica:** IncorporaciÃ³n del flujo de intercepciÃ³n del Proxy, el guardado persistente, el historial de snapshots y el despacho selectivo de eventos en `doc/md/TECHNICAL_DOCS.md`.


## [2026-06-09 20:23] Manual Interactivo HTML y Diagramas TÃ©cnicos
* **Manual Interactivo SPA:** MigraciÃ³n completa de la documentaciÃ³n tÃ©cnica y de usuario de formato texto plano a un portal web interactivo (`doc/html/manual.html`) con navegaciÃ³n lateral dinÃ¡mica y diseÃ±o adaptado en modo oscuro.
* **GrÃ¡ficos TÃ©cnicos SVG:** CreaciÃ³n e integraciÃ³n de diagramas vectoriales nativos explicativos:
  * AnatomÃ­a del Rack (Unidades U frontal/trasero).
  * Nodos de topologÃ­a y cableado de red.
  * Arquitectura reactiva del almacÃ©n central (`store.js`, `main.js`, `js/ui/`).
  * Funcionamiento de los lienzos (Lienzo DOM fÃ­sico vs. Canvas 2D topolÃ³gico).
  * CatÃ¡logo de equipos, eventos de arrastre y asistente de ubicaciÃ³n rÃ¡pida.
  * Flujo de actualizaciÃ³n DOM y despacho selectivo (`interfaz-funcionamiento.svg`).
  * Mapa de directorios y estructura modular del proyecto.
  * Sistema y flujos de exportaciÃ³n (imÃ¡genes PNG HD, tablas Excel/CSV y copias JSON).


## [2026-06-09 15:50] RediseÃ±o del Modal de Equipos
* **DiseÃ±o Compacto y Agrupado:** Se reorganizÃ³ la vista del modal "Nuevo/Editar Equipo" agrupando lÃ³gicamente Identidad, UbicaciÃ³n, Red, AutenticaciÃ³n y EnergÃ­a.
* **Cuadros de ActivaciÃ³n (Toggles):** Se aÃ±adieron casillas de verificaciÃ³n para activar/desactivar dinÃ¡micamente los mÃ³dulos de Red, Usuario y EnergÃ­a, evitando guardar datos innecesarios en equipos "pasivos" o sin gestiÃ³n.
* **SeparaciÃ³n de Tomas ElÃ©ctricas:** Se dividiÃ³ el campo de energÃ­a en "Tomas de Entrada" y "Tomas de Salida" para permitir modelar PDUs o UPSs que alimentan otros equipos, incluyendo tooltips explicativos.
* **Selector Explicito Rack/Piso:** Se aÃ±adiÃ³ un selector principal para alternar explÃ­citamente entre "Gabinete (Rack)" y "Equipo de Piso", controlando dinÃ¡micamente las opciones de tipo de equipo y ocultando el TamaÃ±o (U) cuando es necesario.

## [2026-06-09 14:52] OptimizaciÃ³n de Espacio en MÃ³vil
* **Barras de Herramientas mÃ¡s Compactas:** En la versiÃ³n mÃ³vil, las filas superiores (donde estÃ¡n las opciones de Vista FÃ­sica, TopologÃ­a y el control de zoom) ocupaban demasiado espacio vertical, restando Ã¡rea de trabajo. Se redujeron los mÃ¡rgenes, rellenos (paddings) y el tamaÃ±o de texto de estos botones especÃ­ficamente para pantallas tÃ¡ctiles, logrando un diseÃ±o mucho mÃ¡s esbelto y proporcionando mÃ¡s espacio para visualizar los gabinetes.

## [2026-06-09 14:33] Mejoras Visuales en Panel Lateral
* **Filtros Visibles y Deslizables:** Se restaurÃ³ el comportamiento de deslizamiento horizontal (scroll) en las pestaÃ±as de filtro del catÃ¡logo (Todos, Servers, Red, etc.). Para mantener el diseÃ±o limpio y libre de mÃºltiples barras (scrollbars) invasivas, se han ocultado visualmente las barras horizontales en todas las Ã¡reas de pestaÃ±as superiores. Sin embargo, ahora se puede utilizar la **rueda del ratÃ³n (mouse wheel)** de forma natural sobre los filtros para deslizarlos de izquierda a derecha sin esfuerzo en el modo de escritorio.

## [2026-06-09 14:24] CorrecciÃ³n de Guardado de Nuevos Equipos
* **Nuevas Plantillas de CatÃ¡logo:** Se solucionÃ³ un bug en el que al presionar "+ Agregar Equipo" y llenar el formulario, la informaciÃ³n se perdÃ­a si no era un equipo de piso. Ahora, el sistema guarda el nuevo equipo como plantilla en el CatÃ¡logo y abre automÃ¡ticamente el Asistente de UbicaciÃ³n RÃ¡pida (âš¡) para instalarlo inmediatamente en el rack deseado.

## [2026-06-09 14:18] Nuevos Campos de Equipo: Marca y Modelo
* **Datos de Equipo:** Se aÃ±adieron los campos "Marca" y "Modelo" a la estructura de datos de los equipos (devices).
* **Modal de EdiciÃ³n:** Se actualizÃ³ el formulario de ediciÃ³n de equipos (`#modal-device`) para incluir las nuevas entradas de Marca y Modelo.
* **Tabla de Inventario:** Se agregaron las columnas "Marca" y "Modelo" a la tabla de inventario en el panel inferior, permitiendo visualizaciÃ³n y ediciÃ³n en lÃ­nea.
* **ExportaciÃ³n de Datos:** Se actualizÃ³ la exportaciÃ³n a CSV y a Excel para que incluyan automÃ¡ticamente las nuevas columnas de Marca y Modelo.

## [2026-06-09 12:53] Mejoras Visuales en EstadÃ­sticas y TopologÃ­a
* **Tooltips Personalizados:** Se corrigiÃ³ el recorte visual (`overflow: hidden`) en los botones del panel de estadÃ­sticas, permitiendo mostrar los tooltips personalizados hacia abajo para que no interfieran con otros elementos visuales.
* **Resaltado de Sala Activa:** En la vista de TopologÃ­a, la sala actualmente seleccionada ahora se resalta con un contorno de color blanco para facilitar su identificaciÃ³n en el lienzo.

## [2026-06-09 12:35] ReorganizaciÃ³n de Cabecera y Tooltips Nativos
* **Tooltips en EstadÃ­sticas:** Se aÃ±adieron atributos `title` nativos a los botones de estadÃ­sticas en el panel lateral (y posteriormente se reemplazaron por tooltips personalizados).
* **ReubicaciÃ³n de PestaÃ±as de Vista:** Se movieron los botones "Vista FÃ­sica" y "TopologÃ­a" a la cabecera principal de la aplicaciÃ³n.
* **ReubicaciÃ³n de PestaÃ±as de Salas:** Se movieron las pestaÃ±as de selecciÃ³n de salas ("Data Center", "Edificio A2", etc.) a la barra de herramientas principal, despuÃ©s de los controles de zoom.
* **Fix MÃ³vil:** Se forzÃ³ el comportamiento del `flex-shrink` y `min-width` para los botones de la barra de herramientas principal, evitando el solapamiento en dispositivos mÃ³viles.


## [2026-06-07 19:55] OptimizaciÃ³n de TopologÃ­a de Red Demo
* **Estructura JerÃ¡rquica:** Se modificÃ³ `js/demoData.js` para aplicar una jerarquÃ­a de red realista. Ahora cada sala designa su primer switch como "Main Switch" (o de borde/agregaciÃ³n).
* **Enlaces Backbone:** Ãšnicamente los "Main Switch" de las salas secundarias se enlazan al "Core Switch" en el Data Center mediante un solo enlace de fibra Ã³ptica, reduciendo el desorden previo de interconexiones directas.
* **Equipos de Piso Localizados:** Los equipos distribuidos (cÃ¡maras, impresoras, APs) ahora se conectan de manera lÃ³gica al switch principal de su *propia* sala, en vez de enrutarse de forma irrealista a travÃ©s de todo el recinto hasta el Core Switch.



## [2026-06-07 16:37] ImplementaciÃ³n de Modo Claro

* **Modo Claro / Modo Oscuro:** Se implementÃ³ una paleta de colores alternativa (`[data-theme="light"]`) para soportar visualizaciÃ³n en Modo Claro manteniendo la identidad visual y asegurando alto contraste.

* **Toggle en MenÃº de Proyecto:** Se agregÃ³ la opciÃ³n "â˜€ï¸� Cambiar a Modo Claro" en el menÃº principal "Proyecto". El texto y la funciÃ³n se adaptan dinÃ¡micamente al estado actual del tema.

* **Persistencia del Tema:** La preferencia de tema elegido por el usuario se almacena localmente usando `localStorage` de manera que la aplicaciÃ³n carga directamente en el modo visual preferido.



## [2026-06-07 14:40] SimplificaciÃ³n de CatÃ¡logo

* **AgrupaciÃ³n de Acciones en CatÃ¡logo:** Se consolidaron los tres botones individuales (UbicaciÃ³n RÃ¡pida, Editar, Eliminar) de cada equipo en el panel del catÃ¡logo bajo un Ãºnico botÃ³n de opciones mÃºltiples ("â‹®"). Esto abre un menÃº contextual elegante, limpiando la interfaz visual y mejorando el uso del espacio.



## [2026-06-07 14:33] Correcciones de Interfaz y Experiencia en MÃ³viles

* **PestaÃ±as de Sala en MÃ³vil:** Se solucionÃ³ el problema donde el botÃ³n de cerrar sala ("âœ•") no aparecÃ­a en pantallas tÃ¡ctiles por depender del evento `hover`. Ahora es permanentemente visible en mÃ³viles (`@media (hover: none)`). AdemÃ¡s, se aÃ±adiÃ³ soporte para pulsaciÃ³n larga (`contextmenu`) permitiendo renombrar salas en celulares donde el doble clic no se detectaba correctamente.

* **Cierre AutomÃ¡tico del CatÃ¡logo MÃ³vil:** Se implementÃ³ una lÃ³gica (`closeMobileSidebar`) que oculta automÃ¡ticamente el menÃº lateral (catÃ¡logo) en modo mÃ³vil cada vez que el usuario abre los modales de "AÃ±adir a rack" (UbicaciÃ³n RÃ¡pida), "AÃ±adir Equipo" o "AÃ±adir Gabinete", evitando que el menÃº obstruya la vista del rack.

* **BotÃ³n ExplÃ­cito de Cierre:** Se agregÃ³ un botÃ³n visible ("âœ•") en la cabecera del panel de EstadÃ­sticas/CatÃ¡logo exclusivo para la vista mÃ³vil (`.mobile-only`), proveyendo una forma clara e intuitiva de colapsar el menÃº lateral.

* **Leyendas en EstadÃ­sticas:** Se reincorporaron pequeÃ±as etiquetas de texto descriptivo debajo de los iconos en el panel lateral de estadÃ­sticas para mayor claridad ("Gabinetes", "Equipos", "Capacidad U", "Conexiones").

* **Tooltips de Deshacer/Rehacer:** Se creÃ³ la clase modificadora CSS `.tooltip-bottom` y se aplicÃ³ a los botones de Deshacer/Rehacer en la barra superior. Esto corrige el problema en el que las leyendas emergentes se salÃ­an del Ã¡rea visible de la pantalla hacia arriba.



## [2026-06-07 13:04] Mejoras de UX MÃ³vil y Opciones de InserciÃ³n

* **Seguimiento DinÃ¡mico de Tooltips:** Se reescribiÃ³ la lÃ³gica de posicionamiento de las etiquetas flotantes (tooltips) para que sigan con precisiÃ³n al cursor del ratÃ³n (`mousemove`), mejorando sustancialmente la experiencia frente a la anterior ancla estÃ¡tica a la derecha del rack.

* **Soporte PWA MÃ³vil:** Se aÃ±adiÃ³ una capa de oscurecimiento global (`#mobile-overlay`) y menÃºs laterales tÃ¡ctiles (`off-canvas`) adaptados para pantallas pequeÃ±as, ademÃ¡s de deshabilitar los tooltips conflictivos en dispositivos tÃ¡ctiles puros.

* **Selector Frontal/Trasera en UbicaciÃ³n RÃ¡pida:** Se introdujo la opciÃ³n de seleccionar la cara de montaje ("Frontal" o "Trasera") dentro del flujo asistido de "UbicaciÃ³n RÃ¡pida" (`#modal-quick-placement`), asegurando paridad con el montaje por arrastre (`drag & drop`).

* **IconografÃ­a PWA (Logo):** Se reconstruyÃ³ el Ã­cono del sistema como SVG puro (`icon.svg`), optimizÃ¡ndolo para su uso como Ã­cono de aplicaciÃ³n y se enlazÃ³ de nuevo en todo el proyecto.



## [2026-06-06 21:28] Mejoras en ExportaciÃ³n PNG y Limpieza Visual

* **Ajuste de Zoom en Vista FÃ­sica:** Se corrigiÃ³ un problema de diseÃ±o Flexbox al alejar la vista fÃ­sica; ahora el contenedor principal expande dinÃ¡micamente su ancho base (`width: 100/z %`) relativo al nivel de escalado (`scale(z)`). Esto permite que mÃ¡s gabinetes fluyan y aprovechen todo el ancho disponible de la pantalla al hacer zoom out, en lugar de limitarse a la cuadrÃ­cula original.

* **ExportaciÃ³n PNG Dual:** Se refactorizÃ³ la funciÃ³n de exportaciÃ³n a PNG (`exportRackToPNG`). Ahora, si un gabinete contiene equipos en la vista trasera, el lienzo (Canvas) se expande automÃ¡ticamente y renderiza ambas caras (Frontal y Trasera) una al lado de la otra en una misma imagen, permitiendo reportes integrales.

* **Limpieza de Vista Trasera:** Se eliminÃ³ la repeticiÃ³n del nombre del gabinete en el encabezado de la "Vista Trasera" tanto en la interfaz de usuario como en las imÃ¡genes exportadas, logrando un diseÃ±o mÃ¡s minimalista y profesional.

* **ActualizaciÃ³n de DocumentaciÃ³n:** Se actualizaron `DOC_MANUAL_USUARIO.md` y `DOC_MANUAL_FUNCIONAMIENTO.md` para reflejar el comportamiento del nuevo sistema de renderizado doble y las vistas traseras.

* **ActualizaciÃ³n de IconografÃ­a:** Se limpiÃ³ el fondo azul de los logos e iconos PWA, dejÃ¡ndolos con transparencia, manteniendo la "Variante 2" (gradiente azul y borde cyan).

* **Gestor de Paquetes estricto:** Se implementÃ³ una directiva estricta de entorno mediante el `package.json` para bloquear el uso de `npm` o `yarn`, forzando el uso de `pnpm` como Ãºnico manejador de paquetes del proyecto.



## [2026-06-05 22:25] CorrecciÃ³n CrÃ­tica en Renderizado de Racks e Inventario

* **Fallo de Renderizado e Inventario:** Se corrigiÃ³ un `ReferenceError` en `js/ui/rack.js` relacionado con la restauraciÃ³n del estado de los gabinetes volteados (`flippedRacks`) al recargar la vista. Este error bloqueaba el renderizado de la tabla de inventario en el panel inferior.

* **Persistencia de Vista Trasera:** Se modificÃ³ la funciÃ³n `bindRackEvents` para que la vista trasera persista tras mover o agregar equipos, corrigiendo un comportamiento donde volvÃ­a forzosamente a la vista frontal.



## [2026-06-05 21:25] Montaje Independiente en Vista Trasera

* **Doble Lado de Rack**: La vista trasera ahora funciona como un rack independiente (`mountSide='rear'`), permitiendo montar equipos adicionales en las mismas U pero en la parte de atrÃ¡s del gabinete, ideal para organizadores de cables o PDUs.

* **Sistema de Drag & Drop por Lado**: Al arrastrar un equipo desde el catÃ¡logo hacia los slots de la cara trasera, este se guarda en el Store como "Trasero", evitando colisiones con los equipos de la parte delantera.

* **Interfaz y AnimaciÃ³n**: Botones "ðŸ”„ ATRÃ�S" y "ðŸ–¥ï¸� FRENTE" que activan una animaciÃ³n 3D (`rotateY 180Â°`). Cada lado del rack muestra su propio medidor de Us ocupadas.



## [2026-06-05 20:45] EdiciÃ³n de ConexiÃ³n por Doble Clic en TopologÃ­a

* **Doble clic sobre cable**: Al hacer doble clic sobre cualquier tramo de cable en la vista de TopologÃ­a, se abre directamente el modal de **Editar ConexiÃ³n** con todos los datos precargados (equipo origen/destino, puerto, tipo de cable y color).

* **DetecciÃ³n geomÃ©trica**: Se implementÃ³ un algoritmo de muestreo de curva BÃ©zier (30 segmentos) para detectar con precisiÃ³n si el clic aterrizÃ³ sobre un cable. Tolerancia de 10px en espacio del mundo.

* **Prioridad**: Si el doble clic cae sobre un nodo/equipo, se mantiene el comportamiento original (abrir modal de nueva conexiÃ³n). Solo cuando no hay nodo debajo se evalÃºan los cables.



## [2026-06-05 20:16] Mejoras de trazabilidad en Conexiones

* **UbicaciÃ³n en tabla de conexiones**: Se aÃ±adieron las columnas "Sala/Rack Origen" y "Sala/Rack Destino" a la tabla inferior de conexiones para identificar rÃ¡pidamente dÃ³nde estÃ¡ cada equipo sin depender Ãºnicamente de su nombre.

* **Modal de conexiÃ³n**: Se agregaron campos de solo lectura "UbicaciÃ³n Origen/Destino" que se actualizan dinÃ¡micamente en el modal al conectar equipos.

* **ExportaciÃ³n de datos**: Se actualizaron las funciones de exportaciÃ³n (CSV y Excel) para que tambiÃ©n incluyan las nuevas columnas de ubicaciÃ³n de origen y destino.

* **FunciÃ³n auxiliar**: Se implementÃ³ `getDeviceLocation(device)` en el core (`utils.js`) para resolver ubicaciones de forma global (corrigiendo una incompatibilidad previa de mÃ©todos).

* **Equipos de piso en datos de prueba**: Se aÃ±adieron conexiones a todos los equipos de piso en el Data Center (`js/demoData.js`) para validar visualmente la funcionalidad de las nuevas columnas.



## [2026-06-05 20:10] AplicaciÃ³n de DiseÃ±o de Red y VLANs

* **EstructuraciÃ³n de Salas y Racks**: Se actualizÃ³ la carga de datos de demostraciÃ³n (`js/demoData.js`) para implementar 3 salas principales (Data Center, Edificio A2, Edificio B1) y sus respectivos gabinetes (Racks 101-104, 201-203, 301-305).

* **SegmentaciÃ³n por VLAN**: Se implementÃ³ la propuesta de enrutamiento asignando direcciones IP fijas correspondientes a VLANs especÃ­ficas:

  * VLAN 10 (10.10.10.0/24) para switches de capa de acceso, Core y Firewall.

  * VLAN 20 (10.10.20.0/24) para las UPS de cada gabinete.

  * VLAN 30 (10.10.30.0/24) para Servidores (nodos distribuidos sistemÃ¡ticamente por rack).

  * VLAN 60, 70 y 80 para equipos de piso (CÃ¡maras, Impresoras y TelefonÃ­a IP).

  * Access Points en la red de administraciÃ³n (VLAN 10) proveyendo el trÃ¡fico corporativo y de invitados (VLAN 50, VLAN 90).



## [2026-06-05 19:56] Mejoras de UI y CorrecciÃ³n de Bugs

* **OptimizaciÃ³n visual de EstadÃ­sticas**: Se redujo el espacio ocupado por los datos de estadÃ­sticas en la barra lateral reemplazando el diseÃ±o de cuadrÃ­cula con texto por un diseÃ±o horizontal mÃ¡s compacto usando iconos vectoriales (Gabinetes, Equipos, Unidades U, Conexiones) y tooltips.

* **OptimizaciÃ³n de botones Deshacer/Rehacer**: Se eliminÃ³ el texto para ahorrar espacio; ahora muestran Ãºnicamente los Ã­conos (â†© y â†ª) con leyendas emergentes (tooltips) al pasar el cursor.

* **CorrecciÃ³n del desplazamiento de pestaÃ±as de sala**: Se aÃ±adiÃ³ un margen inferior (`padding-bottom`) en `.room-tabs` para prevenir que la barra de desplazamiento horizontal nativa superponga y bloquee los clics en los botones cuando hay mÃºltiples salas.

* **CorrecciÃ³n de cambio de sala**: Se solucionÃ³ un problema de distinciÃ³n de mayÃºsculas y minÃºsculas (case sensitivity) en `js/ui/catalog.js` donde el evento disparado al hacer clic en las pestaÃ±as (`room-tab-change`) era ignorado por el renderizador (`source.includes('Room')`), impidiendo que la vista fÃ­sica se actualizara correctamente. Se cambiÃ³ el nombre del evento a `changeRoom`.

- Fix: Componentes flotantes (modales, tooltips, mens) ajustados a var(--bg-panel) para soportar el modo claro.



- Fix: Componentes flotantes ajustados a var(--bg-panel) para soportar el modo claro.


## [2026-06-21 21:00:00] ReorganizaciÃ³n de Archivos y Ajustes UI
* **UbicaciÃ³n de Scripts Python:** Se agruparon todos los scripts .py dentro de una nueva carpeta .py para mantener la raÃ­z del proyecto limpia. Se actualizÃ³ INSTRUCTIONS.md reflejando esta regla.
* **OrganizaciÃ³n de Logs:** Se moviÃ³ el archivo logs_cambios.txt de la raÃ­z al directorio doc/log/.
* **CorrecciÃ³n de Iconos PWA:** Se corrigieron las rutas en index.html y json/manifest.json que apuntaban a icons/ en lugar de ssets/icons/, restaurando el favicon.
* **Panel de EstadÃ­sticas Colapsado:** Se modificÃ³ index.html para que el panel de estadÃ­sticas inicie oculto por defecto (clase hidden y chevron â–º), optimizando el espacio inicial.

## [2026-06-21 22:05:00] ExpansiÃ³n del CatÃ¡logo y MigraciÃ³n a SVG
* **EstructuraciÃ³n del CatÃ¡logo:** Se aÃ±adieron nuevas opciones para equipos alineadas a la teorÃ­a de datacenters: patchpanel, organizer, pdu, 	ray, kvm.
* **Filtros UI:** Se rediseÃ±aron las pestaÃ±as laterales del catÃ¡logo dividiÃ©ndolas en Servidores, Red, Storage, Cableado, EnergÃ­a y Accesorios.
* **MigraciÃ³n a SVG MonocromÃ¡tico:** Se reemplazaron los emojis del catÃ¡logo y UI por archivos SVG ubicados en ssets/icons/.
* **Sistema de MÃ¡scaras CSS:** Se implementÃ³ renderizado con mask-image en HTML para tintar los SVGs.
* **Soporte Canvas SVG:** Se implementÃ³ cachÃ© de imÃ¡genes en TopologyRenderer.js para dibujar SVGs en la vista topolÃ³gica.

## [2026-06-21 22:15:00] Bugfix: Iconos de SAN y NAS
* **CatÃ¡logo:** Se corrigiÃ³ un error en el que el catÃ¡logo y la topologÃ­a no encontraban los iconos para equipos cuyo archivo SVG se llamaba diferente al 	ype principal (ej. san.svg y 
as.svg para la categorÃ­a storage). Ahora se extrae correctamente el nombre del archivo desde la ruta definida en el modelo de datos.

 # #   [ 2 0 2 6 - 0 7 - 1 3   1 5 : 3 5 : 0 0 ]   R e n d e r i z a d o   O r t o g o n a l   2 D   e n   V i s t a   F í s i c a 
 *   * * V i s t a   F í s i c a : * *   I m p l e m e n t a c i ó n   d e   l i e n z o   S V G   i n t e r a c t i v o   p a r a   d i b u j a r   c o n e x i o n e s   f í s i c a s   d e   m a n e r a   t r a n s p a r e n t e . 
 *   * * A l g o r i t m o   d e   c a b l e s : * *   D e s a r r o l l o   d e   a l g o r i t m o   d e   t r a z a d o   d e   r u t a s   2 D   d e   t i p o   o r t o g o n a l ,   p e g a d o   a   l o s   b o r d e s   v e r t i c a l e s   d e   l o s   g a b i n e t e s ,   c o n   e s q u i n a s   r e d o n d e a d a s . 
 *   * * A n c l a j e   D O M : * *   I n y e c c i ó n   d e   a t r i b u t o s   d a t a - p o r t   y   d a t a - d e v i c e - i d   e n   f a c e p l a t e s   f r o n t a l e s   y   t r a s e r o s   p a r a   r e f e r e n c i a r   p u n t o s   d e   i n i c i o / f i n   p r e c i s o s . 
  
 