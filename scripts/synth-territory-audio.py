import json
import math
import os
import struct
import wave

SAMPLE_RATE = 44100

def create_synth():
    def tile_blip(freq):
        dur = 0.07
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 60)
            val = math.sin(2 * math.pi * freq * t) * env * 0.25
            samples.append(val)
        return samples

    def wall_thud():
        dur = 0.08
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 120 * math.exp(-t * 30)
            env = math.exp(-t * 40)
            val = math.sin(2 * math.pi * f * t) * env * 0.35
            samples.append(val)
        return samples

    def clash_sound():
        dur = 0.15
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 300 + 400 * math.exp(-t * 20)
            env = math.exp(-t * 20)
            val = (math.sin(2 * math.pi * f * t) + 0.4 * math.sin(2 * math.pi * f * 2.5 * t)) * env * 0.35
            samples.append(val)
        return samples

    def victory_fanfare(base_freq):
        dur = 4.5
        n = int(SAMPLE_RATE * dur)
        samples = [0.0] * n
        chords = [
            (0.0, base_freq),
            (0.18, base_freq * 1.25),
            (0.36, base_freq * 1.5),
            (0.54, base_freq * 2.0),
            (0.9, base_freq * 2.5),
        ]
        for start_t, freq in chords:
            start_i = int(start_t * SAMPLE_RATE)
            for j in range(int(1.5 * SAMPLE_RATE)):
                idx = start_i + j
                if idx < n:
                    t = j / SAMPLE_RATE
                    env = math.exp(-t * 2.0)
                    val = (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)) * env * 0.35
                    samples[idx] += val
        return samples

    return {
        "blip": tile_blip,
        "wall": wall_thud(),
        "clash": clash_sound(),
        "victory": victory_fanfare,
    }

synth = create_synth()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data", "territory")
OUT_DIR = os.path.join(ROOT, "public", "sounds", "territory")
os.makedirs(OUT_DIR, exist_ok=True)

manifest_path = os.path.join(DATA_DIR, "manifest.json")
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

for item in manifest:
    ep = item["episode"]
    data_path = os.path.join(DATA_DIR, f"ep${ep}.json".replace("$", ""))
    with open(data_path, "r", encoding="utf-8") as f:
        ep_data = json.load(f)

    total_duration = ep_data["duration"]
    total_samples = int(total_duration * SAMPLE_RATE) + int(0.5 * SAMPLE_RATE)
    audio_left = [0.0] * total_samples
    audio_right = [0.0] * total_samples

    # Subtle electronic beat / synth bass drone
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        audio_left[i] += 0.015 * math.sin(2 * math.pi * 65 * t)
        audio_right[i] += 0.015 * math.sin(2 * math.pi * 65.5 * t)

    for ev in ep_data["events"]:
        t_sec = ev["t"]
        ev_type = ev["type"]
        sample_idx = int(t_sec * SAMPLE_RATE)

        if ev_type == "tile":
            fid = ev.get("id", 0)
            freq = ep_data["factions"][fid]["baseFreq"]
            blip = synth["blip"](freq)
            pan = (fid + 1) / 5.0
            for j, s in enumerate(blip):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * (1 - pan)
                    audio_right[idx] += s * pan

        elif ev_type == "wall":
            w = synth["wall"]
            for j, s in enumerate(w):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.5
                    audio_right[idx] += s * 0.5

        elif ev_type == "clash":
            cl = synth["clash"]
            for j, s in enumerate(cl):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.6
                    audio_right[idx] += s * 0.6

        elif ev_type == "victory":
            fid = ev.get("id", 0)
            base_freq = ep_data["factions"][fid]["baseFreq"]
            vic = synth["victory"](base_freq)
            for j, s in enumerate(vic):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.75
                    audio_right[idx] += s * 0.75

    max_val = 0.001
    for i in range(total_samples):
        max_val = max(max_val, abs(audio_left[i]), abs(audio_right[i]))

    gain = 0.85 / max_val if max_val > 0.85 else 0.95
    out_path = os.path.join(OUT_DIR, f"territory-ep{ep}.wav")
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
    print(f"  [OK] Rendered: territory-ep{ep}.wav ({total_duration}s, gain: {gain:.2f})")

print("[SUCCESS] Territory Conquest audio synthesized successfully!")

