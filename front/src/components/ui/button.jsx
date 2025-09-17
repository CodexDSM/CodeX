import styles from './button.module.css'


export function Button({ children, variant = 'primary' }) {
    const buttonClasses = `${styles.button} ${styles[variant]}`

  return (
    <button className={buttonClasses}>
      {children}
    </button>
  );
}


export function ButtonEstatico({ children, variant = 'Adicionar' }) {
  const buttonClasses = `${styles.ButtonEstatico} ${styles[variant]}`

return (
  <button className={buttonClasses}>
    {children}
  </button>
);
}