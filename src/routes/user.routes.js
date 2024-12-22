import e from 'express';
import userController from "../controllers/userController"
import auth from "../middlewares/auth"

const router = e.Router();

// Update-info route
router.put("/profile", auth.verifyToken, userController.updateProfile);

// Change-password route
router.post("/change-password", auth.verifyToken, userController.changePassword);

export default router;