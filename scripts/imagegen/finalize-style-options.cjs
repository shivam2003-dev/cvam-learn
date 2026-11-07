// Optimize the original imagegen outputs and record their actual dimensions.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const jobs = require("../../src/content/courseware/visual-style-options/generation-plan.json");

async function main() {
  const assets = {};
  for (const job of jobs) {
    const base = path.join("public/images/courseware/style-options", job.id);
    await sharp(`${base}.png`).webp({ quality: 92, effort: 4 }).toFile(`${base}.webp`);
    const { width, height } = await sharp(`${base}.webp`).metadata();
    if (!width || !height || width <= height) throw new Error(`${job.id} must be landscape`);
    assets[job.id] = { width, height };
  }
  await fs.writeFile("src/content/courseware/visual-style-options/assets.json", JSON.stringify(assets, null, 2) + "\n");
  console.log(`Ready: ${jobs.length} landscape style samples`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
