import { redirect } from "next/navigation";

export default function OrderConfirmationIndexPage() {
  // The real confirmation lives at /orders/confirmation/[orderNumber].
  // Without an order number, send the visitor to their order history.
  redirect("/account/orders");
}
