const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userProfileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/me', getProfile);
router.patch('/me', updateProfile);

module.exports = router;
