"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import styles from "@/app/components/Store.module.css";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export default function ContactClient() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    order: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Enter your name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.subject.trim()) {
      nextErrors.subject = "Choose a subject for support.";
    }

    if (values.message.trim().length < 12) {
      nextErrors.message = "Add a little more detail so support can help.";
    }

    setErrors(nextErrors);

    if (!Object.keys(nextErrors).length) {
      setSent(true);
      setValues({
        name: "",
        email: "",
        subject: "",
        order: "",
        message: "",
      });
    }
  };

  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Contact</span>
        <h1>Support that stays precise.</h1>
        <p>
          Ask about routines, ingredients, delivery, returns, or an order
          already in motion. WICKED support replies with clear next steps, not
          scripted noise.
        </p>
      </section>

      <section className={styles.contactLayout}>
        <form className={styles.formPanel} onSubmit={submit} noValidate>
          {sent ? (
            <div className={styles.successBox} role="status">
              Your message has been received. A support reply would be sent to
              your email next.
            </div>
          ) : null}
          <div className={styles.formGrid}>
            <Field
              error={errors.name}
              label="Name"
              value={values.name}
              onChange={(value) => update("name", value)}
            />
            <Field
              error={errors.email}
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => update("email", value)}
            />
            <Field
              error={errors.subject}
              label="Subject"
              value={values.subject}
              placeholder="Delivery, returns, routine guidance..."
              onChange={(value) => update("subject", value)}
            />
            <Field
              label="Order number optional"
              value={values.order}
              placeholder="WCK-1048"
              onChange={(value) => update("order", value)}
            />
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Message</span>
              <textarea
                className={styles.textarea}
                value={values.message}
                placeholder="Tell us your skin goal, routine question, or order issue."
                aria-invalid={Boolean(errors.message)}
                onChange={(event) => update("message", event.target.value)}
              />
              {errors.message ? (
                <span className={styles.fieldError}>{errors.message}</span>
              ) : null}
            </label>
          </div>
          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit">
              Send message
              <Icon name="arrow" />
            </button>
            <Link className={styles.secondaryButton} href="/faqs">
              View FAQs
            </Link>
          </div>
        </form>

        <aside className={styles.summaryPanel}>
          <span className={styles.eyebrow}>Support details</span>
          <Info icon="mail" title="Email" text="support@wicked.example" />
          <Info icon="phone" title="Phone" text="+27 82 555 0140" />
          <Info icon="map" title="Hours" text="Monday to Friday, 9:00 to 17:00 SAST" />
          <div className={styles.socials}>
            <Link href="/contact" aria-label="Instagram">
              <Icon name="instagram" />
            </Link>
            <Link href="/contact" aria-label="TikTok">
              <Icon name="tiktok" />
            </Link>
            <Link href="/contact" aria-label="Facebook">
              <Icon name="facebook" />
            </Link>
            <Link href="/contact" aria-label="X">
              <Icon name="x" />
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Field({
  error,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        className={styles.input}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </label>
  );
}

function Info({
  icon,
  text,
  title,
}: {
  icon: "mail" | "phone" | "map";
  text: string;
  title: string;
}) {
  return (
    <div className={styles.infoCard}>
      <Icon name={icon} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
