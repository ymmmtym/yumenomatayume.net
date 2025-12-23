---
title: "Synology NAS で MEGAcmd を利用して MEGA ドライブと同期する 🔄"
description: "MEGA は無料で 50GB も使える太っ腹クラウドドライブです。MEGA から提供されている CLI ツールを使って、Synology NAS と MEGA を同期します。"
pubDate: "2022-09-27"
tags: ["synology", "nas", "mega"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-nas-mega-cmd?_a=BAMAMiFE0"
---

最近自宅にSynology NASを購入しました！📦

多くのクラウドストレージと簡単に同期できる「Cloud Sync」というアプリケーションを使っているんですが、このアプリはMEGAドライブには対応していません 😅

MEGAは無料で50GBも使える太っ腹なクラウドストレージなので、なんとか同期したい！そこで、MEGAcmdというCLIツールを使ってMEGAドライブと同期させてみることにしました 💪

DSMのパッケージセンターから、MEGAcmdをインストールします：

![Synology NAS での MEGAcmd 設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-nas-mega-cmd?_a=BAMAMiFE0)

インストールが完了したら、NASにSSHして以下を実行します：

```bash
mega-login ${email} ${password}
mega-sync ${path_to_local_dir} ${path_to_mega_dir}
```

| パラメータ | 内容 |
|---|---|
| `email` | MEGA のメールアドレス |
| `password` | MEGA のパスワード |
| `path_to_local_dir` | MEGA を同期する NAS のディレクトリ |
| `path_to_mega_dir` | 同期する MEGA のディレクトリ |

`path_to_local_dir` には、NAS の任意の共有フォルダ内をのディレクトリを設定します。
これで File Station から同期された MEGA が確認できます。

## 不便なところ
- sync 状態が GUI で確認できない
- 同期元を MEGA のルートディレクトリに設定すると、ルートディレクトリにあるファイルが同期されない