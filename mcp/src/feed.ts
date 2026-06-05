import { XMLParser } from "fast-xml-parser";
import he from "he";
import { FEED_URL, FETCH_TIMEOUT_MS, CACHE_TTL_MS } from "./constants.js";
import type { Post } from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name: string) => name === "item" || name === "category",
});

let cachedPosts: Post[] | null = null;
let cacheTimestamp = 0;

export async function fetchPosts(): Promise<Post[]> {
  if (cachedPosts && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedPosts;
  }

  const xml = await fetchXml(FEED_URL);
  const posts = parseRss(xml);

  cachedPosts = posts;
  cacheTimestamp = Date.now();
  return posts;
}

function parseRss(xml: string): Post[] {
  const parsed = parser.parse(xml);
  const items: Record<string, unknown>[] = parsed?.rss?.channel?.item ?? [];

  return items.map((item) => {
    const title = extractText(item, "title");
    const link = extractText(item, "link");
    const description = extractText(item, "description");
    const pubDate = extractText(item, "pubDate");
    const tags = extractTags(item);

    return {
      title: stripHtml(title).trim(),
      url: link.trim(),
      publishedAt: safeParseDate(pubDate),
      description: stripHtml(description).slice(0, 200).trim(),
      tags,
    };
  });
}

function extractText(item: Record<string, unknown>, key: string): string {
  const val = item[key];
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "#text" in (val as object)) {
    return (val as Record<string, string>)["#text"] ?? "";
  }
  return "";
}

function extractTags(item: Record<string, unknown>): string[] {
  const cat = item["category"];
  if (!cat) return [];
  const categories = Array.isArray(cat) ? cat : [cat];
  return categories
    .map((c: unknown) => {
      if (typeof c === "string") return c.trim();
      if (c && typeof c === "object" && "#text" in (c as object)) {
        return ((c as Record<string, string>)["#text"] ?? "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

function safeParseDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

export async function fetchPostContent(url: string): Promise<string> {
  const html = await fetchXml(url);

  const article =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ??
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
    html;

  const cleaned = article
    .replace(/<(header|nav|footer|aside)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  return stripHtml(cleaned).replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchXml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  return he.decode(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function clearCache(): void {
  cachedPosts = null;
  cacheTimestamp = 0;
}
