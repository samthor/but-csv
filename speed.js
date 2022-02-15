import * as fs from 'fs';
import { parse } from './index.js';
const f = fs.readFileSync('1.csv', 'utf-8');

console.time('but-csv');
const out = parse(f);
console.timeEnd('but-csv');

//console.info(out);