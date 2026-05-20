import type { Metadata } from "next";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { OrderHistoryList } from "@/components/orders/OrderHistoryList";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loadOrdersForCurrentUser } from "@/lib/supabase/orders";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Order History | SOO",
};

export default async function AccountOrdersPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return (
      <div className={styles.dashboardStack}>
        <AuthPromptCard title="Sign in to view order history" />
      </div>
    );
  }

  const orders = (await loadOrdersForCurrentUser()) ?? [];

  return (
    <div className={styles.dashboardStack}>
      <OrderHistoryList orders={orders} />
    </div>
  );
}
