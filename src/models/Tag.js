import pool from "../config/database.js";
import BaseModel from "./BaseModel.js";

class Tag extends BaseModel {
    static tableName = "tags";
    static modelName = "Tag";

    static async validate(data) {
        const errors = [];
        
        if (!data.name || data.name.length < 2 || data.name.length > 100) {
            errors.push("Tên tag phải từ 2 đến 100 ký tự");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }
    }

    static async getArticles(tagId, limit = 10, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT a.* FROM articles a 
                JOIN article_tags at ON a.id = at.article_id 
                WHERE at.tag_id = ? AND a.status = 'published'
                LIMIT ? OFFSET ?`,
                [tagId, limit, offset]
            );
            return rows;
        } catch (error) {
            throw new Error(`Cannot fetch articles by tag: ${error.message}`);
        }
    }
}

export default Tag;