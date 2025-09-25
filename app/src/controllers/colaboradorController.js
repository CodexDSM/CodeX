const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class ColaboradorController {
  // Autentica um colaborador e gera um token JWT.
  async login(req, res, next) {
    console.log('DADOS RECEBIDOS:', req.body);
    try {
      let { cpf, senha, local_trabalho } = req.body;

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
        return res.status(401).json({ message: 'CPF ou senha inválidos.' });
      }

      const colaborador = rows[0];
      // Compara a senha informada com o hash no banco.
      const senhaValida = await bcrypt.compare(senha, colaborador.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Registra localização com limite de 30
      let localizacaoRegistrada = false;
      if (local_trabalho) {
        try {
          // 1. Insere a nova localização
          await pool.execute(
            'INSERT INTO localizacao_colaborador (colaborador_id, tipo_localizacao) VALUES (?, ?)',
            [colaborador.id, local_trabalho]
          );

          // Mantém apenas os últimos 30 registros
          // Conta quantos registros existem para este colaborador
          const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM localizacao_colaborador WHERE colaborador_id = ?',
            [colaborador.id]
          );

          const totalRegistros = countResult[0].total;

          // Se passou de 30, remove os mais antigos
          if (totalRegistros > 30) {
            const registrosParaRemover = totalRegistros - 30;
            
            await pool.execute(`
              DELETE FROM localizacao_colaborador 
              WHERE colaborador_id = ? 
              ORDER BY data_hora ASC 
              LIMIT ?
            `, [colaborador.id, registrosParaRemover]);

            console.log(`Limpeza automática: removidos ${registrosParaRemover} registros antigos para colaborador ${colaborador.id}`);
          }

          localizacaoRegistrada = true;
          console.log(`Localização registrada: ${local_trabalho} para colaborador ${colaborador.id}`);
          console.log(`Total de localizações mantidas: ${Math.min(totalRegistros, 30)}`);
          
        } catch (localizacaoError) {
          console.error('Erro ao registrar localização:', localizacaoError);
        }
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

  //  Limpar localizações antigas (opcional)
  async limparLocalizacoesAntigas(colaborador_id, limite = 30) {
    try {
      // Conta registros atuais
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM localizacao_colaborador WHERE colaborador_id = ?',
        [colaborador_id]
      );

      const totalRegistros = countResult[0].total;

      // Se passou do limite, remove os mais antigos
      if (totalRegistros > limite) {
        const registrosParaRemover = totalRegistros - limite;
        
        await pool.execute(`
          DELETE FROM localizacao_colaborador 
          WHERE colaborador_id = ? 
          ORDER BY data_hora ASC 
          LIMIT ?
        `, [colaborador_id, registrosParaRemover]);

        console.log(`Limpeza: removidos ${registrosParaRemover} registros antigos para colaborador ${colaborador_id}`);
        console.log(`Mantidos ${limite} registros mais recentes`);
      }
    } catch (error) {
      console.error('Erro na limpeza de localizações:', error);
    }
  }

  // Lista todos os colaboradores com filtros.
  async index(req, res, next) {
    try {
      const { ativo, perfil } = req.query;
      let query = `SELECT * FROM ( SELECT c.id, c.nome, c.cpf, c.email, c.telefone, c.perfil, c.ativo, c.logradouro, c.numero, c.complemento, c.bairro, c.cidade, c.uf, c.cep, c.criado_em, l.tipo_localizacao, l.data_hora, ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY l.data_hora DESC) as rn FROM colaborador c LEFT JOIN localizacao_colaborador l ON l.colaborador_id = c.id ) t WHERE rn = 1; `
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
        cep, logradouro, numero, bairro, cidade, uf 
      } = req.body;

      const complemento = req.body.complemento || null;
      const cpfNormalizado = cpf ? cpf.replace(/[^0-9]/g, '') : null;
      const hashedSenha = await bcrypt.hash(senha, 10);

      const [result] = await pool.execute(
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

  // Atualiza os dados de um colaborador.
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        nome, cpf, senha, telefone, perfil, ativo,
        logradouro, numero, bairro, cidade, uf, cep 
      } = req.body;

      const complemento = req.body.complemento || null;
      const [result] = await pool.execute(
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
