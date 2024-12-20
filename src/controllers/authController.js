const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_EXPIRES = process.env.SESSION_EXPIRES || '24h'; // Thời hạn JWT

const authController = {
    /**
     * Đăng ký tài khoản
     */
    async register(req, res) {
        try {
            const { username, email, password, fullname, nickname, dob } = req.body;

            // Kiểm tra email đã tồn tại
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được đăng ký'
                });
            }

            // Kiểm tra username đã tồn tại
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username đã được sử dụng'
                });
            }

            // Hash mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo user mới
            const userId = await User.create({
                username,
                email,
                password: hashedPassword,
                fullname,
                nickname: nickname || null,
                dob: dob || null
            });

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                userId
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi đăng ký'
            });
        }
    },

    /**
     * Đăng nhập
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Tìm user theo email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Tạo JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    username: user.username
                },
                JWT_SECRET,
                { expiresIn: SESSION_EXPIRES }
            );

            // Lưu session (nếu sử dụng session-based auth)
            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username
            };

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullname: user.fullname
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi đăng nhập'
            });
        }
    },

    /**
     * Đăng xuất
     */
    async logout(req, res) {
        try {
            // Xóa session
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Lỗi khi đăng xuất'
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Đăng xuất thành công'
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi đăng xuất'
            });
        }
    },

    /**
     * Xác thực người dùng dựa trên JWT
     */
    async authenticate(req, res, next) {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token. Vui lòng đăng nhập lại.'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Gắn thông tin người dùng vào request
            next();
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(403).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn.'
            });
        }
    },

    /**
     * Xác minh vai trò (role-based access)
     */
    authorize(roles = []) {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập.'
                });
            }
            next();
        };
    }
};

module.exports = authController;
