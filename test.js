import { build, iter, parse } from './index.js';
import test from 'node:test';
import * as assert from 'node:assert';

test('basic', t => {
  const b = `a,b,c\n"f"oo","bar""?",zin""g\n"what""""x"`;
  const out = parse(b);

  assert.deepStrictEqual(out, [
    ['a', 'b', 'c'],
    ['f"oo', 'bar"?', 'zin""g'],
    ['what""x'],
  ]);
});


test('quote forever', t => {
  const b = `"hello tehre lol,what\nzing`;
  const out = parse(b);

  assert.deepStrictEqual(out, [
    ['hello tehre lol,what\nzing'],
  ]);
});

test('check newline use', t => {
  const out = parse(`"hello
there",123
456`);

assert.deepStrictEqual(out, [
    ['hello\nthere', '123'],
    ['456'],
  ]);

});

test('newline behavior', t => {
  const b = `\n`;
  const out = parse(b);

  assert.deepStrictEqual(out, [
    [],
    [],
  ]);
});

test('enc', t => {
  assert.strictEqual(build([['1', '2', '3']]), '1,2,3');
  assert.strictEqual(build([['1,', '2\n', '3']]), '"1,","2\n",3');

  assert.strictEqual(build([[1,2,3.25]]), '1,2,3.25');

  const x = { toString() { return 'but,t'; }};
  assert.strictEqual(build([[x, {}]]), '"but,t",[object Object]');
});

test('string', t => {
  for (const row of iter('hello')) {
    assert.deepStrictEqual(row, ['hello']);
  }

  const outAll = [...iter('hello\nthere')];
  assert.deepStrictEqual(outAll, [['hello'], ['there']]);
});
