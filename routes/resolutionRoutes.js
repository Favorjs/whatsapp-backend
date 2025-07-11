const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const resolutionController = require('../controllers/resolutionController');

// Get all resolutions
router.get('/',  resolutionController.getAll);

// Create new resolution
router.post('/',resolutionController.create);

// Activate resolution for voting
router.post('/:id/activate', resolutionController.activate);

// Complete resolution
router.post('/:id/complete', resolutionController.complete);

module.exports = router;