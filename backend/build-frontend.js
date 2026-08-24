import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const backendPublicDir = path.join(__dirname, "public");

console.log("📦 Building Next.js static export for single-service deployment...");
try {
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
  execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

  console.log("🚚 Copying frontend static export to backend/public...");
  if (fs.existsSync(backendPublicDir)) {
    fs.rmSync(backendPublicDir, { recursive: true, force: true });
  }

  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  const exportOutDir = path.join(frontendDir, "out");
  if (fs.existsSync(exportOutDir)) {
    copyDir(exportOutDir, backendPublicDir);
    console.log("✅ Frontend built and copied to backend/public successfully!");
  } else {
    console.error("❌ Export directory frontend/out not found after build.");
  }
} catch (err) {
  console.error("❌ Failed to build frontend:", err.message);
  process.exit(1);
}
