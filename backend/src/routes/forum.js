const express = require('express');
const { body } = require('express-validator');
const {
  listPosts, getTags, getPost, createPost, updatePost, deletePost,
  votePost, addComment, voteComment, updateComment, deleteComment, markAnswer,
} = require('../controllers/forumController');
const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/posts', optionalAuth, listPosts);
router.get('/tags', getTags);
router.get('/posts/:id', optionalAuth, getPost);

router.post(
  '/posts',
  protect,
  validate([
    body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
    body('body').isLength({ min: 10, max: 20000 }).withMessage('Content must be 10-20000 characters'),
    body('tags').optional().isArray({ max: 5 }).withMessage('Max 5 tags'),
  ]),
  createPost
);

router.put(
  '/posts/:id',
  protect,
  validate([
    body('title').optional().trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
    body('body').optional().isLength({ min: 10, max: 20000 }).withMessage('Content must be 10-20000 characters'),
    body('tags').optional().isArray({ max: 5 }).withMessage('Max 5 tags'),
  ]),
  updatePost
);
router.delete('/posts/:id', protect, deletePost);
router.put('/posts/:id/vote', protect, validate([body('value').isIn([1, -1]).withMessage('Vote must be 1 or -1')]), votePost);

router.post('/posts/:id/comments', protect, validate([body('body').isLength({ min: 1, max: 4000 }).withMessage('Reply must be 1-4000 characters')]), addComment);
router.put('/comments/:id/vote', protect, validate([body('value').isIn([1, -1]).withMessage('Vote must be 1 or -1')]), voteComment);
router.put('/comments/:id', protect, validate([body('body').isLength({ min: 1, max: 4000 }).withMessage('Reply must be 1-4000 characters')]), updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/answer', protect, markAnswer);

module.exports = router;
