const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MARBLE_DIR = path.join(ROOT, "src", "data", "marbleRace");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "marbleRace");

if (!fs.existsSync(MARBLE_DIR)) fs.mkdirSync(MARBLE_DIR, { recursive: true });
if (!fs.existsSync(SOUND_DIR)) fs.mkdirSync(SOUND_DIR, { recursive: true });

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPETITORS = [
  { id: "red", name: "Red Fury", color: "#ff3366", glow: "rgba(255, 51, 102, 0.8)", number: 1 },
  { id: "blue", name: "Hyper Blue", color: "#00d2ff", glow: "rgba(0, 210, 255, 0.8)", number: 2 },
  { id: "gold", name: "Golden Star", color: "#ffb703", glow: "rgba(255, 183, 3, 0.8)", number: 3 },
  { id: "emerald", name: "Neon Emerald", color: "#00f5d4", glow: "rgba(0, 245, 212, 0.8)", number: 4 },
  { id: "violet", name: "Ultra Violet", color: "#9b5de5", glow: "rgba(155, 93, 229, 0.8)", number: 5 },
  { id: "blaze", name: "Solar Flare", color: "#fb5607", glow: "rgba(251, 86, 7, 0.8)", number: 6 },
  { id: "silver", name: "Silver Falcon", color: "#e2e8f0", glow: "rgba(226, 232, 240, 0.8)", number: 7 },
  { id: "pink", name: "Cyber Pink", color: "#f72585", glow: "rgba(247, 37, 133, 0.8)", number: 8 },
];

const BUMPERS = [
  { x: 380, y: 1400, r: 45, color: "#ffb703" },
  { x: 700, y: 1400, r: 45, color: "#ffb703" },
  { x: 540, y: 1650, r: 55, color: "#00f5d4" },
  { x: 340, y: 1900, r: 45, color: "#ff3366" },
  { x: 740, y: 1900, r: 45, color: "#ff3366" },
  { x: 540, y: 2150, r: 60, color: "#9b5de5" },
];

const PEGS = [];
for (let row = 0; row < 12; row++) {
  const count = row % 2 === 0 ? 9 : 8;
  const startX = row % 2 === 0 ? 200 : 235;
  for (let c = 0; c < count; c++) {
    PEGS.push({ x: startX + c * 75, y: 3600 + row * 80, r: 12 });
  }
}

