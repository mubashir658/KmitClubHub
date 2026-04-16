const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'frontend', 'public', 'eventpics');

async function compress() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
      const p = path.join(dir, file);
      const out = path.join(dir, path.parse(file).name + '.webp');
      
      console.log(`Compressing ${file}...`);
      await sharp(p)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(out);
      
      console.log(`Saved ${out}`);
      // Optionally remove the old file:
      // fs.unlinkSync(p);
    }
  }
}

compress().catch(console.error);
