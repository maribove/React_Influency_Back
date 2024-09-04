const multer = require("multer");
const path = require("path");

// Destino para armazenar a imagem, portfólio e contrato
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (file.fieldname === "profileImage") {
      folder = "users";
    } else if (file.fieldname === "portfolio") {
      folder = "portfolios";
    } else if (file.fieldname === "contrato") {
      folder = "contratos";
    }else if (req.baseUrl.includes("photos")) {
      folder = "photos";
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
  } else if (file.fieldname === "portfolio" || file.fieldname === "contrato") {
    // Apenas permitir formato PDF para o portfólio e contrato
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
