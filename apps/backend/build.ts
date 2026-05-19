// build.ts — Bundle backend untuk AWS Lambda
import { build } from "esbuild";
import { execSync } from "child_process";

console.log("🔨 Generating Prisma client...");
execSync("bunx prisma generate", { stdio: "inherit" });

console.log("📦 Bundling for Lambda...");
await build({
  entryPoints: ["src/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outdir: "dist",
  external: [
    // Jangan bundle, Lambda akan pakai versi yang ada di node_modules layer
    "@prisma/client",
    "prisma",
  ],
  banner: {
    // Workaround untuk ESM + __dirname di Lambda
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
    `.trim(),
  },
});

console.log("📂 Copying Prisma client to dist...");
const fs = require("fs");
const path = require("path");

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

// Ensure dist/node_modules structure exists
const distNodeModules = path.join(__dirname, "dist", "node_modules");
if (!fs.existsSync(distNodeModules)) fs.mkdirSync(distNodeModules, { recursive: true });

// Copy @prisma/client
const prismaClientSrc = path.join(__dirname, "node_modules", "@prisma", "client");
const prismaClientDest = path.join(distNodeModules, "@prisma", "client");
if (fs.existsSync(prismaClientSrc)) copyDirSync(prismaClientSrc, prismaClientDest);

// Copy .prisma
const dotPrismaSrc = path.join(__dirname, "node_modules", ".prisma");
const dotPrismaDest = path.join(distNodeModules, ".prisma");
if (fs.existsSync(dotPrismaSrc)) copyDirSync(dotPrismaSrc, dotPrismaDest);

console.log("✅ Build selesai! Output: dist/lambda.js dan Prisma berhasil disalin.");
