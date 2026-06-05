import { FEED_URL, FETCH_TIMEOUT_MS } from "./constants.js";
import type { Post } from "./types.js";

/** RSSフィードを取得してパースし、Post一覧を返す */
export async function fetchPosts(): Promise<Post[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let text: string;
  try {
    const res = await fetch(FEED_URL, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
    }
    text = await res.text();
  } finally {
    clearTimeout(timer);
  }

  return parseRss(text);
}

/** RSS XML をパースして Post[] に変換する */
function parseRss(xml: string): Post[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  return items.map((item) => {
    const title = extractCdata(item, "title") ?? extractTag(item, "title") ?? "";
    const link = extractTag(item, "link") ?? "";
    const pubDate = extractTag(item, "pubDate") ?? "";
    const description = extractCdata(item, "description") ?? extractTag(item, "description") ?? "";

    // <category> タグから複数タグを収集
    const categoryMatches = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>|<category>(.*?)<\/category>/g) ?? [];
    const tags = categoryMatches.map((c) => {
      const m = c.match(/CDATA\[(.*?)\]/) ?? c.match(/<category>(.*?)<\/category>/);
      return m?.[1]?.trim() ?? "";
    }).filter(Boolean);

    return {
      title: stripHtml(title).trim(),
      url: link.trim(),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : "",
      description: stripHtml(description).slice(0, 200).trim(),
      tags,
    };
  });
}

/** ページ本文（HTML）をfetchしてプレーンテキストに変換する */
export async function fetchPostContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Page fetch failed: ${res.status} ${res.statusText}`);
    }
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }

  // <article> または <main> タグの内容だけ抽出
  const article =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ??
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
    html;

  return stripHtml(article).replace(/\n{3,}/g, "\n\n").trim();
}

// ---- helpers ----

function extractTag(xml: string, tag: string): string | undefined {
  return xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1];
}

function extractCdata(xml: string, tag: string): string | undefined {
  return xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))?.[1];
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}
