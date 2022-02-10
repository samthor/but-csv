import { parse } from './index.js';

const b = Buffer.from(`a,b,c\n"f"oo","bar""?",zin""g\n"what""""x"`);
const out = parse(b);
