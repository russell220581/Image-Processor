const fs = require('fs');
const path = require('path');
const { TEMP_DIR } = require('../config/constants');

async function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanTempFiles(filePaths) {
  filePaths.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  });
}

function cleanTempFolder() {
  if (!fs.existsSync(TEMP_DIR)) {
    return;
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  fs.readdirSync(TEMP_DIR).forEach((file) => {
    const filePath = path.join(TEMP_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtime.getTime() > oneHour) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  });
}

module.exports = {
  ensureDirExists,
  cleanTempFiles,
  cleanTempFolder,
};
