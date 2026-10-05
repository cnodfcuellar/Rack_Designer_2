# -*- coding: utf-8 -*-
"""
Script de actualización para incorporar M-41 en doc/doc_md/roadmap_mejoras.md
"""
import sys

def main():
    path = "doc/doc_md/roadmap_mejoras.md"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Matriz de decisión
    old_row = "           │          │  M-16   │  M-23   │         │          │"
    new_row = "           │  M-41    │  M-16   │  M-23   │         │          │"
    if old_row in content:
        content = content.replace(old_row, new_row, 1)
        print("Fila de matriz actualizada con M-41.")
    else:
        print("Aviso: old_row no encontrada en la matriz.")

    old_m18 = "  P3 ⚡    │  M-13    │ [M-06]✓ │  M-18   │ [M-08]✓ │          │"
    new_m18 = "  P3 ⚡    │  M-13    │ [M-06]✓ │ [M-18]✓ │ [M-08]✓ │          │"
    if old_m18 in content:
        content = content.replace(old_m18, new_m18, 1)
        print("M-18 marcado como completado en matriz.")

    old_qw = "> **Zona de Quick Wins (arriba-izquierda):** M-02, M-10, M-09, M-19, M-37 — Máximo impacto con mínimo esfuerzo. Empezar aquí."
    new_qw = "> **Zona de Quick Wins (arriba-izquierda):** M-02, M-10, M-09, M-19, M-37, M-41 — Máximo impacto con mínimo esfuerzo. Empezar aquí."
    if old_qw in content:
        content = content.replace(old_qw, new_qw, 1)
        print("Quick Wins actualizado con M-41.")

    old_note = "> **Items completados:** `[M-06]✓`, `[M-08]✓`, `[M-17]✓` (Doc) y `[M-27]✓`."
    new_note = "> **Items completados:** `[M-06]✓`, `[M-08]✓`, `[M-17]✓` (Doc), `[M-18]✓` y `[M-27]✓`."
    if old_note in content:
        content = content.replace(old_note, new_note, 1)
        print("Nota de items completados actualizada.")

    # 2. Fase 2
    old_f2 = "| 2.7 | M-22 | Importación masiva CSV/Excel | `fileManager.js`, nuevo `ImportModal.js` | Pendiente |"
    new_f2 = (
        old_f2 + "\n"
        "| 2.8 | M-41 | Botón para cambiar orientación e invertir conexiones | `CableModal.js`, `index.html`, `rack.js` | Pendiente (Botón Swap ⇄ origen/destino y selector simple de canaleta superior/inferior) |"
    )
    if old_f2 in content:
        content = content.replace(old_f2, new_f2, 1)
        print("Fase 2 actualizada con M-41.")
    else:
        print("Aviso: old_f2 no encontrada.")

    # 3. Dependencias
    old_dep_box = '        M22["M-22 Import masivo"]\n    end'
    new_dep_box = '        M22["M-22 Import masivo"]\n        M41["M-41 Invertir/Orientar"]\n    end'
    if old_dep_box in content:
        content = content.replace(old_dep_box, new_dep_box, 1)
        print("Caja de dependencias actualizada.")

    old_conn = "    M26 --> M33\n    M26 --> M34"
    new_conn = "    M26 --> M33\n    M26 --> M34\n    M26 --> M41"
    if old_conn in content:
        content = content.replace(old_conn, new_conn, 1)
        print("Conexión de dependencias agregada.")

    # 4. Estimaciones
    old_est = "M-26, M-33, M-34, M-19, M-21, M-37, M-22 |"
    new_est = "M-26, M-33, M-34, M-19, M-21, M-37, M-22, M-41 |"
    if old_est in content:
        content = content.replace(old_est, new_est, 1)
        print("Estimaciones actualizadas.")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Guardado exitoso de", path)

if __name__ == "__main__":
    main()
