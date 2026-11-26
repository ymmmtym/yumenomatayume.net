## Project Overview

yumenomatayume.net のブログ管理リポジトリ。
HonoX + Cloudflare Workers で構築されたブログサイトです。

人向けの概要、セットアップ、コマンド、ディレクトリ構成は [README.md](./README.md) を参照してください。

## Agent Guidelines

- README と重複する一般説明は AGENTS.md に追加しない。
- 作業前に関連する `.agents/skills/*/SKILL.md` を確認する。
- エージェント向けの設定は `AGENTS.md` と `.agents/skills/` の 2 つだけを置く。特定のエージェント専用のディレクトリや別名ファイル（`.claude/skills`、`CLAUDE.md` など）は作らない。`.agents/skills` は Copilot（CLI / VS Code / coding agent）、Codex、OpenCode が直接読む共通の置き場。
- ブログ記事は `app/content/blog/`、記事画像は `public/images/` を使用する。
- 実装後は変更範囲に応じて `bun run build` などで検証する。

## Skills

Content management workflows are managed as repository skills:

- `.agents/skills/linear-issue-blog-article/SKILL.md`
- `.agents/skills/article-proofreading/SKILL.md`
- `.agents/skills/ui-ux-enhancement/SKILL.md`
