import type { ReactNode } from "react";
import styles from "@/styles/store.module.css";

export function SectionHeading({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      {children}
    </div>
  );
}
