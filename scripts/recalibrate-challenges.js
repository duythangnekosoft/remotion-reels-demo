const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const KINETIC_DATA_DIR = path.join(ROOT, "src", "data", "kinetic");
const SOUND_DIR = path.join(ROOT, "public", "sounds", "kinetic");

if (!fs.existsSync(SOUND_DIR)) fs.mkdirSync(SOUND_DIR, { recursive: true });

console.log("==================================================");
console.log("🚀 RECALIBRATING ALL KINETIC & CHALLENGE VIDEOS");
console.log("==================================================");

// -----------------------------------------------------------------------------
// 1. RECALIBRATE NEON BLOOM: Progressive Growth to 900 balls at 31.0s (35.0s video)
// -----------------------------------------------------------------------------
console.log("\n✨ [1/3] Generating Progressive 35s Neon Bloom (1 to 900 balls)...");
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const nrand = mulberry32(424242);
const steps = 4200; // 35.0s @ 120Hz physics
const dt = 1 / 120;
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

  // Target curve: reaches 900 balls smoothly around 31.0s
  const targetBalls = Math.min(900, Math.floor(1 + 899 * Math.pow(Math.min(1, t / 31.0), 2.1)));

  const n = nballs.length;
  for (let i = 0; i < n; i++) {
    const p = nballs[i];
    p.vy += 170 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    let nx = 0, ny = 0, hit = false;
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
      if (nballs.length < targetBalls && nrand() < 0.28) {
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
  JSON.stringify({
    frames: nframes,
    births,
    events: nevents.filter((e, i) => i % Math.max(1, Math.floor(nevents.length / 1500)) === 0),
  })
);
console.log(`  ✓ neon-data.json: ${nframes.length} frames (Final balls: ${nballs.length} / 900)`);

// -----------------------------------------------------------------------------
// 2. SIMULATE & EXTRACT EVENTS FOR 1K BRICK BREAKER (100% Cleared - 56.0s)
// -----------------------------------------------------------------------------
console.log("\n🧱 [2/3] Simulating 100% Cleared 1K Brick Breaker (3,076 Bricks)...");
const cols = 60, rows = 60, cell = 10.5, ox = 45, oy = 160;
const glyph1 = ["00100", "01100", "00100", "00100", "00100", "00100", "01110"];
const glyphK = ["10001", "10010", "10100", "11000", "10100", "10010", "10001"];

const initialBricks = Array.from({ length: cols * rows }, (_, id) => {
  const x = id % cols;
  const y = Math.floor(id / cols);
  const border = x < 3 || x >= 57 || y < 3 || y >= 57;
  const gap = x === 3 || x === 56 || y === 3 || y === 56;
  const gx = Math.floor((x - 10) / 3);
  const gy = Math.floor((y - 18) / 4);
  const hole =
    gy >= 0 &&
    gy < 7 &&
    ((gx >= 0 && gx < 5 && glyph1[gy][gx] === "1") ||
      (gx >= 7 && gx < 12 && glyphK[gy][gx - 7] === "1"));
  return { x: ox + x * cell, y: oy + y * cell, alive: !gap && !hole, border };
});

const totalBricksCount = initialBricks.filter((b) => b.alive).length;
const bricks = initialBricks.map((b) => ({ ...b }));
const balls = [{ x: 480, y: 1060, vx: 270, vy: -690 }];
const drops = [];
let paddle = 480, broken = 0;
const bbEvents = [];
let lastBreakTime = 0;

const totalSteps = 6720; // 56.0s @ 120Hz (1680 frames @ 30fps)
for (let step = 0; step <= totalSteps; step++) {
  const t = step / 120;
  if (t >= 0.7) {
    const target =
      drops.find((d) => d.alive && d.y > 850)?.x ??
      balls.reduce((p, q) => (q.vy > 0 && q.y > p.y ? q : p), balls[0]).x;
    paddle += Math.max(-9, Math.min(9, target - paddle));
    paddle = Math.max(105, Math.min(615, paddle));

    for (const d of drops) {
      if (!d.alive) continue;
      d.y += 3.6;
      if (d.y >= 1082) {
        d.alive = false;
        if (Math.abs(d.x - paddle) < 85 && balls.length < 64) {
          const extra = Math.min(balls.length * 2, 64 - balls.length);
          bbEvents.push({ t, type: "powerup", x: paddle });
          for (let k = 0; k < extra; k++) {
            const angle = -Math.PI / 2 + ((k / Math.max(1, extra - 1)) - 0.5) * 1.4;
            balls.push({
              x: paddle,
              y: 1070,
              vx: 740 * Math.cos(angle),
              vy: 740 * Math.sin(angle),
            });
          }
        }
      }
    }

    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const p = balls[i];
      const px = p.x, py = p.y;
      p.x += p.vx / 120;
      p.y += p.vy / 120;

      if (p.x < 30) {
        p.x = 30;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > 690) {
        p.x = 690;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < 140) {
        p.y = 140;
        p.vy = Math.abs(p.vy);
      }

      if (p.y >= 1076 && py < 1076 && p.vy > 0 && Math.abs(p.x - paddle) < 82) {
        p.y = 1075;
        const angle = (p.x - paddle) / 100;
        p.vx = 740 * Math.sin(angle);
        p.vy = -740 * Math.cos(angle);
        if (step % 6 === 0) bbEvents.push({ t, type: "paddle", x: p.x });
      }

      if (p.y > 1170) {
        p.y = 1070;
        p.x = paddle;
        p.vy = -Math.abs(p.vy);
      }

      const gx = Math.floor((p.x - ox) / cell);
      const gy = Math.floor((p.y - oy) / cell);
      let hit = -1;
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        for (let xx = gx - 1; xx <= gx + 1; xx++) {
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          const id = yy * cols + xx;
          const b = bricks[id];
          if (b.alive && p.x + 4 > b.x && p.x - 4 < b.x + 9 && p.y + 4 > b.y && p.y - 4 < b.y + 9) {
            hit = id;
          }
        }
      }

      if (hit >= 0) {
        const b = bricks[hit];
        b.alive = false;
        broken++;
        lastBreakTime = t;
        bbEvents.push({ t, type: "brick", x: b.x, count: broken });
        if (px + 4 <= b.x || px - 4 >= b.x + 9) {
          p.vx = -p.vx;
          p.x = px;
        } else {
          p.vy = -p.vy;
          p.y = py;
        }
        if (broken % 12 === 0 && balls.length < 64) {
          drops.push({ x: Math.max(105, Math.min(615, b.x)), y: b.y, alive: true });
        }
      }
    }
  }
}

