"use strict";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM("guest", "subscriber", "writer", "editor", "admin"),
                defaultValue: "guest",
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};