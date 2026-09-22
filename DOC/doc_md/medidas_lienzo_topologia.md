# Dimensiones y Medidas del Lienzo Central (Main Workspace - Vista Topología)

Este documento detalla las especificaciones de dibujo en Canvas 2D, coordenadas de renderizado, dimensiones de nodos, salas y racks, y la animación de conexiones en la vista de topología (`#view-topology`) de **RACK Designer Next**.

---

## 1. Lienzo de Dibujo (HTML5 Canvas 2D)

La topología de red se renderiza en un motor Canvas 2D desacoplado en 5 módulos (`TopologyModel.js`, `TopologyRenderer.js`, `TopologyInteraction.js`, `TopologyLayout.js`, `TopologyUI.js`), optimizado para alto rendimiento a 60 FPS sin sobrecargar el DOM:

*   **Contenedor (`#view-topology`):** Posicionado de forma absoluta (`position: absolute; inset: 0; z-index: 1;`) para rellenar el área `main`.
*   **Canvas (`#topology-canvas`):** Renderizado al 100% de ancho y alto con cursor interactivo de agarre (`grab` / `grabbing`).
*   **Grilla de Fondo (Malla):**
    *   Fondo global: Color azul oscuro de fondo (`var(--bg-main)`).
    *   Espaciado de la malla: Puntos de cuadrícula distribuidos cada **`40px` × `40px`**.
    *   Medida de los puntos: Círculos perfectos con un radio de **`1.5px`** y color blanco translúcido (`#ffffff22`).
*   **Sincronización Cromática:** Nodos y conexiones heredan de forma estricta los colores de las 8 familias del catálogo comercial (`#10b981` servidores, `#38bdf8` switches/patchpanels, `#f59e0b` routers, `#ef4444` firewalls, `#06b6d4` storage, `#f43f5e` seguridad/CCTV, `#eab308` UPS/energía, `#a855f7` periféricos de piso).

---

## 2. Escala, Zoom y Desplazamiento (Pan)

El motor de topología implementa navegación interactiva (arrastrar lienzo y zoom):

*   **Matriz de Transformación:**
    ```javascript
    ctx.translate(topoPanX, topoPanY);
    ctx.scale(topoZoom, topoZoom);
    ```
*   **Origen del Zoom:** Esquina superior izquierda (`0 0`).

---

## 3. Estructuras de Salas y Racks (Agrupadores en Canvas)

### 🏢 1. Salas (Rooms)
*   **Bordes Redondeados:** Radio de curvatura de **`24px`**.
*   **Borde Contorno (`strokeStyle`):** Ancho de `3px` (color óxido `#c2410c`) o **`4px`** de color blanco (`#ffffff`) si representa la sala actualmente seleccionada por el usuario.
*   **Fondo (`fillStyle`):** Color naranja `#f97316` (con opacidades dinámicas según el foco).
*   **Etiqueta de Título:** Fuente `bold 24px 'Space Grotesk'`, pintada con un desplazamiento de **`x + 24`**, **`y + 40`**.
*   **Selector de Redimensionamiento (Resize Handle):** Triángulo de control ubicado en la esquina inferior derecha dibujado con coordenadas relativas:
    *   `moveTo(pos.x + size.w - 20, pos.y + size.h)`
    *   `lineTo(pos.x + size.w, pos.y + size.h - 20)`
    *   `lineTo(pos.x + size.w, pos.y + size.h)`

### 📁 2. Racks (Gabinetes)
*   **Bordes Redondeados:** Radio de curvatura de **`12px`**.
*   **Borde Contorno:** Ancho de `2px` en color blanco.
*   **Fondo:** Color verde `#65a30d`.
*   **Etiqueta de Título:** Fuente `bold 16px 'Space Grotesk'`, pintada con desplazamiento de **`x + 15`**, **`y + 25`**.
*   **Selector de Redimensionamiento:** Triángulo reducido en la esquina inferior derecha:
    *   `moveTo(pos.x + size.w - 16, pos.y + size.h)`
    *   `lineTo(pos.x + size.w, pos.y + size.h - 16)`
    *   `lineTo(pos.x + size.w, pos.y + size.h)`

---

## 4. Medidas de los Nodos (Dispositivos)

La interfaz permite conmutar dinámicamente entre dos estilos visuales para los nodos del catálogo de red:

### 🔵 Estilo de Círculos (`TOPOLOGY_STYLE = 'circle'`)
*   **Radio Base del Nodo (`r`):** **`22px`** (diámetro total de `44px`).
*   **Aureola de Selección (Halo):**
    *   Estado regular: Aureola con radio de **`r + 4`** (`26px`) y color blanco translúcido (`#ffffff22`).
    *   Estado enfocado (hover): Aureola incrementada a **`r + 6`** (`28px`) con color blanco destacado (`#ffffff66`).
*   **Círculo Central:** Relleno de `#0f172a` con borde de color asignado a la categoría (`TYPE_COLORS`) de **`2.5px`** de grosor.
*   **Icono Interno:** Dibujado al centro con medidas de **`20px` × `20px`**.
*   **Etiquetas Textuales:**
    *   **Nombre del Equipo:** Fuente `bold 11px "Space Grotesk"` posicionado a `x`, `y - r - 26`.
    *   **Etiqueta de IP:** Escrita con fuente `bold 10px "JetBrains Mono"`. Se renderiza dentro de una pastilla o caja con bordes redondeados (`4px`) y relleno de color claro, calculando su ancho dinámicamente según la longitud de la IP con un relleno lateral extra de `6px`.

