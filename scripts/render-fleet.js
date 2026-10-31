const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out");

const TOPICS = [
  {
    key: "marble",
    name: "Marble Race Grand Prix (40.3s)",
    compId: "MarbleRace-GrandPrix",
    subDir: "marble",
    thumbFrame: 400,
    maxEps: 1,
  },
  {
    key: "territory",
    name: "Territory Conquest 100% Map Domination (36.0s)",
    compId: "Territory-Domination",
    subDir: "territory",
    thumbFrame: 400,
    maxEps: 1,
  },
  {
    key: "plinko",
    name: "Lucky Plinko $1M Drop ASMR (33.3s)",
    compId: "Plinko-FortuneDrop",
    subDir: "plinko",
    thumbFrame: 400,
    maxEps: 1,
  },
  {
    key: "wyr",
    name: "Would You Rather Showdown (33.0s)",
    compId: "WouldYouRather-Showdown",
    subDir: "wouldYouRather",
    thumbFrame: 250,
    maxEps: 1,
  },
  {
    key: "chat",
    name: "Fake iMessage Drama / AITAH (67.0s)",
    compId: "ChatDramaStory",
    subDir: "chat",
    thumbFrame: 800,
    maxEps: 1,
  },
  {
    key: "bible",
    name: "Bible & Scripture Trivia (101.2s)",
    compId: "BibleTriviaQuiz",
    subDir: "bible",
    thumbFrame: 320,
    maxEps: 1,
  },
  {
    key: "nostalgia",
    name: "80s/90s Nostalgia Quiz (103.6s)",
    compId: "NostalgiaQuiz",
    subDir: "nostalgia",
    thumbFrame: 320,
    maxEps: 1,
  },
  {
    key: "laws",
    name: "Crazy State Laws Quiz (103.8s)",
    compId: "CrazyLawsQuiz",
    subDir: "laws",
    thumbFrame: 320,
    maxEps: 1,
  },
  {
    key: "geography",
    name: "US Geography IQ Quiz (101.1s)",
    compId: "USGeographyQuiz",
    subDir: "geography",
    thumbFrame: 320,
    maxEps: 1,
  },
];

// Ensure output directories exist
TOPICS.forEach((t) => {
  const dir = path.join(OUT_DIR, t.subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Parse command line arguments
const args = process.argv.slice(2);
const topicArg = args.find((a) => a.startsWith("--topic="))?.split("=")[1];
const epArg = args.find((a) => a.startsWith("--ep="))?.split("=")[1];
const allArg = args.includes("--all");

const selectedTopics = topicArg
  ? TOPICS.filter((t) => t.key.toLowerCase() === topicArg.toLowerCase())
  : allArg
    ? TOPICS
    : [TOPICS[0]];

if (selectedTopics.length === 0) {
  console.error(`❌ Unknown topic: ${topicArg}. Available topics: ${TOPICS.map((t) => t.key).join(", ")}`);
  process.exit(1);
}

if (epArg !== undefined && (!/^\d+$/.test(epArg) || Number(epArg) < 1 || Number(epArg) > 10)) {
  console.error("Invalid --ep: expected a whole episode number from 1 to 10.");
  process.exit(1);
}

// Pre-render verification
try {
  execFileSync(process.execPath, [path.join(__dirname, "verify-timelines.js")], { cwd: ROOT, stdio: "inherit" });
} catch {
  console.error("Pre-render verification failed. No render jobs started.");
  process.exit(1);
}

console.log("==================================================");
console.log("🎬 REMOTION FLEET RENDER PIPELINE - MASTER VIDEOS");
console.log(`🎯 Selected Topics: ${selectedTopics.map((t) => t.name).join(", ")}`);
console.log("==================================================\n");

// Default: render exactly 1 master video (Episode 1) per topic unless explicit --ep is given
const targetEps = epArg !== undefined ? [Number(epArg)] : [1];
const totalJobs = selectedTopics.length * targetEps.length;

let currentJob = 0;
const overallStart = Date.now();

const successfulVideos = [];
const failedVideos = [];
const successfulThumbnails = [];
const failedThumbnails = [];

for (const topic of selectedTopics) {
    for (const ep of targetEps) {
      if (ep > topic.maxEps) continue;
      currentJob++;
      const compId = topic.compId || `${topic.compPrefix}${ep}`;
      const mp4Out = path.join(OUT_DIR, topic.subDir, `ep${ep}.mp4`).replace(/\\/g, "/");
      const thumbOut = path.join(OUT_DIR, topic.subDir, `ep${ep}_thumb.png`).replace(/\\/g, "/");

      console.log(`\n--------------------------------------------------`);
      console.log(`[${currentJob}/${totalJobs}] 🚀 Rendering ${topic.name}`);
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
        console.log(`✅ ${topic.name} video rendered in ${durationSec}s (${sizeMb} MB)`);
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
        console.log(`✅ Thumbnail generated -> ${thumbOut}`);
      } catch (err) {
        console.error(`❌ Error rendering thumbnail for ${compId}:`, err.message);
        failedThumbnails.push({ compId, out: thumbOut, ep, topic: topic.key, error: err.message });
      }
    }
  }

  const totalSec = ((Date.now() - overallStart) / 1000).toFixed(1);
  const totalFailures = failedVideos.length + failedThumbnails.length;

  console.log("\n==================================================");
  console.log(`📊 RENDER SUMMARY (${totalSec}s)`);
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

  console.log(`🎉 COMPLETED: All ${successfulVideos.length} master videos and ${successfulThumbnails.length} thumbnails rendered successfully!`);
  console.log(`📁 Files located at: ${OUT_DIR}`);
  console.log("==================================================");
