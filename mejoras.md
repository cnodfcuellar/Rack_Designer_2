# Fallas, Problemas e Inquietudes de RACK Designer Next en Producción

Este documento recopila un análisis detallado de los riesgos, problemas potenciales y limitaciones que surgen al utilizar la arquitectura actual de **RACK Designer Next** en un entorno de producción real offline.

---

## 1. Problemas Críticos de Seguridad e Integridad

### 🔑 Credenciales e IPs Almacenadas en Texto Plano en el Cliente
*   **Problema:** Los campos de red de los equipos (`ip`, `mac`, `user`, `pass`) se almacenan directamente en texto plano dentro del estado JSON en el `localStorage` del navegador.
*   **Riesgo:** Cualquier script malicioso (por ejemplo, mediante una vulnerabilidad XSS o una extensión del navegador maliciosa) puede acceder a `localStorage` y extraer la base de datos completa de credenciales e IPs de los servidores de producción de la empresa.
*   **Inquietud:** El sistema de roles (RBAC) con login por PIN solo bloquea la interfaz de usuario visual (DOM), pero no cifra la base de datos subyacente. Los datos siguen expuestos en el disco local a través del almacenamiento del navegador.

---

## 2. Límites de Rendimiento y Escalabilidad (Performance & Scale)

### 💾 Límite de 5MB en LocalStorage y Pérdida Silenciosa de Datos
*   **Problema:** La API de `localStorage` tiene un límite estricto de **5MB** por origen en la mayoría de los navegadores modernos. A medida que el diseño del centro de datos crece (cientos de equipos, salas, racks, curvas de cableado e historial de deshacer/rehacer), este límite se alcanzará rápidamente.
*   **Falla de Software:** El método `_save()` en `store.js` captura los errores en un bloque vacío: `catch(e) {}`. Si el navegador lanza una excepción `QuotaExceededError` por superar el espacio permitido, la aplicación continuará funcionando en memoria, pero **dejará de guardar de forma silenciosa**. El usuario perderá su trabajo al cerrar la pestaña sin recibir ninguna advertencia visual.

### ⏳ Bloqueo del Hilo Principal por Clonado Profundo (`deepClone`)
*   **Problema:** Cada vez que el usuario realiza un cambio, el sistema ejecuta `store.snapshot()`, el cual procesa una copia completa en memoria del estado del proyecto usando `deepClone(this._raw)`.
*   **Riesgo:** En datacenters grandes de producción, procesar copias completas de manera síncrona en el hilo de ejecución principal de JavaScript provocará congelamientos cortos de la interfaz (lag/jank), especialmente notables al arrastrar dispositivos o mover nodos en la topología.

### 🔄 Redibujado Completo Redundante (`renderAll`)
*   **Problema:** El flujo reactivo actual en `main.js` tiende a disparar redibujados completos ante mutaciones menores. Por ejemplo, cambiar propiedades simples en el inspector o mover elementos del catálogo fuerza el redibujado de múltiples capas DOM y tablas, en lugar de realizar actualizaciones atómicas solo en los elementos del DOM alterados.

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

### 🚪 Inconsistencia y Limitaciones en la Edición de Salas
*   **Problema:** Para renombrar una sala, la interfaz recurre a un diálogo nativo del navegador (`prompt`) en lugar de utilizar un modal de interfaz unificado y estético (como se hace con Racks o Dispositivos). Además, no existe un modal de edición completo de salas para configurar parámetros adicionales como dimensiones o notas.
*   **Impacto en Producción:** Rompe la consistencia visual y de comportamiento del sistema de diseño (Atomic Design), y bloquea de manera síncrona la ventana del navegador durante la interacción.

### 🖼️ Borde de los Racks muy Pequeño en la Vista Física
*   **Problema:** En la vista física, el contorno o borde que delimita los gabinetes (Racks) es demasiado delgado o pequeño.
*   **Impacto en Producción:** Dificulta la identificación de los límites físicos del rack, reduciendo la claridad y contraste visual cuando se tienen instalados equipos con faceplates oscuros o en pantallas de alta resolución.

