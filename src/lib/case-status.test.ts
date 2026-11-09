import { describe, it, expect } from "vitest";
import { nextStep, totalRecovered, splitDraft, buildMailto, isCaseStatus } from "./case-status";

const day = 86_400_000;

describe("case status rules", () => {
  it("suggests escalating 7 days after the appeal email with no reply", () => {
    const now = new Date("2026-11-10T00:00:00Z");
    expect(nextStep("email_sent", new Date(now.getTime() - 7 * day), now)).toBe("escalate_now");
  });
  it("keeps waiting before 7 days", () => {
    const now = new Date("2026-11-10T00:00:00Z");
    expect(nextStep("email_sent", new Date(now.getTime() - 6 * day), now)).toBe("wait_reply");
  });
  it("new case asks to send the email", () => {
    expect(nextStep("submitted", new Date())).toBe("send_email");
  });
  it("refunded and rejected are closed", () => {
    expect(nextStep("refunded", new Date())).toBe("closed");
    expect(nextStep("rejected", new Date())).toBe("closed");
  });
  it("only refunded cases count toward recovered total", () => {
    expect(
      totalRecovered([
        { case_status: "refunded", recovered_amount: 120 },
        { case_status: "refunded", recovered_amount: 30.5 },
        { case_status: "rejected", recovered_amount: 99 },
        { case_status: "refunded", recovered_amount: null },
      ]),
    ).toBe(150.5);
  });
  it("rejects unknown statuses", () => {
    expect(isCaseStatus("won")).toBe(false);
    expect(isCaseStatus("escalated")).toBe(true);
  });
  it("splits subject line off draft", () => {
    expect(splitDraft("Subject: Refund request\n\nDear Sir", "x")).toEqual({ subject: "Refund request", body: "Dear Sir" });
    expect(splitDraft("Dear Sir", "Fallback").subject).toBe("Fallback");
  });
  it("encodes mailto", () => {
    expect(buildMailto("A B", "x&y")).toBe("mailto:?subject=A%20B&body=x%26y");
  });
});
