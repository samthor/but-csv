import * as fs from 'fs';
import { build, parse } from './index.js';
const f = fs.readFileSync('1.csv', 'utf-8');

console.time('but-csv');
const data = parse(f);
console.timeEnd('but-csv');

console.time('but-csv render')
const out = build(data);
console.timeEnd('but-csv render');


//console.info(out);