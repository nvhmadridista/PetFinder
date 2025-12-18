const {validationResult} = require('express-validator');
const db = require('../config/database');

// Create post
exports.createPost = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {
      type,
      title,
      description,
      latitude,
      longitude,
      address,
      pet,
      images
    } = req.body;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Create post
    const postResult = await client.query(
        'INSERT INTO posts (user_id, type, title, description, latitude, longitude, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, type, title, description, latitude, longitude, address]);

    const post = postResult.rows[0];

    // Create pet record
    if (pet) {
      await client.query(
          'INSERT INTO pets (post_id, species, breed, color, gender, characteristics) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            post.id, pet.species, pet.breed || null, pet.color || null,
            pet.gender || null, pet.characteristics || null
          ]);
    }

    // Create image records
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        await client.query(
            'INSERT INTO images (post_id, image_url) VALUES ($1, $2)',
            [post.id, imageUrl]);
      }
    }

    await client.query('COMMIT');

    // Fetch complete post with relations
    const completePost = await getCompletePost(post.id);

    res.status(201).json(
        {message: 'Post created successfully', post: completePost});
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create post error:', error);
    res.status(500).json({error: 'Server error'});
  } finally {
    client.release();
  }
};

// Get all posts with filters
exports.getPosts = async (req, res) => {
  try {
    const {type, status, species, latitude, longitude, radius} = req.query;

    let query = `
      SELECT p.*, u.name as user_name, u.phone as user_phone,
             json_agg(DISTINCT jsonb_build_object('id', pet.id, 'species', pet.species, 'breed', pet.breed, 'color', pet.color, 'gender', pet.gender, 'characteristics', pet.characteristics)) as pets,
             json_agg(DISTINCT jsonb_build_object('id', img.id, 'image_url', img.image_url)) FILTER (WHERE img.id IS NOT NULL) as images
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN pets pet ON p.id = pet.post_id
      LEFT JOIN images img ON p.id = img.post_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND p.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (species) {
      query += ` AND pet.species ILIKE $${paramCount}`;
      params.push(`%${species}%`);
      paramCount++;
    }

    // Radius search (in kilometers)
    if (latitude && longitude && radius) {
      query += ` AND (
        6371 * acos(
          cos(radians($${paramCount})) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians($${paramCount + 1})) +
          sin(radians($${paramCount})) * sin(radians(p.latitude))
        )
      ) <= $${paramCount + 2}`;
      params.push(
          parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
      paramCount += 3;
    }

    query += ` GROUP BY p.id, u.name, u.phone ORDER BY p.created_at DESC`;

    const result = await db.query(query, params);

    res.json({posts: result.rows});
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const {id} = req.params;
    const post = await getCompletePost(id);

    if (!post) {
      return res.status(404).json({error: 'Post not found'});
    }

    res.json({post});
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const {id} = req.params;
    const {title, description, status, latitude, longitude, address} = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if post exists and user is owner or admin
    const postCheck = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({error: 'Post not found'});
    }

    if (postCheck.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json(
          {error: 'Not authorized to update this post'});
    }

    // Update post
    const result = await db.query(
        'UPDATE posts SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), latitude = COALESCE($4, latitude), longitude = COALESCE($5, longitude), address = COALESCE($6, address) WHERE id = $7 RETURNING *',
        [title, description, status, latitude, longitude, address, id]);

    const post = await getCompletePost(id);

    res.json({message: 'Post updated successfully', post});
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if post exists and user is owner or admin
    const postCheck = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({error: 'Post not found'});
    }

    if (postCheck.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json(
          {error: 'Not authorized to delete this post'});
    }

    await db.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({message: 'Post deleted successfully'});
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT p.*, 
             json_agg(DISTINCT jsonb_build_object('id', pet.id, 'species', pet.species, 'breed', pet.breed, 'color', pet.color, 'gender', pet.gender, 'characteristics', pet.characteristics)) as pets,
             json_agg(DISTINCT jsonb_build_object('id', img.id, 'image_url', img.image_url)) FILTER (WHERE img.id IS NOT NULL) as images
      FROM posts p
      LEFT JOIN pets pet ON p.id = pet.post_id
      LEFT JOIN images img ON p.id = img.post_id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({posts: result.rows});
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Helper function to get complete post with relations
async function getCompletePost(postId) {
  const query = `
    SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
           json_agg(DISTINCT jsonb_build_object('id', pet.id, 'species', pet.species, 'breed', pet.breed, 'color', pet.color, 'gender', pet.gender, 'characteristics', pet.characteristics)) as pets,
           json_agg(DISTINCT jsonb_build_object('id', img.id, 'image_url', img.image_url)) FILTER (WHERE img.id IS NOT NULL) as images
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN pets pet ON p.id = pet.post_id
    LEFT JOIN images img ON p.id = img.post_id
    WHERE p.id = $1
    GROUP BY p.id, u.name, u.email, u.phone
  `;

  const result = await db.query(query, [postId]);
  return result.rows[0] || null;
}
