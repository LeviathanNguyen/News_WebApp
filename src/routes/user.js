const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Route cập nhật thông tin
router.put('/profile', auth.verifyToken, userController.updateProfile);

// Route đổi mật khẩu
router.post('/change-password', auth.verifyToken, userController.changePassword);

module.exports = router;