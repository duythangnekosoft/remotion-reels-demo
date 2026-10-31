const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const KINETIC_DATA_DIR = path.join(ROOT, "src", "data", "kinetic");

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(987654);

const bins = 72;
const radius = 265;
const depth = Array(bins).fill(0);
const dbricks = [];
const duel = [];
const hits = [];
const score = [0, 0];
const dballs = [
  { x: -90, y: -35, vx: 530, vy: 280 },
  { x: 72, y: 45, vx: -390, vy: 490 },
];
const dt = 1 / 120;
const layer = 14;

let finishFrame = -1;
let finishTime = -1;

// Run 4320 steps @ 120Hz = 1080 frames @ 30fps (36.0s total duration)
const totalSteps = 4320;

for (let step = 0; step <= totalSteps; step++) {
  const t = step * dt;
  const fill = depth.reduce((sum, d) => sum + (radius * radius - (radius - d) ** 2), 0) / (bins * radius * radius);

  if (step % 4 === 0) {
    duel.push({
      balls: dballs.map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]),
      score: [...score],
      brickCount: dbricks.length,
      fill: Math.min(1.0, fill),
      finished: finishFrame !== -1,
    });
  }

  if (t < 0.6) continue;

  // Check if arena is 100% filled (fill >= 0.985 or every bin built to center)
  if (fill >= 0.985 && finishFrame === -1) {
    finishFrame = Math.round(step / 4);
    finishTime = t;
    console.log(`>>> 100% ARENA BUILT at step ${step} (${t.toFixed(2)}s, frame ${finishFrame})!`);
    console.log(`    Final Fill: ${(fill * 100).toFixed(1)}%, Score: RED ${score[0]} - BLUE ${score[1]}`);
  }

  // Once 100% filled, freeze ball physics for celebration
  if (finishFrame !== -1) continue;

  dballs.forEach((p, id) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const r = Math.hypot(p.x, p.y);
    let a = Math.atan2(p.y, p.x);
    if (a < 0) a += 2 * Math.PI;
    const b = Math.min(bins - 1, Math.floor((a / (2 * Math.PI)) * bins));
    const wall = radius - depth[b] - 5;

    if (r >= wall && p.vx * p.x + p.vy * p.y > 0) {
      const nx = p.x / r;
      const ny = p.y / r;
      const dot = p.vx * nx + p.vy * ny;
      p.vx -= 2 * dot * nx;
      p.vy -= 2 * dot * ny;

      // Natural bounce dispersion across angles
      const angleJitter = (rand() - 0.5) * 0.24;
      const sp = Math.hypot(p.vx, p.vy);
      const curAngle = Math.atan2(p.vy, p.vx) + angleJitter;
      p.vx = sp * Math.cos(curAngle);
      p.vy = sp * Math.sin(curAngle);

      const affected = [];
      for (let j = -4; j <= 4; j++) {
        const idx = (b + j + bins) % bins;
        const old = depth[idx];
        depth[idx] = Math.min(radius - 12, old + layer);
        affected.push({ bin: idx, outer: radius - old, inner: radius - depth[idx] });
      }
      dbricks.push({ id, t, cells: affected });
      score[id]++;
      hits.push({ t, id });
      const target = radius - depth[b] - 5.2;
      p.x = nx * target;
      p.y = ny * target;
    }
  });
}

const outData = {
  frames: duel,
  bricks: dbricks,
  events: hits,
  finishFrame,
  finishTime,
  totalFrames: duel.length,
  duration: duel.length / 30,
  winner: score[0] > score[1] ? "RED" : score[0] < score[1] ? "BLUE" : "TIE",
  finalScore: score,
};

fs.writeFileSync(path.join(KINETIC_DATA_DIR, "duel-data.json"), JSON.stringify(outData));
console.log(`Saved duel-data.json: ${duel.length} frames (${(duel.length / 30).toFixed(1)}s), 100% Filled at frame ${finishFrame}`);

