const authGuard = require('./authGuard'); // Importa o authGuard já existente

const roleGuard = (allowedRoles) => {
    return (req, res, next) => {
        const { user } = req;

        if (!user) {
            return res.status(401).json({ errors: ["Acesso negado!"] });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ errors: ["Acesso proibido para este papel!"] });
        }

        next(); // Se o usuário tiver um dos papéis permitidos, prossegue
    };
};

module.exports = roleGuard;
