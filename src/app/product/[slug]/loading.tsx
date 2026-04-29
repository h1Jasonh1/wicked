import styles from "@/app/components/Store.module.css";

export default function LoadingProduct() {
  return (
    <main className={styles.productPage} aria-label="Loading product">
      <div className={styles.productLayout}>
        <div className={styles.skeletonCard}>
          <span className={styles.skeletonBlock} />
        </div>
        <div className={styles.skeletonCard}>
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </div>
      </div>
    </main>
  );
}
