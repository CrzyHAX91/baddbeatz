const fs = require('fs/promises');
const path = require('path');

async function copyFile(file) {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(__dirname, '..', 'docs', file);
  
  try {
    await fs.copyFile(src, dest);
    console.log(`✓ Copied ${file}`);
  } catch (error) {
    console.warn(`⚠ Warning: Could not copy ${file} - ${error.message}`);
  }
}

async function copyDir(dir) {
  const src = path.join(__dirname, '..', dir);
  const dest = path.join(__dirname, '..', 'docs', dir);
  
  try {
    // Check if source directory exists
    await fs.access(src);
    
    // Remove destination if it exists
    await fs.rm(dest, { recursive: true, force: true });
    
    // Copy directory
    await fs.cp(src, dest, { recursive: true });
    console.log(`✓ Copied directory ${dir}`);
  } catch (error) {
    console.warn(`⚠ Warning: Could not copy directory ${dir} - ${error.message}`);
    
    // Create empty directory as fallback
    try {
      await fs.mkdir(dest, { recursive: true });
      console.log(`✓ Created empty directory ${dir}`);
    } catch (mkdirError) {
      console.error(`✗ Failed to create directory ${dir} - ${mkdirError.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting build process...');
  
  const htmlFiles = [
    'index.html',
    'about.html',
    'music.html',
    'video.html',
    'gallery.html',
    'bookings.html',
    'contact.html',
    'files.html',
    'login.html',
    'playlist.html',
    'profile.html',
    '404.html',
    'dashboard.html',
    'admin.html',
    'live.html',
    'privacy.html',
    'terms.html',
    'disclaimer.html',
    'copyright.html',
    'offline.html'
  ];
  
  const otherFiles = [
    'robots.txt', 
    'sitemap.xml', 
    'CNAME',
    'manifest.json',
    'service-worker.js'
  ];

  // Create docs directory
  try {
    await fs.mkdir(path.join(__dirname, '..', 'docs'), { recursive: true });
    console.log('✓ Created docs directory');
  } catch (error) {
    console.error('✗ Failed to create docs directory:', error.message);
    process.exit(1);
  }

  // Copy HTML files
  console.log('\n📄 Copying HTML files...');
  for (const file of htmlFiles) {
    await copyFile(file);
  }

  // Copy other files
  console.log('\n📋 Copying other files...');
  for (const file of otherFiles) {
    await copyFile(file);
  }

  // Copy directories
  console.log('\n📁 Copying directories...');
  await copyDir('assets');
  await copyDir('data');

  console.log('\n✅ Build process completed successfully!');
}

main().catch((err) => {
  console.error('💥 Build process failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
