#!/usr/bin/env node

import * as childProcess from 'child_process';

const scripts = ['index'];
for (const script of scripts) {
  childProcess.execSync(`esbuild --format=esm --bundle --minify --tree-shaking=true ${script}.js > ${script}.min.mjs`);
}
