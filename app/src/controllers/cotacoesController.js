const pool = require('../config/database');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const cotacaoCalculoService = require('../services/cotacaoCalculoService');

// NOTE: código field generation removed — using simple autoincrement `id` for cotacao.
// The previous sequence logic was removed to simplify: cotacao.id (AUTO_INCREMENT) is used as identifier.

class CotacoesController {
  async calcular(req, res, next) {
    try {
      const resultado = await cotacaoCalculoService.calcularCotacaoCompleta(req.body);

      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao calcular cotação:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res, next) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        cliente_id,
        tipo_servico,
        origem,
        destino,
        codigo_iata_destino,
        peso_kg,
        km_percorrido,
        tipo_veiculo,
        valor_frete_agregado,
        valor_km_agregado,
        generalidades_ids,
        observacoes,
        enviar_email
      } = req.body;


      if (!cliente_id || !tipo_servico) {
        return res.status(400).json({
          success: false,
          message: 'Cliente e tipo de serviço são obrigatórios'
        });
      }

      const calculos = await cotacaoCalculoService.calcularCotacaoCompleta({
        clienteId: cliente_id,
        tipoServico: tipo_servico,
        pesoKg: peso_kg,
        kmPercorrido: km_percorrido,
        codigoIata: codigo_iata_destino,
        tipoVeiculo: tipo_veiculo,
        generalidadesIds: generalidades_ids,
        valorFreteAgregado: valor_frete_agregado,
        valorKmAgregado: valor_km_agregado
      });

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

      const colaborador_id = req.user && req.user.id ? req.user.id : null;

      // Busca colaborador (pode não existir se a tabela foi restaurada parcialmente)
      let colaborador = null;
      let colaboradorIdParaInsert = colaborador_id;
      if (colaborador_id) {
        const [colaboradores] = await connection.execute(
          'SELECT id, nome, email, telefone FROM colaborador WHERE id = ?',
          [colaborador_id]
        );
        colaborador = colaboradores[0] || null;
      }

      // Se não encontrarmos o colaborador no banco, não falhamos com FK —
      // usamos NULL no insert e um objeto fallback para evitar erros posteriores
      if (!colaborador) {
        colaboradorIdParaInsert = null;
        colaborador = { id: null, nome: 'Sistema', email: null, telefone: null };
      }

      // Tentativa de inserir cotação com retry em caso de colisão no código
      // Inserção simples: não usamos mais o campo `codigo` gerado — usar `id` autoincrement como identificador
      const validadeAte = new Date();
      validadeAte.setDate(validadeAte.getDate() + 7);

