// Middleware para tratar erros e enviar respostas padronizadas.
const errorHandler = (err, req, res, next) => {
  // Loga o erro completo para debug no servidor, mas não expõe no front-end.
  console.error(err.stack);

  // Tratamento de erros específicos do MySQL.
  switch (err.code) {
    // ER_DUP_ENTRY: Ocorre quando se tenta inserir um registro duplicado em uma chave única.
    case 'ER_DUP_ENTRY':
      return res.status(400).json({ error: 'Registro duplicado. Verifique os dados e tente novamente.' });
      
    // ER_NO_REFERENCED_ROW_2: Ocorre quando se tenta inserir uma chave estrangeira que não existe.
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ error: 'Referência inválida. Um ID fornecido não existe (e.g., cliente_id, motorista_id).' });

    // TODO: Adicionar outros códigos de erro do MySQL conforme necessário.
  }

  // Resposta padrão para qualquer outro erro não tratado.
  res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = errorHandler;