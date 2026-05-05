---
title: "OpenCode を使ってみたら、かなり良かった 🤖"
description: "OpenCode をローカルと GitHub Actions の両方で試してみました。セットアップ手順や料金感、実際に触って感じた使いやすさを個人メモも兼ねてまとめます。"
pubDate: "2026-05-05"
tags: ["AI", "OpenCode", "GitHub Actions", "CLI"]
---

最近、AIコーディングエージェント系のツールをいろいろ触っているのですが、その中で **OpenCode** を試してみました。

第一印象としては、**オープンソースで始めやすく、しかも実用性もちゃんとある** という感じです。ローカルで動かすだけでなく、GitHub Actions と連携して Issue や PR から実行できるのも面白くて、思った以上に使い勝手がよかったです ✨

この記事では、OpenCode の概要、料金感、ローカルでのセットアップ、GitHub Actions 連携、そして実際に使ってみた感想をまとめます。

## OpenCode とは

[OpenCode](https://opencode.ai/) は、オープンソースのAIコーディングエージェントです。

ターミナル（TUI）・デスクトップアプリ・IDE拡張として利用できて、体験としては Claude Code に近い立ち位置のツールです。そのうえで、**複数のLLMプロバイダーを切り替えて使える** のが特徴です。

公式情報はこちらです。

- [公式サイト](https://opencode.ai/)
- [ドキュメント](https://opencode.ai/docs/)
- [GitHub](https://github.com/anomalyco/opencode)

## 料金感

OpenCode 自体は **MIT ライセンスで公開されている完全無料のオープンソース** です。
ただし、実際にモデルを使うには各LLMプロバイダーのAPIキーが必要になります。

現時点では、ざっくり次のような選択肢があります。

| プラン | 料金 | 概要 |
| -- | -- | -- |
| **BYOK（自前APIキー）** | **無料**（APIコストのみ） | OpenAI / Anthropic / Google / DeepSeek などのAPIキーをそのまま使えます |
| **OpenCode Go** | 初月 $5、以降 $10/月 | GLM・Kimi・Qwen・MiniMax などの中国系オープンモデルが使い放題です（上限あり） |
| **OpenCode Zen** | 従量課金（$20〜クレジット購入） | OpenCode がテスト済みの厳選モデルにアクセスできます |
| **OpenCode Black** | 非公開（Enterprise向け） | Claude・GPT・Gemini を含む全モデル向けのプランです |

まず触ってみるだけなら BYOK で十分そうです。DeepSeek API や Gemini の無料枠と組み合わせれば、かなり低コストで試せるのは魅力だと思いました 💡

## ローカルでのセットアップ

セットアップ手順はかなりシンプルでした。

### インストール

```bash
# macOS（推奨）
brew install anomalyco/tap/opencode

# インストールスクリプト（汎用）
curl -fsSL https://opencode.ai/install | bash

# npm
npm install -g opencode-ai
```

### APIキーの設定

```bash
opencode
# TUI内で /connect コマンドを実行
# → プロバイダーを選択してAPIキーを貼り付け
```

### プロジェクトの初期化

```bash
cd /path/to/project
opencode
# TUI内で /init を実行 → AGENTS.md が生成される
```

### 基本操作

| 操作 | キー |
| -- | -- |
| Plan モード（読み取り専用）に切り替え | `Tab` |
| ファイルをファジー検索して参照 | `@` |
| コマンド実行 | `/` |

普段からターミナル中心で作業しているなら、かなり馴染みやすいUIだと思います。余計な重さがなく、さっと試せる感じがよかったです。

## GitHub Actions 連携がけっこう良い

個人的に面白かったのは、**GitHub Actions 連携も簡単に試せる** ところです。

GitHub の Issue や PR のコメントで `/opencode` または `/oc` と入力すると、OpenCode が自動で動きます。

セットアップは次のコマンドで進めます。

```bash
opencode github install
```

これで `.github/workflows/opencode.yml` が作成されます。

Issue コメントでは、たとえばこんな使い方ができます。

```text
/oc このissueの内容を説明して
/oc このバグを修正してPRを出して
```

OpenCode は GitHub Actions ランナー内で動作して、新しいブランチを作成し、PR まで自動で出してくれます。

## 実際に試したこと

GitHub Actions 連携も実際にセットアップして、GitHub Issue 上での呼び出しまで確認してみました。

手元では `/oc` 経由で問題なく動作して、Issue の内容に沿って作業を進められることを確認できました。ここは「本当にちゃんと動くのかな」と少し気になっていた部分だったので、素直に良かったです。

試した対象の1つは [anychat の Issue #10](https://github.com/ymmmtym/anychat/issues/10) です。この Issue に対しても OpenCode から正常に実行できていました。

ローカルで使うだけでなく、GitHub 上のワークフローに自然につなげられるのはかなり便利です。個人開発でも、小さめの自動化に使いやすそうだと感じました。

## 対応プロバイダー

対応しているプロバイダーも幅広いです。

- OpenAI（GPT-4.1シリーズ等）
- Anthropic（Claude）
- Google Gemini
- DeepSeek
- Groq
- AWS Bedrock
- Azure OpenAI
- OpenRouter
- ローカルモデル（Ollama等）

いろいろなモデルを試しながら、自分に合う構成を探しやすいのは大きなメリットです。

## 使ってみた感想

実際に触ってみて、特に印象がよかったのは次の3点です。

- 無料でも十分に試しやすい
- 複数のLLMプロバイダーを切り替えて使える
- GitHub Actions と組み合わせると、Issue や PR から直接動かせて実用的

特に「**まずは気軽に試せる**」というのはかなり大きいです。AIコーディングツールは便利でも、導入時点で制約が多かったり、課金前提で試しづらかったりすることがあります。

その点 OpenCode は、BYOK ですぐ試せて、しかもローカルでも GitHub でも使えるので、入口としてかなり良いと感じました。

Claude Code に近い体験を、よりオープンな構成で試してみたい人には相性がよさそうです 🚀

## まとめ

OpenCode は、**無料で始めやすく、複数プロバイダーに対応していて、ローカル利用から GitHub Actions 連携まで自然につながる** 使い勝手のよいAIコーディングエージェントでした。

個人的には、まずローカルで触ってみて、そのあと GitHub Actions 連携まで試す流れがいちばん楽しめそうだと感じました。気になっていた人は、一度触ってみる価値はありそうです。

## 参考リンク

- [インストール手順](https://opencode.ai/docs/)
- [プロバイダー設定](https://opencode.ai/docs/providers/)
- [GitHub Actions連携](https://opencode.ai/docs/github/)
- [OpenCode Go](https://opencode.ai/go)
- [OpenCode Zen](https://opencode.ai/zen)
