const { body } = require("express-validator");

// Validação para inserção de fotos
const photoInsertValidation = () => {
  return [
    body("title")
      .not()
      .isEmpty()
      .withMessage("O título é obrigatório")
      .isString()
      .withMessage("O título deve ser uma string")
      .isLength({ min: 3 })
      .withMessage("O título precisa ter no mínimo 3 caracteres."),

    body("desc")
      .not()
      .isEmpty()
      .withMessage("A descrição é obrigatória!")
      .isString()
      .withMessage("A descrição deve ser uma string")
      .isLength({ min: 10 })
      .withMessage("A descrição precisa ter no mínimo 10 caracteres."),

    body("local")
      .not()
      .isEmpty()
      .withMessage("O campo local é obrigatório")
      .isString()
      .withMessage("O local deve ser uma string")
      .isLength({ min: 3 })
      .withMessage("O local precisa ter no mínimo 3 caracteres."),

    body("situacao")
      .not()
      .isEmpty()
      .withMessage("O campo status é obrigatório!"),

    body("date")
      .not()
      .isEmpty()
      .withMessage("A data é obrigatória!"),

    body("image").custom((value, { req }) => {
      if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
        throw new Error("A imagem é obrigatória");
      }
      return true;
    }),
  ];
};

// Validação para atualização de fotos
const photoUpdateValidation = () => {
  return [
    body("title")
      .optional()
      .isString()
      .withMessage("O título deve ser uma string")
      .isLength({ min: 3 })
      .withMessage("O título precisa ter no mínimo 3 caracteres."),

    body("desc")
      .optional()
      .isString()
      .withMessage("A descrição deve ser uma string")
      .isLength({ min: 10 })
      .withMessage("A descrição precisa ter no mínimo 10 caracteres."),

    body("local")
      .optional()
      .isString()
      .withMessage("O local deve ser uma string")
      .isLength({ min: 3 })
      .withMessage("O local precisa ter no mínimo 3 caracteres."),

    body("situacao")
      .optional()
      .isString()
      .withMessage("O status deve ser uma string"),

    body("date")
      .optional()
      .isString()
      .withMessage("A data deve ser uma string"),
  ];
};

module.exports = {
  photoInsertValidation,
  photoUpdateValidation,
};
