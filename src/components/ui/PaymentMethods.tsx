import styles from "@/styles/store.module.css";

export function PaymentMethods() {
  return (
    <div className={styles.payments} aria-label="Accepted payments">
      <span className={`${styles.paymentBadge} ${styles.paymentVisa}`} aria-label="Visa" role="img">
        <VisaLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentMastercard}`} aria-label="Mastercard" role="img">
        <MastercardLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentApple}`} aria-label="Apple Pay" role="img">
        <ApplePayLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentGoogle}`} aria-label="Google Pay" role="img">
        <GooglePayLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentPaypal}`} aria-label="PayPal" role="img">
        <PaypalLogo />
      </span>
    </div>
  );
}

function VisaLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 86 28" aria-hidden="true" focusable="false">
      <path fill="#f4f2ff" d="M17.3 20.3H13L9.7 8H14l1.4 6.6L19.1 8h4.2l-6 12.3Z" />
      <path fill="#f4f2ff" d="M24.5 8h4l-2.4 12.3h-4L24.5 8Z" />
      <path
        fill="#f4f2ff"
        d="M39.5 8.4a11 11 0 0 0-3.5-.6c-3.9 0-6.5 1.9-6.5 4.6 0 2 1.9 3.1 3.3 3.8 1.5.7 2 1.2 2 1.8 0 .9-1.2 1.3-2.3 1.3a8.4 8.4 0 0 1-3.7-.8l-.5-.2-.6 3.1c.9.4 2.7.8 4.5.8 4.1 0 6.7-1.9 6.7-4.8 0-1.6-1-2.8-3.3-3.8-1.4-.7-2.2-1.1-2.2-1.7 0-.6.7-1.2 2.2-1.2a7 7 0 0 1 2.9.5l.4.2.6-3Z"
      />
      <path
        fill="#f4f2ff"
        d="M50 8h3.1l3.2 12.3h-3.7l-.5-1.9h-5.1l-.9 1.9H42L48 9.1c.4-.7 1-1.1 2-1.1Zm.4 4-2 4.2h3l-1-4.2Z"
      />
      <path fill="#d6bf8d" d="M14 8h9.3l-1 2.1h-8.9L14 8Z" opacity=".9" />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 70 34" aria-hidden="true" focusable="false">
      <circle cx="28" cy="17" r="12.5" fill="#ea5a4e" />
      <circle cx="42" cy="17" r="12.5" fill="#f3ba4d" />
      <path fill="#e68c49" d="M35 7.1a12.5 12.5 0 0 1 0 19.8 12.5 12.5 0 0 1 0-19.8Z" />
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 90 32" aria-hidden="true" focusable="false">
      <path
        fill="#f8f4ec"
        d="M21.7 15.1c0-2.9 2.4-4.3 2.5-4.4-1.3-2-3.4-2.2-4.1-2.3-1.8-.2-3.4 1-4.4 1s-2.5-1-4.1-.9c-2.1 0-4 1.2-5 3.1-2.2 3.7-.6 9.2 1.5 12.2 1 1.5 2.3 3.2 3.9 3.1 1.6-.1 2.2-1 4.1-1 1.9 0 2.5 1 4.2 1 1.7 0 2.8-1.5 3.8-3.1 1.2-1.7 1.7-3.4 1.7-3.5-.1-.1-3.9-1.5-4-5.2Zm-2.8-8.6c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.8-3.7 1.9-.8.9-1.5 2.5-1.3 4 1.4.1 2.8-.7 3.7-1.8Z"
      />
      <text x="33" y="22.5" fill="#f8f4ec" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="700">
        Pay
      </text>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 104 32" aria-hidden="true" focusable="false">
      <path fill="#4285f4" d="M19.8 15.1v3.1h5.5c-.2 1.3-.9 2.4-1.9 3.1v2.5h3.1c1.8-1.7 2.9-4.1 2.9-7 0-.6-.1-1.2-.2-1.7h-9.4Z" />
      <path fill="#34a853" d="M19.8 28c2.6 0 4.8-.9 6.5-2.3l-3.1-2.5c-.9.6-2 1-3.4 1-2.5 0-4.6-1.7-5.4-4h-3.2v2.6A9.8 9.8 0 0 0 19.8 28Z" />
      <path fill="#fbbc04" d="M14.4 20.2a5.9 5.9 0 0 1 0-3.8v-2.6h-3.2a9.7 9.7 0 0 0 0 9l3.2-2.6Z" />
      <path fill="#ea4335" d="M19.8 12.4c1.4 0 2.7.5 3.7 1.5l2.8-2.8A9.4 9.4 0 0 0 19.8 8a9.8 9.8 0 0 0-8.6 5.8l3.2 2.6c.8-2.3 2.9-4 5.4-4Z" />
      <text x="37" y="22.4" fill="#f8f4ec" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="700">
        Pay
      </text>
    </svg>
  );
}

function PaypalLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 98 32" aria-hidden="true" focusable="false">
      <path
        fill="#6fb3ff"
        d="M19.8 7.1h-8.1c-.6 0-1.1.4-1.2 1L7.2 28h5l.9-5.6h3.4c5.3 0 9.7-2.7 10.5-7.9.7-4.6-2.1-7.4-7.2-7.4Zm1.6 7.6c-.4 2.7-2.7 3.8-5.6 3.8H14l1.2-7.4h2.3c2.9 0 4.3 1.1 3.9 3.6Z"
      />
      <path
        fill="#2f7de1"
        d="M24.7 10.1c1.6 1.1 2.4 2.9 2 5.4-.8 5.3-5.2 7.9-10.5 7.9h-3.4l-.6 3.8h-4l3.3-19.9c.1-.6.6-1 1.2-1h8.1c2.4 0 4.4.5 5.8 1.6l-1.9 2.2Z"
        opacity=".68"
      />
      <text x="34" y="22.5" fill="#9ec5ff" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="800">
        PayPal
      </text>
    </svg>
  );
}
