---
title: "Vagrant で使用されている vmdk ファイルを圧縮する方法 📦"
description: "VirtualBox + Vagrant 環境で肥大化した vmdk ファイルを圧縮してディスク容量を節約する方法"
pubDate: "2021-08-10"
tags: ["vagrant","virtualbox"]
---

VirtualBox で起動される VM のディスクは `.vmdk` ファイル形式で作成されます 💾 Vagrant を使っていると、この vmdk ファイルのサイズが大きくなってしまうことがあります。今回は、それを圧縮する方法をご紹介します。

## 前提条件

以下の組み合わせで使用している場合の手順です：

- **VirtualBox** 📦
- **Vagrant** 🔧

## 圧縮手順

Guest OS（VM）と Host OS（Mac や Windows）の両方で作業を行います。

### 1. Guest OS での作業

まず、VM 内でストレージの空き容量を0埋めします：

```bash
dd if=/dev/zero of=zero bs=4k
rm -fr zero
```

この操作により、削除されたファイルの領域が0で埋められ、後の圧縮処理で効果的にサイズを削減できます ✨

### 2. Host OS での作業

#### VM を停止

```bash
vagrant halt
```

#### ファイル形式の変換と圧縮

Guest OS があるディレクトリに移動し、`.vmdk` を `.vdi` に変換します：

```bash
cd ~/VirtualBox\ VMs/${box}
VBoxManage clonehd box-disk1.vmdk box-disk1.vdi --format vdi
```

`.vdi` ファイルを圧縮します：

```bash
VBoxManage modifyhd box-disk1.vdi compact
```

圧縮が完了したら、`.vdi` を `.vmdk` に戻します：

```bash
VBoxManage clonehd box-disk1.vdi box-disk1.vmdk --format vmdk
```

#### 不要ファイルの削除

元の vmdk ファイルと中間ファイルを削除します：

```bash
rm box-disk1.vdi
# 必要に応じて元のvmdkファイルもバックアップ後に削除
```

## 圧縮効果

この方法により、ファイルサイズが大幅に削減される場合があります 📉 場合によっては10分の1程度まで圧縮されることもあります。

## 注意点

- 作業前に重要なデータのバックアップを取ることをおすすめします 🛡️
- 圧縮処理には時間がかかる場合があります
- ディスク容量に余裕がある状態で作業を行ってください

## まとめ

Vagrant 環境で vmdk ファイルが肥大化した場合は、この方法で効果的に圧縮できます 🚀 定期的にメンテナンスを行うことで、ディスク容量を効率的に管理できます。

## 参考文献

- [Vagrantのvmdkファイルが肥大化してたので圧縮したら容量が10分の1になった！ - Qiita](https://qiita.com/RyujiAMANO/items/a904399b7c45d1f0b658)
- [Bureimono stdio.h: Vagrant とストレージ容量](http://satorumpen.blogspot.com/2014/03/vagrant.html)