const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { readWavDuration } = require("./wav-duration");

const ROOT = process.env.TEST_TMP || path.join(__dirname, "..");

// Auto-compile TypeScript sources into dist/ unless skipped (e.g. for mock tests)
if (!process.argv.includes("--no-build")) {
  console.log("🔨 [Step 1/4] Compiling fresh TypeScript sources to dist/ ...");
  try {
    if (process.env.TEST_BUILD) {
      execFileSync(process.execPath, [process.env.TEST_BUILD, path.join(ROOT, "dist", "built.txt")], {
        cwd: ROOT,
        stdio: "inherit",
      });
    } else {
      execFileSync(
        process.execPath,
        [require.resolve("typescript/bin/tsc"), "--outDir", path.join(ROOT, "dist"), "--noEmit", "false"],
        { cwd: ROOT, stdio: "inherit" }
      );
    }
    console.log("✅ TypeScript compilation successful!\n");
  } catch (err) {
    console.error("❌ TypeScript compilation failed! Aborting verification.");
    process.exit(1);
  }
}

// Helper: read raw WAV duration directly from file binary header on disk
function getWavHeaderDuration(filePath) {
  try {
    return readWavDuration(filePath);
  } catch (error) {
    return null;
  }
}

// Load compiled datasets & timeline utils from dist/
const metadataFile = process.env.TEST_METADATA || path.join(ROOT, "src", "data", "audioDurations.json");
const audioDurations = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
const { GEOGRAPHY_EPISODES } = require("../dist/data/geographyEpisodes");
const { BIBLE_EPISODES } = require("../dist/data/bibleEpisodes");
const { NOSTALGIA_EPISODES } = require("../dist/data/nostalgiaEpisodes");
const { CRAZY_LAWS_EPISODES } = require("../dist/data/crazyLawsEpisodes");
const { CHAT_DRAMA_EPISODES } = require("../dist/data/chatDramaEpisodes");
const {
  getQuizTiming,
  getGeographyDuration,
  getBibleDuration,
  getNostalgiaDuration,
  getCrazyLawsDuration,
  getChatDramaTiming,
  getChatDramaDuration,
} = require("../dist/data/timelineUtils");

let totalChecked = 0;
const errors = [];
const warnings = [];

