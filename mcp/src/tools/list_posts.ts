import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchPosts } from "../feed.js";

const InputSchema = z.object({
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
});

type Input = z.infer<typeof InputSchema>;

export function registerListPosts(server: McpServer): void {
  server.registerTool(
    "blog_list_posts",
    {
      title: "ブログ記事一覧の取得",
      description: `yumenomatayume.net のブログ記事一覧をRSSフィードから取得します。

Returns:
  {
    "total": number,        // 全記事数
    "count": number,        // 今回返した件数
    "offset": number,       // 現在のオフセット
    "has_more": boolean,    // 次ページがあるか
    "posts": [
      {
        "title": string,        // 記事タイトル
        "url": string,          // 記事URL
        "publishedAt": string,  // 公開日時 (ISO 8601)
        "description": string,  // 概要（最大200文字）
        "tags": string[]        // タグ一覧
      }
    ]
  }

Examples:
  - 最新20件を取得: limit=20, offset=0
  - 21件目以降を取得: limit=20, offset=20`,
      inputSchema: InputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, offset }: Input) => {
      const allPosts = await fetchPosts();
      const sliced = allPosts.slice(offset, offset + limit);

      const output = {
        total: allPosts.length,
        count: sliced.length,
        offset,
        has_more: allPosts.length > offset + sliced.length,
        posts: sliced,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    }
  );
}
