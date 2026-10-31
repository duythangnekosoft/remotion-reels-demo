const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const KINETIC_DATA_DIR = path.join(ROOT, "src", "data", "kinetic");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "kinetic");

console.log("==================================================");
console.log("🚀 UPGRADING ALL UNDER-30s VIDEOS TO 30s-40s (35s AVG)");
console.log("==================================================\n");

// -------------------------------------------------------------
// 1. GENERATE KINETIC FIVE DATASETS (34s - 36s)
// -------------------------------------------------------------
console.log("📦 [1/4] Simulating 5 Kinetic ASMR studies calibrated for ~35s...");

let seed = 40971;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};

const summaries = [];

function makeFill(id, kind, title, titleVn, speedScale) {
  const poly = Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI;
    return [
      16 * Math.sin(t) ** 3 * 16,
      -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 16,
    ];
  });

  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i];
      const b = poly[j];
      if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };

  const bound = (x, y) => {
    if (kind === "orbit") {
      const r = Math.hypot(x, y);
      if (r > 180) return { d: 274 - r, nx: x / r, ny: y / r };
      return { d: r - 90, nx: -x / r, ny: -y / r };
    }
    let best = 1e9,
      bx = 0,
      by = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const vx = b[0] - a[0];
      const vy = b[1] - a[1];
      const u = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy)));
      const px = a[0] + u * vx;
      const py = a[1] + u * vy;
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < best) {
        best = d;
        bx = px;
        by = py;
      }
    }
    const sign = inside(x, y) ? 1 : -1;
    const dist = Math.sqrt(best) || 0.0001;
    return { d: sign * dist, nx: (bx - x) / (sign * dist), ny: (by - y) / (sign * dist) };
  };

  const grid = Array.from({ length: 151 * 151 }, (_, i) => bound((i % 151) * 4 - 300, Math.floor(i / 151) * 4 - 300));
  const lookup = (x, y) =>
    grid[Math.max(0, Math.min(150, Math.round((y + 300) / 4))) * 151 + Math.max(0, Math.min(150, Math.round((x + 300) / 4)))];

  const cells = [];
  const map = new Map();
  for (let y = -286; y <= 286; y += 11) {
    for (let x = -286; x <= 286; x += 11) {
      if (bound(x, y).d > 15) {
        map.set(`${Math.round((x + 286) / 11)},${Math.round((y + 286) / 11)}`, cells.length);
        cells.push({ x, y, on: -1, color: 0 });
      }
    }
  }

  let balls = [{ x: kind === "orbit" ? 145 : 0, y: kind === "orbit" ? 0 : -60, vx: 230, vy: -140 }];
  const frames = [];
  const events = [];
  let lit = 0;
  let finish = -1;

  for (let k = 0; k < 120 * 240; k++) {
    const t = k / 120;
    if (k % 4 === 0) {
      for (let i = 0; i < balls.length; i++) {
        const p = balls[i];
        const gx = Math.round((p.x + 286) / 11);
        const gy = Math.round((p.y + 286) / 11);
        for (let yy = -1; yy <= 1; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            const idx = map.get(`${gx + xx},${gy + yy}`);
            if (idx !== undefined && cells[idx].on < 0 && (cells[idx].x - p.x) ** 2 + (cells[idx].y - p.y) ** 2 < 169) {
              cells[idx].on = frames.length;
              cells[idx].color = i % 18;
              lit++;
            }
          }
        }
      }
      frames.push({ balls: balls.map((p) => [+p.x.toFixed(1), +p.y.toFixed(1)]), lit });
      if (lit === cells.length) {
        finish = frames.length - 1;
        break;
      }
    }
    if (t < 0.8) continue;

    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const p = balls[i];
      p.x += (p.vx * speedScale) / 120;
      p.y += (p.vy * speedScale) / 120;
      const b = lookup(p.x, p.y);
      if (b.d < 5) {
        const exact = bound(p.x, p.y);
        const dot = p.vx * exact.nx + p.vy * exact.ny;
        p.x -= exact.nx * (5.3 - exact.d);
        p.y -= exact.ny * (5.3 - exact.d);
        if (dot > 0) {
          p.vx -= 2 * dot * exact.nx;
          p.vy -= 2 * dot * exact.ny;
          events.push({ t, id: i });
          const angle = (random() - 0.5) * 1.6;
          const v = 260 + random() * 60;
          const child = {
            x: p.x - exact.nx * 0.5,
            y: p.y - exact.ny * 0.5,
            vx: v * (-exact.nx * Math.cos(angle) - exact.ny * Math.sin(angle)),
            vy: v * (-exact.ny * Math.cos(angle) + exact.nx * Math.sin(angle)),
          };
          if (bound(child.x, child.y).d > 3) balls.push(child);
        }
      }
    }
    if (balls.length > 25000) throw Error("Simulation overload: " + id);
  }

  if (finish < 0) throw Error("Incomplete fill: " + id);
  // Hold ending for 75 frames (2.5s)
  for (let i = 0; i < 75; i++) frames.push(frames[finish]);

  const duration = frames.length / 30;
  const payload = {
    kind,
    title,
    poly,
    cells,
    frames,
    events,
    finishFrame: finish,
    result: { totalCells: cells.length, lit, balls: balls.length, goal: "all cells lit" },
  };

  fs.writeFileSync(path.join(KINETIC_DATA_DIR, `${id}.json`), JSON.stringify(payload));
  summaries.push({
    id,
    kind,
    title,
    titleVn,
    frames: frames.length,
    finishFrame: finish,
    duration,
    events: events.length,
    result: payload.result,
  });
  console.log(`  ✓ ${id}: ${frames.length} frames (${duration.toFixed(1)}s) - finish at ${finish}`);
}

