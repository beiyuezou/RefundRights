import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { redeemSpecialCode } from "@/lib/special-code.functions";

export function SpecialCodeRedeem({ disputeId, onPaid }: { disputeId: string; onPaid: () => void }) {
  const { t } = useTranslation();
  const redeem = useServerFn(redeemSpecialCode);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        {t("specialCode.have")}
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await redeem({ data: { dispute_id: disputeId, code: code.trim() } });
      if (res.ok) {
        toast.success(t("specialCode.success"));
        onPaid();
      } else {
        setErr(t(`specialCode.${res.code === "forbidden" ? "error" : res.code}`));
      }
    } catch {
      setErr(t("specialCode.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 text-left">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={64}
          autoComplete="off"
          aria-label={t("specialCode.placeholder")}
          placeholder={t("specialCode.placeholder")}
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm uppercase tracking-wider text-foreground placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="h-10 rounded-md border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          {t("specialCode.redeem")}
        </button>
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </form>
  );
}
