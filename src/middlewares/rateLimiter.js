const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
require('dotenv').config();

// Khởi tạo Redis client
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

// Cấu hình cơ bản cho rate limiter
const limitConfig = {
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate_limit:'
    }),
    windowMs: 15 * 60 * 1000, // 15 phút
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.'
        });
    }
};

// Rate limiter cho API chung
const standardLimiter = rateLimit({
    ...limitConfig,
    max: 100 // Giới hạn 100 request/15 phút
});

// Rate limiter cho đăng nhập
const loginLimiter = rateLimit({
    ...limitConfig,
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 5, // Giới hạn 5 lần đăng nhập thất bại/1 giờ
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 1 giờ.'
    }
});

// Rate limiter cho gửi OTP
const otpLimiter = rateLimit({
    ...limitConfig,
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Giới hạn 3 lần gửi OTP/1 giờ
    message: {
        success: false,
        message: 'Đã vượt quá giới hạn gửi OTP, vui lòng thử lại sau 1 giờ.'
    }
});

module.exports = {
    standardLimiter,
    loginLimiter,
    otpLimiter
};