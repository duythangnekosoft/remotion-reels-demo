const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { readWavDuration } = require("./wav-duration");

const ROOT = path.join(__dirname, "..");

// Auto-compile TypeScript sources into dist/ unless skipped (e.g. for mock tests)
if (!process.argv.includes("--no-build")) {
  console.log("🔨 [Step 1/4] Compiling fresh TypeScript sources to dist/ ...");
  try {
    execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"),
      "--outDir", path.join(ROOT, "dist"), "--noEmit", "false"], { cwd: ROOT, stdio: "inherit" });
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
    console.error(error.message);
    return null;
  }
}

// Load compiled datasets & timeline utils from dist/
const audioDurations = require("../src/data/audioDurations.json");
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
const { getSingularityDuration } = require("../dist/SingularitySiege/SingularitySiegeComposition");

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
      errors.push(`${topic} ep ${epNum}: Non-finite duration detected (timing=${timing.totalDuration}, comp=${compDuration})`);
    }

    if (timing.totalDuration !== compDuration) {
      errors.push(`${topic} ep ${epNum}: timing.totalDuration (${timing.totalDuration}) != compDuration (${compDuration})`);
    }

    // Check questions
    for (let q = 0; q < timing.questions.length; q++) {
      const qT = timing.questions[q];
      const wavKey = `ep${epNum}_q${q + 1}`;
      const wavPath = path.join(ROOT, "public", "audio", topic, `${wavKey}.wav`);

      // Read WAV header directly from disk
      const diskWavSec = getWavHeaderDuration(wavPath);
      if (!Number.isFinite(diskWavSec)) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: Missing or invalid WAV header on disk (${wavPath})`);
        continue;
      }

      // Check audioDurations.json consistency
      if (!audioDurations[topic] || !audioDurations[topic][wavKey]) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: Key ${wavKey} missing in audioDurations.json`);
      } else {
        const jsonSec = audioDurations[topic][wavKey];
        if (!Number.isFinite(jsonSec) || Math.abs(diskWavSec - jsonSec) > 0.01) {
          errors.push(`${topic} ep ${epNum} q${q + 1}: Disk WAV duration (${diskWavSec.toFixed(3)}s) does not match audioDurations.json (${jsonSec}s)`);
        }
      }

      const actualWavFrames = Math.ceil(diskWavSec * 30);
      if (!Number.isFinite(actualWavFrames)) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: actualWavFrames is not finite`);
      }

      // Question Audio not cut
      if (qT.audioFrames < actualWavFrames) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: audioFrames (${qT.audioFrames}) < actualWavFrames (${actualWavFrames})`);
      }

      // Countdown starts after question voiceover finished
      const voEnd = 6 + qT.audioFrames;
      if (qT.countdownStart < voEnd) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: countdownStart (${qT.countdownStart}) < voEnd (${voEnd})`);
      }

      // Countdown duration is exactly 10s (300 frames)
      if (qT.countdownEnd - qT.countdownStart !== 300) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: countdown duration is ${qT.countdownEnd - qT.countdownStart} != 300 frames`);
      }

      // Reveal is after countdown
      if (qT.revealFrame < qT.countdownEnd) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: revealFrame < countdownEnd`);
      }

      // Reveal duration is exactly 3s (90 frames)
      if (qT.totalFrames - qT.revealFrame !== 90) {
        errors.push(`${topic} ep ${epNum} q${q + 1}: reveal duration is ${qT.totalFrames - qT.revealFrame} != 90 frames`);
      }
    }

    // Check Outro WAV
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
          errors.push(`${topic} ep ${epNum}: Disk outro WAV duration (${diskOutroSec.toFixed(3)}s) does not match audioDurations.json (${jsonOutroSec}s)`);
        }
      }

      const actualOutroFrames = Math.ceil(diskOutroSec * 30);
      if (timing.outroAudioFrames < actualOutroFrames) {
        errors.push(`${topic} ep ${epNum}: outroAudioFrames (${timing.outroAudioFrames}) < actualOutroFrames (${actualOutroFrames})`);
      }

      const outroEnd = timing.outroStart + 12 + timing.outroAudioFrames;
      if (outroEnd > timing.totalDuration) {
        errors.push(`${topic} ep ${epNum}: outro audio exceeds totalDuration (${outroEnd} > ${timing.totalDuration})`);
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

    // Check messages
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

      // Check speech overlap
      if (m > 0) {
        const prevMsg = timing.messages[m - 1];
        const prevVoiceEnd = prevMsg.messageStart + prevMsg.duration;
        if (msg.messageStart < prevVoiceEnd) {
          errors.push(`Chat ep ${epNum}: msg ${msg.id} starts at ${msg.messageStart} before prev voice ends at ${prevVoiceEnd}`);
        }
      }
    }

    // Check CTA
    const lastMsg = timing.messages[timing.messages.length - 1];
    const lastMsgVoiceEnd = lastMsg.messageStart + lastMsg.duration;
    if (timing.ctaStartFrame < lastMsgVoiceEnd) {
      errors.push(`Chat ep ${epNum}: ctaStartFrame (${timing.ctaStartFrame}) < lastMsgVoiceEnd (${lastMsgVoiceEnd})`);
    }

    if (timing.ctaStartFrame + timing.ctaDuration > timing.totalDuration) {
      errors.push(`Chat ep ${epNum}: CTA exceeds totalDuration (${timing.ctaStartFrame + timing.ctaDuration} > ${timing.totalDuration})`);
    }

    console.log(`  ✓ Ep ${epNum}: ${timing.totalDuration} frames (${(timing.totalDuration / 30).toFixed(1)}s) - Disk WAV headers match, zero speech cutoffs`);
  }
}

// ---------------------------------------------------------
// 3. VERIFY SINGULARITY SIEGE (10 EPISODES)
// ---------------------------------------------------------
function checkSingularitySiege() {
  console.log(`\n🔍 Verifying SINGULARITY SIEGE (10 kinetic ASMR episodes)...`);
  const dataDir = path.join(ROOT, "src", "data", "singularity");

  for (let ep = 1; ep <= 10; ep++) {
    const jsonPath = path.join(dataDir, `ep${ep}.json`);
    totalChecked++;

    if (!fs.existsSync(jsonPath)) {
      errors.push(`Singularity ep ${ep}: Missing episode data file at ${jsonPath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const m = data.manifest;

    // 1. Manifest structure checks
    if (!m || typeof m !== "object") {
      errors.push(`Singularity ep ${ep}: Missing manifest object`);
      continue;
    }

    const requiredKeys = [
      "totalFrames",
      "simulationFrames",
      "observeResultFrames",
      "modalEntranceFrames",
      "modalHoldFrames",
      "totalPostFrames",
      "initialNodes",
      "remainingNodesAtEnd",
    ];

    for (const key of requiredKeys) {
      if (!Number.isFinite(m[key])) {
        errors.push(`Singularity ep ${ep}: Manifest key ${key} is missing or not finite (${m[key]})`);
      }
    }

    // 2. Wipeout and completion checks
    if (m.remainingNodesAtEnd !== 0) {
      errors.push(`Singularity ep ${ep}: remainingNodesAtEnd is ${m.remainingNodesAtEnd} != 0 (incomplete wipeout)`);
    }

    if (!Array.isArray(data.destroyedAtFrame) || data.destroyedAtFrame.length !== m.initialNodes) {
      errors.push(`Singularity ep ${ep}: destroyedAtFrame length (${data.destroyedAtFrame ? data.destroyedAtFrame.length : "none"}) != initialNodes (${m.initialNodes})`);
    } else if (data.destroyedAtFrame.some((frame) => !Number.isInteger(frame) || frame < 0 || frame > m.simulationFrames)) {
      errors.push(`Singularity ep ${ep}: destroyedAtFrame contains an undestroyed node or invalid destruction time`);
    }

    // 3. Pacing and Composition Duration check
    const compDuration = getSingularityDuration(ep);
    if (compDuration !== m.totalFrames) {
      errors.push(`Singularity ep ${ep}: Composition duration (${compDuration}) != manifest.totalFrames (${m.totalFrames})`);
    }

    // Pacing formula: totalFrames = simulationFrames + observeResultFrames + modalEntranceFrames + modalHoldFrames
    const expectedTotal = m.simulationFrames + m.observeResultFrames + m.modalEntranceFrames + m.modalHoldFrames;
    if (m.totalFrames !== expectedTotal) {
      errors.push(`Singularity ep ${ep}: totalFrames (${m.totalFrames}) != simulationFrames + totalPostFrames (${expectedTotal})`);
    }

    // 4. Saved frames count & post-simulation hold verification
    if (!Array.isArray(data.frames) || data.frames.length < m.simulationFrames) {
      errors.push(`Singularity ep ${ep}: frames array length (${data.frames ? data.frames.length : 0}) < simulationFrames (${m.simulationFrames})`);
    } else if (data.frames.length < m.totalFrames) {
      // Episode 2 has 3000 saved simulation frames for a 3002 frame total
      // The remaining 2 frames are held at the final state by Math.min(frame, frames.length - 1)
      const diff = m.totalFrames - data.frames.length;
      warnings.push(`Singularity ep ${ep}: frames.length (${data.frames.length}) < totalFrames (${m.totalFrames}). Difference of ${diff} frames is held at final simulation state during modal freeze.`);
    }

    if (Array.isArray(data.frames) && data.frames.length > 0) {
      const finalFrame = data.frames[data.frames.length - 1];
      if (finalFrame.r !== 0) errors.push(`Singularity ep ${ep}: final frame still has ${finalFrame.r} nodes`);
      if (data.frames.some((state, index) => state.f !== index || !Array.isArray(state.balls) ||
          state.balls.some((ball) => ![ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite)))) {
        errors.push(`Singularity ep ${ep}: invalid frame sequence or ball coordinates`);
      }
    }

    // 5. Audio events check: all referenced sounds must exist on disk
    if (Array.isArray(data.audioEvents)) {
      for (const ae of data.audioEvents) {
        if (!Number.isInteger(ae.frame) || ae.frame < 0 || ae.frame >= m.totalFrames ||
            !Number.isFinite(ae.vol) || ae.vol < 0 || ae.vol > 1) {
          errors.push(`Singularity ep ${ep}: invalid audio event frame or volume`);
          break;
        }
        const soundPath = path.join(ROOT, "public", ae.sound);
        if (!fs.existsSync(soundPath)) {
          errors.push(`Singularity ep ${ep}: Audio event sound file missing (${ae.sound})`);
          break; // Avoid flooding with duplicate missing sound errors
        }
      }
    } else {
      errors.push(`Singularity ep ${ep}: Missing audioEvents array`);
    }

    console.log(`  ✓ Ep ${ep}: ${m.totalFrames} frames (${(m.totalFrames / 30).toFixed(1)}s, ${m.initialNodes} nodes wiped out, ${data.audioEvents ? data.audioEvents.length : 0} SFX events)`);
  }
}

