# but-csv

728 byte (minified) CSV parser and builder.
Smaller when compressed.
Built in ESM only.

Doesn't care about headers, keyed rows, anything but strings.
Just supports the CSV spec including multi-line and quoted strings.

## Parse

```js
import { parse } from 'but-csv';

const out = parse('foo,bar,zing\n1,2,3');
// out will be [['foo', 'bar', 'zing'], ['1', '2', '3']]
```

Supports passing a `string` or `Uint8Array`.
Is internally converted to a byte array first, so pass that if preferred.
In Node, do this:

```js
const f = fs.readFileSync('source.csv');
const out = parse(f);
```

## Iterator

Like parse, but you get each row at a time and can return early.

```js
import { iter } from 'but-csv';

for (const row of iter('foo,bar,zing\n1,2,3') {
  // will be an array of ['foo', 'bar', 'zing'],
  // then an array of ['1', '2', '3']
}
```

## Build

```js
import { build } from 'but-csv';

const out = build([
  ['hello', 'there"\n'],
  ['1', '2'],
]);

// out will be:
// hello,"there""
// "
// 1,2
```

