const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
        'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');

    res.json({users: result.rows});
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const {id} = req.params;

    const result = await db.query(
        'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
        [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({user: result.rows[0]});
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const {id} = req.params;
    const {name, email, phone, password} = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // Check if user can update (own profile or admin)
    if (id !== requestUserId && requestUserRole !== 'admin') {
      return res.status(403).json(
          {error: 'Not authorized to update this user'});
    }

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await db.query(
          'SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({error: 'Email already in use'});
      }
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Update user
    const result = await db.query(
        'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), password = COALESCE($4, password) WHERE id = $5 RETURNING id, name, email, phone, role, created_at',
        [name, email, phone, hashedPassword, id]);

    res.json({message: 'User updated successfully', user: result.rows[0]});
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const {id} = req.params;

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({message: 'User deleted successfully'});
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const {id} = req.params;
    const {role} = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({error: 'Invalid role'});
    }

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    const result = await db.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, created_at',
        [role, id]);

    res.json({message: 'User role updated successfully', user: result.rows[0]});
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({error: 'Server error'});
  }
};
