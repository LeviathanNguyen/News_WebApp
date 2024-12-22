import "dotenv/config"
import mysql from "mysql2/promise"
import logger from "../utils/logger.js"

class Database {
    constructor(config) {
        this.pool = mysql.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: config.connectionLimit || 10,
            queueLimit: 0
        });
    }
}
// Create pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'toor',
    database: process.env.DB_NAME || 'auth_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection with database
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

// Test connection when startup
testConnection();

export default pool;
