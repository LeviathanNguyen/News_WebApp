import Article from "../models/Article.js";

const EditorController = {
  async dashboard(req, res) {
    if (!req?.session?.user?.id) {
      res.redirect("/auth/login");
      return;
    }
    try {
      const editorId = req.session.user.id;
      const { status } = req.query;

      // Fetch articles based on status
      const articles = await Article.getArticlesByEditorAndStatus(
        editorId,
        status
      );
      console.log(articles);
      res.render("editor/dashboard", {
        title: "Editor Dashboard",
        articles,
        filterStatus: status || "", // Truyền trạng thái đang lọc về giao diện
      });
    } catch (error) {
      console.error("Error loading editor dashboard:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  async approveArticle(req, res) {
    try {
      const { id } = req.params;

      await Article.updateStatus(id, "published", req.body.publishDate);
      res.redirect("/editor/dashboard");
    } catch (error) {
      console.error("Error approving article:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  async rejectArticle(req, res) {
    try {
      const { id } = req.params;

      await Article.updateStatus(
        id,
        "rejected",
        null,
        req.body.rejectionReason
      );
      res.redirect("/editor/dashboard");
    } catch (error) {
      console.error("Error rejecting article:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },

  // Get draft articles for the editor
  async getDraftArticles(req, res) {
    try {
      const editorId = req.session.user.id; // Assuming editor is logged in
      const articles = await Article.getDraftArticlesByEditor(editorId);

      res.render("editor/drafts", {
        title: "Draft Articles",
        articles,
      });
    } catch (error) {
      console.error("Error fetching draft articles:", error);
      res.status(500).render("errors/500", { title: "Error" });
    }
  },
};

export default EditorController;
