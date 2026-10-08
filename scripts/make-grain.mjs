// Generates public/grain.png: a small tileable noise texture used for the paper grain overlay.
// Run with: node scripts/make-grain.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const size = 160;
const raw = Buffer.alloc((size * 4 + 1) * size);
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

for (let y = 0; y < size; y++) {
  const row = y * (size * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < size; x++) {
    const i = row + 1 + x * 4;
    const v = rand();
    const light = v > 0.5;
    raw[i] = light ? 255 : 128;
    raw[i + 1] = light ? 250 : 20;
    raw[i + 2] = light ? 240 : 40;
    raw[i + 3] = Math.round(Math.abs(v - 0.5) * 2 * 70);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../public/grain.png', import.meta.url), png);
console.log('wrote public/grain.png', png.length, 'bytes');
