const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { createInteraction, getClientInteractions } = require('../controllers/interactionController');

const router = express.Router();

//Endpoint POST para criar uma nova interação
//Proteção dos endpoints com JWT e perfil
router.post(
    '/clients/:clientId/interactions',
    authenticateToken,
    authorizeRoles('Comercial', 'Administrador'), // Permite apenas Comercial ou Admin
    [
        // Validação do corpo da requisição
        body('tipo_interacao')
            .isIn(['Ligação', 'E-mail', 'Reunião Presencial', 'Mensagem', 'Outro'])
            .withMessage('Tipo de interação inválido.'),
        body('data_interacao')
            .isISO8601()
            .withMessage('Formato de data inválido (ISO8601).'),
        body('assunto')
            .notEmpty()
            .withMessage('O assunto da interação é obrigatório.'),
        body('detalhes')
            .optional()
            .isString()
            .withMessage('Detalhes da interação deve ser um texto.')
    ],
    createInteraction
);

//Endpoint GET para listar interações de um cliente
//Proteção dos endpoints com JWT e perfil
router.get(
    '/clients/:clientId/interactions',
    authenticateToken,
    authorizeRoles('Comercial', 'Administrador'), // Permite apenas Comercial ou Admin
    getClientInteractions
);

module.exports = router;