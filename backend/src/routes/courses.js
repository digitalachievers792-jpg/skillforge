const express = require('express');
const { body } = require('express-validator');
const {
  getCourses, getFeatured, getCategories, getCourse, getMyCourses,
  createCourse, updateCourse, publishCourse, deleteCourse,
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getCourses);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/my', protect, authorize('instructor', 'admin'), getMyCourses);
router.get('/:id', optionalAuth, getCourse);

router.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  validate([
    body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
    body('shortDescription').trim().isLength({ min: 10, max: 180 }).withMessage('Short description must be 10-180 characters'),
    body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced', 'all-levels']),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('thumbnail').optional().isURL({ protocols: ['http', 'https'] }).withMessage('Thumbnail must be a valid URL'),
    body('tags').optional().isArray({ max: 10 }).withMessage('Tags must be an array of max 10'),
    body('curriculum').optional().isArray({ max: 30 }).withMessage('Curriculum must be an array of sections'),
  ]),
  createCourse
);

router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), publishCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;
