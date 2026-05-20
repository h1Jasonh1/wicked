"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

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
  const { isAuthenticated } = useAuth();
  const pathname = usePathname() ?? "/";
  const next = encodeURIComponent(pathname);

  if (isAuthenticated) {
    return null;
  }

  return (
    <section
      className={`auth-prompt-card ${compact ? "auth-prompt-card-compact" : ""}`}
    >
      <span className="eyebrow">Account</span>
      <h3>{title}</h3>
      <p className="muted-text">{message}</p>
      <div className="form-actions">
        <Link
          className="primary-button"
          href={`/auth/login?next=${next}`}
          onClick={() => onAuthenticated?.()}
        >
          Sign In
        </Link>
        <Link
          className="secondary-button"
          href={`/auth/register?next=${next}`}
          onClick={() => onAuthenticated?.()}
        >
          Create Account
        </Link>
        {onContinueShopping ? (
          <button
            className="text-button"
            type="button"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
        ) : (
          <Link className="text-button" href="/shop">
            Continue Shopping
          </Link>
        )}
      </div>
    </section>
  );
}
