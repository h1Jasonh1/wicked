"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Auto-refreshes the confirmation page while payment is still Pending. The
 * ITN webhook usually lands within a couple of seconds of redirect, but EFT
 * payments and sandbox lag mean we can't assume it's already arrived. We
 * stop polling after `maxAttempts` so a stuck Pending order doesn't refresh
 * forever.
 */
export function PaymentStatusPoller({
  intervalMs = 3000,
  maxAttempts = 20,
}: {
  intervalMs?: number;
  maxAttempts?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs, maxAttempts]);

  return null;
}
