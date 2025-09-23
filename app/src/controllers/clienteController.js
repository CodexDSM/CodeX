const pool = require('../config/database');

class ClienteController {
  // Lista clientes, com filtros opcionais
  async index(req, res, next) {
    try {
      const { tipo_pessoa, ativo } = req.query;
      let query = 'SELECT * FROM cliente WHERE 1=1';
      const params = [];

      // Filtra por tipo de pessoa (Física ou Jurídica)
      if (tipo_pessoa) {
        query += ' AND tipo_pessoa = ?';
        params.push(tipo_pessoa);
      }

      // Filtra por status de 'ativo'
      if (ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(ativo === 'true');
      }

      query += ' ORDER BY nome';

      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  // Busca um cliente pelo ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM cliente WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // Cria um novo cliente
  async create(req, res, next) {
    try {
      const { 
        tipo_pessoa, nome, documento, email, telefone,
        logradouro, numero, bairro, cidade, uf, cep 
      } = req.body;

      const complemento = req.body.complemento || null;
      const [result] = await pool.execute(
        `INSERT INTO cliente 
        (tipo_pessoa, nome, documento, email, telefone, logradouro, numero, complemento, bairro, cidade, uf, cep) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tipo_pessoa, nome, documento, email, telefone, 
          logradouro, numero, complemento, bairro, cidade, uf, cep]
      );

      res.status(201).json({ 
        id: result.insertId, 
        message: 'Cliente criado com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualiza um cliente existente
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        nome, email, telefone, ativo,
        logradouro, numero, complemento, bairro, cidade, uf, cep 
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE cliente 
        SET nome = ?, email = ?, telefone = ?, ativo = ?,
            logradouro = ?, numero = ?, complemento = ?, 
            bairro = ?, cidade = ?, uf = ?, cep = ?
        WHERE id = ?`,
        [nome, email, telefone, ativo, logradouro, numero, 
          complemento, bairro, cidade, uf, cep, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Desativa um cliente (não o remove do banco)
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('UPDATE cliente SET ativo = false WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente desativado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Busca um cliente pelo número de documento (CPF/CNPJ)
  async findByDocumento(req, res, next) {
    try {
      const { documento } = req.params;
      const [rows] = await pool.execute('SELECT * FROM cliente WHERE documento = ?', [documento]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClienteController();