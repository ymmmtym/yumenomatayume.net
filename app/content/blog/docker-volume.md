---
title: "Docker for Mac でファイルをマウントできない時の解決法 🐳"
description: "Docker for Mac でボリュームマウントが失敗する場合の FILE SHARING 設定による解決方法"
pubDate: "2021-08-10"
tags: ["docker","mac"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/docker-volume-example?_a=BAMAMiFE0"
---

Docker for Mac でファイルをマウントできなくなった時の解決法をご紹介します 🐳

## 前提条件

使用しているバージョン：

```bash
$ sw_vers
ProductName: Mac OS X
ProductVersion: 10.15.7
BuildVersion: 19H1217

$ docker --version
Docker version 20.10.6, build 370c289

$ docker-compose --version
docker-compose version 1.26.0, build d4451659
```

## Docker Volume の使用方法

Docker Volume の使用方法については、以下のドキュメントにまとまっています 📚

https://matsuand.github.io/docs.docker.jp.onthefly/storage/volumes/

ヘルプコマンドで確認できるオプション：

```bash
$ docker run --help

# snip...

    --mount mount                    Attach a filesystem mount to the container

-v, --volume list                    Bind mount a volume
      --volume-driver string           Optional volume driver for the container
      --volumes-from list              Mount volumes from the specified container(s)
```

## マウントに失敗する例

Mac 側の `/var/tmp` ディレクトリを、Docker 側の `/pwd` にマウントしてみます：

```bash
$ pwd
/var/tmp
$ ls -l
total 0
drwxr-xr-x  2 root      wheel   64  6 10 23:12 KindlePreviewerUpdater/
drwxr-xr-x  4 root      wheel  128  5 28 09:33 com.paceap.eden.licensed/
srw-r--r--  1 root  wheel    0  5 28 09:33 filesystemui.socket=

$ docker container run --rm -it -v $PWD:/pwd:rw alpine
/ # ls /pwd/
/ #
```

Docker 側の `/pwd` ディレクトリにファイルがなく、マウントができていません 😵

## 解決法

Docker for Mac の設定を開き、「**Preferences > Resources > FILE SHARING**」から `/var/tmp` を追加します 🔧

![Docker FILE SHARING 設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/docker-volume-example?_a=BAMAMiFE0)

### 設定手順

1. Docker Desktop のメニューから「Preferences」を選択
2. 「Resources」タブをクリック
3. 「FILE SHARING」を選択
4. 「+」ボタンをクリックしてマウントしたいディレクトリを追加
5. 「Apply & Restart」をクリック

## 重要なポイント

Docker for Mac では、**FILE SHARING で設定したディレクトリのみ**マウントすることができます ⚠️

デフォルトでは以下のディレクトリが設定されています：
- `/Users`
- `/Volume`
- `/private`
- `/tmp`

これ以外のディレクトリをマウントしたい場合は、明示的に FILE SHARING に追加する必要があります。

## 確認方法

設定後、再度マウントを試してみます：

```bash
$ docker container run --rm -it -v $PWD:/pwd:rw alpine
/ # ls /pwd/
KindlePreviewerUpdater/  com.paceap.eden.licensed/  filesystemui.socket
```

正常にマウントされていることが確認できます ✅

## まとめ

Docker for Mac でボリュームマウントが失敗する場合は、FILE SHARING の設定を確認してください 💡 セキュリティの観点から、必要なディレクトリのみを追加することをおすすめします。