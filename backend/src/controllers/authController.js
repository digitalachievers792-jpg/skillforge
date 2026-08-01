const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookies');
const { randomToken, sha256 } = require('../utils/helpers');
const { sendMail } = require('../utils/mailer');
const { createNotification } = require('../utils/notifications');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';

const getDevice = (req) => String(req.headers['user-agent'] || 'unknown device').slice(0, 120);

const createAuthSession = async (user, req) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(refreshToken),
    device: getDevice(req),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken };
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'An account with this email already exists.');

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'instructor' ? 'instructor' : 'student',
  });

  const verifyToken = randomToken();
  user.verifyToken = sha256(verifyToken);
  user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your SkillForge email',
    body: `Hi ${user.name}, welcome to <strong>SkillForge</strong>! Confirm your email address to activate your account.<br/><br/><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Verify my email</a><br/><br/>Or paste this link: ${verifyUrl}`,
  });

  await createNotification({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to SkillForge 🎉',
    message: `Thanks for joining, ${user.name}! Complete your profile to get personalized course and job recommendations.`,
    link: '/profile',
  });

  res.status(201).json({
    success: true,
    message: 'Account created. Verification email sent.',
    devVerifyToken: isDev ? verifyToken : undefined,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated.');
  if (!user.emailVerified) {
    throw new ApiError(403, 'Please verify your email address before logging in.', {
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  const { accessToken, refreshToken } = await createAuthSession(user, req);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({ success: true, message: 'Logged in successfully.', user });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided.');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid refresh token.');
  }
  if (payload.type !== 'refresh') throw new ApiError(401, 'Invalid token type.');

  const tokenHash = sha256(token);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored || stored.revoked) throw new ApiError(401, 'Refresh token is no longer valid. Please log in again.');

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or deactivated.');

  stored.revoked = true;
  await stored.save();

  const session = await createAuthSession(user, req);
  setAuthCookies(res, session.accessToken, session.refreshToken);

  res.json({ success: true, user });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.updateOne({ tokenHash: sha256(token) }, { revoked: true });
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) throw new ApiError(400, 'Verification token is required.');

  const hash = sha256(token);
  const user = await User.findOne({ verifyToken: hash }).select('+verifyToken');
  if (!user || !user.verifyTokenExpires || user.verifyTokenExpires < new Date()) {
    throw new ApiError(400, 'Verification link is invalid or has expired.');
  }

  user.emailVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found with this email.');

  const verifyToken = randomToken();
  user.verifyToken = sha256(verifyToken);
  user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendMail({
    to: user.email,
    subject: 'SkillForge — resend verification',
    body: `Hi ${user.name}, here is your fresh verification link:<br/><br/><a href="${verifyUrl}">Verify my email</a>`,
  });

  res.json({ success: true, message: 'Verification email resent.', devVerifyToken: isDev ? verifyToken : undefined });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }

  const resetToken = randomToken();
  user.resetToken = sha256(resetToken);
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your SkillForge password',
    body: `Hi ${user.name}, we received a request to reset your password. This link expires in 1 hour.<br/><br/><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Reset my password</a><br/><br/>Or paste this link: ${resetUrl}`,
  });

  res.json({ success: true, message: 'If an account exists, a reset link has been sent.', devResetToken: isDev ? resetToken : undefined });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token) throw new ApiError(400, 'Reset token is required.');

  const hash = sha256(token);
  const user = await User.findOne({ resetToken: hash }).select('+resetToken');
  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new ApiError(400, 'Reset link is invalid or has expired.');
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

  res.json({ success: true, message: 'Password changed. Please log in again.' });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
