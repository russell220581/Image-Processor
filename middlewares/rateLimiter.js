const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

module.exports = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  message: {
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain paths if needed
    return req.path === '/healthcheck';
  },
});
