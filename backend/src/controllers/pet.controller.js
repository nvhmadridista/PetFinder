const db = require('../config/database');

// Update pet information
exports.updatePet = async (req, res) => {
  try {
    const {id} = req.params;
    const {species, breed, color, gender, characteristics} = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if pet exists and user is owner or admin
    const petCheck = await db.query(
        'SELECT p.*, po.user_id FROM pets p JOIN posts po ON p.post_id = po.id WHERE p.id = $1',
        [id]);

    if (petCheck.rows.length === 0) {
      return res.status(404).json({error: 'Pet not found'});
    }

    if (petCheck.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({error: 'Not authorized to update this pet'});
    }

    const result = await db.query(
        'UPDATE pets SET species = COALESCE($1, species), breed = COALESCE($2, breed), color = COALESCE($3, color), gender = COALESCE($4, gender), characteristics = COALESCE($5, characteristics) WHERE id = $6 RETURNING *',
        [species, breed, color, gender, characteristics, id]);

    res.json({message: 'Pet updated successfully', pet: result.rows[0]});
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const {id} = req.params;

    const result = await db.query('SELECT * FROM pets WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Pet not found'});
    }

    res.json({pet: result.rows[0]});
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({error: 'Server error'});
  }
};
