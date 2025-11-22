import { useState } from 'react'
import { Rating } from 'react-simple-star-rating';
import styles from './DetalhesEvento.module.css'

export function DetalhesEvento({ evento, onClose, onConfirm, onDeny }) {
  if (!evento) return null // Se não tem evento n retorna nada

  const hoje = new Date()
  const eventoPassado = evento.start < hoje

  const status = evento.resource.status; 
  const concluido = evento.resource.concluido
  const valorNota = evento.resource.nota
  const valorFeedback = evento.resource.feedback

  const [view, setView] = useState('details')
  const [justificativa, setJustificativa] = useState('')


  const handleRecusarClick = () => { setView('refusing') }
  

  const [feedback, setFeedback] = useState({ nota: valorNota, comentario: valorFeedback  || '' });
  const handleFeedbackChange = (campo, valor) => {
    setFeedback(prev => ({ ...prev, [campo]: valor }));
  };

  const handleRating = (rate) => {
    setFeedback(prev => ({ ...prev, nota: rate }));
  }


  const handleEnviarFeedback = async () => {



    if (feedback.nota === 0) {
      alert("Por favor, selecione uma nota antes de enviar o feedback.");
      return;
    }

    // Simulação da Chamada à API 
    //console.log("Enviando feedback para a API:", feedback);
    //Wconsole.log("Marcando evento como concluído para o evento ID:", evento.resource.id);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        
        `http://localhost:3001/api/eventos/${evento.resource.id}/feedback`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nota: feedback.nota,
            comentario: feedback.comentario 
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao confirmar: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Marcado como Concluido:", result);
      alert('Evento marcado como Concluido!');

      onClose()
    } catch (err) {
      console.error('Erro ao confirmar evento:', err);
      alert(err.message || 'Erro ao marcar como Concluido. Tente novamente.');
    }
  };



  if (!evento) { return null }

  if (!eventoPassado) {
    return (
      <div className={styles.overlay} onClick={onClose} >

        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {view === 'details' ? (
            <>
              <h2>{evento.title}</h2>
              <p><strong>Início: </strong>{evento.start.toLocaleString('pt-BR')} </p>
              <p><strong>Fim: </strong>{evento.end.toLocaleString('pt-BR')}  </p>

              <div className={styles.actions}>
                {status === 'Pendente' && (
                  <>
                    <button onClick={handleRecusarClick} className={styles.denyButton}>Recusar</button>
                    <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
                  </>)}
              </div>
            </>
          ) : (
            <>
              <div className={styles.justificativa}>
                <p>Justificativa</p>
                <textarea className={styles.textarea} value={justificativa}
                  placeholder='Digite sua justificava, em caso de recusa'
                  onChange={(e) => setJustificativa(e.target.value)}></textarea>
              </div>

              <div className={styles.actions}>

                <button onClick={() => setView('details')} className={styles.denyButton}>Voltar</button>
                <button onClick={() => onDeny(justificativa)} className={styles.confirmButton}>Confirmar</button>
              </div>
            </>
          )


          }
          <button onClick={onClose} className={styles.closeButton}>X</button>
        </div>
      </div>


    )
  }

  // CASO O EVENTO JA TENHA ACONTECIDO, DEIXAR FEEDBACK
  else {
    return (

      <>
        <div className={styles.overlay} onClick={onClose} >

          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>


            <h2>{evento.title}</h2>
            <p><strong>Início: </strong>{evento.start.toLocaleString('pt-BR')} </p>
            <p><strong>Fim: </strong>{evento.end.toLocaleString('pt-BR')}  </p>

           
            <>
              <div className={styles.starsContainer}>
                <div className={styles.starsTitle}>
                  <p>Deixe sua Nota!(obrigatorio)</p>
                 
                </div>


                <Rating
                  onClick={handleRating} initialValue={feedback.nota}
                  size={30} fillColor='orange' emptyColor='gray'

                />
              </div>



              <div className={styles.justificativa}>
                <label>Deixe seu feedback:</label>

                <textarea className={styles.textarea} value={feedback.comentario}
                  placeholder='Escreva o que gostou, ou sugestões de melhoria.'
                  onChange={(e) => handleFeedbackChange('comentario', e.target.value)} rows={3}></textarea>
              </div>
               {!concluido && (
              <div className={styles.actions}>

                <button onClick={handleEnviarFeedback} className={styles.confirmButton}
                  disabled={feedback.nota === 0}>Marcar como concluido</button>
              </div>
              )}
            </>
            
            <button onClick={onClose} className={styles.closeButton}>X</button>
          </div>
        </div>




      </>





    )
  }
}