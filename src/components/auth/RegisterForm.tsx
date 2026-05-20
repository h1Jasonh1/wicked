"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction, type AuthFormState } from "@/app/auth/actions";

type Strength = "weak" | "fair" | "strong";

function scorePassword(value: string): Strength | null {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < 8;
  const strength = scorePassword(password);

  return (
    <main className="account-page">
      <section className="route-hero-panel">
        <span className="eyebrow">Account</span>
        <h1>Create account</h1>
        <p className="muted-text">
          Save your delivery details, track orders, and keep your wishlist
          synced with SOO.
        </p>
      </section>
      <section className="account-panel">
        <form action={formAction} className="form-grid" noValidate>
          <input type="hidden" name="next" value={next} />
          <label className="field field-full">
            <span>Full name</span>
            <input
              autoComplete="name"
              autoFocus
              className="field-input"
              name="full_name"
              required
              type="text"
            />
          </label>
          <label className="field field-full">
            <span>Email</span>
            <input
              autoComplete="email"
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
              autoComplete="new-password"
              className="field-input"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            {strength ? (
              <small className="muted-text">
                Strength: {strength}
                {tooShort ? " — at least 8 characters" : ""}
              </small>
            ) : null}
          </label>
          <label className="field field-full">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              className="field-input"
              minLength={8}
              name="confirm_password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
            />
            {passwordsMismatch ? (
              <small className="field-error">Passwords don&apos;t match.</small>
            ) : null}
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
            <button
              className="primary-button"
              disabled={pending || passwordsMismatch || tooShort}
              type="submit"
            >
              {pending ? "Creating account…" : "Create account"}
            </button>
            <Link
              className="secondary-button"
              href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            >
              I already have an account
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