function makeDuel(id, square, title, titleVn, shrinkRate) {
  let radius = 266;
  const balls = [
    { x: -70, y: -30, vx: 470, vy: 310 },
    { x: 85, y: 52, vx: -420, vy: 375 },
  ];
  const score = [0, 0];
  const rings = [];
  const events = [];
  const frames = [];
  let finish = -1;

  for (let k = 0; k < 120 * 240; k++) {
    const t = k / 120;
    if (k % 4 === 0) {
      frames.push({
        balls: balls.map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]),
        score: [...score],
        rings: rings.length,
        radius,
      });
    }
    if (t < 0.8) continue;

    for (let id = 0; id < 2; id++) {
      const p = balls[id];
      p.x += p.vx / 120;
      p.y += p.vy / 120;
      let hit = false,
        nx = 0,
        ny = 0;
      if (square) {
        if (Math.abs(p.x) >= radius - 5 && p.vx * p.x > 0) {
          nx = Math.sign(p.x);
          hit = true;
        } else if (Math.abs(p.y) >= radius - 5 && p.vy * p.y > 0) {
          ny = Math.sign(p.y);
          hit = true;
        }
      } else {
        const r = Math.hypot(p.x, p.y);
        if (r >= radius - 5 && p.vx * p.x + p.vy * p.y > 0) {
          nx = p.x / r;
          ny = p.y / r;
          hit = true;
        }
      }

      if (hit) {
        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;
        const shrink = shrinkRate;
        rings.push({ outer: radius, inner: Math.max(0, radius - shrink), id });
        radius -= shrink;
        score[id]++;
        events.push({ t, id });
        for (const q of balls) {
          if (square) {
            q.x = Math.max(-radius + 5.1, Math.min(radius - 5.1, q.x));
            q.y = Math.max(-radius + 5.1, Math.min(radius - 5.1, q.y));
          } else {
            const r = Math.hypot(q.x, q.y);
            const limit = Math.max(0, radius - 5.1);
            if (r > limit) {
              q.x *= limit / r;
              q.y *= limit / r;
            }
          }
        }
        if (radius <= 10) {
          finish = Math.ceil(t * 30);
          break;
        }
      }
    }
    if (finish >= 0) break;
  }

  if (finish < 0) throw Error("Duel incomplete: " + id);
  const final = { balls: balls.map((p) => [p.x, p.y]), score: [...score], rings: rings.length, radius };
  while (frames.length < finish + 75) frames.push(final);

  const duration = frames.length / 30;
  const payload = {
    kind: square ? "square" : "rings",
    title,
    rings,
    events,
    frames,
    finishFrame: finish,
    result: {
      score,
      rings: rings.length,
      remainingRadius: radius,
      goal: "arena closed",
      winner: score[0] === score[1] ? "TIE" : score[0] > score[1] ? (square ? "GOLD" : "RED") : square ? "VIOLET" : "BLUE",
    },
  };

  fs.writeFileSync(path.join(KINETIC_DATA_DIR, `${id}.json`), JSON.stringify(payload));
  summaries.push({
    id,
    kind: square ? "square" : "rings",
    title,
    titleVn,
    frames: frames.length,
    finishFrame: finish,
    duration,
    events: events.length,
    result: payload.result,
  });
  console.log(`  ✓ ${id}: ${frames.length} frames (${duration.toFixed(1)}s) - finish at ${finish}`);
}

