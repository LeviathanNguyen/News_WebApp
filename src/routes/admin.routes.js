import e from "express";
import adminController from "../controllers/adminController.js";
const router = e.Router();

router.get("/admin", (req, res) => {
  res.send("Administation route");
});
router.get("/dashboard", adminController.getDashboard);

// Manage Users
router.get("/users", adminController.getUsers);
router.post("/users", adminController.addUser);

// Manage Categories
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.addCategory);

// Manage Articles
router.get("/articles", adminController.getArticles);
router.post("/articles", adminController.addArticle);
router.post("/articles/:id/status", adminController.updateArticleStatus);
router.get("/article-edit/:id", adminController.getArticleDetails);
router.post("/article-edit/:id", adminController.updateArticle);

// Manage Tags
router.get("/tags", adminController.getTags);
router.post("/tags", adminController.addTag);
export default router;
