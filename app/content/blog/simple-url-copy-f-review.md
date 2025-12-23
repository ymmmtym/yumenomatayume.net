---
title: "URL を自由なフォーマットでコピーできる Chrome 拡張機能「Simple URL Copy [F]」の使い方 🔗"
description: "ブラウザで開いているページの URL を Markdown や Scrapbox などの形式で簡単にコピーできる Chrome 拡張機能の紹介"
pubDate: "2021-08-21"
tags: ["chrome","作業効率化"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/simple-url-copy-eyecatch?_a=BAMAMiFE0"
---

ブラウザで開いているページの URL を自由なフォーマットでクリップボードにコピーできる便利な Chrome 拡張機能をご紹介します ✨

## Simple URL Copy [F] とは

[Simple URL Copy [F]](https://chrome.google.com/webstore/detail/simple-url-copy-f/kmkdfdfknlkjbmgdenhpeckpdafojnfo)

Simple URL Copy [F] とは、[Simple URL Copy](https://chrome.google.com/webstore/detail/simple-url-copy/cefkgjbbpagcilodnhboolbppdjlplip) という Chrome 拡張機能のフォーク（改良版）です 🚀

ブラウザで開いているページの URL を**自由なフォーマット**でクリップボードにコピーできます。

## 対応フォーマット例

たとえば、**Markdown** や **Scrapbox**、**はてなブログ（埋め込み）**は、以下の形式で URL を記載します：

- **Markdown**: `[ページのタイトル](URL)` 📝
- **Scrapbox**: `[ページのタイトル URL]` 📋
- **はてなブログ（埋め込み）**: `[URL:embed:cite]` 📰

この拡張機能を使うことで、上記の形式をワンクリックでコピーできます 🎯

## 使い方

### 基本的な操作

拡張機能のアイコンをクリックするか、ショートカットキーを押下すると、設定した形式をコピーできます：

- **Mac**: `Ctrl` + `Shift` + `C` ⌨️
- **Windows**: `Ctrl` + `Shift` + `K` ⌨️

デフォルトでは一番左上の形式がコピーされるので、他の形式をコピーしたいときは選択してクリックします 👆

![Simple URL Copy [F] のアイキャッチ画像](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/simple-url-copy-eyecatch?_a=BAMAMiFE0)

## 設定方法

### オプション画面へのアクセス

拡張機能のアイコンをクリック（もしくはショートカットキー）して、「**OPTION**」をクリックします 🔧

![Simple URL Copy [F] のメイン画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/simple-url-copy-interface?_a=BAMAMiFE0)

### カスタマイズ

設定画面が開きますので、ここで好きなようにカスタマイズできます ⚙️

![Simple URL Copy [F] のオプション設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/simple-url-copy-options?_a=BAMAMiFE0)

### 設定項目の説明

- **`{title}`**: サイトのタイトルが入ります 📄
- **`{url}`**: サイトの URL が入ります 🌐
- **「有効」チェック**: チェックを入れると、コピー時に表示されます ✅
- **順序**: 一番上のものが、デフォルトでコピーされる形式になります 🔝

## 設定のバックアップ・復元

### エクスポート

「**EXPORT**」をクリックすると、JSON 形式でクリップボードにコピーされます 💾

設定例（見やすいように改行していますが、実際はワンラインです）：

```json
[
  [
    "Scrapbox Style",
    "[{title} {url}]",
    true
  ],
  [
    "Markdown Style",
    "[{title}]({url})",
    true
  ],
  [
    "Hatena embed Style",
    "[{url}:embed:cite]",
    true
  ],
  [
    "gist-it",
    "<script src=\"https://gist-it.appspot.com/{url}\"></script>",
    true
  ],
  [
    "Simple (Title URL)",
    "{title} {url}",
    true
  ],
  [
    "Simple /w Breakline",
    "{title}\\n{url}",
    true
  ]
]
```

### インポート

「**IMPORT**」から上記の JSON を読み込むことで設定を復元できます 📥 バックアップとして保存しておくと便利です。

## 活用場面

- **ブログ執筆**: 参考リンクを Markdown 形式で挿入 ✍️
- **ドキュメント作成**: 技術文書に URL を適切な形式で追加 📚
- **メモアプリ**: Scrapbox や Notion などでのリンク共有 📝
- **SNS 投稿**: 整理された形式でのリンク共有 📱

## まとめ

Simple URL Copy [F] は、日常的に URL をコピー＆ペーストする作業を大幅に効率化してくれる優秀な拡張機能です 💡 特に技術系のブログを書く方や、ドキュメント作成が多い方には非常におすすめです 🚀