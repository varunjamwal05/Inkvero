const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.code = err.code || 'INTERNAL_ERROR';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            code: err.code,
            message: err.message,
            details: err.details,
            stack: err.stack,
        });
    } else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                code: err.code,
                message: err.message,
                details: err.details,
            });
        } else {
            // Programming or other unknown error: don't leak details
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                code: 'INTERNAL_ERROR',
                message: 'Something went very wrong!',
            });
        }
    }
};

module.exports = errorHandler;
