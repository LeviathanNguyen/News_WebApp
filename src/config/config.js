import "dotenv/config";

export default {
    development: {
        app: {
            port: process.env.PORT || 3000,
            sessionSecret: process.env.SESSION_SECRET,
            jwtSecret: process.env.JWT_SECRET,
        },
        database: {
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME || 'news_db',
            connectionLimit: 10
        },
        mail: {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        // oauth: {
        //     google: {
        //         clientId: process.env.GOOGLE_CLIENT_ID,
        //         clientSecret: process.env.GOOGLE_CLIENT_SECRET
        //     }
        // }
    },

    // Test template
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },

    // Production template
    production: {
        username: "root",
        password: null,
        database: "database_production",
        host: "127.0.0.1",
        dialect: "mysql",
    },
};
