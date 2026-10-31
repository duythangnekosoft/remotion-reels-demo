const fs = require("fs");
const path = require("path");

const SRC_ROOT = path.join(__dirname, "..");
const DST_ROOT = "C:\\Users\\Gigabyte\\Desktop\\remotion-reels-demo";

console.log("🚀 Syncing from Scratch to Desktop workspace...");
console.log(`Source:      ${SRC_ROOT}`);
console.log(`Destination: ${DST_ROOT}`);

if (!fs.existsSync(DST_ROOT)) {
  console.error("❌ Destination directory does not exist!");
  process.exit(1);
}

// 1. Remove obsolete SingularitySiege from Desktop
const obsoletePaths = [
  path.join(DST_ROOT, "src", "SingularitySiege"),
  path.join(DST_ROOT, "src", "data", "singularity"),
  path.join(DST_ROOT, "public", "audio", "singularity"),
];

obsoletePaths.forEach((p) => {
  if (fs.existsSync(p)) {
    console.log(`🗑️ Removing obsolete: ${p}`);
    fs.rmSync(p, { recursive: true, force: true });
  }
});

// Helper for recursive copy
function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) {
      fs.mkdirSync(dst, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const f of files) {
      if (f === "node_modules" || f === ".git" || f === ".remotion") continue;
      copyRecursive(path.join(src, f), path.join(dst, f));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

// 2. Directories to mirror
const DIRS_TO_SYNC = [
  path.join("src"),
  path.join("scripts"),
  path.join("public", "sounds"),
  path.join("public", "audio"),
  path.join("out"),
];

DIRS_TO_SYNC.forEach((rel) => {
  const s = path.join(SRC_ROOT, rel);
  const d = path.join(DST_ROOT, rel);
  if (fs.existsSync(s)) {
    console.log(`📂 Syncing directory: ${rel}`);
    copyRecursive(s, d);
  }
});

// 3. Single files to mirror
const FILES_TO_SYNC = [
  "package.json",
  "Render_Menu.bat",
  "Open_Guide.bat",
  "Start_Studio.bat",
  "PROJECT_CRITERIA.md",
  path.join("public", "guide.html"),
];

FILES_TO_SYNC.forEach((rel) => {
  const s = path.join(SRC_ROOT, rel);
  const d = path.join(DST_ROOT, rel);
  if (fs.existsSync(s)) {
    console.log(`📄 Syncing file: ${rel}`);
    fs.copyFileSync(s, d);
  }
});

console.log("✅ Desktop workspace synchronized successfully!");

