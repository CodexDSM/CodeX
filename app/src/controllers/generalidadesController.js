const pool = require('../config/database');

class GeneralidadesController {
  async index(req, res, next) {
    try {
      // Busca TODAS as generalidades (ativas e inativas)
      const query = 'SELECT * FROM generalidades ORDER BY nome ASC';
      const [generalidades] = await pool.execute(query);

      res.json({
        success: true,
        data: generalidades
      });
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;

      const [generalidades] = await pool.execute(
        'SELECT * FROM generalidades WHERE id = ?',
        [id]
      );

      if (generalidades.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Generalidade não encontrada'
        });
      }

      res.json({
        success: true,
        data: generalidades[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { nome, descricao, tipo, valor, ativo } = req.body;

      if (!nome || !tipo || valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nome, tipo e valor são obrigatórios'
        });
      }

      if (!['fixo', 'percentual'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo deve ser "fixo" ou "percentual"'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO generalidades (nome, descricao, tipo, valor, ativo) VALUES (?, ?, ?, ?, ?)',
        [nome, descricao || null, tipo, valor, ativo !== undefined ? ativo : true]
      );

      res.status(201).json({
        success: true,
        message: 'Generalidade criada com sucesso',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, descricao, tipo, valor, ativo } = req.body;

      if (tipo && !['fixo', 'percentual'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo deve ser "fixo" ou "percentual"'
        });
      }

      const updates = [];
      const params = [];

      if (nome !== undefined) {
        updates.push('nome = ?');
        params.push(nome);
      }
      if (descricao !== undefined) {
        updates.push('descricao = ?');
        params.push(descricao);
      }
      if (tipo !== undefined) {
        updates.push('tipo = ?');
        params.push(tipo);
      }
      if (valor !== undefined) {
        updates.push('valor = ?');
        params.push(valor);
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
        `UPDATE generalidades SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Generalidade não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Generalidade atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM generalidades WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Generalidade não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Generalidade removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GeneralidadesController();
