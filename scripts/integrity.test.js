const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'audioDurations.json'), 'utf8'));

function verify(options = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-'));
  const src = path.join(tmp, 'src');
  const dist = path.join(tmp, 'dist');
  fs.mkdirSync(path.join(src, 'data'), { recursive: true });
  fs.mkdirSync(path.join(dist, 'data'), { recursive: true });

  const metadataPath = path.join(src, 'data', 'audioDurations.json');
  fs.writeFileSync(metadataPath, JSON.stringify(options.data || metadata));

  const code = options.buildFails ? 'process.exit(1);' : 'fs.writeFileSync(process.argv[2], "ok");';
  const buildHook = path.join(tmp, 'build.js');
  fs.writeFileSync(buildHook, `const fs = require('fs');\n${code}`);

  const publicDir = path.join(tmp, 'public');
  if (!options.missingWav) {
    fs.cpSync(path.join(root, 'public'), publicDir, { recursive: true });
  }

  const verifier = path.join(root, 'scripts', 'verify-timelines.js');
  const env = {
    ...process.env,
    TEST_TMP: tmp,
    TEST_METADATA: metadataPath,
    TEST_BUILD: options.build ? buildHook : undefined,
  };

  const args = [verifier];
  if (!options.build) args.push('--no-build');

  const res = spawnSync(process.execPath, args, { cwd: tmp, env, encoding: 'utf8' });
  return { status: res.status, output: `${res.stdout}\n${res.stderr}`, compiled: fs.existsSync(path.join(dist, 'built.txt')) };
}

function loadTimeline(data) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'timeline-'));
  const dist = path.join(tmp, 'dist', 'data');
  const src = path.join(tmp, 'src', 'data');
  fs.mkdirSync(dist, { recursive: true });
  fs.mkdirSync(src, { recursive: true });
  fs.cpSync(path.join(root, 'dist'), path.join(tmp, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(src, 'audioDurations.json'), JSON.stringify(data));
  fs.writeFileSync(path.join(dist, 'audioDurations.json'), JSON.stringify(data));
  try {
    delete require.cache[require.resolve(path.join(dist, 'timelineUtils.js'))];
    delete require.cache[require.resolve(path.join(dist, 'audioDurations.json'))];
  } catch (e) {}
  return require(path.join(dist, 'timelineUtils.js'));
}

test('verifier succeeds against checked-in assets', () => {
  const result = verify();
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /DATA AND TIMELINES PASSED/);
});

test('verifier catches corrupt audioDurations and missing audio files', () => {
  const data = structuredClone(metadata);
  data.geography.ep1_q1 = Number((data.geography.ep1_q1 + 1.25).toFixed(3));
  const mismatch = verify({ data });
  assert.equal(mismatch.status, 1);
  assert.match(mismatch.output, /does not match/);
  assert.equal(verify({ missingWav: true }).status, 1);
});

test('timeline rejects missing, NaN, zero and negative metadata instead of guessing', () => {
  for (const value of [undefined, NaN, 0, -1]) {
    const data = structuredClone(metadata);
    data.geography.ep1_q1 = value;
    data.chat.ep1_m1 = value;
    const timeline = loadTimeline(data);
    assert.throws(() => timeline.getQuizTiming('geography', 1), /geography.*ep1_q1/);
    assert.throws(() => timeline.getChatDramaTiming(1), /chat.*ep1_m1/);
  }
});

test('verifier builds before reading dist and aborts when compilation fails', () => {
  assert.equal(verify({ build: true }).compiled, true);
  const result = verify({ build: true, buildFails: true });
  assert.equal(result.status, 1);
  assert.match(result.output, /compilation failed/);
});
