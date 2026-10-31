import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const imagesDir = path.resolve("public/images");
const files = fs.readdirSync(imagesDir);

const results = [];

for (const file of files) {
  if (file === "logo.png" || file === "logo-icon.png" || file.startsWith(".")) {
    continue;
  }
  const fullPath = path.join(imagesDir, file);
  const stat = fs.statSync(fullPath);
  const beforeBytes = stat.size;

  let buffer = fs.readFileSync(fullPath);
  let compressedBuffer;

  if (file.endsWith(".png")) {
    compressedBuffer = await sharp(buffer)
      .png({ compressionLevel: 9, quality: 80, palette: true })
      .toBuffer();
  } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  }

  if (compressedBuffer && compressedBuffer.length < beforeBytes) {
    fs.writeFileSync(fullPath, compressedBuffer);
    const afterBytes = compressedBuffer.length;
    const savings = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    results.push({
      file,
      before: (beforeBytes / 1024).toFixed(1) + " KB",
      after: (afterBytes / 1024).toFixed(1) + " KB",
      savings: savings + "%",
    });
  }
}

console.log("\nImage Compression Results:");
console.table(results);

