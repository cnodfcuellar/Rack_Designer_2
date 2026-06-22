const fs = require('fs');
const path = require('path');

function processMarkdown(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    let newContent = content;
    let matchCount = 0;
    while ((match = imgRegex.exec(content)) !== null) {
        const alt = match[1];
        const imgPath = match[2];
        if (imgPath.startsWith('http') || imgPath.startsWith('data:')) continue;
        
        const absoluteImgPath = path.resolve(path.dirname(filePath), imgPath);
        if (fs.existsSync(absoluteImgPath)) {
            const ext = path.extname(absoluteImgPath).toLowerCase();
            let mime = 'image/png';
            if (ext === '.svg') mime = 'image/svg+xml';
            else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
            else if (ext === '.gif') mime = 'image/gif';
            
            let base64Data = fs.readFileSync(absoluteImgPath).toString('base64');
            
            // If it's an SVG, we encode it directly via base64 or URI encoding
            const dataUri = `data:${mime};base64,${base64Data}`;
            newContent = newContent.replace(match[0], `![${alt}](${dataUri})`);
            matchCount++;
        } else {
            console.warn('Image not found:', absoluteImgPath);
        }
    }
    console.log(`Processed ${matchCount} images in ${path.basename(filePath)}`);
    return newContent;
}

const userManualPath = path.join(__dirname, 'DOC/md/USER_MANUAL.md');
const techDocsPath = path.join(__dirname, 'DOC/md/TECHNICAL_DOCS.md');

console.log('Processing USER_MANUAL.md...');
const userManual = processMarkdown(userManualPath);

console.log('Processing TECHNICAL_DOCS.md...');
const techDocs = processMarkdown(techDocsPath);

const combined = `# Rack Designer - Documentación Completa (Standalone)\n\nEsta es una versión combinada y autónoma de la documentación, con todas las imágenes incrustadas internamente, lo que permite mover este archivo sin que se rompan los enlaces.\n\n---\n\n` + userManual + `\n\n---\n\n` + techDocs;

fs.writeFileSync(path.join(__dirname, 'DOC/md/FULL_MANUAL_STANDALONE.md'), combined);
console.log('Standalone manual created successfully: DOC/md/FULL_MANUAL_STANDALONE.md');
