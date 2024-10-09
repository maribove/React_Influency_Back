const express = require("express");
const router = express.Router(); 

// Importa as rotas dos outros módulos
router.use("/api/users", require("./UserRoutes"));
router.use("/api/photos", require("./PhotoRoutes"));
router.use("/api/posts", require("./PostRoutes"));
router.use("/api/suporte", require("./SuporteRoutes")); // A linha está correta

// Rota de teste
router.get("/", (req, res) => {
    res.send("API Working!");
});

module.exports = router;