function makeBreak(speedScale) {
  const bricks = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 42; x++) {
      const dx = (x - 20.5) / 20;
      const dy = (y - 15.5) / 15;
      if (Math.abs(dx) + Math.abs(dy) < 1.22 && Math.hypot(dx, dy) > 0.25) {
        bricks.push({ x: 57 + x * 14.4, y: 310 + y * 14.4, dead: -1, hue: (x * 4 + y * 3 + 160) % 360 });
      }
    }
  }
  const spatial = new Map();
  bricks.forEach((b, i) => spatial.set(`${Math.floor((b.x - 57) / 14.4 + 0.01)},${Math.floor((b.y - 310) / 14.4 + 0.01)}`, i));
  let balls = [{ x: 360, y: 990, vx: 235, vy: -450 }];
  const frames = [];
  const events = [];
  let remaining = bricks.length;
  let finish = -1;

  for (let k = 0; k < 120 * 240; k++) {
    const t = k / 120;
    if (k % 4 === 0) frames.push({ balls: balls.map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]), remaining });
    if (t < 0.8) continue;
    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const p = balls[i];
      const px = p.x;
      const py = p.y;
      p.x += (p.vx * speedScale) / 120;
      p.y += (p.vy * speedScale) / 120;
      if (p.x < 39) {
        p.x = 39;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > 681) {
        p.x = 681;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < 265) {
        p.y = 265;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > 1050) {
        p.y = 1050;
        p.vy = -Math.abs(p.vy);
      }
      const gx = Math.floor((p.x - 57) / 14.4);
      const gy = Math.floor((p.y - 310) / 14.4);
      let hit = -1;
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        for (let xx = gx - 1; xx <= gx + 1; xx++) {
          const idx = spatial.get(`${xx},${yy}`);
          if (idx !== undefined) {
            const b = bricks[idx];
            if (b.dead < 0 && p.x + 4 > b.x && p.x - 4 < b.x + 12 && p.y + 4 > b.y && p.y - 4 < b.y + 12) {
              hit = idx;
            }
          }
        }
      }
      if (hit >= 0) {
        const b = bricks[hit];
        b.dead = Math.ceil(t * 30);
        remaining--;
        events.push({ t, id: i });
        if (px + 4 <= b.x || px - 4 >= b.x + 12) {
          p.vx = -p.vx;
          p.x = px;
        } else {
          p.vy = -p.vy;
          p.y = py;
        }
        const angle = random() * Math.PI * 2;
        balls.push({ x: p.x, y: p.y, vx: 510 * Math.cos(angle), vy: 510 * Math.sin(angle) });
      }
    }
    if (remaining === 0) {
      finish = Math.ceil(t * 30);
      break;
    }
  }

  if (finish < 0) throw Error("Bricks incomplete: " + remaining);
  const final = { balls: balls.map((p) => [p.x, p.y]), remaining };
  while (frames.length < finish + 75) frames.push(final);

  const duration = frames.length / 30;
  const payload = {
    kind: "brick",
    title: "PRISM COLLAPSE",
    bricks,
    frames,
    events,
    finishFrame: finish,
    result: { totalBricks: bricks.length, remaining, balls: balls.length, goal: "all bricks destroyed" },
  };

  fs.writeFileSync(path.join(KINETIC_DATA_DIR, "PrismCollapse.json"), JSON.stringify(payload));
  summaries.push({
    id: "PrismCollapse",
    kind: "brick",
    title: "PRISM COLLAPSE",
    titleVn: "Phá Gạch Neon Khép Kín (796 Viên Gạch)",
    frames: frames.length,
    finishFrame: finish,
    duration,
    events: events.length,
    result: payload.result,
  });
  console.log(`  ✓ PrismCollapse: ${frames.length} frames (${duration.toFixed(1)}s) - finish at ${finish}`);
}

