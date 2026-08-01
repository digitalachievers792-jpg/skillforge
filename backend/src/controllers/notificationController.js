const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/helpers');

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit || 10);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipient: req.userId }),
    Notification.countDocuments({ recipient: req.userId, isRead: false }),
  ]);

  res.json({ success: true, notifications, total, page, pages: Math.ceil(total / limit) || 1, unreadCount });
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.userId });
  if (!notification) throw new ApiError(404, 'Notification not found.');

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({ success: true, notification });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

exports.clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.userId, isRead: true });
  res.json({ success: true, message: 'Read notifications cleared.' });
});
