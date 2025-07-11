const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const voteController = require('../controllers/voteController');

// Get all votes
router.get('/', voteController.getAll);

// Get vote summary
router.get('/summary',  voteController.getSummary);

module.exports = router;