const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Gửi OTP về email
router.post("/forgot-password", passwordController.sendOtp);

// Xác thực OTP và chuyển đến trang reset mật khẩu
router.post("/verify-otp", passwordController.verifyOtp);

// Reset mật khẩu
router.post("/reset-password", passwordController.resetPassword);

module.exports = router;
