const express = require('express');
const { interactWithBook, getMyLibrary, removeInteraction } = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my-library', getMyLibrary);
router.post('/:bookId', interactWithBook);
router.delete('/:bookId', removeInteraction);

module.exports = router;