function generateMarbleRaceEpisode(seed, epNum) {
  const rand = mulberry32(seed);
  const finishLineY = 6200;

  const marbles = COMPETITORS.map((c, i) => ({
    ...c,
    x: 360 + (i % 4) * 90 + Math.floor(i / 4) * 45,
    y: 120 + Math.floor(i / 4) * 70,
    vx: (rand() - 0.5) * 60,
    vy: rand() * 30 + 15,
    r: 18,
    finished: false,
    finishRank: 0,
    finishFrame: 0,
  }));

  const frames = [];
  const events = [];
  const finishOrder = [];
  let prevLeaderId = null;

  let f = 0;
  let winnerFinishFrame = null;
  const CELEBRATION_FRAMES = 180; // 5.0s of podium celebration

  while (true) {
    const t = f / 30;
    const substeps = 4;
    const dt = 1 / (30 * substeps);

    for (let sub = 0; sub < substeps; sub++) {
      for (let i = 0; i < marbles.length; i++) {
        const m = marbles[i];
        if (m.finished) {
          m.vx *= 0.94;
          m.vy *= 0.94;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          continue;
        }

        m.vy += 165 * dt;
        m.vx *= 0.992;
        m.vy *= 0.996;

        let leftWall = 160;
        let rightWall = 920;

        if (m.y >= 300 && m.y < 1300) {
          const wave = Math.sin((m.y - 300) * 0.007) * 220;
          leftWall = 260 + wave;
          rightWall = 820 + wave;
          m.vx += Math.sin((m.y - 300) * 0.007) * 90 * dt;
        }

        if (m.y >= 2300 && m.y < 3400) {
          const centerY = 2850;
          const centerX = 540;
          const dx = m.x - centerX;
          const dy = m.y - centerY;
          const dist = Math.hypot(dx, dy) || 1;
          const angle = Math.atan2(dy, dx);
          m.vx += -Math.sin(angle) * 250 * dt;
          m.vy += Math.cos(angle) * 150 * dt + 170 * dt;
          m.vx -= (dx / dist) * 110 * dt;
        }

        if (m.y >= 5200 && m.y < 5300) {
          m.vy += 450 * dt;
          if (sub === 0 && Math.abs(m.vx) < 30) {
            events.push({ t, type: "boost", id: m.id });
          }
        }

        m.vx += (rand() - 0.5) * 35 * dt;

        for (const b of BUMPERS) {
          const dx = m.x - b.x;
          const dy = m.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < m.r + b.r) {
            const nx = dx / dist;
            const ny = dy / dist;
            m.x = b.x + nx * (m.r + b.r);
            m.y = b.y + ny * (m.r + b.r);
            const dot = m.vx * nx + m.vy * ny;
            m.vx = (m.vx - 2 * dot * nx) * 1.35;
            m.vy = (m.vy - 2 * dot * ny) * 1.35;
            if (sub === 0) events.push({ t, type: "bumper", x: b.x, y: b.y });
          }
        }

        if (m.y >= 3600 && m.y <= 4600) {
          for (const p of PEGS) {
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < m.r + p.r) {
              const nx = dx / dist;
              const ny = dy / dist;
              m.x = p.x + nx * (m.r + p.r);
              m.y = p.y + ny * (m.r + p.r);
              const dot = m.vx * nx + m.vy * ny;
              m.vx = (m.vx - 1.8 * dot * nx) * 0.85 + (rand() - 0.5) * 40;
              m.vy = (m.vy - 1.8 * dot * ny) * 0.85;
              if (sub === 0 && rand() < 0.4) events.push({ t, type: "peg", x: p.x });
            }
          }
        }

        if (m.x - m.r < leftWall) {
          m.x = leftWall + m.r;
          m.vx = Math.abs(m.vx) * 0.7 + 20;
          if (sub === 0 && rand() < 0.25) events.push({ t, type: "wall", id: m.id });
        }
        if (m.x + m.r > rightWall) {
          m.x = rightWall - m.r;
          m.vx = -Math.abs(m.vx) * 0.7 - 20;
          if (sub === 0 && rand() < 0.25) events.push({ t, type: "wall", id: m.id });
        }

        for (let j = i + 1; j < marbles.length; j++) {
          const m2 = marbles[j];
          const dx = m2.x - m.x;
          const dy = m2.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < m.r + m2.r && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = m.r + m2.r - dist;
            m.x -= nx * overlap * 0.5;
            m.y -= ny * overlap * 0.5;
            m2.x += nx * overlap * 0.5;
            m2.y += ny * overlap * 0.5;
            const kx = m.vx - m2.vx;
            const ky = m.vy - m2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;
            m.vx -= p * nx * 0.9;
            m.vy -= p * ny * 0.9;
            m2.vx += p * nx * 0.9;
            m2.vy += p * ny * 0.9;
            if (sub === 0 && rand() < 0.25) events.push({ t, type: "clink" });
          }
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        if (m.y >= finishLineY && !m.finished) {
          m.finished = true;
          m.finishRank = finishOrder.length + 1;
          m.finishFrame = f;
          finishOrder.push(m.id);
          events.push({ t, type: "finish", rank: m.finishRank, id: m.id, name: m.name });
          if (finishOrder.length === 1) {
            winnerFinishFrame = f;
          }
        }
      }
    }

    const sorted = [...marbles].sort((a, b) => {
      if (a.finished && b.finished) return a.finishRank - b.finishRank;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.y - a.y;
    });

    const currentLeader = sorted[0].id;
    if (prevLeaderId && currentLeader !== prevLeaderId && f > 60 && !winnerFinishFrame) {
      events.push({ t, type: "overtake", leader: sorted[0].name });
    }
    prevLeaderId = currentLeader;

    const leaderY = sorted[0].y;

    frames.push({
      cameraY: Math.round(Math.min(finishLineY - 600, Math.max(0, leaderY - 500))),
      marbles: marbles.map((m) => ({
        id: m.id,
        x: Math.round(m.x * 10) / 10,
        y: Math.round(m.y * 10) / 10,
        finished: m.finished,
        rank: sorted.findIndex((s) => s.id === m.id) + 1,
      })),
      leaderboard: sorted.map((s) => s.id),
      allFinished: marbles.every((m) => m.finished),
    });

    f++;

    // Terminate when:
    // 1. Winner has finished AND at least 5 marbles have finished AND 5 seconds have passed since winner
    // OR all finished + 5 seconds
    if (winnerFinishFrame && f >= winnerFinishFrame + CELEBRATION_FRAMES) {
      break;
    }
    if (f > 1500) {
      // Safety cap (50 seconds)
      break;
    }
  }

  // Finalize any unfinished marble
  marbles.forEach((m) => {
    if (!m.finished) {
      m.finished = true;
      m.finishRank = finishOrder.length + 1;
      m.finishFrame = f;
      finishOrder.push(m.id);
    }
  });

  const winner = COMPETITORS.find((c) => c.id === finishOrder[0]);
  const runnerUp = COMPETITORS.find((c) => c.id === finishOrder[1]);
  const thirdPlace = COMPETITORS.find((c) => c.id === finishOrder[2]);

  return {
    episode: epNum,
    title: `Championship Cup Ep #${epNum}`,
    totalFrames: f,
    duration: Math.round((f / 30) * 100) / 100,
    finishLineY,
    winnerFinishFrame,
    winnerFinishSec: (winnerFinishFrame / 30).toFixed(1),
    bumpers: BUMPERS,
    pegs: PEGS,
    competitors: COMPETITORS,
    winner,
    podium: [winner, runnerUp, thirdPlace],
    finishOrder: finishOrder.map((id) => COMPETITORS.find((c) => c.id === id)),
    frames,
    events,
  };
}

console.log("Simulating 5 Marble Race Championship Episodes...");
const marbleManifest = [];
for (let ep = 1; ep <= 5; ep++) {
  const seed = 12049 + ep * 7819;
  const data = generateMarbleRaceEpisode(seed, ep);
  fs.writeFileSync(path.join(MARBLE_DIR, `ep${ep}.json`), JSON.stringify(data));
  marbleManifest.push({
    episode: ep,
    id: `MarbleRace-Ep${ep}`,
    duration: data.duration,
    totalFrames: data.totalFrames,
    winner: data.winner.name,
    color: data.winner.color,
    finishSec: data.winnerFinishSec,
  });
  console.log(
    `  ✓ Episode ${ep}: Winner = ${data.winner.name} (Won at ${data.winnerFinishSec}s, Video total: ${data.duration}s / ${data.totalFrames} frames)`
  );
}

fs.writeFileSync(path.join(MARBLE_DIR, "manifest.json"), JSON.stringify(marbleManifest, null, 2));
console.log("✅ Marble Race simulation successfully generated!");
