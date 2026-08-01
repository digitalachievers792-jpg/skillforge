const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Session expired. Please log in again.');
  }
  if (payload.type !== 'access') throw new ApiError(401, 'Invalid token type.');

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'Account has been deactivated.');

  req.user = user;
  req.userId = user._id.toString();
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated.'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied. Requires role: ${roles.join(' or ')}.`));
  }
  next();
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch {
    /* ignore invalid optional token */
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
