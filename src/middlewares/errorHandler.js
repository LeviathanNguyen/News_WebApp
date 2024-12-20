const logger = require('../utils/logger');

class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.logError(err, {
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        user: req.user ? req.user.id : 'anonymous'
    });

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Production errors
    if (err.isOperational) {
        // Operational, trusted error: send message to client
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } 

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    return res.status(500).json({
        success: false,
        message: 'Đã có lỗi xảy ra từ hệ thống'
    });
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Middleware để bắt lỗi 404
const notFound = (req, res, next) => {
    const err = new AppError(404, `Không tìm thấy đường dẫn: ${req.originalUrl}`);
    next(err);
};

// Middleware xử lý lỗi validation từ express-validator
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new AppError(400, 'Dữ liệu không hợp lệ');
        error.errors = errors.array();
        return next(error);
    }
    next();
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    notFound,
    handleValidationErrors
};