const pool = require('../config/database');

class TabelaPrecoController {
  async getByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const { tipo_servico, ativo } = req.query;

      let query = 'SELECT * FROM cotacao_tabela_cliente WHERE cliente_id = ?';
      const params = [clienteId];

      if (tipo_servico) {
        query += ' AND tipo_servico = ?';
        params.push(tipo_servico);
      }

      if (ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(ativo === 'true' ? 1 : 0);
      }

      query += ' ORDER BY tipo_servico, destino';

      const [tabelas] = await pool.execute(query, params);

      res.json({
        success: true,
        data: tabelas
      });
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;

      const [tabelas] = await pool.execute(
        'SELECT * FROM cotacao_tabela_cliente WHERE id = ?',
        [id]
      );

      if (tabelas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tabela de preço não encontrada'
        });
      }

      res.json({
        success: true,
        data: tabelas[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const {
        cliente_id,
        tipo_servico,
        codigo_iata,
        destino,
        tipo_veiculo,
        frete_minimo,
        valor_kg_excedente,
        peso_minimo,
        peso_maximo,
        km_minimo,
        valor_km_excedente,
        capacidade_peso_min,
        capacidade_peso_max,
        diaria_veiculo,
        ativo
      } = req.body;

      if (!cliente_id || !tipo_servico || !frete_minimo) {
        return res.status(400).json({
          success: false,
          message: 'Cliente, tipo de serviço e frete mínimo são obrigatórios'
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO cotacao_tabela_cliente (
          cliente_id, tipo_servico, codigo_iata, destino, tipo_veiculo,
          frete_minimo, valor_kg_excedente, peso_minimo, peso_maximo,
          km_minimo, valor_km_excedente, capacidade_peso_min, 
          capacidade_peso_max, diaria_veiculo, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cliente_id, tipo_servico, codigo_iata || null, destino || null, 
          tipo_veiculo || null, frete_minimo, valor_kg_excedente || null,
          peso_minimo || null, peso_maximo || null, km_minimo || null,
          valor_km_excedente || null, capacidade_peso_min || null,
          capacidade_peso_max || null, diaria_veiculo || null,
          ativo !== undefined ? ativo : true
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Tabela de preço criada com sucesso',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        tipo_servico,
        codigo_iata,
        destino,
        tipo_veiculo,
        frete_minimo,
        valor_kg_excedente,
        peso_minimo,
        peso_maximo,
        km_minimo,
        valor_km_excedente,
        capacidade_peso_min,
        capacidade_peso_max,
        diaria_veiculo,
        ativo
      } = req.body;

      const updates = [];
      const params = [];

      if (tipo_servico !== undefined) {
        updates.push('tipo_servico = ?');
        params.push(tipo_servico);
      }
      if (codigo_iata !== undefined) {
        updates.push('codigo_iata = ?');
        params.push(codigo_iata);
      }
      if (destino !== undefined) {
        updates.push('destino = ?');
        params.push(destino);
      }
      if (tipo_veiculo !== undefined) {
        updates.push('tipo_veiculo = ?');
        params.push(tipo_veiculo);
      }
      if (frete_minimo !== undefined) {
        updates.push('frete_minimo = ?');
        params.push(frete_minimo);
      }
      if (valor_kg_excedente !== undefined) {
        updates.push('valor_kg_excedente = ?');
        params.push(valor_kg_excedente);
      }
      if (peso_minimo !== undefined) {
        updates.push('peso_minimo = ?');
        params.push(peso_minimo);
      }
      if (peso_maximo !== undefined) {
        updates.push('peso_maximo = ?');
        params.push(peso_maximo);
      }
      if (km_minimo !== undefined) {
        updates.push('km_minimo = ?');
        params.push(km_minimo);
      }
      if (valor_km_excedente !== undefined) {
        updates.push('valor_km_excedente = ?');
        params.push(valor_km_excedente);
      }
      if (capacidade_peso_min !== undefined) {
        updates.push('capacidade_peso_min = ?');
        params.push(capacidade_peso_min);
      }
      if (capacidade_peso_max !== undefined) {
        updates.push('capacidade_peso_max = ?');
        params.push(capacidade_peso_max);
      }
      if (diaria_veiculo !== undefined) {
        updates.push('diaria_veiculo = ?');
        params.push(diaria_veiculo);
      }
      if (ativo !== undefined) {
        updates.push('ativo = ?');
        params.push(ativo);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar'
        });
      }

      params.push(id);

      const [result] = await pool.execute(
        `UPDATE cotacao_tabela_cliente SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tabela de preço não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Tabela de preço atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM cotacao_tabela_cliente WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tabela de preço não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Tabela de preço removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPreco(req, res, next) {
    try {
      const { clienteId, tipoServico, codigoIata, tipoVeiculo } = req.query;

      if (!clienteId || !tipoServico) {
        return res.status(400).json({
          success: false,
          message: 'Cliente e tipo de serviço são obrigatórios'
        });
      }

      let query = `
        SELECT * FROM cotacao_tabela_cliente 
        WHERE cliente_id = ? 
        AND tipo_servico = ? 
        AND ativo = 1
      `;
      const params = [clienteId, tipoServico];

      if (codigoIata) {
        query += ' AND codigo_iata = ?';
        params.push(codigoIata);
      }

      if (tipoVeiculo) {
        query += ' AND tipo_veiculo = ?';
        params.push(tipoVeiculo);
      }

      query += ' LIMIT 1';

      const [tabelas] = await pool.execute(query, params);

      if (tabelas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tabela de preço não encontrada para os parâmetros informados'
        });
      }

      res.json({
        success: true,
        data: tabelas[0]
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TabelaPrecoController();
