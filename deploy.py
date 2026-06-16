import datetime
import os
import re

# 1. Update CHANGELOG
changelog_path = 'doc/log/CHANGELOG.md'
date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

new_log = f"""## [{date_str}] Refinamiento UI/UX Premium & DESIGN.md
### Mejoras (UI/UX)
- Normalización matemática de altura de controles interactivos (botones, tabs, inputs) a \`32px\` con paddings estandarizados.
- Creación de \`DESIGN.md\` en la raíz para dictar el ADN visual del proyecto (fuentes, escala de color, evitar 'AI Slop').
- Reducción global de escala tipográfica (2px) para lograr densidad visual estilo IDE.
- Ocultamiento forzado (\`style="display:none !important;"\`) del input nativo de archivos en el HTML principal.
- Limpieza profunda de archivos basura y copias de seguridad obsoletas (\`.backup\`, \`.kilo\`, \`scratch\`).

"""

with open(changelog_path, 'r', encoding='utf-8') as f:
    old_log = f.read()

with open(changelog_path, 'w', encoding='utf-8') as f:
    f.write(new_log + old_log)

# 2. Update doc/md/design_analysis.md
md_path = 'doc/md/design_analysis.md'
md_addon = """
## Estandarización AI y DESIGN.md (V2.0.1)
Para evitar la deriva visual (Visual Drift) por parte de herramientas de IA, se implementó el estándar `DESIGN.md`.
- **Estandarización Flexbox:** Todos los componentes de interacción tienen `height: 32px; display: inline-flex;`
- **Tipografía Densa:** Se restaron 2px a la escala global de fuentes manteniendo el hardcodeo de las vistas físicas de servidor, maximizando la apariencia de ingeniería.
"""
with open(md_path, 'a', encoding='utf-8') as f:
    f.write(md_addon)

# 3. Update doc/html/ui_mejoras_2.html
html_path = 'doc/html/ui_mejoras_2.html'
html_addon = """
        <div class="card mb-4" id="design-md">
            <h3><i class="fas fa-robot text-accent"></i> Estandarización DESIGN.md</h3>
            <p>Se introdujo un manifiesto <code>DESIGN.md</code> para gobernar las decisiones de diseño tomadas por IA. Se estandarizó la altura de los controles en <strong>32px</strong> y se redujo la tipografía global para mayor densidad.</p>
        </div>
"""
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Insert before the last closing tags
html_content = html_content.replace('</main>', html_addon + '</main>')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Documentacion actualizada. Lanzando push...")
os.system('git add .')
os.system('git commit -m "docs: actualizar manuales, changelog y push remoto"')
os.system('git push origin backup-local-changes')
