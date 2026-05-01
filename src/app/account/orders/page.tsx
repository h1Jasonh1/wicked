import type { Metadata } from "next";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { OrderHistoryList } from "@/components/orders/OrderHistoryList";
import { getCurrentUser } from "@/lib/auth";
import { getOrderHistoryForUser } from "@/lib/orders";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Order History | WICKED",
};

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  const orders = getOrderHistoryForUser(user?.id ?? "preview-customer");

  return (
    <div className={styles.dashboardStack}>
      {!user ? <AuthPromptCard title="Sign in to view order history" /> : null}
      <OrderHistoryList orders={orders} />
    </div>
  );
}
