const cron = require('node-cron');
const notificacaoService = require('./notificacaoService');

class SchedulerService {
  iniciar() {
    cron.schedule('0 5 * * *', async () => {
      console.log('Executando verificação de lembretes às 05:00...');
      await notificacaoService.processarLembretesEventos();
    });

    cron.schedule('*/15 * * * *', async () => {
      console.log('Verificando lembretes de 1 hora antes...');
      await notificacaoService.processarLembretesEventos();
    });

    console.log('Scheduler de notificações iniciado');
    console.log('- Lembretes diários: 05:00');
    console.log('- Lembretes de 1h antes: a cada 15 minutos');
  }
}

module.exports = new SchedulerService();
