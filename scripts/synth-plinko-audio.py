import json
import math
import os
import struct
import wave

SAMPLE_RATE = 44100

def create_synth():
    def chime_ping(freq):
        dur = 0.12
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 45)
            val = (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2.05 * t)) * env * 0.28
            samples.append(val)
        return samples

    def bucket_coin():
        dur = 0.35
        n = int(SAMPLE_RATE * dur)
        samples = [0.0] * n
        # Double coin ping
        coins = [(0.0, 1500), (0.08, 2200)]
        for start_t, f in coins:
            si = int(start_t * SAMPLE_RATE)
            for j in range(int(0.2 * SAMPLE_RATE)):
                idx = si + j
                if idx < n:
                    t = j / SAMPLE_RATE
                    env = math.exp(-t * 25)
                    samples[idx] += math.sin(2 * math.pi * f * t) * env * 0.35
        return samples

    def jackpot_fanfare():
        dur = 5.0
        n = int(SAMPLE_RATE * dur)
        samples = [0.0] * n
        # Ascending arpeggio + fanfare
        fanfare_notes = [
            (0.0, 523.25),
            (0.15, 659.25),
            (0.30, 783.99),
            (0.45, 1046.50),
            (0.70, 1318.51),
            (1.0, 1567.98),
            (1.3, 2093.00),
        ]
        for start_t, freq in fanfare_notes:
            si = int(start_t * SAMPLE_RATE)
            for j in range(int(1.6 * SAMPLE_RATE)):
                idx = si + j
                if idx < n:
                    t = j / SAMPLE_RATE
                    env = math.exp(-t * 2.2)
                    samples[idx] += (math.sin(2 * math.pi * freq * t) + 0.25 * math.sin(2 * math.pi * freq * 2 * t)) * env * 0.35
        return samples

    return {
        "chime": chime_ping,
        "bucket": bucket_coin(),
        "jackpot": jackpot_fanfare(),
    }

synth = create_synth()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data", "plinko")
OUT_DIR = os.path.join(ROOT, "public", "sounds", "plinko")
os.makedirs(OUT_DIR, exist_ok=True)

manifest_path = os.path.join(DATA_DIR, "manifest.json")
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

for item in manifest:
    ep = item["episode"]
    data_path = os.path.join(DATA_DIR, f"ep{ep}.json")
    with open(data_path, "r", encoding="utf-8") as f:
        ep_data = json.load(f)

    total_duration = ep_data["duration"]
    total_samples = int(total_duration * SAMPLE_RATE) + int(0.5 * SAMPLE_RATE)
    audio_left = [0.0] * total_samples
    audio_right = [0.0] * total_samples

    # Subtle arcade ambiance
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        audio_left[i] += 0.01 * math.sin(2 * math.pi * 50 * t)
        audio_right[i] += 0.01 * math.sin(2 * math.pi * 50.5 * t)

    for ev in ep_data["events"]:
        t_sec = ev["t"]
        ev_type = ev["type"]
        sample_idx = int(t_sec * SAMPLE_RATE)

        if ev_type == "peg":
            freq = ev.get("freq", 1200)
            ping = synth["chime"](freq)
            pan = max(0.1, min(0.9, (ev.get("x", 540) - 100) / 880))
            for j, s in enumerate(ping):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * (1 - pan)
                    audio_right[idx] += s * pan

        elif ev_type == "bucket":
            b_sfx = synth["bucket"]
            b_idx = ev.get("bucketIdx", 5)
            pan = (b_idx + 0.5) / 11.0
            for j, s in enumerate(b_sfx):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * (1 - pan)
                    audio_right[idx] += s * pan

        elif ev_type == "jackpot_complete":
            jp = synth["jackpot"]
            for j, s in enumerate(jp):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.75
                    audio_right[idx] += s * 0.75

    max_val = 0.001
    for i in range(total_samples):
        max_val = max(max_val, abs(audio_left[i]), abs(audio_right[i]))

    gain = 0.85 / max_val if max_val > 0.85 else 0.95
    out_path = os.path.join(OUT_DIR, f"plinko-ep{ep}.wav")
    with wave.open(out_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for i in range(total_samples):
            l = int(max(-1.0, min(1.0, audio_left[i] * gain)) * 32767)
            r = int(max(-1.0, min(1.0, audio_right[i] * gain)) * 32767)
            frames.extend(struct.pack("<hh", l, r))
        wf.writeframes(frames)
    print(f"  [OK] Rendered: plinko-ep{ep}.wav ({total_duration}s, gain: {gain:.2f})")

print("[SUCCESS] Plinko Fortune Drop audio synthesized successfully!")

