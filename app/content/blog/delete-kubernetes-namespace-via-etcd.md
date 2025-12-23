---
title: "Kubernetes で namespace が消えない時の対処法 🗑️"
description: "Terminating 状態で削除されない namespace を etcd から直接削除する方法"
pubDate: "2021-08-17"
tags: ["kubernetes","etcd"]
---

[Rook](https://rook.io/docs/rook/v1.6/ceph-quickstart.html) を構築した際に、`rook-ceph` という namespace が消えなくなってしまいました 😵

```bash
$ kubectl get ns rook-ceph
NAME           STATUS        AGE
rook-ceph      Terminating   2d
```

このような Terminating 状態で削除されない namespace の対処法をご紹介します。

## 問題の原因

namespace が削除されない主な原因は以下の通りです：

- **関連リソースの残存**: namespace 内にリソースが残っている 📦
- **APIService の残存**: Webhook が到達できない状態 🔌
- **Finalizer の問題**: 削除処理が完了していない ⏳

## 解決方法

etcd のコンテナに入って直接削除しました 🔧
中身を確認すると、関連するリソースが残っていました 📋 これが原因で namespace が削除されなかったようです。

### 1. etcd コンテナへのアクセス

```bash
$ kubectl exec -n kube-system -it etcd-tb1 -- sh
```

### 2. 関連リソースの確認

```bash
# export ETCDCTL_API=3
# etcdctl get / --prefix --keys-only | grep rook
/registry/apiextensions.k8s.io/customresourcedefinitions/cephclusters.ceph.rook.io
/registry/apiregistration.k8s.io/apiservices/v1.ceph.rook.io
/registry/ceph.rook.io/cephclusters/rook-ceph/rook-ceph
/registry/csidrivers/rook-ceph.cephfs.csi.ceph.com
/registry/csidrivers/rook-ceph.rbd.csi.ceph.com
/registry/namespaces/rook-ceph
/registry/storageclasses/rook-cephfs
```

### 3. 関連リソースの一括削除

```bash
# xargs を試したが使用できなかった
# etcdctl get / --prefix --keys-only | grep rook | xargs etcdctl del {}
Error: del command needs one argument as key and an optional argument as range_end

# for ループで一括削除
# for registry in $(etcdctl get / --prefix --keys-only | grep rook); do etcdctl del $registry; done
1
0
1
1
1
1
1

# 削除確認
# etcdctl get / --prefix --keys-only | grep rook
#
```

`xargs` コマンドは使用できなかったので、for ループで一括削除しました ✅

### 4. 削除確認

```bash
$ kubectl get ns rook-ceph
Error from server (NotFound): namespaces "rook-ceph" not found
```

無事に namespace も消えていました 🎉

## 別の解決方法

### APIService の削除

[cert-manager の公式ドキュメント](https://cert-manager.io/docs/installation/helm/)にも似たような記述がありました。

> cert-manager インストールを削除せずにネームスペースを削除するようにマークした場合、ネームスペースが終了状態で立ち往生することがあります。これは通常、APIService リソースはまだ存在するが、Webhook が実行されていないため、到達できなくなることが原因です。

この場合は以下のコマンドで解決できます：

```bash
kubectl delete apiservice v1beta1.webhook.cert-manager.io
```

### Finalizer の削除

namespace の finalizer を直接編集する方法もあります：

```bash
kubectl patch namespace rook-ceph -p '{"metadata":{"finalizers":null}}'
```

## 予防策

- **適切な削除順序**: リソースを正しい順序で削除する 📝
- **削除前の確認**: 関連リソースを事前に確認する 🔍
- **ドキュメント参照**: 各プロダクトの削除手順を確認する 📚

## 注意点

- **etcd への直接アクセス**: 慎重に行う必要があります ⚠️
- **バックアップ**: 作業前にクラスターのバックアップを推奨 💾
- **テスト環境**: 本番環境での実施前にテスト環境で確認 🧪

## まとめ

namespace のみを削除した場合、`APIService` が残っていることが原因で Terminating 状態のまま namespace が消えないことがあります 💡 作成されるリソースを把握しておくことが重要です。

## 参考文献

- [Can't delete “rook” namespace · Issue #1595 · rook/rook](https://github.com/rook/rook/issues/1595)