makeFill("HeartBloom", "heart", "HEART BLOOM", "Thắp Sáng Trái Tim Neon (1,001 Điểm)", 0.185);
makeFill("OrbitBloom", "orbit", "ORBIT BLOOM", "Quỹ Đạo Nhân Bản Hạt Neon (1,456 Điểm)", 0.235);
makeDuel("RingRivals", false, "RING RIVALS", "Đấu Trường Vành Tròn Thu Hẹp (Đỏ vs Xanh)", 1.75);
makeDuel("SquareRivals", true, "SQUARE RIVALS", "Đấu Trường Hình Vuông Thu Hẹp (Vàng vs Tím)", 1.30);
makeBreak(0.10);

fs.writeFileSync(path.join(KINETIC_DATA_DIR, "five-manifest.json"), JSON.stringify(summaries, null, 2));

// -------------------------------------------------------------
// 2. GENERATE NEON & DUEL DATASETS (35s = 4200 STEPS, 1050 FRAMES)
// -------------------------------------------------------------
console.log("\n📦 [2/4] Simulating NeonBloom and BuildBattle for 35.0s (1050 frames)...");

const steps = 4200;
const dt = 1 / 120;
let nseed = 6731;
const nrand = () => {
  nseed = (nseed * 1664525 + 1013904223) >>> 0;
  return nseed / 4294967296;
};

// Neon simulation
const R = 276;
const ballR = 4.2;
let nballs = [{ x: -58, y: -160, vx: 155, vy: 30 }];
const nframes = [];
const nevents = [];
const births = [0];

for (let k = 0; k <= steps; k++) {
  const t = k * dt;
  if (k % 4 === 0) nframes.push(nballs.map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]));
  if (t < 0.6) continue;

  const n = nballs.length;
  for (let i = 0; i < n; i++) {
    const p = nballs[i];
    p.vy += 170 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    let nx = 0,
      ny = 0,
      hit = false;
    if (p.y > -ballR) {
      p.y = -ballR;
      nx = 0;
      ny = 1;
      hit = p.vy > 0;
    }
    const r = Math.hypot(p.x, p.y);
    if (r > R - ballR) {
      nx = p.x / r;
      ny = p.y / r;
      p.x = nx * (R - ballR);
      p.y = ny * (R - ballR);
      hit = p.vx * nx + p.vy * ny > 0;
    }
    if (hit) {
      const dot = p.vx * nx + p.vy * ny;
      p.vx -= 2 * dot * nx;
      p.vy -= 2 * dot * ny;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed < 260) {
        p.vx *= 260 / Math.max(1, speed);
        p.vy *= 260 / Math.max(1, speed);
      }
      if (speed > 420) {
        p.vx *= 420 / speed;
        p.vy *= 420 / speed;
      }
      if (nballs.length < 900) {
        const a = (nrand() - 0.5) * 1.8;
        const sp = 250 + nrand() * 80;
        nballs.push({
          x: p.x - nx * 0.25,
          y: p.y - ny * 0.25,
          vx: sp * (-nx * Math.cos(a) - ny * Math.sin(a)),
          vy: sp * (-ny * Math.cos(a) + nx * Math.sin(a)),
        });
        births.push(t);
      }
      nevents.push({ t, id: i });
    }
  }
}

