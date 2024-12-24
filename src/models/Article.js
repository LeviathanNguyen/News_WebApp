import pool from "../config/database.js";
import BaseModel from "./BaseModel.js";
import slugify from "slugify";
class Article extends BaseModel {
  static tableName = "articles";
  static modelName = "Article";

  static async validate(data) {
    const errors = [];

    if (!data.title || data.title.length < 5 || data.title.length > 255) {
      errors.push("Tiêu đề phải từ 5 đến 255 ký tự");
    }
    if (!data.abstract) {
      errors.push("Tóm tắt không được để trống");
    }
    if (!data.content) {
      errors.push("Nội dung không được để trống");
    }
    if (!data.author_id) {
      errors.push("ID tác giả không được để trống");
    }
    if (!data.category_id) {
      errors.push("ID danh mục không được để trống");
    }
    if (
      data.status &&
      !["draft", "pending", "published", "rejected"].includes(data.status)
    ) {
      errors.push("Trạng thái không hợp lệ");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  static async findBySlug(slug) {
    return this.findOneBy("slug", slug);
  }

  static async findByStatus(status, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM ${this.tableName} WHERE status = ? LIMIT ? OFFSET ?`,
        [status, limit, offset]
      );
      return rows;
    } catch (error) {
      throw new Error(`Cannot find articles by status: ${error.message}`);
    }
  }

  static async incrementViewCount(id) {
    try {
      await pool.execute(
        `UPDATE ${this.tableName} SET view_count = view_count + 1 WHERE id = ?`,
        [id]
      );
    } catch (error) {
      throw new Error(`Cannot increment view count: ${error.message}`);
    }
  }

  static async getPremiumArticles(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM ${this.tableName} 
                WHERE is_premium = TRUE AND status = 'published'
                ORDER BY publish_date DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw new Error(`Cannot fetch premium articles: ${error.message}`);
    }
  }

  static async findAllWithDetails() {
    const query = `
          SELECT a.*, c.name as category_name, u.username as author_name
          FROM articles a
          JOIN categories c ON a.category_id = c.id
          JOIN users u ON a.author_id = u.id
        `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    const query = `UPDATE articles SET ${setClause} WHERE id = ?`;
    await pool.query(query, [...values, id]);
  }

  static async createArticle(data) {
    try {
      const { title, abstract, content, categoryId } = req.body;
      const userId = req.session.user.id;
      let thumbnailPath = null;

      // Handle file upload
      if (req.file) {
        const uploadDir = path.join(__dirname, "../public/uploads"); // Path to upload directory
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${req.file.originalname}`;
        thumbnailPath = `/uploads/${fileName}`;
        fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
      }

      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });

      // Insert the article into the database
      await Article.create({
        title,
        slug,
        abstract,
        content,
        thumbnail: thumbnailPath,
        category_id: categoryId,
        author_id: userId,
        status: "draft",
      });

