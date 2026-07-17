# Dimensiones y Medidas del Layout de la Interfaz

Este documento centraliza y detalla el esquema de rejilla (CSS Grid), anchos, alturas y reglas de diseño que componen la interfaz de usuario de **RACK Designer Next**.

---

## 1. Rejilla Estructural Principal (CSS Grid)

El contenedor principal del sistema (`#app`) utiliza un diseño bidimensional implementado con CSS Grid, dividido en 3 filas y 3 columnas:

```css
#app {
  display: grid;
  grid-template-rows: var(--header-h) minmax(0, 1fr) auto;
  grid-template-columns: var(--sidebar-w) 1fr var(--right-panel-w);
  grid-template-areas:
    "header  header        header"
    "sidebar main          right-panel"
    "bottom  bottom        bottom";
  height: 100vh;
  overflow: hidden;
}
```

### 📊 Tabla de Dimensiones de Rejilla (Escritorio)

| Elemento | Área Grid | Ancho | Alto | Comportamiento |
| :--- | :---: | :---: | :---: | :--- |
| **Cabecera (`#header`)** | `header` | `100%` | `56px` (`--header-h`) | Fijo en la parte superior. |
| **Barra Lateral (`#sidebar`)** | `sidebar` | `50px` (`--sidebar-w`) | Flex | Fijo a la izquierda, contiene iconos de categoría. |
| **Lienzo Central (`#main`)** | `main` | `1fr` (Restante) | Flex (`minmax(0, 1fr)`) | Contenedor principal de vistas (Física/Topología). |
| **Panel Derecho (`#right-panel`)** | `right-panel` | `300px` (`--right-panel-w`) | Flex | Contiene el Outliner, Inspector y Estadísticas. |
| **Panel Inferior (`#bottom`)** | `bottom` | `100%` | `220px` (`--bottom-h`) | Pestañas de inventario/conexiones. Colapsable. |

---

## 2. Dimensiones Detalladas por Componente

### ⚡ HEADER (Cabecera)
*   **Altura Total:** `56px` (`--header-h`).
*   **Área de Logo (`.header-logo-area`):** Ancho fijo de `260px`, alineado a la izquierda con borde derecho separator de `1px`.
*   **Área Principal (`.header-main-area`):** `flex: 1` para ocupar el espacio restante. Contiene las pestañas de sala, racks y controles globales.

### 📁 BARRA LATERAL & CATÁLOGO FLOTANTE
*   **Barra de Iconos (`#sidebar`):**
    *   Ancho: `50px`.
    *   Alineación: `justify-self: start`.
    *   Z-Index: `10` (por debajo del catálogo flotante).
*   **Catálogo Flotante (`#catalog-flyout`):**
    *   Ubicación: Comparte el área grid `sidebar`.
    *   Ancho: `210px`.
    *   Alineación: `justify-self: end`.
    *   Z-Index: `50` (flota sobre el lienzo central `#main` extendiéndose hacia la derecha de la barra lateral).

### 📐 LIENZO CENTRAL (`#main`)
*   **Grid de Fondo (Dotgrid):** Renderizado con un gradiente radial con puntos (`var(--grid-dot)`) de `1px` espaciados en una cuadrícula de **`28px` × `28px`** con opacidad de `0.4`.

### 📋 PANEL DERECHO (`#right-panel`)
El panel derecho se subdivide en tres secciones organizadas verticalmente con `flex-direction: column`:
1.  **Outliner (`#outliner-section`):** `flex: 0 1 auto` con una altura máxima restringida a **`25%`** para evitar el desplazamiento excesivo.
2.  **Inspector (`#inspector-section`):** `flex: 1` para absorber dinámicamente todo el espacio vertical sobrante.
3.  **Estadísticas (`#stats-section`):** Altura fija con `flex: 0 0 170px` en la parte inferior del panel.

### 📊 PANEL INFERIOR (`#bottom`)
*   **Altura Expandido:** `220px` (`--bottom-h`).
*   **Altura Colapsado (Clase `.collapsed`):** Reducido estrictamente a **`38px`** (solo visible la barra de pestañas).
*   **Transiciones:** Animado suavemente mediante cambios de altura y transformaciones CSS.

