const express = require("express")
const router = express.Router()
//
// CONTROLLER
const { insertPhoto, deletePhoto, getAllPhotos, getUserPhotos, getPhotoById, updatePhoto, SearchPhoto } = require("../controllers/PhotoController")

// MIDDLEWARES
const { photoInsertValidation, photoUpdateValidation } = require("../middlewares/photoValidation")
const authGuard = require("../middlewares/authGuard")
const roleGuard = require('../middlewares/roleGuard');

const validate = require("../middlewares/handleValidations")
const { imageUpload } = require("../middlewares/imageUpload")

// ROUTES
router.post("/",
  authGuard,
  roleGuard(['Empresa']), 
  imageUpload.single("image"),
  photoInsertValidation(),
  validate,
  insertPhoto);

  
router.delete("/:id", authGuard, roleGuard(['Empresa'], ['admin']), roleGuard(['admin']), deletePhoto)
router.get("/", authGuard, getAllPhotos)
router.get("/user/:id", authGuard, getUserPhotos)
router.get("/search", authGuard, SearchPhoto) 
router.get("/:id", authGuard, getPhotoById)
router.put("/:id", authGuard, roleGuard(['Empresa']), photoUpdateValidation(), validate, updatePhoto)

module.exports = router;