      res.redirect("/writer/dashboard");
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  }

  static async findById(id) {
    const query = `
      SELECT a.*, c.name as category_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const query = `UPDATE articles SET ${setClause} WHERE id = ?`;

    await pool.query(query, [...values, id]);
  }

  // Lấy danh sách bài viết nổi bật (xem nhiều nhất)
  static async getFeaturedArticles(limit = 4) {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, abstract, thumbnail, view_count 
         FROM ${this.tableName} 
         WHERE status = 'published' 
         ORDER BY view_count DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Lấy danh sách bài viết mới nhất
  static async getLatestArticles(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, abstract, thumbnail, publish_date 
         FROM ${this.tableName} 
         WHERE status = 'published' 
         ORDER BY publish_date DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Lấy danh sách bài viết theo chuyên mục
  static async getArticlesByCategory(categoryId, limit = 10) {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, abstract, thumbnail, view_count 
         FROM ${this.tableName} 
         WHERE category_id = ? AND status = 'published' 
         ORDER BY publish_date DESC LIMIT ?`,
      [categoryId, limit]
    );
    return rows;
  }

  static async getArticleBySlug(slug) {
    if (!slug) {
      throw new Error("Slug must be provided.");
    }

    const sql = `
        SELECT a.*, u.full_name as author_name, c.name as category_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ? AND a.status = 'published'
    `;

    const [rows] = await pool.execute(sql, [slug]);
    return rows[0]; // Trả về bài viết đầu tiên
  }
  static async getAllArticles(categoryId = null, query = null) {
    let sql = `
        SELECT 
            a.*, 
            u.full_name AS author_name, 
            u.pen_name AS author_pen_name, 
            c.name AS category_name
        FROM 
            articles a
        LEFT JOIN 
            users u ON a.author_id = u.id
        LEFT JOIN 
            categories c ON a.category_id = c.id
        WHERE 
            a.status = 'published'
    `;

    const values = [];

    // Nếu có categoryId, thêm điều kiện lọc theo chuyên mục
    if (categoryId) {
      sql += ` AND a.category_id = ?`;
      values.push(categoryId);
    }

    // Nếu có query, thêm điều kiện tìm kiếm
    if (query) {
      sql += ` AND (a.title LIKE ? OR a.abstract LIKE ? OR a.content LIKE ?)`;
      const searchQuery = `%${query}%`;
      values.push(searchQuery, searchQuery, searchQuery);
    }

    // Sắp xếp theo ngày publish
    sql += ` ORDER BY a.publish_date DESC`;

    // Thực thi truy vấn
    const [rows] = await pool.execute(sql, values);
    return rows;
  }

  static async searchArticles(query) {
    const sql = `
        SELECT 
            a.*, 
            u.full_name AS author_name, 
            u.pen_name AS author_pen_name, 
            c.name AS category_name
        FROM 
            articles a
        LEFT JOIN 
            users u ON a.author_id = u.id
        LEFT JOIN 
            categories c ON a.category_id = c.id
        WHERE 
            (a.title LIKE ? OR a.abstract LIKE ? OR a.content LIKE ?)
            AND a.status = 'published'
        ORDER BY 
            a.publish_date DESC
    `;

    const values = [`%${query}%`, `%${query}%`, `%${query}%`];
    const [rows] = await pool.execute(sql, values);
    return rows;
  }

  static async getArticlesByAuthor(authorId) {
    if (!authorId) {
      throw new Error("Author ID is required.");
    }

    const sql = `
      SELECT 
        a.*, 
        u.full_name AS author_name, 
        u.pen_name AS author_pen_name, 
        c.name AS category_name
      FROM 
        articles a
      LEFT JOIN 
        users u ON a.author_id = u.id
      LEFT JOIN 
        categories c ON a.category_id = c.id
      WHERE 
        a.author_id = ? 
      ORDER BY 
        a.publish_date DESC
    `;

    const [rows] = await pool.execute(sql, [authorId]);
    return rows;
  }

  static async getArticleById(id) {
    if (!id) {
      throw new Error("Article ID must be provided.");
    }

    const query = `
      SELECT 
        a.*, 
        u.full_name AS author_name, 
        u.pen_name AS author_pen_name, 
        c.name AS category_name 
      FROM 
        articles a
      LEFT JOIN 
        users u ON a.author_id = u.id
      LEFT JOIN 
        categories c ON a.category_id = c.id
      WHERE 
        a.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0]; // Return the article (or null if not found)
  }

  static async getArticlesByEditorAndStatus(editorId, status = null) {
    if (!editorId) {
      throw new Error("Editor ID must be provided.");
    }

    let sql = `
      SELECT 
        a.*, 
        u.full_name AS author_name, 
        c.name AS category_name
      FROM 
        articles a
      JOIN 
        users u ON a.author_id = u.id
      JOIN 
        categories c ON a.category_id = c.id
      WHERE 
        a.admin_id = ?
    `;

    const values = [editorId]; // Khởi tạo với editorId

    // Nếu có trạng thái, thêm điều kiện lọc theo status
    if (status) {
      sql += ` AND a.status = ?`;
      values.push(status);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  }

  static async updateStatus(
    id,
    status,
    publishDate = null,
    rejectionReason = null
  ) {
    try {
      const updateFields = [];
      const values = [];

      // Xây dựng mệnh đề UPDATE
      updateFields.push("status = ?");
      values.push(status);

      if (publishDate) {
        updateFields.push("publish_date = ?");
        values.push(publishDate);
      }

      if (status === "reject") {
        updateFields.push("rejection_reason = ?");
        values.push(rejectionReason);
      } else {
        updateFields.push("rejection_reason = NULL"); // Reset lý do từ chối nếu không phải reject
      }

      values.push(id); // Thêm ID vào danh sách giá trị

      // Xây dựng câu lệnh SQL
      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

      // Thực thi câu lệnh SQL
      const [result] = await pool.query(query, values);

      // Kiểm tra nếu không có hàng nào bị ảnh hưởng
      if (result.affectedRows === 0) {
        throw new Error(`Article with ID ${id} not found.`);
      }

      return result;
    } catch (error) {
      console.error("Error updating article status:", error);
      throw error;
    }
  }

  static async getArticlesByAuthorAndStatus(authorId, status = null) {
    if (!authorId) {
      throw new Error("Author ID is required.");
    }

    let sql = `
      SELECT 
        a.*, 
        u.full_name AS author_name, 
        u.pen_name AS author_pen_name, 
        c.name AS category_name
      FROM 
        articles a
      LEFT JOIN 
        users u ON a.author_id = u.id
      LEFT JOIN 
        categories c ON a.category_id = c.id
      WHERE 
        a.author_id = ?
    `;

    const values = [authorId];

    // Nếu có trạng thái, thêm điều kiện lọc
    if (status) {
      sql += ` AND a.status = ?`;
      values.push(status);
    }

    sql += ` ORDER BY a.publish_date DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  }
}

export default Article;
