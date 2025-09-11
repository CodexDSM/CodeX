// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Registro duplicado' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referência inválida' });
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = errorHandler;