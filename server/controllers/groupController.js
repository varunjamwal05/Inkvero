const crypto = require('crypto');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const GroupMessage = require('../models/GroupMessage');
const UserBookState = require('../models/UserBookState');
const ActivityLog = require('../models/ActivityLog'); // For logging
const EventQueue = require('../utils/EventQueue');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Create a group
// @route   POST /api/v1/groups
// @access  Private
exports.createGroup = catchAsync(async (req, res, next) => {
    const { name, description, bookId, isPrivate } = req.body;

    // Generate short join code
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const group = await Group.create({
        name,
        description,
        currentBook: bookId,
        creator: req.user.id,
        joinCode,
        isPrivate: isPrivate || false,
        members: [req.user.id] // Add creator to members
    });

    // Add creator as member automatically (Keep for progress tracking)
    await GroupMember.create({
        group: group._id,
        user: req.user.id,
        book: bookId,
        progress: 0
    });

    // Log activity
    await EventQueue.add('ACTIVITY_LOG', {
        user: req.user.id,
        target: group._id,
        targetModel: 'Group',
        action: 'JOIN_GROUP'
    });

    res.status(201).json({
        status: 'success',
        data: group
    });
});

// @desc    Join group by code
// @route   POST /api/v1/groups/join
// @access  Private
exports.joinGroup = catchAsync(async (req, res, next) => {
    const { inviteCode } = req.body; // Changed from joinCode to match request

    if (!inviteCode) {
        return next(new AppError('Please provide an invite code', 400, 'INVALID_INPUT'));
    }

    const group = await Group.findOne({ joinCode: inviteCode.toUpperCase() });
    if (!group) {
        return next(new AppError('Invalid join code', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check if member exists in GroupMember collection (Source of Truth for progress)
    const existingMember = await GroupMember.findOne({
        group: group._id,
        user: req.user.id
    });

    if (existingMember) {
        return res.status(200).json({
            status: 'success',
            message: 'Already a member',
            data: group
        });
    }

    // Create GroupMember
    const member = await GroupMember.create({
        group: group._id,
        user: req.user.id,
        book: group.currentBook,
        progress: 0
    });

    // Add to Group.members array if not present
    await Group.findByIdAndUpdate(group._id, {
        $addToSet: { members: req.user.id }
    });

    // Log activity
    await EventQueue.add('ACTIVITY_LOG', {
        user: req.user.id,
        target: group._id,
        targetModel: 'Group',
        action: 'JOIN_GROUP'
    });

    res.status(200).json({
        status: 'success',
        data: group // Return group so frontend can redirect
    });
});

// @desc    Get my groups
// @route   GET /api/v1/groups/my-groups
// @access  Private
exports.getMyGroups = catchAsync(async (req, res, next) => {
    // Find all group memberships for this user
    const memberships = await GroupMember.find({ user: req.user.id })
        .populate({
            path: 'group',
            select: 'name description currentBook members joinCode',
            populate: {
                path: 'currentBook',
                select: 'title author files'
            }
        })
        .sort('-lastDiscussedAt');

    // Extract the actual group objects and attach the user's progress
    const groups = memberships.map(membership => {
        if (!membership.group) return null; // Handle edge case where group might be deleted
        return {
            ...membership.group.toObject(),
            myProgress: membership.progress,
            lastDiscussedAt: membership.lastDiscussedAt
        };
    }).filter(g => g !== null);

    res.status(200).json({
        status: 'success',
        results: groups.length,
        data: groups
    });
});

// @desc    Get group preview by invite code
// @route   GET /api/v1/groups/invite/:code
// @access  Public (Protected by frontend but API can be public-ish)
exports.getGroupByInviteCode = catchAsync(async (req, res, next) => {
    const { code } = req.params;

    const group = await Group.findOne({ joinCode: code.toUpperCase() })
        .populate('currentBook', 'title coverUrl author files')
        .select('name description members currentBook joinCode');

    if (!group) {
        return next(new AppError('Invalid invite code', 404, 'RESOURCE_NOT_FOUND'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            _id: group._id,
            name: group.name,
            description: group.description,
            currentBook: group.currentBook,
            memberCount: group.members.length,
            joinCode: group.joinCode
        }
    });
});

// @desc    Get group details with members
// @route   GET /api/v1/groups/:id
// @access  Private (Members only)
exports.getGroup = catchAsync(async (req, res, next) => {
    const group = await Group.findById(req.params.id)
        .populate('currentBook', 'title author files')
        .populate('creator', 'username');

    if (!group) {
        return next(new AppError('Group not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check membership
    // We can now check group.members too, but let's stick to GroupMember for consistency with progress
    const membership = await GroupMember.findOne({
        group: group._id,
        user: req.user.id
    });

    if (!membership && req.user.role !== 'admin') {
        // Double check members array just in case of Desync, if in array -> auto-fix GroupMember?
        // For now, strict check.
        return next(new AppError('Not authorized to view this group', 403, 'AUTH_FORBIDDEN'));
    }

    // Fetch members and their progress
    const members = await GroupMember.find({ group: group._id })
        .populate('user', 'username avatar')
        .sort('-progress'); // Sort by progress leader

    // Sync members count if needed? No, just rely on GroupMember count for specific lists

    res.status(200).json({
        status: 'success',
        data: {
            group,
            members,
            myProgress: membership.progress
        }
    });
});

// @desc    Update progress in group
// @route   PUT /api/v1/groups/:id/progress
// @access  Private (Members only)
exports.updateGroupProgress = catchAsync(async (req, res, next) => {
    const { progress } = req.body; // 0-100

    const member = await GroupMember.findOne({
        group: req.params.id,
        user: req.user.id
    });

    if (!member) {
        return next(new AppError('Not a member of this group', 403, 'AUTH_FORBIDDEN'));
    }

    member.progress = progress;
    member.lastDiscussedAt = Date.now();
    await member.save();

    // Also update global UserBookState if this progress is higher?
    // Strategy: Group progress is derived from reading, OR separate.
    // The plan says "Context Separation". So we treat them separately.
    // But for UX, we might want to sync "max progress" to global state.
    await EventQueue.add('SYNC_PROGRESS', {
        userId: req.user.id,
        bookId: member.book,
        progress: progress
    });

    res.status(200).json({
        status: 'success',
        data: member
    });
});

// @desc    Update group details
// @route   PATCH /api/v1/groups/:id
// @access  Private (Creator/Admin)
exports.updateGroup = catchAsync(async (req, res, next) => {
    let group = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('Group not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    if (group.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this group', 403, 'AUTH_FORBIDDEN'));
    }

    group = await Group.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: group
    });
});

// @desc    Get groups reading a specific book
// @route   GET /api/v1/groups/book/:bookId
// @access  Private
exports.getGroupsByBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;

    // Only fetch PUBLIC groups for the list
    const groups = await Group.find({
        currentBook: bookId,
        isPrivate: false
    })
        .populate('currentBook', 'title coverUrl author')
        .select('name description members currentBook joinCode isPrivate')
        .limit(10); // Limit to 10 for now

    // Check which ones the user is already in
    const userMemberships = await GroupMember.find({
        user: req.user.id,
        group: { $in: groups.map(g => g._id) }
    });

    const joinedGroupIds = userMemberships.map(m => m.group.toString());

    const groupsWithStatus = groups.map(group => ({
        ...group.toObject(),
        isMember: joinedGroupIds.includes(group._id.toString())
    }));

    res.status(200).json({
        status: 'success',
        results: groups.length,
        data: groupsWithStatus
    });
});

