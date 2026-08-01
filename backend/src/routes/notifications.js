const express = require('express');
const { getNotifications, markRead, markAllRead, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/clear-read', clearNotifications);

module.exports = router;
