"use client";

import type { User } from "@/types/user";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import styles from "@/styles/store.module.css";

export function AddressBook({ serverUser }: { serverUser: User | null }) {
  const { currentUser } = useAuth();
  const user = currentUser ?? serverUser;

  if (!user) {
    return <AuthPromptCard title="Sign in to manage delivery addresses" />;
  }

  return (
    <section className={styles.accountPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Delivery</span>
          <h2>Saved addresses</h2>
        </div>
        <button className={styles.secondaryButton} type="button">
          Add address placeholder
        </button>
      </div>
      <div className={styles.addressGrid}>
        {user.addresses.map((address) => (
          <article className={styles.addressCard} key={address.id}>
            <strong>{address.label}</strong>
            <p>
              {address.recipientName}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.province}, {address.postalCode}
            </p>
            <span>{address.isDefault ? "Default address" : "Saved address"}</span>
          </article>
        ))}
      </div>
      <p className={styles.placeholderNote}>
        TODO(addresses): connect create, edit, delete, and default address
        actions to the customer profile backend.
      </p>
    </section>
  );
}
