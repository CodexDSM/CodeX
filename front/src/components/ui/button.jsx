import styles from './button.module.css'


export function Button({ children, variant = 'primary' }) {
    const buttonClasses = `${styles.button} ${styles[variant]}`

  return (
    <button className={buttonClasses}>
      {children}
    </button>
  );
}