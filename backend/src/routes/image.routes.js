const express = require('express');
const {authMiddleware} = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const imageController = require('../controllers/image.controller');

const router = express.Router();

// Upload image (authenticated)
router.post(
    '/upload', authMiddleware, upload.single('image'),
    imageController.uploadImage);

// Delete image (authenticated, owner or admin)
router.delete('/:id', authMiddleware, imageController.deleteImage);

module.exports = router;
