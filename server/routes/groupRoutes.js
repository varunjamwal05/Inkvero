const express = require('express');
const {
    createGroup,
    joinGroup,
    getMyGroups,
    getGroup,
    getGroupByInviteCode,
    updateGroupProgress,
    getGroupsByBook,
    leaveGroup,
    deleteGroup,
    updateGroup,
    removeMember,
    getGroupMessages,
    postGroupMessage
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createGroup);
router.post('/join', joinGroup);
router.get('/my-groups', getMyGroups);
router.get('/invite/:code', getGroupByInviteCode);
router.get('/:id', getGroup);
router.get('/book/:bookId', getGroupsByBook);
router.put('/:id/progress', updateGroupProgress);
router.post('/:id/leave', leaveGroup);
router.delete('/:id', deleteGroup);
router.delete('/:id', deleteGroup);
router.patch('/:id', updateGroup);
router.delete('/:id/members/:userId', removeMember);

// Discussion
router.route('/:id/messages')
    .get(getGroupMessages)
    .post(postGroupMessage);

module.exports = router;
