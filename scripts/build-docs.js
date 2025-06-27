const fs = require('fs/promises');
const path = require('path');

async function copyFile(file) {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(__dirname, '..', 'docs', file);
  await fs.copyFile(src, dest);
}

async function copyDir(dir) {
  const src = path.join(__dirname, '..', dir);
  const dest = path.join(__dirname, '..', 'docs', dir);
  await fs.rm(dest, { recursive: true, force: true });
  await fs.cp(src, dest, { recursive: true });
}

async function main() {
  const htmlFiles = [
    'index.html',
    'about.html',
    'music.html',
    'gallery.html',
    'bookings.html',
    'contact.html',
    '404.html'
  ];
  const otherFiles = ['robots.txt', 'sitemap.xml', 'CNAME'];

  await fs.mkdir(path.join(__dirname, '..', 'docs'), { recursive: true });

  for (const file of htmlFiles.concat(otherFiles)) {
    await copyFile(file);
  }
  await copyDir('assets');
  await copyDir('data');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