### 🔌 Agrupación de Equipos de Red en el Sidebar
*   **Propuesta de Mejora:** Unificar las categorías de Routers, Switches y Firewalls en la barra lateral (Sidebar del catálogo) dentro de un solo grupo lógico llamado **"Network"**.
*   **Objetivo/Beneficio en Producción:** Simplificar el árbol de selección y búsqueda de equipos de conectividad en el catálogo lateral, reduciendo la sobrecarga de pestañas o grupos individuales y mejorando la ergonomía de la interfaz de usuario.

### 🔍 Categoría "Todos" en el Sidebar del Catálogo
*   **Propuesta de Mejora:** Crear una pestaña o grupo global llamado **"Todos"**, representado con el icono de una lupa, donde se listen absolutamente todos los equipos y plantillas disponibles del catálogo.
*   **Objetivo/Beneficio en Producción:** Agilizar el flujo de trabajo permitiendo al usuario visualizar y arrastrar cualquier equipo desde una lista única consolidada, complementando la búsqueda global sin necesidad de alternar entre pestañas específicas.

### 📐 Desalineación / Descentrado de la Sección de Piso en la Vista Física
*   **Problema:** En la vista física, cuando no hay racks o cuando una sala está prácticamente vacía, el contenedor que agrupa los equipos de piso ("Floor Devices Section") se visualiza descentrado respecto al centro del lienzo principal o con respecto a los racks.
*   **Impacto en Producción:** Afecta la armonía visual del lienzo de diseño cuando se comienza una sala desde cero, desalineando los equipos de piso y rompiendo el flujo de diseño estético.
*   **Propuesta de Mejora:** Establecer un ancho mínimo de **584px** para el área de equipos de piso en la vista física, garantizando así su alineación perfecta con el espacio que ocuparían al menos dos racks juntos.

### 📏 Establecer Ancho Fijo Proporcional para los Slots (10x de la Unidad U)
*   **Propuesta de Mejora:** Configurar el ancho del área de slots del rack (`.rack-slots`) para que sea completamente fijo y proporcional a la realidad, estableciendo su medida como un múltiplo de 10 veces el tamaño de la unidad U ($10 \times 24\text{px} = 240\text{px}$).
*   **Objetivo/Beneficio en Producción:** Asegurar un aspecto visual realista y uniforme del gabinete en todas las pantallas. Al evitar que el ancho sea flexible o indeterminado, se previene la deformación de las faceplates y de los skins de los servidores/equipos de red montados.

### 🏁 Grilla de Fondo muy Tenue en la Vista Física
*   **Propuesta de Mejora:** Implementar un patrón de grilla o cuadrícula muy sutil y tenue de fondo en el área del lienzo de la Vista Física (similar al patrón de puntos o líneas utilizado en la topología).
*   **Objetivo/Beneficio en Producción:** Aumentar la claridad del espacio tridimensional y bidimensional de la sala física, facilitando al operador la colocación y alineación uniforme de los gabinetes y equipos de piso.

### 📐 Estandarización de Alturas de Racks y Configuración por Defecto a 8 U
*   **Propuesta de Mejora:**
    *   Reemplazar la entrada de texto libre por una lista desplegable (`select`) con alturas de rack fijas estándares de la industria (p. ej. 4U, 8U, 12U, 16U, 24U, 32U, 42U, 48U) en el modal de creación y edición de gabinetes.
    *   Establecer la altura por defecto del nuevo rack creado en **8 U**.
*   **Objetivo/Beneficio en Producción:** Prevenir que los operadores definan alturas erróneas o no comerciales de racks (p. ej. 5U, 13U o valores exagerados como 100U), y acelerar el aprovisionamiento de nuevos gabinetes con la altura más común por defecto.

