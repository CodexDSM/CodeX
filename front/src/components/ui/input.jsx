
import styles from './input.module.css';

export function Input({ label, type = 'text', placeholder }) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}



export function Select({ label, options = [] }) {
  return (
    <div className={styles.containerSelect}>
      <label className={styles.label}>{label}</label>

      <select className={styles.select} defaultValue="">
        <option value="" disabled>Selecione o Local</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
