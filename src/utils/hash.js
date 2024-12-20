const bcrypt = require('bcrypt');
const crypto = require('crypto');

const hashUtils = {
    // Hash password với bcrypt
    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw new Error('Error hashing password');
        }
    },

    // Verify password
    async verifyPassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            throw new Error('Error verifying password');
        }
    },

    // Tạo token ngẫu nhiên
    generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    },

    // Tạo OTP 6 số
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // Hash token với SHA256
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};

module.exports = hashUtils;