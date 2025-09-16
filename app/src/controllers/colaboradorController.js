const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class ColaboradorController {
  // Autentica um colaborador e gera um token JWT.
  async login(req, res, next) {
    //DEBBUG TEMPORÁRIO!
    //console.log('HEADERS RECEBIDOS:', req.headers);
    console.log('DADOS RECEBIDOS:', req.body);
    try {
      let { cpf, senha } = req.body;

      if (cpf) {
        // Normaliza o CPF, removendo caracteres não numéricos
        cpf = cpf.replace(/[^0-9]/g, '');
      }
      
      const [rows] = await pool.execute(
        'SELECT * FROM colaborador WHERE REPLACE(REPLACE(cpf, ".", ""), "-", "") = ? AND ativo = true',
        [cpf]
      );

      // Checa se o colaborador existe.
      if (rows.length === 0) {
        // TODO: Unificar as mensagens de erro de login para evitar dicas a invasores.
        return res.status(401).json({ message: 'CPF ou senha inválidos.' });
      }

      const colaborador = rows[0];
      // Compara a senha informada com o hash no banco.
      const senhaValida = await bcrypt.compare(senha, colaborador.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Cria um token JWT com informações do usuário (payload).
      const token = jwt.sign(
        { 
          id: colaborador.id, 
          cpf: colaborador.cpf, 
          perfil: colaborador.perfil 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remove a senha do objeto para não expor no JSON de resposta.
      delete colaborador.senha;
      res.json({ message: 'Login bem-sucedido', token, colaborador });

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  // Lista todos os colaboradores com filtros.
  async index(req, res, next) {
    try {
      const { ativo, perfil } = req.query;
      let query = 'SELECT id, nome, cpf, email, telefone, perfil, ativo, logradouro, numero, complemento, bairro, cidade, uf, cep, criado_em FROM colaborador WHERE 1=1';
      const params = [];

      // Adiciona filtro por status 'ativo'.
      if (ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(ativo === 'true');
      }

      // Adiciona filtro por perfil.
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

  // Busca um colaborador pelo ID.
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.user;

      // Restringe o acesso: apenas admins/gerentes ou o próprio usuário podem ver os dados.
      if (usuarioLogado.perfil !== 'Administrador' && usuarioLogado.perfil !== 'Gerente' && usuarioLogado.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode ver seus próprios dados.' });
      }

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

  // Cria um novo colaborador.
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

  // Atualiza os dados de um colaborador.
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

  // Desativa (soft delete) um colaborador.
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

  // Permite que um usuário altere sua própria senha. Admins e Gerentes podem alterar a senha de outros.
  async changePassword(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.user;

      if (usuarioLogado.perfil !== 'Administrador' && usuarioLogado.perfil !== 'Gerente' && usuarioLogado.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode alterar sua própria senha.' });
      }
      
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