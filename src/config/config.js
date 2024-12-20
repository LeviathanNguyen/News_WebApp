import "dotenv/config"

export default {
  development: {
    username: process.env.DB_USER || "levi",
    password: process.env.DB_PASSWORD || "cindy1219",
    database: process.env.DB_NAME || "news_db",
    host: process.env.HOST || "127.0.0.1",
    dialect: "mysql",
    seederStorage: "json",
    seederStoragePath: "../database/seeders"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
}
