const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const CSRF_COOKIE = 'csrfToken';
const isProd = process.env.NODE_ENV === 'production';
// Cross-site deployments (frontend and API on different domains) need SameSite=None.
const sameSite = (process.env.COOKIE_SAMESITE || '').trim() === 'none' ? 'none' : 'lax';
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const csrfProtection = (req, res, next) => {
  let token = req.cookies[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite,
      secure: isProd,
      path: '/',
    });
  }

  if (UNSAFE_METHODS.includes(req.method)) {
    const header = req.headers['x-csrf-token'];
    if (!header || header !== token) {
      return next(new ApiError(403, 'CSRF token validation failed. Please refresh the page and try again.'));
    }
  }

  next();
};

module.exports = { csrfProtection, CSRF_COOKIE };
