const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validator = require('../middlewares/validate');

// Route đăng ký
router.post('/register', validator.validateRegister, authController.register);

// Route đăng nhập
router.post('/login', validator.validateLogin, authController.login);

// Route đăng xuất
router.post('/logout', authController.logout);

// Route quên mật khẩu
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Quên mật khẩu',
        layout: './layouts/main'
    });
});

module.exports = router;