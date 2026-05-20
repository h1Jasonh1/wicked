"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  resendConfirmationAction,
  type AuthFormState,
} from "@/app/auth/actions";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Post-signup explainer screen. Standalone so users always know an email
 * is on the way — Supabase doesn't surface this in any UI by default.
 */
export function CheckEmailPanel({
  email,
  next,
}: {
  email: string;
  next: string;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    resendConfirmationAction,
    null,
  );
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Reacting to a useActionState result is the documented
  // external-state-transition exception. There is no onSuccess hook
  // exposed by useActionState, so the cooldown timer can only be
  // started by observing the state value change in an effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (state?.message) {
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    }
  }, [state]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const recipient = email || "your inbox";

  return (
    <main className="account-page">
      <section className="route-hero-panel">
        <span className="eyebrow">Account</span>
        <h1>Check your email</h1>
        <p className="muted-text">
          We&apos;ve sent a confirmation link to <strong>{recipient}</strong>.
          Click it to activate your SOO account. The link expires in 24
          hours, and may have landed in your spam folder.
        </p>
      </section>
      <section className="account-panel">
        <form action={formAction} className="form-grid" noValidate>
          <input name="email" type="hidden" value={email} />
          <input name="next" type="hidden" value={next} />

          {state?.error ? (
            <div className="error-box field-full" role="alert">
              {state.error}
            </div>
          ) : null}
          {state?.message ? (
            <div className="success-box field-full" role="status">
              {state.message}
            </div>
          ) : null}

          <div className="form-actions field-full">
            <button
              className="primary-button"
              disabled={pending || secondsLeft > 0 || !email}
              type="submit"
            >
              {pending
                ? "Resending…"
                : secondsLeft > 0
                  ? `Resend available in ${secondsLeft}s`
                  : "Resend confirmation email"}
            </button>
            <Link className="secondary-button" href="/auth/login">
              Back to sign in
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
