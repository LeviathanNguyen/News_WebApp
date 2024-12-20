<<<<<<< HEAD
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
=======
import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import { sequelize } from "../config/database"

class User extends Model {
    // Validate user's password
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }

    // Check if user's subscription is still active
    isSubscriptionActive() {
        if (!this.subscription_expires_at) return false;
        return new Date(this.subscription_expires_at) > new Date();
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50] // Username must be between 3 and 50 characters
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Ensures valid email format
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pen_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM("guest", "subscriber", "writer", "editor", "admin"),
        defaultValue: "guest"
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    subscription_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    hooks: {
        // Hash password before creating new user
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        },
        // Hash password when updating if password field is modified
        beforeUpdate: async (user) => {
            if (user.changed("password")) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});
>>>>>>> 0df22106f622485467b0c0d2b855535bbc44aca2
