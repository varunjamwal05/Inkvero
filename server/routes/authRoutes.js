const express = require('express');
const { register, login, logout, refresh, getMe } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
