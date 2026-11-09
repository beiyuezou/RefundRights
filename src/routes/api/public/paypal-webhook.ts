import { createFileRoute } from "@tanstack/react-router";
import { paypalAccessToken, paypalBase } from "@/lib/paypal.server";
import { isValidCaptureResource } from "@/lib/paywall";

export const Route = createFileRoute("/api/public/paypal-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) return new Response("Not configured", { status: 503 });

        const rawBody = await request.text();
        let event: {
          event_type?: string;
          resource?: {
            status?: string;
            amount?: { value?: string; currency_code?: string };
            supplementary_data?: { related_ids?: { order_id?: string } };
          };
        };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const token = await paypalAccessToken();
        if (!token) return new Response("Unavailable", { status: 503 });
        const h = request.headers;
        const verifyRes = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            auth_algo: h.get("paypal-auth-algo"),
            cert_url: h.get("paypal-cert-url"),
            transmission_id: h.get("paypal-transmission-id"),
            transmission_sig: h.get("paypal-transmission-sig"),
            transmission_time: h.get("paypal-transmission-time"),
            webhook_id: webhookId,
            webhook_event: event,
          }),
        });
        const verify = (await verifyRes.json().catch(() => ({}))) as { verification_status?: string };
        if (verify.verification_status !== "SUCCESS") {
          return new Response("Invalid signature", { status: 401 });
        }

        if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") return new Response("ok");
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        if (!orderId || !isValidCaptureResource(event.resource)) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Trust only our own order record for which case was paid.
        const { data: pay } = await supabaseAdmin
          .from("payments")
          .select("id, dispute_id, status")
          .eq("paypal_order_id", orderId)
          .maybeSingle();
        if (!pay || pay.status === "completed") return new Response("ok");

        await supabaseAdmin
          .from("payments")
          .update({ status: "completed", raw_payload: null })
          .eq("id", pay.id);
        await supabaseAdmin
          .from("disputes")
          .update({ paid: true, paid_at: new Date().toISOString() })
          .eq("id", pay.dispute_id)
          .eq("paid", false);
        return new Response("ok");
      },
    },
  },
});
