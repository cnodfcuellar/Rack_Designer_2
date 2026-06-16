# Reglas Globales para Asistentes de IA

Las siguientes reglas deben ser obedecidas estrictamente por cualquier asistente de IA que trabaje en este proyecto:

1. **Gestor de Paquetes (Obligatorio):** 
   - Utiliza SIEMPRE `pnpm` en lugar de `npm` o `yarn` para cualquier gestión de dependencias, instalación de paquetes o ejecución de scripts.
   - ¡Nunca uses `npm` bajo ninguna circunstancia en este repositorio!

2. **Proceso Obligatorio de Respaldo y Despliegue (Flujo de Trabajo):**
   - Siempre que se realice un respaldo, entrega o actualización, se debe seguir estrictamente este orden de ejecución:
     1. **Actualizar la documentación:** Reflejar todos los cambios tanto en los archivos Markdown (`doc/md/`) como en el manual interactivo HTML (`doc/html/`).
     2. **Actualizar el registro de cambios (Log):** Registrar detalladamente las modificaciones en el archivo `doc/log/CHANGELOG.md`.
     3. **Respaldo en Git:** Realizar la confirmación de cambios (`git commit`) y enviarlos a la rama activa del repositorio remoto (`git push`).