/**
 * Add PWA Support Script
 * Adds manifest link and service worker registration to HTML files
 */

const fs = require('fs').promises;
const path = require('path');

// HTML files to update
const htmlFiles = [
  'index.html',
  'about.html',
  'music.html',
  'live.html',
  'playlist.html',
  'video.html',
  'gallery.html',
  'bookings.html',
  'contact.html',
  'login.html',
  'dashboard.html',
  'admin.html',
  'profile.html',
  'files.html',
  'forum.html'
];

/**
 * Add PWA support to HTML file
 */
async function addPWASupport(filename) {
  try {
    let html = await fs.readFile(filename, 'utf8');
    
    // Check if manifest link already exists
    if (!html.includes('manifest.json')) {
      // Add manifest link
      const manifestLink = '  <link rel="manifest" href="/manifest.json">';
      html = html.replace('</head>', `${manifestLink}\n</head>`);
    }
    
    // Check if PWA init script already exists
    if (!html.includes('pwa-init.js')) {
      // Add PWA init script
      const pwaScript = '  <script defer src="/assets/js/pwa-init.js"></script>';
      html = html.replace('</head>', `${pwaScript}\n</head>`);
    }
    
    // Add theme color meta tag if not present
    if (!html.includes('theme-color')) {
      const themeColor = '  <meta name="theme-color" content="#00ffff">';
      html = html.replace('</head>', `${themeColor}\n</head>`);
    }
    
    // Add apple touch icon if not present
    if (!html.includes('apple-touch-icon')) {
      const appleTouchIcon = '  <link rel="apple-touch-icon" href="/assets/images/icon-192x192.png">';
      html = html.replace('</head>', `${appleTouchIcon}\n</head>`);
    }
    
    // Write updated HTML
    await fs.writeFile(filename, html);
    return true;
  } catch (error) {
    console.error(`Error updating ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Adding PWA support to HTML files...\n');
  
  let successCount = 0;
  
  for (const file of htmlFiles) {
    const success = await addPWASupport(file);
    if (success) {
      console.log(`  ✓ ${file}`);
      successCount++;
    } else {
      console.log(`  ✗ ${file}`);
    }
  }
  
  console.log(`\n✨ PWA support added to ${successCount}/${htmlFiles.length} files!`);
  
  // Create a simple test page for PWA
  const testPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#00ffff">
  <title>PWA Test - BaddBeatz</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/assets/images/icon-192x192.png">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0a0a0a;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #00ffff;
    }
    .status {
      margin: 20px 0;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .status-item {
      margin: 10px 0;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 5px;
    }
    .success { color: #00ff00; }
    .error { color: #ff0000; }
    .info { color: #00ffff; }
  </style>
  <script defer src="/assets/js/pwa-init.js"></script>
</head>
<body>
  <h1>BaddBeatz PWA Test Page</h1>
  
  <div class="status">
    <h2>PWA Status</h2>
    <div id="status-container">
      <div class="status-item info">Checking PWA features...</div>
    </div>
  </div>
  
  <script>
    window.addEventListener('load', () => {
      const container = document.getElementById('status-container');
      container.innerHTML = '';
      
      // Check service worker support
      const swSupport = 'serviceWorker' in navigator;
      container.innerHTML += \`<div class="status-item \${swSupport ? 'success' : 'error'}">
        Service Worker: \${swSupport ? 'Supported ✓' : 'Not Supported ✗'}
      </div>\`;
      
      // Check manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      container.innerHTML += \`<div class="status-item \${manifestLink ? 'success' : 'error'}">
        Manifest: \${manifestLink ? 'Linked ✓' : 'Not Linked ✗'}
      </div>\`;
      
      // Check HTTPS
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      container.innerHTML += \`<div class="status-item \${isSecure ? 'success' : 'error'}">
        HTTPS: \${isSecure ? 'Secure ✓' : 'Not Secure ✗'}
      </div>\`;
      
      // Check online status
      container.innerHTML += \`<div class="status-item \${navigator.onLine ? 'success' : 'error'}">
        Network: \${navigator.onLine ? 'Online ✓' : 'Offline ✗'}
      </div>\`;
      
      // Check notification permission
      if ('Notification' in window) {
        const permission = Notification.permission;
        container.innerHTML += \`<div class="status-item info">
          Notifications: \${permission}
        </div>\`;
      }
      
      // Service worker status
      if (swSupport) {
        navigator.serviceWorker.ready.then(registration => {
          container.innerHTML += '<div class="status-item success">Service Worker: Active ✓</div>';
        }).catch(error => {
          container.innerHTML += '<div class="status-item error">Service Worker: Not Active ✗</div>';
        });
      }
    });
  </script>
</body>
</html>`;
  
  await fs.writeFile('pwa-test.html', testPage);
  console.log('\n📱 Created PWA test page: pwa-test.html');
}

// Run the script
main();
