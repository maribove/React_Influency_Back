const express = require("express");
const router = express.Router();

// Controladores para o Dashboard
const {
    getPostsData,
    getApplicationsData,
    getEventsData,
    getSupportData, 
    getEarningsProjectionData
} = require("../controllers/dashboardController");

// Middleware de autenticação e verificação de tipo de usuário
const authGuard = require("../middlewares/authGuard");
const roleGuard = require("../middlewares/roleGuard");

// Rotas do Dashboard
router.get("/posts", authGuard, roleGuard(["Influenciador"]), getPostsData);
router.get("/applications", authGuard, roleGuard(["Influenciador"]), getApplicationsData);
router.get("/events", authGuard, roleGuard(["Influenciador"]), getEventsData);
router.get("/support", authGuard, roleGuard(["Influenciador"]), getSupportData);
router.get("/earningsProjection", authGuard, roleGuard(["Influenciador"]), getEarningsProjectionData);

module.exports = router;
