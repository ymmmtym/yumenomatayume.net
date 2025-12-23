---
title: "Grok CLI と OpenRouter で無料 LLM コーディングを試してみた結果 🤖"
description: "Grok CLI と OpenRouter を使った対話型コーディングの体験レポートと Gemini CLI との比較"
pubDate: "2025-12-15"
tags: ["ai", "cli", "coding", "grok", "openrouter", "llm"]
---

普段は軽いコーディング作業に無料枠の Gemini CLI を利用していますが、新しい選択肢として Grok CLI を知ったので実際に試してみました 🤖 今回は OpenRouter 経由で Grok を使った対話型コーディングの体験をレポートします。

## 評価基準

以下の観点で Gemini CLI と比較評価しました：

- **返答の質**: 指示に準じた回答をしてくれるか、実際に作成されたコードがエラーなく動くか
- **返答速度**: レスポンスの速さ

## Grok CLI のセットアップ

### インストール

npm で Global Install します：

```bash
npm install -g @vibe-kit/grok-cli
```

### 設定

環境変数で OpenRouter 経由の Grok を設定：

```bash
export GROK_API_KEY="XXXXXX"
export GROK_BASE_URL="https://openrouter.ai/api/v1"
export GROK_MODEL="x-ai/grok-4.1-fast"
```

以前は `x-ai/grok-4.1-fast:free` という無料版がありましたが、記事執筆時には無くなっていたため、有料版の `x-ai/grok-4.1-fast` を使用しました（$1 まで無料で使えます）。

## 実際のテスト

Flask を使った CRUD タスク管理 Web アプリの作成を依頼してみました。

### プロンプト設定

`.grok/GROK.md` に詳細な要求仕様を記載：

```markdown
# タスク：Python/Flask製 CRUDタスク管理Webアプリの作成

以下の手順と要求仕様に基づき、タスク管理Webアプリケーションのコードを作成してください。

## ステップ 1: パッケージのインストール
**uv add** コマンドを使用して、このアプリケーションに必要なパッケージ（**Flask** と **Flask-SQLAlchemy**）をインストールしてください。

## ステップ 2: Webアプリケーションの実装
（詳細な要求仕様を記載）
```

### 結果

Grok CLI を起動して指示を出すと：

```bash
grok
> .grok/GROK.md 通りにアプリを作成して
```

**良かった点:**
- 指示の理解は良好 🎉
- 生成されたコードの品質は悪くない
- 必要なファイル構成を適切に提示

**問題点:**
- CLI でのコマンド実行指示をうまく受け取ってくれない 😅
- `ls` コマンド実行の確認後、処理が進まなくなる
- 実際のファイル作成まで進めることができなかった

## 他の LLM も試してみた

Ollama で複数のモデルも試してみました：

### qwen3
- **返答速度**: 遅い ⏳
- **精度**: 高い ✅

### qwen2.5-coder
- **返答速度**: 爆速 ⚡
- **精度**: JSON レスポンスが返ってきたりと、少し噛み合わない印象 🤔

### deepseek-r1
- **対応状況**: サポートされていない ❌

## 利用コスト

OpenRouter での実際の利用クレジット：

![OpenRouter クレジット使用量](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/openrouter-credit?_a=BAMAMiFE0)

## 総合評価と感想

### 返答の質
- コードの内容自体は悪くない
- 指示の理解度も十分

### 返答速度・使い勝手
- CLI でのコマンド実行が不安定
- 途中で処理が止まることが多い
- 全体的に Gemini CLI の方がストレスなく使える

## 結論

LLM の性能自体は悪くありませんが、**CLI ツールとしての使い勝手は Gemini CLI の方が優秀**でした 💡

無料枠では高精度の細かい作業は難しく、大まかな作業については引き続き Gemini CLI を使用することにしました。

ただし、Grok の性能自体は興味深いので、CLI ツールの改善や無料枠の復活があれば再度検討したいと思います 🚀

## 参考リンク

- [Grok CLI - Conversational AI CLI Tool](https://grokcli.io/)
- [GitHub - superagent-ai/grok-cli](https://github.com/superagent-ai/grok-cli)
- [OpenRouter](https://openrouter.ai/)
