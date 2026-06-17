import os
import re

html_file = 'doc/html/manual.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

file_map = {}
for root, dirs, files in os.walk('doc/html/img'):
    for file in files:
        if file.endswith('.svg'):
            rel_path = os.path.relpath(os.path.join(root, file), 'doc/html')
            rel_path = rel_path.replace('\\\\', '/').replace('\\', '/')
            file_map[file] = rel_path

def replacer(match):
    original_path = match.group(1)
    filename = original_path.split('/')[-1]
    if filename in file_map:
        return f'src="{file_map[filename]}"'
    return match.group(0)

new_content = re.sub(r'src="([^"]+)"', replacer, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Paths updated.")
