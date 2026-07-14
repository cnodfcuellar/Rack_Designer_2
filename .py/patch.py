import os, re

# 1. Update DESIGN.md
design_path = '.agents/DESIGN.md'
with open(design_path, 'r', encoding='utf-8') as f:
    design_content = f.read()
if 'Tolerancia al Modo Claro' not in design_content:
    design_content += '''

## Tolerancia al Modo Claro (Light Mode)

**1. Prohibición Absoluta de Colores Hardcoded en JS/HTML**
Bajo ninguna circunstancia se deben inyectar colores hexadecimales estáticos (como `#fff`, `#000` o `#1a2235`) directamente en el HTML o JS (ej. `style="color: #fff"`). Cualquier color de texto, borde o fondo debe referenciar obligatoriamente una variable CSS semántica (`var(--text-primary)`, `var(--bg-card)`). Esto garantiza que la paleta responda automáticamente al atributo `[data-theme="light"]`.

**2. Tratamiento de Hardware Físico (Racks y Servidores)**
Los elementos que representan hardware físico (como el chasis del rack o el cuerpo de los servidores) no deben tener colores oscuros estáticos. Deben utilizar variables dedicadas (ej. `var(--hardware-base)`, `var(--hardware-rail)`) que en modo oscuro sean oscuras (simulando metal negro) pero que en modo claro cambien a tonos grisáceos/metálicos claros (`#cbd5e1` o similares) para evitar un contraste agresivo contra el canvas.

**3. Accesibilidad en Opacidades (`rgba`)**
Cuando se construyan 'píldoras' (badges) con fondos translúcidos (ej. un fondo al 15% de opacidad), el texto o icono interior NUNCA debe forzarse a blanco (`#fff`). Debe usar la variable semántica o un color fuerte del mismo tono que contraste correctamente tanto en fondo negro como en fondo blanco.
'''
    with open(design_path, 'w', encoding='utf-8') as f:
        f.write(design_content)

# 2. Fix index.html hardcoded #fff
index_path = 'index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()
idx_content = re.sub(r'style="color:\s*#fff;?"', '', idx_content)
with open(index_path, 'w', encoding='utf-8') as f:
    f.write(idx_content)

# 3. Add variables to variables.css
var_path = 'css/variables.css'
with open(var_path, 'r', encoding='utf-8') as f:
    var_content = f.read()

if '--hardware-base' not in var_content:
    # Add dark variables
    var_content = re.sub(r'(--cyan:\s*#06b6d4;)', r'\1\n  --hardware-base: #1a2235;\n  --hardware-rail: #171f30;\n  --grid-dot: #1e2d4a;', var_content)
    # Add light variables
    var_content = re.sub(r'(--accent-glow:\s*#e0f2fe;)', r'\1\n  --hardware-base: #e2e8f0;\n  --hardware-rail: #f1f5f9;\n  --grid-dot: #cbd5e1;', var_content)
    with open(var_path, 'w', encoding='utf-8') as f:
        f.write(var_content)

# 4. Update layout.css dotgrid
layout_path = 'css/layout.css'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_content = f.read()
layout_content = layout_content.replace('radial-gradient(circle, #1e2d4a 1px, transparent 1px)', 'radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)')
with open(layout_path, 'w', encoding='utf-8') as f:
    f.write(layout_content)

# 5. Update rack.css
rack_path = 'css/components/rack.css'
with open(rack_path, 'r', encoding='utf-8') as f:
    rack_content = f.read()
rack_content = rack_content.replace('background: var(--bg-card);', 'background: var(--hardware-base);')
rack_content = rack_content.replace('background: var(--bg-card1);', 'background: var(--hardware-rail);')
with open(rack_path, 'w', encoding='utf-8') as f:
    f.write(rack_content)

# 6. Update faceplates.css
fp_path = 'css/components/faceplates.css'
with open(fp_path, 'r', encoding='utf-8') as f:
    fp_content = f.read()
light_override = '''
/* Light Mode Overrides for Hardware */
[data-theme="light"] .fp-server, 
[data-theme="light"] .fp-switch, 
[data-theme="light"] .fp-ups, 
[data-theme="light"] .fp-router, 
[data-theme="light"] .fp-firewall,
[data-theme="light"] .fp-pdu,
[data-theme="light"] .fp-san,
[data-theme="light"] .fp-patch {
    background: var(--hardware-base) !important;
}
[data-theme="light"] .fp-server .ear,
[data-theme="light"] .fp-server .ear-r,
[data-theme="light"] .fp-server .vent,
[data-theme="light"] .fp-router .vent-r,
[data-theme="light"] .fp-router .rtr-brand {
    background: var(--hardware-rail) !important;
}
'''
if 'Light Mode Overrides' not in fp_content:
    with open(fp_path, 'a', encoding='utf-8') as f:
        f.write(light_override)
print('Patch complete!')
