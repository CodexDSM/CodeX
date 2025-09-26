'use client'

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import styles from './table.module.css'
import { useRouter } from 'next/navigation';

export function ClienteTable({ 
  clientes = [], 
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
  
  const handleRowClick = (clienteId) => {
    router.push(`/comercial/clientes/${clienteId}`);
  };

  const formatDocument = (doc) => {
    if (!doc) return '';
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
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

  const sortedClientes = React.useMemo(() => {
    if (!sortConfig.key) return clientes;

    return [...clientes].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'tipo_pessoa') {
        aValue = aValue === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica';
        bValue = bValue === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica';
      }
      
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
  }, [clientes, sortConfig]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando clientes...
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
                onClick={() => onSort && onSort('tipo_pessoa')}
              >
                Tipo {getSortIndicator("tipo_pessoa")}
              </button>
            </th>
            <th>
              <button 
                className={styles.botao} 
                onClick={() => onSort && onSort('documento')}
              >
                Documento {getSortIndicator("documento")}
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedClientes.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum cliente encontrado
              </td>
            </tr>
          ) : (
            sortedClientes.map((cliente) => (
              <tr 
                key={cliente.id}
                onClick={() => handleRowClick(cliente.id)} 
                style={{ cursor: 'pointer' }}
                className={styles.clickableRow}
              >
                <td>{cliente.nome}</td>
                <td>{cliente.tipo_pessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
                <td>{formatDocument(cliente.documento)}</td>
                <td>{formatPhone(cliente.telefone)}</td>
                <td>
                  <span style={{ 
                    color: cliente.ativo ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
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
