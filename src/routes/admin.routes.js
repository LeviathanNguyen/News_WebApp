import e from "express";
import adminController from "../controllers/adminController.js";
const router = e.Router();
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
router.get("/admin", (req, res) => {
  res.send("Administation route");
});
router.get("/dashboard", adminController.getDashboard);

// Manage Users
// Trang quản lý người dùng
router.get("/users", adminController.filterUsersByRole);

// Trang thêm người dùng
router.get("/user-add", (req, res) => {
  res.render("admin/user-add", { title: "Thêm Người dùng" });
});

// Thêm người dùng mới
router.post("/user-add", adminController.addUser);

// Cập nhật vai trò người dùng
router.post("/users/:id/update-role", adminController.updateUserRole);

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