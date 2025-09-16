const jwt = require('jsonwebtoken');

// Middleware para autenticar um token JWT em cada requisição.
const authenticateToken = (req, res, next) => {
    // Pega o token do cabeçalho de autorização.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    // Verifica se o token é válido.
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        
        // Armazena os dados do usuário no objeto da requisição.
        req.user = user;
        
        next();
    });
};

// Middleware para autorizar acesso baseado em perfis (roles).
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Checa se o usuário tem um dos perfis permitidos.
        if (!req.user || !roles.includes(req.user.perfil)) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem a permissão necessária.' });
        }

        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };