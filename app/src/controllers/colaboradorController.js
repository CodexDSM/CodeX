const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função helper externa para retry (fora da classe)
async function executeWithRetry(query, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.log(`Tentativa ${attempt} falhou:`, error.code);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log(`Aguardando ${1000 * attempt}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw error;
      }
    }
  }
}

class ColaboradorController {
  async login(req, res, next) {
    console.log('DADOS RECEBIDOS:', req.body);
    try {
      let { cpf, senha, local_trabalho } = req.body;

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

      let localizacaoRegistrada = false;
      if (local_trabalho) {
        try {
          await pool.execute(
            'INSERT INTO localizacao_colaborador (colaborador_id, tipo_localizacao) VALUES (?, ?)',
            [colaborador.id, local_trabalho]
          );

          const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM localizacao_colaborador WHERE colaborador_id = ?',
            [colaborador.id]
          );

          const totalRegistros = countResult[0].total;

          if (totalRegistros > 30) {
            const registrosParaRemover = totalRegistros - 30;
            
            await pool.query(`
              DELETE FROM localizacao_colaborador 
              WHERE colaborador_id = ? 
              ORDER BY data_hora ASC 
              LIMIT ?
            `, [colaborador.id, registrosParaRemover]);

            console.log(`Limpeza automática: removidos ${registrosParaRemover} registros antigos para colaborador ${colaborador.id}`);
          }

          localizacaoRegistrada = true;
          console.log(`Localização registrada: ${local_trabalho} para colaborador ${colaborador.id}`);
          
        } catch (localizacaoError) {
          console.error('Erro ao registrar localização:', localizacaoError);
        }
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
      res.json({ 
        message: 'Login bem-sucedido', 
        token, 
        colaborador,
        localizacao_registrada: localizacaoRegistrada,
        local_trabalho: local_trabalho || null
      });

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  async limparLocalizacoesAntigas(colaborador_id, limite = 30) {
    try {
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM localizacao_colaborador WHERE colaborador_id = ?',
        [colaborador_id]
      );

      const totalRegistros = countResult[0].total;

      if (totalRegistros > limite) {
        const registrosParaRemover = totalRegistros - limite;
        
        await pool.query(`
          DELETE FROM localizacao_colaborador 
          WHERE colaborador_id = ? 
          ORDER BY data_hora ASC 
          LIMIT ?
        `, [colaborador_id, registrosParaRemover]);

        console.log(`Limpeza: removidos ${registrosParaRemover} registros antigos para colaborador ${colaborador_id}`);
      }
    } catch (error) {
      console.error('Erro na limpeza de localizações:', error);
    }
  }

  async index(req, res, next) {
    try {
      console.log('Recebendo requisição colaboradores:', req.query);
      
      const { 
        ativo, 
        perfil, 
        tipo_localizacao,
        search, 
        page = 1, 
        limit = 10 
      } = req.query;

      let query = `
        SELECT c.id, c.nome, c.cpf, c.email, c.telefone, c.perfil, c.ativo, 
               c.logradouro, c.numero, c.complemento, c.bairro, c.cidade, c.uf, c.cep, 
               c.criado_em, l.tipo_localizacao, l.data_hora
        FROM colaborador c 
        LEFT JOIN (
          SELECT colaborador_id, tipo_localizacao, data_hora,
                 ROW_NUMBER() OVER (PARTITION BY colaborador_id ORDER BY data_hora DESC) as rn
          FROM localizacao_colaborador
        ) l ON c.id = l.colaborador_id AND l.rn = 1
        WHERE 1=1
      `;
      
      const params = [];

      if (search) {
        query += ' AND (c.nome LIKE ? OR c.cpf LIKE ? OR c.email LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      if (ativo !== undefined && ativo !== '') {
        query += ' AND c.ativo = ?';
        params.push(ativo === 'true');
      }

      if (perfil && perfil !== '') {
        query += ' AND c.perfil = ?';
        params.push(perfil);
      }

      if (tipo_localizacao && tipo_localizacao !== '') {
        query += ' AND l.tipo_localizacao = ?';
        params.push(tipo_localizacao);
      }

      query += ' ORDER BY c.nome LIMIT 100';

      console.log('Query SQL:', query);
      console.log('Params:', params);

      const rows = await executeWithRetry(query, params);
      
      console.log('Resultados encontrados:', rows.length);

      res.json(rows);
    } catch (error) {
      console.error('ERRO NO CONTROLLER:', error);
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.user;

      if (usuarioLogado.perfil !== 'Administrador' && usuarioLogado.perfil !== 'Gerente' && usuarioLogado.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode ver seus próprios dados.' });
      }

      const rows = await executeWithRetry(
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
        cep, logradouro, numero, bairro, cidade, uf 
      } = req.body;

      const complemento = req.body.complemento || null;
      const cpfNormalizado = cpf ? cpf.replace(/[^0-9]/g, '') : null;
      const hashedSenha = await bcrypt.hash(senha, 10);

      const result = await executeWithRetry(
        `INSERT INTO colaborador 
        (nome, cpf, email, senha, telefone, perfil, cep, logradouro, numero, complemento, bairro, cidade, uf) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, cpfNormalizado, email, hashedSenha, telefone, perfil || 'Operador', 
          cep, logradouro, numero, complemento, bairro, cidade, uf]
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
        nome, cpf, senha, telefone, perfil, ativo,
        logradouro, numero, bairro, cidade, uf, cep 
      } = req.body;

      const complemento = req.body.complemento || null;
      const result = await executeWithRetry(
        `UPDATE colaborador 
          SET nome = ?, cpf = ?, telefone = ?, perfil = ?, ativo = ?,
              logradouro = ?, numero = ?, complemento = ?,
              bairro = ?, cidade = ?, uf = ?, cep = ?
          WHERE id = ?`,
        [nome, cpf, telefone, perfil, ativo, logradouro, numero, complemento, bairro, cidade, uf, cep, id]
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
      
      const result = await executeWithRetry(
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
      const usuarioLogado = req.user;

      if (usuarioLogado.perfil !== 'Administrador' && usuarioLogado.perfil !== 'Gerente' && usuarioLogado.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode alterar sua própria senha.' });
      }
      
      const { senhaAtual, novaSenha } = req.body;

      const rows = await executeWithRetry(
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
      await executeWithRetry(
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
