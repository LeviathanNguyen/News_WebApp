import pool from "../config/database.js";

class BaseModel {
    static tableName = "";
    static modelName = "";

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`${this.modelName} not found: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            if (this.validate) {
                await this.validate(data);
            }

            const fields = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => "?").join(", ");
            const values = Object.values(data);

            const [result] = await pool.execute(
                `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`,
                values
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Cannot create ${this.modelName}: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            if (this.validate) {
                await this.validate(data);
            }

            const fields = Object.keys(data).map(field => `${field} = ?`).join(", ");
            const values = [...Object.values(data), id];

            const [result] = await pool.execute(
                `UPDATE ${this.tableName} SET ${fields} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Cannot update ${this.modelName}: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute(
                `DELETE FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Cannot delete ${this.modelName}: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const [rows] = await pool.execute(`SELECT * FROM ${this.tableName}`);
            return rows;
        } catch (error) {
            throw new Error(`Cannot fetch ${this.modelName}s: ${error.message}`);
        }
    }

    static async findOneBy(field, value) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`,
                [value]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Cannot find ${this.modelName} by ${field}: ${error.message}`);
        }
    }

    static async count(conditions = {}) {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE 1=1`;
            const params = [];

            Object.entries(conditions).forEach(([key, value]) => {
                query += ` AND ${key} = ?`;
                params.push(value);
            });

            const [rows] = await pool.execute(query, params);
            return rows[0].count;
        } catch (error) {
            throw new Error(`Cannot count ${this.modelName}: ${error.message}`);
        }
    }
}

export default BaseModel;