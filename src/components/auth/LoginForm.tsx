"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  resendConfirmationAction,
  signInAction,
  type AuthFormState,
} from "@/app/auth/actions";

const RESEND_COOLDOWN_SECONDS = 60;

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    null,
  );
  const [resendState, resendAction, resendPending] = useActionState<
    AuthFormState,
    FormData
  >(resendConfirmationAction, null);

  const [showPassword, setShowPassword] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Reacting to a useActionState result is the documented
  // external-state-transition exception. There is no onSuccess hook
  // exposed by useActionState, so the cooldown timer can only be
  // started by observing the state value change in an effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (resendState?.message) setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }, [resendState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  return (
    <main className="account-page">
      <section className="route-hero-panel">
        <span className="eyebrow">Account</span>
        <h1>Sign in</h1>
        <p className="muted-text">
          Welcome back. Sign in to continue your SOO routine.
        </p>
      </section>
      <section className="account-panel">
        <form action={formAction} className="form-grid" noValidate>
          <input type="hidden" name="next" value={next} />
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
          <label className="field field-full">
            <span>Password</span>
            <input
              autoComplete="current-password"
              className="field-input"
              name="password"
              required
              type={showPassword ? "text" : "password"}
            />
          </label>
          <div className="field-full flex flex-wrap items-center justify-between gap-2">
            <label>
              <input
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                type="checkbox"
              />{" "}
              Show password
            </label>
            <Link className="text-button" href="/auth/forgot-password">
              Forgot password?
            </Link>
          </div>

          {state?.error ? (
            <div className="error-box field-full" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="form-actions field-full">
            <button className="primary-button" disabled={pending} type="submit">
              {pending ? "Signing in…" : "Sign in"}
            </button>
            <Link
              className="secondary-button"
              href={`/auth/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            >
              Create account
            </Link>
          </div>
        </form>

        {/* Email-not-confirmed recovery: posted as a SECOND form so it
            doesn't accidentally re-trigger the sign-in action. */}
        {state?.needsConfirmation && state.email ? (
          <form action={resendAction} className="form-grid mt-4" noValidate>
            <input name="email" type="hidden" value={state.email} />
            <input name="next" type="hidden" value={next} />
            {resendState?.message ? (
              <div className="success-box field-full" role="status">
                {resendState.message}
              </div>
            ) : null}
            {resendState?.error ? (
              <div className="error-box field-full" role="alert">
                {resendState.error}
              </div>
            ) : null}
            <div className="form-actions field-full">
              <button
                className="secondary-button"
                disabled={resendPending || secondsLeft > 0}
                type="submit"
              >
                {resendPending
                  ? "Resending…"
                  : secondsLeft > 0
                    ? `Resend available in ${secondsLeft}s`
                    : "Resend confirmation email"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}
