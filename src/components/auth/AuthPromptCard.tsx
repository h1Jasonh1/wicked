"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import styles from "@/styles/store.module.css";

export function AuthPromptCard({
  compact = false,
  message = "Create an account to secure your cart and complete checkout.",
  onAuthenticated,
  onContinueShopping,
  title = "Account required",
}: {
  compact?: boolean;
  message?: string;
  onAuthenticated?: () => void;
  onContinueShopping?: () => void;
  title?: string;
}) {
  const { isAuthenticated, registerPlaceholder, signInPlaceholder } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  const handleSignIn = () => {
    signInPlaceholder();
    onAuthenticated?.();
  };

  const handleRegister = () => {
    registerPlaceholder();
    onAuthenticated?.();
  };

  return (
    <section
      className={`${styles.authPromptCard} ${
        compact ? styles.authPromptCardCompact : ""
      }`}
    >
      <span className={styles.eyebrow}>Account</span>
      <h3>{title}</h3>
      <p className={styles.mutedText}>{message}</p>
      <small>
        Placeholder auth only. A real provider will replace this with secure
        sessions and backend-owned account data.
      </small>
      <div className={styles.formActions}>
        <button className={styles.primaryButton} type="button" onClick={handleSignIn}>
          Sign In
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={handleRegister}
        >
          Create Account
        </button>
        {onContinueShopping ? (
          <button
            className={styles.textButton}
            type="button"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
        ) : (
          <Link className={styles.textButton} href="/shop">
            Continue Shopping
          </Link>
        )}
      </div>
    </section>
  );
}
