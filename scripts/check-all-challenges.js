const fs = require('fs');
const path = require('path');

console.log('=== CHECKING KINETIC FIVE MANIFEST & DATA ===');
const fiveManifest = require('../src/data/kinetic/five-manifest.json');
for (const item of fiveManifest) {
  const dataPath = path.join(__dirname, '../src/data/kinetic', item.id + '.json');
  if (fs.existsSync(dataPath)) {
    const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`\nItem: ${item.id} (${item.kind})`);
    console.log(`  Duration: ${item.duration}s (${item.frames} frames, finishFrame: ${item.finishFrame})`);
    console.log(`  Manifest Result:`, item.result);
    if (item.kind === 'heart' || item.kind === 'orbit') {
      const lastFrame = d.frames[d.frames.length - 1];
      const litCount = d.cells.filter(c => c.on <= item.finishFrame).length;
      console.log(`  Total Cells: ${d.cells.length}, Lit at finishFrame: ${litCount}, Last frame lit: ${lastFrame.lit}`);
      if (litCount < d.cells.length) {
        console.warn(`  ⚠️ NOT ALL CELLS LIT! Remaining: ${d.cells.length - litCount}`);
      } else {
        console.log(`  ✅ ALL ${d.cells.length} cells are 100% lit!`);
      }
    } else if (item.kind === 'rings' || item.kind === 'square') {
      const lastFrame = d.frames[d.frames.length - 1];
      console.log(`  Rings: ${d.rings.length}, Score: [${lastFrame.score[0]}, ${lastFrame.score[1]}], Rings built: ${lastFrame.rings}`);
      console.log(`  Winner: ${item.result.winner}, Goal: ${item.result.goal}`);
    } else if (item.kind === 'brick') {
      const brokenCount = d.bricks.filter(b => b.dead <= item.finishFrame && b.dead >= 0).length;
      console.log(`  Total Bricks: ${d.bricks.length}, Broken at finishFrame: ${brokenCount}`);
      if (brokenCount < d.bricks.length) {
        console.warn(`  ⚠️ NOT ALL BRICKS BROKEN! Remaining: ${d.bricks.length - brokenCount}`);
      } else {
        console.log(`  ✅ ALL ${d.bricks.length} bricks are 100% broken!`);
      }
    }
  }
}

console.log('\n=== CHECKING NEON BLOOM ===');
const neonData = require('../src/data/kinetic/neon-data.json');
console.log(`Neon frames: ${neonData.frames.length}, End frame: ${neonData.endFrame || 980}`);
const lastNeon = neonData.frames[neonData.frames.length - 1];
console.log(`Last neon balls: ${lastNeon.p.length}, Limit reached: ${lastNeon.p.length >= 900}`);

console.log('\n=== CHECKING BUILD BATTLE ===');
const duelData = require('../src/data/kinetic/duel-data.json');
console.log(`Duel frames: ${duelData.frames.length}`);
const lastDuel = duelData.frames[duelData.frames.length - 1];
console.log(`Last duel score: [${lastDuel.score[0]}, ${lastDuel.score[1]}], Fill: ${(lastDuel.fill * 100).toFixed(1)}%`);