### 📖 [COMPLETADO] Crear Documento de Referencia para Medidas de la Interfaz
*   **Estado:** Completado. Se ha creado el documento [medidas_interfaz.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/medidas_interfaz.md).
*   **Propuesta de Mejora:** Elaborar un archivo Markdown específico que centralice y documente todas las medidas y reglas de layout de la interfaz de usuario (anchos de sidebar, inspector, cabeceras, rejilla CSS Grid, etc.) en la carpeta de documentos.
*   **Objetivo/Beneficio en Producción:** Proporcionar una guía rápida de referencia para el equipo de desarrollo que permita mantener la consistencia del diseño y del layout general al implementar nuevos paneles o funcionalidades visuales, sin tener que inspeccionar los archivos CSS en cada ocasión.

### 🎨 Visibilidad de Selector y Soporte para Tema Sepia
*   **Propuesta de Mejora:**
    *   Hacer plenamente visible y accesible el botón de cambio de tema (Theme Toggler) en la cabecera principal.
    *   Agregar un nuevo tema visual tipo **"Sepia"** con una paleta cálida (cremas, ocres y cafés suaves) en el CSS del proyecto, actualizando el Design System para que soporte la conmutación entre Claro, Oscuro y Sepia.
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

### 📋 Plantilla Completa de Exportación para Importación Masiva
*   **Propuesta de Mejora:** Al exportar la tabla (CSV/Excel), se debe generar una plantilla de exportación estructurada que muestre absolutamente todos los campos del modelo de datos de los equipos, sirviendo como base para importar grupos de equipos de forma masiva en el futuro.
*   **Detalles del Comportamiento:**
    *   **Inclusión Total de Campos:** La plantilla debe mostrar todos los campos configurables (incluidos campos como `notes`, `skin`, `size`, etc.), asegurando que no se pierdan atributos al exportar/importar.
    *   **Representación de Campos Tipo Lista:** Para aquellos campos que contienen listas de selección o arrays (por ejemplo, tipos de equipos, lados de montaje o conjuntos de puertos), la tabla o plantilla debe presentarlos como listas o con un formato de enumeración consistente (ej. dropdowns de Excel o celdas con valores formateados en lista) para facilitar su edición estructurada antes de la importación.
*   **Objetivo/Beneficio en Producción:** Agilizar el aprovisionamiento y la edición en masa de inventarios de red offline, permitiendo preparar plantillas de carga válidas con todas las propiedades de hardware mapeadas sin requerir entradas manuales complejas.

### 📥 Importación Masiva de Equipos desde Plantilla (CSV/Excel)
*   **Propuesta de Mejora:** Diseñar e implementar un sistema de importación masiva que procese una plantilla de datos (CSV/Excel) completada por el usuario para cargar grupos de equipos directamente en el estado global.
*   **Detalles del Comportamiento:**
    *   **Procesamiento del Archivo:** Añadir una opción de "Importar Equipos" que lea archivos usando `FileReader` y la librería `XLSX` (ya presente).
    *   **Validación y Mapeo:** Validar tipos de datos de entrada (IPs, MACs, rango de slots del rack seleccionado) antes de mutar el estado, mostrando un resumen de errores en caso de detectar datos no válidos.
    *   **Resolución de Conflictos:** Ofrecer reglas claras en caso de que existan colisiones de nombres o IPs (ej. omitir, renombrar con sufijo o sobrescribir).
*   **Objetivo/Beneficio en Producción:** Reducir drásticamente el esfuerzo manual necesario para inicializar centros de datos grandes, permitiendo a los operadores cargar cientos de equipos preconfigurados en un solo clic.

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

