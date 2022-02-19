#!/usr/bin/env node

import * as childProcess from 'child_process';
import * as fs from 'fs';

const scripts = ['index'];
for (const script of scripts) {
  childProcess.execSync(`esbuild --format=esm --bundle --minify --tree-shaking=true ${script}.js > ${script}.min.mjs`);

  const stat = fs.statSync(`${script}.min.mjs`);
  console.info(script, '=>', stat.size);
}
