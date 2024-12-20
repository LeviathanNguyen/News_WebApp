const User = require('../models/User');
const bcrypt = require('bcrypt');

const userController = {
    // Lấy thông tin user
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }

            // Loại bỏ password trước khi gửi về client
            const { password, ...userInfo } = user;
            
            res.json({
                success: true,
                user: userInfo
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin người dùng'
            });
        }
    },

    // Cập nhật thông tin user
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { fullname, nickname, email, dob } = req.body;

            // Kiểm tra email mới có trùng với user khác không
            if (email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã được sử dụng bởi tài khoản khác'
                    });
                }
            }

            // Cập nhật thông tin
            await User.update(userId, {
                fullname: fullname || undefined,
                nickname: nickname || null,
                email: email || undefined,
                dob: dob || null
            });

            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật thông tin'
            });
        }
    },

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Lấy thông tin user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }

            // Kiểm tra mật khẩu cũ
            const isValidPassword = await User.verifyPassword(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Cập nhật mật khẩu
            await User.updatePassword(userId, hashedPassword);

            res.json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đổi mật khẩu'
            });
        }
    }
};

module.exports = userController;