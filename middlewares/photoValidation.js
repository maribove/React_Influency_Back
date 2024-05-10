const { body } = require("express-validator");

const photoInsertValidation = () => {
  return [
    body("title")
      .not()
      .equals("undefined")
      .withMessage("O título é obrigatório")
      .isString()
      .withMessage("O título é obrigatório")
      .isLength({ min: 3 })
      .withMessage("O título precisa ter no mínimo 3 caracteres."),

    body("desc")
      .not()
      .equals("undefined")
      .withMessage("A descrição é obrigatória!")
      .isString()
      .withMessage("A descrição é obrigatória")
      .isLength({ min: 10 })
      .withMessage("A descrição precisa ter no mínimo 10 caracteres."),

      body("local")
      .not()
      .equals("undefined")
      .withMessage("O campo local é obrigatório")
      .isString()
      .withMessage("O campo local é obrigatório")
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
      if (!req.file) {
        throw new Error("A imagem é obrigatória");
      }

     
      
      return true;
    }),
  ];
};

const photoUpdateValidation = () => {
  return [
    body("title")
      .optional()
      .isString()
      .withMessage("O título é obrigatório!")
      .isLength({ min: 3 })
      .withMessage("O título precisa ter no mínimo 3 caracteres."),

      body("desc")
      .optional()
      .isString()
      .withMessage("A descrição é obrigatória!")
      .isLength({ min: 10 })
      .withMessage("A descrição precisa ter no mínimo 10 caracteres."),
      
      body("local")
      .optional()
      .isString()
      .withMessage("O local é obrigatório!")
      .isLength({ min: 3 })
      .withMessage("O local precisa ter no mínimo 3 caracteres."),

      body("situacao")
      .optional()
      .isString()
      .withMessage("O status é obrigatório!"),

      body("date")
      .optional()
      .isString()
      .withMessage("A data é obrigatória!"),

      
  ]
}


module.exports = {
  photoInsertValidation,
  photoUpdateValidation,

};