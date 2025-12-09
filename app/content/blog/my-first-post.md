---
title: "easy-notion-blog で個人ブログを開設しました 🎉"
description: "ブログ設定の更新履歴を追記してます。"
pubDate: "2022-09-01"
tags: ["easy-notion-blog", "notion", "blog"]
---

ついに個人ブログを開設しました！easy-notion-blogを使って、なんと15分程度で作れちゃいました 😊

## ブログを始めたきっかけ

### Notionでブログの下書きを書く習慣

私はかなりのNotionヘビーユーザーで、ドキュメントやブログの下書きは全部Notionで書いています。PCでもスマホでも、とりあえず思いついたことはNotionにメモする感じです 📝

記事の投稿先は主に個人ブログとZennを使い分けています。個人ブログの方はZennに上げるほどでもない雑なメモが多いです。

参考にしているフローはこちら：
[主な記事の投稿先は個人ブログと zenn です。個人ブログの方は zenn に上げるほどでない雑なメモなどが多いです。ちなみに個人ブログは以下です。](https://zenn.dev/yoshiko/articles/99f187322d8d64)

サービスの使い分けについてはこの記事も参考になります：
[QIITA と ZENN と個人のブログの使い分け](https://zenn.dev/daisuke2029/articles/e64627c2f0f295)

どちらのブログも記事はGitHubで管理しています。ブラウザ上で文章を編集するのが苦手なのと、CI による校正の自動化を実装したいからです 🛠️

### notion-blogを試してみた

こんな環境で続けていたんですが、Notionに作成中の記事がどんどん溜まっていくようになりました 😅

理由は簡単で、NotionからMarkdown形式に書き直してGitを更新する手間が面倒になったからです。

具体的には：
- NotionからコピペしてMarkdown形式の記事を作成
- 埋め込みリンクなどを手作業で修正
- tagなどのメタデータを追加

サイトによって対応しているMarkdown記法が違うので、それに合わせて手作業で修正する必要があります。特に個人ブログの方は「質より早さ」を優先して書きたいこともあったので、Notionページをそのまま記事にしたいと思うようになりました。

そこで見つけたのがnotion-blogです！

使ってみてNotionでブログが作れる凄さを実感しましたが、本格運用はしていませんでした。試しに使ってみる程度だったので、ブログのデザインなどはそのまま放置していました 😅

### easy-notion-blogとの出会い

notion-blogを本格運用していない状態が続く中で、この記事を見かけました：

[Notion でブログ運営、始めませんか？ Zenn や Qiita との両立も](https://zenn.dev/otoyo/articles/a6a7b7440b8a4f)

notion-blogを作成した時は（Vercelを使ったことがなかったのもあり）多少時間がかかったんですが、この記事に「15分ほどで作成できる」と書いてあったので「ちょっと使ってみよう」という軽い気持ちで始めてみました。

結果、本当に15分でブログが完成！これは感動でした ✨

## 参考サイト

- **GitHub Actionsでの変換方法**：Notionページをmarkdown形式に変換する方法もあります
  [Notionに書いたブログ記事をGitHub ActionsでMarkdownに変換してHexoで公開する](https://m-tani.com/2022/01/01/notion-hexo-blog/)

- **Demoサイト**：実際の動作を確認できます
  [easy-notion-blog](https://easy-notion-blog.otoyo.me/)

- **本家ブログ**：easy-notion-blogのアップデート情報や活用方法
  [otoyo.me](https://otoyo.me/)

- **参考記事**：実際に使ってみた感想
  [easy-notion-blogを2ヶ月使い続けて分かった３つのメリット_体験・効率・学習環境](https://www.rasukarusan.com/entry/easy-notion-blog-merit)

### 便利なTips 💡

- Dateを明日以降に設定すると表示されないので、予約投稿もできそうです！

## ブログ設定の更新履歴

本ブログのソースコードは、本家GitHubリポジトリをForkしたものを利用しています。
本家との差分となるコミットの一覧は、以下のページで確認できます：

[https://github.com/otoyo/easy-notion-blog/compare/main...yumenomatayume:easy-notion-blog:main](https://github.com/otoyo/easy-notion-blog/compare/main...yumenomatayume:easy-notion-blog:main)

これからも色々とカスタマイズしていく予定です！🚀
