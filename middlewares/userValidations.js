const { body, validationResult } = require("express-validator");

const userCreateValidation = () => {
  return [
    body("name")
      .isString()
      .withMessage("O nome é obrigatório")
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 3 caracteres"),

    body("email")
      .isString()
      .withMessage("O email é obrigatório")
      .isEmail()
      .withMessage("Insira um email válido"),

    body("password")
      .isString()
      .withMessage("A senha é obrigatória")
      .isLength({ min: 6 })
      .withMessage("A senha precisa ter no mínimo 6 caracteres")
      .matches(/[A-Z]/)
      .withMessage("A senha deve conter pelo menos um caractere maiúsculo")
      .matches(/\d/)
      .withMessage("A senha deve conter pelo menos um número")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("A senha deve conter pelo menos um símbolo"),

    body("confirmPassword")
      .isString()
      .withMessage("A confirmação de senha é obrigatória.")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("As senhas não são iguais. Verifique os campos");
        }
        return true;
      }),

    body("interests")
      .isArray({ min: 1 })
      .withMessage("Selecione pelo menos um interesse!")
      .bail()
      .custom((interests) => {
        if (interests.length === 0) {
          throw new Error("Selecione pelo menos um interesse!");
        }
        return true;
      }),

  ];
};

const loginValidation = () => {
  return [
    body("email")
      .isString()
      .withMessage("O email é obrigatório")
      .isEmail()
      .withMessage("Insira um email válido"),

    body("password")
      .isString()
      .withMessage("A senha é obrigatória"),
  ];
};

const userUpdateValidation = () => {
  return [
    body("name")
      .optional()
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 3 caracteres."),

    body("password")
      .optional()
      .isString()
      .isLength({ min: 6 })
      .withMessage("A senha precisa ter no mínimo 6 caracteres")
      .matches(/[A-Z]/)
      .withMessage("A senha deve conter pelo menos um caractere maiúsculo")
      .matches(/\d/)
      .withMessage("A senha deve conter pelo menos um número")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("A senha deve conter pelo menos um símbolo"),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
  validate,
};
