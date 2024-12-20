import e from "express";

const router = e.Router();

router.get("/admin", (req, res) => {
    res.send("Administation route")
});

export default router;