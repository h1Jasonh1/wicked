"use client";

import styles from "@/styles/store.module.css";

type TextFieldProps = {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
};

export function TextField({
  error,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        className={styles.input}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </label>
  );
}
