import os

# 1. Update USER_MANUAL.md
manual_path = r'doc\doc_md\USER_MANUAL.md'
with open(manual_path, 'a', encoding='utf-8') as f:
    f.write('''

---

## 🔌 Parte 4: Visualización de Conexiones Físicas

¡Ahora también puedes visualizar cómo están conectados los cables en la vida real!
1. Una vez que hayas creado una conexión entre dos equipos (usando el botón "+ Conexión" de la tabla inferior).
2. Ve a la **Vista Física** (botón superior central).
3. En la barra de herramientas, haz clic en el interruptor deslizable **"Cables"** para encenderlo.
4. Verás que se dibujan automáticamente los recorridos de los cables de red/energía desde los puertos traseros, agrupándose y ocultándose limpiamente por los bordes laterales del Rack.
5. Puedes girar el rack usando el icono de "Rotar" (esquina superior derecha del rack) para visualizar de dónde salen exactamente en el panel trasero (Rear View).
''')

# 2. Update ARCHITECTURE_GUIDE.md
arch_path = r'doc\doc_md\ARCHITECTURE_GUIDE.md'
with open(arch_path, 'r', encoding='utf-8') as f:
    content = f.read()
if 'SVG para Cableado Físico' not in content:
    content = content.replace('## Resumen Final', '''## 9. Renderizado de Cableado Físico (Novedad)
A diferencia de la topología que usa <canvas>, el cableado físico 2D se resuelve inyectando de forma dinámica un lienzo <svg> (#physical-cables-svg) con absolute positioning encima del #view-physical-content.
- **Anclajes:** Los wrappers de aceplates.js inyectan atributos data-device-id y data-port al DOM real.
- **Trazado:** La función drawPhysicalCables() en ack.js usa getBoundingClientRect para trazar líneas ortogonales (caminos M...L...Q...L) que se ocultan estéticamente bordeando la tarjeta del Rack (ackCard.right).

## Resumen Final''')
    with open(arch_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Update PROJECT_ANALYSIS.md
proj_path = r'doc\doc_md\PROJECT_ANALYSIS.md'
with open(proj_path, 'a', encoding='utf-8') as f:
    f.write('''
---

## 9. Actualización Reciente: Enrutamiento de Cables Físicos (2D)
Se ha implementado el trazado de cableado de punto a punto dentro de la Vista Física.
*   **Enfoque 2D Ortogonal:** Descartado el enfoque 3D. Se utilizan líneas SVG ortogonales que se agrupan en los márgenes derechos de los gabinetes, manteniendo la estética de cableado estructurado.
*   **Interactividad:** Botón de "Toggle" deslizante inyectado en el menú principal para apagar/encender la capa vectorial sin impactar la memoria.
''')

# 4. Update CODEBASE_ORIENTATION_MAP.md
map_path = r'doc\doc_md\CODEBASE_ORIENTATION_MAP.md'
with open(map_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '* **ack.js**: Lógica pesada. Recorre los gabinetes, calcula las U disponibles y apila los aceplates dentro de la tarjeta del Rack.',
    '* **ack.js**: Lógica pesada. Recorre los gabinetes, calcula U disponibles, apila aceplates y **dibuja el cableado SVG en 2D** (drawPhysicalCables()).'
)
content = content.replace(
    '* **aceplates.js**: Plantillas HTML con estilos CSS en línea',
    '* **aceplates.js**: Plantillas HTML con estilos CSS en línea (ahora incluyen etiquetas data-port para enrutamiento de cables)'
)

with open(map_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Update CHANGELOG.md
log_path = r'doc\log\CHANGELOG.md'
with open(log_path, 'r', encoding='utf-8') as f:
    log_content = f.read()

new_log = '''
## [1.2.0] - 2026-07-13
### Added
- **Enrutamiento Físico 2D:** Implementación de trazado ortogonal de cables mediante un <svg> dinámico superpuesto a la vista física en ack.js.
- **Interruptor UI:** Toggle deslizable .ui-switch en la barra superior para mostrar/ocultar cables.
- **Atributos de Anclaje:** Inyección de data-device-id y data-port en plantillas de aceplates.js.

### Fixed
- Error de sintaxis (UTF-16 y comillas faltantes) en inyección de CSS y eventos de ventana.

'''
if '[1.2.0] - 2026-07-13' not in log_content:
    parts = log_content.split('## [', 1)
    if len(parts) == 2:
        final_log = parts[0] + new_log + '## [' + parts[1]
        with open(log_path, 'w', encoding='utf-8') as f:
            f.write(final_log)
print("Documentation completely updated.")
