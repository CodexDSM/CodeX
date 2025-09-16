'use client';

import styles from './input.module.css';

export function Input({ label, type = 'text', placeholder, value, onChange, required, inputMode, maxLength }) { 
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        maxLength={maxLength}
      />
    </div>
  );
}
