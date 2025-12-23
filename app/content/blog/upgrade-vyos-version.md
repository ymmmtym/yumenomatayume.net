---
title: "VyOS のバージョンをアップグレードする手順 🔄"
description: "VyOS rolling release のアップグレード手順と注意点について"
pubDate: "2021-07-24"
tags: ["vyos","network"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/vyos-upgrade-procedure?_a=BAMAMiFE0"
---

自宅の開発環境で VyOS を使っています 🏠 VyOS のアップグレード手順をご紹介します。

## VyOS について

VyOS は version 1.3 以降から rolling release で提供されており、最新版が日々アップデートされています 🔄 以下のサイトから最新版をダウンロードできます：

[rolling/current/amd64 • downloads.vyos.io](https://downloads.vyos.io/?dir=rolling/current/amd64)

## アップグレード手順

アップグレードは簡単な手順で実施できます ✨ VyOS にログインして以下を実行します。

### TL;DR（要約）

```bash
add system image https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso

<Enter><Enter><Enter><Enter>

reboot

<y>

delete system image ? # 古いイメージを選択して削除する

<Yes>
```

### 詳細手順

#### 1. 最新 ISO のダウンロードと適用

```bash
vyos@vyos02:~$ add system image https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
Trying to fetch ISO file from https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso...
The file is 453.000 MiB.
Downloading...
[##############################################################################################################################] 100%
Download complete.
Done.
Checking for digital signature file...
Failed to download https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso.asc.
urllib.error.HTTPError: HTTP Error 404: Not Found # *1
Do you want to continue without signature check? (yes/no) [yes] # Enter を入力
Checking SHA256 checksums of files on the ISO image... OK.
Done!
What would you like to name this image? [1.4-rolling-202107212017]:  # Enter を入力
OK.  This image will be named: 1.4-rolling-202107212017
Installing "1.4-rolling-202107212017" image.
Copying new release files...
Would you like to save the current configuration 
directory and config file? (Yes/No) [Yes]:  # Enter を入力
Copying current configuration...
Would you like to save the SSH host keys from your 
current configuration? (Yes/No) [Yes]:  # Enter を入力
Copying SSH keys...
Running post-install script...
Setting up grub configuration...
Done.
```

**注意**: 証明書ファイルがないため 404 エラーになりますが、ISO はダウンロード完了しているので無視して問題ありません ⚠️

#### 2. システムの再起動

ダウンロードが終わったら reboot します：

```bash
vyos@vyos02:~$ reboot
Are you sure you want to reboot this system? [y/N] y

Connection to 192.168.100.3 closed by remote host.
Connection to 192.168.100.3 closed.
```

#### 3. 旧バージョンの削除

起動したら再びログインします 🔐 この時点でバージョンは上がっているので、不要になった旧バージョンのイメージを削除します：

```bash
vyos@vyos02:~$ delete system image 
Possible completions:
  <Enter>       Execute the current command
  1.4-rolling-202107202017
                Name of image image to delete
  1.4-rolling-202107212017

vyos@vyos02:~$ delete system image 1.4-rolling-202107202017
Are you sure you want to delete the
"1.4-rolling-202107202017" image? (Yes/No) [No]: Yes # Yes を入力
Deleting the "1.4-rolling-202107202017" image...
Done
```

以上で完了です 🎉 ものすごく簡単でした！

## 自動化について

Ansible の `vyos_command` モジュールを使って自動化を試みましたが、prompt と answer がうまく動作しませんでした 😅

以下の reboot を実行する playbook すら動作しませんでした：

```yaml
- name: run command that requires answering a prompt
  vyos_command:
    commands:
    - command: reboot
      prompt: Are you sure you want to reboot this system? [y/N]
      answer: y
```

## 注意点

- **バックアップ**: アップグレード前に設定のバックアップを取ることをおすすめします 💾
- **テスト環境**: 本番環境での実施前にテスト環境で動作確認を行ってください 🧪
- **ダウンタイム**: 再起動が必要なため、適切なメンテナンス時間を確保してください ⏰

## まとめ

VyOS のアップグレードは非常にシンプルな手順で実行できます 💡 rolling release の恩恵で、常に最新の機能とセキュリティ修正を利用できるのが魅力です。

## 参考文献

- [技術メモメモ: VyOSバージョンアップ手順](https://tech-mmmm.blogspot.com/2021/01/vyos.html)
