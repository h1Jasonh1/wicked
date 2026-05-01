import type { CartItem } from "@/types/cart";
import type { Order, OrderStatus } from "@/types/order";

export const orderStatuses: OrderStatus[] = [
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

export const sampleOrders: Order[] = [
  {
    id: "WCK-1048",
    userId: "preview-customer",
    customer: {
      name: "Preview Customer",
      email: "customer@wicked.local",
      phone: "+27 82 555 0140",
      deliveryAddress: "18 Bree Street, Cape Town, 8001",
    },
    items: [
      {
        productId: "hydrating-gel-cleanser",
        slug: "hydrating-gel-cleanser",
        name: "Hydrating Gel Cleanser",
        quantity: 1,
        price: 420,
      },
      {
        productId: "barrier-repair-moisturiser",
        slug: "barrier-repair-moisturiser",
        name: "Barrier Repair Moisturiser",
        quantity: 1,
        price: 640,
      },
    ],
    quantity: 2,
    subtotal: 1060,
    deliveryFee: 0,
    total: 1060,
    paymentStatus: "Paid",
    status: "Dispatched",
    trackingProvider: "Manual",
    trackingNumber: "WCK-MANUAL-1048",
    trackingUrl: "#",
    estimatedDelivery: "2026-05-03T10:00:00.000Z",
    createdAt: "2026-04-25T09:30:00.000Z",
    updatedAt: "2026-04-28T15:20:00.000Z",
  },
  {
    id: "WCK-1039",
    userId: "preview-customer",
    customer: {
      name: "Preview Customer",
      email: "customer@wicked.local",
      phone: "+27 82 555 0140",
      deliveryAddress: "18 Bree Street, Cape Town, 8001",
    },
    items: [
      {
        productId: "mineral-daily-spf",
        slug: "mineral-daily-spf",
        name: "Mineral Daily SPF",
        quantity: 1,
        price: 520,
      },
    ],
    quantity: 1,
    subtotal: 520,
    deliveryFee: 95,
    total: 615,
    paymentStatus: "Paid",
    status: "Delivered",
    trackingProvider: "Manual",
    trackingNumber: "WCK-MANUAL-1039",
    trackingUrl: "#",
    estimatedDelivery: "2026-04-21T14:00:00.000Z",
    createdAt: "2026-04-18T11:45:00.000Z",
    updatedAt: "2026-04-21T13:36:00.000Z",
  },
];

export function getOrderHistoryForUser(userId: string) {
  // TODO(orders): Replace with a database query scoped to the authenticated
  // user id once auth and persistence are connected.
  return sampleOrders.filter((order) => order.userId === userId);
}

export function getOrderById(orderId: string) {
  // TODO(orders): Enforce user ownership when this reads from real storage.
  return sampleOrders.find((order) => order.id === orderId) ?? null;
}

export function createOrderDraftFromCart({
  cartItems,
  deliveryFee,
  discount,
  userId,
}: {
  cartItems: CartItem[];
  deliveryFee: number;
  discount: number;
  userId: string;
}): Order {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    id: "WCK-DRAFT",
    userId,
    customer: {
      name: "Checkout customer",
      email: "customer@example.com",
      phone: "",
      deliveryAddress: "",
    },
    items: cartItems.map((item) => ({
      productId: item.id,
      slug: item.slug,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      imageAlt: item.imageAlt,
    })),
    quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    deliveryFee,
    total,
    paymentStatus: "Pending",
    status: "Order Placed",
    trackingProvider: "Manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
