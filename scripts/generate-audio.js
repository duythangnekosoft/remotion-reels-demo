const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT_DIR = path.join(__dirname, "..", "public", "audio");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper: Build standard 16-bit PCM Mono WAV buffer
function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt Subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data Subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write 16-bit PCM Samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }

  return buffer;
}

console.log("🔊 Generating procedural SFX...");

// 1. DING / CHIME (Bell reveal sound - 1.2s)
const sampleRate = 44100;
const dingDuration = 1.2;
const dingSamples = new Float32Array(Math.floor(sampleRate * dingDuration));
for (let i = 0; i < dingSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-3.5 * t);
  const f1 = 1046.5; // C6
  const f2 = 2093.0; // C7
  const f3 = 3135.9; // G7
  const val =
    0.6 * Math.sin(2 * Math.PI * f1 * t) +
    0.3 * Math.sin(2 * Math.PI * f2 * t) +
    0.1 * Math.sin(2 * Math.PI * f3 * t);
  dingSamples[i] = val * env;
}
fs.writeFileSync(path.join(OUT_DIR, "ding.wav"), createWavBuffer(dingSamples));

// 2. TICK SOUND (Short wooden clock tick - 0.04s)
const tickDuration = 0.04;
const tickSamples = new Float32Array(Math.floor(sampleRate * tickDuration));
for (let i = 0; i < tickSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-120 * t);
  const freq = 1800 - 400 * (t / tickDuration);
  const noise = (Math.random() * 2 - 1) * 0.2;
  tickSamples[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * env * 0.7;
}
fs.writeFileSync(path.join(OUT_DIR, "tick.wav"), createWavBuffer(tickSamples));

// 3. WHOOSH TRANSITION (0.35s)
const whooshDuration = 0.35;
const whooshSamples = new Float32Array(Math.floor(sampleRate * whooshDuration));
for (let i = 0; i < whooshSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.sin((Math.PI * t) / whooshDuration);
  const noise = Math.random() * 2 - 1;
  const freq = 300 + 1200 * (t / whooshDuration);
  whooshSamples[i] = (0.7 * noise + 0.3 * Math.sin(2 * Math.PI * freq * t)) * env * 0.5;
}
fs.writeFileSync(path.join(OUT_DIR, "whoosh.wav"), createWavBuffer(whooshSamples));

// 4. CELEBRATION CHORD (Victory fanfare - 1.5s)
const celDuration = 1.5;
const celSamples = new Float32Array(Math.floor(sampleRate * celDuration));
const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
const stagger = 0.1;
for (let i = 0; i < celSamples.length; i++) {
  const t = i / sampleRate;
  let val = 0;
  for (let n = 0; n < notes.length; n++) {
    const noteTime = t - n * stagger;
    if (noteTime > 0) {
      const env = Math.exp(-2.5 * noteTime);
      val += 0.25 * Math.sin(2 * Math.PI * notes[n] * noteTime) * env;
    }
  }
  celSamples[i] = val;
}
fs.writeFileSync(path.join(OUT_DIR, "celebrate.wav"), createWavBuffer(celSamples));

// 5. POP SOUND (Soft bubble pop - 0.08s)
const popDuration = 0.08;
const popSamples = new Float32Array(Math.floor(sampleRate * popDuration));
for (let i = 0; i < popSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-60 * t);
  const freq = 600 - 300 * (t / popDuration);
  popSamples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
}
fs.writeFileSync(path.join(OUT_DIR, "pop.wav"), createWavBuffer(popSamples));

// 6. RHYTHMIC ELECTRONIC PULSE BGM (Seamless 4-second loop)
const bgmDuration = 4.0;
const bgmSamples = new Float32Array(Math.floor(sampleRate * bgmDuration));
for (let i = 0; i < bgmSamples.length; i++) {
  const t = i / sampleRate;
  // 120 BPM: 1 beat every 0.5s
  const beatTime = t % 0.5;
  const kickEnv = Math.exp(-25 * beatTime);
  const kickFreq = 120 * Math.exp(-30 * beatTime) + 45;
  const kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * kickEnv * 0.5;

  // Hi-hat on 8th notes (every 0.25s)
  const hatTime = t % 0.25;
  const hatEnv = Math.exp(-80 * hatTime);
  const hat = (Math.random() * 2 - 1) * hatEnv * 0.12;

  // Subtle warm pad chord (D minor / F major)
  const pad =
    (Math.sin(2 * Math.PI * 220 * t) +
      Math.sin(2 * Math.PI * 261.63 * t) +
      Math.sin(2 * Math.PI * 329.63 * t)) *
    0.05;

  bgmSamples[i] = kick + hat + pad;
}
fs.writeFileSync(path.join(OUT_DIR, "bgm_loop.wav"), createWavBuffer(bgmSamples));

// 7. iOS Message SFX
const sendDuration = 0.15;
const sendSamples = new Float32Array(Math.floor(sampleRate * sendDuration));
for (let i = 0; i < sendSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-35 * t);
  const freq = 450 + 600 * (t / sendDuration);
  sendSamples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.7;
}
fs.writeFileSync(path.join(OUT_DIR, "ios_send.wav"), createWavBuffer(sendSamples));

const recvDuration = 0.35;
const recvSamples = new Float32Array(Math.floor(sampleRate * recvDuration));
for (let i = 0; i < recvSamples.length; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-12 * t);
  const f1 = 1318.5; // E6
  const f2 = 1661.2; // G#6
  recvSamples[i] = (0.5 * Math.sin(2 * Math.PI * f1 * t) + 0.5 * Math.sin(2 * Math.PI * f2 * t)) * env * 0.7;
}
fs.writeFileSync(path.join(OUT_DIR, "ios_receive.wav"), createWavBuffer(recvSamples));

