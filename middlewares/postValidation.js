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

const commentValidation = () => {
  return [
    body("comment")
      .not()
      .equals("undefined")
      .withMessage("O comentário é obrigatório") // Check for undefined
      .isString()
      .withMessage("O comentário deve ser uma string") // Ensure it is a string
      .isLength({ min: 1 }) // Ensure it is not empty
      .withMessage("O comentário não pode ser vazio.")
      .isLength({ max: 500 }) // Optional: Limit the maximum length of comments
      .withMessage("O comentário não pode ter mais de 500 caracteres."),
  ];
};


module.exports = {
  postInsertValidation,
  postUpdateValidation,
  commentValidation,
};