---

## 3. Normalización Matemática Estricta

Para mantener consistencia estética de acuerdo al Design System, todos los controles interactivos básicos de la interfaz tienen dimensiones unificadas por CSS:

*   **Altura Única de Controles:** **`24px`** de altura fija con `box-sizing: border-box`.
*   **Elementos Afectados:**
    *   Botones principales y secundarios (`.btn-primary`, `.btn-secondary`, `.btn-cancel`, `.btn-confirm`).
    *   Pestañas de control (`.tab-pill`, `.view-tab`, `.filter-tab`, `.room-tab`).
    *   Botones de cabecera e iconos de barra superior (`.h-btn`).
    *   Entradas de texto, números, contraseñas y selectores (`input[type="text"]`, `input[type="number"]`, `input[type="password"]`, `select`).

---

## 4. Adaptabilidad y Responsividad (Breakpoints)

### 📱 Vista de Tableta (`max-width: 1024px`)
*   **Estructura Grid:** Se reconfigura a dos columnas principales: `grid-template-columns: 60px 1fr;`
*   **Ocultación:** El panel derecho (`#right-panel`) se oculta y la barra lateral de iconos pasa de `50px` a `60px` de ancho.
*   **Simplificación:** Textos secundarios y píldoras de capacidad detalladas del catálogo se ocultan para maximizar la legibilidad.

### 📱 Vista de Móvil (`max-width: 768px`)
*   **Estructura Grid:** Se aplana a una sola columna vertical:
    ```css
    #app {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "header"
        "main"
        "bottom";
    }
    ```
*   **Cabecera:** Se expande verticalmente (`height: auto`). La marca superior y los controles principales se dividen en dos líneas con scroll horizontal independiente para evitar desbordes.
*   **Barra Lateral Móvil (Menú Desplegable):**
    *   Se comporta como un cajón flotante (`position: fixed`) sobre toda la pantalla.
    *   Ancho: **`85%`** del viewport (con un máximo de `320px`).
    *   Desplazamiento: Animación de deslizamiento de izquierda a derecha (`left: -100%` a `left: 0`) mediante la clase `.open`.
    *   Capa de oscurecimiento trasera (`#mobile-overlay`) con z-index `9998`.
*   **Panel Inferior Fullscreen:** Al hacer clic en "Expandir", el panel inferior toma el **`85vh`** de la pantalla para permitir la visualización cómoda de las tablas de datos en pantallas táctiles.

---

## 5. Diagramas del Layout

### 🗺️ Estructura del Grid Principal (Mermaid)

```mermaid
grid
    %% Diagrama estructural del grid de app
    header:3 header:3 header:3
    sidebar:1 main:1 right-panel:1
    bottom:3 bottom:3 bottom:3
```

### 📐 Esquema Visual de Proporciones (Píxeles)

```text
┌────────────────────────────────────────────────────────────────────────┐ ▲
│                       HEADER (Alto: 56px)                              │ │ 56px
├─────────┬───────────────────────────────────────────────────┬──────────┤ ▼
│ SIDEBAR │                                                   │  RIGHT   │ ▲
│ (Iconos)│               MAIN WORKSPACE                      │  PANEL   │ │
│         │              (Lienzo principal)                   │          │ │
│         │                                                   │ Outliner │ │
│         │                                                   │  (25%)   │ │
│         │                                                   ├──────────┤ │ minmax(0, 1fr)
│  Ancho  │                   Dotgrid                         │          │ │ (Restante)
│  50px   │                 28px x 28px                       │Inspector │ │
│         │                                                   │  (Flex   │ │
│         │                                                   │  fill)   │ │
│         │                                                   ├──────────┤ │
│         │                                                   │  Stats   │ │
│         │                                                   │ (170px)  │ │
├─────────┴───────────────────────────────────────────────────┴──────────┤ ▼
│                       BOTTOM PANEL (Inventario / Tablas)               │ ▲
│                       Alto: 220px (Colapsa a 38px)                     │ │ 220px
└────────────────────────────────────────────────────────────────────────┘ ▼
◄─ 50px ─►◄────────────────────── 1fr ───────────────────────►◄─ 300px ──►
```
