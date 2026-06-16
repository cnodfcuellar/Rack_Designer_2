# Diseño de Interfaz: Rack Designer 2 (DESIGN.md)

Este documento define el lenguaje visual y la arquitectura de interfaz para **Rack Designer 2**, actuando como fuente de verdad (Single Source of Truth) para Agentes de IA y desarrolladores. El objetivo principal es mantener un aspecto técnico, profesional y de grado "IDE", evitando el ruido visual o el estilo generativo sobrecargado ("AI Slop").

## 1. Filosofía de Diseño
- **Denso y Técnico:** La UI debe parecerse a una herramienta de ingeniería o un IDE profesional (como VS Code o un dashboard de Datadog). 
- **Minimalismo Funcional:** Sin adornos innecesarios. Se prohíben los degradados púrpura/violeta generativos y los bordes laterales gruesos en tarjetas.
- **Micro-Tipografía Fija:** En el canvas físico (dibujo de racks), los elementos miniatura (pantallas LCD, unidades U) tienen valores fijos (`7px` o `8px`) para garantizar que la escala de visualización sea realista e independiente del tamaño de fuente del sistema.

## 2. Tipografía (Jerarquía Reducida)
El proyecto utiliza un sistema de variables tipográficas estandarizado y reducido para lograr densidad visual.

* **Fuente UI Principal:** `'Outfit', sans-serif` (Jerarquía de lectura y paneles).
* **Fuente Monospace:** `'JetBrains Mono', monospace` (Para datos técnicos, direcciones IP y terminales).
* **Escala Global:**
  - `--text-xs`: 10px
  - `--text-sm`: 11px
  - `--text-base`: 12px
  - `--text-md`: 13px
  - `--text-lg`: 14px
  - `--text-xl`: 16px

## 3. Paleta de Colores
Se requiere contraste técnico estricto, abandonando colores lavanda/púrpura por acentos fríos y de alerta.

* **Fondo:** 
  - Main: `#0b0f19` (Negro abisal/Cyber).
  - Paneles: Variaciones de azules muy oscuros (`#151c2e`, `#171f30`, `#1a2235`).
* **Bordes:** `#25304b` (Muy sutiles, no intrusivos).
* **Acentos (Estado y Funcionalidad):**
  - **Acento Primario:** Cyan/Blue (`#0ea5e9`, `#06b6d4`).
  - **Éxito / Energía:** Green (`#10b981`).
  - **Advertencia / Capacidad:** Amber (`#f59e0b`).
  - **Error / Estadísticas Críticas:** Rose (`#f43f5e`). *No usar morados para alertas.*
* **Texto:** 
  - Principal: `#f0f4ff` (Blanco con tinte frío).
  - Secundario: `#8b9ab8`.
  - Muted: `#8496b0` (Ajustado para cumplir WCAG).

## 4. Sistema de Botones y Controles
Todos los controles interactivos y pestañas (botones, inputs de búsqueda, tabs de salas) deben adherirse a un modelo matemático para evitar asimetría:
- **Altura estandarizada:** `32px` visuales.
- **Padding:** `5px 14px` en botones, `4px 10px 4px 30px` en campos de búsqueda.
- **Alineación Flexbox:** `display: inline-flex; align-items: center; justify-content: center; gap: 6px;` (Garantiza alineación óptica perfecta entre iconos y texto).

## 5. Diseño de Barras de Herramientas
- No usar padding inferior extra para acomodar barras de scroll (`padding-bottom: 0`). En su lugar, el contenedor `.main-toolbar` debe usar `align-items: center` para centrar perfectamente todos los elementos.
- Los botones con iconos (como el zoom, exportar o rotación de rack) deben usar la clase `.h-btn` o no incluir texto, limitándose a mostrar el emoji/icono centrado.

## 6. Iconografía e Imágenes
- **Botones de Canvas:** No deben contener texto descriptivo pesado (ej. "Atrás", "Frente"), solo iconos (`🔄`, `🖥️`) para no saturar la vista.
- **Tooltip de Equipos:** Fondo translúcido con efecto `backdrop-filter: blur(12px)`.

## 7. Prácticas Prohibidas (Do Nots)
1. **NO inyectar clases de frameworks de utilidad** (como Tailwind) si rompen el encapsulamiento de `.style.css` vanilla del proyecto.
2. **NO modificar el tamaño de las fuentes del `#view-physical`**. Estos son hardcoded para simular un rack real y no dependen de la accesibilidad del sistema.
3. **NO usar colores purpuras/violetas generativos**. Sustituir siempre por variaciones de Rose (`#f43f5e`) o Cyan.
4. **NO agregar paddings dispares** a botones dentro del mismo layout horizontal. Deben compartir `padding: 5px 14px`.
