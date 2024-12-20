const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Tìm user theo email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Tìm user theo username
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Tìm user theo ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Tạo user mới
    static async create(userData) {
        const { username, email, password, fullname, nickname, dob } = userData;

        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert user mới
            const [result] = await pool.execute(
                `INSERT INTO users (username, email, password, fullname, nickname, dob) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, fullname, nickname, dob]
            );

            // Trả về user id
            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Cập nhật thông tin user
    static async update(userId, userData) {
        const { fullname, nickname, email, dob } = userData;
        
        try {
            const [result] = await pool.execute(
                `UPDATE users 
                 SET fullname = COALESCE(?, fullname),
                     nickname = ?,
                     email = COALESCE(?, email),
                     dob = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [fullname, nickname, email, dob, userId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Cập nhật mật khẩu
    static async updatePassword(userId, hashedPassword) {
        try {
            const [result] = await pool.execute(
                `UPDATE users 
                 SET password = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [hashedPassword, userId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new Error('Error verifying password');
        }
    }

    // Xóa user
    static async delete(userId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM users WHERE id = ?',
                [userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    // Tìm kiếm users theo điều kiện
    static async search(conditions = {}, limit = 10, offset = 0) {
        try {
            let query = 'SELECT * FROM users WHERE 1=1';
            const params = [];

            if (conditions.username) {
                query += ' AND username LIKE ?';
                params.push(`%${conditions.username}%`);
            }

            if (conditions.email) {
                query += ' AND email LIKE ?';
                params.push(`%${conditions.email}%`);
            }

            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }
}

module.exports = User;