      const [resultCotacao] = await connection.execute(
        `INSERT INTO cotacao (
          cliente_id, colaborador_id, tipo_servico, origem, destino,
          codigo_iata_destino, peso_kg, km_percorrido, tipo_veiculo,
          valor_base_tabela, valor_generalidades, valor_cliente,
          valor_agregado, percentual_rentabilidade, valor_rentabilidade,
          valor_total, observacoes, validade_ate, status, status_aprovacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cliente_id, colaboradorIdParaInsert, tipo_servico, origem, destino,
          codigo_iata_destino, peso_kg, km_percorrido, tipo_veiculo,
          calculos.valorBase, calculos.valorGeneralidades, calculos.valorCliente,
          calculos.valorAgregado, calculos.percentualRentabilidade, calculos.valorRentabilidade,
          calculos.valorCliente, observacoes || null, validadeAte,
          enviar_email ? 'Enviada' : 'Rascunho', 'Pendente'
        ]
      );

      const cotacao_id = resultCotacao.insertId;

      // Preencher o campo `codigo` no formato simples COT-<id>
      const codigoGerado = `COT-${cotacao_id}`;
      await connection.execute(
        'UPDATE cotacao SET codigo = ? WHERE id = ?',
        [codigoGerado, cotacao_id]
      );

      if (valor_frete_agregado && valor_km_agregado) {
        await connection.execute(
          `INSERT INTO cotacao_valores_agregado (
            cotacao_id, valor_frete_agregado, valor_km_agregado, km_percorrido, total_agregado
          ) VALUES (?, ?, ?, ?, ?)`,
          [cotacao_id, valor_frete_agregado, valor_km_agregado, km_percorrido || 0, calculos.valorAgregado]
        );
      }

      if (calculos.generalidadesAplicadas && calculos.generalidadesAplicadas.length > 0) {
        for (const gen of calculos.generalidadesAplicadas) {
          await connection.execute(
            'INSERT INTO cotacao_generalidades_aplicadas (cotacao_id, generalidade_id, valor_aplicado) VALUES (?, ?, ?)',
            [cotacao_id, gen.generalidade_id, gen.valor_aplicado]
          );
        }
      }

      const [cotacaoCompleta] = await connection.execute(
        'SELECT * FROM cotacao WHERE id = ?',
        [cotacao_id]
      );

      const cotacao = cotacaoCompleta[0];

      const itensParaPDF = calculos.generalidadesAplicadas.map(gen => ({
        descricao: gen.nome,
        quantidade: 1,
        valor_unitario: gen.valor_aplicado,
        valor_total: gen.valor_aplicado
      }));

      itensParaPDF.unshift({
        descricao: `Frete ${tipo_servico} - ${origem} → ${destino}`,
        quantidade: peso_kg || 1,
        valor_unitario: calculos.valorBase,
        valor_total: calculos.valorBase
      });

      const { filepath, filename } = await pdfService.gerarCotacaoPDF(cotacao, itensParaPDF, cliente);

      await connection.execute(
        'UPDATE cotacao SET pdf_path = ? WHERE id = ?',
        [filepath, cotacao_id]
      );

      if (enviar_email) {
        await emailService.enviarCotacao(cliente, cotacao, itensParaPDF, filepath, colaborador);
        
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
          codigo: codigoGerado,
          pdf_filename: filename,
          ...calculos
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

  async index(req, res, next) {
    try {
      const { status, status_aprovacao, cliente_id, tipo_servico, page = 1, limit = 10 } = req.query;
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

      if (status_aprovacao) {
        query += ' AND c.status_aprovacao = ?';
        params.push(status_aprovacao);
      }

      if (cliente_id) {
        query += ' AND c.cliente_id = ?';
        params.push(cliente_id);
      }

      if (tipo_servico) {
        query += ' AND c.tipo_servico = ?';
        params.push(tipo_servico);
      }

      query += ' ORDER BY c.criado_em DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [cotacoes] = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) as total FROM cotacao WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      if (status_aprovacao) {
        countQuery += ' AND status_aprovacao = ?';
        countParams.push(status_aprovacao);
      }

      if (cliente_id) {
        countQuery += ' AND cliente_id = ?';
        countParams.push(cliente_id);
      }

      if (tipo_servico) {
        countQuery += ' AND tipo_servico = ?';
        countParams.push(tipo_servico);
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

      const [generalidades] = await pool.execute(`
        SELECT cga.*, cg.nome, cg.tipo, cg.descricao
        FROM cotacao_generalidades_aplicadas cga
        LEFT JOIN cotacao_generalidades cg ON cga.generalidade_id = cg.id
        WHERE cga.cotacao_id = ?
      `, [id]);

      const [valoresAgregado] = await pool.execute(
        'SELECT * FROM cotacao_valores_agregado WHERE cotacao_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: {
          ...cotacao,
          generalidades,
          valores_agregado: valoresAgregado.length > 0 ? valoresAgregado[0] : null
        }
      });

    } catch (error) {
      return next(error);
    }
  }

  async aprovar(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'UPDATE cotacao SET status_aprovacao = ?, aprovada_em = NOW() WHERE id = ?',
        ['Aprovada', id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      // Cria uma ordem de serviço a partir da cotação aprovada
      const [cotacoes] = await connection.execute(
        'SELECT * FROM cotacao WHERE id = ?',
        [id]
      );

      const cotacao = cotacoes[0];

      // Insere OS com um código temporário único (coluna `codigo` é NOT NULL/UNIQUE)
      // Depois preenchemos com o formato final OS-<id> usando o insertId.
      const tempCodigo = `OS-TMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const [insertOS] = await connection.execute(
        `INSERT INTO ordens_servico (
          codigo, cotacao_id, cliente_id, colaborador_id, origem, destino,
          distancia_km, peso_kg, valor, status, data_entrega_prevista, observacoes, dados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tempCodigo,
          cotacao.id,
          cotacao.cliente_id,
          cotacao.colaborador_id,
          cotacao.origem,
          cotacao.destino,
          cotacao.km_percorrido || null,
          cotacao.peso_kg || null,
          cotacao.valor_cliente || null,
          'Pendente',
          cotacao.validade_ate || null,
          cotacao.observacoes || null,
          JSON.stringify({ criado_por_cotacao: cotacao.id })
        ]
      );

      const osId = insertOS.insertId;

      const codigoOS = `OS-${osId}`;
      await connection.execute('UPDATE ordens_servico SET codigo = ? WHERE id = ?', [codigoOS, osId]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Cotação aprovada e OS criada com sucesso',
        data: { osId, codigo: codigoOS }
      });
    } catch (error) {
      await connection.rollback();
      return next(error);
    } finally {
      connection.release();
    }
  }

  async rejeitar(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo_rejeicao } = req.body;

      const [result] = await pool.execute(
        'UPDATE cotacao SET status_aprovacao = ?, rejeitada_em = NOW(), motivo_rejeicao = ? WHERE id = ?',
        ['Rejeitada', motivo_rejeicao || null, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cotação rejeitada'
      });
    } catch (error) {
      return next(error);
    }
  }

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

      const [clientes] = await pool.execute(
        'SELECT * FROM cliente WHERE id = ?',
        [cotacao.cliente_id]
      );

      const cliente = clientes[0];

      const [colaboradores] = await pool.execute(
        'SELECT id, nome, email, telefone FROM colaborador WHERE id = ?',
        [cotacao.colaborador_id]
      );

      const colaborador = colaboradores[0];

      const [generalidades] = await pool.execute(`
        SELECT cga.*, cg.nome
        FROM cotacao_generalidades_aplicadas cga
        LEFT JOIN cotacao_generalidades cg ON cga.generalidade_id = cg.id
        WHERE cga.cotacao_id = ?
      `, [id]);

      const itens = generalidades.map(gen => ({
        descricao: gen.nome,
        quantidade: 1,
        valor_unitario: gen.valor_aplicado,
        valor_total: gen.valor_aplicado
      }));

      await emailService.enviarCotacao(cliente, cotacao, itens, cotacao.pdf_path, colaborador);

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
