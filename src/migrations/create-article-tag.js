"use strict";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("article_tags", {
            article_id: {
                type: Sequelize.INTEGER,
                references: { model: "articles", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            tag_id: {
                type: Sequelize.INTEGER,
                references: { model: "tags", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("article_tags");
    },
};