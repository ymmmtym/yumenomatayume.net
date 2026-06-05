# yumenomatayume-mcp-server

[yumenomatayume.net](https://yumenomatayume.net) のブログコンテンツを取得・検索する MCP サーバーです。

## Tools

| ツール名 | 説明 |
|---|---|
| `blog_list_posts` | 記事一覧を取得（ページネーション対応） |
| `blog_get_post` | 指定URLの記事本文を取得 |
| `blog_search_posts` | キーワード・タグで記事を検索 |

## Setup

### Claude Code で使う

プロジェクトの `.mcp.json` または `~/.claude.json` に追記：

```json
{
  "mcpServers": {
    "yumenomatayume": {
      "command": "npx",
      "args": ["-y", "yumenomatayume-mcp-server"]
    }
  }
}
```

## Development

```bash
cd mcp
npm install
npm run build
npm start
```

ビルド後に MCP Inspector でテスト：

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```