### 🎴 Estilo de Tarjetas (`TOPOLOGY_STYLE = 'card'`)
*   **Medidas del Rectángulo:** Ancho de **`150px`** y altura de **`50px`** (con un buffer de layout en rejilla de `160px` × `60px`).
*   **Bordes Redondeados:** Radio de curvatura de **`8px`**.
*   **Aureola de Selección:** Caja externa incrementada en **`8px`** en ancho y alto (`cx - 4, cy - 4` a `cardW + 8, cardH + 8`) con relleno blanco al `20%`.
*   **Contorno:** Grosor de `2.5px` con color de categoría.
*   **Icono Interno:** Dibujado a la izquierda con tamaño de **`16px` × `16px`** con coordenadas `cx + 12, cy + 12`.
*   **Textos:**
    *   Nombre: `bold 12px "Space Grotesk"` alineado a la izquierda en `cx + 36, cy + 18`.
    *   IP: `11px "JetBrains Mono"` color gris atenuado (`#94a3b8`) en `cx + 36, cy + 34`.

---

## 5. Medidas y Animación de Conexiones (Cables)

Las líneas de red entre equipos se trazan mediante Curvas Bézier Cúbicas interactivas:

*   **Trazado de Coordenadas:**
    *   Punto de Origen: $(x_1, y_1)$ (Coordenada central del dispositivo origen).
    *   Punto de Destino: $(x_2, y_2)$ (Coordenada central del dispositivo destino).
    *   Punto de Control 1: $(cx_1, cy_1)$ donde $cx_1 = x_1 + (x_2 - x_1) \times 0.5$ y $cy_1 = y_1$.
    *   Punto de Control 2: $(cx_2, cy_2)$ donde $cx_2 = x_1 + (x_2 - x_1) \times 0.5$ y $cy_2 = y_2$.
*   **Grosor de Línea (`lineWidth`):**
    *   Cable Inactivo: `1.5px` con opacidad de `0.2`.
    *   Cable Activo / Enfocado: **`3px`** con opacidad de `1.0` (color hexadecimal correspondiente).
*   **Partículas de Flujo Animado:**
    *   Frecuencia: **`4` partículas** fluyendo de forma constante a lo largo de la curva.
    *   Dimensiones: Círculos perfectos con radio de **`3.5px`** (`ctx.arc`).
    *   Efecto de Brillo: Sombra de brillo difuminado de **`8px`** (`shadowBlur`) coincidiendo con el color del cable.

---

## 6. Panel de Información Flotante (HUD Tooltip)

Al pasar el cursor sobre un nodo del lienzo, se dibuja un HUD informativo cerca del puntero del ratón:

*   **Dimensiones de Caja:** Ancho de **`180px`** y altura de **`100px`** con bordes de `8px`.
*   **Fondo:** Color oscuro opaco al `95%` (`rgba(15, 23, 42, 0.95)`).
*   **Detalle de Posicionamiento:**
    *   Espaciado del cursor: Desplazamiento de **`+20px`** en X e Y respecto a la posición del mouse.
    *   Control de Límites: Si la caja sobrepasa el ancho del canvas ($W$), se desplaza hacia la izquierda del puntero. Si sobrepasa la altura ($H$), se desplaza hacia arriba.
*   **Tipografía de Contenidos:**
    *   Nombre del equipo: `bold 13px "Space Grotesk"` (altura Y: `+24px`).
    *   Atributos (Tipo, IP, Usuario, Clave): `11px "JetBrains Mono"` espaciados verticalmente cada **`15px`** (alturas Y de `44px`, `59px`, `74px`, y `89px`).

---

## 7. Esquemas y Proporciones

### 📐 Medidas de los Nodos (Círculo vs Tarjeta en Canvas)

```text
  NODO ESTILO CÍRCULO                      NODO ESTILO TARJETA (Width: 150px)
       ▲                                  ◄────────────── 150px ─────────────►
       │ Aureola: r + 4 (26px)            ┌──────────────────────────────────┐ ▲
       ▼                                  │ ┌────┐  Nombre de Dispositivo    │ │ 50px
     ┌───┐ ▲                              │ │Icon│  (12px, bold, white text) │ │
   ┌─┤img├─┐│                             │ └────┘  IP (11px, Mono, gray)    │ │
   │ └───┘ ││ Radio: 22px                 └──────────────────────────────────┘ ▼
   └───────┘▼                             ◄─20px─►◄───────────130px──────────►
   ◄─44px──►
```

### 🗺️ Diagrama del Flujo de Coordenadas de Cables Bézier

```text
  Origen (x1, y1)
      ●──────────────┐
                     │ <- Punto de Control 1 (cx1, cy1)
                     │
                     │  (Curva Bézier Cúbica)
                     │
                     │ <- Punto de Control 2 (cx2, cy2)
                     └──────────────●
                                Destino (x2, y2)
```
