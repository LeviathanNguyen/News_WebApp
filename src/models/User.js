import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import { sequelize } from "../config/database"

class User extends Model {
    // Validate user's password
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }

    // Check if user's subscription is still active
    isSubscriptionActive() {
        if (!this.subscription_expires_at) return false;
        return new Date(this.subscription_expires_at) > new Date();
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50] // Username must be between 3 and 50 characters
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Ensures valid email format
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pen_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM("guest", "subscriber", "writer", "editor", "admin"),
        defaultValue: "guest"
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    subscription_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    hooks: {
        // Hash password before creating new user
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        },
        // Hash password when updating if password field is modified
        beforeUpdate: async (user) => {
            if (user.changed("password")) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});