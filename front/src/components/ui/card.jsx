
import styles from './card.module.css';

export function Card({ children }) {
  return (
    <div className={styles.card}>
      {children}
    </div>
  );
}