const crypto = require("crypto");
const nodemailer = require("nodemailer");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");

// Gửi OTP qua email
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        // Kiểm tra email có tồn tại trong hệ thống không
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

        // Tạo OTP ngẫu nhiên
        const otp = crypto.randomInt(100000, 999999);

        // Lưu OTP vào database
        await PasswordReset.create({
            email,
            otp,
            expires_at: Date.now() + 10 * 60 * 1000, // Hết hạn sau 10 phút
        });

        // Cấu hình email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Gửi email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP Reset mật khẩu",
            text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
        });

        res.status(200).json({ message: "Mã OTP đã được gửi về email của bạn." });
    } catch (error) {
        res.status(500).json({ message: "Đã xảy ra lỗi.", error });
    }
};

// Xác minh OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        // Kiểm tra OTP có tồn tại và còn hạn không
        const resetEntry = await PasswordReset.findOne({ email, otp });
        if (!resetEntry) return res.status(400).json({ message: "OTP không chính xác." });

        if (resetEntry.expires_at < Date.now())
            return res.status(400).json({ message: "OTP đã hết hạn." });

        // Nếu OTP hợp lệ, xóa entry OTP để tránh sử dụng lại
        await PasswordReset.deleteOne({ email, otp });

        res.status(200).json({ message: "OTP hợp lệ. Chuyển đến trang reset mật khẩu." });
    } catch (error) {
        res.status(500).json({ message: "Đã xảy ra lỗi.", error });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        // Hash mật khẩu mới
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        await User.updateOne({ email }, { password: hashedPassword });

        res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công." });
    } catch (error) {
        res.status(500).json({ message: "Đã xảy ra lỗi.", error });
    }
};
