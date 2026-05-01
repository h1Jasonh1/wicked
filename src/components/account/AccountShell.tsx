import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/AccountNav";
import styles from "@/styles/store.module.css";

export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.accountPage}>
      <section className={styles.routeHeroPanel}>
        <span className={styles.eyebrow}>Account</span>
        <h1>Your WICKED account</h1>
        <p className={styles.mutedText}>
          Backend-ready account surfaces for profile settings, saved delivery
          addresses, order history, wishlist access, and preferences.
        </p>
      </section>
      <div className={styles.accountLayout}>
        <AccountNav />
        <div className={styles.accountContent}>
          <div className={styles.accountContentInner}>{children}</div>
        </div>
      </div>
    </main>
  );
}
