import express from "express";
import { handleLoginUser, handleRegisterFirstUser, handleRegisterUser, handleRegisterUsingLeftLink, handleRegisterUsingRightLink } from "../controllers/authController.js";

const router = express.Router();

// Route for registering the first user
router.post("/register-first-user", handleRegisterFirstUser);
router.post("/register-user", handleRegisterUser);
router.post("/register-using-left-link", handleRegisterUsingLeftLink);
router.post("/register-using-right-link", handleRegisterUsingRightLink);
router.post("/login-user", handleLoginUser);

export default router;