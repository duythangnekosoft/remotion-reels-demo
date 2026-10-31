
import json, math, wave, array, sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path

data_dir = Path(r"C:/Users/Gigabyte/.gemini/antigravity/scratch/remotion-reels-demo/src/data/kinetic")
sound_dir = Path(r"C:/Users/Gigabyte/.gemini/antigravity/scratch/remotion-reels-demo/public/sounds/kinetic")
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
