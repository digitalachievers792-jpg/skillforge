const express = require('express');
const { body } = require('express-validator');
const {
  stats, analytics, listUsers, updateUser, deleteUser,
  listCourses, updateCourse, deleteCourse,
  listJobs, deleteJob, listForumPosts, deleteForumPost, listReviews, deleteReview,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', stats);
router.get('/analytics', analytics);

router.get('/users', listUsers);
router.patch(
  '/users/:id',
  validate([
    body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ]),
  updateUser
);
router.delete('/users/:id', deleteUser);

router.get('/courses', listCourses);
router.patch('/courses/:id', validate([
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('featured must be a boolean'),
]), updateCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/jobs', listJobs);
router.delete('/jobs/:id', deleteJob);

router.get('/forum/posts', listForumPosts);
router.delete('/forum/posts/:id', deleteForumPost);

router.get('/reviews', listReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
