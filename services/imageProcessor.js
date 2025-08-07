const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { TEMP_DIR } = require('../config/constants');
const { ensureDirExists } = require('./fileManager');

async function processImage(image, operation, options = {}) {
  await ensureDirExists(TEMP_DIR);

  const outputName = `${uuidv4()}_processed.${getOutputExtension(
    image.name,
    operation
  )}`;
  const outputPath = path.join(TEMP_DIR, outputName);

  let sharpInstance = sharp(image.tempFilePath);

  switch (operation) {
    case 'compress':
      sharpInstance = applyCompression(sharpInstance, options);
      break;
    case 'resize':
      sharpInstance = applyResize(sharpInstance, options);
      break;
    case 'upscale':
      sharpInstance = await applyUpscale(sharpInstance, options);
      break;
    case 'svg2png':
      sharpInstance = applySvgConversion(sharpInstance, options);
      break;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  await sharpInstance.toFile(outputPath);
  return { outputPath, outputName };
}

function getOutputExtension(originalName, operation) {
  if (operation === 'svg2png') return 'png';

  const ext = originalName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'png';
}

function applyCompression(sharpInstance, options) {
  const format = options.format || 'original';

  const processors = {
    jpg: () =>
      sharpInstance.jpeg({
        quality: options.quality || 80,
        mozjpeg: true,
      }),
    png: () =>
      sharpInstance.png({
        quality: options.quality ? Math.floor(options.quality / 1.5) : 60,
        compressionLevel: 9,
      }),
    webp: () =>
      sharpInstance.webp({
        quality: options.quality || 75,
      }),
    original: (instance) => instance,
  };

  return processors[format] ? processors[format](sharpInstance) : sharpInstance;
}

function applyResize(sharpInstance, options) {
  return sharpInstance.resize({
    width: options.width || null,
    height: options.height || null,
    fit: options.fit || 'cover',
    position: options.position || 'center',
    withoutEnlargement: options.withoutEnlargement || false,
    background: options.background || { r: 0, g: 0, b: 0, alpha: 0 },
  });
}

async function applyUpscale(sharpInstance, options) {
  const metadata = await sharpInstance.metadata();
  const width =
    options.width || Math.round(metadata.width * (options.scale || 2));
  const height =
    options.height || Math.round(metadata.height * (options.scale || 2));

  return sharpInstance.resize({
    width,
    height,
    fit: 'fill',
    kernel: options.kernel || 'lanczos3',
    withoutEnlargement: false,
  });
}

function applySvgConversion(sharpInstance, options) {
  return sharpInstance
    .resize(options.width, options.height)
    .png({ compressionLevel: 9 });
}

module.exports = { processImage };
