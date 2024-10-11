const express = require("express");
const router = express.Router();

// Controller
const { register, login, getCurrentUser, update, getUserById, SearchUser, requestPasswordReset, resetPassword } = require("../controllers/UserController");

// middlewares
const validate = require("../middlewares/handleValidations");
const { userCreateValidation, loginValidation, userUpdateValidation } = require("../middlewares/userValidations");
const authGuard = require("../middlewares/authGuard");
const { upload } = require("../middlewares/portfolioUpload");

// Routes
router.post("/register", userCreateValidation(), validate, register);
router.post("/forgot-password", requestPasswordReset); // Rota para solicitar a redefinição de senha
router.post("/reset-password/:token", resetPassword); // Rota para redefinir a senha usando o token
router.get("/profile", authGuard, getCurrentUser);
router.get("/search", authGuard, SearchUser);
router.post("/login", loginValidation(), validate, login);
router.put("/", authGuard, userUpdateValidation(), validate, upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "portfolio", maxCount: 1 },
]), update);
router.get("/:id", getUserById);

module.exports = router;
