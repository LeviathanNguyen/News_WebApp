import e from "express";
import { Article, User } from "../models/Article.js"
import Category from "../models/Category.js"
import Tag from "../models/Tag.js"

const router = e.Router();

router.get("/", async (req, res) => {
    // Worked
    // res.send("Article route")
    try {
        const articles = await Article.findAll({
            include: [
                { model: User, as: "author", attributes: ["full_name", "pen_name"] },
                { model: Category, as: "category", attributes: ["name"] },
                { model: Tag, as: "tags", through: { attributes: [] } }, // Many2Many relation
            ],
            order: [["publish_date", "DESC"]],
        });

        res.render("articles/index", { articles });
    } catch (error) {
        console.error("Error fetch articles:", error);
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

export default router;