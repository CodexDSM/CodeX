const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Falha na validação da requisição',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

module.exports = validateRequest;