"use client";

import { useActionState, useEffect, useState } from "react";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  updateProfileAction,
  type AccountActionState,
} from "@/app/account/actions";
import type { User } from "@/types/user";
import styles from "@/styles/store.module.css";

export function AccountProfileForm({ serverUser }: { serverUser: User | null }) {
  const { currentUser, isAuthReady } = useAuth();
  const user = currentUser ?? serverUser;

  if (!user) {
    if (!isAuthReady) {
      return <ProfileSkeleton />;
    }
    return <AuthPromptCard title="Sign in to edit your profile" />;
  }

  return <AccountProfileEditor key={user.id} user={user} />;
}

function ProfileSkeleton() {
  return (
    <section className={styles.accountPanel} aria-label="Loading profile">
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
    </section>
  );
}

function AccountProfileEditor({ user }: { user: User }) {
  const { refreshUser } = useAuth();
  const [state, formAction, pending] = useActionState<AccountActionState, FormData>(
    updateProfileAction,
    null,
  );

  // Controlled state for the toggles + phone so we can:
  //  - disable the SMS marketing toggle until a phone number is saved
  //  - guarantee what the user sees in the UI is what we send to the
  //    server action (avoids the "I toggled it but it didn't save" report)
  const [phone, setPhone] = useState(user.phone);
  const [marketingEmails, setMarketingEmails] = useState(
    user.preferences.marketingEmails,
  );
  const [orderSmsUpdates, setOrderSmsUpdates] = useState(
    user.preferences.orderSmsUpdates,
  );

  const phoneSaved = (user.phone ?? "").trim().length > 0;

  useEffect(() => {
    if (state?.success) {
      void refreshUser();
    }
  }, [refreshUser, state]);

  // If a user clears their phone number, force the SMS preference back off
  // before submit so we never store "SMS opt-in with no phone".
  const effectiveSms = phone.trim().length > 0 ? orderSmsUpdates : false;

  return (
    <form action={formAction} className={styles.accountPanel} noValidate>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Profile</span>
          <h2>Edit account details</h2>
        </div>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Full name</span>
          <input
            autoComplete="name"
            className={styles.input}
            defaultValue={user.name}
            name="full_name"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Email address</span>
          <input
            autoComplete="email"
            className={styles.input}
            defaultValue={user.email}
            disabled
            name="email"
            type="email"
          />
        </label>

        <label className={styles.field}>
          <span>Phone number</span>
          <input
            autoComplete="tel"
            className={styles.input}
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+27 82 555 0140"
            type="tel"
            value={phone}
          />
        </label>

        <fieldset className={`${styles.formFieldset} ${styles.fieldFull}`}>
          <legend>Marketing preferences</legend>
          <label>
            <input
              checked={marketingEmails}
              name="marketing_emails"
              onChange={(event) => setMarketingEmails(event.target.checked)}
              type="checkbox"
            />
            Marketing emails — product launches, restocks, offers
          </label>
          <label
            aria-disabled={!phoneSaved || undefined}
            style={
              phoneSaved
                ? undefined
                : { opacity: 0.55, cursor: "not-allowed" }
            }
          >
            <input
              checked={effectiveSms}
              disabled={!phoneSaved}
              name="order_sms_updates"
              onChange={(event) => setOrderSmsUpdates(event.target.checked)}
              type="checkbox"
            />
            SMS marketing — flash offers and limited drops
          </label>
          {!phoneSaved ? (
            <small className={styles.mutedText}>
              Add a phone number above and save to enable SMS marketing.
            </small>
          ) : null}
        </fieldset>
      </div>

      {state?.error ? (
        <div className={styles.errorBox} role="alert">
          {state.error}
        </div>
      ) : null}
      {state?.success ? (
        <div className={styles.successBox} role="status">
          {state.success}
        </div>
      ) : null}

      <button className={styles.primaryButton} disabled={pending} type="submit">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
