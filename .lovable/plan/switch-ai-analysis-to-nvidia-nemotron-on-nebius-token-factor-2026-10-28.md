# Switch AI analysis to NVIDIA Nemotron on Nebius Token Factory

## Goal
Meet the hackathon rule: the AI must run on Nebius Token Factory and use at least one NVIDIA open-source model. Today, the analysis (risk level, recommendation, leverage points, complaint email) runs on Google Gemini. That one call moves to an NVIDIA Nemotron model hosted on Nebius.

## What changes for users
- Same analysis page, same EN/中文 behaviour, same bilingual complaint email.
- A small "Powered by NVIDIA Nemotron · Nebius Token Factory" label on the analysis page, so judges can see it.
- The analysis records which model produced it (already saved per analysis).

## Steps
1. **Add the key safely**: request `NEBIUS_API_KEY` through the secure form. It is never written into the code.
2. **Pick the model**: list the models available to your key on Nebius and choose the strongest NVIDIA one that supports structured/function output. Default choice: `nvidia/Llama-3_3-Nemotron-Super-49B-v1_5`, falling back to Nemotron Ultra or Nano depending on what the key can use. The exact name gets checked live before coding.
3. **Swap the AI call** in the analysis function: send it to Nebius's OpenAI-compatible endpoint (`https://api.tokenfactory.nebius.com/v1/chat/completions`) and keep the same multi-agent prompt, the same Bright Data and Tavily inputs, and the same output schema.
4. **Make the output reliable**: use function calling first. If the model returns plain JSON instead, accept it, check it against the schema, and keep the existing friendly error and "failed" status. Nemotron "reasoning" text gets stripped out before parsing.
5. **Error handling**: rate limits (429) and out-of-credit errors (402) from Nebius are mapped to the same generic messages users see now, and details are logged only on the server.
6. **Test end to end**: run a real analysis in English and in Chinese (the Trip.com Singapore case). Confirm a stored analysis whose model is the Nemotron name, a valid risk level, 3–7 leverage points, and a bilingual email in zh mode.
7. **Submission note**: add a short README section for judges covering the architecture, the Nebius endpoint, the NVIDIA model, and where the call happens.

## Out of scope (unless you want it)
- Voice (ElevenLabs), Bright Data, Tavily and PayPal stay as they are. The rule only requires the core AI to run on Nebius plus one NVIDIA model.
- Optional extra: use an NVIDIA embedding model on Nebius for the knowledge base. This can be added later if you want more "NVIDIA usage" points.

## Technical details
- File: `supabase/functions/analyze-dispute/index.ts`. Replace the Lovable AI Gateway fetch and `model` constant, read `Deno.env.get("NEBIUS_API_KEY")`, and redeploy.
- Keep `tool_choice` with the `produce_analysis` schema. Fallback is `response_format: { type: "json_object" }` plus a schema check.
- Raise `max_tokens` (around 4000) for the bilingual email. Use temperature around 0.4.
- Update the project knowledge and AGENTS.md: the AI provider is now Nebius/Nemotron instead of Gemini.
