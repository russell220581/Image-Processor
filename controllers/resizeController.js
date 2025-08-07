const BaseController = require('./baseController');
const { validateResizeOptions } = require('../utils/validators');

class ResizeController extends BaseController {
  constructor() {
    super('resize');
  }

  async processSingleImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return this.sendError(res, 400, 'No image uploaded');
      }

      const options = {
        width: req.body.width ? parseInt(req.body.width) : null,
        height: req.body.height ? parseInt(req.body.height) : null,
        fit: req.body.fit || 'cover',
        position: req.body.position || 'center',
        withoutEnlargement: req.body.withoutEnlargement === 'true',
      };

      validateResizeOptions(options);

      const result = await processImage(
        req.files.image,
        this.operation,
        options
      );

      res.download(result.outputPath, result.outputName, (err) => {
        if (err) throw err;
        this.cleanupFile(result.outputPath);
      });
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }
}

module.exports = new ResizeController();
