const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync'); // Need to create this
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('User already exists', 400, 'AUTH_USER_EXISTS'));
    }

    const user = await User.create({
        username,
        email,
        password
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    await RefreshToken.create({
        token: refreshToken, // usage: store hashed version in prod
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Send refresh token in cookie
    // Send refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // For local dev
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        status: 'success',
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            accessToken
        }
    });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Invalid credentials', 401, 'AUTH_INVALID_CREDS'));
    }

    if (user.isBanned) {
        return next(new AppError('Your account has been suspended. Please contact support.', 403, 'AUTH_BANNED'));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Rotate/Create Refresh Token
    // For strict security: Invalidate old refresh tokens if rotating?
    // Strategy: Allow multiple devices, so just create new one.
    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // For local dev
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: 'success',
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            accessToken
        }
    });
});

// @desc    Refresh Token
// @route   GET /api/v1/auth/refresh
// @access  Public (Cookie based)
exports.refresh = catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    console.log("cookies:", req.cookies); // Debug log

    if (!cookies?.refreshToken) return next(new AppError('No refresh token', 401, 'AUTH_NO_TOKEN'));

    const refreshToken = cookies.refreshToken;
    console.log("refreshToken:", refreshToken); // Debug log

    const foundToken = await RefreshToken.findOne({ token: refreshToken }).populate('user');

    if (!foundToken) {
        // Reuse detection? Token provided but not in DB (maybe deleted/used/hacked)
        // Could clear all tokens for user found in decoded JWT if possible, 
        // but here we just deny.
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // For local dev
            path: '/api/v1/auth/refresh'
        });
        return next(new AppError('Invalid refresh token', 403, 'AUTH_TOKEN_REUSED'));
    }

    const user = foundToken.user;

    // Verify jwt
    // If verification fails, token is expired or tampered
    // We should rely on DB check mostly, but verifying signature is good too.

    // Rotate token
    // 1. Delete old token
    await RefreshToken.deleteOne({ _id: foundToken._id });

    // 2. Create new pair
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    await RefreshToken.create({
        token: newRefreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false, // For local dev
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: 'success',
        accessToken: newAccessToken
    });
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Public
exports.logout = catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204);

    const refreshToken = cookies.refreshToken;
    await RefreshToken.deleteOne({ token: refreshToken });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // For local dev
        path: '/api/v1/auth/refresh'
    });
    res.status(200).json({ status: 'success', message: 'Logged out' });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: 'success',
        data: user
    });
});
