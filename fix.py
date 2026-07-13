import os

def append_to_file(filepath, content):
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(content)

# 1. USER_MANUAL.md
append_to_file(r'doc\doc_md\USER_MANUAL.md', '''
---

## 🔌 Parte 4: Visualización de Conexiones Físicas

¡Ahora también puedes visualizar cómo están conectados los cables en la vida real!
1. Crea una conexión entre dos equipos en la pestaña de Inventario ("+ Conexión").
2. Ve a la **Vista Física** (botón superior central).
3. Haz clic en el interruptor deslizable **"Cables"** de la barra de herramientas.
4. Verás que se dibujan automáticamente los cables desde los puertos, organizados ortogonalmente y agrupándose en los bordes del rack.
5. Usa el botón rotar del rack para ver la parte trasera (Rear View) desde donde nacen las conexiones.
''')

# 2. ARCHITECTURE_GUIDE.md
append_to_file(r'doc\doc_md\ARCHITECTURE_GUIDE.md', '''
---
## 9. Renderizado de Cableado Físico
A diferencia de la topología (Canvas), el cableado físico 2D se resuelve inyectando dinámicamente un lienzo <svg> (#physical-cables-svg) sobre #view-physical-content.
*   Los componentes de aceplates.js inyectan anclajes data-device-id y data-port al DOM.
*   drawPhysicalCables() (en ack.js) procesa las conexiones y traza trayectorias ortogonales bordeando las tarjetas de rack de manera reactiva.
''')

# 3. PROJECT_ANALYSIS.md
append_to_file(r'doc\doc_md\PROJECT_ANALYSIS.md', '''
---
## Actualización: Enrutamiento de Cables Físicos (2D)
Implementado el trazado estético de cables punto a punto en Vista Física.
*   Se descartó el 3D en favor de SVG superpuesto con enrutamiento ortogonal (líneas escondidas en los rieles laterales).
*   Se desarrolló un interruptor visual (.ui-switch) en la barra principal para activar la capa vectorial.
''')

# 4. CHANGELOG.md
log_path = r'doc\log\CHANGELOG.md'
with open(log_path, 'r', encoding='utf-8') as f:
    log_content = f.read()
new_log = '''## [1.2.0] - 2026-07-13
### Añadido
- Enrutamiento Físico 2D ortogonal (svg dinámico) en ack.js.
- Interruptor UI deslizable .ui-switch para ocultar/mostrar cables.
- Atributos data-device-id y data-port en plantillas de aceplates.js.
### Solucionado
- Error de sintaxis al inicializar el evento resize (UTF-16 repair).

'''
if '[1.2.0] - 2026-07-13' not in log_content:
    parts = log_content.split('## [', 1)
    if len(parts) == 2:
        final_log = parts[0] + new_log + '## [' + parts[1]
        with open(log_path, 'w', encoding='utf-8') as f:
            f.write(final_log)

print("Docs updated")
