const express = require("express");
const router = express.Router();

// Controller
const { register, login, getCurrentUser, update, getUserById, SearchUser } = require("../controllers/UserController");

// middlewares
const validate = require("../middlewares/handleValidations")
const { userCreateValidation, loginValidation, userUpdateValidation, } = require("../middlewares/userValidations")
const authGuard = require ("../middlewares/authGuard");
const { imageUpload } = require("../middlewares/imageUpload");

// Routes
router.post("/register", userCreateValidation(), validate, register);
router.get("/profile", authGuard, getCurrentUser);
router.get("/search", authGuard, SearchUser) 
router.post("/login", loginValidation(), validate, login);
router.put(
  "/",
  authGuard,
  userUpdateValidation(),
  validate,
  imageUpload.single("profileImage"),
  update
);
router.get("/:id", getUserById)

module.exports = router;