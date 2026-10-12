import os
import re

def fix_links():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    excluded = {".git", "node_modules", ".tempmediaStorage"}
    
    # Patrón que detecta file:///c:/... o file:///C:/... hasta el cierre de paréntesis o comillas
    # o rutas absolutas a este proyecto: c:/users/.../rack_designer_2/...
    proj_norm = root.replace("\\", "/").lower()
    
    # Expresión regular para detectar enlaces markdown: [texto](ruta) o ![texto](ruta)
    # y capturar rutas absolutas locales que apunten al proyecto
    regex_md_link = re.compile(r'(!?\[[^\]]*\]\()([^\)]+)(\))')
    
    fixed_files = 0
    total_replacements = 0

    for dirpath, dirs, filenames in os.walk(root):
        dirs[:] = [d for d in dirs if d not in excluded]
        for f in filenames:
            if not f.endswith(('.md', '.html')):
                continue
            
            full_path = os.path.join(dirpath, f)
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as fp:
                original_content = fp.read()
                
            def replace_url(match):
                nonlocal total_replacements
                prefix = match.group(1)
                url = match.group(2).strip()
                suffix = match.group(3)
                
                # Descomponer url si tiene file:/// o ruta absoluta al proyecto
                clean_url = url
                if clean_url.startswith("file:///"):
                    clean_url = clean_url[8:]
                elif clean_url.startswith("file://"):
                    clean_url = clean_url[7:]
                
                # Normalizar barras
                clean_url_norm = clean_url.replace("\\", "/")
                
                # Comprobar si apunta dentro de nuestro proyecto
                # Puede ser c:/users/admin/.../rack_designer_2/...
                idx = clean_url_norm.lower().find("rack_designer_2/")
                if idx != -1:
                    target_rel_from_root = clean_url_norm[idx + len("rack_designer_2/"):]
                    # Calcular ruta relativa desde el directorio del archivo actual hasta el target
                    target_abs = os.path.normpath(os.path.join(root, target_rel_from_root))
                    curr_dir = os.path.dirname(full_path)
                    new_rel = os.path.relpath(target_abs, curr_dir).replace("\\", "/")
                    total_replacements += 1
                    return f"{prefix}{new_rel}{suffix}"
                
                return match.group(0)

            new_content = regex_md_link.sub(replace_url, original_content)
            
            if new_content != original_content:
                with open(full_path, 'w', encoding='utf-8', newline='\n') as fp:
                    fp.write(new_content)
                rel_file = os.path.relpath(full_path, root)
                print(f"✅ Corregido: {rel_file}")
                fixed_files += 1

    print(f"\n--- Resumen ---")
    print(f"Archivos corregidos: {fixed_files}")
    print(f"Total de enlaces relativizados: {total_replacements}")

if __name__ == "__main__":
    fix_links()
