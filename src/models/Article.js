import { Model, DataTypes } from "sequelize";
const { sequelize } = require("../config/database");

class Article extends Model {
    // Check if article is premium content
    isPremium() {
        return this.is_premium;
    }

    // Check if article is published and within publish date
    isPublished() {
        return this.status === "published" && this.publish_date <= new Date();
    }
}

Article.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [5, 255], // Title must be between 5 and 255 characters
        },
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure unique URLs for SEO
    },
    abstract: {
        type: DataTypes.TEXT,
        allowNull: false, // Required for article preview
    },
    content: {
        type: DataTypes.TEXT("long"),
        allowNull: false, // Main article content
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true, // Optional featured image URL
    },
    status: {
        type: DataTypes.ENUM("draft", "pending", "published", "rejected"),
        defaultValue: "draft",
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true, // Required when status is "rejected"
    },
    is_premium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Premium content flag
    },
    publish_date: {
        type: DataTypes.DATE,
        allowNull: true, // Schedule publish date
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Track article views
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categories",
            key: "id",
        },
    },
}, {
    sequelize,
    modelName: "Article",
    tableName: "articles",
    underscored: true,
    hooks: {
        // Generate SEO-friendly slug from title if not provided
        beforeValidate: (article, options) => {
            if (!article.slug) {
                article.slug = article.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                    .replace(/\s+/g, "-"); // Replace spaces with hyphens
            }
        },
    },
});

// Define relationships between models
User.hasMany(Article, {
    foreignKey: "author_id",
    as: "author"
});

Article.belongsTo(User, {
    foreignKey: "author_id",
    as: "author"
});

module.exports = {
    User,
    Article
}