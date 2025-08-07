function validateResizeOptions(options) {
  if (!options.width && !options.height) {
    throw new Error('Width or height must be specified for resize');
  }

  if (options.width && (isNaN(options.width) || options.width <= 0)) {
    throw new Error('Width must be a positive number');
  }

  if (options.height && (isNaN(options.height) || options.height <= 0)) {
    throw new Error('Height must be a positive number');
  }
}

function validateUpscaleOptions(options) {
  if (!options.scale && !options.width && !options.height) {
    throw new Error('Scale factor or dimensions must be specified for upscale');
  }

  if (options.scale && (isNaN(options.scale) || options.scale <= 0)) {
    throw new Error('Scale must be a positive number');
  }

  if (options.width && (isNaN(options.width) || options.width <= 0)) {
    throw new Error('Width must be a positive number');
  }

  if (options.height && (isNaN(options.height) || options.height <= 0)) {
    throw new Error('Height must be a positive number');
  }
}

function validateSvgOptions(options) {
  if (options.width && (isNaN(options.width) || options.width <= 0)) {
    throw new Error('Width must be a positive number');
  }

  if (options.height && (isNaN(options.height) || options.height <= 0)) {
    throw new Error('Height must be a positive number');
  }
}

module.exports = {
  validateResizeOptions,
  validateUpscaleOptions,
  validateSvgOptions,
};
