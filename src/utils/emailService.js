const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Sử dụng App Password từ Google
    }
});

class EmailService {
    static async sendOTP(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Đặt lại mật khẩu</h2>
                    <p>Mã OTP của bạn là:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p>Mã này sẽ hết hạn sau 15 phút.</p>
                    <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Send email error:', error);
            return false;
        }
    }
}

module.exports = EmailService;