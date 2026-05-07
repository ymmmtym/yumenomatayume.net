---
title: "GitHub Fork 元リポジトリからブランチを作成する方法 🔀"
description: "GitHub で fork 元リポジトリからブランチを作成します。fork したリポジトリに PR を送りたくない変更が含まれている場合は、元リポジトリからブランチを作成します。"
pubDate: "2022-09-23"
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/git-switch-from-fork?_a=BAMAMiFE0"
tags: ["git", "github"]
---

GitHubでforkしたリポジトリがあるんですが、fork元リポジトリのブランチを作成元として、forkしたリポジトリに新規ブランチを作成する方法を紹介します！

## そもそも fork とは？ 🤔

https://docs.github.com/ja/get-started/quickstart/fork-a-repo

そもそもforkとは、**ユーザーが管理するリポジトリのコピー**を作成することです。

OSSなど、ユーザー自身が管理していないリポジトリは直接変更することができません。そのため一度forkしてユーザー自身が管理するリポジトリを作成します。forkしたリポジトリに対してユーザー自身で変更を加え、fork元リポジトリに対してPRを作成してマージされることで、OSSにコントリビュートできます ✨

https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks

## なぜ fork 元からブランチを作成するのか？

fork した目的が「**OSS にコントリビュートすること**」であれば、fork 元からブランチを作成する必要は基本的にありません。なぜなら、fork したリポジトリに加えた変更は、fork 元にマージされてほしい内容のみになっているからです。
ではどのような時に fork 元からブランチを作成する必要があるでしょうか。
「**fork したリポジトリを個人用途向けにカスタマイズをしている**」場合です。fork 元にマージされて欲しくない内容が main ブランチにコミットされています。
easy-notion-blog（本ブログ）もそうですが、以下を実現するために fork したリポジトリを運用しています。

- 個人用途向けにカスタマイズしたい
- fork 元の更新を取り込みたい

## 検証環境

前置きが長くなりました。
最近 fork した easy-notion-blog を例に説明します。具体的には以下のような環境で試してみます。

| | 作成元 | 作成先 |
| :--- | :--- | :--- |
| リポジトリ | otyo/easy-notion-blog | ymmmym/easy-notion-blog |
| ブランチ | main | feature/test |

ちなみにブラウザ上では以下の画面の「New branch」から作成できます。

![Git でフォークから元リポジトリに切り替える手順](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/git-switch-from-fork?_a=BAMAMiFE0)

## ローカルリポジトリでの方法

ローカルリポジトリで同様のことをやってみます。
fork したリポジトリに移動して `git remote` で remote リポジトリの一覧を確認します。

```bash
❯ git remote -v
origin  ssh://git@github.com/ymmmtym/easy-notion-blog.git (fetch)
origin  ssh://git@github.com/ymmmtym/easy-notion-blog.git (push)
```

ここでは、origin（fork 先）の情報しか登録されていないので、upstream（fork 元）を追加して fetch（更新）します。

```bash
git remote add upstream ssh://git@github.com/otoyo/easy-notion-blog.git
git fetch upstream
```

upstream が追加されていることを確認します。

```bash
❯ git remote -vv
origin  ssh://git@github.com/ymmmtym/easy-notion-blog.git (fetch)
origin  ssh://git@github.com/ymmmtym/easy-notion-blog.git (push)
upstream        ssh://git@github.com/otoyo/easy-notion-blog.git (fetch)
upstream        ssh://git@github.com/otoyo/easy-notion-blog.git (push)
```

start-point（ブランチの作成元）を `upstream/main` （Upstream の main ブランチ）に設定し、`-c` オプションで作成するブランチ名を指定します。

```bash
git switch upstream/main -c feature/test
```

以上でブランチ作成ができました。
これ以降は通常作業を行い、 `git push origin feature/test` すると自身の GitHub リポジトリにもブランチが作成されます。

```
