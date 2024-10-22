const { body } = require('express-validator');

const eventInsertValidation = () => {
  return [
    body('title')
      .notEmpty()
      .withMessage('O título é obrigatório.')
      .isLength({ min: 3 })
      .withMessage('O título deve ter no mínimo 3 caracteres.'),
    
    body('description')
      .notEmpty()
      .withMessage('A descrição é obrigatória.')
      .isLength({ min: 10 })
      .withMessage('A descrição deve ter no mínimo 10 caracteres.'),

    body('date')
      .notEmpty()
      .withMessage('A data do evento é obrigatória.')
      .isISO8601()
      .withMessage('A data deve estar no formato ISO 8601 (YYYY-MM-DD).'),

    body('time')
      .notEmpty()
      .withMessage('O horário do evento é obrigatório.')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('O horário deve estar no formato HH:mm (ex: 14:30).')
  ];
};

const eventUpdateValidation = () => {
  return [
    body('title')
      .optional()
      .isLength({ min: 3 })
      .withMessage('O título deve ter no mínimo 3 caracteres.'),

    body('description')
      .optional()
      .isLength({ min: 10 })
      .withMessage('A descrição deve ter no mínimo 10 caracteres.'),

    body('date')
      .optional()
      .isISO8601()
      .withMessage('A data deve estar no formato ISO 8601 (YYYY-MM-DD).'),

    body('time')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('O horário deve estar no formato HH:mm (ex: 14:30).')
  ];
};

module.exports = { eventInsertValidation, eventUpdateValidation };
