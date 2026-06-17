import re
import os

html_file = 'doc/html/arquitectura_2.html'
img_dir = 'doc/html/img/Arq2'
os.makedirs(img_dir, exist_ok=True)

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

names = [
    'system_architecture',
    'dependency_tree',
    'index_structure',
    'style_flip',
    'main_orchestrator',
    'store_proxy',
    'faceplates_demo',
    'rack_slots',
    'topology_canvas',
    'tables_grid',
    'modals_form',
    'utils_flow'
]

svg_pattern = re.compile(r'<svg[^>]*>.*?</svg>', re.DOTALL)
svgs = svg_pattern.findall(content)

for i, svg in enumerate(svgs):
    name = names[i] if i < len(names) else f'svg_{i}'
    filename = f'{name}.svg'
    filepath = os.path.join(img_dir, filename)
    
    if 'xmlns="http://www.w3.org/2000/svg"' not in svg:
        svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    replacement = f'<img src="img/Arq2/{filename}" alt="{name}" class="architecture-img" style="width: 100%; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;">'
    content = content.replace(svg, replacement)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Extracted {len(svgs)} SVGs.')
