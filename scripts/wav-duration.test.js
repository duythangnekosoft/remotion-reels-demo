const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseWavDuration } = require('./wav-duration');

function chunk(id, data) {
  const result = Buffer.alloc(8 + data.length + data.length % 2);
  result.write(id);
  result.writeUInt32LE(data.length, 4);
  data.copy(result, 8);
  return result;
}

function wav(extra = []) {
  const fmt = Buffer.alloc(16);
  fmt.writeUInt16LE(1, 0);
  fmt.writeUInt16LE(1, 2);
  fmt.writeUInt32LE(8000, 4);
  fmt.writeUInt32LE(16000, 8);
  fmt.writeUInt16LE(2, 12);
  fmt.writeUInt16LE(16, 14);
  const body = Buffer.concat([Buffer.from('WAVE'), ...extra,
    chunk('fmt ', fmt), chunk('data', Buffer.alloc(16000))]);
  const header = Buffer.alloc(8);
  header.write('RIFF');
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

test('measures PCM audio including odd-length padded metadata chunks', () => {
  assert.equal(parseWavDuration(wav()), 1);
  assert.equal(parseWavDuration(wav([chunk('JUNK', Buffer.from('x'))])), 1);
});

test('rejects truncated data even when header claims a valid duration', () => {
  assert.throws(() => parseWavDuration(wav().subarray(0, 100)), /truncated/i);
});

test('rejects invalid signatures, short fmt and missing data', () => {
  const invalid = wav();
  invalid.write('NOPE');
  assert.throws(() => parseWavDuration(invalid), /RIFF/i);
  const shortFmt = wav();
  shortFmt.writeUInt32LE(2, 16);
  assert.throws(() => parseWavDuration(shortFmt), /fmt/i);
  const missing = wav().subarray(0, 36);
  missing.writeUInt32LE(28, 4);
  assert.throws(() => parseWavDuration(missing), /data/i);
});

test('rejects zero byte rate and incomplete sample frames', () => {
  const invalidRate = wav();
  invalidRate.writeUInt32LE(0, 28);
  assert.throws(() => parseWavDuration(invalidRate), /rate/i);
  const oddData = wav();
  oddData.writeUInt32LE(15999, 40);
  assert.throws(() => parseWavDuration(oddData), /sample/i);
});
