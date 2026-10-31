/**
 * Procedural Audio Synthesizer for "THE LAST MARBLE - Resonance ASMR"
 * Generates pristine, crystal-clear 16-bit 44.1kHz PCM WAV files:
 * - Glass marble micro-taps and impacts
 * - Matte ivory / resin percussive wooden clacks
 * - Tuned metallic brass chime pins (Pentatonic celestial scale)
 * - Elastic damper bumper rebounds
 * - Precision mechanical gear and shutter clicks
 * - Majestic Golden Bell finale strike with 3.5s acoustic shimmer decay
 */

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, "..", "public", "sounds", "last_marble");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function writeWavFile(filename, samples, sampleRate = SAMPLE_RATE) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
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

  // Write PCM Samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? Math.floor(s * 32768) : Math.floor(s * 32767);
    buffer.writeInt16LE(val, offset);
    offset += 2;
  }

  const filePath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`  ✓ Generated ${filename} (${(samples.length / sampleRate).toFixed(2)}s, ${buffer.length} bytes)`);
}

// 1. Glass Marble Tap (Pure high-frequency transient with inharmonic glass overtone modes)
function generateGlassTap(freq = 2800, duration = 0.1, intensity = 0.8) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 45); // rapid decay
    // Modes of circular plate / sphere
    const s1 = Math.sin(2 * Math.PI * freq * t) * 0.6;
    const s2 = Math.sin(2 * Math.PI * (freq * 2.32) * t) * 0.25;
    const s3 = Math.sin(2 * Math.PI * (freq * 4.15) * t) * 0.15;
    // Tiny click attack transient
    const click = i < 30 ? (Math.random() * 2 - 1) * Math.exp(-i / 8) * 0.4 : 0;
    samples[i] = (s1 + s2 + s3 + click) * decay * intensity;
  }
  return samples;
}

// 2. Matte Ivory Clack (Warm, organic wood/resin percussive block)
function generateIvoryClack(baseFreq = 680, duration = 0.12, intensity = 0.85) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 36);
    const body = Math.sin(2 * Math.PI * baseFreq * t) * 0.55;
    const harmonic2 = Math.sin(2 * Math.PI * (baseFreq * 1.85) * t) * 0.25;
    const transient = Math.sin(2 * Math.PI * (baseFreq * 3.4) * t) * Math.exp(-t * 120) * 0.2;
    samples[i] = (body + harmonic2 + transient) * decay * intensity;
  }
  return samples;
}

// 3. Tuned Metallic Brass Chime Pin (Celestial singing tone with warm decay)
function generateBrassChime(freq, duration = 0.85, intensity = 0.8) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Slow, soothing exponential decay
    const decay = Math.exp(-t * 4.8);
    // Subtle beat frequency for gentle shimmer (chorus)
    const shimmer = 1 + 0.08 * Math.sin(2 * Math.PI * 3.5 * t);
    const fundamental = Math.sin(2 * Math.PI * freq * t) * 0.65;
    const overtone1 = Math.sin(2 * Math.PI * (freq * 2.76) * t) * Math.exp(-t * 9) * 0.22;
    const overtone2 = Math.sin(2 * Math.PI * (freq * 5.41) * t) * Math.exp(-t * 16) * 0.13;
    samples[i] = (fundamental + overtone1 + overtone2) * shimmer * decay * intensity;
  }
  return samples;
}

// 4. Elastic Damper Bumper (Warm springy bounce with pitch bend)
function generateElasticBumper(duration = 0.18, intensity = 0.8) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 22);
    // Downward pitch bend from 260Hz down to 130Hz
    const freq = 130 + 130 * Math.exp(-t * 35);
    const tone = Math.sin(2 * Math.PI * freq * t) * 0.7;
    const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.3;
    samples[i] = (tone + sub) * decay * intensity;
  }
  return samples;
}

// 5. Gear Step / Shutter Gate Click (Crisp horological escapement tick)
function generateGearTick(duration = 0.08, intensity = 0.6) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 80);
    const click = Math.sin(2 * Math.PI * 3200 * t) * 0.6 + (Math.random() * 2 - 1) * 0.4;
    samples[i] = click * decay * intensity;
  }
  return samples;
}

// 6. Sliding Shutter Gate Movement (Soft mechanical whisper)
function generateGateSlide(duration = 0.3, intensity = 0.45) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin((Math.PI * i) / numSamples); // smooth bell envelope
    const noise = (Math.random() * 2 - 1) * 0.3;
    const glide = Math.sin(2 * Math.PI * (400 + 150 * Math.sin(t * 15)) * t) * 0.3;
    samples[i] = (noise + glide) * env * intensity;
  }
  return samples;
}

