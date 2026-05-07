---
title: "asdf から mise に移行する ⚡"
description: "これまでパッケージ管理ツールとして、**env → anyenv → asdf と渡り歩いてきましたが、今流行りの mise に移行しようと思います。"
pubDate: "2024-06-28"
tags: ["mise", "asdf"]
---

これまでパッケージ管理ツールとして、**env → anyenv → asdf と渡り歩いてきましたが、今流行りの mise に移行しようと思います 🚀

## mise への移行方法

公式サイトに asdf からの移行ガイドが記載されています 📖

https://mise.jdx.dev/faq.html#how-do-i-migrate-from-asdf

徐々に利用頻度が高いものを mise に移行していたのですが、移行したものも増えてきたのでこの際全てのプラグインを mise に移行しようと思います 💪

移行のステップは以下の通りです：

1. mise でインストールされていないプラグインの latest をインストールする 📦
2. `~/.config/mise/config.toml` にプラグインを記載する 📝
3. asdf にインストールされたプラグインを削除する 🗑️
4. `~/.tool-versions` から記載を削除する ✂️

以下の for 文でまとめて行いました：

```bash
for PLUGIN in $(mise ls -m | cut -f 1 -d ' '); do
  mise install $PLUGIN || break
  mise use -g $PLUGIN@latest || break

  asdf plugin remove $PLUGIN
  sed -i "/^$PLUGIN/d" ~/.tool-versions
done
```

一部のプラグインはインストール中にエラーが出る場合があるので、その時は個別に対応してください 🛠️（例えば、asdf でも latest バージョンのインストールに失敗するものです）

### mise でインストールされていないプラグインの latest をインストールする

mise で missing のプラグインの一覧をインストールするようにします 📋

asdf ではインストールするプラグインを `~/.tool-versions` に記載しますが、mise でも引き続き利用できます。（これも互換性があっていいですね 👍）

つまり、asdf にインストールされていて mise にインストールされていないものは missing になっているので、`mise ls —missing` コマンドで一覧化できます。

### `~/.config/mise/config.toml` にプラグインを記載する

mise はデフォルトで `~/.config/mise/config.toml` に記載したバージョンを優先的に参照します ⚙️

`mise use --global $PLUGIN@latest` コマンドを実行すると、`~/.config/mise/config.toml` にインストールするプラグインとバージョンが追記されます。

### asdf にインストールされたプラグインを削除する

asdf を利用していた方にはお馴染みのコマンド `asdf plugin remove $PLUGIN` でプラグインを削除します 🧹

### `~/.tool-versions` から記載を削除する

そのまま `~/.tool-versions` を利用できますが、先述した通り `~/.config/mise/config.toml` がデフォルトなので、設定ファイルも移行します 🔄

また、プラグインのバージョン管理に latest が利用できるため、開発向けには便利な管理方法になっています ✨

`mise outdated` コマンドで更新できるプラグインを確認できます：

```bash
❯ mise outdated
Tool           Requested  Current   Latest
k9s            latest     0.32.4    0.32.5
dagger         latest     0.11.6    0.11.7
rye            latest     0.23.0    https://github.com/astral-sh/rye/releases/latest
cue            latest     0.7.1     0.10.0-0.dev
awscli         latest     2.16.5    2.16.10
deno           latest     1.44.1    1.44.2
gcloud         latest     479.0.0   480.0.0
argo           latest     3.5.7     3.5.8
argo-rollouts  latest     1.6.6     1.7.0
helm-diff      latest     3.9.7     3.9.8
just           latest     1.28.0    1.29.1
oci            latest     3.43.1    3.43.2
step           latest     0.26.1    0.26.2
terragrunt     latest     0.59.3    0.59.4
velero         latest     1.13.2    1.14.0
vim            latest     9.1.0482  9.1.0496
wasmer         latest     2.3.0     4.3.2
node           latest     21.5.0    22.3.0
go             1.22.4     MISSING   1.22.4
```

anyenv や asdf を利用している方は、mise への移行を検討してみてください 🎯
