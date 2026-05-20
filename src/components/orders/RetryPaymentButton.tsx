"use client";

import { useState, useTransition } from "react";
import { retryPayFastForOrderAction } from "@/app/checkout/actions";
import { PayFastRedirect } from "@/components/checkout/PayFastRedirect";
import type { PayFastSubmitPayload } from "@/lib/payfast/payload";
import styles from "@/styles/store.module.css";

/**
 * Retry payment for a Pending / Failed / Cancelled order. Mounted by the
 * confirmation page in the failed/cancelled branches. On click, calls
 * the server action which rebuilds a signed PayFast payload for the
 * SAME order row (no new order, no double-charging, no re-validation
 * of stock or promo — the order's totals are already locked).
 */
export function RetryPaymentButton({ orderNumber }: { orderNumber: string }) {
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PayFastSubmitPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await retryPayFastForOrderAction(orderNumber);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPayload(result.payfast);
    });
  };

  return (
    <>
      <button
        className={styles.primaryButton}
        disabled={isPending || payload !== null}
        onClick={handleClick}
        type="button"
      >
        {payload ? "Redirecting to PayFast…" : isPending ? "Preparing…" : "Retry payment"}
      </button>
      {error ? (
        <div className={styles.errorBox} role="alert">
          {error}
        </div>
      ) : null}
      {payload ? <PayFastRedirect payload={payload} /> : null}
    </>
  );
}
