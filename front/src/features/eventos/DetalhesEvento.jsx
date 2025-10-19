import { useState } from 'react'
import { Rating } from 'react-simple-star-rating';
import styles from './DetalhesEvento.module.css'

export function DetalhesEvento({evento, onClose, onConfirm, onDeny}) {
    if (!evento) return null // Se não tem evento n retorna nada

    const[view, setView] = useState('details')
    const[justificativa, setJustificativa] = useState('')

    
    const handleRecusarClick = () => { setView('refusing') }
    const hoje= new Date()

    const [feedback, setFeedback] = useState({ nota: 0, comentario: '' });
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
  console.log("Enviando feedback para a API:", feedback);
  console.log("Marcando evento como concluído para o evento ID:", evento.resource.id); 

  try {
    alert("Obrigado pelo seu feedback!");
    onClose(); 

  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    alert("Houve um erro ao enviar seu feedback. Tente novamente.");
  }
};

    const eventoPassado = evento.start < hoje


    if (!evento) {return null}

    if (!eventoPassado) {
    return (
        <div className={styles.overlay} onClick={onClose} >

            <div className={styles.modal} onClick={(e) => e.stopPropagation() }>
                {view === 'details' ? ( 
               <>
                <h2>{evento.title}</h2>
                <p><strong>Início: </strong>{evento.start.toLocaleString('pt-BR')} </p>
                <p><strong>Fim: </strong>{evento.end.toLocaleString('pt-BR')}  </p>

            <div className={styles.actions}>
                
                <button onClick={handleRecusarClick} className={styles.denyButton}>Recusar</button>
                <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
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
    else{
    return(
    
            <>
            <div className={styles.overlay} onClick={onClose} >

            <div className={styles.modal} onClick={(e) => e.stopPropagation() }>
               
               
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
                  size={30} fillColor='orange'   emptyColor='gray'
                  
                />
                </div>
                
               

            <div className={styles.justificativa}>
                <label>Deixe seu feedback:</label> 

                <textarea className={styles.textarea} value={feedback.comentario}
                 placeholder='Escreva o que gostou, ou sugestões de melhoria.'
                 onChange={(e) => handleFeedbackChange('comentario', e.target.value)} rows={3}></textarea>
            </div>

             <div className={styles.actions}>
                
                <button onClick={handleEnviarFeedback} className={styles.confirmButton}
                disabled= {feedback.nota === 0}>Marcar como concluido</button>
            </div>
            </>
            <button onClick={onClose} className={styles.closeButton}>X</button>
            </div>
            </div>
            
            
            
            
            </>
            
           
            
            
            
    )}
}