fs.writeFileSync(
  path.join(KINETIC_DATA_DIR, "neon-data.json"),
  JSON.stringify({ frames: nframes, births, events: nevents.filter((e, i) => i % Math.max(1, Math.floor(nevents.length / 1500)) === 0) })
);
console.log(`  ✓ neon-data.json: ${nframes.length} frames (35.0s)`);

// Duel / BuildBattle simulation
const bins = 72;
const layer = 10.5; // Thinner layer so it builds smoothly over 35s
const radius = 265;
const depth = Array(bins).fill(0);
const dbricks = [];
const duel = [];
const hits = [];
const score = [0, 0];
const dballs = [
  { x: -90, y: -35, vx: 510, vy: 260 },
  { x: 72, y: 45, vx: -375, vy: 470 },
];

for (let k = 0; k <= steps; k++) {
  const t = k * dt;
  if (k % 4 === 0) {
    duel.push({
      balls: dballs.map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]),
      score: [...score],
      brickCount: dbricks.length,
      fill: depth.reduce((sum, d) => sum + (radius * radius - (radius - d) ** 2), 0) / (bins * radius * radius),
    });
  }
  if (t < 0.6 || t >= 33.5) continue; // Run battle until 33.5s, then freeze 1.5s for final score

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
      const newR = radius - depth[b];
      const affected = [];
      for (let j = -3; j <= 3; j++) {
        const idx = (b + j + bins) % bins;
        const old = depth[idx];
        depth[idx] = Math.min(210, old + layer);
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

fs.writeFileSync(path.join(KINETIC_DATA_DIR, "duel-data.json"), JSON.stringify({ frames: duel, bricks: dbricks, events: hits }));
console.log(`  ✓ duel-data.json: ${duel.length} frames (35.0s)`);

// -------------------------------------------------------------
// 3. SYNTHESIZE AUDIO TRACKS (PYTHON)
// -------------------------------------------------------------
console.log("\n🔊 [3/4] Synthesizing matching 44.1kHz stereo audio tracks via Python...");

const pyAudioScript = `
import json, math, wave, array, sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path

data_dir = Path(r"${KINETIC_DATA_DIR.replace(/\\/g, "/")}")
sound_dir = Path(r"${SOUND_DIR.replace(/\\/g, "/")}")
sound_dir.mkdir(parents=True, exist_ok=True)

sr = 44100

# 1. Kinetic Five Audio
manifest = json.loads((data_dir / "five-manifest.json").read_text(encoding="utf-8"))
for m in manifest:
    d = json.loads((data_dir / f"{m['id']}.json").read_text(encoding="utf-8"))
    n = round(m['duration'] * sr)
    left = [0.0] * n
    right = [0.0] * n
    notes = {
        'heart': [523.25, 622.25, 783.99, 1046.5, 1244.5],
        'orbit': [440, 554.37, 659.25, 880, 1108.73],
        'rings': [392, 587.33],
        'square': [440, 659.25],
        'brick': [659.25, 783.99, 987.77, 1174.66, 1318.51]
    }[d['kind']]
    
    prev = -1
    tones = 0
    for e in d['events']:
        bucket = int(e['t'] * (32 if d['kind'] == 'brick' else 28))
        if bucket == prev:
            continue
        prev = bucket
        tones += 1
        freq = notes[e['id'] % len(notes)]
        start = round(e['t'] * sr)
        pan = 0.25 if e['id'] % 2 == 0 else 0.75
        for j in range(round(sr * 0.095)):
            if start + j >= n:
                break
            t = j / sr
            env = min(1.0, t / 0.002) * math.exp(-t * 42)
            tone = 0.14 * env * (math.sin(2 * math.pi * freq * t) + 0.2 * math.sin(2 * math.pi * 2 * freq * t) * math.exp(-t * 65))
            left[start + j] += tone * (1.0 - pan)
            right[start + j] += tone * pan

    # Ambient bed across entire duration
    for i in range(n):
        t = i / sr
        env = min(1.0, t / 2.0) * min(1.0, (n - i) / (sr * 1.5))
        bed = 0.009 * env * (math.sin(2 * math.pi * 130.8128 * t) + 0.4 * math.sin(2 * math.pi * 196.0 * t))
        left[i] += bed
        right[i] += bed

    # Celebration chime at completion
    end = d['finishFrame'] / 30.0
    for k, freq in enumerate([523.25, 659.25, 783.99, 1046.5]):
        start = round((end + k * 0.07) * sr)
        for j in range(round(sr * 1.4)):
            if start + j >= n:
                break
            t = j / sr
            v = 0.045 * min(1.0, t / 0.008) * math.exp(-t * 3.5) * math.sin(2 * math.pi * freq * t)
            left[start + j] += v
            right[start + j] += v

    peak = max(max(abs(x) for x in left), max(abs(x) for x in right))
    gain = min(2.6, 0.55 / max(peak, 1e-9))
    pcm = array.array('h')
    for l, r in zip(left, right):
        pcm.extend((int(32767 * max(-1.0, min(1.0, l * gain))), int(32767 * max(-1.0, min(1.0, r * gain)))))
    
    out_wav = sound_dir / f"{m['id']}-sound.wav"
    with wave.open(str(out_wav), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    print(f"  ✓ {m['id']}-sound.wav: {m['duration']:.1f}s ({tones} events)")

# 2. Neon and Duel 35s Audio
neon_d = json.loads((data_dir / "neon-data.json").read_text(encoding="utf-8"))
duel_d = json.loads((data_dir / "duel-data.json").read_text(encoding="utf-8"))

for name, events, end_sec in [('neon', neon_d['events'], 33.5), ('duel', duel_d['events'], 33.5)]:
    tot_sec = 35.0
    n = round(tot_sec * sr)
    out = [0.0] * n
    prev = -1
    tones = 0
    for e in events:
        bucket = int(e['t'] * (22 if name == 'neon' else 60))
        if bucket == prev:
            continue
        prev = bucket
        start = int(e['t'] * sr)
        freq = ([523.25, 659.25, 783.99, 1046.5, 880][e['id'] % 5] if name == 'neon' else (440.0 if e['id'] == 0 else 659.25))
        for j in range(int(sr * 0.065)):
            if start + j >= n:
                break
            t = j / sr
            env = min(1.0, t / 0.002) * math.exp(-t * 65)
            out[start + j] += 0.16 * env * (math.sin(2 * math.pi * freq * t) + 0.15 * math.sin(2 * math.pi * 2 * freq * t))
        tones += 1

    for freq in [523.25, 659.25, 783.99]:
        start = int(end_sec * sr)
        for j in range(int(sr * 1.0)):
            t = j / sr
            if start + j < n:
                out[start + j] += 0.055 * min(1.0, t / 0.02) * math.exp(-t * 5) * math.sin(2 * math.pi * freq * t)
    
    pcm = array.array('h', (int(32767 * math.tanh(x)) for x in out))
    out_wav = sound_dir / f"{name}-sound.wav"
    with wave.open(str(out_wav), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    print(f"  ✓ {name}-sound.wav: {tot_sec:.1f}s ({tones} events)")
`;

const pyScriptFile = path.join(ROOT, "scripts", "temp_synth_audio.py");
fs.writeFileSync(pyScriptFile, pyAudioScript);
execFileSync("python", [pyScriptFile], { stdio: "inherit", cwd: ROOT });
fs.unlinkSync(pyScriptFile);

console.log("\n✅ All datasets and audio tracks successfully upgraded to 30s-40s!");
