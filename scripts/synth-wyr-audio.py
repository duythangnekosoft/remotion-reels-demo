import json
import math
import os
import struct
import wave

SAMPLE_RATE = 44100

def create_synth():
    def clock_tick(count):
        dur = 0.08
        n = int(SAMPLE_RATE * dur)
        samples = []
        # Count 5 to 1: pitch goes from 1000Hz up to 1800Hz
        freq = 1000 + (5 - count) * 200
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 70)
            val = math.sin(2 * math.pi * freq * t) * env * 0.4
            samples.append(val)
        return samples

    def reveal_impact():
        dur = 2.0
        n = int(SAMPLE_RATE * dur)
        samples = [0.0] * n
        # Heavy sub bass drop
        for i in range(int(1.2 * SAMPLE_RATE)):
            t = i / SAMPLE_RATE
            f = 120 * math.exp(-t * 3.0)
            env = math.exp(-t * 2.5)
            samples[i] += math.sin(2 * math.pi * f * t) * env * 0.7

        # Triumphant chord: E major (659.25, 830.61, 987.77, 1318.51)
        for chord_freq in [659.25, 830.61, 987.77, 1318.51]:
            for i in range(int(1.5 * SAMPLE_RATE)):
                t = i / SAMPLE_RATE
                env = math.exp(-t * 3.0)
                samples[i] += (math.sin(2 * math.pi * chord_freq * t) * 0.25) * env

        return samples

    return {
        "tick": clock_tick,
        "reveal": reveal_impact(),
    }

synth = create_synth()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data", "wouldYouRather")
OUT_DIR = os.path.join(ROOT, "public", "sounds", "wouldYouRather")
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

    # Tension beat (heartbeat / pulse every 0.5s)
    beat_interval = int(0.5 * SAMPLE_RATE)
    for b in range(0, total_samples, beat_interval):
        for j in range(int(0.12 * SAMPLE_RATE)):
            idx = b + j
            if idx < total_samples:
                t = j / SAMPLE_RATE
                env = math.exp(-t * 35)
                val = math.sin(2 * math.pi * 75 * t) * env * 0.15
                audio_left[idx] += val
                audio_right[idx] += val

    for ev in ep_data["events"]:
        t_sec = ev["t"]
        ev_type = ev["type"]
        sample_idx = int(t_sec * SAMPLE_RATE)

        if ev_type == "tick":
            c = ev.get("count", 3)
            sfx = synth["tick"](c)
            for j, s in enumerate(sfx):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.6
                    audio_right[idx] += s * 0.6

        elif ev_type == "reveal":
            sfx = synth["reveal"]
            for j, s in enumerate(sfx):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.7
                    audio_right[idx] += s * 0.7

    max_val = 0.001
    for i in range(total_samples):
        max_val = max(max_val, abs(audio_left[i]), abs(audio_right[i]))

    gain = 0.85 / max_val if max_val > 0.85 else 0.95
    out_path = os.path.join(OUT_DIR, f"wyr-ep{ep}.wav")
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
    print(f"  [OK] Rendered: wyr-ep{ep}.wav ({total_duration}s, gain: {gain:.2f})")

print("[SUCCESS] Would You Rather audio synthesized successfully!")

