import express from "express";
import WriterController from "../controllers/writerController.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/dashboard", WriterController.dashboard);
// Display create article form
router.get("/create", async (req, res) => {
  console.log("check");
  try {
    const categories = await Category.getAllCategories(); // Fetch categories for the dropdown
    const admins = await User.search({ role: "editor" }); // Lọc role là editor
    console.log(admins);
    res.render("writer/create", {
      title: "Tạo bài viết mới",
      categories,
      admins,
    });
  } catch (error) {
    console.error("Error loading create article form:", error);
    res.status(500).render("errors/500", { title: "Lỗi Server" });
  }
});

// Handle article creation
router.post(
  "/create",
  upload.single("thumbnail"),
  WriterController.createArticle
);
router.get("/edit/:id", WriterController.editArticlePage);

router.post("/edit/:id", WriterController.updateArticle);

export default router;
