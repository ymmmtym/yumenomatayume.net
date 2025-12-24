---
title: "kubectl wait コマンドを使ってみる ⏳"
description: "Kubernetes リソースが特定の状態になるまで待機する kubectl wait コマンドの使い方"
pubDate: "2021-08-17"
tags: ["kubernetes"]
---

`kubectl wait` コマンドを使用すると、1つ以上のリソースが特定の状態になるまで待つことができます ⏳ 実験的なコマンドですが、リソース間の依存関係を解決する際に便利です。

https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#wait

> Experimental: Wait for a specific condition on one or many resources.

## 基本的な使い方

### コマンド例

例えば、以下の条件で待機したい場合：

- **すべての namespace** の 🌐
- **deployment が available** になるまで ✅
- **300秒待つ**（`timeout` オプションはデフォルトで30秒）⏰

以下のコマンドを実行します：

```bash
kubectl wait -A --for=condition=available deployment --all --timeout=300s
```

## 実際の使用例

[manifests/jupyter-notebook](https://github.com/ymmmtym/manifests/tree/main/jupyter-notebook) を使って実際に試してみます 📝

`deployment/jupyter-notebook` が available になるまで300秒待つコマンド：

```bash
kubectl wait --for=condition=available deployment/jupyter-notebook --timeout=300s
```

### 実行手順

1. **wait コマンドを実行**
   ```bash
   kubectl wait --for=condition=available deployment/jupyter-notebook --timeout=300s
   ```
   この時点でプロンプトが返ってこなくなります ⏸️

2. **別のターミナルで manifest を apply**
   ```bash
   kubectl apply -f jupyter-notebook/
   ```

3. **デプロイメントの状態を確認**
   ```bash
   $ kubectl get deploy
   NAME               READY   UP-TO-DATE   AVAILABLE   AGE
   jupyter-notebook   1/1     1            1           63s
   ```

4. **wait コマンドの結果を確認**
   ```bash
   $ kubectl wait --for=condition=available deployment/jupyter-notebook --timeout=300s
   deployment.apps/jupyter-notebook condition met
   $
   ```

`deployment.apps/jupyter-notebook condition met` が出力され、プロンプトが返ってきます ✨

## 活用場面

このコマンドは以下のような場面で役立ちます：

- **CI/CD パイプライン**でのデプロイメント完了待ち 🚀
- **リソース間の依存関係**の解決
- **スクリプト内**での同期処理

## 注意点

現時点では、**後から発生するリソース**（特定の Job 完了後に Deployment が作成される等）には対応できないため、注意が必要です ⚠️

既に存在するリソースの状態変化を待つ用途に限定されます。

## その他の condition 例

```bash
# Pod が Ready になるまで待つ
kubectl wait --for=condition=ready pod/my-pod

# Job が Complete になるまで待つ
kubectl wait --for=condition=complete job/my-job

# Pod が削除されるまで待つ
kubectl wait --for=delete pod/my-pod
```

## まとめ

`kubectl wait` コマンドを使うことで、Kubernetes リソースの状態変化を効率的に待機できます 💡 スクリプトや自動化において、リソース間の依存関係を適切に管理するための重要なツールです。