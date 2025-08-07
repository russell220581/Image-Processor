function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function isSvgFile(file) {
  return file.type === 'image/svg+xml' || getFileExtension(file.name) === 'svg';
}

module.exports = {
  formatFileSize,
  getFileExtension,
  isSvgFile,
};
