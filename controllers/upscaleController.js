const BaseController = require('./baseController');
const { validateUpscaleOptions } = require('../utils/validators');

class UpscaleController extends BaseController {
  constructor() {
    super('upscale');
  }

  async processSingleImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return this.sendError(res, 400, 'No image uploaded');
      }

      const options = {
        scale: req.body.scale ? parseFloat(req.body.scale) : null,
        width: req.body.width ? parseInt(req.body.width) : null,
        height: req.body.height ? parseInt(req.body.height) : null,
        kernel: req.body.kernel || 'lanczos3',
      };

      validateUpscaleOptions(options);

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

module.exports = new UpscaleController();
