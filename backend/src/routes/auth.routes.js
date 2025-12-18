const express = require('express');
const {body} = require('express-validator');
const authController = require('../controllers/auth.controller');
const {authMiddleware} = require('../middleware/auth.middleware');

const router = express.Router();

// Register
router.post(
    '/register',
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please provide a valid email'),
      body('password')
          .isLength({min: 6})
          .withMessage('Password must be at least 6 characters long'),
    ],
    authController.register);

// Login
router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Please provide a valid email'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