console.log("✅ Procedural SFX generated in public/audio!");

// 8. Generate US English Voiceovers using Windows System.Speech SAPI
console.log("🎙️ Synthesizing US English Voiceovers with Windows Speech Engine...");

const voiceScripts = [
  // US Geography
  { file: "q1.wav", text: "Question one: Which U S state has the longest total coastline?", gender: "female" },
  { file: "q2.wav", text: "Question two: Which U S state is geographically closest to Africa?", gender: "female" },
  { file: "q3.wav", text: "Question three: What is the only U S state with a one-syllable name?", gender: "female" },
  { file: "q4.wav", text: "Question four: Which U S state contains over eighty percent of all active U S volcanoes?", gender: "female" },
  { file: "q5.wav", text: "Question five: Which is the only U S state that produces coffee commercially?", gender: "female" },
  { file: "outro.wav", text: "Challenge completed! What was your final score out of five? Drop your score in the comments below, and follow for more daily quizzes!", gender: "female" },
  { file: "race_intro.wav", text: "Here are the most valuable companies in the world, from the year two thousand to twenty twenty-six.", gender: "female" },
  { file: "billionaires_intro.wav", text: "Here are the richest individuals in the world, from the year two thousand to twenty twenty-six.", gender: "female" },

  // Bible Quiz
  { file: "bq1.wav", text: "Question one: Who is the oldest person recorded in the Bible, living 969 years?", gender: "female" },
  { file: "bq2.wav", text: "Question two: What was the first bird Noah released from the Ark?", gender: "female" },
  { file: "bq3.wav", text: "Question three: Which is the shortest verse in the entire English Bible?", gender: "female" },
  { file: "bq4.wav", text: "Question four: How many stones did David pick up before fighting Goliath?", gender: "female" },
  { file: "bq5.wav", text: "Question five, final question: Who was swallowed by a great fish after fleeing from God?", gender: "female" },
  { file: "bq_outro.wav", text: "Challenge completed! How many did you get right out of five? Drop your score in the comments below, and share with your family!", gender: "female" },

  // 80s/90s Nostalgia Quiz
  { file: "nq1.wav", text: "Question one: What was the standard storage capacity of a 3.5 inch floppy disk?", gender: "female" },
  { file: "nq2.wav", text: "Question two: What was Blockbuster's famous four-word slogan for video rentals?", gender: "female" },
  { file: "nq3.wav", text: "Question three: Which company released the revolutionary portable cassette player called the Walkman in 1979?", gender: "female" },
  { file: "nq4.wav", text: "Question four: What iconic three-word greeting did A O L dial-up announce when you had new emails?", gender: "female" },
  { file: "nq5.wav", text: "Question five: What tiny handheld digital pet from Japan became a global craze in 1996?", gender: "female" },
  { file: "nq_outro.wav", text: "Only true eighties and nineties kids could pass! What was your score out of five? Drop it in the comments below!", gender: "female" },

  // Crazy US Laws Quiz
  { file: "cl1.wav", text: "Question one: In which state is it illegal to wake a sleeping bear just to take a photograph?", gender: "female" },
  { file: "cl2.wav", text: "Question two: In which state is it strictly illegal to whistle underwater?", gender: "female" },
  { file: "cl3.wav", text: "Question three: In which state is it illegal to serve margarine in restaurants unless clearly requested?", gender: "female" },
  { file: "cl4.wav", text: "Question four: Which state made it illegal to carry an ice cream cone in your back pocket on Sundays?", gender: "female" },
  { file: "cl5.wav", text: "Question five: In Denver, Colorado, it is technically illegal to drive which color car on Sundays?", gender: "female" },
  { file: "cl_outro.wav", text: "Did you know any of these crazy laws? What was your score out of five? Drop your state in the comments below!", gender: "female" },

  // iMessage Drama Dialogue (Mother-in-law vs Bride/Groom)
  { file: "chat1.wav", text: "Hey! You need to drop off the spare keys to your new house tonight.", gender: "female" },
  { file: "chat2.wav", text: "Excuse me? Why would you need keys to our private home?", gender: "male" },
  { file: "chat3.wav", text: "Because my son lives there, and as his mother, I have every right to inspect the property whenever I please.", gender: "female" },
  { file: "chat4.wav", text: "First of all, your son doesn't own this house. My parents bought it for me, and only my name is on the deed.", gender: "male" },
  { file: "chat5.wav", text: "That doesn't matter! Once you marry him next month, it's half his, and you will learn to respect my authority in this family!", gender: "female" },
  { file: "chat6.wav", text: "Well, thanks to this text, the wedding is officially cancelled. Tell your son to pack his bags by tomorrow morning.", gender: "male" },
  { file: "chat7.wav", text: "Wait, what?! You cannot be serious! Answer the phone right now!!", gender: "female" },
];

for (const item of voiceScripts) {
  const targetPath = path.join(OUT_DIR, item.file).replace(/\\/g, "/");
  console.log(`Generating ${item.file}...`);
  const voiceName = item.gender === "male" ? "Microsoft David Desktop" : "Microsoft Zira Desktop";
  const escapedText = item.text.replace(/'/g, "''");
  const psCommand = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $s.SelectVoice('${voiceName}') } catch {}; $s.Rate = 1; $s.SetOutputToWaveFile('${targetPath}'); $s.Speak('${escapedText}'); $s.Dispose();`;
  try {
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`Error generating ${item.file}:`, err.message);
  }
}

console.log("🎉 All voiceovers and SFX successfully generated!");

