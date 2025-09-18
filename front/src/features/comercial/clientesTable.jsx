'use client'

import styles from './table.module.css'
import { useRouter } from 'next/navigation';

export function ClienteTable({ clientes = [], requestSort, sortConfig }) {   
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "⬍";
    return sortConfig.direction === "ascending" ? "⬆️" : "⬇️";
  }

  const router = useRouter();
  const handleRowClick = (clienteId) => {
    // Navega para a página de detalhes do cliente correspondente
    router.push(`/comercial/clientes/${clienteId}`);
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <button className={styles.botao} onClick={() => requestSort('nome')}>
                Nome Completo {getSortIndicator("nome")}
              </button>
            </th>
            <th>
              <button className={styles.botao} onClick={() => requestSort('email')}>
                Email {getSortIndicator("email")}
              </button>
            </th>
            <th>
              <button className={styles.botao} onClick={() => requestSort('telefone')}>
                Telefone {getSortIndicator("telefone")}
              </button>
            </th>
            <th>
              <button className={styles.botao} onClick={() => requestSort('dataCadastro')}>
                Data de Cadastro {getSortIndicator("dataCadastro")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr 
              key={cliente.id} 
              onClick={() => handleRowClick(cliente.id)} 
              className={styles.clickableRow}
            >
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefone}</td>
              <td>{cliente.dataCadastro}</td>
            </tr>
          ))}  
        </tbody>
      </table>
    </div>
  )
}
