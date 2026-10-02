/**
 * 正解時の短い効果音（粘土の鈴のような 2 音）を WAV で生成する。
 * 使い方: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const DURATION = 0.9;

function tone(t, freq, start, decay, gain) {
  if (t < start) return 0;
  const x = t - start;
  const attack = Math.min(1, x / 0.008);
  return gain * attack * Math.exp(-x / decay) * Math.sin(2 * Math.PI * freq * x);
}

const n = Math.floor(RATE * DURATION);
const data = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) {
  const t = i / RATE;
  let v =
    tone(t, 659.25, 0, 0.32, 0.32) + // E5
    tone(t, 1318.5, 0, 0.12, 0.08) +
    tone(t, 987.77, 0.11, 0.36, 0.3) + // B5
    tone(t, 1975.5, 0.11, 0.1, 0.06);
  v = Math.max(-1, Math.min(1, v));
  data.writeInt16LE(Math.round(v * 32767 * 0.8), i * 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

const out = path.join(__dirname, '..', 'assets', 'sounds', 'discover.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, data]));
console.log('wrote', out);
