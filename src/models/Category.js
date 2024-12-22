import pool from "../config/database.js";
import BaseModel from "./BaseModel.js";

class Category extends BaseModel {
    static tableName = "categories";
    static modelName = "Category";

    static async validate(data) {
        const errors = [];
        
        if (!data.name || data.name.length < 3 || data.name.length > 100) {
            errors.push("Tên danh mục phải từ 3 đến 100 ký tự");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }
    }

    static async getArticleCount(categoryId) {
        try {
            const [rows] = await pool.execute(
                `SELECT COUNT(*) as count FROM articles WHERE category_id = ?`,
                [categoryId]
            );
            return rows[0].count;
        } catch (error) {
            throw new Error(`Cannot count articles in category: ${error.message}`);
        }
    }
}

export default Category;
