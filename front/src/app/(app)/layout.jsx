
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header'; 
import styles from './layout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
      
        {children}
      </main>
    </div>
  );
}