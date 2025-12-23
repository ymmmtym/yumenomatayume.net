---
title: "Qiita の記事を markdown で一括取得するコマンド 📝"
description: "Qiita API を使って自分の投稿記事を markdown 形式で一括ダウンロードする方法"
pubDate: "2021-08-17"
tags: ["qiita","markdown","blog"]
---

Qiita の記事を markdown 形式で一括取得する方法をご紹介します 📝 ブログの移行や記事のバックアップに便利です。

## Qiita の markdown 表示機能

Qiita では、記事 URL の最後に `.md` をつけることで、記事の markdown を表示できます ✨

### 例

- **通常の記事**: [Mac起動音のOn(Off)に切り替える方法 - Qiita](https://qiita.com/yumenomatayume/items/69ef0911d9a46145dfd5)
- **markdown 表示**: [Mac起動音のOn(Off)に切り替える方法 - Qiita (markdown表示)](https://qiita.com/yumenomatayume/items/69ef0911d9a46145dfd5.md)

この機能を利用して、自分が投稿した記事の markdown を一括で取得してみます 🚀

## 前提条件

以下の条件を満たしている必要があります：

- **ファイル名**: `記事タイトル.md` 形式で保存 📄
- **記事タイトル**: `/` が含まれていないこと ⚠️
- **必要なコマンド**:
  - `jq` - JSON パーサー
  - `nkf` - 文字コード変換ツール
  - `curl` - HTTP クライアント

### 必要なツールのインストール

```bash
# macOS の場合
brew install jq nkf

# Ubuntu の場合
sudo apt install jq nkf curl
```

## 一括取得コマンド

以下のスクリプトで、指定したユーザーの記事を一括取得できます：

```bash
USERNAME=yumenomatayume # ユーザー名を指定

# Qiita API から記事一覧を取得
articles=$(curl -s "https://qiita.com/api/v2/users/${USERNAME}/items?per_page=100" | jq -r ".[].url")

# 各記事の markdown を取得してファイルに保存
for article in $articles; do
  # 記事タイトルをファイル名として取得
  file=$(echo "$(curl -s $article.md | grep '^title:' | sed -E 's/^title: //g').md" | nkf -w --url-input)
  
  # markdown をファイルに保存
  curl -s $article.md > "$file"
  echo "保存完了: $file"
done
```

### 100記事以上の場合

投稿記事が100個以上の場合は、ページネーションを使用します：

```bash
# 2ページ目以降を取得
curl -s "https://qiita.com/api/v2/users/${USERNAME}/items?per_page=100&page=2"
```

## GitHub Actions での自動化

上記のスクリプトを GitHub Actions で自動実行するリポジトリを作成しました 🤖

[ymmmtym/qiita: Qiita Articles](https://github.com/ymmmtym/qiita)

### 特徴

- **1時間ごと**に自動実行 ⏰
- **新しい記事**を自動で取得
- **Git で履歴管理**

### GitHub Actions の設定例

```yaml
name: Fetch Qiita Articles

on:
  schedule:
    - cron: '0 * * * *'  # 1時間ごと
  workflow_dispatch:     # 手動実行も可能

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch articles
        run: |
          # 上記のスクリプトを実行
```

## 活用方法

- **ブログ移行**: Qiita から他のプラットフォームへの移行 🔄
- **バックアップ**: 記事の定期的なバックアップ 💾
- **分析**: 記事の内容分析や統計取得 📊
- **再利用**: 他の形式での記事公開 📤

## まとめ

Qiita API と markdown 表示機能を組み合わせることで、簡単に記事を一括取得できます 💡 GitHub Actions と組み合わせれば、完全自動化も可能です。

## 参考文献

- [自分の Qiita の投稿を markdown で全て手元に落とす](https://dev.to/nekottyo/qiita-markdown-5dbp)