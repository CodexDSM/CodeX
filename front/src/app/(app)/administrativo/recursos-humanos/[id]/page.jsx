import { testeColaboradores } from "../listaColaboradores";
import styles from './detalhe.module.css';



export default function DetalheColaboradorPage({ params }) {
  const colaboradorId = params.id;
    
  // encontra o id do colaborador
  const colaborador = testeColaboradores.find(
    (col) => col.id.toString() === colaboradorId
  );

  // Se não encontrar um colaborador com aquele ID, mostre uma mensagem
  if (!colaborador) {
    return <div>Colaborador não encontrado.</div>;
  }

  return (
    <div className={styles.container}>
        <h1 className={styles.nome}>{colaborador.nome}</h1>
      <div className={styles.infoGrid}>
        <p><strong>Departamento:</strong> {colaborador.departamento}</p>
        <p><strong>Cargo:</strong> {colaborador.cargo}</p>
        <p><strong>Data de Início:</strong> {colaborador.dataInicio}</p>
        
      </div>
    </div>
  );
}