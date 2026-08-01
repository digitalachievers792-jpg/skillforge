const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, type: 'access' }, accessSecret, {
    expiresIn: accessExpiresIn,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, type: 'refresh' }, refreshSecret, {
    expiresIn: refreshExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
