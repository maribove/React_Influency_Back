const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwtSecret = process.env.JWT_SECRET;

// Middleware para verificar se o usuário é Admin
const adminGuard = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ errors: ["Acesso negado! Token não fornecido."] });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);
    req.user = await User.findById(verified.id).select("-password");

    if (req.user.role !== "admin") {
      return res.status(403).json({ errors: ["Acesso negado! Você não tem permissão para acessar esta rota."] });
    }

    next();
  } catch (error) {
    return res.status(401).json({ errors: ["Token inválido ou expirado."] });
  }
};

module.exports = adminGuard;