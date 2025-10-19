const pool = require('../config/database');
const emailService = require('./emailService');

class NotificacaoService {
  async criarNotificacao(colaborador_id, tipo, titulo, mensagem, evento_id = null) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO notificacao (colaborador_id, tipo, titulo, mensagem, evento_id) VALUES (?, ?, ?, ?, ?)',
        [colaborador_id, tipo, titulo, mensagem, evento_id]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  async notificarConviteEvento(evento_id, colaborador_id) {
    try {
      const [eventos] = await pool.execute('SELECT * FROM evento WHERE id = ?', [evento_id]);
      const [colaboradores] = await pool.execute('SELECT * FROM colaborador WHERE id = ?', [colaborador_id]);

      if (eventos.length === 0 || colaboradores.length === 0) {
        return;
      }

      const evento = eventos[0];
      const colaborador = colaboradores[0];

      const titulo = `Convite: ${evento.titulo}`;
      const mensagem = `Você foi convidado para o evento "${evento.titulo}" que acontecerá em ${emailService.formatarData(evento.data_inicio)}`;

      await this.criarNotificacao(colaborador_id, 'Evento', titulo, mensagem, evento_id);

      const resultadoEmail = await emailService.enviarConviteEvento(colaborador, evento);

      if (resultadoEmail.sucesso) {
        await pool.execute(
          'UPDATE notificacao SET email_enviado = TRUE, data_envio_email = NOW() WHERE colaborador_id = ? AND evento_id = ? ORDER BY criado_em DESC LIMIT 1',
          [colaborador_id, evento_id]
        );
      }

      console.log(`Notificação de convite enviada para ${colaborador.nome}`);
    } catch (error) {
      console.error('Erro ao notificar convite:', error);
    }
  }

  async notificarAtualizacaoEvento(evento_id) {
    try {
      const [eventos] = await pool.execute('SELECT * FROM evento WHERE id = ?', [evento_id]);
      
      if (eventos.length === 0) {
        return;
      }

      const evento = eventos[0];

      const [convites] = await pool.execute(
        'SELECT c.* FROM colaborador c INNER JOIN evento_colaborador ec ON c.id = ec.colaborador_id WHERE ec.evento_id = ? AND ec.status = "Aceito"',
        [evento_id]
      );

      for (const colaborador of convites) {
        const titulo = `Atualização: ${evento.titulo}`;
        const mensagem = `O evento "${evento.titulo}" foi atualizado. Verifique as novas informações.`;

        await this.criarNotificacao(colaborador.id, 'Evento', titulo, mensagem, evento_id);

        const resultadoEmail = await emailService.enviarAtualizacaoEvento(colaborador, evento);

        if (resultadoEmail.sucesso) {
          await pool.execute(
            'UPDATE notificacao SET email_enviado = TRUE, data_envio_email = NOW() WHERE colaborador_id = ? AND evento_id = ? ORDER BY criado_em DESC LIMIT 1',
            [colaborador.id, evento_id]
          );
        }

        console.log(`Notificação de atualização enviada para ${colaborador.nome}`);
      }
    } catch (error) {
      console.error('Erro ao notificar atualização:', error);
    }
  }

  async processarLembretesEventos() {
    try {
      const agora = new Date();

      const dataLimiteDiaAnterior = new Date(agora);
      dataLimiteDiaAnterior.setDate(dataLimiteDiaAnterior.getDate() + 1);
      dataLimiteDiaAnterior.setHours(5, 0, 0, 0);

      const dataLimiteDiaEvento = new Date(agora);
      dataLimiteDiaEvento.setHours(5, 0, 0, 0);

      const dataLimiteUmaHora = new Date(agora);
      dataLimiteUmaHora.setHours(agora.getHours() + 1);

      await this.enviarLembretesTipo('dia_anterior', dataLimiteDiaAnterior);
      await this.enviarLembretesTipo('dia_evento', dataLimiteDiaEvento);
      await this.enviarLembretesTipo('uma_hora_antes', dataLimiteUmaHora);

    } catch (error) {
      console.error('Erro ao processar lembretes:', error);
    }
  }

  async enviarLembretesTipo(tipoLembrete, dataLimite) {
    try {
      let condicaoData;
      
      if (tipoLembrete === 'dia_anterior') {
        condicaoData = 'DATE(e.data_inicio) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY))';
      } else if (tipoLembrete === 'dia_evento') {
        condicaoData = 'DATE(e.data_inicio) = DATE(NOW())';
      } else if (tipoLembrete === 'uma_hora_antes') {
        condicaoData = 'e.data_inicio BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)';
      }

      const query = `
        SELECT e.*, ec.colaborador_id, c.nome, c.email
        FROM evento e
        INNER JOIN evento_colaborador ec ON e.id = ec.evento_id
        INNER JOIN colaborador c ON ec.colaborador_id = c.id
        LEFT JOIN notificacao_lembrete nl ON e.id = nl.evento_id AND nl.tipo_lembrete = ?
        WHERE ec.status = 'Aceito'
          AND ${condicaoData}
          AND (nl.enviado IS NULL OR nl.enviado = FALSE)
      `;

      const [eventos] = await pool.execute(query, [tipoLembrete]);

      for (const evento of eventos) {
        const colaborador = {
          id: evento.colaborador_id,
          nome: evento.nome,
          email: evento.email
        };

        const titulo = `Lembrete: ${evento.titulo}`;
        let mensagemTexto = '';
        
        if (tipoLembrete === 'dia_anterior') {
          mensagemTexto = 'O evento acontecerá amanhã!';
        } else if (tipoLembrete === 'dia_evento') {
          mensagemTexto = 'O evento é hoje!';
        } else if (tipoLembrete === 'uma_hora_antes') {
          mensagemTexto = 'O evento começará em 1 hora!';
        }

        const mensagem = `${mensagemTexto} "${evento.titulo}" - ${emailService.formatarData(evento.data_inicio)}`;

        await this.criarNotificacao(colaborador.id, 'Evento', titulo, mensagem, evento.id);

        const resultadoEmail = await emailService.enviarLembreteEvento(colaborador, evento, tipoLembrete);

        await pool.execute(
          'INSERT INTO notificacao_lembrete (evento_id, tipo_lembrete, enviado, data_envio) VALUES (?, ?, TRUE, NOW()) ON DUPLICATE KEY UPDATE enviado = TRUE, data_envio = NOW()',
          [evento.id, tipoLembrete]
        );

        console.log(`Lembrete ${tipoLembrete} enviado para ${colaborador.nome} - Evento: ${evento.titulo}`);
      }

    } catch (error) {
      console.error(`Erro ao enviar lembretes tipo ${tipoLembrete}:`, error);
    }
  }
}

module.exports = new NotificacaoService();
