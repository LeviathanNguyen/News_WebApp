const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Weak',
    database: process.env.DB_NAME || 'auth_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1);
    }
}

// Test connection khi khởi động
testConnection();

module.exports = pool;