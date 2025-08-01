const fs = require('fs');
const path = require('path');

// HTML files to update
const htmlFiles = [
  'index.html',
  'login.html',
  'dashboard.html',
  'admin.html',
  'privacy.html',
  'terms.html',
  'disclaimer.html',
  'copyright.html',
  'live.html',
  'offline.html'
];

let totalUpdated = 0;

// DOMPurify CDN script tag
const dompurifyCDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js" integrity="sha512-H+rglffZ6f5gF7UJgvH4Naa+fGCgjrHKMgoFOGmcPTRwR6oILo5R+gtzNrpDp7iMV3udbymBVjkeZGNz1Em4rQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>';

function addDOMPurifyToHTML(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if DOMPurify is already included
    if (content.includes('dompurify') || content.includes('DOMPurify')) {
      console.log(`✓ DOMPurify already included in ${filePath}`);
      return;
    }
    
    // Find the best place to insert DOMPurify
    // Try to insert before the first script tag
    const scriptIndex = content.indexOf('<script');
    
    if (scriptIndex !== -1) {
      // Insert before the first script tag
      content = content.slice(0, scriptIndex) + 
                `    ${dompurifyCDN}\n    ` + 
                content.slice(scriptIndex);
    } else {
      // If no script tags, insert before closing body tag
      const bodyCloseIndex = content.indexOf('</body>');
      if (bodyCloseIndex !== -1) {
        content = content.slice(0, bodyCloseIndex) + 
                  `    ${dompurifyCDN}\n` + 
                  content.slice(bodyCloseIndex);
      } else {
        console.log(`⚠ Could not find suitable insertion point in ${filePath}`);
        return;
      }
    }
    
    // Write the updated content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Added DOMPurify to ${filePath}`);
    totalUpdated++;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠ File not found: ${filePath}`);
    } else {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }
}

console.log('Adding DOMPurify to HTML files...\n');

// Process each HTML file
htmlFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  addDOMPurifyToHTML(fullPath);
});

console.log(`\n✅ Total HTML files updated: ${totalUpdated}`);
console.log('\nDOMPurify has been added to protect against XSS attacks.');
