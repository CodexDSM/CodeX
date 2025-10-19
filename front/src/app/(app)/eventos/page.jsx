
import { CalendarioEventos } from "@/features/eventos/CalendarioEventos";
import styles from "./eventos.module.css"

export default function PaginaDeEventos() {
  return (
    <div className={styles.geral}>
      <div className={styles.title}>
        <h1>Meus Eventos</h1>
        <p>Visualize seus próximos eventos no calendário.</p>
      </div> 
        {/* Renderiza o componente do calendário */}
        <CalendarioEventos />

      
    </div>
  );
}