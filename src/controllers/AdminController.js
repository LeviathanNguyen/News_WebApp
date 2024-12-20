const User = require('../models/User');

const AdminController = {
    async getAllUsers(req, res) {
        try {
            const users = await User.search({}, 100, 0);
            res.json({
                success: true,
                users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng'
            });
        }
    }
};

module.exports = AdminController;
