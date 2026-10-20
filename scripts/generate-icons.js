import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcBuf]);
}

function generatePng(size) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Uncompressed scanlines
  // Filter byte (1 byte) + (size * 4 bytes RGBA) per row
  const rowLength = 1 + size * 4;
  const rawData = Buffer.alloc(size * rowLength);

  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle corner smoothing
      const cornerRadius = size * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (center - cornerRadius));
      const qy = Math.max(0, Math.abs(dy) - (center - cornerRadius));
      const squircleDist = Math.sqrt(qx * qx + qy * qy);

      if (squircleDist <= cornerRadius) {
        // Emerald background: #047857 -> (4, 120, 87)
        // With subtle gold border: #facc15 -> (250, 204, 21)
        if (squircleDist > cornerRadius - 4) {
          rawData[pxOffset] = 250;     // R
          rawData[pxOffset + 1] = 204; // G
          rawData[pxOffset + 2] = 21;  // B
          rawData[pxOffset + 3] = 255; // A
        } else if (dist < radius * 0.55) {
          // Central Golden Emblem / Scales
          rawData[pxOffset] = 254;     // R
          rawData[pxOffset + 1] = 240; // G
          rawData[pxOffset + 2] = 138; // B
          rawData[pxOffset + 3] = 255; // A
        } else {
          rawData[pxOffset] = 4;       // R
          rawData[pxOffset + 1] = 120; // G
          rawData[pxOffset + 2] = 87;  // B
          rawData[pxOffset + 3] = 255; // A
        }
      } else {
        // Transparent outside rounded squircle
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', generatePng(192));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180));
console.log('Generated PNG icons successfully!');
