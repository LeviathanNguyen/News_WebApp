import "dotenv/config";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

// Custom colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray'
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);


// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}${
            info.metadata && Object.keys(info.metadata).length ? "\n" + JSON.stringify(info.metadata, null, 2) : ""
        }`
    )
);

// Daily Rotate File Transport for log rotation
const dailyRotateTransport = new DailyRotateFile({
    filename: path.join(__dirname, "../logs/%DATE%-combined.log"),
    datePattern: "DD-MM-YYYY",
    zippedArchive: true, // Compress logs
    maxSize: "20m",      // Maximum size per log file
    maxFiles: "14d"      // Keep logs for 14 days
});

// Create logger instance
const logger = winston.createLogger({
    levels,
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
        dailyRotateTransport,
        // Write all logs with importance level of "error" or less to "error.log"
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/error.log"),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),

        // HTTP request logs
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/http.log"),
            level: "http",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ],

    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/exceptions.log"),
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/rejections.log"),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// If we're not in production, log to the console with custom format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        handleExceptions: true,
        handleRejections: true
    }));
}

// Create a service wrapper with structured logging methods
const loggerService = {
    // Activity logging
    logActivity(userId, action, details = {}) {
        logger.info("User Activity", {
            userId,
            action,
            details,
            source: "activity",
            timestamp: new Date().toISOString()
        });
    },

    // Authentication logging
    logAuth(userId, action, success, ipAddress, additionalInfo = {}) {
        logger.info("Authentication", {
            userId,
            action,
            success,
            ipAddress,
            ...additionalInfo,
            source: "auth",
            timestamp: new Date().toISOString()
        });
    },

    // Error logging with severity levels
    logError(error, context = {}, severity = "error") {
        logger.error("Application Error", {
            message: error.message,
            stack: error.stack,
            severity,
            context,
            timestamp: new Date().toISOString()
        });
    },

    // Security event logging
    logSecurity(userId, event, details = {}, severity = "warn") {
        logger.warn("Security Event", {
            userId,
            event,
            details,
            source: "security",
            timestamp: new Date().toISOString()
        });
    },

    // Performance logging
    logHttp(req, res, responseTime) {
        const responseBody = res.body || {};
        logger.http("HTTP Request", {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            responseBody,
            source: "http",
            timestamp: new Date().toISOString()
        });
    },

    // Performance logging
    logPerformance(operation, duration, metadata = {}) {
        logger.verbose("Performance Metric", {
            operation,
            duration,
            ...metadata,
            source: "performance",
            timestamp: new Date().toISOString()
        });
    }
};

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Create stream for Morgan HTTP logger
loggerService.stream = {
    write: (message) => logger.http(message.trim())
};

export default { logger, loggerService };
