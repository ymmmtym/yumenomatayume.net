---
title: "AWS CLI で「Could not find executable named \"groff\"」というエラーが出た時の対処法 🛠️"
description: "AWS CLI で `help` コマンドを実行した際に「Could not find executable named \"groff\"」というエラーが表示される問題と、その効果的な解決策について解説します。"
pubDate: "2023-04-21"
tags: ["aws", "cli", "groff"]
---

AWS CLI を使っていて、ヘルプを見ようと思ったら突然こんなエラーが出てきました 😅

```bash
❯ aws eks help

Could not find executable named "groff"
```

「groffって何？」って感じですよね。実は `groff` というのは、UNIX系システムでドキュメントを整形するためのツールなんです。AWS CLI の `help` コマンドが内部でマニュアルページを表示するときに使っているんですが、これが見つからないとエラーになってしまいます 💦

特に `asdf` などのツールチェインマネージャーでAWS CLIをインストールした場合によく起こる問題です。私も開発環境を整えているときに遭遇しました。

調べてみると、AWS CLI のバージョンが古くて、`groff` への依存関係が適切に解決されていないことが原因でした。

当時使っていたAWS CLI のバージョンはこちら：

```bash
❯ aws --version
aws-cli/2.4.10 Python/3.8.8 Darwin/22.4.0 exe/x86_64 prompt/off
```

## 解決方法：AWS CLI をアップグレードしよう！ ⬆️

結論から言うと、AWS CLI を最新バージョンにアップグレードすれば解決します！私の環境では `asdf` を使ってAWS CLIを管理していたので、こんな感じで簡単にアップグレードできました：

```bash
asdf install awscli latest
asdf global awscli latest
```

`asdf` って本当に便利ですよね。複数のバージョンを管理できるし、依存関係もちゃんと考慮してくれるので重宝しています 👍

アップグレード後のバージョンを確認してみると：

```bash
❯ aws --version
aws-cli/2.11.19 Python/3.11.3 Darwin/22.4.0 exe/x86_64 prompt/off
```

バージョンが `2.11.19` になりました！そして肝心の `help` コマンドを実行してみると...

```bash
❯ aws eks help

EKS()                                                                    EKS()

NAME
       eks -

DESCRIPTION
       Amazon Elastic Kubernetes Service (Amazon EKS) is a managed service
       that makes it easy for you to run Kubernetes on Amazon Web Services
       without needing to stand up or maintain your own Kubernetes control
       plane. Kubernetes is an open-source system for automating the
       deployment, scaling, and management of containerized applications.
```

やった！ちゃんとヘルプが表示されるようになりました 🎉

## まとめ

AWS CLI で `groff` エラーが出たときは、まずはバージョンアップを試してみてください。特に `asdf` などのバージョンマネージャーを使っている場合は、コマンド一発で解決できることが多いです。

古いバージョンだと依存関係の問題でこういうエラーが出ることがあるんですが、最新版にすれば大抵解決します。開発環境でこういう小さなトラブルに遭遇したときは、まずアップデートを疑ってみるのが良いですね 😊

## 参考

https://qiita.com/KDKK/items/6763c3757d42b938f32c

