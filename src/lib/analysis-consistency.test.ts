import { describe, expect, it } from "vitest";
import {
  clampConfidence,
  enforceTranslation,
  type AnalysisShape,
} from "../../supabase/functions/_shared/consistency";

const master: AnalysisShape = {
  risk_level: "moderate",
  confidence: 70,
  recommendation: "Under CPFTA Section 4(1) ...",
  leverage_points: [
    { title: "a", detail: "x" },
    { title: "b", detail: "y" },
    { title: "c", detail: "z" },
  ],
  draft_email: "Subject: x",
};

describe("analysis consistency", () => {
  it("translation keeps the master's risk level and confidence", () => {
    const { result } = enforceTranslation(master, {
      ...master,
      risk_level: "strong",
      confidence: 90,
      recommendation: "根据 CPFTA 第4条 ...",
    });
    expect(result.risk_level).toBe("moderate");
    expect(result.confidence).toBe(70);
  });

  it("flags a different number of key arguments", () => {
    const { mismatches } = enforceTranslation(master, {
      ...master,
      leverage_points: master.leverage_points.slice(0, 2),
    });
    expect(mismatches).toContain("leverage_count");
  });

  it("flags a section number that the master never cited", () => {
    const { mismatches } = enforceTranslation(master, {
      ...master,
      recommendation: "根据 CPFTA 第5条",
    });
    expect(mismatches).toContain("section_refs");
  });

  it("clamps confidence into the band for the verdict", () => {
    expect(clampConfidence("moderate", 90)).toBe(74);
    expect(clampConfidence("strong", 60)).toBe(75);
    expect(clampConfidence("weak", 30)).toBe(30);
  });
});