### 📱 Rediseño de Interfaz para Modo Móvil y Tablet
*   **Propuesta de Mejora:** Rediseñar y adaptar la interfaz de usuario (Responsive Design) para dispositivos móviles y tablets, evaluando la mejor estrategia de distribución y ocultamiento de paneles (sidebar, inspector). Además, se propone crear un conjunto de funcionalidades específicas adaptadas al modo móvil:
    *   **Navegación Táctil:** Optimizar gestos como *swipe* para abrir/cerrar menús laterales (catálogo, outliner) y *pinch-to-zoom* en el lienzo físico y topología.
    *   **Modo de Inspección Rápida:** Una vista simplificada para escanear y visualizar propiedades y estados de los equipos rápidamente sin sobrecargar la pantalla.
    *   **Barra de Navegación Inferior (Bottom Nav):** Implementar una barra de navegación inferior para alternar ágilmente entre Vistas (Física, Topología) y Paneles (Catálogo, Inventario).
    *   **Gestos Contextuales (Long Press):** Reemplazar los eventos de clic derecho por gestos de pulsación larga para acceder a menús de edición rápida o eliminación.
*   **Objetivo/Beneficio en Producción:** Permitir a los ingenieros de red o técnicos en sitio consultar el inventario, topología o especificaciones físicas directamente desde sus teléfonos o tabletas mientras trabajan físicamente frente a los gabinetes en el Data Center.

### 🔌 Gestión Avanzada de Puertos y Validaciones de Conexión
*   **Propuesta de Mejora:**
    *   Implementar un **Submenú de Puertos** detallado para cada equipo donde se puedan visualizar y administrar las conexiones de red individuales.
    *   Al crear una nueva conexión, los menús desplegables (selects) de puerto de origen y puerto de destino **solo deben mostrar los puertos que estén disponibles**, filtrando automáticamente los que ya se encuentren ocupados.
    *   Añadir validaciones lógicas estrictas para evitar que, bajo ninguna circunstancia, se asigne o conecte un cable a un **puerto ocupado**.
    *   Incorporar soporte para asignar e identificar propiedades de **VLAN** en cada puerto.
    *   Refactorizar los **datos demo (`demoData.js`)** para que los ejemplos por defecto incluyan esta nueva estructura de puertos, VLANs y conexiones validadas.
*   **Objetivo/Beneficio en Producción:** Aumentar el nivel de realismo y precisión en la documentación de red (DCIM). Esto evita errores de cableado lógico en el diseño, garantizando que el estado de los puertos refleje la capacidad física real del equipo.

### 🕸️ Persistencia de Posiciones en la Vista de Topología
*   **Propuesta de Mejora:** Implementar un mecanismo para **guardar las posiciones (coordenadas X, Y)** de los nodos (equipos, racks, salas) dentro de la Vista de Topología. Al mover un nodo manualmente, su nueva ubicación debería registrarse en el estado global (`store.js`) y persistir en el archivo `.rack` o `localStorage`.
*   **Objetivo/Beneficio en Producción:** Permite a los arquitectos de red crear diagramas lógicos personalizados y ordenados a su gusto. Actualmente, si el diseño dependiera solo de un layout automático, cualquier recarga o cambio de sala podría desorganizar los mapas mentales del usuario. Guardar las posiciones asegura que el esfuerzo invertido en organizar el diagrama visualmente no se pierda.

### 🖼️ Sistema Avanzado de Skins Visuales en Topología
*   **Propuesta de Mejora:** Ampliar el sistema de visualización en la Vista de Topología para ofrecer tres modos (skins) de representación para los equipos:
    1.  **Nodos:** Representación lógica circular y minimalista.
    2.  **Tarjetas (Cards):** Representación rectangular enfocada en metadatos (diseño actual).
    3.  **Imagen Personalizada:** Permitir a los usuarios cargar imágenes de iconos o fotos del equipo en formatos `.jpg`, `.png` o `.svg` y usarlas como el nodo visual en el canvas.
*   **Objetivo/Beneficio en Producción:** Brindar la flexibilidad de generar tanto diagramas lógicos y abstractos de alta legibilidad, como diagramas de red ultra-realistas. El uso de imágenes (como iconos de Cisco, Fortinet, etc.) mejora enormemente el valor de las exportaciones para presentaciones ejecutivas.

