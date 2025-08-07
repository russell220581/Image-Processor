const BaseController = require('./baseController');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { cleanTempFiles } = require('../services/fileManager');

class CompressionController extends BaseController {
  async processMultipleImages(req, res) {
    try {
      if (!req.files?.images) {
        return this.sendError(res, 400, 'No images uploaded');
      }

      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const { quality = 80, format = 'original' } = req.body;

      // Validate file count
      if (images.length > 5) {
        return this.sendError(res, 400, 'Maximum 5 images allowed');
      }

      // Process all images in parallel
      const processedFiles = await Promise.all(
        images.map(async (image) => {
          const outputPath = path.join(
            './temp',
            `${uuidv4()}_compressed.${this.getExtension(format, image.name)}`
          );
          const originalSize = image.size;

          let processor = sharp(image.tempFilePath);

          // Apply compression based on format
          switch (format) {
            case 'jpg':
            case 'jpeg':
              processor = processor.jpeg({
                quality: parseInt(quality),
                mozjpeg: true,
              });
              break;
            case 'png':
              processor = processor.png({
                quality: Math.min(100, parseInt(quality) + 20),
                compressionLevel: 9,
              });
              break;
            case 'webp':
              processor = processor.webp({ quality: parseInt(quality) });
              break;
            default: // Keep original format
              if (format !== 'original') {
                throw new Error('Unsupported output format');
              }
          }

          await processor.toFile(outputPath);
          const stats = await fs.promises.stat(outputPath);

          return {
            originalName: image.name,
            originalSize,
            size: stats.size,
            format,
            path: outputPath,
            downloadUrl: `/api/download?path=${encodeURIComponent(outputPath)}`,
          };
        })
      );

      res.json({
        success: true,
        files: processedFiles,
      });
    } catch (error) {
      console.error('Bulk compression error:', error);
      this.sendError(res, 500, `Compression failed: ${error.message}`);
    }
  }

  getExtension(format, originalName) {
    if (format !== 'original') return format;
    const ext = originalName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'png';
  }
}

module.exports = new CompressionController();
