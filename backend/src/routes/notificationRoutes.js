const express = require('express');
const router = express.Router();

const NotificationController = require('../controllers/notificationController');

router.get('/notifications', NotificationController.listNotifications);
router.get('/notifications/:id', NotificationController.getNotificationById);
router.post('/notifications', NotificationController.createNotification);
router.delete('/notifications/:id', NotificationController.deleteNotification);

module.exports = router;