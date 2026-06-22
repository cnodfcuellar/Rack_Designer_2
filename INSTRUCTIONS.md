# Reglas Globales para Asistentes de IA

Las siguientes reglas deben ser obedecidas estrictamente por cualquier asistente de IA que trabaje en este proyecto:

1. **Gestor de Paquetes (Obligatorio):** 
   - Utiliza SIEMPRE `pnpm` en lugar de `npm` o `yarn` para cualquier gestión de dependencias, instalación de paquetes o ejecución de scripts.
   - ¡Nunca uses `npm` bajo ninguna circunstancia en este repositorio!

2. **Flujo de Trabajo de Documentación y Respaldos:**
   - **Registro Continuo (Log):** Cada vez que realices una modificación o mejora al código, DEBES actualizar INMEDIATAMENTE de forma continua el registro de cambios en `doc/log/CHANGELOG.md` y la documentación pertinente (`doc/md/`, `doc/html/`, `DESIGN.md`, etc.). No esperes para hacer esto.
   - **Respaldos Manuales (Git):** NO realices comandos de respaldo en Git (`git commit`, `git push`) automáticamente después de cada tarea o arreglo. Debes dejar que los cambios se acumulen y **ESPERAR** a que el usuario te indique explícitamente "respalda", "guarda" o "haz un commit" antes de crear un punto de control en el repositorio.

3. **Ubicación de Scripts Python:**
   - Todos los scripts con extensión `.py` deben ser ubicados y ejecutados desde la carpeta `\.py`.