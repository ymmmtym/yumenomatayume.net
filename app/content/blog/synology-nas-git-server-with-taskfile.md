---
title: "Synology NAS の Git Server でローカル開発しているコードを Taskfile で管理する 🗄️"
description: "NAS上にGitリポジトリを構築し、Taskfileで効率的に管理する方法を紹介します。ローカル開発のコードをシンプルに管理できます。"
pubDate: "2026-01-21"
tags: ["synology","git","taskfile","nas"]
---

ある程度仕上がったコードはGitHubで管理していますが、ちょっとした検証や試作はローカルのディレクトリで行っています 💻 Macユーザーなら `~/Developer` ディレクトリを作成して作業している方も多いかもしれません。

私の場合、ローカルボリュームの容量が限られているため、NASの共有フォルダに保存して作業していました。しかし、この方法には以下の問題がありました 😓

* NAS切断時の作業再開が面倒です
  * ディレクトリの移動し直し
  * CLIで実行しているAI Agentなどの再起動
* ファイル書き込み速度が遅いです
  * パッケージインストールに時間がかかります

これらの問題から、開発作業はローカルで行うように方針を変更しました。

## Git Serverの導入を決めた理由 🤔

ローカルボリュームは容量に限りがあるため、NASをバックアップ用途として活用することを検討しました。

* ローカル作業の場所
  * `~/Developer`
    * アクティブなプロジェクトのみ配置します
* バックアップの場所
  * `/Volumes/Developer`
    * NASマウント先
    * 過去のプロジェクトやアーカイブを保存します

バックアップとリストアの手順を考えていく中で、「Gitを使えばもっとシンプルになるのでは？」と気づきました 💡

調べてみると、Synology NASは標準でGit Serverに対応していることがわかりました。Giteaなどのコンテナソリューションも検討しましたが、シンプルで軽量な標準機能を使うことにしました。

## 前提条件 📋

* `~/.ssh/config` でNASへのSSH接続を設定済みです
  ```bash
  Host nas
    Hostname nas.yumenomatayume.home # Synology NASのIPまたはドメイン
    User yumenomatayume
    IdentityFile ~/.ssh/nas.id_rsa
  ```
* miseで必要なツールをグローバルインストール済みです
  ```bash
  mise use -g task ghq peco
  ```

## 設定手順 ⚙️

### Git Serverのインストール

Synology NASのパッケージセンターからGit Serverをインストールします。

### 初期設定

初回のみ、NASにSSHしてGitのデフォルトブランチを設定します。

```bash
git config --global init.defaultBranch main
```

### ディレクトリ構成

以下のディレクトリを作成します。

* NAS側：Git Serverのリポジトリ保存先
  * 例：`/volume1/homes/yumenomatayume/git`
* ローカル側：ghqの管理ディレクトリ
  * 例：`~/.ghq/nas/volume1/homes/yumenomatayume/git`
  * ghqでSSH経由でクローンすると、このパス構造になります
  * クローンコマンド例：`git clone ssh://user@nas/path/to/repo.git`

### 設定ファイルの作成

ローカルのghqディレクトリに `README.md` と `Taskfile.yml` を作成します。Taskfileで操作を自動化し、READMEに使い方を記載します。

## Taskfileの実装 📝

`Taskfile.yml`で主要な操作を実装しました。

```yaml
version: '3'

vars:
  NAS_USER: yumenomatayume
  NAS_HOST: nas
  NAS_GIT_SERVER_PATH: /volume1/homes/yumenomatayume/git
  GHQ_NAS_ROOT: "{{.HOME}}/.ghq/{{.NAS_HOST}}{{.NAS_GIT_SERVER_PATH}}"
  CONFIG_FILES: README.md Taskfile.yml

tasks:
  init:
    desc: "Create local project directory and remote repository"
    silent: true
    prompt: "Create {{.CLI_ARGS}} repository?"
    cmds:
      - mkdir -p {{.GHQ_NAS_ROOT}}/{{.CLI_ARGS}}
      - ssh {{.NAS_USER}}@{{.NAS_HOST}} "mkdir -p {{.NAS_GIT_SERVER_PATH}}/{{.CLI_ARGS}}.git && cd {{.NAS_GIT_SERVER_PATH}}/{{.CLI_ARGS}}.git && git init --bare"

  clone:
    desc: "Clone from remote"
    cmds:
      - ghq get ssh://{{.NAS_USER}}@{{.NAS_HOST}}{{.NAS_GIT_SERVER_PATH}}/{{.PROJECT}}.git

  list:
    desc: "List local and remote repositories"
    cmds:
      - task: list:local
      - task: list:remote
```

主なタスク：
- `init`：ローカルディレクトリとNAS上のベアリポジトリを作成します
- `clone`：NASからリポジトリをクローンします
- `list`：ローカルとリモートのリポジトリ一覧を表示します

## 使い方 🚀

### リポジトリの初期化

```bash
task init -- myproject
```

### リポジトリのクローン

```bash
task clone -- myproject
```

### リポジトリ一覧の表示

```bash
task list
```

### 設定ファイルのバックアップ

```bash
task config:backup
```

## 開発が終わったら 🎉

開発が完了したら、GitHubにリポジトリを移行します。

```bash
# GitHubにリポジトリを作成
gh repo create

# リモートURLをGitHubに変更
git remote set-url origin ssh://git@github.com/ymmmtym/name-of-repository.git

# プッシュ
git push
```

## 注意点 ⚠️

親ディレクトリに `mise.toml` が存在すると、配下のリポジトリがそれを参照してしまいます。

例えば `/volume1/homes/yumenomatayume/git/mise.toml` が存在する状態で、`/volume1/homes/yumenomatayume/git/hoge` ディレクトリで `mise use task` を実行すると、親ディレクトリの `mise.toml` に設定が書き込まれてしまいます。

このため、Git Serverのルートディレクトリには `mise.toml` を配置しないようにしましょう。

## まとめ ✨

Synology NASのGit Serverを活用することで、ローカル開発のコードを効率的に管理できるようになりました。

Taskfileによる自動化により、リポジトリの作成・クローン・一覧表示などの操作が簡単になり、開発体験が大きく向上しました 🎯 GitHubに公開するまでもない試作コードやプライベートなプロジェクトの管理に最適です。
