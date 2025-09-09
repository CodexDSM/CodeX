const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createCustomerSchema } = require('../validators/customer.validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: O ID gerado automaticamente do cliente
 *         firstName:
 *           type: string
 *           description: O primeiro nome do cliente
 *         lastName:
 *           type: string
 *           description: O sobrenome do cliente
 *         email:
 *           type: string
 *           description: O e-mail do cliente
 *         phone:
 *           type: string
 *           description: O telefone do cliente
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *         isActive:
 *           type: boolean
 *           description: Indica se o cliente está ativo
 *       example:
 *         firstName: Jane
 *         lastName: Doe
 *         email: jane.doe@example.com
 *         phone: "123-456-7890"
 *         address:
 *           street: "123 Main St"
 *           city: "Anytown"
 *           state: "CA"
 *           postalCode: "12345"
 *           country: "USA"
 */

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: API de gerenciamento de clientes
 */

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: O cliente foi criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Requisição inválida
 *       409:
 *         description: Conflito, e-mail já existe
 *       500:
 *         description: Erro no servidor
 */

router.post('/', validateRequest(createCustomerSchema), customerController.createCustomer);

module.exports = router;