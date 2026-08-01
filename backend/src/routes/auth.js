const express = require('express');
const { body } = require('express-validator');
const {
  register, login, refresh, logout, verifyEmail, resendVerification,
  forgotPassword, resetPassword, changePassword, me,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, resetLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const passwordRule = body('password')
  .isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters')
  .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number');

router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    passwordRule,
    body('role').optional().isIn(['student', 'instructor']).withMessage('Role must be student or instructor'),
  ]),
  register
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);

router.get('/verify-email/:token', verifyEmail);

router.post(
  '/resend-verification',
  authLimiter,
  validate([body('email').isEmail().withMessage('Valid email is required').normalizeEmail()]),
  resendVerification
);

router.post(
  '/forgot-password',
  resetLimiter,
  validate([body('email').isEmail().withMessage('Valid email is required').normalizeEmail()]),
  forgotPassword
);

router.post(
  '/reset-password',
  resetLimiter,
  validate([body('token').notEmpty().withMessage('Reset token is required'), passwordRule]),
  resetPassword
);

router.post(
  '/change-password',
  protect,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordRule.withMessage('New password must be 8-64 characters with at least one letter and one number'),
  ]),
  changePassword
);

router.get('/me', protect, me);

module.exports = router;
