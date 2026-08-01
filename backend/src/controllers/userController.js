const User = require('../models/User');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sanitizePlainText } = require('../utils/sanitize');
const { saveFile, deleteFile } = require('../utils/gridfs');

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate('savedJobs', 'title company locationCity mode type');
  res.json({ success: true, user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, headline, bio, location, skills, socials } = req.body;
  const user = await User.findById(req.userId);

  if (name !== undefined) user.name = sanitizePlainText(name, 80);
  if (headline !== undefined) user.headline = sanitizePlainText(headline, 120);
  if (bio !== undefined) user.bio = sanitizePlainText(bio, 1000);
  if (location !== undefined) user.location = sanitizePlainText(location, 100);
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills.map((s) => sanitizePlainText(s, 30)).filter(Boolean).slice(0, 20)
      : [];
  }
  if (socials !== undefined && typeof socials === 'object') {
    const clean = {};
    for (const key of ['website', 'github', 'linkedin', 'twitter']) {
      const value = sanitizePlainText(socials[key], 200);
      clean[key] = value && /^https?:\/\//.test(value) ? value : '';
    }
    user.socials = clean;
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated.', user });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please choose an image file.');

  const user = await User.findById(req.userId);
  const newPath = await saveFile(req.file);
  if (user.avatar && user.avatar.startsWith('/api/uploads/')) await deleteFile(user.avatar);
  user.avatar = newPath;
  await user.save();

  res.json({ success: true, message: 'Avatar updated.', user });
});

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please choose a PDF or DOCX file.');

  const user = await User.findById(req.userId);
  const newPath = await saveFile(req.file);
  if (user.resume && user.resume.path && user.resume.path.startsWith('/api/uploads/')) {
    await deleteFile(user.resume.path);
  }
  user.resume = { path: newPath, name: req.file.originalname.slice(0, 120), uploadedAt: new Date() };
  await user.save();

  res.json({ success: true, message: 'Resume uploaded.', user });
});

exports.removeResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (user.resume && user.resume.path) await deleteFile(user.resume.path);
  user.resume = { path: '', name: '', uploadedAt: undefined };
  await user.save();
  res.json({ success: true, message: 'Resume removed.', user });
});

exports.getInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: 'instructor', isActive: true })
    .select('name avatar headline skills createdAt')
    .sort({ createdAt: 1 })
    .limit(50);

  const courseStats = await Course.aggregate([
    { $match: { status: 'published', instructor: { $in: instructors.map((i) => i._id) } } },
    { $group: { _id: '$instructor', courses: { $sum: 1 }, students: { $sum: '$enrolledCount' } } },
  ]);

  const statsMap = new Map(courseStats.map((s) => [s._id.toString(), s]));

  const result = instructors.map((i) => {
    const stats = statsMap.get(i._id.toString());
    return { ...i.toJSON(), courseCount: stats?.courses || 0, studentCount: stats?.students || 0 };
  });

  res.json({ success: true, instructors: result });
});

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatar headline bio location skills socials role createdAt');
  if (!user) throw new ApiError(404, 'User not found.');

  const courses = await Course.find({ instructor: user._id, status: 'published' })
    .select('title slug thumbnail category level price ratingSummary enrolledCount shortDescription')
    .sort({ enrolledCount: -1 })
    .limit(20);

  res.json({ success: true, profile: user, courses });
});
