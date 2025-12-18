const express = require('express');
const {authMiddleware} = require('../middleware/auth.middleware');
const petController = require('../controllers/pet.controller');

const router = express.Router();

// Get pet by ID
router.get('/:id', petController.getPetById);

// Update pet (authenticated, owner or admin)
router.put('/:id', authMiddleware, petController.updatePet);

module.exports = router;