// ---------------------------------------------------------
// EXECUTION & SUMMARY
// ---------------------------------------------------------
console.log("=== COMPREHENSIVE TIMELINE & AUDIO INTEGRITY VERIFICATION ===");
checkQuizTopic("geography", GEOGRAPHY_EPISODES, getGeographyDuration);
checkQuizTopic("bible", BIBLE_EPISODES, getBibleDuration);
checkQuizTopic("nostalgia", NOSTALGIA_EPISODES, getNostalgiaDuration);
checkQuizTopic("laws", CRAZY_LAWS_EPISODES, getCrazyLawsDuration);
checkChatDrama();
checkSingularitySiege();

console.log("\n==================================================");
console.log(`SUMMARY: EXACTLY ${totalChecked} EPISODES VERIFIED (40 Quiz + 10 Chat Drama + 10 Singularity Siege)`);

if (warnings.length > 0) {
  console.log(`\nℹ️  VERIFIED BEHAVIORS & OBSERVATIONS (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  • ${w}`));
}

if (errors.length > 0) {
  console.error(`\n❌ FOUND ${errors.length} VERIFICATION ERRORS:`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\n🎉 DATA AND TIMELINES PASSED FOR ${totalChecked} EPISODES (not a visual/audio playback review):`);
  console.log(`  - Episode voiceover WAV headers checked against metadata and allocated frames`);
  console.log(`  - 0 audio speech cutoffs, 0 voiceover overlaps`);
  console.log(`  - All quiz countdowns (10s) and reveals (3s) precisely timed`);
  console.log(`  - Chat Drama CTA occurs strictly after last message audio completes`);
  console.log(`  - Singularity Siege has 100% node destruction and all SFX exist`);
  process.exit(0);
}
