html_file = 'doc/html/arquitectura_2.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# For system_architecture and dependency_tree (viewBox 880)
content = content.replace(
    'src="img/Arq2/system_architecture.svg" alt="system_architecture" class="architecture-img" style="width: 100%; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"',
    'src="img/Arq2/system_architecture.svg" alt="system_architecture" class="architecture-img" style="width: 100%; max-width: 880px; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"'
)
content = content.replace(
    'src="img/Arq2/dependency_tree.svg" alt="dependency_tree" class="architecture-img" style="width: 100%; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"',
    'src="img/Arq2/dependency_tree.svg" alt="dependency_tree" class="architecture-img" style="width: 100%; max-width: 880px; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"'
)

# For all other standard SVGs (viewBox 400x180)
content = content.replace(
    'style="width: 100%; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"',
    'style="width: 100%; max-width: 450px; margin-top: 16px; border-radius: 8px; border: 1px solid #242f41;"'
)

# Fix empty_state_shortcuts and contextual_menu
content = content.replace(
    'style="width: 100%; margin-top: 8px; border-radius: 8px; border: 1px solid #242f41;"',
    'style="width: 100%; max-width: 450px; margin-top: 8px; border-radius: 8px; border: 1px solid #242f41;"'
)

# Fix directory_structure
content = content.replace(
    'style="width: 100%; border-radius: 8px; border: 1px solid #242f41;"',
    'style="width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #242f41;"'
)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Images resized.')
