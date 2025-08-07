module.exports = {
  FILE_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  TEMP_DIR: './temp',
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ],
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  CLEANUP_INTERVAL: 3600000, // 1 hour in milliseconds
};
