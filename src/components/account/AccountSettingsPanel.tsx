"use client";

import type { User } from "@/types/user";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import styles from "@/styles/store.module.css";

export function AccountSettingsPanel({ serverUser }: { serverUser: User | null }) {
  const { currentUser, logoutPlaceholder } = useAuth();
  const user = currentUser ?? serverUser;

  if (!user) {
    return <AuthPromptCard title="Sign in to manage account settings" />;
  }

  return (
    <section className={styles.accountPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Settings</span>
          <h2>Account settings</h2>
        </div>
        <button className={styles.textButton} type="button" onClick={logoutPlaceholder}>
          Logout placeholder
        </button>
      </div>
      <div className={styles.preferenceGrid}>
        <span>Marketing emails: {user.preferences.marketingEmails ? "On" : "Off"}</span>
        <span>SMS order updates: {user.preferences.orderSmsUpdates ? "On" : "Off"}</span>
      </div>
      <p className={styles.placeholderNote}>
        Profile fields now live under Profile. This settings page is reserved
        for account-level preferences, notification controls, and security
        actions once the real auth provider is connected.
      </p>
    </section>
  );
}
