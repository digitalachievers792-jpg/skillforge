const mongoose = require('mongoose');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, paginate } = require('../utils/helpers');
const { sanitizeRichText, sanitizePlainText } = require('../utils/sanitize');
const { createNotification } = require('../utils/notifications');

const cleanTags = (tags) =>
  Array.isArray(tags)
    ? [...new Set(tags.map((t) => sanitizePlainText(t, 24).toLowerCase().replace(/\s+/g, '-')).filter(Boolean))].slice(0, 5)
    : [];

const withVoteState = (item, userId) => {
  const obj = item.toJSON ? item.toJSON() : item;
  obj.userVote = 0;
  if (userId) {
    const uid = String(userId);
    if (obj.upvotes?.some((v) => String(v) === uid)) obj.userVote = 1;
    else if (obj.downvotes?.some((v) => String(v) === uid)) obj.userVote = -1;
  }
  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

exports.listPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 10);
  const filter = {};

  if (req.query.tag) filter.tags = sanitizePlainText(req.query.tag, 24).toLowerCase();
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ title: regex }, { body: regex }, { tags: regex }];
  }

  const sortMap = { latest: { createdAt: -1 }, top: { score: -1, createdAt: -1 }, active: { updatedAt: -1 }, views: { views: -1 } };
  const sort = sortMap[req.query.sort] || sortMap.latest;

  const [posts, total] = await Promise.all([
    ForumPost.find(filter)
      .populate('author', 'name avatar role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ForumPost.countDocuments(filter),
  ]);

  res.json({ success: true, posts: posts.map((p) => withVoteState(p, req.userId)), total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.getTags = asyncHandler(async (req, res) => {
  const tags = await ForumPost.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 30 },
  ]);
  res.json({ success: true, tags: tags.map((t) => ({ name: t._id, count: t.count })) });
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id).populate('author', 'name avatar role headline');
  if (!post) throw new ApiError(404, 'Post not found.');

  ForumPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {});

  const comments = await ForumComment.find({ post: post._id })
    .populate('author', 'name avatar role')
    .sort({ score: -1, createdAt: 1 });

  res.json({
    success: true,
    post: withVoteState(post, req.userId),
    comments: comments.map((c) => withVoteState(c, req.userId)),
  });
});

exports.createPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.create({
    title: sanitizePlainText(req.body.title, 150),
    body: sanitizeRichText(req.body.body),
    author: req.userId,
    tags: cleanTags(req.body.tags),
  });
  res.status(201).json({ success: true, message: 'Post published.', post });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (req.user.role !== 'admin' && post.author.toString() !== req.userId) {
    throw new ApiError(403, 'You can only edit your own posts.');
  }

  if (req.body.title !== undefined) post.title = sanitizePlainText(req.body.title, 150);
  if (req.body.body !== undefined) post.body = sanitizeRichText(req.body.body);
  if (req.body.tags !== undefined) post.tags = cleanTags(req.body.tags);
  await post.save();

  res.json({ success: true, message: 'Post updated.', post });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (req.user.role !== 'admin' && post.author.toString() !== req.userId) {
    throw new ApiError(403, 'You can only delete your own posts.');
  }
  await Promise.all([ForumComment.deleteMany({ post: post._id }), post.deleteOne()]);
  res.json({ success: true, message: 'Post deleted.' });
});

const applyVote = async (model, docId, userId, value) => {
  const doc = await model.findById(docId);
  if (!doc) throw new ApiError(404, 'Item not found.');
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, 'Invalid user.');

  const uid = mongoose.Types.ObjectId.createFromHexString(userId);
  const hasUp = doc.upvotes.some((v) => v.toString() === userId);
  const hasDown = doc.downvotes.some((v) => v.toString() === userId);

  if (value === 1) {
    if (hasUp) doc.upvotes.pull(uid);
    else {
      doc.upvotes.push(uid);
      if (hasDown) doc.downvotes.pull(uid);
    }
  } else if (value === -1) {
    if (hasDown) doc.downvotes.pull(uid);
    else {
      doc.downvotes.push(uid);
      if (hasUp) doc.upvotes.pull(uid);
    }
  } else {
    throw new ApiError(400, 'Vote value must be 1 or -1.');
  }

  doc.score = doc.upvotes.length - doc.downvotes.length;
  await doc.save();
  return doc;
};

exports.votePost = asyncHandler(async (req, res) => {
  const value = Math.round(Number(req.body.value) || 0);
  const post = await applyVote(ForumPost, req.params.id, req.userId, value);

  if (post.author.toString() !== req.userId && value === 1) {
    await createNotification({
      recipient: post.author,
      type: 'forum_vote',
      title: 'Your post got an upvote ⬆️',
      message: 'Someone upvoted your forum post.',
      link: `/forum/post/${req.params.id}`,
    });
  }

  res.json({ success: true, score: post.score, userVote: value });
});

exports.addComment = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');

  const comment = await ForumComment.create({
    post: post._id,
    author: req.userId,
    body: sanitizeRichText(req.body.body),
  });

  post.commentCount += 1;
  await post.save();

  if (post.author.toString() !== req.userId) {
    await createNotification({
      recipient: post.author,
      type: 'forum_reply',
      title: 'New reply on your post',
      message: `${req.user.name} replied to "${post.title.slice(0, 60)}".`,
      link: `/forum/post/${post._id}`,
    });
  }

  const populated = await ForumComment.findById(comment._id).populate('author', 'name avatar role');
  res.status(201).json({ success: true, message: 'Reply posted.', comment: withVoteState(populated, req.userId) });
});

exports.voteComment = asyncHandler(async (req, res) => {
  const value = Math.round(Number(req.body.value) || 0);
  const comment = await applyVote(ForumComment, req.params.id, req.userId, value);

  if (comment.author.toString() !== req.userId && value === 1) {
    await createNotification({
      recipient: comment.author,
      type: 'forum_vote',
      title: 'Your reply was upvoted ⬆️',
      message: 'Someone upvoted your reply.',
      link: `/forum/post/${comment.post}`,
    });
  }

  res.json({ success: true, score: comment.score, userVote: value });
});

exports.updateComment = asyncHandler(async (req, res) => {
  const comment = await ForumComment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');
  if (req.user.role !== 'admin' && comment.author.toString() !== req.userId) {
    throw new ApiError(403, 'You can only edit your own comments.');
  }
  comment.body = sanitizeRichText(req.body.body);
  await comment.save();
  res.json({ success: true, message: 'Comment updated.', comment });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await ForumComment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');
  if (req.user.role !== 'admin' && comment.author.toString() !== req.userId) {
    throw new ApiError(403, 'You can only delete your own comments.');
  }
  await comment.deleteOne();
  await ForumPost.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });
  res.json({ success: true, message: 'Comment deleted.' });
});

exports.markAnswer = asyncHandler(async (req, res) => {
  const comment = await ForumComment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');
  const post = await ForumPost.findById(comment.post);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (req.user.role !== 'admin' && post.author.toString() !== req.userId) {
    throw new ApiError(403, 'Only the post author can mark an answer.');
  }

  if (!comment.isAnswer) {
    await ForumComment.updateMany({ post: post._id, isAnswer: true }, { $set: { isAnswer: false } });
  }
  comment.isAnswer = !comment.isAnswer;
  await comment.save();
  res.json({ success: true, message: comment.isAnswer ? 'Marked as accepted answer.' : 'Answer marking removed.', comment });
});
