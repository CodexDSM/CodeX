'use client'

import styles from './table.module.css'
import { useRouter } from 'next/navigation';

export function ColaboradorTable({colaboradores = [], requestSort, sortConfig}) {   
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return "⬍";
        return sortConfig.direction === "ascending" ? "⬆️" : "⬇️";}

        const router = useRouter();
        const handleRowClick = (colaboradorId) => {
    // Navega para a página de detalhes do colaborador correspondente
        router.push(`/administrativo/colaboradores/${colaboradorId}`);
  };

    return(
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><button className={styles.botao} onClick={() => requestSort('nome')}>Nome Completo {getSortIndicator("nome")}</button></th>
                        <th><button className={styles.botao} onClick={() => requestSort('email')}>E-mail {getSortIndicator("email")} </button></th>
                        <th><button className={styles.botao} onClick={() => requestSort('cargo')}>Cargo {getSortIndicator("cargo")}</button></th>
                        <th><button className={styles.botao} onClick={() => requestSort('local')}>Local de Trabalho{getSortIndicator("local")}</button></th>
                       
                    </tr>
                </thead>
                <tbody>
                    {colaboradores.map((colaborador) => 
                    <tr key={colaborador.id} onClick={() => handleRowClick(colaborador.id)} className={styles.clickableRow}>
                        <td> {colaborador.nome} </td>
                        <td>{colaborador.email}</td>
                        <td>{colaborador.perfil}</td>
                        <td>{colaborador.tipo_localizacao}</td>

                    </tr>
                    )}  
                </tbody>


            </table>


        </div>

    )
    
}