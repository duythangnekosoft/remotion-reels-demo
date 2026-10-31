const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function run(file, { preflightFails = false, renderFails = false, stillFails = false,
  args = ['--topic=chat', '--ep=1'] } = {}) {
  let status = 0, preflights = 0;
  const commands = [], logs = [];
  const stop = {};
  try {
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
      __dirname,
      require: (id) => {
        if (id === 'fs') return { existsSync: () => true, statSync: () => ({ size: 100 }) };
        if (id === 'child_process') return {
          execFileSync: () => { preflights++; if (preflightFails) throw Error('bad audio'); },
          execSync: (command) => {
            commands.push(command);
            if ((renderFails && command.includes('remotion render ')) ||
                (stillFails && command.includes('remotion still '))) throw Error('render failed');
          },
        };
        return require(id);
      },
      process: { execPath: process.execPath, argv: ['node', file, ...args],
        exit: (code) => { status = code; throw stop; } },
      console: { log: (...items) => logs.push(items.join(' ')), error: () => {} },
    });
  } catch (error) { if (error !== stop) throw error; }
  return { status, preflights, commands, output: logs.join('\n') };
}

for (const script of ['render-fleet.js', 'render-all.js']) {
  test(`${script}: preflight failure starts no render commands`, () => {
    const result = run(script, { preflightFails: true });
    assert.equal(result.status, 1);
    assert.equal(result.commands.length, 0);
  });
  test(`${script}: MP4 and thumbnail failures return nonzero status`, () => {
    for (const failure of [{ renderFails: true }, { stillFails: true }]) {
      const result = run(script, failure);
      assert.equal(result.status, 1);
      assert.match(result.output, /failed/);
    }
    const success = run(script);
    assert.equal(success.status, 0);
    assert.equal(success.preflights, 1);
    assert.ok(success.commands.length > 0);
  });
}

test('fleet rejects invalid episode numbers before rendering', () => {
  for (const ep of ['', '0', '11', '-1', '1.5', '2abc']) {
    const result = run('render-fleet.js', { args: ['--topic=chat', `--ep=${ep}`] });
    assert.equal(result.status, 1);
    assert.equal(result.commands.length, 0);
    assert.equal(result.preflights, 0);
  }
});
