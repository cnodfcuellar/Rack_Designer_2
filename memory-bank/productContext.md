# Product Context

## Why this project exists
Las herramientas tradicionales de gestión de infraestructura de centros de datos (DCIM) suelen ser excesivamente complejas, costosas, atadas a suscripciones en la nube o dependientes de pesadas pilas de servidores backend.

Rack Designer Next surge para ofrecer una solución ultra liviana, inmediata, privada y 100% autónoma en el navegador. Funciona como una mesa de dibujo digital técnica para ingeniería de datacenter, permitiendo documentar salas complejas en segundos, trabajar sin conexión a internet y mantener la soberanía absoluta de los datos de infraestructura.

## Problems it solves
- **Trazabilidad física y lógica de cableado:** Mapeo claro de puertos de origen y destino, tipo de cable, polaridad y canalizaciones segregadas (bandeja aérea de techo vs. piso técnico).
- **Control milimétrico de capacidad y espacio en U:** Prevención de colisiones de slots físicos, balanceo gravitacional de peso y cálculo instantáneo de ocupación, potencia y balance energético por rack.
- **Visualización integral multifacética:** Alternancia fluida entre alzado físico 3D (frontal y trasera de gabinetes), árbol estructural jerárquico (Outliner con clasificación multinivel) y diagrama topológico lógico de red (Canvas 2D con layouts automáticos).
- **Personalización estética y documental:** Representación visual mediante carátulas vectoriales realistas y presets isométricos offline (`assets/img/`) para clientes finales y reportes de auditoría.
- **Portabilidad y resiliencia de datos:** Exportaciones de grado de auditoría en Excel/CSV (con hojas de valor de referencia) y capturas PNG 1:1 en resolución Retina sin degradación.

## UX Goals
- **Estética Datacenter Premium:** Diseño visual inmersivo con temas Oscuro, Claro y Sepia ergonómico, efectos de glassmorphism, sombras realistas de gabinete e iluminación LED activa.
- **Reactividad Inmediata a 60 FPS:** Cambios reflejados de manera instantánea en todas las vistas mediante el patrón de Proxy ES6, despacho selectivo con coalescencia `requestAnimationFrame` y actualizaciones granulares $O(1)$ por gabinete.
- **Cero Diálogos Bloqueantes y Flujo Intuitivo:** Erradicación total de `prompt()` nativo; toda interacción opera mediante modales HTML5 accesibles, drag & drop de catálogo asistido y atajos de teclado globales (Ctrl+Z / Ctrl+Y).
- **Despliegue Cero Configuración:** Funciona de forma instantánea abriendo `index.html` con Live Server o cualquier servidor estático local, garantizando compatibilidad total offline y esquema `file:///`.
