import e from "express";

const router = e.Router();

router.get("/auth", (req, res) => {
    res.send("Authentication route")
});

export default router;