import "server-only";

import {
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  PAYFAST_PROCESS_URL,
  buildCancelUrl,
  buildNotifyUrl,
  buildReturnUrl,
} from "./env";
import { signPayFastFields, type PayFastField } from "./sign";

export type BuildPayFastPayloadInput = {
  orderId: string;
  orderNumber: string;
  amountZar: number;
  itemName: string;
  itemDescription?: string;
  customerEmail?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerPhone?: string | null;
};

export type PayFastSubmitPayload = {
  url: string;
  fields: Record<string, string>;
};

/**
 * Build the signed payload the browser POSTs to PayFast's hosted page.
 *
 * Order of fields follows PayFast's integration guide (the signature base
 * uses this exact order) — do not reshuffle without re-checking the spec.
 */
export function buildPayFastPayload(
  input: BuildPayFastPayloadInput,
): PayFastSubmitPayload {
  const amount = input.amountZar.toFixed(2);
  const itemName = clamp(input.itemName, 100);
  const itemDescription = input.itemDescription
    ? clamp(input.itemDescription, 255)
    : undefined;

  const ordered: PayFastField[] = [
    ["merchant_id", PAYFAST_MERCHANT_ID],
    ["merchant_key", PAYFAST_MERCHANT_KEY],
    ["return_url", buildReturnUrl(input.orderNumber)],
    ["cancel_url", buildCancelUrl(input.orderNumber)],
    ["notify_url", buildNotifyUrl()],
    ["name_first", input.customerFirstName ?? ""],
    ["name_last", input.customerLastName ?? ""],
    ["email_address", input.customerEmail ?? ""],
    ["cell_number", input.customerPhone ?? ""],
    ["m_payment_id", input.orderId],
    ["amount", amount],
    ["item_name", itemName],
    ["item_description", itemDescription ?? ""],
    ["custom_str1", input.orderNumber],
    ["email_confirmation", "1"],
    ["confirmation_address", input.customerEmail ?? ""],
  ];

  const signature = signPayFastFields(ordered, PAYFAST_PASSPHRASE);

  const fields: Record<string, string> = {};
  for (const [key, value] of ordered) {
    if (value === "") continue;
    fields[key] = value;
  }
  fields.signature = signature;

  return { url: PAYFAST_PROCESS_URL, fields };
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
