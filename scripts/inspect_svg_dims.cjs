const fs = require('fs');
const path = require('path');

const svgDir = path.resolve(__dirname, '..', 'doc', 'doc_img', 'doc_svg');
const subdirs = fs.readdirSync(svgDir).filter(f => fs.statSync(path.join(svgDir, f)).isDirectory());

const stats = {};
subdirs.forEach(sd => {
  stats[sd] = [];
  const files = fs.readdirSync(path.join(svgDir, sd)).filter(f => f.endsWith('.svg'));
  files.forEach(f => {
    const full = path.join(svgDir, sd, f);
    const content = fs.readFileSync(full, 'utf8');
    const vbMatch = content.match(/viewBox=["']([^"']+)["']/);
    const wMatch = content.match(/width=["']([^"']+)["']/);
    const hMatch = content.match(/height=["']([^"']+)["']/);
    const vb = vbMatch ? vbMatch[1] : 'N/A';
    const w = wMatch ? wMatch[1] : '';
    const h = hMatch ? hMatch[1] : '';
    const sizeKb = (fs.statSync(full).size / 1024).toFixed(1);
    stats[sd].push({ file: f, vb, w, h, sizeKb });
  });
});

for (const [sd, files] of Object.entries(stats)) {
  console.log(`\n### ${sd} (${files.length} archivos)`);
  files.forEach(f => {
    let dim = f.vb !== 'N/A' ? f.vb : `${f.w}x${f.h}`;
    console.log(`- ${f.file} | Dim: ${dim} | ${f.sizeKb} KB`);
  });
}
