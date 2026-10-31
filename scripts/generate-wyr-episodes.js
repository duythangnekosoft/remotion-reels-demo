const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data", "wouldYouRather");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "wouldYouRather");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(SOUND_DIR)) fs.mkdirSync(SOUND_DIR, { recursive: true });

const EPISODES_DATA = [
  {
    episode: 1,
    title: "Superpowers Dilemma",
    dilemmas: [
      {
        question: "WHICH POWER DO YOU CHOOSE?",
        optionA: { text: "FLY ANYWHERE AT SPEED OF SOUND", emoji: "🦅", pct: 64 },
        optionB: { text: "TELEPORT INSTANTLY TO ANY LOCATION", emoji: "⚡", pct: 36 },
      },
      {
        question: "THE LANGUAGE SHOWDOWN",
        optionA: { text: "SPEAK EVERY HUMAN LANGUAGE FLUENTLY", emoji: "🗣️", pct: 72 },
        optionB: { text: "COMMUNICATE WITH ALL ANIMALS", emoji: "🐾", pct: 28 },
      },
      {
        question: "ULTIMATE MIND MASTERY",
        optionA: { text: "READ ANYONE'S MIND ON COMMAND", emoji: "🧠", pct: 41 },
        optionB: { text: "INVISIBILITY WHENEVER YOU WANT", emoji: "👻", pct: 59 },
      },
    ],
  },
  {
    episode: 2,
    title: "Wealth & Lifestyle",
    dilemmas: [
      {
        question: "MONEY OR FREEDOM?",
        optionA: { text: "$10,000,000 CASH RIGHT NOW", emoji: "💰", pct: 54 },
        optionB: { text: "$10,000 EVERY SINGLE DAY FOR LIFE", emoji: "📈", pct: 46 },
      },
      {
        question: "HUMAN LIMITS",
        optionA: { text: "NEVER FEEL TIRED OR NEED SLEEP", emoji: "⚡", pct: 68 },
        optionB: { text: "NEVER CATCH A COLD OR ILLNESS", emoji: "🛡️", pct: 32 },
      },
      {
        question: "TIME TRAVEL CAREER",
        optionA: { text: "BILLIONAIRE IN THE YEAR 1850", emoji: "🏰", pct: 23 },
        optionB: { text: "AVERAGE WORKER IN THE YEAR 3000", emoji: "🚀", pct: 77 },
      },
    ],
  },
  {
    episode: 3,
    title: "Extreme Survival",
    dilemmas: [
      {
        question: "EXTREME TEMPERATURES",
        optionA: { text: "SURVIVE 30 DAYS IN THE ARCTIC", emoji: "❄️", pct: 45 },
        optionB: { text: "SURVIVE 30 DAYS IN THE SAHARA DESERT", emoji: "🔥", pct: 55 },
      },
      {
        question: "TEMPORAL DILEMMA",
        optionA: { text: "REWIND TIME BY 10 YEARS", emoji: "⏪", pct: 81 },
        optionB: { text: "FAST-FORWARD TIME BY 10 YEARS", emoji: "⏩", pct: 19 },
      },
      {
        question: "LIFELONG DIET",
        optionA: { text: "EAT ONLY GOURMET PIZZA FOREVER", emoji: "🍕", pct: 62 },
        optionB: { text: "EAT ONLY ARTISAN TACOS FOREVER", emoji: "🌮", pct: 38 },
      },
    ],
  },
  {
    episode: 4,
    title: "Future & Technology",
    dilemmas: [
      {
        question: "WHERE WOULD YOU LIVE?",
        optionA: { text: "HIGH-TECH CYBERPUNK MARS COLONY", emoji: "🪐", pct: 39 },
        optionB: { text: "SECLUDED NATURE PARADISE ON EARTH", emoji: "🌲", pct: 61 },
      },
      {
        question: "FUTURE GADGET",
        optionA: { text: "AI HUMANOID BUTLER & BODYGUARD", emoji: "🤖", pct: 58 },
        optionB: { text: "FLYING SELF-DRIVING SUPERCAR", emoji: "🏎️", pct: 42 },
      },
      {
        question: "OMNISCIENCE",
        optionA: { text: "KNOW ALL SECRETS OF THE UNIVERSE", emoji: "🌌", pct: 74 },
        optionB: { text: "LIVE WITH COMPLETE PEACE OF MIND", emoji: "✨", pct: 26 },
      },
    ],
  },
  {
    episode: 5,
    title: "Impossible Paradoxes",
    dilemmas: [
      {
        question: "AGE VS WEALTH",
        optionA: { text: "BE 10 YEARS OLDER & BILLIONAIRE", emoji: "💎", pct: 53 },
        optionB: { text: "BE 10 YEARS YOUNGER & BROKE", emoji: "⏳", pct: 47 },
      },
      {
        question: "TRUTH OR TRUST?",
        optionA: { text: "ALWAYS KNOW WHEN SOMEONE LIES", emoji: "🔍", pct: 67 },
        optionB: { text: "EVERYONE ALWAYS BELIEVES YOU", emoji: "🤝", pct: 33 },
      },
      {
        question: "MODERN CONVENIENCE",
        optionA: { text: "NEVER HIT TRAFFIC LIGHTS OR JAMS", emoji: "🚦", pct: 51 },
        optionB: { text: "FREE 10GB/S WI-FI ANYWHERE ON EARTH", emoji: "📶", pct: 49 },
      },
    ],
  },
];

const SECONDS_PER_DILEMMA = 11.0;
const FRAMES_PER_DILEMMA = Math.round(SECONDS_PER_DILEMMA * 30); // 330 frames each
const TOTAL_FRAMES = FRAMES_PER_DILEMMA * 3; // 990 frames = 33.0s

const manifest = [];

for (const ep of EPISODES_DATA) {
  const events = [];

  ep.dilemmas.forEach((dil, dIdx) => {
    const startT = dIdx * SECONDS_PER_DILEMMA;
    // Countdown ticks from t = 2.0s to 7.0s
    for (let c = 5; c >= 1; c--) {
      events.push({
        t: startT + 2.0 + (5 - c) * 1.0,
        type: "tick",
        count: c,
        dilemmaIdx: dIdx,
      });
    }
    // Reveal at t = 7.5s
    events.push({
      t: startT + 7.5,
      type: "reveal",
      dilemmaIdx: dIdx,
      winner: dil.optionA.pct > dil.optionB.pct ? "A" : "B",
      pctA: dil.optionA.pct,
      pctB: dil.optionB.pct,
    });
  });

  const epOutput = {
    episode: ep.episode,
    title: ep.title,
    secondsPerDilemma: SECONDS_PER_DILEMMA,
    framesPerDilemma: FRAMES_PER_DILEMMA,
    totalFrames: TOTAL_FRAMES,
    duration: TOTAL_FRAMES / 30, // 33.0s
    dilemmas: ep.dilemmas,
    events,
  };

  fs.writeFileSync(path.join(OUT_DIR, `ep${ep.episode}.json`), JSON.stringify(epOutput, null, 2));

  manifest.push({
    episode: ep.episode,
    id: `WouldYouRather-Ep${ep.episode}`,
    title: ep.title,
    duration: epOutput.duration,
    totalFrames: epOutput.totalFrames,
    dilemmaCount: 3,
  });

  console.log(`  [OK] Ep ${ep.episode}: ${ep.title} (${epOutput.duration}s / ${epOutput.totalFrames} frames)`);
}

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("[SUCCESS] Would You Rather episodes generated!");

