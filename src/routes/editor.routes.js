import express from "express";
import EditorController from "../controllers/editorController.js";
import Article from "../models/Article.js";
const router = express.Router();

// Dashboard: View draft articles
router.get("/dashboard", EditorController.dashboard);

// Approve Article
router.get("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.getArticleById(id);

    if (!article) {
      return res
        .status(404)
        .render("errors/404", { title: "Article Not Found" });
    }

    res.render("editor/approve", { title: "Approve Article", article });
  } catch (error) {
    console.error("Error loading approve article page:", error);
    res.status(500).render("errors/500", { title: "Error" });
  }
});

router.post("/approve/:id", EditorController.approveArticle);

// Reject Article
router.get("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.getArticleById(id);

    if (!article) {
      return res
        .status(404)
        .render("errors/404", { title: "Article Not Found" });
    }

    res.render("editor/reject", { title: "Reject Article", article });
  } catch (error) {
    console.error("Error loading reject article page:", error);
    res.status(500).render("errors/500", { title: "Error" });
  }
});

router.post("/reject/:id", EditorController.rejectArticle);

export default router;
