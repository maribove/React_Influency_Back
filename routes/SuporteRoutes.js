const express = require('express');
const router = express.Router();
const {Suporte } = require('../controllers/SuporteController');

// Rota para enviar formulário de suporte
router.post('/', Suporte); // Alterado para usar '/' em vez de '/suporte'

module.exports = router;