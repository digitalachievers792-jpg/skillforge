const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/helpers');
const { sanitizePlainText } = require('../utils/sanitize');
const { saveFile } = require('../utils/gridfs');
const { createNotification } = require('../utils/notifications');
const User = require('../models/User');

exports.apply = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, status: 'open' });
  if (!job) throw new ApiError(404, 'Job not found or no longer open.');

  const existing = await JobApplication.findOne({ job: job._id, user: req.userId });
  if (existing) throw new ApiError(409, 'You have already applied to this job.');

  const user = await User.findById(req.userId);
  let resumePath = '';
  let resumeName = '';

  if (req.file) {
    resumePath = await saveFile(req.file);
    resumeName = req.file.originalname.slice(0, 120);
  } else if (user.resume && user.resume.path) {
    resumePath = user.resume.path;
    resumeName = user.resume.name;
  } else {
    throw new ApiError(400, 'Please upload a resume (PDF or DOCX, max 5MB).');
  }

  const application = await JobApplication.create({
    job: job._id,
    user: req.userId,
    name: sanitizePlainText(req.body.name, 80),
    email: sanitizePlainText(req.body.email, 120),
    phone: sanitizePlainText(req.body.phone, 30),
    coverLetter: sanitizePlainText(req.body.coverLetter, 3000),
    resumePath,
    resumeName,
  });

  await Job.updateOne({ _id: job._id }, { $inc: { applicantsCount: 1 } });

  const admins = await User.find({ role: 'admin' }).select('_id');
  for (const admin of admins) {
    await createNotification({
      recipient: admin._id,
      type: 'application',
      title: 'New job application',
      message: `${application.name} applied for "${job.title}" at ${job.company}.`,
      link: `/dashboard/admin?tab=applications`,
    });
  }
  await createNotification({
    recipient: req.userId,
    type: 'application',
    title: 'Application submitted ✅',
    message: `Your application for "${job.title}" at ${job.company} was submitted successfully.`,
    link: `/jobs/${job._id}`,
  });

  res.status(201).json({ success: true, message: 'Application submitted successfully.', application });
});

exports.myApplications = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ user: req.userId })
    .populate('job', 'title company locationCity mode type status')
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

exports.listApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 10);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.job) filter.job = req.query.job;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter)
      .populate('job', 'title company locationCity mode type')
      .populate('user', 'name email avatar headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JobApplication.countDocuments(filter),
  ]);

  res.json({ success: true, applications, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(req.params.id).populate('job', 'title company');
  if (!application) throw new ApiError(404, 'Application not found.');

  const status = req.body.status;
  if (!['pending', 'shortlisted', 'rejected', 'hired'].includes(status)) {
    throw new ApiError(400, 'Invalid status.');
  }
  application.status = status;
  await application.save();

  await createNotification({
    recipient: application.user,
    type: 'application',
    title: `Application ${status}`,
    message: `Your application for "${application.job.title}" at ${application.job.company} was ${status}.`,
    link: `/dashboard?tab=applications`,
  });

  res.json({ success: true, message: `Application marked ${status}.`, application });
});