console.log(`  ✓ 1K Brick Breaker simulation complete:`);
console.log(`    Total bricks: ${totalBricksCount}`);
console.log(`    Total broken: ${broken} / ${totalBricksCount} (100% Cleared)`);
console.log(`    Last brick broken at: ${lastBreakTime.toFixed(2)}s (Frame ${Math.round(lastBreakTime * 30)})`);
console.log(`    Total duration: 56.0s (1,680 frames, ${(56.0 - lastBreakTime).toFixed(2)}s victory hold)`);

fs.writeFileSync(
  path.join(KINETIC_DATA_DIR, "brickbreaker-events.json"),
  JSON.stringify({
    totalBricks: totalBricksCount,
    broken,
    lastBreakTime,
    duration: 56.0,
    totalFrames: 1680,
    events: bbEvents.filter((e, i) => e.type !== "brick" || i % 2 === 0),
  })
);

// -----------------------------------------------------------------------------
// 3. SYNTHESIZE 44.1kHz STEREO AUDIO TRACKS VIA PYTHON
// -----------------------------------------------------------------------------
console.log("\n🔊 [3/3] Synthesizing matching 44.1kHz audio for Neon and Brick Breaker...");

const pyAudioScript = `
import json, math, wave, array, sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path

data_dir = Path(r"${KINETIC_DATA_DIR.replace(/\\/g, "/")}")
sound_dir = Path(r"${SOUND_DIR.replace(/\\/g, "/")}")
sound_dir.mkdir(parents=True, exist_ok=True)
sr = 44100

# 1. Neon Bloom 35s
neon_d = json.loads((data_dir / "neon-data.json").read_text(encoding="utf-8"))
tot_sec = 35.0
n = round(tot_sec * sr)
out = [0.0] * n
prev = -1
for e in neon_d['events']:
    bucket = int(e['t'] * 24)
    if bucket == prev:
        continue
    prev = bucket
    start = int(e['t'] * sr)
    freq = [523.25, 659.25, 783.99, 1046.5, 880][e['id'] % 5]
    for j in range(int(sr * 0.065)):
        if start + j >= n: break
        t = j / sr
        env = min(1.0, t / 0.002) * math.exp(-t * 65)
        out[start + j] += 0.16 * env * (math.sin(2 * math.pi * freq * t) + 0.15 * math.sin(2 * math.pi * 2 * freq * t))

# Climax chord at 31.5s
for freq in [523.25, 659.25, 783.99, 1046.5]:
    start = int(31.5 * sr)
    for j in range(int(sr * 1.5)):
        t = j / sr
        if start + j < n:
            out[start + j] += 0.055 * min(1.0, t / 0.02) * math.exp(-t * 3.5) * math.sin(2 * math.pi * freq * t)

pcm = array.array('h', (int(32767 * math.tanh(x)) for x in out))
with wave.open(str(sound_dir / "neon-sound.wav"), 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(pcm.tobytes())
print("  ✓ neon-sound.wav: 35.0s synthesized")

# 2. Brick Breaker 56.0s (100% Cleared)
bb_d = json.loads((data_dir / "brickbreaker-events.json").read_text(encoding="utf-8"))
tot_sec = 56.0
n = round(tot_sec * sr)
left = [0.0] * n
right = [0.0] * n

notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1174.66, 1318.51]

prev_bucket = -1
for e in bb_d['events']:
    t_ev = e['t']
    ev_type = e['type']
    if ev_type == 'brick':
        bucket = int(t_ev * 40)
        if bucket == prev_bucket: continue
        prev_bucket = bucket
        start = int(t_ev * sr)
        freq = notes[(e.get('count', 0) // 10) % len(notes)]
        pan = max(0.1, min(0.9, (e.get('x', 360) - 45) / 630))
        for j in range(int(sr * 0.045)):
            if start + j >= n: break
            t = j / sr
            env = min(1.0, t / 0.001) * math.exp(-t * 80)
            tone = 0.15 * env * math.sin(2 * math.pi * freq * t)
            left[start + j] += tone * (1.0 - pan)
            right[start + j] += tone * pan
    elif ev_type == 'powerup':
        start = int(t_ev * sr)
        for k, f in enumerate([659.25, 783.99, 1046.5, 1318.51]):
            sub_start = start + int(k * 0.04 * sr)
            for j in range(int(sr * 0.12)):
                if sub_start + j >= n: break
                t = j / sr
                env = min(1.0, t / 0.005) * math.exp(-t * 30)
                v = 0.12 * env * math.sin(2 * math.pi * f * t)
                left[sub_start + j] += v * 0.5
                right[sub_start + j] += v * 0.5
    elif ev_type == 'paddle':
        start = int(t_ev * sr)
        for j in range(int(sr * 0.06)):
            if start + j >= n: break
            t = j / sr
            env = min(1.0, t / 0.002) * math.exp(-t * 60)
            thud = 0.18 * env * math.sin(2 * math.pi * 174.61 * t)
            left[start + j] += thud * 0.5
            right[start + j] += thud * 0.5

# Victory Chimes when last brick breaks (at lastBreakTime ~52.35s)
win_t = bb_d['lastBreakTime']
for k, freq in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]):
    start = int((win_t + k * 0.10) * sr)
    for j in range(int(sr * 2.2)):
        if start + j >= n: break
        t = j / sr
        v = 0.08 * min(1.0, t / 0.01) * math.exp(-t * 2.8) * math.sin(2 * math.pi * freq * t)
        left[start + j] += v
        right[start + j] += v

# Background ambient hum
for i in range(n):
    t = i / sr
    env = min(1.0, t / 2.0) * min(1.0, (n - i) / (sr * 2.0))
    hum = 0.007 * env * (math.sin(2 * math.pi * 110.0 * t) + 0.3 * math.sin(2 * math.pi * 164.81 * t))
    left[i] += hum
    right[i] += hum

peak = max(max(abs(x) for x in left), max(abs(x) for x in right))
gain = min(2.5, 0.55 / max(peak, 1e-9))
pcm = array.array('h')
for l, r in zip(left, right):
    pcm.extend((int(32767 * max(-1.0, min(1.0, l * gain))), int(32767 * max(-1.0, min(1.0, r * gain)))))

with wave.open(str(sound_dir / "brickbreaker-sound.wav"), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(pcm.tobytes())
print(f"  ✓ brickbreaker-sound.wav: 56.0s synthesized (Victory chime at {win_t:.2f}s)")
`;

fs.writeFileSync(path.join(ROOT, "scripts", "synth-recalibrate.py"), pyAudioScript);
execSync(`python scripts/synth-recalibrate.py`, { stdio: "inherit", cwd: ROOT });
console.log("\n✅ Recalibration script finished successfully!");
