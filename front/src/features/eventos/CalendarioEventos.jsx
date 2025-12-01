"use client";
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DetalhesEvento } from './DetalhesEvento';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';
import styles from './CalendarioEventos.module.css';

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

export function CalendarioEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar navegação e visualização
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Inicializa a view baseado no tamanho da tela na primeira renderização
  useEffect(() => {
    const initializeView = () => {
      try {
        if (window.innerWidth <= 639) {
          setCurrentView('agenda');
        }
      } catch (e) {
        // em ambientes sem window (SSG/SSR) ignorar
      }
    };

    initializeView();
  }, []); // Dependency array vazio - executa apenas uma vez na montagem

  // Função para decodificar o JWT e pegar o userId
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Decodificar o JWT (payload é a segunda parte do token)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);
      console.log('Token decodificado:', decoded);

      return decoded.id || decoded.userId || decoded.sub;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  };

  // Função para buscar eventos do colaborador
  const fetchEventos = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Você precisa fazer login primeiro!');
      }

      const colaboradorId = getUserIdFromToken();

      if (!colaboradorId) {
        throw new Error('Não foi possível obter o ID do usuário.');
      }

      console.log('Buscando eventos para colaborador:', colaboradorId);

      const response = await fetch(
        getApiUrl(`eventos/colaborador/${colaboradorId}`),
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Eventos recebidos:', data);

      const eventosFormatados = data.map(evento => ({
        title: evento.titulo,
        vlNota: evento.local,
        start: new Date(evento.data_inicio),
        end: new Date(evento.data_fim),
        resource: evento,
      }));
      

      setEventos(eventosFormatados);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError(err.message || 'Não foi possível carregar os eventos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleSelecionarEvento = (eventoClicado) => {
    setEventoSelecionado(eventoClicado);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado(null);
  };

  const handleConfirmar = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        getApiUrl(`eventos/${eventoSelecionado.resource.id}/aceitar`),
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao confirmar: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Confirmou presença:", result);
      alert('Presença confirmada com sucesso!');

      await fetchEventos();
      fecharModal();
    } catch (err) {
      console.error('Erro ao confirmar evento:', err);
      alert(err.message || 'Erro ao confirmar presença. Tente novamente.');
    }
  };

  const handleRecusar = async (justificativa) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        getApiUrl(`eventos/${eventoSelecionado.resource.id}/recusar`),
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            justificativa_recusa: justificativa
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao recusar: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Recusou presença:", result);
      alert('Evento recusado com sucesso!');

      await fetchEventos();
      fecharModal();
    } catch (err) {
      console.error('Erro ao recusar evento:', err);
      alert(err.message || 'Erro ao recusar evento. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Carregando eventos...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        height: currentView === 'agenda' ? 'auto' : '80vh', 
        width: '100%'
      }}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          culture='pt-BR'
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora"
          }}
          view={currentView}
          date={currentDate}
          onView={(newView) => setCurrentView(newView)}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onSelectEvent={handleSelecionarEvento}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          style={{ height: '100%' }}
        />
      </div>
      

      {modalAberto && eventoSelecionado && (
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
 
