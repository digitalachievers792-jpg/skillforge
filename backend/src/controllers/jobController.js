const Job = require('../models/Job');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, paginate } = require('../utils/helpers');
const { sanitizeRichText, sanitizePlainText } = require('../utils/sanitize');
const { createNotification } = require('../utils/notifications');

const JOB_SELECT = 'title company companyLogo locationCity locationCountry type mode salaryMin salaryMax currency tags status applicantsCount createdAt expiresAt';

exports.getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { status: 'open' };

  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ title: regex }, { company: regex }, { tags: regex }];
  }
  if (req.query.type) filter.type = req.query.type;
  if (req.query.mode) filter.mode = req.query.mode;
  if (req.query.location) {
    const regex = new RegExp(escapeRegex(req.query.location), 'i');
    filter.$or = [...(filter.$or || []), { locationCity: regex }, { locationCountry: regex }];
  }
  if (req.query.tag) filter.tags = sanitizePlainText(req.query.tag, 30);

  const sortMap = {
    newest: { createdAt: -1 },
    salary: { salaryMax: -1 },
    popular: { applicantsCount: -1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.newest;

  const [jobs, total] = await Promise.all([
    Job.find(filter).select(JOB_SELECT).sort(sort).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, jobs, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, status: 'open' }).select(JOB_SELECT + ' description requirements');
  if (!job) throw new ApiError(404, 'Job not found.');

  let isSaved = false;
  if (req.user) {
    const user = await User.findById(req.userId).select('savedJobs');
    isSaved = user.savedJobs.some((j) => j.toString() === req.params.id);
  }

  res.json({ success: true, job, isSaved });
});

exports.createJob = asyncHandler(async (req, res) => {
  const {
    title, company, companyLogo, locationCity, locationCountry, type, mode,
    salaryMin, salaryMax, currency, tags, description, requirements, expiresAt,
  } = req.body;

  const job = await Job.create({
    title: sanitizePlainText(title, 120),
    company: sanitizePlainText(company, 100),
    companyLogo: companyLogo && /^https?:\/\//.test(String(companyLogo)) ? String(companyLogo).slice(0, 500) : '',
    locationCity: sanitizePlainText(locationCity, 80),
    locationCountry: sanitizePlainText(locationCountry, 80),
    type: ['full-time', 'part-time', 'contract', 'internship', 'freelance'].includes(type) ? type : 'full-time',
    mode: ['remote', 'onsite', 'hybrid'].includes(mode) ? mode : 'remote',
    salaryMin: Math.max(0, Number(salaryMin) || 0),
    salaryMax: Math.max(0, Number(salaryMax) || 0),
    currency: sanitizePlainText(currency, 5) || '$',
    tags: Array.isArray(tags) ? tags.map((t) => sanitizePlainText(t, 30)).filter(Boolean).slice(0, 12) : [],
    description: sanitizeRichText(description),
    requirements: Array.isArray(requirements) ? requirements.map((r) => sanitizePlainText(r, 200)).filter(Boolean).slice(0, 15) : [],
    postedBy: req.userId,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  const matchingStudents = await User.find({
    role: 'student',
    isActive: true,
    skills: { $in: job.tags },
  }).select('_id').limit(100);

  for (const student of matchingStudents) {
    await createNotification({
      recipient: student._id,
      type: 'job_match',
      title: 'New job match 🔥',
      message: `A new "${job.title}" role at ${job.company} matches your skills.`,
      link: `/jobs/${job._id}`,
    });
  }

  res.status(201).json({ success: true, message: 'Job posted.', job, matchesNotified: matchingStudents.length });
});

exports.updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');

  const fields = [
    'title', 'company', 'companyLogo', 'locationCity', 'locationCountry', 'type',
    'mode', 'salaryMin', 'salaryMax', 'currency', 'tags', 'description', 'requirements', 'expiresAt',
  ];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (field === 'description') job.description = sanitizeRichText(req.body[field]);
      else if (field === 'tags') job.tags = Array.isArray(req.body[field]) ? req.body[field].map((t) => sanitizePlainText(t, 30)).filter(Boolean).slice(0, 12) : [];
      else if (field === 'requirements') job.requirements = Array.isArray(req.body[field]) ? req.body[field].map((r) => sanitizePlainText(r, 200)).filter(Boolean).slice(0, 15) : [];
      else if (field === 'salaryMin' || field === 'salaryMax') job[field] = Math.max(0, Number(req.body[field]) || 0);
      else if (field === 'type') job.type = ['full-time', 'part-time', 'contract', 'internship', 'freelance'].includes(req.body[field]) ? req.body[field] : job.type;
      else if (field === 'mode') job.mode = ['remote', 'onsite', 'hybrid'].includes(req.body[field]) ? req.body[field] : job.mode;
      else if (field === 'expiresAt') job.expiresAt = req.body[field] ? new Date(req.body[field]) : undefined;
      else job[field] = sanitizePlainText(req.body[field], 120);
    }
  }

  await job.save();
  res.json({ success: true, message: 'Job updated.', job });
});

exports.toggleJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');
  job.status = job.status === 'open' ? 'closed' : 'open';
  await job.save();
  res.json({ success: true, message: `Job marked ${job.status}.`, job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');
  await job.deleteOne();
  await User.updateMany({ savedJobs: job._id }, { $pull: { savedJobs: job._id } });
  res.json({ success: true, message: 'Job deleted.' });
});

exports.saveJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');
  const user = await User.findById(req.userId);

  if (!user.savedJobs.some((j) => j.toString() === job._id.toString())) {
    user.savedJobs.push(job._id);
    await user.save();
  }
  res.json({ success: true, message: 'Job saved.' });
});

exports.unsaveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  user.savedJobs = user.savedJobs.filter((j) => j.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, message: 'Job removed from saved.' });
});

exports.getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate({
    path: 'savedJobs',
    select: JOB_SELECT,
    match: { status: 'open' },
  });
  res.json({ success: true, jobs: user.savedJobs });
});
