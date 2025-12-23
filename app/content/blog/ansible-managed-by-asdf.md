---
title: "asdf で ansible をインストールしてみた 📦"
description: "adsf というパッケージマネージャーを使って ansible をインストールします。以前は Homebrew 経由で ansible をインストールしていたのですが、asdf に移行するとバージョン管理などができて便利です。"
pubDate: "2022-11-26"
tags: ["ansible", "asdf"]
---

Mac OSを使っていて、開発に使うパッケージは（ほぼ全て）パッケージマネージャーで管理しています 💻

パッケージマネージャーは3つ使っていて、以下の優先度で管理してます：

1. **asdf** - 最優先
2. **aqua** - asdfに対応していない場合
3. **Homebrew** - 最後の手段

（対応していないパッケージがあるので、asdfに対応していなければaquaで管理する...みたいな感じです）

## ansible を asdf 経由でインストール

以前まではHomebrewで管理していたansibleですが、asdfに対応していることを知ったのでそちらに乗り換えました！

asdfでは、`ansible-base` という名前で管理されています。

```bash
asdf plugin-add ansible-base
asdf install ansible-base latest
asdf global ansible-base latest
```

インストールされたバージョンは `2.10.17` でした。

```bash
❯ ansible --version
ansible 2.10.17
  config file = None
  configured module search path = ['/Users/yumenomatayume/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /Users/yumenomatayume/.asdf/installs/ansible-base/2.10.17/venv/lib/python3.10/site-packages/ansible
  executable location = /Users/yumenomatayume/.asdf/installs/ansible-base/2.10.17/bin/ansible
  python version = 3.10.1 (main, Jan 12 2022, 21:01:44) [Clang 13.0.0 (clang-1300.0.29.30)]
```

利用可能なコマンドを調べたところ、頻繁に使いそうなものは網羅されているようです。（ansible-playbook、ansible-vault、ansible-doc）

```bash
❯ ansible # tab 入力
ansible  (Define and run a single task 'playbook' against a set of hosts)  ansible-doc                                                       (Plugin documentation tool)  ansible-pull  (Pulls playbooks from a VCS repo and executes them for the local host)
ansible-config                               (View ansible configuration)  ansible-galaxy                       (Perform various Role and Collection related operations)  ansible-test                                                               (command)
ansible-connection                                              (command)  ansible-inventory                                                                      (None)  ansible-vault                 (Encryption/decryption utility for Ansible data files)
ansible-console                (REPL console for executing Ansible tasks)  ansible-playbook  (Runs Ansible playbooks, executing the defined tasks on the targeted hosts)
```

ちなみに、asdf では ansible-lint が管理されていないようです。（Homebrew では管理されていて、個人的にコミット前などによく使っていました。）

```bash
❯ brew search ansible
==> Formulae
ansible                                      ansible-cmdb                                 ansible-language-server                      ansible-lint                                 ansible@2.8                                  ansible@2.9

==> Casks
ansible-dk
```

ただ、ansible-lint は GitHub Actions などでも公開されていますし、ansible role のテストには Molecule という強力なツールがあるので、Mac にインストールしなくてもいいかと思います。

```
