const express = require('express');
const { body } = require('express-validator');
const {
  apply, myApplications, listApplications, updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadResume } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post(
  '/jobs/:jobId/apply',
  protect,
  uploadLimiter,
  uploadResume.single('resume'),
  validate([
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().trim().isLength({ max: 30 }).withMessage('Phone max 30 characters'),
    body('coverLetter').optional().trim().isLength({ max: 3000 }).withMessage('Cover letter max 3000 characters'),
  ]),
  apply
);

router.get('/my', protect, myApplications);

router.get('/', protect, authorize('admin'), listApplications);
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  validate([body('status').isIn(['pending', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')]),
  updateApplicationStatus
);

module.exports = router;
