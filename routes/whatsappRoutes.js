const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const whatsappController = require('../controllers/whatsappController');

// WhatsApp webhook
router.post('/', whatsappController.processVote);

// Send introductory messages (admin only)
router.post('/intro',  whatsappController.sendIntroMessages);

// Start resolution voting (admin only)
router.post('/start/:resolutionId', whatsappController.startResolutionVoting);

module.exports = router;