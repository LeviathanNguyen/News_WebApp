import Article from "../models/Article.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import Category from "../models/Category.js";
import User from "../models/User.js";
// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WriterController = {
  // Dashboard for writer
  async dashboard(req, res) {
    if (!req?.session?.user?.id) {
      res.redirect("/auth/login");
      return;
    }
    try {
      const userId = req.session.user.id;
      const { status } = req.query; // Lấy trạng thái từ query

      // Fetch articles by writer and optional status
      const articles = await Article.getArticlesByAuthorAndStatus(
        userId,
        status
      );
      res.render("writer/dashboard", {
        title: "Writer Dashboard",
        articles,
        filterStatus: status || "", // Truyền trạng thái đang lọc về giao diện
      });
    } catch (error) {
      console.error("Error loading writer dashboard:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  // Create article page
  async createArticlePage(req, res) {
    try {
      res.render("writer/create", { title: "Create New Article" });
    } catch (error) {
      console.error("Error loading create article page:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  // Submit new article
  async createArticle(req, res) {
    try {
      const { title, abstract, content, categoryId, adminId, isPremium } =
        req.body;
      const userId = req.session.user.id;
      let thumbnailPath = null;

      // Validate adminId
      if (adminId && isNaN(adminId)) {
        return res.status(400).send("Editor ID phải là số.");
      }

      // Handle file upload
      if (req.file) {
        const uploadDir = path.join(__dirname, "../public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${req.file.originalname}`;
        thumbnailPath = `/uploads/${fileName}`;
        fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
      }

      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });

      // Create article
      await Article.create({
        title,
        slug,
        abstract,
        content,
        thumbnail: thumbnailPath,
        category_id: categoryId,
        author_id: userId,
        admin_id: adminId || null,
        is_premium: isPremium === "1", // Chuyển thành boolean
        status: "draft",
      });

      res.redirect("/writer/dashboard");
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },
  // Edit article page
  async editArticlePage(req, res) {
    try {
      const { id } = req.params; // Get the article ID from route parameters
      const article = await Article.getArticleById(id);

      if (!article) {
        return res
          .status(404)
          .render("errors/404", { title: "Article Not Found" });
      }

      const categories = await Category.getAllCategories(); // Retrieve categories for the dropdown

      res.render("writer/edit", {
        title: "Chỉnh sửa bài viết",
        article,
        categories,
      });
    } catch (error) {
      console.error("Error loading article for editing:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  // Update article
  async updateArticle(req, res) {
    try {
      const { id } = req.params;
      const { title, abstract, content, categoryId } = req.body;
      let thumbnailPath = null;

      // Handle file upload if a new file is provided
      if (req.file) {
        const uploadDir = path.resolve("public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${req.file.originalname}`;
        thumbnailPath = `/uploads/${fileName}`;
        fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
      }
      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });
      await Article.update(id, {
        title,
        slug,
        abstract,
        content,
        thumbnail: thumbnailPath || undefined, // Use the existing thumbnail if not updated
        category_id: categoryId,
      });

      res.redirect("/writer/dashboard");
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },
};

export default WriterController;
