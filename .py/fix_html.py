import re

html_file = 'doc/html/arquitectura_2.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

names = [
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

print(f'Found {len(svgs)} inline SVGs remaining.')

for i, svg in enumerate(svgs):
    if i < len(names):
        name = names[i]
        filename = f'{name}.svg'
        replacement = f'<img src="img/Arq2/{filename}" alt="{name}" class="architecture-img" style="width: 100%; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;">'
        content = content.replace(svg, replacement)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix SVGs
files = ['dependency_tree.svg', 'system_architecture.svg']
for f in files:
    with open('doc/html/img/Arq2/' + f, 'r', encoding='utf-8') as file:
        c = file.read()
    c = c.replace(' & ', ' &amp; ')
    c = c.replace('D&D', 'D&amp;D')
    with open('doc/html/img/Arq2/' + f, 'w', encoding='utf-8') as file:
        file.write(c)

defs = '''  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="currentColor"/>
    </marker>
  </defs>
</svg>'''

files = ['rack_slots.svg', 'store_proxy.svg']
for f in files:
    with open('doc/html/img/Arq2/' + f, 'r', encoding='utf-8') as file:
        c = file.read()
    if '<defs>' not in c:
        c = c.replace('</svg>', defs)
    with open('doc/html/img/Arq2/' + f, 'w', encoding='utf-8') as file:
        file.write(c)

print('Done.')
