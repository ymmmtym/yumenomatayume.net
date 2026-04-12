---
title: "vibe-local を試す 🤖"
description: "Ubuntu24.04環境でvibe-local (Ollama + PythonベースのAI coding environment) をインストールして試してみました。"
pubDate: "2026-04-13"
tags: ["ai", "ollama", "ubuntu", "vibe-local"]
---

## はじめに

最近注目のAI coding環境である「vibe-local」を試してみました。vibe-localはOllamaとPythonをベースにした完全ローカル環境のAI coding agentで、クラウドに依存せずにAIアシスタントを利用できる環境です。

## 前提条件

* Ubuntu 24.04 (LXCコンテナ)を使用しています。
* CPU: 16コア
* Memory: 64GB

## 事前準備

rootユーザーではインストールスクリプトを実行できないため、一般ユーザーを作成して切り替えています。

```bash
NAME="ubuntu"

useradd -d /home/${NAME} -m -s /bin/bash ${NAME}
su - ${NAME}
```

## インストール手順

以下のスクリプトを実行してvibe-localをインストールします。

```bash
curl -fsSL https://raw.githubusercontent.com/ochyai/vibe-local/main/install.sh | bash
```

インストールプロセスは以下のステップで進行します：

1. **システムスキャン** - OSとアーキテクチャの検出
2. **メモリ分析** - システムメモリの確認と最適なモデル選択
3. **パッケージインストール** - Ollama、Node.js、Claude Code CLI、Python3のインストール
4. **AIモデルダウンロード** - qwen3-coder:30b (メイン) と qwen3:8b (サイドカー)
5. **ファイル配置** - vibe-coder.pyとコマンドの配置
6. **設定生成** - 設定ファイル作成とPATH追加
7. **システムテスト** - Ollama Server、vibe-coder.py、AIモデルの動作確認

インストールが完了すると、以下のように利用方法が表示されます：

```text
🚀 Usage:

❯ vibe-local                     Interactive mode
❯ vibe-local -p "..."            One-shot
❯ vibe-local --auto              Auto-detect network

⚙️  Settings:
┃ Model:     qwen3-coder:30b
┃ Sidecar:    qwen3:8b
┃ Config:       /home/ubuntu/.config/vibe-local/config
┃ Command:   /home/ubuntu/.local/bin/vibe-local

⚡ Open a new terminal, then run vibe-local ⚡

Or run this in the current terminal:
source /home/ubuntu/.bashrc && vibe-local
```

## 実際の使用感

シェルを読み込んで`vibe-local`を実行すると、初期設定後に対話モードが起動します。最初に「Hello」と入力してみましたが、デフォルトの`qwen3-coder:30b`モデルだと処理が重くてタイムアウトしてしまいました。

その後、モデルを小さくして再試行しました。`qwen3.5:9b`に切り替えて実行してみましたが、それでも重くてプロンプトが返ってきませんでした。

後ほど32GBメモリのMacで`qwen3:8b`を試したところ、そちらの方が動作が早かったという結果になりました。

## まとめ

vibe-localは完全ローカル環境のAI coding環境として興味深いプロジェクトです。Ollamaベースのため、プライバシーを気にせずにAIアシスタントを利用できる点が魅力的です。

ただし、使用するモデルサイズとハードウェアスペックのバランスが重要で、64GBメモリ環境でも`qwen3-coder:30b`は重かったため、実際の使用では`qwen3:8b`やそれ以下の小さなモデルを選択することをおすすめします。

今後は軽量なモデルでの動作確認や、実際のコーディングタスクでの性能評価を行っていきたいと思います。

[vibe-local GitHubリポジトリ](https://github.com/ochyai/vibe-local)