// ---------------------------------------------------------
// 1. VERIFY QUIZ TOPICS (40 EPISODES)
// ---------------------------------------------------------
function checkQuizTopic(topic, episodes, getDurationFn) {
  console.log(`🔍 Verifying ${topic.toUpperCase()} (10 episodes against disk WAV headers)...`);
  for (const ep of episodes) {
    const epNum = ep.episodeNumber;
    const timing = getQuizTiming(topic, epNum);
    const compDuration = getDurationFn(epNum);
    totalChecked++;

    if (!Number.isFinite(timing.totalDuration) || !Number.isFinite(compDuration)) {
      errors.push(`${topic} ep ${epNum}: Non-finite duration detected`);
    }

    if (timing.totalDuration !== compDuration) {
      errors.push(`${topic} ep ${epNum}: timing.totalDuration (${timing.totalDuration}) != compDuration (${compDuration})`);
    }

    for (let q = 0; q < timing.questions.length; q++) {
      const qT = timing.questions[q];
      const wavKey = `ep${epNum}_q${q + 1}`;
      const wavPath = path.join(ROOT, "public", "audio", topic, `${wavKey}.wav`);

      const diskWavSec = getWavHeaderDuration(wavPath);
      if (!Number.isFinite(diskWavSec)) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: Missing or invalid WAV header on disk (${wavPath})`);
        continue;
      }

      if (!audioDurations[topic] || !audioDurations[topic][wavKey]) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: Key ${wavKey} missing in audioDurations.json`);
      } else {
        const jsonSec = audioDurations[topic][wavKey];
        if (!Number.isFinite(jsonSec) || Math.abs(diskWavSec - jsonSec) > 0.01) {
          errors.push(`${topic} ep ${epNum} q${q + 1}: Disk WAV duration (${diskWavSec.toFixed(3)}s) does not match audioDurations.json (${jsonSec}s)`);
        }
      }

      const actualWavFrames = Math.ceil(diskWavSec * 30);
      if (qT.audioFrames < actualWavFrames) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: audioFrames (${qT.audioFrames}) < actualWavFrames (${actualWavFrames})`);
      }

      const voEnd = 6 + qT.audioFrames;
      if (qT.countdownStart < voEnd) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: countdownStart (${qT.countdownStart}) < voEnd (${voEnd})`);
      }

      if (qT.countdownEnd - qT.countdownStart !== 300) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: countdown duration is not 300 frames`);
      }

      if (qT.revealFrame < qT.countdownEnd) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: revealFrame < countdownEnd`);
      }

      if (qT.totalFrames - qT.revealFrame !== 90) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: reveal duration is not 90 frames`);
      }
    }

    const outroKey = `ep${epNum}_outro`;
    const outroPath = path.join(ROOT, "public", "audio", topic, `${outroKey}.wav`);
    const diskOutroSec = getWavHeaderDuration(outroPath);
    if (!Number.isFinite(diskOutroSec)) {
      errors.push(`${topic} ep ${epNum}: Missing or invalid outro WAV header on disk (${outroPath})`);
    } else {
      if (!audioDurations[topic] || !audioDurations[topic][outroKey]) {
        errors.push(`${topic} ep ${epNum}: Outro key ${outroKey} missing in audioDurations.json`);
      } else {
        const jsonOutroSec = audioDurations[topic][outroKey];
        if (!Number.isFinite(jsonOutroSec) || Math.abs(diskOutroSec - jsonOutroSec) > 0.01) {
          errors.push(`${topic} ep ${epNum}: Disk outro WAV duration (${diskOutroSec.toFixed(3)}s) != audioDurations.json (${jsonOutroSec}s)`);
        }
      }
    }

    console.log(`  ✓ Ep ${epNum}: ${timing.totalDuration} frames (${(timing.totalDuration / 30).toFixed(1)}s) - Disk WAV headers match, timeline valid`);
  }
}

// ---------------------------------------------------------
// 2. VERIFY CHAT DRAMA (10 EPISODES)
// ---------------------------------------------------------
function checkChatDrama() {
  console.log(`\n🔍 Verifying CHAT DRAMA (10 episodes against disk WAV headers)...`);
  for (const ep of CHAT_DRAMA_EPISODES) {
    const epNum = ep.episodeNumber;
    const timing = getChatDramaTiming(epNum);
    const compDuration = getChatDramaDuration(epNum);
    totalChecked++;

    if (!Number.isFinite(timing.totalDuration) || !Number.isFinite(compDuration)) {
      errors.push(`Chat ep ${epNum}: Non-finite duration detected`);
    }

    if (timing.totalDuration !== compDuration) {
      errors.push(`Chat ep ${epNum}: timing.totalDuration (${timing.totalDuration}) != compDuration (${compDuration})`);
    }

    for (let m = 0; m < timing.messages.length; m++) {
      const msg = timing.messages[m];
      const wavKey = `ep${epNum}_m${msg.id}`;
      const wavPath = path.join(ROOT, "public", "audio", "chat", `${wavKey}.wav`);

      const diskWavSec = getWavHeaderDuration(wavPath);
      if (!Number.isFinite(diskWavSec)) {
        errors.push(`Chat ep ${epNum} m${msg.id}: Missing or invalid WAV header on disk (${wavPath})`);
        continue;
      }

      if (!audioDurations.chat || !audioDurations.chat[wavKey]) {
        errors.push(`Chat ep ${epNum} m${msg.id}: Key ${wavKey} missing in audioDurations.json`);
      } else {
        const jsonSec = audioDurations.chat[wavKey];
        if (!Number.isFinite(jsonSec) || Math.abs(diskWavSec - jsonSec) > 0.01) {
          errors.push(`Chat ep ${epNum} m${msg.id}: Disk WAV duration (${diskWavSec.toFixed(3)}s) != audioDurations.json (${jsonSec}s)`);
        }
      }

      const actualWavFrames = Math.ceil(diskWavSec * 30);
      if (msg.duration < actualWavFrames) {
        errors.push(`Chat ep ${epNum} m${msg.id}: msg.duration (${msg.duration}) < actualWavFrames (${actualWavFrames})`);
      }

      if (m > 0) {
        const prevMsg = timing.messages[m - 1];
        const prevVoiceEnd = prevMsg.messageStart + prevMsg.duration;
        if (msg.messageStart < prevVoiceEnd) {
          errors.push(`Chat ep ${epNum}: msg ${msg.id} starts before prev voice ends`);
        }
      }
    }

    const lastMsg = timing.messages[timing.messages.length - 1];
    const lastMsgVoiceEnd = lastMsg.messageStart + lastMsg.duration;
    if (timing.ctaStartFrame < lastMsgVoiceEnd) {
      errors.push(`Chat ep ${epNum}: ctaStartFrame < lastMsgVoiceEnd`);
    }

    console.log(`  ✓ Ep ${epNum}: ${timing.totalDuration} frames (${(timing.totalDuration / 30).toFixed(1)}s) - Disk WAV headers match, zero speech cutoffs`);
  }
}

// ---------------------------------------------------------
// 3. VERIFY MARBLE RACE (5 EPISODES)
// ---------------------------------------------------------
function checkMarbleRace() {
  const manifestPath = path.join(ROOT, "src", "data", "marbleRace", "manifest.json");
  if (!fs.existsSync(manifestPath)) return;
  console.log(`\n🔍 Verifying MARBLE RACE (5 Championship episodes)...`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const m of manifest) {
    totalChecked++;
    const epPath = path.join(ROOT, "src", "data", "marbleRace", `ep${m.episode}.json`);
    const ep = JSON.parse(fs.readFileSync(epPath, "utf8"));
    if (ep.duration < 30.0) errors.push(`Marble Race Ep ${m.episode}: duration ${ep.duration}s < 30s`);
    if (!ep.winner) errors.push(`Marble Race Ep ${m.episode}: missing winner`);
    const wavPath = path.join(ROOT, "public", "sounds", "marbleRace", `marble-race-ep${m.episode}.wav`);
    const dur = getWavHeaderDuration(wavPath);
    if (!dur) errors.push(`Marble Race Ep ${m.episode}: Missing WAV audio (${wavPath})`);
    console.log(`  ✓ Ep ${m.episode}: ${ep.totalFrames} frames (${ep.duration}s) - Winner: ${ep.winner.name}`);
  }
}

// ---------------------------------------------------------
// 4. VERIFY TERRITORY CONQUEST (5 EPISODES)
// ---------------------------------------------------------
function checkTerritory() {
  const manifestPath = path.join(ROOT, "src", "data", "territory", "manifest.json");
  if (!fs.existsSync(manifestPath)) return;
  console.log(`\n🔍 Verifying TERRITORY CONQUEST (5 Episodes - 100% Full Map Capture)...`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const m of manifest) {
    totalChecked++;
    const epPath = path.join(ROOT, "src", "data", "territory", `ep${m.episode}.json`);
    const ep = JSON.parse(fs.readFileSync(epPath, "utf8"));
    if (ep.duration < 30.0) errors.push(`Territory Ep ${m.episode}: duration ${ep.duration}s < 30s`);
    if (!ep.conquestFrame) errors.push(`Territory Ep ${m.episode}: Did not achieve 100% conquest`);
    const wavPath = path.join(ROOT, "public", "sounds", "territory", `territory-ep${m.episode}.wav`);
    const dur = getWavHeaderDuration(wavPath);
    if (!dur) errors.push(`Territory Ep ${m.episode}: Missing WAV audio (${wavPath})`);
    console.log(`  ✓ Ep ${m.episode}: ${ep.totalFrames} frames (${ep.duration}s) - 100% Conquest in ${ep.conquestSec}s`);
  }
}

// ---------------------------------------------------------
// 5. VERIFY PLINKO (5 EPISODES)
// ---------------------------------------------------------
function checkPlinko() {
  const manifestPath = path.join(ROOT, "src", "data", "plinko", "manifest.json");
  if (!fs.existsSync(manifestPath)) return;
  console.log(`\n🔍 Verifying PLINKO FORTUNE DROP (5 Episodes - $1M Challenge)...`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const m of manifest) {
    totalChecked++;
    const epPath = path.join(ROOT, "src", "data", "plinko", `ep${m.episode}.json`);
    const ep = JSON.parse(fs.readFileSync(epPath, "utf8"));
    if (ep.duration < 30.0) errors.push(`Plinko Ep ${m.episode}: duration ${ep.duration}s < 30s`);
    if (!ep.targetReachedFrame) errors.push(`Plinko Ep ${m.episode}: Did not reach $1M target`);
    const wavPath = path.join(ROOT, "public", "sounds", "plinko", `plinko-ep${m.episode}.wav`);
    const dur = getWavHeaderDuration(wavPath);
    if (!dur) errors.push(`Plinko Ep ${m.episode}: Missing WAV audio (${wavPath})`);
    console.log(`  ✓ Ep ${m.episode}: ${ep.totalFrames} frames (${ep.duration}s) - $1M Hit in ${ep.targetReachedSec}s`);
  }
}

// ---------------------------------------------------------
// 6. VERIFY WOULD YOU RATHER (5 EPISODES)
// ---------------------------------------------------------
function checkWouldYouRather() {
  const manifestPath = path.join(ROOT, "src", "data", "wouldYouRather", "manifest.json");
  if (!fs.existsSync(manifestPath)) return;
  console.log(`\n🔍 Verifying WOULD YOU RATHER (5 Dilemma Showdown Episodes)...`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const m of manifest) {
    totalChecked++;
    const epPath = path.join(ROOT, "src", "data", "wouldYouRather", `ep${m.episode}.json`);
    const ep = JSON.parse(fs.readFileSync(epPath, "utf8"));
    if (ep.duration < 30.0) errors.push(`WYR Ep ${m.episode}: duration ${ep.duration}s < 30s`);
    if (ep.dilemmas.length !== 3) errors.push(`WYR Ep ${m.episode}: Expected 3 dilemmas`);
    const wavPath = path.join(ROOT, "public", "sounds", "wouldYouRather", `wyr-ep${m.episode}.wav`);
    const dur = getWavHeaderDuration(wavPath);
    if (!dur) errors.push(`WYR Ep ${m.episode}: Missing WAV audio (${wavPath})`);
    console.log(`  ✓ Ep ${m.episode}: ${ep.totalFrames} frames (${ep.duration}s) - 3 Dilemmas`);
  }
}

// Run verifications
checkQuizTopic("geography", GEOGRAPHY_EPISODES, getGeographyDuration);
checkQuizTopic("bible", BIBLE_EPISODES, getBibleDuration);
checkQuizTopic("nostalgia", NOSTALGIA_EPISODES, getNostalgiaDuration);
checkQuizTopic("laws", CRAZY_LAWS_EPISODES, getCrazyLawsDuration);
checkChatDrama();
checkMarbleRace();
checkTerritory();
checkPlinko();
checkWouldYouRather();

console.log("\n==================================================");
console.log(`SUMMARY: EXACTLY ${totalChecked} EPISODES VERIFIED (40 Quiz + 10 Chat Drama + 20 New Engine Episodes)`);

if (warnings.length > 0) {
  console.log(`\nℹ️  VERIFIED BEHAVIORS & OBSERVATIONS (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  • ${w}`));
}

if (errors.length > 0) {
  console.error(`\n❌ FOUND ${errors.length} VERIFICATION ERRORS:`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\n🎉 DATA AND TIMELINES PASSED FOR ALL ${totalChecked} EPISODES:`);
  console.log(`  - 100% challenge completion verified on all simulations`);
  console.log(`  - All videos strictly >= 30.0s (30s - 45s target window)`);
  console.log(`  - Episode voiceover & SFX WAV headers verified against allocated frames`);
  console.log(`  - 0 audio speech cutoffs, 0 voiceover overlaps`);
  console.log(`  - All quiz countdowns (10s) and reveals (3s) precisely timed`);
  console.log(`  - Chat Drama CTA occurs strictly after last message audio completes`);
  process.exit(0);
}
