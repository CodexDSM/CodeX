const pool = require('../config/database');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');

// Função helper para gerar código de cotação
async function gerarCodigoCotacao() {
  const ano = new Date().getFullYear();
  const [result] = await pool.execute(
    'SELECT COUNT(*) as total FROM cotacao WHERE YEAR(criado_em) = ?',
    [ano]
  );
  const numero = (result[0].total + 1).toString().padStart(4, '0');
  return `COT-${ano}-${numero}`;
}

class CotacoesController {
  // Criar cotação
  async create(req, res, next) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { cliente_id, itens, desconto, observacoes, enviar_email } = req.body;
      const colaborador_id = req.user.id;

      // Validações
      if (!cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cliente e itens são obrigatórios'
        });
      }

      // Verificar se cliente existe
      const [clientes] = await connection.execute(
        'SELECT * FROM cliente WHERE id = ? AND ativo = 1',
        [cliente_id]
      );

      if (clientes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      const cliente = clientes[0];

      // Buscar dados do colaborador
      const [colaboradores] = await connection.execute(
        'SELECT id, nome, email, telefone FROM colaborador WHERE id = ?',
        [colaborador_id]
      );

      const colaborador = colaboradores[0];

      // Calcular total
      let valorTotal = 0;
      itens.forEach(item => {
        item.valor_total = parseFloat(item.quantidade) * parseFloat(item.valor_unitario);
        valorTotal += item.valor_total;
      });

      // Aplicar desconto
      const descontoValor = desconto ? parseFloat(desconto) : 0;
      valorTotal -= descontoValor;

      // Gerar código único
      const codigo = await gerarCodigoCotacao();

      // Data de validade (7 dias)
      const validadeAte = new Date();
      validadeAte.setDate(validadeAte.getDate() + 7);

      // Inserir cotação
      const [resultCotacao] = await connection.execute(
        'INSERT INTO cotacao (codigo, cliente_id, colaborador_id, valor_total, desconto, observacoes, validade_ate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [codigo, cliente_id, colaborador_id, valorTotal, descontoValor, observacoes || null, validadeAte, enviar_email ? 'Enviada' : 'Rascunho']
      );

      const cotacao_id = resultCotacao.insertId;

      // Inserir itens
      for (const item of itens) {
        await connection.execute(
          'INSERT INTO cotacao_item (cotacao_id, descricao, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?)',
          [cotacao_id, item.descricao, item.quantidade, item.valor_unitario, item.valor_total]
        );
      }

      // Buscar cotação completa
      const [cotacaoCompleta] = await connection.execute(
        'SELECT * FROM cotacao WHERE id = ?',
        [cotacao_id]
      );

      const cotacao = cotacaoCompleta[0];

      // Gerar PDF
      const { filepath, filename } = await pdfService.gerarCotacaoPDF(cotacao, itens, cliente);

      // Atualizar caminho do PDF
      await connection.execute(
        'UPDATE cotacao SET pdf_path = ? WHERE id = ?',
        [filepath, cotacao_id]
      );

      // Enviar email se solicitado
      if (enviar_email) {
        await emailService.enviarCotacao(cliente, cotacao, itens, filepath, colaborador);
        
        await connection.execute(
          'UPDATE cotacao SET enviada_em = NOW() WHERE id = ?',
          [cotacao_id]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: enviar_email ? 'Cotação criada e enviada com sucesso!' : 'Cotação criada como rascunho',
        data: {
          id: cotacao_id,
          codigo,
          pdf_filename: filename
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar cotação:', error);
      return next(error);
    } finally {
      connection.release();
    }
  }

  // Listar cotações
  async index(req, res, next) {
    try {
      const { status, cliente_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.*, cl.nome as cliente_nome, co.nome as colaborador_nome
        FROM cotacao c
        LEFT JOIN cliente cl ON c.cliente_id = cl.id
        LEFT JOIN colaborador co ON c.colaborador_id = co.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }

      if (cliente_id) {
        query += ' AND c.cliente_id = ?';
        params.push(cliente_id);
      }

      query += ' ORDER BY c.criado_em DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [cotacoes] = await pool.query(query, params);

      // Buscar total
      let countQuery = 'SELECT COUNT(*) as total FROM cotacao WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      if (cliente_id) {
        countQuery += ' AND cliente_id = ?';
        countParams.push(cliente_id);
      }

      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: cotacoes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      return next(error);
    }
  }

  // Buscar cotação por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;

      const [cotacoes] = await pool.execute(`
        SELECT c.*, cl.nome as cliente_nome, cl.email as cliente_email, 
               cl.documento as cliente_documento, cl.telefone as cliente_telefone,
               co.nome as colaborador_nome
        FROM cotacao c
        LEFT JOIN cliente cl ON c.cliente_id = cl.id
        LEFT JOIN colaborador co ON c.colaborador_id = co.id
        WHERE c.id = ?
      `, [id]);

      if (cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      // Buscar itens
      const [itens] = await pool.execute(
        'SELECT * FROM cotacao_item WHERE cotacao_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: {
          ...cotacao,
          itens
        }
      });

    } catch (error) {
      return next(error);
    }
  }

  // Buscar por código
  async findByCodigo(req, res, next) {
    try {
      const { codigo } = req.params;

      const [cotacoes] = await pool.execute(`
        SELECT c.*, cl.nome as cliente_nome, co.nome as colaborador_nome
        FROM cotacao c
        LEFT JOIN cliente cl ON c.cliente_id = cl.id
        LEFT JOIN colaborador co ON c.colaborador_id = co.id
        WHERE c.codigo = ?
      `, [codigo]);

      if (cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      const [itens] = await pool.execute(
        'SELECT * FROM cotacao_item WHERE cotacao_id = ?',
        [cotacao.id]
      );

      res.json({
        success: true,
        data: {
          ...cotacao,
          itens
        }
      });

    } catch (error) {
      return next(error);
    }
  }

  // Enviar cotação por email
  async enviarEmail(req, res, next) {
    try {
      const { id } = req.params;

      const [cotacoes] = await pool.execute(
        'SELECT * FROM cotacao WHERE id = ?',
        [id]
      );

      if (cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      if (!cotacao.pdf_path) {
        return res.status(400).json({
          success: false,
          message: 'PDF não foi gerado para esta cotação'
        });
      }

      // Buscar cliente
      const [clientes] = await pool.execute(
        'SELECT * FROM cliente WHERE id = ?',
        [cotacao.cliente_id]
      );

      const cliente = clientes[0];

      // Buscar colaborador responsável
      const [colaboradores] = await pool.execute(
        'SELECT id, nome, email, telefone FROM colaborador WHERE id = ?',
        [cotacao.colaborador_id]
      );

      const colaborador = colaboradores[0];

      // Buscar itens
      const [itens] = await pool.execute(
        'SELECT * FROM cotacao_item WHERE cotacao_id = ?',
        [id]
      );

      // Enviar email
      await emailService.enviarCotacao(cliente, cotacao, itens, cotacao.pdf_path, colaborador);

      // Atualizar status
      await pool.execute(
        'UPDATE cotacao SET status = ?, enviada_em = NOW() WHERE id = ?',
        ['Enviada', id]
      );

      res.json({
        success: true,
        message: 'Cotação enviada por email com sucesso!'
      });

    } catch (error) {
      return next(error);
    }
  }

  // Atualizar status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const statusValidos = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Expirada'];

      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const [result] = await pool.execute(
        'UPDATE cotacao SET status = ? WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Status atualizado com sucesso!'
      });

    } catch (error) {
      return next(error);
    }
  }

  // Deletar cotação
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM cotacao WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cotação removida com sucesso!'
      });

    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new CotacoesController();
