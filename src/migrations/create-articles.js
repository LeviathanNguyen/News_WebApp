"use strict";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("articles", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
            },
            thumbnail: Sequelize.STRING,
            status: {
                type: Sequelize.ENUM("draft", "published", "archived"),
                defaultValue: "draft",
            },
            category_id: {
                type: Sequelize.INTEGER,
                references: { model: "categories", key: "id" },
            },
            author_id: {
                type: Sequelize.INTEGER,
                references: { model: "users", key: "id" },
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("articles");
    },
};