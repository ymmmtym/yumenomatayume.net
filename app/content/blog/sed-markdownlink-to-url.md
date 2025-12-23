---
title: "VSCode で Markdown 形式で記載されている内容を一括置換する 🔄"
description: "VSCode の正規表現を使って Markdown リンクを URL 形式に一括変換する方法"
pubDate: "2021-09-10"
tags: ["vscode","markdown","正規表現"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/sed-markdown-link-demo?_a=BAMAMiFE0"
---

<!-- DOCTOC SKIP -->

記事を投稿するとき、参考文献をリストで記載しています 📝

```markdown
## Reference（参考文献）

- [リモートで消されたブランチが手元で残ってしまう件を解消する - Qiita](https://qiita.com/yuichielectric/items/84cd61915a1236f19221)
- [【Git】git push --delete origin {削除したいリモートブランチ名} →リモートブランチの削除 - Qiita](https://qiita.com/megu_ma/items/7533b4327dc110a9e2b8)
```

## 課題

Zenn や Qiita にあげるときは、リンクカードで表示させたいので、URL 形式に戻したい時があります 🔗

## 解決方法

![sed コマンドでMarkdownリンクを変換するデモ](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/sed-markdown-link-demo?_a=BAMAMiFE0)

VSCode の正規表現機能を使って一括置換します ⚡

### 置換設定

- **検索**: `- \[.*\]\((.*)\)` 🔍
- **置換**: `$1\n` ✏️

### 正規表現の説明

- `- \[.*\]`: リストの先頭とリンクテキスト部分にマッチ
- `\((.*)\)`: URL 部分をキャプチャグループとして取得
- `$1\n`: キャプチャした URL を改行付きで出力

## 結果

一括で置換するのはとても気持ちいいです 😊 この方法により、Markdown 形式のリンクリストを素早く URL リストに変換できます。

## 活用場面

- **記事の移植**: 異なるプラットフォーム間での記事移行 📤
- **リンク整理**: 参考文献の形式統一 📚
- **データ変換**: Markdown から他の形式への変換 🔄

## まとめ

VSCode の正規表現機能を活用することで、繰り返し作業を効率化できます 💡 特に大量のリンクを扱う際には、この方法が非常に有効です。