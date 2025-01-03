import "dotenv/config"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
res.render("auth/login", {
    title: "Đăng Nhập",
    extraCSS: '<link rel="stylesheet" href="/css/login.css">',
    extraScripts: '<script src="/js/login.js"></script>',
    messages: req.flash()
});
const authMiddleware = {
    // Verify JWT token
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token không được cung cấp"
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn"
            });
        }
    },

    // Verify session
    verifySession: (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Vui lòng đăng nhập để tiếp tục"
            });
        }
        next();
    },

    // Middleware for verify token and session
    authenticate: (req, res, next) => {
        // Verify session
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập đã hết hạn"
            });
        }

        // Verify token
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token không được cung cấp"
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // Check if token match with user's session
            if (decoded.userId !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Token không hợp lệ cho phiên đăng nhập này"
                });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn"
            });
        }
    }
};

export default authMiddleware;