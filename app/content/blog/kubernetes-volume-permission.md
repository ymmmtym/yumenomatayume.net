---
title: "Kubernetes の permission はどのように記載するのか ⚙️"
description: "Kubernetes でボリュームマウント時の permission 指定方法について"
pubDate: "2022-08-14"
tags: ["kubernetes","volume","permission"]
---

Kubernetes 環境において、Pod にボリュームをマウントする際の permission 指定について調べてみました 🔧 一般的な permission は8進数で記述しますが、Kubernetes では10進数でも記述できるため、どちらが正しいのか気になって調査しました。

## 結論

**（基本的には）8進数にして、頭に0をつけた4桁表記にします** ✅

もう少し詳しく説明すると、マニフェストのファイル形式によって異なります。

### YAML の場合（一般的）
- 8進数表記で先頭に0をつけます
- 例：`0644` 📝

### JSON の場合
- 10進数表記を使用します
- 例：`420`（8進数の0644と同じ）

## 実際の使用例

### YAML マニフェストでの記述例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: test-container
    image: nginx
    volumeMounts:
    - name: test-volume
      mountPath: /data
  volumes:
  - name: test-volume
    configMap:
      name: test-config
      defaultMode: 0644  # 8進数表記
```

### JSON マニフェストでの記述例

```json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "spec": {
    "volumes": [
      {
        "name": "test-volume",
        "configMap": {
          "name": "test-config",
          "defaultMode": 420
        }
      }
    ]
  }
}
```

## 注意点

- YAML では文字列として扱われるため、先頭の0が重要です
- JSON では数値として扱われるため、10進数で記述します
- 混同を避けるため、YAML を使用する場合は8進数表記を推奨します 💡

Kubernetes のドキュメントでも YAML での8進数表記が標準的な書き方として紹介されているため、この方法を使用することをおすすめします 🚀
- json の場合
  - 10 進数表記
  - 例）`420`

なおマニフェストが yaml 形式の場合でも、`kubectl apply` などのコマンド出力では 10 進数で表示されることがあります。

以下は[公式ドキュメント](https://kubernetes.io/ja/docs/concepts/configuration/secret/)からの抜粋ですが、10 進数表記が現れる原因は json ファイルの制約のようです。

> この例では、ファイル/etc/foo/my-group/my-usernameのパーミッションは0777になります。 JSONを使う場合は、JSONの制約により10進表記の511と記述する必要があります。
後で参照する場合、このパーミッションの値は10進表記で表示されることがあることに注意してください。
