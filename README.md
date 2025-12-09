# yumenomatayume.net

HonoX + Cloudflare Pages で構築されたブログサイト

## Tech Stack

- [HonoX](https://github.com/honojs/honox) - Hono ベースのメタフレームワーク
- [Cloudflare Workers](https://pages.cloudflare.com/) - ホスティング
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [MDX](https://mdxjs.com/) - Markdown + JSX
- [Cloudinary](https://cloudinary.com/) - 画像管理

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

## Image Upload

`public/images` に配置された画像を Cloudinary にアップロードし、記事内のリンクを自動で置き換えます:

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
│   ├── content/         # MDX 記事
│   ├── components/      # React コンポーネント
│   ├── style.css        # グローバルスタイル
│   ├── client.ts        # クライアントエントリー
│   └── server.ts        # サーバーエントリー
├── public/              # 静的ファイル
│   └── images/          # 画像ファイル
├── scripts/             # ユーティリティスクリプト
│   ├── upload-and-replace.ts
│   └── upload-single.ts
└── dist/                # ビルド出力
```

## Scripts

- `dev` - 開発サーバー起動
- `build` - プロダクションビルド
- `preview` - ローカルプレビュー (Wrangler)
- `deploy` - Cloudflare Pages にデプロイ
- `upload` - 画像を Cloudinary にアップロード

## License

Private
