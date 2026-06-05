import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchPosts } from "../feed.js";

const InputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("タイトル・説明文に対するキーワード検索（部分一致、大文字小文字を無視）"),
  tag: z
    .string()
    .optional()
    .describe("タグによる絞り込み（例: 'Claude Code', 'AWS', 'Kubernetes'）"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("取得する記事数の上限 (1-100, デフォルト: 20)"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("スキップする記事数（ページネーション用, デフォルト: 0）"),
}).refine((d) => d.query !== undefined || d.tag !== undefined, {
  message: "query または tag のどちらか一方は必須です",
});

type Input = z.infer<typeof InputSchema>;

export function registerSearchPosts(server: McpServer): void {
  server.registerTool(
    "blog_search_posts",
    {
      title: "ブログ記事の検索",
      description: `キーワードまたはタグでブログ記事を検索します。query と tag は組み合わせて使用できます。

Args:
  - query (optional): タイトル・説明文に対するキーワード（部分一致）
  - tag (optional): タグ名での絞り込み（完全一致）
  ※ query と tag のどちらか一方は必須

Returns:
  {
    "total_matched": number,  // 条件に合致した全件数
    "count": number,          // 今回返した件数
    "offset": number,
    "has_more": boolean,
    "posts": [
      {
        "title": string,
        "url": string,
        "publishedAt": string,
        "description": string,
        "tags": string[]
      }
    ]
  }

Examples:
  - キーワード検索: query="Kubernetes"
  - タグ検索: tag="Claude Code"
  - 組み合わせ: query="設定", tag="AWS"`,
      inputSchema: InputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ query, tag, limit, offset }: Input) => {
      const allPosts = await fetchPosts();

      const matched = allPosts.filter((p) => {
        const queryMatch =
          query === undefined ||
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase());

        const tagMatch =
          tag === undefined ||
          p.tags.some((t) => t.toLowerCase() === tag.toLowerCase());

        return queryMatch && tagMatch;
      });

      const sliced = matched.slice(offset, offset + limit);

      const output = {
        total_matched: matched.length,
        count: sliced.length,
        offset,
        has_more: matched.length > offset + sliced.length,
        posts: sliced,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    }
  );
}
