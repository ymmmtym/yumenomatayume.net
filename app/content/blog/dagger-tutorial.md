---
title: "Dagger のチュートリアルを試してみた 🚀"
description: "CI/CD パイプラインツールである Dagger を試してみました。ローカル環境で処理を行えるかつ、コードを変更せずにさまざまな CI 環境へ簡単に対応できるところは非常に魅力的です。"
pubDate: "2022-10-03"
tags: ["dagger", "cicd", "docker"]
---

最近話題のCI/CDパイプラインツール「Dagger」を試してみました！ローカル環境で処理ができて、コードを変更せずに色々なCI環境に対応できるって聞いて、これは面白そうだと思ったんです 😊

## インストールしてみよう

まずはCLIをインストールします。いつものように `asdf` を使いました：

```bash
❯ asdf plugin-add dagger
❯ asdf install dagger latest
Downloading dagger from https://github.com/dagger/dagger/releases/download/v0.2.34/dagger_v0.2.34_darwin_arm64.tar.gz
❯ asdf global dagger latest
❯ dagger version
dagger 0.2.35 (00cde7521) darwin/arm64
```

無事にインストール完了！バージョンも確認できました ✅

## チュートリアルをやってみる

とりあえず公式のチュートリアルを実施して、Daggerの使用感を掴んでみたいと思います。

### ローカルでビルド・実行・テスト

まずはローカル環境で実行してみましょう：

```bash
❯ git clone https://github.com/dagger/todoapp

❯ cd todoapp

❯ dagger project update
1:45PM INFO  system | installing all packages...
1:45PM INFO  system | installed/updated package universe.dagger.io@0.2.34
1:45PM INFO  system | installed/updated package dagger.io@0.2.34

❯ dagger do build
[✔] actions.build.install.container.script                                                                                                                                                                                                                                  0.5s
[✔] actions.build.container                                                                                                                                                                                                                                               360.2s
[✔] actions.source                                                                                                                                                                                                                                                          5.7s
[✔] actions.build.install.container                                                                                                                                                                                                                                       130.8s
[✔] actions.build.container.script                                                                                                                                                                                                                                          0.5s
[✔] actions.build.install.container.export                                                                                                                                                                                                                                  1.5s
[✔] actions.build.container.export                                                                                                                                                                                                                                          1.8s
[✔] client.filesystem."./build".write                                                                                                                                                                                                                                       1.3s
Field  Value
logs   ""
  yarn run v1.22.17
  $ react-scripts build
  Creating an optimized production build...
  Compiled with warnings.

  ./src/App.js
    Line 110:7:  The element ul has an implicit role of list. Defining this explicitly is redundant and should be avoided  jsx-a11y/no-redundant-roles

  Search for the keywords to learn more about each warning.
  To ignore, add // eslint-disable-next-line to the line before.

  File sizes after gzip:

    40.12 KB  build/static/js/2.a228fa91.chunk.js
    1.55 KB   build/static/js/main.af3de9df.chunk.js
    1.46 KB   build/static/css/main.9149988f.chunk.css
    782 B     build/static/js/runtime-main.89495321.js

  The project was built assuming it is hosted at ./
  You can control this with the homepage field in your package.json.

  The build folder is ready to be deployed.

  Find out more about deployment here:

    bit.ly/CRA-deploy

  Done in 214.92s.

"
```

静的ファイルを build しました。
`open build/index.html` で HTML ファイルを開くと、ブラウザで ToDo App が表示されます。

![Dagger で作成した ToDo アプリケーション](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/dagger-todo-app?_a=BAMAMiFE0)

静的ファイルの build には `dagger do build` コマンドを用いますが、テスト実行は `dagger do test` 、（netlify への）デプロイには `dagger do deploy` コマンドが用意されています。
この `dagger do` コマンドの引数は Dagger Actions と呼ばれるもので、ユーザーが独自で定義できるアクションとなっております。`dagger.cue` ファイルに設定を記述します。
また、`dagger do —help` コマンドから実行可能な引数を確認できます。

