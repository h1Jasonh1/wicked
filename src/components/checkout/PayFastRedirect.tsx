"use client";

import { useEffect, useRef } from "react";
import type { PayFastSubmitPayload } from "@/lib/payfast/payload";

/**
 * Auto-submitting hidden form that POSTs to PayFast's hosted page. Renders
 * once, submits on mount, then leaves the page. We use a real form (rather
 * than fetch + redirect) so the browser sets the navigation correctly and
 * PayFast sees a normal user-initiated POST.
 */
export function PayFastRedirect({
  payload,
}: {
  payload: PayFastSubmitPayload;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={payload.url} method="POST" style={{ display: "none" }}>
      {Object.entries(payload.fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  );
}
