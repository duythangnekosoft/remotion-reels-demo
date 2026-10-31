const cols = 60, rows = 60, cell = 10.5, ox = 45, oy = 160;
const glyph1 = ['00100', '01100', '00100', '00100', '00100', '00100', '01110'];
const glyphK = ['10001', '10010', '10100', '11000', '10100', '10010', '10001'];

const initialBricks = Array.from({ length: cols * rows }, (_, id) => {
  const x = id % cols;
  const y = Math.floor(id / cols);
  const border = x < 3 || x >= 57 || y < 3 || y >= 57;
  const gap = x === 3 || x === 56 || y === 3 || y === 56;
  const gx = Math.floor((x - 10) / 3);
  const gy = Math.floor((y - 18) / 4);
  const hole = gy >= 0 && gy < 7 && ((gx >= 0 && gx < 5 && glyph1[gy][gx] === '1') || (gx >= 7 && gx < 12 && glyphK[gy][gx - 7] === '1'));
  return { x: ox + x * cell, y: oy + y * cell, alive: !gap && !hole, border };
});
const bricks = initialBricks.map(b => ({ ...b }));
const balls = [{ x: 480, y: 1060, vx: 270, vy: -690 }];
const drops = [];
let paddle = 480, broken = 0;

for (let step = 0; step <= 15000; step++) {
  const t = step / 120;
  if (t >= 0.7) {
    const target = drops.find(d => d.alive && d.y > 850)?.x ?? balls.reduce((p, q) => (q.vy > 0 && q.y > p.y ? q : p), balls[0]).x;
    paddle += Math.max(-9, Math.min(9, target - paddle));
    paddle = Math.max(105, Math.min(615, paddle));
    for (const d of drops) {
      if (!d.alive) continue;
      d.y += 3.6;
      if (d.y >= 1082) {
        d.alive = false;
        if (Math.abs(d.x - paddle) < 85 && balls.length < 64) {
          const extra = Math.min(balls.length * 2, 64 - balls.length);
          for (let k = 0; k < extra; k++) {
            const angle = -Math.PI / 2 + ((k / Math.max(1, extra - 1)) - 0.5) * 1.4;
            balls.push({ x: paddle, y: 1070, vx: 740 * Math.cos(angle), vy: 740 * Math.sin(angle) });
          }
        }
      }
    }
    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const p = balls[i];
      const px = p.x, py = p.y;
      p.x += p.vx / 120;
      p.y += p.vy / 120;
      if (p.x < 30) { p.x = 30; p.vx = Math.abs(p.vx); }
      if (p.x > 690) { p.x = 690; p.vx = -Math.abs(p.vx); }
      if (p.y < 140) { p.y = 140; p.vy = Math.abs(p.vy); }
      if (p.y >= 1076 && py < 1076 && p.vy > 0 && Math.abs(p.x - paddle) < 82) {
        p.y = 1075;
        const angle = (p.x - paddle) / 100;
        p.vx = 740 * Math.sin(angle);
        p.vy = -740 * Math.cos(angle);
      }
      if (p.y > 1170) {
        p.y = 1070; p.x = paddle; p.vy = -Math.abs(p.vy);
      }
      const gx = Math.floor((p.x - ox) / cell);
      const gy = Math.floor((p.y - oy) / cell);
      let hit = -1;
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        for (let xx = gx - 1; xx <= gx + 1; xx++) {
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          const id = yy * cols + xx;
          const b = bricks[id];
          if (b.alive && p.x + 4 > b.x && p.x - 4 < b.x + 9 && p.y + 4 > b.y && p.y - 4 < b.y + 9) {
            hit = id;
          }
        }
      }
      if (hit >= 0) {
        const b = bricks[hit];
        b.alive = false;
        broken++;
        if (px + 4 <= b.x || px - 4 >= b.x + 9) { p.vx = -p.vx; p.x = px; }
        else { p.vy = -p.vy; p.y = py; }
        if (broken % 12 === 0 && balls.length < 64) {
          drops.push({ x: Math.max(105, Math.min(615, b.x)), y: b.y, alive: true });
        }
      }
    }
  }
  if (step % 600 === 0) {
    const innerAlive = bricks.filter(b => b.alive && !b.border).length;
    const allAlive = bricks.filter(b => b.alive).length;
    console.log('Step ' + step + ' (' + (step / 120).toFixed(1) + 's, frame ' + (step / 4) + '): broken=' + broken + ', innerAlive=' + innerAlive + ', allAlive=' + allAlive + ', balls=' + balls.length);
  }
}
