const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { randomToken } = require('../utils/helpers');
const { createNotification } = require('../utils/notifications');

exports.enroll = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, status: 'published' });
  if (!course) throw new ApiError(404, 'Course not found.');

  const existing = await Enrollment.findOne({ user: req.userId, course: course._id });
  if (existing) throw new ApiError(409, 'You are already enrolled in this course.');

  const enrollment = await Enrollment.create({ user: req.userId, course: course._id });
  await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });

  await createNotification({
    recipient: req.userId,
    type: 'enrollment',
    title: 'Enrolled successfully 🎓',
    message: `You are now enrolled in "${course.title}". Good luck learning!`,
    link: `/courses/${course._id}`,
  });
  await createNotification({
    recipient: course.instructor,
    type: 'enrollment',
    title: 'New student enrolled',
    message: `${req.user.name} enrolled in your course "${course.title}".`,
    link: `/dashboard/instructor`,
  });

  res.status(201).json({ success: true, message: 'Enrolled successfully (demo payment processed).', enrollment });
});

exports.myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.userId })
    .populate('course', 'title slug thumbnail category level price ratingSummary instructor')
    .populate('certificate', 'code issuedAt')
    .sort({ enrolledAt: -1 });

  res.json({ success: true, enrollments });
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;
  if (!mongoose.isValidObjectId(lessonId)) throw new ApiError(400, 'Valid lessonId is required.');

  const enrollment = await Enrollment.findOne({ user: req.userId, course: req.params.courseId });
  if (!enrollment) throw new ApiError(404, 'You are not enrolled in this course.');

  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, 'Course not found.');

  const allLessons = course.curriculum.flatMap((s) => s.lessons);
  if (!allLessons.some((l) => l._id.toString() === lessonId)) {
    throw new ApiError(400, 'Lesson does not exist in this course.');
  }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }

  enrollment.progressPercent = Math.round((enrollment.completedLessons.length / Math.max(allLessons.length, 1)) * 100);

  if (enrollment.progressPercent >= 100 && enrollment.status === 'active') {
    enrollment.status = 'completed';
    if (!enrollment.certificate) {
      const certificate = await Certificate.create({
        user: req.userId,
        course: course._id,
        code: randomToken(5).toUpperCase(),
      });
      enrollment.certificate = certificate._id;
      await createNotification({
        recipient: req.userId,
        type: 'certificate',
        title: 'Certificate earned 🏆',
        message: `Congratulations! You completed "${course.title}" and earned a certificate.`,
        link: `/certificates/${certificate.code}`,
      });
    }
  }

  await enrollment.save();
  res.json({
    success: true,
    message: 'Progress updated.',
    enrollment,
    certificateCode: enrollment.status === 'completed' && enrollment.certificate ? (await Certificate.findById(enrollment.certificate))?.code : null,
  });
});

exports.myCertificate = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ user: req.userId, course: req.params.courseId }).populate('certificate');
  if (!enrollment?.certificate) throw new ApiError(404, 'No certificate yet. Complete the course to earn one.');

  res.json({ success: true, certificate: enrollment.certificate, enrollment });
});

exports.publicCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ code: req.params.code.toUpperCase() })
    .populate('course', 'title category')
    .populate('user', 'name');
  if (!certificate) throw new ApiError(404, 'Certificate not found.');

  res.json({ success: true, certificate });
});
