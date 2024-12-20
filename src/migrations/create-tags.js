"use strict";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("tags", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("tags");
    },
};