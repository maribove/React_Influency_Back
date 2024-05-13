const { body } = require("express-validator");

const postInsertValidation = () => {
  return [
    body("publicacao")
      .not()
      .equals("undefined")
      .withMessage("A publicação é obrigatória")
      .isString()
      .withMessage("A publicação é obrigatória")
      .isLength({ min: 3 })
      .withMessage("A publicação precisa ter no mínimo 3 caracteres."),


    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("A imagem é obrigatória");
      }



      return true;
    }),
  ];
};

const postUpdateValidation = () => {
  return [
    body("publicacao")
      .optional()
      .isString()
      .withMessage("A publicação é obrigatória!")
      .isLength({ min: 3 })
      .withMessage("A publicação precisa ter no mínimo 3 caracteres."),
  ];
};

module.exports = {
  postInsertValidation,
  postUpdateValidation,
};
