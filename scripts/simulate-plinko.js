const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data", "plinko");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "plinko");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(SOUND_DIR)) fs.mkdirSync(SOUND_DIR, { recursive: true });

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUCKETS = [
  { label: "100x", multiplier: 100, color: "#ff0055", baseVal: 50000 },
  { label: "25x", multiplier: 25, color: "#f72585", baseVal: 25000 },
  { label: "10x", multiplier: 10, color: "#7209b7", baseVal: 15000 },
  { label: "5x", multiplier: 5, color: "#3a0ca3", baseVal: 10000 },
  { label: "2x", multiplier: 2, color: "#4361ee", baseVal: 5000 },
  { label: "JACKPOT", multiplier: 500, color: "#ffd166", baseVal: 350000, isJackpot: true },
  { label: "2x", multiplier: 2, color: "#4361ee", baseVal: 5000 },
  { label: "5x", multiplier: 5, color: "#3a0ca3", baseVal: 10000 },
  { label: "10x", multiplier: 10, color: "#7209b7", baseVal: 15000 },
  { label: "25x", multiplier: 25, color: "#f72585", baseVal: 25000 },
  { label: "100x", multiplier: 100, color: "#ff0055", baseVal: 50000 },
];

function simulatePlinkoEpisode(seed, epNum) {
  const rand = mulberry32(seed);

  const PEGS = [];
  const rows = 14;
  for (let r = 0; r < rows; r++) {
    const count = 4 + r;
    const spacing = 800 / (rows + 1);
    const startX = 540 - ((count - 1) * spacing) / 2;
    const y = 380 + r * 80;
    for (let c = 0; c < count; c++) {
      PEGS.push({ x: startX + c * spacing, y, r: 8, id: `peg-${r}-${c}` });
    }
  }

  const bucketY = 1520;
  const bucketW = 880 / BUCKETS.length;
  const bucketLeft = 100;

  const BALL_COUNT = 40;
  const balls = [];
  for (let i = 0; i < BALL_COUNT; i++) {
    balls.push({
      id: i,
      spawnT: 0.5 + i * 0.6,
      x: 540 + (rand() - 0.5) * 60,
      y: 220,
      vx: (rand() - 0.5) * 80,
      vy: rand() * 40 + 20,
      r: 14,
      color: i === BALL_COUNT - 1 ? "#ffd166" : (i % 2 === 0 ? "#00f5d4" : "#f72585"),
      active: false,
      finished: false,
      scoreAdded: 0,
    });
  }

  const TARGET_GOAL = 1000000;
  let currentScore = 0;
  let targetReachedFrame = null;
  const CELEBRATION_FRAMES = 210; // 6.0 seconds

  const frames = [];
  const events = [];
  let f = 0;

  while (true) {
    const t = f / 30;
    const substeps = 4;
    const dt = 1 / (30 * substeps);

    for (let sub = 0; sub < substeps; sub++) {
      for (const b of balls) {
        if (!b.active && t >= b.spawnT && !b.finished) {
          b.active = true;
        }
        if (!b.active || b.finished) continue;

        b.vy += 320 * dt;
        b.vx *= 0.995;
        b.vy *= 0.998;

        for (const p of PEGS) {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < b.r + p.r) {
            const nx = dx / dist;
            const ny = dy / dist;
            b.x = p.x + nx * (b.r + p.r);
            b.y = p.y + ny * (b.r + p.r);
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 1.8 * dot * nx) * 0.85 + (rand() - 0.5) * 50;
            b.vy = (b.vy - 1.8 * dot * ny) * 0.85;
            if (sub === 0 && rand() < 0.6) {
              events.push({ t, type: "peg", x: p.x, y: p.y, freq: 800 + (p.y % 800) });
            }
          }
        }

        if (b.x - b.r < 80) {
          b.x = 80 + b.r;
          b.vx = Math.abs(b.vx) * 0.7;
        } else if (b.x + b.r > 1000) {
          b.x = 1000 - b.r;
          b.vx = -Math.abs(b.vx) * 0.7;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.y >= bucketY && !b.finished) {
          b.finished = true;
          b.active = false;
          const bIdx = Math.max(0, Math.min(BUCKETS.length - 1, Math.floor((b.x - bucketLeft) / bucketW)));
          const bucket = BUCKETS[bIdx];

          let payout = bucket.baseVal;
          // When t >= 26.0s or last 2 balls, trigger target completion
          if ((t >= 26.0 || b.id >= BALL_COUNT - 2) && currentScore < TARGET_GOAL) {
            payout = TARGET_GOAL - currentScore;
          }
          currentScore += payout;
          b.scoreAdded = payout;

          events.push({
            t,
            type: "bucket",
            bucketIdx: bIdx,
            label: bucket.label,
            multiplier: bucket.multiplier,
            payout,
            totalScore: currentScore,
          });

          if (currentScore >= TARGET_GOAL && !targetReachedFrame) {
            targetReachedFrame = f;
            events.push({ t, type: "jackpot_complete", totalScore: currentScore });
          }
        }
      }
    }

    frames.push({
      balls: balls
        .filter((b) => b.active || (b.finished && b.y < bucketY + 60))
        .map((b) => ({
          id: b.id,
          x: Math.round(b.x * 10) / 10,
          y: Math.round(b.y * 10) / 10,
          color: b.color,
        })),
      score: currentScore,
      pct: Math.min(100, Math.round((currentScore / TARGET_GOAL) * 1000) / 10),
    });

    f++;

    if (targetReachedFrame && f >= targetReachedFrame + CELEBRATION_FRAMES) {
      break;
    }
  }

  return {
    episode: epNum,
    title: `Lucky Plinko Ep #${epNum}`,
    targetGoal: TARGET_GOAL,
    targetReachedFrame,
    targetReachedSec: (targetReachedFrame / 30).toFixed(1),
    totalFrames: f,
    duration: Math.round((f / 30) * 100) / 100,
    buckets: BUCKETS,
    pegs: PEGS,
    frames,
    events,
  };
}

console.log("Calibrating 5 Plinko Fortune Drop Episodes...");
const plinkoManifest = [];
for (let ep = 1; ep <= 5; ep++) {
  const seed = 91800 + ep * 5521;
  const data = simulatePlinkoEpisode(seed, ep);
  fs.writeFileSync(path.join(OUT_DIR, `ep${ep}.json`), JSON.stringify(data));
  plinkoManifest.push({
    episode: ep,
    id: `Plinko-Ep${ep}`,
    duration: data.duration,
    totalFrames: data.totalFrames,
    targetReachedSec: data.targetReachedSec,
  });
  console.log(
    `  [OK] Ep ${ep}: $1M Target Reached at ${data.targetReachedSec}s, Video total: ${data.duration}s / ${data.totalFrames} frames`
  );
}

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(plinkoManifest, null, 2));
console.log("[SUCCESS] Plinko Fortune Drop calibrated perfectly!");
