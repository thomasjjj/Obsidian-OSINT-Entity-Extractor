import { requestUrl } from "obsidian";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { ExtractedArticle } from "./types";

const USER_AGENT = "OSINT-Entity-Extractor/0.1.1 (+https://github.com/thomasjjj/obsidian-osint-ner)";

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
    .split(/,\s*|\s+and\s+|\s*&\s*|;\s*/i)
    .map((a) => a.trim())
    .filter(Boolean);
}

function extractLinksAndImages(articleHtml: string, baseUrl: string) {
  const tempDom = new JSDOM(articleHtml || "<div></div>", { url: baseUrl });
  try {
    const doc = tempDom.window.document;
    const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>("a"));
    const links = anchors
      .map((a) => ({
        text: a.textContent?.trim() ?? "",
        href: a.href
      }))
      .filter((l) => !!l.href);

    const imgs = Array.from(doc.querySelectorAll<HTMLImageElement>("img"));
    const images = imgs
      .map((img) => ({
        alt: img.getAttribute("alt")?.trim() ?? "",
        src: img.src
      }))
      .filter((i) => !!i.src);

    return { links, images };
  } finally {
    tempDom.window.close();
  }
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

    const { links, images } = extractLinksAndImages(article?.content || "", url);

    const published = extractPublished(dom.window.document);
    const authors = extractAuthors(article?.byline);
    const sourceGuess = guessSource(url);

    return {
      title: article?.title?.trim() || "",
      authors,
      published,
      text: trimText(text, maxChars),
      sourceGuess,
      links,
      images
    };
  } finally {
    dom.window.close();
  }
}
