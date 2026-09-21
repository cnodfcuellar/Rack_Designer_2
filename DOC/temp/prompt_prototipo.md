---
# PROMPT MAESTRO: Reconstrucción de RACK Designer Next en Prototipo Único Autocontenido HTML5

Actúa como un **Arquitecto de Software Frontend Senior y Especialista en UI/UX y Gráficos Canvas 2D** experto en Vanilla JavaScript (ES6+), CSS3 moderno y HTML5 semántico.

Tu misión es programar desde cero un clon completamente funcional, profesional y de estética premium de **"RACK Designer Next"** (sistema DCIM de simulación y diseño visual de centros de datos, gabinetes de telecomunicaciones, topologías de red y cableado estructurado) condensado en un **ÚNICO ARCHIVO HTML5 AUTOCONTENIDO** (ej. `index.html` o `rack_designer_standalone.html`).

---

### 1. REGLAS FUNDAMENTALES Y AUTONOMÍA ABSOLUTA (100% OFFLINE)

1. **Un Solo Archivo Físico**:
   - Todo el código debe residir en un único archivo `.html`.
   - Los estilos van exclusivamente dentro de una etiqueta `<style>` en el `<head>`.
   - Toda la lógica va exclusivamente dentro de una etiqueta `<script>` al final del `<body>`.
   - **Prohibido el uso de CDNs o librerías externas**: No utilices enlaces a `cdnjs`, `unpkg`, `jsdelivr`, fuentes externas de Google Fonts ni FontAwesome. Si el navegador no tiene internet, la aplicación debe funcionar al 100% de sus capacidades.
2. **Tipografía del Sistema de Alta Fidelidad**:
   - Utiliza una pila tipográfica nativa premium:
     `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";`
   - Para unidades U, códigos, puertos, IPs y métricas utiliza fuente monoespaciada de sistema:
     `font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;`
3. **Iconos y Faceplates Vectoriales Puros**:
   - Toda la iconografía (guardar, zoom, eliminar, editar, cablear, voltear) debe ser SVG inline o generada dinámicamente mediante strings SVG con `xmlns="http://www.w3.org/2000/svg"`.
   - Los frontales de equipos de rack (faceplates) deben dibujarse mediante generadores paramétricos de SVG/DOM (puertos RJ45, ranuras SFP+, bahías de discos duros de servidores, displays numéricos de PDU, LEDs luminosos parpadeantes).
4. **Almacenamiento Local Robusto**:
   - Persistencia reactiva inmediata en `localStorage` bajo la clave `RACK_DESIGNER_STATE`.
   - Persistencia volátil de sesión activa en `sessionStorage` para mantener el rol de login frente a recargas de pestaña (F5).
   - Inyección automática de un **Dataset de Demostración Inicial** si `localStorage` está vacío (con 1 sala, 2 racks de 42U, servidores 1U/2U, switches de 24/48 puertos, firewall, PDU y conexiones cableadas ya trazadas).

---

### 2. ARQUITECTURA DE ESTADO REACTIVO (ES6 PROXY PATTERN)

Debes emular un patrón reactivo unidireccional (estilo Redux/Vuex nativo) sin librerías:

1. **Instancia Central `Store`**:
   - Contiene el árbol de estado único:
     ```javascript
     state = {
       rooms: [{ id: 'room-1', name: 'Datacenter Principal', racks: ['rack-1', 'rack-2'] }],
       racks: [{ id: 'rack-1', roomId: 'room-1', name: 'Rack A01', heightU: 42, color: '#1e293b' }],
       devices: [
         {
           id: 'dev-1',
           rackId: 'rack-1',
           startU: 40,
           heightU: 1,
           name: 'Core-Switch-01',
           type: 'switch',
           face: 'front', // 'front' | 'rear'
           watts: 180,
           weightKg: 8.5,
           ports: 24,
           network: { ip: '10.0.0.1', mask: '255.255.255.0', vlan: 10 },
           credentials: { user: 'admin', pass: 's3cur3' },
           topology: { x: 250, y: 180 }
         }
       ],
       connections: [
         { id: 'conn-1', fromDevId: 'dev-1', fromPort: 1, toDevId: 'dev-2', toPort: 24, cableType: 'fiber', color: '#10b981' }
       ],
       auth: { role: 'admin', user: 'admin' },
       ui: { currentRoomId: 'room-1', currentView: 'physical', selectedId: null, animationsEnabled: true, theme: 'dark' }
     };
     ```
2. **Proxy Traps y Despacho Unidireccional**:
   - Envuelve el estado en un `new Proxy` de ES6 que intercepte cualquier asignación (`set`), guarde automáticamente en `localStorage` y emita un evento de cambio (`window.dispatchEvent(new CustomEvent('store-change', { detail: { source } }))`).
