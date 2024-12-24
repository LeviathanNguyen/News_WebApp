import e from "express";
import Article from "../models/Article.js";
import Category from "../models/Category.js";
import Tag from "../models/Tag.js";
import User from "../models/User.js";
import ArticleController from "../controllers/articleController.js";
const router = e.Router();

router.get("/", async (req, res) => {
  try {
    const { categoryId, query } = req.query; // Lấy categoryId và query từ query string

    // Lấy danh sách bài viết (lọc theo categoryId và query nếu có)
    const articles = await Article.getAllArticles(categoryId, query);

    // Lấy danh sách chuyên mục
    const categories = await Category.getAllCategories();

    // Render view với dữ liệu bài viết, chuyên mục, và từ khóa tìm kiếm
    res.render("articles/index", {
      title: "Trang chủ",
      articles,
      categories,
      req,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: display article details
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const article = await Article.findOne({
      where: { slug },
      include: [
        { model: User, as: "author", attributes: ["full_name", "pen_name"] },
        { model: Category, as: "category", attributes: ["name"] },
        { model: Tag, as: "tags", through: { attributes: [] } }, // Many2many relation
      ],
    });

    if (!article) {
      // Render a 404 page if the article is not found
      res.status(404).render("404", { message: "Article not found" });
    } else {
      // Render the article details page
      res.render("articles/details", { article });
    }
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/article/:slug", ArticleController.detail);

router.get("/", ArticleController.home);

// Danh sách bài viết theo chuyên mục
router.get("/category/:categoryId", ArticleController.category);

// Chi tiết bài viết
router.get("/article/:articleId", ArticleController.detail);

// Tìm kiếm bài viết
router.get("/search", ArticleController.search);

export default router;
