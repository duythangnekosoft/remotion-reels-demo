const fs = require('fs');

// render-fleet.js
let rf = fs.readFileSync('scripts/render-fleet.js', 'utf8');
rf = rf.replace(', "singularity"', '');
rf = rf.replace(/,\s*\{\s*key:\s*"singularity"[\s\S]*?thumbFrame:\s*1200,\s*\}/, '');
fs.writeFileSync('scripts/render-fleet.js', rf);
console.log('Cleaned render-fleet.js');

// render-all.js
let ra = fs.readFileSync('scripts/render-all.js', 'utf8');
ra = ra.replace(/,\s*\{\s*type:\s*"render",\s*comp:\s*"SingularitySiege-ASMR"[\s\S]*?\}/, '');
fs.writeFileSync('scripts/render-all.js', ra);
console.log('Cleaned render-all.js');

// package.json
let pj = fs.readFileSync('package.json', 'utf8');
pj = pj.replace(/"build:singularity":.*?\r?\n/, '');
pj = pj.replace(/"render:singularity":.*?\r?\n/, '');
fs.writeFileSync('package.json', pj);
console.log('Cleaned package.json');

