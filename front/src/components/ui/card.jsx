
import styles from './card.module.css';

export function Card({ children }) {
  return (
    <div className={styles.card}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return (
    <div className={styles.cardContent}>
      {children}
    </div>
  );
}