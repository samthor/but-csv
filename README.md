# but-csv

<img src="https://storage.googleapis.com/hwhistlr.appspot.com/assets/but-csv.png" width="64" height="64" align="right" hspace="8" />

520 byte (minified) CSV parser and builder.
Smaller when compressed.
Built in ESM only.

Doesn't care about headers, keyed rows, anything but strings.
Just supports the CSV spec including multi-line and quoted strings.

## Usage

Install via you favourite package manager.
Has zero dependencies (obviously).

```bash
$ npm install but-csv
```

### Parse

```js
import { parse } from 'but-csv';

const out = parse('foo,bar,zing\n1,2,3');
// out will be [['foo', 'bar', 'zing'], ['1', '2', '3']]
```

Only supports passing a `string` (not a `Buffer` or friends).
Node's operations on `string` are so much faster than on raw bytes (10x improvement).

```js
const f = fs.readFileSync('source.csv', 'utf-8');
const out = parse(f);
```

### Iterator

Like parse, but you get each row at a time and can return early.

```js
import { iter } from 'but-csv';

for (const row of iter('foo,bar,zing\n1,2,3')) {
  // will be an array of ['foo', 'bar', 'zing'],
  // then an array of ['1', '2', '3']
}
```

### Build

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

## Speed

It's very fast, but doesn't support streaming.
On [1.csv](https://github.com/Keyang/csvbench/blob/master/1.csv) from here, parsing all at once:

```
papaparse: 300.277ms
but-csv: 153.889ms
```
