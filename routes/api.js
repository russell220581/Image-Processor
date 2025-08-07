const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const compressionController = require('../controllers/compressionController');
const resizeController = require('../controllers/resizeController');
const upscaleController = require('../controllers/upscaleController');
const svgToPngController = require('../controllers/conversionController');
const { cleanTempFiles } = require('../services/fileManager');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Image Processor API',
  });
});

// ======================
// Compression Endpoints
// ======================
router.post('/compress', async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
      });
    }

    const { quality = 80, format = 'original' } = req.body;
    const image = req.files.image;

    // Process the image
    const result = await compressionController.processImage(image, 'compress', {
      quality,
      format,
    });

    // Get file stats for size information
    const stats = fs.statSync(result.outputPath);

    res.json({
      success: true,
      downloadUrl: `/api/download?path=${encodeURIComponent(
        result.outputPath
      )}`,
      filename: result.outputName,
      fileSize: stats.size,
      originalSize: image.size,
      format:
        format === 'original' ? path.extname(image.name).slice(1) : format,
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Compression failed',
    });
  }
});

router.post('/compress-multiple', async (req, res) => {
  try {
    if (!req.files?.images) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded',
      });
    }

    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];
    const { quality = 80, format = 'original' } = req.body;

    const processedFiles = await Promise.all(
      images.map(async (image) => {
        const result = await compressionController.processImage(
          image,
          'compress',
          { quality, format }
        );

        return {
          originalName: image.name,
          originalSize: image.size,
          path: result.outputPath,
          downloadUrl: `/api/download?path=${encodeURIComponent(
            result.outputPath
          )}`,
          size: fs.statSync(result.outputPath).size,
          format:
            format === 'original' ? path.extname(image.name).slice(1) : format,
        };
      })
    );

    res.json({
      success: true,
      files: processedFiles,
    });
  } catch (error) {
    console.error('Bulk compression error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Bulk compression failed',
    });
  }
});

// ======================
// Resize Endpoints
// ======================
router.post('/resize', async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded',
      });
    }

    const options = {
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
      fit: req.body.fit || 'cover',
      position: req.body.position || 'center',
      withoutEnlargement: req.body.withoutEnlargement === 'true',
    };

    const result = await resizeController.processSingleImage(req, res);

    // For API consistency, return JSON instead of direct download
    const stats = fs.statSync(result.outputPath);

    res.json({
      success: true,
      downloadUrl: `/api/download?path=${encodeURIComponent(
        result.outputPath
      )}`,
      filename: result.outputName,
      fileSize: stats.size,
      originalSize: req.files.image.size,
    });
  } catch (error) {
    console.error('Resize error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image resize failed',
    });
  }
});

// ======================
// Upscale Endpoints
// ======================
router.post('/upscale', async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded',
      });
    }

    const options = {
      scale: req.body.scale ? parseFloat(req.body.scale) : null,
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
      kernel: req.body.kernel || 'lanczos3',
    };

    const result = await upscaleController.processSingleImage(req, res);

    const stats = fs.statSync(result.outputPath);

    res.json({
      success: true,
      downloadUrl: `/api/download?path=${encodeURIComponent(
        result.outputPath
      )}`,
      filename: result.outputName,
      fileSize: stats.size,
      originalSize: req.files.image.size,
    });
  } catch (error) {
    console.error('Upscale error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image upscale failed',
    });
  }
});

// ======================
// SVG to PNG Endpoints
// ======================
router.post('/svg2png', async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'No SVG file uploaded',
      });
    }

    if (!req.files.image.mimetype.includes('svg')) {
      return res.status(400).json({
        success: false,
        error: 'Only SVG files are supported',
      });
    }

    const options = {
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
    };

    const result = await svgToPngController.processSingleImage(req, res);

    const stats = fs.statSync(result.outputPath);

    res.json({
      success: true,
      downloadUrl: `/api/download?path=${encodeURIComponent(
        result.outputPath
      )}`,
      filename: result.outputName.replace('.svg', '.png'),
      fileSize: stats.size,
      originalSize: req.files.image.size,
    });
  } catch (error) {
    console.error('SVG conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'SVG to PNG conversion failed',
    });
  }
});

// ======================
// Download Endpoints
// ======================
router.get('/download', (req, res) => {
  try {
    const filePath = decodeURIComponent(req.query.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    const filename = path.basename(filePath);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Download failed',
          });
        }
      }
      // Clean up the file after download
      cleanTempFiles([filePath]);
    });
  } catch (error) {
    console.error('Download handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Download failed',
    });
  }
});

router.get('/download-multiple', async (req, res) => {
  try {
    const filePaths = JSON.parse(decodeURIComponent(req.query.paths));

    // Validate file paths
    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle errors during archiving
    archive.on('error', (err) => {
      throw err;
    });

    res.attachment('compressed_images.zip');
    archive.pipe(res);

    // Add files to archive
    filePaths.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    await archive.finalize();

    // Clean up files after download completes
    res.on('finish', () => {
      cleanTempFiles(filePaths);
    });
  } catch (error) {
    console.error('Multiple download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Zip download failed',
    });
  }
});

module.exports = router;
