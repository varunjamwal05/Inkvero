const express = require('express');
const {
    deleteBook,
    toggleHideBook,
    toggleVerifyBook,
    banUser,
    unbanUser,
    deleteGroup,
    transferGroupOwnership,
    getGenres,
    createGenre,
    deleteGenre
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Apply protection and admin check to all routes
router.use(protect);
router.use(requireAdmin);

// Book Routes
router.delete('/books/:id', deleteBook);
router.patch('/books/:id/hide', toggleHideBook);
router.patch('/books/:id/verify', toggleVerifyBook);

// User Routes
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Group Routes
router.delete('/groups/:id', deleteGroup);
router.patch('/groups/:id/transfer/:newOwnerId', transferGroupOwnership);

// Genre Routes
router.route('/genres')
    .get(getGenres)
    .post(createGenre);

router.delete('/genres/:id', deleteGenre);

module.exports = router;