3. **Pila Inmutable de Undo / Redo**:
   - Cada acción que mute el estado (`addDevice`, `deleteDevice`, `moveDevice`, `connectPorts`, etc.) debe llamar a `snapshot()` clonando el estado anterior (`JSON.parse(JSON.stringify(rawState))`) en una pila `_history`.
   - Soporte para atajos de teclado `Ctrl+Z` (Deshacer) y `Ctrl+Y` / `Ctrl+Shift+Z` (Rehacer).
4. **Cascada Relacional y Auto-Saneamiento (`_sanitize`)**:
   - Si se elimina un rack, deben eliminarse en cascada todos los equipos montados en él.
   - Si se elimina un equipo (o un rack con equipos), deben eliminarse automáticamente todos los cables/conexiones donde ese equipo participaba como origen o destino, así como purgar sus coordenadas de topología.
   - Implementa un método de sanitización preventiva `_sanitize()` que al cargar verifique que no existan conexiones apuntando a IDs inexistentes ni posiciones huérfanas en topología.
5. **Exportación e Importación Nativa**:
   - **Exportar JSON/RACK**: Generar un Blob `application/json` descargable con nombre con timestamp.
   - **Importar JSON/RACK**: Lectura de archivo mediante `<input type="file" accept=".json,.rack">` y `FileReader`, validando la estructura antes de sobrescribir el Store.
   - **Exportar CSV**: Generador de texto plano CSV con encabezados (`ID, Nombre, Tipo, Sala, Rack, Unidad_U, Consumo_W, IP, VLAN`) descargable como Blob `text/csv`.

---

### 3. SEGURIDAD CLIENTE Y CONTROL DE ACCESO (RBAC LOCAL)

1. **Hashing Criptográfico Nativo**:
   - Utiliza la **Web Crypto API** (`crypto.subtle.digest('SHA-256', ...)`) para validar el PIN de acceso.
   - PIN maestro por defecto: `"rack2024"`.
2. **Matriz de Permisos por Rol**:
   - `admin`: Lectura, edición, creación, eliminación, cableado y exportación total.
   - `editor`: Puede añadir y mover equipos o editar conexiones, pero no alterar configuraciones de seguridad ni PIN maestro.
   - `viewer`: Solo lectura. Oculta o deshabilita botones de eliminación, arrastre (drag-and-drop deshabilitado) y formularios de edición.
3. **Persistencia F5 Segura**:
   - Al iniciar sesión con éxito, calcula un token de firma SHA-256 (`SHA-256(pinHash + salt)`) y guárdalo en `sessionStorage`. Al recargar con F5, la aplicación valida la firma y mantiene al operador en sesión sin obligarlo a reloguearse.

---

### 4. DISEÑO VISUAL Y MAQUETACIÓN CSS (DARK GLASSMORPHISM & DUAL THEME)

1. **Layout CSS Grid de 3 Columnas y 5 Áreas**:
   ```css
   #app {
     display: grid;
     width: 100vw;
     height: 100vh;
     overflow: hidden;
     grid-template-areas:
       "header  header        header"
       "sidebar main          right-panel"
       "bottom  bottom        bottom";
     grid-template-columns: 280px 1fr 280px;
     grid-template-rows: 56px 1fr 230px;
   }
   ```
2. **Variables de Color y Tokens Dinámicos**:
   - Modo Oscuro por defecto (`:root` o `[data-theme="dark"]`):
     - Fondo principal: `#0a0e17`
     - Fondo de tarjetas y paneles: `rgba(15, 23, 42, 0.85)` con `backdrop-filter: blur(12px)`
     - Bordes: `rgba(255, 255, 255, 0.08)`
     - Acentos: Cian eléctrico (`#06b6d4`), Verde esmeralda (`#10b981`), Ámbar (`#f59e0b`), Púrpura (`#8b5cf6`)
   - Modo Claro (`[data-theme="light"]`):
     - Fondo principal: `#f1f5f9`
     - Paneles: `rgba(255, 255, 255, 0.95)`
     - Bordes: `#cbd5e1`
     - Textos: `#0f172a`
   - Botón toggle de tema en el Header con persistencia en `localStorage`.

---

### 5. ESPECIFICACIÓN DETALLADA DE MÓDULOS DE INTERFAZ

#### A. Header (56px)
- Logo del Datacenter con icono SVG de servidor y título dinámico ("⚡ RACK Designer Next").
- Selector de Sala activa con pestañas horizontales navegables y botón `+ Nueva Sala`.
- Selector de Modo de Trabajo (Pestañas `Vista Física`, `Topología de Red`, `Métricas`).
- Botón de alternancia de animaciones LED (`⚡ LEDs: ON/OFF`).
- Botón de alternancia de Tema Claro/Oscuro (`☀️ / 🌙`).
- Controles de Deshacer (`↶`) y Rehacer (`↷`).
- Menú de Archivo: `💾 Guardar .rack`, `📥 Cargar archivo`, `📊 Exportar CSV`.
- Indicador de Rol actual con avatar y botón para cambiar de rol o ingresar PIN de Administrador.

