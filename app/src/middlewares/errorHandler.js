const errorHandler = (err, req, res, next) => {
const statusCode = err.statusCode | 500;
const message = err.message | 'Erro Interno do Servidor';

console.error(err);

res.status(statusCode).json({
status: 'error',
statusCode: statusCode,
message: message,
});
};

module.exports = errorHandler;