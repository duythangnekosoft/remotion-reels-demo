const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');
const { createRequire } = require('module');
const { readWavDuration } = require('./wav-duration');
const verifierPath = path.join(__dirname, 'verify-timelines.js');
const realRequire = createRequire(verifierPath);
const metadata = require('../src/data/audioDurations.json');

function loadTimeline(data) {
  const filename = path.join(__dirname, '../src/data/timelineUtils.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (id) => id === './audioDurations.json'
    ? data : realRequire('../dist/data/chatDramaEpisodes') }, { filename });
  return exports;
}

// Run the real verifier with faults injected in memory; never modify source or WAVs.
function verify({ data = structuredClone(metadata), missingWav = false,
  singularityFault = false, build = false, buildFails = false } = {}) {
  const timeline = loadTimeline(data);
  const messages = [];
  let status, compiled = false;
  const stop = {};
  const fakeFs = { ...fs, readFileSync: (filename, ...args) => {
    const contents = fs.readFileSync(filename, ...args);
    if (!singularityFault || !String(filename).endsWith('singularity' + path.sep + 'ep1.json')) return contents;
    const episode = JSON.parse(contents);
    episode.destroyedAtFrame[0] = -1;
    return JSON.stringify(episode);
  }};
  try {
    vm.runInNewContext(fs.readFileSync(verifierPath, 'utf8'), {
      __dirname,
      require: Object.assign((id) => {
        if (id === 'fs') return fakeFs;
        if (id === 'child_process') return { execFileSync: () => {
          if (buildFails) throw Error('simulated TypeScript error');
          compiled = true;
        }};
        if (build && id.includes('../dist/')) assert.equal(compiled, true);
        if (id === './wav-duration') return { readWavDuration: (filename) => {
          if (missingWav && String(filename).endsWith('ep1_q1.wav')) throw Error('missing WAV fixture');
          return readWavDuration(filename);
        }};
        if (id === '../src/data/audioDurations.json') return data;
        if (id === '../dist/data/timelineUtils') return timeline;
        return realRequire(id);
      }, { resolve: realRequire.resolve }),
      process: { execPath: process.execPath, argv: build ? ['node', verifierPath] : ['node', verifierPath, '--no-build'],
        exit: (code) => { status = code; throw stop; } },
      console: { log: (...items) => messages.push(items.join(' ')),
        error: (...items) => messages.push(items.join(' ')) },
    }, { filename: verifierPath });
  } catch (error) { if (error !== stop) throw error; }
  return { status, compiled, output: messages.join('\n') };
}

test('real verifier accepts 60 episodes and rejects changed metadata or missing WAV', () => {
  assert.equal(verify().status, 0);
  const data = structuredClone(metadata);
  data.geography.ep1_q1 += 2;
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

test('real verifier rejects an undestroyed node despite success manifest', () => {
  const result = verify({ singularityFault: true });
  assert.equal(result.status, 1);
  assert.match(result.output, /destroyedAtFrame/);
});

test('verifier builds before reading dist and aborts when compilation fails', () => {
  assert.equal(verify({ build: true }).compiled, true);
  const result = verify({ build: true, buildFails: true });
  assert.equal(result.status, 1);
  assert.match(result.output, /compilation failed/);
});
