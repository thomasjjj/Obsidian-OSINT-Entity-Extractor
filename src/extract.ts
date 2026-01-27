import { requestUrl } from "obsidian";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { ExtractedArticle } from "./types";

const USER_AGENT = "URL-to-Vault/1.0 (+https://obsidian.md)";

function guessSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "";
  }
}

function trimText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[truncated]";
}

function extractPublished(doc: Document): string {
  const selectors = [
    "meta[property='article:published_time']",
    "meta[name='article:published_time']",
    "meta[name='pubdate']",
    "meta[property='og:pubdate']",
    "meta[name='date']",
    "meta[property='article:modified_time']"
  ];

  for (const sel of selectors) {
    const meta = doc.querySelector(sel);
    const content = meta?.getAttribute("content")?.trim();
    if (content) return content;
  }
  return "";
}

function extractAuthors(byline?: string | null): string[] {
  if (!byline) return [];
  return byline
    .split(/,| and /i)
    .map((a) => a.trim())
    .filter(Boolean);
}

export async function fetchAndExtract(url: string, maxChars: number): Promise<ExtractedArticle> {
  const resp = await requestUrl({
    url,
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (resp.status >= 400) {
    throw new Error(`HTTP ${resp.status} when fetching URL`);
  }

  const html = resp.text;
  const dom = new JSDOM(html, { url });

  try {
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const text =
      article?.textContent?.trim() ||
      dom.window.document.querySelector("article")?.textContent?.trim() ||
      dom.window.document.body?.textContent?.trim() ||
      "";

    const published = extractPublished(dom.window.document);
    const authors = extractAuthors(article?.byline);
    const sourceGuess = guessSource(url);

    return {
      title: article?.title?.trim() || "",
      authors,
      published,
      text: trimText(text, maxChars),
      sourceGuess
    };
  } finally {
    dom.window.close();
  }
}
