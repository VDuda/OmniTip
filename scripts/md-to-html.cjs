const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'PROJECT_OVERVIEW.md');
const outputFile = path.join(__dirname, '..', 'PROJECT_OVERVIEW.html');

const markdown = fs.readFileSync(inputFile, 'utf8');

// Simple markdown to HTML conversion
let html = markdown
  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
  .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
  .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/gim, '<em>$1</em>')
  .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
  .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
  .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
  .replace(/`(.*?)`/gim, '<code>$1</code>')
  .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
  .replace(/^- (.*$)/gim, '<li>$1</li>')
  .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
  .replace(/\n\n/g, '</p><p>')
  .replace(/^(.+)$/gim, '<p>$1</p>');

const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OmniTip Project Overview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #1a1a1a; border-bottom: 3px solid #f0b90b; padding-bottom: 10px; }
    h2 { color: #2c3e50; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
    h3 { color: #34495e; margin-top: 20px; }
    h4 { color: #555; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #f0b90b; padding-left: 20px; margin: 20px 0; color: #666; font-style: italic; }
    a { color: #f0b90b; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f0b90b; color: white; }
    ul, ol { margin: 10px 0; padding-left: 30px; }
    li { margin: 5px 0; }
    @media print {
      body { margin: 0; padding: 20px; }
      h1 { page-break-before: always; }
      h1:first-of-type { page-break-before: avoid; }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

fs.writeFileSync(outputFile, fullHtml);
console.log('✅ HTML generated:', outputFile);
console.log('📄 Open this file in a browser and use Print > Save as PDF');
