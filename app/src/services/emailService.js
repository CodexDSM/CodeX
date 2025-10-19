const transporter = require('../config/emailConfig');

class EmailService {
  async enviarEmail(destinatario, assunto, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: destinatario,
        subject: assunto,
        html: html
      };

      // Adicionar anexos se houver
      if (attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

      const info = await transporter.sendMail(mailOptions);

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

  templateCotacao(cliente, cotacao, itens, colaborador) {
    let itensHTML = '';
    
    itens.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
      itensHTML += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.descricao}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantidade}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">R$ ${this.formatarMoeda(item.valor_unitario)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">R$ ${this.formatarMoeda(item.valor_total)}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 700px; margin: 0 auto; padding: 0; background-color: #ffffff; }
          .header { background-color: #1e3a8a; color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 42px; font-weight: 700; margin-bottom: 10px; letter-spacing: 3px; }
          .header-subtitle { font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .section-title { color: #1e3a8a; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
          .info-box { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: 600; color: #1e3a8a; display: inline-block; min-width: 120px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #1e3a8a; color: white; padding: 15px 12px; text-align: left; font-weight: 600; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
          th:nth-child(3), th:nth-child(4) { text-align: right; }
          .totals-box { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total-final { display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; font-weight: 700; color: #1e3a8a; border-top: 2px solid #1e3a8a; margin-top: 10px; }
          .observacoes { background-color: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .cta-button { display: inline-block; background-color: #1e3a8a; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 3px solid #1e3a8a; }
          .footer-text { color: #666; font-size: 12px; margin: 5px 0; }
          .validade { background-color: #fef3c7; padding: 15px; border-radius: 6px; text-align: center; color: #92400e; font-weight: 600; margin: 20px 0; }
          .responsavel-box { background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEWE</div>
            <div class="header-subtitle">Sistema de Gestão de Transportes</div>
          </div>
          
          <div class="content">
            <h1 style="color: #1e3a8a; text-align: center; margin: 0 0 10px 0;">📋 COTAÇÃO DE FRETE</h1>
            <p style="text-align: center; color: #666; margin: 0 0 30px 0;">Cotação Nº ${cotacao.codigo} | Emitida em ${this.formatarDataSimples(cotacao.criado_em)}</p>
            
            <div class="section-title">👤 Dados do Cliente</div>
            <div class="info-box">
              <div class="info-row"><span class="info-label">Nome:</span> ${cliente.nome}</div>
              <div class="info-row"><span class="info-label">Documento:</span> ${cliente.documento}</div>
              <div class="info-row"><span class="info-label">Email:</span> ${cliente.email}</div>
              <div class="info-row"><span class="info-label">Telefone:</span> ${cliente.telefone}</div>
            </div>

            ${colaborador ? `
            <div class="responsavel-box">
              <div style="font-weight: 600; color: #10b981; margin-bottom: 5px;">👨‍💼 Responsável pela Cotação</div>
              <div style="font-size: 16px; color: #333;">${colaborador.nome}</div>
              ${colaborador.email ? `<div style="font-size: 13px; color: #666; margin-top: 3px;">📧 ${colaborador.email}</div>` : ''}
              ${colaborador.telefone ? `<div style="font-size: 13px; color: #666;">📞 ${colaborador.telefone}</div>` : ''}
            </div>
            ` : ''}

            <div class="section-title">📦 Itens da Cotação</div>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itensHTML}
              </tbody>
            </table>

            <div class="totals-box">
              ${cotacao.desconto > 0 ? `
              <div class="total-row">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">R$ ${this.formatarMoeda(parseFloat(cotacao.valor_total) + parseFloat(cotacao.desconto))}</span>
              </div>
              <div class="total-row">
                <span>Desconto:</span>
                <span style="color: #059669; font-weight: 600;">-R$ ${this.formatarMoeda(cotacao.desconto)}</span>
              </div>
              ` : ''}
              <div class="total-final">
                <span>VALOR TOTAL:</span>
                <span>R$ ${this.formatarMoeda(cotacao.valor_total)}</span>
              </div>
            </div>

            ${cotacao.observacoes ? `
            <div class="section-title">📝 Observações</div>
            <div class="observacoes">
              ${cotacao.observacoes}
            </div>
            ` : ''}

            <div class="validade">
              ⏰ Esta cotação é válida por 7 dias a partir da data de emissão
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666;">Dúvidas? Entre em contato conosco!</p>
            </div>
          </div>

          <div class="footer">
            <div style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">NEWE</div>
            <div class="footer-text">Sistema de Gestão de Transportes</div>
            <div class="footer-text">Esta é uma mensagem automática. O PDF completo está anexado.</div>
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

  formatarDataSimples(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  formatarMoeda(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
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

  async enviarCotacao(cliente, cotacao, itens, pdfPath, colaborador = null) {
    const html = this.templateCotacao(cliente, cotacao, itens, colaborador);
    
    const attachments = [{
      filename: `Cotacao-${cotacao.codigo}.pdf`,
      path: pdfPath
    }];

    return await this.enviarEmail(
      cliente.email,
      `Cotação de Frete Nº ${cotacao.codigo} - NEWE`,
      html,
      attachments
    );
  }
}

module.exports = new EmailService();
