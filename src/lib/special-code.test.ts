import { describe, expect, it } from "vitest";
import { codeMatches } from "./special-code";

describe("special code", () => {
  it("accepts the configured code (ignoring spaces/case)", () => {
    expect(codeMatches("  travel2026 ", "TRAVEL2026")).toBe(true);
  });
  it("rejects a wrong code", () => {
    expect(codeMatches("TRAVEL2025", "TRAVEL2026")).toBe(false);
  });
  it("rejects a prefix of the code", () => {
    expect(codeMatches("TRAVEL", "TRAVEL2026")).toBe(false);
  });
  it("rejects everything when no code is configured", () => {
    expect(codeMatches("", "")).toBe(false);
    expect(codeMatches("x", undefined)).toBe(false);
  });
});
