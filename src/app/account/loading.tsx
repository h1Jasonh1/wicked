import styles from "@/styles/store.module.css";

export default function AccountLoading() {
  return (
    <section className={styles.accountPanel} aria-label="Loading account">
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
    </section>
  );
}
