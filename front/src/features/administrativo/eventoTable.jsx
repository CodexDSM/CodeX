'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import styles from './table.module.css';
import { useRouter } from 'next/navigation';

export function EventoTable({ 
  eventos = [], 
  onSort, 
  sortConfig, 
  loading = false 
}) {

  const router = useRouter();

  const getSortIndicator = (key) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown size={16} className="inline ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? 
      <ChevronUp size={16} className="inline ml-1 text-blue-600" /> : 
      <ChevronDown size={16} className="inline ml-1 text-blue-600" />;
  };

  const handleRowClick = (eventoId) => {
    router.push(`/administrativo/eventos/${eventoId}`);
  };

  // Função para formatar data de forma amigável
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const sortedEventos = React.useMemo(() => {
    if (!sortConfig?.key) return eventos;

    return [...eventos].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [eventos, sortConfig]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando eventos...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <button
                className={styles.botao}
                onClick={() => onSort && onSort('titulo')}
              >
                Título {getSortIndicator('titulo')}
              </button>
            </th>
            <th>
              <button
                className={styles.botao}
                onClick={() => onSort && onSort('status')}
              >
                Status {getSortIndicator('status')}
              </button>
            </th>
            <th>
              <button
                className={styles.botao}
                onClick={() => onSort && onSort('data_inicio')}
              >
                Data de Início {getSortIndicator('data_inicio')}
              </button>
            </th>
            <th>
              <button
                className={styles.botao}
                onClick={() => onSort && onSort('data_fim')}
              >
                Data de Término {getSortIndicator('data_fim')}
              </button>
            </th>
            <th>
              <button
                className={styles.botao}
                onClick={() => onSort && onSort('local')}
              >
                Local {getSortIndicator('local')}
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedEventos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum evento encontrado
              </td>
            </tr>
          ) : (
            sortedEventos.map((evento) => (
              <tr
                key={evento.id}
                onClick={() => handleRowClick(evento.id)}
                style={{ cursor: 'pointer' }}
                className={styles.clickableRow}
              >
                <td>{evento.titulo}</td>
                <td>
                  <span style={{ 
                    color: evento.status === 'Ativo' ? 'green' : 
                           evento.status === 'Encerrado' ? 'gray' : 
                           'red',
                    fontWeight: 'bold' 
                  }}>
                    {evento.status || '—'}
                  </span>
                </td>
                <td>{formatDate(evento.data_inicio)}</td>
                <td>{formatDate(evento.data_fim)}</td>
                <td>{evento.local || 'Não definido'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
