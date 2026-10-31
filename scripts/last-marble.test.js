const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { readWavDuration } = require("./wav-duration");

const ROOT = path.join(__dirname, "..");
const SIM_PATH = path.join(ROOT, "src", "data", "lastMarble", "simulation.json");

test("Last Marble: simulation manifest and parameters conform to specifications", () => {
  assert.ok(fs.existsSync(SIM_PATH), "simulation.json must exist");
  const sim = JSON.parse(fs.readFileSync(SIM_PATH, "utf8"));
  const m = sim.manifest;

  assert.strictEqual(m.fps, 30, "FPS must be 30");
  assert.strictEqual(m.width, 1080, "Width must be 1080");
  assert.strictEqual(m.height, 1920, "Height must be 1920");
  assert.strictEqual(m.totalFrames, 1260, "Duration must be 1260 frames (42.0s)");
  assert.strictEqual(sim.frames.length, 1260, "Must have exactly 1260 frames precomputed");

  // Bell hit check
  assert.ok(m.bellHitFrame > 0 && m.bellHitFrame < m.totalFrames, "Bell must be struck before end");
  const holdFrames = m.totalFrames - m.bellHitFrame;
  assert.ok(holdFrames >= 90, `Must hold at least 3.0s (90 frames) after bell strike; got ${holdFrames} frames`);
});

test("Last Marble: trajectory is continuous, realistic and within safe boundaries", () => {
  const sim = JSON.parse(fs.readFileSync(SIM_PATH, "utf8"));
  let maxStep = 0;

  for (let i = 0; i < sim.frames.length; i++) {
    const f = sim.frames[i];
    assert.ok(Number.isFinite(f.x), `Frame ${i}: x must be finite`);
    assert.ok(Number.isFinite(f.y), `Frame ${i}: y must be finite`);
    assert.ok(Number.isFinite(f.vx), `Frame ${i}: vx must be finite`);
    assert.ok(Number.isFinite(f.vy), `Frame ${i}: vy must be finite`);
    assert.ok(Number.isFinite(f.rot), `Frame ${i}: rot must be finite`);

    // Safe margins
    assert.ok(f.x >= 100 && f.x <= 980, `Frame ${i}: x (${f.x}) out of safe bounds [100, 980]`);
    assert.ok(f.y >= 140 && f.y <= 1720, `Frame ${i}: y (${f.y}) out of safe bounds [140, 1720]`);

    if (i > 0) {
      const prev = sim.frames[i - 1];
      const step = Math.hypot(f.x - prev.x, f.y - prev.y);
      if (step > maxStep) maxStep = step;
    }
  }

  // Max step must be smooth (no teleportation, < 25px per frame @ 30fps)
  assert.ok(maxStep < 25, `Step between frames must be smooth (<25px); got max ${maxStep.toFixed(2)}px`);
});

test("Last Marble: audio events are valid, in-sync and complete within video duration", () => {
  const sim = JSON.parse(fs.readFileSync(SIM_PATH, "utf8"));
  assert.ok(sim.audioEvents.length >= 10, "Must have rich mechanical sound events");

  for (const ae of sim.audioEvents) {
    const fullAudioPath = path.join(ROOT, "public", ae.sound);
    assert.ok(fs.existsSync(fullAudioPath), `Audio file must exist: ${ae.sound}`);

    const durationSec = readWavDuration(fullAudioPath);
    assert.ok(Number.isFinite(durationSec) && durationSec > 0, "WAV duration must be valid positive number");

    const audioFrames = Math.ceil(durationSec * 30);
    const endFrame = ae.frame + audioFrames;
    assert.ok(
      endFrame <= sim.manifest.totalFrames,
      `Audio ${ae.sound} started at frame ${ae.frame} with length ${audioFrames}f exceeds video duration ${sim.manifest.totalFrames}f`
    );
  }
});
