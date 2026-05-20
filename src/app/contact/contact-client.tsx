"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { socialLinks } from "@/data/navigation";
import { submitContactMessageAction } from "@/app/contact/actions";
import { Icon } from "@/components/ui/Icons";
import { TextField } from "@/components/ui/FormField";
import styles from "@/styles/store.module.css";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export default function ContactClient() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    order: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

    if (Object.keys(nextErrors).length) return;

    setServerError(null);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("phone", values.phone);
    formData.set("subject", values.subject);
    formData.set("order", values.order);
    formData.set("message", values.message);

    startTransition(async () => {
      const result = await submitContactMessageAction(formData);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSent(true);
      setValues({
        name: "",
        email: "",
        subject: "",
        order: "",
        phone: "",
        message: "",
      });
    });
  };

  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Contact</span>
        <h1>Support that stays precise.</h1>
        <p>
          Ask about routines, ingredients, delivery, returns, or an order
          already in motion. SOO support replies with clear next steps, not
          scripted noise.
        </p>
      </section>

      <section className={styles.contactLayout}>
        <form className={styles.formPanel} onSubmit={submit} noValidate>
          {sent ? (
            <div className={styles.successBox} role="status">
              <span>
                Your message has been received. SOO support will reply by email.
              </span>
              <button
                type="button"
                className={styles.successClose}
                onClick={() => setSent(false)}
                aria-label="Dismiss confirmation"
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </div>
          ) : null}
          {serverError ? (
            <div className={styles.errorBox} role="alert">
              {serverError}
            </div>
          ) : null}
          <div className={styles.formGrid}>
            <TextField
              error={errors.name}
              label="Name"
              value={values.name}
              onChange={(value) => update("name", value)}
            />
            <TextField
              error={errors.email}
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => update("email", value)}
            />
            <TextField
              error={errors.subject}
              label="Subject"
              value={values.subject}
              placeholder="Delivery, returns, routine guidance..."
              onChange={(value) => update("subject", value)}
            />
            <TextField
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
            <button
              className={styles.primaryButton}
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Sending…" : "Send message"}
              <Icon name="arrow" />
            </button>
            <Link className={styles.secondaryButton} href="/faqs">
              View FAQs
            </Link>
          </div>
        </form>

        <aside className={styles.summaryPanel}>
          <span className={styles.eyebrow}>Support details</span>
          <Info icon="mail" title="Email" text="support@soo.example" />
          <Info icon="map" title="Hours" text="Monday to Friday, 9:00 to 17:00 SAST" />
          <div className={styles.socials}>
            <a
              href={socialLinks.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks.instagram.ariaLabel}
            >
              <Icon name="instagram" />
            </a>
            <a
              href={socialLinks.tiktok.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks.tiktok.ariaLabel}
            >
              <Icon name="tiktok" />
            </a>
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

function Info({
  icon,
  text,
  title,
}: {
  icon: "mail" | "map";
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
