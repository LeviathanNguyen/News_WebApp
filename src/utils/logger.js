const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    format: logFormat,
    transports: [
        // Write all logs with importance level of 'error' or less to 'error.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        // Write all logs with importance level of 'info' or less to 'combined.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
        })
    ]
});

// If we're not in production, log to the console with custom format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

const loggerService = {
    // Log user activities
    logActivity(userId, action, details) {
        logger.info('User activity', {
            userId,
            action,
            details,
            timestamp: new Date()
        });
    },

    // Log authentication attempts
    logAuth(userId, action, success, ipAddress) {
        logger.info('Authentication activity', {
            userId,
            action,
            success,
            ipAddress,
            timestamp: new Date()
        });
    },

    // Log errors
    logError(error, context = {}) {
        logger.error('Application error', {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date()
        });
    },

    // Log security events
    logSecurity(userId, event, details) {
        logger.warn('Security event', {
            userId,
            event,
            details,
            timestamp: new Date()
        });
    }
};

module.exports = loggerService;