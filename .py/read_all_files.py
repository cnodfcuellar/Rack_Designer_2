import os
import sys

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    excluded_dirs = {".git", "node_modules", ".tempmediaStorage"}
    
    file_list = []
    for root, dirs, files in os.walk(root_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for f in files:
            file_list.append(os.path.join(root, f))
            
    total_files = len(file_list)
    print(f"Total de archivos detectados en el proyecto: {total_files}")
    
    read_count = 0
    errors = []
    
    for idx, path in enumerate(file_list, 1):
        rel_path = os.path.relpath(path, root_dir)
        try:
            with open(path, "rb") as fp:
                data = fp.read()
            read_count += 1
            # print progress periodically
            if idx % 25 == 0 or idx == total_files:
                pct = (read_count / total_files) * 100
                print(f"[{idx}/{total_files}] ({pct:.1f}%) Leído: {rel_path} ({len(data)} bytes)")
        except Exception as e:
            errors.append((rel_path, str(e)))
            
    print("\n--- RESUMEN FINAL ---")
    print(f"Total procesados: {total_files}")
    print(f"Total leídos con éxito: {read_count}")
    if errors:
        print(f"Errores encontrados: {len(errors)}")
        for p, err in errors:
            print(f"  - {p}: {err}")
    else:
        print("Lectura completada al 100% sin errores.")

if __name__ == "__main__":
    main()
