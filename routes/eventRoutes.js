const express = require("express");
const router = express.Router();
const { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } = require("../controllers/eventController");
const authGuard = require("../middlewares/authGuard");
const roleGuard = require('../middlewares/roleGuard');

// Rota para criar evento
router.post("/", authGuard, roleGuard(['Influenciador']), createEvent);

// Rota para buscar todos os eventos do influenciador
router.get("/", authGuard, getAllEvents);

// Rota para buscar um evento por ID
router.get("/:id", authGuard, getEventById);

// Rota para atualizar um evento
router.put("/:id", authGuard, roleGuard(['Influenciador']), updateEvent);

// Rota para excluir um evento
router.delete("/:id", authGuard, roleGuard(['Influenciador']), deleteEvent);

module.exports = router;
