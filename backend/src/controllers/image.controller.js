const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: 'No file uploaded'});
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({message: 'Image uploaded successfully', imageUrl});
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get image and check ownership
    const imageCheck = await db.query(
        'SELECT i.*, p.user_id FROM images i JOIN posts p ON i.post_id = p.id WHERE i.id = $1',
        [id]);

    if (imageCheck.rows.length === 0) {
      return res.status(404).json({error: 'Image not found'});
    }

    const image = imageCheck.rows[0];

    if (image.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json(
          {error: 'Not authorized to delete this image'});
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../..', image.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query('DELETE FROM images WHERE id = $1', [id]);

    res.json({message: 'Image deleted successfully'});
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({error: 'Server error'});
  }
};
