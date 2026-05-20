import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loadOrdersForCurrentUser } from "@/lib/supabase/orders";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const orders = (await loadOrdersForCurrentUser()) ?? [];

  return Response.json({ orders });
}
