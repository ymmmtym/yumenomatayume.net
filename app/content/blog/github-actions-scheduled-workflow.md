---
title: "GitHub Actions の schedule が停止した時の再開方法 ⏰"
description: "60日間活動がないと停止する GitHub Actions のスケジュール実行を再開する方法と対策"
pubDate: "2021-08-19"
tags: ["github","github-actions"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/github-actions-scheduled-1?_a=BAMAMiFE0"
---

GitHub Actions に schedule を設定しているリポジトリに、**60日間活動がないと workflow が停止**します 😵

実際に、私も[こちら](https://github.com/ymmmtym/templates/actions/workflows/update_submodules.yml)のリポジトリで schedule を設定しているのですが、ふとした時に停止していることに気づきました 💦

止まってしまった workflow を再開する方法をご紹介します。

## 停止の仕組み

GitHub Actions では、以下の条件で自動的に workflow が停止されます：

- **60日間リポジトリに活動がない** 📅
- **schedule で実行される workflow のみ対象** ⏰
- **手動実行や push トリガーは対象外** ✅

## 再開方法

### 1. Actions タブにアクセス

リポジトリにアクセスして、**Actions** タブより該当の workflow を選択しましょう 🔍

![GitHub Actions のスケジュール実行設定画面 1](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/github-actions-scheduled-1?_a=BAMAMiFE0)

### 2. Enable workflow をクリック

もう少し拡大すると以下のようになります：

![GitHub Actions のスケジュール実行設定画面 2](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/github-actions-scheduled-2?_a=BAMAMiFE0)

「60日間活動がなかったので、schedule された workflow を停止しました。」という警告とともに、右の方には **「Enable workflow」** をクリックできるようになっています ✨

この「Enable workflow」をクリックすることで、schedule workflow を再開させることができます 🚀

## 停止しないための対策

workflow を停止させないためには、何らかの活動をする必要があります 💡 本来であれば、「草を生やす（commit する）」を続けることが望ましいですが、どうしても放置して自動運用する場合もあるかと思います。

その場合の対応策について考えてみます：

### 1. push する

任意のブランチに push する action には、以下がオススメです 📤

https://github.com/ad-m/github-push-action

```yaml
- name: Push changes
  uses: ad-m/github-push-action@master
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    branch: main
```

### 2. Pull Request を送る

PR を作成できる action には、以下がオススメです 🔄

https://github.com/marketplace/actions/create-pull-request

```yaml
- name: Create Pull Request
  uses: peter-evans/create-pull-request@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    commit-message: Update automated changes
    title: Automated update
```

### 3. Issue を発行する

Issue を発行する actions には、以下がオススメです 📋

https://github.com/marketplace/actions/create-an-issue

```yaml
- name: Create issue
  uses: actions-ecosystem/action-create-issue@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    title: Automated maintenance
    body: This is an automated issue to keep the repository active.
```

## 推奨される対策

最も自然で効果的な対策は以下の通りです：

1. **定期的なメンテナンス**: 依存関係の更新など 🔧
2. **自動更新**: README やドキュメントの自動更新 📝
3. **ヘルスチェック**: システムの状態確認とレポート 📊

## まとめ

GitHub Actions の schedule 停止は、リポジトリの活動状況を管理するための仕組みです 🎯 適切な対策を講じることで、継続的な自動化を実現できます。

## 参考文献

- [GitHubActionsのscheduleは60日で無効化される](https://zenn.dev/goryudyuma/articles/6a17d087dd1bb3)
- [GitHub Actions は60日間リポジトリに活動が無いと自動停止する](https://zenn.dev/hellorusk/articles/fc6d4696f5b269)