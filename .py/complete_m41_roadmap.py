# -*- coding: utf-8 -*-
"""
Marcar M-41 como completado en doc/doc_md/roadmap_mejoras.md
"""
def main():
    path = "doc/doc_md/roadmap_mejoras.md"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Cabecera
    content = content.replace(
        "> **Estado del sistema:** En producción (30 de 42 mejoras completadas, 71.4% del roadmap global)",
        "> **Estado del sistema:** En producción (31 de 42 mejoras completadas, 73.8% del roadmap global)"
    )

    # 2. Inventario
    content = content.replace(
        "| M-41 | Botón simple para cambiar orientación e invertir conexiones | 🔌 UX / Cableado |",
        "| M-41 | ~~Botón simple para cambiar orientación e invertir conexiones~~ | ✅ COMPLETADO |"
    )

    content = content.replace(
        "y `[M-40]✓`. Total de tareas pendientes: **12** (total general: 42 mejoras, 71.4% del roadmap global).",
        ", `[M-40]✓` y `[M-41]✓`. Total de tareas pendientes: **11** (total general: 42 mejoras, 73.8% del roadmap global)."
    )

    content = content.replace(
        "Fase 2 avanzada (4 de 8 completadas)",
        "Fase 2 avanzada (5 de 8 completadas, 62.5%)"
    )

    # 3. Complejidad
    content = content.replace(
        "| M-41 | Invertir/Orientar conexiones | 🟢 1 | Botón rápido de inversión (Swap) en CableModal y selector simple de canaleta superior/inferior. < 2 horas. |",
        "| M-41 | ~~Invertir/Orientar conexiones~~ | ✅ COMPLETADO | Botón rápido de inversión (Swap) en CableModal y tabla, selector de canaleta superior/inferior y trazado físico SVG. |"
    )

    content = content.replace(
        "### Resumen de Complejidad (Tareas Pendientes: 12)\n\n| Nivel | Cantidad Pendiente | IDs Pendientes |\n|---|---|---|\n| 🟢 Trivial (1) | 1 | M-41 |",
        "### Resumen de Complejidad (Tareas Pendientes: 11)\n\n| Nivel | Cantidad Pendiente | IDs Pendientes |\n|---|---|---|\n| 🟢 Trivial (1) | 0 | *(Todas completadas)* |"
    )

    content = content.replace(
        "M-38, M-39, M-40)*",
        "M-38, M-39, M-40, M-41)*"
    )

    # 4. Prioridad
    content = content.replace(
        "| M-41 | Invertir/Orientar conexiones | ⚡ P3 | Ergonomía inmediata: agiliza la corrección de conexiones con botón Swap y permite elegir canaleta superior/inferior. |",
        "| M-41 | ~~Invertir/Orientar conexiones~~ | ✅ COMPLETADO | Resuelto con botón Swap en modal y tabla, selector de canaleta e integración en trazado físico. |"
    )

    # 5. Matriz
    content = content.replace(
        "│  M-41    │  M-16   │",
        "│ [M-41]✓  │  M-16   │"
    )

    content = content.replace(
        "`[M-18]✓` y `[M-27]✓`.",
        "`[M-18]✓`, `[M-27]✓` y `[M-41]✓`."
    )

    # 6. Fase 2
    content = content.replace(
        "| 2.8 | M-41 | Botón para cambiar orientación e invertir conexiones | `CableModal.js`, `index.html`, `rack.js` | Pendiente (Botón Swap ⇄ origen/destino y selector simple de canaleta superior/inferior) |",
        "| 2.8 | M-41 | ~~Botón para cambiar orientación e invertir conexiones~~ | `CableModal.js`, `index.html`, `rack.js`, `tables.js` | ✅ COMPLETADO (Botón Swap ⇄ en modal y tabla, selector de canaleta superior/inferior y trazado físico SVG) |"
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("roadmap_mejoras.md actualizado con M-41 completado.")

if __name__ == "__main__":
    main()
