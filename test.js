import test from 'ava';
import { build, iter, parse } from './index.js';

test('basic', t => {
  const b = `a,b,c\n"f"oo","bar""?",zin""g\n"what""""x"`;
  const out = parse(b);

  t.deepEqual(out, [
    ['a', 'b', 'c'],
    ['f"oo', 'bar"?', 'zin""g'],
    ['what""x'],
  ]);
});


test('quote forever', t => {
  const b = `"hello tehre lol,what\nzing`;
  const out = parse(b);

  t.deepEqual(out, [
    ['hello tehre lol,what\nzing'],
  ]);
});

test('newline behavior', t => {
  const b = `\n`;
  const out = parse(b);

  t.deepEqual(out, [
    [],
    [],
  ]);
});

test('enc', t => {
  t.is(build([['1', '2', '3']]), '1,2,3');
  t.is(build([['1,', '2\n', '3']]), '"1,","2\n",3');
});

test('string', t => {
  for (const row of iter('hello')) {
    t.deepEqual(row, ['hello']);
  }

  const outAll = [...iter('hello\nthere')];
  t.deepEqual(outAll, [['hello'], ['there']]);
});
