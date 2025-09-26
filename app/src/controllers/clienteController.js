const pool = require('../config/database');

class ClienteController {
  async index(req, res, next) {
    try {
      console.log('Recebendo requisição:', req.query); // Debug
      
      const { 
        tipo_pessoa, 
        ativo, 
        search, 
        page = 1, 
        limit = 10 
      } = req.query;

      // Query básica primeiro - SEM PAGINAÇÃO PARA TESTAR
      let query = 'SELECT * FROM cliente WHERE 1=1';
      const params = [];

      // Filtro simples
      if (tipo_pessoa) {
        query += ' AND tipo_pessoa = ?';
        params.push(tipo_pessoa);
      }

      if (ativo !== undefined && ativo !== '') {
        query += ' AND ativo = ?';
        params.push(ativo === 'true');
      }

      query += ' ORDER BY nome LIMIT 10'; // Limite fixo para teste

      console.log('Query SQL:', query); // Debug
      console.log('Params:', params); // Debug

      const [rows] = await pool.execute(query, params);
      
      console.log('Resultados encontrados:', rows.length); // Debug

      // Resposta simples para teste
      res.json({
        data: rows,
        pagination: {
          current_page: 1,
          per_page: 10,
          total_records: rows.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      });
    } catch (error) {
      console.error('ERRO NO CONTROLLER:', error); // Debug
      next(error);
    }
  }

  // ... resto dos métodos permanecem iguais
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
