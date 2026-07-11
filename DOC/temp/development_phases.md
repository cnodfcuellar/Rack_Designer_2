# Plan de Desarrollo por Áreas: Reconstrucción 100% Offline

Este documento detalla la planificación del desarrollo dividida por **áreas funcionales y fases incrementales** para reconstruir el proyecto desde cero. Se garantiza que la aplicación sea **100% independiente del servidor (Offline-First)** mediante el uso de tecnologías nativas del navegador (Service Workers, Cache Storage, Web Crypto API, Local Storage y File System Access API) y que cuente con soporte nativo y persistente de **Tema Claro y Tema Oscuro**.

---

## ÁREA 1: Infraestructura Core, Estado Reactivo y PWA (Offline Base)
*El objetivo de esta área es crear el "motor" lógico de la aplicación y garantizar que la PWA sea instalable y funcione sin conexión desde el primer segundo.*

### Fase 1.1: Sistema de Estado Reactivo (Store)
- **Implementación**: Crear `js/core/store.js` implementando una clase `Store` con un patrón unidireccional utilizando un `Proxy` ES6.
- **Acciones**:
  - Interceptar mutaciones del estado global (`rooms`, `racks`, `devices`, `connections`).
  - Implementar historial de cambio (pila Undo/Redo) guardando snapshots serializados.
  - Disparar el evento global personalizado `store-updated` en el `window` tras cada cambio.

### Fase 1.2: Persistencia Local y Autoguardado
- **LocalStorage**: Crear la capa de sincronización inmediata con `localStorage` como respaldo redundante.
- **File System Access API (`fileManager.js`)**:
  - Implementar manejadores para abrir (`showOpenFilePicker`) y guardar (`showSaveFilePicker`) archivos locales `.rack` o `.json` directamente en el disco duro.
  - Diseñar el flujo de autoguardado asíncrono con una función de retraso agrupado (debounce de 3 segundos) para evitar bloqueos de disco en escrituras consecutivas.

### Fase 1.3: Ciclo de Vida PWA Offline-First (`service-worker.js`)
- **Estrategia Cache-First**: Configurar el Service Worker para interceptar todas las peticiones HTTP externas e internas:
  - Cachear todos los recursos estáticos iniciales (`index.html`, `/css/`, `/js/`, `/assets/`).
  - Cachear las dependencias externas críticas (SheetJS, FontAwesome, Google Fonts) para que no haya peticiones externas en tiempo de ejecución.
  - Registrar el manifiesto (`manifest.json`) para habilitar la instalación de escritorio y móvil como aplicación de sistema.

### Fase 1.4: Script Antirresplandor (Evitar FOUC del Tema)
- **Implementación**: Crear un script JavaScript mínimo y síncrono insertado directamente en el `<head>` de `index.html`:
  - Debe leer inmediatamente el valor guardado en `localStorage.getItem('theme')`.
  - Debe asignar el atributo `data-theme` a la etiqueta `<html>` de forma síncrona antes de procesar el body de la página, asegurando que cargue el tema correcto al instante y sin parpadeos.

---

## ÁREA 2: Seguridad y Autenticación Cliente (Local RBAC)
*Asegurar que el control de acceso basado en roles funcione localmente sin depender de un servidor de identidad o base de datos externa.*

### Fase 2.1: Criptografía Cliente (`js/auth/roles.js`)
- **Implementación**: Implementar seguridad offline mediante la **Web Crypto API** nativa (`crypto.subtle`).
- **Acciones**:
  - Crear hashing de PINs mediante SHA-256 para evitar almacenar contraseñas en texto plano.
  - Programar la matriz de permisos cliente por roles (Administrador: Lectura/Escritura, Editor: Modificar objetos sin alterar configuraciones de roles, Espectador: Solo lectura).
  - Gestionar el token de sesión temporal en memoria (`sessionStorage` cifrado o closure) para conservar la sesión durante la recarga de página.

### Fase 2.2: Interceptor y Guarda de Login
- **Modal de Login**: Crear el organismo del modal de acceso que bloquee la interfaz (`app`) si no hay una sesión activa, inhabilitando las interacciones por teclado y puntero.

---

## ÁREA 3: Interfaz Atómica y Estilos (Design System Dual)
*Maquetar el andamiaje visual bajo los estándares de Atomic Design y configurar las hojas de estilos para dar soporte dinámico tanto al Tema Claro como al Oscuro.*

### Fase 3.1: Estilos Globales, Tokens de Diseño y Átomos
- **Estilos Base y Tokens (`variables.css` y `layout.css`)**: 
  - Declarar las variables CSS de color para el Tema Oscuro (por defecto en `:root`).
  - Declarar las variables equivalentes para el Tema Claro bajo el selector `[data-theme="light"]` (fondos blancos `#ffffff`, bordes `#e2e8f0`, textos `#0f172a`, etc.).
  - Definir la cuadrícula CSS Grid de 3 columnas (`layout.css`).