#### B. Sidebar Izquierdo: Catálogo de Equipos (280px)
- Buscador interactivo en tiempo real por texto (filtra servidores, switches, routers, storage, PDUs, patch panels).
- Pestañas de categorías: *Todos*, *Redes (Switches/Routers/FW)*, *Cómputo (Servidores)*, *Energía y Periféricos*.
- Tarjetas de equipos arrastrables (`draggable="true"` con eventos `dragstart`) que representan modelos reales:
  - Servidor 1U / 2U / 4U (con consumo en Watts y peso en Kg preconfigurados).
  - Switch de Acceso 24 Puertos 1U / Switch Core 48 Puertos 2U.
  - Router de Borde / Firewall 1U.
  - Bandeja de Fibra Óptica / Patch Panel Cat6 1U.
  - PDU Horizontal 1U / SAI/UPS de Baterías 2U.

#### C. Canvas Principal (Área Central)
1. **Vista Física de Gabinetes**:
   - Lienzo con soporte para Paneo (arrastrar con botón central o espacio presionado) y Zoom (`Ctrl + rueda`).
   - Fondo con rejilla técnica sutil milimétrica mediante gradientes CSS repetitivos.
   - Gabinetes de rack renderizados a escala exacta:
     - Cada Unidad U mide **24px de alto**.
     - Ancho estándar de bahía de slots: **240px**.
     - Rieles laterales metálicos con números de U serigrafiados de 1 a 42 (o la altura configurada).
     - **Efecto de Volteo 3D Frontal / Trasero**: Botón `↻ Voltear Rack` en la cabecera del gabinete que gira el chasis 180° en 3D (`transform: rotateY(180deg)`) con `backface-visibility: hidden` para inspeccionar y cablear tanto la cara frontal como la cara trasera de los equipos.
     - Detección precisa de zonas de caída (`dragover`, `drop`):
       - Calcula el slot U donde se suelta el equipo.
       - Validación matemática de ocupación: impide soltar un equipo de 2U si no hay espacio libre continuo o si supera el límite superior del rack.
     - Contenedor de **Equipos de Piso** (Floor Devices) en la base para albergar SAIs/UPS de suelo o torres de servidores.
     - **Micro-Animaciones LED**: Los switches y servidores montados cuentan con indicadores lumínicos verdes/ámbar que parpadean asíncronamente con CSS `@keyframes` si `animationsEnabled` es verdadero.
     - **Tooltip Contextual Fotorrealista**: Al pasar el ratón (`mouseenter`) sobre cualquier equipo montado, despliega un tooltip flotante estilizado con efecto glassmorphism que detalla: Nombre, Modelo, U ocupadas, IP, VLAN, Usuario/Contraseña (con formato legible) y consumo eléctrico. Debe posicionarse dinámicamente (`mousemove`) evitando situarse bajo el puntero para no causar parpadeos continuos.
2. **Vista de Topología de Red (Canvas 2D HTML5)**:
   - Lienzo `<canvas>` de alto rendimiento con `requestAnimationFrame`.
   - Soporte total para **Zoom centrado en el cursor** mediante rueda del ratón y **Paneo infinito** con arrastre de ratón.
   - Nodos de red:
     - Dibuja cada equipo como un nodo circular o píldora estilizada con gradiente, borde luminoso y su icono correspondiente.
     - Muestra el nombre del equipo y la dirección IP claramente legibles.
     - Arrastre de nodos interactivo con el ratón (`mousedown`, `mousemove`, `mouseup`): al mover un nodo, sus coordenadas `(x, y)` se actualizan inmediatamente y se persisten en el Store sin perder su posición al alternar de vista.
   - Enlaces de Cableado:
     - Conexiones renderizadas como **Curvas de Bézier cúbicas suaves** (`bezierCurveTo`).
     - Codificación por color según el tipo de cable:
       - Cobre / Ethernet Cat6: Azul `#38bdf8`
       - Fibra Óptica Monomodo/Multimodo: Verde `#10b981`
       - Cable DAC (Direct Attach Copper): Naranja `#f97316`
     - Grosor proporcional y etiquetas opcionales en el punto medio de la curva indicando el puerto de origen y destino.
   - Botón de **Auto-Layout / Distribución**: Algoritmo matemático sencillo (radial o por niveles) para reordenar automáticamente los nodos en el canvas en caso de superposición.

