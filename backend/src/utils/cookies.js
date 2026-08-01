const isProd = process.env.NODE_ENV === 'production';
// Cross-site deployments (frontend and API on different domains) need SameSite=None.
const sameSite = process.env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax';

const baseCookieOptions = {
  httpOnly: true,
  sameSite,
  secure: isProd,
};

const ACCESS_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  path: '/',
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
};

module.exports = { setAuthCookies, clearAuthCookies, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS };
