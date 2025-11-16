#!/usr/bin/env node

const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'PROJECT_OVERVIEW.md');
const outputFile = path.join(__dirname, '..', 'OmniTip_Project_Overview.pdf');

console.log('📄 Generating PDF from PROJECT_OVERVIEW.md...');

markdownpdf({
  cssPath: null,
  paperFormat: 'Letter',
  paperOrientation: 'portrait',
  paperBorder: '2cm',
  renderDelay: 1000,
  loadTimeout: 10000
})
  .from(inputFile)
  .to(outputFile, function () {
    console.log('✅ PDF generated successfully!');
    console.log(`📍 Location: ${outputFile}`);
    
    const stats = fs.statSync(outputFile);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
  });