#### D. Panel Derecho (280px)
- Pestañas superiores: **Outliner** (Estructura de Árbol) y **Inspector** (Propiedades).
- **Outliner**:
  - Vista en árbol jerárquica: `Sala > Gabinetes > Equipos montados`.
  - Iconos de estado y selección bidireccional: hacer clic en un equipo en el Outliner lo resalta con brillo tanto en la vista física como en la topología.
  - Botones de acción rápida por nodo (Editar propiedades, Borrar equipo).
- **Inspector y Estadísticas**:
  - Formulario reactivo para editar propiedades del objeto seleccionado actualmente:
    - Si es un Equipo: Cambiar Nombre, IP, Máscara, Gateway, Consumo en Watts, VLAN y Cara de montaje.
    - Si es un Rack: Cambiar Nombre, Altura en U (4U a 48U), Color del chasis.
    - Si no hay selección: Muestra el resumen global de telemetría del datacenter:
      - Total de Equipos montados vs Equipos de Piso.
      - Espacio U total ocupado y % de ocupación del datacenter.
      - Potencia total consumida estimada (kW/h).
      - Peso acumulado en racks (kg).
      - Total de cables conectados y puertos libres.

#### E. Panel Inferior Desplegable (230px)
- Pestañas intercambiables:
  - **Tabla de Inventario de Dispositivos**: Lista tabular con buscador interno, mostrando Columnas de ID, Nombre, Tipo, Rack, Posición U, Consumo Watts, Dirección IP y Acciones.
  - **Tabla de Conexiones de Red**: Lista tabular de todas las tiradas de cableado (Dispositivo Origen, Puerto Origen, Dispositivo Destino, Puerto Destino, Tipo de Cable, Longitud estimada).
- Botón directo para `Descargar Inventario (.CSV)` procesado en el hilo local del navegador.

#### F. Modales Emergentes (Puros en HTML/CSS/JS)
- Modales centrados con fondo oscurecido y desenfoque (`backdrop-filter: blur(8px)`):
  - **Modal de Nueva Conexión de Cable**: Permite seleccionar Dispositivo A + Puerto disponible, Dispositivo B + Puerto disponible, Tipo de medio (Cobre/Fibra/DAC) y color del cable.
  - **Modal de Configuración de Rack**: Para crear o modificar gabinetes existentes.
  - **Modal de Autenticación / PIN**: Ventana modal que solicita el PIN de administrador con teclado visual y campo password.

---

### 6. CÓDIGO DEFENSIVO Y ROBUSTEZ TÉCNICA

1. **Prevención de `TypeError` en Renderizado**:
   - Aplica encadenamiento opcional exhaustivo en todas las propiedades anidadas (`dev.network?.ip || 'Sin IP'`, `dev.credentials?.user || 'N/A'`).
   - Los métodos de renderizado de tablas e inspector deben admitir ser llamados sin parámetros o con contenedores nulos sin detener la ejecución de la aplicación.
2. **Sin Fugas de Memoria en Canvas**:
   - Al redibujar el canvas de topología, limpia el contexto con `ctx.clearRect(0, 0, width, height)` antes de pintar el frame.
3. **Validación de Datos en Importación**:
   - Si el usuario carga un archivo `.json` corrupto o con formato inválido, captura el error con `try-catch`, muestra una notificación toast en pantalla y no corrompas el estado actual en memoria.

---

### RESULTADO ESPERADO
Genera el documento HTML5 completo y autocontenido. El archivo debe empezar con `<!DOCTYPE html>`, incluir todo el CSS en `<style>`, el maquetado semántico en `<body>`, el dataset demo preconfigurado y la totalidad de la lógica JavaScript en `<script>`, entregando una herramienta visual impactante, interactiva, fluida y 100% lista para ser ejecutada inmediatamente sin ningún tipo de compilación o servidor.
```

---

### 💡 Ventajas de este Enfoque de Prototipo Autocontenido

1. **Portabilidad Inmediata**: Cualquier persona del equipo, cliente o evaluador puede abrir el archivo con un doble clic en Chrome, Edge, Firefox o Safari (incluso desde una memoria USB o sin conexión a la red) y tener el datacenter funcionando de inmediato.
2. **Cero Dependencias Rotas**: Al no utilizar CDNs externos para fuentes o librerías de estilos, se elimina por completo el riesgo de que el prototipo falle en entornos corporativos con firewalls estrictos o sin salida a internet.
3. **Arquitectura Limpia y Escalable**: A pesar de ser un prototipo en un solo archivo, preserva la misma arquitectura reactiva por Proxy, el auto-saneamiento relacional y el control de acceso criptográfico que el proyecto principal.

---

> [!NOTE]
> **Recordatorio:** Conforme a las directrices de `.agents/AGENTS.md`, te recuerdo continuar con la implementación de las propuestas de mejoras pendientes detalladas en [mejoras.md](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md).