const express = require('express');
const { body } = require('express-validator');
const { history, sendMessage, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { chatLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.use(protect);

router.get('/history', history);

router.post(
  '/messages',
  chatLimiter,
  validate([body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')]),
  sendMessage
);

router.delete('/history', clearHistory);

module.exports = router;
