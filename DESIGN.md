---
version: 2.0.1
name: Rack-Designer-2-design-analysis
description: Rack Designer 2 is a professional Datacenter and Rack management tool built with an "IDE-grade" visual philosophy. It explicitly rejects modern consumer SaaS "generative slop" (no excessive paddings, no purple/violet gradients, no large soft shadows). Instead, it embraces a high-density, technical aesthetic using deep abyssal dark themes (#0b0f19), strictly unified 24px control heights for all interactive elements, and a precision typography system featuring 'Outfit' for UI chrome and 'JetBrains Mono' for technical readouts. The system is engineered to feel like VS Code or Datadog — a precision instrument for infrastructure engineers.

colors:
  bg-main: "#0b0f19"
  bg-card1: "#151c2e"
  bg-card2: "#1e293b"
  bg-panel: "#0f1524"
  border: "#2a3441"
  border-hover: "#3b4b5e"
  border-highlight: "#4a5b73"
  accent: "#38bdf8"
  accent-glow: "rgba(56, 189, 248, 0.15)"
  text-primary: "#f0f4ff"
  text-secondary: "#8b9ab8"
  text-muted: "#8496b0"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#f43f5e"

typography:
  font-ui:
    fontFamily: Outfit, sans-serif
  font-mono:
    fontFamily: JetBrains Mono, monospace
  text-xs:
    fontSize: 10px
    lineHeight: 1.2
  text-sm:
    fontSize: 11px
    lineHeight: 1.3
  text-base:
    fontSize: 12px
    lineHeight: 1.4
  text-md:
    fontSize: 13px
    lineHeight: 1.4
  text-lg:
    fontSize: 14px
    lineHeight: 1.5
  text-xl:
    fontSize: 16px
    lineHeight: 1.5
  lcd-mini:
    fontFamily: JetBrains Mono, monospace
    fontSize: 7px
  lcd-normal:
    fontFamily: JetBrains Mono, monospace
    fontSize: 8px

rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px

components:
  interactive-control:
    height: 24px
    boxSizing: border-box
    display: inline-flex
    alignItems: center
    justifyContent: center
  btn-primary:
    backgroundColor: "{colors.accent-glow}"
    textColor: "{colors.accent}"
    border: "1px solid {colors.accent}"
    padding: "0 10px"
    height: "{components.interactive-control.height}"
    rounded: "{rounded.md}"
    typography: "{typography.text-sm}"
  btn-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    border: "1px solid {colors.border}"
    padding: "0 10px"
    height: "{components.interactive-control.height}"
    rounded: "{rounded.md}"
  tab-pill:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    border: "none"
    padding: "0 10px"
    height: "{components.interactive-control.height}"
    rounded: "{rounded.md}"
  text-input:
    backgroundColor: "{colors.bg-card1}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    height: "{components.interactive-control.height}"
    rounded: "{rounded.md}"
---

## Overview

Rack Designer 2 se presenta como un simulador y gestor de centros de datos con una estética inflexible de grado IDE (Entorno de Desarrollo Integrado). A diferencia de las interfaces corporativas genéricas o los diseños de IA "trendy", este sistema prioriza la densidad de información, el contraste técnico y la exactitud matemática.

La tipografía y las alturas de caja están calculadas para aprovechar cada pixel de la pantalla sin fatigar la vista. Se utiliza `Outfit` para dar un aspecto limpio a la UI y `JetBrains Mono` como la tipografía utilitaria para todo lo que implique lectura de red (IPs, MACs, displays en servidores físicos).

**Características Clave:**
- Interfaz profunda y abisal: tonos azul medianoche (`#0b0f19`) y cian luminiscente (`#38bdf8`).
- Alturas interactivas estrictamente bloqueadas a `24px` para todos los controles.
- Eliminación total del ruido visual (cero degradados morados, cero grandes sombras difuminadas, cero paddings gigantes).

## Colors

### Brand & Surface
- **Canvas Principal** (`{colors.bg-main}`): El fondo abisal de la aplicación.
- **Paneles y Tarjetas** (`{colors.bg-card1}` y `{colors.bg-card2}`): Elevaciones sutiles para delimitar modales, barras laterales y cajas de contención.
- **Acento Técnico** (`{colors.accent}`): Cian puro. El único color primario autorizado para botones y elementos activos. Transmite una sensación de energía técnica, no de diseño lúdico.

### Text
- **Primario** (`{colors.text-primary}`): Blanco con tinte frío.
- **Secundario** (`{colors.text-secondary}`): Gris azulado para etiquetas y lectura densa.
- **Silenciado** (`{colors.text-muted}`): Datos inactivos o placeholders.

### Semantic Status
- **Actividad / Encendido** (`{colors.success}`): Verde para hardware activo o enlaces operacionales.
- **Advertencia / Capacidad** (`{colors.warning}`): Ámbar para sobrecargas o atención.
- **Error / Offline** (`{colors.danger}`): Rojo/Rose (nunca morado ni violeta) para hardware caído.

## Typography

### Filosofía
La escala tipográfica se redujo globalmente restando 2px a la jerarquía normal de la web para encajar en la filosofía "IDE". El texto base del sistema no es de 16px o 14px, sino de `12px` (`{typography.text-base}`), con elementos de la interfaz bajando hasta `10px` (`{typography.text-xs}`).

### El Blindaje del Canvas Físico
Los elementos dibujados dentro de la vista física de los racks (pantallas de servidores, textos U) están intencionalmente fuera del sistema de escalado global. Poseen valores fijos de `7px` o `8px` (`{typography.lcd-mini}`) para garantizar que la simulación de hardware no sufra deformaciones o desbordamientos ("Visual Drift").

## La Regla Matemática de los 24px (Componentes)

Para mantener la estética densa y profesional, absolutamente todos los componentes interactivos de primera línea (filtros, botones primarios, botones de agregar, campos de búsqueda y pestañas superiores) comparten el mismo esqueleto:

1. **Altura Forzada:** `height: 24px !important;`
2. **Caja Estricta:** `box-sizing: border-box !important;`
3. **Comportamiento:** `display: inline-flex !important; align-items: center !important; justify-content: center !important;`

Esto incluye a: `.btn-primary`, `.btn-secondary`, `.tab-pill`, `.h-btn`, `.room-tab`, `.view-tab`, `.filter-tab`, `.btn-cancel`, `.btn-confirm`, y elementos `input[type="text"]`.

## Elevation & Depth

El sistema es predominantemente plano (Flat Design de Alto Contraste). No se utilizan sombras para elevar elementos. La jerarquía se establece mediante el color del fondo y los bordes.

| Nivel | Tratamiento | Uso |
|---|---|---|
| Nivel 0 | Fondo `{colors.bg-main}` | Canvas físico y topológico |
| Nivel 1 | Fondo `{colors.bg-card1}` + Borde `{colors.border}` | Sidebars, Toolbars, Cabeceras |
| Nivel 2 | Fondo `{colors.bg-card2}` | Tarjetas internas, estados hover de pestañas |
| Modales | Fondo `{colors.bg-card1}` + Borde de acento o sombra sólida | Ventanas emergentes de edición |

## Do's and Don'ts

### Do
- Mantener la paleta estricta enfocada en Cyan y Dark Blue.
- Respetar la altura de `24px` para cualquier nuevo componente que el usuario deba cliquear en toolbars o modales.
- Usar `JetBrains Mono` cada vez que se visualicen números de puertos, direcciones de red, y estados LCD del servidor.
- Mantener las esquinas cuadradas o con radios muy pequeños (`{rounded.md}` a lo sumo) para botones y tarjetas.

### Don't
- NO usar sombras desenfocadas ni transparencias glassmórficas ("AI Slop").
- NO usar tonos magenta, lila, morado o naranja vibrante como parte del branding principal.
- NO aplicar `padding` vertical asimétrico que rompa la altura de 24px en los botones.
- NO aumentar la escala global de tipografías intentando hacerlo "más legible" para estándares SaaS de consumo; esto es una herramienta técnica que exige densidad.
