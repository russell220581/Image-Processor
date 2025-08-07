const fileUpload = require('express-fileupload');
const path = require('path');
const {
  FILE_SIZE_LIMIT,
  TEMP_DIR,
  ALLOWED_FILE_TYPES,
} = require('../config/constants');

module.exports = fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../', TEMP_DIR),
  limits: { fileSize: FILE_SIZE_LIMIT },
  abortOnLimit: true,
  responseOnLimit: `File size limit has been reached (${
    FILE_SIZE_LIMIT / 1024 / 1024
  }MB max)`,
  safeFileNames: true,
  preserveExtension: true,
  uploadTimeout: 30000,
  createParentPath: true,
  parseNested: false,
  debug: process.env.NODE_ENV === 'development',
});
