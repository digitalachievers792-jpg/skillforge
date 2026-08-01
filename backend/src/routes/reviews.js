const express = require('express');
const { body } = require('express-validator');
const { listReviews, myReview, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/courses/:courseId/reviews', listReviews);
router.get('/courses/:courseId/reviews/mine', protect, myReview);
router.post(
  '/courses/:courseId/reviews',
  protect,
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 120 }).withMessage('Title max 120 characters'),
    body('body').optional().trim().isLength({ max: 2000 }).withMessage('Review max 2000 characters'),
  ]),
  createReview
);

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, authorize('student', 'instructor', 'admin'), deleteReview);

module.exports = router;
