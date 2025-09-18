import { testeClientes } from './listaClientes';
import styles from './detalheClientes.module.css'

export default function DetalheClientesPage({ params }) {
  const clienteId = params.id;

  // encontra o cliente pelo id
  const cliente = testeClientes.find(
    (c) => c.id.toString() === clienteId
  );

  if (!cliente) {
    return <div>Cliente não encontrado.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.nome}>{cliente.nome}</h1>
      <div className={styles.infoGrid}>
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        <p><strong>Data de Cadastro:</strong> {cliente.dataCadastro}</p>
      </div>
    </div>
  );
}
