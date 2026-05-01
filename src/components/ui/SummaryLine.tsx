import styles from "@/styles/store.module.css";

export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
