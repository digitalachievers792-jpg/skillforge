const express = require('express');
const { body } = require('express-validator');
const {
  getJobs, getJob, createJob, updateJob, toggleJobStatus, deleteJob, saveJob, unsaveJob, getSavedJobs,
} = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/:id', optionalAuth, getJob);

router.post(
  '/',
  protect,
  authorize('admin'),
  validate([
    body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
    body('company').trim().isLength({ min: 2, max: 100 }).withMessage('Company must be 2-100 characters'),
    body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
    body('mode').optional().isIn(['remote', 'onsite', 'hybrid']),
    body('salaryMin').optional().isFloat({ min: 0 }),
    body('salaryMax').optional().isFloat({ min: 0 }),
    body('tags').optional().isArray({ max: 12 }),
    body('requirements').optional().isArray({ max: 15 }),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiry date'),
  ]),
  createJob
);

router.put('/:id', protect, authorize('admin'), updateJob);
router.put('/:id/status', protect, authorize('admin'), toggleJobStatus);
router.delete('/:id', protect, authorize('admin'), deleteJob);
router.post('/:id/save', protect, saveJob);
router.delete('/:id/save', protect, unsaveJob);

module.exports = router;
