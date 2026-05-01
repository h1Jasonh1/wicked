"use client";

import { type FormEvent, useState } from "react";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { useAuth } from "@/components/auth/AuthProvider";
import type { User } from "@/types/user";
import styles from "@/styles/store.module.css";

type ProfileFormValues = {
  deliveryCity: string;
  deliveryCountry: string;
  deliveryLabel: string;
  deliveryLine1: string;
  deliveryLine2: string;
  deliveryPhone: string;
  deliveryPostalCode: string;
  deliveryProvince: string;
  deliveryRecipientName: string;
  email: string;
  marketingEmails: boolean;
  name: string;
  newPassword: string;
  orderSmsUpdates: boolean;
  phone: string;
};

type ProfileFormErrors = Partial<
  Record<
    | "deliveryCity"
    | "deliveryLine1"
    | "deliveryPostalCode"
    | "email"
    | "name"
    | "newPassword"
    | "phone",
    string
  >
>;

type SaveStatus = {
  message: string;
  type: "error" | "success";
} | null;

function getInitialProfileValues(user: User | null): ProfileFormValues {
  const defaultAddress = user?.addresses.find((address) => address.isDefault);

  return {
    deliveryCity: defaultAddress?.city ?? "",
    deliveryCountry: defaultAddress?.country ?? "South Africa",
    deliveryLabel: defaultAddress?.label ?? "Home",
    deliveryLine1: defaultAddress?.line1 ?? "",
    deliveryLine2: defaultAddress?.line2 ?? "",
    deliveryPhone: defaultAddress?.phone ?? user?.phone ?? "",
    deliveryPostalCode: defaultAddress?.postalCode ?? "",
    deliveryProvince: defaultAddress?.province ?? "",
    deliveryRecipientName: defaultAddress?.recipientName ?? user?.name ?? "",
    email: user?.email ?? "",
    marketingEmails: user?.preferences.marketingEmails ?? true,
    name: user?.name ?? "",
    newPassword: "",
    orderSmsUpdates: user?.preferences.orderSmsUpdates ?? true,
    phone: user?.phone ?? "",
  };
}

function validateProfile(values: ProfileFormValues) {
  const nextErrors: ProfileFormErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "Enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 9) {
    nextErrors.phone = "Enter a complete phone number.";
  }

  if (values.newPassword && values.newPassword.length < 8) {
    nextErrors.newPassword = "Use at least 8 characters for password changes.";
  }

  if (!values.deliveryLine1.trim()) {
    nextErrors.deliveryLine1 = "Enter a delivery address line.";
  }

  if (!values.deliveryCity.trim()) {
    nextErrors.deliveryCity = "Enter a delivery city.";
  }

  if (!values.deliveryPostalCode.trim()) {
    nextErrors.deliveryPostalCode = "Enter a postal code.";
  }

  return nextErrors;
}

export function AccountProfileForm({ serverUser }: { serverUser: User | null }) {
  const { currentUser } = useAuth();
  const user = currentUser ?? serverUser;

  if (!user) {
    return <AuthPromptCard title="Sign in to edit your profile" />;
  }

  return <AccountProfileEditor key={user.id} user={user} />;
}

