import OpenAI from "openai";
import type { ExtractedArticle } from "./types";
import { PROMPT_TEMPLATE } from "./prompt";

export function buildPrompt(
  url: string,
  meta: ExtractedArticle,
  defaultTags?: string | string[],
  promptTemplate: string = PROMPT_TEMPLATE
): string {
  const articleText = meta.text.trim() || "_NO ARTICLE TEXT EXTRACTED_";

  const base = promptTemplate
    .replace("{url}", url)
    .replace("{title}", meta.title || "")
    .replace("{authors}", meta.authors.join(", "))
    .replace("{published}", meta.published || "")
    .replace("{source}", meta.sourceGuess || "")
    .replace("{article_text}", articleText);

  const tagsArray = Array.isArray(defaultTags)
    ? defaultTags
    : defaultTags
    ? defaultTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (tagsArray.length) {
    const tagsBlock = tagsArray.map((t) => `- ${t}`).join("\n");
    return `${base}\n\nDEFAULT TAGS TO INCLUDE IN YAML (if appropriate):\n${tagsBlock}`;
  }
  return base;
}

export async function formatWithOpenAI(
  apiKey: string,
  model: string,
  url: string,
  meta: ExtractedArticle,
  defaultTags?: string | string[],
  promptTemplate?: string
): Promise<string> {
  const client = getOpenAIClient(apiKey);
  const prompt = buildPrompt(url, meta, defaultTags, promptTemplate || PROMPT_TEMPLATE);

  const resp = await client.responses.create({
    model,
    input: prompt
  });

  const output = resp.output_text ?? "";
  return output.trim();
}

let cachedClient: { key: string; client: OpenAI } | null = null;

export function getOpenAIClient(apiKey: string): OpenAI {
  if (cachedClient?.key === apiKey) return cachedClient.client;
  const client = new OpenAI({
    apiKey,
    // Obsidian plugins run in an Electron renderer; allow browser usage explicitly.
    ...(typeof window !== "undefined" ? { dangerouslyAllowBrowser: true } : {})
  });
  cachedClient = { key: apiKey, client };
  return client;
}
