const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out", "kinetic");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const KINETIC_COMPS = [
  { id: "Kinetic-HeartBloom", name: "Heart Bloom (38.0s - 1,001 Cells)", thumbFrame: 500 },
  { id: "Kinetic-OrbitBloom", name: "Orbit Bloom (34.5s - 1,456 Cells)", thumbFrame: 500 },
  { id: "Kinetic-RingRivals", name: "Ring Rivals (37.2s - Red vs Blue)", thumbFrame: 500 },
  { id: "Kinetic-SquareRivals", name: "Square Rivals (36.8s - Gold vs Violet)", thumbFrame: 500 },
  { id: "Kinetic-PrismCollapse", name: "Prism Collapse (35.2s - 796 Bricks)", thumbFrame: 500 },
  { id: "Kinetic-NeonBloom-35s", name: "Neon Boundary Bloom (35.0s)", thumbFrame: 500 },
  { id: "Kinetic-BuildBattle-35s", name: "Build Battle Red vs Blue (36.0s - 100% Arena Conquered)", thumbFrame: 500 },
  { id: "Kinetic-BrickBreaker-1K", name: "1K Brick Breaker Multi-ball (56.0s - 3,076 Bricks Cleared)", thumbFrame: 800 },
];

const args = process.argv.slice(2);
const idArg = args.find((a) => a.startsWith("--id="))?.split("=")[1];

const jobs = idArg
  ? KINETIC_COMPS.filter((c) => c.id.toLowerCase() === idArg.toLowerCase() || c.id.toLowerCase().includes(idArg.toLowerCase()))
  : KINETIC_COMPS;

if (jobs.length === 0) {
  console.error(`❌ Unknown id: ${idArg}. Available: ${KINETIC_COMPS.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

console.log("==================================================");
console.log("🌌 REMOTION KINETIC STUDIES & DUEL RENDER PIPELINE (35s)");
console.log(`🎯 Compositions to render (${jobs.length}): ${jobs.map((j) => j.name).join(", ")}`);
console.log("==================================================\n");

let successes = 0;
for (let i = 0; i < jobs.length; i++) {
  const job = jobs[i];
  const mp4Out = path.join(OUT_DIR, `${job.id}.mp4`).replace(/\\/g, "/");
  const thumbOut = path.join(OUT_DIR, `${job.id}_thumb.png`).replace(/\\/g, "/");

  console.log(`\n[${i + 1}/${jobs.length}] 🚀 Rendering ${job.name} ...`);
  console.log(`   Video: ${mp4Out}`);
  console.log(`   Thumb: ${thumbOut}`);

  const start = Date.now();
  try {
    execSync(`npx remotion render src/index.ts ${job.id} "${mp4Out}"`, { stdio: "inherit", cwd: ROOT });
    execSync(`npx remotion still src/index.ts ${job.id} "${thumbOut}" --frame=${job.thumbFrame}`, { stdio: "inherit", cwd: ROOT });
    const sec = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✅ Rendered ${job.id} successfully in ${sec}s!`);
    successes++;
  } catch (err) {
    console.error(`❌ Failed to render ${job.id}:`, err.message);
  }
}

console.log("\n==================================================");
console.log(`📊 Result: ${successes}/${jobs.length} kinetic videos completed!`);
console.log(`📁 Files located at: ${OUT_DIR}`);
console.log("==================================================");
