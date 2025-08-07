const BaseController = require('./baseController');
const { validateSvgOptions } = require('../utils/validators');

class SvgToPngController extends BaseController {
  constructor() {
    super('svg2png');
  }

  async processSingleImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return this.sendError(res, 400, 'No image uploaded');
      }

      if (!req.files.image.mimetype.includes('svg')) {
        return this.sendError(res, 400, 'Only SVG files are supported');
      }

      const options = {
        width: req.body.width ? parseInt(req.body.width) : null,
        height: req.body.height ? parseInt(req.body.height) : null,
      };

      validateSvgOptions(options);

      const result = await processImage(
        req.files.image,
        this.operation,
        options
      );

      res.download(
        result.outputPath,
        result.outputName.replace('.svg', '.png'),
        (err) => {
          if (err) throw err;
          this.cleanupFile(result.outputPath);
        }
      );
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }
}

module.exports = new SvgToPngController();
