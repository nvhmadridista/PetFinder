const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const db = require('../config/database');

// Register user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password, phone, role} = req.body;

    // Check if user exists
    const userExists =
        await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({error: 'User already exists'});
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
        [name, email, hashedPassword, phone || null, role || 'user']);

    const user = result.rows[0];

    // Create token
    const token = jwt.sign(
        {userId: user.id, role: user.role}, process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE});

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    // Check if user exists
    const result =
        await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({error: 'Invalid credentials'});
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({error: 'Invalid credentials'});
    }

    // Create token
    const token = jwt.sign(
        {userId: user.id, role: user.role}, process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE});

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const result = await db.query(
        'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
        [req.user.id]);

    res.json({user: result.rows[0]});
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({error: 'Server error'});
  }
};
