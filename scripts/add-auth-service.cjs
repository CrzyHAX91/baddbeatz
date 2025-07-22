const fs = require('fs');
const path = require('path');

// HTML files that need auth service
const htmlFiles = [
  'login.html',
  'dashboard.html',
  'admin.html'
];

let totalUpdated = 0;

function addAuthServiceToHTML(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if auth-service.js is already included
    if (content.includes('auth-service.js')) {
      console.log(`✓ Auth service already included in ${filePath}`);
      return;
    }
    
    // Find the login.js script tag and add auth-service.js before it
    const loginScriptPattern = /<script\s+(?:defer\s+)?src="assets\/js\/login\.js"><\/script>/;
    const dashboardScriptPattern = /<script\s+(?:defer\s+)?src="assets\/js\/dashboard\.js"><\/script>/;
    const adminScriptPattern = /<script\s+(?:defer\s+)?src="assets\/js\/admin\.js"><\/script>/;
    
    let replaced = false;
    
    // For login.html
    if (loginScriptPattern.test(content)) {
      content = content.replace(loginScriptPattern, 
        '<script defer src="assets/js/auth-service.js"></script>\n  <script defer src="assets/js/login.js"></script>');
      replaced = true;
    }
    // For dashboard.html
    else if (dashboardScriptPattern.test(content)) {
      content = content.replace(dashboardScriptPattern, 
        '<script defer src="assets/js/auth-service.js"></script>\n  <script defer src="assets/js/dashboard.js"></script>');
      replaced = true;
    }
    // For admin.html
    else if (adminScriptPattern.test(content)) {
      content = content.replace(adminScriptPattern, 
        '<script defer src="assets/js/auth-service.js"></script>\n  <script defer src="assets/js/admin.js"></script>');
      replaced = true;
    }
    // If no specific script found, add before closing body
    else {
      const bodyCloseIndex = content.lastIndexOf('</body>');
      if (bodyCloseIndex !== -1) {
        content = content.slice(0, bodyCloseIndex) + 
                  '  <script defer src="assets/js/auth-service.js"></script>\n' + 
                  content.slice(bodyCloseIndex);
        replaced = true;
      }
    }
    
    if (replaced) {
      // Write the updated content back
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Added auth service to ${filePath}`);
      totalUpdated++;
    } else {
      console.log(`⚠ Could not find suitable insertion point in ${filePath}`);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠ File not found: ${filePath}`);
    } else {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }
}

console.log('Adding auth-service.js to HTML files...\n');

// Process each HTML file
htmlFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  addAuthServiceToHTML(fullPath);
});

console.log(`\n✅ Total HTML files updated: ${totalUpdated}`);
console.log('\nAuth service has been added to enable real authentication.');
