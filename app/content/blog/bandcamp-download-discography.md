---
title: "Bandcamp で購入した曲を一括でダウンロードする方法 🎵"
description: "Bandcamp でアルバムをまとめて購入した時、一括 DL ができなくて困っています。Chrome のデベロッパーツールから html を読み取り、ダウンロード URL の一覧を取得して、一括で DL してみます。（力技）"
pubDate: "2022-10-06"
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/bandcamp-purchased?_a=BAMAMiFE0"
tags: ["bandcamp", "html", "chrome", "music"]
---

Bandcamp で音楽を買うのが好きなんですが、一つだけ困ることがあります。それは**一括ダウンロードができない**こと！😭

![Bandcampの購入済みアイテムページ](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/bandcamp-purchased?_a=BAMAMiFE0)

見てください、この画面。一つ一つ「ダウンロード」をポチポチクリックしないといけないんです。

たまにディスコグラフィー（アーティストの全作品集）を買うことがあるんですが、そうすると100個を超えるアイテムをダウンロードすることになって...「これを手動でクリックするなんて正気じゃない！」と思ったので、**力技で一括ダウンロード**する方法を編み出しました 💪

## 必要なもの

- **Webブラウザ**：Google Chrome
- **ダウンローダー**：Synology NAS の Download Station

ダウンローダーは複数のURLを一度に処理できるものなら何でもOKです！

## 一括ダウンロードの方法

### 方法1：Chrome拡張機能を使う

[Link Grabber](https://chrome.google.com/webstore/detail/link-grabber/kclfkfmdadgcejkobfomlOPiikdKjDgo) というChrome拡張機能が便利です。これを使うとWebページ内のリンクを全部リスト化してくれます。

Bandcampの購入ページで実行するとこんな感じ：

![Link Grabberの実行結果](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/link-grabber-downloads?_a=BAMAMiFE0)

この中からダウンロードURLを抽出していきます。

### 方法2：HTMLから直接抽出する（おすすめ）

こっちの方が確実です！Bandcampの購入ページでChromeのデベロッパーツールを開いて、Elementsタブに移動します。

![Chromeのデベロッパーツール](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/bandcamp-purchased-chrome-developer-tool?_a=BAMAMiFE0)

HTMLを見ると、`<div class="download">` の中の `<ul>` にダウンロードアイテムの一覧があります。さらに深く見ていくと、`<div class="format-container">` の中に `<span><a href="ダウンロードURL">` というタグがあることがわかります。

このURLを全部取得するために：

1. `<ul class="downloads">` のコードを選択してコピー（Ctrl+C）
2. コピーした内容を `downloads.html` というファイルに保存
3. シェル芸でURLだけ抽出！

```bash
❯ grep '<a class="item-button"' downloads.html | cut -f 8 -d '"'
https://p4.bcbits.com/download/album/1b3807876f4b3176f326858cce590da2f/mp3-320/3783528176?id=3783528176&amp;sig=805f41a9e435f100eebf911dc60122c4&amp;sitem_id=214863294&amp;token=1665584821_d8a63afajs7897fsaf0d066ea2650c8fdd094676
https://p4.bcbits.com/download/album/11619baaee7d86b34056e58d0211468f0/mp3-320/4115599833?id=4115599833&amp;sig=019cfce27d467c0785dd1daa16e09ccf&amp;sitem_id=214863298&amp;token=1665584857_bbbfdsa7890aflkr314r908u9aujfao980756017

# 以下続く...
```

### URLリストから一括ダウンロード

URLの一覧が取得できたら、あとはDownload Stationにぶち込むだけ！「URLを入力」にURL一覧をコピペして「OK」をクリックします 🔥

![Synology Download StationにURLを貼り付け](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-nas-download-station-task?_a=BAMAMiFE0)

**注意**：一度に読み込めるURLは50個までなので、多い場合は何回かに分けて処理する必要があります。

ファイルが多すぎるせいか、途中で何度かエラーが出ました 😅

![Download Stationのエラー](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-nas-download-station-task-error?_a=BAMAMiFE0)

でも諦めずにリトライを繰り返して、最終的にダウンロード完了！🎉

![Download Stationの完了画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-nas-download-station-completed?_a=BAMAMiFE0)

今回は44アイテムあったので、全部完了していることを確認しました ✅

## おわりに

正直、Bandcamp側で公式に一括ダウンロード機能を実装してほしいです...😭 でもそれまではこの方法で乗り切ります！

同じような悩みを抱えている音楽好きの方の参考になれば嬉しいです 🎶
