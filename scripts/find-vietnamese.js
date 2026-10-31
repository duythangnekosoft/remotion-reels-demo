const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.json')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
const vnRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/i;

const findings = {};
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (vnRegex.test(line)) {
      if (!findings[f]) findings[f] = [];
      findings[f].push({ line: idx + 1, text: line.trim() });
    }
  });
});

console.log('Total files with Vietnamese:', Object.keys(findings).length);
for (const [file, lines] of Object.entries(findings)) {
  console.log('\n--- ' + file + ' (' + lines.length + ' lines) ---');
  lines.slice(0, 10).forEach(l => console.log('  L' + l.line + ': ' + l.text));
  if (lines.length > 10) console.log('  ... and ' + (lines.length - 10) + ' more');
}

