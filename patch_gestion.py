import os, re

# 1. Update catalog.js
catalog_path = 'js/ui/catalog.js'
with open(catalog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change type in CATALOG
content = content.replace("type:'patchpanel'", "type:'gestion'")
content = content.replace("type:'kvm'", "type:'gestion'")

# Update TYPE_COLORS
# Remove patchpanel and kvm, add gestion
content = re.sub(r"patchpanel\s*:\s*'#[0-9a-fA-F]+'\s*,", "gestion:'#38bdf8',", content)
content = re.sub(r"kvm\s*:\s*'#[0-9a-fA-F]+'\s*,?", "", content)

with open(catalog_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update faceplates.js
fp_path = 'js/ui/faceplates.js'
with open(fp_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add `else if (type === 'gestion')` logic
if "type === 'gestion'" not in content:
    content = content.replace(
        "if (type === 'energia') { type = device.name.toLowerCase().includes('pdu') ? 'pdu' : 'ups'; }",
        "if (type === 'energia') { type = device.name.toLowerCase().includes('pdu') ? 'pdu' : 'ups'; }\n  if (type === 'gestion') { type = device.name.toLowerCase().includes('kvm') ? 'kvm' : 'patchpanel'; }"
    )
    
with open(fp_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update index.html
html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace option tags
content = re.sub(r'<option value="patchpanel">.*?</option>', '', content)
content = re.sub(r'<option value="kvm">.*?</option>', '<option value="gestion">Gestión (Patch Panel, KVM)</option>', content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Update inspector.js
insp_path = 'js/ui/inspector.js'
with open(insp_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("case 'patchpanel':", "case 'gestion':")
with open(insp_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch complete!")
