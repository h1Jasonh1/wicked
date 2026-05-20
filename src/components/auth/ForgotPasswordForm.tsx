"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type AuthFormState,
} from "@/app/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordResetAction,
    null,
  );

  // Once the email has been requested, the form pivots to a confirmation
  // panel rather than letting the user spam the request endpoint.
  const sent = Boolean(state?.message);

  return (
    <main className="account-page">
      <section className="route-hero-panel">
        <span className="eyebrow">Account</span>
        <h1>{sent ? "Reset link sent" : "Reset your password"}</h1>
        <p className="muted-text">
          {sent
            ? "Check your email and click the link to set a new password. The link expires in one hour."
            : "Enter the email associated with your SOO account and we'll send a secure reset link."}
        </p>
      </section>
      <section className="account-panel">
        {sent ? (
          <div className="form-grid">
            <div className="success-box field-full" role="status">
              {state?.message}
            </div>
            <div className="form-actions field-full">
              <Link className="secondary-button" href="/auth/login">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form action={formAction} className="form-grid" noValidate>
            <label className="field field-full">
              <span>Email</span>
              <input
                autoComplete="email"
                autoFocus
                className="field-input"
                inputMode="email"
                name="email"
                required
                type="email"
              />
            </label>

            {state?.error ? (
              <div className="error-box field-full" role="alert">
                {state.error}
              </div>
            ) : null}

            <div className="form-actions field-full">
              <button className="primary-button" disabled={pending} type="submit">
                {pending ? "Sending…" : "Send reset link"}
              </button>
              <Link className="secondary-button" href="/auth/login">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
