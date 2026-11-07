const fs = require('node:fs');
const sharp = require('sharp');

(async () => {
  for (const course of ['gcp-pca', 'aws-ans-c01']) {
    const dir = `src/content/courseware/${course}/visuals`;
    const jobs = JSON.parse(fs.readFileSync(`${dir}/generation-plan.json`));
    const assets = {}; const missing = [];
    for (const job of jobs) {
      const base = `public/images/courseware/${course}/${job.id}`;
      if (!fs.existsSync(`${base}.png`) && !fs.existsSync(`${base}.webp`)) { missing.push(job.id); continue; }
      if (fs.existsSync(`${base}.png`) && (!fs.existsSync(`${base}.webp`) || fs.statSync(`${base}.png`).mtimeMs > fs.statSync(`${base}.webp`).mtimeMs)) {
        await sharp(`${base}.png`).webp({ quality: 92, effort: 4 }).toFile(`${base}.webp`);
      }
      const { width, height } = await sharp(`${base}.webp`).metadata();
      if (!width || !height || width <= height) throw Error(`${job.id} must be landscape`);
      assets[job.id] = { width, height };
    }
    fs.writeFileSync(`${dir}/assets.json`, JSON.stringify(assets, null, 2) + '\n');
    console.log(JSON.stringify({ course, ready: Object.keys(assets).length, missing }));
    if (missing.length) process.exitCode = 1;
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
