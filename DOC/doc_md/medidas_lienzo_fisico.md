# Dimensiones y Medidas del Lienzo Central (Main Workspace - Vista Física)

Este documento detalla el esquema de layout, dimensiones de los racks, celdas de equipos, vista trasera, equipos de piso y zoom en el lienzo central de la vista física (`#view-physical`) de **RACK Designer Next**.

---

## 1. Contenedor del Lienzo (`#view-physical`)

El lienzo central de la vista física aloja los gabinetes interactivos en 2D y la sección inferior de equipos de piso.

```css
#view-physical {
  padding: 24px; /* Margen interno alrededor del lienzo */
  overflow: auto; /* Scroll bidimensional independiente */
  height: 100%;
  position: relative;
  z-index: 1;
}
```

### 🧱 Contenedor de Contenido (`#view-physical-content`)
Las tarjetas de racks y la sección de piso se organizan mediante Flexbox:
*   **Separación entre Racks:** **`72px`** (espaciado dinámico horizontal y vertical definido mediante Flexbox — equivale a 3U).
*   **Layout:** Flexbox horizontal (`display: flex`, `flex-wrap: wrap`, `gap: 72px`).
*   **Alineación:** Alineado al inicio vertical (`align-content: flex-start`).
*   **Zoom Origin:** `transform-origin: 0 0;` (punto de anclaje para los cálculos de escala y zoom sin alterar las coordenadas de arrastre).

---

## 2. Dimensiones y Anatomía del Rack

El chasis del gabinete (`.rack-card`) tiene medidas proporcionales fijas para evitar deformaciones en las faceplates de los equipos:

*   **Ancho Total Estimado:** **`280px`**
    *   Rieles laterales (`.rack-rail-left`/`.rack-rail-right`): `20px` cada uno.
    *   Área central útil (`.rack-slots`): Fijo **`240px`** (proporcional: 10 veces el tamaño de la unidad U).
*   **Altura Total:** Ajustable dinámicamente según la cantidad de unidades U configuradas:
    
    $$\text{Altura (px)} = (\text{Cantidad de U} \times 24\text{px}) + 38\text{px (cabecera)}$$

*   **Altura de 1 U:** Fijo **`24px`** (`--rack-unit-h`). Tanto ranuras (`.rack-slot`) como marcadores laterales (`.rail-unit`) tienen esta altura estricta.

---

## 3. Lógica de Rotación 3D (Vista Trasera / Flip)

El sistema soporta rotación en 3D para visualizar la distribución de cables, PDU y conexiones en la parte trasera del rack:

*   **Perspectiva:** `.rack-wrapper` define `perspective: 1200px;`.
*   **Efecto Flip:** Al aplicar la clase `.flipped` en `.rack-flipper`, se realiza una rotación de 180 grados sobre el eje Y: `transform: rotateY(180deg);` con transición de `0.65s cubic-bezier(0.4, 0, 0.2, 1)`.
*   **Caras:**
    *   **Frontal (`.rack-face`):** Visible y activa por defecto.
    *   **Trasera (`.rack-rear`):** Posicionada con `position: absolute` y rotada Y a `180deg`. Desactiva sus eventos del DOM en estado frontal, y los activa únicamente al voltearse.

---

## 4. Medidas Especiales de la Vista Trasera

La vista trasera del rack muestra un panel de control técnico con medidas optimizadas para micro-detalles:

*   **Rieles de Unidades Traseras (`.rear-slot-unit`):** Ancho reducido a **`20px`**.
*   **Ranuras Traseras (`.rear-slot`):** Altura mínima de **`24px`**.
*   **Tomas de Red / RJ45 (`.rear-port-jack`):**
    *   Dimensiones: **`10px` × `7px`** con bordes de `2px`.
    *   Conector Interno Activo (`::after`): Medida de **`4px` × `3px`** en color de cable coincidente.
    *   Etiqueta de Puerto (`.rear-port-label`): Ancho máximo de `24px` y fuente pequeña de `6px`.
*   **Tomas de Corriente PDU (`.rear-outlet`):** Círculo de **`10px` × `10px`**. Al estar conectada (`.used`), cambia su fondo a azul oscuro y su borde a color naranja de advertencia (`#f59e0b`).

---

## 5. Sección de Equipos de Piso (`.floor-section`)

