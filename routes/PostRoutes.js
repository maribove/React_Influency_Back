const express = require("express");
const router = express.Router();

// CONTROLLER
const { insertPost, deletePost, getAllPosts, getUserPosts, getPostById, updatePost } = require("../controllers/PostController");

// MIDDLEWARES
const { postInsertValidation, postUpdateValidation } = require("../middlewares/postValidation")
const authGuard = require("../middlewares/authGuard");
const validate = require("../middlewares/handleValidations");
const { imageUpload } = require("../middlewares/imageUpload");


// ROUTES
router.post("/",
  authGuard,
  imageUpload.single("image"),
  postInsertValidation(),
  validate,
  insertPost);


router.delete("/:id", authGuard, deletePost);
router.get("/", authGuard, getAllPosts);
router.get("/user/:id", authGuard, getUserPosts);
router.get("/:id", authGuard, getPostById);
router.put("/:id", authGuard, postUpdateValidation(), validate, updatePost);

module.exports = router;