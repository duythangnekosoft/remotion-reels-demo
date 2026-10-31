const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "out");
try {
  execFileSync(process.execPath, [path.join(__dirname, "verify-timelines.js")], {
    cwd: path.join(__dirname, ".."), stdio: "inherit",
  });
} catch {
  console.error("Pre-render verification failed. No render jobs started.");
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const JOBS = [
  {
    type: "still",
    comp: "BarChartRaceThumbnail-Thumb",
    out: "out/barchart_thumbnail.png",
    label: "🖼️ Thumbnail: Tech Bar Chart",
  },
  {
    type: "still",
    comp: "BillionairesThumbnail-Thumb",
    out: "out/billionaires_thumbnail.png",
    label: "🖼️ Thumbnail: Billionaires Race",
  },
  {
    type: "render",
    comp: "BarChartRaceTech",
    out: "out/barchart.mp4",
    label: "🎬 Video: Tech Giants Market Cap Race (35s)",
  },
  {
    type: "render",
    comp: "BillionairesRace",
    out: "out/billionaires.mp4",
    label: "🎬 Video: World's Richest People Race (35s)",
  },
  {
    type: "render",
    comp: "USGeographyQuiz",
    out: "out/quiz.mp4",
    label: "🎬 Video: US Geography IQ Quiz",
  },
  {
    type: "render",
    comp: "BibleTriviaQuiz",
    out: "out/bible_quiz.mp4",
    label: "🎬 Video: Bible & Scripture Trivia",
  },
  {
    type: "render",
    comp: "ChatDramaStory",
    out: "out/chat_drama.mp4",
    label: "🎬 Video: Fake iMessage Drama / AITAH",
  },
  {
    type: "render",
    comp: "NostalgiaQuiz",
    out: "out/nostalgia_quiz.mp4",
    label: "🎬 Video: 80s/90s American Nostalgia Quiz",
  },
  {
    type: "render",
    comp: "CrazyLawsQuiz",
    out: "out/crazy_laws.mp4",
    label: "🎬 Video: US State Secrets & Crazy Laws",
  },
  {
    type: "render",
    comp: "MarbleRace-GrandPrix",
    out: "out/marble_race.mp4",
    label: "🎬 Video: Marble Race Championship (40.3s)",
  },
  {
    type: "render",
    comp: "Territory-Domination",
    out: "out/territory_conquest.mp4",
    label: "🎬 Video: Territory Conquest (100% Domination, 36s)",
  },
  {
    type: "render",
    comp: "Plinko-FortuneDrop",
    out: "out/plinko_drop.mp4",
    label: "🎬 Video: Lucky Plinko $1M Drop ASMR (33.3s)",
  },
  {
    type: "render",
    comp: "WouldYouRather-Showdown",
    out: "out/would_you_rather.mp4",
    label: "🎬 Video: Would You Rather Showdown (33s)",
  },
  {
    type: "render",
    comp: "LastMarble-MechanicalASMR",
    out: "out/last_marble.mp4",
    label: "🎬 Video: The Last Marble Mechanical ASMR (45s)",
  },
];

console.log("==================================================");
console.log("🚀 REMOTION BATCH RENDER PIPELINE - OPTIMIZED");
console.log(`📦 Output Directory: ${OUT_DIR}`);
console.log("==================================================\n");

const startTime = Date.now();
const successfulRenders = [];
const failedRenders = [];
const successfulStills = [];
const failedStills = [];

for (let i = 0; i < JOBS.length; i++) {
  const job = JOBS[i];
  console.log(`[${i + 1}/${JOBS.length}] ${job.label}...`);
  const jobStart = Date.now();

  let cmd = "";
  if (job.type === "still") {
    cmd = `npx remotion still src/index.ts ${job.comp} ${job.out}`;
  } else {
    cmd = `npx remotion render src/index.ts ${job.comp} ${job.out}`;
  }

  try {
    execSync(cmd, { stdio: "inherit", cwd: path.join(__dirname, "..") });
    const elapsed = ((Date.now() - jobStart) / 1000).toFixed(1);
    console.log(`✅ Finished ${job.comp} in ${elapsed}s -> ${job.out}\n`);
    if (job.type === "still") {
      successfulStills.push({ comp: job.comp, out: job.out, elapsed });
    } else {
      successfulRenders.push({ comp: job.comp, out: job.out, elapsed });
    }
  } catch (err) {
    console.error(`❌ Error rendering ${job.comp}:`, err.message);
    if (job.type === "still") {
      failedStills.push({ comp: job.comp, out: job.out, error: err.message });
    } else {
      failedRenders.push({ comp: job.comp, out: job.out, error: err.message });
    }
  }
}

const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const totalFailed = failedRenders.length + failedStills.length;
const totalSuccess = successfulRenders.length + successfulStills.length;

console.log("==================================================");
console.log(`📊 BATCH RENDER SUMMARY (${totalElapsed}s)`);
console.log(`🎬 Videos (MP4): ${successfulRenders.length} succeeded, ${failedRenders.length} failed`);
console.log(`🖼️ Thumbnails (Still): ${successfulStills.length} succeeded, ${failedStills.length} failed`);
console.log(`📦 Total Jobs: ${totalSuccess}/${JOBS.length} succeeded`);

if (totalFailed > 0) {
  console.log("\n❌ THE FOLLOWING JOBS FAILED:");
  if (failedRenders.length > 0) {
    console.log("  [Failed Video MP4s]:");
    failedRenders.forEach((f) => console.log(`   - ${f.comp} -> ${f.out}`));
  }
  if (failedStills.length > 0) {
    console.log("  [Failed Thumbnails / Still]:");
    failedStills.forEach((f) => console.log(`   - ${f.comp} -> ${f.out}`));
  }
  console.log("==================================================");
  process.exit(1);
}

console.log(`🎉 ALL ${JOBS.length} JOBS COMPLETED SUCCESSFULLY!`);
console.log("==================================================");
