import "dotenv/config"
import User from '../models/User';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_EXPIRES = process.env.SESSION_EXPIRES || '24h'; // Thời hạn JWT

const authController = {
    /**
     * Account register
     */
    async register(req, res) {
        try {
            const { username, email, password, fullname, nickname, dob } = req.body;

            // Check email if existed
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã được đăng ký"
                });
            }

            // Check username if existed
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username đã được sử dụng"
                });
            }

            // Password hashing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
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
                message: "Đăng ký thành công",
                userId
            });
        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi đăng ký"
            });
        }
    },

    /**
     * Login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            // Password validation
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            // Create JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    username: user.username
                },
                JWT_SECRET,
                { expiresIn: SESSION_EXPIRES }
            );

            // Save session
            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username
            };

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullname: user.fullname
                }
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi đăng nhập"
            });
        }
    },

    /**
     * Logout
    **/
    async logout(req, res) {
        try {
            // Clear session
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Lỗi khi đăng xuất"
                    });
                }
                res.status(200).json({
                    success: true,
                    message: "Đăng xuất thành công"
                });
            });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi đăng xuất"
            });
        }
    },

    /**
     * User Authentication with JWT
     */
    async authenticate(req, res, next) {
        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Không có token. Vui lòng đăng nhập lại."
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Attach user's info to request
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(403).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn."
            });
        }
    },

    /**
     * Role-based access verification
     */
    authorize(roles = []) {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền truy cập."
                });
            }
            next();
        };
    }
};

export default authController;
