import type { TrackingProvider } from "@/types/order";
import { getTrackingStatus, syncCourierStatus } from "@/lib/tracking";

type TrackingRouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, context: TrackingRouteContext) {
  const { orderId } = await context.params;
  const tracking = await getTrackingStatus(orderId);

  if (!tracking) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({
    tracking,
    integration: {
      liveCourierConnected: false,
      notes:
        "Courier sync is a placeholder. Connect Bob Go or another provider in lib/tracking.ts.",
    },
  });
}

export async function POST(request: Request, context: TrackingRouteContext) {
  const { orderId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { provider?: string; trackingNumber?: string }
    | null;

  if (!body?.provider || !body.trackingNumber) {
    return Response.json(
      { error: "provider and trackingNumber are required" },
      { status: 400 },
    );
  }

  const update = await syncCourierStatus(
    body.trackingNumber,
    body.provider as TrackingProvider,
  );

  return Response.json({
    orderId,
    update,
    integration: {
      liveCourierConnected: false,
      notes: "Manual status sync placeholder only.",
    },
  });
}