- **Átomos**:
  - Botones estilizados (`BaseButton`).
  - Campos de entrada, desplegables y selector de colores (`BaseInput`).
  - Iconos dinámicos SVG (`SVGIcon`) usando `mask-image` de CSS.
  - Átomo **ThemeToggler**: Botón interactivo con icono de Sol/Luna que alterna dinámicamente el tema actual de la aplicación escribiendo en `localStorage` y actualizando el atributo `data-theme` en la etiqueta HTML.

### Fase 3.2: Moléculas y Plantilla de Dashboard
- **Moléculas**: Diseñar los componentes `FormField` (unión de label + input), `StatPill` (métricas de datacenter), y `SlotUnit` (riel de unidades U).
- **Template (`DashboardLayout`)**: Ensamblar la rejilla estructural que ubica el Header (con el botón `ThemeToggler`), la barra lateral izquierda, el espacio de trabajo central, el panel lateral derecho (Outliner/Inspector) y las tablas inferiores.

---

## ÁREA 4: Maquetación y Simulación Física (Racks y Catálogo)
*Desarrollar el área de diseño físico bidimensional y tridimensional de los gabinetes.*

### Fase 4.1: Catálogo y Drag & Drop
- **Catálogo**: Componente lateral para buscar, filtrar categorías y arrastrar dispositivos.
- **Drag & Drop**: Implementar listeners de arrastre nativos. Configurar la validación de colisiones (comprobar si hay unidades U suficientes y libres antes de confirmar la inserción en el Store).

### Fase 4.2: Chasis Físico de Racks y Flipping 3D
- **RackChassis**: Renderizador modular que lee las U's del Store y dibuja el gabinete.
- **Volteo Frontal/Trasero (Flip)**: Configurar la animación de volteo en 3D (`transform: rotateY`). Asegurar que al voltear el rack, se desactiven las interacciones de los elementos de la cara oculta mediante `pointer-events: none !important`.
- **Skins y Fallbacks**: Sistema híbrido en `faceplates.js` que intenta cargar el SVG o imagen del dispositivo y, si falla offline o no existe, renderiza un diseño alternativo puramente vectorizado con CSS.

### Fase 4.3: Formularios de Edición (Acordeones)
- **Modal de Equipo**: Interfaz con pestañas/acordeones colapsables para parametrizar de forma organizada todos los datos físicos y de red del dispositivo.

---

## ÁREA 5: Diagramado y Topología Lógica (Network Topology Canvas)
*Construir el motor visual interactivo 2D para mapear la red física y lógica.*

### Fase 5.1: Motor Canvas 2D
- **Implementación**: Crear el lienzo interactivo usando Canvas HTML5.
- **Interacciones**: Programar la traslación de coordenadas de pantalla a coordenadas del lienzo (zoom con rueda del ratón y paneo mediante arrastre del fondo).

### Fase 5.2: Enrutamiento y Conexiones (Cables)
- **Cables**: Dibujar líneas mediante curvas Bézier cúbicas dinámicas entre los puertos de los equipos.
- **Coloreado Inteligente**: Asignar colores según el tipo de cable de red (Cobre, Fibra, DAC) leído desde el Store.

### Fase 5.3: Distribución Automática y Espaciado
- **Algoritmo**: Implementar la auto-distribución matemática de los nodos mediante fuerzas radiales (`radial recalculation`) y un control deslizante (slider) de espaciado interactivo para evitar el solapamiento visual.

### Fase 5.4: Tooltips a Prueba de Fallos
- **Seguridad**: Implementar el tooltip flotante dentro del canvas resguardado con `try-catch` y destructuración de datos seguros para soportar campos nulos o vacíos en el inventario.

---

## ÁREA 6: Inventarios, Auditoría y Reportes (Auditing & Exports)
*Desarrollar la capa de auditoría y generación de informes offline.*

### Fase 6.1: Tablas de Inventario Dinámicas
- **Implementación**: Crear el panel tabular inferior que muestra las tablas en tiempo real de Equipos, Gabinetes y Conexiones.
- **Reactividad**: Las tablas deben reconstruirse de forma eficiente al recibir el evento `store-updated`.

### Fase 6.2: Exportaciones Locales (Cero Servidor)
- **Fotografía de Rack**: Utilizar `html2canvas` para renderizar el DOM del rack físico y descargarlo como imagen PNG en el navegador.
- **Hojas de Cálculo**: Integrar **SheetJS** (`xlsx.full.min.js`) de forma puramente local para estructurar los datos del inventario y descargarlos instantáneamente como libros Excel (.xlsx) o archivos CSV planos.
