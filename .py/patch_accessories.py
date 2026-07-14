import os, re

# 1. Update TopologyLayout.js
layout_path = 'js/ui/topology/TopologyLayout.js'
with open(layout_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("['organizer','tray']", "['accesorios']")
content = content.replace("['organizer', 'tray']", "['accesorios']")
with open(layout_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update TopologyRenderer.js
renderer_path = 'js/ui/topology/TopologyRenderer.js'
with open(renderer_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("['organizer','tray']", "['accesorios']")
content = content.replace("['organizer', 'tray']", "['accesorios']")
with open(renderer_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update TopologyEvents.js
events_path = 'js/ui/topology/TopologyEvents.js'
with open(events_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("['organizer','tray']", "['accesorios']")
content = content.replace("['organizer', 'tray']", "['accesorios']")
with open(events_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Update index.html
html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('<option value="organizer">Organizador</option>', '<option value="accesorios">Accesorios (Bandejas, Org)</option>')
content = content.replace('<option value="tray">Bandeja</option>', '')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Update faceplates.js
fp_path = 'js/ui/faceplates.js'
with open(fp_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("'tray': 'accessories', 'organizer': 'wiring',", "'accesorios': 'accessories',")
with open(fp_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 6. Update inspector.js
insp_path = 'js/ui/inspector.js'
with open(insp_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("case 'organizer':", "case 'accesorios':")
content = content.replace("case 'tray':", "")
with open(insp_path, 'w', encoding='utf-8') as f:
    f.write(content)
