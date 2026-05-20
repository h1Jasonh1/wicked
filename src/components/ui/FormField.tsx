"use client";

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
    <label className="field">
      <span>{label}</span>
      <input
        className="field-input"
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
