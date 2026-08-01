const express = require('express');
const { body } = require('express-validator');
const {
  getMe, updateMe, uploadAvatar, uploadResume, removeResume, getInstructors, getPublicProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadImage, uploadResume: resumeUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/instructors', getInstructors);
router.get('/:id/profile', getPublicProfile);

router.use(protect);

router.get('/me', getMe);

router.put(
  '/me',
  validate([
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('headline').optional().trim().isLength({ max: 120 }).withMessage('Headline max 120 characters'),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio max 1000 characters'),
    body('location').optional().trim().isLength({ max: 100 }).withMessage('Location max 100 characters'),
    body('skills').optional().isArray({ max: 20 }).withMessage('Skills must be an array'),
    body('socials').optional().isObject().withMessage('Socials must be an object'),
    body('socials.website').optional().isURL({ protocols: ['http', 'https'] }).withMessage('Website must be a valid URL'),
    body('socials.github').optional().isURL({ protocols: ['http', 'https'] }).withMessage('GitHub must be a valid URL'),
    body('socials.linkedin').optional().isURL({ protocols: ['http', 'https'] }).withMessage('LinkedIn must be a valid URL'),
    body('socials.twitter').optional().isURL({ protocols: ['http', 'https'] }).withMessage('Twitter must be a valid URL'),
  ]),
  updateMe
);

router.post('/me/avatar', uploadLimiter, uploadImage.single('avatar'), uploadAvatar);
router.post('/me/resume', uploadLimiter, resumeUpload.single('resume'), uploadResume);
router.delete('/me/resume', removeResume);

module.exports = router;
