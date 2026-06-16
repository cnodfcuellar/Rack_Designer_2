import datetime
import os

# 1. Update CHANGELOG
changelog_path = 'doc/log/CHANGELOG.md'
date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

new_log = f"""## [{date_str}] Estandarización a 24px, DESIGN.md YAML y Soporte Claro en Rack
### Mejoras de Interfaz (UI/UX)
- Corrección matemática de densidad: Se redujo la altura estandarizada de todos los controles interactivos de 32px a **24px** (botones, pestañas, búsquedas) para consolidar la estética "IDE-grade".
- Reescritura del manifiesto `DESIGN.md` adaptándolo al estándar profesional `awesome-design-md` (YAML Frontmatter), prohibiendo explícitamente estilos generativos "AI Slop".
- Purga masiva de colores estáticos (`#090d17`, `#0a1525`, etc.) en el chasis físico del Rack (vistas frontal y trasera). Ahora toda la estructura metálica y ranuras responden a variables CSS (`--bg-card1`, `--border`), permitiendo un despliegue perfecto del **Modo Claro** sin deformar el hardware instalado.

"""

with open(changelog_path, 'r', encoding='utf-8') as f:
    old_log = f.read()

with open(changelog_path, 'w', encoding='utf-8') as f:
    f.write(new_log + old_log)

# 2. Update doc/md/design_analysis.md
md_path = 'doc/md/design_analysis.md'
md_addon = """
## Densidad Visual (V2.0.2)
Se ha implementado el estándar `awesome-design-md` en el manifiesto principal. La regla de controles Flexbox se ha ajustado a `height: 24px` para una compresión extrema orientada a flujos de ingeniería. Se ha asegurado la interoperabilidad del Modo Claro desenlazando los colores del chasis físico.
"""
with open(md_path, 'a', encoding='utf-8') as f:
    f.write(md_addon)

# 3. Update doc/html/ui_mejoras_2.html
html_path = 'doc/html/ui_mejoras_2.html'
html_addon = """
        <div class="card mb-4" id="density-update">
            <h3><i class="fas fa-compress text-accent"></i> Densidad 24px y Modo Claro Físico</h3>
            <p>Evolución del estándar de diseño: Se forzaron todos los controles a una altura estricta de <strong>24px</strong>. El chasis del Rack se reescribió para depender del motor de temas, soportando renderizado de la estructura física en <strong>Modo Claro</strong> sin perder contraste de hardware.</p>
        </div>
"""
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace('</main>', html_addon + '</main>')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Documentacion actualizada. Lanzando push a Git...")
os.system('git add .')
os.system('git commit -m "docs: estandarizacion 24px, DESIGN YAML, y soporte de tema claro en rack"')
os.system('git push origin backup-local-changes')
