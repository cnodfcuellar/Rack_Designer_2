# Evolución de Componentes: Atomic Design en Rack Designer 2

A continuación se presenta un carrusel interactivo que explica cada uno de los 5 niveles de la metodología **Atomic Design**, mostrando de forma visual e individual cómo cada pieza pequeña evoluciona hasta conformar la aplicación completa.

## Carrusel de Evolución

````carousel
### ⚛️ Nivel 1: Átomo (Atom)
![Átomo](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/html/img/atomic_01_atom.svg)

**Explicación:**
El átomo es la pieza fundamental e indivisible de la interfaz de usuario. No se puede fraccionar más sin perder su función básica.

* **Ejemplos en tu proyecto:**
  * El espacio vacío individual de una unidad de rack (`.u-slot`).
  * Los botones flotantes individuales (`.btn` como zoom `+` o `-`).
  * Las variables CSS de color para el modo oscuro o modo claro.
  * Etiquetas de texto y campos inputs básicos vacíos.
<!-- slide -->
### 🧬 Nivel 2: Molécula (Molecule)
![Molécula](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/html/img/atomic_02_molecule.svg)

**Explicación:**
Las moléculas se forman al unir dos o más átomos. Adquieren una funcionalidad o significado más complejo del que tenían sus componentes por separado.

* **Ejemplos en tu proyecto:**
  * Un **Item de Catálogo** (combina el icono SVG de servidor + su etiqueta de nombre + el botón contextual `⋮`).
  * Un **Campo de Formulario** (combina el átomo Label + el átomo Input + un tooltip flotante).
  * Un **Puerto Activo** (combina el círculo indicador de puerto con la lógica de tooltip del cable conectado).
<!-- slide -->
### 🦠 Nivel 3: Organismo (Organism)
![Organismo](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/html/img/atomic_03_organism.svg)

**Explicación:**
Los organismos son secciones e interfaces de usuario complejas y autocontenidas creadas mediante la combinación de múltiples moléculas y átomos.

* **Ejemplos en tu proyecto:**
  * **El Gabinete (Rack) Físico:** Dibuja la estructura metálica del rack con la suma de slots U, indicando la ocupación delantera y trasera.
  * **El Modal de Edición:** Unifica moléculas de inputs de red, inputs de energía y botones de guardar.
  * **El Sidebar Off-Canvas:** Aloja la cuadrícula de estadísticas y el listado de componentes del catálogo.
<!-- slide -->
### 📐 Nivel 4: Plantilla (Template)
![Plantilla](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/html/img/atomic_04_template.svg)

**Explicación:**
Las plantillas definen la estructura general y la maquetación visual de la interfaz. Indican dónde se colocarán los organismos dentro del lienzo, sin inyectar datos reales (funcionan como wireframes).

* **Ejemplos en tu proyecto:**
  * **El Layout Principal (CSS Grid):** Define la posición estática de la cabecera (Header), el panel lateral (Sidebar) y el área de lienzo central (Canvas).
  * **El Canvas de Topología vacío:** Define las áreas de arrastre y nodos virtuales.
<!-- slide -->
### 🌐 Nivel 5: Página (Page)
![Página](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/html/img/atomic_05_page.svg)

**Explicación:**
La página representa el estado real de la aplicación con la plantilla rellenada con contenido representativo, lógica activa y datos reales del negocio.

* **Ejemplos en tu proyecto:**
  * **La Vista del Data Center Activa:** El layout mostrando los gabinetes específicos cargados con los datos del servidor de base de datos, routers y switches según el archivo `demoData.js`.
  * **El Lienzo de Topología con cables:** El lienzo con los nodos de red renderizados y los cables bezier activos calculados en tiempo real.
````

---

### ¿Cómo interpretar la jerarquía?
Observa que cada nivel engloba al anterior:
1. El **Átomo** (botón) está dentro de...
2. La **Molécula** (campo de entrada/acción) que está dentro de...
3. El **Organismo** (formulario modal o rack completo) que se posiciona en...
4. La **Plantilla** (esqueleto del layout) que finalmente se convierte en...
5. La **Página** (la aplicación en funcionamiento con tus datos de red reales).

## Estandarización AI y DESIGN.md (V2.0.1)
Para evitar la deriva visual (Visual Drift) por parte de herramientas de IA, se implementó el estándar `DESIGN.md`.
- **Estandarización Flexbox:** Todos los componentes de interacción tienen `height: 32px; display: inline-flex;`
- **Tipografía Densa:** Se restaron 2px a la escala global de fuentes manteniendo el hardcodeo de las vistas físicas de servidor, maximizando la apariencia de ingeniería.

## Densidad Visual (V2.0.2)
Se ha implementado el estándar `awesome-design-md` en el manifiesto principal. La regla de controles Flexbox se ha ajustado a `height: 24px` para una compresión extrema orientada a flujos de ingeniería. Se ha asegurado la interoperabilidad del Modo Claro desenlazando los colores del chasis físico.
