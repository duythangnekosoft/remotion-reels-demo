const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data", "territory");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "territory");

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

const FACTIONS = [
  { id: "red", name: "Crimson Blaze", color: "#ff0055", glow: "rgba(255, 0, 85, 0.8)", baseFreq: 440 },
  { id: "cyan", name: "Neon Cyan", color: "#00f5d4", glow: "rgba(0, 245, 212, 0.8)", baseFreq: 554.37 },
  { id: "gold", name: "Solar Gold", color: "#ffd166", glow: "rgba(255, 209, 102, 0.8)", baseFreq: 659.25 },
  { id: "purple", name: "Cyber Violet", color: "#9d4edd", glow: "rgba(157, 78, 221, 0.8)", baseFreq: 830.61 },
];

function simulateTerritoryEpisode(seed, epNum) {
  const rand = mulberry32(seed);

  const COLS = 20;
  const ROWS = 30;
  const TOTAL_TILES = COLS * ROWS; // 600 tiles
  const cellW = 900 / COLS; // 45px
  const cellH = 1350 / ROWS; // 45px
  const gridX = 90;
  const gridY = 300;

  const grid = new Uint8Array(TOTAL_TILES);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const isTop = r < ROWS / 2;
      const isLeft = c < COLS / 2;
      if (isTop && isLeft) grid[idx] = 0;
      else if (isTop && !isLeft) grid[idx] = 1;
      else if (!isTop && isLeft) grid[idx] = 2;
      else grid[idx] = 3;
    }
  }

  const dominantId = (epNum - 1) % 4;

  const spheres = [
    { id: 0, x: gridX + 225, y: gridY + 337, vx: 420, vy: 310, r: 24 },
    { id: 1, x: gridX + 675, y: gridY + 337, vx: -390, vy: 320, r: 24 },
    { id: 2, x: gridX + 225, y: gridY + 1012, vx: 380, vy: -340, r: 24 },
    { id: 3, x: gridX + 675, y: gridY + 1012, vx: -410, vy: -300, r: 24 },
  ];

  const frames = [];
  const events = [];
  let f = 0;
  let conquestFrame = null;
  const CELEBRATION_FRAMES = 150; // 5.0 seconds celebration

  let counts = [TOTAL_TILES / 4, TOTAL_TILES / 4, TOTAL_TILES / 4, TOTAL_TILES / 4];
  let lastSavedGrid = null;

  while (true) {
    const t = f / 30;
    const substeps = 4;
    const dt = 1 / (30 * substeps);

    for (let sub = 0; sub < substeps; sub++) {
      // Progressively empower dominant faction after t = 10s
      if (t > 10) {
        const dom = spheres[dominantId];
        const factor = 1 + (t - 10) * 0.05;
        const speed = Math.hypot(dom.vx, dom.vy);
        const targetSpeed = Math.min(880, 480 * factor);
        if (speed > 0) {
          dom.vx = (dom.vx / speed) * targetSpeed;
          dom.vy = (dom.vy / speed) * targetSpeed;
        }

        // Weaken others
        for (let i = 0; i < 4; i++) {
          if (i !== dominantId && t > 18) {
            spheres[i].vx *= 0.9998;
            spheres[i].vy *= 0.9998;
          }
        }
      }

      for (const s of spheres) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.x - s.r < gridX) {
          s.x = gridX + s.r;
          s.vx = Math.abs(s.vx);
          if (sub === 0 && rand() < 0.3) events.push({ t, type: "wall", id: s.id });
        } else if (s.x + s.r > gridX + 900) {
          s.x = gridX + 900 - s.r;
          s.vx = -Math.abs(s.vx);
          if (sub === 0 && rand() < 0.3) events.push({ t, type: "wall", id: s.id });
        }

        if (s.y - s.r < gridY) {
          s.y = gridY + s.r;
          s.vy = Math.abs(s.vy);
          if (sub === 0 && rand() < 0.3) events.push({ t, type: "wall", id: s.id });
        } else if (s.y + s.r > gridY + 1350) {
          s.y = gridY + 1350 - s.r;
          s.vy = -Math.abs(s.vy);
          if (sub === 0 && rand() < 0.3) events.push({ t, type: "wall", id: s.id });
        }

        // Paint radius
        let pRad = 1;
        if (s.id === dominantId) {
          if (t > 24) pRad = 3;
          else if (t > 14) pRad = 2;
        }

        const centerCol = Math.floor((s.x - gridX) / cellW);
        const centerRow = Math.floor((s.y - gridY) / cellH);

        let converted = 0;
        for (let dr = -pRad; dr <= pRad; dr++) {
          for (let dc = -pRad; dc <= pRad; dc++) {
            if (dr * dr + dc * dc <= pRad * pRad + 0.5) {
              const c = centerCol + dc;
              const r = centerRow + dr;
              if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
                const tidx = r * COLS + c;
                const prev = grid[tidx];
                if (prev !== s.id) {
                  // After t > 22, non-dominant spheres have a harder time converting dominant tiles
                  if (s.id !== dominantId && prev === dominantId && rand() < 0.7) {
                    continue;
                  }
                  grid[tidx] = s.id;
                  counts[prev]--;
                  counts[s.id]++;
                  converted++;
                }
              }
            }
          }
        }

        if (converted > 0 && sub === 0 && rand() < 0.25) {
          events.push({ t, type: "tile", id: s.id, count: converted });
        }

        if (counts[dominantId] >= TOTAL_TILES && !conquestFrame) {
          conquestFrame = f;
          events.push({ t, type: "victory", id: dominantId, faction: FACTIONS[dominantId].name });
        }
      }

      // Collisions
      for (let i = 0; i < spheres.length; i++) {
        for (let j = i + 1; j < spheres.length; j++) {
          const s1 = spheres[i];
          const s2 = spheres[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          if (dist < s1.r + s2.r && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = s1.r + s2.r - dist;
            s1.x -= nx * overlap * 0.5;
            s1.y -= ny * overlap * 0.5;
            s2.x += nx * overlap * 0.5;
            s2.y += ny * overlap * 0.5;
            const p = 2 * (s1.vx * nx + s1.vy * ny - s2.vx * nx - s2.vy * ny) / 2;
            s1.vx -= p * nx;
            s1.vy -= p * ny;
            s2.vx += p * nx;
            s2.vy += p * ny;
            if (sub === 0 && rand() < 0.4) events.push({ t, type: "clash" });
          }
        }
      }
    }

    // Force finalize remaining at 31s if not yet 100%
    if (t >= 31.0 && !conquestFrame) {
      for (let i = 0; i < TOTAL_TILES; i++) {
        grid[i] = dominantId;
      }
      counts = [0, 0, 0, 0];
      counts[dominantId] = TOTAL_TILES;
      conquestFrame = f;
      events.push({ t, type: "victory", id: dominantId, faction: FACTIONS[dominantId].name });
    }

    const pcts = counts.map((cnt) => Math.round((cnt / TOTAL_TILES) * 1000) / 10);

    // Save grid state efficiently
    const saveGrid = f % 2 === 0;
    if (saveGrid) {
      lastSavedGrid = Array.from(grid);
    }

    frames.push({
      spheres: spheres.map((s) => ({
        x: Math.round(s.x * 10) / 10,
        y: Math.round(s.y * 10) / 10,
      })),
      pcts,
      grid: saveGrid ? lastSavedGrid : null,
    });

    f++;

    if (conquestFrame && f >= conquestFrame + CELEBRATION_FRAMES) {
      break;
    }
  }

  const winner = FACTIONS[dominantId];

  return {
    episode: epNum,
    title: `Territory War Ep #${epNum}`,
    cols: COLS,
    rows: ROWS,
    totalTiles: TOTAL_TILES,
    gridX,
    gridY,
    gridW: 900,
    gridH: 1350,
    cellW,
    cellH,
    winner,
    conquestFrame,
    conquestSec: (conquestFrame / 30).toFixed(1),
    totalFrames: f,
    duration: Math.round((f / 30) * 100) / 100,
    factions: FACTIONS,
    frames,
    events,
  };
}

console.log("Calibrating 5 Territory Conquest Episodes...");
const territoryManifest = [];
for (let ep = 1; ep <= 5; ep++) {
  const seed = 51200 + ep * 3381;
  const data = simulateTerritoryEpisode(seed, ep);
  fs.writeFileSync(path.join(OUT_DIR, `ep${ep}.json`), JSON.stringify(data));
  territoryManifest.push({
    episode: ep,
    id: `Territory-Ep${ep}`,
    duration: data.duration,
    totalFrames: data.totalFrames,
    winner: data.winner.name,
    color: data.winner.color,
    conquestSec: data.conquestSec,
  });
  console.log(
    `  [OK] Ep ${ep}: Winner = ${data.winner.name} (100% at ${data.conquestSec}s, Video total: ${data.duration}s / ${data.totalFrames} frames)`
  );
}

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(territoryManifest, null, 2));
console.log("[SUCCESS] Territory Conquest calibrated perfectly!");
