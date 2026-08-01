const Course = require('../models/Course');
const Job = require('../models/Job');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/helpers');

exports.search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const type = String(req.query.type || 'all');
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 10);

  if (!q) return res.json({ success: true, q, results: {}, total: 0 });

  const regex = new RegExp(escapeRegex(q), 'i');
  const [courses, jobs, forumPosts, instructors] = await Promise.all([
    type === 'courses' || type === 'all'
      ? Course.find({ status: 'published', $or: [{ title: regex }, { shortDescription: regex }, { tags: regex }, { category: regex }] })
          .select('_id title slug thumbnail category level price ratingSummary enrolledCount')
          .sort({ enrolledCount: -1 })
          .limit(limit)
          .lean()
      : [],
    type === 'jobs' || type === 'all'
      ? Job.find({ status: 'open', $or: [{ title: regex }, { company: regex }, { tags: regex }] })
          .select('_id title company locationCity mode type')
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      : [],
    type === 'forum' || type === 'all'
      ? ForumPost.find({ $or: [{ title: regex }, { tags: regex }] })
          .select('_id title tags score commentCount')
          .sort({ score: -1 })
          .limit(limit)
          .lean()
      : [],
    type === 'instructors' || type === 'all'
      ? User.find({ role: 'instructor', isActive: true, $or: [{ name: regex }, { skills: regex }, { headline: regex }] })
          .select('_id name avatar headline')
          .limit(limit)
          .lean()
      : [],
  ]);

  const results = { courses, jobs, forum: forumPosts, instructors };
  const total = courses.length + jobs.length + forumPosts.length + instructors.length;

  res.json({ success: true, q, results, total });
});
