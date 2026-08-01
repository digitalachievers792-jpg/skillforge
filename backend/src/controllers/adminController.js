const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Review = require('../models/Review');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const Certificate = require('../models/Certificate');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, paginate } = require('../utils/helpers');

const lastMonths = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

const fillMonths = (key, series, months, startValue) =>
  months.map((m) => ({ month: m, [key]: series[m] || startValue }));

exports.stats = asyncHandler(async (req, res) => {
  const [
    totalUsers, students, instructors, admins,
    totalCourses, publishedCourses, draftCourses,
    totalEnrollments, totalJobs, totalApplications,
    totalPosts, totalReviews, totalCertificates,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Course.countDocuments({ status: 'draft' }),
    Enrollment.countDocuments(),
    Job.countDocuments(),
    JobApplication.countDocuments(),
    ForumPost.countDocuments(),
    Review.countDocuments(),
    Certificate.countDocuments(),
    Enrollment.aggregate([
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: null, total: { $sum: '$c.price' } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, students, instructors, admins },
      courses: { total: totalCourses, published: publishedCourses, draft: draftCourses },
      enrollments: totalEnrollments,
      jobs: totalJobs,
      applications: totalApplications,
      posts: totalPosts,
      reviews: totalReviews,
      certificates: totalCertificates,
      revenue,
    },
  });
});

exports.analytics = asyncHandler(async (req, res) => {
  const months = lastMonths(6);

  const [enrollSeries, revenueSeries, popularCourses, ratingDistribution, recentEnrollments] = await Promise.all([
    Enrollment.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$enrolledAt' } }, count: { $sum: 1 } } },
    ]),
    Enrollment.aggregate([
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$enrolledAt' } }, total: { $sum: '$c.price' } } },
    ]),
    Course.find({ status: 'published' })
      .select('title enrolledCount ratingSummary')
      .sort({ enrolledCount: -1 })
      .limit(5),
    Review.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }]),
    Enrollment.find()
      .populate('course', 'title')
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const eMap = Object.fromEntries(enrollSeries.map((e) => [e._id, e.count]));
  const rMap = Object.fromEntries(revenueSeries.map((e) => [e._id, e.total]));
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingDistribution.forEach((d) => {
    if (dist[d._id] !== undefined) dist[d._id] = d.count;
  });

  res.json({
    success: true,
    analytics: {
      enrollmentsOverTime: fillMonths('count', eMap, months),
      revenueOverTime: fillMonths('revenue', rMap, months),
      popularCourses,
      ratingDistribution: Object.entries(dist).map(([rating, count]) => ({ rating: Number(rating), count })),
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e._id,
        course: e.course?.title || 'Deleted course',
        user: e.user?.name || 'Deleted user',
        avatar: e.user?.avatar || '',
        date: e.createdAt,
      })),
    },
  });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 12);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('name email avatar role isActive createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.userId && (req.body.role || req.body.isActive === false)) {
    throw new ApiError(400, 'You cannot change your own role or deactivate yourself.');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (req.body.role !== undefined) {
    if (!['student', 'instructor', 'admin'].includes(req.body.role)) throw new ApiError(400, 'Invalid role.');
    user.role = req.body.role;
  }
  if (req.body.isActive !== undefined) user.isActive = Boolean(req.body.isActive);

  await user.save();
  res.json({ success: true, message: 'User updated.', user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.userId) throw new ApiError(400, 'You cannot delete your own account.');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  const enrollments = await Enrollment.find({ user: user._id }).select('_id course');
  const courseIds = enrollments.map((e) => e.course);

  await Promise.all([
    Enrollment.deleteMany({ user: user._id }),
    Review.deleteMany({ user: user._id }),
    ForumPost.deleteMany({ author: user._id }),
    ForumComment.deleteMany({ author: user._id }),
    JobApplication.deleteMany({ user: user._id }),
    Certificate.deleteMany({ user: user._id }),
    user.deleteOne(),
  ]);

  if (courseIds.length) {
    await Course.updateMany({ _id: { $in: courseIds } }, { $inc: { enrolledCount: -1 } });
  }

  res.json({ success: true, message: 'User and related data deleted.' });
});

exports.listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 12);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.title = new RegExp(escapeRegex(req.query.q), 'i');

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name')
      .select('title slug category level price status featured ratingSummary enrolledCount instructor createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({ success: true, courses, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (req.body.status !== undefined) {
    if (!['draft', 'published'].includes(req.body.status)) throw new ApiError(400, 'Invalid status.');
    course.status = req.body.status;
    if (course.status === 'published' && !course.publishedAt) course.publishedAt = new Date();
  }
  if (req.body.featured !== undefined) course.featured = Boolean(req.body.featured);
  await course.save();
  res.json({ success: true, message: 'Course updated.', course });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Review.deleteMany({ course: course._id }),
    Certificate.deleteMany({ course: course._id }),
    course.deleteOne(),
  ]);
  res.json({ success: true, message: 'Course deleted.' });
});

exports.listJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 12);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.title = new RegExp(escapeRegex(req.query.q), 'i');

  const [jobs, total] = await Promise.all([
    Job.find(filter).select('title company locationCity type mode status applicantsCount createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, jobs, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');
  await job.deleteOne();
  await User.updateMany({ savedJobs: job._id }, { $pull: { savedJobs: job._id } });
  res.json({ success: true, message: 'Job removed.' });
});

exports.listForumPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 12);
  const filter = {};
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ title: regex }, { body: regex }];
  }

  const [posts, total] = await Promise.all([
    ForumPost.find(filter).populate('author', 'name').select('title tags score views commentCount author createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
    ForumPost.countDocuments(filter),
  ]);

  res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.deleteForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  await Promise.all([ForumComment.deleteMany({ post: post._id }), post.deleteOne()]);
  res.json({ success: true, message: 'Post removed.' });
});

exports.listReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 12);
  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('user', 'name')
      .populate('course', 'title')
      .select('rating title body user course createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.json({ success: true, reviews, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  await review.deleteOne();
  res.json({ success: true, message: 'Review removed.' });
});
