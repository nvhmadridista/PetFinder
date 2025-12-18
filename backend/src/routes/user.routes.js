const express = require('express');
const {authMiddleware, adminMiddleware} =
    require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

// Delete user (admin only)
router.delete(
    '/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// Update user role (admin only)
router.patch(
    '/:id/role', authMiddleware, adminMiddleware,
    userController.updateUserRole);

module.exports = router;
