const express = require('express');
const {body} = require('express-validator');
const {authMiddleware} = require('../middleware/auth.middleware');
const postController = require('../controllers/post.controller');

const router = express.Router();

// Get all posts (public with filters)
router.get('/', postController.getPosts);

// Get single post (public)
router.get('/:id', postController.getPost);

// Create post (authenticated)
router.post(
    '/', authMiddleware,
    [
      body('type')
          .isIn(['LOST', 'FOUND'])
          .withMessage('Type must be LOST or FOUND'),
      body('title').notEmpty().withMessage('Title is required'),
      body('latitude').isFloat().withMessage('Valid latitude is required'),
      body('longitude').isFloat().withMessage('Valid longitude is required'),
    ],
    postController.createPost);

// Update post (authenticated, owner or admin)
router.put('/:id', authMiddleware, postController.updatePost);

// Delete post (authenticated, owner or admin)
router.delete('/:id', authMiddleware, postController.deletePost);

// Get user's posts (authenticated)
router.get('/user/my-posts', authMiddleware, postController.getUserPosts);

module.exports = router;
