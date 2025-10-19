require('dotenv').config();
const emailService = require('../src/services/emailService');

async function testarEmails() {
  const colaborador = {
    nome: 'Lucas Operador',
    email: 'lucasmarins2016@gmail.com'
  };

  const evento = {
    titulo: 'Treinamento de Segurança',
    descricao: 'Treinamento obrigatório sobre procedimentos de segurança no trabalho',
    data_inicio: new Date('2025-10-20 09:00:00'),
    data_fim: new Date('2025-10-20 12:00:00'),
    local: 'Auditório Principal'
  };

  console.log('========================================');
  console.log('TESTANDO EMAILS DA NEWE');
  console.log('========================================\n');

  console.log('1️⃣  Enviando email de CONVITE...');
  const resultado1 = await emailService.enviarConviteEvento(colaborador, evento);
  if (resultado1.sucesso) {
    console.log('✅ Email de convite enviado com sucesso!\n');
  } else {
    console.log('❌ Erro:', resultado1.erro, '\n');
  }

  await aguardar(2000);

  console.log('2️⃣  Enviando email de ATUALIZAÇÃO...');
  const resultado2 = await emailService.enviarAtualizacaoEvento(colaborador, evento);
  if (resultado2.sucesso) {
    console.log('✅ Email de atualização enviado com sucesso!\n');
  } else {
    console.log('❌ Erro:', resultado2.erro, '\n');
  }

  await aguardar(2000);

  console.log('3️⃣  Enviando email de LEMBRETE - Dia Anterior...');
  const resultado3 = await emailService.enviarLembreteEvento(colaborador, evento, 'dia_anterior');
  if (resultado3.sucesso) {
    console.log('✅ Email de lembrete (dia anterior) enviado com sucesso!\n');
  } else {
    console.log('❌ Erro:', resultado3.erro, '\n');
  }

  await aguardar(2000);

  console.log('4️⃣  Enviando email de LEMBRETE - Dia do Evento...');
  const resultado4 = await emailService.enviarLembreteEvento(colaborador, evento, 'dia_evento');
  if (resultado4.sucesso) {
    console.log('✅ Email de lembrete (dia do evento) enviado com sucesso!\n');
  } else {
    console.log('❌ Erro:', resultado4.erro, '\n');
  }

  await aguardar(2000);

  console.log('5️⃣  Enviando email de LEMBRETE - 1 Hora Antes...');
  const resultado5 = await emailService.enviarLembreteEvento(colaborador, evento, 'uma_hora_antes');
  if (resultado5.sucesso) {
    console.log('✅ Email de lembrete (1 hora antes) enviado com sucesso!\n');
  } else {
    console.log('❌ Erro:', resultado5.erro, '\n');
  }

  console.log('========================================');
  console.log('TESTE CONCLUÍDO!');
  console.log('Verifique sua caixa de entrada.');
  console.log('Você deve ter recebido 5 emails:');
  console.log('  1. Convite (fundo azul NEWE)');
  console.log('  2. Atualização (fundo azul claro/ciano)');
  console.log('  3. Lembrete Dia Anterior (fundo laranja)');
  console.log('  4. Lembrete Dia do Evento (fundo azul NEWE)');
  console.log('  5. Lembrete 1 Hora Antes (fundo vermelho)');
  console.log('========================================');
  
  process.exit(0);
}

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testarEmails();
