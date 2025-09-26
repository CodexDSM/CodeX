'use client'

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import styles from './table.module.css'
import { useRouter } from 'next/navigation';

export function ColaboradorTable({ 
  colaboradores = [], 
  onSort, 
  sortConfig,
  loading = false
}) {   
  const getSortIndicator = (key) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown size={16} className="inline ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? 
      <ChevronUp size={16} className="inline ml-1 text-blue-600" /> : 
      <ChevronDown size={16} className="inline ml-1 text-blue-600" />;
  }

  const router = useRouter();
  
  const handleRowClick = (colaboradorId) => {
    router.push(`/administrativo/colaboradores/${colaboradorId}`);
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const sortedColaboradores = React.useMemo(() => {
    if (!sortConfig.key) return colaboradores;

    return [...colaboradores].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [colaboradores, sortConfig]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando colaboradores...
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
                onClick={() => onSort && onSort('nome')}
              >
                Nome {getSortIndicator("nome")}
              </button>
            </th>
            <th>
              <button 
                className={styles.botao} 
                onClick={() => onSort && onSort('perfil')}
              >
                Perfil {getSortIndicator("perfil")}
              </button>
            </th>
            <th>
              <button 
                className={styles.botao} 
                onClick={() => onSort && onSort('cpf')}
              >
                CPF {getSortIndicator("cpf")}
              </button>
            </th>
            <th>
              <button 
                className={styles.botao} 
                onClick={() => onSort && onSort('telefone')}
              >
                Telefone {getSortIndicator("telefone")}
              </button>
            </th>
            <th>
              <button 
                className={styles.botao} 
                onClick={() => onSort && onSort('tipo_localizacao')}
              >
                Local Trabalho {getSortIndicator("tipo_localizacao")}
              </button>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedColaboradores.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum colaborador encontrado
              </td>
            </tr>
          ) : (
            sortedColaboradores.map((colaborador) => (
              <tr 
                key={colaborador.id}
                onClick={() => handleRowClick(colaborador.id)} 
                style={{ cursor: 'pointer' }}
                className={styles.clickableRow}
              >
                <td>{colaborador.nome}</td>
                <td>{colaborador.perfil}</td>
                <td>{formatCPF(colaborador.cpf)}</td>
                <td>{formatPhone(colaborador.telefone)}</td>
                <td>{colaborador.tipo_localizacao || 'Não definido'}</td>
                <td>
                  <span style={{ 
                    color: colaborador.ativo ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {colaborador.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
