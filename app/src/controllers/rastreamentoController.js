const pool = require('../config/database');

class RastreamentoController {
  // Lista todas as posições de um frete específico, da mais recente para a mais antiga.
  async index(req, res, next) {
    try {
      const { frete_id } = req.params;
      
      const [rows] = await pool.execute(
        'SELECT * FROM rastreamento WHERE frete_id = ? ORDER BY registrado_em DESC',
        [frete_id]
      );
      
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  // Cria um novo ponto de rastreamento para um frete.
  async create(req, res, next) {
    try {
      const { frete_id } = req.params;
      const { latitude, longitude } = req.body;

      // Verifica se o frete existe e se seu status é 'Transito'.
      const [frete] = await pool.execute('SELECT status FROM frete WHERE id = ?', [frete_id]);

      if (frete.length === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      if (frete[0].status !== 'Transito') {
        return res.status(400).json({ error: 'Frete não está em trânsito' });
      }

      const [result] = await pool.execute(
        'INSERT INTO rastreamento (frete_id, latitude, longitude) VALUES (?, ?, ?)',
        [frete_id, latitude, longitude]
      );

      res.status(201).json({ 
        id: result.insertId,
        message: 'Posição registrada com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Retorna a última posição registrada de um frete.
  async ultimaPosicao(req, res, next) {
    try {
      const { frete_id } = req.params;
      
      const [rows] = await pool.execute(
        'SELECT * FROM rastreamento WHERE frete_id = ? ORDER BY registrado_em DESC LIMIT 1',
        [frete_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Nenhuma posição encontrada' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // Rastreia um frete usando seu código, retornando status e posições.
  async rastrearPorCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      
      const [frete] = await pool.execute('SELECT id, status FROM frete WHERE codigo = ?', [codigo]);

      if (frete.length === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      const [posicoes] = await pool.execute(
        'SELECT * FROM rastreamento WHERE frete_id = ? ORDER BY registrado_em DESC',
        [frete[0].id]
      );

      res.json({
        frete_id: frete[0].id,
        status: frete[0].status,
        posicoes
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RastreamentoController();