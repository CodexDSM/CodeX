
const pool = require('../config/database');

class ChecklistController {

  async uploadAnexo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum ficheiro foi enviado.' });
      }

      const ficheiro = req.file;

      return res.status(201).json({
        message: 'Ficheiro enviado com sucesso!',
        filePath: ficheiro.path
      });
    } catch (error) {
      console.error('Erro no upload do anexo:', error);
      return res.status(500).json({ error: 'Falha no upload do anexo.' });
    }
  }


  async salvarRegistro(req, res) {
    let connection; 

    try {
      connection = await pool.getConnection();
      console.log('Conexão com a base de dados obtida com sucesso.');

      const { template_id, colaborador_id, ativo_relacionado_id, respostas, filePaths } = req.body;

      await connection.beginTransaction();
      console.log('Transação iniciada.');

      const registoQuery = 'INSERT INTO registros_checklist (template_id, colaborador_id, ativo_relacionado_id) VALUES (?, ?, ?)';
      const [registoResult] = await connection.execute(registoQuery, [template_id, colaborador_id, ativo_relacionado_id || null]);
      const novoRegistoId = registoResult.insertId;

      
      if (respostas && respostas.length > 0) {
        const respostasQuery = 'INSERT INTO checklist_respostas (registro_id, pergunta_id, valor_resposta) VALUES ?';
        const respostasValues = respostas.map(r => [novoRegistoId, r.pergunta_id, r.valor_resposta]);
        await connection.query(respostasQuery, [respostasValues]);
      }

      if (filePaths && filePaths.length > 0) {
        const anexosQuery = 'INSERT INTO registros_anexos (registro_id, caminho_arquivo) VALUES ?';
        const anexosValues = filePaths.map(path => [novoRegistoId, path]);
        await connection.query(anexosQuery, [anexosValues]);
      }

      await connection.commit();
      console.log('Transação confirmada.');

      return res.status(201).json({ message: 'Checklist guardado com sucesso!', registoId: novoRegistoId });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Erro ao guardar checklist. Transação desfeita.', error);
      return res.status(500).json({ error: 'Falha ao guardar o checklist.' });
    } finally {
      if (connection) {
        connection.release();
        console.log('Conexão libertada.');
      }
    }
  }
}

module.exports = new ChecklistController();