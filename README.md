# yumenomatayume.net

HonoX + Cloudflare Workers で構築されたブログサイトです。
記事は MDX で管理し、画像は Cloudinary で最適化します。

エージェント向けの作業ルールは [AGENTS.md](./AGENTS.md) を参照してください。

## Tech Stack

- [HonoX](https://github.com/honojs/honox) - Hono ベースのメタフレームワーク
- [Cloudflare Workers](https://workers.cloudflare.com/) - ホスティング
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [MDX](https://mdxjs.com/) - Markdown + JSX
- [Cloudinary](https://cloudinary.com/) - 画像管理
- [Prism.js](https://prismjs.com/) - シンタックスハイライト

## Features

- MDX による記事作成
- Frontmatter サポート
- シンタックスハイライト (Prism.js)
- RSS フィード
- サイトマップ
- Cloudinary による画像最適化

## Setup

```bash
bun install
```

### 前提条件

- Node.js 22.12.0 以上（`bun run preview` / `bun run deploy` で使用する Wrangler がこのバージョンを要求します。ビルド自体はこれより古い Node.js でも動作します）

### 環境変数

Cloudinary を使用する場合は以下の環境変数を設定:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=yumenomatayume.net  # optional
```

または `CLOUDINARY_URL` を使用:

```bash
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Development

```bash
bun run dev
```

http://localhost:5173 でアクセス

## Build

```bash
bun run build
```

## Preview

```bash
bun run preview
```

## Deploy

```bash
bun run deploy
```

## Ads

Google AdSense の自動広告を利用しています。読み込みタグは `app/routes/_renderer.tsx` にあります。

以下のページでは広告を読み込みません（薄いページやフォーム、法務ページへの配信はポリシー違反になり得るため）。

| パス | 理由 |
| --- | --- |
| `/contact` | お問い合わせフォーム |
| `/privacy` | プライバシーポリシー |
| `/form` | `/contact` の旧 URL |
| `/blog/tag/*` | タグ別の薄い一覧ページ |
| 404 を含む `noindex` ページ | インデックス対象外のため |

判定は `app/utils/ads.ts` の `isAdExcludedPath` と、各ページの `noindex` 指定で行います。除外対象を変更する場合は `isAdExcludedPath` のパターンを更新してください。

## Image Upload

`public/images/` に配置された画像を Cloudinary にアップロードし、記事内のリンクを自動で置き換えます。

```bash
bun run upload
```

処理内容:

1. `public/images` 内の画像を Cloudinary にアップロード
2. 最適化された URL を生成 (`f_auto,q_auto`)
3. `app/content` 内の MDX ファイルで参照されている画像パスを Cloudinary URL に置き換え

## Project Structure

```
.
├── app/
│   ├── routes/          # ルーティング
│   ├── content/blog/    # MDX 記事
│   ├── components/      # React コンポーネント
│   ├── utils/           # ユーティリティ
│   ├── style.css        # グローバルスタイル
│   ├── client.ts        # クライアントエントリー
│   └── server.ts        # サーバーエントリー
├── public/              # 静的ファイル
│   └── images/          # 画像ファイル
├── scripts/             # ユーティリティスクリプト
│   ├── upload-and-replace.ts
│   └── upload-single.ts
├── .claude/skills/      # エージェント向けスキル定義
└── dist/                # ビルド出力
```

## Scripts

- `dev` - 開発サーバー起動
- `build` - プロダクションビルド
- `preview` - ローカルプレビュー (Wrangler)
- `deploy` - Cloudflare Workers にデプロイ
- `typecheck` - 型チェック (`tsc --noEmit`)
- `lint` - Lint (oxlint)
- `upload` - 画像を Cloudinary にアップロード

## License

Private
