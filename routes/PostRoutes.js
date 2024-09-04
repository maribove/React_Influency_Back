const express = require("express");
const router = express.Router();

// CONTROLLER
const { insertPost, deletePost, getAllPosts, getPostsByInterests, getUserPosts, getPostById, updatePost, LikePost, commentPost } = require("../controllers/PostController");

// MIDDLEWARES
const { postInsertValidation, postUpdateValidation, commentValidation } = require("../middlewares/postValidation")
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
router.get("/", authGuard, getPostsByInterests, postUpdateValidation(), validate, updatePost);
//router.get("/", adminGuard, getAllPosts);
router.get("/user/:id", authGuard, getUserPosts);
router.get("/:id", authGuard, getPostById);
router.put("/:id", authGuard, postUpdateValidation(), validate, updatePost);
router.put("/like/:id", authGuard, LikePost);
router.put("/comment/:id", authGuard, commentValidation(), validate, commentPost)

module.exports = router;


