import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

async function createPWAIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const logoPath = path.join(process.cwd(), 'assets/images/Logo.png');
  const outputDir = path.join(process.cwd(), 'assets/images');

  try {
    // Load the original logo
    const logo = await loadImage(logoPath);
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Fill with dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, size, size);
      
      // Calculate dimensions to fit logo
      const scale = Math.min(size / logo.width, size / logo.height) * 0.8;
      const width = logo.width * scale;
      const height = logo.height * scale;
      const x = (size - width) / 2;
      const y = (size - height) / 2;
      
      // Draw logo
      ctx.drawImage(logo, x, y, width, height);
      
      // Save the icon
      const buffer = canvas.toBuffer('image/png');
      const filename = `icon-${size}x${size}.png`;
      fs.writeFileSync(path.join(outputDir, filename), buffer);
      console.log(`Created ${filename}`);
    }
    
    console.log('✅ All PWA icons created successfully!');
  } catch (error) {
    console.error('Error creating PWA icons:', error);
    
    // Fallback: Copy Logo.png to icon-144x144.png
    console.log('Attempting fallback solution...');
    try {
      fs.copyFileSync(logoPath, path.join(outputDir, 'icon-144x144.png'));
      console.log('✅ Created icon-144x144.png using fallback method');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
}

// Run the script
createPWAIcons();
