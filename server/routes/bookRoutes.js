const express = require('express');
const {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    getUploadSignature,
    getTrendingBooks,
    getBooksByGenre
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getBooks)
    .post(protect, createBook);

router.get('/upload-signature', protect, getUploadSignature);
router.get('/trending', getTrendingBooks);
router.get('/genre/:genreId', getBooksByGenre);

router.route('/:id')
    .get(getBook)
    .put(protect, updateBook)
    .delete(protect, deleteBook);

module.exports = router;
