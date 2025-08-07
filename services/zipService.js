const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { TEMP_DIR } = require('../config/constants');
const { ensureDirExists } = require('./fileManager');

async function createZip(files) {
  await ensureDirExists(TEMP_DIR);

  const zipPath = path.join(TEMP_DIR, `compressed_${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Zip created: ${archive.pointer()} total bytes`);
      resolve(zipPath);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach((file) => {
      const fileName = path.basename(file.name);
      archive.file(file.path, { name: fileName });
    });

    archive.finalize();
  });
}

module.exports = { createZip };
