import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalPublicConfig,
} from "@/lib/payments.functions";

type Props = {
  disputeId: string;
  onPaid: () => void;
};

export function PayPalCheckoutButton({ disputeId, onPaid }: Props) {
  const { i18n } = useTranslation();
  const createOrder = useServerFn(createPaypalOrder);
  const captureOrder = useServerFn(capturePaypalOrder);
  const getConfig = useServerFn(getPaypalPublicConfig);
  const [clientId, setClientId] = useState<string | null>(null);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getConfig()
      .then((c) => {
        if (cancelled) return;
        if (c.clientId) setClientId(c.clientId);
        else setConfigError(true);
      })
      .catch(() => !cancelled && setConfigError(true));
    return () => {
      cancelled = true;
    };
  }, [getConfig]);

  const options = useMemo(
    () => ({
      clientId: clientId ?? "test",
      currency: "USD",
      intent: "capture" as const,
      locale: i18n.language?.startsWith("zh") ? "zh_CN" : "en_US",
    }),
    [clientId, i18n.language],
  );

  if (configError) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        Checkout is temporarily unavailable. Please try again later.
      </p>
    );
  }

  if (!clientId) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Loading PayPal…
      </p>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "pay" }}
          createOrder={async () => {
            const res = await createOrder({ data: { dispute_id: disputeId } });
            if (!res.ok) {
              toast.error("Could not start checkout.");
              throw new Error(res.code);
            }
            return res.order_id;
          }}
          onApprove={async (data) => {
            const res = await captureOrder({
              data: { order_id: data.orderID, dispute_id: disputeId },
            });
            if (res.ok) {
              toast.success("Payment complete — unlocking your full report.");
              // The unlock is applied by PayPal's verified notification; wait for it.
              for (let i = 0; i < 20; i++) {
                const { data: d } = await supabase
                  .from("disputes").select("paid").eq("id", disputeId).maybeSingle();
                if (d?.paid) break;
                await new Promise((r) => setTimeout(r, 1500));
              }
              onPaid();
            } else {
              toast.error("Payment could not be captured.");
            }
          }}
          onError={(err) => {
            if (import.meta.env.DEV) console.error("paypal", err);
            toast.error("PayPal error. Please try again.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}