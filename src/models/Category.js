import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class Category extends Model {
    // Get the total number of articles in this category
    async countArticles() {
        return this.getArticles().then((articles) => articles.length);
    }
}

Category.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 100], // Name must be between 3 and 100 characters
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional description for the category
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // SEO-friendly format
        },
    },
}, {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    underscored: true,
    hooks: {
        // Generate slug from name before saving
        beforeValidate: (category) => {
            if (!category.slug) {
                category.slug = category.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                    .replace(/\s+/g, "-"); // Replace spaces with hyphens
            }
        },
    },
});

export { Category };