Cuando los dispositivos no están montados en racks (ej. Cámaras, impresoras, APs), se listan en una sección inferior:

*   **Contenedor (`.floor-section`):** Ancho del **`100%`**, margen superior de `32px` y borde dashed de `1px`.
*   **Rejilla de Equipos (`.floor-devices-grid`):**
    *   Layout: Grid con relleno automático (`grid-template-columns: repeat(auto-fill, minmax(140px, 180px));`).
    *   Ancho Máximo del Equipo: Fijo estricto en **`180px`** para prevenir la desproporción.
    *   Espaciado: Relleno de `16px` y separación de `gap: 12px`.
*   **Tarjeta del Dispositivo (`.floor-device-card`):**
    *   Relleno: `12px 14px` con borde izquierdo resaltado de `3px` según el color asignado.
    *   Hover: Efecto de deslizamiento de gradiente (`translateX(100%)`) y elevación de `-2px` (`transform: translateY(-2px)`).
*   **Icono de Piso (`.floor-device-icon`):**
    *   Dimensiones: Caja de **`36px` × `36px`** con bordes de `6px`.
    *   Hover: Escala `1.1x` y rotación sutil de `3°` (`transform: scale(1.1) rotate(3deg)`).

---

## 6. Geometría y Matemáticas del Enrutamiento Segregado de Cables (3 Zonas)

La capa SVG (`#physical-cables-svg`) renderiza conexiones ortogonales limpias con esquinas redondeadas de precisión milimétrica ($r = 6\text{px}$) utilizando 3 zonas físicas estrictamente segregadas:

### 🛫 Zona 1: Canastillo Superior / Bandeja Aérea (Inter-Rack)
Aplica a conexiones entre equipos alojados en dos gabinetes distintos (`p1.isRack && p2.isRack`).
*   **Elevación Aérea:**
    $$\text{overheadY} = \min(\text{RackTop}) - 14\text{px} - (\text{index} \pmod 7) \times 5\text{px}$$
    El cable asciende por el pasillo lateral y viaja por encima del gabinete más alto, evitando cualquier cruce con equipos de rack.
*   **Salida y Entrada Lateral Inteligente:**
    *   Si el destino está a la derecha: emerge por el riel derecho (`p1.rightEdgeX + 8 + (index % 4) * 4`).
    *   Si el destino está a la izquierda: emerge por el riel izquierdo (`p1.leftEdgeX - 8 - (index % 4) * 4`).

### 🛣️ Zona 2: Canaleta Media Segregada (Equipos de Piso ↔ Racks)
Aplica a enlaces entre periféricos de piso (CCTV, APs, impresoras) y switches/patch panels en racks (`pFloor` y `pRack`).
*   **Troncal Horizontal Intermedia:**
    $$\text{middleGutterY} = \max(\text{RackBottom}) + 18\text{px} + (\text{index} \pmod 6) \times 4\text{px}$$
    Discurre en el espacio libre entre el borde inferior de los racks y el borde superior de la sección de piso, impidiendo que los cables sobrevuelen las tarjetas de periféricos.
*   **Ascenso por Pasillo Inter-Rack:**
    $$\text{rackGutterX} = \text{pRack.edgeX} \pm (8\text{px} + (\text{index} \pmod 4) \times 4\text{px})$$
    El cable sube limpiamente por la separación lateral de **`72px`** del rack de destino e ingresa ortogonalmente al puerto del dispositivo.

### 🗄️ Zona 3: Organizador Lateral (Mismo Rack / Intra-Rack)
Aplica a conexiones internas dentro del mismo gabinete (`p1.rackId === p2.rackId`).
*   **Mismo Dispositivo (Loopback/Puertos Adyacentes):** Curva suave de Bézier cúbica (`C`) con arco de compensación.
*   **Entre Diferentes Slots:**
    $$\text{gutterX} = \text{p1.rightEdgeX} + 8\text{px} + (\text{index} \pmod 5) \times 4\text{px}$$
    Sale horizontalmente hacia el organizador lateral vertical, viaja en línea recta y entra en el slot de destino.

---

## 7. Diagramas de Layout del Workspace Físico

### 🗺️ Jerarquía de Contenedores de Vista Física (Mermaid)

