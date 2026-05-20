"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildPayFastPayload,
  type PayFastSubmitPayload,
} from "@/lib/payfast/payload";
import {
  CHECKOUT_FLAT_SHIPPING,
  CHECKOUT_FREE_SHIPPING_AT,
} from "@/lib/checkout/config";
import {
  calculateTotals,
  evaluatePromoCode,
} from "@/lib/checkout/totals";
import type {
  AddressRow,
  CartItemRow,
  ProductRow,
} from "@/lib/supabase/database.types";

export type PlaceOrderInput = {
  addressId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  promoCode?: string;
  deliveryFee?: number;
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderNumber: string;
      payfast: PayFastSubmitPayload;
    }
  | { ok: false; error: string };

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to place an order." };
  }

  // Pull cart, products, and selected address atomically from the server side
  // so totals can't be tampered with on the client.
  const [cartRes, addressRes] = await Promise.all([
    supabase.from("cart_items").select("*").eq("user_id", user.id),
    input.addressId
      ? supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("id", input.addressId)
          .maybeSingle()
      : supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle(),
  ]);

  const cartRows = (cartRes.data ?? []) as CartItemRow[];
  if (cartRows.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const productIds = Array.from(new Set(cartRows.map((row) => row.product_id)));
  const productsRes = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  const products = ((productsRes.data ?? []) as ProductRow[]).reduce(
    (map, row) => {
      map.set(row.id, row);
      return map;
    },
    new Map<string, ProductRow>(),
  );

  // Surface stock / availability problems as structured results so the
  // checkout drawer can display them inline. Throwing here would bubble
  // out as an uncaught server-action error and the user would see no
  // useful feedback.
  let subtotal = 0;
  const orderItemsPayload: {
    product_id: string;
    product_slug: string;
    product_name: string;
    product_price: number;
    product_image: string | null;
    quantity: number;
    total: number;
  }[] = [];
  for (const row of cartRows) {
    const product = products.get(row.product_id);
    if (!product) {
      return {
        ok: false,
        error: "One of the items in your cart is no longer available. Please refresh your cart.",
      };
    }
    if (!product.is_active) {
      return { ok: false, error: `${product.name} is no longer available.` };
    }
    if (product.stock_quantity < row.quantity) {
      return {
        ok: false,
        error: `${product.name} only has ${product.stock_quantity} in stock.`,
      };
    }
    const lineTotal = Number(product.price) * row.quantity;
    subtotal += lineTotal;
    orderItemsPayload.push({
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      product_price: Number(product.price),
      product_image: product.featured_image,
      quantity: row.quantity,
      total: lineTotal,
    });
  }

  // Promo + totals — evaluatePromoCode silently drops invalid codes so a
  // stale or expired code doesn't fail the whole order. The validate
  // action surfaces those messages to the UI before this point.
  const promo = await evaluatePromoCode(supabase, input.promoCode, subtotal);
  const discountTotal = promo.discount;
  const appliedPromoCode = promo.applied ? promo.code : null;

  const totals = calculateTotals({
    subtotal,
    discount: discountTotal,
    deliveryFeeOverride: input.deliveryFee,
    freeShippingThreshold: CHECKOUT_FREE_SHIPPING_AT,
    flatShippingFee: CHECKOUT_FLAT_SHIPPING,
  });
  const deliveryTotal = totals.delivery;
  const total = totals.total;

  const address = (addressRes.data ?? null) as AddressRow | null;
  const deliveryAddressSnapshot = address
    ? {
        id: address.id,
        label: address.label,
        full_name: address.full_name,
        phone: address.phone,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        suburb: address.suburb,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        country: address.country,
      }
    : null;

  // Atomically reserve stock before creating the order. The RPC raises
  // if any item is short, and Postgres rolls back the whole batch — so
  // partial decrements can't leak out. If the subsequent order writes
  // fail, we restore the stock with a best-effort companion call.
  const stockBatch = orderItemsPayload.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return {
      ok: false,
      error: "Order processing is misconfigured (admin client unavailable).",
    };
  }

  const { error: stockError } = await admin.rpc("decrement_stock_batch", {
    p_items: stockBatch,
  });
  if (stockError) {
    const insufficient = stockError.message.includes("insufficient_stock");
    return {
      ok: false,
      error: insufficient
        ? "One of the items in your cart just sold out. Refresh your cart and try again."
        : "Could not reserve stock for your order.",
    };
  }

  const { data: orderInsert, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "Order Placed",
      subtotal,
      discount_total: discountTotal,
      delivery_total: deliveryTotal,
      total,
      currency: "ZAR",
      delivery_address: deliveryAddressSnapshot,
      payment_status: "Pending",
      promo_code: appliedPromoCode,
      customer_email: input.customerEmail ?? user.email ?? null,
      customer_phone: input.customerPhone ?? address?.phone ?? null,
      customer_name: input.customerName ?? address?.full_name ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderInsert) {
    await admin.rpc("restore_stock_batch", { p_items: stockBatch });
    return { ok: false, error: orderError?.message ?? "Failed to create order." };
  }

  const orderId = orderInsert.id;
  const orderNumber = orderInsert.order_number;

  const itemsInsert = await supabase.from("order_items").insert(
    orderItemsPayload.map((item) => ({ ...item, order_id: orderId })),
  );

  if (itemsInsert.error) {
    // Roll back the order + restore stock so we don't leave a phantom
    // reservation against a non-existent order.
    await supabase.from("orders").delete().eq("id", orderId);
    await admin.rpc("restore_stock_batch", { p_items: stockBatch });
    return { ok: false, error: itemsInsert.error.message };
  }

  // Cart is intentionally NOT cleared here. PayFast may decline or the user
  // may cancel; clearing happens in the ITN handler when payment_status
  // transitions to "Paid".

  const customerName = input.customerName ?? address?.full_name ?? "";
  const [firstName, ...rest] = customerName.trim().split(/\s+/);
  const lastName = rest.join(" ");

  const payfast = buildPayFastPayload({
    orderId,
    orderNumber,
    amountZar: total,
    itemName: `SOO order ${orderNumber}`,
    itemDescription: orderItemsPayload
      .map((i) => `${i.quantity}x ${i.product_name}`)
      .join(", "),
    customerEmail: input.customerEmail ?? user.email ?? null,
    customerFirstName: firstName || null,
    customerLastName: lastName || null,
    customerPhone: input.customerPhone ?? address?.phone ?? null,
  });

  revalidatePath("/account/orders");
  revalidatePath(`/orders/confirmation/${orderNumber}`);

  return { ok: true, orderNumber, payfast };
}

// =====================================================================
// Promo code preview
//
// The /checkout page calls this when the user clicks "Apply" on the
// discount input — same lookup logic as placeOrderAction so the totals
// shown can't drift from the totals charged. placeOrderAction
// independently re-validates as defence-in-depth, so a stale or
// expired code can't be exploited even if the client's "Apply" result
// gets cached or replayed.
// =====================================================================

export type ValidatePromoInput = {
  code: string;
  subtotal: number;
};

export type ValidatePromoResult =
  | {
      ok: true;
      code: string;
      discount: number;
      delivery: number;
      total: number;
    }
  | { ok: false; error: string };

export async function validatePromoCodeAction(
  input: ValidatePromoInput,
): Promise<ValidatePromoResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Promo lookup is not configured." };
  }

  const subtotal = Math.max(0, Math.round(input.subtotal));
  const promo = await evaluatePromoCode(supabase, input.code, subtotal);
  if (!promo.applied) {
    return {
      ok: false,
      error: promo.message ?? "That promo code isn't valid.",
    };
  }

  const totals = calculateTotals({
    subtotal,
    discount: promo.discount,
    freeShippingThreshold: CHECKOUT_FREE_SHIPPING_AT,
    flatShippingFee: CHECKOUT_FLAT_SHIPPING,
  });

  return {
    ok: true,
    code: promo.code as string,
    discount: promo.discount,
    delivery: totals.delivery,
    total: totals.total,
  };
}

// =====================================================================
// Retry payment for a Pending / Failed / Cancelled order
//
// Rebuilds the PayFast payload for an existing order without creating a
// new order row. The customer hits this from the confirmation page when
// the original payment didn't go through. We deliberately do NOT
// re-validate stock or promo here — the order's totals were locked when
// it was first placed, and the customer expects to pay that amount.
// =====================================================================

export type RetryPayFastResult =
  | { ok: true; payfast: PayFastSubmitPayload }
  | { ok: false; error: string };

export async function retryPayFastForOrderAction(
  orderNumber: string,
): Promise<RetryPayFastResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to retry payment." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total, payment_status, customer_name, customer_email, customer_phone")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Order not found." };
  }

  if (data.payment_status === "Paid") {
    return { ok: false, error: "This order is already paid." };
  }

  // Pull the line items separately so we can describe the cart on the
  // PayFast hosted page without depending on the relational select.
  const { data: itemRows } = await supabase
    .from("order_items")
    .select("product_name, quantity")
    .eq("order_id", data.id);

  const itemDescription = (itemRows ?? [])
    .map((item) => `${item.quantity}x ${item.product_name}`)
    .join(", ");

  const fullName = data.customer_name ?? "";
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");

  const payfast = buildPayFastPayload({
    orderId: data.id,
    orderNumber: data.order_number,
    amountZar: Number(data.total),
    itemName: `SOO order ${data.order_number}`,
    itemDescription,
    customerEmail: data.customer_email,
    customerFirstName: firstName || null,
    customerLastName: lastName || null,
    customerPhone: data.customer_phone,
  });

  return { ok: true, payfast };
}
