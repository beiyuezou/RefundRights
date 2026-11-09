import { describe, expect, it } from "vitest";
import { PRICE_VALUE, CURRENCY, isValidCapture, isValidCaptureResource, redactReport } from "./paywall";

const D = "11111111-1111-1111-1111-111111111111";
const cap = (value: string, currency: string, custom = D) => ({
  status: "COMPLETED",
  purchase_units: [
    { reference_id: custom, payments: { captures: [{ status: "COMPLETED", custom_id: custom, amount: { value, currency_code: currency } }] } },
  ],
});

describe("paywall price", () => {
  it("charges US$9.90 per case", () => {
    expect(PRICE_VALUE).toBe("9.90");
    expect(CURRENCY).toBe("USD");
  });
  it("accepts a capture of exactly 9.90 USD for this case", () => {
    expect(isValidCapture(cap("9.90", "USD"), D)).toBe(true);
  });
  it("rejects a wrong amount", () => {
    expect(isValidCapture(cap("0.01", "USD"), D)).toBe(false);
  });
  it("rejects a wrong currency", () => {
    expect(isValidCapture(cap("9.90", "EUR"), D)).toBe(false);
  });
  it("rejects a capture for another case", () => {
    expect(isValidCapture(cap("9.90", "USD", "other"), D)).toBe(false);
  });
  it("webhook rejects wrong amount", () => {
    expect(isValidCaptureResource({ status: "COMPLETED", amount: { value: "1.00", currency_code: "USD" } })).toBe(false);
  });
});

describe("free preview", () => {
  it("does not include full arguments, email or sources", () => {
    const r = redactReport({
      id: "a", risk_level: "strong", confidence: 80, created_at: "", language: "en", parent_analysis_id: null,
      recommendation: "You have a strong claim. Secret strategy details follow here.",
      leverage_points: [{ title: "T1", detail: "secret1" }, { title: "T2", detail: "secret2" }],
      draft_email: "Dear sir, secret email", sources: [{ url: "x" }],
    });
    const json = JSON.stringify(r);
    expect(json).not.toContain("secret");
    expect(json).not.toContain("T2");
    expect((r.leverage_points as unknown[]).length).toBe(2);
    expect(r.risk_level).toBe("strong");
  });
});
