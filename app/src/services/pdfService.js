const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  async gerarCotacaoPDF(cotacao, itens, cliente) {
    return new Promise((resolve, reject) => {
      try {
        // Criar pasta de cotações se não existir
        const cotacoesDir = path.join(__dirname, '../../uploads/cotacoes');
        if (!fs.existsSync(cotacoesDir)) {
          fs.mkdirSync(cotacoesDir, { recursive: true });
        }

        const filename = `cotacao-${cotacao.id}-${Date.now()}.pdf`;
        const filepath = path.join(cotacoesDir, filename);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // CABEÇALHO
        doc.fontSize(25)
           .fillColor('#1e3a8a')
           .text('NEWE', 50, 50);

        doc.fontSize(10)
           .fillColor('#666666')
           .text('Sistema de Gestão de Transportes', 50, 80);

        // Linha separadora
        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // TÍTULO
        doc.fontSize(20)
           .fillColor('#1e3a8a')
           .text('COTAÇÃO DE FRETE', 50, 120);

        doc.fontSize(10)
           .fillColor('#333333')
           .text(`Cotação Nº: ${cotacao.codigo}`, 50, 150)
           .text(`Data: ${this.formatarData(cotacao.criado_em)}`, 50, 165);

        // DADOS DO CLIENTE
        doc.fontSize(14)
           .fillColor('#1e3a8a')
           .text('Dados do Cliente', 50, 200);

        doc.fontSize(10)
           .fillColor('#333333')
           .text(`Nome: ${cliente.nome}`, 50, 220)
           .text(`Documento: ${cliente.documento}`, 50, 235)
           .text(`Email: ${cliente.email}`, 50, 250)
           .text(`Telefone: ${cliente.telefone}`, 50, 265);

        // DETALHES DO FRETE
        let y = 300;
        doc.fontSize(14)
           .fillColor('#1e3a8a')
           .text('Detalhes do Frete', 50, y);

        y += 25;

        // Tabela de itens
        doc.fontSize(10)
           .fillColor('#ffffff')
           .rect(50, y, 500, 25)
           .fill('#1e3a8a');

        doc.fillColor('#ffffff')
           .text('Descrição', 60, y + 8, { width: 250 })
           .text('Quantidade', 310, y + 8, { width: 80, align: 'center' })
           .text('Valor Unit.', 390, y + 8, { width: 80, align: 'center' })
           .text('Total', 470, y + 8, { width: 70, align: 'right' });

        y += 25;

        let subtotal = 0;

        itens.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';
          
          doc.rect(50, y, 500, 25).fill(bgColor);

          doc.fillColor('#333333')
             .text(item.descricao, 60, y + 8, { width: 240 })
             .text(item.quantidade.toString(), 310, y + 8, { width: 80, align: 'center' })
             .text(`R$ ${this.formatarMoeda(item.valor_unitario)}`, 390, y + 8, { width: 80, align: 'center' })
             .text(`R$ ${this.formatarMoeda(item.valor_total)}`, 470, y + 8, { width: 70, align: 'right' });

          subtotal += parseFloat(item.valor_total);
          y += 25;
        });

        // TOTAIS
        y += 10;

        if (cotacao.desconto > 0) {
          doc.fontSize(10)
             .fillColor('#666666')
             .text('Subtotal:', 400, y)
             .text(`R$ ${this.formatarMoeda(subtotal)}`, 470, y, { width: 70, align: 'right' });

          y += 20;

          doc.text('Desconto:', 400, y)
             .text(`-R$ ${this.formatarMoeda(cotacao.desconto)}`, 470, y, { width: 70, align: 'right' });

          y += 20;
        }

        doc.fontSize(12)
           .fillColor('#1e3a8a')
           .text('TOTAL:', 400, y, { bold: true })
           .text(`R$ ${this.formatarMoeda(cotacao.valor_total)}`, 470, y, { width: 70, align: 'right' });

        // OBSERVAÇÕES
        if (cotacao.observacoes) {
          y += 40;

          doc.fontSize(12)
             .fillColor('#1e3a8a')
             .text('Observações', 50, y);

          y += 20;

          doc.fontSize(9)
             .fillColor('#333333')
             .text(cotacao.observacoes, 50, y, { width: 500, align: 'justify' });
        }

        // RODAPÉ
        doc.fontSize(8)
           .fillColor('#999999')
           .text('Esta cotação é válida por 7 dias a partir da data de emissão.', 50, 750, { align: 'center', width: 500 })
           .text('NEWE - Sistema de Gestão de Transportes', 50, 765, { align: 'center', width: 500 });

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  formatarMoeda(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
  }
}

module.exports = new PDFService();
