import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CURRENCY, PRICE_CENTS, PRICE_VALUE, isValidCapture } from "@/lib/paywall";
import { paypalAccessToken, paypalBase } from "@/lib/paypal.server";

export const getPaypalPublicConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      clientId: process.env.PAYPAL_CLIENT_ID ?? "",
      env: (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase(),
      currency: CURRENCY,
      amountCents: PRICE_CENTS,
    };
  },
);

type Result =
  | { ok: true; order_id: string }
  | { ok: false; code: string };

export const createPaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ dispute_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }): Promise<Result> => {
    const { supabase, userId } = context;
    const { data: dispute } = await supabase
      .from("disputes")
      .select("id, user_id, paid, category")
      .eq("id", data.dispute_id)
      .maybeSingle();
    if (!dispute || dispute.user_id !== userId) return { ok: false, code: "forbidden" };
    if (dispute.paid) return { ok: false, code: "already_paid" };

    const token = await paypalAccessToken();
    if (!token) return { ok: false, code: "not_configured" };
    const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: dispute.id,
            custom_id: dispute.id,
            description: `RefundRights full report (${dispute.category})`,
            amount: { currency_code: CURRENCY, value: PRICE_VALUE },
          },
        ],
        application_context: {
          brand_name: "RefundRights",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });
    if (!res.ok) {
      console.error("paypal create failed", res.status);
      return { ok: false, code: "paypal_create_failed" };
    }
    const order = (await res.json()) as { id: string };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("payments").upsert(
      {
        user_id: userId,
        dispute_id: dispute.id,
        provider: "paypal",
        paypal_order_id: order.id,
        amount_cents: PRICE_CENTS,
        currency: CURRENCY,
        status: "created",
      },
      { onConflict: "paypal_order_id" },
    );
    return { ok: true, order_id: order.id };
  });

type CaptureResult = { ok: true; status: string } | { ok: false; code: string };

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ order_id: z.string().min(1).max(200), dispute_id: z.string().uuid() })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<CaptureResult> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // The order must be one we created for this user and this case.
    const { data: pay } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, dispute_id, status")
      .eq("paypal_order_id", data.order_id)
      .maybeSingle();
    if (!pay || pay.user_id !== userId || pay.dispute_id !== data.dispute_id) {
      return { ok: false, code: "forbidden" };
    }
    if (pay.status === "completed" || pay.status === "captured") return { ok: true, status: "CAPTURED" };

    const token = await paypalAccessToken();
    if (!token) return { ok: false, code: "not_configured" };
    const res = await fetch(
      `${paypalBase()}/v2/checkout/orders/${encodeURIComponent(data.order_id)}/capture`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      },
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("paypal capture failed", res.status);
      return { ok: false, code: "paypal_capture_failed" };
    }
    // Privacy: never store the full PayPal reply (it contains payer name/email).
    if (!isValidCapture(payload, data.dispute_id)) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "mismatch", raw_payload: null })
        .eq("id", pay.id);
      return { ok: false, code: "capture_mismatch" };
    }

    // Do NOT unlock here: only the signature-verified PayPal webhook sets
    // disputes.paid. Record that capture succeeded so the client can poll.
    await supabaseAdmin
      .from("payments")
      .update({ status: "captured", raw_payload: null })
      .eq("id", pay.id)
      .neq("status", "completed");
    return { ok: true, status: "CAPTURED" };
  });
