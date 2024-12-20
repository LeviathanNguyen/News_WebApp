const EmailService = require('../utils/emailService');

const NotificationController = {
    async sendLoginAlert(req, res) {
        try {
            const { email, device, location, time } = req.body;

            if (!email || !device || !location || !time) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông tin không đầy đủ'
                });
            }

            await EmailService.sendLoginAlert(email, { device, location, time });
            res.json({
                success: true,
                message: 'Thông báo đã được gửi thành công'
            });
        } catch (error) {
            console.error('Notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi gửi thông báo'
            });
        }
    }
};

module.exports = NotificationController;
