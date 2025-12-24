---
title: "n8n を synology で動かすと permission error が発生する時の対処法 🔧"
description: "synology の「Container Manager」で n8n を利用したところ、permission error が発生してコンテナが起動しませんでした。"
pubDate: "2024-06-12"
tags: ["synology", "n8n"]
---

## 内容

Synology の「Container Manager」で n8n を利用したところ、permission error が発生してコンテナが起動しませんでした 😅

```log
Code: EACCES
Error: EACCES: permission denied, open '/home/node/.n8n/crash.journal'
```

## 手順

公式ドキュメントの hosting n8n にある Docker の手順を元に実施しました 📖

https://docs.n8n.io/hosting/installation/docker/

ドキュメントには以下の手順が記載されています：

```bash
docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Synology での作成方法は以下の通りです 🛠️（画像に表示されていない箇所は全てデフォルトのまま）

ドキュメントとの差分は、データ・ボリューム（`n8n_data`）にホスト上のディレクトリ（`/docker/n8n`）をマウントしていることです。

![Synology Container Manager での n8n ボリューム設定](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-container-manager-n8n-volume-settings?_a=BAMAMiFE0)

## 解消法

`docker/n8n` フォルダのプロパティから、Everyone に書き込み権限を許可しました 🔐

![Synology フォルダーのアクセス権限設定](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-folder-permissions?_a=BAMAMiFE0)

Synology に ssh で入ると、パーミッションが `drwxr-xr-x+` -> `drwxrwxrwx+` に変更されていました：

```bash
$ ls -ld /volume1/docker/n8n/
drwxrwxrwx+ 1 yumenomatayume users 130 Dec 24 19:23 /volume1/docker/n8n/
```

これで n8n が正常に起動するようになりました 🎉

## 参考

- [N8n continuous restart in docker w/1.05](https://community.n8n.io/t/n8n-continuous-restart-in-docker-w-1-05/28510/3) 📚
- [docker install error: EACCES: permission denied, open '/home/node/.n8n/config' · Issue #1240 · n8n-io/n8n](https://github.com/n8n-io/n8n/issues/1240) 🔗