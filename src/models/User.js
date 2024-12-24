import bcrypt from "bcrypt";
import BaseModel from "./BaseModel.js";
import pool from "../config/database.js"; // Import pool kết nối cơ sở dữ liệu
class User extends BaseModel {
  static tableName = "users";
  static modelName = "User";

  static async validate(data) {
    const errors = [];

    if (data.username) {
      if (data.username.length < 3 || data.username.length > 50) {
        errors.push("Username phải từ 3 đến 50 ký tự");
      }
      const existingUser = await this.findOneBy("username", data.username);
      if (existingUser && existingUser.id !== data.id) {
        errors.push("Username đã tồn tại");
      }
    }
    if (data.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Email không hợp lệ");
      }
      const existingEmail = await this.findOneBy("email", data.email);
      if (existingEmail && existingEmail.id !== data.id) {
        errors.push("Email đã tồn tại");
      }
    }
    if (data.password) {
      if (data.password.length < 6) {
        errors.push("Mật khẩu phải có ít nhất 6 ký tự");
      }
    }
    if (
      data.role &&
      !["guest", "subscriber", "writer", "editor", "admin"].includes(data.role)
    ) {
      errors.push("Vai trò không hợp lệ");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  static async create(data) {
    try {
      // Validate dữ liệu đầu vào
      await this.validate(data);

      // Băm mật khẩu nếu có
      if (data.password) {
        data.password = await this.hashPassword(data.password);
      }

      // Truy vấn SQL để chèn người dùng mới
      const sql = `
            INSERT INTO users 
            (username, email, password, full_name, pen_name, date_of_birth, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
      const values = [
        data.username,
        data.email,
        data.password,
        data.fullname,
        data.nickname || null,
        data.dob || null,
        "guest", // Mặc định vai trò là 'guest'
      ];

      // Thực thi truy vấn
      const [result] = await pool.execute(sql, values);

      // Trả về thông tin người dùng mới (trừ mật khẩu)
      return {
        id: result.insertId,
        username: data.username,
        email: data.email,
        fullname: data.fullname,
        nickname: data.nickname || null,
        dob: data.dob || null,
        role: "guest",
      };
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw new Error(`Không thể tạo người dùng: ${error.message}`);
    }
  }

  static async update(id, data) {
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }
    return super.update(id, data);
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      const isValid = await this.verifyPassword(oldPassword, user.password);
      if (!isValid) {
        throw new Error("Mật khẩu cũ không chính xác");
      }

      const hashedPassword = await this.hashPassword(newPassword);
      return this.update(userId, { password: hashedPassword });
    } catch (error) {
      throw new Error(`Không thể đổi mật khẩu: ${error.message}`);
    }
  }

  static async hasRole(userId, roles) {
    const user = await this.findById(userId);
    return user && roles.includes(user.role);
  }

  static async hasValidSubscription(userId) {
    const user = await this.findById(userId);
    return user && user.subscription_expires_at > new Date();
  }

  static async setResetToken(email) {
    try {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hours

      await this.update(email, {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      });

      return resetToken;
    } catch (error) {
      throw new Error(`Không thể tạo token reset: ${error.message}`);
    }
  }

  static async findByResetToken(token) {
    try {
      const [user] = await pool.execute(
        `SELECT * FROM ${this.tableName} 
                WHERE reset_token = ? 
                AND reset_token_expires > NOW()`,
        [token]
      );
      return user[0] || null;
    } catch (error) {
      throw new Error(`Không thể tìm token reset: ${error.message}`);
    }
  }
}

export default User;
