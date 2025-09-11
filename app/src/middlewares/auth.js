// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

// "Bypass" total de token - só pra DEV
const authenticateToken = (req, res, next) => {
  // deixa entrar sempre (ignora cabeçalho Authorization)
  req.user = { id: 1, email: "admin@sistema.com", perfil: "Administrador" };
  next();
};

const authorizeRoles = (...roles) => {
  // sempre autoriza
  return (req, res, next) => {
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };