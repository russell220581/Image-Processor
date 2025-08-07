const { processImage } = require('../services/imageProcessor');
const { cleanTempFiles } = require('../services/fileManager');
const { formatFileSize } = require('../utils/helpers');

class BaseController {
  constructor(operation) {
    this.operation = operation;
  }

  async processSingleImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return this.sendError(res, 400, 'No image uploaded');
      }

      const result = await processImage(
        req.files.image,
        this.operation,
        req.body
      );

      res.download(result.outputPath, result.outputName, (err) => {
        if (err) throw err;
        this.cleanupFile(result.outputPath);
      });
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }

  sendError(res, status, message) {
    res.status(status).json({ error: message });
  }

  cleanupFile(filePath) {
    cleanTempFiles([filePath]);
  }

  getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      type: file.mimetype,
    };
  }
}

module.exports = BaseController;
