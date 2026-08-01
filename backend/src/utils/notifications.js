const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type = 'system', title, message, link = '' }) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message: String(message).slice(0, 500),
      link,
    });
  } catch (err) {
    console.error('[notifications] Failed to create notification:', err.message);
  }
};

module.exports = { createNotification };
