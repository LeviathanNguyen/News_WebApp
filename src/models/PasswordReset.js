const pool = require('../config/database');

class PasswordReset {
    /**
     * Tạo OTP mới
     * @param {Object} param0 - email và otp
     * @returns {Number} id của bản ghi OTP được tạo
     */
    static async create({ email, otp }) {
        try {
            // Tạo thời gian hết hạn (15 phút)
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút từ bây giờ

            const [result] = await pool.execute(
                'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
                [email, otp, expiresAt]
            );

            return result.insertId;
        } catch (error) {
            console.error('Create OTP error:', error);
            throw new Error('Không thể tạo OTP');
        }
    }

    /**
     * Tìm OTP hợp lệ
     * @param {String} email - Email người dùng
     * @param {String} otp - OTP được gửi
     * @returns {Object|null} Bản ghi OTP hợp lệ hoặc null
     */
    static async findValidOTP(email, otp) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM password_resets 
                WHERE email = ? 
                AND otp = ? 
                AND expires_at > NOW() 
                AND used = FALSE 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [email, otp]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Find OTP error:', error);
            throw new Error('Không thể xác thực OTP');
        }
    }

    /**
     * Đánh dấu OTP đã sử dụng
     * @param {Number} id - ID của bản ghi OTP
     * @returns {Boolean} true nếu thành công
     */
    static async markAsUsed(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE password_resets SET used = TRUE WHERE id = ?',
                [id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Mark OTP used error:', error);
            throw new Error('Không thể cập nhật trạng thái OTP');
        }
    }

    /**
     * Xóa các OTP hết hạn
     * @returns {Number} Số bản ghi OTP đã bị xóa
     */
    static async cleanupOldOTPs() {
        try {
            const [result] = await pool.execute(
                `DELETE FROM password_resets 
                WHERE expires_at < NOW()`
            );

            return result.affectedRows;
        } catch (error) {
            console.error('Cleanup OTP error:', error);
            return 0; // Không throw lỗi để đảm bảo không ảnh hưởng quá trình chạy khác
        }
    }

    /**
     * Kiểm tra xem email có bản ghi OTP nào không
     * @param {String} email - Email người dùng
     * @returns {Boolean} true nếu có bản ghi OTP đang tồn tại
     */
    static async hasActiveOTP(email) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM password_resets 
                WHERE email = ? 
                AND expires_at > NOW() 
                AND used = FALSE 
                LIMIT 1`,
                [email]
            );

            return rows.length > 0;
        } catch (error) {
            console.error('Check active OTP error:', error);
            throw new Error('Không thể kiểm tra OTP đang hoạt động');
        }
    }

    /**
     * Xóa tất cả OTP liên quan đến email (nếu cần thiết)
     * @param {String} email - Email người dùng
     * @returns {Number} Số OTP đã bị xóa
     */
    static async deleteByEmail(email) {
        try {
            const [result] = await pool.execute(
                `DELETE FROM password_resets WHERE email = ?`,
                [email]
            );

            return result.affectedRows;
        } catch (error) {
            console.error('Delete OTP by email error:', error);
            throw new Error('Không thể xóa OTP liên quan đến email');
        }
    }
}

module.exports = PasswordReset;
