import "dotenv/config"
import mysql from "mysql2/promise"
import logger from "../utils/logger.js"

class Database {
    constructor(config) {
        this.pool = null;
        this.config = {
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "toor",
            database: process.env.DB_NAME || "news_db",
            waitForConnections: true,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
            queueLimit: 0,
            timezone: "+07:00",
            charset: "utf8mb4"
        }
    }

    createPool() {
        try {
            if (!this.pool) {
                this.pool = mysql.createPool(this.config);
                logger.info("Database pool created successfully");
            }
            return this.pool;
        } catch (error) {
            logger.error("Error creating database pool:", error);
            throw new Error("Failed to create database pool");
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            logger.info("✅ Database connected successfully");
            connection.release();
            return true;
        } catch (error) {
            logger.error("❌ Error connecting to the database:", error);
            throw error;
        }
    }

    async executeQuery(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            logger.error(`Error executing query: ${sql}`, error);
            throw error;
        }
    }

    async getConnection() {
        try {
            return await this.pool.getConnection();
        } catch (error) {
            logger.error("Error getting database connection:", error);
            throw error;
        }
    }

    async end() {
        try {
            await this.pool.end();
            logger.info("Database pool connections closed");
        } catch (error) {
            logger.error("Error closing database pool:", error);
            throw error;
        }
    }
}
// Create singleton instance
const database = new Database();
const pool = database.createPool();

// Test connection when startup
database.testConnection()
    .catch(error => {
        logger.error("Failed to establish database connection:", error);
        process.exit(1);
    });

// Handle process termination
process.on("SIGINT", async () => {
    try {
        await database.end();
        logger.info("Database connections closed due to application termination");
        process.exit(0);
    } catch (error) {
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
    }
});

export default pool;
