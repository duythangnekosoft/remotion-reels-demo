const fs = require('fs');

function parseWavDuration(buffer) {
  if (buffer.length < 12 || buffer.toString('ascii', 0, 4) !== 'RIFF' ||
      buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Invalid RIFF/WAVE signature');
  }
  const end = buffer.readUInt32LE(4) + 8;
  if (end > buffer.length) throw new Error('Truncated RIFF payload');
  let byteRate = 0;
  let blockAlign = 0;
  let dataBytes = 0;
  let offset = 12;
  while (offset < end) {
    if (offset + 8 > end) throw new Error('Truncated chunk header');
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const next = start + size + size % 2;
    if (next > end) throw new Error(`Truncated ${id} chunk`);
    if (id === 'fmt ') {
      if (size < 16) throw new Error('Invalid fmt chunk');
      byteRate = buffer.readUInt32LE(start + 8);
      blockAlign = buffer.readUInt16LE(start + 12);
      if (!byteRate || !blockAlign) throw new Error('Invalid byte rate or block alignment');
    } else if (id === 'data') {
      dataBytes += size;
    }
    offset = next;
  }
  if (!byteRate || !blockAlign) throw new Error('Missing fmt chunk');
  if (!dataBytes) throw new Error('Missing or empty data chunk');
  if (dataBytes % blockAlign) throw new Error('Incomplete sample frame');
  return dataBytes / byteRate;
}

function readWavDuration(filePath) {
  try {
    return parseWavDuration(fs.readFileSync(filePath));
  } catch (error) {
    throw new Error(`${filePath}: ${error.message}`);
  }
}

module.exports = { parseWavDuration, readWavDuration };
