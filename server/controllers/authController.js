const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync'); // Need to create this
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
// Helper function to send token
const createSendToken = async (user, statusCode, res) => {
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Options for access token cookie
    const cookieOptions = {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min matching JWT_EXPIRE
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    };

    // Options for refresh token cookie
    const refreshCookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/api/v1/auth/refresh' // Limit scope of refresh token
    };

    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: user
    });
};

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

    await createSendToken(user, 201, res);
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

    await createSendToken(user, 200, res);
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

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction, // Adhere to environment config
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: 'success',
        accessToken: newAccessToken,
        token: newAccessToken // Standardize on 'token' or 'accessToken'
    });
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Public
exports.logout = catchAsync(async (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
        httpOnly: true,
        sameSite: isProduction ? 'None' : 'Lax',
        secure: isProduction
    });

    // Also clear refreshToken just in case
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: isProduction ? 'None' : 'Lax',
        secure: isProduction,
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
