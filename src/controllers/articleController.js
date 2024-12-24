import Article from "../models/Article.js";

const ArticleController = {
  // Trang chủ: Hiển thị bài viết nổi bật và mới nhất
  async home(req, res) {
    try {
      const featuredArticles = await Article.getFeaturedArticles(4);
      const latestArticles = await Article.getLatestArticles(10);

      res.render("guest/home", {
        title: "Trang chủ",
        featuredArticles,
        latestArticles,
      });
    } catch (error) {
      console.error("Error loading home page:", error);
      res.status(500).render("errors/500");
    }
  },

  // Hiển thị danh sách bài viết theo chuyên mục
  async category(req, res) {
    try {
      const { categoryId } = req.params;
      const articles = await Article.getArticlesByCategory(categoryId);

      res.render("guest/category", {
        title: "Danh sách bài viết",
        articles,
      });
    } catch (error) {
      console.error("Error loading category page:", error);
      res.status(500).render("errors/500");
    }
  },

  // Chi tiết bài viết
  async detail(req, res) {
    try {
      const { slug } = req.params; // Lấy slug từ URL

      if (!slug) {
        throw new Error("Slug is missing.");
      }

      const article = await Article.getArticleBySlug(slug);

      if (!article) {
        return res.status(404).render("errors/404", {
          title: "Không tìm thấy bài viết",
        });
      }

      res.render("articles/detail", {
        title: article.title,
        article,
      });
    } catch (error) {
      console.error("Error loading article detail:", error);
      res.status(500).render("errors/500", {
        title: "Lỗi Server",
      });
    }
  },

  // Tìm kiếm bài viết
  async search(req, res) {
    try {
      const { query } = req.query;
      const [rows] = await pool.execute(
        `SELECT id, title, slug, abstract, thumbnail 
                 FROM articles 
                 WHERE (title LIKE ? OR abstract LIKE ?) 
                 AND status = 'published'`,
        [`%${query}%`, `%${query}%`]
      );

      res.render("guest/search", {
        title: "Kết quả tìm kiếm",
        articles: rows,
        query,
      });
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).render("errors/500");
    }
  },
};

export default ArticleController;
