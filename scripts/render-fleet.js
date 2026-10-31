const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out");

// Ensure output directories exist
["bible", "nostalgia", "laws", "geography", "chat", "barchart", "singularity"].forEach((sub) => {
  const dir = path.join(OUT_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Parse command line arguments
// e.g.: node scripts/render-fleet.js --topic=chat --ep=2
// e.g.: node scripts/render-fleet.js --topic=bible
// e.g.: node scripts/render-fleet.js --all
const args = process.argv.slice(2);
const topicArg = args.find((a) => a.startsWith("--topic="))?.split("=")[1];
const epArg = args.find((a) => a.startsWith("--ep="))?.split("=")[1];
const allArg = args.includes("--all");

const TOPICS = [
  {
    key: "bible",
    name: "Bible & Scripture Trivia",
    compPrefix: "BibleQuiz-Ep",
    subDir: "bible",
    thumbFrame: 320,
  },
  {
    key: "nostalgia",
    name: "80s/90s Nostalgia Quiz",
    compPrefix: "NostalgiaQuiz-Ep",
    subDir: "nostalgia",
    thumbFrame: 320,
  },
  {
    key: "laws",
    name: "Crazy State Laws Quiz",
    compPrefix: "CrazyLaws-Ep",
    subDir: "laws",
    thumbFrame: 320,
  },
  {
    key: "geography",
    name: "US Geography IQ Quiz",
    compPrefix: "GeographyQuiz-Ep",
    subDir: "geography",
    thumbFrame: 320,
  },
  {
    key: "chat",
    name: "Fake iMessage Drama / AITAH",
    compPrefix: "ChatDrama-Ep",
    subDir: "chat",
    thumbFrame: 800,
  },
  {
    key: "singularity",
    name: "Kinetic ASMR Singularity Siege",
    compPrefix: "SingularitySiege-Ep",
    subDir: "singularity",
    thumbFrame: 1200,
  },
];

const selectedTopics = topicArg
  ? TOPICS.filter((t) => t.key.toLowerCase() === topicArg.toLowerCase())
  : allArg
    ? TOPICS
    : [TOPICS[0]]; // Default to first if none specified

if (selectedTopics.length === 0) {
  console.error(`❌ Unknown topic: ${topicArg}. Available topics: ${TOPICS.map((t) => t.key).join(", ")}`);
  process.exit(1);
}

if (epArg !== undefined && (!/^\d+$/.test(epArg) || Number(epArg) < 1 || Number(epArg) > 10)) {
  console.error("Invalid --ep: expected a whole episode number from 1 to 10.");
  process.exit(1);
}
const episodes = epArg === undefined ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [Number(epArg)];

// Fail before spending time rendering when source, audio or timelines are invalid.
try {
  execFileSync(process.execPath, [path.join(__dirname, "verify-timelines.js")], { cwd: ROOT, stdio: "inherit" });
} catch {
  console.error("Pre-render verification failed. No render jobs started.");
  process.exit(1);
}

console.log("==================================================");
console.log("🎬 REMOTION FLEET RENDER PIPELINE - FB REELS US");
console.log(`🎯 Topics: ${selectedTopics.map((t) => t.name).join(", ")}`);
console.log(`📺 Episodes: ${episodes.join(", ")}`);
console.log("==================================================\n");

const totalJobs = selectedTopics.length * episodes.length;
let currentJob = 0;
const overallStart = Date.now();

const successfulVideos = [];
const failedVideos = [];
const successfulThumbnails = [];
const failedThumbnails = [];

for (const topic of selectedTopics) {
  for (const ep of episodes) {
    currentJob++;
    const compId = `${topic.compPrefix}${ep}-Tap${ep}`;
    const mp4Out = path.join(OUT_DIR, topic.subDir, `ep${ep}.mp4`).replace(/\\/g, "/");
    const thumbOut = path.join(OUT_DIR, topic.subDir, `ep${ep}_thumb.png`).replace(/\\/g, "/");

    console.log(`\n--------------------------------------------------`);
    console.log(`[${currentJob}/${totalJobs}] 🚀 Rendering ${topic.name} (Episode ${ep})`);
    console.log(`📦 Composition: ${compId}`);
    console.log(`🎥 Output Video: ${mp4Out}`);
    console.log(`🖼️ Output Thumb: ${thumbOut}`);
    console.log(`--------------------------------------------------`);

    const jobStart = Date.now();

    // 1. Render Video MP4
    const renderCmd = `npx remotion render src/index.ts ${compId} "${mp4Out}"`;
    try {
      execSync(renderCmd, { stdio: "inherit", cwd: ROOT });
      const durationSec = ((Date.now() - jobStart) / 1000).toFixed(1);
      const sizeMb = (fs.statSync(mp4Out).size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Episode ${ep} video rendered in ${durationSec}s (${sizeMb} MB)`);
      successfulVideos.push({ compId, out: mp4Out, ep, topic: topic.key });
    } catch (err) {
      console.error(`❌ Error rendering video ${compId}:`, err.message);
      failedVideos.push({ compId, out: mp4Out, ep, topic: topic.key, error: err.message });
    }

    // 2. Render Thumbnail Still
    const stillCmd = `npx remotion still src/index.ts ${compId} "${thumbOut}" --frame=${topic.thumbFrame}`;
    try {
      execSync(stillCmd, { stdio: "inherit", cwd: ROOT });
      successfulThumbnails.push({ compId, out: thumbOut, ep, topic: topic.key });
      console.log(`✅ Episode ${ep} thumbnail generated -> ${thumbOut}`);
    } catch (err) {
      console.error(`❌ Error rendering thumbnail for ${compId}:`, err.message);
      failedThumbnails.push({ compId, out: thumbOut, ep, topic: topic.key, error: err.message });
    }
  }
}

const totalSec = ((Date.now() - overallStart) / 1000).toFixed(1);
const totalFailures = failedVideos.length + failedThumbnails.length;

console.log("\n==================================================");
console.log(`📊 FLEET RENDER SUMMARY (${totalSec}s)`);
console.log(`🎬 Videos (MP4): ${successfulVideos.length} succeeded, ${failedVideos.length} failed (Total: ${totalJobs})`);
console.log(`🖼️ Thumbnails (Still): ${successfulThumbnails.length} succeeded, ${failedThumbnails.length} failed (Total: ${totalJobs})`);

if (totalFailures > 0) {
  console.log("\n❌ THE FOLLOWING JOBS FAILED:");
  if (failedVideos.length > 0) {
    console.log("  [Failed Video MP4s]:");
    failedVideos.forEach((f) => console.log(`   - ${f.compId} -> ${f.out}`));
  }
  if (failedThumbnails.length > 0) {
    console.log("  [Failed Thumbnails]:");
    failedThumbnails.forEach((f) => console.log(`   - ${f.compId} -> ${f.out}`));
  }
  console.log("==================================================");
  process.exit(1);
}

console.log(`🎉 BATCH COMPLETE: All ${successfulVideos.length} videos and ${successfulThumbnails.length} thumbnails rendered successfully!`);
console.log(`📁 Files located at: ${OUT_DIR}`);
console.log("==================================================");

