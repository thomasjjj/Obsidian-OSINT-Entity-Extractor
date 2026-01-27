import OpenAI from "openai";
import type { ExtractedArticle } from "./types";
import { PROMPT_TEMPLATE } from "./prompt";

export function buildPrompt(url: string, meta: ExtractedArticle, defaultTags?: string): string {
  const extractionNote =
    meta.text.length < 500
      ? "\n\nNOTE: The extracted article text is short; the page may be paywalled or blocked. Do NOT invent missing details - format only what is provided.\n"
      : "";

  const base = PROMPT_TEMPLATE.replace("{url}", url)
    .replace("{title}", meta.title || "")
    .replace("{authors}", meta.authors.join(", "))
    .replace("{published}", meta.published || "")
    .replace("{source}", meta.sourceGuess || "")
    .replace("{article_text}", (meta.text + extractionNote).trim());

  if (defaultTags && defaultTags.trim()) {
    return `${base}\n\nDEFAULT TAGS TO INCLUDE IN YAML (if appropriate): ${defaultTags.trim()}`;
  }
  return base;
}

export async function formatWithOpenAI(
  apiKey: string,
  model: string,
  url: string,
  meta: ExtractedArticle,
  defaultTags?: string
): Promise<string> {
  const client = getClient(apiKey);
  const prompt = buildPrompt(url, meta, defaultTags);

  const resp = await client.responses.create({
    model,
    input: prompt
  });

  const output = resp.output_text ?? "";
  return output.trim();
}

let cachedClient: { key: string; client: OpenAI } | null = null;

function getClient(apiKey: string): OpenAI {
  if (cachedClient?.key === apiKey) return cachedClient.client;
  const client = new OpenAI({
    apiKey,
    // Obsidian plugins run in an Electron renderer; allow browser usage explicitly.
    ...(typeof window !== "undefined" ? { dangerouslyAllowBrowser: true } : {})
  });
  cachedClient = { key: apiKey, client };
  return client;
}
