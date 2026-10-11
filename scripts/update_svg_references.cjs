const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const svgDir = path.join(rootDir, 'doc', 'doc_img', 'doc_svg');

const subdirs = fs.readdirSync(svgDir).filter(f => fs.statSync(path.join(svgDir, f)).isDirectory());
const mapping = {};
subdirs.forEach(sd => {
  const files = fs.readdirSync(path.join(svgDir, sd)).filter(f => f.endsWith('.svg'));
  files.forEach(f => {
    mapping[f] = sd + '/' + f;
  });
});

console.log('Mapeados', Object.keys(mapping).length, 'archivos SVG en', subdirs.length, 'subdirectorios:');
console.log(subdirs.join(', '));

// Archivos a actualizar
const filesToUpdate = [
  path.join(rootDir, 'doc', 'doc_md', 'USER_MANUAL.md'),
  path.join(rootDir, 'doc', 'temp', 'propuestas_gallery.html'),
  path.join(rootDir, 'doc', 'doc_md', 'ARCHITECTURE_GUIDE.md'),
  path.join(rootDir, 'doc', 'doc_md', 'CODEBASE_ORIENTATION_MAP.md'),
  path.join(rootDir, '.agents', 'AGENTS.md'),
  path.join(rootDir, 'README.md')
];

let totalModifiedFiles = 0;

filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.warn('Archivo no encontrado:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Reemplazar apariciones con prefijo doc_svg/
  for (const [svgFile, relSubPath] of Object.entries(mapping)) {
    // Si ya tiene la subcarpeta, no duplicar
    const alreadyEscaped = relSubPath.replace('/', '\\/');
    const fileEscaped = svgFile.replace('.', '\\.');

    // doc_svg/file.svg (que no esté ya precedido por subcarpeta)
    const regexDocSvg = new RegExp('doc_svg\\/(?!' + alreadyEscaped + ')' + fileEscaped, 'g');
    content = content.replace(regexDocSvg, 'doc_svg/' + relSubPath);

    // Tablas Markdown con backticks: | `layout_header.svg` | -> | `layout/layout_header.svg` |
    const regexTable = new RegExp('\\| `(?!' + alreadyEscaped + ')' + fileEscaped + '` \\|', 'g');
    content = content.replace(regexTable, '| `' + relSubPath + '` |');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModifiedFiles++;
    console.log('✅ Actualizado:', path.relative(rootDir, filePath));
  } else {
    console.log('ℹ️ Sin cambios necesarios:', path.relative(rootDir, filePath));
  }
});

console.log('\nTotal de archivos actualizados:', totalModifiedFiles);
