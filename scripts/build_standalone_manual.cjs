const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

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

const userManualPath = path.join(__dirname, '../DOC/md/USER_MANUAL.md');
const techDocsPath = path.join(__dirname, '../DOC/md/TECHNICAL_DOCS.md');

console.log('Processing USER_MANUAL.md...');
const userManual = processMarkdown(userManualPath);

console.log('Processing TECHNICAL_DOCS.md...');
const techDocs = processMarkdown(techDocsPath);

const combinedMd = `# Rack Designer Next - Documentación Completa (Standalone)\n\nEsta es una versión combinada y autónoma de la documentación, con todas las imágenes incrustadas internamente, lo que permite mover este archivo sin que se rompan los enlaces.\n\n---\n\n` + userManual + `\n\n---\n\n` + techDocs;

// Write MD
fs.writeFileSync(path.join(__dirname, '../DOC/md/FULL_MANUAL_STANDALONE.md'), combinedMd);
console.log('Standalone MD created successfully: DOC/md/FULL_MANUAL_STANDALONE.md');

// Write HTML
const htmlContent = marked.parse(combinedMd);

const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rack Designer Next - Manual Autónomo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f9fafb;
        }
        .container {
            background: #ffffff;
            padding: 2rem 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; }
        h1 { color: #2563eb; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
        code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; color: #db2777; }
        ul { padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 1em; }
        li { margin-bottom: 0.5em; }
        hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        img { max-width: 100%; height: auto; display: block; margin: 1rem auto; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../DOC/html/FULL_MANUAL_STANDALONE.html'), htmlTemplate);
console.log('Standalone HTML created successfully: DOC/html/FULL_MANUAL_STANDALONE.html');
