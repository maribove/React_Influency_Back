const multer = require("multer");
const path = require("path");

// Destino para armazenar a imagem
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (req.baseUrl.includes("users")) {
      folder = "users";
    } else if (req.baseUrl.includes("photos")) {
      folder = "photos";
    } else if (req.baseUrl.includes("posts")) {
      folder = "posts";
    }
    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // Apenas permitir formatos PNG e JPG
      return cb(new Error("Por favor, envie apenas imagens no formato PNG, JPG ou JPEG!"));
    }
    cb(null, true);
  },
});

module.exports = { imageUpload };
