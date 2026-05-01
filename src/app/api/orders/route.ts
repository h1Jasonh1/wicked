import { requireAuthenticatedUser } from "@/lib/auth";
import { getOrderHistoryForUser } from "@/lib/orders";

export async function GET() {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  return Response.json({
    orders: getOrderHistoryForUser(user.id),
    integration: {
      persistentOrdersConnected: false,
      notes: "Replace this placeholder with a database-backed order service.",
    },
  });
}
