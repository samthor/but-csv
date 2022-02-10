import test from 'ava';
import { parse } from './index.js';

test('basic', t => {
  const b = Buffer.from(`a,b,c\n"f"oo","bar""?",zin""g\n"what""""x"`);
  const out = parse(b);

  t.deepEqual(out, [
    ['a', 'b', 'c'],
    ['f"oo', 'bar"?', 'zin""g'],
    ['what""x'],
  ]);
});


test('quote forever', t => {
  const b = Buffer.from(`"hello tehre lol,what\nzing`);
  const out = parse(b);

  t.deepEqual(out, [
    ['hello tehre lol,what\nzing'],
  ]);
});

test('newline behavior', t => {
  const b = Buffer.from(`\n`);
  const out = parse(b);

  t.deepEqual(out, [
    [],
    [],
  ]);
});
