const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '10m' // Reset token expires in 10 minutes
    });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = signToken(user._id);

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    console.log('Password Reset Link:', resetUrl); // Debugging log

    const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>We received a request to reset your password for your Inkvero account.</p>
            <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't forget your password, please ignore this email.</p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const { token } = req.params;

    // Verify token
    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err);
            resolve(decoded);
        });
    }).catch(err => {
        return null;
    });

    if (!decoded) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    const user = await User.findOne({
        _id: decoded.id,
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // (Optional, if we had that field, but skipping as per requirements to not modify schema unnecessarily besides what's needed)

    // 4) Log the user in, send JWT
    // Re-using the signToken logic from authController might be better, but let's just send success here
    // or generate a new login token.
    // The requirement says "Updates password, Clears resetToken fields".
    // Usually we log them in automatically or ask them to login.
    // The requirement doesn't explicitly say "Log them in".
    // "Implement a POST /reset-password/:token route: ... Updates password ... Clears resetToken fields"
    // I will return success message.

    res.status(200).json({
        status: 'success',
        message: 'Password reset successful! Please log in.'
    });
});
