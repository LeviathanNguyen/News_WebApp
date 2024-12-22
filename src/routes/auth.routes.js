import e from "express";

import authController from "../controllers/authController.js";
import validator from "../middlewares/validate.js";

const router = e.Router();

// Register route
router.post("/register", validator.validateRegister, authController.register);

// Login route
router.post("/login", validator.validateLogin, authController.login);

// Logout route
router.post("/logout", authController.logout);

// Forgot-password route
// router.get("/forgot-password", (req, res) => {
//     res.render("auth/forgot-password", {
//         title: "Quên Mật Khẩu",
//         layout: "./views/layouts/main.ejs"
//     });
// });

export default router;