```mermaid
graph TD
    subgraph Workspace ["Lienzo Físico (#view-physical) - Scroll: Auto"]
        direction TB
        subgraph Content ["Content Wrap (#view-physical-content) - Gap: 72px"]
            direction LR
            Rack1[".rack-wrapper (Rack 1)<br/>Ancho: 280px"]
            Rack2[".rack-wrapper (Rack 2)<br/>Ancho: 280px"]
            
            subgraph Floor ["Sección de Piso (.floor-section) - Ancho: 100%"]
                direction LR
                F1[".floor-device-card (Max W: 180px)"]
                F2[".floor-device-card (Max W: 180px)"]
            end
        end
    end

    Rack1 --> Floor
    Rack2 --> Floor
    
    style Workspace fill:#0b0f19,stroke:#1e2d4a,stroke-width:2px,color:#f3f4f6
    style Content fill:#111827,stroke:#1f2937,stroke-width:1px,color:#f3f4f6
    style Rack1 fill:#1a2235,stroke:#25304b,stroke-width:1px,color:#f3f4f6
    style Rack2 fill:#1a2235,stroke:#25304b,stroke-width:1px,color:#f3f4f6
    style Floor fill:#111827,stroke:#2e3d5a,stroke-width:1px,color:#f3f4f6
```

### 📐 Proporciones de Rack y Piso (Pixeles)

```text
  RACK FRONT / REAR VIEW (Width: 280px)
 ◄── 20px ──►◄───────────── 240px ──────────────►◄── 20px ──►
 ┌──────────┬────────────────────────────────────┬──────────┐ ▲ 
 │ Riel Izq │        CABECERA (Alto: 38px)       │ Riel Der │ │ 38px
 ├──────────┼────────────────────────────────────┼──────────┤ ▼ 
 │          │        Slot U1 (Alto: 24px)        │          │ ▲ 
 ├──────────┼────────────────────────────────────┼──────────┤ │  Cuerpo 
 │          │        Slot U2 (Alto: 24px)        │          │ │  (U * 24px)
 ├──────────┼────────────────────────────────────┼──────────┤ │  
 │          │        Slot U3 (Alto: 24px)        │          │ │ 
 └──────────┴────────────────────────────────────┴──────────┘ ▼ 
 
 
  FLOOR DEVICE CARD (Max Width: 180px)
 ◄─────────────────────── Max 180px ───────────────────────►
 ┌───┬──────────────────────────────────────────────────────┐ ▲ 
 █ 3 │  [Icono]    Nombre de Dispositivo                    │ │ 48px
 █ px│  36x36px    IP / Detalles                            │ │ 
 └───┴──────────────────────────────────────────────────────┘ ▼ 


  DOS RACKS LADO A LADO — Separación entre gabinetes: gap: 72px (3U)
 ◄──────── 280px ───────────────────►◄─────── 72px ───────►◄──────── 280px ───────────────────►
 ┌──────────────────────────────────┐                       ┌──────────────────────────────────┐ ▲
 │  Riel │  CABECERA (38px)  │Riel  │◄────── gap (72px) ───►│  Riel │  CABECERA (38px)  │Riel  │ │ 38px
 ├───────┼───────────────────┼──────┤        = 3 U          ├───────┼───────────────────┼──────┤ ▼
 │       │   Slot U1 (24px)  │      │                       │       │   Slot U1 (24px)  │      │ ▲
 ├───────┼───────────────────┼──────┤                       ├───────┼───────────────────┼──────┤ │
 │       │   Slot U2 (24px)  │      │                       │       │   Slot U2 (24px)  │      │ │ Cuerpo
 ├───────┼───────────────────┼──────┤                       ├───────┼───────────────────┼──────┤ │ (U * 24px)
 │       │   Slot U3 (24px)  │      │                       │       │   Slot U3 (24px)  │      │ │
 └───────┴───────────────────┴──────┘                       └───────┴───────────────────┴──────┘ ▼
 ◄──────────────── 280px ──────────►◄──────── 72px ─────────►◄──────────────── 280px ──────────►
      RACK 1 (.rack-wrapper)             Flexbox gap              RACK 2 (.rack-wrapper)
                                         = 3 U (72px)

  Nota: el gap de 72px se define en rack.js (líneas 124 y 126) mediante:
    style="display:flex; flex-wrap:wrap; gap:72px; ..."
  Este gap es consistente tanto horizontal (entre racks en la misma fila)
  como vertical (entre filas de racks al hacer wrap).
```

