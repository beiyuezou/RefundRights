// Utilities to clean up text before sending to ElevenLabs TTS so the
// model produces natural prosody on legal/formal content and avoids
// reading bilingual brackets out loud.

const HAS_CJK = /[\u4e00-\u9fff]/;

function stripMarkdown(s: string): string {
  return s
    // bold/italic markers
    .replace(/\*\*|__|`/g, "")
    // headings
    .replace(/^#{1,6}\s+/gm, "")
    // bullet markers at line start
    .replace(/^\s*[-*•]\s+/gm, "")
    // numbered list "1. " -> "1) " (TTS handles 1) better than 1.)
    .replace(/^(\s*\d+)\.\s+/gm, "$1) ");
}

function collapseWhitespace(s: string): string {
  return s
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Remove parenthetical translations from bilingual text.
 * - mode "en": drop "(中文…)" parentheses that contain CJK characters.
 * - mode "zh": drop "(English …)" parentheses that contain NO CJK characters
 *   (they are translations, not legal references).
 */
function stripBilingualParens(s: string, mode: "en" | "zh"): string {
  // Both ASCII () and full-width (), with non-greedy inner match.
  const re = /[\(（]([^()（）]{1,400})[\)）]/g;
  return s.replace(re, (full, inner: string) => {
    const hasCjk = HAS_CJK.test(inner);
    if (mode === "en" && hasCjk) return "";
    if (mode === "zh" && !hasCjk) return "";
    return full;
  });
}

/**
 * Normalize punctuation so ElevenLabs paces correctly.
 * In English mode, replace stray full-width punctuation with ASCII.
 * In Chinese mode, leave full-width punctuation in place.
 */
function normalizePunctuation(s: string, mode: "en" | "zh"): string {
  if (mode !== "en") return s;
  return s
    .replace(/，/g, ", ")
    .replace(/。/g, ". ")
    .replace(/！/g, "! ")
    .replace(/？/g, "? ")
    .replace(/：/g, ": ")
    .replace(/；/g, "; ")
    .replace(/、/g, ", ");
}

export function prepareTtsText(text: string, lang: "en" | "zh"): string {
  let out = text || "";
  out = stripMarkdown(out);
  out = stripBilingualParens(out, lang);
  out = normalizePunctuation(out, lang);
  out = collapseWhitespace(out);
  return out;
}