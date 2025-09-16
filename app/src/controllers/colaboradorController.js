const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class ColaboradorController {
  
  async login(req, res, next) {

    console.log('DADOS RECEBIDOS PELO BACK-END:', req.body);
    
    try {
      let { cpf, senha } = req.body;

      if (cpf) {
        cpf = cpf.replace(/[^0-9]/g, '');
      }
      
      const [rows] = await pool.execute(
        'SELECT * FROM colaborador WHERE REPLACE(REPLACE(cpf, ".", ""), "-", "") = ? AND ativo = true',
        [cpf]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'CPF ou senha inválidos.' });
      }

      const colaborador = rows[0];
      const senhaValida = await bcrypt.compare(senha, colaborador.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { 
          id: colaborador.id, 
          cpf: colaborador.cpf, 
          perfil: colaborador.perfil 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      delete colaborador.senha;
      res.json({ message: 'Login bem-sucedido', token, colaborador });

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  async index(req, res, next) {
    try {
      const { ativo, perfil } = req.query;
      let query = 'SELECT id, nome, cpf, email, telefone, perfil, ativo, logradouro, numero, complemento, bairro, cidade, uf, cep, criado_em FROM colaborador WHERE 1=1';
      const params = [];

      if (ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(ativo === 'true');
      }

      if (perfil) {
        query += ' AND perfil = ?';
        params.push(perfil);
      }

      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT id, nome, cpf, email, telefone, perfil, ativo, logradouro, numero, complemento, bairro, cidade, uf, cep, criado_em FROM colaborador WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { 
        nome, cpf, email, senha, telefone, perfil, 
        logradouro, numero, complemento, bairro, cidade, uf, cep 
      } = req.body;

      const cpfNormalizado = cpf ? cpf.replace(/[^0-9]/g, '') : null;
      const hashedSenha = await bcrypt.hash(senha, 10);

      const [result] = await pool.execute(
        `INSERT INTO colaborador 
        (nome, cpf, email, senha, telefone, perfil, logradouro, numero, complemento, bairro, cidade, uf, cep) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, cpfNormalizado, email, hashedSenha, telefone, perfil || 'Operador', 
         logradouro, numero, complemento, bairro, cidade, uf, cep]
      );

      res.status(201).json({ 
        id: result.insertId, 
        message: 'Colaborador criado com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        nome, telefone, perfil, ativo,
        logradouro, numero, complemento, bairro, cidade, uf, cep 
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE colaborador 
         SET nome = ?, telefone = ?, perfil = ?, ativo = ?,
             logradouro = ?, numero = ?, complemento = ?, 
             bairro = ?, cidade = ?, uf = ?, cep = ?
         WHERE id = ?`,
        [nome, telefone, perfil, ativo, logradouro, numero, 
         complemento, bairro, cidade, uf, cep, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      res.json({ message: 'Colaborador atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute(
        'UPDATE colaborador SET ativo = false WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      res.json({ message: 'Colaborador desativado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { senhaAtual, novaSenha } = req.body;

      const [rows] = await pool.execute(
        'SELECT senha FROM colaborador WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      const senhaValida = await bcrypt.compare(senhaAtual, rows[0].senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const hashedSenha = await bcrypt.hash(novaSenha, 10);
      await pool.execute(
        'UPDATE colaborador SET senha = ? WHERE id = ?',
        [hashedSenha, id]
      );

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ColaboradorController();