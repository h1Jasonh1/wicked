import "server-only";

import type {
  OrderItemRow,
  OrderRow,
} from "./database.types";
import { getSupabaseServerClient } from "./server";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  TrackingProvider,
} from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "Pending",
  "Authorised",
  "Paid",
  "Failed",
  "Refunded",
];
const TRACKING_PROVIDERS: TrackingProvider[] = [
  "Manual",
  "Bob Go",
  "Courier API",
  "Future Partner",
];

function asOrderStatus(value: string): OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value)
    ? (value as OrderStatus)
    : "Order Placed";
}

function asPaymentStatus(value: string): PaymentStatus {
  return (PAYMENT_STATUSES as string[]).includes(value)
    ? (value as PaymentStatus)
    : "Pending";
}

function asTrackingProvider(value: string | null): TrackingProvider | undefined {
  if (!value) return undefined;
  return (TRACKING_PROVIDERS as string[]).includes(value)
    ? (value as TrackingProvider)
    : undefined;
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id ?? row.product_slug ?? row.id,
    slug: row.product_slug ?? "",
    name: row.product_name,
    quantity: row.quantity,
    price: Number(row.product_price),
    imageAlt: row.product_name,
  };
}

type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

export function mapOrder(row: OrderWithItems): Order {
  const address = (row.delivery_address ?? null) as
    | {
        full_name?: string;
        recipient_name?: string;
        line1?: string;
        address_line_1?: string;
        line2?: string;
        address_line_2?: string;
        city?: string;
        province?: string;
        postal_code?: string;
        postalCode?: string;
        phone?: string;
      }
    | null;

  const formattedAddress = address
    ? [
        address.address_line_1 ?? address.line1,
        address.address_line_2 ?? address.line2,
        address.city,
        address.postal_code ?? address.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const quantity = row.order_items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    id: row.order_number,
    userId: row.user_id,
    customer: {
      name:
        row.customer_name ??
        address?.full_name ??
        address?.recipient_name ??
        "",
      email: row.customer_email ?? "",
      phone: row.customer_phone ?? address?.phone ?? "",
      deliveryAddress: formattedAddress,
    },
    items: row.order_items.map(mapOrderItem),
    quantity,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_total),
    total: Number(row.total),
    paymentStatus: asPaymentStatus(row.payment_status),
    status: asOrderStatus(row.status),
    trackingProvider: asTrackingProvider(row.tracking_provider),
    trackingNumber: row.tracking_number ?? undefined,
    trackingUrl: row.tracking_url ?? undefined,
    estimatedDelivery: row.estimated_delivery ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadOrdersForCurrentUser(): Promise<Order[] | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[supabase] loadOrdersForCurrentUser failed", error.message);
    return null;
  }

  return (data ?? []).map((row) => mapOrder(row as unknown as OrderWithItems));
}

export async function loadOrderByNumber(
  orderNumber: string,
): Promise<Order | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[supabase] loadOrderByNumber failed", error.message);
    return null;
  }

  return data ? mapOrder(data as unknown as OrderWithItems) : null;
}