function AccountProfileEditor({ user }: { user: User }) {
  const [values, setValues] = useState(() => getInitialProfileValues(user));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);

  const updateValue = <Key extends keyof ProfileFormValues>(
    key: Key,
    value: ProfileFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveStatus(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateProfile(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setSaveStatus({
        type: "error",
        message: "Please fix the highlighted profile fields before saving.",
      });
      return;
    }

    // TODO(auth): Persist profile updates through the authenticated customer
    // profile API. Password changes should use the auth provider's secure flow.
    setSaveStatus({
      type: "success",
      message:
        "Profile changes validated locally. A real account API will save these later.",
    });
  };

  return (
    <form className={styles.accountPanel} noValidate onSubmit={handleSubmit}>
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
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={styles.input}
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
          />
          {errors.name ? (
            <span className={styles.fieldError}>{errors.name}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Email address</span>
          <input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={styles.input}
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
          />
          {errors.email ? (
            <span className={styles.fieldError}>{errors.email}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Phone number</span>
          <input
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            className={styles.input}
            type="tel"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
          />
          {errors.phone ? (
            <span className={styles.fieldError}>{errors.phone}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Change password placeholder</span>
          <input
            aria-invalid={Boolean(errors.newPassword)}
            autoComplete="new-password"
            className={styles.input}
            placeholder="New password"
            type="password"
            value={values.newPassword}
            onChange={(event) => updateValue("newPassword", event.target.value)}
          />
          {errors.newPassword ? (
            <span className={styles.fieldError}>{errors.newPassword}</span>
          ) : null}
        </label>

        <div className={`${styles.accountFormSection} ${styles.fieldFull}`}>
          <div>
            <span className={styles.eyebrow}>Delivery address</span>
            <h3>Default delivery details</h3>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Address label</span>
              <input
                autoComplete="address-level4"
                className={styles.input}
                value={values.deliveryLabel}
                onChange={(event) =>
                  updateValue("deliveryLabel", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Recipient name</span>
              <input
                autoComplete="name"
                className={styles.input}
                value={values.deliveryRecipientName}
                onChange={(event) =>
                  updateValue("deliveryRecipientName", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Delivery phone</span>
              <input
                autoComplete="tel"
                className={styles.input}
                type="tel"
                value={values.deliveryPhone}
                onChange={(event) =>
                  updateValue("deliveryPhone", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Address line 1</span>
              <input
                aria-invalid={Boolean(errors.deliveryLine1)}
                autoComplete="address-line1"
                className={styles.input}
                value={values.deliveryLine1}
                onChange={(event) =>
                  updateValue("deliveryLine1", event.target.value)
                }
              />
              {errors.deliveryLine1 ? (
                <span className={styles.fieldError}>{errors.deliveryLine1}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Address line 2 optional</span>
              <input
                autoComplete="address-line2"
                className={styles.input}
                value={values.deliveryLine2}
                onChange={(event) =>
                  updateValue("deliveryLine2", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>City</span>
              <input
                aria-invalid={Boolean(errors.deliveryCity)}
                autoComplete="address-level2"
                className={styles.input}
                value={values.deliveryCity}
                onChange={(event) =>
                  updateValue("deliveryCity", event.target.value)
                }
              />
              {errors.deliveryCity ? (
                <span className={styles.fieldError}>{errors.deliveryCity}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Province</span>
              <input
                autoComplete="address-level1"
                className={styles.input}
                value={values.deliveryProvince}
                onChange={(event) =>
                  updateValue("deliveryProvince", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Postal code</span>
              <input
                aria-invalid={Boolean(errors.deliveryPostalCode)}
                autoComplete="postal-code"
                className={styles.input}
                value={values.deliveryPostalCode}
                onChange={(event) =>
                  updateValue("deliveryPostalCode", event.target.value)
                }
              />
              {errors.deliveryPostalCode ? (
                <span className={styles.fieldError}>
                  {errors.deliveryPostalCode}
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Country</span>
              <input
                autoComplete="country-name"
                className={styles.input}
                value={values.deliveryCountry}
                onChange={(event) =>
                  updateValue("deliveryCountry", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <fieldset className={`${styles.formFieldset} ${styles.fieldFull}`}>
          <legend>Account preferences</legend>
          <label>
            <input
              checked={values.marketingEmails}
              type="checkbox"
              onChange={(event) =>
                updateValue("marketingEmails", event.target.checked)
              }
            />
            Marketing emails
          </label>
          <label>
            <input
              checked={values.orderSmsUpdates}
              type="checkbox"
              onChange={(event) =>
                updateValue("orderSmsUpdates", event.target.checked)
              }
            />
            SMS order updates
          </label>
        </fieldset>
      </div>

      <p className={styles.placeholderNote}>
        Placeholder profile form only. Secure account details will be saved by
        the backend account API later.
      </p>

      {saveStatus ? (
        <div
          className={
            saveStatus.type === "success" ? styles.successBox : styles.errorBox
          }
          role="status"
        >
          {saveStatus.message}
        </div>
      ) : null}

      <button className={styles.primaryButton} type="submit">
        Save changes
      </button>
    </form>
  );
}
