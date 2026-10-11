const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const filesToCheck = [
  path.join(root, 'doc', 'doc_img', 'doc_svg', 'README.md'),
  path.join(root, 'doc', 'doc_md', 'USER_MANUAL.md'),
  path.join(root, 'doc', 'temp', 'propuestas_gallery.html'),
  path.join(root, 'doc', 'doc_md', 'ARCHITECTURE_GUIDE.md'),
  path.join(root, 'doc', 'doc_md', 'CODEBASE_ORIENTATION_MAP.md'),
  path.join(root, 'README.md')
];

let errors = 0;
filesToCheck.forEach(docFile => {
  let content = fs.readFileSync(docFile, 'utf8');
  const dir = path.dirname(docFile);

  // Ignorar bloques de código cercados (ejemplos sintácticos)
  content = content.replace(/```[\s\S]*?```/g, '');

  // Markdown links & images
  const mdRegex = /\[.*?\]\(([^)]+)\)/g;
  let match;
  while ((match = mdRegex.exec(content)) !== null) {
    let target = match[1];
    if (target.startsWith('http') || target.startsWith('#')) continue;
    if (target.startsWith('file:///')) {
      target = target.replace('file:///', '');
      if (process.platform === 'win32' && /^[a-zA-Z]:/.test(target)) {
        // ok
      } else if (process.platform === 'win32' && target.startsWith('/')) {
        target = target.slice(1);
      }
    } else {
      target = path.resolve(dir, target);
    }
    if (target.includes('.svg')) {
      if (!fs.existsSync(target)) {
        console.error('❌ ERROR en ' + path.relative(root, docFile) + ': Ruta no existe -> ' + target);
        errors++;
      }
    }
  }

  // HTML regex
  const htmlRegex = /(?:src|href)="([^"]+\.svg)"/g;
  while ((match = htmlRegex.exec(content)) !== null) {
    let target = path.resolve(dir, match[1]);
    if (!fs.existsSync(target)) {
      console.error('❌ ERROR HTML en ' + path.relative(root, docFile) + ': Ruta no existe -> ' + target);
      errors++;
    }
  }
});

if (errors === 0) {
  console.log('✅ Todos los enlaces a archivos SVG en la documentación son 100% válidos y existen físicamente.');
} else {
  console.log('❌ Se encontraron ' + errors + ' enlaces rotos.');
  process.exit(1);
}
