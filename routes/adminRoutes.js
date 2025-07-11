const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Admin login
router.post('/login', adminController.login);

// Admin dashboard (protected)
router.get('/dashboard', authenticate, adminOnly, adminController.getDashboard);

// Create admin (superadmin only)
router.post('/', adminController.createAdmin);

module.exports = router;