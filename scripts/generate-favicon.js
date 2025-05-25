const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));
    
    // Generate PNG in different sizes
    const sizes = [16, 32, 48];
    await Promise.all(
      sizes.map(size =>
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(path.join(__dirname, `../public/favicon-${size}.png`))
      )
    );

    // Also create a 32x32 favicon.png as the main favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.png'));

    console.log('Favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicon(); 