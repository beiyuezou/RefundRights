// Pure helpers (no Deno APIs) so they can be unit-tested with vitest.

export type Risk = "strong" | "moderate" | "weak";

export interface AnalysisShape {
  risk_level: Risk;
  confidence: number;
  recommendation: string;
  leverage_points: { title: string; detail: string }[];
  draft_email: string;
}

/** Confidence band per risk level — keeps the score consistent with the verdict. */
export const CONFIDENCE_BANDS: Record<Risk, [number, number]> = {
  strong: [75, 95],
  moderate: [50, 74],
  weak: [20, 49],
};

export function clampConfidence(risk: Risk, value: number): number {
  const [lo, hi] = CONFIDENCE_BANDS[risk];
  const n = Math.round(Number(value) || 0);
  return Math.max(lo, Math.min(hi, n));
}

/** Statute / section references like "Section 4(1)", "s. 6", "第5条". */
export function extractSectionRefs(text: string): string[] {
  const refs = new Set<string>();
  const re = /(?:section|sec\.|s\.)\s*(\d+[A-Z]?(?:\(\d+\))?)|第\s*(\d+[A-Z]?)\s*条/gi;
  for (const m of text.matchAll(re)) refs.add((m[1] ?? m[2]).toUpperCase().replace(/\(.*$/, ""));
  return [...refs].sort();
}

/**
 * Forces a translation to share the master's verdict. Returns the enforced
 * translation and a list of structural mismatches the caller may retry on.
 */
export function enforceTranslation(
  master: AnalysisShape,
  translated: AnalysisShape,
): { result: AnalysisShape; mismatches: string[] } {
  const mismatches: string[] = [];
  if (translated.leverage_points.length !== master.leverage_points.length) {
    mismatches.push("leverage_count");
  }
  const masterRefs = extractSectionRefs(
    master.recommendation + "\n" + master.leverage_points.map((p) => p.detail).join("\n"),
  );
  const transRefs = extractSectionRefs(
    translated.recommendation + "\n" + translated.leverage_points.map((p) => p.detail).join("\n"),
  );
  if (masterRefs.join(",") !== transRefs.join(",")) mismatches.push("section_refs");

  return {
    result: {
      ...translated,
      risk_level: master.risk_level,
      confidence: master.confidence,
    },
    mismatches,
  };
}
