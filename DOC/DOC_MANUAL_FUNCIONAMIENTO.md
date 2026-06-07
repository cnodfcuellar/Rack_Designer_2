# ⚙️ Manual de Funcionamiento y Operación - RACK Designer

Este documento está dirigido al **Personal de TI, Operadores y Administradores de Sistemas** encargados de desplegar, mantener y entender el entorno técnico en el que funciona RACK Designer.

---

## 1. Naturaleza del Sistema (Arquitectura Sin Servidor)

RACK Designer es una aplicación **100% Client-Side** (del lado del cliente). Esto significa que **NO requiere un servidor backend** (ni PHP, ni Node.js, ni Python) y **NO utiliza una base de datos externa** (ni MySQL, ni SQL Server, ni MongoDB).

Toda la lógica de procesamiento, almacenamiento temporal y renderizado gráfico ocurre dentro del motor JavaScript del navegador web del usuario.

### 1.1. Ventajas de este modelo
* **Seguridad:** Los datos sensibles sobre IPs, servidores y topologías de su empresa nunca viajan por Internet. Todo se queda en la computadora local del usuario.
* **Despliegue Inmediato:** No hay que configurar servidores, balanceadores ni certificados SSL para hacerlo funcionar internamente.
* **Cero Latencia:** Al no haber llamadas de red, la respuesta de la interfaz es instantánea.

---

## 2. Requisitos Técnicos y de Sistema

Para operar el sistema de manera fluida, los equipos clientes (computadoras de los usuarios) deben cumplir con lo siguiente:

### 2.1. Navegadores Soportados
Debe utilizarse un navegador web moderno que soporte **ES6 (ECMAScript 2015)**, **CSS Grid/Flexbox** y **HTML5 Canvas API**.
* ✅ Google Chrome (Recomendado, Versión 80+)
* ✅ Microsoft Edge (Versión Chromium)
* ✅ Mozilla Firefox (Versión 75+)
* ✅ Apple Safari (Versión 13+)
* ❌ Internet Explorer (NO SOPORTADO)

### 2.2. Hardware Recomendado
Dado que la aplicación renderiza gráficos por computadora (Canvas) y gestiona estados de memoria:
* **Procesador:** Core i3 / Ryzen 3 o superior.
* **Memoria RAM:** Mínimo 4 GB (Se recomiendan 8 GB si se diseñan centros de datos gigantes con miles de nodos).
* **Pantalla:** Resolución mínima recomendada 1366x768. Funciona en móviles, pero la experiencia óptima de diseño es en monitores de escritorio.

---

## 3. Instrucciones de Despliegue (Instalación)

Dado que no hay servidor, el despliegue es trivial. Existen dos formas de disponibilizar la herramienta en su empresa:

### Método A: Ejecución Local (El más seguro)
1. Descargue la carpeta completa `Rack_Designer_2` que contiene los archivos y directorios (`index.html`, `/css`, `/js`).
2. Entregue la carpeta a los ingenieros de red mediante un USB o carpeta compartida.
3. El usuario solo debe hacer **Doble clic en el archivo `index.html`** para que se abra en su navegador web predeterminado. El sistema estará 100% funcional.

### Método B: Intranet (Servidor Web Estático)
Si desea que todos entren a una misma URL (Ej: `http://rackdesigner.empresa.local`):
1. Aloje la carpeta en cualquier servidor web básico (IIS, Apache, Nginx o incluso Amazon S3/GitHub Pages).
2. Apunte el directorio raíz (Document Root) al archivo `index.html`.
3. No requiere configuración de puertos proxy ni bases de datos.

---

## 4. Gestión de Archivos y Seguridad de Datos

Puesto que no hay una base de datos centralizada, la responsabilidad de guardar los datos recae en el usuario a través de la **Importación/Exportación de Archivos JSON**.

### 4.1. Archivos de Respaldo (.json)
Cuando el usuario hace clic en "Guardar Proyecto", el sistema empaqueta todo el estado de la memoria (`store.state`) en un archivo de texto en formato JSON.
* **Privacidad:** Este archivo se descarga en la carpeta de *Descargas* del usuario. 
* **Control de versiones:** Se recomienda a los usuarios guardar sus archivos JSON en una carpeta compartida segura (Ej: SharePoint o Google Drive corporativo) poniéndoles la fecha, ej: `DataCenter_Principal_31_Mayo_2026.json`.

### 4.2. Generación de Reportes 
El sistema depende de la librería externa `xlsx.full.min.js` (incluida localmente en la carpeta `/js`) para compilar los reportes sin requerir conexión a internet.
* **CSV:** Exporta texto plano separado por comas, ideal para importar en bases de datos externas o sistemas de inventario.
* **Excel (.xlsx):** Genera un libro de Microsoft Excel con estilo, ideal para presentar informes a gerencia.

### 4.3. Exportación Gráfica (PNG)
El botón de exportar a PNG toma el lienzo HTML5 (`<canvas>` de la topología o el DOM del Rack renderizado mediante técnicas de superposición) y lo convierte en un mapa de bits Base64 que se descarga automáticamente. En el caso de gabinetes con equipos en ambas caras, el sistema dibuja ambos de forma dinámica expandiendo el canvas y renderizando la vista Frontal y Trasera de forma paralela en la misma imagen generada. Esto reemplaza la necesidad de hacer recortes manuales de pantalla y facilita el reporte integral del gabinete.

---

## 5. Mantenimiento y Actualizaciones

Si un programador modifica el código fuente (por ejemplo, agrega nuevos tipos de equipos en `utils.js`):
1. **Borrado de Caché:** Dado que el HTML carga los archivos `.js` estáticos, los navegadores de los usuarios podrían usar versiones antiguas guardadas en caché (Cacheado agresivo). 
2. **Solución:** Instruya a los usuarios a presionar `Ctrl + F5` (o vaciar la caché del navegador) para descargar la nueva versión de la herramienta. Alternativamente, los programadores pueden implementar "Cache Busting" añadiendo versiones al HTML (`<script src="js/main.js?v=2.1"></script>`).
