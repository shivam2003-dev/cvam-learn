const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const root = 'public/images/courseware/fde';
const plan = require('../../src/content/courseware/fde/visuals/generation-plan.json');
(async () => {
  const manifest = {};
  const missing = [];
  const portrait = [];
  for (const job of plan) {
    const source = path.join(root, job.id + '.png');
    const target = path.join(root, job.id + '.webp');
    if (!fs.existsSync(source) && !fs.existsSync(target)) { missing.push(job.id); continue; }
    if (fs.existsSync(source) && (!fs.existsSync(target) || fs.statSync(source).mtimeMs > fs.statSync(target).mtimeMs)) {
      const metadata = await sharp(source).metadata();
      if (metadata.width <= metadata.height) { portrait.push(job.id); continue; }
      await sharp(source).webp({quality: 92, effort: 4}).toFile(target);
    }
    const metadata = await sharp(target).metadata();
    manifest[job.id] = {width: metadata.width, height: metadata.height};
  }
  fs.writeFileSync('src/content/courseware/fde/visuals/assets.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ready: Object.keys(manifest).length, missing, portrait}));
})();
