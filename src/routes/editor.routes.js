import e from "express";

const router = e.Router();

router.get("/editor", (req, res) => {
    res.send("Editor route")
});

export default router;