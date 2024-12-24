import "dotenv/config";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";
import User from "../models/User.js";
import { loggerService } from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRE = "24h";

const authMiddleware = {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE });
  },

  // Verify JWT token
  verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

      if (!token) {
        throw new AppError(401, "Vui lòng đăng nhập để tiếp tục");
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            throw new AppError(401, "Token đã hết hạn");
          }
          throw new AppError(401, "Token không hợp lệ");
        }

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
          throw new AppError(401, "Người dùng không tồn tại");
        }

        // Grant access to protected route
        req.user = {
          userId: decoded.userId,
          email: user.email,
          username: user.username,
        };

        // Log successful authentication
        loggerService.logAuth(decoded.userId, "token_verify", true, req.ip);

        next();
      });
    } catch (error) {
      // Log failed authentication
      loggerService.logAuth("unknown", "token_verify", false, req.ip);
      next(error);
    }
  },

  // Check user role
  checkRole(roles) {
    return async (req, res, next) => {
      try {
        const user = await User.findById(req.session.user.id);
        console.log(user);
        if (!roles.includes(user.role)) {
          throw new AppError(403, "Bạn không có quyền truy cập");
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError(400, "Refresh token không được cung cấp");
      }

      jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
        if (err) {
          throw new AppError(401, "Refresh token không hợp lệ");
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          throw new AppError(401, "Người dùng không tồn tại");
        }

        // Generate new access token
        const accessToken = authMiddleware.generateToken(user.id);

        res.json({
          success: true,
          accessToken,
        });
      });
    } catch (error) {
      next(error);
    }
  },

  // Optional authentication
  optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return next();
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return next();
        }

        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = {
            userId: decoded.userId,
            email: user.email,
            username: user.username,
          };
        }
        next();
      });
    } catch (error) {
      next();
    }
  },

  ensureGuest(req, res, next) {
    if (req.session.user) {
      req.flash("error_msg", "Bạn đã đăng nhập rồi");
      return res.redirect("/");
    }
    next();
  },

  ensureAuthenticated(req, res, next) {
    if (!req.session.user) {
      req.flash("error_msg", "Vui lòng đăng nhập để tiếp tục");
      return res.redirect("/auth/login");
    }
    next();
  },
};

export default authMiddleware;
