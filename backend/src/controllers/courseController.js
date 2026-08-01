const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const Certificate = require('../models/Certificate');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, paginate, makeSlug, randomToken } = require('../utils/helpers');
const { sanitizeRichText, sanitizePlainText } = require('../utils/sanitize');

const PUBLIC_SELECT = 'title slug shortDescription category level price thumbnail tags ratingSummary enrolledCount instructor featured publishedAt views';

const normalizeCurriculum = (input) => {
  if (!Array.isArray(input)) throw new ApiError(400, 'curriculum must be an array of sections.');
  if (input.length > 30) throw new ApiError(400, 'Maximum 30 sections per course.');

  return input
    .filter((s) => s && typeof s === 'object')
    .slice(0, 30)
    .map((section) => ({
      _id: section._id && mongoose.isValidObjectId(section._id) ? section._id : undefined,
      title: sanitizePlainText(section.title, 120) || 'Section',
      lessons: Array.isArray(section.lessons)
        ? section.lessons
            .filter((l) => l && typeof l === 'object')
            .slice(0, 60)
            .map((lesson) => ({
              _id: lesson._id && mongoose.isValidObjectId(lesson._id) ? lesson._id : new mongoose.Types.ObjectId(),
              title: sanitizePlainText(lesson.title, 120) || 'Lesson',
              description: sanitizePlainText(lesson.description, 600),
              duration: Math.max(0, Number(lesson.duration) || 0),
              videoUrl: lesson.videoUrl && /^https?:\/\//.test(String(lesson.videoUrl)) ? String(lesson.videoUrl).slice(0, 500) : '',
              isFree: Boolean(lesson.isFree),
            }))
        : [],
    }));
};

const ensureUniqueSlug = async (slug) => {
  const base = slug || makeSlug('course');
  let candidate = base;
  while (await Course.findOne({ slug: candidate })) {
    candidate = `${base}-${randomToken(2)}`;
  }
  return candidate;
};

exports.getCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { status: 'published' };

  if (req.query.category) filter.category = sanitizePlainText(req.query.category, 60);
  if (req.query.level) filter.level = req.query.level;
  if (req.query.price === 'free') filter.price = 0;
  if (req.query.price === 'paid') filter.price = { $gt: 0 };
  if (req.query.rating) {
    const min = Number(req.query.rating);
    if (min >= 1 && min <= 5) filter['ratingSummary.average'] = { $gte: min };
  }
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ title: regex }, { shortDescription: regex }, { tags: regex }, { category: regex }];
  }

  const sortMap = {
    newest: { publishedAt: -1 },
    popular: { enrolledCount: -1 },
    rating: { 'ratingSummary.average': -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
    title: { title: 1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.popular;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select(PUBLIC_SELECT)
      .populate('instructor', 'name avatar headline')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({
    success: true,
    courses,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'published', featured: true })
    .select(PUBLIC_SELECT)
    .populate('instructor', 'name avatar')
    .sort({ 'ratingSummary.average': -1, enrolledCount: -1 })
    .limit(8);
  res.json({ success: true, courses });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, categories: categories.map((c) => ({ name: c._id, count: c.count })) });
});

exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, status: 'published' })
    .populate('instructor', 'name avatar headline bio role createdAt')
    .lean();

  if (!course) throw new ApiError(404, 'Course not found.');

  Course.updateOne({ _id: course._id }, { $inc: { views: 1 } }).catch(() => {});

  let enrollment = null;
  if (req.user) {
    enrollment = await Enrollment.findOne({ user: req.userId, course: course._id })
      .select('status progressPercent completedLessons certificate enrolledAt')
      .lean();
  }

  res.json({ success: true, course, enrollment });
});

exports.getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.userId })
    .select('title slug thumbnail category level price status ratingSummary enrolledCount views updatedAt createdAt')
    .sort({ updatedAt: -1 });
  res.json({ success: true, courses });
});

exports.createCourse = asyncHandler(async (req, res) => {
  const { title, shortDescription, description, category, level, price, thumbnail, tags, curriculum } = req.body;

  const slug = await ensureUniqueSlug(makeSlug(title));
  const course = await Course.create({
    title: sanitizePlainText(title, 150),
    slug,
    shortDescription: sanitizePlainText(shortDescription, 180),
    description: sanitizeRichText(description),
    category: sanitizePlainText(category, 60),
    level: ['beginner', 'intermediate', 'advanced', 'all-levels'].includes(level) ? level : 'all-levels',
    price: Math.max(0, Number(price) || 0),
    thumbnail: thumbnail && /^https?:\/\//.test(String(thumbnail)) ? String(thumbnail).slice(0, 500) : '',
    tags: Array.isArray(tags) ? tags.map((t) => sanitizePlainText(t, 30)).filter(Boolean).slice(0, 10) : [],
    curriculum: normalizeCurriculum(curriculum),
    instructor: req.userId,
    status: 'draft',
  });

  res.status(201).json({ success: true, message: 'Course created as draft.', course });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.userId) {
    throw new ApiError(403, 'You can only edit your own courses.');
  }

  const { title, shortDescription, description, category, level, price, thumbnail, tags, curriculum, featured } = req.body;

  if (title !== undefined) course.title = sanitizePlainText(title, 150);
  if (shortDescription !== undefined) course.shortDescription = sanitizePlainText(shortDescription, 180);
  if (description !== undefined) course.description = sanitizeRichText(description);
  if (category !== undefined) course.category = sanitizePlainText(category, 60);
  if (level !== undefined && ['beginner', 'intermediate', 'advanced', 'all-levels'].includes(level)) course.level = level;
  if (price !== undefined) course.price = Math.max(0, Number(price) || 0);
  if (thumbnail !== undefined) course.thumbnail = thumbnail && /^https?:\/\//.test(String(thumbnail)) ? String(thumbnail).slice(0, 500) : '';
  if (tags !== undefined) course.tags = Array.isArray(tags) ? tags.map((t) => sanitizePlainText(t, 30)).filter(Boolean).slice(0, 10) : [];
  if (curriculum !== undefined) course.curriculum = normalizeCurriculum(curriculum);
  if (featured !== undefined && req.user.role === 'admin') course.featured = Boolean(featured);

  await course.save();
  res.json({ success: true, message: 'Course updated.', course });
});

exports.publishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.userId) {
    throw new ApiError(403, 'You can only publish your own courses.');
  }

  course.status = course.status === 'published' ? 'draft' : 'published';
  course.publishedAt = course.status === 'published' ? new Date() : course.publishedAt;
  await course.save();

  res.json({ success: true, message: `Course ${course.status}.`, course });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.userId) {
    throw new ApiError(403, 'You can only delete your own courses.');
  }

  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Review.deleteMany({ course: course._id }),
    Certificate.deleteMany({ course: course._id }),
    course.deleteOne(),
  ]);

  res.json({ success: true, message: 'Course and related data deleted.' });
});
