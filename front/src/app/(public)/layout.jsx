import styles from './layout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.appContainer}>
      <div className={styles.mainArea}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
