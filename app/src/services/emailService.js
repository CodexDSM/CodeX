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

  templateCotacao(cliente, cotacao, generalidades, colaborador) {
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
          .section-title { color: #1e3a8a; font-size: 18px; font-weight: 600; margin: 30px 0 15px 0; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
          .info-box { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: 600; color: #1e3a8a; display: inline-block; min-width: 140px; }
          .frete-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .frete-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .frete-label { color: #047857; font-weight: 600; }
          .frete-value { color: #333; font-weight: 500; }
          .totals-box { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #e5e7eb; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
          .total-final { display: flex; justify-content: space-between; padding: 15px 0; font-size: 22px; font-weight: 700; color: #1e3a8a; border-top: 2px solid #1e3a8a; margin-top: 10px; }
          .observacoes { background-color: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
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
            <p style="text-align: center; color: #666; margin: 0 0 30px 0;">
              Cotação Nº <strong>${cotacao.codigo}</strong> | Emitida em ${this.formatarDataSimples(cotacao.created_at || cotacao.criado_em)}
            </p>
            
            <div class="section-title">👤 Dados do Cliente</div>
            <div class="info-box">
              <div class="info-row"><span class="info-label">Nome:</span> ${cliente.nome}</div>
              <div class="info-row"><span class="info-label">Documento:</span> ${cliente.documento}</div>
              <div class="info-row"><span class="info-label">Email:</span> ${cliente.email}</div>
              <div class="info-row"><span class="info-label">Telefone:</span> ${cliente.telefone}</div>
            </div>

            <div class="section-title">🚚 Detalhes do Frete</div>
            <div class="frete-box">
              <div class="frete-row">
                <span class="frete-label">Tipo de Serviço:</span>
                <span class="frete-value">${cotacao.tipo_servico}</span>
              </div>
              <div class="frete-row">
                <span class="frete-label">Origem:</span>
                <span class="frete-value">${cotacao.origem}</span>
              </div>
              <div class="frete-row">
                <span class="frete-label">Destino:</span>
                <span class="frete-value">${cotacao.destino}</span>
              </div>
              ${cotacao.codigo_iata_destino ? `
              <div class="frete-row">
                <span class="frete-label">Código IATA:</span>
                <span class="frete-value">${cotacao.codigo_iata_destino}</span>
              </div>
              ` : ''}
              ${cotacao.peso_kg > 0 ? `
              <div class="frete-row">
                <span class="frete-label">Peso:</span>
                <span class="frete-value">${this.formatarMoeda(cotacao.peso_kg)} kg</span>
              </div>
              ` : ''}
              ${cotacao.km_percorrido > 0 ? `
              <div class="frete-row">
                <span class="frete-label">KM Percorrido:</span>
                <span class="frete-value">${this.formatarMoeda(cotacao.km_percorrido)} km</span>
              </div>
              ` : ''}
              ${cotacao.tipo_veiculo ? `
              <div class="frete-row">
                <span class="frete-label">Tipo de Veículo:</span>
                <span class="frete-value">${cotacao.tipo_veiculo}</span>
              </div>
              ` : ''}
            </div>

            ${colaborador ? `
            <div class="responsavel-box">
              <div style="font-weight: 600; color: #10b981; margin-bottom: 5px;">👨‍💼 Responsável pela Cotação</div>
              <div style="font-size: 16px; color: #333;">${colaborador.nome}</div>
              ${colaborador.email ? `<div style="font-size: 13px; color: #666; margin-top: 3px;">📧 ${colaborador.email}</div>` : ''}
              ${colaborador.telefone ? `<div style="font-size: 13px; color: #666;">📞 ${colaborador.telefone}</div>` : ''}
            </div>
            ` : ''}

            <div class="section-title">💰 Composição de Valores</div>
            
            <div class="totals-box">
              <div class="total-row">
                <span style="font-weight: 600;">Valor Base do Frete:</span>
                <span style="font-weight: 600; color: #059669;">R$ ${this.formatarMoeda(cotacao.valor_base || cotacao.valor_cliente)}</span>
              </div>
              
              ${generalidades && generalidades.length > 0 ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <div style="font-weight: 600; color: #666; margin-bottom: 10px;">Generalidades Aplicadas:</div>
                ${generalidades.map(gen => {
                  const valor = parseFloat(gen.valor_aplicado || gen.valor_total || gen.valor || 0);
                  return `
                    <div class="total-row" style="font-size: 13px; padding: 5px 0;">
                      <span style="color: #666;">• ${gen.nome || gen.descricao || 'Generalidade'}</span>
                      <span>R$ ${this.formatarMoeda(valor)}</span>
                    </div>
                  `;
                }).join('')}
                <div class="total-row" style="border-top: 1px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
                  <span style="font-weight: 600;">Total Generalidades:</span>
                  <span style="font-weight: 600;">R$ ${this.formatarMoeda(cotacao.valor_generalidades || generalidades.reduce((sum, g) => sum + parseFloat(g.valor_aplicado || g.valor_total || g.valor || 0), 0))}</span>
                </div>
              </div>
              ` : ''}
              
              <div class="total-final">
                <span>VALOR TOTAL:</span>
                <span>R$ ${this.formatarMoeda(cotacao.valor_cliente || cotacao.valor_total)}</span>
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
    const num = parseFloat(valor);
    return isNaN(num) ? '0,00' : num.toFixed(2).replace('.', ',');
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

  async enviarCotacao(cliente, cotacao, generalidades, pdfPath, colaborador = null) {
    const html = this.templateCotacao(cliente, cotacao, generalidades, colaborador);
    
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
