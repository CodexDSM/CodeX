class ChecklistController {
  async store(req, res) {
    try {
      const dadosDoFormulario = req.body;
      const arquivoEnviado = req.file;

      console.log('Dados de texto recebidos:', dadosDoFormulario);
      console.log('Informações do arquivo:', arquivoEnviado);

      // Lógica para salvar no banco de dados viria aqui...

      return res.status(201).json({
        message: 'Checklist registrado com sucesso!',
        dadosRecebidos: dadosDoFormulario,
        arquivo: arquivoEnviado ? {
          nomeOriginal: arquivoEnviado.originalname,
          nomeSalvo: arquivoEnviado.filename,
        } : 'Nenhum arquivo enviado',
      });
    } catch (error) {
      console.error('Erro ao processar o checklist:', error);
      return res.status(500).json({
        error: 'Ocorreu um erro interno no servidor.',
      });
    }
  }
}

// Exporta uma instância da classe usando module.exports
module.exports = new ChecklistController();

