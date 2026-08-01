const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, escapeRegex } = require('../utils/helpers');

const lastMonths = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

const instructorCourseIds = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId }).select('_id');
  return courses.map((c) => c._id);
};

exports.stats = asyncHandler(async (req, res) => {
  const courseIds = await instructorCourseIds(req.userId);

  const [courses, totalStudents, totalRevenue, ratingAgg, recentEnrollments] = await Promise.all([
    Course.find({ instructor: req.userId }).select('title status enrolledCount ratingSummary publishedAt createdAt'),
    Enrollment.countDocuments({ course: { $in: courseIds } }),
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: null, total: { $sum: '$c.price' } } },
    ]),
    Course.aggregate([
      { $match: { instructor: req.userId } },
      { $group: { _id: null, avg: { $avg: '$ratingSummary.average' }, count: { $sum: 1 } } },
    ]),
    Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  const ratings = ratingAgg[0] || { avg: 0, count: 0 };

  res.json({
    success: true,
    stats: {
      courseCount: courses.length,
      publishedCount: courses.filter((c) => c.status === 'published').length,
      totalStudents,
      revenue: totalRevenue[0]?.total || 0,
      avgRating: Math.round(ratings.avg * 10) / 10,
      ratingCount: ratings.count,
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e._id,
        course: e.course?.title || 'Deleted course',
        student: e.user?.name || 'Deleted user',
        avatar: e.user?.avatar || '',
        progress: e.progressPercent,
        date: e.createdAt,
      })),
    },
  });
});

exports.analytics = asyncHandler(async (req, res) => {
  const courseIds = await instructorCourseIds(req.userId);
  const months = lastMonths(6);

  const [enrollSeries, revenueSeries, ratingDistribution, popularCourses] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$enrolledAt' } }, count: { $sum: 1 } } },
    ]),
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$enrolledAt' } }, total: { $sum: '$c.price' } } },
    ]),
    Review.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
    Course.find({ instructor: req.userId, status: 'published' })
      .select('title enrolledCount ratingSummary')
      .sort({ enrolledCount: -1 })
      .limit(5),
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
      enrollmentsOverTime: months.map((m) => ({ month: m, count: eMap[m] || 0 })),
      revenueOverTime: months.map((m) => ({ month: m, revenue: rMap[m] || 0 })),
      ratingDistribution: Object.entries(dist).map(([rating, count]) => ({ rating: Number(rating), count })),
      popularCourses,
    },
  });
});

exports.myCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.userId })
    .select('title slug thumbnail category level price status featured ratingSummary enrolledCount views createdAt updatedAt')
    .sort({ updatedAt: -1 });
  res.json({ success: true, courses });
});

exports.courseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, instructor: req.userId });
  if (!course) throw new ApiError(404, 'Course not found.');

  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 10);
  const [enrollments, total] = await Promise.all([
    Enrollment.find({ course: course._id })
      .populate('user', 'name email avatar headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments({ course: course._id }),
  ]);

  const lessons = course.curriculum.flatMap((s) => s.lessons);

  res.json({
    success: true,
    students: enrollments.map((e) => ({
      id: e._id,
      user: e.user,
      enrolledAt: e.enrolledAt,
      progressPercent: e.progressPercent,
      status: e.status,
      lessonsDone: e.completedLessons.length,
      totalLessons: lessons.length,
    })),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

exports.courseDetail = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, instructor: req.userId });
  if (!course) throw new ApiError(404, 'Course not found.');

  const recentEnrollments = await Enrollment.find({ course: course._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    course,
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e._id,
      student: e.user?.name || 'Deleted user',
      avatar: e.user?.avatar || '',
      progress: e.progressPercent,
      date: e.createdAt,
    })),
  });
});

exports.searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, students: [] });
  const regex = new RegExp(escapeRegex(q), 'i');

  const myCourses = await Course.find({ instructor: req.userId }).select('_id');
  const courseIds = myCourses.map((c) => c._id);
  if (!courseIds.length) return res.json({ success: true, students: [] });

  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate({ path: 'user', match: { name: regex }, select: 'name avatar email' })
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, students: enrollments.filter((e) => e.user) });
});
