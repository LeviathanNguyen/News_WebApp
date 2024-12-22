import pool from "../config/database.js";
import BaseModel from "./BaseModel.js";

class PasswordReset extends BaseModel {
    static tableName = "password_resets";
    static modelName = "PasswordReset";

    static async validate(data) {
        const errors = [];

        if (!data.email) {
            errors.push("Email không được để trống");
        }
        if (!data.otp || data.otp.length !== 6) {
            errors.push("OTP phải có 6 ký tự");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }
    }

    static async create({ email, otp }) {
        try {
            await this.validate({ email, otp });

            const expiresAt = new Date(Date.now() + 15*60*1000); // 15mins
            const [result] = await pool.execute(
                `INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)`,
                [email, otp, expiresAt]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Không thể tạo OTP: ${error.message}`);
        }
    }

    static async findValidOTP(email, otp) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM ${this.tableName} 
                WHERE email = ? 
                AND otp = ? 
                AND expires_at > NOW() 
                AND used = FALSE 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [email, otp]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Không thể xác thực OTP: ${error.message}`);
        }
    }

    static async markAsUsed(id) {
        return this.update(id, { used: true });
    }

    static async cleanupOldOTPs() {
        try {
            const [result] = await pool.execute(
                `DELETE FROM ${this.tableName} WHERE expires_at < NOW()`
            );
            return result.affectedRows;
        } catch (error) {
            console.error("Cleanup OTP error:", error);
            return 0;
        }
    }

    static async hasActiveOTP(email) {
        try {
            const [rows] = await pool.execute(
                `SELECT COUNT(*) as count FROM ${this.tableName} 
                WHERE email = ? 
                AND expires_at > NOW() 
                AND used = FALSE`,
                [email]
            );
            return rows[0].count > 0;
        } catch (error) {
            throw new Error(`Không thể kiểm tra OTP đang hoạt động: ${error.message}`);
        }
    }

    static async deleteByEmail(email) {
        try {
            const [result] = await pool.execute(
                `DELETE FROM ${this.tableName} WHERE email = ?`,
                [email]
            );
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Không thể xóa OTP liên quan đến email: ${error.message}`);
        }
    }
}

export default PasswordReset;