const multer = require("multer");
const path = require("path");

// Destino para armazenar a imagem e o portfólio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (file.fieldname === "profileImage") {
      folder = "users";
    } else if (file.fieldname === "portfolio") {
      folder = "portfolios";
    }
    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profileImage") {
    // Apenas permitir formatos PNG, JPG e JPEG para a imagem de perfil
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Por favor, envie apenas imagens no formato PNG, JPG ou JPEG!"));
    }
  } else if (file.fieldname === "portfolio") {
    // Apenas permitir formato PDF para o portfólio
    if (!file.originalname.match(/\.pdf$/)) {
      return cb(new Error("Por favor, envie apenas arquivos em formato PDF!"));
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = { upload };