```yaml
❯ dagger do --help
Usage:
  dagger do <action> [subaction...] [flags]

Options


Available Actions:
 source Load the todoapp source code
 build  Build todoapp
 test   Test todoapp
 deploy Deploy todoapp


Flags:
      --cache-from stringArray   External cache sources (eg. user/app:cache, type=local,src=path/to/dir)
      --cache-to stringArray     Cache export destinations (eg. user/app:cache, type=local,dest=path/to/dir)
      --dry-run                  Dry run mode
  -h, --help                     help for do
      --no-cache                 Disable caching
      --output string            File path to write the action's output values. Prints to stdout if empty
      --output-format string     Format for output values (plain, json, yaml) (default "auto")
  -p, --plan string              Path to plan (defaults to current directory) (default ".")
      --platform string          Set target build platform (requires experimental)
      --telemetry-log            Send telemetry logs to file (requires experimental)
  -w, --with stringArray


Global Flags:
      --experimental        Enable experimental features
      --log-format string   Log format (auto, plain, tty, json) (default "auto")
  -l, --log-level string    Log level (default "info")
```

### Integrate with your CI environment

Dagger は主要な CI/CD サービスに対応しています。公式サイトに各 CI/CD サービスのサンプルが記載されています。
ローカル環境で実行したコマンドをそのまま CI に入れたり、プロダクション用に CD を実行したりと、Dagger の設定ファイルのみに柔軟にカスタマイズできるのが魅力です。

#### GitHub Actions
```yaml
name: todoapp

on:
  push:
    # Trigger this workflow only on commits pushed to the main branch
    branches:
      - main

# Dagger plan gets configured via client environment variables
env:
  # This needs to be unique across all of netlify.app
  APP_NAME: todoapp-dagger-europa
  NETLIFY_TEAM: dagger

jobs:
  dagger:
    runs-on: ubuntu-latest
    steps:
      - name: Clone repository
        uses: actions/checkout@v2

      # You need to run `dagger project init` locally before and commit the cue.mod directory to the repository with its contents
      - name: Deploy to Netlify
        uses: dagger/dagger-for-github@v3
        # See all options at https://github.com/dagger/dagger-for-github
        with:
          version: 0.2
          # To pin external dependencies, you can use `project update github.com/[package-source]@v[n]`
          cmds: |
            project update
            do deploy
        env:
          # Get one from https://app.netlify.com/user/applications/personal
          NETLIFY_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
```

#### GitLab
```yaml
.docker:
  image: docker:${DOCKER_VERSION}-git
  services:
    - docker:${DOCKER_VERSION}-dind
  variables:
    # See https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#docker-in-docker-with-tls-enabled-in-the-docker-executor
    DOCKER_HOST: tcp://docker:2376

    DOCKER_TLS_VERIFY: "1"
    DOCKER_TLS_CERTDIR: "/certs"
    DOCKER_CERT_PATH: "/certs/client"

    # Faster than the default, apparently
    DOCKER_DRIVER: overlay2

    DOCKER_VERSION: "20.10"

.dagger:
  extends: [.docker]
  variables:
    DAGGER_VERSION: 0.2.25
    DAGGER_LOG_FORMAT: plain
    DAGGER_CACHE_PATH: .dagger-cache

    ARGS: ""
  cache:
    key: dagger-${CI_JOB_NAME}
    paths:
      - ${DAGGER_CACHE_PATH}
  before_script:
    - |
      # install dagger
      cd /usr/local
      wget -O - https://dl.dagger.io/dagger/install.sh | sh
      cd -

      dagger version
  script:
    - dagger project update
    - |
      dagger \
          do \
              --cache-from type=local,src=${DAGGER_CACHE_PATH} \
              --cache-to type=local,mode=max,dest=${DAGGER_CACHE_PATH} \
              ${ARGS}

build:
  extends: [.dagger]
  variables:
    ARGS: build
```
実際に CI/CD サービスと連携したチュートリアルは実施しませんが、ローカル環境で試したパイプラインを CI/CD サービスに適用することが容易であることはお分かりいただけたと思います。

## 終わりに

これまでは、ローカル環境でもテストを実行したい場合は `Makefile` で処理をまとめていたのですが、Dagger を導入すれば解決できそうです。
Dagger の動作や設定などについては、自身の Scrapbox にメモしていきます。

新しく CI/CD を作成する際は、試しに Dagger で作ってみようかなと思いました。
何か作ったら記事を書こうとおもいます。
