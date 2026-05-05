## Project Overview

yumenomatayume.net のブログ管理リポジトリ。
HonoX + Cloudflare Workers で構築されたブログサイトです。

人向けの概要、セットアップ、コマンド、ディレクトリ構成は [README.md](./README.md) を参照してください。

## Agent Guidelines

- README と重複する一般説明は AGENTS.md に追加しない。
- 作業前に関連する `skills/*/SKILL.md` を確認する。
- ブログ記事は `app/content/blog/`、記事画像は `public/images/` を使用する。
- 実装後は変更範囲に応じて `bun run build` などで検証する。

## Skills

Content management workflows are managed as repository skills:

- `skills/linear-issue-blog-article/SKILL.md`
- `skills/article-proofreading/SKILL.md`
- `skills/ui-ux-enhancement/SKILL.md`
