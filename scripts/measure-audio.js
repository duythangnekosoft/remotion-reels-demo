const fs = require("fs");
const path = require("path");
const { readWavDuration: getWavDuration } = require("./wav-duration");

const topics = ["geography", "bible", "nostalgia", "laws", "chat"];
const allDurations = {};

for (const t of topics) {
  allDurations[t] = {};
  const dir = path.join(__dirname, "..", "public", "audio", t);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".wav"));
  for (const f of files) {
    const key = path.parse(f).name;
    const dur = getWavDuration(path.join(dir, f));
    allDurations[t][key] = Number(dur.toFixed(5));
  }
}

// Standalone files
allDurations["standalone"] = {};
const rootAudio = path.join(__dirname, "..", "public", "audio");
const standaloneFiles = fs.readdirSync(rootAudio).filter(f => f.endsWith(".wav"));
for (const f of standaloneFiles) {
  const key = path.parse(f).name;
  const dur = getWavDuration(path.join(rootAudio, f));
  allDurations["standalone"][key] = Number(dur.toFixed(5));
}

console.log("Measured audio files:");
for (const t of Object.keys(allDurations)) {
  console.log(`- ${t}: ${Object.keys(allDurations[t]).length} files`);
}

fs.writeFileSync(
  path.join(__dirname, "..", "src", "data", "audioDurations.json"),
  JSON.stringify(allDurations, null, 2)
);
console.log("Successfully wrote src/data/audioDurations.json");
