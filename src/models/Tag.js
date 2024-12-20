import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class Tag extends Model {
    // Check if this tag is associated with any articles
    async hasArticles() {
        return this.getArticles().then((articles) => articles.length > 0);
    }
}

Tag.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50], // Tag name must be between 3 and 50 characters
        },
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
    modelName: "Tag",
    tableName: "tags",
    underscored: true,
    hooks: {
        // Generate slug from name before saving
        beforeValidate: (tag) => {
            if (!tag.slug) {
                tag.slug = tag.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                    .replace(/\s+/g, "-"); // Replace spaces with hyphens
            }
        },
    },
});

export { Tag };
