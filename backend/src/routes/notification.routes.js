const express = require('express');
const {authMiddleware, adminMiddleware} =
    require('../middleware/auth.middleware');
const notificationController =
    require('../controllers/notification.controller');

const router = express.Router();

// Get user notifications (authenticated)
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Get unread count (authenticated)
router.get(
    '/unread/count', authMiddleware, notificationController.getUnreadCount);

// Create notification (admin only)
router.post(
    '/', authMiddleware, adminMiddleware,
    notificationController.createNotification);

// Mark notification as read (authenticated)
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark all as read (authenticated)
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// Delete notification (authenticated)
router.delete(
    '/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
