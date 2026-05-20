import styles from "@/styles/store.module.css";

export default function ShopLoading() {
  return (
    <main className={styles.shopPage} aria-label="Loading shop">
      <div className={styles.shopProductGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <article className={styles.skeletonCard} key={index}>
            <span className={styles.skeletonBlock} />
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLine} />
          </article>
        ))}
      </div>
    </main>
  );
}
