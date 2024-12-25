import User from "../models/User.js";
import Article from "../models/Article.js";
import Category from "../models/Category.js";
import Tag from "../models/Tag.js";
import bcrypt from "bcrypt";
const adminController = {
  // Dashboard
  async getDashboard(req, res) {
    try {
      const userCount = await User.count();
      const articleCount = await Article.count();
      const categoryCount = await Category.count();
      const tagCount = await Tag.count();

      res.render("admin/dashboard", {
        title: "Admin Dashboard",
        userCount,
        articleCount,
        categoryCount,
        tagCount,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Users
  async getUsers(req, res) {
    try {
      const users = await User.findAll();
      res.render("admin/users", { title: "Manage Users", users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async addUser(req, res) {
    try {
      const { username, email, role } = req.body;
      await User.create({ username, email, role });
      res.redirect("/admin/users");
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Categories
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.render("admin/categories", {
        title: "Manage Categories",
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async addCategory(req, res) {
    try {
      const { name, description } = req.body;
      await Category.create({ name, description });
      res.redirect("/admin/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Articles
  async getArticles(req, res) {
    try {
      const articles = await Article.findAllWithDetails();
      const categories = await Category.findAll();

      res.render("admin/articles", {
        title: "Manage Articles",
        articles,
        categories,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Update article status
  async updateArticleStatus(req, res) {
    try {
      const { id } = req.params; // Lấy ID bài viết từ URL
      const { status } = req.body; // Lấy trạng thái mới từ form

      // Cập nhật trạng thái bài viết
      await Article.update(id, { status });

      res.redirect("/admin/articles"); // Chuyển hướng lại trang quản lý bài viết
    } catch (error) {
      console.error("Error updating article status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async addArticle(req, res) {
    try {
      const {
        title,
        abstract,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_premium,
      } = req.body;

      // Gọi model để thêm bài viết
      await Article.createArticle({
        title,
        abstract,
        content,
        thumbnail: thumbnail || null,
        category_id,
        author_id,
        status,
        is_premium: is_premium === "true", // Convert string to boolean
      });

      res.redirect("/admin/articles"); // Chuyển hướng về trang quản lý bài viết
    } catch (error) {
      console.error("Error adding article:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Tags
  async getTags(req, res) {
    try {
      const tags = await Tag.findAll();
      res.render("admin/tags", { title: "Manage Tags", tags });
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async addTag(req, res) {
    try {
      const { name } = req.body;
      await Tag.create({ name });
      res.redirect("/admin/tags");
    } catch (error) {
      console.error("Error adding tag:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.search({}, 100, 0);
      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách người dùng",
      });
    }
  },

  async getArticleDetails(req, res) {
    try {
      const { id } = req.params; // Lấy ID bài viết từ URL
      const article = await Article.findById(id); // Tìm bài viết theo ID
      const categories = await Category.findAll(); // Lấy danh sách danh mục

      if (!article) {
        return res.status(404).send("Article not found");
      }

      res.render("admin/article-edit", {
        title: "Chỉnh sửa Bài báo",
        article,
        categories,
      });
    } catch (error) {
      console.error("Error fetching article details:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async updateArticle(req, res) {
    console.log(req.body);
    try {
      const { id } = req.params; // Lấy ID bài viết từ URL
      const {
        title,
        abstract,
        content,
        thumbnail,
        category_id,
        status,
        is_premium,
      } = req.body;

      // Cập nhật bài viết
      await Article.update(id, {
        title,
        abstract,
        content,
        thumbnail: thumbnail || null,
        category_id,
        status,
        is_premium: is_premium === "true",
      });

      res.redirect("/admin/articles"); // Chuyển hướng về danh sách bài viết
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async filterUsersByRole(req, res) {
    try {
      const { role } = req.query; // Lấy vai trò từ query parameter
      const filters = {};

      // Chỉ thêm điều kiện role nếu có
      if (role) {
        filters.role = role;
      }

      // Truy vấn với bộ lọc
      const users = await User.search(filters, 100, 0);

      res.render("admin/users", { title: "Manage Users", users });
    } catch (error) {
      console.error("Error filtering users by role:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async addUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Kiểm tra nếu không có password
      if (!password || password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      // Tạo người dùng mới với mật khẩu đã băm
      await User.adminCreateUser({
        username,
        email,
        password,
        role,
      });

      res.redirect("/admin/users");
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).send(`Lỗi: ${error.message}`);
    }
  },

  async updateUserRole(req, res) {
    try {
      const { id } = req.params; // ID người dùng
      const { role } = req.body; // Vai trò mới

      // Kiểm tra vai trò hợp lệ
      const validRoles = ["guest", "subscriber", "writer", "editor", "admin"];
      if (!validRoles.includes(role)) {
        throw new Error("Vai trò không hợp lệ");
      }

      // Cập nhật vai trò
      await User.update(id, { role });

      res.redirect("/admin/users"); // Chuyển hướng lại trang người dùng
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export default adminController;
