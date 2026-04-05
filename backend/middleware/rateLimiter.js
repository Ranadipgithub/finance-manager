const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 500, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after a minute'
  }
});

module.exports = { apiLimiter, loginLimiter };
