const express = require("express");
const router = express.Router(); 

// Importa as rotas dos outros módulos
router.use("/api/users", require("./UserRoutes"));
router.use("/api/photos", require("./PhotoRoutes"));
router.use("/api/posts", require("./PostRoutes"));
router.use("/api/suporte", require("./SuporteRoutes")); 
router.use("/api/events", require("./eventRoutes")); 
router.use("/api/dashboard", require("./dashboardRoutes")); 

// Rota de teste
router.get("/", (req, res) => {
    res.send("API Working!");
});

module.exports = router;
