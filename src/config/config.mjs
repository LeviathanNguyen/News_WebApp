import "dotenv/config"

export default {
    development: {
        username: process.env.DB_USER || "levi",
        password: process.env.DB_PASSWORD || "cindy1219",
        database: process.env.DB_NAME || "news_db",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "mysql",
    },
};