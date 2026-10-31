import json
import math
import os
import struct
import wave

SAMPLE_RATE = 44100

def create_synth():
    def sine_wave(freq, duration, volume=0.3):
        n_samples = int(SAMPLE_RATE * duration)
        samples = []
        for i in range(n_samples):
            t = i / SAMPLE_RATE
            env = math.exp(-i / (SAMPLE_RATE * duration * 0.4))
            val = math.sin(2 * math.pi * freq * t) * env * volume
            samples.append(val)
        return samples

    def bumper_sound():
        dur = 0.22
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 350 + 200 * math.sin(2 * math.pi * 18 * t) * math.exp(-t * 12)
            env = math.exp(-t * 14)
            val = math.sin(2 * math.pi * f * t) * env * 0.4
            samples.append(val)
        return samples

    def clink_sound():
        dur = 0.08
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 60)
            val = (math.sin(2 * math.pi * 1800 * t) * 0.6 + math.sin(2 * math.pi * 3200 * t) * 0.4) * env * 0.25
            samples.append(val)
        return samples

    def peg_sound():
        dur = 0.06
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 70)
            val = math.sin(2 * math.pi * 1200 * t) * env * 0.2
            samples.append(val)
        return samples

    def wall_sound():
        dur = 0.05
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 90)
            val = math.sin(2 * math.pi * 280 * t) * env * 0.2
            samples.append(val)
        return samples

    def boost_sound():
        dur = 0.4
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 200 + 1200 * (t / dur)
            env = math.sin(math.pi * (t / dur))
            val = math.sin(2 * math.pi * f * t) * env * 0.35
            samples.append(val)
        return samples

    def horn_sound():
        dur = 0.6
        n = int(SAMPLE_RATE * dur)
        samples = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 4) if t > 0.1 else (t / 0.1)
            val = (math.sin(2 * math.pi * 440 * t) + 0.5 * math.sin(2 * math.pi * 880 * t)) * env * 0.4
            samples.append(val)
        return samples

    def celebration_fanfare():
        dur = 4.0
        n = int(SAMPLE_RATE * dur)
        samples = [0.0] * n
        # Chords: C major arpeggio fanfare (523, 659, 784, 1046 Hz)
        notes = [(0.0, 523.25), (0.2, 659.25), (0.4, 783.99), (0.6, 1046.50), (1.1, 1318.51)]
        for start_t, freq in notes:
            start_i = int(start_t * SAMPLE_RATE)
            for j in range(int(1.2 * SAMPLE_RATE)):
                idx = start_i + j
                if idx < n:
                    t = j / SAMPLE_RATE
                    env = math.exp(-t * 2.5)
                    val = (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)) * env * 0.3
                    samples[idx] += val
        return samples

    return {
        "bumper": bumper_sound(),
        "clink": clink_sound(),
        "peg": peg_sound(),
        "wall": wall_sound(),
        "boost": boost_sound(),
        "finish": horn_sound(),
        "fanfare": celebration_fanfare()
    }

synth = create_synth()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data", "marbleRace")
OUT_DIR = os.path.join(ROOT, "public", "sounds", "marbleRace")
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

    # Subtle ambient engine / rolling track rumble
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        audio_left[i] += 0.012 * math.sin(2 * math.pi * 55 * t)
        audio_right[i] += 0.012 * math.sin(2 * math.pi * 56 * t)

    # Process events
    for ev in ep_data["events"]:
        t_sec = ev["t"]
        ev_type = ev["type"]
        sample_idx = int(t_sec * SAMPLE_RATE)

        # Pan based on X if present
        pan = 0.5
        if "x" in ev:
            pan = max(0.1, min(0.9, (ev["x"] - 160) / 760))
        left_gain = math.cos(pan * math.pi / 2)
        right_gain = math.sin(pan * math.pi / 2)

        sfx = synth.get(ev_type)
        if sfx:
            for j, s in enumerate(sfx):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * left_gain
                    audio_right[idx] += s * right_gain

        if ev_type == "finish" and ev.get("rank") == 1:
            # Play celebration fanfare
            fanfare = synth["fanfare"]
            for j, s in enumerate(fanfare):
                idx = sample_idx + j
                if idx < total_samples:
                    audio_left[idx] += s * 0.7
                    audio_right[idx] += s * 0.7

    # Normalize & export WAV
    max_val = 0.001
    for i in range(total_samples):
        max_val = max(max_val, abs(audio_left[i]), abs(audio_right[i]))

    gain = 0.85 / max_val if max_val > 0.85 else 0.95
    out_path = os.path.join(OUT_DIR, f"marble-race-ep{ep}.wav")
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
    print(f"  [OK] Rendered audio: marble-race-ep{ep}.wav ({total_duration}s, gain: {gain:.2f})")

print("[SUCCESS] Marble Race audio synthesized successfully!")
