import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchPosts, fetchPostContent } from "../feed.js";
import { SITE_URL, CHARACTER_LIMIT } from "../constants.js";

const InputSchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith(SITE_URL), {
      message: `URLは ${SITE_URL} で始まる必要があります`,
    })
    .describe(`取得する記事のURL (例: ${SITE_URL}/blog/some-post)`),
});

type Input = z.infer<typeof InputSchema>;

function truncateAtLimit(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > limit * 0.8 ? lastSpace : limit;
  return text.slice(0, cut) + "\n\n[コンテンツが長すぎるため省略されました]";
}

export function registerGetPost(server: McpServer): void {
  server.registerTool(
    "blog_get_post",
    {
      title: "ブログ記事の本文取得",
      description: `指定したURLのブログ記事の本文をプレーンテキストで取得します。

Args:
  - url: 記事のURL。blog_list_posts や blog_search_posts で取得したURLを使用してください。
         必ず ${SITE_URL} で始まるURLを指定してください。

Returns:
  {
    "title": string,        // 記事タイトル
    "url": string,          // 記事URL
    "publishedAt": string,  // 公開日時 (ISO 8601)
    "tags": string[],       // タグ一覧
    "content": string       // 記事本文（プレーンテキスト）
  }

Error Handling:
  - 存在しないURLを指定した場合: "記事が見つかりません" エラーを返します
  - ネットワークエラーの場合: "コンテンツの取得に失敗しました" エラーを返します`,
      inputSchema: InputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ url }: Input) => {
      // RSSから記事メタデータを取得
      const allPosts = await fetchPosts();
      const meta = allPosts.find((p) => p.url === url);

      if (!meta) {
        return {
          content: [{ type: "text" as const, text: `記事が見つかりません: ${url}` }],
          isError: true,
        };
      }

      const rawContent = await fetchPostContent(url);
      const content = truncateAtLimit(rawContent, CHARACTER_LIMIT);

      const output = {
        title: meta.title,
        url: meta.url,
        publishedAt: meta.publishedAt,
        tags: meta.tags,
        content,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    }
  );
}