// 7. THE GOLDEN BELL STRIKE (Grand Finale Climax Bell: 3.5s rich harmonic sustain)
function generateGoldenBell(fundamentalFreq = 528, duration = 3.6, intensity = 0.95) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Layered decay rates: high frequencies decay faster, fundamental rings long
    const decayFund = Math.exp(-t * 0.9); // ~3.5s ring
    const decayMid = Math.exp(-t * 1.8);
    const decayHigh = Math.exp(-t * 3.5);
    const decayClang = Math.exp(-t * 18); // immediate metallic clang

    // Acoustic vibrato / singing bowl shimmer (2.2Hz gentle warble)
    const vibrato = 1 + 0.06 * Math.sin(2 * Math.PI * 2.2 * t);

    // Multi-harmonic bell structure
    const f0 = Math.sin(2 * Math.PI * fundamentalFreq * t) * decayFund * 0.50; // Solfeggio 528Hz love/clarity tone
    const f1 = Math.sin(2 * Math.PI * (fundamentalFreq * 1.5) * t) * decayFund * 0.25; // Perfect Fifth (792Hz)
    const f2 = Math.sin(2 * Math.PI * (fundamentalFreq * 2.0) * t) * decayMid * 0.18; // Octave
    const f3 = Math.sin(2 * Math.PI * (fundamentalFreq * 2.76) * t) * decayMid * 0.12; // Minor Seventh overtone
    const f4 = Math.sin(2 * Math.PI * (fundamentalFreq * 4.12) * t) * decayHigh * 0.08; // Upper bell shimmer
    const clang = (Math.sin(2 * Math.PI * 2150 * t) + Math.sin(2 * Math.PI * 3420 * t)) * decayClang * 0.15; // Initial strike

    samples[i] = (f0 + f1 + f2 + f3 + f4 + clang) * vibrato * intensity;
  }
  return samples;
}

console.log("🔔 Synthesizing Brand New ASMR Audio Suite for 'THE LAST MARBLE'...");

// Glass marble collisions
writeWavFile("glass_light.wav", generateGlassTap(3100, 0.09, 0.65));
writeWavFile("glass_med.wav", generateGlassTap(2600, 0.12, 0.85));
writeWavFile("glass_hard.wav", generateGlassTap(2200, 0.15, 0.95));

// Matte Ivory resin ramps
writeWavFile("ivory_clack_1.wav", generateIvoryClack(620, 0.11, 0.8));
writeWavFile("ivory_clack_2.wav", generateIvoryClack(730, 0.11, 0.8));
writeWavFile("ivory_clack_3.wav", generateIvoryClack(850, 0.11, 0.8));
writeWavFile("ivory_clack_4.wav", generateIvoryClack(980, 0.11, 0.8));

// Tuned Brass Chime Pins (Pentatonic scale: C5, D5, E5, G5, A5, C6, D6, E6)
writeWavFile("brass_pin_c5.wav", generateBrassChime(523.25, 0.75, 0.8));
writeWavFile("brass_pin_d5.wav", generateBrassChime(587.33, 0.75, 0.8));
writeWavFile("brass_pin_e5.wav", generateBrassChime(659.25, 0.75, 0.8));
writeWavFile("brass_pin_g5.wav", generateBrassChime(783.99, 0.75, 0.8));
writeWavFile("brass_pin_a5.wav", generateBrassChime(880.00, 0.75, 0.8));
writeWavFile("brass_pin_c6.wav", generateBrassChime(1046.50, 0.75, 0.8));
writeWavFile("brass_pin_d6.wav", generateBrassChime(1174.66, 0.75, 0.8));
writeWavFile("brass_pin_e6.wav", generateBrassChime(1318.51, 0.75, 0.8));

// Elastic Bumper & Mechanisms
writeWavFile("elastic_bumper.wav", generateElasticBumper(0.18, 0.85));
writeWavFile("gear_step.wav", generateGearTick(0.08, 0.55));
writeWavFile("gate_slide.wav", generateGateSlide(0.28, 0.45));

// The Final Golden Bell Climax
writeWavFile("golden_bell_strike.wav", generateGoldenBell(528, 3.8, 0.95));

console.log("✨ All 17 ASMR Audio assets generated successfully!");
