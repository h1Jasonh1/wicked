"use client";

import { useActionState, useEffect, useState } from "react";
import {
  deleteAddressAction,
  setDefaultAddressAction,
  upsertAddressAction,
  type AccountActionState,
} from "@/app/account/actions";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { useAuth } from "@/components/auth/AuthProvider";
import type { DeliveryAddress, User } from "@/types/user";
import styles from "@/styles/store.module.css";

export function AddressBook({ serverUser }: { serverUser: User | null }) {
  const { currentUser, isAuthReady } = useAuth();
  const user = currentUser ?? serverUser;

  if (!user) {
    if (!isAuthReady) {
      return <AddressSkeleton />;
    }
    return <AuthPromptCard title="Sign in to manage delivery addresses" />;
  }

  return <AddressBookEditor user={user} />;
}

function AddressSkeleton() {
  return (
    <section className={styles.accountPanel} aria-label="Loading addresses">
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
    </section>
  );
}

function AddressBookEditor({ user }: { user: User }) {
  const { refreshUser } = useAuth();
  const [editing, setEditing] = useState<DeliveryAddress | "new" | null>(null);
  const [state, formAction, pending] = useActionState<AccountActionState, FormData>(
    upsertAddressAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      setEditing(null);
      void refreshUser();
    }
  }, [refreshUser, state]);

  const editTarget = editing === "new" ? null : editing;

  return (
    <section className={styles.accountPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Delivery</span>
          <h2>Saved addresses</h2>
        </div>
        {editing ? null : (
          <button
            className={styles.secondaryButton}
            onClick={() => setEditing("new")}
            type="button"
          >
            Add address
          </button>
        )}
      </div>

      {editing ? (
        <form action={formAction} className={styles.formGrid} noValidate>
          {editTarget ? <input name="id" type="hidden" value={editTarget.id} /> : null}
          <label className={styles.field}>
            <span>Address label</span>
            <input
              className={styles.input}
              defaultValue={editTarget?.label ?? "Home"}
              name="label"
            />
          </label>
          <label className={styles.field}>
            <span>Recipient name</span>
            <input
              autoComplete="name"
              className={styles.input}
              defaultValue={editTarget?.recipientName ?? user.name}
              name="full_name"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input
              autoComplete="tel"
              className={styles.input}
              defaultValue={editTarget?.phone ?? user.phone}
              name="phone"
              type="tel"
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Address line 1</span>
            <input
              autoComplete="address-line1"
              className={styles.input}
              defaultValue={editTarget?.line1 ?? ""}
              name="address_line_1"
              required
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Address line 2 optional</span>
            <input
              autoComplete="address-line2"
              className={styles.input}
              defaultValue={editTarget?.line2 ?? ""}
              name="address_line_2"
            />
          </label>
          <label className={styles.field}>
            <span>Suburb</span>
            <input
              className={styles.input}
              defaultValue=""
              name="suburb"
            />
          </label>
          <label className={styles.field}>
            <span>City</span>
            <input
              autoComplete="address-level2"
              className={styles.input}
              defaultValue={editTarget?.city ?? ""}
              name="city"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Province</span>
            <input
              autoComplete="address-level1"
              className={styles.input}
              defaultValue={editTarget?.province ?? ""}
              name="province"
            />
          </label>
          <label className={styles.field}>
            <span>Postal code</span>
            <input
              autoComplete="postal-code"
              className={styles.input}
              defaultValue={editTarget?.postalCode ?? ""}
              name="postal_code"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Country</span>
            <input
              autoComplete="country-name"
              className={styles.input}
              defaultValue={editTarget?.country ?? "South Africa"}
              name="country"
            />
          </label>
          <label className={`${styles.fieldFull}`}>
            <input
              defaultChecked={editTarget?.isDefault ?? user.addresses.length === 0}
              name="is_default"
              type="checkbox"
            />{" "}
            Default delivery address
          </label>

          {state?.error ? (
            <div className={`${styles.errorBox} ${styles.fieldFull}`} role="alert">
              {state.error}
            </div>
          ) : null}

          <div className={`${styles.formActions} ${styles.fieldFull}`}>
            <button className={styles.primaryButton} disabled={pending} type="submit">
              {pending ? "Saving…" : "Save address"}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => setEditing(null)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!editing && user.addresses.length === 0 ? (
        // Empty state for authed users — must NOT show the sign-in card
        // (auth gate is one level up). This is the "you're in, just nothing
        // saved yet" state with a primary CTA.
        <div className={styles.emptyState}>
          <div>
            <h3>No delivery address saved yet.</h3>
            <p className={styles.mutedText}>
              Add a home or work address to speed up checkout. You can save
              multiple and pick a default.
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => setEditing("new")}
              type="button"
            >
              Add an address
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.addressGrid}>
        {user.addresses.length ? (
          user.addresses.map((address) => (
            <article className={styles.addressCard} key={address.id}>
              <strong>{address.label}</strong>
              <p>
                {address.recipientName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}
                {address.province ? `, ${address.province}` : ""}, {address.postalCode}
              </p>
              <span>{address.isDefault ? "Default address" : "Saved address"}</span>
              <div className={styles.formActions}>
                <button
                  className={styles.textButton}
                  onClick={() => setEditing(address)}
                  type="button"
                >
                  Edit
                </button>
                {address.isDefault ? null : (
                  <form
                    action={async (formData) => {
                      await setDefaultAddressAction(formData);
                      await refreshUser();
                    }}
                  >
                    <input name="id" type="hidden" value={address.id} />
                    <button className={styles.textButton} type="submit">
                      Make default
                    </button>
                  </form>
                )}
                <form
                  action={async (formData) => {
                    await deleteAddressAction(formData);
                    await refreshUser();
                  }}
                >
                  <input name="id" type="hidden" value={address.id} />
                  <button className={styles.textButton} type="submit">
                    Remove
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : null}
      </div>
    </section>
  );
}
