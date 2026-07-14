import os, re

# 1. Update catalog.js
catalog_path = 'js/ui/catalog.js'
with open(catalog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change type in CATALOG
content = content.replace("type:'ups'", "type:'energia'")
content = content.replace("type:'pdu'", "type:'energia'")

# Update TYPE_COLORS
# Remove ups and pdu, add energia
content = re.sub(r"ups\s*:\s*'#[0-9a-fA-F]+'\s*,\s*pdu\s*:\s*'#[0-9a-fA-F]+'\s*,", "energia:'#eab308',", content)

with open(catalog_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update faceplates.js
fp_path = 'js/ui/faceplates.js'
with open(fp_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change `const type = device.type;` to `let type = device.type;\n  if (type === 'energia') { type = device.name.toLowerCase().includes('pdu') ? 'pdu' : 'ups'; }`
if "let type = device.type;" not in content:
    content = content.replace("const type = device.type;", "let type = device.type;\n  if (type === 'energia') { type = device.name.toLowerCase().includes('pdu') ? 'pdu' : 'ups'; }")
    
with open(fp_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update index.html
html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace option tags
content = re.sub(r'<option value="ups">.*?</option>\s*<option value="pdu">.*?</option>', '<option value="energia">Energía (UPS, PDU)</option>', content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch complete!")
