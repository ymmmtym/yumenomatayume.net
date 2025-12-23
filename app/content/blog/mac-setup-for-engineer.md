---
title: "新しい Mac でエンジニア向けに開発環境セットアップする 💻"
description: "Mac Mini M1(2020) から Mac Mini M4 に乗り換えた時に行ったセットアップ内容をまとめました。"
pubDate: "2025-11-25"
tags: ["mac", "Mackup", "homebrew", "mise"]
---

## はじめに

普段 Mac を利用して開発をしています 💻 最近 Mac Mini M1(2020) から Mac Mini M4 に乗り換えたので、その時に行ったセットアップ内容をまとめました！

- 本職は SRE ですが、分野関係なく開発環境が利用できる状態までのセットアップを行います 🛠️
- 開発関連の設定ファイルはクラウドにバックアップがある状態で行います ☁️
  - 設定ファイルをリストアして、パッケージ管理ツールを用いてセットアップします
- なるべくターミナルでの作業を中心としています 🖥️

## システム設定

まずは最低限必要な設定をしていきます 🔧

- Apple Account にログインする 🍎
- 指紋認証を設定する 👆
- Dock, Finder, マウス, トラックパッドなどの設定をする ⚙️
  - 後述する defaults コマンドで設定する場合は割愛する

## ターミナルからの設定

次にターミナルを開いてコマンドを実行していきます 💻

### ソフトウェアアップデート

アップデートがある場合はここで最新に更新します 🔄

```bash
# アップデート確認
softwareupdate -l

# アップデート実行
softwareupdate -ia

# OSなども含めてバージョンアップ
sudo softwareupdate -i -a -R
```

### 起動音を無効化する

```bash
sudo nvram StartupMute=%01
```

### defaults コマンド

システム設定でポチポチするのが面倒だったり、そもそもシステム設定ではできない項目には defaults コマンドを利用します 🛠️

私は [Cosense ページ](https://scrapbox.io/yumenomatayume/defaults) の `defaults.sh` に、Mac に設定するものを記載しています。

以下のコマンドで `defaults.sh` を実行します：

```bash
curl https://scrapbox.io/api/code/yumenomatayume/defaults/defaults.sh | bash
```

## 開発環境のセットアップ

### Homebrew

Mac のパッケージ管理には homebrew を利用しています 🍺

公式に記載の通り、以下のコマンドでインストールします。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストールしたらパスを通して有効化します。

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

以上で `brew` コマンドが利用できる状態になりました 🎉 パッケージインストールは後述する Brewfile にて実施します。

### Mackup

設定のバックアップには [Mackup](https://github.com/lra/mackup) を利用しています 📦 Mackup を利用することで `~/.zshrc` などの設定ファイルをクラウドストレージ（icloud など）に置き、現在はシンボリックリンクは使わずに、icloud に設定ファイルのコピーをバックアップしています。そのため新しい mac に設定するには icloud に保存した設定ファイルをリストアします。

homebrew からインストールします：

```bash
brew install mackup
```

Mackup のバックアップ先の設定をします。以下では icloud を設定しています ☁️

```bash
cat << EOF > ~/.mackup.cfg
[storage]
engine = icloud
EOF
```

バックアップ先を設定したら、そこからリストアします 🔄

```bash
# ドライラン
mackup restore -n
# 確認なしで実行
mackup restore -f
# 再実行（~/.mackup ディレクトリにある設定を適用する）
mackup restore -f
```

mackup には `~/.mackup/hoge.cfg` を作成することで、標準サポートされているアプリケーション以外のものをバックアップ対象に追加する機能があります 📝
初回の `mackup restore` コマンドを実行して `~/.mackup` ディレクトリをリストアし、2回目の `mackup restore` コマンドで `~/.mackup/*.cfg` に記載されたアプリケーションをリストアしています。

### Brewfile

[Brewfile](https://docs.brew.sh/Brew-Bundle-and-Brewfile) を使うと homebrew でインストールしたものを、`~/.Brewfile` で管理できます 📋
Mackup から `~/.Brewfile` をリストアしたら、以下のコマンドで一括でダウンロードします：

```bash
brew bundle --global
```

インストールするアプリによってはパスワードを求められるので、入力しながら進めていきます 🔐

### mise

mackup にて `~/.config/mise/config.toml` がリストアされているので、それに記載されたパッケージをインストールします ⚡

```bash
mise install
```

### バックアップ（cron）

以下の 2 つを cron で定期的にバックアップしています 🔄

- `~/.Brewfile` ファイル
  - 現在インストールしている homebrew パッケージ
- Mackup の実行
  - 開発ツールの設定ファイル

実際の設定は以下のようにしています：

```bash
> crontab -l
0 * * * * /opt/homebrew/bin/brew bundle dump --describe --global -f
*/10 * * * * /opt/homebrew/bin/mackup backup -f
```

## セットアップが終わったら

一通りのセットアップが終わったら、Mac で開発できる準備は整いました 🎉
あとは利用しながら使いやすい好みの設定にしていきます。

### ログイン項目

ログイン時に開くアプリやボリュームの設定をします 🚀 アプリ初回起動時に設定を促す通知が出るはずなので、便利なものを登録しておきましょう。

- Raycast
- Bitwarden
- NAS
  - NAS を利用しているので、ログイン時に自動的にマウントされるようにしています 💾

「システム設定 > 一般 > ログイン項目と拡張機能」より確認と変更ができます。

### PWA アプリ

PWA に対応しているものは、ブラウザにアクセスした後にインストールします 📱
主に使っているものは以下になります：

- Cosense
- Gemini
