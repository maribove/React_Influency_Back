const express = require('express');
const router = express.Router();
const {Suporte } = require('../controllers/SuporteController');

// Rota para enviar formulário de suporte
router.post('/', Suporte); 

module.exports = router;