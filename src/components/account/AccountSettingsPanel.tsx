"use client";

import { useTransition } from "react";
import type { User } from "@/types/user";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import styles from "@/styles/store.module.css";

export function AccountSettingsPanel({ serverUser }: { serverUser: User | null }) {
  const { currentUser, isAuthReady, signOut } = useAuth();
  const [pending, startTransition] = useTransition();
  const user = currentUser ?? serverUser;

  if (!user) {
    if (!isAuthReady) {
      return (
        <section className={styles.accountPanel} aria-label="Loading settings">
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </section>
      );
    }
    return <AuthPromptCard title="Sign in to manage account settings" />;
  }

  return (
    <section className={styles.accountPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Settings</span>
          <h2>Account settings</h2>
        </div>
        <button
          className={styles.textButton}
          disabled={pending}
          onClick={() => startTransition(() => signOut())}
          type="button"
        >
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
      <div className={styles.preferenceGrid}>
        <span>
          Marketing emails: {user.preferences.marketingEmails ? "On" : "Off"}
        </span>
        <span>
          SMS marketing: {user.preferences.orderSmsUpdates ? "On" : "Off"}
        </span>
      </div>
      <p className={styles.placeholderNote}>
        Update marketing preferences from the Profile tab. Notification
        controls and security options will live here as the account features
        expand.
      </p>
    </section>
  );
}
