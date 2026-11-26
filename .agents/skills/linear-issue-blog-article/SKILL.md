---
name: linear-issue-blog-article
description: Use when creating a yumenomatayume.net blog article from a Linear issue, including prompts like "linear の [ISSUE-ID] からブログ記事を書いて" or "create blog from linear [ISSUE-ID]".
---

# Linear Issue to Blog Article

## Workflow

1. Linear issue の詳細を取得する。
2. issue 内の画像を `public/images/` にダウンロードする。
3. 既存記事の形式に合わせて `app/content/blog/` に MDX 記事を作成する。
4. 文章を校正する。
5. 画像パスを記事内で適切に参照する。
6. Linear の `gitBranchName` を使用してブランチを作成する。
7. 記事ファイルをコミットする。コミットメッセージは `feat: [記事タイトル] の記事を追加` とする。
8. PR を作成する。ユーザーが記事内容を確認した後にマージする。
9. マージは `gh pr merge -md --auto` を実行する。
10. マージ完了後、Linear issue に PR と記事 URL を含む公開報告コメントを追加する。

## Settings

| 項目 | 値 |
| ---- | ---- |
| Blog directory | `app/content/blog/` |
| Image directory | `public/images/` |
| Article format | MDX with frontmatter |
| File naming | `{issue-title-kebab-case}.md` |
| Image naming | `{descriptive-name}.png` |

## Article Format

```markdown
---
title: "記事タイトル 🎯"
description: "記事の説明文"
pubDate: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
heroImage: "https://cloudinary-url" # optional
---

記事内容...
```
