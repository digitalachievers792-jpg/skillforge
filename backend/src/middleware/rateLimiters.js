const rateLimit = require('express-rate-limit');

const limiter = ({ windowMs, max, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message: message || 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
  });

const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests from this IP, please try again in 15 minutes.',
});

const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

const resetLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again in 15 minutes.',
});

const chatLimiter = limiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'You are sending messages too quickly. Please slow down.',
});

const uploadLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many uploads. Please try again later.',
});

module.exports = { apiLimiter, authLimiter, resetLimiter, chatLimiter, uploadLimiter };
