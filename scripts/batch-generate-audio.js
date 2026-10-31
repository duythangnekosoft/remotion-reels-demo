const fs = require("fs");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio");

// Ensure directories exist
["bible", "nostalgia", "laws", "geography", "chat"].forEach((sub) => {
  const dir = path.join(AUDIO_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Refresh datasets before generating speech so edits in src are included.
execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"),
  "--outDir", path.join(ROOT, "dist"), "--noEmit", "false"], { cwd: ROOT, stdio: "inherit" });

// Load all episode datasets from freshly compiled dist/
const { BIBLE_EPISODES } = require("../dist/data/bibleEpisodes");
const { NOSTALGIA_EPISODES } = require("../dist/data/nostalgiaEpisodes");
const { CRAZY_LAWS_EPISODES } = require("../dist/data/crazyLawsEpisodes");
const { GEOGRAPHY_EPISODES } = require("../dist/data/geographyEpisodes");
const { CHAT_DRAMA_EPISODES } = require("../dist/data/chatDramaEpisodes");

// Helper to sanitize text for TTS (remove emojis, convert currency to words, clean formatting)
function cleanTtsText(text) {
  return text
    // Replace currency
    .replace(/\$([0-9,]+)/g, "$1 dollars")
    // Replace emojis
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
    // Replace quotes and dashes
    .replace(/[""]/g, "")
    .replace(/\/hr/g, " per hour")
    .replace(/\s+/g, " ")
    .trim();
}

const numbers = ["one", "two", "three", "four", "five"];
const speechItems = [];

// 1. BIBLE EPISODES
BIBLE_EPISODES.forEach((ep) => {
  ep.questions.forEach((q, idx) => {
    speechItems.push({
      file: path.join(AUDIO_DIR, "bible", `ep${ep.episodeNumber}_q${idx + 1}.wav`).replace(/\\/g, "/"),
      text: cleanTtsText(`Question ${numbers[idx]}: ${q.question}`),
      voice: "zira",
    });
  });
  speechItems.push({
    file: path.join(AUDIO_DIR, "bible", `ep${ep.episodeNumber}_outro.wav`).replace(/\\/g, "/"),
    text: cleanTtsText(`Challenge completed! What was your final score out of five? Drop your score in the comments below, and share with your family!`),
    voice: "zira",
  });
});

// 2. NOSTALGIA EPISODES
NOSTALGIA_EPISODES.forEach((ep) => {
  ep.questions.forEach((q, idx) => {
    speechItems.push({
      file: path.join(AUDIO_DIR, "nostalgia", `ep${ep.episodeNumber}_q${idx + 1}.wav`).replace(/\\/g, "/"),
      text: cleanTtsText(`Question ${numbers[idx]}: ${q.question}`),
      voice: "zira",
    });
  });
  speechItems.push({
    file: path.join(AUDIO_DIR, "nostalgia", `ep${ep.episodeNumber}_outro.wav`).replace(/\\/g, "/"),
    text: cleanTtsText(`Only true eighties and nineties kids could pass! What was your score out of five? Drop it in the comments below!`),
    voice: "zira",
  });
});

// 3. CRAZY LAWS EPISODES
CRAZY_LAWS_EPISODES.forEach((ep) => {
  ep.questions.forEach((q, idx) => {
    speechItems.push({
      file: path.join(AUDIO_DIR, "laws", `ep${ep.episodeNumber}_q${idx + 1}.wav`).replace(/\\/g, "/"),
      text: cleanTtsText(`Question ${numbers[idx]}: ${q.question}`),
      voice: "zira",
    });
  });
  speechItems.push({
    file: path.join(AUDIO_DIR, "laws", `ep${ep.episodeNumber}_outro.wav`).replace(/\\/g, "/"),
    text: cleanTtsText(`Did you know any of these crazy state laws? What was your score out of five? Drop your home state in the comments below!`),
    voice: "zira",
  });
});

// 4. GEOGRAPHY EPISODES
GEOGRAPHY_EPISODES.forEach((ep) => {
  ep.questions.forEach((q, idx) => {
    speechItems.push({
      file: path.join(AUDIO_DIR, "geography", `ep${ep.episodeNumber}_q${idx + 1}.wav`).replace(/\\/g, "/"),
      text: cleanTtsText(`Question ${numbers[idx]}: ${q.question}`),
      voice: "zira",
    });
  });
  speechItems.push({
    file: path.join(AUDIO_DIR, "geography", `ep${ep.episodeNumber}_outro.wav`).replace(/\\/g, "/"),
    text: cleanTtsText(`Challenge completed! What was your score out of five? Drop your score in the comments below, and follow for more daily quizzes!`),
    voice: "zira",
  });
});

// 5. CHAT DRAMA EPISODES
CHAT_DRAMA_EPISODES.forEach((ep) => {
  ep.messages.forEach((msg) => {
    speechItems.push({
      file: path.join(AUDIO_DIR, "chat", `ep${ep.episodeNumber}_m${msg.id}.wav`).replace(/\\/g, "/"),
      text: cleanTtsText(msg.text),
      voice: msg.sender === "incoming" ? "zira" : "david",
    });
  });
});

console.log(`🎙️ Total Audio Voiceover Items to Synthesize: ${speechItems.length}`);

// Write JSON jobs file
const jsonPath = path.join(ROOT, "scripts", "tts_jobs.json");
fs.writeFileSync(jsonPath, JSON.stringify(speechItems, null, 2), "utf8");
console.log(`📦 Saved JSON task definition: ${jsonPath}`);

// Write PowerShell runner script
const psRunner = `
Add-Type -AssemblyName System.Speech

$jobsPath = Join-Path $PSScriptRoot "tts_jobs.json"
$jobs = Get-Content -Raw $jobsPath -Encoding UTF8 | ConvertFrom-Json

$zira = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $zira.SelectVoice('Microsoft Zira Desktop') } catch {}
$zira.Rate = 1

$david = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $david.SelectVoice('Microsoft David Desktop') } catch {}
$david.Rate = 1

Write-Host "🎙️ Starting high-speed batch TTS synthesis of $($jobs.Count) voiceovers..."
$count = 0
$total = $jobs.Count

foreach ($item in $jobs) {
    $speaker = if ($item.voice -eq "david") { $david } else { $zira }
    $speaker.SetOutputToWaveFile($item.file)
    $speaker.Speak($item.text)
    $count++
    if ($count % 50 -eq 0 -or $count -eq $total) {
        Write-Host "[$count / $total] Synthesized $(Split-Path $item.file -Leaf)"
    }
}

$zira.Dispose()
$david.Dispose()
Write-Host "🎉 Successfully synthesized all $count voiceovers!"
`;

const psPath = path.join(ROOT, "scripts", "tts_runner.ps1");
fs.writeFileSync(psPath, psRunner, "utf8");

console.log("⚡ Executing batch synthesis in PowerShell...");
const start = Date.now();
execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psPath}"`, {
  stdio: "inherit",
});
console.log(`⏱️ Completed in ${((Date.now() - start) / 1000).toFixed(1)}s!`);

console.log("📊 Automatically measuring WAV durations and updating audioDurations.json...");
execFileSync(process.execPath, [path.join(ROOT, "scripts", "measure-audio.js")], {
  stdio: "inherit",
});
console.log("✅ audioDurations.json is now up to date with fresh audio files!");
