const express = require('express');
const { body } = require('express-validator');
const {
  enroll, myEnrollments, updateProgress, myCertificate, publicCertificate,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/certificates/:code', publicCertificate);

router.post('/:courseId', protect, enroll);
router.get('/my', protect, myEnrollments);
router.put(
  '/:courseId/progress',
  protect,
  validate([body('lessonId').isMongoId().withMessage('Valid lessonId is required')]),
  updateProgress
);
router.get('/:courseId/certificate', protect, myCertificate);

module.exports = router;
