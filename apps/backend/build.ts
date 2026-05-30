// build.ts — Bundle backend untuk AWS Lambda
import { build } from "esbuild";
import { execSync } from "child_process";

console.log("🔨 Generating Prisma client...");
execSync("bunx prisma generate", { stdio: "inherit" });

console.log("📦 Bundling for Lambda...");
await Promise.all([
  build({
    entryPoints: ["src/lambda.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
    outfile: "dist/lambda.mjs",
    external: [
      "@prisma/client",
      "prisma",
    ],
  }),
  build({
    entryPoints: ["src/ws-handler.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
    outfile: "dist/ws-handler.mjs",
    external: [
      "@prisma/client",
      "prisma",
    ],
  }),
]);

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

// Locate @prisma/client using require.resolve
const prismaClientEntry = require.resolve("@prisma/client");
const prismaClientSrc = path.dirname(prismaClientEntry);
const prismaClientDest = path.join(distNodeModules, "@prisma", "client");

// Lokasi .prisma biasanya berada sejajar dengan folder @prisma
const dotPrismaSrc = path.join(prismaClientSrc, "..", "..", ".prisma");
const dotPrismaDest = path.join(distNodeModules, ".prisma");

if (fs.existsSync(prismaClientSrc)) {
  copyDirSync(prismaClientSrc, prismaClientDest);
}

if (fs.existsSync(dotPrismaSrc)) {
  copyDirSync(dotPrismaSrc, dotPrismaDest);
  
  // Hapus engine yang tidak diperlukan oleh AWS Lambda untuk mengurangi ukuran Zip (dari ~60MB ke ~30MB)
  const clientDir = path.join(dotPrismaDest, "client");
  if (fs.existsSync(clientDir)) {
    const files = fs.readdirSync(clientDir);
    for (const file of files) {
      if (file.startsWith("query_engine-") || file.startsWith("libquery_engine-")) {
        // Simpan versi RHEL untuk AWS Lambda, hapus sisanya (seperti versi Windows native)
        if (!file.includes("rhel-openssl-3.0.x")) {
          fs.unlinkSync(path.join(clientDir, file));
        }
      }
    }
  }
} else {
  console.warn("⚠️ folder .prisma tidak ditemukan di:", dotPrismaSrc);
}

console.log("✅ Build selesai! Output: dist/lambda.js dan Prisma berhasil disalin.");
