import "dotenv/config";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SESSION_EXPIRES = process.env.SESSION_EXPIRES || "24h"; // Thời hạn JWT

const authController = {
  /**
   * Account register
   */
  async register(req, res) {
    console.log("check");
    try {
      const { username, email, password, fullname, nickname, dob } = req.body;

      // Tạo người dùng mới
      const newUser = await User.create({
        username,
        email,
        password,
        fullname,
        nickname,
        dob,
      });
      res.render("auth/login", { title: "Đăng Nhập", newUser });
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Login
   */
  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      // Kiểm tra email có tồn tại không
      const user = await User.findOneBy("email", email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      //   Kiểm tra mật khẩu
      const isValidPassword = await User.verifyPassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Tạo token JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: rememberMe ? "7d" : SESSION_EXPIRES } // 7 ngày nếu chọn "Remember me"
      );

      // Lưu phiên đăng nhập vào session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      // Lưu dữ liệu vào session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname,
        email: user.email,
      };

      // Chuyển hướng về trang home
      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.",
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
            message: "Lỗi khi đăng xuất",
          });
        }
        res.status(200).json({
          success: true,
          message: "Đăng xuất thành công",
        });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Đã có lỗi xảy ra khi đăng xuất",
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
        message: "Không có token. Vui lòng đăng nhập lại.",
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
        message: "Token không hợp lệ hoặc đã hết hạn.",
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
          message: "Bạn không có quyền truy cập.",
        });
      }
      next();
    };
  },
};

export default authController;
