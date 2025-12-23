---
title: "自宅のグローバル IP アドレスを確認する方法 🌐"
description: "自宅のグローバル IP を簡単に確認できる CLI コマンドやサイトを実際に試してまとめました！"
pubDate: "2022-09-08"
heroImage: ""
tags: ["network", "cli", "tips"]
---

こんにちは！今回は自宅のグローバル IP アドレスを確認する方法について、実際に試してみた結果をまとめてみました 📝

リモートワークが増えた今、VPN 接続やセキュリティ設定で自分の IP アドレスを知りたい場面って結構ありますよね。そんな時に役立つ方法をいくつか紹介します！

> ⚠️ **注意**: 本記事の検証は `public-nat-02.vpngate.v4.open.ad.jp(219.100.37.234)` に VPN 接続した状態で行っています。

## 🌐 ブラウザで確認できるサイト

### CMAN - 老舗の定番サイト
[CMAN](https://www.cman.jp/network/support/go_ip.cgi) は昔からある定番サイトです。シンプルで使いやすく、アクセスするだけで即座に IP アドレスが表示されます。

### VPN Gate - VPN 利用者におすすめ
[VPN Gate](https://www.vpngate.net/ja/) は筑波大学が運営する VPN サービスですが、IP 確認機能も提供しています。VPN を使っている方には特におすすめです 👍

### my.ip.fi - シンプルイズベスト
[my.ip.fi](https://my.ip.fi/) はフィンランドのサイトで、とてもシンプルな作りが特徴です。余計な情報がなく、IP アドレスだけをサクッと確認したい時に便利です。

## 💻 CLI で確認する方法

エンジニアなら CLI で確認したいですよね！以下のコマンドが便利です。

### ipify API - JSON レスポンスが嬉しい
[ipify](https://www.ipify.org/) は API が充実していて、プログラムから利用しやすいのが特徴です。

```bash
# JSON 形式で取得
$ curl 'https://api.ipify.org?format=json'
{"ip":"219.100.37.234"}

# テキスト形式で取得（デフォルト）
$ curl 'https://api.ipify.org'
219.100.37.234
```

### ifconfig.io - シンプルで高速
[ifconfig.io](https://ifconfig.io/) は非常にシンプルで、レスポンスも高速です。

```bash
# IP アドレスのみ取得
$ curl ifconfig.io
219.100.37.234

# 詳細情報も取得可能
$ curl ifconfig.io/all
```

**制限事項** ⚠️
- 1分間に最大45回のリクエスト
- 無料プランでは SSL 通信が利用できない場合があります

## 🔧 その他の便利な方法

### dig コマンドを使う方法
DNS を使った確認方法もあります：

```bash
$ dig +short myip.opendns.com @resolver1.opendns.com
219.100.37.234
```

### wget を使う方法
curl がない環境では wget も使えます：

```bash
$ wget -qO- ifconfig.io
219.100.37.234
```

## 🎯 まとめ

自宅の IP アドレス確認方法をいくつか紹介しました。用途に応じて使い分けてみてください：

- **ブラウザで手軽に**: CMAN や my.ip.fi
- **API で自動化**: ipify
- **CLI でサクッと**: ifconfig.io
- **DNS を使って**: dig + OpenDNS

どの方法も簡単なので、ぜひ試してみてくださいね！ 😊

セキュリティ上の理由で IP アドレスを定期的にチェックしたい場合は、これらの API を使ってスクリプト化するのもおすすめです 🚀
