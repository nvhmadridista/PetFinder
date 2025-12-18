const db = require('../config/database');

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const {user_id, post_id, message} = req.body;

    const result = await db.query(
        'INSERT INTO notifications (user_id, post_id, message) VALUES ($1, $2, $3) RETURNING *',
        [user_id, post_id, message]);

    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {unread_only} = req.query;

    let query = `
      SELECT n.*, p.title as post_title, p.type as post_type
      FROM notifications n
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = $1
    `;

    if (unread_only === 'true') {
      query += ' AND n.is_read = false';
    }

    query += ' ORDER BY n.created_at DESC';

    const result = await db.query(query, [userId]);

    res.json({notifications: result.rows});
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.id;

    // Check if notification belongs to user
    const notifCheck = await db.query(
        'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
        [id, userId]);

    if (notifCheck.rows.length === 0) {
      return res.status(404).json({error: 'Notification not found'});
    }

    const result = await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
        [id]);

    res.json(
        {message: 'Notification marked as read', notification: result.rows[0]});
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
        [userId]);

    res.json({message: 'All notifications marked as read'});
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.id;

    // Check if notification belongs to user
    const notifCheck = await db.query(
        'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
        [id, userId]);

    if (notifCheck.rows.length === 0) {
      return res.status(404).json({error: 'Notification not found'});
    }

    await db.query('DELETE FROM notifications WHERE id = $1', [id]);

    res.json({message: 'Notification deleted successfully'});
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
        [userId]);

    res.json({count: parseInt(result.rows[0].count)});
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({error: 'Server error'});
  }
};
