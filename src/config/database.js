import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        pool: {
            max: 7,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        timezone: "+07:00",
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci",
            timestamps: true,
            underscored: true
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✓ Database connection has been established successfully.");
    } catch (error) {
        console.error("✗ Unable to connect to the database:", error);
        process.exit(1);
    }
};

const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✓ Database synced successfully');
    } catch (error) {
        console.error('✗ Unable to sync database:', error);
        process.exit(1);
    }
};

export {sequelize, testConnection, syncDatabase };