const transporter = require('../config/emailConfig');

class EmailService {
  async enviarEmail(destinatario, assunto, html) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: destinatario,
        subject: assunto,
        html: html
      });

      console.log('Email enviado com sucesso:', info.messageId);
      return { sucesso: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return { sucesso: false, erro: error.message };
    }
  }

  templateConviteEvento(colaborador, evento) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5; }
          .header { background-color: #1e3a8a; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .logo { font-size: 36px; font-weight: 700; margin-bottom: 10px; letter-spacing: 2px; }
          .content { background-color: white; padding: 40px 30px; }
          .evento-info { background-color: #eff6ff; padding: 20px; border-left: 4px solid #1e3a8a; margin: 25px 0; border-radius: 4px; }
          .evento-info h2 { color: #1e3a8a; margin-top: 0; font-size: 22px; }
          .info-item { margin: 12px 0; display: flex; align-items: center; }
          .info-item strong { min-width: 140px; color: #1e3a8a; }
          .footer { background-color: #1e3a8a; color: white; text-align: center; padding: 20px; font-size: 12px; }
          .footer-text { margin: 5px 0; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEWE</div>
            <h1>🎯 Convite para Evento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${colaborador.nome}</strong>,</p>
            <p>Você foi convidado para participar do seguinte evento:</p>
            
            <div class="evento-info">
              <h2>${evento.titulo}</h2>
              <div class="info-item">
                <strong>📅 Data de Início:</strong>
                <span>${this.formatarData(evento.data_inicio)}</span>
              </div>
              <div class="info-item">
                <strong>🕐 Data de Término:</strong>
                <span>${this.formatarData(evento.data_fim)}</span>
              </div>
              <div class="info-item">
                <strong>📍 Local:</strong>
                <span>${evento.local}</span>
              </div>
              ${evento.descricao ? `
              <div class="info-item">
                <strong>📝 Descrição:</strong>
                <span>${evento.descricao}</span>
              </div>
              ` : ''}
            </div>

            <p>Por favor, confirme sua participação através do sistema.</p>
            
            <p style="margin-top: 35px; color: #666;">Atenciosamente,<br><strong style="color: #1e3a8a;">Equipe NEWE</strong></p>
          </div>
          <div class="footer">
            <div class="footer-text"><strong>NEWE</strong> - Sistema de Gestão</div>
            <div class="footer-text">Esta é uma mensagem automática. Por favor, não responda este email.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  templateAtualizacaoEvento(colaborador, evento) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5; }
          .header { background-color: #0891b2; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .logo { font-size: 36px; font-weight: 700; margin-bottom: 10px; letter-spacing: 2px; }
          .content { background-color: white; padding: 40px 30px; }
          .alert { background-color: #cffafe; border: 2px solid #0891b2; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .alert strong { color: #0891b2; font-size: 18px; }
          .evento-info { background-color: #eff6ff; padding: 20px; border-left: 4px solid #1e3a8a; margin: 25px 0; border-radius: 4px; }
          .evento-info h2 { color: #1e3a8a; margin-top: 0; font-size: 22px; }
          .info-item { margin: 12px 0; display: flex; align-items: center; }
          .info-item strong { min-width: 140px; color: #1e3a8a; }
          .footer { background-color: #1e3a8a; color: white; text-align: center; padding: 20px; font-size: 12px; }
          .footer-text { margin: 5px 0; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEWE</div>
            <h1>🔄 Evento Atualizado</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${colaborador.nome}</strong>,</p>
            
            <div class="alert">
              <strong>ℹ️ As informações do evento foram atualizadas</strong>
            </div>

            <p>O evento que você confirmou presença teve suas informações alteradas:</p>
            
            <div class="evento-info">
              <h2>${evento.titulo}</h2>
              <div class="info-item">
                <strong>📅 Data de Início:</strong>
                <span>${this.formatarData(evento.data_inicio)}</span>
              </div>
              <div class="info-item">
                <strong>🕐 Data de Término:</strong>
                <span>${this.formatarData(evento.data_fim)}</span>
              </div>
              <div class="info-item">
                <strong>📍 Local:</strong>
                <span>${evento.local}</span>
              </div>
              ${evento.descricao ? `
              <div class="info-item">
                <strong>📝 Descrição:</strong>
                <span>${evento.descricao}</span>
              </div>
              ` : ''}
            </div>

            <p style="color: #0891b2; font-weight: 600;">⚠️ Por favor, verifique se as novas informações não conflitam com sua agenda.</p>
            
            <p style="margin-top: 35px; color: #666;">Atenciosamente,<br><strong style="color: #1e3a8a;">Equipe NEWE</strong></p>
          </div>
          <div class="footer">
            <div class="footer-text"><strong>NEWE</strong> - Sistema de Gestão</div>
            <div class="footer-text">Esta é uma mensagem automática. Por favor, não responda este email.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  templateLembreteEvento(colaborador, evento, tipoLembrete) {
    const mensagens = {
      'dia_anterior': '⏰ O evento acontecerá amanhã!',
      'dia_evento': '📅 O evento é hoje!',
      'uma_hora_antes': '⚡ O evento começará em 1 hora!'
    };

    const cores = {
      'dia_anterior': '#f59e0b',
      'dia_evento': '#1e3a8a',
      'uma_hora_antes': '#dc2626'
    };

    const corLembrete = cores[tipoLembrete];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5; }
          .header { background-color: ${corLembrete}; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .logo { font-size: 36px; font-weight: 700; margin-bottom: 10px; letter-spacing: 2px; }
          .content { background-color: white; padding: 40px 30px; }
          .alert { background-color: #fef3c7; border: 2px solid ${corLembrete}; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .alert strong { color: ${corLembrete}; font-size: 18px; }
          .evento-info { background-color: #eff6ff; padding: 20px; border-left: 4px solid #1e3a8a; margin: 25px 0; border-radius: 4px; }
          .evento-info h2 { color: #1e3a8a; margin-top: 0; font-size: 22px; }
          .info-item { margin: 12px 0; display: flex; align-items: center; }
          .info-item strong { min-width: 140px; color: #1e3a8a; }
          .footer { background-color: #1e3a8a; color: white; text-align: center; padding: 20px; font-size: 12px; }
          .footer-text { margin: 5px 0; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEWE</div>
            <h1>🔔 Lembrete de Evento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${colaborador.nome}</strong>,</p>
            
            <div class="alert">
              <strong>${mensagens[tipoLembrete]}</strong>
            </div>

            <p>Lembrete sobre o evento que você confirmou presença:</p>
            
            <div class="evento-info">
              <h2>${evento.titulo}</h2>
              <div class="info-item">
                <strong>📅 Data de Início:</strong>
                <span>${this.formatarData(evento.data_inicio)}</span>
              </div>
              <div class="info-item">
                <strong>🕐 Data de Término:</strong>
                <span>${this.formatarData(evento.data_fim)}</span>
              </div>
              <div class="info-item">
                <strong>📍 Local:</strong>
                <span>${evento.local}</span>
              </div>
              ${evento.descricao ? `
              <div class="info-item">
                <strong>📝 Descrição:</strong>
                <span>${evento.descricao}</span>
              </div>
              ` : ''}
            </div>

            <p style="color: #dc2626; font-weight: 600;">⚠️ Não se esqueça de comparecer!</p>
            
            <p style="margin-top: 35px; color: #666;">Atenciosamente,<br><strong style="color: #1e3a8a;">Equipe NEWE</strong></p>
          </div>
          <div class="footer">
            <div class="footer-text"><strong>NEWE</strong> - Sistema de Gestão</div>
            <div class="footer-text">Esta é uma mensagem automática. Por favor, não responda este email.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }

  async enviarConviteEvento(colaborador, evento) {
    const html = this.templateConviteEvento(colaborador, evento);
    return await this.enviarEmail(
      colaborador.email,
      `Convite: ${evento.titulo}`,
      html
    );
  }

  async enviarAtualizacaoEvento(colaborador, evento) {
    const html = this.templateAtualizacaoEvento(colaborador, evento);
    return await this.enviarEmail(
      colaborador.email,
      `Atualização: ${evento.titulo}`,
      html
    );
  }

  async enviarLembreteEvento(colaborador, evento, tipoLembrete) {
    const html = this.templateLembreteEvento(colaborador, evento, tipoLembrete);
    return await this.enviarEmail(
      colaborador.email,
      `Lembrete: ${evento.titulo}`,
      html
    );
  }
}

module.exports = new EmailService();
