const express = require('express');
const { stats, analytics, myCourses, courseDetail, courseStudents, searchStudents } = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('instructor', 'admin'));

router.get('/stats', stats);
router.get('/analytics', analytics);
router.get('/courses', myCourses);
router.get('/students/search', searchStudents);
router.get('/courses/:id', courseDetail);
router.get('/courses/:id/students', courseStudents);

module.exports = router;
