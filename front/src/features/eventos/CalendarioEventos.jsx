"use client";
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR'; // Para traduzir para português
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DetalhesEvento } from './DetalhesEvento';

// Configuração inicial para a biblioteca
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Dados falsos 
const mockEventosDaApi = [
  { id: 1, titulo: 'Treinamento de Segurança', data_evento: '2025-10-20T09:00:00', colaboradorId: 20 },
  { id: 2, titulo: 'Confraternização Trimestral', data_evento: '2025-10-24T18:00:00', colaboradorId: 21 },
  { id: 3, titulo: 'Confraternização Trimestral', data_evento: '2025-10-11T18:00:00', colaboradorId: 20 },
   
];

export function CalendarioEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    // aqui chamamos os dados da api
   
    const eventosFormatados = mockEventosDaApi
    //filtrar por colaborador e depois buscar os eventos
    .filter(evento => evento.colaboradorId === 20)
    .map(evento => ({
      title: evento.titulo,
      start: new Date(evento.data_evento), // Converte a string de data para um objeto Date
      end: new Date(new Date(evento.data_evento).setHours(new Date(evento.data_evento).getHours() + 4)), // Simula um evento de 2 horas
      resource: evento, // Guarda o objeto original do evento se precisar
    }));
    setEventos(eventosFormatados);
  }, []);



    // lidar com click no evento
    const handleSelecionarEvento = (eventoClicado) => {
        setEventoSelecionado(eventoClicado)
        setModalAberto(true)
    }
    const fecharModal = () => {
        setModalAberto(false)
        setEventoSelecionado(null)
    }
     const handleConfirmar = () => {
    console.log("Confirmou presença no evento:", eventoSelecionado.resource.id);
    
    fecharModal();
  };

  const handleRecusar = (justificativa) => {
    console.log("Recusou presença no evento:", justificativa, eventoSelecionado.resource.id);
    
    fecharModal();
  };

  return (
    // O calendário precisa de uma altura definida para renderizar corretamente
    <>
    <div style={{ height: '70vh' }}>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        culture='pt-BR' // 
        messages={{ // Traduz os botões
          next: "Próximo",
          previous: "Anterior",
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
        }}
        
        onSelectEvent={handleSelecionarEvento}

      />
    </div>

        {modalAberto && (
        <DetalhesEvento
          evento={eventoSelecionado}
          onClose={fecharModal}
          onConfirm={handleConfirmar}
          onDeny={handleRecusar}
        />
      )}

    </>
  );
}