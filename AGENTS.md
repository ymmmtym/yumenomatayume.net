# yumenomatayume.net Blog Management Agents

ブログ記事作成を支援するエージェントの定義と運用ガイドラインです。

詳細なプロジェクト設定については [README.md](./README.md) を参照してください。

---

## Content Management Agents

### 1. Linear Issue to Blog Article

**トリガー:** `linear の [ISSUE-ID] からブログ記事を書いて` または `create blog from linear [ISSUE-ID]`

**Workflow:**
1. Linear issue の詳細を取得
2. issue 内の画像を `public/images/` にダウンロード
3. 既存記事の形式に合わせて `app/content/blog/` にブログ記事を作成
4. 文章を校正
5. 画像パスを記事内で適切に参照
6. Linear の `gitBranchName` を使用してブランチを作成
7. 記事ファイルをコミット（メッセージ：`feat: [記事タイトル] の記事を追加`）
8. PR を作成（ユーザーが記事内容を確認後にマージ）
9. マージは `gh pr merge -md --auto` コマンドを実行する
10. **マージ完了後、Linear issue にコメントで公開報告（PR と記事 URL を含む）**

**Settings:**
| 項目 | 値 |
|------|-----|
| Blog directory | `app/content/blog/` |
| Image directory | `public/images/` |
| Article format | MDX with frontmatter |
| File naming | `{issue-title-kebab-case}.md` |
| Image naming | `{descriptive-name}.png` |

---

### 2. Article Proofreading Agent

**トリガー:** `記事を校正して` または `全記事の校正をして`

**校正基準:**
- タイトル末尾に絵文字追加（統一感のため）
- ですます調への統一
- 絵文字を適度に使用（親しみやすさ向上）
- 読みやすい文章構造
- description の追加（SEO 向上）

---

### 3. UI/UX Enhancement Agent

**トリガー:** `UI を改善して` または `デザインを変更して`

**Recent Implementations:**
- タグ一覧の折りたたみ機能 (`details`要素使用)
- ダークモード対応
- レスポンシブデザイン
- 記事カードのホバーエフェクト

**CSS Guidelines:**
- Tailwind CSS v4 使用
- `@theme` ブロックにはカスタムプロパティのみ
- 通常の CSS ルールは `@theme` ブロック外に記述

---

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

---

## Writing Style

- ですます調で統一
- 絵文字を適度に使用
- 技術記事は具体例とコード例を含める
- 読者にとって分かりやすい構造

---

## Tag Management

- タグ一覧はデフォルト非表示 (`details`要素)
- 記事カードでは最初の 3 つのタグのみ表示
- タグページでの記事フィルタリング対応

---

## Development Workflow

### Branch Naming Convention

Feature branches: `issue/{issue-number}`

```
Example: issue/1, issue/2, issue/3
```

### Git Workflow

1. Create branch: `git checkout -b issue/1`
2. Commit with reference: `git commit -m "feat: 機能名 (#1)"`
3. Push and create PR: `gh pr create --title "機能名" --body "Closes #1"`
4. PR merge automatically closes the issue

### Commit Message Format

| 種類 | フォーマット |
|------|-------------|
| 新機能 | `feat: 新機能 (#issue-number)` |
| バグ修正 | `fix: バグ修正 (#issue-number)` |
| ドキュメント | `docs: ドキュメント更新 (#issue-number)` |
| スタイル調整 | `style: スタイル調整 (#issue-number)` |

### Commit Best Practices

- メッセージは英語で記述
- **機能ごとに細かくコミット** - 1 つのコミットは 1 つの機能や修正に集中
- 複数の変更がある場合は `git reset` で分割してコミット
  - 例：SearchBox 作成、Header 統合、CSS 追加を別々のコミットに分ける
- コミットメッセージは変更内容を具体的に記述
- **記事追加時は簡潔な 1 行メッセージ** - プライベートツール（Linear 等）の詳細情報は不要
- 記事追加の場合は `"Add [article-topic] article"` 形式で十分（内容は記事を見れば分かるため）

---

## Contact & Links

- **Email:** [yumenomatayume@yumenomatayume.net](mailto:yumenomatayume@yumenomatayume.net)
- **GitHub:** [@ymmmtym](https://github.com/ymmmtym)
- **Blog:** [https://yumenomatayume.net](https://yumenomatayume.net)
