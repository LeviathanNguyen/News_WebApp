import { resolve } from "path";
import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Load configuration file
const config = (await import(resolve(__dirname, "./config/config.js"))).default;

// Initialize Sequelize instance
const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    config.development
);

// Initialize Umzug instance for migrations
const umzug = new Umzug({
    migrations: {
        glob: resolve(__dirname, "./migrations/*.js"),
        resolve: ({ name, path, context }) => {
            const migration = require("path");
            return {
                name,
                up: async () => migration.up(context.queryInterface, context.Sequelize),
                down: async () => migration.down(context.queryInterface, context.Sequelize),
            };
        },
    },
    context: {
        queryInterface: sequelize.getQueryInterface(),
        Sequelize,
    },
    storage: new SequelizeStorage({ sequelize }),
    storageOptions: { sequelize },
    logger: console,
});

export { sequelize, umzug };