### 🎨 Personalización Visual y Temas en la Topología
*   **Propuesta de Mejora:** Crear un motor de temas y personalización visual dedicado exclusivamente a la Vista de Topología, con soporte para transparencias (canal alfa) y dos modos de color:
    1.  **Modo Heredado:** Utiliza automáticamente los colores base ya asignados a las salas y racks en sus propiedades de inventario.
    2.  **Modo Personalizado:** Permite sobrescribir y ajustar la apariencia de cada elemento de forma individual:
        *   **Fondo del Lienzo:** Color sólido, patrón de puntos (dots) patrón hexagonal (hexagon) o patrón de cuadrícula (grid).
        *   **Salas:** Color de fondo (relleno), color de contorno, color de la cabecera, color del texto y niveles de transparencia general y de relleno.
        *   **Racks:** Color de fondo (relleno), color de contorno, color de la cabecera, color del texto y niveles de transparencia general y de relleno.
*   **Objetivo/Beneficio en Producción:** Permite adaptar los diagramas exportados a la identidad corporativa de diferentes clientes o departamentos. Además, el uso de transparencias evita que los racks y salas oculten las líneas de conexión que pasan por debajo, mejorando drásticamente la legibilidad en redes muy densas.

### 🔍 Buscador en el Catálogo en Añadir Equipos
*   **Propuesta de Mejora:** Añadir un campo de búsqueda (buscador) en el menú de agregar equipo (catálogo), para que los usuarios puedan encontrar dispositivos rápidamente, complementando el sistema deslizable que ya existe.
*   **Objetivo/Beneficio en Producción:** Agiliza significativamente el flujo de trabajo al permitir localizar y añadir equipos específicos de manera inmediata dentro de un catálogo extenso, sin tener que navegar o desplazarse manualmente por todas las opciones disponibles.

### 🏷️ Separación de Etiquetas en Nodos de Topología (Modo Nodos)
*   **Propuesta de Mejora:** En la Vista de Topología, cuando se utiliza el modo de estilo **"Nodos"** (representación circular), separar las etiquetas de texto en dos líneas posicionadas independientemente:
    *   **IP arriba del nodo:** Mostrar la dirección IP del equipo como etiqueta superior, por encima del círculo del nodo.
    *   **Nombre abajo del nodo:** Mostrar el nombre del dispositivo como etiqueta inferior, debajo del círculo del nodo.
*   **Objetivo/Beneficio en Producción:** Mejora la legibilidad y la densidad de información visible en diagramas de topología complejos. Al separar IP y nombre en posiciones distintas, se evita el apilamiento o truncado de texto en una sola línea, y se facilita la identificación rápida de equipos tanto por nombre lógico como por dirección de red.

### 🌲 Layout de Árbol Genealógico en la Vista de Topología
*   **Propuesta de Mejora:** Añadir un nuevo modo de disposición (layout) en la Vista de Topología que organice los nodos en forma de **árbol genealógico** (jerárquico de arriba hacia abajo o de izquierda a derecha), donde los equipos principales (core switches, routers de borde) se posicionen como raíz y los equipos dependientes se ramifiquen hacia abajo en niveles sucesivos.
    *   **Control de separación horizontal:** Un slider o input numérico que permita ajustar la distancia entre nodos hermanos (mismo nivel jerárquico).
    *   **Control de separación vertical:** Un slider o input numérico que permita ajustar la distancia entre niveles padre-hijo del árbol.
*   **Objetivo/Beneficio en Producción:** Ofrece una representación visual clara de la jerarquía lógica de la red (core → distribución → acceso), facilitando la comprensión de dependencias y la planificación de redundancia. Los controles de espaciado permiten adaptar el diagrama a diferentes densidades de equipos y tamaños de pantalla o exportación.

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

### Fase 3 — Topología Avanzada
13. Persistencia de posiciones de nodos en la topología. *(→ Sección 6, 🕸️)*
14. Skins visuales en topología (nodos, cards, imágenes personalizadas). *(→ Sección 6, 🖼️)*
15. Motor de temas y personalización visual en topología (transparencias, patrones de fondo). *(→ Sección 6, 🎨)*

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
