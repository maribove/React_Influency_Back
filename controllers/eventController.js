const Event = require("../models/Event");

// Adicionar novo evento
const createEvent = async (req, res) => {
  const { title, desc, start, end } = req.body;
  const userId = req.user._id; // Assumindo que o usuário está autenticado

  try {
    const newEvent = new Event({ title, desc, start, end, userId });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Erro ao adicionar evento:", error);
    res.status(500).json({ message: "Erro ao adicionar evento.", error: error.message });
  }
};

// Buscar todos os eventos
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }); // Buscar eventos do influenciador
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar eventos." });
  }
};

// Buscar evento por ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar evento." });
  }
};

// Atualizar evento
const updateEvent = async (req, res) => {
  const { title, desc, start, end } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    event.title = title || event.title;
    event.desc = desc || event.desc;
    event.start = start || event.start;
    event.end = end || event.end;

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar evento." });
  }
};

// Deletar evento
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ errors: ["Evento não encontrado!"] });
    }

    if (event.userId.toString() !== reqUser._id.toString() && reqUser.role !== "admin") {
      return res.status(403).json({ errors: ["Ação não permitida!"] });
    }

    await Event.findByIdAndDelete(event._id);

    res.status(200).json({ id: event._id, message: "Evento excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    res.status(500).json({ errors: ["Erro ao deletar evento."] });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
