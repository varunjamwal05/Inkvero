const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = catchAsync(async (req, res, next) => {
    let token;

    // 1. Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check for token in Cookies (fallback)
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401, 'AUTH_MISSING'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401, 'AUTH_INVALID'));
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(`User role ${req.user.role} is not authorized to access this route`, 403, 'AUTH_FORBIDDEN')
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
