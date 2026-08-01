const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/helpers');
const { sanitizeRichText, sanitizePlainText } = require('../utils/sanitize');
const { createNotification } = require('../utils/notifications');

const recomputeRating = async (courseId) => {
  const stats = await Review.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const agg = stats[0] || { average: 0, count: 0 };
  await Course.updateOne(
    { _id: courseId },
    { 'ratingSummary.average': Math.round(agg.average * 10) / 10, 'ratingSummary.count': agg.count }
  );
};

exports.listReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 6);
  const courseId = req.params.courseId;

  const [reviews, total] = await Promise.all([
    Review.find({ course: courseId })
      .populate('user', 'name avatar headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ course: courseId }),
  ]);

  const distribution = await Review.aggregate([
    { $match: { course: mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : null } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const course = await Course.findById(courseId).select('ratingSummary');
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach((d) => {
    if (dist[d._id] !== undefined) dist[d._id] = d.count;
  });

  res.json({
    success: true,
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    average: course?.ratingSummary?.average || 0,
    distribution: dist,
  });
});

exports.myReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ user: req.userId, course: req.params.courseId });
  res.json({ success: true, review });
});

exports.createReview = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');

  const enrollment = await Enrollment.findOne({ user: req.userId, course: courseId });
  if (!enrollment) throw new ApiError(403, 'Only enrolled students can review this course.');

  const existing = await Review.findOne({ user: req.userId, course: courseId });
  if (existing) throw new ApiError(409, 'You already reviewed this course.');

  const rating = Math.min(5, Math.max(1, Math.round(Number(req.body.rating) || 0)));
  const review = await Review.create({
    user: req.userId,
    course: courseId,
    rating,
    title: sanitizePlainText(req.body.title, 120),
    body: sanitizeRichText(req.body.body),
  });

  await recomputeRating(courseId);
  await createNotification({
    recipient: course.instructor,
    type: 'review',
    title: 'New course review',
    message: `${req.user.name} rated "${course.title}" ${rating}/5 stars.`,
    link: `/courses/${courseId}`,
  });

  res.status(201).json({ success: true, message: 'Review submitted. Thank you!', review });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  if (req.user.role !== 'admin' && review.user.toString() !== req.userId) {
    throw new ApiError(403, 'You can only edit your own review.');
  }

  if (req.body.rating !== undefined) review.rating = Math.min(5, Math.max(1, Math.round(Number(req.body.rating) || 0)));
  if (req.body.title !== undefined) review.title = sanitizePlainText(req.body.title, 120);
  if (req.body.body !== undefined) review.body = sanitizeRichText(req.body.body);
  review.isEdited = true;
  await review.save();

  await recomputeRating(review.course);
  res.json({ success: true, message: 'Review updated.', review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  if (req.user.role !== 'admin' && review.user.toString() !== req.userId) {
    throw new ApiError(403, 'You can only delete your own review.');
  }

  await review.deleteOne();
  await recomputeRating(review.course);
  res.json({ success: true, message: 'Review deleted.' });
});
