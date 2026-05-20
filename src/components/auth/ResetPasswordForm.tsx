"use client";

import { useActionState, useState } from "react";
import {
  updatePasswordAction,
  type AuthFormState,
} from "@/app/auth/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updatePasswordAction,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="account-page">
      <section className="route-hero-panel">
        <span className="eyebrow">Account</span>
        <h1>Set a new password</h1>
        <p className="muted-text">
          Pick something at least 8 characters long. You&apos;ll be signed in
          to your account once it&apos;s saved.
        </p>
      </section>
      <section className="account-panel">
        <form action={formAction} className="form-grid" noValidate>
          <label className="field field-full">
            <span>New password</span>
            <input
              autoComplete="new-password"
              autoFocus
              className="field-input"
              minLength={8}
              name="password"
              required
              type={showPassword ? "text" : "password"}
            />
          </label>
          <label className="field field-full">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              className="field-input"
              minLength={8}
              name="confirm_password"
              required
              type={showPassword ? "text" : "password"}
            />
          </label>
          <label className="field-full">
            <input
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              type="checkbox"
            />{" "}
            Show password
          </label>

          {state?.error ? (
            <div className="error-box field-full" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="form-actions field-full">
            <button className="primary-button" disabled={pending} type="submit">
              {pending ? "Saving…" : "Save new password"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