// @desc    Leave a group
// @route   POST /api/v1/groups/:id/leave
// @access  Private
exports.leaveGroup = catchAsync(async (req, res, next) => {
    const group = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('Group not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Creator cannot leave, must delete
    if (group.creator.toString() === req.user.id) {
        return next(new AppError('Creators cannot leave their own group. You must delete it instead.', 400, 'INVALID_OPERATION'));
    }

    // Remove member
    await GroupMember.findOneAndDelete({
        group: group._id,
        user: req.user.id
    });

    // Update group members array
    await Group.findByIdAndUpdate(group._id, {
        $pull: { members: req.user.id }
    });

    res.status(200).json({
        status: 'success',
        message: 'Successfully left the group'
    });
});

// @desc    Delete a group
// @route   DELETE /api/v1/groups/:id
// @access  Private (Creator only)
exports.deleteGroup = catchAsync(async (req, res, next) => {
    const group = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('Group not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check ownership
    if (group.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this group', 403, 'AUTH_FORBIDDEN'));
    }

    // Delete all memberships
    await GroupMember.deleteMany({ group: group._id });

    // Delete the group
    await group.deleteOne();

    res.status(200).json({
        status: 'success',
        data: null
    });
});

// @desc    Remove member from group
// @route   DELETE /api/v1/groups/:id/members/:userId
// @access  Private (Creator/Admin)
exports.removeMember = catchAsync(async (req, res, next) => {
    const group = await Group.findById(req.params.id);
    const userIdToRemove = req.params.userId;

    if (!group) {
        return next(new AppError('Group not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check authorization: Only Creator or Admin can remove members
    if (group.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to remove members', 403, 'AUTH_FORBIDDEN'));
    }

    // Cannot remove the creator
    if (group.creator.toString() === userIdToRemove) {
        return next(new AppError('Cannot remove the group creator', 400, 'INVALID_OPERATION'));
    }

    // Remove member from GroupMember collection
    await GroupMember.findOneAndDelete({
        group: group._id,
        user: userIdToRemove
    });

    // Remove member from Group.members array
    await Group.findByIdAndUpdate(group._id, {
        $pull: { members: userIdToRemove }
    });

    res.status(200).json({
        status: 'success',
        data: null
    });
});

// @desc    Get group messages (filtered by user progress)
// @route   GET /api/v1/groups/:id/messages
// @access  Private (Members only)
exports.getGroupMessages = catchAsync(async (req, res, next) => {
    // 1. Get user's progress in this group
    const membership = await GroupMember.findOne({
        group: req.params.id,
        user: req.user.id
    });

    if (!membership && req.user.role !== 'admin') {
        return next(new AppError('Not a member of this circle', 403, 'AUTH_FORBIDDEN'));
    }

    // Admins can see everything, members only see up to their progress
    const query = { group: req.params.id };
    if (req.user.role !== 'admin') {
        query.progress = { $lte: membership.progress };
    }

    const messages = await GroupMessage.find(query)
        .populate('user', 'username avatar')
        .sort('createdAt');

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages
    });
});

// @desc    Post message to group
// @route   POST /api/v1/groups/:id/messages
// @access  Private (Members only)
exports.postGroupMessage = catchAsync(async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
        return next(new AppError('Please provide message content', 400, 'INVALID_INPUT'));
    }

    // Get current progress to tag the message
    const membership = await GroupMember.findOne({
        group: req.params.id,
        user: req.user.id
    });

    if (!membership) {
        return next(new AppError('Must be a member to post', 403, 'AUTH_FORBIDDEN'));
    }

    const message = await GroupMessage.create({
        group: req.params.id,
        user: req.user.id,
        content,
        progress: membership.progress,
        page: Math.round((membership.progress / 100) * (req.body.totalPages || 0)) // Optional page context
    });

    // Populate user before returning
    await message.populate('user', 'username avatar');

    res.status(201).json({
        status: 'success',
        data: message
    });
});
