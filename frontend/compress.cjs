const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public', 'eventpics');

async function compress() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
      const p = path.join(dir, file);
      const out = path.join(dir, path.parse(file).name + '.webp');
      
      console.log(`Compressing ${file}...`);
      await sharp(p)
        .resize(1000)
        .webp({ quality: 80 })
        .toFile(out);
      
      console.log(`Saved ${out}`);
      // Remove original so it doesn't get grabbed by accident if the user commits
      fs.unlinkSync(p);
    }
  }
}

compress().catch(console.error);
