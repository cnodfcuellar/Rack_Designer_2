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

### 🌳 Controles de Edición y Creación en el Outliner
*   **Propuesta de Mejora:** En el panel de Outliner (jerarquía), cada objeto (sala, rack, equipo) debe contar con botones o iconos contextuales para **editar** y **eliminar**. Además, en la cabecera del panel del Outliner, se deben agregar iconos de acceso rápido para **crear sala**, **crear rack** y **agregar equipo**.
*   **Objetivo/Beneficio en Producción:** Mejorar la usabilidad y agilizar el flujo de trabajo, permitiendo a los operadores gestionar la infraestructura y realizar acciones directamente desde la vista de árbol del centro de datos sin tener que navegar a otras secciones.

### 🗂️ Inspector Colapsable en el Panel Derecho
*   **Propuesta de Mejora:** Añadir la funcionalidad de contraer o colapsar la vista del Inspector en el panel derecho.
*   **Objetivo/Beneficio en Producción:** Al contraer el Inspector, se libera espacio vertical para que la lista del Outliner se expanda. Esto mejora enormemente la navegación en topologías complejas que contienen múltiples salas, racks y equipos apilados.

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
